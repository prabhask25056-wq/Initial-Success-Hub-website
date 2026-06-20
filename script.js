const form = document.querySelector('#enquiry-form');
const successPanel = document.querySelector('#form-success');
const resetButton = document.querySelector('#reset-form');
const formError = document.querySelector('#form-error');
const submitButton = form.querySelector('[type="submit"]');
const submitButtonContent = submitButton.innerHTML;
const sheetsEndpoint = window.SUCCESS_HUB_CONFIG?.googleSheetsWebAppUrl || '';

const setSubmitting = (isSubmitting) => {
  submitButton.disabled = isSubmitting;
  submitButton.innerHTML = isSubmitting
    ? 'Sending enquiry…'
    : submitButtonContent;
};

const showFormError = (message) => {
  formError.textContent = message;
  formError.hidden = false;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  formError.hidden = true;

  if (!sheetsEndpoint.startsWith('https://script.google.com/macros/s/')) {
    showFormError('Online enquiries are being configured. Please use WhatsApp or call us for immediate assistance.');
    return;
  }

  const fields = new FormData(form);
  if (fields.get('website')) return;

  const payload = {
    studentName: fields.get('studentName')?.toString().trim() || '',
    parentName: fields.get('parentName')?.toString().trim() || '',
    mobile: fields.get('mobile')?.toString().trim() || '',
    email: fields.get('email')?.toString().trim() || '',
    course: fields.get('course')?.toString().trim() || '',
    className: fields.get('className')?.toString().trim() || '',
    message: fields.get('message')?.toString().trim() || '',
  };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  setSubmitting(true);

  try {
    await fetch(sheetsEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    form.hidden = true;
    successPanel.hidden = false;
    successPanel.querySelector('h2').focus();
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The request timed out. Please check your connection and try again.'
      : 'We could not send your enquiry. Please try again or contact us on WhatsApp.';
    showFormError(message);
  } finally {
    window.clearTimeout(timeout);
    setSubmitting(false);
  }
});

resetButton.addEventListener('click', () => {
  form.reset();
  formError.hidden = true;
  successPanel.hidden = true;
  form.hidden = false;
  form.querySelector('input').focus();
});

const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateCounter = (element) => {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  if (reduceMotion) {
    element.textContent = `${target.toLocaleString()}${suffix}`;
    return;
  }

  const start = performance.now();
  const duration = 1100;
  const tick = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.floor(target * eased).toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      updateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.55 });

counters.forEach((counter) => counterObserver.observe(counter));
document.querySelector('#year').textContent = new Date().getFullYear();
