<template>
  <body class="feed">
    <Nav :isConnected="true" :fullName="userName" :avatar="avatar"/>
    <h1> Bienvenue {{ userName }} !</h1>
    <!-- Représente la publication des posts -->
    <div id="post">
      <label for="newPost">Publication : </label>
      <div id="imagePreview">
      </div>
      <div>
        <textarea id="newPost" name="newPost" placeholder="Exprimez-vous ... "></textarea>
      </div>
      <div id="button">
        <button @click="publishPost">Publier</button>
        <label for="file" class="label-file">Télécharger</label>
        <input type="file" id="file" class="input-file" accept=".jpg,.jpeg,.png,.gif" @change="this.showPreview()">
      </div>
    </div>
    <!-- Représente les employées que l'on cherche -->
    <div id="searchPerson">
      <!-- <p><font-awesome-icon :icon="['fas', 'search']"/>
        <label for="search"></label>
        <input type="search" id="search" name="q" placeholder="Rechercher par Nom Prénom" aria-label="Recherche dans les posts" @change="reloadAllPosts">
        <button @click="printSpecificPosts()">Rechercher</button>
        <button @click="printSpecificPosts('mine')">Mes posts</button>
      </p> -->
      <p> Rechercher dans les posts </p>
      <div id="testPost">
        <div>
          <font-awesome-icon :icon="['fas', 'search']"/>
          <label for="searchLastName"></label>
          <input type="search" id="searchLastName" name="q" placeholder="Nom" aria-label="Recherche dans les posts par Nom" @change="reloadAllPosts">
          <label for="searchFirstName"></label>
          <input type="search" id="searchFirstName" name="q" placeholder="Prénom" aria-label="Recherche dans les posts par Prénom" @change="reloadAllPosts"> 
          <button @click="printSpecificPosts()" id="buttonSearch">Rechercher</button>
        </div>
        <button @click="printSpecificPosts('mine')">Mes posts</button>
      </div>
    </div>
    <!-- Nombre de posts trouvés et retour aux postes -->
    <div id="FilteredPost" v-if="this.isFilteredPostOnGoing">
      <p>{{ this.feedPosts.length }} {{ (this.feedPosts.length > 1)?"posts ont été trouvés":"post a été trouvé" }}.</p>
      <button @click="reloadAllPosts('button')" id="buttonReturnPost">Retour aux posts</button>
    </div>
    <!-- Représente les publications postées -->
    <div id="posted" v-for="(singlePost, indexPost) in feedPosts" :key="singlePost">
      <div>
        <!-- Les infos des personnes qui ont postés -->
        <div id="person_comments">
          <div>
            <avatar :fullname="singlePost.first_name + ' ' + singlePost.last_name" :image="singlePost.avatar" :size="30" id="avatar"></avatar> <p> {{ singlePost.first_name }} {{ singlePost.last_name }} </p>
          </div>
          <p> {{ singlePost.formatedDate }} </p>
        </div>
        <!-- Le contenu du post -->
        <div id="postContent">
          <img :src="singlePost.picture" alt="picture of a post" v-if="singlePost.picture !== null"/>
          <p>{{ singlePost.text }}</p>
        </div>
        <!-- Représente les différentes icones du post -->
        <div id="icons">
          <p @click="likeMessage(singlePost.id, indexPost)"><font-awesome-icon :icon="['fas', 'thumbs-up']" :class="{'like':this.likedPost.includes(singlePost.id), 'noLike':!this.likedPost.includes(singlePost.id)}"/> {{ singlePost.nbLikes }} </p>
          <p><font-awesome-icon :icon="['fas', 'comment']"/> {{ singlePost.comments.length }} commentaire{{ (singlePost.comments.length > 1)?'s':''}}</p>
          <p v-if="singlePost.employee_id==this.lsEmpId || this.isAdmin===true" @click="setIsDeleteMessageNeeded(singlePost.id, true)"><font-awesome-icon :icon="['fas', 'trash']" /></p>
        </div>
        <!-- Pour supprimer un post -->
        <div id="deletePostBox" v-if="mapDeletedMessage.has(singlePost.id) && mapDeletedMessage.get(singlePost.id)==true">
          <p>Voulez-vous vraiment supprimer votre post?</p>
          <div>
            <button @click="deleteMessage(singlePost.id, indexPost, 'post')">Oui</button>
            <button @click="setIsDeleteMessageNeeded(singlePost.id, false)">Non</button>
          </div>
        </div>
      </div>
      <!-- Représente les commentaires -->
      <div id="comments">
        <!-- Représente les commentaires dejà postés -->
        <div id ="fullComment" v-for="(singleComment, indexComment) in singlePost.comments" :key="singleComment">
          <div>
            <avatar :fullname="singleComment.first_name + ' ' + singleComment.last_name" :image="singleComment.avatar" :size="30" id="avatar"></avatar>
            <div id="commentsText">
              <div id="commentsHead">
                <p>{{ singleComment.first_name + ' ' + singleComment.last_name }} {{ singleComment.formatedDate.toLowerCase() }}</p>
              </div>
              <p>{{ singleComment.text }}</p>
            </div>
            <p v-if="singleComment.employee_id==this.lsEmpId || this.isAdmin===true" @click="setIsDeleteMessageNeeded(singleComment.id, true)"><font-awesome-icon :icon="['fas', 'trash']" /></p>
          </div>
          <!-- Pour supprimer un commentaire déjà postés-->
          <div id="deleteCommentBox" v-if="mapDeletedMessage.has(singleComment.id) && mapDeletedMessage.get(singleComment.id)==true">
            <p>Voulez-vous vraiment supprimer votre commentaire?</p>
            <div>
              <button @click="deleteMessage(singleComment.id, indexPost, 'comment', indexComment)">Oui</button>
              <button @click="setIsDeleteMessageNeeded(singleComment.id, false)">Non</button>
            </div>
          </div>
        </div>
        <!-- Pour poster un commentaire -->
        <div>
          <form class="formComments" action="">
            <avatar :fullname="userName" :image="avatar" :size="30"></avatar>
            <label for="sendComment" class="labelComment">Votre commentaire</label>
            <input id="sendComment" placeholder="Votre commentaire" /><button @click="this.publishComment(singlePost.id, indexPost)">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
   
  </body>
