<template>
  <div id="app">
    <v-card
    color="grey lighten-4"
    flat
    height="200px"
    tile
    >
      <v-toolbar dense color="#5C6BC0">
        <v-app-bar-nav-icon id="toolbar"></v-app-bar-nav-icon>
        <v-toolbar-title id="toolbar">{{ Name }}</v-toolbar-title>
        <v-btn
          icon
          id="toolbar"
          @click="Direct('/')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-spacer/>
        <v-toolbar-items>
          <v-btn
            id="toolbar"
            depressed
            color="#5C6BC0"
            v-if="!this.$store.getters.isLoggedIn"
            @click="Direct('login')">
            login
          </v-btn>
          <v-btn
            id="toolbar"
            depressed
            color="#5C6BC0"
            v-if="!this.$store.getters.isLoggedIn"
            @click="Direct('register')">
            register
          </v-btn>
          <v-btn
            id="toolbar"
            depressed
            color="#5C6BC0"
            class="no-capital"
            v-if="this.$store.getters.isLoggedIn">
            {{ this.$store.getters.getUsername }}
          </v-btn>
          <v-btn
            id="toolbar"
            depressed
            color="#5C6BC0"
            v-if="this.$store.getters.isLoggedIn"
            @click="logout()">
            logout
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-card>
    <router-view/>
  </div>
</template>

<script>
import Register from './components/Register'
export default {
  data () {
    return {
      Name: 'NewsThingy'
    }
  },
  name: 'App',
  components: {
    Register
  },
  methods: {
    Direct: function (name) {
      this.$router.push(name)
    },
    logout: function () {
      this.$store.commit('authenticate', {token: false})
      document.cookie = 'token=; Expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'username=; Expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#toolbar {
  color: white
}

.no-capital {
  text-transform: unset !important;
}

</style>
