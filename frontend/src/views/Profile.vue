<template>
  <body class="profile">
    <Nav :isConnected="true"/>
      <div id="identity">
        <h1> Mon profil</h1>
        <div id="cart_identity">
          <div>
            <p> Nom : </p>
            <p> Prénom : </p>
            <p> Poste occupé : </p>
            <p> Equipe : </p>
            <p> Mot de passe : </p>
            <p> Supprimer le compte </p>
            <p> Modifier le compte </p>
          </div>
          <div class="avatar"> 
            <avatar fullname="Jane Toeyuyi" id="smallAvatarProfile"></avatar>
            <avatar fullname="Jane Toeyuyi" :size="200" id="largeAvatarProfile"></avatar>
          </div>  
        </div>
      </div>
      <div id="retour"> 
        <router-link to="/feed" >Retour fil d'actualité</router-link> 
      </div>
  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import Avatar  from 'vue-avatar-component'

  export default {
    name: 'Profile',
    components:
    {
      Nav,
      Avatar
    },
    props: {
      auth: {
        type: String,
        required: true
      }
    }
  }
</script>


<style lang="scss">

#identity {
    margin-top:50px;
    padding : 10px;
    background-color:rgb(48,66,96);
    color:white;
    border-radius:10px;
    box-shadow: 5px 5px 5px black;
}
  
#cart_identity {
  display:flex;
  flex-direction:column-reverse;
}

.avatar {
  text-align:center;
}

#largeAvatarProfile {
  display:none;
}

#retour {
  // color:black;
  margin-top:10px;
  text-align:right;
  font-size:0.8em;
  font-weight: bold;
}

@media screen and (min-width:768px) and (max-width:1400px) {
    #identity {
      padding:5px 20px 20px;
      width:90%;
      margin:100px auto 15px;

      #cart_identity {
        flex-direction:row;
        justify-content:space-between;
      }

      h1 {
        text-align:center;
        font-size:2.5em;
      }

      p {
        margin:30px;
      }

      #smallAvatarProfile {
        display:none;
      }

      #largeAvatarProfile {
        display:block;
      }

      .avatar {
        margin:30px 5px 0px 0px;
      }
    }

    #retour {
      width:95%;
      margin:auto;
    }
  }

@media screen and (min-width:1500px) {
  #identity {
    padding:5px 20px 20px;
    width:40%;
    margin:100px auto 15px;

    #cart_identity {
      flex-direction:row;
      justify-content:space-between;
    }

    #picture {
      width:30%;
      height:200px;
      margin:auto;
    }

    h1 {
      text-align:center;
      font-size:2.5em;
    }

    p {
      margin:30px;
    }

    #smallAvatarProfile {
      display:none;
    }

    #largeAvatarProfile {
      display:block;
    }

    .avatar {
      margin:30px 5px 0px 0px;
    }
  }
  #retour {
    width:40%;
    margin:auto;
  }

}
</style>