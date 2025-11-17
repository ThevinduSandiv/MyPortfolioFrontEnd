<template>
  <section class="flex flex-row justify-between items-center bg-secondary p-2 w-full border-2 border-brown">

    <p>️© 2025 Thevindu Hennayake </p>

    <div class="flex flex-row gap-2">
      <Button
        label="LinkedIn"
        icon="pi pi-linkedin"
        class="zoom-hover !border-none !bg-transparent"
        @click="openLink('http://www.linkedin.com/in/thevindu-hennayake-973913254')"
        />

      <Button
          label="GitHub"
          icon="pi pi-github"
          class="zoom-hover !border-none !bg-transparent"
          @click="openLink('https://github.com/ThevinduSandiv')"
      />

      <Button
          label="Facebook"
          icon="pi pi-facebook"
          class="zoom-hover !border-none !bg-transparent"
          @click="openLink('https://www.facebook.com/profile.php?id=61553614838631')"
      />

      <Button
          label="Instagram"
          icon="pi pi-instagram"
          class="zoom-hover !border-none !bg-transparent"
          @click="openLink('https://www.instagram.com/thevindusandiv')"
      />
    </div>


  </section>
</template>

<script setup>
import Button from "primevue/button";
import {ref} from "vue";

const openLink = (url) => {
  window.open(url, '_blank');
};

</script>

<style scoped>

</style>