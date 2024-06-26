<script setup>
import { ref } from "vue";
import VueVersion from "./component/vue/vue-version.vue";

const version = ref("vue");
</script>

<template>
  <div class="pdfAnnotation">
    <iframe
      v-if="version === 'iframe'"
      src="/PDFJsAnnotations/index.html"
      width="100%"
      height="100%"
      frameborder="0"
    ></iframe>
    <VueVersion v-if="version === 'vue'" />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
.pdfAnnotation {
  width: 100%;
  height: 98vh;
}
</style>
