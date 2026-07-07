<script lang="tsx">
import { defineComponent, onMounted } from 'vue';
import FinStartMark from '../assets/finstart-logo-mark.png';

const splashCss = `
  .fs-splash { background: radial-gradient(circle at 50% 40%, rgba(40,151,255,.20), transparent 25%), radial-gradient(circle at 20% 18%, rgba(49,119,255,.13), transparent 24%), linear-gradient(145deg,#06152d 0%,#0a2450 53%,#07182f 100%); }
  .fs-splash-grid { background-image: linear-gradient(rgba(160,213,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(160,213,255,.05) 1px,transparent 1px); background-size:44px 44px; mask-image:radial-gradient(circle at center,black 18%,transparent 74%); }
  .fs-splash-glow { animation:fsGlow 2.35s ease-in-out infinite; }
  .fs-splash-orbit { animation:fsOrbit 8s linear infinite; }
  .fs-splash-stage { animation:fsStage .72s cubic-bezier(.16,1,.3,1) both; }
  .fs-splash-piece { position:absolute; inset:0; background-image:var(--finstart-mark); background-size:100% 100%; background-position:center; background-repeat:no-repeat; opacity:0; filter:drop-shadow(0 0 18px rgba(42,155,255,.9)); animation:fsPieceMerge .92s cubic-bezier(.16,1,.3,1) forwards; animation-delay:var(--delay); }
  .fs-splash-piece.one { clip-path:polygon(0 0,54% 0,43% 100%,0 100%); --x:-88px; --y:-34px; --r:-20deg; }
  .fs-splash-piece.two { clip-path:polygon(44% 0,100% 0,100% 48%,55% 59%); --x:88px; --y:-36px; --r:18deg; }
  .fs-splash-piece.three { clip-path:polygon(0 57%,47% 43%,100% 49%,100% 100%,0 100%); --x:12px; --y:88px; --r:9deg; }
  .fs-splash-final { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; opacity:0; filter:drop-shadow(0 0 24px rgba(68,174,255,.74)); animation:fsFinalReveal .5s ease-out 1.02s forwards; }
  .fs-splash-radiant { position:absolute; inset:-22%; border-radius:999px; background:radial-gradient(circle,rgba(90,192,255,.2),transparent 62%); animation:fsGlow 2.4s ease-in-out infinite; }
  .fs-splash-word { opacity:0; transform:translateY(16px); animation:fsWord .6s cubic-bezier(.16,1,.3,1) 1.12s forwards; }
  .fs-splash-sub { opacity:0; transform:translateY(10px); animation:fsWord .5s cubic-bezier(.16,1,.3,1) 1.26s forwards; }
  .fs-splash-shine { position:absolute; inset:-34%; background:linear-gradient(108deg,transparent 42%,rgba(255,255,255,.72) 50%,transparent 58%); transform:translateX(-125%) rotate(4deg); animation:fsShine 1.15s ease-out 1.05s forwards; mix-blend-mode:screen; pointer-events:none; }
  @keyframes fsStage { from { opacity:0; transform:scale(.82) translateY(14px) } to { opacity:1; transform:scale(1) translateY(0) } }
  @keyframes fsPieceMerge { 0%{opacity:0;transform:translate(var(--x),var(--y)) rotate(var(--r)) scale(.72)} 42%{opacity:1} 100%{opacity:1;transform:translate(0,0) rotate(0) scale(1)} }
  @keyframes fsFinalReveal { to { opacity:1; transform:scale(1.025) } }
  @keyframes fsWord { to { opacity:1; transform:translateY(0) } }
  @keyframes fsGlow { 0%,100% { opacity:.5; transform:scale(.92) } 50% { opacity:1; transform:scale(1.08) } }
  @keyframes fsOrbit { to { transform:rotate(360deg) } }
  @keyframes fsShine { to { transform:translateX(125%) rotate(4deg) } }
  @media (prefers-reduced-motion:reduce) { .fs-splash-glow,.fs-splash-orbit,.fs-splash-stage,.fs-splash-piece,.fs-splash-final,.fs-splash-word,.fs-splash-sub,.fs-splash-shine { animation:none!important; opacity:1!important; transform:none!important; } }
`;

export default defineComponent({
  name: 'SplashScreen',
  props: ['onComplete'],
  setup(props) {
    onMounted(() => {
      const timeout = window.setTimeout(() => props.onComplete?.(), 2300);
      return () => window.clearTimeout(timeout);
    });

    return () => <div class="fs-splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6 text-white">
      <style>{splashCss}</style>
      <div class="fs-splash-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div class="fs-splash-glow pointer-events-none absolute left-1/2 top-1/2 h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/10" />
      <div class="fs-splash-orbit pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/15" />
      <div class="relative z-10 flex flex-col items-center text-center">
        <div class="fs-splash-stage relative flex h-52 w-52 items-center justify-center rounded-[38px] border border-white/15 bg-white/[.055] p-5 shadow-[0_26px_90px_rgba(1,11,35,.46)] backdrop-blur-xl sm:h-60 sm:w-60" style={{ '--finstart-mark': `url(${FinStartMark})` }} aria-label="Logo FinStart terbentuk dari tiga potongan">
          <div class="fs-splash-radiant pointer-events-none" />
          <div class="relative z-10 h-full w-full">
            <span class="fs-splash-piece one" style={{ '--delay': '0ms' }} />
            <span class="fs-splash-piece two" style={{ '--delay': '90ms' }} />
            <span class="fs-splash-piece three" style={{ '--delay': '180ms' }} />
            <img src={FinStartMark} class="fs-splash-final" alt="FinStart logo" />
            <span class="fs-splash-shine" />
          </div>
        </div>
        <div class="mt-6 overflow-hidden">
          <p class="fs-splash-word text-[2.15rem] font-black tracking-[.22em] text-white sm:text-[2.75rem]">FINSTART</p>
          <p class="fs-splash-sub mt-2 text-[10px] font-bold uppercase tracking-[.26em] text-sky-200 sm:text-xs">Financial Operations Workspace</p>
        </div>
      </div>
      <p class="absolute bottom-8 text-center text-[10px] font-semibold uppercase tracking-[.2em] text-sky-100/55">PT Kedata Indonesia Digital</p>
    </div>;
  },
});
</script>
