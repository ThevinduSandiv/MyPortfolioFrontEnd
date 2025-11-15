<template>
  <div class="p-4 bg-white">
    <h2>PrimeVue Test Page</h2>

    <!-- Buttons -->
    <div class="mb-4">
      <Button label="Primary" class="p-button-primary mr-2" />
      <Button label="Secondary" class="p-button-secondary mr-2" />
      <Button label="Success" class="p-button-success mr-2" />
    </div>

    <!-- Input -->
    <div class="mb-4">
      <InputText v-model="textValue" placeholder="Type something..." />
      <p>Value: {{ textValue }}</p>
    </div>

    <!-- Checkbox -->
    <div class="mb-4">
      <Checkbox v-model="checked" :binary="true" />
      <label class="ml-2">Checkbox: {{ checked }}</label>
    </div>

    <!-- Dropdown -->
    <div class="mb-4">
      <Dropdown
          v-model="selectedCity"
          :options="cities"
          optionLabel="name"
          placeholder="Select a City"
      />
      <p>Selected: {{ selectedCity }}</p>
    </div>

    <!-- Grid Test -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-green-400 p-4 rounded text-white text-center">1</div>
      <div class="bg-yellow-400 p-4 rounded text-white text-center">2</div>
      <div class="bg-blue-400 p-4 rounded text-white text-center">3</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';

const textValue = ref('');
const checked = ref(false);
const selectedCity = ref(null);
const cities = ref([
  { name: 'New York', code: 'NY' },
  { name: 'London', code: 'LDN' },
  { name: 'Paris', code: 'PRS' }
]);
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
