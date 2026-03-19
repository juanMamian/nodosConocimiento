/**
 * <diagrama-atomo> — Web Component v4
 *
 * Atributos:
 *   electrones  – número de electrones  (default: 1)
 *   protones    – número de protones    (default: 1)
 *   neutrones   – número de neutrones   (default: 0)
 *   modo        – "real" (3D, default) | "plano" (2D flat diagram)
 *
 * Uso:
 *   <diagrama-atomo electrones="8" protones="8" neutrones="8" modo="plano"></diagrama-atomo>
 */

/* ═══════════════════════════════════════════════════════════════
   3-D math helpers  (only used in "real" mode)
═══════════════════════════════════════════════════════════════ */

function rotY(x, y, z, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}
function rotX(x, y, z, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}
function project(x, y, z, fov = 900) {
  const sc = fov / (fov + z * 0.5);
  return [x * sc, y * sc, sc];
}

/* ═══════════════════════════════════════════════════════════════
   Custom element
═══════════════════════════════════════════════════════════════ */

class DiagramaAtomo extends HTMLElement {

  static get observedAttributes() { return ['electrones', 'protones', 'neutrones', 'modo']; }

  connectedCallback() {
    this._running      = false;
    this._animId       = null;
    this._t            = 0;
    this._nucleusAngle = 0;
    this._build();
  }

  attributeChangedCallback() { if (this.shadowRoot) this._build(); }
  disconnectedCallback()     { cancelAnimationFrame(this._animId); }

  get _electrones() { return Math.max(0, parseInt(this.getAttribute('electrones') ?? 1)); }
  get _protones()   { return Math.max(0, parseInt(this.getAttribute('protones')   ?? 1)); }
  get _neutrones()  { return Math.max(0, parseInt(this.getAttribute('neutrones')  ?? 0)); }
  get _modo()       { return this.getAttribute('modo') === 'plano' ? 'plano' : 'real'; }

