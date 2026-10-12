// Mejora el <select data-phone-prefix> con un buscador: se ve compacto («+34») y al usarlo
// abre la lista por grupos, filtrable por nombre o prefijo. El <select> sigue siendo el
// campo real (se envía y funciona sin JavaScript). Patrón combobox con lista (WAI-ARIA).
type Item = { value: string; name: string; el: HTMLElement };

const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

document.querySelectorAll<HTMLSelectElement>('select[data-phone-prefix]').forEach((select, n) => {
  const host = select.closest<HTMLElement>('.phone');
  if (!host) return;

  const groups: { title: string; options: HTMLOptionElement[] }[] = [];
  const loose: HTMLOptionElement[] = [];
  Array.from(select.children).forEach((child) => {
    if (child instanceof HTMLOptGroupElement) groups.push({ title: child.label, options: Array.from(child.querySelectorAll('option')) });
    else if (child instanceof HTMLOptionElement) loose.push(child);
  });

  const listId = `phone-prefix-list-${n}`;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'combo__input';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-label', 'País del teléfono');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', listId);

  const box = document.createElement('div');
  box.className = 'combo';
  box.append(input);

  const list = document.createElement('div');
  list.className = 'combo__list';
  list.id = listId;
  list.hidden = true;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Países');

  select.hidden = true;
  select.before(box);
  host.append(list);

  let items: Item[] = [];
  let active = -1;

  const currentLabel = () => select.value || 'Otro';
  const nameOf = (option: HTMLOptionElement) => option.dataset.name ?? option.text;

  const mark = () => {
    items.forEach((item, i) => item.el.setAttribute('aria-selected', String(i === active)));
    const el = items[active]?.el;
    if (el) {
      input.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const makeOption = (option: HTMLOptionElement, includeCode: boolean) => {
    const el = document.createElement('div');
    el.className = 'combo__option';
    el.id = `${listId}-o${items.length}`;
    el.setAttribute('role', 'option');
    el.dataset.index = String(items.length);
    if (option.value === select.value) el.dataset.current = '';
    const name = document.createElement('span');
    name.textContent = nameOf(option);
    el.append(name);
    if (includeCode && option.value) {
      const code = document.createElement('span');
      code.className = 'combo__code';
      code.textContent = option.value;
      el.append(code);
    }
    items.push({ value: option.value, name: nameOf(option), el });
    return el;
  };

  const render = (query: string) => {
    const q = plain(query.trim().replace(/^\+/, ''));
    const matches = (option: HTMLOptionElement) => !q || plain(nameOf(option)).includes(q) || option.value.slice(1).startsWith(q);
    items = [];
    list.replaceChildren();
    groups.forEach(({ title, options }, g) => {
      const hits = options.filter(matches);
      if (!hits.length) return;
      const group = document.createElement('div');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-labelledby', `${listId}-g${g}`);
      const heading = document.createElement('div');
      heading.className = 'combo__group-title';
      heading.id = `${listId}-g${g}`;
      heading.textContent = title;
      group.append(heading, ...hits.map((option) => makeOption(option, true)));
      list.append(group);
    });
    loose.filter(matches).forEach((option) => list.append(makeOption(option, false)));
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'combo__empty';
      empty.textContent = 'Sin resultados. Prueba con otro nombre.';
      list.append(empty);
    }
    active = q ? (items.length ? 0 : -1) : items.findIndex((item) => item.value === select.value);
    mark();
  };

  const open = (query = '') => {
    render(query);
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    input.value = currentLabel();
  };

  const choose = (i: number) => {
    const item = items[i];
    if (!item) return;
    select.value = item.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    host.querySelector<HTMLInputElement>('input[type="tel"]')?.focus();
  };

  input.value = currentLabel();
  input.addEventListener('focus', () => input.select());
  input.addEventListener('click', () => { if (list.hidden) open(); });
  input.addEventListener('input', () => open(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (list.hidden) open();
      else { active = Math.min(active + 1, items.length - 1); mark(); }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!list.hidden) { active = Math.max(active - 1, 0); mark(); }
    } else if (event.key === 'Enter' && !list.hidden) {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape' && !list.hidden) {
      event.preventDefault();
      close();
    }
  });
  input.addEventListener('blur', () => { if (!list.hidden) close(); });

  // Con el ratón o el dedo, el campo no debe perder el foco al tocar una opción.
  list.addEventListener('mousedown', (event) => event.preventDefault());
  list.addEventListener('click', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (option) choose(Number(option.dataset.index));
  });
});
