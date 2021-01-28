<template>
  <div id="nav">
    <img alt="logo groupomania" src="../assets/logo_groupomania.png">
    <div>
      <router-link to="/signup">S'inscrire</router-link> |
      <router-link to="/login">Se connecter</router-link>
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
  font-size:0.8em;
  background-color:grey;
  display:flex;
  justify-content:space-between;
  align-items:center;

img {
  height:25px;
    }
                            
  a {
    color: white;
    text-decoration:none;
    
    &.router-link-exact-active {
      color: blue;
    }
  }
}

@media screen and (min-width:768px) {
#nav
    {
        padding:20px;
        font-size:1.1em;

        img 
        {
            height:50px;
        }
    }
}


</style>
