const express = require('express')

const router = express.Router()

const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_MESSAGES = 20
const MAX_TOOL_ROUNDS = 4
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b'
// Tanpa batas waktu, model kecil kadang benar-benar macet (bukan cuma lambat)
// pada pertanyaan tertentu - pernah tercatat lebih dari 3 menit tanpa respons
// sama sekali. Lebih baik gagal dengan pesan jelas daripada request menggantung
// selamanya dan membuat pengguna kira aplikasinya rusak.
const OLLAMA_TIMEOUT_MS = 90_000

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
    'Jawab HANYA apa yang ditanyakan, singkat 1-3 kalimat (daftar panjang hanya kalau diminta eksplisit) - jangan menambahkan data lain yang tidak diminta walau kebetulan ada di JSON. Kalau pertanyaannya butuh perkiraan/penalaran yang tidak bisa dihitung pasti dari data yang ada, berikan estimasi kasar dengan asumsi yang disebutkan singkat - JANGAN membalas dengan menampilkan ulang seluruh data JSON mentah sebagai jawaban. Bahasa Indonesia selalu, kecuali sapaan/basa-basi cukup dibalas singkat wajar.',
    `Hari ini ${getToday()} (acuan untuk "minggu depan"/"bulan ini" dsb). Format uang: "Rp 15.000.000" (titik pemisah ribuan, tanpa koma/desimal).`,
    'WAJIB panggil tool "hitung" (lewat mekanisme tool call asli, bukan ditulis sebagai teks/JSON) untuk SETIAP tambah/kurang/kali/bagi/bandingkan angka - termasuk angka yang disebut langsung di pertanyaan pengguna, bukan cuma yang ada di data JSON. KECUALI kalau jawabannya sudah satu angka jadi di JSON (mis. "totalKlienAktif") - langsung sebutkan, jangan hitung ulang dari daftar/rincian mentah. Hasil tool selalu punya field "hasil_rupiah"/"selisih_rupiah" yang SUDAH diformat benar - SALIN PERSIS teks field itu ke jawaban Anda, JANGAN menulis ulang angkanya sendiri dari field "hasil" mentah (rawan salah tulis/nambah angka nol). Simpulkan dengan kalimat biasa tanpa menyebut kata "tool"/"internal"/proses di baliknya.',
    'Field "selisihMenujuTargetPendapatan"/"selisihMenujuTargetLaba" sudah final, boleh dipakai langsung. "agendaJatuhTempoDekat.daftar" sudah difilter+diurutkan (hariLagi negatif = terlambat) - jawab jadwal HANYA dari daftar ini.',
    '',
    '=== DATA FINSTART SAAT INI (JSON) ===',
    JSON.stringify(context || {}, null, 2),
  ].join('\n')
}

async function callOllama(messages) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        tools: TOOLS,
        messages,
        // Suhu rendah = jawaban lebih konsisten & berpegang pada data, bukan
        // "kreatif" menebak-nebak - penting untuk asisten finance yang harus
        // selalu akurat, bukan bervariasi/random tiap kali ditanya hal sama.
        options: { temperature: 0.15 },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      const error = new Error(`Ollama merespons status ${response.status}: ${errorBody}`)
      error.status = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(
        `Ollama tidak merespons dalam ${OLLAMA_TIMEOUT_MS / 1000} detik (kemungkinan macet pada pertanyaan ini).`,
      )
      timeoutError.status = 504
      throw timeoutError
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
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
    // prefiks bocor di awal jawaban ala "Hitung hasil_rupiah:" / "Hitung:" sebelum kalimat asli
    .replace(/^hitung[\s\w_]*:\s*/gi, '')
    // sisa baris "= 0.8026" dkk yang tercecer sendirian setelah blok kode dibuang
    .replace(/^[ \t]*=[ \t]*[\d.,]+[ \t]*$/gm, '')
    // baris rumus mentah di awal jawaban, mis. "(80000000 / 200000000) * 100 = 40%"
    .replace(/^[ \t]*\(?[\d.,]+\)?[ \t]*[+\-*/][ \t]*[\d.,()*/+\- \t]*=[ \t]*[\d.,]+%?[ \t]*$/gm, '')
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

/*
  Kata "utang" adalah substring dari "piutang" (p-i-UTANG) - m.includes('utang')
  akan SELALU true untuk kalimat apapun yang menyebut "piutang", walau kata
  "utang" sendiri tidak pernah muncul terpisah. Untuk deteksi "menyebut utang"
  yang benar, buang dulu semua kemunculan "piutang" sebelum mencari "utang".
*/
function mentionsPayableWord(m) {
  return m.replace(/piutang/g, '').includes('utang')
}

