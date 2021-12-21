import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isAuth: !!(require('../../services/cookieFinder')('token')),
    Username: require('../../services/cookieFinder')('username')
  },
  getters: {
    isLoggedIn (state) {
      return state.isAuth
    },
    getUsername (state) {
      return state.Username
    }
  },
  mutations: {
    authenticate (state, { token }) {
      state.isAuth = !!token
    },
    setUsername (state, { username }) {
      state.Username = username
    }
  }
})
