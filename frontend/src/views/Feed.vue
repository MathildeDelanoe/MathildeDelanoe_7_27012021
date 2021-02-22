<template>
  <body class="feed">
    <Nav :isConnected="true" :fullName="userName" :avatar="avatar"/>
    <h1> Bienvenue {{ userName }} !</h1>
    <!-- Représente le bloc de rédaction d'un post -->
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
    <!-- Représente la barre de recherche pour filtrer les posts par employé -->
    <div id="searchPerson">
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
    <!-- Nombre de posts trouvés et retour aux posts -->
    <div id="FilteredPost" v-if="this.isFilteredPostOnGoing">
      <p>{{ this.feedPosts.length }} {{ (this.feedPosts.length > 1)?"posts ont été trouvés":"post a été trouvé" }}.</p>
      <button @click="reloadAllPosts('button')" id="buttonReturnPost">Retour aux posts</button>
    </div>
    <!-- Représente les publications postées -->
    <div id="noPost" v-if="feedPosts.length === 0 && !this.isFilteredPostOnGoing">
      <p>Aucune publication postée!</p>
    </div>
    <div v-else class="posted" v-for="(singlePost, indexPost) in feedPosts" :key="singlePost">
      <div>
        <!-- Les infos des personnes qui ont postés -->
        <div class="person_comments">
          <div>
            <avatar :fullname="singlePost.first_name + ' ' + singlePost.last_name" :image="singlePost.avatar" :size="30" id="avatar"></avatar> <p> {{ singlePost.first_name }} {{ singlePost.last_name }} </p>
          </div>
          <p> {{ singlePost.formatedDate }} </p>
        </div>
        <!-- Le contenu du post -->
        <div class="postContent">
          <img :src="singlePost.picture" alt="picture of a post" v-if="singlePost.picture !== null"/>
          <p>{{ singlePost.text }}</p>
        </div>
        <!-- Représente les différentes icones du post -->
        <div class="icons">
          <p @click="likeMessage(singlePost.id, indexPost)"><font-awesome-icon :icon="['fas', 'thumbs-up']" :class="{'like':this.likedPost.includes(singlePost.id), 'noLike':!this.likedPost.includes(singlePost.id)}"/> {{ singlePost.nbLikes }} </p>
          <p><font-awesome-icon :icon="['fas', 'comment']"/> {{ singlePost.comments.length }} commentaire{{ (singlePost.comments.length > 1)?'s':''}}</p>
          <p v-if="singlePost.employee_id==this.lsEmpId || this.isAdmin===true" @click="setIsDeleteMessageNeeded(singlePost.id, true)"><font-awesome-icon :icon="['fas', 'trash']" /></p>
        </div>
        <!-- Pour supprimer un post -->
        <div class="deletePostBox" v-if="mapDeletedMessage.has(singlePost.id) && mapDeletedMessage.get(singlePost.id)==true">
          <p>Voulez-vous vraiment supprimer votre post?</p>
          <div>
            <button @click="deleteMessage(singlePost.id, indexPost, 'post')">Oui</button>
            <button @click="setIsDeleteMessageNeeded(singlePost.id, false)">Non</button>
          </div>
        </div>
      </div>
      <!-- Représente les commentaires -->
      <div class="comments">
        <!-- Représente les commentaires dejà postés -->
        <div class ="fullComment" v-for="(singleComment, indexComment) in singlePost.comments" :key="singleComment">
          <div>
            <avatar :fullname="singleComment.first_name + ' ' + singleComment.last_name" :image="singleComment.avatar" :size="30" id="avatar"></avatar>
            <div class="commentsText">
              <div class="commentsHead">
                <p>{{ singleComment.first_name + ' ' + singleComment.last_name }} {{ singleComment.formatedDate.toLowerCase() }}</p>
              </div>
              <p>{{ singleComment.text }}</p>
            </div>
            <p v-if="singleComment.employee_id==this.lsEmpId || this.isAdmin===true" @click="setIsDeleteMessageNeeded(singleComment.id, true)"><font-awesome-icon :icon="['fas', 'trash']" /></p>
          </div>
          <!-- Pour supprimer un commentaire -->
          <div class="deleteCommentBox" v-if="mapDeletedMessage.has(singleComment.id) && mapDeletedMessage.get(singleComment.id)==true">
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
            <input id="sendComment" class="inputComment" placeholder="Votre commentaire" /><button @click="this.publishComment(singlePost.id, indexPost)">Envoyer</button>
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
  import io from 'socket.io-client'
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
        mapDeletedMessage : new Map(),
        lsAuth: '',
        lsEmpId: '',
        likedPost: [],
        socket: null
      };
    },
    created()
    {
      // A la création de l'instance, si ce n'est pas déjà fait, on crée une socket pour gérer la mise à jour automatique de changements
      if (this.socket === null)
      {
        // Initialisation de la socket en précisant le domaine du serveur
        this.socket = io('http://localhost:3000', { autoConnect: false });
        this.socket.connect(); // Connexion à la socket
      }
    },
    mounted(){
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

      // Au montage de cette page, on souhaite obtenir les posts et commentaires ainsi que les infos de l'employé
      this.getPosts();
      this.getEmployeeInfo();
      
      // Réception de la socket de changement de like
      this.socket.on('likeSocketBroadcast', likeMessage => {
        for (let post of this.feedPosts) // Parcours de tous les posts
        {
          if (post.id === likeMessage.idPost) // Recherche du post dont le like est modifié
          {
            // Le post à modifier est trouvé. Vérification de l'action à faire
            if (likeMessage.like)
            {
              // Augmentation du nombre de likes pour le post courant
              post.nbLikes++;
            }
            else
            {
              // Diminution du nombre de likes pour le post courant
              post.nbLikes--;
            }
            break;
          }
        }
      });
      // Réception de la socket de suppression d'un commentaire/post
      this.socket.on('deleteSocketBroadcast', deleteMessage => {
        let postIndex = -1;
        let commentIndex = 0;
        let found = false;
        while (found !== true) // Lancement de la recherche du post/commentaire à supprimer
        {
          ++postIndex;
          if (this.feedPosts[postIndex].id === deleteMessage.idMessage)
          {
            // Le post à supprimer est le post courant
            found = true;
          }
          else
          {
            // Le message à supprimer n'est pas le post courant, recherche dans les commentaires du post courant si nécessaire
            if (deleteMessage.isComment)
            {
              commentIndex = 0;
              for (let comment of this.feedPosts[postIndex].comments) // Parcours de tous les commentaires du post courant
              {
                if (comment.id === deleteMessage.idMessage)
                {
                  // Commentaire à supprimer trouvé.
                  found = true;
                  break;
                }
                ++commentIndex;
              }
            }
          }
        }
        if (found) // Si l'élément est trouvé
        {
          // Suppression du commentaire
          if (deleteMessage.isComment)
          {
            this.feedPosts[postIndex].comments.splice(commentIndex, 1);
          }
          else // Suppression du post
          {
            this.feedPosts.splice(postIndex, 1);
          }
        }
      });
      // Réception de la socket de nouveau post
      this.socket.on('newPostSocketBroadcast', newPost => {
        this.feedPosts.unshift(newPost); // Ajout du post au début du tableau de post
      });
      // Réception de la socket de nouveau commentaire
      this.socket.on('newCommentSocketBroadcast', newComment => {
        for (let post of this.feedPosts) // Parcours de tous les posts
        {
          if (post.id === newComment.postId)
          {
            // Ajoute du commentaire à la fin du tableau
            post.comments.push(newComment.comment);
          }
        }
      });
      // Récupération, via socket, d'un changement d'avatar d'un autre employé
      this.socket.on('newAvatarSocketBroadcast', data => {
        if (data.employeeId !== this.lsEmpId)
        {
          // Cette socket est envoyée même à l'employé qui change son avatar. Donc on filtre cette procédure dans ce cas
          for (let post of this.feedPosts) // Parcours des posts
          {
            if (post.employee_id == data.employeeId)
            {
              // Si l'employé propriétaire du post a changé son avatar
              post.avatar = data.avatar;
            }
            for (let comment of post.comments) // Parcours des commentaires
            {
              if (comment.employee_id == data.employeeId)
              {
                // Si l'employé propriétaire du commentaire a changé son avatar
                comment.avatar = data.avatar;
              }
            }
          }
        }
      });
      this.socket.on('deleteAccountSocketBroadcast', data => {
        let indexPost = -1;
        // Parcours du tableau de posts pour supprimer les commentaires et diminuer le nb de likes des posts
        for (let post of this.feedPosts)
        {
          ++indexPost;
          if (data.likedPosts.includes(post.id))
          {
            post.nbLikes--;
          }
          
          let indexCommentaire = -1;
          for (let comment of post.comments) // Parcours du tableau de commentaires du post courante
          {
            ++indexCommentaire;
            if (data.employeeId == comment.employee_id)
            {
              // Ce commentaire a été écrit par l'employé qui a supprimé son compte => Nécessité d'enlever le commentaire à l'index indexCommentaire
              post.comments.splice(indexCommentaire, 1);
            }
          }
        }
        // Parcours des posts pour supprimer les posts écrits par l'employé supprimé
        indexPost = -1;
        for (let post of this.feedPosts)
        {
          ++indexPost;
          if (data.employeeId == post.employee_id)
          {
            // Ce post a été écrit par l'employé qui a supprimé son compte => Nécessité d'enlever le post à l'index indexPost
            this.feedPosts.splice(indexPost, 1);
          }
        }
      });
    },
    beforeUnmount()
    {
      this.socket.close(); // Fermeture de la socket
    },
    methods:
    {
      // Cette fonction sert à afficher une prévisualisation de l'image téléchargée dans le post
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
        image.src = window.URL.createObjectURL(postPicture.files[0]); // Attribution de l'image sélectionnée
        picturePreview.appendChild(image); // L'image est intégrée à la div html
      },
      // Cette fonction asyncrhone permet de récupérer tous les commentaires présents dans la base de données
      async fetchComments(post)
      {
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            },
        };
        // Envoi de la requête via fetch pour récupérer tous les commentaires du post courant
        let jsonResponse = await fetch('http://localhost:3000/api/post/comments/' + post.id, options);
        let commentsTable = await jsonResponse.json();
        // Tous les commentaires sont récupérés et on les ajoute au post courant
        post = {...post, comments: commentsTable.comments};
        // Formattage de l'avatar de l'employé ayant écrit le post provenant de la BDD
        post.avatar = (post.avatar === null)?"": post.avatar;
        for (let comment of post.comments) // Parcours des commentaires du post courant
        {
          // Formattage de l'avatar de l'employé ayant écrit le commentaire courant provenant de la BDD
          comment.avatar = (comment.avatar === null)?"": comment.avatar;
        }
        return post;
      },
      // Cette fonction permet de récupérer tous les posts présents dans la base de données, et leurs commentaires
      getPosts(){
        this.feedPosts.length = 0; // Nécessité de vider le tableau de posts
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
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
          // response contient un tableau de posts
          for (let post of response.posts) // Parcours des posts de la BDD
          {
            // Pour chaque post, récupération des commentaires et attente de la réception de chacun avant de passer au post suivant
            await this.fetchComments(post)
            .then(post => {
              this.feedPosts.push(post); // Ajout du post au tableau de posts
            });
          }
        })
        .catch(error => alert(error));
      },
      // Cette fonction permet de récupérer les informations de l'employé
      getEmployeeInfo(){
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            },
        };
        // Envoi de la requête via fetch pour récupérer les informations de l'employé connecté
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
          this.likedPost.length = 0; // Nettoyage du tableau de post aimé par l'employé
          // Traitement des informations reçus de la bdd et stockage dans l'instance vue
          let employee = response.employee;
          employee.avatar = (employee.avatar === null)?"": employee.avatar; // Si l'avatar issu de la bdd est null, on remplace par une chaîne vide
          this.userName = employee.first_name + " " + employee.last_name; // Création du user name en fonction du prénom et nom
          this.avatar = employee.avatar;
          this.isAdmin = (employee.is_admin.data[0])?true:false; // Création de l'information si l'employé est admin ou non
          for (let likedPost of employee.likedPosts)
          {
            // Remplissage du tableau de posts likés par l'employé
            this.likedPost.push(likedPost.post_id);
          }
        })
        .catch(error => alert(error));
      },
      // Cette fonction gère l'envoi d'un post à la BDD
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
          // Création d'un formData pour encapsuler l'image
          const formData = new FormData();
          formData.append('employeeId', this.lsEmpId);
          formData.append('message', postContent);
          formData.append('picture', formInputs[0].files[0]);
          options = 
          {
              method: 'post',
              headers: {
                'Authorization': 'Bearer ' + this.lsAuth
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
                'Authorization': 'Bearer ' + this.lsAuth
              },
              body: JSON.stringify({  employeeId : this.lsEmpId,
                                      message : postContent }) // Remplissage du body de la requête avec les informations nécessaires
          };
        }
        // Envoi de la requête via fetch pour enregistrer un post
        fetch('http://localhost:3000/api/post/save', options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response =>
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }

          // Création d'un objet contenant le nouveau post
          let newPost = {};
          if (formInputs[0].files.length !== 0)
          {
            // Si le post contient une image
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
            // Si le post ne contient que du texte
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
          newPost.comments = []; // Création d'un tableau vide de commentaires pour ce nouveau post
          this.feedPosts.unshift(newPost); // Ajout du nouveau post au tableau de posts de l'instance Vue
          
          // Emission d'une socket pour prévenir les autres employée de l'arrivée d'un nouveau post
          this.socket.emit('newPostSocketEmit', { ...newPost });
          
          // Suppression des entrées de formulaires
          document.getElementById("newPost").value = ''; // Suppression du contenu du post
          if (formInputs[0].files.length !== 0) // Une image sera envoyée avec le post
          {
            formInputs[0].value = null; // Suppression du contenu de l'image
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

      // Cette fonction gère la modification du like
      likeMessage(postId, indexPost)
      {
        let responseStatus;
        let responseOk;
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            },
            body: JSON.stringify({  employeeId : this.lsEmpId }) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête via fetch pour aimer/désaimer le post
        fetch('http://localhost:3000/api/post/like/'+ postId, options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then ((response)=>
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }
          if (response.like) // Si l'employé aime le post
          {
            // Mise à jour du tableau de like de l'employé courant en rajoutant le post dans le tableau de like
            this.likedPost.push(postId);
            // Mise à jour du nombre de likes du post courant
            this.feedPosts[indexPost].nbLikes++;
          }
          else // Si l'employé n'aime plus le post
          {
            // Mise à jour du tableau de like de l'employé courant en supprimant le post dans le tableau de like
            const index = this.likedPost.indexOf(postId); // Recherche de l'index du tableau où le postId se trouve
            if (index > -1) // Normalement, cette condition est toujours vraie
            {
              this.likedPost.splice(index, 1); // Suppression de ce postID
            }
            // Mise à jour du nombre de likes du post courant
            this.feedPosts[indexPost].nbLikes--;
          }
          // Emission de la socket pour prévenir les autres employés d'un changement de like
          this.socket.emit('likeSocketEmit', {like: response.like, idPost: postId});
        })
        .catch(error => alert(error))
      },

      // Fonction qui met à jour une map indiquant que l'employé veut supprimer un message
      setIsDeleteMessageNeeded(messageId, value)
      {
        if (value === false)
        {
          this.mapDeletedMessage.delete(messageId);
          return;
        }
        this.mapDeletedMessage.set(messageId, value);
      },

      // Cette fonction gère la suppression d'un message, qu'il soit commentaire ou post
      deleteMessage(messageId, indexPost, messageType, indexComment = -1)
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
        // Envoi de la requête via fetch pour supprimer un post/commentaire
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
          this.setIsDeleteMessageNeeded(messageId, false); // Suppression de l'indication que le message doit être supprimé

          
          let isComment = false; // Préparation pour l'émission de la socket
          if (messageType === 'post')
          {
            // Suppression d'un post
            this.feedPosts.splice(indexPost, 1);
          }
          else if (messageType === 'comment')
          {
            // Suppression d'un commentaire
            this.feedPosts[indexPost].comments.splice(indexComment, 1);
            isComment = true;
          }
          else
          {
            alert('Mauvaise valeur de type de message');
          }

          // Envoi d'une socket pour prévenir les autres employés de la suppression d'un message
          this.socket.emit('deleteSocketEmit', { idMessage: messageId, isComment: isComment });
        })
        .catch(error => alert(error))
      },
      // Cette fonction gère la publication d'un commentaire
      publishComment(post_id, post_index)
      {
        let responseStatus;
        let responseOk;
        let commentContent = document.querySelectorAll("form input")[post_index].value;
        // Initialisation des options de la méthode fetch
        let options = 
        {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.lsAuth
            },
            body: JSON.stringify({  employeeId : this.lsEmpId,
                                    message : commentContent,
                                    postId : post_id}) // Remplissage du body de la requête avec les informations nécessaires
        };
        // Envoi de la requête via fetch pour enregistrer un nouveau commentaire
        fetch('http://localhost:3000/api/post/save', options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response =>
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }

          // Nettoyage du formulaire de saisie du commentaire
          document.querySelectorAll("form input")[post_index].value = '';

          // Création de l'objet contenant le nouveau commentaire
          let newComment = {id: response.id,
                            employee_id: this.lsEmpId,
                            first_name: this.userName.split(' ')[0],
                            last_name: this.userName.split(' ')[1],
                            avatar: this.avatar,
                            formatedDate: response.date,
                            text :response.content};
          this.feedPosts[post_index].comments.push(newComment); // Ajout du commentaire au tableau de commentaires du post adéquat

          // Emission de la socket pour prévenir les autres employés de la création d'un nouveau commentaire
          this.socket.emit('newCommentSocketEmit', { postId: post_id, comment: newComment });
        })
        .catch(error => alert(error))
      },
      // Cette fonction gère l'affichage de posts spécifiques. Cette fonction est utilisée lors de l'utilisation du champ de recherche
      printSpecificPosts(option)
      {
        let responseStatus;
        let responseOk;
        // Récupération de l'input html contenant le champ de recherche
        let lastName = document.getElementById("searchLastName").value; // Récupération du nom
        let firstName = document.getElementById("searchFirstName").value; // Récupération du prénom
        // Vérification que les champs de recherche ne sont pas vides
        if (lastName === '' && firstName === '' && option !== 'mine')
        {
          alert('Le champ est vide');
          return;
        }
        if (option === 'mine') // L'employé souhaite voir ses posts
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
              'Authorization': 'Bearer ' + this.lsAuth
            },
        };
        // Envoi de la requête via fetch pour récupérer les posts de l'employé sélectionné
        fetch('http://localhost:3000/api/post/search/' + lastName + '/' + firstName, options)
        .then(response =>
        {
          // Récupération des status de la réponse pour être traités ensuite
          responseStatus = response.status;
          responseOk = response.ok;
          return response.json();
        })
        .then(response => 
        {
          // Gestion et affichage des erreurs
          if (!(responseOk && (responseStatus >= 200 && responseStatus <= 299)))
          {
            throw new Error(CommonFunctions.errorManagement(responseStatus, response.errorMessage));
          }

          if (!this.isFilteredPostOnGoing)
          {
            // S'il n'y a aucun filtre sur les posts appliqués, on stocke les posts actuels pour pouvoir les recharger au moment opportun
            for (let post of this.feedPosts)
            {
              this.historyFeedPosts.push(post);
            }
            // On parcourt la liste des posts id retournées par la requête
            for (let postId of response.postIds)
            {
              for (let post of this.feedPosts) // Parcours des posts actuels
              {
                // On recherche si les posts de l'employé coïncident avec le post courant
                if (post.id === postId.id)
                {
                  this.searchFeedPosts.push(post); // Stockage du post dans le tableau de posts recherchés
                }
              }
            }
          }
          else
          {
            // Si un filtre est déjà présent, nous utilisons le tableau de posts sauvegardés pour la recherche
            for (let postId of response.postIds) // On parcourt la liste des posts id retournées par la requête
            {
              for (let post of this.historyFeedPosts) // Parcours des posts sauvegardés qui correspondent au contenu de la bdd
              {
                // On recherche si les posts de l'employé coïncident avec le post courant
                if (post.id === postId.id)
                {
                  this.searchFeedPosts.push(post); // Stockage du post dans le tableau de posts recherchés
                }
              }
            }
          }

          // Nettoyage du tableau de posts
          this.feedPosts.length = 0;
          // Le tableau de post est rempli avec les posts recherchés
          for (let searchPost of this.searchFeedPosts)
          {
            this.feedPosts.push(searchPost);
          }
          this.searchFeedPosts.length = 0; // Suppression du tableau de recherche une fois que les posts sont chargés
          if (!this.isFilteredPostOnGoing)
          {
            this.isFilteredPostOnGoing = true; // Mise en place du filtre des posts
          }
        })
        .catch(error => alert(error));
      },
      // Cette fonction supprime le filtre des posts en cours
      reloadAllPosts(type = '')
      {
        // Le filtre est supprimé si le champ de recherche est vidé ou si le bouton adéquat est appuyé
        let lastName = document.getElementById("searchLastName").value;
        let firstName = document.getElementById("searchFirstName").value;
        if (type === 'button' || (lastName === '' && firstName === ''))
        {
          this.feedPosts.length = 0; // Nettoyage du tableau de posts
          for (let savedPost of this.historyFeedPosts)
          {
            this.feedPosts.push(savedPost); // Recharge du tableau de posts avec les posts sauvegardés
          }
          this.historyFeedPosts.length = 0; // Nettoyage du tableau des posts sauvegardés
          this.isFilteredPostOnGoing = false; // Fin du filtre des posts
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

#noPost {
  text-align: center;
  font-weight: bold;
  font-size: 2em;
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
  // border:1px solid purple;
  p:first-child {
    width:70%;
    font-weight:bold;
  }
  #testPost {
    display:flex;
    flex-direction: column;
    margin-bottom:30px;
    // border:1px solid green;
    // flex-wrap: wrap;
    
    div {
      width:80%;
      display: flex;
      margin-bottom:10px;
    }
    &>button{
      // width:15%;
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
    width:40%;
    // border:1px solid
  }

#buttonReturnPost {
  border-radius:5px;
  margin-bottom:20px;
}

.posted {
  width:90%;
  border:1px solid;
  border-radius:10px;
  margin:auto;
  margin-bottom:50px;
  &> div:first-child {
    position:relative;
  }
}

.person_comments {
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

.postContent {
  padding-left:10px;
  p {
    white-space: pre-wrap;
  }
  img {
    margin-top:10px;
    max-width:40%;
  }
}

.icons {
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

.comments {
  width:90%;
  padding-top:10px;
  margin:auto;
}

.commentsHead {
  font-style:italic;
  color:rgb(48,66,96);
}

.fullComment > div:first-child{
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

.commentsText {
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

// #sendComment {
//   border-radius:5px 0px 0px 5px;
//   padding:5px;
//   margin-left:5px;
//   width:80%;
// }

.inputComment {
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

.deletePostBox {
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

.deleteCommentBox {
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

@media screen and (min-width:736px) {

  #searchPerson {
    width:90%;
    margin:auto;
}
}

@media screen and (min-width:1500px) {

 body {
      background-color:rgb(238,241,247);
  }

  #post, .posted {
    width:40%;
  }

  #searchPerson {
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