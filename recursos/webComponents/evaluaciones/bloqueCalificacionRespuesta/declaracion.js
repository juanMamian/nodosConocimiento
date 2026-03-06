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
        anuncio.style.display = "flex";
        anuncioNo.style.display = "none";
    }
    anunciarRespuestaIncorrecta() {
        const anuncio = this.shadowRoot.querySelector(".anuncioIncorrecto");
        const anuncioNo = this.shadowRoot.querySelector(".anuncioCorrecto");
        anuncioNo.style.display = "none";
        anuncio.style.display = "flex";
    }
}
customElements.define("declaracion-respuesta", DeclaracionRespuesta);
