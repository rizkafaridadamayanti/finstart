const express = require('express')

const router = express.Router()

const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_MESSAGES = 20
const MAX_TOOL_ROUNDS = 4
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b'

function getToday() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/*
  Model AI lokal (kecil) terbukti sering salah kalau disuruh menjumlah/mengurangi/
  membandingkan angka sendiri di kepalanya. Daripada percaya hasil hitungannya,
  dia WAJIB memanggil tool ini - hitungannya selalu dikerjakan JavaScript biasa
  di bawah (dijamin benar), bukan ditebak oleh model.
*/
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'hitung',
      description:
        'Melakukan operasi matematika yang pasti benar pada beberapa angka. WAJIB dipanggil setiap kali perlu menjumlah, mengurangi, mengalikan, membagi, atau membandingkan dua angka atau lebih (misal cek apakah kas cukup untuk menutup beberapa kewajiban sekaligus). Jangan pernah menghitung sendiri di kepala.',
      parameters: {
        type: 'object',
        properties: {
          operasi: {
            type: 'string',
            enum: ['tambah', 'kurang', 'kali', 'bagi', 'bandingkan'],
            description:
              'tambah/kali menjumlah semua angka; kurang/bagi memproses angka pertama dikurangi/dibagi angka berikutnya berurutan; bandingkan menilai angka pertama vs angka kedua.',
          },
          angka: {
            type: 'array',
            items: { type: 'number' },
            description: 'Daftar angka yang dioperasikan, berurutan.',
          },
        },
        required: ['operasi', 'angka'],
      },
    },
  },
]

function executeTool(name, args) {
  if (name !== 'hitung') {
    return { error: `Tool "${name}" tidak dikenal.` }
  }

  const operasi = String(args?.operasi || '')
  const angka = Array.isArray(args?.angka) ? args.angka.map(Number).filter(Number.isFinite) : []

  if (angka.length < 2) {
    return { error: 'Minimal 2 angka valid dibutuhkan.' }
  }

  if (operasi === 'tambah') return { hasil: angka.reduce((a, b) => a + b, 0) }
  if (operasi === 'kurang') return { hasil: angka.reduce((a, b) => a - b) }
  if (operasi === 'kali') return { hasil: angka.reduce((a, b) => a * b, 1) }
  if (operasi === 'bagi') return { hasil: angka.reduce((a, b) => a / b) }
  if (operasi === 'bandingkan') {
    const [a, b] = angka
    return {
      hasil:
        a > b
          ? `angka pertama (${a}) LEBIH BESAR dari angka kedua (${b}); selisih ${a - b}`
          : a < b
            ? `angka pertama (${a}) LEBIH KECIL dari angka kedua (${b}); selisih ${b - a}`
            : `kedua angka sama besar (${a})`,
    }
  }

  return { error: `Operasi "${operasi}" tidak dikenal.` }
}

function buildSystemPrompt(context) {
  return [
    'Anda adalah FinStart CFO Copilot, asisten analisis operasional dan keuangan internal untuk PT Kedata Indonesia Digital.',
    'Jawab HANYA berdasarkan data konteks JSON yang diberikan di bawah ini - jangan mengarang angka, proyek, atau kejadian yang tidak ada di data tersebut.',
    'Jika data yang dibutuhkan untuk menjawab tidak tersedia di konteks, katakan dengan jujur bahwa datanya belum tersedia, jangan menebak.',
    `Hari ini: ${getToday()}. Gunakan tanggal ini sebagai acuan saat menjawab pertanyaan yang menyebut "minggu depan", "bulan ini", "bulan depan", dsb.`,
    'Selalu jawab dalam Bahasa Indonesia, singkat namun konkret: sebutkan angka nyata dari data, lalu beri rekomendasi tindakan yang bisa langsung dilakukan pengguna dari modul terkait di aplikasi FinStart.',
    'Tulis semua nominal uang dengan format Rupiah Indonesia: awali "Rp", pisahkan ribuan dengan titik, tanpa desimal kecuali penting. Contoh benar: "Rp 15.000.000". Jangan pernah pakai koma sebagai pemisah ribuan atau format ala Inggris seperti "Rp 15,000,000.00".',
'WAJIB PAKAI TOOL "hitung" HANYA kalau Anda perlu MENGOLAH (menjumlah/mengurangi/mengalikan/membagi/membandingkan) dua angka atau lebih yang BELUM ada jadi satu angka jadi di data. Contoh yang WAJIB pakai tool: "apakah kas cukup untuk bayar A dan B", "berapa total dari beberapa nominal terpisah", "mana yang lebih besar".',
    'JANGAN PAKAI TOOL kalau jawabannya sudah berupa satu angka/nilai siap pakai di data JSON (misalnya jumlah/count/total yang sudah dihitung sebelumnya seperti "totalKlienAktif", "kasBankLancar", atau field angka apa pun yang berdiri sendiri) - untuk kasus ini langsung sebutkan angkanya dari data, jangan panggil tool sama sekali. Contoh: "berapa klien aktif?" -> jawab langsung dari field klien.totalKlienAktif, TANPA tool.',
    'PENTING: field "klien.totalKlienAktif" adalah SATU-SATUNYA angka yang benar untuk "berapa klien aktif". JANGAN PERNAH menghitung ulang sendiri dengan membaca/mendaftar/menghitung isi "klien.daftar" (daftar itu hanya potongan contoh untuk detail nama/bidang/lokasi, BUKAN daftar lengkap dan BUKAN sumber untuk menghitung jumlah). Kalau kedua angka itu terlihat beda, tetap pakai totalKlienAktif, bukan hasil hitungan manual Anda dari daftar.',
    'SANGAT PENTING: kalau butuh tool, panggil lewat mekanisme tool call yang sebenarnya - JANGAN PERNAH menuliskan kode/JSON/format seperti {"name":"hitung",...} atau hitung(angka1, angka2) di dalam teks jawaban Anda. Jawaban yang Anda tulis untuk pengguna HARUS berupa kalimat biasa saja, tanpa sintaks pemrograman atau JSON sama sekali. Kalau pertanyaannya butuh banyak langkah hitungan berantai, panggil tool satu per satu sampai selesai, baru simpulkan dengan kalimat biasa.',
    'SETELAH menerima hasil dari tool "hitung", jawaban akhir Anda ke pengguna WAJIB berupa kalimat Bahasa Indonesia biasa yang langsung memakai angka hasilnya - JANGAN PERNAH menyebut kata "tool", "internal", "operasi", "calculation", atau menjelaskan proses/mekanisme di balik layar. Pengguna hanya perlu tahu jawabannya, bukan bagaimana Anda mendapatkannya.',
    'Field "selisihMenujuTargetPendapatan" dan "selisihMenujuTargetLaba" di data sudah dihitung duluan - boleh langsung dipakai tanpa tool. Daftar "agendaJatuhTempoDekat.daftar" juga sudah difilter dan diurutkan dari yang paling dekat (field "hariLagi": negatif = sudah terlambat, positif = berapa hari lagi) - jawab pertanyaan soal jadwal/deadline HANYA dari daftar ini, jangan menyebut item lain.',
    '',
    '=== DATA FINSTART SAAT INI (JSON) ===',
    JSON.stringify(context || {}, null, 2),
  ].join('\n')
}