/*
  "Apakah piutang lebih besar dari utang" (atau sebaliknya) tercatat pernah
  membuat model macet total (>3 menit tanpa respons) - perbandingan dua
  angka sederhana ini sudah tersedia langsung di ringkasanKeuangan
  (piutangTerbuka, utangTerbuka), jadi tidak perlu lewat AI sama sekali.
*/
function tryDeterministicReceivableVsPayable(message, context) {
  const m = String(message || '').toLowerCase()
  const mentionsReceivable = m.includes('piutang')
  const mentionsPayable = mentionsPayableWord(m)
  const asksCompare = /lebih besar|lebih kecil|lebih banyak|dibanding|bandingkan/.test(m)
  if (!mentionsReceivable || !mentionsPayable || !asksCompare) return null

  const piutang = context?.ringkasanKeuangan?.piutangTerbuka
  const utang = context?.ringkasanKeuangan?.utangTerbuka
  if (typeof piutang !== 'number' || typeof utang !== 'number') return null
  if (!Number.isFinite(piutang) || !Number.isFinite(utang)) return null

  const piutangFmt = formatRupiahForTool(piutang)
  const utangFmt = formatRupiahForTool(utang)
  const selisihFmt = formatRupiahForTool(Math.abs(piutang - utang))
  if (piutang === utang) {
    return `Piutang dan utang saat ini sama besar, masing-masing ${piutangFmt}.`
  }
  const lebihBesar = piutang > utang ? 'piutang' : 'utang';
  return `Ya, ${lebihBesar} lebih besar. Piutang terbuka saat ini ${piutangFmt}, utang terbuka ${utangFmt}, selisih ${selisihFmt}.`
}

/*
  "Berapa piutang yang harus dibayar" (atau "berapa utang saya") - pertanyaan
  nilai TUNGGAL tanpa kata pembanding - ternyata juga bisa membuat model macet
  sama seperti kasus perbandingan di atas, padahal ini cuma butuh satu angka
  dari ringkasanKeuangan. Kalau pesan menyebut piutang ATAU utang saja (bukan
  dua-duanya, itu urusan tryDeterministicReceivableVsPayable di atas), jawab
  langsung dari sini.
*/
function tryDeterministicSingleReceivableOrPayable(message, context) {
  const m = String(message || '').toLowerCase()
  const mentionsReceivable = m.includes('piutang')
  const mentionsPayable = mentionsPayableWord(m)
  if (mentionsReceivable === mentionsPayable) return null // baik dua-duanya maupun tidak sama sekali
  const asksAmount = /berapa|jumlah|total|nilai/.test(m)
  if (!asksAmount) return null

  if (mentionsReceivable) {
    const piutang = context?.ringkasanKeuangan?.piutangTerbuka
    if (typeof piutang !== 'number' || !Number.isFinite(piutang)) return null
    return `Piutang terbuka (uang yang masih harus ditagih dari klien) saat ini sebesar ${formatRupiahForTool(piutang)}.`
  }

  const utang = context?.ringkasanKeuangan?.utangTerbuka
  if (typeof utang !== 'number' || !Number.isFinite(utang)) return null
  return `Utang terbuka (kewajiban yang masih harus dibayar ke vendor) saat ini sebesar ${formatRupiahForTool(utang)}.`
}

/*
  "Berapa persen target pendapatan/laba yang sudah tercapai" terbukti tidak
  konsisten - kadang malah jawab hal lain (mis. "sisa target" padahal
  ditanya persentase). Data targetPendapatan/realisasiPendapatan (atau versi
  laba) sudah ada di proyeksiTarget - hitung persentasenya langsung di sini.
*/
function tryDeterministicTargetPercentage(message, context) {
  const m = String(message || '').toLowerCase()
  const asksPercentage = /berapa persen|persentase/.test(m)
  const mentionsTarget = m.includes('target')
  if (!asksPercentage || !mentionsTarget) return null

  const isProfit = /laba/.test(m)
  const target = isProfit
    ? context?.proyeksiTarget?.targetLaba
    : context?.proyeksiTarget?.targetPendapatan
  const realisasi = isProfit
    ? context?.proyeksiTarget?.realisasiLaba
    : context?.proyeksiTarget?.realisasiPendapatan
  if (typeof target !== 'number' || typeof realisasi !== 'number') return null
  if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(realisasi)) return null

  const persen = (realisasi / target) * 100
  const label = isProfit ? 'target laba' : 'target pendapatan';
  return `${persen.toFixed(1)}% dari ${label} sudah tercapai (realisasi ${formatRupiahForTool(realisasi)} dari target ${formatRupiahForTool(target)}).`
}

