<script lang="tsx">
import { defineComponent, onMounted } from 'vue';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Briefcase,
  Cloud,
  FileText,
  LayoutDashboard,
  Percent,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-vue-next';
import FinStartSplashLogo from '../assets/finstart-splash-logo.png';

const menuIconItems = [
  { label: 'Proyeksi', icon: TrendingUp, x: '0px', y: '-230px', delay: '1.1s' },
  { label: 'Langganan', icon: Cloud, x: '126px', y: '-196px', delay: '1.18s' },
  { label: 'SDM', icon: Users, x: '224px', y: '-126px', delay: '1.26s' },
  { label: 'Aset', icon: Box, x: '270px', y: '-25px', delay: '1.34s' },
  { label: 'Pengaturan', icon: Settings, x: '238px', y: '101px', delay: '1.42s' },
  { label: 'Buku Besar', icon: BookOpen, x: '151px', y: '184px', delay: '1.5s' },
  { label: 'Laporan', icon: FileText, x: '32px', y: '218px', delay: '1.58s' },
  { label: 'Transaksi', icon: ArrowLeftRight, x: '-96px', y: '205px', delay: '1.66s' },
  { label: 'Piutang', icon: ArrowDownLeft, x: '-203px', y: '146px', delay: '1.74s' },
  { label: 'Utang', icon: ArrowUpRight, x: '-263px', y: '51px', delay: '1.82s' },
  { label: 'Pajak', icon: Percent, x: '-263px', y: '-51px', delay: '1.9s' },
  { label: 'Dashboard', icon: LayoutDashboard, x: '-203px', y: '-146px', delay: '1.98s' },
  { label: 'CRM', icon: Briefcase, x: '-96px', y: '-205px', delay: '2.06s' },
];

