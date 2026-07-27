import { computed, ref, watch } from "vue";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";

export type InsightMessage = {
  sender: "ai" | "user";
  text: string;
  id: string;
};

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: InsightMessage[];
};

const CFO_CHAT_STORAGE_KEY = "finstart-cfo-copilot-sessions-v1";

const defaultInsightMessage: InsightMessage = {
  id: "welcome",
  sender: "ai",
  text: "Halo, saya Asisten Keuangan Finstart. Saya membaca alur operasional dan keuangan FinStart: CRM proyek, buku besar, jurnal, piutang, utang, pajak, SDM, aset, langganan, proyeksi, dan laporan.",
};

const initialChatSessions: ChatSession[] = [
  {
    id: "chat-current",
    title: "Chat baru",
    updatedAt: "Baru saja",
    messages: [{ ...defaultInsightMessage }],
  },
];

function cloneChatSessions(sessions: ChatSession[] = initialChatSessions) {
  return sessions.map((session) => ({
    ...session,
    messages: session.messages.map((message) => ({ ...message })),
  }));
}

function loadStoredChatSessions() {
  if (typeof window === "undefined") return cloneChatSessions();
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(CFO_CHAT_STORAGE_KEY) || "[]",
    );
    if (Array.isArray(stored) && stored.length) {
      return cloneChatSessions(
        stored
          .filter(
            (session: any) => session?.id && Array.isArray(session.messages),
          )
          .slice(0, 12),
      );
    }
  } catch {
    return cloneChatSessions();
  }
  return cloneChatSessions();
}

const initialSessions = loadStoredChatSessions();

// Semua state di bawah ini SENGAJA dibuat sekali di scope modul (bukan di
// dalam useCfoCopilotChat()), supaya tidak terikat ke lifecycle komponen mana
// pun. DashboardView di-destroy setiap kali user pindah tab (v-if di
// App.vue) - kalau state ini ada di dalam komponen, chat yang sedang
// menunggu jawaban AI akan hilang/reset begitu user pindah halaman lalu
// kembali. Dengan state di sini, request yang masih berjalan dan balasannya
// tetap tersimpan walau DashboardView sempat unmount.
const chatSessions = ref<ChatSession[]>(initialSessions);
const activeChatId = ref<string>(
  initialSessions[0]?.id || initialChatSessions[0].id,
);
const inputMessage = ref("");
const isAiLoading = ref(false);
const draftChat = ref<ChatSession | null>(null);
const pendingScrollMessageId = ref("");

if (typeof window !== "undefined") {
  watch(
    chatSessions,
    (sessions) => {
      window.localStorage.setItem(
        CFO_CHAT_STORAGE_KEY,
        JSON.stringify(sessions.slice(0, 12)),
      );
    },
    { deep: true },
  );
}

const activeChat = computed(() => {
  if (draftChat.value && draftChat.value.id === activeChatId.value) {
    return draftChat.value;
  }
  return (
    chatSessions.value.find((session) => session.id === activeChatId.value) ||
    chatSessions.value[0]
  );
});

const messages = computed(() => activeChat.value?.messages || []);

function appendMessageToChat(
  chatId: string,
  message: InsightMessage,
  titleFromPrompt?: string,
) {
  pendingScrollMessageId.value = message.id;
  chatSessions.value = chatSessions.value.map((session) =>
    session.id === chatId
      ? {
          ...session,
          title: titleFromPrompt || session.title,
          updatedAt: "Baru saja",
          messages: [...session.messages, message],
        }
      : session,
  );
}

function createChatTitle(prompt: string) {
  const title = prompt.replace(/\s+/g, " ").trim();
  return title.length > 88 ? `${title.slice(0, 85)}...` : title;
}

function createClearedChatArchive(session: ChatSession): ChatSession | null {
  const hasConversation =
    session.title !== "Chat baru" ||
    session.messages.length > 1 ||
    session.messages.some(
      (message) =>
        message.id !== defaultInsightMessage.id && message.id !== "welcome",
    );

  if (!hasConversation) return null;

  const timestamp = Date.now();
  return {
    id: `cleared-${timestamp}`,
    title:
      session.title === "Chat baru"
        ? "Percakapan yang dibersihkan"
        : `${session.title} (dibersihkan)`,
    updatedAt: "Dibersihkan",
    messages: session.messages.map((message, index) => ({
      ...message,
      id: `cleared-${timestamp}-${index}`,
    })),
  };
}

