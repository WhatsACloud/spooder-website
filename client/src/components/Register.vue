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
      <v-col>
        <v-text-field
          label="Confirm Password"
          v-model="RepeatPassword">
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
      error: ''
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
        // insert login thingy
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
