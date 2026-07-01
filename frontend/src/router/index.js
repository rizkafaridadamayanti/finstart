import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CrmProjectView from '../views/CrmProjectView.vue'
import GeneralLedgerView from '../views/GeneralLedgerView.vue'
import TransactionView from '../views/TransactionView.vue'
import SubscriptionView from '../views/SubscriptionView.vue'
import ReceivableView from '../views/ReceivableView.vue'
import PayableView from '../views/PayableView.vue'
import ProjectionView from '../views/ProjectionView.vue'
import TaxView from '../views/TaxView.vue'
import EmployeeView from '../views/EmployeeView.vue'
import AssetView from '../views/AssetView.vue'
import ReportView from '../views/ReportView.vue'
import SettingsView from '../views/SettingsView.vue'
import AppLayout from '../components/layout/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
      },
      {
        path: 'crm-project',
        name: 'crm-project',
        component: CrmProjectView,
      },
      {
        path: 'general-ledger',
        name: 'general-ledger',
        component: GeneralLedgerView,
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: TransactionView,
      },
      {
        path: 'subscriptions',
        name: 'subscriptions',
        component: SubscriptionView,
      },
      {
        path: 'receivables',
        name: 'receivables',
        component: ReceivableView,
      },
      {
        path: 'payables',
        name: 'payables',
        component: PayableView,
      },
      {
        path: 'projections',
        name: 'projections',
        component: ProjectionView,
      },
      {
        path: 'taxes',
        name: 'taxes',
        component: TaxView,
      },
      {
        path: 'employees',
        name: 'employees',
        component: EmployeeView,
      },
      {
        path: 'assets',
        name: 'assets',
        component: AssetView,
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportView,
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router