// Hanya mengubah state - efek UI (tutup panel riwayat, fokus ke input,
// scroll) tetap jadi tanggung jawab komponen yang memanggilnya karena itu
// terikat ke DOM/refs template yang cuma valid selagi komponen ter-mount.
function selectChatHistory(chatId: string) {
  draftChat.value = null;
  activeChatId.value = chatId;
}

function createNewChat() {
  const newSession: ChatSession = {
    id: `chat-${Date.now()}`,
    title: "Chat baru",
    updatedAt: "Baru saja",
    messages: [
      {
        ...defaultInsightMessage,
        id: `welcome-${Date.now()}`,
      },
    ],
  };
  draftChat.value = newSession;
  activeChatId.value = newSession.id;
  inputMessage.value = "";
}

function clearActiveChat(archiveCleared = true) {
  const current = activeChat.value;
  if (draftChat.value && current?.id === draftChat.value.id) {
    inputMessage.value = "";
    return;
  }
  const archive =
    archiveCleared && current ? createClearedChatArchive(current) : null;
  const clearedSession: ChatSession = {
    id: current?.id || activeChatId.value || `chat-${Date.now()}`,
    title: "Chat baru",
    updatedAt: "Baru saja",
    messages: [
      {
        ...defaultInsightMessage,
        id: `clear-${Date.now()}`,
      },
    ],
  };

  chatSessions.value = [
    clearedSession,
    ...(archive ? [archive] : []),
    ...chatSessions.value.filter((session) => session.id !== clearedSession.id),
  ].slice(0, 12);
  activeChatId.value = clearedSession.id;
  inputMessage.value = "";
}

function deleteChat(chatId: string) {
  if (chatSessions.value.length === 1) {
    clearActiveChat(false);
    return;
  }
  const remaining = chatSessions.value.filter(
    (session) => session.id !== chatId,
  );
  chatSessions.value = remaining;
  if (activeChatId.value === chatId) {
    activeChatId.value = remaining[0].id;
  }
}

async function handleFastQuestion(prompt: string, aiContext: unknown) {
  if (isAiLoading.value) return;
  const targetChatId = activeChatId.value;
  const shouldUpdateTitle = activeChat.value?.title === "Chat baru";
  const generatedTitle = createChatTitle(prompt);
  const historyForRequest = (activeChat.value?.messages || []).map(
    (message) => ({ sender: message.sender, text: message.text }),
  );
  // Pesan pertama di chat ini - sudah benar-benar dipakai, jadi keluarkan
  // dari slot draft dan masukkan ke chatSessions untuk selamanya.
  if (draftChat.value && draftChat.value.id === targetChatId) {
    chatSessions.value = [draftChat.value, ...chatSessions.value];
    draftChat.value = null;
  }
  appendMessageToChat(
    targetChatId,
    {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
    },
    shouldUpdateTitle ? generatedTitle : undefined,
  );
  isAiLoading.value = true;
  try {
    const result = await financeApi.post("/ai-copilot/copilot", {
      message: prompt,
      history: historyForRequest,
      context: aiContext,
    });
    appendMessageToChat(targetChatId, {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: result?.reply || "AI tidak memberikan jawaban.",
    });
  } catch (error) {
    appendMessageToChat(targetChatId, {
      id: `ai-error-${Date.now()}`,
      sender: "ai",
      text: getApiErrorMessage(
        error,
        "Gagal menghubungi AI Finstart. Coba lagi sebentar lagi.",
      ),
    });
  } finally {
    isAiLoading.value = false;
  }
}

function handleSendMessage(event: Event, aiContext: unknown) {
  event.preventDefault();
  if (!inputMessage.value.trim()) return;
  const prompt = inputMessage.value;
  inputMessage.value = "";
  handleFastQuestion(prompt, aiContext);
}

export function useCfoCopilotChat() {
  return {
    chatSessions,
    activeChatId,
    inputMessage,
    isAiLoading,
    draftChat,
    pendingScrollMessageId,
    activeChat,
    messages,
    selectChatHistory,
    createNewChat,
    clearActiveChat,
    deleteChat,
    appendMessageToChat,
    handleFastQuestion,
    handleSendMessage,
  };
}