const splashCss = `
  .finstart-splash {
    background:
      radial-gradient(circle at 50% 42%, rgba(43,167,255,.32), transparent 32%),
      radial-gradient(circle at 50% 18%, rgba(22,160,133,.16), transparent 24%),
      linear-gradient(145deg, #0B1F4A 0%, #102A56 48%, #071735 100%);
  }
  .finstart-splash::before {
    content:"";
    pointer-events:none;
    position:absolute;
    inset:0;
    background-image:
      linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
    background-size:54px 54px;
    mask-image:radial-gradient(circle at center, black 18%, transparent 82%);
    animation:fsGridDrift 4.8s linear infinite;
  }
  .finstart-splash::after {
    content:"";
    pointer-events:none;
    position:absolute;
    inset:-20%;
    opacity:.34;
    background:
      linear-gradient(115deg, transparent 35%, rgba(43,167,255,.18) 49%, transparent 63%),
      linear-gradient(65deg, transparent 42%, rgba(22,160,133,.14) 54%, transparent 68%);
    animation:fsBeamSweep 3.9s cubic-bezier(.16,1,.3,1) infinite;
  }
  .fs-stage {
    animation:fsStageIn .63s cubic-bezier(.16,1,.3,1) both;
    transform:translateY(36px);
  }
  .fs-logo-cluster {
    position:relative;
    width:min(780px, 94vw);
    height:min(610px, 68vh);
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .fs-logo-shell {
    position:relative;
    z-index:3;
    isolation:isolate;
    animation:
      fsLogoFirst .87s cubic-bezier(.16,1,.3,1) both,
      fsLogoShake .69s cubic-bezier(.2,.9,.18,1) 1.08s both,
      fsLogoFloat 3.38s ease-in-out 2.03s infinite;
  }
  .fs-logo-shell::before {
    content:"";
    position:absolute;
    inset:-18px;
    border-radius:38px;
    background:
      linear-gradient(#fff,#fff) padding-box,
      conic-gradient(from 130deg, rgba(43,167,255,.06), rgba(43,167,255,.95), rgba(22,160,133,.62), rgba(43,167,255,.06)) border-box;
    border:1px solid transparent;
    opacity:0;
    animation:fsRingPop .93s cubic-bezier(.16,1,.3,1) 1.02s both, fsRingSpin 4.95s linear 1.62s infinite;
    z-index:-1;
  }
  .fs-logo-shell::after {
    content:"";
    position:absolute;
    inset:12px;
    border-radius:28px;
    background:linear-gradient(180deg, rgba(255,255,255,.48), rgba(255,255,255,0));
    opacity:0;
    animation:fsLogoScan 1.28s cubic-bezier(.16,1,.3,1) 1.08s both;
    mix-blend-mode:screen;
  }
  .fs-logo {
    animation:fsLogoImage .96s cubic-bezier(.16,1,.3,1) both;
  }
  .fs-burst-ring {
    position:absolute;
    z-index:1;
    width:188px;
    height:188px;
    border:1px solid rgba(107,193,255,.32);
    border-radius:999px;
    opacity:0;
    animation:fsBurstRing 1.58s cubic-bezier(.16,1,.3,1) 1.2s both;
  }
  .fs-burst-ring:nth-child(2) {
    animation-delay:1.43s;
  }
  .fs-menu-orbit {
    position:absolute;
    left:50%;
    top:50%;
    z-index:2;
    display:flex;
    width:54px;
    height:54px;
    align-items:center;
    justify-content:center;
    border:1px solid rgba(199,226,255,.96);
    border-radius:18px;
    background:rgba(255,255,255,.96);
    color:#1E5AA8;
    box-shadow:0 18px 42px rgba(0,0,0,.22), 0 0 0 1px rgba(255,255,255,.12);
    opacity:0;
    transform:translate(-50%,-50%) translate(0,0) scale(.34);
    animation:
      fsIconBurst .93s cubic-bezier(.16,1,.3,1) var(--fs-delay) both,
      fsIconFloat 3.6s ease-in-out calc(var(--fs-delay) + .93s) infinite;
  }
  .fs-menu-orbit svg {
    width:22px;
    height:22px;
    stroke-width:2.2;
  }
  .fs-word-wrap {
    opacity:0;
    transform:translateY(16px);
    animation:fsTextRise .83s cubic-bezier(.16,1,.3,1) 2.58s both;
  }
  .fs-word {
    letter-spacing:.23em;
    color:#ffffff;
    text-shadow:0 10px 32px rgba(0,0,0,.28);
  }
  .fs-company {
    opacity:0;
    transform:translateY(10px);
    animation:fsTextRise .72s cubic-bezier(.16,1,.3,1) 2.85s both;
  }
  .fs-loader-wrap {
    opacity:0;
    transform:translateY(10px);
    animation:fsTextRise .63s cubic-bezier(.16,1,.3,1) 3.06s both;
  }
  .fs-loader {
    transform-origin:left;
    animation:fsLoad 1.08s cubic-bezier(.22,1,.36,1) 3.12s both;
  }
  .fs-loader::after {
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,.76), transparent);
    transform:translateX(-100%);
    animation:fsGlint 1.23s ease-in-out 3.3s infinite;
  }
  @keyframes fsStageIn {
    from { opacity:0; transform:translateY(36px) scale(.98) }
    to { opacity:1; transform:translateY(36px) scale(1) }
  }
  @keyframes fsGridDrift {
    from { background-position:0 0, 0 0 }
    to { background-position:54px 54px, 54px 54px }
  }
  @keyframes fsBeamSweep {
    from { transform:translateX(-16%) }
    to { transform:translateX(16%) }
  }
  @keyframes fsLogoFirst {
    from { opacity:0; transform:scale(.62) rotate(-7deg); filter:blur(10px) }
    68% { opacity:1; transform:scale(1.06) rotate(1deg); filter:blur(0) }
    to { opacity:1; transform:scale(1) rotate(0); filter:blur(0) }
  }
  @keyframes fsLogoImage {
    from { opacity:0; transform:scale(.82) }
    to { opacity:1; transform:scale(1) }
  }
  @keyframes fsLogoShake {
    0%,100% { transform:translateX(0) rotate(0deg) scale(1) }
    15% { transform:translateX(-7px) rotate(-3deg) scale(1.015) }
    30% { transform:translateX(7px) rotate(3deg) scale(1.025) }
    45% { transform:translateX(-5px) rotate(-2deg) scale(1.02) }
    60% { transform:translateX(5px) rotate(2deg) scale(1.012) }
    78% { transform:translateX(-2px) rotate(-1deg) scale(1.006) }
  }
  @keyframes fsLogoFloat {
    0%,100% { transform:translateY(0) }
    50% { transform:translateY(-5px) }
  }
  @keyframes fsRingPop {
    from { opacity:0; transform:scale(.76) }
    to { opacity:1; transform:scale(1) }
  }
  @keyframes fsRingSpin {
    to { rotate:360deg }
  }
  @keyframes fsLogoScan {
    0% { opacity:0; transform:translateY(-115%) }
    28% { opacity:.9 }
    100% { opacity:0; transform:translateY(115%) }
  }
  @keyframes fsBurstRing {
    from { opacity:.72; transform:scale(.2) }
    to { opacity:0; transform:scale(2.24) }
  }
  @keyframes fsIconBurst {
    0% { opacity:0; transform:translate(-50%,-50%) translate(0,0) scale(.28); filter:blur(7px) }
    72% { opacity:1; transform:translate(-50%,-50%) translate(var(--fs-x), var(--fs-y)) scale(1.1); filter:blur(0) }
    100% { opacity:1; transform:translate(-50%,-50%) translate(var(--fs-x), var(--fs-y)) scale(1); filter:blur(0) }
  }
  @keyframes fsIconFloat {
    0%,100% { margin-top:0 }
    50% { margin-top:-5px }
  }
  @keyframes fsTextRise {
    to { opacity:1; transform:translateY(0) }
  }
  @keyframes fsLoad {
    from { transform:scaleX(.08) }
    to { transform:scaleX(1) }
  }
  @keyframes fsGlint {
    from { transform:translateX(-110%) }
    to { transform:translateX(110%) }
  }
  @media (max-width:640px) {
    .fs-logo-cluster {
      width:360px;
      height:440px;
    }
    .fs-menu-orbit {
      width:42px;
      height:42px;
      border-radius:15px;
      transform:translate(-50%,-50%) translate(0,0) scale(.34);
    }
    .fs-menu-orbit svg {
      width:18px;
      height:18px;
    }
  }
  @media (prefers-reduced-motion:reduce) {
    .finstart-splash::before,
    .finstart-splash::after,
    .fs-stage,
    .fs-logo-shell,
    .fs-logo-shell::before,
    .fs-logo-shell::after,
    .fs-logo,
    .fs-burst-ring,
    .fs-menu-orbit,
    .fs-word-wrap,
    .fs-company,
    .fs-loader-wrap,
    .fs-loader,
    .fs-loader::after {
      animation:none!important;
      opacity:1!important;
      transform:none!important;
      filter:none!important;
    }
  }
`;

