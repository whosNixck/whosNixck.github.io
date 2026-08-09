document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const langSwitch = document.getElementById('langSwitch');
const langSlider = document.getElementById('langSlider');

// i18n
let translations = {};

function applyLanguage(lang) {
  if (!translations[lang]) return;
  document.documentElement.lang = lang;
  document.title = translations[lang]['meta.title'];
  document.querySelector('meta[name="description"]').setAttribute('content', translations[lang]['meta.description']);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) el.textContent = translations[lang][key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (translations[lang][key] !== undefined) el.innerHTML = translations[lang][key];
  });
  navToggle.setAttribute('aria-label', translations[lang]['nav.menuButtonAria']);
  langSwitch.setAttribute('aria-label', translations[lang]['nav.languageSwitchAria']);
  langSwitch.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  langSlider.style.transform = lang === 'en' ? 'translateX(32px)' : 'translateX(0)';
  localStorage.setItem('lang', lang);
}

langSwitch.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
});

fetch('translations.json')
  .then(res => res.json())
  .then(data => {
    translations = data;
    const savedLang = localStorage.getItem('lang') || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'de');
    applyLanguage(savedLang);
  })
  .catch(err => console.error('Could not load translations.json', err));

// Header scroll state
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// Mobile nav toggle
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal, .tl-item');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Skill bar fill animation
const skillEls = document.querySelectorAll('.skill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const level = entry.target.getAttribute('data-level');
      entry.target.querySelector('.bar-fill').style.width = level + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
skillEls.forEach(el => skillObserver.observe(el));

// Timeline progress line follows scroll
const timelineList = document.getElementById('timelineList');
const timelineProgress = document.getElementById('timelineProgress');
function updateTimelineProgress() {
  const rect = timelineList.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height;
  const visible = Math.min(Math.max(vh * 0.7 - rect.top, 0), total);
  const pct = total > 0 ? (visible / total) * 100 : 0;
  timelineProgress.style.height = pct + '%';
}
window.addEventListener('scroll', updateTimelineProgress);
window.addEventListener('resize', updateTimelineProgress);
updateTimelineProgress();

// Card cursor-follow glow
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});

// Smooth-scroll anchor offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});
