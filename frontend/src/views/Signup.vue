<template>
  <body class="signup">
    <Nav />
    <!-- Affichage d'une liste d'erreurs s'il y en a -->
    <div id="error" v-if="formErrors.length != 0">
      <p>Le formulaire contient des erreurs, veuillez les corriger pour pouvoir vous inscrire:</p>
      <ul>
        <li v-for="error in formErrors" :key="error">{{ error }}</li>
      </ul>
    </div>
    <div>
      <table class="form">
        <tbody>
            <tr>
              <td><label for="lastName">Nom : </label></td>
              <td><input type="text" id="lastName" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ- ']{0,30}[A-Za-zÀ-ÖØ-öø-ÿ]" v-model="lastName"></td>
            </tr>
            <tr>
              <td><label for="firstName">Prénom : </label></td>
              <td><input type="text" id="firstName" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ- ']{0,30}[A-Za-zÀ-ÖØ-öø-ÿ]" v-model="firstName"></td>
            </tr>
            <tr>
              <td><label for="emailSignup">Adresse e-mail : </label></td>
              <td><input type="email" id="emailSignup" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ-.'_0-9]{0,62}[A-Za-zÀ-ÖØ-öø-ÿ]@groupomania.com" v-model="email"></td>
            </tr>
            <tr>
              <td><label for="passwordSignup">Mot de passe : </label></td>
              <td><input type="password" id="passwordSignup" pattern="(?=\S*[A-Z])(?=\S*[!@#$&*])(?=\S*[0-9])(?=\S*[a-z])\S{8,30}" v-model="password"></td>
            </tr>
            <tr>
              <td><label for="confirmpasswordSignup">Confirmation du mot de passe : </label></td>
              <td><input type="password" id="confirmpasswordSignup" v-model="confirmationPassword"></td>
            </tr>
            <tr>
              <td colspan="2"><input type="submit" id="submitButton" value="S'inscrire" @click="sendNewAccountRequest()" :disabled="!this.isFormFilled()"></td>
            </tr>
        </tbody>
      </table>
    </div>

  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import {CommonFunctions} from '../assets/CommonFunctions.js'

  export default
  {
    name: 'Signup',
    components:
    {
      Nav
    },
    data: function()
    {
      return {
        formErrors: [], // Tableau contenant les messages d'erreur de remplissage du formulaire
        // Champs du formulaire
        lastName: '',
        firstName: '',
        email: '',
        password: '',
        confirmationPassword: ''
      };
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
    },
    methods:
    {
      /* Cette fonction vérifie que le formulaire dans son intégralité est rempli c'est-à-dire qu'il n'y a plus aucun champ vide
         Cette fonction renvoie 'true' si le formulaire est rempli, 'false' sinon
      */
      isFormFilled()
      {
        return ((this.lastName.length != 0) &&
               (this.firstName.length != 0) && 
               (this.email.length != 0) &&
               (this.password.length != 0) &&
               (this.confirmationPassword.length != 0))
      },
      /* Cette fonction vérifie que le formulaire est correctement rempli.
         Elle compare notamment les informations saisies avec les pattern définis et vérifie que les deux mots de passe sont identiques
         Cette fonction renvoie 'true' si le formulaire est correct, 'false' sinon
      */
      isFormCorrect()
      {
        this.formErrors.length = 0; // Supprime le précédent tableau d'erreurs
        let isCorrect = false;

        let lastNameInput = document.getElementById("lastName");
        if (!lastNameInput.checkValidity())
        {
          this.formErrors.push('Votre nom doit contenir au moins deux lettres et que des lettres (seuls caractères autorisés : espace, tiret(-) et apostrophe)');
        }

        let firstNameInput = document.getElementById("firstName");
        if (!firstNameInput.checkValidity())
        {
          this.formErrors.push('Votre prénom doit contenir au moins deux lettres et que des lettres (seuls caractères autorisés : espace, tiret(-) et apostrophe)');
        }

        let emailInput = document.getElementById("emailSignup");
        if (!emailInput.checkValidity())
        {
          this.formErrors.push('Votre email doit avoir une extension \'@groupomania.com\' et doit contenir au moins deux lettres');
        }

        let passwordInput = document.getElementById("passwordSignup");
        if (!passwordInput.checkValidity())
        {
          this.formErrors.push('Votre mot de passe doit contenir 1 minuscule, 1 majuscule, 1 caractère spécial (!@#$&*), 1 chiffre et avoir 8 caractères minimum');
        }

        let confirmPasswordInput = document.getElementById("confirmpasswordSignup");
        if (confirmPasswordInput.value !== passwordInput.value)
        {
          this.formErrors.push('Les deux mots de passe diffèrent');
        }

        if (this.formErrors.length === 0)
        {
          isCorrect = true;
        }

        return isCorrect;
      },

      /* Cette fonction envoie les requêtes de signup au backend */
      sendNewAccountRequest()
      {
        let responseStatus;
        let responseOk;
        if (!this.isFormCorrect())
        {
          return;
        }

        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({lastName : this.lastName,
                                  firstName: this.firstName,
                                  email : this.email,
                                  password : this.password}) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête d'inscription via fetch pour s'enregistrer
        fetch('http://localhost:3000/api/employee/signup', options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then((response) =>
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          // Redirection vers la page login en utilisant les props
          this.$router.push({ name: 'Login', params: {emailFromSignup: this.email, passwordFromSignup: this.password} });
        })
        .catch(error => alert(error))
      }
    }
  }
</script>

<style lang="scss">

  #error
  {
    color:rgb(224,18,29);
    text-align:center;
  }

</style>