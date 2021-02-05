<template>
  <body class="feed">
    <Nav :isConnected="true" :fullName="this.userName" :auth="this.auth" @custon-event-name="setMessage"/>
    <div>
      <p> {{ message }}</p>
    </div>
    <div id="post">
      <label for="newPost">Publication : </label>
      <div>
        <!-- <textarea id="newPost" name="newPost" rows="15" cols="70" placeholder="Exprimez-vous ... "> -->
         <textarea id="newPost" name="newPost" placeholder="Exprimez-vous ... ">
        </textarea>
      </div>
      <div id="button">
        <button>Publier</button>
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
            <avatar fullname="Jane Toeyuyi" :size="30"></avatar>
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
  import { faTrash } from '@fortawesome/free-solid-svg-icons'
  import { faComment } from '@fortawesome/free-solid-svg-icons'
  import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
   import Avatar  from 'vue-avatar-component'
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
      Nav,
      Avatar
    },
    data: function()
    {
      return {
        userName: 'test nico',
        employee: {},
        message: 'Hello'
      };
    },
    props: {
      auth: {
        type: String,
        required: true
      }
    },
    methods:
    {
      setMessage(payload)
      {
        this.message = payload.message;
        console.log("try to read the event " + this.message)
      }
    },
    
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