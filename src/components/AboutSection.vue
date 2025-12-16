<template>
  <section class="flex flex-col items-start bg-primary pl-7 py-5 w-full h-full gap-16">

    <div>
      <p class="text-4xl font-bold">Hi, I'm Thevindu</p>
      <p class="zoom pt-2 pl-2 text-xl">{{aboutPara}}</p>
    </div>

    <div class="flex flex-col h-[50%] w-full gap-3">
      <p class="text-xl"> Skills </p>
      <div class="h-[3px] bg-[var(--btn-title)] w-[90%]"></div>

      <div class="h-full w-full flex flex-col md:flex-row gap-5 items-center">

        <card
            v-if="skillsLoaded === true"
            v-for="skillCat in skillCategories"
            class="zoom-hover h-full w-[80%] md:w-[20%] flex items-center justify-center bg-secondary p-2 border-2 border-brown rounded-lg"
            @click="openPopUp(skillCat.name, skillCat.content)"
        >

          <p>{{ skillCat.name }}</p>

        </card>

        <div v-else v-for="n in 3" :key="n" class="h-full w-[20%] skeleton-wave bg-gray-500 rounded overflow-hidden relative">
        </div>

      </div>

    </div>

    <div class="flex flex-col h-[50%] w-full gap-3">
      <p class="text-xl"> Education </p>
      <div class="h-[3px] bg-[var(--btn-title)] w-[90%]"></div>

      <div class="h-full w-full flex flex-col md:flex-row gap-5 items-center">

        <card
            v-if="skillsLoaded === true"
            v-for="skillCat in skillCategories"
            class="zoom-hover h-full w-[80%] md:w-[20%] flex items-center justify-center bg-secondary p-2 border-2 border-brown rounded-lg"
            @click="openPopUp(skillCat.name, skillCat.content)"
        >

          <p>{{ skillCat.name }}</p>

        </card>

        <div v-else v-for="n in 3" :key="n" class="h-full w-[20%] skeleton-wave bg-gray-500 rounded overflow-hidden relative">
        </div>

      </div>

    </div>

    <div class="flex flex-col h-[50%] w-full gap-3">
      <p class="text-xl"> Certifications </p>
      <div class="h-[3px] bg-[var(--btn-title)] w-[90%]"></div>

      <div class="h-full w-full flex flex-col md:flex-row gap-5 items-center">

        <card
            v-if="skillsLoaded === true"
            v-for="skillCat in skillCategories"
            class="zoom-hover h-full w-[80%] md:w-[20%] flex items-center justify-center bg-secondary p-2 border-2 border-brown rounded-lg"
            @click="openPopUp(skillCat.name, skillCat.content)"
        >

          <p>{{ skillCat.name }}</p>

        </card>

        <div v-else v-for="n in 3" :key="n" class="h-full w-[20%] skeleton-wave bg-gray-500 rounded overflow-hidden relative">
        </div>

      </div>

    </div>

    <!-- PopUp Component -->
    <PopUpSection
        :visible="popupVisible"
        :content="popupContent"
        :content-title="popupContentTitle"
        @close="closePopUp"
    />

  </section>
</template>

<script setup>
import Button from "primevue/button";
import {onMounted, ref} from "vue";
import Skeleton from "primevue/skeleton";
import PopUpSection from "@/components/PopUpSection.vue";

const emit = defineEmits(['pageSelected']);

const popupVisible = ref(false);
const popupContent = ref([]);
const popupContentTitle = ref([]);
const aboutPara = ref("I recently graduated with a Bachelor of Computing (Software Engineering) from Curtin University. To broaden my technical perspective, I chose electives in Machine Learning and Machine Perception, complementing my core proficiency in Python, Java, network security, and mobile development. This has given me a practical introduction to AI concepts alongside a robust software engineering skill set. I am eager to apply and expand these skills in a real-world context while also planning to pursue further postgraduate studies to deepen my specialization in the field.")
const skillsLoaded = ref(true);
const skillCategories = ref([
  {
    id: 1,
    name: "Programming Languages",
    content: [
      {
        name: "Vue.js",
        description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
        linkText: "Learn More",
        link: "https://www.curtin.edu.au/"
      },
      {
        name: "Vue.js",
        description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
        linkText: "Learn More",
        link: "https://www.curtin.edu.au/"
      },
      {
        name: "Vue.js",
        description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
        linkText: "Learn More",
        link: "https://www.curtin.edu.au/"
      },
      {
        name: "Vue.js",
        description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
        linkText: "Learn More",
        link: "https://www.curtin.edu.au/"
      },
      {
        name: "Vue.js",
        description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
        linkText: "Learn More",
        link: "https://www.curtin.edu.au/"
      },
      {
        name: "Vue.js",
        description: "Created the side navigation component in a mocked frontend for OASIS - Curtin University",
        linkText: "Learn More",
        link: "https://www.curtin.edu.au/"
      },
    ]
  },
  {
    id: 2,
    name: "Frameworks / Tools",
    description: "Contributed to developing a tourism web application using Vue and Tailwind CSS.",
    technologies: ["Vue", ".NET", "Tailwind CSS"]
  },
  {
    id: 3,
    name: "Concepts Learned",
    description: "A web application that displays can obtain personal information about the user and store them in firebase database.",
    technologies: ["Vue", ".NET", "Tailwind CSS"]
  },
  {
    id: 4,
    name: "Others",
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

function openPopUp(title, content) {
  popupVisible.value = true;
  popupContent.value = content;
  popupContentTitle.value = title;
  // Optional: Prevent body scrolling when popup is open
  document.body.style.overflow = 'hidden';
}

function closePopUp() {
  popupVisible.value = false;
  // Restore body scrolling
  document.body.style.overflow = 'auto';
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