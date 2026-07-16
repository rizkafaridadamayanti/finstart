import { inject, provide, type InjectionKey } from "vue";

type AsyncAction = (..._args: any[]) => any;

interface FinStartContext {
  notify: (_message: string) => void;
  refreshData: () => Promise<void> | void;
  selectWorkspace: (_tab: string) => void;
  quickAction: (_action: string) => void;
  ledger: {
    addAccount: AsyncAction;
    updateAccount: AsyncAction;
    deleteAccount: AsyncAction;
    addTransaction: AsyncAction;
    approveJournal: AsyncAction;
    postJournal: AsyncAction;
    cancelJournal: AsyncAction;
  };
  receivables: {
    createInvoice: AsyncAction;
    updateInvoice: AsyncAction;
    issueInvoice: AsyncAction;
    cancelInvoice: AsyncAction;
    recordInvoicePayment: AsyncAction;
    createBill: AsyncAction;
    updateBill: AsyncAction;
    issueBill: AsyncAction;
    cancelBill: AsyncAction;
    payBill: AsyncAction;
  };
  assets: {
    addSubscription: AsyncAction;
    deleteSubscription: AsyncAction;
    addAsset: AsyncAction;
    updateAsset: AsyncAction;
    disposeAsset: AsyncAction;
  };
  tax: {
    createTax: AsyncAction;
    payTax: AsyncAction;
  };
  planning: {
    selectReportPeriod: AsyncAction;
    saveProjection: AsyncAction;
    selectProjectionScenario: AsyncAction;
    updateProjectionScenario: AsyncAction;
    saveBudgetAllocation: AsyncAction;
    deleteBudgetAllocation: AsyncAction;
  };
}

const finStartContextKey: InjectionKey<FinStartContext> =
  Symbol("finstart-context");

export function provideFinStartContext(context: FinStartContext) {
  provide(finStartContextKey, context);
}

export function useFinStartContext() {
  const context = inject(finStartContextKey);
  if (!context) {
    throw new Error("FinStart context belum disediakan oleh App.vue.");
  }
  return context;
}
