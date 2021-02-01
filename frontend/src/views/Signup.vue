<template>
  <body class="signup">
    <Nav />

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
            <td><input type="text" id="job" pattern="[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ- ']{0,30}[A-Za-zÀ-ÖØ-öø-ÿ]" required v-model="job"></td>
          </tr>
          <tr>
            <td><label for="emailSignup">Adresse e-mail : </label></td>
            <td><input type="email" id="emailSignup" pattern="[A-Za-zÀ-ÖØ-öø-ÿ-.'_0-9]{0,30}@groupomania.com" required v-model="email"></td>
          </tr>
          <tr>
            <td><label for="passwordSignup" class="my-4 mr-3">Mot de passe : </label></td>
            <td><input type="password" id="passwordSignup" required v-model="password"></td>
          </tr>
          <tr>
            <td><label for="confirmpasswordSignup" class="my-4 mr-3">Confirmation du mot de passe : </label></td>
            <td><input type="password" id="confirmpasswordSignup" required v-model="confirmationPassword"></td>
          </tr>
          <tr>
            <td colspan="2"><input type="submit" id="submitButton" value="S'inscrire" @click="sendNewAccountRequest()" :disabled="this.updateAndReturnDisabled()"></td>
          </tr>
      </tbody>
  </table>

  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'

  export default {
    name: 'Signup',
    components: {
      Nav
    },
    data: function() {
      return {
        disabled: false,
        firstName: '',
        lastName: '',
        job: '',
        email: '',
        password: '',
        confirmationPassword: ''
      };
    },
    computed: {
      is_form_correct() {
        const myBool = ((this.firstName.length != 0) && 
               (this.lastName.length != 0) &&
               (this.job.length != 0) &&
               (this.email.length != 0) &&
               (this.password.length != 0) &&
               (this.confirmationPassword.length != 0) &&
               (this.password === this.confirmationPassword));
        return myBool
      }
    },
    methods: {
      updateAndReturnDisabled() {
        this.disabled = !this.is_form_correct;
        return this.disabled;
      },
      sendNewAccountRequest(){
        console.log("Tu as appuyé sur le bouton");
        let test = this.firstName;
        let test2 = this.lastName;
        let test3 = this.job;
        let test4 = this.email;
        let test5 = this.password;
        let signupInfo = {
          test, test2, test3, test4, test5
        };
        console.log(signupInfo)
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({signupInfo}) // Remplissage du body de la requête avec les informations nécessaires
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
        })
        .catch(error => alert(error))
      }
    }
  }
</script>