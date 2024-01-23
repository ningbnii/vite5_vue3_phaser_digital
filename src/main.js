import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VuePageStack from 'vue-page-stack'
import store from './store'
// import VConsole from 'vconsole'

// const vConsole = new VConsole({theme:'dark'})

const app = createApp(App)
app.use(router)
app.use(VuePageStack, { router })
app.use(store)
app.mount('#app')