/*
  "Berapa proyek untuk capai target sekian" terbukti gagal juga - ini butuh
  rata-rata nilai kontrak dari daftar proyek (context.proyek, panjangnya
  variabel) lalu dibagi ke target, dua langkah tool-call sekaligus yang
  ternyata terlalu banyak untuk model 7B (dia menyerah dan membuang seluruh
  data mentah, lihat riwayat perbaikan sistem prompt di atas). Rata-rata &
  pembagian sekarang dihitung langsung di sini, dijamin benar.
*/
function parseTargetNominal(message) {
  const m = String(message || '').toLowerCase().replace(/,/g, '.')
  const match = m.match(/(\d+(?:\.\d+)?)\s*(miliar|milyar|m\b|juta|jt\b)/)
  if (!match) return null
  const angka = parseFloat(match[1])
  if (!Number.isFinite(angka)) return null
  const satuan = match[2]
  const pengali = satuan.startsWith('m') ? 1_000_000_000 : 1_000_000
  return angka * pengali
}

function tryDeterministicProjectsNeeded(message, context) {
  const m = String(message || '').toLowerCase()
  const mentionsProject = m.includes('proyek')
  const mentionsTarget = /target|dapat(kan)?|mendapatkan|capai|mencapai|hasilkan/.test(m)
  const asksHowMany = /berapa|jumlah/.test(m)
  if (!mentionsProject || !mentionsTarget || !asksHowMany) return null

  const target = parseTargetNominal(message)
  if (!target) return null

  const daftarProyek = Array.isArray(context?.proyek) ? context.proyek : []
  const nilaiKontrak = daftarProyek
    .map((p) => Number(p?.nilaiKontrak))
    .filter((v) => Number.isFinite(v) && v > 0)
  if (!nilaiKontrak.length) return null

  const rataRata = nilaiKontrak.reduce((a, b) => a + b, 0) / nilaiKontrak.length
  const jumlahProyek = Math.ceil(target / rataRata)

  return `Berdasarkan rata-rata nilai kontrak proyek saat ini (${formatRupiahForTool(rataRata)} dari ${nilaiKontrak.length} proyek), dibutuhkan sekitar ${jumlahProyek} proyek untuk mencapai target ${formatRupiahForTool(target)}. Ini perkiraan kasar, angka sebenarnya tergantung nilai kontrak proyek yang benar-benar didapat.`
}

/*
  AI Finstart berjalan lewat Ollama - default-nya lokal (http://127.0.0.1:11434,
  cocok kalau backend dijalankan langsung di komputer yang sama dengan Ollama),
  tapi untuk Docker Compose OLLAMA_BASE_URL di-override ke alamat Ollama di host
  (lihat docker-compose.yml). Tidak ada data yang dikirim ke API pihak ketiga.
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

    const deterministicReply =
      tryDeterministicClientCount(message, req.body?.context) ||
      tryDeterministicCashVsTax(message, req.body?.context) ||
      tryDeterministicReceivableVsPayable(message, req.body?.context) ||
      tryDeterministicSingleReceivableOrPayable(message, req.body?.context) ||
      tryDeterministicTargetPercentage(message, req.body?.context) ||
      tryDeterministicProjectsNeeded(message, req.body?.context)
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
      message: 'Jawaban AI Finstart berhasil dibuat.',
      data: { reply },
    })
  } catch (error) {
    console.error('[ai-copilot] Gagal memproses pertanyaan:', error)

    const isConnectionError = /ECONNREFUSED|fetch failed/i.test(String(error?.message || error?.cause?.message || ''))
    const isModelMissing = error?.status === 404
    const isTimeout = error?.status === 504

    const message = isConnectionError
      ? `AI Finstart belum aktif. Pastikan aplikasi Ollama sedang berjalan (${OLLAMA_BASE_URL}).`
      : isModelMissing
        ? `Model "${OLLAMA_MODEL}" belum tersedia di Ollama. Jalankan "ollama pull ${OLLAMA_MODEL}" terlebih dahulu.`
        : isTimeout
          ? 'AI Finstart terlalu lama memproses pertanyaan ini (kemungkinan macet). Coba tanyakan dengan cara lain yang lebih spesifik, atau coba lagi.'
          : 'Gagal menghubungi AI Finstart. Periksa apakah Ollama sedang berjalan.'

    res.status(isTimeout ? 504 : 503).json({
      success: false,
      message,
    })
  }
})

module.exports = router