</template>

<script>
  import Nav from '../components/Nav.vue'
  import { library } from '@fortawesome/fontawesome-svg-core'
  import { faTrash, faComment, faThumbsUp, faSearch} from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  import Avatar  from 'vue-avatar-component'
  import {CommonFunctions} from '../assets/CommonFunctions.js'
  library.add(faTrash)
  library.add(faThumbsUp)
  library.add(faComment)
  library.add(faSearch)

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
        isAdmin: false,
        userName: '',
        avatar: '',
        feedPosts: [],
        searchFeedPosts: [],
        historyFeedPosts: [],
        isFilteredPostOnGoing: false,
        avatarPosted: '',
        datePosted: '',
        mapDeletedMessage : new Map(),
        lsAuth: '',
        lsEmpId: '',
        likedPost: []
      };
    },
    mounted(){
      // Vérification que l'employé est connecté (présence dans le local storage de ces informations)
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
      this.getPosts();
      this.getEmployeeInfo();
    },
    methods:
    {
      showPreview()
      {
        // Récupération de la div html contenant la prévisualisation
        let picturePreview = document.getElementById("imagePreview");
        // Boucle de suppression des images déjà présentes dans le post
        while(picturePreview.firstChild) {
          picturePreview.removeChild(picturePreview.firstChild);
        }

        let postPicture = document.getElementById("file"); // Récupération de l'input de type file
        let image = document.createElement('img'); // Création d'une image
        image.src = window.URL.createObjectURL(postPicture.files[0]);
        picturePreview.appendChild(image);
      },
      async fetchComments(post)
      {
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.auth est récupéré du composant signup/login
            },
        };
        // Envoi de la requête via fetch pour récupérer tous les posts
        let jsonResponse = await fetch('http://localhost:3000/api/post/comments/' + post.id, options);
        let commentsTable = await jsonResponse.json();
        post = {...post, comments: commentsTable.comments};
        post.avatar = (post.avatar === null)?"": post.avatar;
        for (let comment of post.comments)
        {
          comment.avatar = (comment.avatar === null)?"": comment.avatar;
        }
        return post;
      },
      getPosts(){
        this.feedPosts.length = 0; // Nécessité de vider le tableau de posts
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.auth est récupéré du composant signup/login
            },
        };
        // Envoi de la requête via fetch pour récupérer tous les posts
        fetch('http://localhost:3000/api/post/', options)
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
        .then(async response => 
        {
          for (let post of response.posts)
          {
            await this.fetchComments(post)
            .then(post => {
              this.feedPosts.push(post);
            });
          }
        })
        .catch(error => alert(error));
      },
      getEmployeeInfo(){
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.auth est récupéré du composant signup/login
            },
        };
        // Envoi de la requête via fetch pour récupérer les informations de l'utilisateur connecté
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
          this.likedPost.length = 0;
          let employee = this.formatEmployee(response.employee);
          this.userName = employee.first_name + " " + employee.last_name;
          this.avatar = employee.avatar;
          this.isAdmin = (employee.is_admin.data[0])?true:false;
          for (let likedPost of employee.likedPosts)
          {
            this.likedPost.push(likedPost.post_id);
          }
        })
        .catch(error => alert(error));
      },
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
        let responseStatus;
        let responseOk;
        let postContent = document.getElementById("newPost").value;
        let formInputs = document.querySelectorAll("#post input");
        // Initialisation des options de la méthode fetch
        let options = {};
        if (formInputs[0].files.length !== 0) // Une image sera envoyée avec le post
        {
          const formData = new FormData();
          formData.append('employeeId', this.lsEmpId);
          formData.append('message', postContent);
          formData.append('picture', formInputs[0].files[0]);
          options = 
          {
              method: 'post',
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
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.lsAuth, // this.lsAuth est recupere du composant signup/login
              },
              body: JSON.stringify({  employeeId : this.lsEmpId,
                                      message : postContent }) // Remplissage du body de la requête avec les informations nécessaires
          };
        }
        // Envoi de la requête via fetch pour s'enregistrer
        fetch('http://localhost:3000/api/post/save', options)
        .then(response =>
        {
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response =>
        {
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }

          let newPost = {};
          if (formInputs[0].files.length !== 0)
          {
            newPost = {id: response.id,
                      employee_id: this.lsEmpId,
                      first_name: this.userName.split(' ')[0],
                      last_name: this.userName.split(' ')[1],
                      avatar: this.avatar,
                      formatedDate: response.date,
                      picture: response.picture,
                      text :response.content,
                      nbLikes: 0};
          }
          else
          {
            newPost = {id: response.id,
                      employee_id: this.lsEmpId,
                      first_name: this.userName.split(' ')[0],
                      last_name: this.userName.split(' ')[1],
                      avatar: this.avatar,
                      formatedDate: response.date,
                      picture: null,
                      text :response.content,
                      nbLikes: 0};
          }
          newPost.comments = [];
          
          this.feedPosts.unshift(newPost);

          document.getElementById("newPost").value = '';
          if (formInputs[0].files.length !== 0) // Une image sera envoyée avec le post
          {
            formInputs[0].value = null;
          }
          // Récupération de la div html contenant la prévisualisation
          let picturePreview = document.getElementById("imagePreview");
          // Boucle de suppression des images déjà présentes dans le post
          while(picturePreview.firstChild) {
            picturePreview.removeChild(picturePreview.firstChild);
          }
        })
        .catch(error => alert(error))
      },
      likeMessage(postId, indexPost)
      {
        let responseStatus;
        let responseOk;
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.lsAuth est recupere du composant signup/login
            },
            body: JSON.stringify({  employeeId : this.lsEmpId }) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête via fetch pour s'enregistrer
        fetch('http://localhost:3000/api/post/like/'+ postId, options)
        .then(response =>
        {
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then ((response)=>
        {
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          if (response.like)
          {
            // Si l'employé aime le post
            // Mise à jour du tableau de like de l'employé courant en rajoutant le post dans le tableau de like
            this.likedPost.push(postId);
            // Mise à jour du nombre de likes du post courant
            this.feedPosts[indexPost].nbLikes++;
          }
          else
          {
            // Si l'employé n'aime plus post
            // Mise à jour du tableau de like de l'employé courant en supprimant le post dans le tableau de like
            const index = this.likedPost.indexOf(postId); // Recherche de l'index du tableau où le postId se trouve
            if (index > -1) // Normalement, cette condition est toujours vraie
            {
              this.likedPost.splice(index, 1); // Suppression de ce postID
            }
            // Mise à jour du nombre de likes du post courant
            this.feedPosts[indexPost].nbLikes--;
          }
        })
        .catch(error => alert(error))
      },
      setIsDeleteMessageNeeded(messageId, value)
      {
        if (value === false)
        {
          this.mapDeletedMessage.delete(messageId);
          return;
        }
        this.mapDeletedMessage.set(messageId, value);
      },
      deleteMessage(messageId, indexPost, messageType, indexComment = -1)
      {
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.auth est recupere du composant signup/login
            }
        };
        // Envoi de la requête via fetch pour s'enregistrer
        fetch('http://localhost:3000/api/post/' + messageId, options)
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
          if (response.deletionNumber != 1) throw new Error("plus d'un message a été supprimé!");
          this.setIsDeleteMessageNeeded(messageId, false);
          if (messageType === 'post')
          {
            // Suppression d'un post
            this.feedPosts.splice(indexPost, 1); // Suppression du post
          }
          else if (messageType === 'comment')
          {
            // Suppression d'un commentaire
            this.feedPosts[indexPost].comments.splice(indexComment, 1);
          }
          else
          {
            alert('Mauvaise valeur de type de message');
          }
        })
        .catch(error => alert(error))
      },
      publishComment(post_id, post_index)
      {
        let responseStatus;
        let responseOk;
        let commentContent = document.querySelectorAll("form input")[post_index].value;
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.lsAuth est recupere du composant signup/login
            },
            body: JSON.stringify({  employeeId : this.lsEmpId,
                                    message : commentContent,
                                    postId : post_id}) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête via fetch pour s'enregistrer
        fetch('http://localhost:3000/api/post/save', options)
        .then(response =>
        {
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response =>
        {
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          document.querySelectorAll("form input")[post_index].value = '';
          let newComment = {id: response.id,
                            employee_id: this.lsEmpId,
                            first_name: this.userName.split(' ')[0],
                            last_name: this.userName.split(' ')[1],
                            avatar: this.avatar,
                            formatedDate: response.date,
                            text :response.content};
          this.feedPosts[post_index].comments.push(newComment);
        })
        .catch(error => alert(error))
      },
      printSpecificPosts(option)
      {
        let responseStatus;
        let responseOk;
        // Récupération de l'input html contenant le champ de recherche
        let lastName = document.getElementById("searchLastName").value;
        let firstName = document.getElementById("searchFirstName").value;
        if (lastName === '' && firstName === '' && option !== 'mine')
        {
          alert('Le champ est vide');
          return;
        }
        if (option === 'mine')
        {
          lastName = this.userName.split(' ')[1];
          firstName = this.userName.split(' ')[0];
        }
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth, // this.auth est récupéré du composant signup/login
            },
        };
        // Envoi de la requête via fetch pour récupérer les informations de l'utilisateur connecté
        fetch('http://localhost:3000/api/post/search/' + lastName + '/' + firstName, options)
        .then(response =>
        {
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response => 
        {
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }

          if (!this.isFilteredPostOnGoing)
          {
            // S'il n'y a aucun filtre sur les posts appliqués, on stocke les posts actuels
            for (let post of this.feedPosts)
            {
              this.historyFeedPosts.push(post);
            }
            // On parcourt la liste des posts actuels
            for (let postId of response.postIds)
            {
              for (let post of this.feedPosts)
              {
                if (post.id === postId.id)
                {
                  this.searchFeedPosts.push(post);
                }
              }
            }
          }
          else
          {
            // Si un filtre est déjà présent, nous utilisons le tableau de posts sauvegardés
            for (let postId of response.postIds)
            {
              for (let post of this.historyFeedPosts)
              {
                if (post.id === postId.id)
                {
                  this.searchFeedPosts.push(post);
                }
              }
            }
          }

          this.feedPosts.length = 0;
          for (let searchPost of this.searchFeedPosts)
          {
            this.feedPosts.push(searchPost);
          }
          this.searchFeedPosts.length = 0;
          if (!this.isFilteredPostOnGoing)
          {
            this.isFilteredPostOnGoing = true;
          }
        })
        .catch(error => alert(error));
      },
      reloadAllPosts(type = '')
      {
        let lastName = document.getElementById("searchLastName").value;
        let firstName = document.getElementById("searchFirstName").value;
        if (type === 'button' || (lastName === '' && firstName === ''))
        {
          this.feedPosts.length = 0;
          for (let savedPost of this.historyFeedPosts)
          {
            this.feedPosts.push(savedPost);
          }
          this.historyFeedPosts.length = 0;
          this.isFilteredPostOnGoing = false;
          document.getElementById("searchLastName").value = '';
          document.getElementById("searchFirstName").value = '';
        }
      },
    }
  }
