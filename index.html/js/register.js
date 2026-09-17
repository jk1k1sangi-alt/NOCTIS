/* ==========================================================================
   NOCTIS — The Register
   The continuity layer. Turns eleven pages into one document.

     · Spine          — where the reader is in the folios (desktop gutter)
     · Folio bar      — the same, compact, on smaller screens
     · Index overlay  — the whole story at once, with read folios marked
     · Handoff        — closes each folio by naming the next
     · Acquisition    — the commercial path, shown as the closing movement
     · Continuity     — the product image travels across the page break
   ========================================================================== */

const Register = (() => {
  'use strict';
  const { $, $$, Toast } = App;

  const READ_KEY = 'noctis.register.read';
  const FLIP_KEY = 'noctis.flip.v1';
  const FLIP_TTL = 4000; /* ms — a payload older than this is a stale tab */

  /* --------------------------------------------------------------- utils */
  const loadRead = () => {
    try { return new Set(JSON.parse(sessionStorage.getItem(READ_KEY) || '[]')); }
    catch (e) { return new Set(); }
  };
  const saveRead = (set) => {
    try { sessionStorage.setItem(READ_KEY, JSON.stringify([...set])); } catch (e) {}
  };

  /* Where this page sits in the register. A page may hold several folios —
     the home page carries I, II and III as a continuous scroll. */
  const foliosFor = (page) => {
    if (page === 'index') return NOCTIS.journey.filter((f) => f.roman <= 3);
    const found = NOCTIS.journey.filter((f) => f.pages.includes(page));
    return found;
  };

  const appendixFor = (page) => NOCTIS.appendices[page] || null;

  /* ------------------------------------------------------------------ state */
  const State = {
    current: null,
    folios: [],
    appendix: null,
    read: new Set()
  };

  /* ================================================================ SPINE */
  const Spine = {
    el: null,

    init() {
      this.el = $('.spine');
      if (!this.el) return;

      const { folios, appendix, current } = State;

      /* On the home page the spine advances as the reader scrolls through
         Folios I → III, so the rail is scroll-driven rather than page-driven. */
      const list = folios.length ? folios : (appendix ? [appendix] : []);
      this.el.innerHTML = `
        <button class="spine__index" data-journey-open aria-label="Open the register index" aria-expanded="false">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1h10M1 6h10M1 11h10" stroke="currentColor" stroke-width="1"/>
          </svg>
        </button>

        <div class="spine__marker" aria-hidden="true">
          <span class="spine__numeral">${current ? current.n : '—'}</span>
        </div>

        <div class="spine__track" aria-hidden="true">
          <span class="spine__fill"></span>
          ${list.map((f, i) => `
            <button class="spine__stop${f === current ? ' is-current' : ''}"
                    style="top:${this.stopPos(i, list.length)}%"
                    data-spine-go="${f.href}" title="Folio ${f.n} · ${f.title}"></button>`).join('')}
        </div>

        <span class="spine__caption">${current ? current.title : (appendix ? appendix.title : 'Register')}</span>
      `;

      $$('[data-spine-go]', this.el).forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.spineGo) window.location.href = b.dataset.spineGo;
      }));
    },

    stopPos(i, total) {
      if (total <= 1) return 50;
      return 14 + (i / (total - 1)) * 72;
    },

    /* Reflect a folio change (scroll-driven on the home page) */
    setCurrent(folio) {
      if (!folio || folio === State.current) return;
      State.current = folio;
      const num = $('.spine__numeral', this.el);
      const cap = $('.spine__caption', this.el);
      if (num) num.textContent = folio.n;
      if (cap) cap.textContent = folio.title;
      $$('.spine__stop', this.el).forEach((s) => s.classList.toggle('is-current', s.dataset.spineGo === folio.href));
      markRead(folio);
      Bar.render();
    },

    /* Reading progress through the current folio */
    progress() {
      const fill = $('.spine__fill', this.el);
      if (!fill) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = `scaleY(${h > 0 ? Math.min(window.scrollY / h, 1) : 0})`;
    }
  };

  /* ============================================================ FOLIO BAR */
  /* The compact equivalent of the spine, for widths where the gutter is too
     narrow to hold a rail. Appears once the reader has passed the header. */
  const Bar = {
    el: null,
    init() {
      this.el = $('.folio-bar');
      if (!this.el) return;
      this.render();

      const onScroll = () => {
        const past = window.scrollY > 260;
        const wasVisible = this.el.classList.contains('is-visible');
        this.el.classList.toggle('is-visible', past);
        if (wasVisible !== past) {
          /* Only the small-screen layout renders this bar; measure rather than
             assume, so the desktop stacking offset stays correct. */
          const rendered = window.getComputedStyle(this.el).display !== 'none';
          document.documentElement.style.setProperty(
            '--folio-h', (past && rendered) ? '38px' : '0px');
        }
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const bar = $('.folio-bar__fill', this.el);
        if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(window.scrollY / h, 1) : 0})`;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },
    render() {
      const { current: cur, appendix: app } = State;
      const label = cur ? `Folio ${cur.n}` : (app ? `Appendix ${app.n}` : 'Register');
      const title = cur ? cur.title : (app ? app.title : '');

      this.el.innerHTML = `
        <span class="folio-bar__fill" aria-hidden="true"></span>
        <button class="folio-bar__btn" data-journey-open aria-expanded="false">
          <span class="folio-bar__label">${label}</span>
          <span class="folio-bar__sep" aria-hidden="true"></span>
          <span class="folio-bar__title">${title}</span>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" class="folio-bar__icon">
            <path d="M1 1h10M1 6h10M1 11h10" stroke="currentColor" stroke-width="1"/>
          </svg>
        </button>`;
      $('[data-journey-open]', this.el)?.addEventListener('click', () => Index.open());
    }
  };

  /* ================================================================ INDEX */
  const Index = {
    el: null,
    built: false,

    init() {
      this.el = $('.overlay--journey');
      if (!this.el) return;
      $$('[data-journey-open]').forEach((b) => b.addEventListener('click', () => this.open()));
      $$('[data-journey-close]', this.el).forEach((b) => b.addEventListener('click', () => this.close()));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.el.classList.contains('is-open')) this.close();
      });
    },

    build() {
      const { current, read } = State;
      const folios = NOCTIS.journey;

      this.el.innerHTML = `
        <button class="icon-btn overlay__close" data-journey-close aria-label="Close the register index">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="1.1"/></svg>
        </button>

        <div class="journey">
          <header class="journey__head">
            <p class="eyebrow eyebrow--gold">The Register</p>
            <h2 class="display-3 mt-m">One document, in seven folios.</h2>
            <p class="lead mt-m">From the founding of the house to the confirmation of an order. Read in order,
            or open any folio directly — the register keeps your place either way.</p>
            <p class="journey__progress">
              <span class="spec-mono">${read.size} of ${folios.length} folios read</span>
              <span class="journey__bar" aria-hidden="true">
                <i style="transform:scaleX(${(read.size / folios.length).toFixed(3)})"></i>
              </span>
            </p>
          </header>

          <ol class="journey__list">
            ${folios.map((f, i) => `
              <li class="journey__item${f === current ? ' is-current' : ''}${read.has(f.n) ? ' is-read' : ''}">
                <a href="${f.href}">
                  <span class="journey__num">${f.n}</span>
                  <span class="journey__body">
                    <span class="journey__title">${f.title}</span>
                    <span class="journey__note">${f.note}</span>
                    <span class="journey__lead">${f.lead}</span>
                  </span>
                  <span class="journey__state">
                    ${f === current ? 'You are here' : (read.has(f.n) ? 'Read' : 'Unread')}
                  </span>
                </a>
              </li>`).join('')}
          </ol>

          <footer class="journey__foot">
            <p class="spec-mono">Appendices</p>
            <div class="journey__appendices">
              ${Object.entries(NOCTIS.appendices)
                .filter(([k]) => k !== 'not-found')
                .map(([k, a]) => `<a href="${k}.html">Appendix ${a.n} · ${a.title}</a>`).join('')}
            </div>
          </footer>
        </div>`;
      $$('[data-journey-close]', this.el).forEach((b) => b.addEventListener('click', () => this.close()));
      $$('.journey__item a', this.el).forEach((a) => a.addEventListener('click', () => this.close()));
      this.built = true;
    },

    open() {
      this.build();
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      $$('[data-journey-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
      setTimeout(() => $('[data-journey-close]', this.el)?.focus(), 300);
    },

    close() {
      this.el.classList.remove('is-open');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      $$('[data-journey-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    }
  };

  /* ========================================================= ACQUISITION */
  /* The commercial path. On commerce pages it is sticky under the nav, so the
     buying journey reads as the closing movement of the same story. */
  const Acquisition = {
    init() {
      const host = $('[data-acquisition]');
      if (!host) return;
      const step = host.dataset.acquisition;
      const idx = NOCTIS.acquisition.findIndex((a) => a.key === step);
      if (idx < 0) return;

      host.innerHTML = `
        <div class="acq__inner">
          <span class="acq__label spec-mono">Acquiring</span>
          <ol class="acq__steps">
            ${NOCTIS.acquisition.map((a, i) => `
              <li class="acq__step${i === idx ? ' is-current' : ''}${i < idx ? ' is-done' : ''}">
                ${i <= idx
                  ? `<a href="${a.href}"><span class="acq__num">${String(i + 1).padStart(2, '0')}</span>${a.label}</a>`
                  : `<span><span class="acq__num">${String(i + 1).padStart(2, '0')}</span>${a.label}</span>`}
              </li>`).join('')}
          </ol>
          <span class="acq__fill" style="--acq:${(idx / (NOCTIS.acquisition.length - 1)).toFixed(3)}" aria-hidden="true"></span>
        </div>`;
      host.classList.add('is-live');

      /* Publish the bar's height so other sticky elements (the collection
         filter bar) can stack beneath it rather than fight for the same slot. */
      const publish = () => {
        document.documentElement.style.setProperty('--acq-h', `${host.offsetHeight}px`);
      };
      publish();
      window.addEventListener('resize', publish);
    }
  };

  /* =========================================================== CONTINUITY */
  /* The product image crosses the page break. A card's photograph is captured
     at click, then flown into the reference page's stage — so discovery and
     detail read as one continuous movement rather than two screens. */
  const Continuity = {
    capture(link) {
      const img = link.querySelector('img');
      if (!img || !img.complete || !img.naturalWidth) return false;
      const r = img.getBoundingClientRect();
      try {
        sessionStorage.setItem(FLIP_KEY, JSON.stringify({
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          at: Date.now()
        }));
      } catch (e) { return false; }
      return true;
    },

    take() {
      let payload = null;
      try { payload = JSON.parse(sessionStorage.getItem(FLIP_KEY) || 'null'); } catch (e) {}
      try { sessionStorage.removeItem(FLIP_KEY); } catch (e) {}
      if (!payload || Date.now() - payload.at > FLIP_TTL) return null;
      return payload;
    },

    /* Fly the captured frame into `target`. Resolves when the flight lands. */
    fly(payload, target) {
      return new Promise((resolve) => {
        if (!payload || !target || App.prefersReducedMotion()) return resolve(false);
        const to = target.getBoundingClientRect();
        if (!to.width || !to.height) return resolve(false);

        const ghost = document.createElement('img');
        ghost.src = payload.src;
        ghost.alt = '';
        ghost.className = 'continuity-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        Object.assign(ghost.style, {
          top: `${payload.rect.top}px`,
          left: `${payload.rect.left}px`,
          width: `${payload.rect.width}px`,
          height: `${payload.rect.height}px`
        });
        document.body.appendChild(ghost);

        const from = payload.rect;
        const dx = to.left - from.left + (to.width - from.width) / 2;
        const dy = to.top - from.top + (to.height - from.height) / 2;
        const scale = to.width / from.width;

        requestAnimationFrame(() => {
          ghost.style.transition =
            'transform 1.05s cubic-bezier(.62,.03,.24,1), border-radius .6s ease, opacity .4s ease .62s';
          ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
          ghost.style.opacity = '0.999';
          setTimeout(() => {
            ghost.style.opacity = '0';
            target.classList.add('is-continued');
            setTimeout(() => { ghost.remove(); resolve(true); }, 420);
          }, 980);
        });
      });
    }
  };

  /* ================================================================ UTILS */
  const markRead = (folio) => {
    if (!folio || !folio.n) return;
    State.read.add(folio.n);
    saveRead(State.read);
  };

  /* ------------------------------------------------------------------ INIT */
  const init = () => {
    const page = document.body.dataset.page || '';
    State.folios = foliosFor(page);
    State.appendix = appendixFor(page);
    State.read = loadRead();
    State.current = State.folios[0] || null;

    Spine.init();
    Bar.init();
    Index.init();
    Acquisition.init();

    if (State.current) markRead(State.current);

    /* Home carries three folios: advance the spine as they scroll past, so a
       single page still reads as movement through the register. */
    const sections = $$('[data-folio]');
    if (sections.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const folio = NOCTIS.journey.find((f) => f.n === entry.target.dataset.folio);
          if (folio) Spine.setCurrent(folio);
        });
      }, { threshold: 0, rootMargin: '-25% 0px -55% 0px' });
      sections.forEach((s) => io.observe(s));
    }

    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { Spine.progress(); raf = null; });
    }, { passive: true });
    Spine.progress();
  };

  document.addEventListener('app:ready', init);
  return { State, Continuity, Index, markRead };
})();

/* Classic scripts create lexical bindings, not window properties, so the
   continuity hooks in app.js and shop.js need this explicit export. */
window.Register = Register;

if (typeof module !== 'undefined' && module.exports) module.exports = Register;
