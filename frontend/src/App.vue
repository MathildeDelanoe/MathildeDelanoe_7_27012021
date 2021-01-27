<template>
  <div id="nav">
    <img alt="logo groupomania" src="./assets/icon-left-font-monochrome-white.png">
    <router-link to="/signup">S'inscrire</router-link> |
    <router-link to="/">Se connecter</router-link>
  </div>
  <router-view/>
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
  text-align:right;
  font-size:0.8em;
  background-color:grey;



  a {
    color: white;
    text-decoration:none;

    &.router-link-exact-active {
      color: blue;
    }
  }
}
</style>