</script>

<style lang="scss">
h1 {
  margin-left:40px;
  margin-top:30px;
  font-size:1.5em;
}

#post {
  width:80%;
  margin:40px auto;
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
      cursor:pointer;
  }

  .label-file {
    font-weight: normal;
    font-size:0.8em;
  }

  .input-file {
    position: fixed;
    right: 100%;
    bottom: 100%;
    opacity: 0;
  }
  #imagePreview {
    img {
      width:30%;
    }
  }
}

.like {
  color:rgb(38,192,251);
}
.noLike {
  color: white;
}

#searchPerson {
  p:first-child {
    width:70%;
    font-weight:bold;
  }
  #testPost {
    display:flex;
    flex-direction: column;
    margin-bottom:30px;
    
    div {
      display: flex;
      margin-bottom:10px;
    }
  } 
  .fa-search {
    background-color:rgb(48,66,96);
    color:white;
    border:1px solid grey;
    border-right:none;
    border-radius:5px 0px 0px 5px;
    padding:6px 10px 6px 10px;
    align-self:center;
  }
  #buttonSearch {
    border-radius:0px 5px 5px 0px;
  }
  button:last-child {
    border-radius:5px;
    width:100px;
  }
}

#searchFirstName, #searchLastName {
    width:100px;
  }

