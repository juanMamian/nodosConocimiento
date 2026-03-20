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

        this.conjunto = document.createElement("div");
        this.conjunto.id = "conjunto";

        shadowRoot.appendChild(this.conjunto);

        this.syncBolitasConNumero();

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
    border-radius: 10px;
    border: 2px dashed gray;
    display:flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    width: 19rem;
    padding: 1rem 0.5rem;
    background-color: #80808014;
}
.bolita {
    border-radius: 50%;
    border: 1px solid whitesmoke;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    flex-grow: 0;
    box-sizing: border-box;
    /* Smooth movement for dividir() animation */
    transition: background-color 0.8s, opacity 0.2s,
                left 0.6s cubic-bezier(0.34, 1.28, 0.64, 1),
                top  0.6s cubic-bezier(0.34, 1.28, 0.64, 1);
}
.bolita:not(.eliminada){
    background-color: var(--colorBolitas, red);
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
    insertarBolas(infos, step = 500) {
        infos.forEach((info, index) => {
            const elementoBola = document.createElement("div");
            elementoBola.classList = "bolita";
            elementoBola.style.backgroundColor = info.color;
            elementoBola.style.opacity = "0";

            const conAnimacion = info.animateFrom?.y && info.animateFrom?.x;
            this.conjunto.appendChild(elementoBola);
            if (conAnimacion) {
                setTimeout(() => {
                    const box = elementoBola.getBoundingClientRect();
                    elementoBola.style.transform = `translate(${info.animateFrom.x - box.left}px, ${info.animateFrom.y - box.top}px )`;
                    elementoBola.style.opacity = "0";
                    elementoBola.style.zIndex = "1";
                }, 5);
                setTimeout(() => {
                    elementoBola.style.transition = "transform 1s";
                    elementoBola.style.transform = "translate(0%, 0%)";
                    elementoBola.style.opacity = "1";
                }, 10 + step * index);
            }
            else {
                elementoBola.style.opacity = "1";
            }
        });
    }
    restar(sustraendo) {
        if (sustraendo > this.numero) {
            throw "No se puede sustraer un número mayor al número";
        }
        const conjunto = this.shadowRoot.querySelector("#conjunto");
        const elementosBolas = Array.from(conjunto.querySelectorAll(".bolita"));
        const bolasSustraer = elementosBolas.slice(elementosBolas.length - sustraendo);

        for (let i = bolasSustraer.length - 1; i > bolasSustraer.length - 1 - sustraendo; i--) {
            setTimeout(() => {
                bolasSustraer[i].classList.add("eliminada");
            }, (sustraendo - 1 - i) * 800);
        }
    }

    syncBolitasConNumero() {
        if (!this.conjunto) {
            return;
        }
        this.conjunto.querySelectorAll(".bolita").forEach(elementoBolita => {
            elementoBolita.remove();
        })
        const colorBolitas = this.getAttribute("colorBolitas") || this.constructor.colorBolitasDefault;
        for (let i = 0; i < this.numero; i++) {
            const bolita = document.createElement("div");
            bolita.classList = "bolita";
            bolita.style.backgroundColor = colorBolitas;

            this.conjunto.appendChild(bolita);
        }
    }

    attributeChangedCallback(atributo, antes, ahora) {
        if (atributo === "numero") {
            this.numero = Number(ahora);
            this.syncBolitasConNumero();
        }
        else if (atributo === 'colorbolitas') {
            this.shadowRoot && this.shadowRoot.style.setProperty("--colorBolitas", ahora);
        }
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
