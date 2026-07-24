const express = require('express')

const router = express.Router()

const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_MESSAGES = 20
const MAX_TOOL_ROUNDS = 4
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

function getToday() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/*
  Model AI kecil/gratis terbukti sering salah kalau disuruh menjumlah/mengurangi/
  membandingkan angka sendiri di kepalanya. Daripada percaya hasil hitungannya,
  dia WAJIB memanggil tool ini - hitungannya selalu dikerjakan JavaScript biasa
  di bawah (dijamin benar), bukan ditebak oleh model.
*/
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'hitung',
        description:
          'Melakukan operasi matematika yang pasti benar pada beberapa angka. WAJIB dipanggil setiap kali perlu menjumlah, mengurangi, mengalikan, membagi, atau membandingkan dua angka atau lebih (misal cek apakah kas cukup untuk menutup beberapa kewajiban sekaligus). Jangan pernah menghitung sendiri di kepala.',
        parameters: {
          type: 'OBJECT',
          properties: {
            operasi: {
              type: 'STRING',
              enum: ['tambah', 'kurang', 'kali', 'bagi', 'bandingkan'],
              description:
                'tambah/kali menjumlah semua angka; kurang/bagi memproses angka pertama dikurangi/dibagi angka berikutnya berurutan; bandingkan menilai angka pertama vs angka kedua.',
            },
            angka: {
              type: 'ARRAY',
              items: { type: 'NUMBER' },
              description: 'Daftar angka yang dioperasikan, berurutan.',
            },
          },
          required: ['operasi', 'angka'],
        },
      },
    ],
  },
]

/*
  Model kecil terbukti empiris: walau tool "hitung" mengembalikan angka yang
  BENAR (mis. -1320965), model kadang salah tulis ulang angkanya sendiri saat
  menyusun kalimat jawaban (mis. jadi "13.209.650" - nambah nol). Daripada
  berharap model menyalin digit dengan benar, backend yang sudah memformat
  ke Rupiah - model tinggal SALIN field "hasil_rupiah" apa adanya.
*/
function formatRupiahForTool(value) {
  const num = Math.round(Number(value) || 0)
  return `${num < 0 ? '-' : ''}Rp ${Math.abs(num).toLocaleString('id-ID')}`
}

function executeTool(name, args) {
  if (name !== 'hitung') {
    return { error: `Tool "${name}" tidak dikenal.` }
  }

  const operasi = String(args?.operasi || '')
  const angka = Array.isArray(args?.angka) ? args.angka.map(Number).filter(Number.isFinite) : []

  if (angka.length < 2) {
    return { error: 'Minimal 2 angka valid dibutuhkan.' }
  }

  if (operasi === 'tambah') {
    const hasil = angka.reduce((a, b) => a + b, 0)
    return { hasil, hasil_rupiah: formatRupiahForTool(hasil) }
  }
  if (operasi === 'kurang') {
    const hasil = angka.reduce((a, b) => a - b)
    return { hasil, hasil_rupiah: formatRupiahForTool(hasil) }
  }
  if (operasi === 'kali') {
    const hasil = angka.reduce((a, b) => a * b, 1)
    return { hasil, hasil_rupiah: formatRupiahForTool(hasil) }
  }
  if (operasi === 'bagi') {
    const hasil = angka.reduce((a, b) => a / b)
    return { hasil, hasil_rupiah: formatRupiahForTool(hasil) }
  }
  if (operasi === 'bandingkan') {
    const [a, b] = angka
    const selisih = Math.abs(a - b)
    return {
      hasil:
        a > b
          ? `angka pertama LEBIH BESAR dari angka kedua`
          : a < b
            ? `angka pertama LEBIH KECIL dari angka kedua`
            : `kedua angka sama besar`,
      selisih,
      selisih_rupiah: formatRupiahForTool(selisih),
    }
  }

  return { error: `Operasi "${operasi}" tidak dikenal.` }
}

