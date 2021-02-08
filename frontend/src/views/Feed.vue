<template>
  <body class="feed">
    <Nav :isConnected="true" :fullName="userName" :avatar="avatar"/>
    <div id="post">
      <label for="newPost">Publication : </label>
      <div>
        <!-- <textarea id="newPost" name="newPost" rows="15" cols="70" placeholder="Exprimez-vous ... "> -->
        <textarea id="newPost" name="newPost" placeholder="Exprimez-vous ... "></textarea>
      </div>
      <div id="button">
        <button @click="publishPost">Publier</button>
        <label for="file" class="label-file">Télécharger</label>
        <input type="file" id="file" class="input-file">
      </div>
    </div>
    <div id="posted">
      <div id="person_comments">
        <p> Nom prénom </p>
        <p> Jour Heure </p>
      </div>
      <div>
        <p>Contenu de la publication</p>
      </div>  
      <div id="icons">
        <p><font-awesome-icon :icon="['fas', 'thumbs-up']"/> 0</p>
        <p><font-awesome-icon :icon="['fas', 'comment']"/> 0 commentaires</p>
        <font-awesome-icon :icon="['fas', 'trash']" />
      </div>  
      <div id="comments">
        <!-- <label for="commentsText"></label>
        <textarea id="commentsText" name="commentsText" placeholder="Commentaires ...">
        </textarea>
        <div id="responseText">
          <font-awesome-icon :icon="['fas', 'thumbs-up']"/>
          <p>J'aime</p>
          <p>Supprimer</p>
        </div> -->
        <div>
          <!-- <ul id="messages"></ul> -->
          <form id="formComments" action="">
            <avatar :fullname="userName" :size="30"></avatar>
            <input id="input" placeholder="Votre commentaire" /><button>Envoyer</button>
          </form>
        </div>
      </div> 
    </div>
    
   
  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import { library } from '@fortawesome/fontawesome-svg-core'
  import { faTrash, faComment, faThumbsUp} from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  import Avatar  from 'vue-avatar-component'
  import { mapGetters } from 'vuex'
  import {CommonFunctions} from '../assets/CommonFunctions.js'
  library.add(faTrash)
  library.add(faThumbsUp)
  library.add(faComment)

  export default
  {
    name: 'Feed',
    components:
    {
      'font-awesome-icon': FontAwesomeIcon,
      Nav,
      Avatar
    },
    data: function()
    {
      return {
        userName: '',
        avatar: ''
      };
    },
    mounted(){
      // Initialisation des options de la méthode fetch
      let options = 
      {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuth , // this.auth est récupéré du composant signup/login
          },
      };
      // Envoi de la requête via fetch pour récupérer les informations de l'utilisateur connecté
      fetch('http://localhost:3000/api/employee/' + this.getUserId, options)
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
        let employee = this.formatEmployee(response.employee);
        this.userName = employee.first_name + " " + employee.last_name;
        this.avatar = employee.avatar;
      })
      .catch(error => alert(error));
    },
    computed:{
      ...mapGetters(["getAuth", "getUserId"])
    },
    methods:
    {
      formatEmployee(employeeRaw)
      {
        let formattedEmployee = employeeRaw;
        if (formattedEmployee.avatar === null)
          formattedEmployee.avatar = "";
        if (formattedEmployee.job === null)
          formattedEmployee.job = "Non renseigné";
        if (formattedEmployee.team === null)
          formattedEmployee.team = "Non renseigné";
        return formattedEmployee;
      },
      publishPost()
      {
        let postContent = document.getElementById("newPost").value; 
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({  employeeId : this.getUserId,
                                    date : new Date(),
                                    message : postContent}) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête via fetch pour s'enregistrer
        fetch('http://localhost:3000/api/post/save', options)
        .then(response =>
        {
          if (response.ok && (response.status >= 200 && response.status <= 299))
          {
            return response.json(); // Gestion des bons cas seulement si le code est entre 200 et 299
          }
          else
          {
            throw new Error((CommonFunctions.errorManagement(response.status)));
          }
        })
        .then(response =>
        {
          console.log(response);
        })
        .catch(error => alert(error))
      }
    }
  }
</script>

<style lang="scss">
#post {
  width:80%;
  margin:50px auto;
  padding:20px;
  border:1px solid rgb(48,66,96);
  box-shadow:5px 5px 5px black;
  border-radius:10px;

  label {
    font-weight:bold;
  }

  textarea {
    // border-radius:2%;
    width:100%;
    height:200px;
    border:1px solid grey;
    box-shadow:2px 2px 2px grey;
    margin:5px 0px;
    }

  #button {
    display:flex;
    justify-content:space-between;
  }
  button, .label-file{
      padding:10px 15px;
      border-radius:5px;
      background-color:rgb(48,66,96);
      color: white;
      border:none;
  }

  .label-file{
    cursor:pointer;
    font-weight: normal;
    font-size:0.8em;
  }

  .input-file{
    display:none;
  }

}

#posted {
  width:90%;
  border:1px solid;
  border-radius:10px;
  margin:auto;
}
#person_comments {
  font-size:0.8em;
  background-color:rgb(48,66,96);
  padding:0px 5px;
  color:white;
  display:flex;
  justify-content:space-between;
  border:1px solid;
  border-radius:10px 10px 0px 0px;
}
#icons {
  background-color:rgb(48,66,96);
  // border-radius:0px 0px 10px 10px;
  border:1px solid;
  color:white;
  font-size:0.8em;
  padding:5px;
  display:flex;
  justify-content:space-around;

  p {
    margin:0;
  }
}
#comments {
  width:90%;
  text-align:center;
  margin:auto;
}
#commentsText {
  width:90%;
  height:100px;
  border-radius:10px;
  box-shadow:2px 2px 2px grey;
}
#responseText {
  width:90%;
  font-size:0.7em;
  font-weight: bold;
  color:grey;
  margin:auto;
  display:flex;
  justify-content:right;
  p {
    margin:0;
    padding-left:10px;
  }
}
#formComments {
  margin:10px 0px ;
  display:flex;
}


#input {
  border-radius:5px 0px 0px 5px;
  padding:5px;
  margin-left:5px;
  width:80%;
}

button {
  background-color:rgb(48,66,96);
  border-color:rgb(48,66,96);
  color:white;
  border-radius:0px 5px 5px 0px;
  padding:5px;
  outline:none;
}




  @media screen and (min-width:1500px) {

    #post, #posted {
      width:40%;
    }

  }


</style>