async function callOllama(messages) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      tools: TOOLS,
      messages,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    const error = new Error(`Ollama merespons status ${response.status}: ${errorBody}`)
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
  AI Copilot berjalan sepenuhnya lokal lewat Ollama (http://127.0.0.1:11434).
  Tidak ada data yang dikirim ke API pihak ketiga mana pun - semua permintaan
  tetap berada di mesin/server yang sama dengan backend FinStart.
*/
router.post('/copilot', async (req, res) => {
  try {
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

    const deterministicReply = tryDeterministicClientCount(message, req.body?.context)
    if (deterministicReply) {
      return res.json({
        success: true,
        message: 'Jawaban AI Copilot berhasil dibuat.',
        data: { reply: deterministicReply },
      })
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
        .slice(-MAX_HISTORY_MESSAGES)
        .filter((item) => item && typeof item.text === 'string' && item.text.trim())
        .map((item) => ({
          role: item.sender === 'user' ? 'user' : 'assistant',
          content: String(item.text).slice(0, MAX_MESSAGE_LENGTH),
        }))
      : []

    const messages = [
      { role: 'system', content: buildSystemPrompt(req.body?.context) },
      ...history,
      { role: 'user', content: message },
    ]

    let reply = ''
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const data = await callOllama(messages)
      const toolCalls = data?.message?.tool_calls

      if (Array.isArray(toolCalls) && toolCalls.length) {
        messages.push(data.message)
        for (const call of toolCalls) {
          const args =
            typeof call.function?.arguments === 'string'
              ? JSON.parse(call.function.arguments)
              : call.function?.arguments
          const result = executeTool(call.function?.name, args)
          messages.push({ role: 'tool', content: JSON.stringify(result) })
        }
        continue
      }

      reply = stripLeakedToolSyntax(data?.message?.content)

      if (looksLikeLeakedMeta(reply)) {
        // Satu kesempatan perbaikan: minta model merangkum ulang jadi jawaban
        // akhir yang bersih, tanpa mengulang seluruh riwayat tool-calling.
        messages.push({ role: 'assistant', content: reply })
        messages.push({
          role: 'user',
          content:
            'Jawaban Anda barusan tidak valid (menyebut proses internal/tool, atau berbahasa Inggris). Tulis ULANG sebagai satu jawaban akhir yang bersih dalam Bahasa Indonesia, langsung memakai angka/data yang relevan, tanpa menyebut kata "tool", "internal", atau proses di baliknya.',
        })
        const retryData = await callOllama(messages)
        const retryReply = stripLeakedToolSyntax(retryData?.message?.content)
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
      message: 'Jawaban AI Copilot berhasil dibuat.',
      data: { reply },
    })
  } catch (error) {
    console.error('[ai-copilot] Gagal memproses pertanyaan:', error)

    const isConnectionError = /ECONNREFUSED|fetch failed/i.test(String(error?.message || error?.cause?.message || ''))
    const isModelMissing = error?.status === 404

    const message = isConnectionError
      ? `AI Copilot lokal belum aktif. Pastikan aplikasi Ollama sedang berjalan di komputer ini (${OLLAMA_BASE_URL}).`
      : isModelMissing
        ? `Model "${OLLAMA_MODEL}" belum tersedia di Ollama. Jalankan "ollama pull ${OLLAMA_MODEL}" terlebih dahulu.`
        : 'Gagal menghubungi AI Copilot lokal. Periksa apakah Ollama sedang berjalan di komputer ini.'

    res.status(503).json({
      success: false,
      message,
    })
  }
})

module.exports = router
