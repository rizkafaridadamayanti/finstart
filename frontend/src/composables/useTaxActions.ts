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
        await financeApi.post("/taxes", {
          tax_type: item.jenis,
          employee_id: item.employeeId || null,
          tax_period: normalizePeriod(item.masaPajak),
          amount: toNumber(item.nominal),
          due_date: item.jatuhTempo || todayIso(),
          notes: item.catatan || "",
        });
        await refreshData({ bumpVersion: false });
        notify(
          "Draft kewajiban pajak berhasil disimpan. Posting untuk membuat jurnalnya.",
        );
      },
      "Gagal menyimpan kewajiban pajak.",
      notify,
    );

  const issueTax = async (tax: any) =>
    withApiFeedback(
      async () => {
        const expense = pickAccount(accounts, "5002", "Beban");
        await financeApi.post(
          `/taxes/${tax.id}/issue`,
          expense ? { expense_account_id: Number(expense.id) } : {},
        );
        await refreshData({ bumpVersion: false });
        notify(`Kewajiban ${tax.jenis} berhasil diposting.`);
      },
      "Gagal memposting kewajiban pajak.",
      notify,
    );

  const getVatSummary = async (period: string) =>
    financeApi.get("/tax-engine/vat", { period: normalizePeriod(period) });

  const closeVatPeriod = async (params: {
    period: string;
    dueDate?: string;
    notes?: string;
  }) =>
    withApiFeedback(
      async () => {
        await financeApi.post("/tax-engine/vat/close", {
          period: normalizePeriod(params.period),
          due_date: params.dueDate || null,
          notes: params.notes || "",
        });
        await refreshData({ bumpVersion: false });
        notify(`Masa PPN ${params.period} berhasil ditutup.`);
        return true;
      },
      "Gagal menutup masa PPN.",
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
        // Kewajiban yang jurnalnya sudah terbit (mis. PPh 21 yang disetor
        // setelah diposting lewat jurnal gabungan payroll) tidak boleh
        // diterbitkan lagi, jadi langsung proceed ke setoran.
        if (String(tax?.rawStatus || tax?.status || "") === "draft") {
          await financeApi.post(`/taxes/${tax.id}/issue`, {});
        }
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

  return {
    createTax,
    issueTax,
    payTax,
    getVatSummary,
    closeVatPeriod,
  };
}