/*
  Model kecil (7B) terbukti empiris: prompt yang terlalu panjang/bertumpuk
  (banyak aturan "PENTING"/"WAJIB" satu per satu) justru membuatnya LUPA
  memanggil tool "hitung" untuk perbandingan angka - diverifikasi langsung:
  prompt panjang -> tool tidak terpanggil -> jawaban ngarang; prompt yang
  dipadatkan seperti di bawah -> tool terpanggil dengan benar. Jadi kalau mau
  menambah aturan baru di sini, PADATKAN kalimat yang sudah ada, jangan
  sekadar menambah baris baru - daftar aturan yang makin panjang justru
  membuat model ini kurang patuh, bukan lebih patuh.
*/
function buildSystemPrompt(context) {
  return [
    'Anda adalah Asisten Keuangan Finstart untuk PT Kedata Indonesia Digital. Jawab HANYA dari data JSON di bawah - jangan mengarang angka/nama/tanggal yang tidak ada di sana, dan kalau data yang dibutuhkan tidak ada, katakan belum tersedia (jangan menebak).',
    'Jawab HANYA apa yang ditanyakan, singkat 1-3 kalimat (daftar panjang hanya kalau diminta eksplisit) - jangan menambahkan data lain yang tidak diminta walau kebetulan ada di JSON. Bahasa Indonesia selalu, kecuali sapaan/basa-basi cukup dibalas singkat wajar.',
    `Hari ini ${getToday()} (acuan untuk "minggu depan"/"bulan ini" dsb). Format uang: "Rp 15.000.000" (titik pemisah ribuan, tanpa koma/desimal).`,
    'WAJIB panggil tool "hitung" (lewat mekanisme tool call asli, bukan ditulis sebagai teks/JSON) untuk SETIAP tambah/kurang/kali/bagi/bandingkan angka - termasuk angka yang disebut langsung di pertanyaan pengguna, bukan cuma yang ada di data JSON. KECUALI kalau jawabannya sudah satu angka jadi di JSON (mis. "totalKlienAktif") - langsung sebutkan, jangan hitung ulang dari daftar/rincian mentah. Hasil tool selalu punya field "hasil_rupiah"/"selisih_rupiah" yang SUDAH diformat benar - SALIN PERSIS teks field itu ke jawaban Anda, JANGAN menulis ulang angkanya sendiri dari field "hasil" mentah (rawan salah tulis/nambah angka nol). Simpulkan dengan kalimat biasa tanpa menyebut kata "tool"/"internal"/proses di baliknya.',
    'Field "selisihMenujuTargetPendapatan"/"selisihMenujuTargetLaba" sudah final, boleh dipakai langsung. "agendaJatuhTempoDekat.daftar" sudah difilter+diurutkan (hariLagi negatif = terlambat) - jawab jadwal HANYA dari daftar ini.',
    '',
    '=== DATA FINSTART SAAT INI (JSON) ===',
    JSON.stringify(context || {}, null, 2),
  ].join('\n')
}

async function callGemini(systemPrompt, contents) {
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      tools: GEMINI_TOOLS,
      // Suhu rendah = jawaban lebih konsisten & berpegang pada data, bukan
      // "kreatif" menebak-nebak - penting untuk asisten finance yang harus
      // selalu akurat, bukan bervariasi/random tiap kali ditanya hal sama.
      generationConfig: { temperature: 0.15 },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    const error = new Error(`Gemini merespons status ${response.status}: ${errorBody}`)
    error.status = response.status
    throw error
  }

  return response.json()
}

