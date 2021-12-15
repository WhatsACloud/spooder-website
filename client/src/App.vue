<template>
  <div id="app">
    <v-card
    color="grey lighten-4"
    flat
    height="200px"
    tile
    >
      <v-toolbar dense>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title>Title</v-toolbar-title>
        <v-icon>mdi-domain</v-icon>
      </v-toolbar>
    </v-card>
    <router-view/>
  </div>
</template>

<script>
import Login from './components/Login'
export default {
  name: 'App',
  components: {
    Login
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
</style>
