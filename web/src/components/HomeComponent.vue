<template>
<div>
  <div class="container">
    <div class="row">
      <div class="offset-md-10 col-md-2">
        <router-link class="btn btn-primary" to="/contacts/add">Add Contacts</router-link>
      </div>
    </div>
  </div>
  <ContactComponent />
  </div>
</template>

<script>
  import ContactComponent from "./ContactComponent.vue"

  export default {
    //
    components: {
      ContactComponent
    }    
  }

</script>