/*
  Jaring pengaman: model kadang menuliskan format pemanggilan tool sebagai teks
  biasa (blok JSON atau notasi "hitung(...)") alih-alih memakai mekanisme tool
  call yang sebenarnya. Bersihkan sintaks yang bocor ini sebelum sampai ke
  pengguna - lebih baik jawaban sedikit lebih pendek daripada bocor JSON/kode.
*/
function stripLeakedToolSyntax(text) {
  return String(text || '')
    // SEMUA blok kode berpagar ``` ... ``` - aplikasi ini tidak pernah punya alasan
    // sah menampilkan kode/JSON ke pengguna, apapun isinya (tool call, hasil
    // angka mentah, dsb), jadi buang semuanya daripada coba tebak polanya satu-satu
    .replace(/```[\s\S]*?```/g, '')
    // objek JSON polos berisi tool call yang tercecer di tengah kalimat (tanpa pagar)
    .replace(/\{\s*"name"\s*:\s*"hitung"[\s\S]*?\}\s*\}/gi, '')
    // notasi semu ala pemrograman: hitung(a, b, "operasi") atau hitung(a, b) = hasil
    .replace(/\bhitung\([^)]*\)(\s*=\s*[\d.,\s]+)?/gi, '')
    // sisa baris "= 0.8026" dkk yang tercecer sendirian setelah blok kode dibuang
    .replace(/^[ \t]*=[ \t]*[\d.,]+[ \t]*$/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/*
  Model kecil kadang, setelah menerima hasil tool, malah menjelaskan proses
  internalnya sendiri ("It seems there was an internal tool response...",
  "Based on the previous calculation, the result of the operation is...")
  alih-alih langsung menjawab - dengan kalimat yang berubah-ubah setiap kali,
  tapi selalu punya satu ciri sama: berbahasa Inggris, padahal prompt
  mewajibkan Bahasa Indonesia. Daripada mengejar setiap variasi kalimat satu
  per satu, deteksi lewat rasio kata Inggris vs Indonesia - lebih tahan
  terhadap variasi kalimat yang tidak terduga.
*/
function looksLikeLeakedMeta(text) {
  const t = ` ${String(text || '').toLowerCase()} `
  if (!t.trim()) return true

  const explicitLeakPhrases =
    /internal tool|tool'?s response|tool response|based on the tool|without more context|i can'?t provide|could you please clarify|internal response|previous calculation|the operation is|feel free to ask/
  if (explicitLeakPhrases.test(t)) return true

  const englishHits = (
    t.match(
      /\b(the|is|are|was|were|based|calculation|operation|result|further|previous|please|would|could|need|let me|know|provide|clarify|however|without)\b/g,
    ) || []
  ).length
  const indonesianHits = (
    t.match(
      /\b(adalah|dari|yang|untuk|dengan|dapat|saat ini|silakan|berikut|jumlah|total|kalau|jika|bisa|akan|anda|klien|piutang|utang|rekomendasi)\b/g,
    ) || []
  ).length

  return englishHits >= 3 && englishHits > indonesianHits
}

/*
  Model kecil (7B) terbukti berulang kali gagal untuk pertanyaan "berapa klien
  aktif" - kadang menghitung ulang dari daftar contoh, kadang malah nyasar
  membaca data proyek. Karena angka ini sudah pasti benar di context
  (klien.totalKlienAktif, sama dengan yang ditampilkan di kartu KPI dashboard),
  jawab langsung tanpa lewat model sama sekali - lebih andal daripada berharap
  model kecil patuh pada instruksi prompt setiap saat.
*/
function tryDeterministicClientCount(message, context) {
  const m = String(message || '').toLowerCase()
  const asksForCount = /berapa|jumlah|total/.test(m)
  const mentionsClient = m.includes('klien') // juga cocok untuk typo "klient"
  const mentionsActive = m.includes('aktif')
  if (!asksForCount || !mentionsClient || !mentionsActive) return null

  const total = context?.klien?.totalKlienAktif
  if (typeof total !== 'number' || !Number.isFinite(total)) return null

  return `Jumlah klien aktif saat ini ada ${total}. Anda bisa melihat daftar lengkapnya di modul Klien Partner.`
}

/*
  "Apakah kas cukup buat bayar pajak" terbukti berulang kali gagal juga -
  bukan cuma salah hitung, tapi model sampai membuang seluruh konteks JSON
  (proyek, vendor, pegawai, aset, dst) ke jawaban karena "pajakBelumSetor"
  aslinya cuma daftar per item tanpa total siap pakai, jadi model kebingungan
  mencari angkanya sendiri. Sekarang ada field total siap pakai
  (pajakBelumSetor.total) - jawab langsung dari situ, tanpa lewat model sama
  sekali, PERSIS seperti kasus klien aktif di atas.
*/
function tryDeterministicCashVsTax(message, context) {
  const m = String(message || '').toLowerCase()
  const mentionsCash = m.includes('kas')
  const mentionsTax = m.includes('pajak')
  const asksIfEnough = /cukup|mencukupi/.test(m)
  if (!mentionsCash || !mentionsTax || !asksIfEnough) return null

  const kas = context?.ringkasanKeuangan?.kasBank
  const totalPajak = context?.pajakBelumSetor?.total
  if (typeof kas !== 'number' || typeof totalPajak !== 'number') return null
  if (!Number.isFinite(kas) || !Number.isFinite(totalPajak)) return null

  const selisih = kas - totalPajak
  const kasFmt = formatRupiahForTool(kas)
  const pajakFmt = formatRupiahForTool(totalPajak)
  if (selisih >= 0) {
    return `Ya, kas cukup untuk membayar seluruh pajak yang belum disetor. Kas saat ini ${kasFmt}, total pajak belum setor ${pajakFmt}, sisa ${formatRupiahForTool(selisih)}.`
  }
  return `Tidak, kas belum cukup untuk membayar seluruh pajak yang belum disetor. Kas saat ini ${kasFmt}, total pajak belum setor ${pajakFmt}, kurang ${formatRupiahForTool(Math.abs(selisih))}.`
}

function extractReplyText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || []
  return parts.map((part) => part.text || '').join('')
}