  /* ─────────────────────────────────────────────────────────────
     Build / rebuild the shadow DOM
  ───────────────────────────────────────────────────────────── */
  _build() {
    cancelAnimationFrame(this._animId);
    this._running      = false;
    this._t            = 0;
    this._nucleusAngle = 0;

    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const root = this.shadowRoot;
    root.innerHTML = '';

    /* ── Styles ── */
    const style = document.createElement('style');
    style.textContent = `
      :host { display: inline-block; font-family: 'Courier New', monospace; }
      .wrapper {
        background: #07101f;
        border: 2px solid #1a3356;
        border-radius: 18px;
        padding: 20px 24px 18px;
        display: flex; flex-direction: column; align-items: center; gap: 14px;
        box-shadow: 0 0 50px #0d47a155, inset 0 0 60px #00000066;
        user-select: none;
      }
      canvas { display: block; }

      /* ── top bar: mode tabs left, play/stop right ── */
      .topbar {
        width: 100%; display: flex;
        justify-content: space-between; align-items: center; gap: 8px;
      }
      .mode-tabs { display: flex; gap: 4px; }

      button {
        cursor: pointer; border: none; border-radius: 8px;
        padding: 6px 16px; font-size: 12px; font-family: inherit;
        letter-spacing: 1px; font-weight: 700;
        transition: filter .15s, transform .1s;
      }
      button:active { transform: scale(.95); }

      /* Mode tabs */
      .btn-mode {
        background: transparent;
        color: #546e7a;
        border: 1px solid #1e3a5f;
        border-radius: 6px;
        padding: 5px 13px;
      }
      .btn-mode.active {
        background: #0d2748;
        color: #7ec8e3;
        border-color: #2a5a8f;
        box-shadow: 0 0 8px #0288d133;
      }
      .btn-mode:hover:not(.active) { color: #90a4ae; border-color: #2a4a6a; }



      .legend { display: flex; gap: 16px; font-size: 11px;
                color: #90a4ae; letter-spacing: .5px; }
      .legend span { display: flex; align-items: center; gap: 5px; }
      .dot { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
      .dot-p { background:#ef5350; box-shadow:0 0 5px #ef535099; }
      .dot-n { background:#78909c; box-shadow:0 0 4px #78909c55; }
      .dot-e { background:#29b6f6; box-shadow:0 0 6px #29b6f6cc; }
    `;

    /* ── Canvas ── */
    /* Canvas scales with atom complexity */
    const nShells  = this._countShells(this._electrones);
    const SIZE     = Math.min(500, Math.max(240, 160 + nShells * 46));
    const canvas   = document.createElement('canvas');
    canvas.width   = SIZE;
    canvas.height  = SIZE;

    /* ── Mode tabs ── */
    const btnReal  = document.createElement('button');
    btnReal.className   = 'btn-mode' + (this._modo === 'real'  ? ' active' : '');
    btnReal.textContent = '⬤  REAL';

    const btnPlano = document.createElement('button');
    btnPlano.className   = 'btn-mode' + (this._modo === 'plano' ? ' active' : '');
    btnPlano.textContent = '◯  PLANO';

    btnReal.addEventListener('click', () => {
      this.setAttribute('modo', 'real');
    });
    btnPlano.addEventListener('click', () => {
      this.setAttribute('modo', 'plano');
    });

    /* ── Legend ── */
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML = `
      <span><i class="dot dot-p"></i>Protones (${this._protones})</span>
      <span><i class="dot dot-n"></i>Neutrones (${this._neutrones})</span>
      <span><i class="dot dot-e"></i>Electrones (${this._electrones})</span>`;

    /* ── Top bar ── */
    const modeTabs = document.createElement('div');
    modeTabs.className = 'mode-tabs';
    modeTabs.append(btnReal, btnPlano);

    const topbar = document.createElement('div');
    topbar.className = 'topbar';
    topbar.append(modeTabs);

    /* ── Wrapper ── */
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.append(style, canvas, topbar );
		if(this.getAttribute("legend")){
			wrapper.append(legend);
		}
    root.appendChild(wrapper);

    /* ── Geometry ── */
    this._nucleusData       = this._buildNucleus(this._protones, this._neutrones);
    this._electronData      = this._buildElectrons(this._electrones, this._nucleusData.boundR);
    this._flatNucleusLayout = this._buildFlatNucleusLayout(this._protones, this._neutrones);
    this._flatLayerCache    = null;   // reset layer cache on rebuild

    /* ── Auto-start real mode; plano is always static ── */
    if (this._modo === 'real') {
      this._start(canvas);
    } else {
      this._renderFrame(canvas.getContext('2d'), SIZE);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     Animation
  ───────────────────────────────────────────────────────────── */
  _start(canvas) {
    if (this._running) return;
    this._running = true;
    const ctx = canvas.getContext('2d');
    const loop = () => {
      if (!this._running) return;
      this._t++;
      this._renderFrame(ctx, canvas.width);
      this._animId = requestAnimationFrame(loop);
    };
    this._animId = requestAnimationFrame(loop);
  }

  _stop() {
    this._running = false;
    cancelAnimationFrame(this._animId);
  }

  /* ─────────────────────────────────────────────────────────────
     Dispatch to the right renderer
  ───────────────────────────────────────────────────────────── */
  _renderFrame(ctx, SIZE) {
    if (this._modo === 'plano') this._renderFlat(ctx, SIZE);
    else                        this._render3D(ctx, SIZE);
  }

  /* ═══════════════════════════════════════════════════════════════
     FLAT / 2-D RENDERER  ("plano" mode)
  ═══════════════════════════════════════════════════════════════ */
  _renderFlat(ctx, SIZE) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const CX = SIZE / 2, CY = SIZE / 2;

    const layers    = this._flatLayers();
    const nLayers   = layers.length || 1;

    /* Fit everything inside the canvas with a margin */
    const MARGIN     = SIZE * 0.045;
    const available  = SIZE / 2 - MARGIN;
    const NUCLEUS_R  = Math.max(12, Math.min(28, available * 0.15));
    const shellSpace = available - NUCLEUS_R;
    const ORBIT_GAP  = shellSpace / (nLayers + 0.5);
    const BASE_ORBIT = NUCLEUS_R + ORBIT_GAP * 0.6;
    const eDot       = Math.max(1.5, Math.min(3.5, ORBIT_GAP * 0.18));

    /* Advance electron angles when running */
    if (this._running) {
      layers.forEach((layer, li) => {
        const speed = (0.022 - li * 0.003);
        layer.forEach((e, ei) => { e.flatAngle += speed * (ei % 2 === 0 ? 1 : -1); });
      });
    }

    /* ── Orbit rings ── */
    layers.forEach((layer, li) => {
      const r = BASE_ORBIT + li * ORBIT_GAP;
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(100,180,255,0.20)';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Shell label  K, L, M … */
      const label = String.fromCharCode(75 + li); // K=75
      ctx.fillStyle = 'rgba(100,180,255,0.35)';
      ctx.font      = `bold ${Math.max(7, Math.min(10, Math.round(ORBIT_GAP * 0.32)))}px Courier New`;
      ctx.fillText(label, CX + r - 6, CY - 3);
    });

    /* ── Nucleus ── */
    this._drawFlatNucleus(ctx, CX, CY, NUCLEUS_R);

    /* ── Electrons ── */
    layers.forEach((layer, li) => {
      const r = BASE_ORBIT + li * ORBIT_GAP;
      layer.forEach(e => {
        const ex = CX + r * Math.cos(e.flatAngle);
        const ey = CY + r * Math.sin(e.flatAngle);

        /* Glow */
        const halo = ctx.createRadialGradient(ex, ey, 0, ex, ey, eDot * 2.5);
        halo.addColorStop(0, 'rgba(41,182,246,.50)');
        halo.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(ex, ey, eDot * 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = halo; ctx.fill();

        ctx.beginPath(); ctx.arc(ex, ey, eDot, 0, 2 * Math.PI);
        ctx.fillStyle   = '#29b6f6';
        ctx.shadowColor = '#29b6f6';
        ctx.shadowBlur  = eDot * 2;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });
    });
  }

  /** Return electron layers as arrays with a `flatAngle` property for 2-D */
  _flatLayers() {
    if (this._flatLayerCache) return this._flatLayerCache;
    const capacities = [2, 8, 18, 32, 32, 18, 8];
    const result = [];
    let remaining = this._electrones;
    for (let li = 0; li < capacities.length && remaining > 0; li++) {
      const count = Math.min(remaining, capacities[li]);
      const layer = [];
      for (let e = 0; e < count; e++) {
        layer.push({ flatAngle: (2 * Math.PI * e) / count - Math.PI / 2 });
      }
      result.push(layer);
      remaining -= count;
    }
    this._flatLayerCache = result;
    return result;
  }

  /**
   * Draw a 2-D nucleus disc.
   * Particles are placed once (cached) using a sunflower / Fibonacci-spiral
   * packing — this fills a circle naturally without rows or columns.
   */
  _drawFlatNucleus(ctx, cx, cy, R) {
    /* Background disc */
    const fill = ctx.createRadialGradient(cx, cy - R * .2, 0, cx, cy, R);
    fill.addColorStop(0,   '#2a1010');
    fill.addColorStop(0.7, '#160808');
    fill.addColorStop(1,   '#0a0303');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.fillStyle = fill; ctx.fill();

    /* Outer glow ring */
    const glow = ctx.createRadialGradient(cx, cy, R * .5, cx, cy, R * 1.8);
    glow.addColorStop(0, 'rgba(239,83,80,.16)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.8, 0, 2 * Math.PI);
    ctx.fillStyle = glow; ctx.fill();

    /* Particles (pre-computed once, stored in _flatNucleusLayout) */
    const layout = this._flatNucleusLayout;
    if (!layout || layout.length === 0) {
      /* rim + spec even if no particles */
    } else {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, 2 * Math.PI); ctx.clip();

      layout.forEach(({ type, nx, ny, pr }) => {
        const px = cx + nx * R, py = cy + ny * R;
        const r  = pr * R;   // convert normalised radius → pixels
        if (type === 'p') {
          const g = ctx.createRadialGradient(px - r*.3, py - r*.3, 0, px, py, r);
          g.addColorStop(0, '#ffcdd2'); g.addColorStop(0.3, '#ef5350'); g.addColorStop(1, '#7f0000');
          ctx.beginPath(); ctx.arc(px, py, r, 0, 2 * Math.PI);
          ctx.fillStyle = g; ctx.shadowColor = 'rgba(239,83,80,.5)'; ctx.shadowBlur = 4;
          ctx.fill();
        } else {
          const g = ctx.createRadialGradient(px - r*.3, py - r*.3, 0, px, py, r);
          g.addColorStop(0, '#eceff1'); g.addColorStop(0.3, '#78909c'); g.addColorStop(1, '#1a282f');
          ctx.beginPath(); ctx.arc(px, py, r, 0, 2 * Math.PI);
          ctx.fillStyle = g; ctx.shadowBlur = 0; ctx.fill();
        }
        ctx.shadowBlur = 0;
      });
      ctx.restore();
    }

    /* Rim */
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,160,140,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();

    /* Specular */
    const spec = ctx.createRadialGradient(cx - R*.35, cy - R*.40, 0, cx, cy, R);
    spec.addColorStop(0, 'rgba(255,255,255,.22)');
    spec.addColorStop(0.35, 'rgba(255,255,255,.05)');
    spec.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.fillStyle = spec; ctx.fill();
  }

  /**
   * Compute the flat nucleus particle layout once using a sunflower spiral.
   * Positions are stored as normalised coords (−1…1) relative to nucleus radius R
   * so they can be used at any scale without recomputing.
   */
  _buildFlatNucleusLayout(protones, neutrones) {
    const total = protones + neutrones;
    if (total === 0) return [];

    /* Shuffle types so protons and neutrons are mixed */
    const types = [...Array(protones).fill('p'), ...Array(neutrones).fill('n')];
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }

    /*
     * Sunflower / Vogel spiral packing inside a unit disc.
     * Each point i is placed at:
     *   r = sqrt(i / total) * scale   (uniform area distribution)
     *   θ = i * golden_angle
     * The result fills the disc without any rows, columns or rings.
     */
    const golden = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.508°
    /* Leave a small margin so dots don't overlap the rim */
    const MARGIN  = 0.88;
    /* Particle radius as a fraction of nucleus R, shrinks with count */
    const prNorm  = Math.max(0.10, Math.min(0.28, 0.72 / Math.sqrt(total)));

    return types.map((type, i) => {
      const r   = (total === 1 ? 0 : Math.sqrt((i + 0.5) / total) * MARGIN);
      const ang = i * golden;
      return {
        type,
        nx: r * Math.cos(ang),   // normalised x  (multiply by R to get pixels)
        ny: r * Math.sin(ang),   // normalised y
        pr: prNorm,              // particle radius (also multiply by R)
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     3-D / "REAL" RENDERER
  ═══════════════════════════════════════════════════════════════ */
  _render3D(ctx, SIZE) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const CX = SIZE / 2, CY = SIZE / 2;

    if (this._running) this._nucleusAngle += 0.005;

    const rawOuterR = this._electronData.length
      ? this._electronData[this._electronData.length - 1].orbitR
      : this._nucleusData.boundR + 10;

    /* Scale everything to fit canvas */
    const MARGIN      = SIZE * 0.05;
    const scale       = (SIZE / 2 - MARGIN) / (rawOuterR * 1.04);
    const fov         = 900 * scale;
    const outerOrbitR = rawOuterR * scale;

    /* Background glow */
    const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, outerOrbitR * 1.05);
    bg.addColorStop(0,    'rgba(18,60,140,.18)');
    bg.addColorStop(0.55, 'rgba(8,22,60,.08)');
    bg.addColorStop(1,    'transparent');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    /* Orbit paths */
    this._electronData.forEach(e => {
      if (this._running) e.angle += e.speed;
      this._drawOrbit3D(ctx, CX, CY, e, scale, fov);
    });

    /* Collect drawables */
    const drawables = [];
    this._electronData.forEach(e => {
      const { sx, sy, z, sc } = this._electronPos3D(e, scale, fov);
      drawables.push({ kind: 'electron', sx: CX + sx, sy: CY + sy, z, sc });
    });
    const nA = this._nucleusAngle;
    this._nucleusData.particles.forEach(p => {
      let [x, y, z] = rotY(p.lx * scale, p.ly * scale, p.lz * scale, nA);
      [x, y, z]     = rotX(x, y, z, 0.30);
      const [sx, sy, sc] = project(x, y, z, fov);
      drawables.push({ kind: 'nucleon', sx: CX + sx, sy: CY + sy, z, sc, p });
    });
    drawables.sort((a, b) => a.z - b.z);

    const nR = (this._nucleusData.boundR + 2) * scale;
    const behindNucleus = d => {
      const dx = d.sx - CX, dy = d.sy - CY;
      return d.z < 0 && dx*dx + dy*dy < nR * nR;
    };

    /* 1. Back electrons */
    drawables.filter(d => d.kind === 'electron' && d.z < 0).forEach(d => {
      const alpha = behindNucleus(d) ? Math.max(0, 1 + d.z / (nR * 2)) : 1;
      ctx.save(); ctx.globalAlpha = alpha;
      this._drawElectron(ctx, d.sx, d.sy, d.sc);
      ctx.restore();
    });

    /* 2. Nucleus base */
    this._drawNucleusSphere(ctx, CX, CY, this._nucleusData.boundR * scale);

    /* 3. Nucleons clipped */
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, nR, 0, 2 * Math.PI); ctx.clip();
    drawables.filter(d => d.kind === 'nucleon')
             .forEach(d => this._drawNucleon(ctx, d.sx, d.sy, d.sc, d.p));
    ctx.restore();

    /* 4. Nucleus glass top */
    this._drawNucleusGlassTop(ctx, CX, CY, this._nucleusData.boundR * scale);

    /* 5. Front electrons */
    drawables.filter(d => d.kind === 'electron' && d.z >= 0)
             .forEach(d => this._drawElectron(ctx, d.sx, d.sy, d.sc));

    /* 6. Atom sphere shell */
    this._drawAtomSphere(ctx, CX, CY, outerOrbitR);
  }

  /* ═══════════════════════════════════════════════════════════════
     SHARED DRAW HELPERS
  ═══════════════════════════════════════════════════════════════ */

  _electronPos3D(e, scale = 1, fov = 900) {
    const ox = e.orbitR * Math.cos(e.angle) * scale;
    const oy = e.orbitR * Math.sin(e.angle) * scale;
    let [x, y, z] = rotX(ox, oy, 0, e.tiltX);
    [x, y, z]     = rotY(x, y, z, e.tiltY);
    const [sx, sy, sc] = project(x, y, z, fov);
    return { sx, sy, z, sc };
  }

  _drawOrbit3D(ctx, CX, CY, e, scale = 1, fov = 900) {
    const N = 80, pts = [];
    for (let i = 0; i <= N; i++) {
      const a  = (2 * Math.PI * i) / N;
      const ox = e.orbitR * Math.cos(a) * scale, oy = e.orbitR * Math.sin(a) * scale;
      let [x, y, z] = rotX(ox, oy, 0, e.tiltX);
      [x, y, z]     = rotY(x, y, z, e.tiltY);
      const [sx, sy] = project(x, y, z, fov);
      pts.push([CX + sx, CY + sy]);
    }
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(100,180,255,0.13)';
    ctx.lineWidth   = 0.8;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }

  _drawElectron(ctx, x, y, sc) {
    const r = Math.max(1.8, 3.5 * sc);
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    halo.addColorStop(0, 'rgba(41,182,246,.45)');
    halo.addColorStop(0.5, 'rgba(41,182,246,.12)');
    halo.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 2 * Math.PI);
    ctx.fillStyle = halo; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = '#29b6f6'; ctx.shadowColor = '#29b6f6'; ctx.shadowBlur = 10 * sc;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  _drawNucleon(ctx, x, y, sc, p) {
    const r = Math.max(2, p.r * sc);
    if (p.type === 'p') {
      const g = ctx.createRadialGradient(x-r*.35, y-r*.35, r*.05, x, y, r);
      g.addColorStop(0,'#ffcdd2'); g.addColorStop(0.25,'#ef5350'); g.addColorStop(1,'#7f0000');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2*Math.PI);
      ctx.fillStyle=g; ctx.shadowColor='rgba(239,83,80,.40)'; ctx.shadowBlur=6*sc; ctx.fill();
    } else {
      const g = ctx.createRadialGradient(x-r*.35, y-r*.35, r*.05, x, y, r);
      g.addColorStop(0,'#eceff1'); g.addColorStop(0.25,'#78909c'); g.addColorStop(1,'#1a282f');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2*Math.PI);
      ctx.fillStyle=g; ctx.shadowBlur=0; ctx.fill();
    }
    ctx.shadowBlur=0;
  }

