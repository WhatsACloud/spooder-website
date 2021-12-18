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
          v-model="Username"
          color="#F44336">
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
          v-model="Password">
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
      error: ''
    }
  },
  methods: {
    async login () {
      const result = await AuthenticationService.login({
        'Username': this.Username,
        'Email': this.Email,
        'Password': this.Password
      })
      if (typeof result.data.result === 'string') {
        document.cookie = `token=${result.data.result}`
      } else {
        this.error = result.data
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
