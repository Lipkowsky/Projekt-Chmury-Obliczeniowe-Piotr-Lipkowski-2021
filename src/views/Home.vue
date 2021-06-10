<template>
  <div class="home">
    <div class="login">
       <md-snackbar style="background-color: #e60000;" :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
         <span >{{error}}</span>
    </md-snackbar>
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


        <md-field md-clearable>
          <label>Wiek</label>
          <md-input v-model="age"></md-input>
        </md-field>

        <md-field md-clearable>
          <label>Samochód</label>
          <md-input v-model="car"></md-input>
        </md-field>

        <md-button @click="addUser" class="md-raised"
          >Dodaj użytkownika</md-button
        >
      </div>
    </div>
    <div v-if="users">
      <md-table v-model="users" md-sort="name" md-sort-order="asc" md-card>
        <md-table-toolbar>
          <h1 class="md-title">Lista użytkowników</h1>
        </md-table-toolbar>

        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="ID" md-numeric>{{ item.id }}</md-table-cell>
          <md-table-cell md-label="username" md-sort-by="name">{{
            item.username
          }}</md-table-cell>
          <md-table-cell md-label="password" md-sort-by="password">{{
            item.password
          }}</md-table-cell>
          <md-table-cell md-label="createdAt" md-sort-by="createdAt">{{
            item.createdAt | formatDate
          }}</md-table-cell>
          <md-table-cell md-label="updatedAt" md-sort-by="createdAt">{{
            item.updatedAt | formatDate
          }}</md-table-cell>
          <md-table-cell md-label="age" md-sort-by="age">{{
              item.age
            }}</md-table-cell>
          <md-table-cell md-label="car" md-sort-by="car">{{
              item.car
            }}</md-table-cell>
          <md-table-cell md-label="Usuń" md-sort-by="createdAt"
            ><md-icon v-on:click.native="deleteUser(item.username)"
              >delete</md-icon
            ></md-table-cell
          >
          <md-table-cell md-label="Edytuj" md-sort-by="createdAt"
          ><md-icon v-on:click.native="updateUser(item.username)"
          >delete</md-icon
          ></md-table-cell
          >
        </md-table-row>
      </md-table>
    </div>
  </div>
</template>

<script>
import jwt from "jsonwebtoken";
const TOKEN_KEY = "4fg6j8li-wr19-13x5-lip8-qacg67bnjdgv";
import axios from "axios";
export default {
  name: "Home",
  components: {},
  data: function() {
    return {
      username: "",
      password: "",
      age: "",
      car: "",
      users: "",
      error: "",
      showSnackbar: false,
      position: "center",
      duration: 4000,
      isInfinity: false,
      config: {
        headers: {
          authtoken: localStorage.getItem("authtoken"),
        },
      },
    };
  },
  created: function isLoggedIn() {
    try {
      const token = localStorage.getItem("authtoken");
      const verified = jwt.verify(token, TOKEN_KEY);
      if (!verified) {
        this.$router.replace("/login");
        this.config = {};
      }
    } catch (err) {
      this.$router.replace("/login");
      this.config = {};
    }
  },
  methods: {
    getUsers: async function() {
      this.error = "";
      axios
        .get("http://localhost:3080/users", this.config)
        .then((res) => {
          this.users = res.data;
          console.log(this.users);
        })
        .catch((error) => {
          this.error = error.response.data;
          this.showSnackbar = true;
        });
    },
    deleteUser: async function(username) {

      axios
        .post(`http://localhost:3080/users/delete`, {
              username: username,
            },
            this.config)
        .then((res) => {
          this.getUsers();
          console.log(res);
        })
        .catch((error) => {
          this.error = error.response.data;
          this.showSnackbar = true;
        });
    },
    updateUser: async function(username) {

      console.log(username);
      axios
          .post("http://localhost:3080/users/update",  {
                username: username,
                age: this.age,
                car: this.car
              },
              this.config)
          .then((res) => {
            this.getUsers();
            this.error = res.data;
            this.showSnackbar = true;
          })
          .catch((error) => {
            this.error = error.response.data;
            this.showSnackbar = true;
          });
    },
    addUser: async function() {
      this.error = "";

      try {
        if (!this.username || !this.password) {
          throw "Nie uzupełnione pola w panelu nowego użytkownika";
        }
        axios
          .post(
            "http://localhost:3080/users",
            {
              username: this.username,
              password: this.password,
            },
            this.config
          )
          .then(() => {
            this.getUsers();
          })
          .catch((error) => {
            this.error = error.response.data;
            this.showSnackbar = true;
          });
      } catch (err) {
        this.error = err;
        this.showSnackbar = true;
      }
    },
  },
  mounted() {
    this.getUsers();
  },
};
</script>

<style scoped>
.md-table-cell {
  text-align: left;
}
.md-icon {
  cursor: pointer;
}
</style>
