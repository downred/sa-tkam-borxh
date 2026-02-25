import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: () => import('../views/Expenses.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-group',
    name: 'CreateGroup',
    component: () => import('../views/CreateGroupView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-expense',
    name: 'CreateExpense',
    component: () => import('../views/CreateExpenseView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-expense',
    name: 'EditExpense',
    component: () => import('../views/EditExpenseView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: () => import('../views/Friends.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('../views/Groups.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:id',
    name: 'GroupDetails',
    component: () => import('../views/GroupDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:id/add-members',
    name: 'AddGroupMembers',
    component: () => import('../views/AddGroupMembersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:id/settle-up',
    name: 'SettleUpSelect',
    component: () => import('../views/SettleUpSelect.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:id/settle-up/:memberId',
    name: 'SettleUpAmount',
    component: () => import('../views/SettleUpAmount.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  
  else if (to.meta.guestOnly && isAuthenticated) {
    next('/groups')
  } 
  else {
    next()
  }
})

export default router