#buttonReturnPost {
  border-radius:5px;
  margin-bottom:20px;
}

#posted {
  width:90%;
  border:1px solid;
  border-radius:10px;
  margin:auto;
  margin-bottom:50px;
}

#posted > div:first-child {
  position:relative;
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
  p {
    display:flex;
    align-items:center;
  }
  div {
    display:flex;
    align-items:center;
  }
  #avatar {
    margin-right:10px;
  }
}

#postContent {
  padding-left:10px;
  p {
    white-space: pre-wrap;
  }
  img {
    margin-top:10px;
    max-width:40%;
  }
}

#icons {
  background-color:rgb(48,66,96);
  border:1px solid;
  color:white;
  font-size:0.8em;
  padding:5px;
  display:flex;
  justify-content:space-around;

  p {
    cursor:pointer;
    margin:0;
  }
}

#comments {
  width:90%;
  padding-top:10px;
  margin:auto;
}

#commentsHead {
  font-style:italic;
  color:rgb(48,66,96);
}

#fullComment > div:first-child{
  display:flex;
  p {
    word-wrap: break-word;
    margin:0;
  }
  .fa-trash {
    margin-top:100%;
    margin-left:90%;
    cursor:pointer;
    color:rgb(48,66,96);
    font-size:0.8em;
  }
}

