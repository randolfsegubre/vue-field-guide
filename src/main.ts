import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// .use(router) installs the router as a Vue.js plugin: it registers the
// <router-link>/<router-view> components used in App.vue and injects the
// current route into every component in the tree.
createApp(App).use(router).mount('#app')