export default defineComponent({
  name: 'SplashScreen',
  props: ['onComplete'],
  setup(props) {
    onMounted(() => {
      const timeout = window.setTimeout(() => props.onComplete?.(), 4200);
      return () => window.clearTimeout(timeout);
    });

    return () => <div class="finstart-splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6 text-white">
      <style>{splashCss}</style>

      <div class="fs-stage relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <div class="fs-logo-cluster">
          <span class="fs-burst-ring" />
          <span class="fs-burst-ring" />

          {menuIconItems.map((item) => {
            const Icon = item.icon as any;

            return (
              <span
                key={item.label}
                class="fs-menu-orbit"
                style={{ '--fs-x': item.x, '--fs-y': item.y, '--fs-delay': item.delay } as any}
                title={item.label}
                aria-label={item.label}
              >
                <Icon />
              </span>
            );
          })}

          <div class="fs-logo-shell flex h-40 w-40 items-center justify-center rounded-[30px] border border-blue-100/90 bg-white/96 p-3 shadow-[0_28px_78px_rgba(0,0,0,.28)] backdrop-blur-xl sm:h-44 sm:w-44">
            <img src={FinStartSplashLogo} class="fs-logo h-full w-full rounded-[24px] object-contain" alt="Logo FinStart" />
          </div>
        </div>

        <div class="fs-word-wrap mt-2 overflow-hidden">
          <p class="fs-word text-[2.15rem] font-black sm:text-[2.8rem]">FINSTART</p>
        </div>

        <div class="fs-company">
          <p class="mt-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#BFD8F7]">PT Kedata Indonesia Digital</p>
          <p class="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#8FB2DD]">Financial Operations Workspace</p>
        </div>

        <div class="fs-loader-wrap mt-6 w-72 overflow-hidden rounded-full border border-white/18 bg-white/12 p-[4px] shadow-[0_18px_44px_rgba(0,0,0,.22)] backdrop-blur-xl sm:w-80">
          <span class="fs-loader relative block h-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ffffff] via-[#2BA7FF] to-[#16A085]" />
        </div>
      </div>
    </div>;
  },
});
</script>
