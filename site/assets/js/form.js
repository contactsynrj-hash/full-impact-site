(() => {
  'use strict';

  const config = window.FULL_IMPACT_CONFIG || {};
  const forms = document.querySelectorAll('[data-full-impact-form]');
  if (!forms.length) return;

  const params = new URLSearchParams(window.location.search);
  const utmFields = ['utm_source', 'utm_medium', 'utm_campaign'];

  forms.forEach((form) => {
    utmFields.forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input) input.value = params.get(name) || '';
    });

    const source = form.querySelector('[name="source_page"]');
    if (source) source.value = window.location.pathname;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('[type="submit"]');

      if (!form.reportValidity()) return;

      const endpoint = String(config.APPS_SCRIPT_URL || '').trim();
      if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(endpoint)) {
        setStatus(status, 'error', "Le formulaire est prêt, mais l’URL Google Apps Script n’est pas encore configurée. Consultez le README.");
        return;
      }

      const data = new FormData(form);
      if (data.get('website')) return; // honeypot
      const submissionId = form.dataset.pendingSubmissionId || createSubmissionId();
      form.dataset.pendingSubmissionId = submissionId;
      data.set('submission_id', submissionId);
      data.set('submitted_at_client', new Date().toISOString());

      const body = new URLSearchParams();
      data.forEach((value, key) => body.append(key, String(value)));

      const previousLabel = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'ENVOI EN COURS…';
      setStatus(status, '', '');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Number(config.FORM_TIMEOUT_MS || 12000));

      try {
        // A form-encoded no-cors POST avoids Apps Script CORS/preflight issues.
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: body.toString(),
          signal: controller.signal,
          cache: 'no-store'
        });

        // Because a no-cors response is opaque, confirm storage with a read-only
        // JSONP check that returns only {stored:true|false}; no personal data.
        const stored = await verifySubmission(endpoint, submissionId, 3);
        if (!stored) throw new Error('submission_not_confirmed');

        form.reset();
        delete form.dataset.pendingSubmissionId;
        setStatus(status, 'success', 'Merci. Votre demande a bien été enregistrée par Full Impact.');
      } catch (error) {
        const message = error && error.name === 'AbortError'
          ? 'Le délai de réponse est dépassé. Vérifiez votre connexion puis réessayez.'
          : 'L’enregistrement n’a pas pu être confirmé. Vérifiez votre connexion puis réessayez.';
        setStatus(status, 'error', message);
      } finally {
        clearTimeout(timeout);
        submit.disabled = false;
        submit.textContent = previousLabel;
      }
    });
  });

  async function verifySubmission(endpoint, submissionId, attempts) {
    for (let i = 0; i < attempts; i += 1) {
      if (i > 0) await wait(650 * i);
      try {
        const result = await jsonp(endpoint, submissionId, 4500);
        if (result && result.ok === true && result.stored === true) return true;
      } catch (_) {
        // Retry below.
      }
    }
    return false;
  }

  function jsonp(endpoint, submissionId, timeoutMs) {
    return new Promise((resolve, reject) => {
      const callbackName = `__fi_cb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const url = new URL(endpoint);
      url.searchParams.set('check', submissionId);
      url.searchParams.set('callback', callbackName);
      url.searchParams.set('_', String(Date.now()));

      const script = document.createElement('script');
      let timer;
      const cleanup = () => {
        clearTimeout(timer);
        script.remove();
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      };

      window[callbackName] = (payload) => {
        cleanup();
        resolve(payload);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error('verification_failed'));
      };
      timer = setTimeout(() => {
        cleanup();
        reject(new Error('verification_timeout'));
      }, timeoutMs);

      script.src = url.toString();
      script.async = true;
      document.head.appendChild(script);
    });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setStatus(element, className, message) {
    if (!element) return;
    element.className = `form-status ${className || ''}`.trim();
    element.textContent = message;
  }

  function createSubmissionId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `fi-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
})();
