<template>
  <section class="contact-section">
    <h1 class="section-title">Get In Touch</h1>
    <p class="section-subtitle">Have a project in mind or just want to chat? Feel free to reach out!</p>

    <div class="contact-container">
      <form @submit.prevent="submitForm" class="contact-form">
        <div class="form-group">
          <label for="title">Subject *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="What's this about?"
            required
          />
        </div>

        <div class="form-group">
          <label for="name">Name (Optional)</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Your name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email {{ form.name ? '' : '(Optional if you need a reply)' }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group">
          <label for="message">Message *</label>
          <textarea
            id="message"
            v-model="form.message"
            class="form-textarea"
            placeholder="Tell me what's on your mind..."
            required
          ></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </button>
      </form>

      <!-- Success / Error Message -->
      <div v-if="submitMessage" :class="['submit-message', submitMessage.type]">
        {{ submitMessage.text }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/services/api';

const form = ref({
  title: '',
  name: '',
  email: '',
  message: ''
});

const isSubmitting = ref(false);
const submitMessage = ref(null);

const submitForm = async () => {
  isSubmitting.value = true;
  submitMessage.value = null;

  try {
    await api.sendContactMessage(form.value);
    submitMessage.value = {
      type: 'success',
      text: 'Message sent successfully! I\'ll get back to you soon.'
    };
    // Reset form after successful send
    form.value = { title: '', name: '', email: '', message: '' };
  } catch (error) {
    // Use the friendly error message from the API service
    submitMessage.value = {
      type: 'error',
      text: error.message
    };
  }

  isSubmitting.value = false;
};
</script>

<style scoped>
.contact-section {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.6s;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } }

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.5rem;
  color: #382e28;
}
[data-theme='dark'] .section-title { color: #f0e0d8; }

.section-subtitle {
  text-align: center;
  font-size: 1rem;
  color: #8b7355;
  margin: 0 0 2rem;
}
[data-theme='dark'] .section-subtitle { color: #a08070; }

.contact-container {
  background: linear-gradient(135deg, #fff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
[data-theme='dark'] .contact-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #382e28;
  font-size: 0.95rem;
}
[data-theme='dark'] .form-group label { color: #f0e0d8; }

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #d4ccc4;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  background: white;
  color: #382e28;
  transition: all 0.3s;
}
[data-theme='dark'] .form-input,
[data-theme='dark'] .form-textarea {
  background: #242424;
  color: #e0e0e0;
  border-color: #333;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ee9152;
  box-shadow: 0 0 0 3px rgba(238,145,82,0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  padding: 0.9rem 2rem;
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(238,145,82,0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-message {
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  animation: slideIn 0.3s;
}

@keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } }

.submit-message.success {
  background: rgba(16,185,129,0.2);
  color: #10b981;
  border: 1px solid #10b981;
}

.submit-message.error {
  background: rgba(239,68,68,0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
}

@media (max-width: 768px) {
  .contact-container {
    padding: 1.5rem 1rem;
  }
  .section-title {
    font-size: 1.5rem;
  }
}
</style>