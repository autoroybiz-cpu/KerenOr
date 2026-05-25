/* ===================================================
   קרן של אור — Script
   =================================================== */

const WEBHOOK_URL = "https://hook.eu1.make.com/m3o16pix4cibjdmtvqw579qw4q8hy2vo";

/* ---- NAVBAR ---- */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburgerBtn');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ---- REVEAL ON SCROLL ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- GALLERY LABELS on mobile (always visible) ---- */
if (window.innerWidth <= 640) {
  document.querySelectorAll('.gallery-label').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ---- FORM VALIDATION ---- */
function digitsOnly(v) { return v.replace(/\D/g, ''); }
function phoneOk(v)    { return digitsOnly(v).length >= 9; }

function setError(inputId, errorId, msg) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  inp.classList.add('error');
  err.textContent = msg;
}
function clearError(inputId, errorId) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  inp.classList.remove('error');
  err.textContent = '';
}

document.getElementById('fullName').addEventListener('blur', function () {
  if (!this.value.trim()) setError('fullName', 'nameError', 'שם מלא הוא שדה חובה');
  else clearError('fullName', 'nameError');
});
document.getElementById('phone').addEventListener('blur', function () {
  if (!this.value.trim())    setError('phone', 'phoneError', 'מספר טלפון הוא שדה חובה');
  else if (!phoneOk(this.value)) setError('phone', 'phoneError', 'מספר טלפון חייב להכיל לפחות 9 ספרות');
  else clearError('phone', 'phoneError');
});

/* ---- FORM SUBMIT ---- */
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const feedback  = document.getElementById('formMessage');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const message  = document.getElementById('message').value.trim();

  feedback.className = 'form-feedback';
  feedback.textContent = '';

  let valid = true;

  if (!fullName) { setError('fullName', 'nameError', 'שם מלא הוא שדה חובה'); valid = false; }
  else clearError('fullName', 'nameError');

  if (!phone) {
    setError('phone', 'phoneError', 'מספר טלפון הוא שדה חובה'); valid = false;
  } else if (!phoneOk(phone)) {
    setError('phone', 'phoneError', 'מספר טלפון חייב להכיל לפחות 9 ספרות'); valid = false;
  } else {
    clearError('phone', 'phoneError');
  }

  if (!valid) return;

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName, phone, message,
        source:    'קרן של אור - דף נחיתה',
        timestamp: new Date().toISOString()
      })
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    feedback.textContent = 'תודה, הפרטים נשלחו בהצלחה. קרן תחזור אליכם בהקדם.';
    feedback.className   = 'form-feedback show-success';
    form.reset();
    clearError('fullName', 'nameError');
    clearError('phone', 'phoneError');

  } catch {
    feedback.textContent = 'משהו השתבש בשליחה. אפשר גם לפנות ישירות בוואטסאפ.';
    feedback.className   = 'form-feedback show-error';
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
