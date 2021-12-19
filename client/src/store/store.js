import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isAuth: require('../../services/cookieFinder')('token')
  },
  getters: {
    isLoggedIn (state) {
      return state.isAuth
    }
  },
  mutations: {
    authenticate (state, { token }) {
      state.isAuth = !!token
    }
  }
})
