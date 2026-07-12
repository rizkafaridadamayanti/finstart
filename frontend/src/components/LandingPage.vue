<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/20 selection:text-[#0B1F4A] scroll-smooth"
  >
    <!-- HEADER & NAVBAR -->
    <nav
      id="navbar"
      class="sticky top-0 bg-[#0B1F4A]/95 backdrop-blur-md border-b border-white/10 py-5 px-6 md:px-12 flex items-center justify-between z-40 transition-all duration-300"
    >
      <!-- Kedata Logo - Clean blue & white -->
      <div
        class="flex items-center gap-2.5 cursor-pointer"
        @click="scrollToSection('beranda')"
      >
        <KedataLogo :size="36" class="shrink-0" />
        <div class="flex flex-col text-left">
          <span
            class="font-black text-xl text-white tracking-wider leading-none"
            >KEDATA</span
          ><span
            class="text-[8.5px] text-blue-400 font-extrabold uppercase tracking-widest leading-none mt-1.5"
            >Indonesia Digital</span
          >
        </div>
      </div>
    </nav>
    <!-- HERO SECTION - Matching clean alignment & exact visual hierarchy of reference image 2 -->
    <section
      id="beranda"
      class="relative pt-32 pb-28 md:pt-36 md:pb-32 lg:pt-40 lg:pb-36 bg-gradient-to-b from-[#0B1F4A] via-[#0B255C] to-[#0A1B40] text-white px-6 md:px-12 overflow-hidden text-center"
    >
      <!-- Soft elegant blue radial grid and glow backdrops -->
      <div
        class="absolute top-0 inset-x-0 h-full bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_60%)] pointer-events-none"
      />
      <div
        class="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
      />
      <div
        class="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <div class="max-w-6xl mx-auto space-y-8 relative z-10">
        <!-- Centered headline -->
        <h1
          class="mt-6 md:mt-8 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto text-white"
        >
          Satu Sistem untuk
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white font-extrabold"
            >Operasional Finance Kedata</span
          >
        </h1>
        <!-- Centered description matching Gambar 2 layout -->
        <p
          class="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light"
        >
          Finstart membantu tim mengelola dashboard CFO, proyek, buku besar,
          transaksi, invoice, vendor, pajak, payroll, aset, SaaS, dan laporan
          dalam satu workflow internal yang rapi.
        </p>
        <!-- Centered button pair matching exactly Gambar 2 buttons ("VIEW DEMO" style & "GET STARTED" style) -->
        <div class="flex flex-wrap justify-center items-center gap-4 pt-4">
          <button
            id="hero-btn-kenal"
            class="bg-white/10 hover:bg-white/20 text-white font-extrabold py-3.5 px-8 rounded-full transition-all duration-200 text-xs uppercase tracking-widest border border-white/20 hover:border-white/40 cursor-pointer shadow-lg"
            @click="scrollToSection('tentang')"
          >
            Lihat Fitur</button
          ><button
            id="hero-btn-masuk-sistem"
            class="bg-white hover:bg-blue-50 text-[#0B1F4A] hover:text-[#0B1F4A] font-black py-3.5 px-8 rounded-full shadow-xl transition-all duration-200 flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
            @click="openLogin"
          >
            Masuk ke Sistem
            <span class="p-1 bg-[#0B1F4A] text-white rounded-full"
              ><ArrowRight class="w-3 h-3"
            /></span>
          </button>
        </div>
        <!-- FITUR UTAMA — carousel modern tanpa kartu saling menimpa -->
        <div class="pt-16 max-w-6xl mx-auto relative">
          <div class="mb-8 flex flex-col items-center gap-3 px-4">
            <span
              class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-200"
            >
              Semua fitur sistem ({{ activeClientIndex + 1 }}/{{
                financeCarouselItems.length
              }})
            </span>
            <p class="max-w-xl text-center text-xs leading-6 text-slate-300/80">
              Geser otomatis untuk melihat modul utama FinStart. Pilih kartu
              untuk menjadikannya fokus.
            </p>
          </div>
          <div
            class="landing-carousel-shell px-4 sm:px-7"
            @mouse-enter="pauseCarousel"
            @mouse-leave="resumeCarousel"
            @focusin="pauseCarousel"
            @focusout="resumeCarousel"
          >
            <button
              type="button"
              aria-label="Fitur sebelumnya"
              class="landing-carousel-nav landing-carousel-nav--prev"
              @click="prevSlide"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>
            <div class="landing-carousel-grid">
              <button
                v-for="offset in [-1, 0, 1]"
                :key="`${carouselItemAt(offset).id}-${offset}`"
                type="button"
                :class="`landing-feature-card group ${offset === 0 ? 'landing-feature-card--active' : ''}`"
                :aria-pressed="offset === 0"
                @click="updateActiveClientIndex(
                      (activeClientIndex +
                        offset +
                        financeCarouselItems.length) %
                        financeCarouselItems.length,
                    )"
              >
                <div class="flex h-full flex-col justify-between gap-5">
                  <div>
                    <div class="flex items-center justify-between gap-3">
                      <span
                        :class="`rounded-md px-2.5 py-1 text-[8.5px] font-black uppercase tracking-[.22em] ${offset === 0 ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-blue-100'}`"
                        >{{ carouselItemAt(offset).status }}</span
                      ><span
                        :class="`inline-flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-wider ${offset === 0 ? 'text-slate-400' : 'text-slate-400'}`"
                        ><i
                          :class="`h-1.5 w-1.5 rounded-full ${offset === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-sky-300/70'}`"
                        />
                        LIVE</span
                      >
                    </div>
                    <div
                      :class="`mt-7 flex h-20 w-20 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-105 ${offset === 0 ? 'border-blue-100 bg-blue-50 text-[#1E5AA8]' : 'border-white/10 bg-white/10 text-blue-200'}`"
                    >
                      <component
                        :is="carouselItemAt(offset).icon"
                        :class="carouselItemAt(offset).iconClass"
                      />
                    </div>
                    <div class="mt-6">
                      <span
                        :class="`block text-[9.5px] font-black uppercase tracking-widest ${offset === 0 ? 'text-blue-500' : 'text-blue-300'}`"
                        >{{ carouselItemAt(offset).clientName }}</span
                      >
                      <h4
                        :class="`mt-2 text-lg font-bold tracking-tight ${offset === 0 ? 'text-slate-900' : 'text-white'}`"
                      >
                        {{ carouselItemAt(offset).title }}
                      </h4>
                      <p
                        :class="`mt-3 text-xs leading-6 ${offset === 0 ? 'text-slate-500' : 'text-slate-300/80'}`"
                      >
                        {{ carouselItemAt(offset).desc }}
                      </p>
                    </div>
                  </div>
                  <div
                    :class="`flex items-end justify-between border-t pt-4 ${offset === 0 ? 'border-slate-100' : 'border-white/10'}`"
                  >
                    <div>
                      <span
                        :class="`block text-[8px] font-mono uppercase tracking-[.16em] ${offset === 0 ? 'text-slate-400' : 'text-slate-400'}`"
                        >{{ carouselItemAt(offset).metricLabel }}</span
                      ><span
                        :class="`mt-1 block text-sm font-bold ${offset === 0 ? 'text-slate-800' : 'text-white'}`"
                        >{{ carouselItemAt(offset).metricValue }}</span
                      >
                    </div>
                    <div class="text-right">
                      <span
                        :class="`block text-[8px] font-mono uppercase tracking-[.16em] ${offset === 0 ? 'text-slate-400' : 'text-slate-400'}`"
                        >STATUS</span
                      ><span
                        class="mt-1 block text-sm font-bold text-blue-400"
                        >{{ carouselItemAt(offset).metric }}</span
                      >
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <button
              type="button"
              aria-label="Fitur berikutnya"
              class="landing-carousel-nav landing-carousel-nav--next"
              @click="nextSlide"
            >
              <ChevronRight class="h-5 w-5" />
            </button>
          </div>
          <div
            class="mt-9 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Navigasi fitur FinStart"
          >
            <button
              v-for="(item, index) in financeCarouselItems"
              :key="item.id"
              type="button"
              :aria-label="`Tampilkan ${item.title}`"
              :class="`landing-progress-dot ${activeClientIndex === index ? 'landing-progress-dot--active' : 'w-2'}`"
              @click="updateActiveClientIndex(index)"
            />
          </div>
          <p class="mt-7 text-xs font-medium tracking-wide text-slate-300/80">
            Dirancang untuk
            <span class="font-bold text-white">kontrol finance harian</span>,
            laporan manajemen, dan proses audit internal.
          </p>
        </div>
      </div>
    </section>
    <!-- SECTION FITUR SISTEM -->
    <section
      id="tentang"
      class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Kolom Kiri -->
          <div class="lg:col-span-7 space-y-6 text-left">
            <span
              class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
              >FITUR SISTEM</span
            >
            <h2
              class="text-3xl md:text-4xl font-extrabold text-[#102A56] tracking-tight leading-tight"
            >
              Semua pekerjaan finance harian dalam satu sistem terpadu
            </h2>
            <p class="text-[#152238]/90 text-sm md:text-base leading-relaxed">
              Finstart menyatukan dashboard CFO, CRM proyek, buku besar, jurnal,
              piutang, utang, pajak, SDM, payroll, aset, SaaS, dan laporan
              keuangan agar proses finance internal lebih cepat, rapi, dan mudah
              diaudit.
            </p>
            <div>
              <button
                class="inline-flex items-center justify-center border border-[#1E5AA8] text-[#1E5AA8] hover:bg-[#EEF4FB] font-semibold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer"
                @click="scrollToSection('visi-misi')"
              >
                Lihat Keunggulan Sistem
              </button>
            </div>
          </div>
          <!-- Kolom Kanan -->
          <div class="lg:col-span-5">
            <div
              class="bg-white border border-[#D8E5F4] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 text-left"
            >
              <div class="flex items-start gap-4">
                <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                  <Calendar class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-[#102A56] text-sm">
                    Data finance terpusat
                  </h4>
                  <p class="text-[#637083] text-xs mt-0.5">
                    Kas, proyek, invoice, pajak, payroll, aset, dan laporan
                    berada dalam satu alur kerja.
                  </p>
                </div>
              </div>
              <div class="border-t border-[#D8E5F4]" />
              <div class="flex items-start gap-4">
                <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                  <Cpu class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-[#102A56] text-sm">
                    Kontrol operasional real-time
                  </h4>
                  <p class="text-[#637083] text-xs mt-0.5">
                    Status jatuh tempo, pembayaran, compliance, dan proyeksi
                    dapat dipantau cepat.
                  </p>
                </div>
              </div>
              <div class="border-t border-[#D8E5F4]" />
              <div class="flex items-start gap-4">
                <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                  <Workflow class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-[#102A56] text-sm">
                    Workflow finance terpadu
                  </h4>
                  <p class="text-[#637083] text-xs mt-0.5">
                    Menghubungkan transaksi, compliance, dan laporan dalam satu
                    alur kerja.
                  </p>
                </div>
              </div>
              <div class="border-t border-[#D8E5F4]" />
              <div class="flex items-start gap-4">
                <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                  <Briefcase class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-[#102A56] text-sm">
                    Modul finance lintas kebutuhan
                  </h4>
                  <p class="text-[#637083] text-xs mt-0.5">
                    Mencakup proyek, akuntansi, invoice, pajak, payroll, aset,
                    dan laporan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Quote Strip -->
        <div
          class="bg-[#102A56] border-l-4 border-[#D9AE27] rounded-xl p-6 text-left shadow-md flex items-center justify-between"
        >
          <h3
            class="text-white text-base md:text-lg font-semibold tracking-tight"
          >
            Finstart menyatukan fitur operasional, kontrol, compliance, dan
            laporan dalam satu sistem.
          </h3>
        </div>
      </div>
    </section>
    <!-- SECTION VISI DAN MISI -->
    <section
      id="visi-misi"
      class="py-24 bg-[#EEF4FB] px-6 md:px-12 scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-16">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
            >PRINSIP SISTEM</span
          >
          <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">
            Dibangun untuk workflow finance yang rapi
          </h2>
          <p class="text-[#637083] text-sm font-normal">
            Prinsip desain utama Finstart: data jelas, proses cepat, dan output
            siap dipakai manajemen.
          </p>
        </div>
        <!-- Visi - Card full-width background navy -->
        <div
          class="bg-[#102A56] text-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-lg border border-[#D8E5F4]/10 max-w-5xl mx-auto"
        >
          <div
            class="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10"
          >
            <div
              class="border-l-4 border-[#D9AE27] pl-6 py-2 space-y-3 text-left"
            >
              <span
                class="text-xs font-bold uppercase tracking-wider text-[#EEF4FB]/80 block"
                >WORKFLOW UTAMA</span
              >
              <p
                class="text-lg md:text-xl font-medium text-white tracking-tight leading-relaxed"
              >
                Finstart membantu tim mengalirkan data dari pencatatan transaksi
                harian ke monitoring, compliance, proyeksi, dan laporan
                manajemen tanpa memecah proses ke banyak file.
              </p>
              <p class="hidden">
                “Menjadi penyedia solusi AI dan data terdepan di Indonesia pada
                tahun 2030, yang memberdayakan organisasi untuk mencapai
                keunggulan digital melalui tata kelola data cerdas, workflow
                otomatis, dan analitik transformatif.”
              </p>
            </div>
          </div>
        </div>
        <!-- Misi - 2 Column grid for 4 missions -->
        <div class="space-y-8 pt-6 text-left max-w-5xl mx-auto">
          <div class="text-center">
            <span
              class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block mb-2"
              >ALUR KERJA</span
            >
            <h3 class="text-2xl font-bold text-[#102A56] tracking-tight">
              Alur Utama Sistem
            </h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(misi, idx) in [
                {
                  title: 'Pencatatan Data Master',
                  desc: 'Kelola akun buku besar, klien, vendor, pegawai, aset, layanan SaaS, dan detail proyek dari satu tempat yang konsisten.',
                  icon: Award,
                  num: '01',
                },
                {
                  title: 'Transaksi dan Tagihan',
                  desc: 'Input jurnal, invoice, piutang, tagihan vendor, pembayaran, dan pelunasan dengan struktur form yang seragam.',
                  icon: Database,
                  num: '02',
                },
                {
                  title: 'Compliance dan Payroll',
                  desc: 'Pantau kewajiban pajak, BPJS, payroll, dokumen pegawai, dan status pembayaran yang perlu ditindaklanjuti.',
                  icon: Zap,
                  num: '03',
                },
                {
                  title: 'Laporan dan Proyeksi',
                  desc: 'Baca dashboard CFO, cash flow, laporan manajemen, target proyeksi, dan roadmap pertumbuhan bisnis secara ringkas.',
                  icon: Lightbulb,
                  num: '04',
                },
              ]"
              :key="idx"
              class="bg-white border border-[#D8E5F4] rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(16,42,86,0.02)] flex items-start gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full"
            >
              <div
                class="w-12 h-12 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border border-[#D8E5F4]/40"
              >
                <span class="text-[#D9AE27] font-extrabold">{{
                  misi.num
                }}</span>
              </div>
              <div class="space-y-2 flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-base text-[#102A56] tracking-tight">
                    {{ misi.title }}
                  </h4>
                  <component :is="misi.icon" class="w-4 h-4 text-[#1E5AA8]" />
                </div>
                <p class="text-[#637083] text-sm leading-relaxed font-normal">
                  {{ misi.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- SECTION KEUNGGULAN PENGGUNAAN -->
    <section
      id="nilai"
      class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-16">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
            >KEUNGGULAN PRAKTIS</span
          >
          <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">
            Keunggulan Penggunaan Harian
          </h2>
          <p class="text-[#637083] text-sm font-normal">
            Fitur inti dirancang untuk membantu tim finance bekerja lebih cepat,
            rapi, dan mudah diaudit.
          </p>
        </div>
        <!-- Grid 3 Kolom berisi 6 cards -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
        >
          <div
            v-for="(val, idx) in [
              {
                title: 'Data Terpusat',
                desc: 'Seluruh modul finance memakai sumber data yang saling terhubung untuk mengurangi input berulang.',
                icon: ShieldCheck,
                num: '01',
              },
              {
                title: 'Form Konsisten',
                desc: 'Setiap proses input memakai ukuran, label, dan pola interaksi yang seragam agar mudah dipelajari.',
                icon: Users,
                num: '02',
              },
              {
                title: 'Aksi Cepat',
                desc: 'Tombol aksi, tabel, filter, dan status dibuat jelas untuk mempercepat pekerjaan operasional harian.',
                icon: Award,
                num: '03',
              },
              {
                title: 'Monitoring Status',
                desc: 'Jatuh tempo invoice, vendor, pajak, payroll, dan proyek dapat dipantau dari tampilan ringkas.',
                icon: HelpCircle,
                num: '04',
              },
              {
                title: 'Tampilan Enterprise',
                desc: 'Visual navy, putih, dan abu-abu lembut menjaga aplikasi terasa formal dan nyaman dibaca.',
                icon: Lightbulb,
                num: '05',
              },
              {
                title: 'Siap Laporan',
                desc: 'Data yang dicatat langsung mendukung dashboard, proyeksi, dan ringkasan manajemen.',
                icon: Lock,
                num: '06',
              },
            ]"
            :key="idx"
            class="bg-[#EEF4FB] border border-[#D8E5F4]/60 border-l-4 border-l-[#102A56] hover:border-l-[#1E5AA8] rounded-r-2xl rounded-l-md p-6 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all group duration-300"
          >
            <div class="flex items-center justify-between">
              <div
                class="p-2.5 bg-white text-[#1E5AA8] rounded-xl shadow-sm group-hover:bg-[#1E5AA8] group-hover:text-white transition-colors duration-300"
              >
                <component :is="val.icon" class="w-5 h-5" />
              </div>
              <span class="text-xs text-[#D9AE27] font-mono font-bold">{{
                val.num
              }}</span>
            </div>
            <div class="space-y-1">
              <h4 class="font-bold text-base text-[#102A56]">
                {{ val.title }}
              </h4>
              <p class="text-[#637083] text-sm leading-relaxed font-normal">
                {{ val.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- SECTION SOLUSI KEDATA -->
    <section
      id="solusi"
      class="py-24 bg-[#EEF4FB] border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-16">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
            >KEUNGGULAN SISTEM</span
          >
          <h2
            class="text-3xl md:text-4xl font-bold text-[#102A56] tracking-tight leading-tight"
          >
            Keunggulan yang membuat workflow finance lebih terkendali
          </h2>
          <p class="text-[#637083] text-sm leading-relaxed font-normal">
            Setiap modul dibuat untuk keterbacaan data, konsistensi form,
            monitoring jatuh tempo, dan penyusunan laporan manajemen yang lebih
            siap pakai.
          </p>
        </div>
        <!-- Solution cards - 3 column grid -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
        >
          <div
            v-for="(sol, idx) in solutions"
            :key="idx"
            class="bg-white border border-[#D8E5F4] p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-[0_4px_20px_rgba(16,42,86,0.02)] hover:border-[#1E5AA8]/30 transition-all group hover:-translate-y-1 duration-300 h-full"
          >
            <div class="space-y-4">
              <div
                class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl inline-block shadow-sm group-hover:bg-[#1E5AA8] group-hover:text-white transition-colors duration-300"
              >
                <component :is="sol.icon" class="w-5 h-5" />
              </div>
              <h4 class="font-bold text-base text-[#102A56] tracking-tight">
                {{ sol.title }}
              </h4>
              <p class="text-[#637083] text-sm leading-relaxed font-normal">
                {{ sol.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- SECTION PRODUK KEDATA -->
    <section
      id="produk"
      class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-16">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
            >MODUL UTAMA</span
          >
          <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">
            Fitur Finstart untuk operasional perusahaan
          </h2>
          <p class="text-[#637083] text-sm font-normal">
            Modul inti yang membantu tim finance bekerja dari pencatatan
            transaksi sampai laporan manajemen.
          </p>
        </div>
        <!-- Kalkula Large Horizontal Card -->
        <div
          class="bg-white border border-[#D8E5F4] rounded-2xl shadow-[0_8px_30px_rgba(16,42,86,0.03)] overflow-hidden text-left max-w-6xl mx-auto"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12">
            <!-- Sisi Kiri: Text & Features -->
            <div
              class="lg:col-span-7 p-8 md:p-10 space-y-6 flex flex-col justify-between"
            >
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span
                    class="text-[10px] bg-[#EEF4FB] text-[#1E5AA8] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  >
                    Modul Utama
                  </span>
                </div>
                <h3
                  class="text-2xl md:text-3xl font-bold text-[#102A56] tracking-tight"
                >
                  {{ products[0].name }}
                </h3>
                <p class="text-[#1E5AA8] font-semibold text-sm">
                  {{ products[0].tagline }}
                </p>
                <p class="text-[#637083] text-sm leading-relaxed">
                  {{ products[0].desc }}
                </p>
                <div class="space-y-2 pt-2">
                  <span
                    class="text-xs font-bold uppercase tracking-wider text-[#102A56] block"
                    >Fitur yang tersedia:</span
                  >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div
                      v-for="(feature, fIdx) in products[0].features"
                      :key="fIdx"
                      class="flex items-start gap-2 text-xs text-[#637083]"
                    >
                      <Check
                        class="w-4 h-4 text-[#1E5AA8] shrink-0 mt-0.5"
                      /><span>{{ feature.title }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="pt-6 border-t border-[#D8E5F4] flex flex-wrap gap-4 items-center justify-between"
              >
                <button
                  class="inline-flex items-center justify-center bg-[#102A56] hover:bg-[#1E5AA8] text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-sm"
                  @click="updateSelectedProductIndex(0)"
                >
                  Lihat Produk</button
                ><span class="text-[10px] text-[#637083]/80 font-mono"
                  >INTEGRATED FINANCE WORKFLOW</span
                >
              </div>
            </div>
            <!-- Sisi Kanan: Abstract Dashboard mockup (No robot or futuristic AI slop) -->
            <div
              class="lg:col-span-5 bg-[#EEF4FB] p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-[#D8E5F4]"
            >
              <div
                class="w-full max-w-md bg-white border border-[#D8E5F4] rounded-xl p-5 shadow-sm space-y-4 text-left font-sans"
              >
                <div
                  class="flex items-center justify-between border-b border-[#D8E5F4] pb-3"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span class="text-xs font-bold text-[#102A56]"
                      >Finance Console Active</span
                    >
                  </div>
                  <span class="text-[10px] text-[#637083] font-mono"
                    >V.2.4</span
                  >
                </div>
                <!-- Mock Data Bars -->
                <div class="space-y-3">
                  <div>
                    <div
                      class="flex justify-between text-[10px] font-bold text-[#102A56] mb-1"
                    >
                      <span>Data Consistency</span><span>98.6%</span>
                    </div>
                    <div
                      class="w-full bg-[#EEF4FB] h-2 rounded-full overflow-hidden"
                    >
                      <div
                        class="bg-emerald-500 h-full rounded-full"
                        :style="{ width: '98.6%' }"
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      class="flex justify-between text-[10px] font-bold text-[#102A56] mb-1"
                    >
                      <span>Automation Speed</span><span>0.4s / Query</span>
                    </div>
                    <div
                      class="w-full bg-[#EEF4FB] h-2 rounded-full overflow-hidden"
                    >
                      <div
                        class="bg-[#1E5AA8] h-full rounded-full"
                        :style="{ width: '85%' }"
                      />
                    </div>
                  </div>
                </div>
                <!-- Miniature abstract chart mockup using SVGs -->
                <div class="pt-3 border-t border-[#D8E5F4]">
                  <span
                    class="text-[9px] font-bold text-[#637083] uppercase tracking-wider block mb-2"
                    >Data Flow Volume</span
                  >
                  <div
                    class="h-20 flex items-end gap-1 px-2 bg-[#EEF4FB]/50 rounded-lg p-2"
                  >
                    <div
                      class="bg-[#1E5AA8] w-full rounded-t-sm"
                      :style="{ height: '30%' }"
                    />
                    <div
                      class="bg-[#1E5AA8] w-full rounded-t-sm"
                      :style="{ height: '55%' }"
                    />
                    <div
                      class="bg-[#102A56] w-full rounded-t-sm"
                      :style="{ height: '45%' }"
                    />
                    <div
                      class="bg-[#1E5AA8] w-full rounded-t-sm"
                      :style="{ height: '70%' }"
                    />
                    <div
                      class="bg-[#D9AE27] w-full rounded-t-sm"
                      :style="{ height: '90%' }"
                    />
                    <div
                      class="bg-[#1E5AA8] w-full rounded-t-sm"
                      :style="{ height: '65%' }"
                    />
                    <div
                      class="bg-[#102A56] w-full rounded-t-sm"
                      :style="{ height: '80%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Other Products Grid -->
        <div class="space-y-6 max-w-6xl mx-auto pt-6">
          <h4
            class="font-bold text-lg text-[#102A56] text-left border-l-4 border-l-[#1E5AA8] pl-3"
          >
            Modul Pendukung Lainnya
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div
              v-for="pInfo in [
                {
                  index: 1,
                  label: 'CRM &amp; Project Control',
                  icon: Briefcase,
                },
                { index: 2, label: 'Accounting Core', icon: BookOpen },
                { index: 3, label: 'Receivable &amp; Payable', icon: FileText },
                {
                  index: 4,
                  label: 'Compliance &amp; Assets',
                  icon: ShieldCheck,
                },
              ]"
              :key="pInfo.index"
              class="bg-white border border-[#D8E5F4] rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(16,42,86,0.01)] hover:shadow-md hover:border-[#1E5AA8]/30 transition-all duration-300 h-full"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span
                    class="text-[10px] bg-[#EEF4FB] text-[#1E5AA8] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    >{{ pInfo.label }}</span
                  ><span
                    class="text-[9px] bg-[#D9AE27]/15 text-[#D9AE27] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    READY
                  </span>
                </div>
                <h4
                  class="font-bold text-lg text-[#102A56] flex items-center gap-2"
                >
                  {{ products[pInfo.index].name }}
                </h4>
                <p class="text-[#637083] text-sm leading-relaxed">
                  {{ products[pInfo.index].desc }}
                </p>
              </div>
              <div
                class="pt-6 border-t border-[#D8E5F4] mt-6 flex justify-between items-center"
              >
                <button
                  class="inline-flex items-center justify-center border border-[#1E5AA8] text-[#1E5AA8] hover:bg-[#EEF4FB] font-semibold text-xs py-2 px-4 rounded-lg transition-all cursor-pointer"
                  @click="updateSelectedProductIndex(pInfo.index)"
                >
                  Detail Produk</button
                ><span
                  class="text-[10px] text-[#637083] font-mono uppercase tracking-wider"
                  >Finance Module</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- SECTION INDUSTRI YANG DILAYANI -->
    <section
      id="industri"
      class="py-24 bg-[#EEF4FB] px-6 md:px-12 border-b border-[#D8E5F4] scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
            >CAKUPAN MODUL</span
          >
          <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">
            Fitur yang mencakup seluruh pekerjaan finance
          </h2>
          <p class="text-[#637083] text-sm font-normal">
            Modul dirancang untuk mendukung workflow harian tim finance dari
            pencatatan sampai pelaporan:
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-3.5 max-w-5xl mx-auto">
          <div
            v-for="(s, idx) in sectors"
            :key="idx"
            class="bg-white hover:bg-[#EEF4FB] border border-[#D8E5F4]/60 px-5 py-3 rounded-xl flex items-center gap-3 text-[#152238] transition-all text-xs font-bold shadow-sm"
          >
            <div class="p-1.5 bg-[#EEF4FB] text-[#1E5AA8] rounded-lg">
              <component :is="s.icon" :class="s.iconClass" />
            </div>
            <span>{{ s.name }}</span>
          </div>
        </div>
      </div>
    </section>
    <!-- SECTION MENGAPA MEMILIH KEDATA -->
    <section
      id="keunggulan"
      class="py-24 bg-[#102A56] text-white px-6 md:px-12 scroll-mt-10 relative overflow-hidden"
    >
      <div class="max-w-7xl mx-auto space-y-16 relative z-10">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#D9AE27] block"
            >KEUNGGULAN SISTEM</span
          >
          <h2 class="text-3xl font-bold text-white tracking-tight">
            Mengapa Finstart lebih rapi?
          </h2>
          <p class="text-[#EEF4FB]/80 text-sm font-normal">
            Keunggulan utama yang membantu tim finance bekerja lebih cepat,
            konsisten, dan siap laporan.
          </p>
        </div>
        <!-- Horizontal list of 5 reasons -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left"
        >
          <div
            v-for="(strength, idx) in keyStrengths"
            :key="idx"
            class="bg-[#0B1F42] border border-[#D8E5F4]/10 p-6 rounded-2xl flex flex-col justify-between space-y-5 hover:border-[#1E5AA8] transition-all duration-300 shadow-lg group h-full"
          >
            <div class="space-y-4">
              <div
                class="w-10 h-10 bg-white/10 group-hover:bg-[#1E5AA8]/20 text-[#D9AE27] rounded-xl flex items-center justify-center font-bold text-sm transition-colors border border-white/5"
              >
                0{{ idx + 1 }}
              </div>
              <h4
                class="font-bold text-base text-white tracking-tight leading-snug"
              >
                {{ strength.title }}
              </h4>
            </div>
            <p class="text-[#EEF4FB]/80 text-xs leading-relaxed font-normal">
              {{ strength.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- SECTION PROYEK UNGGULAN -->
    <section
      id="proyek"
      class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10"
    >
      <div class="max-w-7xl mx-auto space-y-16">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block"
            >CONTOH ALUR FITUR</span
          >
          <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">
            Workflow utama yang tersedia di Finstart
          </h2>
          <p class="text-[#637083] text-sm font-normal">
            Beberapa area kerja utama yang dapat langsung dipakai oleh tim
            finance internal.
          </p>
        </div>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
        >
          <div
            v-for="(proj, idx) in selectedProjects"
            :key="idx"
            class="bg-white border border-[#D8E5F4] rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(16,42,86,0.01)] flex flex-col justify-between hover:border-[#1E5AA8]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden group min-h-[300px]"
          >
            <div class="space-y-4 relative z-10">
              <div class="flex items-center justify-between">
                <span
                  class="text-[10px] bg-[#EEF4FB] text-[#1E5AA8] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  >{{ proj.category }}</span
                ><span class="text-xs text-[#637083] font-mono font-bold">{{
                  proj.year
                }}</span>
              </div>
              <h4
                class="text-lg font-bold text-[#102A56] tracking-tight leading-tight group-hover:text-[#1E5AA8] transition-colors"
              >
                {{ proj.title }}
              </h4>
              <p
                class="text-[#1E5AA8] text-xs font-bold uppercase tracking-wider"
              >
                Area: {{ proj.partner }}
              </p>
              <p class="text-[#637083] text-sm leading-relaxed font-normal">
                {{ proj.desc }}
              </p>
            </div>
            <div
              class="pt-6 relative z-10 border-t border-[#D8E5F4] mt-6 flex justify-end"
            >
              <button
                class="text-xs text-[#1E5AA8] hover:text-[#102A56] font-bold flex items-center gap-1.5 cursor-pointer hover:underline"
                @click="updateSelectedProjectDetailIndex(idx)"
              >
                Lihat Detail <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div class="text-center pt-4">
          <button
            id="btn-lihat-semua-proyek"
            class="inline-flex bg-[#102A56] hover:bg-[#1E5AA8] text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 text-xs tracking-wider items-center gap-2 cursor-pointer shadow-md"
            @click="updateIsProjectModalOpen(true)"
          >
            Lihat Semua Fitur <ExternalLink class="w-4 h-4 text-[#D9AE27]" />
          </button>
        </div>
      </div>
    </section>
    <!-- SECTION CTA FINSTART -->
    <section id="finance-cta" class="py-24 bg-white px-6 md:px-12 scroll-mt-10">
      <div
        class="max-w-6xl mx-auto bg-[#102A56] border border-white/10 text-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div
          class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 text-left"
        >
          <!-- Left Column: Text & CTA -->
          <div class="lg:col-span-7 space-y-6">
            <span
              class="text-[10px] text-[#D9AE27] uppercase font-bold tracking-widest block"
            >
              ENTERPRISE MANAGEMENT SYSTEM
            </span>
            <h3
              class="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight"
            >
              Kelola Keuangan Kedata dengan Lebih Cerdas
            </h3>
            <p class="text-[#EEF4FB]/85 text-sm leading-relaxed">
              Finstart membantu tim menghubungkan transaksi kas harian, proyek
              berjalan, data tagihan klien, pencatatan pengeluaran operasional,
              inventaris aset, administrasi perpajakan, dan laporan keuangan
              terstruktur langsung ke dalam satu sistem akuntansi terpadu.
            </p>
            <div class="pt-2">
              <button
                id="cta-masuk-finance"
                class="bg-white hover:bg-[#EEF4FB] text-[#102A56] font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-200 text-xs tracking-wider flex items-center gap-2 cursor-pointer border border-[#D8E5F4]"
                @click="openLogin"
              >
                Masuk ke Finstart <ArrowRight class="w-4 h-4 text-[#102A56]" />
              </button>
            </div>
          </div>
          <!-- Right Column: Miniature Dashboard Mockup -->
          <div class="lg:col-span-5">
            <div
              class="border border-white/10 bg-[#0B1F42] rounded-xl p-5 text-[11px] font-mono space-y-4 shadow-2xl relative"
            >
              <!-- Mock Header -->
              <div
                class="flex items-center justify-between border-b border-white/10 pb-2.5"
              >
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-red-500" /><span
                    class="w-2 h-2 rounded-full bg-[#D9AE27]"
                  /><span class="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span
                  class="text-slate-400 text-[8.5px] uppercase tracking-wider"
                  >FINSTART CONSOLE</span
                >
              </div>
              <!-- Dashboard grid -->
              <div class="grid grid-cols-2 gap-3">
                <!-- Kas Block -->
                <div
                  class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1"
                >
                  <span
                    class="text-slate-400 text-[8px] block uppercase font-bold"
                    >Bank &amp; Kas</span
                  ><span class="text-white font-bold text-xs block leading-none"
                    >Rp 4,27M</span
                  ><span class="text-[7.5px] text-[#EEF4FB]"
                    >Mandiri / BCA Synced</span
                  >
                </div>
                <!-- Proyek Block -->
                <div
                  class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1"
                >
                  <span
                    class="text-slate-400 text-[8px] block uppercase font-bold"
                    >Proyek Berjalan</span
                  ><span class="text-white font-bold text-xs block leading-none"
                    >12 Aktif</span
                  ><span class="text-[7.5px] text-emerald-400"
                    >ON SCHEDULE</span
                  >
                </div>
                <!-- Klien Block -->
                <div
                  class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1"
                >
                  <span
                    class="text-slate-400 text-[8px] block uppercase font-bold"
                    >Klien Terdaftar</span
                  ><span class="text-white font-bold text-xs block leading-none"
                    >34 Partner</span
                  ><span class="text-[7.5px] text-slate-300"
                    >Institusi &amp; Swasta</span
                  >
                </div>
                <!-- Profit Block -->
                <div
                  class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1"
                >
                  <span
                    class="text-slate-400 text-[8px] block uppercase font-bold"
                    >Net Profit YTD</span
                  ><span
                    class="text-emerald-400 font-bold text-xs block leading-none"
                    >+24.5%</span
                  ><span class="text-[7.5px] text-slate-300"
                    >Target Tercapai</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-white/10 mt-1"
              >
                <span>SYSTEM RUNNING STABLE</span
                ><span class="text-emerald-500">SECURED BY TLS 1.3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- FOOTER -->
    <footer
      id="kontak"
      class="bg-[#0B1F42] text-white border-t border-[#D8E5F4]/10 py-16 px-6 md:px-12 relative overflow-hidden"
    >
      <div
        class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10"
      >
        <!-- Brand Info -->
        <div class="lg:col-span-4 space-y-4 text-left">
          <div class="flex items-center gap-2.5">
            <KedataLogo :size="30" class="shrink-0" />
            <div>
              <span class="font-bold text-lg tracking-wider block">KEDATA</span
              ><span
                class="text-[8px] text-blue-400 block font-bold uppercase leading-3"
                >Indonesia Digital</span
              >
            </div>
          </div>
          <p
            class="text-slate-300 text-[12px] leading-relaxed max-w-sm font-normal"
          >
            PT Kedata Indonesia Digital menghadirkan solusi teknologi cerdas dan
            tata kelola data terstruktur untuk membantu organisasi
            bertransformasi, mengambil keputusan yang lebih baik, serta tumbuh
            melalui teknologi yang relevan dan terukur.
          </p>
          <div class="flex items-center gap-3 pt-2">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              class="p-2 bg-[#102A56] hover:bg-[#1E5AA8] text-slate-300 hover:text-white rounded-lg transition-colors border border-white/10 cursor-pointer"
              ><Linkedin class="w-4 h-4"
            /></a>
          </div>
        </div>
        <!-- Contact Details -->
        <div class="lg:col-span-4 space-y-4 text-left">
          <h4 class="font-bold text-xs uppercase tracking-wider text-white">
            Hubungi Kami
          </h4>
          <div class="text-sm text-slate-300 space-y-3 font-normal">
            <div class="flex items-center gap-2.5">
              <Mail class="w-4 h-4 text-blue-400 shrink-0" /><span
                class="font-mono"
                >business@kedata.online</span
              >
            </div>
            <div class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-blue-400 shrink-0" /><span
                class="font-mono"
                >+62 819-4411-2358</span
              >
            </div>
            <div class="flex items-center gap-2.5">
              <Building class="w-4 h-4 text-blue-400 shrink-0" /><span
                >www.kedata.online</span
              >
            </div>
          </div>
        </div>
        <!-- Address details -->
        <div class="lg:col-span-4 space-y-4 text-left">
          <h4 class="font-bold text-xs uppercase tracking-wider text-white">
            Lokasi Kantor
          </h4>
          <div
            class="text-sm text-slate-300 flex items-start gap-2.5 leading-relaxed font-normal"
          >
            <MapPin class="w-5 h-5 text-blue-400 shrink-0 mt-0.5" /><span>
              Pakuwon Mall Jogja, 3rd Floor, Kaliwaru, Condongcatur, Depok
              District, Sleman Regency, Special Region of Yogyakarta
            </span>
          </div>
        </div>
      </div>
      <div
        class="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 text-center text-[10px] text-slate-400 font-medium"
      >
        © 2026 PT Kedata Indonesia Digital. All Rights Reserved.
      </div>
    </footer>
    <!-- DETIL PRODUK MODAL -->
    <div
      v-if="selectedProductIndex !== null"
      class="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50 p-4 backdrop-blur-md"
    >
      <div
        class="relative w-full max-w-3xl max-h-[calc(100vh-64px)] h-[calc(100vh-64px)] overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.18)]"
      >
        <div
          class="absolute -top-8 left-1/2 h-20 w-80 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400/30 via-cyan-300/20 to-indigo-500/20 blur-3xl"
        />
        <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
          <div
            class="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B1F4A] text-white lg:p-8"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-extrabold text-2xl lg:text-3xl tracking-tight">
                  {{ products[selectedProductIndex].name }}
                </h3>
                <p
                  class="mt-2 text-sm lg:text-base text-slate-300 uppercase tracking-[0.28em] font-semibold"
                >
                  {{ products[selectedProductIndex].tagline }}
                </p>
              </div>
              <button
                class="rounded-2xl border border-white/20 bg-white/10 px-3.5 py-3 text-white transition hover:border-white/40 hover:bg-white/15"
                aria-label="Tutup detail produk"
                @click="updateSelectedProductIndex(null)"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div class="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8">
              <div
                class="grid gap-8 lg:grid-cols-[1.45fr_0.95fr] text-slate-700"
              >
                <section class="space-y-6">
                  <div class="space-y-4">
                    <h4
                      class="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold"
                    >
                      Deskripsi Produk
                    </h4>
                    <p class="text-sm lg:text-base leading-7 text-slate-600">
                      {{ products[selectedProductIndex].desc }}
                    </p>
                  </div>
                  <div class="space-y-4">
                    <h4
                      class="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold"
                    >
                      Fitur Utama
                    </h4>
                    <ul class="space-y-3 text-sm lg:text-base">
                      <li
                        v-for="(f, fIdx) in products[selectedProductIndex]
                          .features"
                        :key="fIdx"
                        class="flex gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 leading-6 shadow-sm"
                      >
                        <span
                          class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"
                        /><span class="text-slate-700">{{ f.title }}</span>
                      </li>
                    </ul>
                  </div>
                </section>
                <aside class="space-y-6">
                  <div
                    class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <div
                      class="mb-5 rounded-3xl bg-gradient-to-br from-[#0B1F4A] via-slate-900 to-slate-800 p-5 text-white shadow-lg"
                    >
                      <p
                        class="text-xs uppercase tracking-[0.32em] text-sky-300"
                      >
                        Highlight Fitur
                      </p>
                      <h4 class="mt-3 text-xl font-bold">
                        Finance Control Center
                      </h4>
                      <p class="mt-3 text-sm leading-6 text-slate-200">
                        Ringkas semua metrik finance internal dengan dashboard
                        eksekutif, proyeksi, dan compliance dalam satu tampilan
                        kelas enterprise.
                      </p>
                    </div>
                    <div class="space-y-4 text-sm text-slate-600">
                      <div
                        class="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                      >
                        <p class="font-semibold text-slate-800">
                          Dashboard eksekutif
                        </p>
                        <p class="mt-2 text-slate-500">
                          Kas, piutang, utang, pajak, payroll, dan proyek semua
                          dapat dipantau bersama.
                        </p>
                      </div>
                      <div
                        class="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                      >
                        <p class="font-semibold text-slate-800">
                          Proyeksi dan laporan
                        </p>
                        <p class="mt-2 text-slate-500">
                          Target bisnis lebih mudah diikuti dengan laporan siap
                          presentasi dan insight KPI.
                        </p>
                      </div>
                      <div
                        class="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                      >
                        <p class="font-semibold text-slate-800">
                          Kontrol operasional
                        </p>
                        <p class="mt-2 text-slate-500">
                          Sistem dirancang untuk proses finansial yang rapi,
                          jelas, dan mudah diaudit.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p class="text-sm text-slate-500">
              Popup diperbesar untuk pengalaman yang lebih premium dengan tata
              letak layar lebar dan aksen visual modern.
            </p>
          </div>
          <button
            class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#122c5f]"
            @click="updateSelectedProductIndex(null)"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
    <!-- ALL FEATURES FULLSCREEN MODAL -->
    <div
      v-if="isProjectModalOpen"
      class="fixed inset-0 bg-slate-950/80 flex items-stretch justify-center z-50 overflow-y-auto"
    >
      <div class="relative w-full h-full bg-white rounded-none overflow-hidden">
        <div
          class="p-6 md:p-8 bg-[#0B1F4A] text-white flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="font-extrabold text-2xl md:text-3xl">
              Semua Fitur Finstart
            </h3>
            <p class="mt-2 max-w-2xl text-sm text-slate-200">
              Pilih modul untuk melihat fungsi utamanya dan detail fitur lengkap
              yang tersedia di website.
            </p>
          </div>
          <button
            class="text-slate-300 hover:text-white p-3 bg-white/10 rounded-2xl transition hover:bg-white/15"
            aria-label="Tutup modal fitur"
            @click="updateIsProjectModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div
          class="px-6 pb-8 md:px-8 md:pb-10 overflow-y-auto h-[calc(100vh-112px)]"
        >
          <div class="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
            <div
              v-for="(product, idx) in products"
              :key="idx"
              class="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:shadow-lg"
            >
              <span
                class="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-semibold"
                >{{ product.name }}</span
              >
              <h4 class="mt-3 text-lg font-bold text-slate-900">
                {{ product.tagline }}
              </h4>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ product.desc }}
              </p>
              <div
                class="mt-4 rounded-3xl border border-slate-200 bg-white p-4"
              >
                <p
                  class="text-[10px] uppercase tracking-[0.24em] font-semibold text-slate-500"
                >
                  Contoh fitur
                </p>
                <ul class="mt-3 space-y-2 text-sm text-slate-600">
                  <li
                    v-for="(feature, fIdx) in product.features.slice(0, 3)"
                    :key="fIdx"
                    class="flex gap-3 items-start"
                  >
                    <span
                      class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"
                    /><span>{{ feature.title }}</span>
                  </li>
                </ul>
              </div>
              <div class="mt-6 flex items-center justify-between gap-3">
                <span class="text-xs text-slate-500"
                  >Lihat detail fitur lengkap</span
                ><button
                  class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#122c5f]"
                  @click="updateSelectedFeatureDetailIndex(idx)"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="selectedProjectDetailIndex !== null"
      class="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-3xl h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]"
      >
        <div
          class="p-6 md:p-8 bg-gradient-to-r from-[#102A56] to-[#0B1F4A] text-white flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div>
            <h3 class="text-2xl font-extrabold">
              {{ selectedProjects[selectedProjectDetailIndex].title }}
            </h3>
            <p class="mt-2 text-sm text-slate-200 max-w-2xl">
              {{ selectedProjects[selectedProjectDetailIndex].partner }}
            </p>
          </div>
          <button
            class="text-slate-300 hover:text-white p-3 bg-white/10 rounded-2xl transition hover:bg-white/15"
            aria-label="Tutup detail proyek"
            @click="updateSelectedProjectDetailIndex(null)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="h-full overflow-y-auto p-6 md:p-8">
          <div
            class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm"
          >
            <h4 class="text-lg font-semibold text-slate-900">
              Detail Fitur Kartu
            </h4>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ selectedProjects[selectedProjectDetailIndex].desc }}
            </p>
          </div>
          <div class="mt-6 grid gap-4">
            <div
              v-for="(item, itemIdx) in selectedProjects[
                selectedProjectDetailIndex
              ].highlights"
              :key="itemIdx"
              class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p class="text-sm font-semibold text-slate-900">{{ item }}</p>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-200 bg-white p-5 flex justify-end">
          <button
            class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#122c5f]"
            @click="updateSelectedProjectDetailIndex(null)"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="selectedFeatureDetailIndex !== null"
      class="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-3xl h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]"
      >
        <div
          class="p-6 md:p-8 bg-gradient-to-r from-[#102A56] to-[#0B1F4A] text-white flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div>
            <h3 class="text-2xl font-extrabold">
              {{ products[selectedFeatureDetailIndex].name }}
            </h3>
            <p class="mt-2 text-sm text-slate-200 max-w-2xl">
              {{ products[selectedFeatureDetailIndex].tagline }}
            </p>
          </div>
          <button
            class="text-slate-300 hover:text-white p-3 bg-white/10 rounded-2xl transition hover:bg-white/15"
            aria-label="Tutup detail fitur"
            @click="updateSelectedFeatureDetailIndex(null)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="h-full overflow-y-auto p-6 md:p-8">
          <div
            class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm"
          >
            <h4 class="text-lg font-semibold text-slate-900">
              Tentang modul ini
            </h4>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ products[selectedFeatureDetailIndex].desc }}
            </p>
          </div>
          <div class="mt-6 grid gap-4">
            <div
              v-for="(feature, fIdx) in products[selectedFeatureDetailIndex]
                .features"
              :key="fIdx"
              class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p class="text-sm font-semibold text-slate-900">
                {{ feature.title }}
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ feature.detail }}
              </p>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-200 bg-white p-5 flex justify-end">
          <button
            class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#122c5f]"
            @click="updateSelectedFeatureDetailIndex(null)"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  ArrowRight,
  Cpu,
  Database,
  FileText,
  Shield,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Award,
  Lock,
  Server,
  TrendingUp,
  Landmark,
  Truck,
  Zap,
  ShieldCheck,
  Check,
  X,
  Lightbulb,
  Workflow,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Users,
  Calendar,
  Building,
  BookOpen,
} from "lucide-vue-next";
import KedataLogo from "./KedataLogo.vue";
const emit = defineEmits(["login"]);

function openLogin() {
  emit("login");
}
const isProjectModalOpen = ref(false),
  updateIsProjectModalOpen = (next) => (isProjectModalOpen.value = next);
const selectedProductIndex = ref(null),
  updateSelectedProductIndex = (next) => (selectedProductIndex.value = next);
const selectedFeatureDetailIndex = ref(null),
  updateSelectedFeatureDetailIndex = (next) =>
    (selectedFeatureDetailIndex.value = next);
const selectedProjectDetailIndex = ref(null),
  updateSelectedProjectDetailIndex = (next) =>
    (selectedProjectDetailIndex.value = next); // Curved Rotating Carousel State
const activeClientIndex = ref(0),
  updateActiveClientIndex = (next) => (activeClientIndex.value = next);
// Smooth scroll handler
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

// Carousel Items representing the real clients from Gambar 3
const clientCarouselItems = [
  {
    id: 1,
    logoId: 4,
    // Duke-NUS
    clientName: "Duke-NUS Medical School",
    title: "PathGen AI Platform",
    desc: "Mengembangkan PathGen AI, platform genomik patogen untuk mendukung keputusan kesehatan publik.",
    metric: "Sequencing Genomik",
    status: "COMPLETED",
    metricLabel: "Fokus Proyek",
    metricValue: "Genomik Patogen",
  },
  {
    id: 2,
    logoId: 3,
    // PBNU
    clientName: "PBNU",
    title: "Digdaya Dashboard",
    desc: "Membuat Digdaya Dashboard untuk monitoring dan evaluasi implementasi surat digital.",
    metric: "Monev Tracker",
    status: "DEPLOYED",
    metricLabel: "Integrasi",
    metricValue: "Surat Digital",
  },
  {
    id: 3,
    logoId: 3,
    // PBNU
    clientName: "PBNU",
    title: "Digdaya AI Assistant",
    desc: "Membuat Digdaya AI, asisten AI untuk menjawab pertanyaan organisasi dan membantu pekerjaan pengurus.",
    metric: "AI Chatbot",
    status: "ACTIVE SYNC",
    metricLabel: "Platform",
    metricValue: "Asisten Pintar",
  },
  {
    id: 4,
    logoId: 3,
    // PBNU
    clientName: "PBNU",
    title: "Digdaya Kader Platform",
    desc: "Membuat platform Digdaya Kader untuk registrasi, pendataan, pelatihan, dan sertifikasi kader.",
    metric: "Database Kader",
    status: "LIVE SYSTEM",
    metricLabel: "Registrasi",
    metricValue: "Kader Nasional",
  },
  {
    id: 5,
    logoId: 11,
    // Allam Medica
    clientName: "Allam Medica Hospital",
    title: "Hospital Network Consultation",
    desc: "Konsultasi dan peningkatan infrastruktur serta arsitektur jaringan rumah sakit secara komprehensif.",
    metric: "Arsitektur Jaringan",
    status: "VERIFIED",
    metricLabel: "SIMRS & Network",
    metricValue: "Allam Medica",
  },
  {
    id: 6,
    logoId: 12,
    // Inspirasien
    clientName: "PT Inspirasien Srikandi Indonesia",
    title: "Patient Companion App",
    desc: "Mengembangkan aplikasi mobile pendamping pasien penyakit kronis, psikiater, dan survivor.",
    metric: "Aplikasi Mobile",
    status: "ACTIVE SYNC",
    metricLabel: "Fokus",
    metricValue: "Pasien & Survivor",
  },
  {
    id: 7,
    logoId: 13,
    // Tamtech
    clientName: "Tamtech",
    title: "IT Infrastructure Monitoring",
    desc: "Mengembangkan sistem monitoring infrastruktur IT rumah sakit secara real-time.",
    metric: "Real-time Monitoring",
    status: "RUNNING",
    metricLabel: "Sistem",
    metricValue: "SIMRS Network",
  },
  {
    id: 8,
    logoId: 13,
    // Tamtech
    clientName: "Tamtech",
    title: "SIMRS Tech Audit",
    desc: "Audit teknologi dan konsultasi strategi pengembangan aplikasi SIMRS-TAMTECH.",
    metric: "Rekomendasi Audit",
    status: "COMPLETED",
    metricLabel: "Audit",
    metricValue: "SIMRS-TAMTECH",
  },
  {
    id: 9,
    logoId: 14,
    // RSA UGM
    clientName: "RSA UGM",
    title: "BPJS AI Verification",
    desc: "Membuat sistem verifikasi BPJS berbasis AI untuk Rumah Sakit Akademik UGM.",
    metric: "Auto-Verification",
    status: "ACTIVE SYNC",
    metricLabel: "Sasaran",
    metricValue: "Klaim BPJS",
  },
  {
    id: 10,
    logoId: 15,
    // OIKN
    clientName: "OIKN",
    title: "IKN Smart Health Mobile",
    desc: "Mengembangkan aplikasi IKN Smart Health Mobile: registrasi fasilitas kesehatan, telemedicine, farmasi, home care, dan laboratorium.",
    metric: "Nusantara Mobile",
    status: "LIVE SYSTEM",
    metricLabel: "Layanan",
    metricValue: "Telemedicine",
  },
  {
    id: 11,
    logoId: 15,
    // OIKN
    clientName: "OIKN",
    title: "Nusantara Control Command",
    desc: "Mengembangkan sistem Integrated Control Command Center untuk Nusantara Smart City.",
    metric: "Command Center",
    status: "DEPLOYED",
    metricLabel: "Smart City",
    metricValue: "Nusantara Control",
  },
  {
    id: 12,
    logoId: 1,
    // Kemenkes
    clientName: "Kementerian Kesehatan",
    title: "Material Transfer Agreement",
    desc: "Mengembangkan sistem Material Transfer Agreement (MTA) untuk pencatatan transfer material biologis.",
    metric: "Biosecurity Data",
    status: "ACTIVE SYNC",
    metricLabel: "Registrasi",
    metricValue: "MTA Data",
  },
  {
    id: 13,
    logoId: 1,
    // Kemenkes
    clientName: "Kementerian Kesehatan",
    title: "National Bioregistry System",
    desc: "Mengembangkan modul National Registry pada sistem Bioregistry Kementerian Kesehatan.",
    metric: "National Registry",
    status: "DEPLOYED",
    metricLabel: "Database",
    metricValue: "Bioregistry",
  },
  {
    id: 14,
    logoId: 1,
    // Kemenkes
    clientName: "Kementerian Kesehatan",
    title: "FHIR SATUSEHAT Sync",
    desc: "Integrasi data pasien Kemedis dengan standar FHIR agar terhubung ke platform SATUSEHAT.",
    metric: "SATUSEHAT Sync",
    status: "ACTIVE SYNC",
    metricLabel: "Integrasi",
    metricValue: "HL7 FHIR API",
  },
  {
    id: 15,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "RPMKAL 2 SINKAL Module",
    desc: "Mengembangkan fitur RPMKAL 2 pada Sistem Informasi Kalurahan/SINKAL DIY.",
    metric: "SINKAL Module",
    status: "LIVE SYSTEM",
    metricLabel: "Aplikasi",
    metricValue: "SINKAL DIY",
  },
  {
    id: 16,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "Peladi Makerti SINKAL",
    desc: "Mengembangkan fitur Peladi Makerti dalam SINKAL untuk integrasi data kependudukan dan sosial.",
    metric: "Peladi Makerti",
    status: "ACTIVE SYNC",
    metricLabel: "Sistem",
    metricValue: "SINKAL DIY",
  },
  {
    id: 17,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "RPMKAL 1 Action Plan",
    desc: "Mengembangkan fitur RPMKAL 1 untuk rencana aksi dan pelacakan capaian tujuan desa.",
    metric: "Monev Desa",
    status: "DEPLOYED",
    metricLabel: "Fokus",
    metricValue: "Rencana Aksi",
  },
  {
    id: 18,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "e-SAKIP Akuntabilitas ASN",
    desc: "Meningkatkan aplikasi e-SAKIP untuk akuntabilitas kinerja instansi pemerintah daerah DIY.",
    metric: "Performance Track",
    status: "VERIFIED",
    metricLabel: "Sistem",
    metricValue: "e-SAKIP DIY",
  },
  {
    id: 19,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "Sistem Informasi Jagawarga",
    desc: "Mengembangkan Sistem Informasi Jagawarga untuk mendukung keamanan, ketertiban, dan kesejahteraan masyarakat.",
    metric: "Keamanan Warga",
    status: "LIVE SYSTEM",
    metricLabel: "Aplikasi",
    metricValue: "Jagawarga",
  },
  {
    id: 20,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "SINKAL DIY Roadmap Study",
    desc: "Studi roadmap Sistem Informasi Kalurahan komprehensif untuk seluruh wilayah DIY.",
    metric: "Studi Roadmap",
    status: "COMPLETED",
    metricLabel: "Output",
    metricValue: "Roadmap Study",
  },
  {
    id: 21,
    logoId: 8,
    // WHO
    clientName: "World Health Organization",
    title: "Clinical Bioregistry Platform",
    desc: "Mengembangkan platform clinical registry untuk mengelola data bioregistry Kementerian Kesehatan.",
    metric: "Clinical Registry",
    status: "DEPLOYED",
    metricLabel: "Standard",
    metricValue: "WHO Database",
  },
  {
    id: 22,
    logoId: 6,
    // Astra
    clientName: "Astra Internasional",
    title: "Facebook Sentiment Analysis",
    desc: "Analisis media sosial Facebook untuk mendapatkan insight produk secara akurat.",
    metric: "Sentiment Insight",
    status: "COMPLETED",
    metricLabel: "Kanal",
    metricValue: "Facebook API",
  },
  {
    id: 23,
    logoId: 6,
    // Astra
    clientName: "Astra Internasional",
    title: "Social Media Monitoring",
    desc: "Social media monitoring real-time dan laporan analitik percakapan media sosial.",
    metric: "Real-time Tracker",
    status: "RUNNING",
    metricLabel: "Brand",
    metricValue: "Social Monitor",
  },
  {
    id: 24,
    logoId: 17,
    // UNDP
    clientName: "UNDP",
    title: "One Health Dashboard",
    desc: "Mengembangkan dashboard One Health dan arsitektur data Kemenkes untuk akses publik maupun privat.",
    metric: "One Health Portal",
    status: "DEPLOYED",
    metricLabel: "Integrasi",
    metricValue: "UNDP & Kemenkes",
  },
  {
    id: 25,
    logoId: 18,
    // PT Symbolic
    clientName: "PT Symbolic",
    title: "NLP Abstractive Summary",
    desc: "Mengembangkan model machine learning untuk ringkasan teks abstraktif Bahasa Indonesia dan Inggris.",
    metric: "LLM Abstractive",
    status: "VERIFIED",
    metricLabel: "Teknologi",
    metricValue: "NLP Modeling",
  },
  {
    id: 26,
    logoId: 19,
    // DPR RI
    clientName: "DPR RI",
    title: "Setjen DPR RI Front-End",
    desc: "Mengembangkan front-end website Sekretariat Jenderal DPR RI dengan Bootstrap dan HTML.",
    metric: "Bootstrap Web",
    status: "COMPLETED",
    metricLabel: "Platform",
    metricValue: "Front-End Portal",
  },
  {
    id: 27,
    logoId: 19,
    // DPR RI
    clientName: "DPR RI",
    title: "DPR RI Portal Redesign",
    desc: "Redesign website DPR RI menggunakan Next.js, multi-theme, serta aksesibilitas untuk disabilitas.",
    metric: "Next.js Portal",
    status: "ACTIVE SYNC",
    metricLabel: "Aksesibilitas",
    metricValue: "Disabilitas Ready",
  },
  {
    id: 28,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "SINKAL Technical Training",
    desc: "Pelatihan penggunaan aplikasi dan persiapan data untuk implementasi SINKAL DIY.",
    metric: "ASN Capability",
    status: "COMPLETED",
    metricLabel: "Fokus",
    metricValue: "Pelatihan SINKAL",
  },
  {
    id: 29,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem",
    title: "SIDAKAL DIY Integration",
    desc: "Mengembangkan SIDAKAL untuk integrasi data monografi dan portal desa di DIY.",
    metric: "Portal Integrasi",
    status: "LIVE SYSTEM",
    metricLabel: "Database",
    metricValue: "SIDAKAL Portal",
  },
  {
    id: 30,
    logoId: 6,
    // Astra
    clientName: "Astra Internasional",
    title: "Product Insight Monitor",
    desc: "Social media monitoring real-time dan penyusunan laporan insight produk secara terstruktur.",
    metric: "Insight Laporan",
    status: "COMPLETED",
    metricLabel: "Jenis",
    metricValue: "Product Insight",
  },
  {
    id: 31,
    logoId: 1,
    // Kemenlu (using fallback/general blue style of health)
    clientName: "Kementerian Luar Negeri",
    title: "ASEAN Vaccine Verification",
    desc: "Mengembangkan aplikasi verifikasi sertifikat vaksin internasional ASEAN.",
    metric: "Vaccine Verifier",
    status: "DEPLOYED",
    metricLabel: "Cakupan",
    metricValue: "ASEAN Countries",
  },
  {
    id: 32,
    logoId: 20,
    // BKPSDM
    clientName: "BKPSDM Kota Yogyakarta",
    title: "Satu Data Indonesia",
    desc: "Pelatihan implementasi Satu Data Indonesia untuk ASN Pemerintah Kota Yogyakarta.",
    metric: "Satu Data Indonesia",
    status: "COMPLETED",
    metricLabel: "Jenis",
    metricValue: "Pelatihan ASN",
  },
  {
    id: 33,
    logoId: 21,
    // Pertagas
    clientName: "Pertagas",
    title: "Financial Power BI System",
    desc: "Mengembangkan dashboard keuangan menggunakan Power BI untuk data anak perusahaan.",
    metric: "Power BI Sync",
    status: "LIVE SYSTEM",
    metricLabel: "Analisis",
    metricValue: "Financial Tracker",
  },
  {
    id: 34,
    logoId: 22,
    // Mercy Corps
    clientName: "Mercy Corps–BNPB",
    title: "Disaster Data Interoperability",
    desc: "Mengembangkan portal interoperabilitas dan publikasi data bencana melalui API.",
    metric: "Disaster API",
    status: "ACTIVE SYNC",
    metricLabel: "Integrasi",
    metricValue: "Interoperabilitas",
  },
  {
    id: 35,
    logoId: 16,
    // Biro Tapem
    clientName: "Biro Tapem DIY",
    title: "SINKAL Research & Dev",
    desc: "Riset dan pengembangan Sistem Informasi Kalurahan/SINKAL di empat kabupaten DIY.",
    metric: "SINKAL Research",
    status: "COMPLETED",
    metricLabel: "Cakupan",
    metricValue: "4 Kabupaten DIY",
  },
  {
    id: 36,
    logoId: 1,
    // Kemenkes
    clientName: "Kementerian Kesehatan",
    title: "SPBE Enterprise Architecture",
    desc: "Menyusun Enterprise Architecture untuk SPBE dan transformasi teknologi SDM kesehatan.",
    metric: "SPBE Architecture",
    status: "DEPLOYED",
    metricLabel: "Arsitektur",
    metricValue: "EA SDM Kesehatan",
  },
  {
    id: 37,
    logoId: 26,
    // Tubaba
    clientName: "Pemerintah Daerah Tubaba",
    title: "Tubaba Smart City Portal",
    desc: "Mengembangkan portal Tubaba Smart City sebagai ekosistem digital pemerintah dan masyarakat.",
    metric: "Smart City",
    status: "LIVE SYSTEM",
    metricLabel: "Portal",
    metricValue: "Tubaba Smart City",
  },
  {
    id: 38,
    logoId: 7,
    // Tanoto
    clientName: "Tanoto Foundation",
    title: "IKK LAN Evaluation System",
    desc: "Mengembangkan sistem Indeks Kualitas Kebijakan LAN untuk pengumpulan data dan evaluasi otomatis.",
    metric: "IKK LAN Engine",
    status: "VERIFIED",
    metricLabel: "Sistem",
    metricValue: "Monev Kebijakan",
  },
  {
    id: 39,
    logoId: 1,
    // Kemenkes
    clientName: "Kementerian Kesehatan",
    title: "SILACAK 3.0 Interface",
    desc: "Mengembangkan antarmuka SILACAK versi 3.0 dengan Vue.js dan integrasi backend lama berbasis standar DHIS.",
    metric: "SILACAK Vue.js",
    status: "DEPLOYED",
    metricLabel: "Aplikasi",
    metricValue: "SILACAK 3.0 UI",
  },
  {
    id: 40,
    logoId: 10,
    // BNN
    clientName: "BNN",
    title: "Social Media Monitoring",
    desc: "Social media monitoring dengan dashboard interaktif dan laporan insight wilayah/objek tertentu.",
    metric: "Geospatial Insight",
    status: "RUNNING",
    metricLabel: "Analisis",
    metricValue: "Sentimen Wilayah",
  },
  {
    id: 41,
    logoId: 2,
    // Pertamina
    clientName: "Pertamina",
    title: "Brand Perception Monitor",
    desc: "Social media monitoring dengan laporan insight media sosial dan media online.",
    metric: "Online Media Sync",
    status: "RUNNING",
    metricLabel: "Fokus",
    metricValue: "Brand Sentiment",
  },
  {
    id: 42,
    logoId: 9,
    // KPK
    clientName: "KPK",
    title: "Bansos DTKS Mapping",
    desc: "Integrasi, kategorisasi, dan pemetaan data bantuan sosial DTKS untuk transparansi distribusi bansos.",
    metric: "Anti-Fraud Data",
    status: "VERIFIED",
    metricLabel: "Fokus",
    metricValue: "Transparansi Bansos",
  },
  {
    id: 43,
    logoId: 23,
    // PDIP
    clientName: "PDIP",
    title: "Social Issue Monitoring",
    desc: "Social media monitoring dan laporan insight isu tertentu dari media sosial serta media online.",
    metric: "Topic Modeling",
    status: "RUNNING",
    metricLabel: "Fokus",
    metricValue: "Monitoring Isu",
  },
  {
    id: 44,
    logoId: 16,
    // Kepatihan DIY (using Biro Tapem style)
    clientName: "Kepatihan DIY",
    title: "Social Aid Data Processing",
    desc: "Pengelolaan dan pemrosesan data bantuan sosial agar valid, tidak duplikat, dan sesuai kondisi survei lapangan.",
    metric: "Validasi Lapangan",
    status: "VERIFIED",
    metricLabel: "Sasaran",
    metricValue: "Data Bansos",
  },
  {
    id: 45,
    logoId: 16,
    // Dinas Kominfo DIY
    clientName: "Dinas Kominfo DIY",
    title: "Bansos Preprocessing",
    desc: "Integrasi dan preprocessing data bantuan sosial agar valid, tidak duplikat, dan akurat.",
    metric: "Data Consistency",
    status: "ACTIVE SYNC",
    metricLabel: "Fokus",
    metricValue: "Preprocessing Bansos",
  },
  {
    id: 46,
    logoId: 25,
    // Pemda Kalbar
    clientName: "Pemerintah Provinsi Kalimantan Barat",
    title: "Regional Analytics Dashboard",
    desc: "Mengembangkan dashboard analitik media sosial untuk memantau sentimen publik dan tren kebijakan daerah.",
    metric: "Public Sentiment",
    status: "LIVE SYSTEM",
    metricLabel: "Cakupan",
    metricValue: "Provinsi Kalbar",
  },
  {
    id: 47,
    logoId: 24,
    // PKB
    clientName: "Partai Kebangkitan Bangsa",
    title: "PKB Data API Monitor",
    desc: "Mengembangkan API social media monitoring untuk akuisisi, distribusi, dan integrasi data ke aplikasi lain.",
    metric: "Real-time API Link",
    status: "DEPLOYED",
    metricLabel: "Sistem",
    metricValue: "API Integrator",
  },
];
void clientCarouselItems;
const financeCarouselItems = [
  {
    id: 1,
    icon: BarChart3,
    iconClass: "w-12 h-12",
    clientName: "Dashboard CFO",
    title: "Ringkasan Kinerja Finance",
    desc: "Pantau kas, profit margin, proyek berjalan, invoice jatuh tempo, burn rate, dan insight keuangan.",
    metric: "Live KPI",
    status: "CORE MODULE",
    metricLabel: "Output",
    metricValue: "Executive View",
  },
  {
    id: 2,
    icon: Briefcase,
    iconClass: "w-12 h-12",
    clientName: "CRM & Proyek",
    title: "Lifecycle Proyek dan Klien",
    desc: "Inisiasi proyek, target kontrak, tipe tender, status proyek, alokasi tim, dan data klien partner.",
    metric: "Project Flow",
    status: "ACTIVE",
    metricLabel: "Fokus",
    metricValue: "Proyek & Klien",
  },
  {
    id: 3,
    icon: BookOpen,
    iconClass: "w-12 h-12",
    clientName: "Buku Besar",
    title: "Master Akun dan Saldo",
    desc: "Struktur akun GL, tipe akun, saldo, dan dasar laporan keuangan tersimpan secara rapi.",
    metric: "GL Ready",
    status: "ACCOUNTING",
    metricLabel: "Fokus",
    metricValue: "Akun & Saldo",
  },
  {
    id: 4,
    icon: Workflow,
    iconClass: "w-12 h-12",
    clientName: "Transaksi",
    title: "Jurnal Debit Kredit",
    desc: "Catat jurnal transaksi dengan validasi debit-kredit, template cepat, dan riwayat yang mudah diperiksa.",
    metric: "Balanced",
    status: "CONTROL",
    metricLabel: "Fokus",
    metricValue: "Jurnal",
  },
  {
    id: 5,
    icon: FileText,
    iconClass: "w-12 h-12",
    clientName: "Piutang",
    title: "Invoice dan Pelunasan",
    desc: "Kelola invoice klien, tanggal jatuh tempo, status pembayaran, overdue, dan catat pelunasan piutang.",
    metric: "A/R",
    status: "BILLING",
    metricLabel: "Fokus",
    metricValue: "Invoice Klien",
  },
  {
    id: 6,
    icon: Truck,
    iconClass: "w-12 h-12",
    clientName: "Utang Vendor",
    title: "Tagihan dan Pembayaran",
    desc: "Input tagihan vendor, bukti bayar, sumber kas, tanggal bayar, dan riwayat pembayaran vendor.",
    metric: "A/P",
    status: "PAYABLE",
    metricLabel: "Fokus",
    metricValue: "Vendor",
  },
  {
    id: 7,
    icon: Landmark,
    iconClass: "w-12 h-12",
    clientName: "Perpajakan",
    title: "PPN, PPh, dan Setoran",
    desc: "Pantau PPN kurang bayar, PPh 21, PPh 23, status kepatuhan, NTPN, dan riwayat setoran pajak.",
    metric: "Tax",
    status: "COMPLIANCE",
    metricLabel: "Fokus",
    metricValue: "Pajak",
  },
  {
    id: 8,
    icon: Users,
    iconClass: "w-12 h-12",
    clientName: "SDM & Payroll",
    title: "Pegawai, BPJS, dan Gaji",
    desc: "Registrasi pegawai, BPJS, kompensasi, payroll bersih, dan arsip dokumen HR digital.",
    metric: "Payroll",
    status: "HR FINANCE",
    metricLabel: "Fokus",
    metricValue: "SDM",
  },
  {
    id: 9,
    icon: Building,
    iconClass: "w-12 h-12",
    clientName: "Aset",
    title: "Inventaris dan Depresiasi",
    desc: "Catat aset baru, kategori, harga perolehan, masa manfaat, nilai sisa, dan penyusutan garis lurus.",
    metric: "Assets",
    status: "CONTROL",
    metricLabel: "Fokus",
    metricValue: "Aset Tetap",
  },
  {
    id: 10,
    icon: Server,
    iconClass: "w-12 h-12",
    clientName: "SaaS & Cloud",
    title: "Burn Rate Digital",
    desc: "Pantau biaya langganan SaaS, cloud, kategori, siklus, tanggal tagihan, dan estimasi burn rate bulanan.",
    metric: "Burn Rate",
    status: "COST OPS",
    metricLabel: "Fokus",
    metricValue: "SaaS",
  },
  {
    id: 11,
    icon: TrendingUp,
    iconClass: "w-12 h-12",
    clientName: "Proyeksi",
    title: "Target dan Roadmap Bisnis",
    desc: "Tetapkan target proyeksi, pantau roadmap pertumbuhan finansial, dan bandingkan target dengan realisasi.",
    metric: "Forecast",
    status: "PLANNING",
    metricLabel: "Fokus",
    metricValue: "Proyeksi",
  },
  {
    id: 12,
    icon: FileText,
    iconClass: "w-12 h-12",
    clientName: "Laporan",
    title: "Laporan Manajemen",
    desc: "Susun ringkasan laporan keuangan, neraca, laba rugi, dan data pendukung untuk rapat manajemen.",
    metric: "Report",
    status: "OUTPUT",
    metricLabel: "Fokus",
    metricValue: "Laporan",
  },
];
const nextSlide = () => {
  activeClientIndex.value =
    (activeClientIndex.value + 1) % financeCarouselItems.length;
};
const prevSlide = () => {
  activeClientIndex.value =
    (activeClientIndex.value - 1 + financeCarouselItems.length) %
    financeCarouselItems.length;
};
const carouselItemAt = (offset: number) => {
  const index =
    (activeClientIndex.value + offset + financeCarouselItems.length) %
    financeCarouselItems.length;
  return financeCarouselItems[index];
};

// Carousel bergerak langsung setiap beberapa detik tanpa indikator loading/progress.
const isCarouselPaused = ref(false);
const carouselCycleMs = 4600;
let carouselTimer: number | undefined;
const pauseCarousel = () => {
  isCarouselPaused.value = true;
};
const resumeCarousel = () => {
  isCarouselPaused.value = false;
};
onMounted(() => {
  carouselTimer = window.setInterval(() => {
    if (!isCarouselPaused.value) nextSlide();
  }, carouselCycleMs);
});
onUnmounted(() => {
  if (carouselTimer) window.clearInterval(carouselTimer);
});

// Modul utama Finstart
const sectors = [
  {
    name: "Dashboard CFO",
    icon: BarChart3,
    iconClass: "w-5 h-5",
  },
  {
    name: "CRM & Proyek",
    icon: Briefcase,
    iconClass: "w-5 h-5",
  },
  {
    name: "Buku Besar",
    icon: BookOpen,
    iconClass: "w-5 h-5",
  },
  {
    name: "Jurnal Transaksi",
    icon: Workflow,
    iconClass: "w-5 h-5",
  },
  {
    name: "Piutang Klien",
    icon: ArrowRight,
    iconClass: "w-5 h-5",
  },
  {
    name: "Utang Vendor",
    icon: Truck,
    iconClass: "w-5 h-5",
  },
  {
    name: "Perpajakan",
    icon: Landmark,
    iconClass: "w-5 h-5",
  },
  {
    name: "SDM & Payroll",
    icon: Users,
    iconClass: "w-5 h-5",
  },
  {
    name: "Aset Tetap",
    icon: Building,
    iconClass: "w-5 h-5",
  },
  {
    name: "SaaS & Cloud Cost",
    icon: Server,
    iconClass: "w-5 h-5",
  },
  {
    name: "Proyeksi Bisnis",
    icon: TrendingUp,
    iconClass: "w-5 h-5",
  },
  {
    name: "Laporan Keuangan",
    icon: FileText,
    iconClass: "w-5 h-5",
  },
];

// Fitur unggulan Finstart
const products = [
  {
    name: "Finance Control Center",
    tagline: "Satu dashboard untuk seluruh kesehatan finansial",
    desc: "Dashboard eksekutif yang menggabungkan kas, proyek berjalan, piutang, utang, burn rate SaaS, pajak, payroll, dan proyeksi bisnis.",
    features: [
      {
        title: "Ringkasan Bank & Kas Lancar",
        detail:
          "Tampilkan saldo bank, kas kecil, dan saldo siap pakai secara terpusat.",
      },
      {
        title: "Monitoring invoice jatuh tempo",
        detail: "Lacak invoice dan status pembayaran hingga entry overdue.",
      },
      {
        title: "KPI proyek, klien, dan profit margin",
        detail:
          "Visualisasikan performa proyek, nilai kontrak, dan margin keuntungan.",
      },
      {
        title: "Chart arus kas interaktif",
        detail:
          "Tampilkan aliran masuk-keluar kas dengan grafik interaktif dan update real-time.",
      },
      {
        title: "Insight keuangan CFO",
        detail:
          "Sajikan ringkasan KPI finance penting untuk keputusan manajemen.",
      },
      {
        title: "Shortcut ke modul operasional",
        detail:
          "Akses cepat ke modul buku besar, piutang, utang, pajak, dan payroll.",
      },
    ],
    color: "from-blue-900 to-indigo-950",
    badge: null,
  },
  {
    name: "Project & Client Lifecycle",
    tagline: "Kelola proyek, klien, tender, dan alokasi tim",
    desc: "Modul CRM & proyek untuk inisiasi proyek baru, registrasi klien partner, target kontrak, status tender, dan alokasi SDM.",
    features: [
      {
        title: "Form inisiasi proyek",
        detail:
          "Buat proyek baru dengan target, budget, dan jadwal implementasi.",
      },
      {
        title: "Registrasi mitra klien",
        detail:
          "Simpan data klien dan partner secara terpusat untuk referensi proyek.",
      },
      {
        title: "Target nilai kontrak",
        detail:
          "Tetapkan nilai kontrak dan milestone finansial yang ingin dicapai.",
      },
      {
        title: "Status tender dan estimasi selesai",
        detail: "Pantau proses tender dan perkiraan waktu penyelesaian.",
      },
      {
        title: "Alokasi nama dan posisi tim",
        detail:
          "Tentukan tim proyek, peran, dan tanggung jawab dalam satu tampilan.",
      },
      {
        title: "Database klien terpusat",
        detail:
          "Akses profil klien, sejarah kontrak, dan catatan komunikasi dengan mudah.",
      },
    ],
    color: "from-slate-900 to-blue-950",
    badge: null,
  },
  {
    name: "Accounting & Transaction Core",
    tagline: "Buku besar, jurnal, debit-kredit, dan saldo akun",
    desc: "Fondasi akuntansi untuk menjaga struktur akun, pencatatan jurnal, validasi debit-kredit, serta saldo buku besar tetap konsisten.",
    features: [
      {
        title: "Master akun buku besar",
        detail:
          "Kelola chart of accounts dan kategori akun dengan struktur yang jelas.",
      },
      {
        title: "Template jurnal cepat",
        detail:
          "Gunakan template jurnal untuk mempercepat input transaksi berulang.",
      },
      {
        title: "Validasi total debit dan kredit",
        detail: "Sistem memeriksa keseimbangan jurnal secara otomatis.",
      },
      {
        title: "Format Rupiah konsisten",
        detail: "Nilai ditampilkan dalam format rupiah yang rapi dan standar.",
      },
      {
        title: "Riwayat transaksi terstruktur",
        detail: "Telusuri transaksi historis berdasarkan akun dan tanggal.",
      },
      {
        title: "Laporan berbasis GL",
        detail: "Hasilkan laporan keuangan langsung dari data buku besar.",
      },
    ],
    color: "from-blue-950 to-indigo-900",
    badge: null,
  },
  {
    name: "Receivable & Payable Automation",
    tagline: "Piutang, pelunasan, tagihan vendor, dan pembayaran",
    desc: "Kelola invoice klien, pencatatan pelunasan piutang, input tagihan vendor, pembayaran vendor, aging, dan status jatuh tempo.",
    features: [
      {
        title: "Invoice dan jatuh tempo",
        detail:
          "Buat invoice pelanggan dengan tanggal jatuh tempo dan status pembayaran.",
      },
      {
        title: "Catat pelunasan piutang",
        detail: "Update status pembayaran saat piutang diterima.",
      },
      {
        title: "Input tagihan vendor",
        detail:
          "Masukkan tagihan supplier dengan detail biaya dan jatuh tempo.",
      },
      {
        title: "Catat pembayaran vendor",
        detail:
          "Rekam pengeluaran dan bukti pembayaran vendor secara terstruktur.",
      },
      {
        title: "Status overdue dan paid",
        detail:
          "Identifikasi piutang atau utang yang sudah jatuh tempo dan lunas.",
      },
      {
        title: "Nominal rata kanan dan rapi",
        detail:
          "Tampilkan angka secara rapih sehingga memudahkan review finansial.",
      },
    ],
    color: "from-[#0B1F4A] to-slate-900",
    badge: null,
  },
  {
    name: "Compliance, Payroll & Asset Hub",
    tagline: "Pajak, BPJS, payroll, aset, SaaS, dan proyeksi",
    desc: "Modul administrasi compliance untuk PPN, PPh, BPJS, payroll pegawai, arsip dokumen, aset tetap, depresiasi, dan biaya SaaS.",
    features: [
      {
        title: "Status kepatuhan pajak",
        detail:
          "Pantau PPN, PPh, dan setoran pajak untuk mendukung kepatuhan audit.",
      },
      {
        title: "Tarif BPJS dan payroll",
        detail: "Hitung gaji, iuran BPJS, dan payroll secara otomatis.",
      },
      {
        title: "Registrasi pegawai baru",
        detail: "Simpan data karyawan, jabatan, dan informasi payroll.",
      },
      {
        title: "Arsip dokumen digital",
        detail: "Simpan dokumen payroll, BPJS, kontrak, dan bukti pembayaran.",
      },
      {
        title: "Penyusutan aset garis lurus",
        detail: "Hitung depresiasi aset tetap berdasarkan masa manfaat.",
      },
      {
        title: "Burn rate SaaS dan renewal",
        detail: "Pantau biaya langganan SaaS dan jadwal perpanjangan kontrak.",
      },
    ],
    color: "from-indigo-950 to-slate-950",
    badge: null,
  },
];

// Keunggulan sistem
const solutions = [
  {
    title: "Satu Sumber Data Finance",
    desc: "Proyek, klien, invoice, vendor, pajak, payroll, aset, dan laporan berada dalam alur data yang konsisten.",
    icon: Database,
  },
  {
    title: "Dashboard Eksekutif Interaktif",
    desc: "Grafik arus kas, KPI proyek, status tagihan, dan insight CFO dapat dipantau tanpa berpindah alat.",
    icon: BarChart3,
  },
  {
    title: "Form dan Tabel Seragam",
    desc: "Seluruh input, dropdown, date picker, textarea, badge, dan tabel dibuat konsisten agar kerja harian lebih cepat.",
    icon: CheckCircle2,
  },
  {
    title: "Kontrol Jatuh Tempo",
    desc: "Invoice, piutang, tagihan vendor, pajak, dan renewal SaaS dapat ditandai dengan status yang mudah dibaca.",
    icon: Calendar,
  },
  {
    title: "Compliance Terpantau",
    desc: "PPN, PPh 21, PPh 23, BPJS, payroll, dan arsip pegawai disusun untuk kebutuhan audit internal.",
    icon: ShieldCheck,
  },
  {
    title: "Proyeksi Bisnis Tahunan",
    desc: "Target revenue, beban, laba, dan roadmap pertumbuhan divisualkan untuk rapat manajemen.",
    icon: TrendingUp,
  },
  {
    title: "Manajemen Aset & SaaS",
    desc: "Aset tetap, depresiasi, biaya langganan digital, kategori cloud, dan burn rate dapat dipantau berkala.",
    icon: Server,
  },
  {
    title: "Akses Operasional Cepat",
    desc: "Tombol aksi, filter, pencarian, dan shortcut modul dibuat untuk workflow finance berulang.",
    icon: Workflow,
  },
  {
    title: "Tampilan Enterprise",
    desc: "Warna navy, putih, tabel rapi, dan hierarki data jelas memberi kesan sistem internal resmi perusahaan.",
    icon: Shield,
  },
];

// 5 keunggulan utama sistem
const keyStrengths = [
  {
    title: "Data Terpusat",
    desc: "Seluruh data finance penting berada dalam satu sistem sehingga tim tidak perlu berpindah spreadsheet.",
  },
  {
    title: "Tampilan Konsisten",
    desc: "Form, tabel, badge, tombol, dan modal dibuat seragam agar input harian lebih cepat dan minim salah.",
  },
  {
    title: "Kontrol Jatuh Tempo",
    desc: "Piutang, utang, pajak, invoice, dan renewal SaaS mudah dipantau melalui status dan tanggal yang jelas.",
  },
  {
    title: "Siap Laporan",
    desc: "Buku besar, jurnal, proyeksi, dan laporan disusun untuk kebutuhan review manajemen dan audit internal.",
  },
  {
    title: "Corporate UI",
    desc: "Desain navy, putih, dan abu lembut memberi pengalaman seperti sistem enterprise resmi perusahaan.",
  },
];

// Contoh alur fitur unggulan
const selectedProjects = [
  {
    category: "Dashboard",
    title: "Monitoring Cash Flow & KPI",
    partner: "Dashboard CFO | Real-time Finance View",
    year: "Live",
    desc: "Pantau kas, profit margin, proyek berjalan, invoice jatuh tempo, burn rate digital, dan ringkasan insight finance.",
    highlights: [
      "Ringkasan kas & bank dalam satu dashboard",
      "Monitoring KPI proyek, invoice, dan burn rate real-time",
      "Insight finance untuk rapat manajemen",
    ],
  },
  {
    category: "Operasional",
    title: "Invoice, Piutang & Vendor",
    partner: "Receivable & Payable Workflow",
    year: "Daily",
    desc: "Kelola invoice klien, pelunasan piutang, tagihan vendor, pembayaran, status overdue, dan riwayat transaksi.",
    highlights: [
      "Manajemen invoice dan jatuh tempo pelanggan",
      "Rekonsiliasi pembayaran vendor dan bukti transaksi",
      "Status overdue dan paid langsung terlihat",
    ],
  },
  {
    category: "Compliance",
    title: "Pajak, Payroll, Aset & SaaS",
    partner: "Compliance & Cost Control Hub",
    year: "Monthly",
    desc: "Pantau PPN, PPh, BPJS, payroll, dokumen pegawai, penyusutan aset, biaya cloud, dan renewal SaaS.",
    highlights: [
      "Pantau pajak, payroll, dan compliance dalam satu modul",
      "Pengelolaan aset tetap dan depresiasi terintegrasi",
      "Kontrol biaya SaaS dan renewals agar tidak bocor",
    ],
  },
];
</script>
<style scoped>
.landing-carousel-shell {
  position: relative;
  isolation: isolate;
}
.landing-carousel-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}
.landing-feature-card {
  position: relative;
  min-height: 328px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 22px;
  text-align: left;
  color: #dbeafe;
  background: linear-gradient(
    145deg,
    rgba(12, 42, 94, 0.7),
    rgba(6, 22, 53, 0.84)
  );
  box-shadow: 0 16px 38px rgba(1, 13, 38, 0.2);
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.42s ease,
    background 0.42s ease,
    box-shadow 0.42s ease;
  animation: landingFeatureEnter 0.52s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.landing-feature-card:hover {
  transform: translateY(-7px) scale(1.015);
  border-color: rgba(125, 211, 252, 0.45);
}
.landing-feature-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(
    circle at 25% 10%,
    rgba(125, 211, 252, 0.22),
    transparent 38%
  );
  opacity: 0.65;
  pointer-events: none;
}
.landing-feature-card--active {
  color: #102a56;
  border-color: rgba(255, 255, 255, 0.88);
  background: linear-gradient(155deg, #fff 0%, #f6faff 100%);
  box-shadow:
    0 28px 62px rgba(0, 10, 36, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.4);
  transform: translateY(-12px);
  animation: landingCardPop 0.72s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.landing-feature-card--active:hover {
  transform: translateY(-16px);
}
.landing-carousel-nav {
  position: absolute;
  top: 50%;
  z-index: 5;
  display: flex;
  height: 42px;
  width: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: #fff;
  background: rgba(7, 29, 68, 0.76);
  box-shadow: 0 14px 28px rgba(1, 13, 38, 0.26);
  transform: translateY(-50%);
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}
.landing-carousel-nav:hover {
  background: rgba(37, 99, 235, 0.88);
  transform: translateY(-50%) scale(1.06);
}
.landing-carousel-nav--prev {
  left: -18px;
}
.landing-carousel-nav--next {
  right: -18px;
}
.landing-progress-dot {
  height: 7px;
  border-radius: 999px;
  border: 0;
  background: rgba(191, 219, 254, 0.32);
  transition:
    width 0.3s ease,
    background 0.3s ease;
}
.landing-progress-dot--active {
  width: 28px;
  background: #7dd3fc;
}
@keyframes landingFeatureEnter {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes landingCardPop {
  0% {
    opacity: 0.72;
    transform: translateY(4px) scale(0.96);
  }
  58% {
    opacity: 1;
    transform: translateY(-15px) scale(1.035);
  }
  100% {
    opacity: 1;
    transform: translateY(-12px) scale(1);
  }
}
@media (max-width: 900px) {
  .landing-carousel-grid {
    grid-template-columns: 1fr;
    max-width: 430px;
    margin: 0 auto;
  }
  .landing-feature-card:not(.landing-feature-card--active) {
    display: none;
  }
  .landing-carousel-nav--prev {
    left: calc(50% - 226px);
  }
  .landing-carousel-nav--next {
    right: calc(50% - 226px);
  }
}
@media (max-width: 520px) {
  .landing-feature-card {
    min-height: 302px;
    padding: 20px;
  }
  .landing-carousel-nav {
    height: 38px;
    width: 38px;
  }
  .landing-carousel-nav--prev {
    left: -4px;
  }
  .landing-carousel-nav--next {
    right: -4px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .landing-feature-card,
  .landing-carousel-nav,
  .landing-progress-dot {
    animation: none !important;
    transition: none !important;
  }
}
</style>
