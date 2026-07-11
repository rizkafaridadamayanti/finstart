import type { Ref } from "vue";
import { financeApi } from "../services/financeApi.js";
import { pickAccount, toNumber, withApiFeedback } from "./financeActionUtils";

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
        await financeApi.post("/subscriptions", {
          subscription_name: item.nama,
          provider_name: item.provider,
          category: item.kategori,
          amount: toNumber(item.biayaIDR || item.biaya),
          billing_cycle: cycle,
          start_date:
            item.tanggalTagihan || new Date().toISOString().slice(0, 10),
          renewal_date:
            item.tanggalTagihan || new Date().toISOString().slice(0, 10),
          payment_terms_days: 0,
          status: "active",
          notes:
            item.mataUang && item.mataUang !== "IDR"
              ? `Nominal asli: ${item.mataUang} ${item.biaya}. Kurs input: ${item.kurs || "-"}.`
              : "",
        });
        await refreshData();
        notify("Langganan berhasil disimpan ke database.");
      },
      "Gagal menyimpan langganan.",
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
      },
      "Gagal menonaktifkan langganan.",
      notify,
    );

  const addAsset = async (item: any) =>
    withApiFeedback(
      async () => {
        const cash = pickAccount(accounts, "1001", "Aset");
        if (!cash) {
          throw new Error("Akun kas/bank untuk perolehan aset belum tersedia.");
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
      },
      "Gagal melepas aset.",
      notify,
    );

  return {
    addSubscription,
    deleteSubscription,
    addAsset,
    updateAsset,
    disposeAsset,
  };
}
