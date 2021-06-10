<template>
  <div class="login">
    <div>
      <h1>Panel logowania</h1>
      <md-field md-clearable>
        <label>Nazwa użytkownika</label>
        <md-input v-model="username"></md-input>
      </md-field>

      <md-field>
        <label>Hasło</label>
        <md-input v-model="password" type="password"></md-input>
      </md-field>
      <md-button @click="login" class="md-raised">Zaloguj</md-button>
      <md-snackbar style="background-color: #e60000;" :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
      <span >{{error}}</span>
      <md-button style="background-color: #e60000;" class="md-primary" @click="showSnackbar = false"><span style="color: #fff;">Retry</span></md-button>
    </md-snackbar>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data: function() {
    
    return {
      username: "",
      password: "",
      error: "",
      showSnackbar: false,
      position: "center",
      duration: 4000,
      isInfinity: false,
    };
  },
  methods: {

    login: async function() {
      this.error = "";
      axios
        .post("http://localhost:3080/login", {
          username: this.username,
          password: this.password,
        })
        .then((res) => {
          localStorage.setItem("authtoken", res.data);
          this.$router.replace("/home");
        })
        .catch((error) => {
          this.error = error.response.data
          this.showSnackbar = true;
        });
    },
  },
};
</script>
