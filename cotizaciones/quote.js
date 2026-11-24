function initializeQuote(quote) {
  const options = Array.from(quote.querySelectorAll('input[type="checkbox"][data-quote-option]'));
  const total = quote.querySelector('[data-quote-total]');
  const count = quote.querySelector('[data-quote-count]');
  const selection = quote.querySelector('[data-quote-selection]');
  const contactLinks = quote.querySelectorAll('[data-quote-contact]');
  const closet = quote.querySelector('.quote-closet');
  const viewer = quote.querySelector('#visor') ?? closet;
  const client = quote.dataset.quoteClient;
  const quoteName = client ? `la cotización de clósets para ${client}` : 'la cotización de clósets';
  const priceFormat = new Intl.NumberFormat('es-CO');
  const listFormat = new Intl.ListFormat('es-CO', { type: 'conjunction' });

  function updateSelection() {
    const selected = options.filter(({ checked }) => checked);
    const amount = selected.reduce((sum, { dataset }) => sum + Number(dataset.price), 0);
    const names = listFormat.format(selected.map(({ dataset }) => dataset.label));

    if (total) total.textContent = selected.length ? `$${priceFormat.format(amount)} COP` : 'Por definir';
    if (count) {
      count.textContent = selected.length === 1
        ? '1 propuesta seleccionada'
        : selected.length ? `${selected.length} propuestas seleccionadas` : 'Sin propuestas seleccionadas';
    }
    if (selection) selection.textContent = names;

    const message = selected.length
      ? `Hola, quisiera consultar por ${names} de ${quoteName}.`
      : `Hola, quisiera consultar sobre ${quoteName}.`;

    for (const link of contactLinks) {
      const contactUrl = new URL(link.href);
      contactUrl.search = `?text=${encodeURIComponent(message)}`;
      link.href = contactUrl.href;
    }
  }

  function resetSelection() {
    for (const option of options) option.checked = false;
    updateSelection();
  }

  for (const option of options) {
    option.addEventListener('change', () => {
      const group = option.dataset.quoteGroup;
      if (option.checked && group) {
        for (const sibling of options) {
          if (sibling !== option && sibling.dataset.quoteGroup === group) sibling.checked = false;
        }
      }
      updateSelection();
    });
  }

  if (closet && viewer) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!viewer.hasAttribute('tabindex')) viewer.tabIndex = -1;

    for (const control of quote.querySelectorAll('[data-quote-explore]')) {
      control.hidden = false;
      control.addEventListener('click', () => {
        closet.dispatchEvent(new CustomEvent('quote-closet:select', {
          detail: control.dataset.quoteExplore,
        }));
        viewer.focus({ preventScroll: true });
        viewer.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      });
    }
  }

  for (const control of quote.querySelectorAll('[data-quote-print]')) {
    control.hidden = false;
    control.addEventListener('click', () => window.print());
  }

  for (const choice of quote.querySelectorAll('[data-quote-choice]')) choice.hidden = false;
  resetSelection();
}

for (const quote of document.querySelectorAll('[data-quote]')) initializeQuote(quote);

const photoDialog = document.querySelector('[data-quote-photo-dialog]');
if (photoDialog?.showModal) {
  const photo = photoDialog.querySelector('img');
  for (const link of document.querySelectorAll('[data-quote-photo]')) {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      photo.src = link.href;
      photo.alt = link.querySelector('img').alt;
      photoDialog.showModal();
    });
  }
  photoDialog.addEventListener('click', (event) => {
    if (event.target === photoDialog) photoDialog.close();
  });
}
