<template>
  <div v-if="visible && content" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-secondary p-6 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[80vh] overflow-y-auto border-2 border-brown">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-2xl font-bold">{{contentTitle}}</h3>
        <button
            @click="close"
            class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
      </div>

      <!-- Iterate through the array of content items -->
      <div class="space-y-6">
        <div v-for="(item, index) in content" :key="index" class="p-4 border border-brown rounded-lg">
          <h4 class="text-xl font-semibold mb-2">{{ item.name }}</h4>
          <p class="text-black-300 mb-3">{{ item.description }}</p>
          <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              class="inline-block underline px-4 py-2 hover:bg-brown transition-colors rounded-md"
          >
            {{ item.linkText || 'Learn More' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  content: {
    type: Array,
    default: () => [] // Expecting an array
  },
  contentTitle:{
    type: String,
    default: "Category"
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>