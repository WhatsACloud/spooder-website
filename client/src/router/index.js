import Vue from 'vue'
import Router from 'vue-router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

import Homepage from '@/components/Homepage'
import Login from '@/components/Login'

Vue.use(Router)
Vue.use(Vuetify)

/* eslint-disable no-new */
new Vuetify({
  icons: {
    iconfont: 'mdi'
  }
})

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Homepage',
      component: Homepage
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
