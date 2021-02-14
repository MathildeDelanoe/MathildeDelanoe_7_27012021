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
          <button @click="setIsDeleteAccountNeeded()"> Supprimer le compte </button>
          <button @click="updateProfile()"> Modifier le compte </button>
          <button @click="updatePassword()"> Modifier le mot de passe </button>
        </div>
        <div class="avatar">
          <avatar :fullname="userName" :image="this.employee.avatar" id="smallAvatarProfile"></avatar>
          <avatar :fullname="userName" :image="this.employee.avatar" :size="200" id="largeAvatarProfile"></avatar>
        </div>
        <div id="deleteAccountBox" v-if="this.isDeletedAccount" >
          <p>Voulez-vous vraiment supprimer votre compte? Dans ce cas, tous vos posts seront supprimés.</p>
          <div>
            <button @click="deleteAccount()">Oui</button>
            <button @click="unsetIsDeleteAccountNeeded()">Non</button>
          </div>
        </div>
        <div id="updatePasswordBox" v-if="this.isUpdatePassword" >
          <p>Modification du mot de passe </p>
          <div>
            <label for="oldPassword">Ancien mot de passe : </label>
            <input type="passsword" id="oldPassword">
          </div>
          <div>
            <label for="newPassword">Nouveau mot de passe : </label>
            <input type="passsword" id="newPassword" pattern="(?=\S*[A-Z])(?=\S*[!@#$&*])(?=\S*[0-9])(?=\S*[a-z])\S{8,30}">
          </div>
          <div>
            <label for="confirmNewPassword">Confirmation du nouveau mot de passe : </label>
            <input type="passsword" id="confirmNewPassword">
          </div>
          <div>
            <button @click="sendPasswordUpdate()">Modifier</button>
            <button @click="unsetIsUpdatePassword()">Retour</button>
          </div>
        </div>
      </div>
      <div id="validationForm" v-if="this.isProfileUpdateNeeded">
        <div>
          <label for="job">Poste : </label>
          <input type="text" id="job" :value="this.employee.job">
        </div>
        <div>
          <label for="team">Equipe : </label>
          <input type="text" id="team" :value="this.employee.team">
        </div>
        <div>
          <label for="avatar" class="label-file">Modifier l'avatar : </label>
          <input type="file" id="avatar" class="input-file" accept=".jpg,.jpeg,.png">
        </div>
        <div>
          Supprimer l'avatar :
          <input type="radio" id="no" name="avatarChoice" value="no" checked>
          <label for="no">Non</label>
          <input type="radio" id="yes" name="avatarChoice" value="yes">
          <label for="yes">Oui</label>
          <!-- <label for="avatar" class="label-file">Supprimer l'avatar : </label>
          <input type="submit" id="submitButton" value="Supprimer l'image"> -->
        </div>
        <!-- <input type="submit" id="submitButton" value="Mettre à jour" @click="sendProfileUpdate()"> -->
        <button @click="sendProfileUpdate()"> Mettre à jour </button>
        <!-- <input type="submit" id="submitButton" value="Supprimer l'image"> -->
        <!-- <button> Supprimer l'image</button> -->
      </div>
    </div>
    <div id="retour">
      <router-link to="/feed">Retour fil d'actualité</router-link>
    </div>
  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import Avatar  from 'vue-avatar-component'
  import {CommonFunctions} from '../assets/CommonFunctions.js'

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
        isDeletedAccount: false,
        isUpdatePassword: false,
        lsAuth: '',
        lsEmpId: ''
      };
    },
    mounted(){
      this.lsAuth = localStorage.getItem('auth');
      this.lsEmpId = localStorage.getItem('employeeId');
      if (this.lsAuth === null || this.lsEmpId === null)
      {
        this.$router.push({ name: 'Login' });
        return;
      }
      if (this.lsAuth.length === 0 || this.lsEmpId.length === 0)
      {
        this.$router.push({ name: 'Login' });
        return;
      }
      // Initialisation des options de la méthode fetch
      let options = 
      {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.lsAuth , // this.auth est recupere du composant signup/login
          },
      };
      fetch('http://localhost:3000/api/employee/' + this.lsEmpId, options)
      .then(response =>
      {
        if (response.ok && (response.status >= 200 && response.status <= 299))
        {
            return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
        }
        else
        {
            throw new Error(CommonFunctions.errorManagement(response.status));
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
    methods: 
    {
      formatEmployee(employeeRaw)
      {
        let formattedEmployee = employeeRaw;
        if (formattedEmployee.avatar === null)
          formattedEmployee.avatar = "";
        if (formattedEmployee.job === null || formattedEmployee.job.length===0)
          formattedEmployee.job = "Non renseigné";
        if (formattedEmployee.team === null || formattedEmployee.job.length===0)
          formattedEmployee.team = "Non renseigné";
        return formattedEmployee;
      },
      updatePassword()
      {
        this.isUpdatePassword = true;
      },
      unsetIsUpdatePassword()
      {
        this.isUpdatePassword = false;
      },
      sendPasswordUpdate()
      {
        let responseStatus;
        let responseOk;
        let formInputs = document.querySelectorAll("#updatePasswordBox input");
        // Création de l'objet JS de contact avec les informations nécessaires
        let passwords= {
            oldPassword : formInputs[0].value,
            newPassword : formInputs[1].value,
            confPassword : formInputs[2].value,
        };
        if (!formInputs[1].checkValidity())
        {
          alert('Votre mot de passe doit contenir 1 minuscule, 1 majuscule, 1 caractère spécial (!@#$&*), 1 chiffre et avoir 8 caractères minimum')
          return;
        }
        if (passwords.newPassword !== passwords.confPassword)
        {
          alert('Les deux nouveaux mots de passes sont différents!')
          return;
        }
        let options =
        {
          method: 'put',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth , // this.auth est recupere du composant signup/login
            },
            body: JSON.stringify({password : passwords}) // Remplissage du body de la requête avec les informations nécessaires
        };
        fetch('http://localhost:3000/api/employee/password/' + this.lsEmpId, options)
        .then(response =>
        {
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then((response) => 
        {
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          this.unsetIsUpdatePassword();
        })
        .catch(error => alert(error));
      },
      updateProfile()
      {
        this.isProfileUpdateNeeded = true;
      },
      setIsDeleteAccountNeeded()
      {
        this.isDeletedAccount = true;
      },
      unsetIsDeleteAccountNeeded()
      {
        this.isDeletedAccount = false;
      },
      deleteAccount()
      {
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.lsAuth est recupere du composant signup/login
            },
        };
        fetch('http://localhost:3000/api/employee/' + this.lsEmpId, options)
        .then(response =>
        {
          if (response.ok && (response.status >= 200 && response.status <= 299))
          {
            return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
          }
          else
          {
            throw new Error(CommonFunctions.errorManagement(response.status));
          }
        })
        .then(response => 
        {
          if (response.deletionNumber != 1) throw new Error("plus d'un employé a été supprimé!");
          localStorage.clear(); // Suppression des identifiants de l'employé
          this.$router.push({ name: 'Signup' });
        })
        .catch(error => alert(error));
      },
      sendProfileUpdate()
      {
        let formInputs = document.querySelectorAll("#validationForm input");
        // Création de l'objet JS de contact avec les informations nécessaires
        let updatedProfile = {
            job : CommonFunctions.formatInput(formInputs[0].value),
            team : CommonFunctions.formatInput(formInputs[1].value),
        };

        let radioButton= document.getElementsByName('avatarChoice');
        // for (let index = 0; index < radioButton.lenth; ++index)
        for (let valueRadioButton of radioButton)
        {
          if (valueRadioButton.checked)
          {
            updatedProfile.removeAvatar = (valueRadioButton.value === "no")?false:true;
          }
        }

        // Initialisation des options de la méthode fetch
        let options = {};
        if (formInputs[2].files.length !== 0)
        {
          const formData = new FormData();
          formData.append('job', updatedProfile.job);
          formData.append('team', updatedProfile.team);
          formData.append('avatar', formInputs[2].files[0]);
          options = 
          {
              method: 'put',
              headers: {
                // 'Content-Type': 'multipart/form-data',
                'Authorization': 'Bearer ' + this.lsAuth, // this.lsAuth est recupere du composant signup/login
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
                'Authorization': 'Bearer ' + this.lsAuth, // this.lsAuth est recupere du composant signup/login
              },
              body: JSON.stringify({employee : updatedProfile}) // Remplissage du body de la requête avec les informations nécessaires
          };
        }
        fetch('http://localhost:3000/api/employee/' + this.lsEmpId, options)
        .then(response =>
        {
          if (response.ok && (response.status >= 200 && response.status <= 299))
          {
            return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
          }
          else
          {
            throw new Error(CommonFunctions.errorManagement(response.status));
          }
        })
        .then(response => 
        {
          if (response.filename === null)
          {
            updatedProfile.avatar = this.employee.avatar;
            if (updatedProfile.removeAvatar)
            {
              updatedProfile.avatar = null;
            }
          }
          else
          {
            updatedProfile.avatar = response.filename;
          }
          updatedProfile = this.formatEmployee(updatedProfile);
          this.employee.job = updatedProfile.job;
          this.employee.team = updatedProfile.team;
          this.employee.avatar = updatedProfile.avatar;
          
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
    position:relative;
}
  
#cart_identity {
  display:flex;
  flex-direction:column-reverse;

  button {
    cursor:pointer;
  }
}

#deleteAccountBox {
  position:absolute;
  background-color:rgba(217,217,217,0.9);
  color:black;
  width:70%;
  top:50%;
  left:50%;
  transform: translate(-50%,-50%);
  border-radius:5px;
  padding:20px;

  div {
    width:150px;
    margin:auto;
    display:flex;
    justify-content:space-between;
  }

  button {
    border-radius:5px;
  }
}

#updatePasswordBox {
  position:absolute;
  background-color:rgba(217,217,217,0.9);
  color:black;
  width:80%;
  top:50%;
  left:50%;
  transform: translate(-50%,-50%);
  border-radius:5px;
  padding:10px;

  p {
    text-align:center;
    font-weight: bold;;
  }

  div {
    margin:10px;

  }
  div:last-child {
    display:flex;
    justify-content:space-around;
  }
  button {
    border-radius:5px;
  }

}

.avatar {
  text-align:center;
}

#largeAvatarProfile {
  display:none;
}

#retour { 
  font-weight: bold;
  margin-top:10px;
  text-align:right;
  font-size:0.8em;
  a {
    color:black;
    text-decoration:none;
  }
}

#validationForm > div {
 margin:10px;
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