<script lang="tsx">
import { defineComponent, onMounted } from 'vue';
import FinStartSplashLogo from '../assets/finstart-splash-logo.png';

const splashCss = `
  .finstart-splash { background:radial-gradient(circle at 50% 32%,rgba(37,132,255,.17),transparent 27%),linear-gradient(145deg,#f8fbff 0%,#eef6ff 48%,#f7fbff 100%); }
  .finstart-splash-grid { background-image:linear-gradient(rgba(25,115,235,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(25,115,235,.05) 1px,transparent 1px); background-size:44px 44px; mask-image:radial-gradient(circle at center,black 12%,transparent 72%); }
  .finstart-splash-stage { animation:fsStageIn .68s cubic-bezier(.16,1,.3,1) both; }
  .finstart-splash-logo-shell { animation:fsLogoFloat 2.3s ease-in-out infinite; position:relative; }
  .fs-logo-line { position:absolute; height:4px; width:56px; border-radius:999px; background:linear-gradient(90deg,#1479eb,#9bd5ff,#0B1F4A); opacity:0; box-shadow:0 0 18px rgba(47,156,255,.35); animation:fsLineMerge .9s cubic-bezier(.16,1,.3,1) both; }
  .fs-logo-line:nth-child(1){ top:28px; left:-18px; transform:translateX(-46px) rotate(20deg); animation-delay:.08s; }
  .fs-logo-line:nth-child(2){ top:72px; right:-22px; transform:translateX(46px) rotate(-16deg); animation-delay:.16s; }
  .fs-logo-line:nth-child(3){ bottom:68px; left:-26px; transform:translateX(-52px) rotate(-12deg); animation-delay:.24s; }
  .fs-logo-line:nth-child(4){ bottom:32px; right:-20px; transform:translateX(52px) rotate(18deg); animation-delay:.32s; }
  .finstart-splash-logo { animation:fsLogoReveal .88s cubic-bezier(.16,1,.3,1) both; }
  .finstart-splash-word { animation:fsWordReveal .58s cubic-bezier(.16,1,.3,1) .34s both; }
  .finstart-splash-loader { animation:fsLoad 1.82s cubic-bezier(.22,1,.36,1) .28s both; transform-origin:left; }
  .finstart-splash-glow { animation:fsGlow 2.5s ease-in-out infinite; }
  @keyframes fsStageIn { from { opacity:0; transform:translateY(14px) scale(.93) } to { opacity:1; transform:translateY(0) scale(1) } }
  @keyframes fsLogoReveal { from { opacity:0; transform:scale(.72) rotate(-6deg) } 65% { opacity:1; transform:scale(1.05) rotate(1deg) } to { opacity:1; transform:scale(1) rotate(0) } }
  @keyframes fsLineMerge { 0% { opacity:0; } 20% { opacity:1; } 72% { opacity:1; transform:translateX(0) rotate(0deg); } 100% { opacity:0; transform:translateX(0) rotate(0deg) scale(.3); } }
  @keyframes fsLogoFloat { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-7px) } }
  @keyframes fsWordReveal { from { opacity:0; transform:translateY(12px); letter-spacing:.42em } to { opacity:1; transform:translateY(0); letter-spacing:.23em } }
  @keyframes fsLoad { from { transform:scaleX(.03) } to { transform:scaleX(1) } }
  @keyframes fsGlow { 0%,100%{ opacity:.45; transform:scale(.93) } 50%{ opacity:.9; transform:scale(1.08) } }
  @media (prefers-reduced-motion:reduce) { .finstart-splash-stage,.finstart-splash-logo-shell,.finstart-splash-logo,.finstart-splash-word,.finstart-splash-loader,.finstart-splash-glow { animation:none!important; opacity:1!important; transform:none!important; } }
`;

export default defineComponent({
  name: 'SplashScreen',
  props: ['onComplete'],
  setup(props) {
    onMounted(() => {
      const timeout = window.setTimeout(() => props.onComplete?.(), 2050);
      return () => window.clearTimeout(timeout);
    });
    return () => <div class="finstart-splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6 text-[#0B1F4A]">
      <style>{splashCss}</style>
      <div class="finstart-splash-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div class="finstart-splash-glow pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/20 blur-3xl" />
      <div class="finstart-splash-stage relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div class="finstart-splash-logo-shell flex h-48 w-48 items-center justify-center rounded-[34px] border border-blue-100 bg-white p-4 shadow-[0_24px_68px_rgba(30,90,168,.18)] sm:h-52 sm:w-52">
          <span class="fs-logo-line" /><span class="fs-logo-line" /><span class="fs-logo-line" /><span class="fs-logo-line" /><img src={FinStartSplashLogo} class="finstart-splash-logo h-full w-full rounded-[24px] object-contain" alt="Logo FinStart" />
        </div>
        <div class="mt-7 overflow-hidden">
          <p class="finstart-splash-word text-[2rem] font-black text-[#0B1F4A] sm:text-[2.45rem]">FINSTART</p>
          <p class="mt-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#5e79a3]">PT Kedata Indonesia Digital</p>
          <p class="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#7a91b4]">Financial Operations Workspace</p>
        </div>
        <div class="mt-8 w-56 overflow-hidden rounded-full bg-blue-100 p-[3px] sm:w-64"><span class="finstart-splash-loader block h-1.5 rounded-full bg-gradient-to-r from-[#1479eb] via-[#2f9cff] to-[#0B1F4A]" /></div>
        <p class="mt-3 text-[10px] font-semibold uppercase tracking-[.17em] text-[#6f85a6]">Menyiapkan workspace</p>
      </div>
    </div>;
  },
});
</script>
