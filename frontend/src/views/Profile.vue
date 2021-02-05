<template>
  <body class="profile">
    <Nav :isConnected="true" :fullName="this.userName" :auth="this.auth"/>
      <div id="identity">
        <h1> Mon profil</h1>
        <div id="cart_identity">
          <div>
            <p> Nom : {{ this.employee.last_name }}</p>
            <p> Prénom : {{ this.employee.first_name }}</p>
            <p> Poste occupé : {{ this.employee.job }}</p>
            <p> Equipe : {{ this.employee.team }}</p>
            <!-- <p> Poste occupé : {{ (this.employee.job.lenth == 0)?"Non renseigné":this.employee.job }}</p>
            <p> Equipe : {{ (this.employee.team.length === 0)?"Non renseigné":this.employee.team }}</p> -->
            <!-- <p> Mot de passe : </p> -->
            <p> Supprimer le compte </p>
            <p> Modifier le compte </p>
          </div>
          <div class="avatar"> 
            <avatar :fullname="this.getFullName" :image="this.employee.avatar" id="smallAvatarProfile"></avatar>
            <avatar :fullname="this.getFullName" :image="this.employee.avatar" :size="200" id="largeAvatarProfile"></avatar>
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
    data: function()
    {
      return {
        userName: 'test nico',
        employee: {},
        message: 'Hello',
        useAvatar: false
      };
    },
    props: {
      auth: {
        type: String,
        // required: true
      }
    },
    computed: {
      getFullName()
      {
        return this.employee.first_name + " " + this.employee.last_name;
      }
    },
    methods: {
      formatEmployee(employeeRaw)
      {
        let formattedEmployee = employeeRaw;
        if (formattedEmployee.first_name === null)
          formattedEmployee.first_name = "Non renseigné";
        if (formattedEmployee.last_name === null)
          formattedEmployee.last_name = "Non renseigné";
        if (formattedEmployee.avatar === null)
          formattedEmployee.avatar = "";
        if (formattedEmployee.job === null)
          formattedEmployee.job = "Non renseigné";
        if (formattedEmployee.team === null)
          formattedEmployee.team = "Non renseigné";
        return formattedEmployee;
      }
    },
    mounted(){
      // Initialisation des options de la méthode fetch
      console.log("in mounted profile.vue " + this.auth)
      let options = 
      {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.auth , // this.auth est recupere du composant signup/login
          }
      };
      fetch('http://localhost:3000/api/employee/getOne', options)
      .then(response =>
      {
        if (response.ok && (response.status >= 200 && response.status <= 299))
        {
            return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
        }
        else
        {
            // S'il y a une erreur, écriture d'un message correspondant à l'erreur
            let message = [];
            if (response.status >= 300 && response.status <= 399)
            {
                message = 'Erreur de redirection. Le contenu a bougé ou n\'est pas accessible directement';
            }
            else if (response.status >= 400 && response.status <= 499)
            {
                message = 'Erreur liée à l\'utilisation du service web';
            }
            else if (response.status >= 500 && response.status <= 599)
            {
                message = 'Erreur venant du service web';
            }
            else
            {
                message = 'Erreur d\'un autre type';
            }
            throw new Error(message);
        }
      })
      .then(response => 
      {
        console.log(response.employee)
        this.employee = this.formatEmployee(response.employee);
        this.userName = this.employee.first_name + " " + this.employee.last_name;
      })
      .catch(error => alert(error));
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