function extractFunctionCalls(data) {
  const parts = data?.candidates?.[0]?.content?.parts || []
  return parts.filter((part) => part.functionCall)
}

/*
  AI Copilot dipindah dari Ollama lokal ke Google Gemini API (tingkat gratis)
  atas persetujuan eksplisit user - konsekuensinya, pertanyaan & ringkasan data
  finance akan diproses di server Google, bukan lagi 100% lokal. Dipilih Gemini
  spesifik karena free tier-nya cukup untuk pemakaian internal seperti ini,
  dan supaya fitur ini tetap bisa jalan di versi yang di-hosting (Railway),
  bukan cuma waktu development lokal (lihat riwayat: sebelumnya sempat coba
  Claude API lalu ditolak, lalu coba Ollama lokal yang ternyata tidak bisa
  dijangkau dari server hosting).
*/
router.post('/copilot', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI Finstart belum dikonfigurasi. Set GEMINI_API_KEY di file .env backend.',
      })
    }

    const message = String(req.body?.message || '').trim()

    if (!message) {
      return res.status(422).json({
        success: false,
        message: 'Pertanyaan tidak boleh kosong.',
      })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(422).json({
        success: false,
        message: `Pertanyaan terlalu panjang (maksimal ${MAX_MESSAGE_LENGTH} karakter).`,
      })
    }

    const deterministicReply =
      tryDeterministicClientCount(message, req.body?.context) ||
      tryDeterministicCashVsTax(message, req.body?.context)
    if (deterministicReply) {
      return res.json({
        success: true,
        message: 'Jawaban AI Finstart berhasil dibuat.',
        data: { reply: deterministicReply },
      })
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
        .slice(-MAX_HISTORY_MESSAGES)
        .filter((item) => item && typeof item.text === 'string' && item.text.trim())
        .map((item) => ({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: String(item.text).slice(0, MAX_MESSAGE_LENGTH) }],
        }))
      : []

    const systemPrompt = buildSystemPrompt(req.body?.context)
    const contents = [...history, { role: 'user', parts: [{ text: message }] }]

    let reply = ''
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const data = await callGemini(systemPrompt, contents)
      const functionCalls = extractFunctionCalls(data)

      if (functionCalls.length) {
        contents.push(data.candidates[0].content)
        const responseParts = functionCalls.map((part) => ({
          functionResponse: {
            name: part.functionCall.name,
            response: executeTool(part.functionCall.name, part.functionCall.args),
          },
        }))
        contents.push({ role: 'user', parts: responseParts })
        continue
      }

      reply = stripLeakedToolSyntax(extractReplyText(data))

      if (looksLikeLeakedMeta(reply)) {
        // Satu kesempatan perbaikan: minta model merangkum ulang jadi jawaban
        // akhir yang bersih, tanpa mengulang seluruh riwayat tool-calling.
        contents.push({ role: 'model', parts: [{ text: reply }] })
        contents.push({
          role: 'user',
          parts: [{
            text: 'Jawaban Anda barusan tidak valid (menyebut proses internal/tool, atau berbahasa Inggris). Tulis ULANG sebagai satu jawaban akhir yang bersih dalam Bahasa Indonesia, langsung memakai angka/data yang relevan, tanpa menyebut kata "tool", "internal", atau proses di baliknya.',
          }],
        })
        const retryData = await callGemini(systemPrompt, contents)
        const retryReply = stripLeakedToolSyntax(extractReplyText(retryData))
        if (retryReply && !looksLikeLeakedMeta(retryReply)) {
          reply = retryReply
        }
      }
      break
    }

    if (!reply) {
      throw new Error('AI tidak mengembalikan jawaban teks.')
    }

    res.json({
      success: true,
      message: 'Jawaban AI Finstart berhasil dibuat.',
      data: { reply },
    })
  } catch (error) {
    console.error('[ai-copilot] Gagal memproses pertanyaan:', error)

    const status = error?.status
    const message =
      status === 400 || status === 403
        ? 'API key Gemini tidak valid atau bermasalah. Periksa GEMINI_API_KEY di .env.'
        : status === 429
          ? 'Kuota gratis Gemini API sedang penuh untuk saat ini. Coba lagi sebentar lagi.'
          : 'Gagal menghubungi AI Finstart. Coba lagi dalam beberapa saat.'

    res.status(503).json({
      success: false,
      message,
    })
  }
})

module.exports = router
