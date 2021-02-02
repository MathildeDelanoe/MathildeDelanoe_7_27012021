<template>
  <body class="profile">
    <Nav :isConnected="true"/>
      <div id="identity">
        <h1> Mon profil</h1>
        <div id="profile">
          <div>
            <p> Nom : </p>
            <p> Prénom : </p>
            <p> Poste occupé : </p>
            <p> Equipe : </p>
            <p> Mot de passe : changer le mot de passe</p>
            <p> Supprimer le compte </p>
          </div>
          <div id=picture>
            <p>Photo de profil</p>
          </div>  
        </div>
      </div>
  </body>
</template>

<script>
import Nav from '../components/Nav.vue'

  export default
  {
    name: 'Profile',
    components:
    {
      Nav
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

  #profile {
    display:flex;
    flex-direction:column-reverse;

  #picture {
    border:1px solid cyan;
    width:25%;
    border-radius:50%;
    align-self:center;
  }

  }

  @media screen and (min-width:768px) {
    #identity {
      padding:5px 20px 20px;
      margin-top:100px;
      width:40%;
      margin:100px auto;

      #profile {
        flex-direction:row;
        justify-content:space-between;
        // border:1px solid red;
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
    }
  }
</style>