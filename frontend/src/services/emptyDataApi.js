// Interceptori baca untuk mode data kosong.
//
// Beberapa modul (SDM, Payroll, Pengaturan, Aset) memanggil API sendiri di luar
// useFinStartApp. Supaya tidak ada data asli yang masuk ke UI dari jalur mana
// pun, semua request GET di-serve dengan struktur kosong.

import { EMPTY_DATA_MODE, createEmptyData } from "../wireframe/emptyState.ts";

function emptyResponse(path) {
  const data = createEmptyData();
  const normalized = String(path || "").split("?")[0].replace(/\/+$/, "");

  if (normalized === "/divisions") return data.divisions;
  if (normalized === "/positions") return data.positions;
  if (normalized === "/bpjs-config") return data.bpjsConfig;
  if (normalized === "/payroll") return data.payrollHistory;
  if (normalized === "/payroll/summary") return data.payrollSummary;
  if (normalized === "/payroll/accounts") return data.payrollAccounts;
  if (normalized === "/asset-categories") return data.assetCategories;
  if (/^\/assets\/[^/]+\/depreciations$/.test(normalized)) {
    return { asset: {}, depreciations: [] };
  }
  if (/^\/journals\/[^/]+$/.test(normalized)) return data.journalDetail;
  if (normalized === "/company-settings") return data.companySettings;
  if (normalized === "/auth/security-settings") return data.securitySettings;
  if (normalized === "/auth/sessions") return data.sessions;
  if (normalized === "/roles") return data.roles;
  if (normalized === "/users") return data.users;
  if (normalized === "/audit") return data.auditLog;
  return undefined;
}

export function getEmptyDataResponse(path) {
  if (!EMPTY_DATA_MODE) return undefined;
  return emptyResponse(path);
}
