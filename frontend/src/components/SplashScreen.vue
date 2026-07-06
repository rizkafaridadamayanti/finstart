<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, ref } from "vue";
import { motion } from "../compat/motion.js";
import kedataLogo from '../assets/kedata-logo-transparent.png';
interface SplashScreenProps {
  onComplete: () => void;
}
const logoSketchLines = ['M207 70 L548 70 L704 340 L548 610 L207 610', 'M190 82 L46 340 L190 598', 'M248 118 L526 118 L652 340 L526 562 L248 562', 'M210 124 L285 340 L210 556', 'M285 184 L344 340 L285 496', 'M392 184 L502 184 L570 340 L502 496 L392 496 L335 340 L392 184', 'M506 210 L621 340 L506 470'];
const softEase = [0.16, 1, 0.3, 1] as const;
export default defineComponent({
  name: "SplashScreen",
  props: ["onComplete"],
  setup(props) {
    const {
      onComplete
    }: SplashScreenProps = props;
    const progress = ref(0),
      setProgress = next => progress.value = typeof next === "function" ? next(progress.value) : next;
    onMounted(() => {
      const interval = window.setInterval(() => {
        setProgress(previous => {
          if (previous >= 100) {
            window.clearInterval(interval);
            window.setTimeout(onComplete, 1100);
            return 100;
          }
          return Math.min(previous + 1, 100);
        });
      }, 46);
      return () => window.clearInterval(interval);
    });
    return () => <div class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#071935] px-6 text-white">
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(36,126,212,0.24),transparent_32%),linear-gradient(135deg,#06142D_0%,#071935_52%,#0A244A_100%)]" />
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:76px_76px] opacity-70" />
        <motion.div initial={{
          opacity: 0,
          scaleX: 0.2
        }} animate={{
          opacity: [0, 0.9, 0],
          scaleX: [0.2, 1, 0.25]
        }} transition={{
          delay: 1.15,
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }} class="absolute left-[18%] top-[43%] h-px w-[64%] origin-center bg-[#8FC7FF]/70" />
      </div>

      <div class="relative z-10 flex w-full max-w-4xl flex-col items-center">
        <div class="relative mb-8 h-[15rem] w-[15rem] sm:h-[17rem] sm:w-[17rem]" aria-label="Animasi garis membentuk logo PT Kedata Indonesia Digital">
          <motion.div initial={{
            opacity: 0,
            scale: 0.94
          }} animate={{
            opacity: [0, 0.42, 0.2],
            scale: 1
          }} transition={{
            duration: 1.65,
            ease: softEase
          }} class="absolute inset-0 rounded-full bg-white/12 blur-2xl" />

          <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.8,
            ease: softEase
          }} class="absolute inset-0 overflow-visible">
            <svg class="absolute inset-[5%] h-[90%] w-[90%] overflow-visible" viewBox="0 0 746 681" role="presentation">
              <defs>
                <linearGradient id="splashLogoStroke" x1="46" x2="704" y1="70" y2="610" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6FC3FF" />
                  <stop offset="0.5" stopColor="#2192F3" />
                  <stop offset="1" stopColor="#1E5AA8" />
                </linearGradient>
                <filter id="splashLogoGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#2192F3" floodOpacity="0.68" />
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#8FC7FF" floodOpacity="0.72" />
                </filter>
              </defs>

              {logoSketchLines.map((line, index) => <motion.path key={line} d={line} fill="none" stroke="url(#splashLogoStroke)" strokeWidth="38" strokeLinecap="butt" strokeLinejoin="miter" filter="url(#splashLogoGlow)" initial={{
                pathLength: 0,
                opacity: 0
              }} animate={{
                pathLength: 1,
                opacity: [0, 1, 1, 0]
              }} transition={{
                delay: 0.08 + index * 0.16,
                duration: 2.05,
                times: [0, 0.52, 0.82, 1],
                ease: softEase
              }} />)}
            </svg>

            <motion.img src={kedataLogo} alt="" initial={{
              opacity: 0,
              scale: 0.982,
              filter: 'blur(4px) brightness(1.08)'
            }} animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px) brightness(1)'
            }} transition={{
              delay: 3.18,
              duration: 0.95,
              ease: softEase
            }} class="absolute inset-[5%] h-[90%] w-[90%] object-contain drop-shadow-[0_0_14px_rgba(33,146,243,0.72)]" />
          </motion.div>

          <motion.div initial={{
            opacity: 0,
            scale: 0.88
          }} animate={{
            opacity: [0, 0.36, 0],
            scale: [0.9, 1.04, 1.14]
          }} transition={{
            delay: 3.25,
            duration: 0.95,
            ease: softEase
          }} class="absolute inset-5 rounded-full border border-[#8FC7FF]/45" />
        </div>

        <motion.div initial={{
          opacity: 0,
          y: 18,
          filter: 'blur(4px)'
        }} animate={{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)'
        }} transition={{
          delay: 4.05,
          duration: 0.9,
          ease: softEase
        }} class="text-center">
          <p class="text-[10px] font-bold uppercase tracking-[0.34em] text-[#8FC7FF] sm:text-xs">PT. Kedata Indonesia Digital</p>
          <h1 class="mt-3 text-[2.45rem] font-extrabold tracking-[0.16em] text-white sm:text-[3rem]">FINSTART</h1>
          <p class="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-300/80">Financial Operations Workspace</p>
        </motion.div>

        <div class="mt-9 w-72 sm:w-96">
          <div class="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div class="h-full rounded-full bg-gradient-to-r from-[#247ED4] via-[#65A9F4] to-[#C5DFFF]" animate={{
              width: `${progress.value}%`
            }} transition={{
              ease: 'easeOut',
              duration: 0.3
            }} />
          </div>
          <div class="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>Menyiapkan pengalaman Finstart</span>
            <span>{progress.value}%</span>
          </div>
        </div>
      </div>

      <p class="absolute bottom-7 z-10 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
        PT Kedata Indonesia Digital - 2026
      </p>
    </div>;
  }
});
</script>
