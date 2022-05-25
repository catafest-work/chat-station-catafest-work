<template>
  <app-header />
    <router-view />
  <app-footer />
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import AppHeader from './components/layouts/AppHeader.vue'
import AppFooter from './components/layouts/AppFooter.vue'

import "../public/assets/css/bootstrap.min.css"
import "../public/assets/js/jquery-3.6.0.js"
//import "../public/assets/js/jquery.min.js"
import "../public/assets/js/bootstrap.min.js"

export default {
  name: 'App',
  components: {
    //HelloWorld
    AppHeader,
    AppFooter
  }
}
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
body {
  margin-top: 0px !important;
}
</style>
