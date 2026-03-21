class RectaNumerica extends HTMLElement {
    constructor() {
        super();
        this._offset = 0;
        this._zoom = 1.0;
        this._BASE_PX = 90;
        this._highlights = new Set();
        this._drag = false;
        this._lastX = 0;
        this._lt = null;
        this._moved = false;
        this._animFrame = null;
    }

    connectedCallback() {
        this._canvas = document.createElement('canvas');
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this.appendChild(this._canvas);
        this._ctx = this._canvas.getContext('2d');

        this._ro = new ResizeObserver(() => this._resize());
        this._ro.observe(this);

        requestAnimationFrame(() => {
            this._resize();
            this._bindEvents();
        });
    }

    disconnectedCallback() {
        if (this._animFrame) cancelAnimationFrame(this._animFrame);
        this._ro.disconnect();
        this._unbindEvents();
    }

    static get observedAttributes() { return ['resaltable-por-usuario', 'esconder-numeros']; }
    attributeChangedCallback() { this._draw(); }

    get resaltablePorUsuario() { return this.hasAttribute('resaltable-por-usuario'); }
    set resaltablePorUsuario(v) {
        v ? this.setAttribute('resaltable-por-usuario', '') : this.removeAttribute('resaltable-por-usuario');
    }

    get esconderNumeros() { return this.hasAttribute('esconder-numeros'); }
    set esconderNumeros(v) {
        v ? this.setAttribute('esconder-numeros', '') : this.removeAttribute('esconder-numeros');
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Highlight a number programmatically.
     * @param {number} n
     * @param {object} opciones - { centrar: bool, movimientoCentrar: 'instantaneo'|'deslizar' }
     */
    resaltarNumero(n, opciones) {
        opciones = opciones || {};
        this._highlights.add(this._key(n));
        if (opciones.centrar) {
            var movimiento = opciones.movimientoCentrar === 'deslizar' ? 'deslizar' : 'instantaneo';
            this._centerOn(n, movimiento);
        } else {
            this._draw();
        }
    }

    /** Remove highlight from a number. */
    quitarResaltado(n) {
        this._highlights.delete(this._key(n));
        this._draw();
    }

    /** Clear all highlights. */
    limpiarResaltados() {
        this._highlights.clear();
        this._draw();
    }

    /** Return array of all highlighted numbers. */
    leerResaltados() {
        return Array.from(this._highlights).map(Number);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    _key(n) {
        return String(parseFloat(n.toPrecision(10)));
    }

    _ppu() {
        return this._BASE_PX * this._zoom;
    }

    _centerOn(n, movimiento) {
        var targetOffset = -(n * this._ppu());
        if (movimiento === 'deslizar') {
            this._animateTo(targetOffset);
        } else {
            if (this._animFrame) {
                cancelAnimationFrame(this._animFrame);
                this._animFrame = null;
            }
            this._offset = targetOffset;
            this._draw();
        }
    }

    _animateTo(targetOffset) {
        if (this._animFrame) {
            cancelAnimationFrame(this._animFrame);
            this._animFrame = null;
        }
        var DURATION = 600;
        var startOffset = this._offset;
        var startTime = performance.now();
        var self = this;

        function ease(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        function step(now) {
            var t = Math.min((now - startTime) / DURATION, 1);
            self._offset = startOffset + (targetOffset - startOffset) * ease(t);
            self._draw();
            if (t < 1) {
                self._animFrame = requestAnimationFrame(step);
            } else {
                self._animFrame = null;
            }
        }

        this._animFrame = requestAnimationFrame(step);
    }

    _niceUnit(p) {
        var steps = [
            0.001, 0.002, 0.005,
            0.01, 0.02, 0.05,
            0.1, 0.2, 0.5,
            1, 2, 5,
            10, 20, 50,
            100, 200, 500,
            1000, 2000, 5000
        ];
        for (var i = 0; i < steps.length; i++) {
            if (p * steps[i] >= 70) return steps[i];
        }
        return steps[steps.length - 1];
    }

    _fmt(n) {
        if (Object.is(n, -0)) return '0';
        if (Number.isInteger(n)) return n.toLocaleString('en');
        return parseFloat(n.toPrecision(5)).toString();
    }

    _resize() {
        if (!this._canvas) return;
        var dpr = window.devicePixelRatio || 1;
        var W = this._canvas.clientWidth;
        var H = this._canvas.clientHeight;
        this._canvas.width = W * dpr;
        this._canvas.height = H * dpr;
        this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this._draw();
    }

    _draw() {
        if (!this._canvas || !this._ctx) return;
        var canvas = this._canvas;
        var ctx = this._ctx;
        var W = canvas.clientWidth;
        var H = canvas.clientHeight;
        if (!W || !H) return;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, W, H);

        var p = this._ppu();
        var unit = this._niceUnit(p);
        var pxu = p * unit;
        var cx = W / 2 + this._offset;
        var ly = H / 2 + 4;

        // Axis line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(W, ly);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Arrowheads
        var self = this;
        function arrowhead(x, dir) {
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.beginPath();
            if (dir === 1) {
                ctx.moveTo(x, ly);
                ctx.lineTo(x - 10, ly - 5);
                ctx.lineTo(x - 10, ly + 5);
            } else {
                ctx.moveTo(x, ly);
                ctx.lineTo(x + 10, ly - 5);
                ctx.lineTo(x + 10, ly + 5);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        arrowhead(W - 1, 1);
        arrowhead(1, -1);

        var first = Math.floor(-cx / pxu) - 1;
        var last = Math.ceil((W - cx) / pxu) + 1;

        // Draw highlight markers (below ticks)
        this._highlights.forEach((keyStr) => {
            var n = Number(keyStr);
            var x = cx + (n / unit) * pxu;
            if (x < -20 || x > W + 20) return;

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, ly, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#1a73e820';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, ly, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#1a73e8';
            ctx.fill();
            ctx.restore();

            // Label above axis
            if (!this.esconderNumeros) {
                ctx.save();
                ctx.font = "500 11px 'IBM Plex Mono', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                var label = self._fmt(n);
                var tw = ctx.measureText(label).width;
                var px2 = 5;
                var bx = x - tw / 2 - px2;
                var by = ly - 18;
                var bw = tw + px2 * 2;
                var bh = 18;
                ctx.fillStyle = '#1a73e8';
                ctx.beginPath();
                ctx.roundRect(bx, by - bh, bw, bh, 3);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.fillText(label, x, by - 2);
                ctx.restore();
            }
        });

        // Ticks and labels
        for (var i = first; i <= last; i++) {
            var x = cx + i * pxu;
            var val = i * unit;
            var isZ = Math.abs(val) < unit * 1e-9;

            var th = isZ ? 36 : 20;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, ly - th / 2);
            ctx.lineTo(x, ly + th / 2);
            ctx.strokeStyle = isZ ? '#d32f2f' : '#333';
            ctx.lineWidth = isZ ? 2 : 1.5;
            ctx.stroke();
            ctx.restore();

            // Minor ticks
            if (pxu > 44) {
                for (var s = 1; s < 5; s++) {
                    var sx = x + (s / 5) * pxu;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(sx, ly - 5);
                    ctx.lineTo(sx, ly + 5);
                    ctx.strokeStyle = '#ccc';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.restore();
                }
            }

            var isHighlighted = this._highlights.has(this._key(val));
            if (!this.esconderNumeros) {
                ctx.save();
                ctx.font = isZ
                    ? "500 11px 'IBM Plex Mono', monospace"
                    : "400 10px 'IBM Plex Mono', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = isZ ? '#d32f2f' : (isHighlighted ? '#1a73e8' : '#444');
                ctx.fillText(this._fmt(val), x, ly + th / 2 + 5);
                ctx.restore();
            }
        }

        // Zero dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, ly, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#d32f2f';
        ctx.fill();
        ctx.restore();

        var zeroX = cx;
        if (zeroX < 0 || zeroX > W) {
            var onLeft = zeroX < 0;
            var edgeX = onLeft ? 18 : W - 18;
            var arrowDir = onLeft ? -1 : 1;

            ctx.save();

            // Circle background
            ctx.beginPath();
            ctx.arc(edgeX, ly, 11, 0, Math.PI * 2);
            ctx.fillStyle = '#d32f2f80';
            ctx.fill();

            // Chevron
            ctx.beginPath();
            ctx.moveTo(edgeX + arrowDir * 4, ly);
            ctx.lineTo(edgeX - arrowDir * 2, ly - 4);
            ctx.lineTo(edgeX - arrowDir * 2, ly + 4);
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();

            ctx.restore();
        }
    }

    // ── Coordinate helpers ────────────────────────────────────────────────────

    _pixelToNumber(px) {
        var W = this._canvas.clientWidth;
        var p = this._ppu();
        var unit = this._niceUnit(p);
        var rawN = (px - W / 2 - this._offset) / p;
        return Math.round(rawN / unit) * unit;
    }

    _highlightDistPx(n, px) {
        var W = this._canvas.clientWidth;
        var hx = W / 2 + this._offset + n * this._ppu();
        return Math.abs(hx - px);
    }

    // ── Event binding ─────────────────────────────────────────────────────────

    _bindEvents() {
        var self = this;
        var c = this._canvas;

        this._onWheel = function (e) {
            e.preventDefault();
            var r = c.getBoundingClientRect();
            self._doZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left);
        };
        c.addEventListener('wheel', this._onWheel, { passive: false });

        this._onMousedown = function (e) {
            self._drag = true;
            self._moved = false;
            self._lastX = e.clientX;
        };
        this._onMousemove = function (e) {
            if (!self._drag) return;
            var dx = e.clientX - self._lastX;
            if (Math.abs(dx) > 3) self._moved = true;
            self._offset += dx;
            self._lastX = e.clientX;
            self._draw();
        };
        this._onMouseup = function (e) {
            if (!self._moved && self.resaltablePorUsuario) {
                var r = c.getBoundingClientRect();
                var px = e.clientX - r.left;
                self._toggleHighlightAt(px);
            }
            self._drag = false;
        };
        c.addEventListener('mousedown', this._onMousedown);
        window.addEventListener('mousemove', this._onMousemove);
        window.addEventListener('mouseup', this._onMouseup);

        this._onTouchstart = function (e) {
            e.preventDefault();
            self._lt = e.touches;
            self._moved = false;
        };
        this._onTouchmove = function (e) {
            e.preventDefault();
            var t = e.touches;
            if (t.length === 1 && self._lt && self._lt.length === 1) {
                var dx = t[0].clientX - self._lt[0].clientX;
                if (Math.abs(dx) > 3) self._moved = true;
                self._offset += dx;
                self._draw();
            } else if (t.length === 2 && self._lt && self._lt.length === 2) {
                self._moved = true;
                var pd = Math.hypot(self._lt[0].clientX - self._lt[1].clientX, self._lt[0].clientY - self._lt[1].clientY);
                var cd = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
                var r = c.getBoundingClientRect();
                self._doZoom(cd / pd, (t[0].clientX + t[1].clientX) / 2 - r.left);
            }
            self._lt = t;
        };
        this._onTouchend = function (e) {
            if (!self._moved && self.resaltablePorUsuario && self._lt && self._lt.length === 1) {
                var r = c.getBoundingClientRect();
                var px = self._lt[0].clientX - r.left;
                self._toggleHighlightAt(px);
            }
            self._lt = null;
        };
        c.addEventListener('touchstart', this._onTouchstart, { passive: false });
        c.addEventListener('touchmove', this._onTouchmove, { passive: false });
        c.addEventListener('touchend', this._onTouchend);

        this._onKeydown = function (e) {
            if (e.key === 'ArrowLeft') { self._offset += 40; self._draw(); }
            if (e.key === 'ArrowRight') { self._offset -= 40; self._draw(); }
        };
        window.addEventListener('keydown', this._onKeydown);
    }

    _unbindEvents() {
        var c = this._canvas;
        c.removeEventListener('wheel', this._onWheel);
        c.removeEventListener('mousedown', this._onMousedown);
        window.removeEventListener('mousemove', this._onMousemove);
        window.removeEventListener('mouseup', this._onMouseup);
        c.removeEventListener('touchstart', this._onTouchstart);
        c.removeEventListener('touchmove', this._onTouchmove);
        c.removeEventListener('touchend', this._onTouchend);
        window.removeEventListener('keydown', this._onKeydown);
    }

    _toggleHighlightAt(px) {
        var HIT_PX = 12;
        var found = null;
        var self = this;
        this._highlights.forEach(function (keyStr) {
            if (found) return;
            var n = Number(keyStr);
            if (self._highlightDistPx(n, px) <= HIT_PX) found = keyStr;
        });
        if (found) {
            this._highlights.delete(found);
        } else {
            var n = this._pixelToNumber(px);
            this._highlights.add(this._key(n));
        }
        this._draw();
        this._emitChange();
    }

    _emitChange() {
        this.dispatchEvent(new CustomEvent('resaltado-cambiado', {
            detail: { resaltados: this.leerResaltados() },
            bubbles: true
        }));
    }

    _doZoom(f, px) {
        if (px === undefined) px = this._canvas.clientWidth / 2;
        var wp = (px - this._canvas.clientWidth / 2 - this._offset) / this._ppu();
        this._zoom = Math.max(0.0002, Math.min(8000, this._zoom * f));
        this._offset = px - this._canvas.clientWidth / 2 - wp * this._ppu();
        this._draw();
    }
}

customElements.define('recta-numerica', RectaNumerica);
