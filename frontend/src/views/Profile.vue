<template>
  <body class="profile">
    <Nav :isConnected="true" :fullName="userName" :avatar="this.employee.avatar"/>
      <div id="identity">
        <h1> Mon profil</h1>
        <div id="cart_identity">
          <div>
            <p> Nom : {{ this.employee.last_name }}</p>
            <p> Prénom : {{ this.employee.first_name }}</p>
            <p> Poste occupé : {{ this.employee.job }}</p>
            <p> Equipe : {{ this.employee.team }}</p>
            <!-- <p> Mot de passe : </p> -->
            <button @click="deleteAccount"> Supprimer le compte </button>
            <button @click="updateProfile"> Modifier le compte </button>
          </div>
          <div class="avatar"> 
            <avatar :fullname="userName" :image="this.employee.avatar" id="smallAvatarProfile"></avatar>
            <avatar :fullname="userName" :image="this.employee.avatar" :size="200" id="largeAvatarProfile"></avatar>
          </div>  
        </div>
        <div id="validationForm" v-if="this.isProfileUpdateNeeded">
          <label for="lastName">Nom : </label>
          <input type="text" id="lastName" :value="this.employee.last_name"> <!--v-model="updatedProfile.lastName">-->
          <label for="firstName">Prenom : </label>
          <input type="text" id="firstName" :value="this.employee.first_name"> <!--v-model="updatedProfile.firstName">-->
          <label for="job">Poste : </label>
          <input type="text" id="job" :value="this.employee.job"> <!--v-model="updatedProfile.job">-->
          <label for="team">Equipe : </label>
          <input type="text" id="team" :value="this.employee.team"> <!--v-model="updatedProfile.team">-->
          <label for="avatar" class="label-file">Avatar</label>
          <!-- <input type="file" id="avatar" class="input-file" accept=".jpg,.jpeg,.png" :value="this.employee.avatar"> -->
          <input type="file" id="avatar" class="input-file" accept=".jpg,.jpeg,.png">
          <input type="submit" id="submitButton" value="Mettre à jour" @click="sendProfileUpdate()">
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
  import { mapGetters } from 'vuex'

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
        userName: '',
        employee: {},
        message: 'Hello',
        avatar: '',
        isProfileUpdateNeeded: false,
        updatedProfile: {}
      };
    },
    mounted(){
      // Initialisation des options de la méthode fetch
      let options = 
      {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuth , // this.auth est recupere du composant signup/login
          },
          // params: {
          //   'userId': this.getUserId
          // }
      };
      fetch('http://localhost:3000/api/employee/' + this.getUserId, options)
      // fetch('http://localhost:3000/api/employee/getOne', options)
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
        this.employee = this.formatEmployee(response.employee);
        this.userName = this.employee.first_name + " " + this.employee.last_name;
        this.avatar = this.employee.avatar;
      })
      .catch(error => alert(error));
    },
    computed: {
      ...mapGetters(["getAuth", "getUserId"])
    },
    methods: 
    {
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
      },
      updateProfile()
      {
        this.isProfileUpdateNeeded = true
      },
      deleteAccount()
      {
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.getAuth , // this.auth est recupere du composant signup/login
            },
            // params: {
            //   'userId': this.getUserId
            // }
        };
        fetch('http://localhost:3000/api/employee/' + this.getUserId, options)
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
          if (response.deletionNumber != 1) throw new Error("plus d'un employé a été supprimé!");
          this.$store.commit('SET_AUTHENTICATION', '');
          this.$store.commit('SET_USERID', '');
          this.$router.push({ name: 'Signup' });
        })
        .catch(error => alert(error));
      },
      sendProfileUpdate()
      {
        console.log("sendProfileUpdate")
        let formInputs = document.querySelectorAll("#validationForm input");
        // Création de l'objet JS de contact avec les informations nécessaires
        this.updatedProfile = {
            last_name : formInputs[0].value,
            first_name : formInputs[1].value,
            job : formInputs[2].value,
            team : formInputs[3].value,
            // avatar : formInputs[4].value
        };

        if(formInputs[4].files.length !== 0)
        {
          console.log("file is selected")
        }

        // Initialisation des options de la méthode fetch
        let options ={};
        if(formInputs[4].files.length !== 0)
        {
          const formData = new FormData();
          // formData.append('employee', this.updatedProfile);
          formData.append('firstName', this.updatedProfile.first_name);
          formData.append('lastName', this.updatedProfile.last_name);
          formData.append('job', this.updatedProfile.job);
          formData.append('team', this.updatedProfile.team);
          formData.append('avatar', formInputs[4].files[0]);
          options = 
          {
              method: 'put',
              headers: {
                // 'Content-Type': 'multipart/form-data',
                'Authorization': 'Bearer ' + this.getAuth , // this.auth est recupere du composant signup/login
              },
              body: formData // Remplissage du body de la requête avec les informations nécessaires
          };
        }
        else
        {
          options = 
          {
              method: 'put',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.getAuth , // this.auth est recupere du composant signup/login
              },
              body: JSON.stringify({employee : this.updatedProfile}) // Remplissage du body de la requête avec les informations nécessaires
          };
        }
        fetch('http://localhost:3000/api/employee/' + this.getUserId, options)
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
          this.updatedProfile.avatar = response.filename;
          this.employee = this.formatEmployee(this.updatedProfile);
          
          this.userName = this.employee.first_name + " " + this.employee.last_name;
          if (response.updatedNumber != 1) throw new Error("plus d'un employé a été modifié!");
          this.isProfileUpdateNeeded = false;
        })
        .catch(error => alert(error));
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