<template>
  <v-card
  width="500px"
  class="container">
    <v-card-title>
      login
    </v-card-title>
    <v-form>
      <v-col>
        <v-text-field
          label="Username"
          v-model="Username">
        </v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Email"
          v-model="Email">
        </v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Password"
          v-model="Password"
          :append-icon="value ? 'visibility' : 'visibility_off'"
          @click:append="() => {value = !value}"
          :type="value ? 'password' : 'text'">
        </v-text-field>
      </v-col>
      <p class="error">{{ error }}</p>
      <v-col>
        <v-btn
          @click="login">
          login
        </v-btn>
      </v-col>
    </v-form>
  </v-card>
</template>

<script>
import AuthenticationService from '../../services/AuthenticationService'

export default {
  data () {
    return {
      Username: '',
      Email: '',
      Password: '',
      error: '',
      value: Boolean
    }
  },
  methods: {
    async login () {
      try {
        const result = await AuthenticationService.login({
          'Username': this.Username,
          'Email': this.Email,
          'Password': this.Password
        })
        console.log(result)
        if (typeof result.data.error === 'undefined') {
          document.cookie = `token=${result.data.result.token}`
          document.cookie = `username=${result.data.result.username}`
          this.error = ''
          this.$store.commit('authenticate', {token: result.data.result.token})
          this.$store.commit('setUsername', {username: result.data.result.username})
          this.$router.push('/')
        } else {
          this.error = result.data.error
        }
      } catch (err) {
        this.error = 'An error occured logging in, please try again later'
      }
    }
  }
}
</script>

<style scoped>

.container {
  justify-content: center;
}

.error {
  color: red;
}

</style>
