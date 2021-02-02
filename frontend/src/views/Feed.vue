<template>
  <body class="feed">
    <Nav :isConnected="true"/>
      <h1>Here is the feed</h1>
  </body>
</template>

<script>
import Nav from '../components/Nav.vue'

  export default
  {
    name: 'Feed',
    components:
    {
      Nav
    }
  }
</script>