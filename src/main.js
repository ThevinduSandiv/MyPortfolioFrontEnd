import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import {StyleClass} from "primevue";
import Skeleton from 'primevue/skeleton'
import 'primeicons/primeicons.css';



const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.component('Skeleton', Skeleton)
app.directive('styleclass', StyleClass)
app.mount('#app')
