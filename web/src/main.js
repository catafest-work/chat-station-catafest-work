import { createApp } from 'vue'
import App from './App.vue'

// import vue-router 
import {createRouter, createWebHistory} from 'vue-router'

// import the register componnet 
import RegisterComponent from './components/RegisterComponent.vue'
// import the login component 
import LoginComponent from './components/LoginComponent.vue'

import HomeComponent from './components/HomeComponent.vue'

import AddContactComponent from './components/AddContactComponent.vue'

// define some routes 
// each route should map to a component 
// components need to be added to the routes ...
const routes = [
  { path: '/register', component: RegisterComponent },
  { path: '/login', component: LoginComponent },
  { path: '/', component: HomeComponent },
  { path: '/contacts/add', component: AddContactComponent },
];

// Create the router instance and pass the `routes` option 
// You can pass in additional options here, this example is simple way 
const router = createRouter({
  // Provide the history implementation to use. 
  // I used the hash history for simplicity here. 
  history: createWebHistory(),
  routes, // short for `routes: routes`
})

//createApp(App).mount('#app')

const app = createApp(App);
app.use(router);

// this holds value from frontend mainURL and another variables named apiURL
app.config.globalProperties.$mainURL = "http://localhost:8080"
app.config.globalProperties.$apiURL = "http://localhost:3000"
// set token for login process 
app.config.globalProperties.$accessTokenKey = "accessTokenKey"
// variable for the object logged user 
app.config.globalProperties.$user = null;
app.config.globalProperties.$login = false;
app.config.globalProperties.$headers = {
  'Content-Type': 'application/json', 
  'Authorization': 'Bearer ' + localStorage.getItem("accessTokenKey")
  };

app.mount('#app')

