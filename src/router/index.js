import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Order from '../views/Order.vue'
import Account from '../views/Accounts.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Order,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: Account,
    meta: {
      requiresAuth: true,
      permission: 'STOREADMIN'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
