import type { Ref } from "vue";
import { financeApi } from "../services/financeApi.js";
import { pickAccount, toNumber, withApiFeedback } from "./financeActionUtils";

interface ReceivableActionOptions {
  projects: Ref<any[]>;
  accounts: Ref<any[]>;
  refreshData: () => Promise<void> | void;
  notify: (message: string) => void;
}

export function useReceivableActions({
  projects,
  accounts,
  refreshData,
  notify,
}: ReceivableActionOptions) {
  const invoicePayload = (form: any) => {
    const project = projects.value.find(
      (item) => String(item.id) === String(form.proyekId || form.projectId),
    );
    if (!project) throw new Error("Pilih proyek terlebih dahulu.");
    return {
      client_id: Number(project.klienId),
      project_id: Number(project.id),
      invoice_number:
        form.nomor ||
        form.invoiceNumber ||
        `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      issue_date:
        form.tanggalKirim ||
        form.issueDate ||
        new Date().toISOString().slice(0, 10),
      due_date:
        form.jatuhTempo ||
        form.dueDate ||
        form.tanggalKirim ||
        new Date().toISOString().slice(0, 10),
      notes: form.keterangan || form.notes || `Termin proyek ${project.nama}`,
      items: [
        {
          description: form.keterangan || `Termin proyek ${project.nama}`,
          quantity: 1,
          unit_price: toNumber(form.nominal),
        },
      ],
      tax: {
        ppn_enabled: Boolean(form.ppnEnabled),
        ppn_rate: toNumber(form.ppnRate) || 0,
      },
    };
  };

  const createInvoice = async (form: any) =>
    withApiFeedback(
      async () => {
        await financeApi.post("/invoices", invoicePayload(form));
        await refreshData();
        notify(
          "Invoice draft berhasil disimpan. Terbitkan dari daftar setelah diperiksa.",
        );
      },
      "Gagal membuat invoice.",
      notify,
    );

  const updateInvoice = async (invoice: any, form: any) =>
    withApiFeedback(
      async () => {
        await financeApi.put(
          `/invoices/${invoice.id}`,
          invoicePayload({ ...form, nomor: form.nomor || invoice.nomor }),
        );
        await refreshData();
        notify("Invoice draft berhasil diperbarui.");
      },
      "Gagal memperbarui invoice draft.",
      notify,
    );

  const issueInvoice = async (invoice: any) =>
    withApiFeedback(
      async () => {
        const revenue = pickAccount(accounts, "4001", "Pendapatan");
        await financeApi.post(
          `/invoices/${invoice.id}/issue`,
          revenue ? { revenue_account_id: Number(revenue.id) } : {},
        );
        await refreshData();
        notify(
          `Invoice ${invoice.nomor} diterbitkan dan jurnal otomatis dibuat.`,
        );
      },
      "Gagal menerbitkan invoice.",
      notify,
    );

  const cancelInvoice = async (invoice: any, reason = "") =>
    withApiFeedback(
      async () => {
        await financeApi.post(`/invoices/${invoice.id}/cancel`, {
          cancellation_date: new Date().toISOString().slice(0, 10),
          reason,
        });
        await refreshData();
        notify(`Invoice ${invoice.nomor} berhasil dibatalkan.`);
      },
      "Gagal membatalkan invoice. Invoice yang sudah dibayar sebagian harus dikoreksi melalui nota kredit.",
      notify,
    );

  const recordInvoicePayment = async (invoice: any, payment: any) =>
    withApiFeedback(
      async () => {
        const cash = pickAccount(
          accounts,
          payment.accountCode || "1001",
          "Aset",
        );
        if (!cash) throw new Error("Akun kas/bank belum tersedia.");
        await financeApi.post(`/invoices/${invoice.id}/payments`, {
          payment_date:
            payment.paymentDate || new Date().toISOString().slice(0, 10),
          payment_method: "transfer",
          amount: toNumber(
            payment.amount || invoice.outstandingAmount || invoice.nominal,
          ),
          reference_number: payment.referenceNumber || "",
          notes: payment.notes || "",
          cash_account_id: Number(cash.id),
        });
        await refreshData();
        notify(`Pelunasan invoice ${invoice.nomor} berhasil dibukukan.`);
      },
      "Gagal mencatat pelunasan invoice.",
      notify,
    );

  const billPayload = (form: any) => ({
    vendor_name: form.vendor,
    project_id:
      form.alokasiProyek || form.projectId
        ? Number(form.alokasiProyek || form.projectId)
        : null,
    bill_number:
      form.nomorTagihan ||
      form.billNumber ||
      `BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    bill_date:
      form.tanggalMasuk ||
      form.billDate ||
      new Date().toISOString().slice(0, 10),
    due_date:
      form.jatuhTempo ||
      form.dueDate ||
      form.tanggalMasuk ||
      new Date().toISOString().slice(0, 10),
    notes: form.keterangan || form.notes || "",
    items: [
      {
        description: form.keterangan || "Tagihan vendor",
        quantity: 1,
        unit_price: toNumber(form.nominal),
      },
    ],
    tax: {
      ppn_enabled: Boolean(form.ppnEnabled),
      ppn_rate: toNumber(form.ppnRate) || 0,
      pph23_enabled: Boolean(form.pph23Enabled),
      pph23_rate: toNumber(form.pph23Rate) || 0,
    },
  });

  const createBill = async (form: any) =>
    withApiFeedback(
      async () => {
        await financeApi.post("/bills", billPayload(form));
        await refreshData();
        notify(
          "Tagihan vendor draft berhasil disimpan. Terbitkan dari daftar setelah diperiksa.",
        );
      },
      "Gagal menyimpan tagihan vendor.",
      notify,
    );

  const updateBill = async (bill: any, form: any) =>
    withApiFeedback(
      async () => {
        await financeApi.put(
          `/bills/${bill.id}`,
          billPayload({
            ...form,
            nomorTagihan: form.nomorTagihan || bill.nomorTagihan,
          }),
        );
        await refreshData();
        notify("Tagihan draft berhasil diperbarui.");
      },
      "Gagal memperbarui tagihan draft.",
      notify,
    );

  const issueBill = async (bill: any) =>
    withApiFeedback(
      async () => {
        const expense = pickAccount(accounts, "5002", "Beban");
        await financeApi.post(
          `/bills/${bill.id}/issue`,
          expense ? { expense_account_id: Number(expense.id) } : {},
        );
        await refreshData();
        notify(
          `Tagihan ${bill.nomorTagihan} diterbitkan dan jurnal otomatis dibuat.`,
        );
      },
      "Gagal menerbitkan tagihan.",
      notify,
    );

  const cancelBill = async (bill: any, reason = "") =>
    withApiFeedback(
      async () => {
        await financeApi.post(`/bills/${bill.id}/cancel`, {
          cancellation_date: new Date().toISOString().slice(0, 10),
          reason,
        });
        await refreshData();
        notify(`Tagihan ${bill.nomorTagihan} berhasil dibatalkan.`);
      },
      "Gagal membatalkan tagihan. Tagihan yang sudah dibayar sebagian harus dikoreksi melalui nota debit.",
      notify,
    );

  const payBill = async (bill: any, payment: any) =>
    withApiFeedback(
      async () => {
        const cash = pickAccount(
          accounts,
          payment.accountCode || "1001",
          "Aset",
        );
        if (!cash) throw new Error("Akun kas/bank belum tersedia.");
        await financeApi.post(`/bills/${bill.id}/payments`, {
          payment_date:
            payment.paymentDate || new Date().toISOString().slice(0, 10),
          payment_method: "transfer",
          amount: toNumber(
            payment.amount || bill.outstandingAmount || bill.nominal,
          ),
          reference_number: payment.referenceNumber || "",
          notes: payment.notes || "",
          cash_account_id: Number(cash.id),
        });
        await refreshData();
        notify(`Pembayaran tagihan ${bill.vendor} berhasil dibukukan.`);
      },
      "Gagal mencatat pembayaran tagihan vendor.",
      notify,
    );

  return {
    createInvoice,
    updateInvoice,
    issueInvoice,
    cancelInvoice,
    recordInvoicePayment,
    createBill,
    updateBill,
    issueBill,
    cancelBill,
    payBill,
  };
}
