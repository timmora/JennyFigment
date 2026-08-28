/**
 * Progressive-enhancement handler for Formspree-backed forms.
 *
 * Any <form data-formspree action="https://formspree.io/f/...."> gets:
 *  - inline required-field validation (using the site's .has-error / .form-error styles)
 *  - an AJAX submit so visitors get an inline success/error message instead of
 *    being redirected off-site
 *  - a disabled/"Sending…" state on the submit button while the request is in flight
 *
 * Without JavaScript, the form still works: it's a plain POST to the Formspree
 * endpoint in `action`, which redirects to a Formspree-hosted confirmation page.
 */
(function () {
  function setFieldError(field, hasError) {
    var group = field.closest('.form-group');
    if (group) group.classList.toggle('has-error', hasError);
  }

  function fieldIsInHiddenConditional(field) {
    var conditional = field.closest('.conditional-field');
    return !!conditional && !conditional.classList.contains('is-visible');
  }

  function validateForm(form) {
    var valid = true;
    var firstInvalid = null;

    form.querySelectorAll('[required]').forEach(function (field) {
      if (fieldIsInHiddenConditional(field)) {
        setFieldError(field, false);
        return;
      }
      var ok = field.checkValidity();
      setFieldError(field, !ok);
      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  function getStatusEl(form) {
    var status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.insertAdjacentElement('afterend', status);
      } else {
        form.appendChild(status);
      }
    }
    return status;
  }

  function showStatus(form, type, message) {
    var status = getStatusEl(form);
    status.textContent = message;
    status.classList.remove('form-status--success', 'form-status--error');
    status.classList.add(type === 'success' ? 'form-status--success' : 'form-status--error');
    status.hidden = false;
  }

  function initFormspreeForm(form) {
    var endpoint = form.getAttribute('action') || '';
    if (!endpoint || endpoint.indexOf('YOUR_FORM_ID') !== -1) {
      // Endpoint hasn't been configured yet — let the form submit normally
      // (Formspree will show its own "not configured" message) rather than
      // silently failing via fetch.
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      form.querySelectorAll('.form-group.has-error').forEach(function (group) {
        group.classList.remove('has-error');
      });

      if (!validateForm(form)) {
        showStatus(form, 'error', 'Please fill out the required fields above before sending.');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            var conditional = form.querySelector('.conditional-field.is-visible');
            if (conditional) conditional.classList.remove('is-visible');
            var successMessage =
              form.getAttribute('data-success-message') ||
              "Thanks! Your message is on its way — Jennifer typically responds within 2–3 business days.";
            showStatus(form, 'success', successMessage);
            return;
          }
          return response.json().catch(function () { return null; }).then(function (payload) {
            var message =
              (payload && Array.isArray(payload.errors) && payload.errors.map(function (e) { return e.message; }).join(' ')) ||
              'Something went wrong sending your message. Please try again in a moment.';
            showStatus(form, 'error', message);
          });
        })
        .catch(function () {
          showStatus(form, 'error', 'Something went wrong sending your message. Please check your connection and try again.');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-formspree]').forEach(initFormspreeForm);
  });
})();
