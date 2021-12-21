<template>
  <v-card
  width="500px"
  class="container">
    <v-card-title>
      register
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
          :append-icon="passwordVisible ? 'visibility' : 'visibility_off'"
          @click:append="() => {passwordVisible = !passwordVisible}"
          :type="passwordVisible ? 'password' : 'text'">
        </v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Confirm Password"
          v-model="RepeatPassword"
          :append-icon="confirmPasswordVisible ? 'visibility' : 'visibility_off'"
          @click:append="() => {confirmPasswordVisible = !confirmPasswordVisible}"
          :type="confirmPasswordVisible ? 'password' : 'text'">
        </v-text-field>
      </v-col>
      <p class="error">{{ error }}</p>
      <v-col>
        <v-btn
          @click="register">
          register
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
      RepeatPassword: '',
      error: '',
      passwordVisible: Boolean,
      confirmPasswordVisible: Boolean
    }
  },
  methods: {
    async register () {
      const result = await AuthenticationService.register({
        'Username': this.Username,
        'Email': this.Email,
        'Password': this.Password,
        'RepeatPassword': this.RepeatPassword
      })
      if (result.data.result === true) {
        this.error = ''
        document.cookie = `token=${result.data.result}`
        this.$store.commit('authenticate', {token: result.data.result})
        this.$router.push('/')
      } else {
        this.error = result.data.error
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
