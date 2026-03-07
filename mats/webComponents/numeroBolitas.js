class NumeroBolitas extends HTMLElement {
    static observedAttributes = ["numero"];
    static radioConjuntoDefault = 200;
    static colorBolitasDefault = "red";
    colorBolitas;
    radioConjunto;
    numero;
    constructor() {
        super();
    }
    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: "open" });
        this.colorBolitas = this.constructor.colorBolitasDefault;

        const conjunto = document.createElement("div");
        conjunto.id = "conjunto";
        this.radioConjunto = this.getAttribute("radioConjunto");
        if (this.radioConjunto == null) {
            this.radioConjunto = this.constructor.radioConjuntoDefault;
        }

        shadowRoot.appendChild(conjunto);

        //Style
        const estilo = new CSSStyleSheet();
        estilo.replaceSync(`
:host{
display: flex;
gap:1rem;
justify-content: center;
margin: 0px auto;
}
#conjunto{
position: relative;
border-radius: 50%;
width: ${this.radioConjunto}px;
height: ${this.radioConjunto}px;
border: 2px solid black;
}
.bolita{
border-radius: 50%;
max-width: 30px;
max-height: 30px;
width: 10px;
height: 10px;
background-color: ${this.colorBolitas};
position: absolute;
transform: translate(-50%, -50%);
transition: background-color 0.8s, opacity 0.8s;
}
.bolita.eliminada{
background-color: black;
opacity: 0.08;
}
`);
        shadowRoot.adoptedStyleSheets = [estilo];
    }
    restaurar() {
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const bolitas = conjunto.querySelectorAll(".bolita");
        bolitas.forEach(bolita => {
            bolita.classList.remove("eliminada");
        })
    }
    restar(sustraendo) {
        if (sustraendo > this.numero) {
            throw "No se puede sustraer un número mayor al número"
        }
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const bolasSustraer = Array.from(conjunto.querySelectorAll(".bolita")).slice(0, sustraendo);

        bolasSustraer.forEach((bolita, index) => {
            setTimeout(() => {
                bolita.classList.add("eliminada");
            }, index * 800);
        })
    }
    configurarNumero() {
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        conjunto.querySelectorAll(".bolita").forEach(bolita => {
            bolita.remove();
        })

        const radioBolitasRelativo = this.calcularRadioBolitas(this.numero, 0.2);
        const radioBolitas = radioBolitasRelativo * this.radioConjunto;
        const posiciones = this.getPosicionesBolas(this.numero, radioBolitasRelativo);
        for (let i = 0; i < this.numero; i++) {
            const bolita = document.createElement("div");
            bolita.classList = "bolita";

            bolita.style.height = radioBolitas + "px";
            bolita.style.width = radioBolitas + "px";

            bolita.style.top = posiciones[i].x + "%";
            bolita.style.left = posiciones[i].y + "%";

            conjunto.appendChild(bolita);
        }

    }
    attributeChangedCallback(atributo, antes, ahora) {
        if (atributo === 'numero') {
            this.numero = Number(ahora);
            this.configurarNumero();
        }
    }
    calcularRadioBolitas(n, cobertura = 0.25) {
        // n × πr² = coverage × π×1²  →  r = sqrt(coverage / n)
        return Math.min(Math.sqrt(cobertura / n), 0.9);
    }
    getPosicionesBolas(n, r, guarda = 1000) {
        if (n <= 0) throw new Error("n must be >= 1");

        // The center of each ball must stay at least r away from the outer edge,
        // so centers are constrained to a smaller circle of radius (1 - r).
        const boundaryRadius = 1 - r;

        // Minimum distance allowed between any two ball centers.
        // The 1.04 padding factor adds a 4% visual gap so balls don't touch.
        const minDistance = 2 * r * 1.04;

        const placed = []; // unit-circle coordinates, range [-1, 1]

        for (let i = 0; i < n; i++) {
            let accepted = false;

            for (let attempt = 0; attempt < guarda; attempt++) {
                // Sample a uniformly random point inside the boundary disk.
                // Using sqrt(rand) for the radius gives uniform area distribution
                // (without it, points cluster near the center).
                const angle = Math.random() * 2 * Math.PI;
                const dist = Math.sqrt(Math.random()) * boundaryRadius;
                const x = dist * Math.cos(angle);
                const y = dist * Math.sin(angle);

                // Reject if this ball would overlap any already-placed ball
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

            // If a ball couldn't be placed after maxRetries, stop early.
            // This prevents an infinite loop when the space is genuinely full.
            if (!accepted) {
                console.warn(
                    `randomBallPositions: could only place ${placed.length}/${n} balls. ` +
                    `Try reducing n or coverage.`
                );
                break;
            }
        }

        // Convert from unit-circle coordinates [-1, 1] to percentages [0, 100].
        // Unit x=-1 → 0%, x=0 → 50%, x=1 → 100%
        return placed.map(p => ({
            x: (p.x + 1) / 2 * 100,
            y: (p.y + 1) / 2 * 100,
        }));
    }
}

customElements.define("representacion-numero-bolitas", NumeroBolitas);
