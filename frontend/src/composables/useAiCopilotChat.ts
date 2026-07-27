// Status chat AI (sesi, pesan, loading) HARUS hidup di luar komponen
// DashboardView, karena App.vue menghancurkan total komponen itu setiap kali
// pengguna pindah tab (:key="activeTab" + <Transition mode="out-in">, tanpa
// KeepAlive). Kalau state ini didefinisikan di dalam DashboardView.vue,
// permintaan AI yang sedang berjalan saat pengguna pindah halaman akan tetap
// terkirim ke backend, tapi begitu jawabannya datang, watcher penyimpan
// riwayat & seluruh reactive state sudah ikut dimatikan Vue bareng komponennya
// - jawabannya hilang begitu saja, tidak pernah tersimpan/terlihat lagi.
// Modul terpisah ini (bukan sekadar dipindah ke bagian lain file .vue) adalah
// singleton sungguhan di level modul ES - jadi tetap ada walau DashboardView
// dibongkar-pasang berkali-kali saat berpindah tab.
import { computed, ref, watch } from "vue";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";

type InsightMessage = {
  sender: "ai" | "user";
  text: string;
  id: string;
};
type ChatSession = {
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
const chatSessions = ref<ChatSession[]>(initialSessions);
const updateChatSessions = (next: ChatSession[]) => (chatSessions.value = next);
const activeChatId = ref(initialSessions[0]?.id || initialChatSessions[0].id);
const updateActiveChatId = (next: string) => (activeChatId.value = next);
const inputMessage = ref("");
const updateInputMessage = (next: string) => (inputMessage.value = next);
const isAiLoading = ref(false);
const updateIsAiLoading = (next: boolean) => (isAiLoading.value = next);
// Riwayat adalah panel lokal di dalam kartu AI, bukan drawer global halaman.
const isChatHistoryOpen = ref(false);
const updateIsChatHistoryOpen = (next: any) => (isChatHistoryOpen.value = next);
const pendingScrollMessageId = ref("");
const chatDeleteConfirmId = ref("");
// A chat created via "Chat baru" lives here - NOT in chatSessions - until the
// user actually sends a first message. That keeps unused new-chat clicks out
// of the history list/count instead of cluttering it with empty "Chat baru"
// entries the moment the button is pressed.
const draftChat = ref<ChatSession | null>(null);

const activeChat = computed(() => {
  if (draftChat.value && draftChat.value.id === activeChatId.value) {
    return draftChat.value;
  }
  return (
    chatSessions.value.find((session) => session.id === activeChatId.value) ||
    chatSessions.value[0]
  );
});
const chatDeleteTarget = computed(
  () =>
    chatSessions.value.find(
      (session) => session.id === chatDeleteConfirmId.value,
    ) || null,
);
const messages = computed(() => activeChat.value?.messages || []);

// Watcher berdiri sendiri di level modul (bukan di dalam setup() komponen
// manapun) - Vue tidak akan pernah otomatis menghentikannya saat komponen
// dibongkar, jadi riwayat tetap tersimpan ke localStorage walau jawaban AI
// datang setelah pengguna sudah pindah ke tab lain.
watch(
  chatSessions,
  (sessions) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CFO_CHAT_STORAGE_KEY,
        JSON.stringify(sessions.slice(0, 12)),
      );
    }
  },
  { deep: true },
);

const closeChatHistory = () => updateIsChatHistoryOpen(false);
const toggleChatHistory = () =>
  updateIsChatHistoryOpen((open: boolean) => !open);

const selectChatHistory = (chatId: string) => {
  // Switching to a saved chat abandons whatever draft was sitting unused -
  // it was never persisted anywhere, so there's nothing to clean up.
  draftChat.value = null;
  updateActiveChatId(chatId);
  closeChatHistory();
};

const createNewChat = () => {
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
  updateActiveChatId(newSession.id);
  updateInputMessage("");
  closeChatHistory();
};

const createChatTitle = (prompt: string) => {
  const title = prompt.replace(/\s+/g, " ").trim();
  return title.length > 88 ? `${title.slice(0, 85)}...` : title;
};

const createClearedChatArchive = (
  session: ChatSession,
): ChatSession | null => {
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
};

const clearActiveChat = (archiveCleared = true) => {
  const current = activeChat.value;
  // Clearing an unused draft is a no-op: it has no conversation to archive
  // and it isn't in chatSessions yet, so there's nothing to reset there.
  if (draftChat.value && current?.id === draftChat.value.id) {
    updateInputMessage("");
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
    ...chatSessions.value.filter(
      (session) => session.id !== clearedSession.id,
    ),
  ].slice(0, 12);
  updateActiveChatId(clearedSession.id);
  updateInputMessage("");
};

const deleteChat = (chatId: string) => {
  if (chatSessions.value.length === 1) {
    clearActiveChat(false);
    return;
  }
  const remaining = chatSessions.value.filter(
    (session) => session.id !== chatId,
  );
  updateChatSessions(remaining);
  if (activeChatId.value === chatId) {
    updateActiveChatId(remaining[0].id);
  }
};

const appendMessageToChat = (
  chatId: string,
  message: InsightMessage,
  titleFromPrompt?: string,
) => {
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
};

function handleDeleteChatClick(chatId: string, event: MouseEvent) {
  event.stopPropagation();
  chatDeleteConfirmId.value = chatId;
}

function closeChatDeleteConfirm() {
  chatDeleteConfirmId.value = "";
}

function confirmDeleteChat() {
  if (!chatDeleteConfirmId.value) return;
  deleteChat(chatDeleteConfirmId.value);
  closeChatDeleteConfirm();
}

// aiContext dikirim sebagai argumen (bukan diambil dari state modul ini)
// karena isinya dihitung dari props/data live komponen Dashboard yang
// memanggilnya - hanya dibutuhkan untuk MENGIRIM permintaan, jadi aman
// walau komponen pemanggilnya sudah dibongkar sebelum jawabannya datang.
const handleFastQuestion = async (prompt: string, aiContext: any) => {
  if (isAiLoading.value) return;
  const targetChatId = activeChatId.value;
  const shouldUpdateTitle = activeChat.value?.title === "Chat baru";
  const generatedTitle = createChatTitle(prompt);
  const historyForRequest = (activeChat.value?.messages || []).map(
    (message) => ({ sender: message.sender, text: message.text }),
  );
  // First real message in this chat - it's actually being used now, so move
  // it out of the draft slot and into history for good.
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
  updateIsAiLoading(true);
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
    updateIsAiLoading(false);
  }
};

const handleSendMessage = (event: Event, aiContext: any) => {
  event.preventDefault();
  if (!inputMessage.value.trim()) return;
  const prompt = inputMessage.value;
  updateInputMessage("");
  handleFastQuestion(prompt, aiContext);
};

export function useAiCopilotChat() {
  return {
    chatSessions,
    updateChatSessions,
    activeChatId,
    updateActiveChatId,
    inputMessage,
    updateInputMessage,
    isAiLoading,
    updateIsAiLoading,
    isChatHistoryOpen,
    updateIsChatHistoryOpen,
    pendingScrollMessageId,
    chatDeleteConfirmId,
    draftChat,
    activeChat,
    chatDeleteTarget,
    messages,
    closeChatHistory,
    toggleChatHistory,
    selectChatHistory,
    createNewChat,
    createChatTitle,
    createClearedChatArchive,
    clearActiveChat,
    deleteChat,
    appendMessageToChat,
    handleDeleteChatClick,
    closeChatDeleteConfirm,
    confirmDeleteChat,
    handleFastQuestion,
    handleSendMessage,
  };
}
