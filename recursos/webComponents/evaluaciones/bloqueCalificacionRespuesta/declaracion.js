class DeclaracionRespuesta extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const anuncioCorrecto = document.createElement("div");
        anuncioCorrecto.classList = "anuncio anuncioCorrecto";
        anuncioCorrecto.textContent = "¡Correcto!";

        const anuncioIncorrecto = document.createElement("div");
        anuncioIncorrecto.classList = "anuncio anuncioIncorrecto";
        anuncioIncorrecto.textContent = "Incorrecto...";

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(anuncioCorrecto);
        shadowRoot.appendChild(anuncioIncorrecto);

        //Style
        const textoEstilo = `
        .anuncio{
            padding: 1.5rem 1rem;
            display: flex;
            gap: rem;
            justify-content: center;
            align-items: center;
            width: min(200px, 90vw);
            border-radius: 0.5rem;
            color: whitesmoke;
            margin: 1rem auto;
            display: none;
            transition-timing-function: ease-out;
        }
        .anuncioCorrecto{
            background-color: var(--correcto);
        }
        .anuncioIncorrecto{
            background-color: var(--incorrecto);
        }
        `;
        const estilo = new CSSStyleSheet();
        estilo.replaceSync(textoEstilo);
        shadowRoot.adoptedStyleSheets = [estilo];
    }
    anunciarRespuestaCorrecta() {
        const anuncio = this.shadowRoot.querySelector(".anuncioCorrecto");
        const anuncioNo = this.shadowRoot.querySelector(".anuncioIncorrecto");
        anuncioNo.style.display = "none";
        this.animarAnuncio(anuncio);
    }
    anunciarRespuestaIncorrecta() {
        const anuncio = this.shadowRoot.querySelector(".anuncioIncorrecto");
        const anuncioNo = this.shadowRoot.querySelector(".anuncioCorrecto");
        anuncioNo.style.display = "none";
        anuncio.style.display = "flex";
        this.animarAnuncio(anuncio);
    }
    animarAnuncio(anuncio) {
        anuncio.scrollIntoView({ behavior: "smooth" });
        anuncio.style.display = "flex";
        anuncio.style.opacity = "0";
        anuncio.style.transform = "translateY(-50%)";
        setTimeout(() => {
            anuncio.style.transition = "opacity 0.5s, transform 0.5s"
        }, 5);

        setTimeout(() => {
            anuncio.style.opacity = "1";
            anuncio.style.transform = "translateY(0%)";
        }, 10);

        setTimeout(() => {
            anuncio.style.transition = "";
        }, 500);
    }
}
customElements.define("declaracion-respuesta", DeclaracionRespuesta);
