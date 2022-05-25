<template>
  <div class="container" style="margin-top: 50px;">
    <div class="row">
      <div class="offset-md-3 col-md-6">
        <form method="POST" v-on:submit.prevent="doLogin">
          <div class="form-group">
            <label class="text-white">Enter mail</label>
            <input type="email" class="form-control" name="email"/>
          </div>
          <br>
          <div class="form-group">
            <label class="text-white">Enter password</label>
            <input type="password" class="form-control" name="password" />
          </div>
          <br>
          <input type="submit" v-bind:value="isLoading ? 'Loading...' : 'Login'" v-bind:disabled="isLoading" name="submit" class="btn btn-primary" />
        </form>
      </div>
    </div>
  </div>
</template>
<script>
  import axios from "axios"
  import swal from "sweetalert2"

  export default {
    data() {
      return {
        "isLoading": false
      };
    },
    methods: {
      // fix for 'event' is deprecated.
      doLogin: async function (event) {
        const self = this
        const form = event.target
        const formData = new FormData(form)

        this.isLoading = true

        const response = await axios.post(
          this.$apiURL + "/login",
          formData
        );
        if (response.data.status == "success") {
          // get access token from server 
          var accessToken = response.data.accessToken;
          // save in the local storage 
          localStorage.setItem(this.$accessTokenKey, accessToken);

          setTimeout(function () {
            window.location.href = "/"
          }, 500);
        // form need to be reset , see also the RegisterComponent
        form.reset();
        } else {
          // in this case will set false and send a message 
          this.isLoading = false;
          swal.fire("Error", response.data.message, "error");
        }
      }
    }
  }
</script>