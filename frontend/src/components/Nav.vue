<template>

  <div id="nav">
    <img alt="logo groupomania" src="../assets/logo_groupomania.png">
    <div id = "navConnected" v-if="isConnected">
      <router-link to="/profile">
        <div>
          <avatar :fullname="fullName" :image="avatar" id="largeAvatarNav"></avatar>
          <avatar :fullname="fullName" :image="avatar" :size="40" id="smallAvatarNav"></avatar>
        </div>
      </router-link>
      <router-link to="/" id="logoffText" @click="logout">Se déconnecter</router-link>
      <router-link to="/" id="icon" title="Se déconnecter" @click="logout"><font-awesome-icon :icon="['fas', 'power-off']" /></router-link>
    </div>
    <div id="navNotConnected" v-else>
      <router-link to="/signup">S'inscrire</router-link> |
      <router-link to="/">Se connecter</router-link>
    </div>
  </div>
</template>

<script>
  import { library } from '@fortawesome/fontawesome-svg-core'
  import { faPowerOff } from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  import Avatar  from 'vue-avatar-component'
  library.add(faPowerOff)
  
  export default {
    name: 'Nav',

    components: {
      'font-awesome-icon': FontAwesomeIcon,
      Avatar
    },
    props: {
      isConnected: {
        type: Boolean,
        default: false
      },
      fullName: {
        type: String
      },
      avatar: {
        type: String
      }
    },
    methods:
    {
      logout()
      {
        localStorage.clear(); // Suppression des identifiants de l'employé
      },
    }
  }
</script>

<style lang="scss">
  #logoffText {
    display: none;
  }
  #largeAvatarNav {
    display: none;
  }
  #icon {
    margin-left:15px;
  }
  #navConnected {
    display: flex;
    align-items: center;
    font-size:1.2em;
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
    background-color:rgb(48,66,96);
    display: flex;
    justify-content: space-between;
    align-items: center;

    a {
      // color: rgb(83,83,83);
      color:white;
      text-decoration: none;
    }
    img {
      height: 25px;
    }
  }
  #navConnected{
    a {
      &.router-link-exact-active {
        text-decoration:none;
        // color:white;
        // color:rgb(209,81,90);
      }
    }
  }
  #navNotConnected{
    a {
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
      font-size:0.8em;
    }
    #icon {
      display: none;
    }
    #smallAvatarNav {
      display: none;
    }
    #largeAvatarNav {
      display:block;
    }
  }
</style>
