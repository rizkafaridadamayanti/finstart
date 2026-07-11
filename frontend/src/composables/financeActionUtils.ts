import type { Ref } from "vue";
import { getApiErrorMessage } from "../services/financeApi.js";

const ACCOUNT_CODE_ALIASES: Record<string, string[]> = {
  "1001": ["1120", "1110"],
  "1002": ["1110", "1120"],
  "1103": ["1130"],
  "2001": ["2100"],
  "2002": ["2200", "2210", "2211"],
  "4001": ["4100"],
  "4002": ["4100"],
  "5001": ["5100"],
  "5002": ["5100"],
  "5003": ["5100"],
};

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizePeriod(value: string) {
  if (/^\d{4}-\d{2}$/.test(String(value || ""))) return value;
  const text = String(value || "").trim();
  const match = text.match(/^([A-Za-zÀ-ÿ]+)\s+(\d{4})$/);
  if (!match) return currentPeriod();
  const index = MONTHS_ID.findIndex(
    (month) => month.toLowerCase() === match[1].toLowerCase(),
  );
  return index >= 0
    ? `${match[2]}-${String(index + 1).padStart(2, "0")}`
    : currentPeriod();
}

export function toNumber(value: unknown) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

export function pickAccount(
  accounts: Ref<any[]>,
  code: string,
  preferredType?: string,
) {
  const aliases = ACCOUNT_CODE_ALIASES[String(code || "")] || [
    String(code || ""),
  ];
  const direct = aliases
    .map((item) =>
      accounts.value.find((account) => String(account.kode) === item),
    )
    .find(Boolean);
  if (direct) return direct;
  if (preferredType) {
    return accounts.value.find((account) => account.tipe === preferredType);
  }
  return accounts.value[0];
}

export async function withApiFeedback<T>(
  task: () => Promise<T>,
  fallback: string,
  notify: (message: string) => void,
): Promise<T | undefined> {
  try {
    return await task();
  } catch (error) {
    console.error(error);
    notify(getApiErrorMessage(error, fallback));
    return undefined;
  }
}
