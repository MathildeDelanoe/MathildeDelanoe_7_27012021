<template>
  <body class="feed">
    <Nav :isConnected="true" :fullName="this.userName" :auth="this.auth"/>
    <div id="post">
      <label for="newPost">Publication : </label>
      <div>
        <!-- <textarea id="newPost" name="newPost" rows="15" cols="70" placeholder="Exprimez-vous ... "> -->
         <textarea id="newPost" name="newPost" placeholder="Exprimez-vous ... ">
        </textarea>
      </div>
      <div id="button">
        <button>Publier</button>
        <button>Télécharger</button>
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
        <label for="commentsText"></label>
        <textarea id="commentsText" name="commentsText" placeholder="Commentaires ...">
        </textarea>
        <div id="responseText">
          <font-awesome-icon :icon="['fas', 'thumbs-up']"/>
          <p>J'aime</p>
          <p>Répondre</p>
        </div>
      </div>  
    </div>
  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import { library } from '@fortawesome/fontawesome-svg-core'
  import { faTrash } from '@fortawesome/free-solid-svg-icons'
  import { faComment } from '@fortawesome/free-solid-svg-icons'
  import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  library.add(faTrash)
  library.add(faThumbsUp)
  library.add(faComment)
  // import { onMounted } from 'vue'

  export default
  {
    name: 'Feed',
    components:
    {
      'font-awesome-icon': FontAwesomeIcon,
      Nav
    },
    data: function()
    {
      return {
        userName: ''
      };
    },
    props: {
      auth: {
        type: String,
        required: true
      }
    },
    mounted(){
      // Initialisation des options de la méthode fetch
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
        this.userName = response.firstName + " " + response.lastName;
      })
      .catch(error => alert(error));
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
  button {
      padding:10px 15px;
      border-radius:5px;
      background-color:rgb(48,66,96);
      color: white;
      border:none;
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


  @media screen and (min-width:1500px) {

    #post, #posted {
      width:40%;
    }

  }


</style>