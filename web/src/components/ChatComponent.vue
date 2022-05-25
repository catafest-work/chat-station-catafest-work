<template>
  <div class="container">
    <div class="row clearfix">
      <div class="col-lg-12">
        <div class="card chat-app">
          <div class="chat">
            <div class="chat-header clearfix">
              <div class="row">
                <div class="col-lg-6">
                  <a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
                    <img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="avatar">
                  </a>
 
                  <div class="chat-about">
                    <!-- receiver name goes here -->
                  </div>
                </div>
 
                <div class="col-lg-6 hidden-sm text-right text-white">
                  <!-- attachment goes here -->
                </div>
              </div>
            </div>
 
            <div class="chat-history">
              <ul class="m-b-0">
                <!-- all messages gone here -->
              </ul>
            </div>
 
            <div class="chat-message clearfix">
              <div class="input-group mb-0">
                <div class="input-group mb-3">
                  	
                  <input type="text" class="form-control" placeholder="Enter text here..." v-model="message" />
                 	
                  <button class="btn btn-primary" v-on:click="sendMessage" type="button">Send</button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script>
 
  import "../../public/assets/css/chat.css"
  
  import axios from "axios"
  import swal from "sweetalert2"
 
  export default {
    //
    data() {
      return {
        message: "",
        page: 0,
        email: this.$route.params.email,
      }
    },
    methods: {
    sendMessage: async function () {
 
        const formData = new FormData()
        formData.append("email", this.email)
        formData.append("message", this.message)
 
        const response = await axios.post(
            this.$apiURL + "/chat/send",
            formData,
            {
                headers: this.$headers
            }
        )
        console.log(response)
 
        if (response.data.status == "success") {
            this.message = ""
        } else {
            swal.fire("Error", response.data.message, "error")
        }
    },
    },
  }
</script>