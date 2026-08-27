<template>
  <section class="contact-section">
    <h1 class="section-title">Get In Touch</h1>
    <p class="section-subtitle">Have a project idea or want to collaborate? I'd love to hear from you!</p>

    <form class="contact-form" @submit.prevent="handleSubmit">
      <!-- Title Input -->
      <div class="form-group">
        <label for="title" class="form-label">Subject *</label>
        <input
          id="title"
          v-model="form.msg_title"
          type="text"
          class="form-input"
          placeholder="What's this about?"
          required
        />
      </div>

      <!-- Name Input -->
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input
          id="name"
          v-model="form.sender_name"
          type="text"
          class="form-input"
          placeholder="Your name"
        />
      </div>

      <!-- Email Input -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="form.sender_email"
          type="email"
          class="form-input"
          placeholder="your.email@example.com"
        />
      </div>

      <!-- Message Input -->
      <div class="form-group">
        <label for="message" class="form-label">Message *</label>
        <textarea
          id="message"
          v-model="form.msg_content"
          class="form-textarea"
          placeholder="Tell me about your project or idea..."
          rows="6"
          required
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        <span v-if="!isSubmitting">Send Message</span>
        <span v-else>Sending...</span>
      </button>
    </form>

    <!-- Contact Info -->
    <div class="contact-info">
      <h2 class="info-title">Other Ways to Connect</h2>
      <div class="info-grid">
        <div class="info-item">
          <h3>Email</h3>
          <p><a href="mailto:contact@example.com">contact@example.com</a></p>
        </div>
        <div class="info-item">
          <h3>LinkedIn</h3>
          <p><a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn Profile</a></p>
        </div>
        <div class="info-item">
          <h3>GitHub</h3>
          <p><a href="https://github.com" target="_blank" rel="noopener">GitHub Profile</a></p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { api } from '@/services/api';

const props = defineProps({
  toastRef: Object
});

const form = reactive({
  msg_title: '',
  sender_name: '',
  sender_email: '',
  msg_content: ''
});

const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!form.msg_title || !form.msg_content) {
    props.toastRef?.addToast('Please fill in required fields', 'error', 'Validation Error');
    return;
  }

  try {
    isSubmitting.value = true;
    await api.sendContact(form);
    
    // Reset form
    form.msg_title = '';
    form.sender_name = '';
    form.sender_email = '';
    form.msg_content = '';
    
    props.toastRef?.addToast('Message sent successfully! I\'ll get back to you soon.', 'success', 'Success');
  } catch (error) {
    props.toastRef?.addToast(error.message, 'error', 'Failed to send message');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.contact-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #382e28;
}

[data-theme='dark'] .section-title {
  color: #f0e0d8;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #8b7355;
  margin: 0.5rem 0 0 0;
}

[data-theme='dark'] .section-subtitle {
  color: #d4b5a0;
}

/* Contact Form */
.contact-form {
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.1) 0%, rgba(238, 145, 82, 0.05) 100%);
  border: 1px solid rgba(242, 182, 137, 0.2);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

[data-theme='dark'] .contact-form {
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.05) 0%, rgba(238, 145, 82, 0.02) 100%);
  border-color: rgba(242, 182, 137, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #382e28;
  font-size: 0.95rem;
}

[data-theme='dark'] .form-label {
  color: #f0e0d8;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #d4ccc4;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  color: #382e28;
}

[data-theme='dark'] .form-input,
[data-theme='dark'] .form-textarea {
  background: #1a1a1a;
  border-color: #333;
  color: #f0e0d8;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ee9152;
  box-shadow: 0 0 0 3px rgba(238, 145, 82, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Submit Button */
.submit-btn {
  padding: 0.85rem 2rem;
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(238, 145, 82, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Contact Info */
.contact-info {
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 2rem;
}

[data-theme='dark'] .contact-info {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
}

.info-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #382e28;
}

[data-theme='dark'] .info-title {
  color: #f0e0d8;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.info-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #382e28;
}

[data-theme='dark'] .info-item h3 {
  color: #f0e0d8;
}

.info-item p {
  margin: 0;
}

.info-item a {
  color: #ee9152;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

[data-theme='dark'] .info-item a {
  color: #f2b689;
}

.info-item a:hover {
  text-decoration: underline;
  color: #f2b689;
}

[data-theme='dark'] .info-item a:hover {
  color: #fcc8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-form {
    padding: 1.5rem;
  }

  .contact-info {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>
