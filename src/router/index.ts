// Vue Router — maps a URL path to a view component. Adding this is what
// turns the app from one page into a Single Page Application with multiple
// "pages" that never trigger a real browser navigation (see
// docs/02_GUIDE.md, Level 8, and docs/01_SETUP.md for what a Single Page
// Application means here).
import { createRouter, createWebHistory } from 'vue-router'
import TaskBoardView from '../views/TaskBoardView.vue'
import AboutView from '../views/AboutView.vue'
import ApiDemoView from '../views/ApiDemoView.vue'

const router = createRouter({
  // createWebHistory gives real-looking URLs (/about, not /#/about) using
  // the browser's History API. It needs no server-side setup here because
  // Vite's dev server (and any static host serving this app's production
  // build) is configured to fall back to index.html for unknown paths.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'task-board', component: TaskBoardView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/api-demo', name: 'api-demo', component: ApiDemoView },
  ],
})

export default router
