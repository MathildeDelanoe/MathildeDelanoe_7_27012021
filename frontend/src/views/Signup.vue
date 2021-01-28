<script>
import Nav from '../components/Nav.vue'

export default {
  name: 'Signup',
  components: {
    Nav
  }
}
</script>


<template>
  <body class="signup">
    <Nav />

   <table>
      <tbody class="text-right">
          <tr>
            <td><label for="lastName">Nom : </label></td>
            <td><input type="text" id="lastName" required></td>
          </tr>
          <tr>
            <td><label for="firstName">Prénom : </label></td>
            <td><input type="text" id="firstName" required></td>
          </tr>
          <tr>
            <td><label for="job">Poste occupé : </label></td>
            <td><input type="text" id="job" required></td>
          </tr>
          <tr>
            <td><label for="emailSignup">Adresse e-mail : </label></td>
            <td><input type="text" id="emailSignup" required></td>
          </tr>
          <tr>
            <td><label for="passwordSignup" class="my-4 mr-3">Mot de passe : </label></td>
            <td><input type="password" id="passwordSignup" required></td>
          </tr>
          <tr>
            <td><label for="confirmpasswordSignup" class="my-4 mr-3">Confirmation du mot de passe : </label></td>
            <td><input type="password" id="confirmpasswordSignup" required></td>
          </tr>
          <tr>
            <td colspan="2"><input type="submit" id="submitButton" value="S'inscrire" ></td>
          </tr>
      </tbody>
  </table>

  </body>
</template>
