const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const interestDialog = document.querySelector('#interest-dialog');
const interestForm = document.querySelector('#interest-form');
const quickForm = document.querySelector('#quick-interest-form');

const toggleMenu = (force) => {
  const isOpen = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', isOpen);
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  header.classList.toggle('menu-open', isOpen);
  document.body.classList.toggle('menu-locked', isOpen);
};

menuButton.addEventListener('click', () => toggleMenu());
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

const syncInterest = (source) => {
  if (!source || !interestForm) return;
  ['email', 'interest'].forEach((name) => {
    const from = source.querySelector(`[name="${name}"]`);
    const to = interestForm.querySelector(`[name="${name}"]`);
    if (from?.value && to) to.value = from.value;
  });
};

const openInterest = (sourceForm, presetInterest) => {
  toggleMenu(false);
  syncInterest(sourceForm);
  if (presetInterest) interestForm.elements.interest.value = presetInterest;
  interestDialog.showModal();
  window.setTimeout(() => interestDialog.querySelector('input, button')?.focus(), 30);
};

document.querySelectorAll('.js-open-interest').forEach((button) => {
  button.addEventListener('click', () => openInterest(null, button.dataset.interest));
});

quickForm.addEventListener('submit', (event) => {
  event.preventDefault();
  openInterest(quickForm);
});

interestDialog.querySelector('.dialog-close').addEventListener('click', () => interestDialog.close());
interestDialog.querySelector('.dialog-done').addEventListener('click', () => interestDialog.close());
interestDialog.addEventListener('click', (event) => {
  const rect = interestDialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) interestDialog.close();
});

interestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = interestForm.querySelector('[type="submit"]');
  const status = interestForm.querySelector('.form-status');
  const formData = new FormData(interestForm);

  submitButton.disabled = true;
  status.textContent = '';

  try {
    const demoEntries = JSON.parse(localStorage.getItem('aprel-interest-demo') || '[]');
    demoEntries.push({
      email: formData.get('email'),
      interest: formData.get('interest'),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('aprel-interest-demo', JSON.stringify(demoEntries));
    await new Promise((resolve) => window.setTimeout(resolve, 350));

    interestForm.hidden = true;
    interestDialog.querySelector('.dialog-intro').hidden = true;
    interestDialog.querySelector('.dialog-success').hidden = false;
  } catch (error) {
    status.textContent = 'Не получилось записать почту. Попробуйте ещё раз.';
  } finally {
    submitButton.disabled = false;
  }
});

interestDialog.addEventListener('close', () => {
  window.setTimeout(() => {
    interestForm.hidden = false;
    interestDialog.querySelector('.dialog-intro').hidden = false;
    interestDialog.querySelector('.dialog-success').hidden = true;
    interestForm.reset();
    interestForm.querySelector('.form-status').textContent = '';
  }, 250);
});

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('.event button').forEach((button) => {
  button.addEventListener('click', () => {
    openInterest(null, 'events');
  });
});
