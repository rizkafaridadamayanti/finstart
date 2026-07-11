import type { Ref } from "vue";
import { financeApi } from "../services/financeApi.js";
import { pickAccount, toNumber, withApiFeedback } from "./financeActionUtils";

interface LedgerActionOptions {
  accounts: Ref<any[]>;
  refreshData: () => Promise<void> | void;
  notify: (message: string) => void;
}

export function useLedgerActions({
  accounts,
  refreshData,
  notify,
}: LedgerActionOptions) {
  const accountPayload = (item: any) => {
    const typeMap: Record<string, string> = {
      Aset: "asset",
      Kewajiban: "liability",
      Modal: "equity",
      Pendapatan: "revenue",
      Beban: "expense",
    };
    return {
      code: item.kode,
      name: item.nama,
      type: typeMap[item.tipe] || item.type || "asset",
      normal_balance:
        item.normalBalance ||
        (["Aset", "Beban"].includes(item.tipe) ? "debit" : "credit"),
      opening_balance: toNumber(item.saldo ?? item.openingBalance),
      status: item.status || "active",
      parent_id: item.parentId || item.parent_id || null,
    };
  };

  const addAccount = async (item: any) =>
    withApiFeedback(
      async () => {
        await financeApi.post("/accounts", accountPayload(item));
        await refreshData();
        notify("Akun buku besar berhasil disimpan ke database.");
      },
      "Gagal menyimpan akun buku besar.",
      notify,
    );

  const updateAccount = async (account: any, item: any) =>
    withApiFeedback(
      async () => {
        await financeApi.put(`/accounts/${account.id}`, accountPayload(item));
        await refreshData();
        notify("Akun buku besar berhasil diperbarui.");
      },
      "Gagal memperbarui akun buku besar.",
      notify,
    );

  const deleteAccount = async (account: any) =>
    withApiFeedback(
      async () => {
        await financeApi.delete(`/accounts/${account.id}`);
        await refreshData();
        notify("Akun buku besar berhasil dihapus.");
      },
      "Akun tidak dapat dihapus karena sudah dipakai jurnal/transaksi. Nonaktifkan akun tersebut sebagai gantinya.",
      notify,
    );

  async function createJournal(newTransaction: any) {
    const incomingLines = Array.isArray(newTransaction.lines)
      ? newTransaction.lines
      : [];
    const lines = incomingLines.length
      ? incomingLines.map((line: any) => {
          const account = pickAccount(
            accounts,
            line.kode || line.accountCode || line.account_id,
            line.debit > 0 ? "Aset" : undefined,
          );
          if (!account) {
            throw new Error(
              `Akun ${line.kode || line.accountCode || ""} belum tersedia di database.`,
            );
          }
          return {
            account_id: Number(account.id),
            description: newTransaction.keterangan || "",
            debit: toNumber(line.debit),
            credit: toNumber(line.credit),
          };
        })
      : (() => {
          const debit = pickAccount(accounts, newTransaction.debitAkun, "Aset");
          const credit = pickAccount(
            accounts,
            newTransaction.kreditAkun,
            "Pendapatan",
          );
          if (!debit || !credit) {
            throw new Error(
              "Akun debit atau kredit belum tersedia di database.",
            );
          }
          return [
            {
              account_id: Number(debit.id),
              description: newTransaction.keterangan || "",
              debit: toNumber(newTransaction.nominal),
              credit: 0,
            },
            {
              account_id: Number(credit.id),
              description: newTransaction.keterangan || "",
              debit: 0,
              credit: toNumber(newTransaction.nominal),
            },
          ];
        })();

    return financeApi.post("/journals", {
      voucher_number: newTransaction.refVoucher || `JV-${Date.now()}`,
      transaction_date:
        newTransaction.tanggal || new Date().toISOString().slice(0, 10),
      description: newTransaction.keterangan || "Jurnal manual FinStart",
      source_type: "manual",
      source_id: null,
      division_id:
        Number(newTransaction.divisionId || newTransaction.division_id || 0) ||
        null,
      lines,
    });
  }

  const addTransaction = async (item: any) =>
    withApiFeedback(
      async () => {
        await createJournal(item);
        await refreshData();
        notify(
          "Jurnal draft berhasil dibuat dan menunggu approval pengguna lain.",
        );
      },
      "Gagal membuat jurnal draft.",
      notify,
    );

  const approveJournal = async (item: any) =>
    withApiFeedback(
      async () => {
        await financeApi.post(`/journals/${item.id}/approve`, {});
        await refreshData();
        notify("Jurnal disetujui dan siap diposting.");
      },
      "Gagal menyetujui jurnal. Pastikan jurnal masih draft dan user memiliki akses approval.",
      notify,
    );

  const postJournal = async (item: any) =>
    withApiFeedback(
      async () => {
        await financeApi.post(`/journals/${item.id}/post`, {});
        await refreshData();
        notify("Jurnal berhasil diposting ke Buku Besar.");
      },
      "Gagal memposting jurnal. Pastikan jurnal sudah disetujui.",
      notify,
    );

  return {
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    approveJournal,
    postJournal,
  };
}
