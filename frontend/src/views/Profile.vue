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
          <button @click="setIsDeleteAccount()"> Supprimer le compte </button>
          <button @click="setIsProfileUpdate()"> Modifier le compte </button>
          <button @click="setIsUpdatePassword()"> Modifier le mot de passe </button>
        </div>
        <div class="avatar">
          <avatar :fullname="userName" :image="this.employee.avatar" id="smallAvatarProfile"></avatar>
          <avatar :fullname="userName" :image="this.employee.avatar" :size="200" id="largeAvatarProfile"></avatar>
        </div>
        <!-- Message de confirmation de suppression du compte -->
        <div id="deleteAccountBox" v-if="this.isDeletedAccount" >
          <p>Voulez-vous vraiment supprimer votre compte? Dans ce cas, tous vos posts seront supprimés.</p>
          <div>
            <button @click="deleteAccount()">Oui</button>
            <button @click="unsetIsDeleteAccount()">Non</button>
          </div>
        </div>
        <!-- Message pour changement de mot de passe -->
        <div id="updatePasswordBox" v-if="this.isUpdatePassword" >
          <p>Modification du mot de passe </p>
          <div>
            <label for="oldPassword">Ancien mot de passe : </label>
            <input type="password" id="oldPassword">
          </div>
          <div>
            <label for="newPassword">Nouveau mot de passe : </label>
            <input type="password" id="newPassword" pattern="(?=\S*[A-Z])(?=\S*[!@#$&*])(?=\S*[0-9])(?=\S*[a-z])\S{8,30}">
          </div>
          <div>
            <label for="confirmNewPassword">Confirmation du nouveau mot de passe : </label>
            <input type="password" id="confirmNewPassword">
          </div>
          <div>
            <button @click="sendPasswordUpdate()">Modifier</button>
            <button @click="unsetIsUpdatePassword()">Retour</button>
          </div>
        </div>
      </div>
      <!-- Message pour mettre à jour le profil -->
      <div id="validationForm" v-if="this.isProfileUpdate">
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
        </div>
        <button @click="sendProfileUpdate()"> Mettre à jour </button>
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
  import io from 'socket.io-client'

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
        isProfileUpdate: false,
        isDeletedAccount: false,
        isUpdatePassword: false,
        lsAuth: '',
        lsEmpId: '',
        likedPost: []
      };
    },
    created()
    {
      this.socket = io('http://localhost:3000', { autoConnect: false });
      this.socket.connect(); // Connect to the socket
    },
    mounted()
    {
      // Au montage de la page, on vérifie si un utilisateur est déjà connecté par lecture du local storage
      this.lsAuth = localStorage.getItem('auth');
      this.lsEmpId = localStorage.getItem('employeeId');
      if (this.lsAuth === null || this.lsEmpId === null) // Si l'une des clés n'existe pas dans le local storage
      {
        this.$router.push({ name: 'Login' }); // Redirection vers la page de connexion
        return;
      }
      if (this.lsAuth.length === 0 || this.lsEmpId.length === 0) // Si l'une des clés est vide
      {
        this.$router.push({ name: 'Login' }); // Redirection vers la page de connexion
        return;
      }

      // Au montage de cette page, on souhaite obtenir les infos de l'utilisateur
      // Initialisation des options de la méthode fetch
      let options = 
      {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.lsAuth , // this.auth est recupere du composant signup/login
          },
      };
      // Envoi de la requête via fetch pour récupérer les informations de l'employé
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
        // Formattage des données de l'employé
        this.employee = this.formatEmployee(response.employee);
        for (let likedPost of this.employee.likedPosts)
        {
          this.likedPost.push(likedPost.post_id); // Création du tableau de posts likés par l'employé
        }
        this.userName = this.employee.first_name + " " + this.employee.last_name;
        this.avatar = this.employee.avatar;
      })
      .catch(error => alert(error));
    },
    beforeUnmount()
    {
      this.socket.close(); // Fermeture de la socket
    },
    methods: 
    {
      // Cette fonction formatte quelque peu les informations récupérées de la bdd pour l'employé
      formatEmployee(employeeRaw)
      {
        let formattedEmployee = employeeRaw;
        // Si l'avatar est non présent, retour d'une chaîne vide
        if (formattedEmployee.avatar === null)
          formattedEmployee.avatar = "";
        // Si le job est non présent, retour d'une chaîne "Non renseigné"
        if (formattedEmployee.job === null || formattedEmployee.job.length===0)
          formattedEmployee.job = "Non renseigné";
        if (formattedEmployee.team === null || formattedEmployee.job.length===0)
          formattedEmployee.team = "Non renseigné";
        return formattedEmployee;
      },
      // Valoriser isUpdatePassword à 'true' pour afficher le message correspondant
      setIsUpdatePassword()
      {
        this.isUpdatePassword = true;
      },
      // Valoriser isUpdatePassword à 'false' pour cacher le message correspondant
      unsetIsUpdatePassword()
      {
        this.isUpdatePassword = false;
      },
      // Appel de la fonction qui envoie le changement de mot de passe à la bdd
      sendPasswordUpdate()
      {
        let responseStatus;
        let responseOk;
        // Récupération des inputs du formulaire de changement de mot de passe
        let formInputs = document.querySelectorAll("#updatePasswordBox input");
        // Création de l'objet JS de changement de mot de passe
        let passwords = {
            oldPassword : formInputs[0].value,
            newPassword : formInputs[1].value,
            confPassword : formInputs[2].value,
        };

        if (!formInputs[1].checkValidity() || formInputs[1].value.length === 0) // Si le nouveau mot de passe ne remplit pas les critères ou est vide
        {
          alert('Votre mot de passe doit contenir 1 minuscule, 1 majuscule, 1 caractère spécial (!@#$&*), 1 chiffre et avoir 8 caractères minimum')
          return;
        }
        if (passwords.newPassword === passwords.oldPassword) // Si le nouveau mot de passe et l'ancien sont identiques
        {
          alert('Le nouveau mot de passe est identique à l\'ancien!')
          return;
        }
        if (passwords.newPassword !== passwords.confPassword) // Si les mots de passe diffèrent
        {
          alert('Les deux nouveaux mots de passes sont différents!')
          return;
        }

        // Initialisation des options de la méthode fetch
        let options =
        {
          method: 'put',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            },
            body: JSON.stringify({ ...passwords })
        };
        // Envoi de la requête via fetch pour mettre à jour le mot de passe
        fetch('http://localhost:3000/api/employee/password/' + this.lsEmpId, options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then((response) => 
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          // Une fois la modification effectuée, nous pouvons cacher de nouveau le formulaire correspondant
          // en remettant le booléen correspondant à 'false'
          this.unsetIsUpdatePassword();
          alert('Votre mot de passe a été correctement changé')
        })
        .catch(error => alert(error));
      },
      // Valoriser isDeletedAccount à 'true' pour afficher le message correspondant
      setIsDeleteAccount()
      {
        this.isDeletedAccount = true;
      },
      // Valoriser isDeletedAccount à 'false' pour afficher le message correspondant
      unsetIsDeleteAccount()
      {
        this.isDeletedAccount = false;
      },
      // Appel de la fonction qui demande la suppresion de l'employé de la BDD
      deleteAccount()
      {
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            }
        };
        // Envoi de la requête via fetch pour supprimer le compte de l'employé
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
          localStorage.clear(); // Suppression des identifiants de l'employé du LS pour close la session
          this.socket.emit('deleteAccountSocketEmit', { employeeId: this.lsEmpId,
                                                        likedPosts: this.likedPost });
          this.$router.push({ name: 'Signup' }); // Redirection vers la page de signup
        })
        .catch(error => alert(error));
      },

      // Valoriser isProfileUpdate à 'true' pour afficher le message correspondant
      setIsProfileUpdate()
      {
        this.isProfileUpdate = true;
      },
      // Valoriser isProfileUpdate à 'false' pour cacher le message correspondant
      unsetIsProfileUpdate()
      {
        this.isProfileUpdate = false;
      },
      // Appel de la fonction qui demande la mise à jour du profil de l'employé
      sendProfileUpdate()
      {
        // Récupération des input du formulaire de changement de profil
        let formInputs = document.querySelectorAll("#validationForm input");
        // Création de l'objet JS de contact avec les informations nécessaires
        let updatedProfile = {
            job : CommonFunctions.formatInput(formInputs[0].value),
            team : CommonFunctions.formatInput(formInputs[1].value),
        };

        // Ecoute du bouton radio de mise à jour de l'avatar
        let radioButton= document.getElementsByName('avatarChoice');
        for (let valueRadioButton of radioButton)
        {
          if (valueRadioButton.checked) // Si le bouton courant est cliqué
          {
            // Vérification de sa valeur et valorisation de removeAvatar en conséquence
            updatedProfile.removeAvatar = (valueRadioButton.value === "no")?false:true;
          }
        }

        // Initialisation des options de la méthode fetch
        let options = {};
        if (formInputs[2].files.length !== 0)
        {
          // Si l'avatar doit être changé, utilisation d'un formData
          const formData = new FormData();
          formData.append('job', updatedProfile.job);
          formData.append('team', updatedProfile.team);
          formData.append('picture', formInputs[2].files[0]);
          // Création des options et utilisation du formData dans le body
          options = {
            method: 'put',
            headers: {
              'Authorization': 'Bearer ' + this.lsAuth
            },
            body: formData
          };
        }
        else
        {
          // Création des options et utilisation du formData dans le body
          options = {
            method: 'put',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            },
            body: JSON.stringify({ ...updatedProfile })
          };
        }
        // Envoi de la requête via fetch pour mettre à jour le profil de l'employé
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
            // Si aucune nouvelle photo de profil n'a été chargée, on garde l'avatar précédent
            updatedProfile.avatar = this.employee.avatar;
            if (updatedProfile.removeAvatar) // Si l'employé souhaite supprimer sa photo de profil courante
            {
              updatedProfile.avatar = null;
            }
          }
          else
          {
            updatedProfile.avatar = response.filename; // Le chemin du nouvel avatar est récupéré
          }

          // Formattage du profil mis à jour et assignation à la data employee
          updatedProfile = this.formatEmployee(updatedProfile);
          this.employee.job = updatedProfile.job;
          this.employee.team = updatedProfile.team;
          this.employee.avatar = updatedProfile.avatar;
          if (formInputs[2].files.length !== 0 || updatedProfile.removeAvatar) // Si changement d'avatar, notification à la socket
          {
            this.socket.emit('newAvatarSocketEmit', { employeeId: this.lsEmpId, avatar: this.employee.avatar });
          }
          
          if (response.updatedNumber != 1) throw new Error("plus d'un employé a été modifié!");
          this.unsetIsProfileUpdate();
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