<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">Thevindu Hennayake</h3>
        <p class="footer-subtitle">Software Engineer & Developer</p>
      </div>

      <div class="footer-section">
        <h4 class="footer-heading">Quick Links</h4>
        <nav class="footer-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>

      <div class="footer-section">
        <h4 class="footer-heading">Connect</h4>
        <div class="social-links">
          <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-link linkedin" title="LinkedIn">
            in
          </a>
          <a href="https://github.com" target="_blank" rel="noopener" class="social-link github" title="GitHub">
            ⚙️
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener" class="social-link twitter" title="Twitter">
            𝕏
          </a>
          <a href="mailto:contact@example.com" class="social-link email" title="Email">
            ✉️
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">
        © {{ currentYear }} Thevindu Hennayake. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.footer {
  background: #f9e9d9;
  border-top: 2px solid #d4ccc4;
  margin-top: auto;
}

[data-theme='dark'] .footer {
  background: #1a1a1a;
  border-top-color: #333;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: #382e28;
}

[data-theme='dark'] .footer-title {
  color: #f0e0d8;
}

.footer-subtitle {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 0;
}

[data-theme='dark'] .footer-subtitle {
  color: #d4b5a0;
}

.footer-heading {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: #382e28;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

[data-theme='dark'] .footer-heading {
  color: #f0e0d8;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-nav a {
  color: #8b7355;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

[data-theme='dark'] .footer-nav a {
  color: #d4b5a0;
}

.footer-nav a:hover {
  color: #ee9152;
  padding-left: 0.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.social-link.linkedin {
  background: #0A66C2;
}

.social-link.github {
  background: #333;
}

[data-theme='dark'] .social-link.github {
  background: #f0e0d8;
  color: #382e28;
}

.social-link.twitter {
  background: #000;
}

.social-link.email {
  background: #ee9152;
}

.social-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.footer-bottom {
  background: rgba(0, 0, 0, 0.03);
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid #d4ccc4;
}

[data-theme='dark'] .footer-bottom {
  background: rgba(0, 0, 0, 0.3);
  border-top-color: #333;
}

.copyright {
  font-size: 0.85rem;
  color: #8b7355;
  margin: 0;
}

[data-theme='dark'] .copyright {
  color: #a08070;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
    gap: 1.5rem;
  }

  .footer-bottom {
    padding: 1rem 1.5rem;
  }
}
</style>
