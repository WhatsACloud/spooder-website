<template>
  <div>
    <p5>
      this is the homepage
    </p5>
    <v-btn>
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <router-link to="/">Home</router-link> |
    <router-link to="/login">Login</router-link>
  </div>
</template>

<script>
import 'material-design-icons-iconfont/dist/material-design-icons.css'
export default {
  name: 'homepage'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
