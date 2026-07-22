import type { Ref } from "vue";
import { financeApi } from "../services/financeApi.js";
import { todayIso } from "../utils/localDate";
import {
  normalizePeriod,
  pickAccount,
  toNumber,
  withApiFeedback,
} from "./financeActionUtils";

interface TaxActionOptions {
  accounts: Ref<any[]>;
  refreshData: (options?: { bumpVersion?: boolean }) => Promise<void> | void;
  notify: (message: string) => void;
}

export function useTaxActions({
  accounts,
  refreshData,
  notify,
}: TaxActionOptions) {
  const createTax = async (item: any) =>
    withApiFeedback(
      async () => {
        const created = await financeApi.post("/taxes", {
          tax_type: item.jenis,
          tax_period: normalizePeriod(item.masaPajak),
          amount: toNumber(item.nominal),
          due_date: item.jatuhTempo || todayIso(),
          notes: item.catatan || "",
        });
        const expense = pickAccount(accounts, "5002", "Beban");
        await financeApi.post(
          `/taxes/${created.id}/issue`,
          expense ? { expense_account_id: Number(expense.id) } : {},
        );
        await refreshData({ bumpVersion: false });
        notify("Kewajiban pajak berhasil disimpan dan diposting.");
      },
      "Gagal menyimpan kewajiban pajak.",
      notify,
    );

  const payTax = async (tax: any, payment: any) =>
    withApiFeedback(
      async () => {
        const cash = pickAccount(
          accounts,
          payment.accountCode || "1001",
          "Aset",
        );
        if (!cash) throw new Error("Akun kas/bank belum tersedia.");
        await financeApi.post(`/taxes/${tax.id}/issue`, {});
        await financeApi.post(`/taxes/${tax.id}/pay`, {
          payment_date:
            payment.paymentDate || todayIso(),
          cash_account_id: Number(cash.id),
          tax_number: payment.taxNumber || tax.ntpn || "",
          notes: payment.notes || "",
        });
        await refreshData({ bumpVersion: false });
        notify(`Setoran ${tax.jenis} berhasil dibukukan.`);
        return true;
      },
      "Gagal mencatat setoran pajak.",
      notify,
    );

  return { createTax, payTax };
}
