<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { motion, AnimatePresence } from "../compat/motion.js";
import { ArrowRight, Cpu, Database, Activity, FileText, MessageSquare, Shield, Target, ExternalLink, Mail, Phone, MapPin, Linkedin, Award, Lock, Server, TrendingUp, Layers, Compass, HeartPulse, DollarSign, Factory, Landmark, ShoppingBag, GraduationCap, Radio, Truck, Home, Film, Zap, Leaf, ShieldCheck, Check, Menu, X, Info, Lightbulb, Workflow, Briefcase, CheckCircle2, ChevronLeft, ChevronRight, BarChart3, HelpCircle, Eye, Settings, Users, Calendar, Building, BookOpen } from "lucide-vue-next";
import KedataLogo from './KedataLogo.vue';
interface LandingPageProps {
  onLoginClick: () => void;
}
function ClientLogo({
  id,
  isActive
}: {
  id: number;
  isActive: boolean;
}) {
  switch (id) {
    case 1:
      // Kementerian Kesehatan RI
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#f0fdf4" />
          <path d="M60,35 v50 M35,60 h50" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />
          <path d="M50,42 C40,50 40,70 50,78" stroke="#3B82F6" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M70,42 C80,50 80,70 70,78" stroke="#3B82F6" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="60" r="4" fill="#F59E0B" />
        </svg>;
    case 2:
      // Pertamina & Pertagas
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,25 L60,25 L45,65 Z" fill="#EF4444" />
          <path d="M65,25 L100,25 L85,65 Z" fill="#2563EB" />
          <path d="M42,70 L88,70 L65,100 Z" fill="#10B981" />
        </svg>;
    case 3:
      // Nahdlatul Ulama (PBNU)
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#047857" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="60" cy="60" r="38" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M40,60 Q60,35 80,60 Q60,85 40,60" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.8" />
          <line x1="25" y1="60" x2="95" y2="60" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          <line x1="60" y1="25" x2="60" y2="95" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          <polygon points="60,18 62,21 66,21 63,23 64,26 60,24 56,26 57,23 54,21 58,21" fill="#F59E0B" />
          <polygon points="40,28 42,31 46,31 43,33 44,36 40,34 36,36 37,33 34,31 38,31" fill="#F59E0B" />
          <polygon points="80,28 82,31 86,31 83,33 84,36 80,34 76,36 77,33 74,31 78,31" fill="#F59E0B" />
          <polygon points="30,44 32,47 36,47 33,49 34,52 30,50 26,52 27,49 24,47 28,47" fill="#F59E0B" />
          <polygon points="90,44 92,47 96,47 93,49 94,52 90,50 86,52 87,49 84,47 88,47" fill="#F59E0B" />
        </svg>;
    case 4:
      // Duke-NUS Singapore
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,20 L95,20 L95,60 C95,82 60,105 60,105 C60,105 25,82 25,60 Z" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="60" cy="45" r="13" stroke="#F59E0B" strokeWidth="2" fill="none" />
          <path d="M45,45 H75" stroke="#F59E0B" strokeWidth="3" />
          <text x="60" y="78" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="0.5" textAnchor="middle">DUKE-NUS</text>
          <text x="60" y="88" fill="#F59E0B" fontSize="7" fontWeight="bold" letterSpacing="0.5" textAnchor="middle">MED SCHOOL</text>
        </svg>;
    case 5:
      // Bappenas RI
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" x="10" y="10" rx="16" fill="#f0fdfa" />
          <path d="M38,35 C38,35 52,24 58,40 C64,56 48,66 54,82" stroke="#0D9488" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M53,35 C53,35 67,24 73,40 C79,56 63,66 69,82" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M68,35 C68,35 82,24 88,40 C94,56 78,66 84,82" stroke="#0F766E" strokeWidth="8" strokeLinecap="round" fill="none" />
        </svg>;
    case 6:
      // Astra & Isuzu
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#1E40AF" />
          <path d="M30,60 Q60,25 90,60 Q60,95 30,60" stroke="#FFFFFF" strokeWidth="4" fill="none" />
          <circle cx="60" cy="60" r="10" fill="#EF4444" />
          <line x1="20" y1="60" x2="100" y2="60" stroke="#FFFFFF" strokeWidth="3" />
          <text x="60" y="90" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">ASTRA</text>
        </svg>;
    case 7:
      // Tanoto Foundation
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#0F766E" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M60,28 C78,28 82,45 60,88 C38,45 42,28 60,28 Z" fill="#F59E0B" />
          <path d="M60,28 Q66,50 60,88" stroke="#0F766E" strokeWidth="2.5" />
          <line x1="60" y1="50" x2="72" y2="42" stroke="#0F766E" strokeWidth="1.5" />
          <line x1="60" y1="64" x2="48" y2="56" stroke="#0F766E" strokeWidth="1.5" />
        </svg>;
    case 8:
      // World Health Organization
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" stroke="#2563EB" strokeWidth="3" fill="#EFF6FF" />
          <circle cx="60" cy="60" r="33" stroke="#93C5FD" strokeWidth="1.2" />
          <circle cx="60" cy="60" r="18" stroke="#93C5FD" strokeWidth="1.2" />
          <line x1="18" y1="60" x2="102" y2="60" stroke="#93C5FD" strokeWidth="1.2" />
          <line x1="60" y1="18" x2="60" y2="102" stroke="#93C5FD" strokeWidth="1.2" />
          <path d="M35,35 L85,85 M35,85 L85,35" stroke="#93C5FD" strokeWidth="0.8" opacity="0.6" />
          <line x1="60" y1="22" x2="60" y2="98" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round" />
          <path d="M46,80 Q74,68 60,52 Q46,36 60,28" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>;
    case 9:
      // Komisi Pemberantasan Korupsi (KPK)
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,22 L100,22 L94,68 C94,84 60,102 60,102 C60,102 26,84 20,68 Z" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="60" cy="58" r="24" fill="#000000" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="60" y="65" fill="#FFFFFF" fontSize="16" fontWeight="900" letterSpacing="0.2" textAnchor="middle">KPK</text>
        </svg>;
    case 10:
      // BNN RI
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#1D4ED8" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="38" fill="#1E3A8A" />
          <polygon points="60,27 62,30 65,30 63,32 64,35 60,33 56,35 57,32 55,30 58,30" fill="#F59E0B" />
          <text x="60" y="52" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">BNN</text>
          <text x="60" y="66" fill="#F59E0B" fontSize="8" fontWeight="bold" textAnchor="middle">REPUBLIK</text>
          <text x="60" y="75" fill="#F59E0B" fontSize="8" fontWeight="bold" textAnchor="middle">INDONESIA</text>
        </svg>;
    case 11:
      // Allam Medica Hospital
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" />
          <path d="M40,45 C40,35 55,30 60,42 C65,30 80,35 80,45 C80,62 60,78 60,78 C60,78 40,62 40,45 Z" fill="#ef4444" />
          <text x="60" y="94" fill="#ef4444" fontSize="10" fontWeight="900" textAnchor="middle">ALLAM MEDICA</text>
        </svg>;
    case 12:
      // PT Inspirasien Srikandi Indonesia
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#f0fdfa" />
          <path d="M40,60 C40,45 52,45 60,60 C68,75 80,75 80,60 C80,45 68,45 60,60 C52,75 40,75 40,60 Z" stroke="#0d9488" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="60" r="6" fill="#ec4899" />
          <text x="60" y="96" fill="#0d9488" fontSize="8" fontWeight="bold" textAnchor="middle">INSPIRASIEN</text>
        </svg>;
    case 13:
      // Tamtech
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" x="10" y="10" rx="16" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <rect x="25" y="25" width="70" height="45" rx="4" fill="#1e293b" />
          <path d="M45,85 L75,85" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <path d="M60,70 L60,85" stroke="#64748b" strokeWidth="6" />
          <circle cx="35" cy="35" r="3" fill="#10b981" />
          <circle cx="45" cy="35" r="3" fill="#3b82f6" />
          <path d="M40,55 L55,45 L65,52 L80,40" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="60" y="103" fill="#334155" fontSize="9" fontWeight="900" textAnchor="middle">TAMTECH</text>
        </svg>;
    case 14:
      // RSA UGM
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fefaf0" stroke="#d97706" strokeWidth="2" />
          <polygon points="60,20 85,38 85,72 60,90 35,72 35,38" fill="#1e3a8a" />
          <path d="M60,35 v40 M40,55 h40" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          <circle cx="60" cy="55" r="14" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <text x="60" y="103" fill="#1e3a8a" fontSize="8" fontWeight="900" textAnchor="middle">RSA UGM</text>
        </svg>;
    case 15:
      // OIKN (Otorita Ibu Kota Nusantara)
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#f0fdf4" stroke="#15803d" strokeWidth="1.5" />
          <path d="M60,82 V35 M60,45 Q75,35 80,50 Q60,60 60,82 M60,55 Q45,45 40,60 Q60,70 60,82" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="35" r="4" fill="#eab308" />
          <circle cx="80" cy="50" r="3" fill="#eab308" />
          <circle cx="40" cy="60" r="3" fill="#eab308" />
          <text x="60" y="96" fill="#15803d" fontSize="8" fontWeight="900" textAnchor="middle">NUSANTARA</text>
        </svg>;
    case 16:
      // Biro Tapem SETDA DIY
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
          <path d="M40,30 L80,30 L80,45 C80,65 60,85 60,85 C60,85 40,65 40,45 Z" fill="#b91c1c" />
          <circle cx="60" cy="50" r="10" fill="#f59e0b" />
          <path d="M48,35 C52,42 68,42 72,35" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <text x="60" y="98" fill="#991b1b" fontSize="7" fontWeight="bold" textAnchor="middle">BIRO TAPEM</text>
        </svg>;
    case 17:
      // UNDP
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" x="20" y="20" rx="8" fill="#006eb6" />
          <text x="60" y="52" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle" letterSpacing="0.5">UN</text>
          <text x="60" y="74" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle" letterSpacing="0.5">DP</text>
          <path d="M30,85 H90" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>;
    case 18:
      // PT Symbolic
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fff5f5" stroke="#e11d48" strokeWidth="1.5" />
          <path d="M35,50 Q45,35 60,50 Q75,35 85,50 Q85,75 60,85 Q35,75 35,50 Z" fill="#e11d48" />
          <circle cx="48" cy="50" r="3" fill="#ffffff" />
          <circle cx="72" cy="50" r="3" fill="#ffffff" />
          <path d="M50,65 Q60,72 70,65" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <text x="60" y="100" fill="#be123c" fontSize="8" fontWeight="900" textAnchor="middle">SYMBOLIC</text>
        </svg>;
    case 19:
      // DPR RI
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
          <path d="M30,68 C30,42 90,42 90,68 Z" fill="#10b981" />
          <path d="M60,40 V68" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M45,45 Q60,65 75,45" stroke="#ffffff" strokeWidth="1.5" fill="none" />
          <rect x="25" y="68" width="70" height="6" fill="#047857" rx="1" />
          <text x="60" y="93" fill="#047857" fontSize="8" fontWeight="900" textAnchor="middle">DPR-RI</text>
        </svg>;
    case 20:
      // BKPSDM Kota Yogyakarta
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fffbeb" stroke="#b45309" strokeWidth="1.5" />
          <rect x="56" y="38" width="8" height="35" fill="#d97706" rx="1" />
          <polygon points="60,25 65,38 55,38" fill="#b45309" />
          <rect x="50" y="73" width="20" height="8" fill="#b45309" rx="1" />
          <text x="60" y="98" fill="#78350f" fontSize="7" fontWeight="bold" textAnchor="middle">YOGYAKARTA</text>
        </svg>;
    case 21:
      // Pertagas
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fafafa" stroke="#e11d48" strokeWidth="1.5" />
          <path d="M30,40 H90 V75 H30 Z" fill="#ef4444" opacity="0.1" />
          <path d="M35,45 C50,45 50,65 65,65 C80,65 80,45 90,45" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M35,65 C50,65 50,45 65,45 C80,45 80,65 90,65" stroke="#10b981" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <text x="60" y="95" fill="#ef4444" fontSize="8" fontWeight="900" textAnchor="middle">PERTAGAS</text>
        </svg>;
    case 22:
      // Mercy Corps–BNPB
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
          <rect x="30" y="45" width="60" height="25" fill="#dc2626" rx="3" />
          <text x="60" y="62" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">MERCY</text>
          <text x="60" y="93" fill="#dc2626" fontSize="8" fontWeight="black" textAnchor="middle">CORPS</text>
        </svg>;
    case 23:
      // PDIP
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
          <path d="M45,45 Q60,35 75,45 Q80,60 60,82 Q40,60 45,45 Z" fill="#1e293b" />
          <path d="M40,32 Q50,42 48,46 M80,32 Q70,42 72,46" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="53" cy="52" r="2.5" fill="#ffffff" />
          <circle cx="67" cy="52" r="2.5" fill="#ffffff" />
          <text x="60" y="96" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">PDIP</text>
        </svg>;
    case 24:
      // Partai Kebangkitan Bangsa (PKB)
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#15803d" stroke="#f59e0b" strokeWidth="2" />
          <rect x="35" y="45" width="50" height="30" fill="#166534" rx="2" stroke="#ffffff" strokeWidth="1" />
          <polygon points="60,25 62,29 66,29 63,31 64,35 60,33 56,35 57,31 54,29 58,29" fill="#f59e0b" />
          <polygon points="45,30 47,33 50,33 48,35 49,38 45,36 41,38 42,35 40,33 43,33" fill="#f59e0b" />
          <polygon points="75,30 77,33 80,33 78,35 79,38 75,36 71,38 72,35 70,33 73,33" fill="#f59e0b" />
          <text x="60" y="93" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">PKB</text>
        </svg>;
    case 25:
      // Pemerintah Provinsi Kalimantan Barat
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
          <polygon points="60,22 82,38 82,74 60,92 38,74 38,38" fill="#0284c7" />
          <path d="M50,42 L70,42 L75,70 L45,70 Z" fill="#10b981" />
          <circle cx="60" cy="55" r="7" fill="#eab308" />
          <text x="60" y="104" fill="#0369a1" fontSize="7" fontWeight="bold" textAnchor="middle">KALIMANTAN BARAT</text>
        </svg>;
    case 26:
      // Pemerintah Daerah Tubaba
      return <svg viewBox="0 0 120 120" class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#fcfdf5" stroke="#854d0e" strokeWidth="1.5" />
          <path d="M35,30 L85,30 L80,72 C80,85 60,95 60,95 C60,95 40,85 40,72 Z" fill="#15803d" />
          <polygon points="60,40 70,55 50,55" fill="#facc15" />
          <text x="60" y="103" fill="#166534" fontSize="8" fontWeight="bold" textAnchor="middle">TUBABA</text>
        </svg>;
    default:
      return null;
  }
}
void ClientLogo;
export default defineComponent({
  name: "LandingPage",
  props: ["onLoginClick"],
  setup(props) {
    const {
      onLoginClick
    }: LandingPageProps = props;
    const isProjectModalOpen = ref(false),
      setIsProjectModalOpen = next => isProjectModalOpen.value = typeof next === "function" ? next(isProjectModalOpen.value) : next;
    const selectedProductIndex = ref(null),
      setSelectedProductIndex = next => selectedProductIndex.value = typeof next === "function" ? next(selectedProductIndex.value) : next;
    const selectedFeatureDetailIndex = ref(null),
      setSelectedFeatureDetailIndex = next => selectedFeatureDetailIndex.value = typeof next === "function" ? next(selectedFeatureDetailIndex.value) : next;
    const selectedProjectDetailIndex = ref(null),
      setSelectedProjectDetailIndex = next => selectedProjectDetailIndex.value = typeof next === "function" ? next(selectedProjectDetailIndex.value) : next; // Curved Rotating Carousel State
    const activeClientIndex = ref(0),
      setActiveClientIndex = next => activeClientIndex.value = typeof next === "function" ? next(activeClientIndex.value) : next;
    const isDraggingRef = ref(false);

    // Smooth scroll handler
    const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    // Carousel Items representing the real clients from Gambar 3
    const clientCarouselItems = [{
      id: 1,
      logoId: 4,
      // Duke-NUS
      clientName: "Duke-NUS Medical School",
      title: "PathGen AI Platform",
      desc: "Mengembangkan PathGen AI, platform genomik patogen untuk mendukung keputusan kesehatan publik.",
      metric: "Sequencing Genomik",
      status: "COMPLETED",
      metricLabel: "Fokus Proyek",
      metricValue: "Genomik Patogen"
    }, {
      id: 2,
      logoId: 3,
      // PBNU
      clientName: "PBNU",
      title: "Digdaya Dashboard",
      desc: "Membuat Digdaya Dashboard untuk monitoring dan evaluasi implementasi surat digital.",
      metric: "Monev Tracker",
      status: "DEPLOYED",
      metricLabel: "Integrasi",
      metricValue: "Surat Digital"
    }, {
      id: 3,
      logoId: 3,
      // PBNU
      clientName: "PBNU",
      title: "Digdaya AI Assistant",
      desc: "Membuat Digdaya AI, asisten AI untuk menjawab pertanyaan organisasi dan membantu pekerjaan pengurus.",
      metric: "AI Chatbot",
      status: "ACTIVE SYNC",
      metricLabel: "Platform",
      metricValue: "Asisten Pintar"
    }, {
      id: 4,
      logoId: 3,
      // PBNU
      clientName: "PBNU",
      title: "Digdaya Kader Platform",
      desc: "Membuat platform Digdaya Kader untuk registrasi, pendataan, pelatihan, dan sertifikasi kader.",
      metric: "Database Kader",
      status: "LIVE SYSTEM",
      metricLabel: "Registrasi",
      metricValue: "Kader Nasional"
    }, {
      id: 5,
      logoId: 11,
      // Allam Medica
      clientName: "Allam Medica Hospital",
      title: "Hospital Network Consultation",
      desc: "Konsultasi dan peningkatan infrastruktur serta arsitektur jaringan rumah sakit secara komprehensif.",
      metric: "Arsitektur Jaringan",
      status: "VERIFIED",
      metricLabel: "SIMRS & Network",
      metricValue: "Allam Medica"
    }, {
      id: 6,
      logoId: 12,
      // Inspirasien
      clientName: "PT Inspirasien Srikandi Indonesia",
      title: "Patient Companion App",
      desc: "Mengembangkan aplikasi mobile pendamping pasien penyakit kronis, psikiater, dan survivor.",
      metric: "Aplikasi Mobile",
      status: "ACTIVE SYNC",
      metricLabel: "Fokus",
      metricValue: "Pasien & Survivor"
    }, {
      id: 7,
      logoId: 13,
      // Tamtech
      clientName: "Tamtech",
      title: "IT Infrastructure Monitoring",
      desc: "Mengembangkan sistem monitoring infrastruktur IT rumah sakit secara real-time.",
      metric: "Real-time Monitoring",
      status: "RUNNING",
      metricLabel: "Sistem",
      metricValue: "SIMRS Network"
    }, {
      id: 8,
      logoId: 13,
      // Tamtech
      clientName: "Tamtech",
      title: "SIMRS Tech Audit",
      desc: "Audit teknologi dan konsultasi strategi pengembangan aplikasi SIMRS-TAMTECH.",
      metric: "Rekomendasi Audit",
      status: "COMPLETED",
      metricLabel: "Audit",
      metricValue: "SIMRS-TAMTECH"
    }, {
      id: 9,
      logoId: 14,
      // RSA UGM
      clientName: "RSA UGM",
      title: "BPJS AI Verification",
      desc: "Membuat sistem verifikasi BPJS berbasis AI untuk Rumah Sakit Akademik UGM.",
      metric: "Auto-Verification",
      status: "ACTIVE SYNC",
      metricLabel: "Sasaran",
      metricValue: "Klaim BPJS"
    }, {
      id: 10,
      logoId: 15,
      // OIKN
      clientName: "OIKN",
      title: "IKN Smart Health Mobile",
      desc: "Mengembangkan aplikasi IKN Smart Health Mobile: registrasi fasilitas kesehatan, telemedicine, farmasi, home care, dan laboratorium.",
      metric: "Nusantara Mobile",
      status: "LIVE SYSTEM",
      metricLabel: "Layanan",
      metricValue: "Telemedicine"
    }, {
      id: 11,
      logoId: 15,
      // OIKN
      clientName: "OIKN",
      title: "Nusantara Control Command",
      desc: "Mengembangkan sistem Integrated Control Command Center untuk Nusantara Smart City.",
      metric: "Command Center",
      status: "DEPLOYED",
      metricLabel: "Smart City",
      metricValue: "Nusantara Control"
    }, {
      id: 12,
      logoId: 1,
      // Kemenkes
      clientName: "Kementerian Kesehatan",
      title: "Material Transfer Agreement",
      desc: "Mengembangkan sistem Material Transfer Agreement (MTA) untuk pencatatan transfer material biologis.",
      metric: "Biosecurity Data",
      status: "ACTIVE SYNC",
      metricLabel: "Registrasi",
      metricValue: "MTA Data"
    }, {
      id: 13,
      logoId: 1,
      // Kemenkes
      clientName: "Kementerian Kesehatan",
      title: "National Bioregistry System",
      desc: "Mengembangkan modul National Registry pada sistem Bioregistry Kementerian Kesehatan.",
      metric: "National Registry",
      status: "DEPLOYED",
      metricLabel: "Database",
      metricValue: "Bioregistry"
    }, {
      id: 14,
      logoId: 1,
      // Kemenkes
      clientName: "Kementerian Kesehatan",
      title: "FHIR SATUSEHAT Sync",
      desc: "Integrasi data pasien Kemedis dengan standar FHIR agar terhubung ke platform SATUSEHAT.",
      metric: "SATUSEHAT Sync",
      status: "ACTIVE SYNC",
      metricLabel: "Integrasi",
      metricValue: "HL7 FHIR API"
    }, {
      id: 15,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "RPMKAL 2 SINKAL Module",
      desc: "Mengembangkan fitur RPMKAL 2 pada Sistem Informasi Kalurahan/SINKAL DIY.",
      metric: "SINKAL Module",
      status: "LIVE SYSTEM",
      metricLabel: "Aplikasi",
      metricValue: "SINKAL DIY"
    }, {
      id: 16,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "Peladi Makerti SINKAL",
      desc: "Mengembangkan fitur Peladi Makerti dalam SINKAL untuk integrasi data kependudukan dan sosial.",
      metric: "Peladi Makerti",
      status: "ACTIVE SYNC",
      metricLabel: "Sistem",
      metricValue: "SINKAL DIY"
    }, {
      id: 17,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "RPMKAL 1 Action Plan",
      desc: "Mengembangkan fitur RPMKAL 1 untuk rencana aksi dan pelacakan capaian tujuan desa.",
      metric: "Monev Desa",
      status: "DEPLOYED",
      metricLabel: "Fokus",
      metricValue: "Rencana Aksi"
    }, {
      id: 18,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "e-SAKIP Akuntabilitas ASN",
      desc: "Meningkatkan aplikasi e-SAKIP untuk akuntabilitas kinerja instansi pemerintah daerah DIY.",
      metric: "Performance Track",
      status: "VERIFIED",
      metricLabel: "Sistem",
      metricValue: "e-SAKIP DIY"
    }, {
      id: 19,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "Sistem Informasi Jagawarga",
      desc: "Mengembangkan Sistem Informasi Jagawarga untuk mendukung keamanan, ketertiban, dan kesejahteraan masyarakat.",
      metric: "Keamanan Warga",
      status: "LIVE SYSTEM",
      metricLabel: "Aplikasi",
      metricValue: "Jagawarga"
    }, {
      id: 20,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "SINKAL DIY Roadmap Study",
      desc: "Studi roadmap Sistem Informasi Kalurahan komprehensif untuk seluruh wilayah DIY.",
      metric: "Studi Roadmap",
      status: "COMPLETED",
      metricLabel: "Output",
      metricValue: "Roadmap Study"
    }, {
      id: 21,
      logoId: 8,
      // WHO
      clientName: "World Health Organization",
      title: "Clinical Bioregistry Platform",
      desc: "Mengembangkan platform clinical registry untuk mengelola data bioregistry Kementerian Kesehatan.",
      metric: "Clinical Registry",
      status: "DEPLOYED",
      metricLabel: "Standard",
      metricValue: "WHO Database"
    }, {
      id: 22,
      logoId: 6,
      // Astra
      clientName: "Astra Internasional",
      title: "Facebook Sentiment Analysis",
      desc: "Analisis media sosial Facebook untuk mendapatkan insight produk secara akurat.",
      metric: "Sentiment Insight",
      status: "COMPLETED",
      metricLabel: "Kanal",
      metricValue: "Facebook API"
    }, {
      id: 23,
      logoId: 6,
      // Astra
      clientName: "Astra Internasional",
      title: "Social Media Monitoring",
      desc: "Social media monitoring real-time dan laporan analitik percakapan media sosial.",
      metric: "Real-time Tracker",
      status: "RUNNING",
      metricLabel: "Brand",
      metricValue: "Social Monitor"
    }, {
      id: 24,
      logoId: 17,
      // UNDP
      clientName: "UNDP",
      title: "One Health Dashboard",
      desc: "Mengembangkan dashboard One Health dan arsitektur data Kemenkes untuk akses publik maupun privat.",
      metric: "One Health Portal",
      status: "DEPLOYED",
      metricLabel: "Integrasi",
      metricValue: "UNDP & Kemenkes"
    }, {
      id: 25,
      logoId: 18,
      // PT Symbolic
      clientName: "PT Symbolic",
      title: "NLP Abstractive Summary",
      desc: "Mengembangkan model machine learning untuk ringkasan teks abstraktif Bahasa Indonesia dan Inggris.",
      metric: "LLM Abstractive",
      status: "VERIFIED",
      metricLabel: "Teknologi",
      metricValue: "NLP Modeling"
    }, {
      id: 26,
      logoId: 19,
      // DPR RI
      clientName: "DPR RI",
      title: "Setjen DPR RI Front-End",
      desc: "Mengembangkan front-end website Sekretariat Jenderal DPR RI dengan Bootstrap dan HTML.",
      metric: "Bootstrap Web",
      status: "COMPLETED",
      metricLabel: "Platform",
      metricValue: "Front-End Portal"
    }, {
      id: 27,
      logoId: 19,
      // DPR RI
      clientName: "DPR RI",
      title: "DPR RI Portal Redesign",
      desc: "Redesign website DPR RI menggunakan Next.js, multi-theme, serta aksesibilitas untuk disabilitas.",
      metric: "Next.js Portal",
      status: "ACTIVE SYNC",
      metricLabel: "Aksesibilitas",
      metricValue: "Disabilitas Ready"
    }, {
      id: 28,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "SINKAL Technical Training",
      desc: "Pelatihan penggunaan aplikasi dan persiapan data untuk implementasi SINKAL DIY.",
      metric: "ASN Capability",
      status: "COMPLETED",
      metricLabel: "Fokus",
      metricValue: "Pelatihan SINKAL"
    }, {
      id: 29,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem",
      title: "SIDAKAL DIY Integration",
      desc: "Mengembangkan SIDAKAL untuk integrasi data monografi dan portal desa di DIY.",
      metric: "Portal Integrasi",
      status: "LIVE SYSTEM",
      metricLabel: "Database",
      metricValue: "SIDAKAL Portal"
    }, {
      id: 30,
      logoId: 6,
      // Astra
      clientName: "Astra Internasional",
      title: "Product Insight Monitor",
      desc: "Social media monitoring real-time dan penyusunan laporan insight produk secara terstruktur.",
      metric: "Insight Laporan",
      status: "COMPLETED",
      metricLabel: "Jenis",
      metricValue: "Product Insight"
    }, {
      id: 31,
      logoId: 1,
      // Kemenlu (using fallback/general blue style of health)
      clientName: "Kementerian Luar Negeri",
      title: "ASEAN Vaccine Verification",
      desc: "Mengembangkan aplikasi verifikasi sertifikat vaksin internasional ASEAN.",
      metric: "Vaccine Verifier",
      status: "DEPLOYED",
      metricLabel: "Cakupan",
      metricValue: "ASEAN Countries"
    }, {
      id: 32,
      logoId: 20,
      // BKPSDM
      clientName: "BKPSDM Kota Yogyakarta",
      title: "Satu Data Indonesia",
      desc: "Pelatihan implementasi Satu Data Indonesia untuk ASN Pemerintah Kota Yogyakarta.",
      metric: "Satu Data Indonesia",
      status: "COMPLETED",
      metricLabel: "Jenis",
      metricValue: "Pelatihan ASN"
    }, {
      id: 33,
      logoId: 21,
      // Pertagas
      clientName: "Pertagas",
      title: "Financial Power BI System",
      desc: "Mengembangkan dashboard keuangan menggunakan Power BI untuk data anak perusahaan.",
      metric: "Power BI Sync",
      status: "LIVE SYSTEM",
      metricLabel: "Analisis",
      metricValue: "Financial Tracker"
    }, {
      id: 34,
      logoId: 22,
      // Mercy Corps
      clientName: "Mercy Corps–BNPB",
      title: "Disaster Data Interoperability",
      desc: "Mengembangkan portal interoperabilitas dan publikasi data bencana melalui API.",
      metric: "Disaster API",
      status: "ACTIVE SYNC",
      metricLabel: "Integrasi",
      metricValue: "Interoperabilitas"
    }, {
      id: 35,
      logoId: 16,
      // Biro Tapem
      clientName: "Biro Tapem DIY",
      title: "SINKAL Research & Dev",
      desc: "Riset dan pengembangan Sistem Informasi Kalurahan/SINKAL di empat kabupaten DIY.",
      metric: "SINKAL Research",
      status: "COMPLETED",
      metricLabel: "Cakupan",
      metricValue: "4 Kabupaten DIY"
    }, {
      id: 36,
      logoId: 1,
      // Kemenkes
      clientName: "Kementerian Kesehatan",
      title: "SPBE Enterprise Architecture",
      desc: "Menyusun Enterprise Architecture untuk SPBE dan transformasi teknologi SDM kesehatan.",
      metric: "SPBE Architecture",
      status: "DEPLOYED",
      metricLabel: "Arsitektur",
      metricValue: "EA SDM Kesehatan"
    }, {
      id: 37,
      logoId: 26,
      // Tubaba
      clientName: "Pemerintah Daerah Tubaba",
      title: "Tubaba Smart City Portal",
      desc: "Mengembangkan portal Tubaba Smart City sebagai ekosistem digital pemerintah dan masyarakat.",
      metric: "Smart City",
      status: "LIVE SYSTEM",
      metricLabel: "Portal",
      metricValue: "Tubaba Smart City"
    }, {
      id: 38,
      logoId: 7,
      // Tanoto
      clientName: "Tanoto Foundation",
      title: "IKK LAN Evaluation System",
      desc: "Mengembangkan sistem Indeks Kualitas Kebijakan LAN untuk pengumpulan data dan evaluasi otomatis.",
      metric: "IKK LAN Engine",
      status: "VERIFIED",
      metricLabel: "Sistem",
      metricValue: "Monev Kebijakan"
    }, {
      id: 39,
      logoId: 1,
      // Kemenkes
      clientName: "Kementerian Kesehatan",
      title: "SILACAK 3.0 Interface",
      desc: "Mengembangkan antarmuka SILACAK versi 3.0 dengan ReactJS dan integrasi backend lama berbasis standar DHIS.",
      metric: "SILACAK ReactJS",
      status: "DEPLOYED",
      metricLabel: "Aplikasi",
      metricValue: "SILACAK 3.0 UI"
    }, {
      id: 40,
      logoId: 10,
      // BNN
      clientName: "BNN",
      title: "Social Media Monitoring",
      desc: "Social media monitoring dengan dashboard interaktif dan laporan insight wilayah/objek tertentu.",
      metric: "Geospatial Insight",
      status: "RUNNING",
      metricLabel: "Analisis",
      metricValue: "Sentimen Wilayah"
    }, {
      id: 41,
      logoId: 2,
      // Pertamina
      clientName: "Pertamina",
      title: "Brand Perception Monitor",
      desc: "Social media monitoring dengan laporan insight media sosial dan media online.",
      metric: "Online Media Sync",
      status: "RUNNING",
      metricLabel: "Fokus",
      metricValue: "Brand Sentiment"
    }, {
      id: 42,
      logoId: 9,
      // KPK
      clientName: "KPK",
      title: "Bansos DTKS Mapping",
      desc: "Integrasi, kategorisasi, dan pemetaan data bantuan sosial DTKS untuk transparansi distribusi bansos.",
      metric: "Anti-Fraud Data",
      status: "VERIFIED",
      metricLabel: "Fokus",
      metricValue: "Transparansi Bansos"
    }, {
      id: 43,
      logoId: 23,
      // PDIP
      clientName: "PDIP",
      title: "Social Issue Monitoring",
      desc: "Social media monitoring dan laporan insight isu tertentu dari media sosial serta media online.",
      metric: "Topic Modeling",
      status: "RUNNING",
      metricLabel: "Fokus",
      metricValue: "Monitoring Isu"
    }, {
      id: 44,
      logoId: 16,
      // Kepatihan DIY (using Biro Tapem style)
      clientName: "Kepatihan DIY",
      title: "Social Aid Data Processing",
      desc: "Pengelolaan dan pemrosesan data bantuan sosial agar valid, tidak duplikat, dan sesuai kondisi survei lapangan.",
      metric: "Validasi Lapangan",
      status: "VERIFIED",
      metricLabel: "Sasaran",
      metricValue: "Data Bansos"
    }, {
      id: 45,
      logoId: 16,
      // Dinas Kominfo DIY
      clientName: "Dinas Kominfo DIY",
      title: "Bansos Preprocessing",
      desc: "Integrasi dan preprocessing data bantuan sosial agar valid, tidak duplikat, dan akurat.",
      metric: "Data Consistency",
      status: "ACTIVE SYNC",
      metricLabel: "Fokus",
      metricValue: "Preprocessing Bansos"
    }, {
      id: 46,
      logoId: 25,
      // Pemda Kalbar
      clientName: "Pemerintah Provinsi Kalimantan Barat",
      title: "Regional Analytics Dashboard",
      desc: "Mengembangkan dashboard analitik media sosial untuk memantau sentimen publik dan tren kebijakan daerah.",
      metric: "Public Sentiment",
      status: "LIVE SYSTEM",
      metricLabel: "Cakupan",
      metricValue: "Provinsi Kalbar"
    }, {
      id: 47,
      logoId: 24,
      // PKB
      clientName: "Partai Kebangkitan Bangsa",
      title: "PKB Data API Monitor",
      desc: "Mengembangkan API social media monitoring untuk akuisisi, distribusi, dan integrasi data ke aplikasi lain.",
      metric: "Real-time API Link",
      status: "DEPLOYED",
      metricLabel: "Sistem",
      metricValue: "API Integrator"
    }];
    void clientCarouselItems;
    const financeCarouselItems = [{
      id: 1,
      icon: <BarChart3 class="w-12 h-12" />,
      clientName: 'Dashboard CFO',
      title: 'Ringkasan Kinerja Finance',
      desc: 'Pantau kas, profit margin, proyek berjalan, invoice jatuh tempo, burn rate, dan insight keuangan.',
      metric: 'Live KPI',
      status: 'CORE MODULE',
      metricLabel: 'Output',
      metricValue: 'Executive View'
    }, {
      id: 2,
      icon: <Briefcase class="w-12 h-12" />,
      clientName: 'CRM & Proyek',
      title: 'Lifecycle Proyek dan Klien',
      desc: 'Inisiasi proyek, target kontrak, tipe tender, status proyek, alokasi tim, dan data klien partner.',
      metric: 'Project Flow',
      status: 'ACTIVE',
      metricLabel: 'Fokus',
      metricValue: 'Proyek & Klien'
    }, {
      id: 3,
      icon: <BookOpen class="w-12 h-12" />,
      clientName: 'Buku Besar',
      title: 'Master Akun dan Saldo',
      desc: 'Struktur akun GL, tipe akun, saldo, dan dasar laporan keuangan tersimpan secara rapi.',
      metric: 'GL Ready',
      status: 'ACCOUNTING',
      metricLabel: 'Fokus',
      metricValue: 'Akun & Saldo'
    }, {
      id: 4,
      icon: <Workflow class="w-12 h-12" />,
      clientName: 'Transaksi',
      title: 'Jurnal Debit Kredit',
      desc: 'Catat jurnal transaksi dengan validasi debit-kredit, template cepat, dan riwayat yang mudah diperiksa.',
      metric: 'Balanced',
      status: 'CONTROL',
      metricLabel: 'Fokus',
      metricValue: 'Jurnal'
    }, {
      id: 5,
      icon: <FileText class="w-12 h-12" />,
      clientName: 'Piutang',
      title: 'Invoice dan Pelunasan',
      desc: 'Kelola invoice klien, tanggal jatuh tempo, status pembayaran, overdue, dan catat pelunasan piutang.',
      metric: 'A/R',
      status: 'BILLING',
      metricLabel: 'Fokus',
      metricValue: 'Invoice Klien'
    }, {
      id: 6,
      icon: <Truck class="w-12 h-12" />,
      clientName: 'Utang Vendor',
      title: 'Tagihan dan Pembayaran',
      desc: 'Input tagihan vendor, bukti bayar, sumber kas, tanggal bayar, dan riwayat pembayaran vendor.',
      metric: 'A/P',
      status: 'PAYABLE',
      metricLabel: 'Fokus',
      metricValue: 'Vendor'
    }, {
      id: 7,
      icon: <Landmark class="w-12 h-12" />,
      clientName: 'Perpajakan',
      title: 'PPN, PPh, dan Setoran',
      desc: 'Pantau PPN kurang bayar, PPh 21, PPh 23, status kepatuhan, NTPN, dan riwayat setoran pajak.',
      metric: 'Tax',
      status: 'COMPLIANCE',
      metricLabel: 'Fokus',
      metricValue: 'Pajak'
    }, {
      id: 8,
      icon: <Users class="w-12 h-12" />,
      clientName: 'SDM & Payroll',
      title: 'Pegawai, BPJS, dan Gaji',
      desc: 'Registrasi pegawai, BPJS, kompensasi, payroll bersih, dan arsip dokumen HR digital.',
      metric: 'Payroll',
      status: 'HR FINANCE',
      metricLabel: 'Fokus',
      metricValue: 'SDM'
    }, {
      id: 9,
      icon: <Building class="w-12 h-12" />,
      clientName: 'Aset',
      title: 'Inventaris dan Depresiasi',
      desc: 'Catat aset baru, kategori, harga perolehan, masa manfaat, nilai sisa, dan penyusutan garis lurus.',
      metric: 'Assets',
      status: 'CONTROL',
      metricLabel: 'Fokus',
      metricValue: 'Aset Tetap'
    }, {
      id: 10,
      icon: <Server class="w-12 h-12" />,
      clientName: 'SaaS & Cloud',
      title: 'Burn Rate Digital',
      desc: 'Pantau biaya langganan SaaS, cloud, kategori, siklus, tanggal tagihan, dan estimasi burn rate bulanan.',
      metric: 'Burn Rate',
      status: 'COST OPS',
      metricLabel: 'Fokus',
      metricValue: 'SaaS'
    }, {
      id: 11,
      icon: <TrendingUp class="w-12 h-12" />,
      clientName: 'Proyeksi',
      title: 'Target dan Roadmap Bisnis',
      desc: 'Tetapkan target proyeksi, pantau roadmap pertumbuhan finansial, dan bandingkan target dengan realisasi.',
      metric: 'Forecast',
      status: 'PLANNING',
      metricLabel: 'Fokus',
      metricValue: 'Proyeksi'
    }, {
      id: 12,
      icon: <FileText class="w-12 h-12" />,
      clientName: 'Laporan',
      title: 'Laporan Manajemen',
      desc: 'Susun ringkasan laporan keuangan, neraca, laba rugi, dan data pendukung untuk rapat manajemen.',
      metric: 'Report',
      status: 'OUTPUT',
      metricLabel: 'Fokus',
      metricValue: 'Laporan'
    }];
    const nextSlide = () => {
      setActiveClientIndex(prev => (prev + 1) % financeCarouselItems.length);
    };
    const prevSlide = () => {
      setActiveClientIndex(prev => (prev - 1 + financeCarouselItems.length) % financeCarouselItems.length);
    };

    // Carousel bergerak langsung setiap beberapa detik tanpa indikator loading/progress.
    const isCarouselPaused = ref(false);
    const carouselCycleMs = 4600;
    let carouselTimer: number | undefined;
    const pauseCarousel = () => { isCarouselPaused.value = true; };
    const resumeCarousel = () => { isCarouselPaused.value = false; };
    onMounted(() => {
      carouselTimer = window.setInterval(() => {
        if (!isCarouselPaused.value) nextSlide();
      }, carouselCycleMs);
    });
    onUnmounted(() => {
      if (carouselTimer) window.clearInterval(carouselTimer);
    });

    // Modul utama Finstart
    const sectors = [{
      name: 'Dashboard CFO',
      icon: <BarChart3 class="w-5 h-5" />
    }, {
      name: 'CRM & Proyek',
      icon: <Briefcase class="w-5 h-5" />
    }, {
      name: 'Buku Besar',
      icon: <BookOpen class="w-5 h-5" />
    }, {
      name: 'Jurnal Transaksi',
      icon: <Workflow class="w-5 h-5" />
    }, {
      name: 'Piutang Klien',
      icon: <ArrowRight class="w-5 h-5" />
    }, {
      name: 'Utang Vendor',
      icon: <Truck class="w-5 h-5" />
    }, {
      name: 'Perpajakan',
      icon: <Landmark class="w-5 h-5" />
    }, {
      name: 'SDM & Payroll',
      icon: <Users class="w-5 h-5" />
    }, {
      name: 'Aset Tetap',
      icon: <Building class="w-5 h-5" />
    }, {
      name: 'SaaS & Cloud Cost',
      icon: <Server class="w-5 h-5" />
    }, {
      name: 'Proyeksi Bisnis',
      icon: <TrendingUp class="w-5 h-5" />
    }, {
      name: 'Laporan Keuangan',
      icon: <FileText class="w-5 h-5" />
    }];

    // Fitur unggulan Finstart
    const products = [{
      name: 'Finance Control Center',
      tagline: 'Satu dashboard untuk seluruh kesehatan finansial',
      desc: 'Dashboard eksekutif yang menggabungkan kas, proyek berjalan, piutang, utang, burn rate SaaS, pajak, payroll, dan proyeksi bisnis.',
      features: [{
        title: 'Ringkasan Bank & Kas Lancar',
        detail: 'Tampilkan saldo bank, kas kecil, dan saldo siap pakai secara terpusat.'
      }, {
        title: 'Monitoring invoice jatuh tempo',
        detail: 'Lacak invoice dan status pembayaran hingga entry overdue.'
      }, {
        title: 'KPI proyek, klien, dan profit margin',
        detail: 'Visualisasikan performa proyek, nilai kontrak, dan margin keuntungan.'
      }, {
        title: 'Chart arus kas interaktif',
        detail: 'Tampilkan aliran masuk-keluar kas dengan grafik interaktif dan update real-time.'
      }, {
        title: 'Insight keuangan CFO',
        detail: 'Sajikan ringkasan KPI finance penting untuk keputusan manajemen.'
      }, {
        title: 'Shortcut ke modul operasional',
        detail: 'Akses cepat ke modul buku besar, piutang, utang, pajak, dan payroll.'
      }],
      color: 'from-blue-900 to-indigo-950',
      badge: null
    }, {
      name: 'Project & Client Lifecycle',
      tagline: 'Kelola proyek, klien, tender, dan alokasi tim',
      desc: 'Modul CRM & proyek untuk inisiasi proyek baru, registrasi klien partner, target kontrak, status tender, dan alokasi SDM.',
      features: [{
        title: 'Form inisiasi proyek',
        detail: 'Buat proyek baru dengan target, budget, dan jadwal implementasi.'
      }, {
        title: 'Registrasi mitra klien',
        detail: 'Simpan data klien dan partner secara terpusat untuk referensi proyek.'
      }, {
        title: 'Target nilai kontrak',
        detail: 'Tetapkan nilai kontrak dan milestone finansial yang ingin dicapai.'
      }, {
        title: 'Status tender dan estimasi selesai',
        detail: 'Pantau proses tender dan perkiraan waktu penyelesaian.'
      }, {
        title: 'Alokasi nama dan posisi tim',
        detail: 'Tentukan tim proyek, peran, dan tanggung jawab dalam satu tampilan.'
      }, {
        title: 'Database klien terpusat',
        detail: 'Akses profil klien, sejarah kontrak, dan catatan komunikasi dengan mudah.'
      }],
      color: 'from-slate-900 to-blue-950',
      badge: null
    }, {
      name: 'Accounting & Transaction Core',
      tagline: 'Buku besar, jurnal, debit-kredit, dan saldo akun',
      desc: 'Fondasi akuntansi untuk menjaga struktur akun, pencatatan jurnal, validasi debit-kredit, serta saldo buku besar tetap konsisten.',
      features: [{
        title: 'Master akun buku besar',
        detail: 'Kelola chart of accounts dan kategori akun dengan struktur yang jelas.'
      }, {
        title: 'Template jurnal cepat',
        detail: 'Gunakan template jurnal untuk mempercepat input transaksi berulang.'
      }, {
        title: 'Validasi total debit dan kredit',
        detail: 'Sistem memeriksa keseimbangan jurnal secara otomatis.'
      }, {
        title: 'Format Rupiah konsisten',
        detail: 'Nilai ditampilkan dalam format rupiah yang rapi dan standar.'
      }, {
        title: 'Riwayat transaksi terstruktur',
        detail: 'Telusuri transaksi historis berdasarkan akun dan tanggal.'
      }, {
        title: 'Laporan berbasis GL',
        detail: 'Hasilkan laporan keuangan langsung dari data buku besar.'
      }],
      color: 'from-blue-950 to-indigo-900',
      badge: null
    }, {
      name: 'Receivable & Payable Automation',
      tagline: 'Piutang, pelunasan, tagihan vendor, dan pembayaran',
      desc: 'Kelola invoice klien, pencatatan pelunasan piutang, input tagihan vendor, pembayaran vendor, aging, dan status jatuh tempo.',
      features: [{
        title: 'Invoice dan jatuh tempo',
        detail: 'Buat invoice pelanggan dengan tanggal jatuh tempo dan status pembayaran.'
      }, {
        title: 'Catat pelunasan piutang',
        detail: 'Update status pembayaran saat piutang diterima.'
      }, {
        title: 'Input tagihan vendor',
        detail: 'Masukkan tagihan supplier dengan detail biaya dan jatuh tempo.'
      }, {
        title: 'Catat pembayaran vendor',
        detail: 'Rekam pengeluaran dan bukti pembayaran vendor secara terstruktur.'
      }, {
        title: 'Status overdue dan paid',
        detail: 'Identifikasi piutang atau utang yang sudah jatuh tempo dan lunas.'
      }, {
        title: 'Nominal rata kanan dan rapi',
        detail: 'Tampilkan angka secara rapih sehingga memudahkan review finansial.'
      }],
      color: 'from-[#0B1F4A] to-slate-900',
      badge: null
    }, {
      name: 'Compliance, Payroll & Asset Hub',
      tagline: 'Pajak, BPJS, payroll, aset, SaaS, dan proyeksi',
      desc: 'Modul administrasi compliance untuk PPN, PPh, BPJS, payroll pegawai, arsip dokumen, aset tetap, depresiasi, dan biaya SaaS.',
      features: [{
        title: 'Status kepatuhan pajak',
        detail: 'Pantau PPN, PPh, dan setoran pajak untuk mendukung kepatuhan audit.'
      }, {
        title: 'Tarif BPJS dan payroll',
        detail: 'Hitung gaji, iuran BPJS, dan payroll secara otomatis.'
      }, {
        title: 'Registrasi pegawai baru',
        detail: 'Simpan data karyawan, jabatan, dan informasi payroll.'
      }, {
        title: 'Arsip dokumen digital',
        detail: 'Simpan dokumen payroll, BPJS, kontrak, dan bukti pembayaran.'
      }, {
        title: 'Penyusutan aset garis lurus',
        detail: 'Hitung depresiasi aset tetap berdasarkan masa manfaat.'
      }, {
        title: 'Burn rate SaaS dan renewal',
        detail: 'Pantau biaya langganan SaaS dan jadwal perpanjangan kontrak.'
      }],
      color: 'from-indigo-950 to-slate-950',
      badge: null
    }];

    // Keunggulan sistem
    const solutions = [{
      title: 'Satu Sumber Data Finance',
      desc: 'Proyek, klien, invoice, vendor, pajak, payroll, aset, dan laporan berada dalam alur data yang konsisten.',
      icon: Database
    }, {
      title: 'Dashboard Eksekutif Interaktif',
      desc: 'Grafik arus kas, KPI proyek, status tagihan, dan insight CFO dapat dipantau tanpa berpindah alat.',
      icon: BarChart3
    }, {
      title: 'Form dan Tabel Seragam',
      desc: 'Seluruh input, dropdown, date picker, textarea, badge, dan tabel dibuat konsisten agar kerja harian lebih cepat.',
      icon: CheckCircle2
    }, {
      title: 'Kontrol Jatuh Tempo',
      desc: 'Invoice, piutang, tagihan vendor, pajak, dan renewal SaaS dapat ditandai dengan status yang mudah dibaca.',
      icon: Calendar
    }, {
      title: 'Compliance Terpantau',
      desc: 'PPN, PPh 21, PPh 23, BPJS, payroll, dan arsip pegawai disusun untuk kebutuhan audit internal.',
      icon: ShieldCheck
    }, {
      title: 'Proyeksi Bisnis Tahunan',
      desc: 'Target revenue, beban, laba, dan roadmap pertumbuhan divisualkan untuk rapat manajemen.',
      icon: TrendingUp
    }, {
      title: 'Manajemen Aset & SaaS',
      desc: 'Aset tetap, depresiasi, biaya langganan digital, kategori cloud, dan burn rate dapat dipantau berkala.',
      icon: Server
    }, {
      title: 'Akses Operasional Cepat',
      desc: 'Tombol aksi, filter, pencarian, dan shortcut modul dibuat untuk workflow finance berulang.',
      icon: Workflow
    }, {
      title: 'Tampilan Enterprise',
      desc: 'Warna navy, putih, tabel rapi, dan hierarki data jelas memberi kesan sistem internal resmi perusahaan.',
      icon: Shield
    }];

    // 5 keunggulan utama sistem
    const keyStrengths = [{
      title: 'Data Terpusat',
      desc: 'Seluruh data finance penting berada dalam satu sistem sehingga tim tidak perlu berpindah spreadsheet.'
    }, {
      title: 'Tampilan Konsisten',
      desc: 'Form, tabel, badge, tombol, dan modal dibuat seragam agar input harian lebih cepat dan minim salah.'
    }, {
      title: 'Kontrol Jatuh Tempo',
      desc: 'Piutang, utang, pajak, invoice, dan renewal SaaS mudah dipantau melalui status dan tanggal yang jelas.'
    }, {
      title: 'Siap Laporan',
      desc: 'Buku besar, jurnal, proyeksi, dan laporan disusun untuk kebutuhan review manajemen dan audit internal.'
    }, {
      title: 'Corporate UI',
      desc: 'Desain navy, putih, dan abu lembut memberi pengalaman seperti sistem enterprise resmi perusahaan.'
    }];

    // Contoh alur fitur unggulan
    const selectedProjects = [{
      category: 'Dashboard',
      title: 'Monitoring Cash Flow & KPI',
      partner: 'Dashboard CFO | Real-time Finance View',
      year: 'Live',
      desc: 'Pantau kas, profit margin, proyek berjalan, invoice jatuh tempo, burn rate digital, dan ringkasan insight finance.',
      highlights: ['Ringkasan kas & bank dalam satu dashboard', 'Monitoring KPI proyek, invoice, dan burn rate real-time', 'Insight finance untuk rapat manajemen']
    }, {
      category: 'Operasional',
      title: 'Invoice, Piutang & Vendor',
      partner: 'Receivable & Payable Workflow',
      year: 'Daily',
      desc: 'Kelola invoice klien, pelunasan piutang, tagihan vendor, pembayaran, status overdue, dan riwayat transaksi.',
      highlights: ['Manajemen invoice dan jatuh tempo pelanggan', 'Rekonsiliasi pembayaran vendor dan bukti transaksi', 'Status overdue dan paid langsung terlihat']
    }, {
      category: 'Compliance',
      title: 'Pajak, Payroll, Aset & SaaS',
      partner: 'Compliance & Cost Control Hub',
      year: 'Monthly',
      desc: 'Pantau PPN, PPh, BPJS, payroll, dokumen pegawai, penyusutan aset, biaya cloud, dan renewal SaaS.',
      highlights: ['Pantau pajak, payroll, dan compliance dalam satu modul', 'Pengelolaan aset tetap dan depresiasi terintegrasi', 'Kontrol biaya SaaS dan renewals agar tidak bocor']
    }];

    // Helper to calculate visible items in the 3D rotating carousel
    const getVisibleCards = () => {
      const N = financeCarouselItems.length;
      const visible = [];
      // We display 5 cards at a time around the active index
      for (let offset = -2; offset <= 2; offset++) {
        const index = (activeClientIndex.value + offset + N) % N;
        visible.push({
          index,
          offset
        });
      }
      return visible;
    };
    return () => <div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/20 selection:text-[#0B1F4A] scroll-smooth">
      <style>{`
        .landing-carousel-stage { isolation:isolate; }
        .landing-carousel-card { will-change:transform,opacity; }
        @media (prefers-reduced-motion:reduce) { .landing-carousel-card { transition:none!important; } }
      `}</style>
      
      {/* HEADER & NAVBAR */}
      <nav id="navbar" class="sticky top-0 bg-[#0B1F4A]/95 backdrop-blur-md border-b border-white/10 py-4 px-6 md:px-12 flex items-center justify-between z-40 transition-all duration-300">
        {/* Kedata Logo - Clean blue & white */}
        <div class="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection('beranda')}>
          <KedataLogo size={30} class="shrink-0" />
          <div class="flex flex-col text-left">
            <span class="font-black text-lg text-white tracking-wider leading-none">KEDATA</span>
            <span class="text-[7.5px] text-blue-400 font-extrabold uppercase tracking-widest leading-none mt-1">Indonesia Digital</span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Matching clean alignment & exact visual hierarchy of reference image 2 */}
      <section id="beranda" class="relative pt-28 pb-28 md:pt-32 md:pb-32 lg:pt-36 lg:pb-36 bg-gradient-to-b from-[#0B1F4A] via-[#0B255C] to-[#0A1B40] text-white px-6 md:px-12 overflow-hidden text-center">
        {/* Soft elegant blue radial grid and glow backdrops */}
        <div class="absolute top-0 inset-x-0 h-full bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_60%)] pointer-events-none" />
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div class="max-w-6xl mx-auto space-y-8 relative z-10">
          
          {/* Centered headline */}
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto text-white">
            Satu Sistem untuk <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white font-extrabold">Operasional Finance Kedata</span>
          </h1>

          {/* Centered description matching Gambar 2 layout */}
          <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light">
            Finstart membantu tim mengelola dashboard CFO, proyek, buku besar, transaksi, invoice, vendor, pajak, payroll, aset, SaaS, dan laporan dalam satu workflow internal yang rapi.
          </p>

          {/* Centered button pair matching exactly Gambar 2 buttons ("VIEW DEMO" style & "GET STARTED" style) */}
          <div class="flex flex-wrap justify-center items-center gap-4 pt-4">
            <button id="hero-btn-kenal" onClick={() => scrollToSection('tentang')} class="bg-white/10 hover:bg-white/20 text-white font-extrabold py-3.5 px-8 rounded-full transition-all duration-200 text-xs uppercase tracking-widest border border-white/20 hover:border-white/40 cursor-pointer shadow-lg">
              Lihat Fitur
            </button>
            <button id="hero-btn-masuk-sistem" onClick={onLoginClick} class="bg-white hover:bg-blue-50 text-[#0B1F4A] hover:text-[#0B1F4A] font-black py-3.5 px-8 rounded-full shadow-xl transition-all duration-200 flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer">
              Masuk ke Sistem <span class="p-1 bg-[#0B1F4A] text-white rounded-full"><ArrowRight class="w-3 h-3" /></span>
            </button>
          </div>

          {/* 3D CURVED ROTATING CAROUSEL filled with Finstart features */}
          <div class="pt-20 max-w-5xl mx-auto relative min-h-[460px]">
            
            <div class="mb-8 flex justify-center px-4">
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                Semua fitur sistem ({activeClientIndex.value + 1}/{financeCarouselItems.length})
              </span>
            </div>

            {/* Simulated 3D Curved Slider Stage */}
            <div
              class="landing-carousel-stage relative w-full h-[360px] flex justify-center items-center overflow-visible"
              style={{ perspective: "1200px" }}
              onMouseEnter={pauseCarousel}
              onMouseLeave={resumeCarousel}
              onFocusin={pauseCarousel}
              onFocusout={resumeCarousel}
            >
              <div class="absolute inset-0 flex justify-center items-center pointer-events-none">
                {/* Horizontal curved background guide line */}
                <div class="w-[120%] h-[300px] border-b border-white/5 rounded-[50%] absolute -top-12 pointer-events-none" />
              </div>

              {getVisibleCards().map(({
                index,
                offset
              }) => {
                const item = financeCarouselItems[index];
                const isActive = offset === 0;
                return <motion.div key={item.id} style={{
                  transformStyle: "preserve-3d",
                  zIndex: 10 - Math.abs(offset)
                }} drag="x" dragConstraints={{
                  left: 0,
                  right: 0
                }} dragElastic={0.4} onDragStart={() => {
                  isDraggingRef.value = true;
                }} onDragEnd={(_, info) => {
                  const threshold = 40;
                  if (info.offset.x < -threshold) {
                    nextSlide();
                  } else if (info.offset.x > threshold) {
                    prevSlide();
                  }
                  // Keep as true for a short duration to prevent the immediate click handler from executing
                  setTimeout(() => {
                    isDraggingRef.value = false;
                }, 80);
              }} animate={{
                  x: offset * 270,
                  y: isActive ? -28 : Math.abs(offset) * 14 + 10,
                  // Horizontal distribution
                  scale: isActive ? 1.16 : 0.84 - Math.abs(offset) * 0.045,
                  opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.33,
                  rotateY: offset * -20,
                  rotateX: isActive ? -2 : 0,
                  // Curved 3D arch effect
                  z: isActive ? 90 : Math.abs(offset) * -120 // Depth stacking
                }} transition={{
                  type: "spring",
                  stiffness: 780,
                  damping: 28,
                  mass: 0.45,
                  velocity: 2.5
                }} onClick={() => {
                  if (isDraggingRef.value) return;
                  if (!isActive) {
                    setActiveClientIndex(index);
                  }
                }} class={`landing-carousel-card absolute w-[290px] h-[340px] rounded-2xl p-6 text-left border flex flex-col justify-between transition-all duration-700 ease-out cursor-grab active:cursor-grabbing select-none group ${isActive ? 'bg-white border-slate-100/90 text-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.18)] shadow-blue-900/10 ring-1 ring-white/70' : 'bg-[#0B1F4A]/40 backdrop-blur-md border-white/5 text-slate-300 shadow-xl hover:border-white/15'}`}>
                    {/* Interior Card Content */}
                    <div class="space-y-3 flex flex-col h-full justify-between">
                      {/* Top bar status */}
                      <div class="flex items-center justify-between">
                        <span class={`text-[8.5px] font-black uppercase tracking-[0.22em] px-2.5 py-1 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-white'}`}>
                          {item.status}
                        </span>
                        <div class="flex items-center gap-1">
                          <span class={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                          <span class={`text-[8px] font-mono tracking-wider uppercase opacity-60 ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                            Live
                          </span>
                        </div>
                      </div>

                      {/* Main central feature visual */}
                      <div class="py-2.5 flex justify-center items-center w-full">
                        <div class={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${isActive ? 'bg-blue-50 text-[#1E5AA8] border-blue-100 shadow-sm scale-115' : 'bg-white/10 text-blue-200 border-white/10'}`}>
                          {item.icon}
                        </div>
                      </div>

                      {/* Title and Description */}
                      <div class="space-y-1">
                        <span class={`text-[9.5px] font-black uppercase tracking-widest block ${isActive ? 'text-blue-500' : 'text-blue-400'}`}>
                          {item.clientName}
                        </span>
                        <h4 class={`text-sm font-bold tracking-tight leading-tight ${isActive ? 'text-slate-900' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        <p class={`text-[10.5px] leading-relaxed ${isActive ? 'text-slate-500' : 'text-slate-400'} font-light line-clamp-3`}>
                          {item.desc}
                        </p>
                      </div>

                      {/* Bottom stats layout in cards */}
                      <div class={`border-t pt-3 ${isActive ? 'border-slate-100' : 'border-white/10'} flex items-center justify-between mt-1`}>
                        <div>
                          <span class={`text-[8px] font-mono uppercase tracking-[0.16em] block ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                            {item.metricLabel}
                          </span>
                          <span class={`text-xs font-bold tracking-tight ${isActive ? 'text-slate-800' : 'text-white'}`}>
                            {item.metricValue}
                          </span>
                        </div>
                        <div class="text-right">
                          <span class={`text-[8px] font-mono uppercase tracking-[0.16em] block ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                            STATUS
                          </span>
                          <span class="text-xs font-bold text-blue-500 tracking-tight">
                            {item.metric}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>;
              })}
            </div>

            {/* Rated indicator text centered below the carousel */}
            <p class="text-slate-400 text-xs font-medium tracking-wide mt-10">
              Dirancang untuk <span class="text-white font-bold">kontrol finance harian</span>, laporan manajemen, dan proses audit internal.
            </p>

          </div>

        </div>
      </section>

      {/* SECTION FITUR SISTEM */}
      <section id="tentang" class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-16">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Kolom Kiri */}
            <div class="lg:col-span-7 space-y-6 text-left">
              <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">FITUR SISTEM</span>
              <h2 class="text-3xl md:text-4xl font-extrabold text-[#102A56] tracking-tight leading-tight">
                Semua pekerjaan finance harian dalam satu sistem terpadu
              </h2>
              <p class="text-[#152238]/90 text-sm md:text-base leading-relaxed">
                Finstart menyatukan dashboard CFO, CRM proyek, buku besar, jurnal, piutang, utang, pajak, SDM, payroll, aset, SaaS, dan laporan keuangan agar proses finance internal lebih cepat, rapi, dan mudah diaudit.
              </p>
              <div>
                <button onClick={() => scrollToSection('visi-misi')} class="inline-flex items-center justify-center border border-[#1E5AA8] text-[#1E5AA8] hover:bg-[#EEF4FB] font-semibold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer">
                  Lihat Keunggulan Sistem
                </button>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div class="lg:col-span-5">
              <div class="bg-white border border-[#D8E5F4] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 text-left">
                <div class="flex items-start gap-4">
                  <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                    <Calendar class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-[#102A56] text-sm">Data finance terpusat</h4>
                    <p class="text-[#637083] text-xs mt-0.5">Kas, proyek, invoice, pajak, payroll, aset, dan laporan berada dalam satu alur kerja.</p>
                  </div>
                </div>

                <div class="border-t border-[#D8E5F4]" />

                <div class="flex items-start gap-4">
                  <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                    <Cpu class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-[#102A56] text-sm">Kontrol operasional real-time</h4>
                    <p class="text-[#637083] text-xs mt-0.5">Status jatuh tempo, pembayaran, compliance, dan proyeksi dapat dipantau cepat.</p>
                  </div>
                </div>

                <div class="border-t border-[#D8E5F4]" />

                <div class="flex items-start gap-4">
                  <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                    <Workflow class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-[#102A56] text-sm">Workflow finance terpadu</h4>
                    <p class="text-[#637083] text-xs mt-0.5">Menghubungkan transaksi, compliance, dan laporan dalam satu alur kerja.</p>
                  </div>
                </div>

                <div class="border-t border-[#D8E5F4]" />

                <div class="flex items-start gap-4">
                  <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl">
                    <Briefcase class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-[#102A56] text-sm">Modul finance lintas kebutuhan</h4>
                    <p class="text-[#637083] text-xs mt-0.5">Mencakup proyek, akuntansi, invoice, pajak, payroll, aset, dan laporan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Strip */}
          <div class="bg-[#102A56] border-l-4 border-[#D9AE27] rounded-xl p-6 text-left shadow-md flex items-center justify-between">
            <h3 class="text-white text-base md:text-lg font-semibold tracking-tight">
              Finstart menyatukan fitur operasional, kontrol, compliance, dan laporan dalam satu sistem.
            </h3>
          </div>
        </div>
      </section>

      {/* SECTION VISI DAN MISI */}
      <section id="visi-misi" class="py-24 bg-[#EEF4FB] px-6 md:px-12 scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-16">
          
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">PRINSIP SISTEM</span>
            <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">Dibangun untuk workflow finance yang rapi</h2>
            <p class="text-[#637083] text-sm font-normal">Prinsip desain utama Finstart: data jelas, proses cepat, dan output siap dipakai manajemen.</p>
          </div>

          {/* Visi - Card full-width background navy */}
          <div class="bg-[#102A56] text-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-lg border border-[#D8E5F4]/10 max-w-5xl mx-auto">
            <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
              <div class="border-l-4 border-[#D9AE27] pl-6 py-2 space-y-3 text-left">
                <span class="text-xs font-bold uppercase tracking-wider text-[#EEF4FB]/80 block">WORKFLOW UTAMA</span>
                <p class="text-lg md:text-xl font-medium text-white tracking-tight leading-relaxed">
                  Finstart membantu tim mengalirkan data dari pencatatan transaksi harian ke monitoring, compliance, proyeksi, dan laporan manajemen tanpa memecah proses ke banyak file.
                </p>
                <p class="hidden">
                  “Menjadi penyedia solusi AI dan data terdepan di Indonesia pada tahun 2030, yang memberdayakan organisasi untuk mencapai keunggulan digital melalui tata kelola data cerdas, workflow otomatis, dan analitik transformatif.”
                </p>
              </div>
            </div>
          </div>

          {/* Misi - 2 Column grid for 4 missions */}
          <div class="space-y-8 pt-6 text-left max-w-5xl mx-auto">
            <div class="text-center">
              <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block mb-2">ALUR KERJA</span>
              <h3 class="text-2xl font-bold text-[#102A56] tracking-tight">Alur Utama Sistem</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{
                title: 'Pencatatan Data Master',
                desc: 'Kelola akun buku besar, klien, vendor, pegawai, aset, layanan SaaS, dan detail proyek dari satu tempat yang konsisten.',
                icon: Award,
                num: '01'
              }, {
                title: 'Transaksi dan Tagihan',
                desc: 'Input jurnal, invoice, piutang, tagihan vendor, pembayaran, dan pelunasan dengan struktur form yang seragam.',
                icon: Database,
                num: '02'
              }, {
                title: 'Compliance dan Payroll',
                desc: 'Pantau kewajiban pajak, BPJS, payroll, dokumen pegawai, dan status pembayaran yang perlu ditindaklanjuti.',
                icon: Zap,
                num: '03'
              }, {
                title: 'Laporan dan Proyeksi',
                desc: 'Baca dashboard CFO, cash flow, laporan manajemen, target proyeksi, dan roadmap pertumbuhan bisnis secara ringkas.',
                icon: Lightbulb,
                num: '04'
              }].map((misi, idx) => <div key={idx} class="bg-white border border-[#D8E5F4] rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(16,42,86,0.02)] flex items-start gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full">
                  <div class="w-12 h-12 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border border-[#D8E5F4]/40">
                    <span class="text-[#D9AE27] font-extrabold">{misi.num}</span>
                  </div>
                  <div class="space-y-2 flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-bold text-base text-[#102A56] tracking-tight">{misi.title}</h4>
                      {h(misi.icon, {
                      class: "w-4 h-4 text-[#1E5AA8]"
                    })}
                    </div>
                    <p class="text-[#637083] text-sm leading-relaxed font-normal">
                      {misi.desc}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION KEUNGGULAN PENGGUNAAN */}
      <section id="nilai" class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-16">
          
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">KEUNGGULAN PRAKTIS</span>
            <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">Keunggulan Penggunaan Harian</h2>
            <p class="text-[#637083] text-sm font-normal">Fitur inti dirancang untuk membantu tim finance bekerja lebih cepat, rapi, dan mudah diaudit.</p>
          </div>

          {/* Grid 3 Kolom berisi 6 cards */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[{
              title: 'Data Terpusat',
              desc: 'Seluruh modul finance memakai sumber data yang saling terhubung untuk mengurangi input berulang.',
              icon: ShieldCheck,
              num: '01'
            }, {
              title: 'Form Konsisten',
              desc: 'Setiap proses input memakai ukuran, label, dan pola interaksi yang seragam agar mudah dipelajari.',
              icon: Users,
              num: '02'
            }, {
              title: 'Aksi Cepat',
              desc: 'Tombol aksi, tabel, filter, dan status dibuat jelas untuk mempercepat pekerjaan operasional harian.',
              icon: Award,
              num: '03'
            }, {
              title: 'Monitoring Status',
              desc: 'Jatuh tempo invoice, vendor, pajak, payroll, dan proyek dapat dipantau dari tampilan ringkas.',
              icon: HelpCircle,
              num: '04'
            }, {
              title: 'Tampilan Enterprise',
              desc: 'Visual navy, putih, dan abu-abu lembut menjaga aplikasi terasa formal dan nyaman dibaca.',
              icon: Lightbulb,
              num: '05'
            }, {
              title: 'Siap Laporan',
              desc: 'Data yang dicatat langsung mendukung dashboard, proyeksi, dan ringkasan manajemen.',
              icon: Lock,
              num: '06'
            }].map((val, idx) => <div key={idx} class="bg-[#EEF4FB] border border-[#D8E5F4]/60 border-l-4 border-l-[#102A56] hover:border-l-[#1E5AA8] rounded-r-2xl rounded-l-md p-6 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all group duration-300">
                <div class="flex items-center justify-between">
                  <div class="p-2.5 bg-white text-[#1E5AA8] rounded-xl shadow-sm group-hover:bg-[#1E5AA8] group-hover:text-white transition-colors duration-300">
                    {h(val.icon, {
                    class: "w-5 h-5"
                  })}
                  </div>
                  <span class="text-xs text-[#D9AE27] font-mono font-bold">{val.num}</span>
                </div>
                <div class="space-y-1">
                  <h4 class="font-bold text-base text-[#102A56]">{val.title}</h4>
                  <p class="text-[#637083] text-sm leading-relaxed font-normal">
                    {val.desc}
                  </p>
                </div>
              </div>)}
          </div>

        </div>
      </section>

      {/* SECTION SOLUSI KEDATA */}
      <section id="solusi" class="py-24 bg-[#EEF4FB] border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-16">
          
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">KEUNGGULAN SISTEM</span>
            <h2 class="text-3xl md:text-4xl font-bold text-[#102A56] tracking-tight leading-tight">
              Keunggulan yang membuat workflow finance lebih terkendali
            </h2>
            <p class="text-[#637083] text-sm leading-relaxed font-normal">
              Setiap modul dibuat untuk keterbacaan data, konsistensi form, monitoring jatuh tempo, dan penyusunan laporan manajemen yang lebih siap pakai.
            </p>
          </div>

          {/* Solution cards - 3 column grid */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {solutions.map((sol, idx) => <div key={idx} class="bg-white border border-[#D8E5F4] p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-[0_4px_20px_rgba(16,42,86,0.02)] hover:border-[#1E5AA8]/30 transition-all group hover:-translate-y-1 duration-300 h-full">
                <div class="space-y-4">
                  <div class="p-3 bg-[#EEF4FB] text-[#1E5AA8] rounded-xl inline-block shadow-sm group-hover:bg-[#1E5AA8] group-hover:text-white transition-colors duration-300">
                    {h(sol.icon, {
                    class: "w-5 h-5"
                  })}
                  </div>
                  <h4 class="font-bold text-base text-[#102A56] tracking-tight">{sol.title}</h4>
                  <p class="text-[#637083] text-sm leading-relaxed font-normal">
                    {sol.desc}
                  </p>
                </div>
              </div>)}
          </div>

        </div>
      </section>

      {/* SECTION PRODUK KEDATA */}
      <section id="produk" class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-16">
          
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">MODUL UTAMA</span>
            <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">Fitur Finstart untuk operasional perusahaan</h2>
            <p class="text-[#637083] text-sm font-normal">Modul inti yang membantu tim finance bekerja dari pencatatan transaksi sampai laporan manajemen.</p>
          </div>

          {/* Kalkula Large Horizontal Card */}
          <div class="bg-white border border-[#D8E5F4] rounded-2xl shadow-[0_8px_30px_rgba(16,42,86,0.03)] overflow-hidden text-left max-w-6xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-12">
              {/* Sisi Kiri: Text & Features */}
              <div class="lg:col-span-7 p-8 md:p-10 space-y-6 flex flex-col justify-between">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <span class="text-[10px] bg-[#EEF4FB] text-[#1E5AA8] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Modul Utama
                    </span>
                  </div>
                  <h3 class="text-2xl md:text-3xl font-bold text-[#102A56] tracking-tight">
                    {products[0].name}
                  </h3>
                  <p class="text-[#1E5AA8] font-semibold text-sm">
                    {products[0].tagline}
                  </p>
                  <p class="text-[#637083] text-sm leading-relaxed">
                    {products[0].desc}
                  </p>

                  <div class="space-y-2 pt-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#102A56] block">Fitur yang tersedia:</span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {products[0].features.map((feature, fIdx) => <div key={fIdx} class="flex items-start gap-2 text-xs text-[#637083]">
                          <Check class="w-4 h-4 text-[#1E5AA8] shrink-0 mt-0.5" />
                          <span>{feature.title}</span>
                        </div>)}
                    </div>
                  </div>
                </div>

                <div class="pt-6 border-t border-[#D8E5F4] flex flex-wrap gap-4 items-center justify-between">
                  <button onClick={() => setSelectedProductIndex(0)} class="inline-flex items-center justify-center bg-[#102A56] hover:bg-[#1E5AA8] text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-sm">
                    Lihat Produk
                  </button>
                  <span class="text-[10px] text-[#637083]/80 font-mono">INTEGRATED FINANCE WORKFLOW</span>
                </div>
              </div>

              {/* Sisi Kanan: Abstract Dashboard mockup (No robot or futuristic AI slop) */}
              <div class="lg:col-span-5 bg-[#EEF4FB] p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-[#D8E5F4]">
                <div class="w-full max-w-md bg-white border border-[#D8E5F4] rounded-xl p-5 shadow-sm space-y-4 text-left font-sans">
                  <div class="flex items-center justify-between border-b border-[#D8E5F4] pb-3">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      <span class="text-xs font-bold text-[#102A56]">Finance Console Active</span>
                    </div>
                    <span class="text-[10px] text-[#637083] font-mono">V.2.4</span>
                  </div>

                  {/* Mock Data Bars */}
                  <div class="space-y-3">
                    <div>
                      <div class="flex justify-between text-[10px] font-bold text-[#102A56] mb-1">
                        <span>Data Consistency</span>
                        <span>98.6%</span>
                      </div>
                      <div class="w-full bg-[#EEF4FB] h-2 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full" style={{
                          width: '98.6%'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div class="flex justify-between text-[10px] font-bold text-[#102A56] mb-1">
                        <span>Automation Speed</span>
                        <span>0.4s / Query</span>
                      </div>
                      <div class="w-full bg-[#EEF4FB] h-2 rounded-full overflow-hidden">
                        <div class="bg-[#1E5AA8] h-full rounded-full" style={{
                          width: '85%'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Miniature abstract chart mockup using SVGs */}
                  <div class="pt-3 border-t border-[#D8E5F4]">
                    <span class="text-[9px] font-bold text-[#637083] uppercase tracking-wider block mb-2">Data Flow Volume</span>
                    <div class="h-20 flex items-end gap-1 px-2 bg-[#EEF4FB]/50 rounded-lg p-2">
                      <div class="bg-[#1E5AA8] w-full rounded-t-sm" style={{
                        height: '30%'
                      }} />
                      <div class="bg-[#1E5AA8] w-full rounded-t-sm" style={{
                        height: '55%'
                      }} />
                      <div class="bg-[#102A56] w-full rounded-t-sm" style={{
                        height: '45%'
                      }} />
                      <div class="bg-[#1E5AA8] w-full rounded-t-sm" style={{
                        height: '70%'
                      }} />
                      <div class="bg-[#D9AE27] w-full rounded-t-sm" style={{
                        height: '90%'
                      }} />
                      <div class="bg-[#1E5AA8] w-full rounded-t-sm" style={{
                        height: '65%'
                      }} />
                      <div class="bg-[#102A56] w-full rounded-t-sm" style={{
                        height: '80%'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Products Grid */}
          <div class="space-y-6 max-w-6xl mx-auto pt-6">
            <h4 class="font-bold text-lg text-[#102A56] text-left border-l-4 border-l-[#1E5AA8] pl-3">Modul Pendukung Lainnya</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {[{
                index: 1,
                label: 'CRM & Project Control',
                icon: Briefcase
              }, {
                index: 2,
                label: 'Accounting Core',
                icon: BookOpen
              }, {
                index: 3,
                label: 'Receivable & Payable',
                icon: FileText
              }, {
                index: 4,
                label: 'Compliance & Assets',
                icon: ShieldCheck
              }].map(pInfo => {
                const prod = products[pInfo.index];
                return <div key={pInfo.index} class="bg-white border border-[#D8E5F4] rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(16,42,86,0.01)] hover:shadow-md hover:border-[#1E5AA8]/30 transition-all duration-300 h-full">
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] bg-[#EEF4FB] text-[#1E5AA8] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {pInfo.label}
                        </span>
                        <span class="text-[9px] bg-[#D9AE27]/15 text-[#D9AE27] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          READY
                        </span>
                      </div>
                      <h4 class="font-bold text-lg text-[#102A56] flex items-center gap-2">
                        {prod.name}
                      </h4>
                      <p class="text-[#637083] text-sm leading-relaxed">
                        {prod.desc}
                      </p>
                    </div>

                    <div class="pt-6 border-t border-[#D8E5F4] mt-6 flex justify-between items-center">
                      <button onClick={() => setSelectedProductIndex(pInfo.index)} class="inline-flex items-center justify-center border border-[#1E5AA8] text-[#1E5AA8] hover:bg-[#EEF4FB] font-semibold text-xs py-2 px-4 rounded-lg transition-all cursor-pointer">
                        Detail Produk
                      </button>
                      <span class="text-[10px] text-[#637083] font-mono uppercase tracking-wider">Finance Module</span>
                    </div>
                  </div>;
              })}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION INDUSTRI YANG DILAYANI */}
      <section id="industri" class="py-24 bg-[#EEF4FB] px-6 md:px-12 border-b border-[#D8E5F4] scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-12">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">CAKUPAN MODUL</span>
            <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">Fitur yang mencakup seluruh pekerjaan finance</h2>
            <p class="text-[#637083] text-sm font-normal">
              Modul dirancang untuk mendukung workflow harian tim finance dari pencatatan sampai pelaporan:
            </p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-3.5 max-w-5xl mx-auto">
            {sectors.map((s, idx) => <div key={idx} class="bg-white hover:bg-[#EEF4FB] border border-[#D8E5F4]/60 px-5 py-3 rounded-xl flex items-center gap-3 text-[#152238] transition-all text-xs font-bold shadow-sm">
                <div class="p-1.5 bg-[#EEF4FB] text-[#1E5AA8] rounded-lg">
                  {s.icon}
                </div>
                <span>{s.name}</span>
              </div>)}
          </div>
        </div>
      </section>

      {/* SECTION MENGAPA MEMILIH KEDATA */}
      <section id="keunggulan" class="py-24 bg-[#102A56] text-white px-6 md:px-12 scroll-mt-10 relative overflow-hidden">
        <div class="max-w-7xl mx-auto space-y-16 relative z-10">
          
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#D9AE27] block">KEUNGGULAN SISTEM</span>
            <h2 class="text-3xl font-bold text-white tracking-tight">Mengapa Finstart lebih rapi?</h2>
            <p class="text-[#EEF4FB]/80 text-sm font-normal">Keunggulan utama yang membantu tim finance bekerja lebih cepat, konsisten, dan siap laporan.</p>
          </div>

          {/* Horizontal list of 5 reasons */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            {keyStrengths.map((strength, idx) => <div key={idx} class="bg-[#0B1F42] border border-[#D8E5F4]/10 p-6 rounded-2xl flex flex-col justify-between space-y-5 hover:border-[#1E5AA8] transition-all duration-300 shadow-lg group h-full">
                <div class="space-y-4">
                  <div class="w-10 h-10 bg-white/10 group-hover:bg-[#1E5AA8]/20 text-[#D9AE27] rounded-xl flex items-center justify-center font-bold text-sm transition-colors border border-white/5">
                    0{idx + 1}
                  </div>
                  <h4 class="font-bold text-base text-white tracking-tight leading-snug">
                    {strength.title}
                  </h4>
                </div>
                <p class="text-[#EEF4FB]/80 text-xs leading-relaxed font-normal">
                  {strength.desc}
                </p>
              </div>)}
          </div>

        </div>
      </section>

      {/* SECTION PROYEK UNGGULAN */}
      <section id="proyek" class="py-24 bg-white border-b border-[#D8E5F4] px-6 md:px-12 scroll-mt-10">
        <div class="max-w-7xl mx-auto space-y-16">
          
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#1E5AA8] block">CONTOH ALUR FITUR</span>
            <h2 class="text-3xl font-bold text-[#102A56] tracking-tight">Workflow utama yang tersedia di Finstart</h2>
            <p class="text-[#637083] text-sm font-normal">Beberapa area kerja utama yang dapat langsung dipakai oleh tim finance internal.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {selectedProjects.map((proj, idx) => <div key={idx} class="bg-white border border-[#D8E5F4] rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(16,42,86,0.01)] flex flex-col justify-between hover:border-[#1E5AA8]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden group min-h-[300px]">
                <div class="space-y-4 relative z-10">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] bg-[#EEF4FB] text-[#1E5AA8] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <span class="text-xs text-[#637083] font-mono font-bold">{proj.year}</span>
                  </div>
                  
                  <h4 class="text-lg font-bold text-[#102A56] tracking-tight leading-tight group-hover:text-[#1E5AA8] transition-colors">
                    {proj.title}
                  </h4>
                  
                  <p class="text-[#1E5AA8] text-xs font-bold uppercase tracking-wider">
                    Area: {proj.partner}
                  </p>
                  
                  <p class="text-[#637083] text-sm leading-relaxed font-normal">
                    {proj.desc}
                  </p>
                </div>

                <div class="pt-6 relative z-10 border-t border-[#D8E5F4] mt-6 flex justify-end">
                  <button onClick={() => setSelectedProjectDetailIndex(idx)} class="text-xs text-[#1E5AA8] hover:text-[#102A56] font-bold flex items-center gap-1.5 cursor-pointer hover:underline">
                    Lihat Detail <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>)}
          </div>

          <div class="text-center pt-4">
            <button id="btn-lihat-semua-proyek" onClick={() => setIsProjectModalOpen(true)} class="inline-flex bg-[#102A56] hover:bg-[#1E5AA8] text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 text-xs tracking-wider items-center gap-2 cursor-pointer shadow-md">
              Lihat Semua Fitur <ExternalLink class="w-4 h-4 text-[#D9AE27]" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION CTA FINSTART */}
      <section id="finance-cta" class="py-24 bg-white px-6 md:px-12 scroll-mt-10">
        <div class="max-w-6xl mx-auto bg-[#102A56] border border-white/10 text-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 text-left">
            
            {/* Left Column: Text & CTA */}
            <div class="lg:col-span-7 space-y-6">
              <span class="text-[10px] text-[#D9AE27] uppercase font-bold tracking-widest block">
                ENTERPRISE MANAGEMENT SYSTEM
              </span>
              <h3 class="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                Kelola Keuangan Kedata dengan Lebih Cerdas
              </h3>
              <p class="text-[#EEF4FB]/85 text-sm leading-relaxed">
                Finstart membantu tim menghubungkan transaksi kas harian, proyek berjalan, data tagihan klien, pencatatan pengeluaran operasional, inventaris aset, administrasi perpajakan, dan laporan keuangan terstruktur langsung ke dalam satu sistem akuntansi terpadu.
              </p>
              
              <div class="pt-2">
                <button id="cta-masuk-finance" onClick={onLoginClick} class="bg-white hover:bg-[#EEF4FB] text-[#102A56] font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-200 text-xs tracking-wider flex items-center gap-2 cursor-pointer border border-[#D8E5F4]">
                  Masuk ke Finstart <ArrowRight class="w-4 h-4 text-[#102A56]" />
                </button>
              </div>
            </div>

            {/* Right Column: Miniature Dashboard Mockup */}
            <div class="lg:col-span-5">
              <div class="border border-white/10 bg-[#0B1F42] rounded-xl p-5 text-[11px] font-mono space-y-4 shadow-2xl relative">
                
                {/* Mock Header */}
                <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-500" />
                    <span class="w-2 h-2 rounded-full bg-[#D9AE27]" />
                    <span class="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span class="text-slate-400 text-[8.5px] uppercase tracking-wider">FINSTART CONSOLE</span>
                </div>

                {/* Dashboard grid */}
                <div class="grid grid-cols-2 gap-3">
                  
                  {/* Kas Block */}
                  <div class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1">
                    <span class="text-slate-400 text-[8px] block uppercase font-bold">Bank & Kas</span>
                    <span class="text-white font-bold text-xs block leading-none">Rp 4,27M</span>
                    <span class="text-[7.5px] text-[#EEF4FB]">Mandiri / BCA Synced</span>
                  </div>

                  {/* Proyek Block */}
                  <div class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1">
                    <span class="text-slate-400 text-[8px] block uppercase font-bold">Proyek Berjalan</span>
                    <span class="text-white font-bold text-xs block leading-none">12 Aktif</span>
                    <span class="text-[7.5px] text-emerald-400">ON SCHEDULE</span>
                  </div>

                  {/* Klien Block */}
                  <div class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1">
                    <span class="text-slate-400 text-[8px] block uppercase font-bold">Klien Terdaftar</span>
                    <span class="text-white font-bold text-xs block leading-none">34 Partner</span>
                    <span class="text-[7.5px] text-slate-300">Institusi & Swasta</span>
                  </div>

                  {/* Profit Block */}
                  <div class="bg-[#102A56]/40 border border-white/5 p-3 rounded-lg text-left space-y-1">
                    <span class="text-slate-400 text-[8px] block uppercase font-bold">Net Profit YTD</span>
                    <span class="text-emerald-400 font-bold text-xs block leading-none">+24.5%</span>
                    <span class="text-[7.5px] text-slate-300">Target Tercapai</span>
                  </div>

                </div>

                <div class="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-white/10 mt-1">
                  <span>SYSTEM RUNNING STABLE</span>
                  <span class="text-emerald-500">SECURED BY TLS 1.3</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="kontak" class="bg-[#0B1F42] text-white border-t border-[#D8E5F4]/10 py-16 px-6 md:px-12 relative overflow-hidden">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* Brand Info */}
          <div class="lg:col-span-4 space-y-4 text-left">
            <div class="flex items-center gap-2.5">
              <KedataLogo size={30} class="shrink-0" />
              <div>
                <span class="font-bold text-lg tracking-wider block">KEDATA</span>
                <span class="text-[8px] text-blue-400 block font-bold uppercase leading-3">Indonesia Digital</span>
              </div>
            </div>
            <p class="text-slate-300 text-[12px] leading-relaxed max-w-sm font-normal">
              PT Kedata Indonesia Digital menghadirkan solusi teknologi cerdas dan tata kelola data terstruktur untuk membantu organisasi bertransformasi, mengambil keputusan yang lebih baik, serta tumbuh melalui teknologi yang relevan dan terukur.
            </p>
            <div class="flex items-center gap-3 pt-2">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" class="p-2 bg-[#102A56] hover:bg-[#1E5AA8] text-slate-300 hover:text-white rounded-lg transition-colors border border-white/10 cursor-pointer">
                <Linkedin class="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div class="lg:col-span-4 space-y-4 text-left">
            <h4 class="font-bold text-xs uppercase tracking-wider text-white">Hubungi Kami</h4>
            <div class="text-sm text-slate-300 space-y-3 font-normal">
              <div class="flex items-center gap-2.5">
                <Mail class="w-4 h-4 text-blue-400 shrink-0" />
                <span class="font-mono">business@kedata.online</span>
              </div>
              <div class="flex items-center gap-2.5">
                <Phone class="w-4 h-4 text-blue-400 shrink-0" />
                <span class="font-mono">+62 819-4411-2358</span>
              </div>
              <div class="flex items-center gap-2.5">
                <Building class="w-4 h-4 text-blue-400 shrink-0" />
                <span>www.kedata.online</span>
              </div>
            </div>
          </div>

          {/* Address details */}
          <div class="lg:col-span-4 space-y-4 text-left">
            <h4 class="font-bold text-xs uppercase tracking-wider text-white">Lokasi Kantor</h4>
            <div class="text-sm text-slate-300 flex items-start gap-2.5 leading-relaxed font-normal">
              <MapPin class="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Pakuwon Mall Jogja, 3rd Floor, Kaliwaru, Condongcatur, Depok District, Sleman Regency, Special Region of Yogyakarta
              </span>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 text-center text-[10px] text-slate-400 font-medium">
          &copy; 2026 PT Kedata Indonesia Digital. All Rights Reserved.
        </div>
      </footer>

      {/* DETIL PRODUK MODAL */}
      {selectedProductIndex.value !== null && <div class="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div class="relative w-full max-w-3xl max-h-[calc(100vh-64px)] h-[calc(100vh-64px)] overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.18)]">
            <div class="absolute -top-8 left-1/2 h-20 w-80 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400/30 via-cyan-300/20 to-indigo-500/20 blur-3xl" />
            <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
              <div class="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B1F4A] text-white lg:p-8">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-extrabold text-2xl lg:text-3xl tracking-tight">{products[selectedProductIndex].name}</h3>
                    <p class="mt-2 text-sm lg:text-base text-slate-300 uppercase tracking-[0.28em] font-semibold">{products[selectedProductIndex].tagline}</p>
                  </div>
                  <button onClick={() => setSelectedProductIndex(null)} class="rounded-2xl border border-white/20 bg-white/10 px-3.5 py-3 text-white transition hover:border-white/40 hover:bg-white/15" aria-label="Tutup detail produk">
                    <X class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div class="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8">
                  <div class="grid gap-8 lg:grid-cols-[1.45fr_0.95fr] text-slate-700">
                    <section class="space-y-6">
                      <div class="space-y-4">
                        <h4 class="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">Deskripsi Produk</h4>
                        <p class="text-sm lg:text-base leading-7 text-slate-600">{products[selectedProductIndex].desc}</p>
                      </div>

                      <div class="space-y-4">
                        <h4 class="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">Fitur Utama</h4>
                        <ul class="space-y-3 text-sm lg:text-base">
                          {products[selectedProductIndex].features.map((f, fIdx) => <li key={fIdx} class="flex gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 leading-6 shadow-sm">
                              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                              <span class="text-slate-700">{f.title}</span>
                            </li>)}
                        </ul>
                      </div>
                    </section>

                    <aside class="space-y-6">
                      <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div class="mb-5 rounded-3xl bg-gradient-to-br from-[#0B1F4A] via-slate-900 to-slate-800 p-5 text-white shadow-lg">
                          <p class="text-xs uppercase tracking-[0.32em] text-sky-300">Highlight Fitur</p>
                          <h4 class="mt-3 text-xl font-bold">Finance Control Center</h4>
                          <p class="mt-3 text-sm leading-6 text-slate-200">Ringkas semua metrik finance internal dengan dashboard eksekutif, proyeksi, dan compliance dalam satu tampilan kelas enterprise.</p>
                        </div>
                        <div class="space-y-4 text-sm text-slate-600">
                          <div class="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                            <p class="font-semibold text-slate-800">Dashboard eksekutif</p>
                            <p class="mt-2 text-slate-500">Kas, piutang, utang, pajak, payroll, dan proyek semua dapat dipantau bersama.</p>
                          </div>
                          <div class="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                            <p class="font-semibold text-slate-800">Proyeksi dan laporan</p>
                            <p class="mt-2 text-slate-500">Target bisnis lebih mudah diikuti dengan laporan siap presentasi dan insight KPI.</p>
                          </div>
                          <div class="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                            <p class="font-semibold text-slate-800">Kontrol operasional</p>
                            <p class="mt-2 text-slate-500">Sistem dirancang untuk proses finansial yang rapi, jelas, dan mudah diaudit.</p>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm text-slate-500">Popup diperbesar untuk pengalaman yang lebih premium dengan tata letak layar lebar dan aksen visual modern.</p>
              </div>
              <button onClick={() => setSelectedProductIndex(null)} class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#122c5f]">
                Selesai
              </button>
            </div>
          </div>
        </div>}

      {/* ALL FEATURES FULLSCREEN MODAL */}
      {isProjectModalOpen.value && <div class="fixed inset-0 bg-slate-950/80 flex items-stretch justify-center z-50 overflow-y-auto">
          <div class="relative w-full h-full bg-white rounded-none overflow-hidden">
            <div class="p-6 md:p-8 bg-[#0B1F4A] text-white flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 class="font-extrabold text-2xl md:text-3xl">Semua Fitur Finstart</h3>
                <p class="mt-2 max-w-2xl text-sm text-slate-200">Pilih modul untuk melihat fungsi utamanya dan detail fitur lengkap yang tersedia di website.</p>
              </div>
              <button onClick={() => setIsProjectModalOpen(false)} class="text-slate-300 hover:text-white p-3 bg-white/10 rounded-2xl transition hover:bg-white/15" aria-label="Tutup modal fitur">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="px-6 pb-8 md:px-8 md:pb-10 overflow-y-auto h-[calc(100vh-112px)]">
              <div class="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
                {products.map((product, idx) => <div key={idx} class="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:shadow-lg">
                    <span class="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-semibold">{product.name}</span>
                    <h4 class="mt-3 text-lg font-bold text-slate-900">{product.tagline}</h4>
                    <p class="mt-3 text-sm leading-6 text-slate-600">{product.desc}</p>

                    <div class="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                      <p class="text-[10px] uppercase tracking-[0.24em] font-semibold text-slate-500">Contoh fitur</p>
                      <ul class="mt-3 space-y-2 text-sm text-slate-600">
                        {product.features.slice(0, 3).map((feature, fIdx) => <li key={fIdx} class="flex gap-3 items-start">
                            <span class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                            <span>{feature.title}</span>
                          </li>)}
                      </ul>
                    </div>

                    <div class="mt-6 flex items-center justify-between gap-3">
                      <span class="text-xs text-slate-500">Lihat detail fitur lengkap</span>
                      <button onClick={() => setSelectedFeatureDetailIndex(idx)} class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#122c5f]">
                        Lihat Detail
                      </button>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>}

      {selectedProjectDetailIndex.value !== null && <div class="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
          <div class="w-full max-w-3xl h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
            <div class="p-6 md:p-8 bg-gradient-to-r from-[#102A56] to-[#0B1F4A] text-white flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 class="text-2xl font-extrabold">{selectedProjects[selectedProjectDetailIndex].title}</h3>
                <p class="mt-2 text-sm text-slate-200 max-w-2xl">{selectedProjects[selectedProjectDetailIndex].partner}</p>
              </div>
              <button onClick={() => setSelectedProjectDetailIndex(null)} class="text-slate-300 hover:text-white p-3 bg-white/10 rounded-2xl transition hover:bg-white/15" aria-label="Tutup detail proyek">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="h-full overflow-y-auto p-6 md:p-8">
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h4 class="text-lg font-semibold text-slate-900">Detail Fitur Kartu</h4>
                <p class="mt-3 text-sm leading-6 text-slate-600">{selectedProjects[selectedProjectDetailIndex].desc}</p>
              </div>

              <div class="mt-6 grid gap-4">
                {selectedProjects[selectedProjectDetailIndex].highlights.map((item, itemIdx) => <div key={itemIdx} class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-sm font-semibold text-slate-900">{item}</p>
                  </div>)}
              </div>
            </div>

            <div class="border-t border-slate-200 bg-white p-5 flex justify-end">
              <button onClick={() => setSelectedProjectDetailIndex(null)} class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#122c5f]">
                Tutup Detail
              </button>
            </div>
          </div>
        </div>}

      {selectedFeatureDetailIndex.value !== null && <div class="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
          <div class="w-full max-w-3xl h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
            <div class="p-6 md:p-8 bg-gradient-to-r from-[#102A56] to-[#0B1F4A] text-white flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 class="text-2xl font-extrabold">{products[selectedFeatureDetailIndex].name}</h3>
                <p class="mt-2 text-sm text-slate-200 max-w-2xl">{products[selectedFeatureDetailIndex].tagline}</p>
              </div>
              <button onClick={() => setSelectedFeatureDetailIndex(null)} class="text-slate-300 hover:text-white p-3 bg-white/10 rounded-2xl transition hover:bg-white/15" aria-label="Tutup detail fitur">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="h-full overflow-y-auto p-6 md:p-8">
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h4 class="text-lg font-semibold text-slate-900">Tentang modul ini</h4>
                <p class="mt-3 text-sm leading-6 text-slate-600">{products[selectedFeatureDetailIndex].desc}</p>
              </div>

              <div class="mt-6 grid gap-4">
                {products[selectedFeatureDetailIndex].features.map((feature, fIdx) => <div key={fIdx} class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-sm font-semibold text-slate-900">{feature.title}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">{feature.detail}</p>
                  </div>)}
              </div>
            </div>

            <div class="border-t border-slate-200 bg-white p-5 flex justify-end">
              <button onClick={() => setSelectedFeatureDetailIndex(null)} class="inline-flex items-center justify-center rounded-3xl bg-[#0B1F4A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#122c5f]">
                Tutup Detail
              </button>
            </div>
          </div>
        </div>}

    </div>;
  }
});
</script>
