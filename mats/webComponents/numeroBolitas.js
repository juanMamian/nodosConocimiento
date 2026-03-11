class NumeroBolitas extends HTMLElement {
    static observedAttributes = ["numero", "colorbolitas"];
    static radioConjuntoDefault = 160;
    static colorBolitasDefault = "red";
    radioConjunto;
    numero;
    canvas;
    conjunto;

    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: "open" });

        let colorBolitas = this.getAttribute("colorBolitas") || this.constructor.colorBolitasDefault;
        shadowRoot.host.style.setProperty("--colorBolitas", colorBolitas);

        this.conjunto = document.createElement("div");
        this.conjunto.id = "conjunto";
        this.radioConjunto = this.getAttribute("radioConjunto");
        if (this.radioConjunto == null) {
            this.radioConjunto = this.constructor.radioConjuntoDefault;
        }

        this.canvas = document.createElement("canvas");
        this.canvas.id = "canvasConjunto";
        this.conjunto.appendChild(this.canvas);

        shadowRoot.appendChild(this.conjunto);

        let numeroAttr = this.getAttribute("numero");
        if (numeroAttr == null) {
            numeroAttr = 0;
        }
        this.numero = Number(numeroAttr);
        this.configurarNumero();

        // Style
        const estilo = new CSSStyleSheet();
        estilo.replaceSync(`
:host {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 0px auto;
}
#conjunto {
    position: relative;
    border-radius: 50%;
    width: ${this.radioConjunto}px;
    height: ${this.radioConjunto}px;
    border: 2px solid black;
}
.bolita {
    border-radius: 50%;
    border: 1px solid whitesmoke;
    max-width: 30px;
    max-height: 30px;
    width: 10px;
    height: 10px;
    background-color: var(--colorBolitas, red);
    position: absolute;
    transform: translate(-50%, -50%);
    /* Smooth movement for dividir() animation */
    transition: background-color 0.8s, opacity 0.8s,
                left 0.6s cubic-bezier(0.34, 1.28, 0.64, 1),
                top  0.6s cubic-bezier(0.34, 1.28, 0.64, 1);
}
.bolita.eliminada {
    background-color: black;
    opacity: 0.08;
}
#canvasConjunto {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    /* Canvas sits above balls so lines draw on top */
    pointer-events: none;
}
`);
        shadowRoot.adoptedStyleSheets = [estilo];
    }

    restaurar() {
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const bolitas = conjunto.querySelectorAll(".bolita");
        bolitas.forEach(bolita => {
            bolita.classList.remove("eliminada");
        });
    }
    listarPosiciones() {
        const bolitas = this.conjunto.querySelectorAll(".bolita");
        const boxConjunto = this.conjunto.getBoundingClientRect();
        const posiciones = Array.from(bolitas).map(bolita => {
            const boxBolita = bolita.getBoundingClientRect();

            return {
                x: (boxBolita.left + (boxBolita.width / 2) - boxConjunto.left) / boxConjunto.width,
                y: (boxBolita.top + (boxBolita.height / 2) - boxConjunto.top) / boxConjunto.height,
            }
        })
        console.log(`Retornando ${JSON.stringify(posiciones)}`);
        return posiciones;
    }
    asignarPosiciones(posiciones) {
        const bolitas = this.conjunto.querySelectorAll(".bolita");
        for (let i = 0; i < bolitas.length; i++) {
            if (!posiciones[i]) {
                return
            }
            bolitas[i].style.left = posiciones[i].x * 100 + "%";
            bolitas[i].style.top = posiciones[i].y * 100 + "%";
        }
    }
    insertarBolas(infos) {
        infos.forEach(info => {
            const elementoBola = document.createElement("div");
            elementoBola.classList = "bolita";
            if (info.y) {
                elementoBola.style.top = info.y + "%";
            }
            else {
                elementoBola.style.top = "50%";
            }
            if (info.x) {
                elementoBola.style.left = info.x + "%";
            }
            else {
                elementoBola.style.left = "50%";
            }
            this.conjunto.appendChild(elementoBola);
        });
    }
    restar(sustraendo) {
        if (sustraendo > this.numero) {
            throw "No se puede sustraer un número mayor al número";
        }
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const bolasSustraer = Array.from(
            conjunto.querySelectorAll(".bolita")
        ).slice(0, sustraendo);

        bolasSustraer.forEach((bolita, index) => {
            setTimeout(() => {
                bolita.classList.add("eliminada");
            }, index * 800);
        });
    }

    /**
     * Highlights one region by fading out all balls that don't belong to it.
     *
     * Balls are assigned to regions the same way dividir() does it — round-robin
     * (ball i → region i % divisor) — so the result is consistent if called
     * after dividir() with the same divisor.
     *
     * @param {number} region  - Index of the region to highlight (0-based)
     * @param {number} divisor - Number of regions (must match the dividir() call)
     * @param {number} delay   - Ms between each ball fade (default 80)
     */
    destacarRegion(region, divisor, delay = 80) {
        if (region < 0 || region >= divisor) {
            throw new Error(`La región debe estar entre 0 y ${divisor - 1}`);
        }

        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const bolitas = Array.from(conjunto.querySelectorAll(".bolita"));

        // Clear any previous highlighting first
        bolitas.forEach(bolita => bolita.classList.remove("eliminada"));

        // Fade out every ball that does NOT belong to the highlighted region
        const aEliminar = bolitas.filter((_, i) => (i % divisor) !== region);

        aEliminar.forEach((bolita, index) => {
            setTimeout(() => {
                bolita.classList.add("eliminada");
            }, index * delay);
        });
    }

    /**
     * Animates a division of the circle into `divisor` pizza-slice regions.
     *
     * Phase 1 — Lines: Draws `divisor` divider lines on the canvas one by one,
     *            each separated by `lineDelay` ms.
     * Phase 2 — Balls: After the lines finish, moves each ball into its assigned
     *            region one by one, separated by `ballDelay` ms.
     *
     * Balls are assigned round-robin (ball i → region i % divisor), so all
     * regions end up with an equal count or at most one extra.
     *
     * @param {number} divisor    - Number of regions (pizza slices)
     * @param {number} ballDelay  - Ms between each ball's movement (default 180)
     * @param {number} lineDelay  - Ms between each divider line drawn (default 150)
     * @returns {Promise<void>}   - Resolves when all balls have moved
     */
    async dividir(divisor, opacarRegiones = true, ballDelay = 180, lineDelay = 150) {
        if (divisor < 2) throw new Error("El divisor debe ser al menos 2");

        // ── Phase 1: draw divider lines on the canvas ──────────────────────
        await this._dibujarDivisores(divisor, lineDelay);

        // Wait for the last line's draw animation to finish
        await this._sleep(lineDelay * divisor + 300);

        // ── Phase 2: move balls into their regions one by one ──────────────
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const bolitas = Array.from(conjunto.querySelectorAll(".bolita"));
        const n = bolitas.length;
        const r = this.calcularRadioBolitas(n, 0.25);

        // Round-robin region assignment: ball i goes to region (i % divisor)
        const asignaciones = bolitas.map((_, i) => i % divisor);

        // Find a non-overlapping position inside each ball's assigned slice
        const posiciones = this._posicionesEnRegiones(asignaciones, divisor, r, n);

        for (let i = 0; i < bolitas.length; i++) {
            bolitas[i].style.left = posiciones[i].x + "%";
            bolitas[i].style.top = posiciones[i].y + "%";
            await this._sleep(ballDelay);
        }
        if (opacarRegiones) {
            await this._sleep(1000);
            this.destacarRegion(0, divisor, 0);
        }
    }

    /**
     * Draws `k` lines from the center to the edge on the canvas,
     * one per `lineDelay` ms, using requestAnimationFrame for crisp rendering.
     *
     * Each line is drawn with a CSS-like dash animation by interpolating
     * the drawn length from 0 to full radius over ~400ms.
     *
     * @param {number} k          - Number of divider lines
     * @param {number} lineDelay  - Ms between the start of each line
     */
    async _dibujarDivisores(k, lineDelay) {
        const canvas = this.canvas;
        const size = parseInt(this.radioConjunto);
        // Keep canvas pixel size in sync with its CSS size
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2;

        ctx.clearRect(0, 0, size, size);

        const sliceAngle = (2 * Math.PI) / k;
        const drawDuration = 380; // ms for each line to grow from center to edge

        // Draw each line with a growing animation
        const drawLine = (index) => {
            return new Promise(resolve => {
                const angle = index * sliceAngle - Math.PI / 2;
                const targetX = cx + radius * Math.cos(angle);
                const targetY = cy + radius * Math.sin(angle);
                const startTime = performance.now();

                const frame = (now) => {
                    const progress = Math.min((now - startTime) / drawDuration, 1);
                    // Ease out: fast start, smooth finish
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const curX = cx + (targetX - cx) * eased;
                    const curY = cy + (targetY - cy) * eased;

                    // Redraw all previously completed lines + this one in progress
                    ctx.clearRect(0, 0, size, size);
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 1.5;

                    // All fully drawn lines (indices 0..index-1)
                    for (let j = 0; j < index; j++) {
                        const a = j * sliceAngle - Math.PI / 2;
                        const x2 = cx + radius * Math.cos(a);
                        const y2 = cy + radius * Math.sin(a);
                        ctx.beginPath();
                        ctx.moveTo(cx, cy);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }

                    // Current line in progress
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(curX, curY);
                    ctx.stroke();

                    if (progress < 1) {
                        requestAnimationFrame(frame);
                    } else {
                        resolve();
                    }
                };

                requestAnimationFrame(frame);
            });
        };

        // Start each line after lineDelay ms, but don't await — let them overlap
        for (let i = 0; i < k; i++) {
            await this._sleep(lineDelay);
            drawLine(i); // fire and forget — next line starts after delay
        }
    }

    /**
     * Finds non-overlapping positions for all balls within their assigned slices.
     *
     * Each slice spans angles [i * sliceAngle, (i+1) * sliceAngle], offset so
     * the first slice starts at the top (−π/2). Points are sampled uniformly
     * within the slice using sqrt-distributed radius (avoids center clustering).
     *
     * Overlap is checked globally across all placed balls so balls near a
     * divider line don't clip into each other across the boundary.
     *
     * @param {number[]} asignaciones - Region index for each ball
     * @param {number}   k            - Total number of regions
     * @param {number}   r            - Ball radius as fraction of outer radius
     * @param {number}   n            - Total ball count
     * @returns {{ x: number, y: number }[]} Positions as percentages (0–100)
     */
    _posicionesEnRegiones(asignaciones, k, r, n, maxIntentos = 2000) {
        const sliceAngle = (2 * Math.PI) / k;
        const boundary = 1 - r;
        const minDist = 2 * r * 1.04;
        const colocadas = [];
        const resultados = new Array(n);

        for (let i = 0; i < n; i++) {
            const region = asignaciones[i];
            const startAngle = region * sliceAngle - Math.PI / 2;

            let colocada = false;
            for (let intento = 0; intento < maxIntentos; intento++) {
                const dist = Math.sqrt(Math.random()) * boundary;
                const x = dist * Math.cos(startAngle); // placeholder, recalculated below

                // Angular margin: at this distance from center, the ball (radius r)
                // needs to be at least arcsin(r / dist) away from each boundary line
                // so its edge never crosses it. We add a small extra factor (1.1)
                // so there's a visible gap rather than just touching.
                const margin = dist > r
                    ? Math.asin(Math.min((r * 1.1) / dist, 1))
                    : sliceAngle / 2; // if extremely close to center, use midpoint

                // Sample only within the safe angular band, away from both edges
                const safeStart = startAngle + margin;
                const safeEnd = startAngle + sliceAngle - margin;

                // If the margin consumes the whole slice (too many balls / too large r),
                // fall through to the fallback below
                if (safeEnd <= safeStart) break;

                const angle = safeStart + Math.random() * (safeEnd - safeStart);
                const px = dist * Math.cos(angle);
                const py = dist * Math.sin(angle);

                const choca = colocadas.some(p =>
                    Math.hypot(p.x - px, p.y - py) < minDist
                );

                if (!choca) {
                    colocadas.push({ x: px, y: py });
                    // Convert from unit-circle [-1,1] to percentage [0,100]
                    resultados[i] = {
                        x: (px + 1) / 2 * 100,
                        y: (py + 1) / 2 * 100,
                    };
                    colocada = true;
                    break;
                }
            }

            if (!colocada) {
                // Fallback: place at the middle of the slice at half radius
                const midAngle = startAngle + sliceAngle / 2;
                const px = 0.5 * Math.cos(midAngle);
                const py = 0.5 * Math.sin(midAngle);
                resultados[i] = {
                    x: (px + 1) / 2 * 100,
                    y: (py + 1) / 2 * 100,
                };
            }
        }

        return resultados;
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    distribuirBolitas() {
        const posiciones = this.constructor.getPosicionesBolas(this.bolitas.length, this.radioBolitasRelativo);
        for (let i = 0; i < posiciones.length; i++) {
            if (!posiciones[i]) {
                console.log(`Error: No había posición para la bolita ${i}`);
                this.bolitas[i].top = "50%";
                this.bolitas[i].left = "50%";

            }
            this.bolitas[i].style.top = Math.round(posiciones[i].y) + "%";
            this.bolitas[i].style.left = Math.round(posiciones[i].x) + "%";
        }
    }
    syncBolitas() {
        this.bolitas = this.conjunto.querySelectorAll(".bolita");
    }
    configurarNumero() {
        this.conjunto?.querySelectorAll(".bolita").forEach(bolita => bolita.remove());

        // Clear any division lines from a previous dividir() call
        const ctx = this.canvas?.getContext("2d");
        ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.conjunto) {
            this.insertarBolas(new Array(this.numero).fill({}));
            this.syncBolitas()
            this.calcularRadioBolitas(0.1);
            this.distribuirBolitas();
        }

    }

    attributeChangedCallback(atributo, antes, ahora) {
        if (atributo === "numero") {
            this.numero = Number(ahora);
            this.configurarNumero();
        }
        else if (atributo === 'colorbolitas') {
            this.shadowRoot && this.shadowRoot.style.setProperty("--colorBolitas", ahora);
        }
    }

    calcularRadioBolitas(cobertura = 0.25) {
        this.radioBolitasRelativo = Math.min(Math.sqrt(cobertura / this.bolitas.length), 0.9);
        this.bolitas.forEach(bolita => {
            bolita.style.height = this.radioBolitasRelativo * 100 + "%";
            bolita.style.width = this.radioBolitasRelativo * 100 + "%";
        })
    }

    static getPosicionesBolas(n, r, guarda = 1000) {
        if (n <= 0) return [];

        const boundaryRadius = 1 - r;
        const minDistance = 2 * r * 1.04;
        const placed = [];

        for (let i = 0; i < n; i++) {
            let accepted = false;

            for (let attempt = 0; attempt < guarda; attempt++) {
                const angle = Math.random() * 2 * Math.PI;
                const dist = Math.sqrt(Math.random()) * boundaryRadius;
                const x = dist * Math.cos(angle);
                const y = dist * Math.sin(angle);

                const overlaps = placed.some(p => {
                    const dx = p.x - x;
                    const dy = p.y - y;
                    return Math.sqrt(dx * dx + dy * dy) < minDistance;
                });

                if (!overlaps) {
                    placed.push({ x, y });
                    accepted = true;
                    break;
                }
            }

            if (!accepted) {
                console.warn(
                    `randomBallPositions: could only place ${placed.length}/${n} balls. ` +
                    `Try reducing n or coverage.`
                );
                break;
            }
        }

        return placed.map(p => ({
            x: (p.x + 1) / 2 * 100,
            y: (p.y + 1) / 2 * 100,
        }));
    }
}

customElements.define("representacion-numero-bolitas", NumeroBolitas);
