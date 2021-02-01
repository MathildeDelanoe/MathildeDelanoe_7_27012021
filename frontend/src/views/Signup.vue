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
            <td colspan="2"><input type="submit" id="submitButton" value="S'inscrire" :disabled="this.updateAndReturnDisabled()"></td>
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
      }
    }
  }
</script>