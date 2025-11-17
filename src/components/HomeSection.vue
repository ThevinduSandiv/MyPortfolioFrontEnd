<template>
  <section class="flex flex-col items-start bg-primary pl-7 pt-5 w-full h-full gap-16">

    <div>
      <p class="text-3xl font-bold">Thevindu Hennayake - Software Engineer & Developer</p>
      <p class="pl-2 text-xl"> Java | C | Python</p>
    </div>

    <div class="flex flex-col w-full gap-3">
      <p class="text-xl"> Top Projects</p>
      <div class="h-[3px] bg-[var(--btn-title)] w-[90%]"></div>

      <div>

        <div v-if="loaded===true" v-for="project in projects">

        </div>

        <div v-else>

        </div>

      </div>

    </div>

  </section>
</template>

<script setup>
import Button from "primevue/button";
import {ref} from "vue";

const loaded = ref(false);
const projects = ref([]);

</script>

<style scoped>

</style>