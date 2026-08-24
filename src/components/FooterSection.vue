<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="copyright">© 2025 Thevindu Hennayake</p>
      <div class="social-links">
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.url"
          :title="social.name"
          class="social-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span :class="`icon-${social.icon}`">{{ social.symbol }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const socials = ref([
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/thevindu-hennayake-973913254',
    icon: 'linkedin',
    symbol: 'in'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/ThevinduSandiv',
    icon: 'github',
    symbol: '⚙️'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61553614838631',
    icon: 'facebook',
    symbol: 'f'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/thevindusandiv',
    icon: 'instagram',
    symbol: '📷'
  }
]);
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #f9e9d9 0%, #fcf6ef 100%);
  border-top: 2px solid #d4ccc4;
  padding: 1.5rem 2rem;
  margin-top: auto;
}

[data-theme='dark'] .footer {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border-top-color: #333;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.copyright {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 0;
}

[data-theme='dark'] .copyright {
  color: #a08070;
}

.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid #382e28;
  color: #382e28;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

[data-theme='dark'] .social-btn {
  border-color: #f0e0d8;
  color: #f0e0d8;
}

.social-btn:hover {
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  border-color: #ee9152;
  color: white;
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }
  .copyright {
    font-size: 0.8rem;
    order: 2;
  }
  .social-links {
    order: 1;
  }
}
</style>
