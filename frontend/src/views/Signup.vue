<template>
  <body class="signup">
    <Nav />

    <div id="error" v-if="formErrors.length != 0">
      <p>Le formulaire contient des erreurs, veuillez les corriger pour pouvoir vous inscrire:</p>
      <ul>
        <li v-for="error in formErrors" :key="error">{{ error }}</li>
      </ul>
    </div>
    <div>
      <table>
        <tbody class="text-right">
            <tr>
              <td><label for="lastName">Nom : </label></td>
              <td><input type="text" id="lastName" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ- ']{0,30}[A-Za-zÀ-ÖØ-öø-ÿ]" required v-model="lastName"></td>
            </tr>
            <tr>
              <td><label for="firstName">Prénom : </label></td>
              <td><input type="text" id="firstName" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ- ']{0,30}[A-Za-zÀ-ÖØ-öø-ÿ]" required v-model="firstName"></td>
            </tr>
            <tr>
              <td><label for="job">Poste occupé : </label></td>
              <td><input type="text" id="job" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ- ']{3,30}[A-Za-zÀ-ÖØ-öø-ÿ]" required v-model="job"></td>
            </tr>
            <tr>
              <td><label for="emailSignup">Adresse e-mail : </label></td>
              <td><input type="email" id="emailSignup" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ-.'_0-9]{0,62}[A-Za-zÀ-ÖØ-öø-ÿ]@groupomania.com" required v-model="email"></td>
            </tr>
            <tr>
              <td><label for="passwordSignup" class="my-4 mr-3">Mot de passe : </label></td>
              <td><input type="password" id="passwordSignup" pattern="(?=\S*[A-Z])(?=\S*[!@#$&*])(?=\S*[0-9])(?=\S*[a-z])\S{8,30}" required v-model="password"></td>
            </tr>
            <tr>
              <td><label for="confirmpasswordSignup" class="my-4 mr-3">Confirmation du mot de passe : </label></td>
              <td><input type="password" id="confirmpasswordSignup" required v-model="confirmationPassword"></td>
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
        formErrors: [],
        firstName: '',
        lastName: '',
        job: '',
        email: '',
        password: '',
        confirmationPassword: ''
      };
    },
    methods:
    {
      isFormFilled()
      {
        return ((this.firstName.length != 0) && 
               (this.lastName.length != 0) &&
               (this.job.length != 0) &&
               (this.email.length != 0) &&
               (this.password.length != 0) &&
               (this.confirmationPassword.length != 0))
      },
      
      isFormCorrect()
      {
        this.formErrors.length = 0; // Supprime le précédent tableau d'erreurs
        let isFormCorrect = false;

        let lastNameInput = document.getElementById("lastName");
        if (!lastNameInput.checkValidity())
        {
          this.formErrors.push('Votre nom ne doit contenir que des lettres');
        }

        let firstNameInput = document.getElementById("firstName");
        if (!firstNameInput.checkValidity())
        {
          this.formErrors.push('Votre prénom ne doit contenir que des lettres');
        }

        let jobInput = document.getElementById("job");
        if (!jobInput.checkValidity())
        {
          this.formErrors.push('Votre poste ne doit contenir que des lettres');
        }

        let emailInput = document.getElementById("emailSignup");
        if (!emailInput.checkValidity())
        {
          this.formErrors.push('Votre email doit avoir une extension \'@groupomania.com\' et ne doit contenir que des lettres');
        }

        let passwordInput = document.getElementById("passwordSignup");
        if (!passwordInput.checkValidity())
        {
          this.formErrors.push('Votre mot de passe doit contenir 1 minuscule, 1 majuscule, 1 caractère spécial, 1 chiffre et faire plus de 7 caractères');
        }

        let confirmPasswordInput = document.getElementById("confirmpasswordSignup");
        if (confirmPasswordInput.value !== passwordInput.value)
        {
          this.formErrors.push('Les deux mots de passe diffèrent');
        }

        if (this.formErrors.length == 0)
        {
          isFormCorrect = true;
        }

        return isFormCorrect;
      },

      sendNewAccountRequest()
      {
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
            body: JSON.stringify({firstName: this.firstName,
                                  lastName : this.lastName,
                                  job : this.job,
                                  email : this.email,
                                  password : this.password}) // Remplissage du body de la requête avec les informations nécessaires
        };
        fetch('http://localhost:3000/api/employee/signup', options)
        .then(response =>
        {
          if (response.ok && (response.status >= 200 && response.status <= 299))
          {
              return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
          }
          else
          {
              // S'il y a une erreur, écriture d'un message correspondant à l'erreur
              let message = [];
              if (response.status >= 300 && response.status <= 399)
              {
                  message = 'Erreur de redirection. Le contenu a bougé ou n\'est pas accessible directement';
              }
              else if (response.status >= 400 && response.status <= 499)
              {
                  message = 'Erreur liée à l\'utilisation du service web';
              }
              else if (response.status >= 500 && response.status <= 599)
              {
                  message = 'Erreur venant du service web';
              }
              else
              {
                  message = 'Erreur d\'un autre type';
              }
              throw new Error(message);
          }
        })
        .then(response =>
        {
            console.log(response);
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
            console.log("Es-tu la?")
            fetch('http://localhost:3000/api/employee/login', options)
            .then(response =>
            {
              if (response.ok && (response.status >= 200 && response.status <= 299))
              {
                  return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
              }
              else
              {
                  // S'il y a une erreur, écriture d'un message correspondant à l'erreur
                  let message = [];
                  if (response.status >= 300 && response.status <= 399)
                  {
                      message = 'Erreur de redirection. Le contenu a bougé ou n\'est pas accessible directement';
                  }
                  else if (response.status >= 400 && response.status <= 499)
                  {
                      message = 'Erreur liée à l\'utilisation du service web';
                  }
                  else if (response.status >= 500 && response.status <= 599)
                  {
                      message = 'Erreur venant du service web';
                  }
                  else
                  {
                      message = 'Erreur d\'un autre type';
                  }
                  throw new Error(message);
              }
            })
            .then(response => 
            {
              console.log(response);
              this.$router.push({ name: 'Feed' });
            })
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