#commentsText {
  width:80%;
  margin:0px 0px 15px 10px;
  font-size:0.8em;
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

.formComments {
  margin:10px 0px ;
  display:flex;
}

#sendComment {
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

#deletePostBox {
  background-color:rgb(217,217,217);
  position:absolute;
  width:200px;
  top:50%;
  left:50%;
  transform: translate(-50%,-50%);
  border-radius:5px;
  padding:20px;
  p {
    text-align:center;
  }
  div {
    width:100px;
    margin:auto;
    display:flex;
    justify-content:space-between;
  }
  button {
    cursor:pointer;
    border-radius:5px;
  }
}

#deleteCommentBox {
  border:1px solid black;
  width:95%;
  border-radius:5px;
  padding:5px;
  margin-bottom:10px;

  p {
    text-align:center;
    margin:0px 0px 5px 0px;
  }
  div {
    width:100px;
    margin:auto;
    display:flex;
    justify-content:space-between;
  }
  button {
    cursor:pointer;
    border-radius:5px;
  }
}

.labelComment {
  display:none;
}

@media screen and (min-width:736px)  {

  #searchPerson {
    width:70%;
    margin:auto;
}
  
    #searchFirstName, #searchLastName {
    width:250px;
  }
}

@media screen and (min-width:1500px) {

 body {
      background-color:rgb(238,241,247);
  }

  #post, #posted {
    width:40%;
  }

  #searchPerson {
    // border:1px solid red;
    width:40%;
    margin:auto;

    #testPost {
      flex-direction: row;
      &>button {
        height:30px;
      }
    }
    #buttonSearch {
      margin-right:30px;
    }
  }
  #FilteredPost {
    width:40%;
    margin:auto;
}

}

</style>