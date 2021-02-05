import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Feed from '../views/Feed.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Signup.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    props: true
  },
  {
    path: '/feed',
    name: 'Feed',
    component: Feed,
    props: true
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
