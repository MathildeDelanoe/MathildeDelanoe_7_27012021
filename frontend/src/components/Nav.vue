<template>
  <div id="nav">
    <img alt="logo groupomania" src="../assets/logo_groupomania.png">
    <div v-if="isConnected">
      <router-link to="/">Se déconnecter</router-link>
    </div>
    <div v-else>
      <router-link to="/signup">S'inscrire</router-link> |
      <router-link to="/">Se connecter</router-link>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Nav',
    props: {
      isConnected: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    // -webkit-font-smoothing: antialiased;
    // -moz-osx-font-smoothing: grayscale;
    // text-align: center;
    // color: #2c3e50;
  }

  #nav {
    padding: 10px;
    font-size: 0.8em;
    // background-color:rgb(175,175,177);
    background-color:rgb(48,66,96);
    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      height: 25px;
    }

    a {
      // color: rgb(83,83,83);
      color:white;
      text-decoration: none;

      &.router-link-exact-active {
        text-decoration: underline;
        // color:white;
        color:rgb(209,81,90);
      }
    }
  }

  @media screen and (min-width:768px) {
    #nav {
      padding: 20px;
      font-size: 1.1em;

      img {
        height: 50px;
      }
    }
  }
</style>
