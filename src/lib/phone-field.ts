import './phone-prefix.ts';
import { normalizePhone } from './phone.mjs';

// Campos de teléfono opcionales (input[data-phone] con su selector de prefijo): avisan si el
// número no se entiende y dan formato a los españoles. El servidor vuelve a validarlo.
document.querySelectorAll<HTMLInputElement>('input[data-phone]').forEach((input) => {
  const group = input.closest<HTMLElement>('[data-validation-field]');
  const prefix = input.form?.querySelector<HTMLSelectElement>('select[data-phone-prefix]');
  const errorId = `${input.id}-error`;
  const help = input.getAttribute('aria-describedby') ?? '';

  const clear = () => {
    group?.classList.remove('is-invalid');
    group?.querySelector(`#${errorId}`)?.remove();
    input.removeAttribute('aria-invalid');
    if (help) input.setAttribute('aria-describedby', help);
  };

  const check = () => {
    const phone = normalizePhone(input.value, prefix?.value);
    clear();
    if (phone !== undefined) {
      if (prefix?.value === '+34' && /^[6-9]/.test(input.value.trim())) input.value = phone.slice(4);
      return true;
    }
    const error = document.createElement('p');
    error.id = errorId;
    error.className = 'form-validation-error';
    error.textContent = prefix?.value === '+34'
      ? 'Revisa el teléfono. Por ejemplo: 612 345 678. Si es de otro país, elígelo en la lista.'
      : 'Revisa el teléfono: escríbelo sin el prefijo del país.';
    group?.classList.add('is-invalid');
    group?.append(error);
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `${help} ${errorId}`.trim());
    return false;
  };

  input.addEventListener('blur', () => { if (input.value.trim()) check(); else clear(); });
  input.addEventListener('input', clear);
  prefix?.addEventListener('change', () => { if (input.value.trim()) check(); });
  input.form?.addEventListener('submit', (event) => {
    if (input.value.trim() && !check()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      input.focus();
    }
  }, true);
});
