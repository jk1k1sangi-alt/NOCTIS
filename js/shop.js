/* ==========================================================================
   NOCTIS — Commerce Modules
   Collection · Product configurator · Bag · Checkout
   ========================================================================== */

const Shop = (() => {
  'use strict';
  const { $, $$, Cart, Toast, Drawer } = App;

  /* Guarded writers. A markup change should degrade a field, never throw and
     take the whole page down with it. */
  const setText = (sel, value) => { const n = $(sel); if (n) n.textContent = value; };
  const setHTML = (sel, value) => { const n = $(sel); if (n) n.innerHTML = value; };

  /* ------------------------------------------------------------- CARD VIEW */
  const cardHTML = (p, index = 0) => {
    const editorial = p.badge ? `<span class="product-card__badge">${p.badge}</span>` : '';

    /* Availability is a first-class message, so it never competes for the
       same corner as the editorial badge. */
    let availability = '';
    if (p.availability === 'allocation') {
      availability = `<span class="product-card__badge product-card__badge--right product-card__badge--scarcity">By allocation</span>`;
    } else if (p.remaining && p.remaining / p.edition <= 0.30) {
      availability = `<span class="product-card__badge product-card__badge--right product-card__badge--scarcity">${p.remaining} of ${p.edition} left</span>`;
    } else if (p.remaining) {
      availability = `<span class="product-card__badge product-card__badge--right">${p.remaining} of ${p.edition} this year</span>`;
    }

    return `
      <article class="product-card" data-reveal="up" data-reveal-delay="${(index % 3) + 1}">
        <a class="product-card__link" href="product.html?ref=${p.ref}" aria-label="${p.name} — ${p.variant}">
          <div class="product-card__frame">
            ${editorial}
            ${availability}
            <img class="product-card__img" src="${p.thumb}" alt="${p.name}, ${p.variant}"
                 width="1100" height="1100" loading="lazy" decoding="async">
            <span class="product-card__quick">Configure &amp; Acquire</span>
          </div>
        </a>
        <div class="product-card__meta">
          <div>
            <h3 class="product-card__name">${p.name}</h3>
            <p class="product-card__ref">${p.ref} · ${p.size}</p>
          </div>
          <p class="product-card__price">${NOCTIS.formatPrice(p.price)}</p>
        </div>
      </article>`;
  };

  /* --------------------------------------------------------- COLLECTION */
  const Collection = {
    state: { family: 'all', sort: 'featured', material: 'all' },

    init() {
      const grid = $('#collection-grid');
      if (!grid) return;

      this.grid = grid;
      this.count = $('#collection-count');
      this.activeWrap = $('#active-filters');

      /* family chips are generated from data so the nav can never drift */
      const chipWrap = $('#family-chips');
      if (chipWrap) {
        const fams = NOCTIS.families();
        chipWrap.innerHTML = ['all', ...fams].map((f) => {
          const n = f === 'all' ? NOCTIS.products.length : NOCTIS.products.filter((p) => p.family === f).length;
          return `<button class="chip${f === 'all' ? ' is-active' : ''}" data-family="${f}">
            ${f === 'all' ? 'All references' : f}<span class="chip__count">${n}</span></button>`;
        }).join('');
      }

      /* Deep link: ?family=Éclipse&sort=price-asc */
      const params = new URLSearchParams(location.search);
      if (params.get('family')) this.state.family = params.get('family');
      if (params.get('sort')) this.state.sort = params.get('sort');

      $$('[data-family]').forEach((b) => b.classList.toggle('is-active', b.dataset.family === this.state.family));
      const sortSel = $('#sort-select');
      if (sortSel) { sortSel.value = this.state.sort; }

      $$('[data-family]').forEach((b) => b.addEventListener('click', () => {
        this.state.family = b.dataset.family;
        $$('[data-family]').forEach((x) => x.classList.toggle('is-active', x === b));
        this.render();
      }));
      sortSel?.addEventListener('change', (e) => { this.state.sort = e.target.value; this.render(); });
      $$('[data-material]').forEach((b) => b.addEventListener('click', () => {
        const m = b.dataset.material;
        this.state.material = this.state.material === m ? 'all' : m;
        $$('[data-material]').forEach((x) => x.classList.toggle('is-active', x.dataset.material === this.state.material));
        this.render();
      }));

      this.render();
    },

    results() {
      let list = NOCTIS.products.slice();
      const { family, material, sort } = this.state;
      if (family !== 'all') list = list.filter((p) => p.family === family);
      if (material !== 'all') list = list.filter((p) => p.material === material);

      const sorters = {
        'featured': (a, b) => NOCTIS.products.indexOf(a) - NOCTIS.products.indexOf(b),
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'scarcity': (a, b) => (a.remaining / a.edition) - (b.remaining / b.edition)
      };
      return list.sort(sorters[sort] || sorters.featured);
    },

    render() {
      const list = this.results();
      this.grid.innerHTML = list.length
        ? list.map(cardHTML).join('')
        : `<div class="empty-state" style="grid-column:1/-1">
             <p class="eyebrow">No references</p>
             <h3 class="display-4 mt-m">This combination does not exist.</h3>
             <p class="muted mt-s">The maison produces a finite catalogue. Try another family or clear the filters.</p>
             <button class="btn mt-l" data-clear-filters><span>Clear filters</span></button>
           </div>`;

      if (this.count) {
        this.count.textContent = `${String(list.length).padStart(2, '0')} reference${list.length === 1 ? '' : 's'}`;
      }
      this.renderActive();
      App.Reveal.init();
      $$('[data-clear-filters]').forEach((b) => b.addEventListener('click', () => {
        this.state = { family: 'all', sort: 'featured', material: 'all' };
        $$('[data-family]').forEach((x) => x.classList.toggle('is-active', x.dataset.family === 'all'));
        $$('[data-material]').forEach((x) => x.classList.remove('is-active'));
        const s = $('#sort-select'); if (s) s.value = 'featured';
        this.render();
      }));
    },

    renderActive() {
      if (!this.activeWrap) return;
      const tags = [];
      if (this.state.family !== 'all') tags.push(['family', this.state.family]);
      if (this.state.material !== 'all') tags.push(['material', (NOCTIS.CASE_METALS[this.state.material] || {}).short || this.state.material]);
      if (this.state.sort !== 'featured') tags.push(['sort', this.state.sort === 'price-asc' ? 'Price ↑' : this.state.sort === 'price-desc' ? 'Price ↓' : 'Most scarce']);

      this.activeWrap.innerHTML = tags.length
        ? `<span class="spec-mono">Filtered</span>` + tags.map(([k, v]) =>
            `<span class="filter-tag">${v}<button data-drop="${k}" aria-label="Remove ${v} filter">×</button></span>`).join('')
        : '';

      $$('[data-drop]', this.activeWrap).forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.drop;
        if (k === 'family') { this.state.family = 'all'; $$('[data-family]').forEach((x) => x.classList.toggle('is-active', x.dataset.family === 'all')); }
        if (k === 'material') { this.state.material = 'all'; $$('[data-material]').forEach((x) => x.classList.remove('is-active')); }
        if (k === 'sort') { this.state.sort = 'featured'; const s = $('#sort-select'); if (s) s.value = 'featured'; }
        this.render();
      }));
    }
  };

  /* ------------------------------------------------------ PRODUCT / PDP */
  const Product = {
    p: null,
    cfg: {},

    init() {
      const root = $('#pdp');
      if (!root) return;
      this.root = root;

      const ref = new URLSearchParams(location.search).get('ref');
      const product = (ref && NOCTIS.byRef(ref)) || NOCTIS.products[0];
      this.p = product;
      this.deltas = NOCTIS.priceDeltas[product.id];

      document.title = `${product.name} — ${product.variant} | NOCTIS`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', product.lead.slice(0, 155));

      /* Configuration defaults from the reference itself */
      this.cfg = {
        case: product.material,
        dial: product.dial,
        strap: product.config.strap[0],
        engrave: 'none',
        engraveText: ''
      };

      this.renderStatic();
      this.renderOptions();
      this.renderGallery();
      this.bind();
      this.updatePrice();
      this.related();
    },

    /* — static content blocks — */
    renderStatic() {
      const p = this.p;
      const cal = NOCTIS.calibres[p.calibre];

      const familyLink = $('#pdp-crumb-family');
      if (familyLink) {
        familyLink.textContent = p.family;
        familyLink.href = `collection.html?family=${encodeURIComponent(p.family)}`;
      }
      setText('#pdp-ref', p.ref);
      setText('#pdp-title', p.name);
      setText('#pdp-variant', p.variant);
      setText('#pdp-tagline', p.tagline);
      setText('#pdp-lead', p.lead);

      /* availability */
      const av = {
        limited:    { cls: 'dot--low',  label: `Annual series · ${p.remaining} of ${p.edition} remaining` },
        available:  { cls: 'dot--live', label: `Available now · ${p.remaining} of ${p.edition} this year` },
        allocation: { cls: 'dot--low',  label: `By allocation · ${p.remaining} of ${p.edition} available` }
      }[p.availability];
      setHTML('#pdp-availability', `<span class="dot ${av.cls}"></span><span>${av.label}</span>`);

      /* Allocation meter — states scarcity plainly, as a service to the client */
      const meter = $('#pdp-allocated');
      if (meter) {
        const taken = Math.max(0, p.edition - p.remaining);
        const pct = Math.min(1, taken / p.edition);
        meter.style.setProperty('--allocated', pct.toFixed(3));
        $('#pdp-allocated-label').textContent =
          `${taken} of ${p.edition} allocated`;
        $('#pdp-allocated-note').textContent = p.availability === 'allocation'
          ? 'Allocation is offered by conversation'
          : `${p.edition - taken} remain in the ${new Date().getFullYear()} series`;
        setTimeout(() => meter.querySelector('.reserve__bar')?.classList.add('is-live'), 700);
      }

      /* story */
      setHTML('#pdp-story', p.story.map((para) => `<p class="body-text">${para}</p>`).join(''));

      /* specs table */
      setHTML('#pdp-specs', Object.entries(p.specs).map(([k, v]) => `
        <div class="spec-table__row"><dt class="spec-table__key">${k}</dt><dd class="spec-table__val">${v}</dd></div>`).join(''));

      /* calibre card */
      setText('#pdp-calibre-name', cal.name);
      setText('#pdp-calibre-note', cal.note);
      setHTML('#pdp-calibre-grid', [
        ['Reserve', `${cal.reserve} h`],
        ['Frequency', `${NOCTIS.formatNumber(cal.frequency)} A/h`],
        ['Jewels', cal.jewels],
        ['Components', cal.components],
        ['Thickness', cal.thickness],
        ['Type', cal.type]
      ].map(([k, v]) => `<div class="spec-table__row"><dt class="spec-table__key">${k}</dt><dd class="spec-table__val">${v}</dd></div>`).join(''));

      const bar = $('#pdp-reserve');
      if (bar) {
        bar.style.setProperty('--reserve', (cal.reserve / 120).toFixed(2));
        setTimeout(() => bar.classList.add('is-live'), 600);
      }
      const reserveNote = $('#pdp-reserve-note');
      if (reserveNote) reserveNote.textContent = `${cal.reserve} h · ${cal.frequency / 3600} Hz`;

      /* Structured data for the reference */
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${p.name} — ${p.variant}`,
        sku: p.ref,
        brand: { '@type': 'Brand', name: 'NOCTIS' },
        description: p.lead,
        material: NOCTIS.CASE_METALS[p.material].label,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'USD',
          availability: p.availability === 'available'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/LimitedAvailability'
        }
      });
      document.head.appendChild(ld);

      /* CTA area — allocation references convert through a different funnel */
      const actions = $('#pdp-actions');
      if (!actions) return;
      if (p.availability === 'allocation') {
        actions.innerHTML = `
          <button class="btn btn--solid btn--full" data-allocation-open><span>Request allocation</span></button>
          <a class="btn btn--full" href="contact.html?ref=${p.ref}&topic=viewing"><span>Speak to an advisor</span></a>`;
      } else {
        actions.innerHTML = `
          <button class="btn btn--solid btn--full" id="add-to-bag"><span>Add to bag — <span id="cta-price">${NOCTIS.formatPrice(p.price)}</span></span></button>
          <a class="btn btn--full" href="contact.html?ref=${p.ref}&topic=viewing"><span>Reserve a private viewing</span></a>`;
      }
    },

    /* — configurator — */
    renderOptions() {
      const p = this.p;
      const groups = [
        { key: 'case',    label: 'Case metal',  dict: NOCTIS.CASE_METALS, type: 'swatch' },
        { key: 'dial',    label: 'Dial',        dict: NOCTIS.DIALS,       type: 'swatch' },
        { key: 'strap',   label: 'Strap',       dict: NOCTIS.STRAPS,      type: 'swatch-text' }
      ];

      const html = groups.map((g) => {
        const options = p.config[g.key].map((id) => ({ ...g.dict[id], id }));
        const swatches = g.type === 'swatch-text'
          ? `<div class="opt-list">${options.map((o) => `
              <button class="opt-row" data-opt="${o.id}" data-group="${g.key}" type="button">
                <span class="flex gap-s" style="align-items:center">
                  <span class="swatch__chip" style="width:34px;height:34px;border:1px solid var(--line-soft);${o.swatch ? `background:${o.swatch};` : 'background:#1C1F24;'}"></span>
                  <span>${o.label}<br><span class="spec-mono">${o.note || ''}</span></span>
                </span>
                <span class="flex gap-s" style="align-items:center">
                  <span class="spec-mono" data-price-tag="${g.key}:${o.id}"></span>
                  <span class="opt-row__mark"></span>
                </span>
              </button>`).join('')}</div>`
          : `<div class="opt-swatches">${options.map((o) => `
              <button class="swatch" data-opt="${o.id}" data-group="${g.key}" type="button" aria-label="${o.label}">
                <span class="swatch__chip" style="background:${o.swatch}"></span>
                <span class="swatch__tip">${o.label}</span>
              </button>`).join('')}</div>`;

        return `
          <div class="opt-group">
            <div class="opt-group__head">
              <span class="opt-group__label">${g.label}</span>
              <span class="opt-group__value" data-value="${g.key}"></span>
            </div>
            ${swatches}
          </div>`;
      }).join('');

      /* engraving block */
      const engraveBlock = `
        <div class="engrave" id="engrave-block">
          <button class="engrave__toggle" type="button" id="engrave-toggle" aria-expanded="false">
            <span>
              <span class="opt-group__label">Hand engraving</span><br>
              <span class="spec-mono" id="engrave-summary">Not requested</span>
            </span>
            <span class="opt-row__mark" aria-hidden="true"></span>
          </button>
          <div class="engrave__body">
            <div>
              <div class="engrave__inner">
                <div class="opt-list">
                  ${Object.values(NOCTIS.ENGRAVING).map((e) => `
                    <button class="opt-row" data-opt="${e.id}" data-group="engrave" type="button">
                      <span>${e.label}<br><span class="spec-mono">${e.note || 'As delivered'}</span></span>
                      <span class="flex gap-s" style="align-items:center">
                        <span class="spec-mono">${e.delta ? '+ ' + NOCTIS.formatPrice(e.delta) : '—'}</span>
                        <span class="opt-row__mark"></span>
                      </span>
                    </button>`).join('')}
                </div>
                <div id="engrave-input-wrap" style="display:none" class="mt-m">
                  <label class="field">
                    <span class="field__label">Inscription · <span id="engrave-count" class="engrave__count"></span></span>
                    <input class="field__input" id="engrave-text" type="text" maxlength="32"
                           placeholder="A date, a name, a latitude" autocomplete="off">
                  </label>
                  <div class="engrave-preview"><span id="engrave-preview"></span></div>
                  <p class="field__hint">Cut by hand in the Geneva atelier. Engraving adds three weeks and is recorded in the provenance register.</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      setHTML('#pdp-options', html + engraveBlock);
      this.markActive();
    },

    markActive() {
      $$('[data-opt]', this.root).forEach((b) => {
        const active = this.cfg[b.dataset.group] === b.dataset.opt;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      $$('[data-value]', this.root).forEach((el) => {
        const k = el.dataset.value;
        const dict = { case: NOCTIS.CASE_METALS, dial: NOCTIS.DIALS, strap: NOCTIS.STRAPS, engrave: NOCTIS.ENGRAVING }[k];
        const o = dict[this.cfg[k]];
        el.textContent = o ? (k === 'strap' ? o.short : o.label) : '';
      });
      $$('[data-price-tag]').forEach((el) => {
        const [g, id] = el.dataset.priceTag.split(':');
        const d = this.deltas[g]?.[id] ?? 0;
        el.textContent = d === 0 ? 'Included' : (d > 0 ? '+ ' + NOCTIS.formatPrice(d) : '− ' + NOCTIS.formatPrice(Math.abs(d)));
        el.style.color = d === 0 ? 'var(--t-quaternary)' : 'var(--t-secondary)';
      });
      const summary = $('#engrave-summary');
      if (summary) {
        const e = NOCTIS.ENGRAVING[this.cfg.engrave];
        summary.textContent = e.id === 'none' ? 'Not requested'
          : `${e.label}${this.cfg.engraveText ? ' · “' + this.cfg.engraveText + '”' : ''}`;
      }
      $('#engrave-block')?.classList.toggle('is-open', this.cfg.engrave !== 'none');
      const block = $('#engrave-block');
      $('#engrave-toggle')?.setAttribute('aria-expanded', String(block?.classList.contains('is-open')));
    },

    price() {
      const base = this.p.price;
      const d = this.deltas;
      const sum =
        (d.case[this.cfg.case] ?? 0) +
        (d.dial[this.cfg.dial] ?? 0) +
        (d.strap[this.cfg.strap] ?? 0) +
        (d.engrave[this.cfg.engrave] ?? 0);
      return base + sum;
    },

    updatePrice() {
      const value = this.price();
      const node = $('#pdp-price-value');
      if (!node) return;
      node.style.opacity = '0';
      setTimeout(() => {
        node.textContent = NOCTIS.formatPrice(value);
        node.style.opacity = '1';
      }, 140);
      const cta = $('#cta-price');
      if (cta) cta.textContent = NOCTIS.formatPrice(value);
      const note = $('#pdp-price-note');
      if (note) {
        const isBase = value === this.p.price;
        note.textContent = isBase
          ? 'Incl. duties to most destinations · Insured carriage complimentary'
          : `Configured · base ${NOCTIS.formatPrice(this.p.price)}`;
      }
    },

    config() {
      return {
        case: this.cfg.case,
        dial: this.cfg.dial,
        strap: this.cfg.strap,
        engrave: this.cfg.engrave,
        engraveText: this.cfg.engraveText,
        caseLabel: NOCTIS.CASE_METALS[this.cfg.case].label,
        dialLabel: NOCTIS.DIALS[this.cfg.dial].label,
        strapLabel: NOCTIS.STRAPS[this.cfg.strap].label,
        engraveLabel: NOCTIS.ENGRAVING[this.cfg.engrave].label,
        unitPrice: this.price()
      };
    },

    renderGallery() {
      const p = this.p;
      const views = [
        { src: p.image, label: 'Reference', full: p.image },
        { src: 'assets/img/sm/movement-macro.jpg', label: NOCTIS.calibres[p.calibre].name, full: 'assets/img/movement-macro.jpg' },
        { src: 'assets/img/sm/atelier-01.jpg', label: 'Atelier, Genève', full: 'assets/img/atelier-01.jpg' },
        { src: 'assets/img/sm/editorial-wrist.jpg', label: 'On the wrist', full: 'assets/img/editorial-wrist.jpg' },
        { src: 'assets/img/sm/texture-guilloche.jpg', label: 'Guilloché, engine-turned', full: 'assets/img/texture-guilloche.jpg' }
      ];
      const stage = $('#pdp-stage');
      if (!stage) return;
      stage.innerHTML = `
        <img id="pdp-stage-img" src="${views[0].full}" alt="${p.name} — ${views[0].label}" width="1100" height="1100">
        <span class="pdp__stage-label" id="pdp-stage-label">${views[0].label}</span>`;
      stage.dataset.cursor = 'Zoom';

      const thumbs = $('#pdp-thumbs');
      if (thumbs) thumbs.innerHTML = views.map((v, i) => `
        <button class="pdp__thumb${i === 0 ? ' is-active' : ''}" data-view="${i}" aria-label="View: ${v.label}">
          <img src="${v.src}" alt="" loading="lazy">
        </button>`).join('');

      $$('[data-view]').forEach((b) => b.addEventListener('click', () => {
        const v = views[Number(b.dataset.view)];
        $$('[data-view]').forEach((x) => x.classList.toggle('is-active', x === b));
        const img = $('#pdp-stage-img');
        img.style.opacity = '0';
        setTimeout(() => { img.src = v.full; img.alt = `${p.name} — ${v.label}`; img.style.opacity = '1'; }, 200);
        $('#pdp-stage-label').textContent = v.label;
      }));

      /* click-to-zoom on the stage */
      /* Continuity: fly the photograph the client clicked into this stage, so
         discovery and detail read as one movement rather than two screens. */
      const arrive = () => {
        const payload = window.Register && window.Register.Continuity.take();
        if (!payload) { stage.classList.add('is-continued'); return; }
        const stageImg = $('#pdp-stage-img');
        if (stageImg) stageImg.style.opacity = '0';
        window.Register.Continuity.fly(payload, stage).then(() => {
          if (stageImg) stageImg.style.removeProperty('opacity');
        });
      };
      if (document.readyState === 'complete') setTimeout(arrive, 60);
      else window.addEventListener('load', function () { setTimeout(arrive, 60); });

      stage.addEventListener('click', (e) => {
        const r = stage.getBoundingClientRect();
        stage.classList.toggle('is-zoomed');
        if (stage.classList.contains('is-zoomed')) {
          const img = $('#pdp-stage-img');
          img.style.transformOrigin = `${((e.clientX - r.left) / r.width * 100).toFixed(1)}% ${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`;
        }
      });
      stage.addEventListener('mousemove', (e) => {
        if (!stage.classList.contains('is-zoomed')) return;
        const r = stage.getBoundingClientRect();
        const img = $('#pdp-stage-img');
        img.style.transformOrigin = `${((e.clientX - r.left) / r.width * 100).toFixed(1)}% ${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`;
      });
    },

    bind() {
      const root = this.root;

      /* option selection */
      root.addEventListener('click', (e) => {
        const opt = e.target.closest('[data-opt]');
        if (opt) {
          const { group, opt: id } = opt.dataset;
          this.cfg[group] = id;
          if (group === 'engrave') {
            const wrap = $('#engrave-input-wrap');
            wrap.style.display = id === 'none' ? 'none' : 'block';
            if (id !== 'none') setTimeout(() => $('#engrave-text')?.focus(), 260);
            if (id === 'none') this.cfg.engraveText = '';
          }
          this.markActive();
          this.updatePrice();
          return;
        }

        if (e.target.closest('#engrave-toggle')) {
          const block = $('#engrave-block');
          if (this.cfg.engrave === 'none') {
            this.cfg.engrave = 'caseback';
            $('#engrave-input-wrap').style.display = 'block';
            setTimeout(() => $('#engrave-text')?.focus(), 260);
          } else {
            this.cfg.engrave = 'none';
            this.cfg.engraveText = '';
            $('#engrave-input-wrap').style.display = 'none';
          }
          this.markActive();
          this.updatePrice();
          return;
        }

        if (e.target.closest('#add-to-bag')) {
          const id = Cart.add(this.p, this.config());
          Drawer.render();
          Drawer.open();
          Toast.show(`${this.p.name} added to your bag.`, {
            label: 'Checkout',
            onClick: () => location.href = 'checkout.html'
          });
          void id;
        }

        if (e.target.closest('[data-allocation-open]')) {
          const panel = $('#allocation-panel');
          panel?.classList.add('is-open');
          setTimeout(() => panel?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
        }
      });

      /* engraving text */
      root.addEventListener('input', (e) => {
        if (e.target.id !== 'engrave-text') return;
        const max = NOCTIS.ENGRAVING[this.cfg.engrave]?.max || 32;
        this.cfg.engraveText = e.target.value.slice(0, max).toUpperCase();
        $('#engrave-count').textContent = `${this.cfg.engraveText.length} / ${max}`;
        $('#engrave-preview').textContent = this.cfg.engraveText;
        this.markActive();
        e.target.setAttribute('maxlength', String(max));
      });

      /* allocation request form */
      const af = $('#allocation-form');
      af?.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = $('.form-msg', af);
        const email = $('#alloc-email');
        if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value)) {
          email.closest('.field')?.classList.add('has-error');
          if (msg) { msg.textContent = 'A valid address is required.'; msg.classList.add('is-error'); }
          return;
        }
        if (msg) { msg.textContent = `Request logged for ${this.p.ref}. A maison advisor will write within one business day.`; msg.classList.remove('is-error'); }
        af.reset();
        Toast.show('Allocation request received.');
      });
    },

    related() {
      const wrap = $('#pdp-related');
      if (!wrap) return;
      const others = NOCTIS.products.filter((p) => p.id !== this.p.id);
      const same = others.filter((p) => p.family === this.p.family);
      const list = [...same, ...others.filter((p) => p.family !== this.p.family)].slice(0, 3);
      wrap.innerHTML = list.map(cardHTML).join('');
      App.Reveal.init();
    }
  };

  /* --------------------------------------------------------------- BAG */
  const Bag = {
    init() {
      const root = $('#bag-root');
      if (!root) return;

      const render = () => {
        const items = Cart.items;
        const countEl = $('#bag-count');
        if (countEl) countEl.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;

        if (!items.length) {
          root.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
              <p class="eyebrow">Bag</p>
              <h2 class="display-3 mt-m">Nothing here yet.</h2>
              <p class="muted mt-m measure center-x">The collection is deliberately small — eight references across four families. Begin there.</p>
              <a class="btn btn--solid mt-l" href="collection.html"><span>Explore the collection</span></a>
            </div>`;
          const summary = $('#bag-summary');
          if (summary) summary.style.display = 'none';
          return;
        }

        root.innerHTML = items.map((i) => `
          <div class="bag-item">
            <a class="bag-item__media" href="product.html?ref=${i.ref}">
              <img src="${i.image}" alt="${i.name}" loading="lazy">
            </a>
            <div>
              <h3 class="bag-item__name"><a href="product.html?ref=${i.ref}">${i.name}</a></h3>
              <p class="spec-mono">${i.ref}</p>
              <div class="bag-item__opts">
                <p class="bag-item__opt">Case <strong>${i.case}</strong></p>
                <p class="bag-item__opt">Dial <strong>${i.dial}</strong></p>
                <p class="bag-item__opt">Strap <strong>${i.strap}</strong></p>
                ${i.engraveText ? `<p class="bag-item__opt">Engraving <strong>“${i.engraveText}”</strong> — ${i.engrave}</p>`
                  : (i.engrave && i.engrave !== 'No engraving' ? `<p class="bag-item__opt">Engraving <strong>${i.engrave}</strong></p>` : '')}
                <p class="bag-item__opt">Edition <strong>${i.edition} pieces / year</strong></p>
              </div>
              <div class="bag-item__controls">
                <div class="qty">
                  <button data-dec="${i.lineId}" aria-label="Decrease quantity of ${i.name}">−</button>
                  <span>${i.qty}</span>
                  <button data-inc="${i.lineId}" aria-label="Increase quantity of ${i.name}">+</button>
                </div>
                <button class="remove-btn" data-remove="${i.lineId}">Remove</button>
              </div>
            </div>
            <p class="bag-item__price">${NOCTIS.formatPrice(i.unitPrice * i.qty)}</p>
          </div>`).join('');

        const summary = $('#bag-summary');
        if (summary) {
          summary.style.display = '';
          $('#sum-subtotal').textContent = NOCTIS.formatPrice(Cart.subtotal());
          $('#sum-carriage').textContent = 'Complimentary';
          $('#sum-total').textContent = NOCTIS.formatPrice(Cart.subtotal());
          $('#sum-count').textContent = `${Cart.count()} piece${Cart.count() === 1 ? '' : 's'}`;
        }

        $$('[data-inc]').forEach((b) => b.addEventListener('click', () => {
          const it = Cart.items.find((i) => i.lineId === b.dataset.inc);
          Cart.setQty(it.lineId, it.qty + 1);
        }));
        $$('[data-dec]').forEach((b) => b.addEventListener('click', () => {
          const it = Cart.items.find((i) => i.lineId === b.dataset.dec);
          if (it.qty === 1) Cart.remove(it.lineId); else Cart.setQty(it.lineId, it.qty - 1);
        }));
        $$('[data-remove]').forEach((b) => b.addEventListener('click', () => {
          Cart.remove(b.dataset.remove);
          Toast.show('Removed from bag.');
        }));
      };

      document.addEventListener('cart:change', render);
      render();
    }
  };

  /* ---------------------------------------------------------- CHECKOUT */
  const Checkout = {
    step: 0,

    init() {
      const root = $('#checkout-root');
      if (!root) return;
      this.root = root;

      if (!Cart.items.length) {
        $('#checkout-empty').style.display = '';
        $('#checkout-flow').style.display = 'none';
        return;
      }
      $('#checkout-empty').style.display = 'none';
      $('#checkout-flow').style.display = '';

      this.renderSummary();
      this.setStep(0);

      $$('[data-next]').forEach((b) => b.addEventListener('click', () => {
        if (this.validate(this.step)) this.setStep(this.step + 1);
      }));
      $$('[data-prev]').forEach((b) => b.addEventListener('click', () => this.setStep(this.step - 1)));
      $$('[data-to-step]').forEach((b) => b.addEventListener('click', () => {
        const target = Number(b.dataset.toStep);
        if (target < this.step || this.validate(this.step)) this.setStep(target);
      }));

      /* delivery method */
      $$('input[name="delivery"]').forEach((r) => r.addEventListener('change', () => {
        $$('.delivery-option').forEach((o) => o.classList.toggle('is-active', $('input', o).checked));
        const note = $('#delivery-note');
        if (note) {
          note.textContent = {
            courier: 'Hand-delivered by a maison courier in a sealed case. Signature and identity verification required.',
            insured: 'Insured, tracked carriage. Dispatched from Geneva within two business days.',
            boutique: 'Collected in person. Bring identification matching the order name.'
          }[$('input[name="delivery"]:checked').value];
        }
      }));

      /* payment method */
      $$('input[name="payment"]').forEach((r) => r.addEventListener('change', () => {
        $$('.pay-option').forEach((o) => o.classList.toggle('is-active', $('input', o).checked));
        const card = $('#card-fields');
        if (card) card.style.display = $('input[name="payment"]:checked').value === 'card' ? '' : 'none';
        const wire = $('#wire-note');
        if (wire) wire.style.display = $('input[name="payment"]:checked').value === 'wire' ? '' : 'none';
      }));

      /* card formatting */
      const num = $('#card-number');
      num?.addEventListener('input', () => {
        const digits = num.value.replace(/\D/g, '').slice(0, 16);
        num.value = digits.replace(/(.{4})/g, '$1 ').trim();
      });
      const exp = $('#card-exp');
      exp?.addEventListener('input', () => {
        const d = exp.value.replace(/\D/g, '').slice(0, 4);
        exp.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
      });
      const cvc = $('#card-cvc');
      cvc?.addEventListener('input', () => { cvc.value = cvc.value.replace(/\D/g, '').slice(0, 4); });

      $('#place-order')?.addEventListener('click', () => {
        if (!this.validate(3)) return;
        this.place();
      });

      /* country / city helper */
      const country = $('#co-country');
      country?.addEventListener('change', () => {
        const map = { Switzerland: '1204', 'United States': '10022', Japan: '104-0061', 'United Arab Emirates': '00000', France: '75001', 'United Kingdom': 'W1S 2YF', Germany: '60311', Singapore: '238823' };
        const zip = $('#co-zip');
        if (zip && map[country.value] && !zip.value) zip.placeholder = map[country.value];
      });
    },

    renderSummary() {
      const lines = Cart.items.map((i) => `
        <div class="mini-item">
          <div class="mini-item__media"><img src="${i.image}" alt="" loading="lazy"></div>
          <div>
            <p class="mini-item__name">${i.name}</p>
            <p class="mini-item__opt">${i.ref}</p>
            <p class="mini-item__opt">${i.case} · ${i.dial}</p>
            <p class="mini-item__opt">${i.engraveText ? 'Engraved: ' + i.engraveText : i.strap}</p>
            <p class="mini-item__opt mt-s">Qty ${i.qty}</p>
          </div>
          <p class="mini-item__price">${NOCTIS.formatPrice(i.unitPrice * i.qty)}</p>
        </div>`).join('');
      ['#co-items', '#co-items-desktop'].forEach((sel) => {
        const n = $(sel);
        if (n) n.innerHTML = lines;
      });
      $('#co-subtotal').textContent = NOCTIS.formatPrice(Cart.subtotal());
      $('#co-total').textContent = NOCTIS.formatPrice(Cart.subtotal());
    },

    setStep(n) {
      this.step = Math.max(0, Math.min(3, n));
      $$('.checkout-panel').forEach((p, i) => p.classList.toggle('is-active', i === this.step));
      $$('.step').forEach((s, i) => {
        s.classList.toggle('is-active', i === this.step);
        s.classList.toggle('is-done', i < this.step);
      });
      window.scrollTo({ top: $('#checkout-flow').offsetTop - 120, behavior: 'smooth' });
    },

    validate(step) {
      const panel = $$('.checkout-panel')[step];
      if (!panel) return true;
      let ok = true;
      $$('[required]', panel).forEach((f) => {
        /* Checkboxes carry a value of "on" whether or not they are checked,
           so they must be validated on the checked state, not the value. */
        let bad;
        if (f.type === 'checkbox') {
          bad = !f.checked;
        } else {
          bad = !String(f.value).trim();
          if (!bad && f.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value);
          if (!bad && f.id === 'card-number') bad = f.value.replace(/\D/g, '').length < 15;
          if (!bad && f.id === 'card-exp') bad = !/^\d{2} \/ \d{2}$/.test(f.value);
          if (!bad && f.id === 'card-cvc') bad = f.value.replace(/\D/g, '').length < 3;
        }
        const field = f.closest('.field');
        if (field) field.classList.toggle('has-error', bad);
        else f.closest('.check')?.classList.toggle('has-error', bad);
        if (bad) ok = false;
      });
      if (!ok) {
        const first = $('.field.has-error', panel);
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        Toast.show('Please complete the highlighted details.');
      }
      return ok;
    },

    place() {
      const ref = `NCT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
      const name = $('#co-first').value.trim();
      const email = $('#co-email').value.trim();
      const total = Cart.subtotal();

      $('#checkout-confirm').innerHTML = `
        <div class="center" data-reveal="fade">
          <p class="eyebrow eyebrow--gold">Order confirmed</p>
          <h2 class="display-2 mt-m">Thank you${name ? ', ' + name.split(' ')[0] : ''}.</h2>
          <p class="lead center-x mt-m">Your reference is reserved. A maison advisor will confirm allocation and dispatch
          within one business day — by telephone, from Geneva.</p>
          <p class="order-code mt-l">${ref}</p>
          <div class="rule rule--gold mt-l"></div>
          <div class="grid g-3 mt-l" style="text-align:left">
            <div><p class="spec-mono">Pieces</p><p class="mt-s">${Cart.count()}</p></div>
            <div><p class="spec-mono">Total</p><p class="mt-s">${NOCTIS.formatPrice(total)}</p></div>
            <div><p class="spec-mono">Confirmation</p><p class="mt-s">${email}</p></div>
          </div>
          <div class="flex-center gap-m mt-xl wrap">
            <a class="btn btn--solid" href="collection.html"><span>Return to collection</span></a>
            <a class="btn" href="index.html"><span>Back to the maison</span></a>
          </div>
        </div>`;

      $('#checkout-flow').innerHTML = '';
      $('#checkout-empty').style.display = 'none';
      $('#checkout-confirm').style.display = '';
      $('#co-summary-aside')?.remove();
      App.Reveal.init();
      Cart.clear();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ----------------------------------------------- SHARED PAGE SECTIONS */
  const Sections = {
    init() {
      /* Featured grid on any page */
      const featured = $('#featured-grid');
      if (featured) {
        const ids = (featured.dataset.featured || '').split(',').filter(Boolean);
        const list = ids.length ? ids.map((id) => NOCTIS.byId(id)).filter(Boolean) : NOCTIS.products.slice(0, 3);
        featured.innerHTML = list.map(cardHTML).join('');
      }

      /* FAQ — rendered from the maison data so answers stay in one place */
      const faq = $('#faq-list');
      if (faq) {
        faq.innerHTML = NOCTIS.faqs.map((f, i) => `
          <div class="faq-item" data-reveal="up" data-reveal-delay="${i + 1}">
            <button class="faq-item__q" aria-expanded="false" aria-controls="faq-a-${i}">
              <span>${f.q}</span>
              <span class="faq-item__icon" aria-hidden="true"></span>
            </button>
            <div class="faq-item__a" id="faq-a-${i}"><div><p>${f.a}</p></div></div>
          </div>`).join('');
        $$('.faq-item__q', faq).forEach((q) => q.addEventListener('click', () => {
          const item = q.closest('.faq-item');
          const open = item.classList.contains('is-open');
          $$('.faq-item', faq).forEach((i) => {
            i.classList.remove('is-open');
            $('.faq-item__q', i)?.setAttribute('aria-expanded', 'false');
          });
          if (!open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
        }));
        App.Reveal.init();
      }

      /* Journal cards */
      const journal = $('#journal-grid');
      if (journal) {
        journal.innerHTML = NOCTIS.journal.map((j, i) => `
          <a class="product-card journal-card" href="journal.html" data-reveal="up" data-reveal-delay="${i + 1}">
            <div class="product-card__frame">
              <img class="product-card__img" src="${j.image.replace('/img/', '/img/sm/')}" alt="" loading="lazy">
            </div>
            <div class="mt-m">
              <p class="spec-mono">${j.kicker} · ${j.read} · ${j.date}</p>
              <h3 class="product-card__name mt-s">${j.title}</h3>
              <p class="muted mt-s" style="font-size:.875rem">${j.excerpt}</p>
            </div>
          </a>`).join('');
        App.Reveal.init();
      }
    }
  };

  const init = () => {
    Collection.init();
    Product.init();
    Bag.init();
    Checkout.init();
    Sections.init();
    /* Deep-link query for contact / appointment */
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref && $('#co-ref')) $('#co-ref').textContent = ref;
    if (ref && $('#appt-ref')) $('#appt-ref').value = ref;
    const topic = params.get('topic');
    if (topic && $('#appt-topic')) $('#appt-topic').value = topic;
  };

  /* Support both orderings: if the app already booted, run now; otherwise wait. */
  if (window.__noctisBooted) init();
  else document.addEventListener('app:ready', init);

  return { cardHTML, Collection, Product, Bag, Checkout };
})();
