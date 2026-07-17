import type { Ref } from "vue";
import { financeApi } from "../services/financeApi.js";
import { pickAccount, toNumber, withApiFeedback } from "./financeActionUtils";

const SUBSCRIPTION_EXPENSE_CODES: Record<string, string> = {
  Infrastruktur: "5002",
  Software: "5001",
  Marketing: "5001",
  "Hosting / Cloud": "5001",
  "Internet & Jaringan": "5002",
  "Layanan Profesional": "5003",
  Maintenance: "5003",
  Asuransi: "5003",
  Lainnya: "5001",
};

const CASH_BANK_CODES = ["1001", "1110", "1120", "1130"];

interface AssetActionOptions {
  subscriptions: Ref<any[]>;
  accounts: Ref<any[]>;
  refreshData: () => Promise<void> | void;
  notify: (message: string) => void;
}

export function useAssetActions({
  subscriptions,
  accounts,
  refreshData,
  notify,
}: AssetActionOptions) {
  const addSubscription = async (item: any) =>
    withApiFeedback(
      async () => {
        const cycle = item.siklus === "Tahunan" ? "yearly" : "monthly";
        const amount = toNumber(item.biayaIDR || item.biaya);
        const startDay =
          item.tanggalTagihan || new Date().toISOString().slice(0, 10);
        await financeApi.post("/subscriptions", {
          subscription_name: item.nama,
          provider_name: item.provider,
          category: item.kategori,
          amount,
          billing_cycle: cycle,
          start_date: startDay,
          renewal_date: startDay,
          payment_terms_days: 0,
          status: "active",
          notes:
            item.mataUang && item.mataUang !== "IDR"
              ? `Nominal asli: ${item.mataUang} ${item.biaya}. Kurs input: ${item.kurs || "-"}.`
              : "",
        });

        await refreshData();
        notify(
          "Langganan berhasil disimpan, aktif, dan jurnal pembayaran langsung posted/paid.",
        );
        return true;
      },
      "Gagal menyimpan langganan.",
      notify,
    );

  const createSubscriptionBill = async (subscription: any) =>
    withApiFeedback(
      async () => {
        const result = await financeApi.post(
          `/subscriptions/${subscription.id}/create-bill`,
          {},
        );
        await refreshData();
        notify(
          `Draft tagihan ${subscription.nama} berhasil dibuat. Posting untuk membuat jurnal utang.`,
        );
        return result;
      },
      "Gagal membuat draft tagihan langganan.",
      notify,
    );

  const issueSubscriptionBill = async (subscription: any) =>
    withApiFeedback(
      async () => {
        const billId = subscription.latestBillId || subscription._raw?.latest_bill_id;
        if (!billId) {
          throw new Error("Draft tagihan langganan belum tersedia.");
        }
        const expenseCode =
          SUBSCRIPTION_EXPENSE_CODES[subscription.kategori] || "5001";
        const expense = pickAccount(accounts, expenseCode, "Beban");
        await financeApi.post(
          `/bills/${billId}/issue`,
          expense ? { expense_account_id: Number(expense.id) } : {},
        );
        await refreshData();
        notify(
          `Tagihan ${subscription.nama} diposting dan jurnal utang otomatis dibuat.`,
        );
        return true;
      },
      "Gagal memposting tagihan langganan.",
      notify,
    );

  const paySubscriptionBill = async (subscription: any) =>
    withApiFeedback(
      async () => {
        const billId = subscription.latestBillId || subscription._raw?.latest_bill_id;
        if (!billId) {
          throw new Error("Tagihan langganan belum tersedia.");
        }
        const cash = CASH_BANK_CODES.map((code) =>
          accounts.value.find(
            (account) =>
              String(account.kode) === code && account.status === "active",
          ),
        ).find(Boolean);
        if (!cash) {
          throw new Error(
            "Akun kas/bank (1001/1110/1120) belum tersedia. Silakan buat akun kas terlebih dahulu di Buku Besar.",
          );
        }
        await financeApi.post(`/bills/${billId}/payments`, {
          payment_date: new Date().toISOString().slice(0, 10),
          payment_method: "transfer",
          amount: toNumber(
            subscription.latestBillOutstandingAmount ||
              subscription._raw?.latest_bill_outstanding_amount ||
              subscription.latestBillTotalAmount ||
              subscription.biayaIDR ||
              subscription.biaya,
          ),
          reference_number: `PAY-SUB-${billId}`,
          notes: `Pembayaran langganan ${subscription.nama}`,
          cash_account_id: Number(cash.id),
        });
        await refreshData();
        notify(`Pembayaran langganan ${subscription.nama} berhasil dibukukan.`);
        return true;
      },
      "Gagal membayar tagihan langganan.",
      notify,
    );

  const deleteSubscription = async (id: string) =>
    withApiFeedback(
      async () => {
        const subscription = subscriptions.value.find(
          (item) => String(item.id) === String(id),
        );
        const raw = subscription?._raw;
        if (!raw) throw new Error("Data langganan tidak ditemukan.");
        await financeApi.put(`/subscriptions/${id}`, {
          subscription_name: raw.subscription_name,
          provider_name: raw.provider_name,
          category: raw.category,
          amount: toNumber(raw.amount),
          billing_cycle: raw.billing_cycle,
          start_date: String(raw.start_date || "").slice(0, 10),
          renewal_date: String(raw.renewal_date || "").slice(0, 10),
          payment_terms_days: toNumber(raw.payment_terms_days),
          status: "cancelled",
          notes: raw.notes || "",
        });
        await refreshData();
        notify("Langganan dinonaktifkan di database.");
        return true;
      },
      "Gagal menonaktifkan langganan.",
      notify,
    );

  const addAsset = async (item: any) =>
    withApiFeedback(
      async () => {
        const cash = CASH_BANK_CODES.map((code) =>
          accounts.value.find(
            (account) =>
              String(account.kode) === code && account.status === "active",
          ),
        ).find(Boolean);
        if (!cash) {
          throw new Error(
            "Akun kas/bank belum tersedia. Silakan buat akun kas (1001) atau bank (1110/1120) di Buku Besar terlebih dahulu.",
          );
        }
        await financeApi.post("/assets", {
          asset_name: item.nama,
          category: item.kategori,
          acquisition_date:
            item.tanggalBeli || new Date().toISOString().slice(0, 10),
          acquisition_cost: toNumber(item.hargaBeli),
          useful_life_months: Math.max(1, toNumber(item.masaManfaat) * 12),
          residual_value: toNumber(item.nilaiSisa),
          payment_account_id: Number(cash.id),
          notes: item.penanggungJawab
            ? `Penanggung jawab: ${item.penanggungJawab}`
            : "",
        });
        await refreshData();
        notify("Aset berhasil diregistrasi dan dijurnal ke database.");
        return true;
      },
      "Gagal meregistrasi aset.",
      notify,
    );

  const updateAsset = async (asset: any, item: any) =>
    withApiFeedback(
      async () => {
        const raw = asset?._raw || {};
        await financeApi.put(`/assets/${asset.id}`, {
          asset_name: item.nama,
          category: item.kategori,
          useful_life_months: Math.max(1, toNumber(item.masaManfaat) * 12),
          residual_value: toNumber(item.nilaiSisa),
          notes: item.penanggungJawab
            ? `Penanggung jawab: ${item.penanggungJawab}`
            : raw.notes || "",
        });
        await refreshData();
        notify(
          "Data aset berhasil diperbarui. Harga perolehan tidak diubah agar jurnal akuisisi tetap konsisten.",
        );
        return true;
      },
      "Gagal memperbarui aset.",
      notify,
    );

  const disposeAsset = async (asset: any, reason = "") =>
    withApiFeedback(
      async () => {
        await financeApi.post(`/assets/${asset.id}/dispose`, {
          disposal_date: new Date().toISOString().slice(0, 10),
          reason,
        });
        await refreshData();
        notify(`Aset ${asset.nama} telah dilepas dan jurnal pelepasan dibuat.`);
        return true;
      },
      "Gagal melepas aset.",
      notify,
    );

  return {
    addSubscription,
    createSubscriptionBill,
    issueSubscriptionBill,
    paySubscriptionBill,
    deleteSubscription,
    addAsset,
    updateAsset,
    disposeAsset,
  };
}
