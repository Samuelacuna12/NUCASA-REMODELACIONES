import '../closet.css';
import '../closet.js';
import '../quote.js';
import protectedDetails from './private-data.js';

const details = document.querySelector('[data-quote-private]');
const form = details.querySelector('[data-quote-unlock]');
const message = details.querySelector('[data-quote-unlock-error]');
const fields = details.querySelector('[data-quote-private-fields]');
const codeInput = form.elements.namedItem('code');

function fromBase64Url(value) {
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0));
}

async function unlock(code) {
  const key = await crypto.subtle.importKey('raw', fromBase64Url(code), 'AES-GCM', false, ['decrypt']);
  const payload = fromBase64Url(protectedDetails);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: payload.slice(0, 12) }, key, payload.slice(12));
  const { phone, address } = JSON.parse(new TextDecoder().decode(decrypted));

  details.querySelector('[data-quote-phone]').textContent = phone;
  details.querySelector('[data-quote-address]').textContent = address;
  codeInput.value = '';
  fields.hidden = false;
  fields.tabIndex = -1;
  const focusWasInForm = form.contains(document.activeElement);
  form.hidden = true;
  if (focusWasInForm) fields.focus();
}

if (globalThis.crypto?.subtle) {
  details.hidden = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    try {
      await unlock(codeInput.value.trim());
    } catch {
      message.textContent = 'Revisa el código de acceso e inténtalo de nuevo.';
    }
  });
}
