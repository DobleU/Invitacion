/*!
 * TextReveal.js — efectos entrada/salida, timers, encadenado y autostart
 * by you ✨
 *
 * Uso típico:
 *   <h1
 *     data-mode="fixed" data-top="18vh"
 *     data-split="words" data-stagger="120"
 *     data-effect="fly-down" data-duration="1200"
 *     data-start="0.5s"
 *     data-auto-hide="true" data-hide-after="2.5s"
 *     data-out-duration="0.6s" data-out-effect="fade-out"
 *     data-next="#msg2"
 *   >Texto</h1>
 *
 *   new TextReveal('[data-effect], [data-split], [data-start], [data-auto-hide]');
 */
(function () {
  const DEFAULTS = {
    // ENTRADA
    effect: 'fly-up',                 // 'fly-up','fly-down','slide-left','slide-right','zoom-in','fade','blur-up'
    duration: 900,                    // ms
    delay: 0,                         // ms (propio de la animación)
    startAt: 0,                       // ms (timer general para iniciar el reveal)
    easing: 'cubic-bezier(.22,.9,.24,1)',

    // SALIDA (fade out) programable
    autoHide: false,                  // activar apagado automático
    hideAfter: 3000,                  // ms visible antes de iniciar salida
    outDuration: 600,                 // ms
    outEffect: 'fade-out',            // 'fade-out' | 'fly-up-out' | 'fly-down-out'
    easingOut: 'ease',

    // POSICIÓN / Z-INDEX
    top: '20vh',
    zIndex: 2147483647,
    mode: 'fixed',                    // 'fixed' | 'static'

    // SPLIT / STAGGER
    split: 'words',                   // 'words' | 'letters' | 'none'
    stagger: 0,                       // ms entre palabras/letras

    // SECUENCIADO
    next: '',                         // selector del siguiente nodo a revelar
    once: true,                       // para modo static con IntersectionObserver

    // AUTOSTART (para evitar que arranquen solos los siguientes)
    autoStart: true                   // si es false, sólo arrancan con startAt>0 o por data-next (forzado)
  };

  const EFFECTS_IN = {
    'fly-up'     : () => [{opacity:0, transform:'translateY(40px)'},{opacity:1, transform:'translateY(0)'}],
    'fly-down'   : () => [{opacity:0, transform:'translateY(-40px)'},{opacity:1, transform:'translateY(0)'}],
    'slide-left' : () => [{opacity:0, transform:'translateX(40px)'},{opacity:1, transform:'translateX(0)'}],
    'slide-right': () => [{opacity:0, transform:'translateX(-40px)'},{opacity:1, transform:'translateX(0)'}],
    'zoom-in'    : () => [{opacity:0, transform:'scale(.85)'},{opacity:1, transform:'scale(1)'}],
    'fade'       : () => [{opacity:0},{opacity:1}],
    'blur-up'    : () => [{opacity:0, filter:'blur(8px)', transform:'translateY(16px)'},{opacity:1, filter:'blur(0)', transform:'translateY(0)'}],
  };
  const EFFECTS_OUT = {
    'fade-out'   : () => [{opacity:1},{opacity:0}],
    'fly-up-out' : () => [{opacity:1, transform:'translateY(0)'},{opacity:0, transform:'translateY(-30px)'}],
    'fly-down-out':() => [{opacity:1, transform:'translateY(0)'},{opacity:0, transform:'translateY(30px)'}],
  };

  // Parsear tiempos en "segundos" o "ms". Acepta: 2, "2s", "2500"
  const ms = (v, def = 0) => {
    if (v == null) return def;
    if (typeof v === 'number') return v;
    const s = String(v).trim();
    if (/s$/.test(s)) return Math.round(parseFloat(s) * 1000) || def;
    const n = parseInt(s, 10);
    return isNaN(n) ? def : n;
  };

  class TextReveal {
    constructor(selectorOrNodes, options = {}) {
      this.opts = {...DEFAULTS, ...options};
      this.nodes = this._toArray(selectorOrNodes);
      this._rm = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._observer = null;
      this._init();
    }

    _init() {
      if (!this.nodes.length) return;

      this.nodes.forEach(node => {
        const o = this._nodeOptions(node);

        if (o.mode === 'fixed') {
          Object.assign(node.style, {
            position: 'fixed',
            top: o.top,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: String(o.zIndex),
            pointerEvents: 'auto'
          });
          node.dataset._tr_fixed = '1';
        } else {
          const pos = getComputedStyle(node).position;
          if (!['relative','absolute','fixed'].includes(pos)) node.style.position = 'relative';
          node.style.zIndex = String(o.zIndex);
        }

        node.style.opacity = '0'; // estado inicial
        node.dataset.trState = node.dataset.trState || 'idle'; // idle | scheduled | revealed
      });

      const fixedNodes  = this.nodes.filter(n => this._nodeOptions(n).mode === 'fixed');
      const staticNodes = this.nodes.filter(n => this._nodeOptions(n).mode !== 'fixed');

      const runFixed = () => fixedNodes.forEach(n => this.scheduleReveal(n));
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runFixed, {once: true});
      } else {
        runFixed();
      }

      if (staticNodes.length) {
        this._observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            this.scheduleReveal(entry.target);
            const o = this._nodeOptions(entry.target);
            if (o.once) this._observer.unobserve(entry.target);
          });
        }, {threshold: 0.1});
        staticNodes.forEach(n => this._observer.observe(n));
      }
    }

    // programa el reveal respetando start/autostart; force=true ignora autostart
    scheduleReveal(node, force=false) {
      const state = node.dataset.trState;
      if (state === 'revealed' || state === 'scheduled') return;
      node.dataset.trState = 'scheduled';

      const o = this._nodeOptions(node);
      const startAt = ms(node.dataset.start ?? o.startAt, o.startAt);

      // si NO es forzado, y autostart==false y no hay startAt, NO dispares
      if (!force && !o.autoStart && startAt <= 0) { node.dataset.trState = 'idle'; return; }

      const run = () => {
        if (node.dataset.trState === 'revealed') return; // otro camino ya lo hizo
        this.reveal(node);
      };

      if (startAt > 0 && !force) {
        const tid = setTimeout(run, startAt);
        node.dataset.trTimer = String(tid);
      } else {
        run();
      }
    }

    reveal(node) {
      if (node.dataset.trState === 'revealed') return;
      node.dataset.trState = 'revealed';

      const o = this._nodeOptions(node);

      // Reduced motion: mostrar y encadenar
      if (this._rm.matches) {
        node.style.opacity = '1';
        this._scheduleOutAndNext(node, o, 0);
        return;
      }

      const play = (el, extraDelay=0) => {
        const framesIn = (EFFECTS_IN[o.effect] || EFFECTS_IN['fade'])();
        const mapped = (o.mode === 'fixed' && el === node && node.dataset._tr_fixed)
          ? framesIn.map(k => ({...k, transform: k.transform ? `translateX(-50%) ${k.transform}` : 'translateX(-50%)'}))
          : framesIn;

        try {
          el.animate(mapped, {
            duration: ms(o.duration, 900),
            delay: ms(o.delay, 0) + extraDelay,
            easing: o.easing,
            fill: 'forwards'
          });
        } catch(e) {
          el.style.opacity = '1';
          if (mapped.at(-1)?.transform) el.style.transform = mapped.at(-1).transform;
        }
      };

      const split = (node.dataset.split || o.split).toLowerCase();
      const stagger = ms(node.dataset.stagger ?? o.stagger, o.stagger);

      let totalInTime = ms(o.duration, 900) + ms(o.delay, 0);

      if (split === 'none' || stagger <= 0) {
        play(node, 0);
        this._safeOpacity(node, totalInTime);
        this._scheduleOutAndNext(node, o, totalInTime);
        return;
      }

      if (split === 'words') {
        node.style.opacity = '1'; // contenedor visible
        const words = this._splitWords(node);
        words.forEach((w, i) => play(w, i * stagger));
        totalInTime += (words.length - 1) * stagger;
        this._safeOpacity(node, totalInTime);
        this._scheduleOutAndNext(node, o, totalInTime);
        return;
      }

      // letters
      node.style.opacity = '1';
      const letters = this._splitLetters(node);
      letters.forEach((ch, i) => play(ch, i * stagger));
      totalInTime += (letters.length - 1) * stagger;
      this._safeOpacity(node, totalInTime);
      this._scheduleOutAndNext(node, o, totalInTime);
    }

    _scheduleOutAndNext(node, o, totalInTime) {
      const auto = (node.dataset.autoHide ?? o.autoHide).toString() === 'true';
      const hideAfter = ms(node.dataset.hideAfter ?? o.hideAfter, o.hideAfter);
      const outDur = ms(node.dataset.outDuration ?? o.outDuration, o.outDuration);
      const outEffect = node.dataset.outEffect || o.outEffect;
      const easingOut = node.dataset.easingOut || o.easingOut;
      const nextSel = node.dataset.next || o.next;

      if (auto) {
        const when = totalInTime + hideAfter;
        setTimeout(() => this.fadeOut(node, {outDur, outEffect, easingOut, nextSel}), when);
      } else if (nextSel) {
        // si no hay autoHide pero hay siguiente, lánzalo tras entrada
        setTimeout(() => this._revealNext(nextSel), totalInTime);
      }
    }

    fadeOut(node, {outDur, outEffect, easingOut, nextSel}) {
      const framesOut = (EFFECTS_OUT[outEffect] || EFFECTS_OUT['fade-out'])();
      const mapped = (this._nodeOptions(node).mode === 'fixed' && node.dataset._tr_fixed)
        ? framesOut.map(k => ({...k, transform: k.transform ? `translateX(-50%) ${k.transform}` : 'translateX(-50%)'}))
        : framesOut;

      try {
        node.animate(mapped, {duration: outDur, easing: easingOut, fill: 'forwards'});
      } catch(e) {
        node.style.opacity = '0';
        if (mapped.at(-1)?.transform) node.style.transform = mapped.at(-1).transform;
      }

      setTimeout(() => this._revealNext(nextSel), outDur);
    }

    _revealNext(nextSel) {
      if (!nextSel) return;
      const next = document.querySelector(nextSel);
      if (!next) return;
      // forzar inicio aunque tenga autoStart=false
      this.scheduleReveal(next, true);
    }

    _safeOpacity(el, wait) {
      setTimeout(() => {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) === 0) el.style.opacity = '1';
      }, Math.max(100, wait));
    }

    // ===== helpers =====
    _nodeOptions(node) {
      return {
        ...this.opts,
        effect:   node.dataset.effect  || this.opts.effect,
        duration: ms(node.dataset.duration ?? this.opts.duration, this.opts.duration),
        delay:    ms(node.dataset.delay    ?? this.opts.delay, this.opts.delay),
        startAt:  ms(node.dataset.start    ?? this.opts.startAt, this.opts.startAt),

        autoHide: (node.dataset.autoHide ?? this.opts.autoHide).toString() === 'true',
        hideAfter: ms(node.dataset.hideAfter ?? this.opts.hideAfter, this.opts.hideAfter),
        outDuration: ms(node.dataset.outDuration ?? this.opts.outDuration, this.opts.outDuration),
        outEffect: node.dataset.outEffect || this.opts.outEffect,
        easingOut: node.dataset.easingOut || this.opts.easingOut,

        top:       node.dataset.top     || this.opts.top,
        zIndex:  +(node.dataset.zIndex  ?? this.opts.zIndex),
        mode:      node.dataset.mode    || this.opts.mode,

        split:     node.dataset.split   || this.opts.split,
        stagger:   ms(node.dataset.stagger ?? this.opts.stagger, this.opts.stagger),

        next:      node.dataset.next    || this.opts.next,
        once: (node.dataset.once ?? this.opts.once).toString() === 'true',
        autoStart: (node.dataset.autoStart ?? this.opts.autoStart).toString() !== 'false'
      };
    }

    _splitLetters(node) {
      if (node.dataset.trSplit === 'letters') return [...node.querySelectorAll('.tr-letter, .tr-br')];

      const frag = document.createDocumentFragment();
      const text = node.textContent;
      node.textContent = '';

      for (const ch of text) {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
        if (ch === '\n') { const br = document.createElement('br'); br.className='tr-br'; frag.appendChild(br); continue; }
        const s = document.createElement('span');
        s.className = 'tr-letter';
        s.style.display = 'inline-block';
        s.style.opacity = '0';
        s.style.color = 'inherit';
        s.textContent = ch;
        frag.appendChild(s);
      }

      node.appendChild(frag);
      node.dataset.trSplit = 'letters';
      return [...node.querySelectorAll('.tr-letter, .tr-br')];
    }

    _splitWords(node) {
      if (node.dataset.trSplit === 'words') return [...node.querySelectorAll('.tr-word, .tr-br')];

      const frag = document.createDocumentFragment();
      const raw = node.textContent;
      node.textContent = '';

      const tokens = raw.split(/(\s+)/); // conserva separadores
      tokens.forEach(tok => {
        if (tok === '') return;
        if (/^\s+$/.test(tok)) {
          frag.appendChild(document.createTextNode(tok)); // spacing natural
        } else {
          const w = document.createElement('span');
          w.className = 'tr-word';
          w.style.display = 'inline-block';
          w.style.opacity = '0';
          w.style.color = 'inherit';
          w.textContent = tok;
          frag.appendChild(w);
        }
      });

      node.appendChild(frag);
      node.dataset.trSplit = 'words';
      return [...node.querySelectorAll('.tr-word')];
    }

    _toArray(x) {
      if (!x) return [];
      if (typeof x === 'string') return Array.from(document.querySelectorAll(x));
      if (x.nodeType === 1) return [x];
      if (NodeList.prototype.isPrototypeOf(x) || Array.isArray(x)) return Array.from(x);
      return [];
    }
  }

  window.TextReveal = TextReveal;
})();
