<template>
  <body class="login">
    <Nav />
    <table class="form">
      <tbody class="text-right">
          <tr>
            <td><label for="emailLogin">Adresse e-mail : </label></td>
            <td><input type="text" id="emailLogin" required v-model="email"></td>
          </tr>
          <tr>
            <td><label for="passwordLogin">Mot de passe : </label></td>
            <td><input type="password" id="passwordLogin" required v-model="password"></td>
          </tr>
          <tr>
            <td colspan="2"><input type="submit" id="submitButton" value="Se connecter" @click="loginToAccount()" :disabled=!this.isFormFilled()></td>
          </tr>
          <tr>
            <td colspan="2"><span>Pas de compte? <router-link to="/signup">S'inscrire</router-link></span></td>
          </tr>
      </tbody>
    </table>
  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import {CommonFunctions} from '../assets/CommonFunctions.js'

  export default
  {
    name: 'login',
    components:
    {
      Nav
    },
    data: function()
    {
      return {
        email: '',
        password: '',
      };
    },
    methods:
    {
      isFormFilled()
      {
        return ((this.email.length != 0) &&
               (this.password.length != 0))
      },
      loginToAccount()
      {
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email : this.email,
                                  password : this.password}) // Remplissage du body de la requête avec les informations nécessaires
        };
        fetch('http://localhost:3000/api/employee/login', options)
        .then(response =>
        {
          if (response.ok && (response.status >= 200 && response.status <= 299))
          {
            return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
          }
          else
          {
            throw new Error((CommonFunctions.errorManagement(response.status)));
          }
        })
        .then(response =>
        {
          this.$store.commit('SET_AUTHENTICATION', response.token);
          this.$store.commit('SET_USERID', response.userId);
          this.$router.push({ name: 'Feed' });
        })
        .catch(error => alert(error))
      }
    }
  }
</script>

<style lang="scss">
  .form
  {
    padding:30px 30px 10px 30px;
    // background-color:rgb(175,175,177);
    background-color:rgb(48,66,96);
    border-radius:10px;
    // color:rgb(83,83,83);
    color:white;
    margin:100px auto 0px auto;
    box-shadow: 5px 5px 5px black;

    td
    {
      text-align:left;
      padding-bottom:20px;
    }

    #submitButton
    {
      padding:5px 15px 5px 15px;
      background-color:white;
      margin:auto;
      display:block;
    }

    span
    {
      font-size:0.7em;
      color:white;
      display:block;
      text-align:right;
    }

    a
    {
      font-size:1em;
      color:white;
    }

  }



</style>