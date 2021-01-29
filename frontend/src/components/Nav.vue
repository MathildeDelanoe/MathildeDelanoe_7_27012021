<template>
  <div id="nav">
    <img alt="logo groupomania" src="../assets/logo_groupomania.png">
    <div>
      <router-link to="/signup">S'inscrire</router-link> |
      <router-link to="/">Se connecter</router-link>
    </div>
  </div>
</template>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 10px;
    font-size: 0.8em;
    background-color:rgb(175,175,177);
    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      height: 25px;
    }

    a {
      color: rgb(83,83,83);
      text-decoration: none;

      &.router-link-exact-active {
        text-decoration: underline;
        color:white;
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
