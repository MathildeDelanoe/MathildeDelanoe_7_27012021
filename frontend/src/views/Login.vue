<template>
  <body class="login">
    <Nav />
    <table class="form">
      <tbody>
          <tr>
            <td><label for="emailLogin">Adresse e-mail : </label></td>
            <td><input type="text" id="emailLogin" v-model="email"></td>
          </tr>
          <tr>
            <td><label for="passwordLogin">Mot de passe : </label></td>
            <td><input type="password" id="passwordLogin" v-model="password"></td>
          </tr>
          <tr>
            <td colspan="2"><input type="submit" id="submitButton" value="Se connecter" @click="loginToAccount(this.email, this.password)" :disabled=!this.isFormFilled()></td>
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
        // Champs du formulaire
        email: '',
        password: '',
      };
    },
    props: {
      emailFromSignup: {
        type: String,
        default: ''
      },
      passwordFromSignup: {
        type: String,
        default: ''
      }
    },
    mounted() {
      // Au montage de la page, on vérifie si un utilisateur est déjà connecté par lecture du local storage
      this.lsAuth = localStorage.getItem('auth');
      this.lsEmpId = localStorage.getItem('employeeId');
      if (this.lsAuth !== null && this.lsEmpId !== null) // Si les clés existent dans le local storage
      {
        if (this.lsAuth.length !== 0 && this.lsEmpId.length !== 0) // Si elles ne sont pas vides
        {
          this.$router.push({ name: 'Feed' }); // Redirection vers le fil d'actualité
          return;
        }
      }
      // Vérification de l'existence des props
      if (this.emailFromSignup.length !== 0 && this.passwordFromSignup.length !== 0)
      {
        // Si les props ne sont pas vides, on appelle la fonction de login
        this.loginToAccount(this.emailFromSignup, this.passwordFromSignup);
      }
    },
    methods:
    {
      isFormFilled()
      {
        return ((this.email.length != 0) &&
               (this.password.length != 0))
      },
      loginToAccount(email_in, password_in)
      {
        let responseStatus;
        let responseOk;
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email : email_in,
                                  password : password_in}) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête via fetch pour se connecter
        fetch('http://localhost:3000/api/employee/login', options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response =>
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          // Enregistrement dans le local storage du token et de l'id pour maintenir la connexion
          localStorage.setItem('auth', response.token);
          localStorage.setItem('employeeId', response.userId);
          // Redirection vers la page feed
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
    background-color:rgb(48,66,96);
    border-radius:10px;
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