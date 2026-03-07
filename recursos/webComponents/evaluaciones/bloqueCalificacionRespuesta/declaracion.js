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

        const botonRefreshReto = document.createElement("button");
        const imgRefresh = document.createElement("img");
        imgRefresh.src = "/nodosConocimiento/recursos/iconos/refresh.svg";
        botonRefreshReto.classList = "boton"
        botonRefreshReto.id = "botonRefreshReto"
        botonRefreshReto.appendChild(imgRefresh);
        botonRefreshReto.appendChild(document.createTextNode("Nuevo..."));

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(anuncioCorrecto);
        shadowRoot.appendChild(anuncioIncorrecto);
        shadowRoot.appendChild(botonRefreshReto);

        //Script
        botonRefreshReto.addEventListener("click", this.enviarRefreshPregunta);

        //Style
        const textoEstilo = `
        :host{
            display: flex;
            min-height: 10rem;
            flex-direction: column;
        }
        *{
            box-sizing: border-box;
        }
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
        #botonRefreshReto{
            display: none;
        }
        .boton{
            cursor: pointer;
            display: flex;
            gap: 1rem;
            background-color: var(--accion);
            padding: 1.2rem 1.5rem;
            align-items: center;
            justify-content: center;
            width: fit-content;
            border-radius: 0.5rem;
            box-shadow: 2px 2px 2px gray;
            margin: 0px auto;
        }
        .boton img{
            height: 1rem;
        }
        `;
        const estilo = new CSSStyleSheet();
        estilo.replaceSync(textoEstilo);
        shadowRoot.adoptedStyleSheets = [estilo];
    }
    reiniciar() {
        const anuncioCorrecto = this.shadowRoot.querySelector(".anuncioCorrecto");
        const anuncioIncorrecto = this.shadowRoot.querySelector(".anuncioIncorrecto");

        anuncioCorrecto.style.display = "none";
        anuncioIncorrecto.style.display = "none";
        this.ocultarBotonRefresh();
    }
    enviarRefreshPregunta() {
        this.dispatchEvent(new CustomEvent("triggerRefreshPregunta", {
            bubbles: true,
            composed: true,
        }));
    }
    mostrarBotonRefresh() {
        const boton = this.shadowRoot.querySelector("#botonRefreshReto");

        boton.style.transition = "";
        boton.style.display = "flex";
        boton.style.opacity = "0";

        setTimeout(() => {
            boton.style.transition = "opacity 0.5s";
            boton.style.opacity = "1";
        }, 5);

        setTimeout(() => {
            boton.style.transition = "";
        }, 500);
    }
    ocultarBotonRefresh() {
        const boton = this.shadowRoot.querySelector("#botonRefreshReto");
        boton.style.transition = "";
        boton.style.display = "none";
    }
    anunciarRespuestaCorrecta() {
        const anuncio = this.shadowRoot.querySelector(".anuncioCorrecto");
        const anuncioNo = this.shadowRoot.querySelector(".anuncioIncorrecto");
        anuncioNo.style.display = "none";
        this.animarAnuncio(anuncio);
        setTimeout(() => {
            this.mostrarBotonRefresh();
        }, 700)
    }
    anunciarRespuestaIncorrecta() {
        const anuncio = this.shadowRoot.querySelector(".anuncioIncorrecto");
        const anuncioNo = this.shadowRoot.querySelector(".anuncioCorrecto");
        anuncioNo.style.display = "none";
        anuncio.style.display = "flex";
        this.animarAnuncio(anuncio);
        this.ocultarBotonRefresh();
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