  _drawNucleusSphere(ctx, cx, cy, boundR) {
    const R = Math.max(10, boundR + 3);
    const fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    fill.addColorStop(0,'#1c0b0b'); fill.addColorStop(0.7,'#0d0505'); fill.addColorStop(1,'#060202');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2*Math.PI); ctx.fillStyle=fill; ctx.fill();
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    glow.addColorStop(0,'rgba(239,83,80,.20)'); glow.addColorStop(0.6,'rgba(183,28,28,.06)'); glow.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2*Math.PI); ctx.fillStyle=glow; ctx.fill();
  }

  _drawNucleusGlassTop(ctx, cx, cy, boundR) {
    const R = Math.max(10, boundR + 3);
    const og = ctx.createRadialGradient(cx,cy,R*.7,cx,cy,R*1.7);
    og.addColorStop(0,'rgba(239,83,80,.12)'); og.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,R*1.7,0,2*Math.PI); ctx.fillStyle=og; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI);
    ctx.strokeStyle='rgba(255,200,180,0.18)'; ctx.lineWidth=1.5; ctx.stroke();
    const spec=ctx.createRadialGradient(cx-R*.40,cy-R*.44,0,cx-R*.20,cy-R*.22,R*.65);
    spec.addColorStop(0,'rgba(255,255,255,.28)'); spec.addColorStop(0.45,'rgba(255,255,255,.06)'); spec.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI); ctx.fillStyle=spec; ctx.fill();
  }

  _drawAtomSphere(ctx, cx, cy, orbitR) {
    const R = orbitR * 1.04;
    const inner = ctx.createRadialGradient(cx,cy,orbitR*.3,cx,cy,R);
    inner.addColorStop(0,'rgba(30,90,200,.00)'); inner.addColorStop(0.75,'rgba(30,90,200,.04)'); inner.addColorStop(1,'rgba(60,140,255,.10)');
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI); ctx.fillStyle=inner; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI);
    ctx.strokeStyle='rgba(100,180,255,0.14)'; ctx.lineWidth=1.2; ctx.stroke();
    const glow=ctx.createRadialGradient(cx,cy,R*.9,cx,cy,R*1.25);
    glow.addColorStop(0,'rgba(41,182,246,.09)'); glow.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,R*1.25,0,2*Math.PI); ctx.fillStyle=glow; ctx.fill();
    const spec=ctx.createRadialGradient(cx-R*.42,cy-R*.46,0,cx-R*.18,cy-R*.20,R*.55);
    spec.addColorStop(0,'rgba(255,255,255,.12)'); spec.addColorStop(0.5,'rgba(255,255,255,.03)'); spec.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI); ctx.fillStyle=spec; ctx.fill();
  }

  /* ═══════════════════════════════════════════════════════════════
     GEOMETRY BUILDERS
  ═══════════════════════════════════════════════════════════════ */

  _buildNucleus(protones, neutrones) {
    const total = protones + neutrones;
    if (total === 0) return { particles: [], boundR: 8 };

    const types = [...Array(protones).fill('p'), ...Array(neutrones).fill('n')];
    for (let i = types.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [types[i], types[j]] = [types[j], types[i]];
    }

    const r = total === 1 ? 9 : Math.max(3, Math.min(9, 22 / Math.cbrt(total)));
    let placed;

    if (total <= 40) {
      /* Greedy tangent packing — tight, natural clusters for small nuclei */
      const isValid = (nx,ny,nz) => {
        for (const p of placed) {
          const dx=nx-p.lx, dy=ny-p.ly, dz=nz-p.lz;
          if (dx*dx+dy*dy+dz*dz < (2*r-0.05)**2) return false;
        }
        return true;
      };
      const S = 16;
      const candidates = () => {
        const pts = [];
        for (let a = 0; a < placed.length; a++) {
          const pa = placed[a];
          for (let ti=0;ti<6;ti++){const th=(ti/6)*Math.PI;for(let s=0;s<S;s++){const ph=(s/S)*2*Math.PI;pts.push([pa.lx+2*r*Math.sin(th)*Math.cos(ph),pa.ly+2*r*Math.sin(th)*Math.sin(ph),pa.lz+2*r*Math.cos(th)]);}}
          for (let b=a+1;b<placed.length;b++){
            const pb=placed[b];const dx=pb.lx-pa.lx,dy=pb.ly-pa.ly,dz=pb.lz-pa.lz;const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
            if(d>4*r+0.1||d<0.01)continue;const h2=4*r*r-d*d/4;if(h2<0)continue;const h=Math.sqrt(h2);
            const mx=(pa.lx+pb.lx)/2,my=(pa.ly+pb.ly)/2,mz=(pa.lz+pb.lz)/2;
            const abx=dx/d,aby=dy/d,abz=dz/d;
            let ux,uy,uz;
            if(Math.abs(abx)<=Math.abs(aby)&&Math.abs(abx)<=Math.abs(abz)){ux=0;uy=-abz;uz=aby;}
            else if(Math.abs(aby)<=Math.abs(abz)){ux=-abz;uy=0;uz=abx;}
            else{ux=-aby;uy=abx;uz=0;}
            const ul=Math.sqrt(ux*ux+uy*uy+uz*uz);ux/=ul;uy/=ul;uz/=ul;
            const vx=aby*uz-abz*uy,vy=abz*ux-abx*uz,vz=abx*uy-aby*ux;
            for(let s=0;s<S;s++){const ang=(2*Math.PI*s)/S;const c=h*Math.cos(ang),ss=h*Math.sin(ang);pts.push([mx+ux*c+vx*ss,my+uy*c+vy*ss,mz+uz*c+vz*ss]);}
          }
        }
        return pts;
      };
      placed = [{lx:0,ly:0,lz:0,r,type:types[0]}];
      for (let i=1;i<total;i++){
        const pts=candidates();let best=null,bestD=Infinity;
        for(const [nx,ny,nz] of pts){if(!isValid(nx,ny,nz))continue;const d=nx*nx+ny*ny+nz*nz;if(d<bestD){bestD=d;best=[nx,ny,nz];}}
        if(!best){const g=Math.PI*(3-Math.sqrt(5));const yi=1-(i/(total-1||1))*2;const rad=Math.sqrt(Math.max(0,1-yi*yi))*r*2.1*Math.cbrt(i+1);best=[rad*Math.cos(g*i),yi*r*2.1*Math.cbrt(i+1),rad*Math.sin(g*i)];}
        placed.push({lx:best[0],ly:best[1],lz:best[2],r,type:types[i]});
      }
    } else {
      /* Fibonacci sphere — O(n), uniform fill, no freeze for large nuclei */
      const golden = Math.PI * (3 - Math.sqrt(5));
      const sphR   = r * Math.cbrt(total) * 0.58;
      placed = types.map((type, i) => {
        const y   = 1 - (2 * i) / (total - 1);
        const rad = Math.sqrt(Math.max(0, 1 - y*y)) * sphR;
        const ang = i * golden;
        return { lx: rad*Math.cos(ang), ly: y*sphR, lz: rad*Math.sin(ang), r, type };
      });
    }

    const boundR = placed.reduce(
      (m,p) => Math.max(m, Math.sqrt(p.lx**2+p.ly**2+p.lz**2)+r), 0);
    return { particles: placed, boundR };
  }

  _buildElectrons(total, nucleusBoundR) {
    const capacities = [2,8,18,32,32,18,8];
    const layers = []; let remaining = total;
    for (let i = 0; i < capacities.length && remaining > 0; i++) {
      layers.push(Math.min(remaining, capacities[i]));
      remaining -= layers[layers.length - 1];
    }
    const BASE_ORBIT = nucleusBoundR + 26, ORBIT_GAP = 34;
    const electrons  = [], golden = Math.PI * (3 - Math.sqrt(5));
    layers.forEach((count, layerIdx) => {
      const orbitR = BASE_ORBIT + layerIdx * ORBIT_GAP;
      for (let e = 0; e < count; e++) {
        const globalIdx = electrons.length, totalE = total || 1;
        const yi    = 1 - (2 * globalIdx + 1) / totalE;
        const tiltX = Math.acos(Math.max(-1, Math.min(1, yi)));
        const tiltY = golden * globalIdx;
        electrons.push({
          orbitR,
          angle: (2 * Math.PI * e) / count,
          speed: (0.028 - layerIdx * 0.003) * (e % 2 === 0 ? 1 : -1),
          tiltX, tiltY,
        });
      }
    });
    return electrons;
  }

  _countShells(total) {
    const caps = [2,8,18,32,32,18,8];
    let n = 0, rem = total;
    for (let i = 0; i < caps.length && rem > 0; i++) { rem -= caps[i]; n++; }
    return Math.max(1, n);
  }
}

customElements.define('diagrama-atomo', DiagramaAtomo);
