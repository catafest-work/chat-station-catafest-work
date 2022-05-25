<template>
  <footer style="padding: 25px;">
    <div class="container">
      <div class="row">
        <div class="col-md-12 text-center text-white">Copyright {{year}}</div>
      </div>
    </div>
  </footer>
</template>
<script>
  import { computed } from 'vue'
  export default {
    setup() {
      const year = computed(function () {
        return new Date().getFullYear();
      });
      return { year };
    },
  }
</script>