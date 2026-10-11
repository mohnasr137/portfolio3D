const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCopyButton();
  initReveals();
  initCounter();
  window.setTimeout(() => document.getElementById('loadingScreen')?.classList.add('is-hidden'), 450);
});

function initNavigation() {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('.mobile-menu');
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const menuLinks = [...document.querySelectorAll('.mobile-menu a')];

  const toggleMenu = (open) => {
    menu.classList.toggle('is-open', open);
    button.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  button?.addEventListener('click', () => toggleMenu(!menu.classList.contains('is-open')));
  menuLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

  const sections = [...document.querySelectorAll('main section[id]')];
  const updateActiveLink = () => {
    const checkpoint = window.scrollY + window.innerHeight * 0.28;
    let active = 'top';
    sections.forEach((section) => {
      if (section.offsetTop <= checkpoint) active = section.id;
    });
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

function initCopyButton() {
  const button = document.querySelector('[data-copy]');
  const toast = document.getElementById('toast');
  let timer;

  button?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.innerHTML = 'Copied <span aria-hidden="true">✓</span>';
      toast.classList.add('is-visible');
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.innerHTML = 'Copy email <span aria-hidden="true">⧉</span>';
        toast.classList.remove('is-visible');
      }, 2200);
    } catch {
      window.location.href = `mailto:${button.dataset.copy}`;
    }
  });
}

function initReveals() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.project-card, .capability-card, .experience-strip, .contact-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  targets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index * 65, 210)}ms`;
    observer.observe(target);
  });
}

function initCounter() {
  const counter = document.querySelector('[data-count]');
  if (!counter || reduceMotion) return;
  const total = Number(counter.dataset.count);
  const suffix = counter.dataset.suffix || '';
  let started = false;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    const begin = performance.now();
    const duration = 1050;
    const update = (now) => {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      counter.textContent = `${Math.round(total * eased).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, { threshold: 0.6 });
  observer.observe(counter);
}
