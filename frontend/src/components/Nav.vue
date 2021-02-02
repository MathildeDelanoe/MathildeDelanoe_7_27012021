<template>

  <div id="nav">
    <img alt="logo groupomania" src="../assets/logo_groupomania.png">
    <div id = "navConnected" v-if="isConnected">
      <router-link to="/Profile"><div id="profileIcon"></div></router-link>
      <router-link to="/" id="logoffText">Se déconnecter</router-link>
      <router-link to="/" id="icon"><font-awesome-icon :icon="['fas', 'power-off']" /></router-link>
    </div>
    <div v-else>
      <router-link to="/signup">S'inscrire</router-link> |
      <router-link to="/">Se connecter</router-link>
    </div>
  </div>
</template>

<script>
  import { library } from '@fortawesome/fontawesome-svg-core'
  import { faPowerOff } from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  library.add(faPowerOff)
  export default {
    name: 'Nav',

    components: {
      'font-awesome-icon': FontAwesomeIcon
    },

    props: {
      isConnected: {
        type: Boolean,
        default: false
      }
    },
  }
</script>

<style lang="scss">
  #logoffText {
    display: none;
  }
  #icon {
    margin-left:15px;
  }
  #navConnected {
    display: flex;
    align-items: flex-end;
  }
  #profileIcon {
    width: 30px;
    height: 30px;
    border: 3px solid cyan;
    border-radius:50%;
  }
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
    #logoffText {
      display: block;
      margin-left:20px;
    }
    #icon {
      display: none;
    }
  }
</style>
