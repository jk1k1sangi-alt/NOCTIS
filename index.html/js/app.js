/* ==========================================================================
   NOCTIS — Application Core
   Navigation · Motion · Commerce state · Cart · Search · Interface chrome
   ========================================================================== */

const App = (() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STORE_KEY = 'noctis.bag.v2';

  /* ------------------------------------------------------------- CART STATE */
  const Cart = {
    items: [],

    load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        this.items = raw ? JSON.parse(raw) : [];
      } catch (e) { this.items = []; }
      return this.items;
    },

    save() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.items)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('cart:change', { detail: { items: this.items } }));
    },

    lineId(productId, cfg) {
      return [productId, cfg.case, cfg.dial, cfg.strap, cfg.engrave, cfg.engraveText || '']
        .join('-').replace(/\s+/g, '_');
    },

    add(product, cfg) {
      const id = this.lineId(product.id, cfg);
      const existing = this.items.find((i) => i.lineId === id);
      if (existing) {
        existing.qty += 1;
      } else {
        this.items.push({
          lineId: id,
          productId: product.id,
          ref: product.ref,
          name: product.name,
          variant: product.variant,
          image: product.thumb || product.image,
          unitPrice: cfg.unitPrice,
          qty: 1,
          case: cfg.caseLabel,
          dial: cfg.dialLabel,
          strap: cfg.strapLabel,
          engrave: cfg.engraveLabel,
          engraveText: cfg.engraveText || '',
          edition: product.edition
        });
      }
      this.save();
      return id;
    },

    remove(lineId) {
      this.items = this.items.filter((i) => i.lineId !== lineId);
      this.save();
    },

    setQty(lineId, qty) {
      const item = this.items.find((i) => i.lineId === lineId);
      if (!item) return;
      item.qty = Math.max(1, Math.min(4, qty));
      this.save();
    },

    clear() { this.items = []; this.save(); },

    count() { return this.items.reduce((n, i) => n + i.qty, 0); },
    subtotal() { return this.items.reduce((n, i) => n + i.qty * i.unitPrice, 0); }
  };

  /* --------------------------------------------------------------- TOASTS */
  const Toast = {
    wrap: null,
    mount() {
      if ($('.toast-wrap')) { this.wrap = $('.toast-wrap'); return; }
      this.wrap = document.createElement('div');
      this.wrap.className = 'toast-wrap';
      this.wrap.setAttribute('role', 'status');
      this.wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.wrap);
    },
    show(message, action) {
      this.mount();
      const el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = `<span class="toast__dot"></span><span>${message}</span>`;
      if (action) {
        const b = document.createElement('button');
        b.textContent = action.label;
        b.addEventListener('click', () => { action.onClick(); el.remove(); });
        el.appendChild(b);
      } else {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Dismiss');
        b.textContent = '×';
        b.addEventListener('click', () => el.remove());
        el.appendChild(b);
      }
      this.wrap.appendChild(el);
      requestAnimationFrame(() => el.classList.add('is-in'));
      setTimeout(() => {
        el.classList.remove('is-in');
        setTimeout(() => el.remove(), 500);
      }, action ? 6000 : 4200);
    }
  };

  /* ------------------------------------------------------------ PRELOADER */
  const Preloader = {
    init() {
      const el = $('.preloader');
      if (!el) return;
      const bar = $('.preloader__bar i', el);
      const pct = $('.preloader__pct', el);
      const mark = $('.preloader__mark', el);

      if (mark && !mark.dataset.split) {
        mark.dataset.split = '1';
        mark.innerHTML = mark.textContent.trim().split('').map((c, i) =>
          `<span style="animation-delay:${i * 45}ms">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
      }

      let progress = 0;
      const tick = setInterval(() => {
        progress = Math.min(progress + Math.random() * 16 + 6, 100);
        if (bar) bar.style.transform = `scaleX(${progress / 100})`;
        if (pct) pct.textContent = String(Math.round(progress)).padStart(3, '0');
        if (progress >= 100) {
          clearInterval(tick);
          setTimeout(() => {
            el.classList.add('is-done');
            document.body.classList.remove('is-locked');
            setTimeout(() => el.remove(), 800);
          }, 260);
        }
      }, 130);

      document.body.classList.add('is-locked');
    }
  };

  /* ------------------------------------------------------------------ NAV */
  const Nav = {
    init() {
      const nav = $('.nav');
      if (!nav) return;
      let last = 0;

      const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle('is-stuck', y > 40);
        if (document.body.classList.contains('menu-open')) return;
        const goingDown = y > last && y > 320;
        nav.classList.toggle('is-hidden', goingDown);
        last = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      /* Burger */
      const burger = $('.nav__burger');
      burger?.addEventListener('click', () => {
        const open = document.body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
        const menu = $('.menu');
        if (menu) menu.setAttribute('aria-hidden', String(!open));
      });
      $$('.menu__link').forEach((l) => l.addEventListener('click', () => {
        document.body.classList.remove('menu-open', 'is-locked');
        $('.nav__burger')?.setAttribute('aria-expanded', 'false');
      }));

      /* Scroll progress */
      const bar = $('.scroll-progress');
      if (bar) {
        const update = () => {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          bar.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`;
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
      }
    }
  };

  /* -------------------------------------------------------------- REVEALS */
  const Reveal = {
    init() {
      const els = $$('[data-reveal], .line-mask, .img-reveal, [data-stagger]');
      if (!els.length) return;

      if (prefersReducedMotion()) {
        els.forEach((el) => el.classList.add('is-in'));
        return;
      }

      /* Reveal on entry.
         Note the threshold: a masked element (`data-reveal="mask"`) clips itself
         with `clip-path: inset(0 0 100% 0)`, which reduces its observed
         intersection *ratio* to zero while still reporting isIntersecting.
         A ratio-based threshold therefore deadlocks those elements and they
         never appear. Threshold 0 + a shrunken bottom edge is both robust and
         the correct "enter the viewport" trigger. */
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-in');

          /* children stagger */
          const stagger = el.dataset.stagger;
          if (stagger) {
            $$('[data-reveal]', el).forEach((child, i) => {
              setTimeout(() => child.classList.add('is-in'), i * Number(stagger));
            });
          }
          io.unobserve(el);
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

      els.forEach((el) => io.observe(el));
    }
  };

  /* ------------------------------------------------------------- PARALLAX */
  const Parallax = {
    items: [],
    init() {
      if (prefersReducedMotion()) return;
      this.items = $$('[data-parallax]').map((el) => ({
        el,
        amount: parseFloat(el.dataset.parallax) || 0.12
      }));
      if (!this.items.length) return;
      this.raf = null;
      window.addEventListener('scroll', () => this.queue(), { passive: true });
      this.queue();
    },
    queue() {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => { this.update(); this.raf = null; });
    },
    update() {
      const vh = window.innerHeight;
      this.items.forEach(({ el, amount }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-progress * amount * 100).toFixed(2)}px, 0)`;
      });
    }
  };

  /* --------------------------------------------------------------- CURSOR */
  const Cursor = {
    init() {
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
      if (prefersReducedMotion()) return;
      const ring = document.createElement('div');
      ring.className = 'cursor-ring';
      document.body.appendChild(ring);

      let tx = window.innerWidth / 2, ty = window.innerHeight / 2, x = tx, y = ty;
      window.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        ring.classList.add('is-visible');
      });
      document.addEventListener('mouseleave', () => ring.classList.remove('is-visible'));

      const loop = () => {
        x += (tx - x) * 0.18;
        y += (ty - y) * 0.18;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        requestAnimationFrame(loop);
      };
      loop();

      const HOVER = 'a, button, .chip, .swatch, .opt-row, .product-card__frame, input, select, textarea';
      document.addEventListener('mouseover', (e) => {
        const t = e.target.closest(HOVER);
        const label = e.target.closest('[data-cursor]');
        ring.classList.toggle('is-hover', !!t && !label);
        if (label) {
          ring.classList.add('is-label');
          ring.textContent = label.dataset.cursor;
        } else {
          ring.classList.remove('is-label');
          ring.textContent = '';
        }
      });
    }
  };

  /* ---------------------------------------------------------------- CLOCK */
  const Clock = {
    init() {
      const nodes = $$('[data-clock]');
      if (!nodes.length) return;
      const tick = () => {
        const now = new Date();
        const geneva = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).format(now);
        nodes.forEach((n) => { n.textContent = geneva; });
      };
      tick();
      setInterval(tick, 1000);
    }
  };

  /* --------------------------------------------------------------- SEARCH */
  const Search = {
    init() {
      const overlay = $('.overlay--search');
      if (!overlay) return;
      const input = $('.search-input', overlay);
      const results = $('.search-results', overlay);

      const open = () => {
        overlay.classList.add('is-open');
        document.body.classList.add('is-locked');
        setTimeout(() => input?.focus(), 260);
      };
      const close = () => {
        overlay.classList.remove('is-open');
        document.body.classList.remove('is-locked');
      };

      $$('[data-search-open]').forEach((b) => b.addEventListener('click', open));
      $$('[data-overlay-close]').forEach((b) => b.addEventListener('click', close));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          close(); Drawer.close();
          document.body.classList.remove('menu-open', 'is-locked');
          $('.nav__burger')?.setAttribute('aria-expanded', 'false');
        }
        if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
      });

      const render = (q) => {
        const term = q.trim().toLowerCase();
        if (!term) {
          results.innerHTML = '';
          $('.search-hint', overlay)?.style.removeProperty('display');
          return;
        }
        $('.search-hint', overlay)?.style.setProperty('display', 'none');
        const hits = NOCTIS.products.filter((p) =>
          [p.name, p.family, p.ref, p.variant, p.collection, p.tagline].join(' ').toLowerCase().includes(term)
        ).slice(0, 5);

        results.innerHTML = hits.length ? hits.map((p) => `
          <a class="search-result" href="product.html?ref=${p.ref}">
            <img src="${p.thumb}" alt="" width="64" height="64" loading="lazy">
            <span>
              <span class="search-result__name">${p.name}</span>
              <span class="search-result__ref">${p.ref} · ${p.variant}</span>
            </span>
            <span class="search-result__price">${NOCTIS.formatPrice(p.price)}</span>
          </a>`).join('')
          : `<p class="dim" style="padding:1.5rem 0">No reference matches “${q}”. Try <em>Éclipse</em>, <em>tourbillon</em> or a reference number.</p>`;
      };

      input?.addEventListener('input', (e) => render(e.target.value));
      $$('.search-suggestions .chip').forEach((c) => c.addEventListener('click', () => {
        input.value = c.textContent.trim();
        render(c.textContent.trim());
      }));
    }
  };

  /* ---------------------------------------------------------------- DRAWER */
  const Drawer = {
    el: null,
    init() {
      this.el = $('.drawer--bag');
      if (!this.el) return;
      $$('[data-bag-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); this.open(); }));
      $$('[data-drawer-close]').forEach((b) => b.addEventListener('click', () => this.close()));
      document.addEventListener('cart:change', () => { this.render(); this.badge(); });
      this.render();
      this.badge();
    },
    open() {
      if (!this.el) return;
      if (!Cart.items.length) { Toast.show('Your bag is empty. The collection is four steps away.', { label: 'View', onClick: () => location.href = 'collection.html' }); return; }
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
    },
    close() {
      if (!this.el) return;
      this.el.classList.remove('is-open');
      this.el.setAttribute('aria-hidden', 'true');
      if (!document.body.classList.contains('menu-open')) document.body.classList.remove('is-locked');
    },
    badge() {
      const n = Cart.count();
      $$('.nav__bag-count').forEach((b) => {
        b.textContent = n > 9 ? '9+' : String(n);
        b.classList.toggle('is-visible', n > 0);
      });
    },
    render() {
      const body = $('.drawer__body', this.el);
      const foot = $('.drawer__foot', this.el);
      if (!body) return;

      if (!Cart.items.length) {
        body.innerHTML = `
          <div class="center" style="padding:3.5rem 0">
            <p class="eyebrow">Bag · Empty</p>
            <p class="mt-m muted" style="font-size:.9rem">Nothing selected yet.</p>
            <a class="btn btn--sm mt-m" href="collection.html"><span>Explore the collection</span></a>
          </div>`;
        if (foot) foot.innerHTML = '';
        return;
      }

      body.innerHTML = Cart.items.map((i) => `
        <div class="mini-item">
          <div class="mini-item__media"><img src="${i.image}" alt="" loading="lazy"></div>
          <div>
            <p class="mini-item__name">${i.name}</p>
            <p class="mini-item__opt">${i.ref}</p>
            <p class="mini-item__opt">${i.case} · ${i.dial}</p>
            <p class="mini-item__opt">${i.engraveText ? 'Engraved: ' + i.engraveText : i.strap}</p>
            <div class="flex gap-s mt-s" style="align-items:center">
              <div class="qty">
                <button data-mini-dec="${i.lineId}" aria-label="Decrease quantity">−</button>
                <span>${i.qty}</span>
                <button data-mini-inc="${i.lineId}" aria-label="Increase quantity">+</button>
              </div>
              <button class="remove-btn" data-mini-remove="${i.lineId}">Remove</button>
            </div>
          </div>
          <p class="mini-item__price">${NOCTIS.formatPrice(i.unitPrice * i.qty)}</p>
        </div>`).join('');

      if (foot) foot.innerHTML = `
        <div class="summary__row"><span>Subtotal</span><span>${NOCTIS.formatPrice(Cart.subtotal())}</span></div>
        <div class="summary__row mt-s"><span>Insured worldwide carriage</span><span>Complimentary</span></div>
        <a class="btn btn--solid btn--full mt-m" href="checkout.html"><span>Proceed to checkout</span></a>
        <a class="link link--muted mt-m" href="cart.html" style="justify-content:center;width:100%">View full bag</a>`;

      $$('[data-mini-inc]', this.el).forEach((b) => b.addEventListener('click', () => {
        const it = Cart.items.find((i) => i.lineId === b.dataset.miniInc);
        Cart.setQty(b.dataset.miniInc, it.qty + 1);
      }));
      $$('[data-mini-dec]', this.el).forEach((b) => b.addEventListener('click', () => {
        const it = Cart.items.find((i) => i.lineId === b.dataset.miniDec);
        if (it.qty === 1) Cart.remove(it.lineId); else Cart.setQty(it.lineId, it.qty - 1);
      }));
      $$('[data-mini-remove]', this.el).forEach((b) => b.addEventListener('click', () => Cart.remove(b.dataset.miniRemove)));
    }
  };

  /* ----------------------------------------------------------------- COUNT */
  const Counters = {
    init() {
      const els = $$('[data-count]');
      if (!els.length) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const dec = (el.dataset.decimals && Number(el.dataset.decimals)) || 0;
          const dur = prefersReducedMotion() ? 0 : 1500;
          const start = performance.now();
          const step = (now) => {
            const p = dur ? Math.min((now - start) / dur, 1) : 1;
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = (target * eased).toFixed(dec);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toFixed(dec);
          };
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      }, { threshold: 0.5 });
      els.forEach((e) => io.observe(e));
    }
  };

  /* ------------------------------------------------- GUILLOCHÉ CANVAS ART */
  /* Procedurally draws the maison's engine-turned hobnail pattern — the
     signature guilloché that appears on atelier dials and case backs. */
  const Guilloche = {
    init() {
      $$('canvas[data-guilloche]').forEach((canvas) => this.draw(canvas));
    },
    draw(canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const render = () => {
        const w = canvas.clientWidth || 1200;
        const h = canvas.clientHeight || 420;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h * 1.42;
        const rings = Math.ceil(h * 1.9 / 26);
        const cell = 26;
        const light = { x: w * 0.5, y: h * 0.06 };

        for (let r = rings; r > 0; r--) {
          const rad = r * cell;
          const steps = Math.max(10, Math.round((Math.PI * rad) / (cell * 0.5)));
          for (let s = 0; s <= steps; s++) {
            const a = Math.PI + (s / steps) * Math.PI;
            const x = cx + Math.cos(a) * rad;
            const y = cy + Math.sin(a) * rad;
            if (y < -cell || y > h + cell) continue;

            /* fake normal shading: light from above centre */
            const nx = (x - light.x) / w;
            const ny = (y - light.y) / h;
            const d = Math.min(1, Math.sqrt(nx * nx + ny * ny) * 1.15);
            const lum = 1 - d;
            const alpha = 0.05 + lum * 0.30;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(a + Math.PI / 2);
            const size = cell * 0.40;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.closePath();
            ctx.strokeStyle = `rgba(198,169,114,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = `rgba(241,239,234,${(alpha * 0.16).toFixed(3)})`;
            ctx.fill();
            ctx.restore();
          }
        }
      };

      render();
      let t;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(render, 200); });
    }
  };

  /* -------------------------------------------------------------- TIMELINE */
  const Timeline = {
    init() {
      $$('.timeline').forEach((root) => {
        const track = $('.timeline__track', root);
        if (!track) return;
        const prev = $('[data-tl-prev]', root);
        const next = $('[data-tl-next]', root);

        const step = () => Math.min(track.clientWidth * 0.7, 460);
        prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
        next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

        const sync = () => {
          if (!prev || !next) return;
          prev.disabled = track.scrollLeft < 8;
          next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
        };
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        setTimeout(sync, 100);

        /* Drag to scroll */
        let down = false, sx = 0, sl = 0, moved = false;
        track.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch') return;
          down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
          track.classList.add('is-dragging');
        });
        window.addEventListener('pointermove', (e) => {
          if (!down) return;
          const dx = e.clientX - sx;
          if (Math.abs(dx) > 3) moved = true;
          track.scrollLeft = sl - dx;
        });
        window.addEventListener('pointerup', () => {
          if (!down) return;
          down = false;
          track.classList.remove('is-dragging');
          if (moved) track.dataset.dragged = '1';
          setTimeout(() => { delete track.dataset.dragged; }, 60);
        });
        track.addEventListener('click', (e) => {
          if (track.dataset.dragged) { e.preventDefault(); e.stopPropagation(); }
        }, true);
      });
    }
  };

  /* ------------------------------------------------------------- NEWSLETTER */
  const Forms = {
    init() {
      $$('form[data-newsletter]').forEach((form) => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = $('input', form);
          const msg = $('.form-msg', form) || form.parentElement.querySelector('.form-msg');
          const value = (input?.value || '').trim();
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
          if (!valid) {
            if (msg) { msg.textContent = 'A valid address is required.'; msg.classList.add('is-error'); }
            input?.focus();
            return;
          }
          if (msg) { msg.textContent = 'Thank you. Confirmation is on its way.'; msg.classList.remove('is-error'); }
          input.value = '';
          Toast.show('You are on the list. Dispatches are sent on the first Thursday of the month.');
        });
      });

      /* Generic demo submit for contact / appointment forms */
      $$('form[data-demo]').forEach((form) => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          let ok = true;
          $$('[required]', form).forEach((f) => {
            const field = f.closest('.field');
            let bad;
            if (f.type === 'checkbox') {
              bad = !f.checked;
            } else {
              bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value));
            }
            if (field) field.classList.toggle('has-error', bad);
            else f.closest('.check')?.classList.toggle('has-error', bad);
            if (bad) ok = false;
          });
          const msg = $('.form-msg', form);
          if (!ok) {
            if (msg) { msg.textContent = 'Please complete the highlighted fields.'; msg.classList.add('is-error'); }
            return;
          }
          if (msg) { msg.textContent = 'Received. A maison advisor will write within one business day.'; msg.classList.remove('is-error'); }
          form.reset();
          Toast.show('Request received — a maison advisor will be in touch.');
        });
        $$('input, select, textarea', form).forEach((f) =>
          f.addEventListener('input', () => f.closest('.field')?.classList.remove('has-error')));
      });

      /* FAQ accordion */
      $$('.faq-item').forEach((item) => {
        const q = $('.faq-item__q', item);
        q?.addEventListener('click', () => {
          const open = item.classList.contains('is-open');
          $$('.faq-item').forEach((i) => { i.classList.remove('is-open'); $('.faq-item__q', i)?.setAttribute('aria-expanded', 'false'); });
          if (!open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
        });
      });
    }
  };

  /* --------------------------------------------------------------- CONSENT */
  const Consent = {
    init() {
      const el = $('.consent');
      if (!el) return;
      let decided = false;
      try { decided = !!localStorage.getItem('noctis.consent'); } catch (e) {}
      if (decided) { el.remove(); return; }
      /* A notice, not an obstacle: it withdraws on its own after a while
         and is suppressed entirely on transactional pages. */
      if (document.body.dataset.page === 'checkout' || document.body.dataset.page === 'cart') {
        el.remove();
        return;
      }
      const dismiss = (value) => {
        try { if (value) localStorage.setItem('noctis.consent', value); } catch (e) {}
        el.classList.remove('is-in');
        setTimeout(() => el.remove(), 700);
      };
      setTimeout(() => el.classList.add('is-in'), 2800);
      setTimeout(() => dismiss('dismissed'), 13000);
      $$('[data-consent]', el).forEach((b) => b.addEventListener('click', () => dismiss(b.dataset.consent)));
    }
  };

  /* --------------------------------------------------------- MISC CHROME */
  const Chrome = {
    init() {
      const y = $('[data-year]');
      if (y) y.textContent = new Date().getFullYear();

      /* In-page anchors */
      $$('a[href^="#"]:not([href="#"])').forEach((a) => {
        a.addEventListener('click', (e) => {
          const target = document.getElementById(a.getAttribute('href').slice(1));
          if (!target) return;
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        });
      });

      /* Hover-tilt for media (subtle, luxury restraint) */
      if (!prefersReducedMotion()) {
        $$('[data-tilt]').forEach((el) => {
          const strength = parseFloat(el.dataset.tilt) || 4;
          el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `perspective(1200px) rotateY(${(px * strength).toFixed(2)}deg) rotateX(${(-py * strength).toFixed(2)}deg)`;
          });
          el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
      }
    }
  };

  /* ----------------------------------------------------------- PAGE ROUTER */
  const Router = {
    init() {
      /* Internal navigation curtain transition */
      if (prefersReducedMotion()) return;
      const curtain = document.createElement('div');
      curtain.className = 'curtain is-open';
      document.body.appendChild(curtain);

      document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || a.target === '_blank') return;
        if (a.hasAttribute('data-no-transition')) return;

        /* Continuity: if this link carries a photograph toward the reference
           page, capture its exact frame before the curtain closes so the image
           can be flown into place on arrival. */
        if (href.indexOf('product.html') === 0 && window.Register) {
          window.Register.Continuity.capture(a);
        }

        e.preventDefault();
        curtain.classList.remove('is-open');
        curtain.classList.add('is-closing');
        setTimeout(() => { window.location.href = href; }, 420);
      });

      window.addEventListener('pageshow', () => {
        curtain.classList.remove('is-closing');
        curtain.classList.add('is-open');
      });
    }
  };

  /* ------------------------------------------------------------------ INIT */
  const init = () => {
    Cart.load();
    Preloader.init();
    Nav.init();
    Chrome.init();
    Reveal.init();
    Parallax.init();
    Cursor.init();
    Clock.init();
    Search.init();
    Drawer.init();
    Counters.init();
    Guilloche.init();
    Timeline.init();
    Forms.init();
    Consent.init();
    Router.init();
    document.dispatchEvent(new CustomEvent('app:ready'));
  };

  return { $, $$, Cart, Toast, Drawer, Reveal, Parallax, init, prefersReducedMotion };
})();

/* Boot sequencing
   Deferred scripts execute while readyState is 'interactive', so we always
   wait for DOMContentLoaded before initialising. That guarantees every
   consumer (shop.js and any page module) has registered its 'app:ready'
   listener before the event is dispatched. A guard makes boot idempotent. */
(() => {
  const boot = () => {
    if (window.__noctisBooted) return;
    window.__noctisBooted = true;
    App.init();
  };
  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
