<template>
  <template v-if="id === 1"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="50" fill="#f0fdf4" />
      <path
        d="M60,35 v50 M35,60 h50"
        stroke="#10B981"
        stroke-width="12"
        stroke-linecap="round"
      />
      <path
        d="M50,42 C40,50 40,70 50,78"
        stroke="#3B82F6"
        stroke-width="7"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M70,42 C80,50 80,70 70,78"
        stroke="#3B82F6"
        stroke-width="7"
        stroke-linecap="round"
        fill="none"
      />
      <circle cx="60" cy="60" r="4" fill="#F59E0B" /></svg
  ></template>
  <template v-else-if="id === 2"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M25,25 L60,25 L45,65 Z" fill="#EF4444" />
      <path d="M65,25 L100,25 L85,65 Z" fill="#2563EB" />
      <path d="M42,70 L88,70 L65,100 Z" fill="#10B981" /></svg
  ></template>
  <template v-else-if="id === 3"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#047857"
        stroke="#F59E0B"
        stroke-width="2"
      />
      <circle
        cx="60"
        cy="60"
        r="38"
        stroke="#FFFFFF"
        stroke-width="1"
        stroke-dasharray="3 3"
      />
      <path
        d="M40,60 Q60,35 80,60 Q60,85 40,60"
        stroke="#FFFFFF"
        stroke-width="1"
        fill="none"
        opacity="0.8"
      />
      <line
        x1="25"
        y1="60"
        x2="95"
        y2="60"
        stroke="#FFFFFF"
        stroke-width="1"
        opacity="0.8"
      />
      <line
        x1="60"
        y1="25"
        x2="60"
        y2="95"
        stroke="#FFFFFF"
        stroke-width="1"
        opacity="0.8"
      />
      <polygon
        points="60,18 62,21 66,21 63,23 64,26 60,24 56,26 57,23 54,21 58,21"
        fill="#F59E0B"
      />
      <polygon
        points="40,28 42,31 46,31 43,33 44,36 40,34 36,36 37,33 34,31 38,31"
        fill="#F59E0B"
      />
      <polygon
        points="80,28 82,31 86,31 83,33 84,36 80,34 76,36 77,33 74,31 78,31"
        fill="#F59E0B"
      />
      <polygon
        points="30,44 32,47 36,47 33,49 34,52 30,50 26,52 27,49 24,47 28,47"
        fill="#F59E0B"
      />
      <polygon
        points="90,44 92,47 96,47 93,49 94,52 90,50 86,52 87,49 84,47 88,47"
        fill="#F59E0B"
      /></svg
  ></template>
  <template v-else-if="id === 4"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25,20 L95,20 L95,60 C95,82 60,105 60,105 C60,105 25,82 25,60 Z"
        fill="#1E3A8A"
        stroke="#F59E0B"
        stroke-width="2.5"
      />
      <circle
        cx="60"
        cy="45"
        r="13"
        stroke="#F59E0B"
        stroke-width="2"
        fill="none"
      />
      <path d="M45,45 H75" stroke="#F59E0B" stroke-width="3" />
      <text
        x="60"
        y="78"
        fill="#FFFFFF"
        font-size="10"
        font-weight="900"
        letter-spacing="0.5"
        text-anchor="middle"
      >
        DUKE-NUS
      </text>
      <text
        x="60"
        y="88"
        fill="#F59E0B"
        font-size="7"
        font-weight="bold"
        letter-spacing="0.5"
        text-anchor="middle"
      >
        MED SCHOOL
      </text>
    </svg></template
  >
  <template v-else-if="id === 5"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" x="10" y="10" rx="16" fill="#f0fdfa" />
      <path
        d="M38,35 C38,35 52,24 58,40 C64,56 48,66 54,82"
        stroke="#0D9488"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M53,35 C53,35 67,24 73,40 C79,56 63,66 69,82"
        stroke="#0284C7"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M68,35 C68,35 82,24 88,40 C94,56 78,66 84,82"
        stroke="#0F766E"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"
      /></svg
  ></template>
  <template v-else-if="id === 6"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="50" fill="#1E40AF" />
      <path
        d="M30,60 Q60,25 90,60 Q60,95 30,60"
        stroke="#FFFFFF"
        stroke-width="4"
        fill="none"
      />
      <circle cx="60" cy="60" r="10" fill="#EF4444" />
      <line
        x1="20"
        y1="60"
        x2="100"
        y2="60"
        stroke="#FFFFFF"
        stroke-width="3"
      />
      <text
        x="60"
        y="90"
        fill="#FFFFFF"
        font-size="9"
        font-weight="bold"
        text-anchor="middle"
      >
        ASTRA
      </text>
    </svg></template
  >
  <template v-else-if="id === 7"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#0F766E"
        stroke="#F59E0B"
        stroke-width="1.5"
      />
      <path d="M60,28 C78,28 82,45 60,88 C38,45 42,28 60,28 Z" fill="#F59E0B" />
      <path d="M60,28 Q66,50 60,88" stroke="#0F766E" stroke-width="2.5" />
      <line
        x1="60"
        y1="50"
        x2="72"
        y2="42"
        stroke="#0F766E"
        stroke-width="1.5"
      />
      <line
        x1="60"
        y1="64"
        x2="48"
        y2="56"
        stroke="#0F766E"
        stroke-width="1.5"
      /></svg
  ></template>
  <template v-else-if="id === 8"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        stroke="#2563EB"
        stroke-width="3"
        fill="#EFF6FF"
      />
      <circle cx="60" cy="60" r="33" stroke="#93C5FD" stroke-width="1.2" />
      <circle cx="60" cy="60" r="18" stroke="#93C5FD" stroke-width="1.2" />
      <line
        x1="18"
        y1="60"
        x2="102"
        y2="60"
        stroke="#93C5FD"
        stroke-width="1.2"
      />
      <line
        x1="60"
        y1="18"
        x2="60"
        y2="102"
        stroke="#93C5FD"
        stroke-width="1.2"
      />
      <path
        d="M35,35 L85,85 M35,85 L85,35"
        stroke="#93C5FD"
        stroke-width="0.8"
        opacity="0.6"
      />
      <line
        x1="60"
        y1="22"
        x2="60"
        y2="98"
        stroke="#1E40AF"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M46,80 Q74,68 60,52 Q46,36 60,28"
        stroke="#EF4444"
        stroke-width="3.5"
        stroke-linecap="round"
        fill="none"
      /></svg
  ></template>
  <template v-else-if="id === 9"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20,22 L100,22 L94,68 C94,84 60,102 60,102 C60,102 26,84 20,68 Z"
        fill="#DC2626"
        stroke="#FFFFFF"
        stroke-width="1.5"
      />
      <circle
        cx="60"
        cy="58"
        r="24"
        fill="#000000"
        stroke="#F59E0B"
        stroke-width="1.5"
      />
      <text
        x="60"
        y="65"
        fill="#FFFFFF"
        font-size="16"
        font-weight="900"
        letter-spacing="0.2"
        text-anchor="middle"
      >
        KPK
      </text>
    </svg></template
  >
  <template v-else-if="id === 10"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#1D4ED8"
        stroke="#F59E0B"
        stroke-width="2.5"
      />
      <circle cx="60" cy="60" r="38" fill="#1E3A8A" />
      <polygon
        points="60,27 62,30 65,30 63,32 64,35 60,33 56,35 57,32 55,30 58,30"
        fill="#F59E0B"
      />
      <text
        x="60"
        y="52"
        fill="#FFFFFF"
        font-size="11"
        font-weight="900"
        text-anchor="middle"
      >
        BNN
      </text>
      <text
        x="60"
        y="66"
        fill="#F59E0B"
        font-size="8"
        font-weight="bold"
        text-anchor="middle"
      >
        REPUBLIK
      </text>
      <text
        x="60"
        y="75"
        fill="#F59E0B"
        font-size="8"
        font-weight="bold"
        text-anchor="middle"
      >
        INDONESIA
      </text>
    </svg></template
  >
  <template v-else-if="id === 11"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fef2f2"
        stroke="#ef4444"
        stroke-width="2"
      />
      <path
        d="M40,45 C40,35 55,30 60,42 C65,30 80,35 80,45 C80,62 60,78 60,78 C60,78 40,62 40,45 Z"
        fill="#ef4444"
      />
      <text
        x="60"
        y="94"
        fill="#ef4444"
        font-size="10"
        font-weight="900"
        text-anchor="middle"
      >
        ALLAM MEDICA
      </text>
    </svg></template
  >
  <template v-else-if="id === 12"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="50" fill="#f0fdfa" />
      <path
        d="M40,60 C40,45 52,45 60,60 C68,75 80,75 80,60 C80,45 68,45 60,60 C52,75 40,75 40,60 Z"
        stroke="#0d9488"
        stroke-width="5.5"
        stroke-linecap="round"
        fill="none"
      />
      <circle cx="60" cy="60" r="6" fill="#ec4899" />
      <text
        x="60"
        y="96"
        fill="#0d9488"
        font-size="8"
        font-weight="bold"
        text-anchor="middle"
      >
        INSPIRASIEN
      </text>
    </svg></template
  >
  <template v-else-if="id === 13"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="100"
        height="100"
        x="10"
        y="10"
        rx="16"
        fill="#f8fafc"
        stroke="#64748b"
        stroke-width="2"
      />
      <rect x="25" y="25" width="70" height="45" rx="4" fill="#1e293b" />
      <path
        d="M45,85 L75,85"
        stroke="#64748b"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path d="M60,70 L60,85" stroke="#64748b" stroke-width="6" />
      <circle cx="35" cy="35" r="3" fill="#10b981" />
      <circle cx="45" cy="35" r="3" fill="#3b82f6" />
      <path
        d="M40,55 L55,45 L65,52 L80,40"
        stroke="#3b82f6"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <text
        x="60"
        y="103"
        fill="#334155"
        font-size="9"
        font-weight="900"
        text-anchor="middle"
      >
        TAMTECH
      </text>
    </svg></template
  >
  <template v-else-if="id === 14"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fefaf0"
        stroke="#d97706"
        stroke-width="2"
      />
      <polygon points="60,20 85,38 85,72 60,90 35,72 35,38" fill="#1e3a8a" />
      <path
        d="M60,35 v40 M40,55 h40"
        stroke="#ffffff"
        stroke-width="6"
        stroke-linecap="round"
      />
      <circle
        cx="60"
        cy="55"
        r="14"
        stroke="#f59e0b"
        stroke-width="2"
        fill="none"
      />
      <text
        x="60"
        y="103"
        fill="#1e3a8a"
        font-size="8"
        font-weight="900"
        text-anchor="middle"
      >
        RSA UGM
      </text>
    </svg></template
  >
  <template v-else-if="id === 15"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#f0fdf4"
        stroke="#15803d"
        stroke-width="1.5"
      />
      <path
        d="M60,82 V35 M60,45 Q75,35 80,50 Q60,60 60,82 M60,55 Q45,45 40,60 Q60,70 60,82"
        stroke="#15803d"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
      />
      <circle cx="60" cy="35" r="4" fill="#eab308" />
      <circle cx="80" cy="50" r="3" fill="#eab308" />
      <circle cx="40" cy="60" r="3" fill="#eab308" />
      <text
        x="60"
        y="96"
        fill="#15803d"
        font-size="8"
        font-weight="900"
        text-anchor="middle"
      >
        NUSANTARA
      </text>
    </svg></template
  >
  <template v-else-if="id === 16"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fdf2f8"
        stroke="#db2777"
        stroke-width="1.5"
      />
      <path
        d="M40,30 L80,30 L80,45 C80,65 60,85 60,85 C60,85 40,65 40,45 Z"
        fill="#b91c1c"
      />
      <circle cx="60" cy="50" r="10" fill="#f59e0b" />
      <path
        d="M48,35 C52,42 68,42 72,35"
        stroke="#ffffff"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <text
        x="60"
        y="98"
        fill="#991b1b"
        font-size="7"
        font-weight="bold"
        text-anchor="middle"
      >
        BIRO TAPEM
      </text>
    </svg></template
  >
  <template v-else-if="id === 17"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="80" x="20" y="20" rx="8" fill="#006eb6" />
      <text
        x="60"
        y="52"
        fill="#ffffff"
        font-size="18"
        font-weight="900"
        text-anchor="middle"
        letter-spacing="0.5"
      >
        UN
      </text>
      <text
        x="60"
        y="74"
        fill="#ffffff"
        font-size="18"
        font-weight="900"
        text-anchor="middle"
        letter-spacing="0.5"
      >
        DP
      </text>
      <path
        d="M30,85 H90"
        stroke="#ffffff"
        stroke-width="2.5"
        stroke-linecap="round"
      /></svg
  ></template>
  <template v-else-if="id === 18"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fff5f5"
        stroke="#e11d48"
        stroke-width="1.5"
      />
      <path
        d="M35,50 Q45,35 60,50 Q75,35 85,50 Q85,75 60,85 Q35,75 35,50 Z"
        fill="#e11d48"
      />
      <circle cx="48" cy="50" r="3" fill="#ffffff" />
      <circle cx="72" cy="50" r="3" fill="#ffffff" />
      <path
        d="M50,65 Q60,72 70,65"
        stroke="#ffffff"
        stroke-width="2.5"
        stroke-linecap="round"
        fill="none"
      />
      <text
        x="60"
        y="100"
        fill="#be123c"
        font-size="8"
        font-weight="900"
        text-anchor="middle"
      >
        SYMBOLIC
      </text>
    </svg></template
  >
  <template v-else-if="id === 19"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#ecfdf5"
        stroke="#059669"
        stroke-width="1.5"
      />
      <path d="M30,68 C30,42 90,42 90,68 Z" fill="#10b981" />
      <path d="M60,40 V68" stroke="#ffffff" stroke-width="2.5" />
      <path
        d="M45,45 Q60,65 75,45"
        stroke="#ffffff"
        stroke-width="1.5"
        fill="none"
      />
      <rect x="25" y="68" width="70" height="6" fill="#047857" rx="1" />
      <text
        x="60"
        y="93"
        fill="#047857"
        font-size="8"
        font-weight="900"
        text-anchor="middle"
      >
        DPR-RI
      </text>
    </svg></template
  >
  <template v-else-if="id === 20"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fffbeb"
        stroke="#b45309"
        stroke-width="1.5"
      />
      <rect x="56" y="38" width="8" height="35" fill="#d97706" rx="1" />
      <polygon points="60,25 65,38 55,38" fill="#b45309" />
      <rect x="50" y="73" width="20" height="8" fill="#b45309" rx="1" />
      <text
        x="60"
        y="98"
        fill="#78350f"
        font-size="7"
        font-weight="bold"
        text-anchor="middle"
      >
        YOGYAKARTA
      </text>
    </svg></template
  >
  <template v-else-if="id === 21"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fafafa"
        stroke="#e11d48"
        stroke-width="1.5"
      />
      <path d="M30,40 H90 V75 H30 Z" fill="#ef4444" opacity="0.1" />
      <path
        d="M35,45 C50,45 50,65 65,65 C80,65 80,45 90,45"
        stroke="#ef4444"
        stroke-width="5.5"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M35,65 C50,65 50,45 65,45 C80,45 80,65 90,65"
        stroke="#10b981"
        stroke-width="5.5"
        stroke-linecap="round"
        fill="none"
      />
      <text
        x="60"
        y="95"
        fill="#ef4444"
        font-size="8"
        font-weight="900"
        text-anchor="middle"
      >
        PERTAGAS
      </text>
    </svg></template
  >
  <template v-else-if="id === 22"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fef2f2"
        stroke="#dc2626"
        stroke-width="1.5"
      />
      <rect x="30" y="45" width="60" height="25" fill="#dc2626" rx="3" />
      <text
        x="60"
        y="62"
        fill="#ffffff"
        font-size="9"
        font-weight="900"
        text-anchor="middle"
      >
        MERCY
      </text>
      <text
        x="60"
        y="93"
        fill="#dc2626"
        font-size="8"
        font-weight="black"
        text-anchor="middle"
      >
        CORPS
      </text>
    </svg></template
  >
  <template v-else-if="id === 23"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#dc2626"
        stroke="#ffffff"
        stroke-width="2"
      />
      <path
        d="M45,45 Q60,35 75,45 Q80,60 60,82 Q40,60 45,45 Z"
        fill="#1e293b"
      />
      <path
        d="M40,32 Q50,42 48,46 M80,32 Q70,42 72,46"
        stroke="#ffffff"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
      />
      <circle cx="53" cy="52" r="2.5" fill="#ffffff" />
      <circle cx="67" cy="52" r="2.5" fill="#ffffff" />
      <text
        x="60"
        y="96"
        fill="#ffffff"
        font-size="8"
        font-weight="bold"
        text-anchor="middle"
      >
        PDIP
      </text>
    </svg></template
  >
  <template v-else-if="id === 24"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#15803d"
        stroke="#f59e0b"
        stroke-width="2"
      />
      <rect
        x="35"
        y="45"
        width="50"
        height="30"
        fill="#166534"
        rx="2"
        stroke="#ffffff"
        stroke-width="1"
      />
      <polygon
        points="60,25 62,29 66,29 63,31 64,35 60,33 56,35 57,31 54,29 58,29"
        fill="#f59e0b"
      />
      <polygon
        points="45,30 47,33 50,33 48,35 49,38 45,36 41,38 42,35 40,33 43,33"
        fill="#f59e0b"
      />
      <polygon
        points="75,30 77,33 80,33 78,35 79,38 75,36 71,38 72,35 70,33 73,33"
        fill="#f59e0b"
      />
      <text
        x="60"
        y="93"
        fill="#ffffff"
        font-size="9"
        font-weight="900"
        text-anchor="middle"
      >
        PKB
      </text>
    </svg></template
  >
  <template v-else-if="id === 25"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#f0f9ff"
        stroke="#0284c7"
        stroke-width="2"
      />
      <polygon points="60,22 82,38 82,74 60,92 38,74 38,38" fill="#0284c7" />
      <path d="M50,42 L70,42 L75,70 L45,70 Z" fill="#10b981" />
      <circle cx="60" cy="55" r="7" fill="#eab308" />
      <text
        x="60"
        y="104"
        fill="#0369a1"
        font-size="7"
        font-weight="bold"
        text-anchor="middle"
      >
        KALIMANTAN BARAT
      </text>
    </svg></template
  >
  <template v-else-if="id === 26"
    ><svg
      viewBox="0 0 120 120"
      class="w-14 h-14 mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="#fcfdf5"
        stroke="#854d0e"
        stroke-width="1.5"
      />
      <path
        d="M35,30 L85,30 L80,72 C80,85 60,95 60,95 C60,95 40,85 40,72 Z"
        fill="#15803d"
      />
      <polygon points="60,40 70,55 50,55" fill="#facc15" />
      <text
        x="60"
        y="103"
        fill="#166534"
        font-size="8"
        font-weight="bold"
        text-anchor="middle"
      >
        TUBABA
      </text>
    </svg></template
  >
  <template v-else></template>
</template>

<script setup lang="ts">
defineProps<{ id: number; isActive?: boolean }>();
</script>
