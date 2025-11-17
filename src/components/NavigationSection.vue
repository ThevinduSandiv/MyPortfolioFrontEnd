<template>
  <section class="flex flex-row justify-between bg-secondary p-2 w-full border-2 border-brown">

    <div class="flex flex-row gap-2">
      <Button
          v-for="page in pages"
          :key="page.id"
          :label="page.label"
          :style="{ backgroundColor: 'var(--btn-title)'}"
          class="zoom-hover !border-none !text-white"
          :class="{ 'active-page': selectedPage?.id === page.id }"
          @click="selectPage(page)"
      />
    </div>

    <div class="flex flex-row gap-2">
      <Button
          v-for="page in specialPages"
          :key="page.id"
          :label="page.label"
          :style="{ backgroundColor: 'var(--btn-title)'}"
          class="zoom-hover !border-none !text-white !italic"
          :class="{ 'active-page': selectedPage?.id === page.id }"
          @click="selectPage(page)"
      />
    </div>
  </section>
</template>

<script setup>
import Button from "primevue/button";
import {onMounted, ref, watch} from "vue";

// Define props to receive pages array from parent
const props = defineProps({

  selectedPage: {
    type: Object,
    required: false,
    default: null
  },

  pages: {
    type: Array,
    required: true,
    default: () => []
  },

  specialPages: {
    type: Array,
    required: true,
    default: () => []
  },
});



// Define emit for the selected page
const emit = defineEmits(['pageSelected']);
const selectedPage = ref(props.selectedPage || props.pages[0]);

watch(() => props.selectedPage, (newPage) => {
  if (newPage) {
    selectedPage.value = newPage;
  }
});

// Method to handle page selection
const selectPage = (page) => {
  selectedPage.value = page;
  emit('pageSelected', page);
};
</script>

<style scoped>
.active-page {
  background-color: var(--btn-active) !important;
  color: var(--btn-primary-text) !important;
  border-color: var(--btn-primary) !important;
}

</style>
