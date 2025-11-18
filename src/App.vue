<template>
  <div class="min-h-screen flex flex-col bg-white">
    <div class="flex flex-row bg-primary justify-between p-3 border-2 border-brown">
      <Button
          v-if="isMobile === true"
          :icon="menuShown ? 'pi pi-times' : 'pi pi-bars'"
          class="zoom-hover p-button-rounded p-button-text !bg-[var(--btn-primary)] !text-[var(--btn-title)]"
          @click="toggleMenu"
      />
      <p class="text-2xl"> Thevindu Hennayake </p>
      <ThemeToggle/>
    </div>

    <NavigationSection
        v-if="isMobile === false || menuShown === true"
        :selectedPage="selectedPage"
        :pages="pages"
        :specialPages="specialPages"
        @pageSelected="handlePageSelection"
        :class="[
            isMobile ? 'absolute top-14 left-0 right-0 h-[90vw] w-fit bg-primary z-50' : ''
          ]"
    />


    <div class="flex-1 flex flex-col min-h-0">
      <component :is="currentComponent"
                 class="flex-1"
                 @pageSelected="handlePageSelection"
      />
    </div>


    <FooterSection/>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import ThemeToggle from "@/components/ThemeToggle.vue";
import NavigationSection from "@/components/NavigationSection.vue";
import FooterSection from "@/components/FooterSection.vue";

import ComingSoon from "@/components/ComingSoon.vue";
import Home from "@/components/HomeSection.vue";
import Button from "primevue/button";

const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

const menuShown = ref(false);


const pages = [
  { id: 1, label: "Home" },
  { id: 2, label: "About" },
  { id: 3, label: "Projects" },
  { id: 4, label: "Experience" },
  { id: 5, label: "Contact" }
];

const specialPages = [
  { id: 6, label: "Aviation Adventure" }
];

const selectedPage = ref(pages[0]);

const handlePageSelection = (page) => {
  selectedPage.value = page;
};

const currentComponent = computed(() => {
  if (!selectedPage.value) return ComingSoon;

  switch (selectedPage.value.label) {
    case "Home":
      return Home;
    case "About":
      return ComingSoon;
    case "Projects":
      return ComingSoon;
    case "Experience":
      return ComingSoon;
    case "Contact":
      return ComingSoon;
    case "Aviation Adventure":
      return ComingSoon;
    default:
      return ComingSoon;
  }
});

function toggleMenu()
{
  menuShown.value = !menuShown.value;
}
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
