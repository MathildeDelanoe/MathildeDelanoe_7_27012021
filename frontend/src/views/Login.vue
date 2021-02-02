<template>
  <body class="login">
    <Nav />

    <table>
      <tbody class="text-right">
          <tr>
            <td><label for="emailLogin">Adresse e-mail : </label></td>
            <td><input type="text" id="emailLogin" required></td>
          </tr>
          <tr>
            <td><label for="passwordLogin">Mot de passe : </label></td>
            <td><input type="password" id="passwordLogin" required></td>
          </tr>
          <tr>
            <td colspan="2"><input type="submit" id="submitButton" value="Se connecter" disabled></td>
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

  export default
  {
    name: 'login',
    components:
    {
      Nav
    }
  }
</script>

<style lang="scss">
  table
  {
    padding:30px 30px 10px 30px;
    // background-color:rgb(175,175,177);
    background-color:rgb(48,66,96);
    border-radius:10px;
    // color:rgb(83,83,83);
    color:white;
    margin:100px auto 0px auto;

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