/* Orçamento exclusivo por cliente
   A página é um template: os dados vêm de clientes/<token>.json,
   apontado pela query ?c=<token>. Criar proposta nova = criar um JSON
   (ver modelos/ e o README desta pasta). Sem backend, sem build. */

const main = document.getElementById('orcMain');
const stateEl = document.getElementById('orcState');
const bar = document.getElementById('orcBar');
const totalEl = document.getElementById('orcTotal');
const acceptBtn = document.getElementById('orcAccept');
const copyBtn = document.getElementById('orcCopy');
const statusEl = document.getElementById('orcStatus');

/* ---- Helpers ---- */
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};

const brl = (n) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });

// "2026-07-27" → data local (new Date(string) seria UTC e voltaria um dia)
const parseDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const fmtDate = (iso) =>
  parseDate(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

const addonPriceLabel = (a) =>
  a.tipo === 'percentual' ? `+${a.valor}%` : `+ ${brl(a.valor)}`;

function showState(msg, withContact) {
  stateEl.textContent = '';
  stateEl.append(el('p', 'orc-state__msg', msg));
  if (withContact) {
    const link = el('a', 'link-arrow', 'Falar comigo por e-mail');
    link.href = 'mailto:estevaosouza2804@gmail.com';
    stateEl.append(link);
  }
}

/* ---- Carrega os dados do cliente ---- */
const token = new URLSearchParams(location.search).get('c');

if (!token || !/^[a-z0-9-]{3,64}$/.test(token)) {
  showState('Proposta não encontrada. Confira o link que você recebeu ou fale comigo.', true);
} else {
  fetch(`clientes/${token}.json`, { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then(render)
    .catch(() =>
      showState('Proposta não encontrada. Confira o link que você recebeu ou fale comigo.', true)
    );
}

/* ---- Render ---- */
function render(data) {
  document.title = `Proposta para ${data.cliente} · Estêvão Souza`;

  const frag = document.createDocumentFragment();
  const sufixo = data.sufixoPreco || '';

  /* Cabeçalho */
  const head = el('header', 'orc-head');
  head.append(el('span', 'eyebrow', 'Proposta exclusiva'));
  const title = el('h1', 'orc-head__title');
  title.append('Para ', el('span', 'orc-head__client', data.cliente), '.');
  head.append(title);

  const meta = el('div', 'orc-meta');
  const metaItem = (key, val) => {
    const item = el('div', 'orc-meta__item');
    item.append(el('span', 'orc-meta__key', key), el('span', 'orc-meta__val', val));
    return item;
  };
  meta.append(metaItem('Projeto', data.projeto));
  if (data.data) meta.append(metaItem('Enviada em', fmtDate(data.data)));
  if (data.validade) meta.append(metaItem('Válida até', fmtDate(data.validade)));
  head.append(meta);
  frag.append(head);

  /* Validade */
  const expired = data.validade && parseDate(data.validade) < new Date();
  if (expired) {
    frag.append(
      el(
        'div',
        'orc-expired',
        'Esta proposta passou da validade. Os valores podem ter mudado — me chama que eu atualizo rapidinho.'
      )
    );
  }

  /* Introdução */
  if (data.intro) frag.append(el('p', 'orc-intro', data.intro));

  /* Opções (tiers) */
  const tiersSection = el('section', 'orc-section');
  tiersSection.append(el('h2', 'orc-section__title', 'Escolha o formato'));
  tiersSection.append(
    el(
      'p',
      'orc-section__note',
      'Três caminhos para o mesmo projeto. Selecione um para ver o total — dá para ajustar com os adicionais logo abaixo.'
    )
  );

  const tiers = el('div', 'orc-tiers');
  tiers.dataset.count = String(data.opcoes.length);
  const defaultTier = data.opcoes.find((o) => o.recomendado) || data.opcoes[0];

  data.opcoes.forEach((o) => {
    const label = el('label', 'tier');

    const input = el('input', 'tier__input');
    input.type = 'radio';
    input.name = 'tier';
    input.value = o.id;
    input.checked = o.id === defaultTier.id;

    const card = el('span', 'tier__card');
    const headRow = el('span', 'tier__head');
    headRow.append(el('span', 'tier__name', o.nome));
    if (o.recomendado) headRow.append(el('span', 'tier__badge', 'Recomendada'));
    card.append(headRow);

    const price = el('span', 'tier__price', brl(o.preco));
    if (sufixo) price.append(el('small', null, sufixo));
    card.append(price);

    if (o.resumo) card.append(el('span', 'tier__summary', o.resumo));

    const items = el('ul', 'tier__items');
    (o.itens || []).forEach((i) => items.append(el('li', null, i)));
    card.append(items);

    card.append(el('span', 'tier__pick', 'Selecionar esta opção'));

    label.append(input, card);
    tiers.append(label);
  });
  tiersSection.append(tiers);
  frag.append(tiersSection);

  /* Adicionais */
  if (data.adicionais?.length) {
    const addSection = el('section', 'orc-section');
    addSection.append(el('h2', 'orc-section__title', 'Adicionais'));
    addSection.append(
      el('p', 'orc-section__note', 'Opcionais que entram por cima do formato escolhido.')
    );

    data.adicionais.forEach((a) => {
      const label = el('label', 'addon');

      const input = el('input', 'addon__input');
      input.type = 'checkbox';
      input.value = a.id;

      const box = el('span', 'addon__box');
      box.innerHTML =
        '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="#14110a" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

      const body = el('span', 'addon__body');
      body.append(el('span', 'addon__name', a.nome));
      body.append(el('span', 'addon__price', addonPriceLabel(a)));
      if (a.desc) body.append(el('span', 'addon__desc', a.desc));

      label.append(input, box, body);
      addSection.append(label);
    });
    frag.append(addSection);
  }

  /* Não incluso + condições */
  const cols = el('div', 'orc-cols');
  if (data.naoIncluso?.length) {
    const sec = el('section', 'orc-section');
    sec.append(el('h2', 'orc-section__title', 'O que não está incluso'));
    const list = el('ul', 'orc-list orc-list--out');
    data.naoIncluso.forEach((i) => list.append(el('li', null, i)));
    sec.append(list);
    cols.append(sec);
  }
  if (data.condicoes?.length) {
    const sec = el('section', 'orc-section');
    sec.append(el('h2', 'orc-section__title', 'Condições'));
    const list = el('ul', 'orc-list orc-list--terms');
    data.condicoes.forEach((i) => list.append(el('li', null, i)));
    sec.append(list);
    cols.append(sec);
  }
  if (cols.children.length) frag.append(cols);

  stateEl.remove();
  main.append(frag);
  bar.hidden = false;

  /* ---- Total + resumo ---- */
  const selection = () => {
    const tierId = main.querySelector('input[name="tier"]:checked')?.value;
    const tier = data.opcoes.find((o) => o.id === tierId) || defaultTier;
    const extras = [...main.querySelectorAll('.addon__input:checked')].map((i) =>
      data.adicionais.find((a) => a.id === i.value)
    );
    let total = tier.preco;
    extras.forEach((a) => {
      total += a.tipo === 'percentual' ? (tier.preco * a.valor) / 100 : a.valor;
    });
    return { tier, extras, total: Math.round(total) };
  };

  const summaryText = () => {
    const { tier, extras, total } = selection();
    const lines = [
      `Proposta: ${data.projeto}`,
      `Opção: ${tier.nome} — ${brl(tier.preco)}${sufixo}`,
    ];
    if (extras.length)
      lines.push(`Adicionais: ${extras.map((a) => `${a.nome} (${addonPriceLabel(a)})`).join(', ')}`);
    lines.push(`Total estimado: ${brl(total)}${sufixo}`);
    return lines.join('\n');
  };

  const update = () => {
    const { total } = selection();
    totalEl.textContent = '';
    totalEl.append(brl(total));
    if (sufixo) totalEl.append(el('small', null, sufixo));

    const msg = `Olá, Estêvão! Quero seguir com a proposta.\n\n${summaryText()}\n\n— ${data.cliente}`;
    if (data.whatsapp) {
      acceptBtn.href = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(msg)}`;
      acceptBtn.target = '_blank';
      acceptBtn.rel = 'noopener';
    } else {
      const subject = `Proposta aceita — ${data.projeto} (${data.cliente})`;
      acceptBtn.href = `mailto:${data.email || 'estevaosouza2804@gmail.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    }
  };

  main.addEventListener('change', update);
  update();

  /* Copiar resumo (fallback pro mailto, que depende de cliente de e-mail) */
  let resetTimer;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
    } catch {
      statusEl.textContent = 'Não foi possível copiar automaticamente.';
      return;
    }
    copyBtn.textContent = 'Copiado ✓';
    statusEl.textContent = 'Resumo copiado para a área de transferência.';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyBtn.textContent = 'Copiar resumo';
    }, 2200);
  });
}
