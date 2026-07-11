import type { Ref } from "vue";
import { financeApi } from "../services/financeApi.js";
import { toNumber, withApiFeedback } from "./financeActionUtils";

interface PlanningActionOptions {
  projectionData: Ref<any>;
  projectionScenario: Ref<string>;
  refreshData: () => Promise<void> | void;
  notify: (message: string) => void;
}

export function usePlanningActions({
  projectionData,
  projectionScenario,
  refreshData,
  notify,
}: PlanningActionOptions) {
  const saveProjection = async (item: any) =>
    withApiFeedback(
      async () => {
        const rawMonth = item.month ?? item.bulanProyeksi;
        const month = /^\d{4}-\d{2}$/.test(String(rawMonth || ""))
          ? Number(String(rawMonth).slice(-2))
          : Number(rawMonth || new Date().getMonth() + 1);
        if (!Number.isFinite(month) || month < 1 || month > 12) {
          throw new Error("Bulan target proyeksi tidak valid.");
        }
        const existing =
          (projectionData.value.months || []).find(
            (row: any) => Number(row.month) === month,
          ) || {};
        const isExpense =
          item.akunType === "Beban" ||
          String(item.akunName || item.nama || "")
            .toLowerCase()
            .includes("beban") ||
          String(item.akunName || item.nama || "")
            .toLowerCase()
            .includes("expense");
        await financeApi.post("/projections", {
          projection_year: Number(
            projectionData.value.year || new Date().getFullYear(),
          ),
          projection_month: month,
          revenue_target: isExpense
            ? toNumber(existing.revenue_target)
            : toNumber(item.nilaiTarget || item.nilai),
          expense_target: isExpense
            ? toNumber(item.nilaiTarget || item.nilai)
            : toNumber(existing.expense_target),
          notes: item.catatan || "",
        });
        await refreshData();
        notify("Target proyeksi berhasil disimpan ke database.");
      },
      "Gagal menyimpan proyeksi.",
      notify,
    );

  const selectProjectionScenario = async (scenarioKey: string) => {
    projectionScenario.value = [
      "optimistic",
      "normal",
      "pessimistic",
    ].includes(String(scenarioKey))
      ? String(scenarioKey)
      : "normal";
    await refreshData();
  };

  const updateProjectionScenario = async (scenario: any) =>
    withApiFeedback(
      async () => {
        await financeApi.put(
          `/projections/scenarios/${scenario.scenario_key}`,
          {
            projection_year: Number(
              projectionData.value.year || new Date().getFullYear(),
            ),
            revenue_factor: toNumber(scenario.revenue_factor),
            expense_factor: toNumber(scenario.expense_factor),
            notes: scenario.notes || "",
          },
        );
        await refreshData();
        notify("Parameter skenario proyeksi berhasil diperbarui.");
      },
      "Gagal memperbarui skenario proyeksi.",
      notify,
    );

  const saveBudgetAllocation = async (budget: any) =>
    withApiFeedback(
      async () => {
        const payload = {
          budget_year: Number(
            budget.budget_year ||
              projectionData.value.year ||
              new Date().getFullYear(),
          ),
          budget_month:
            budget.budget_month === "" ||
            budget.budget_month === null ||
            budget.budget_month === undefined
              ? null
              : Number(budget.budget_month),
          scenario_key:
            budget.scenario_key || projectionScenario.value || "normal",
          account_id: Number(budget.account_id),
          division_id: budget.division_id ? Number(budget.division_id) : null,
          budget_amount: toNumber(budget.budget_amount),
          notes: budget.notes || "",
        };
        if (budget.id) {
          await financeApi.put(`/projections/budgets/${budget.id}`, payload);
        } else {
          await financeApi.post("/projections/budgets", payload);
        }
        await refreshData();
        notify(
          budget.id
            ? "Budget akun/divisi berhasil diperbarui."
            : "Budget akun/divisi berhasil disimpan.",
        );
      },
      "Gagal menyimpan budget akun/divisi.",
      notify,
    );

  const deleteBudgetAllocation = async (budget: any) =>
    withApiFeedback(
      async () => {
        await financeApi.delete(`/projections/budgets/${budget.id}`);
        await refreshData();
        notify("Budget akun/divisi berhasil dihapus.");
      },
      "Gagal menghapus budget akun/divisi.",
      notify,
    );

  return {
    saveProjection,
    selectProjectionScenario,
    updateProjectionScenario,
    saveBudgetAllocation,
    deleteBudgetAllocation,
  };
}
