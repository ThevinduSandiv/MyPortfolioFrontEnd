<template>
  <section class="flex flex-col items-start bg-primary pl-7 py-5 w-full h-full gap-16">

    <div>
      <p class="text-3xl font-bold">Thevindu Hennayake - Software Engineer & Developer</p>
      <p class="zoom pl-2 text-xl">{{skillStr}}</p>
    </div>

    <div class="flex flex-col h-[50%] w-full gap-3">
      <p class="text-xl"> Top Projects</p>
      <div class="h-[3px] bg-[var(--btn-title)] w-[90%]"></div>

      <div class="h-full w-full flex flex-col md:flex-row gap-5 items-center">

        <card
            v-if="projectsLoaded === true"
            v-for="project in projects"
            class="zoom-hover h-full w-[80%] md:w-[20%] flex items-center justify-center bg-secondary p-2 border-2 border-brown rounded-lg"
            @click="openProject(project.id)"
        >

          <p>{{ project.name }}</p>

        </card>

        <div v-else v-for="n in 3" :key="n" class="h-full w-[20%] skeleton-wave bg-gray-500 rounded overflow-hidden relative">
        </div>

        <Button
            v-if="projectsLoaded === false || projects.length > 0"
            icon="pi pi-chevron-right"
            class="zoom-hover md:ms-24 p-button-rounded p-button-text !bg-[var(--btn-primary)] !text-[var(--btn-title)]"
            @click="viewAllProjects"
        />

        <p v-else class="px-24 py-5 text-gray-400"> No Projects Found </p>

      </div>

    </div>

    <div class="flex flex-col h-fit w-full gap-3">
      <p class="text-xl"> Recent Achievements </p>
      <div class="h-[3px] bg-[var(--btn-title)] w-[90%]"></div>

      <div class="h-auto w-full flex flex-col md:flex-row gap-5 items-center">

        <card
            v-if="achievementsLoaded === true"
            v-for="achievement in achievements"
            class="zoom-hover h-full w-[20%] flex items-center justify-center bg-secondary p-2 border-2 border-brown rounded-lg"
            @click="openAchievement()"
        >


        </card>

        <div v-else v-for="n in 3" :key="n" class="h-full w-[20%] skeleton-wave bg-gray-500 rounded overflow-hidden relative">
        </div>

        <Button
            v-if="achievementsLoaded === false || achievements.length > 0"
            icon="pi pi-chevron-right"
            class="zoom-hover md:ms-24 p-button-rounded p-button-text !bg-[var(--btn-primary)] !text-[var(--btn-title)]"
            @click="viewAllAchievements"
        />

        <p v-else class="px-24 py-5 text-gray-400"> No Achievements Found </p>

      </div>

    </div>

  </section>
</template>

<script setup>
import Button from "primevue/button";
import {onMounted, ref} from "vue";
import Skeleton from "primevue/skeleton";

onMounted(() => {
  skillStr.value = topSkills.value.join(" | ");
})
const emit = defineEmits(['pageSelected']);

const projectsLoaded = ref(true);
const achievementsLoaded = ref(true);
const topSkills = ref(["Java", "C", "Python"]);
const skillStr = ref("");
const projects = ref([
  {
    id: 1,
    name: "OASIS Side-Navigation",
    description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
    technologies: ["Vue.js", "PrimeVue", "PrimeBlocks", "Tailwind CSS"]
  },
  {
    id: 2,
    name: "Tourism Web Application",
    description: "Contributed to developing a tourism web application using Vue and Tailwind CSS.",
    technologies: ["Vue", ".NET", "Tailwind CSS"]
  },
  {
    id: 3,
    name: "Bit About Me Project",
    description: "A web application that displays can obtain personal information about the user and store them in firebase database.",
    technologies: ["Vue", ".NET", "Tailwind CSS"]
  }
]);
const achievements = ref([]);



function viewAllProjects() {
  emit('pageSelected', new Object({ id: 3, label: "Projects" }));
}

function viewAllAchievements() {

}

function openProject(projectId) {

}

function openAchievement() {

}


</script>

<style scoped>

.skeleton-wave {
  background: linear-gradient(
      90deg,
      #b0b0b0 0%,
      #c0c0c0 20%,
      #d0d0d0 40%,
      #c0c0c0 60%,
      #b0b0b0 100%
  );
  background-size: 200% 100%;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

</style>