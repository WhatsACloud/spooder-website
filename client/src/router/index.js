import Vue from 'vue'
import Router from 'vue-router'
import Homepage from '@/components/Homepage'
import Register from '@/components/Register'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Homepage',
      component: Homepage
    },
    {
      path: '/Register',
      name: 'Register',
      component: Register
    }
  ]
})
