<script lang="tsx">
import { Fragment, defineComponent, h } from "vue";
import { motion } from "../compat/motion.js";
import { CheckCircle2, ShieldCheck, Workflow } from "lucide-vue-next";
import KedataLogo from './KedataLogo.vue';
interface LoadingScreenProps {
  email: string;
}
const loadingSteps = [{
  title: 'Memvalidasi akses workspace',
  subtitle: 'Hak akses dan role pengguna diverifikasi',
  icon: ShieldCheck,
  delay: 0.08
}, {
  title: 'Menyiapkan modul operasional',
  subtitle: 'Dashboard, proyek, transaksi, dan laporan dimuat',
  icon: Workflow,
  delay: 0.22
}, {
  title: 'Menyelaraskan preferensi pengguna',
  subtitle: 'Notifikasi, sesi aktif, dan preferensi tampilan diterapkan',
  icon: CheckCircle2,
  delay: 0.36
}];
export default defineComponent({
  name: "LoadingScreen",
  props: ["email"],
  setup(props) {
    const {
      email
    }: LoadingScreenProps = props;
    return () => <div class="fixed inset-0 z-50 overflow-hidden bg-[#081935] text-white">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-[#1E5AA8]/20 blur-3xl" />
        <div class="absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[#2C7AD2]/18 blur-3xl" />
        <div class="absolute inset-x-0 top-[22%] h-px bg-white/8" />
        <div class="absolute inset-x-0 bottom-[16%] h-px bg-white/6" />
        <div class="absolute left-[14%] top-0 h-full w-px bg-white/6" />
        <div class="absolute right-[12%] top-0 h-full w-px bg-white/5" />
      </div>

      <div class="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          ease: 'easeOut'
        }} class="w-full max-w-6xl">
          <div class="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
            <div class="space-y-8">
              <div class="inline-flex items-center gap-4 rounded-[28px] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_16px_30px_rgba(255,255,255,0.12)]">
                  <KedataLogo size={40} />
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8AB8F1]">PT. Kedata Indonesia Digital</p>
                  <h1 class="mt-1 text-3xl font-extrabold tracking-[0.16em] text-white">FINSTART</h1>
                  <p class="mt-1 text-xs uppercase tracking-[0.16em] text-slate-300/80">Financial Operations Workspace</p>
                </div>
              </div>

              <div class="max-w-xl space-y-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8AB8F1]">Login berhasil</p>
                <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-[3.25rem]">Menyiapkan ruang kerja Finstart Anda</h2>
                <p class="max-w-lg text-sm leading-7 text-slate-300/85 sm:text-base">
                  Sistem sedang memuat lingkungan kerja finansial, preferensi akses, dan data operasional untuk <span class="font-semibold text-white">{email}</span> agar pengalaman masuk terasa aman, profesional, dan konsisten.
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-3">
                {[['Secure Workspace', 'Kontrol role & sesi aktif'], ['Data Ready', 'Proyek, kas, dan laporan'], ['Consistent Experience', 'UI operasional terselaraskan']].map(([title, subtitle]) => <div key={title} class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                    <p class="text-sm font-semibold text-white">{title}</p>
                    <p class="mt-1 text-xs leading-6 text-slate-300/75">{subtitle}</p>
                  </div>)}
              </div>
            </div>

            <div class="rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-sm">
              <div class="rounded-[26px] border border-white/8 bg-[#0D2146]/88 p-6">
                <div class="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#89B9F4]">Loading sequence</p>
                    <h3 class="mt-1 text-lg font-bold text-white">Workspace Initialization</h3>
                  </div>
                  <div class="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    <span class="h-2 w-2 rounded-full bg-emerald-400" /> Initializing
                  </div>
                </div>

                <div class="mt-5 flex items-center gap-4 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
                  <div class="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-white shadow-[0_16px_32px_rgba(255,255,255,0.12)]">
                    <KedataLogo size={40} />
                    <motion.span class="absolute inset-0 rounded-[22px] border border-[#53A0F5]/50" animate={{
                      scale: [1, 1.12, 1],
                      opacity: [0.7, 0.2, 0.7]
                    }} transition={{
                      repeat: Infinity,
                      duration: 2.3,
                      ease: 'easeInOut'
                    }} />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-white">Environment verified</p>
                    <p class="mt-1 text-xs leading-6 text-slate-300/75">Finstart sedang menghubungkan dashboard dan kontrol operasional.</p>
                  </div>
                </div>

                <div class="mt-5 space-y-3">
                  {loadingSteps.map((item, index) => {
                    const Icon = item.icon;
                    return <motion.div key={item.title} initial={{
                      opacity: 0,
                      x: 18
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: item.delay,
                      duration: 0.48,
                      ease: 'easeOut'
                    }} class="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
                        <div class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B1F4A] shadow-[0_10px_24px_rgba(255,255,255,0.14)]">
                          <Icon class="h-5 w-5" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center justify-between gap-3">
                            <p class="text-sm font-semibold text-white">{item.title}</p>
                            <motion.div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300" animate={{
                            opacity: [0.5, 1, 0.5]
                          }} transition={{
                            repeat: Infinity,
                            duration: 1.8,
                            delay: index * 0.18
                          }}>
                              <CheckCircle2 class="h-3.5 w-3.5" /> Live
                            </motion.div>
                          </div>
                          <p class="mt-1 text-xs leading-6 text-slate-300/75">{item.subtitle}</p>
                        </div>
                      </motion.div>;
                  })}
                </div>

                <div class="mt-5 overflow-hidden rounded-full bg-white/8">
                  <motion.div class="h-2 rounded-full bg-gradient-to-r from-[#247ED4] via-[#65A9F4] to-[#C5DFFF]" initial={{
                    width: '12%'
                  }} animate={{
                    width: ['12%', '32%', '58%', '81%', '96%']
                  }} transition={{
                    duration: 2.35,
                    ease: [0.22, 1, 0.36, 1]
                  }} />
                </div>
                <div class="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Loading Finstart Environment</span>
                  <span>Almost ready</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
  }
});
</script>
