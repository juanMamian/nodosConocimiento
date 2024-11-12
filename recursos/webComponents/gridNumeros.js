class gridNumeros extends HTMLElement {
	static observedAttributes = ["numero"];

	static rangoSquareArriba = 0.9;
	static rangoSquareAbajo = 1;
	static rangoRowArriba = 0.5;
	static rangoRowAbajo = 0.9;

	static longitudSquareAsMain = this.rangoSquareAbajo + (1 - this.rangoRowAbajo);
	static longitudRowAsMain = this.rangoRowAbajo + (1 - this.rangoSquareAbajo);

	constructor(numero) {
		super();
		this.conectado = false;
		this.numero = numero;
		this.esquinaVisible = {
			x: -10,
			y: -10
		}
		this.zoom = -1.85;
	}
	attributeChangedCallback(nombre, antes, nuevo) {
		console.log(`${nombre} pasó de ${antes} a ${nuevo}`);
		if (nombre === 'numero') {
			this.numero = Number(nuevo);
		}
		if (!this.conectado) {
			return;
		}
		this.redibujar();


	}
	redibujar() {
		console.log(`Redibujando con zoom ${this.zoom}`);
		if (!this.conectado) {
			return;
		}
		this.lapiz.clearRect(0, 0, this.dimensionesCanvas.x, this.dimensionesCanvas.y);

		//Poblar con el zoom actual si es un número entero.
		if (Math.abs(this.zoom % 2) === 1) {
			console.log(`actual`);
			this.poblarConConjuntos(-this.zoom, 100);
		}
		else {

			let distanciaHaciaArriba = Math.abs(this.zoom - Math.ceil(this.zoom));
			let distanciaHaciaAbajo = Math.abs(this.zoom - Math.floor(this.zoom));
			//Poblar con conjunto par si se está en el rango. Ej: -0.7 a 0.9 para el 0.
			let presenciaSquare;
			if (Math.abs(Math.ceil(this.zoom) % 2) === 0 && distanciaHaciaArriba <= gridNumeros.rangoSquareAbajo) {
				presenciaSquare = (gridNumeros.rangoSquareAbajo - (Math.ceil(this.zoom) - this.zoom)) / ((gridNumeros.rangoRowArriba - (1 - gridNumeros.rangoSquareAbajo)) / 100);
				if (presenciaSquare > 100) presenciaSquare = 100;
				if (presenciaSquare < 0) presenciaSquare = 0;
				this.poblarConConjuntos(-Math.ceil(this.zoom), presenciaSquare);
			}
			if (Math.abs(Math.floor(this.zoom) % 2) === 0 && distanciaHaciaAbajo <= gridNumeros.rangoSquareArriba) {
				presenciaSquare = (gridNumeros.rangoSquareArriba - (this.zoom - Math.floor(this.zoom))) / ((gridNumeros.rangoRowAbajo - (1 - gridNumeros.rangoSquareArriba)) / 100);
				if (presenciaSquare > 100) presenciaSquare = 100;
				if (presenciaSquare < 0) presenciaSquare = 0;
				this.poblarConConjuntos(-Math.floor(this.zoom), presenciaSquare);
			}

			//Poblar con conjunto impar (Row) si esta suficientemente cerca. Ej: -1.2 a -0.3 para el conjunto 1.
			let presenciaRow;
			if (Math.abs(Math.ceil(this.zoom) % 2) === 1 && distanciaHaciaArriba <= gridNumeros.rangoRowAbajo) {
				console.log(`Row superior`);
				presenciaRow = ((this.zoom - Math.floor(this.zoom)) - (1 - gridNumeros.rangoRowAbajo)) / ((gridNumeros.rangoRowAbajo - (1 - gridNumeros.rangoSquareArriba)) / 100);
				if (presenciaRow > 100) presenciaRow = 100;
				if (presenciaRow < 0) presenciaRow = 0;
				this.poblarConConjuntos(-Math.ceil(this.zoom), presenciaRow);
			}
			if (Math.abs(Math.floor(this.zoom) % 2) === 1 && distanciaHaciaAbajo <= gridNumeros.rangoRowArriba) {
				console.log(`Row inferior`);
				presenciaRow = (gridNumeros.rangoRowArriba - (this.zoom - Math.floor(this.zoom))) / ((gridNumeros.rangoRowArriba - (1 - gridNumeros.rangoSquareAbajo)) / 100);
				if (presenciaRow > 100) presenciaRow = 100;
				if (presenciaRow < 0) presenciaRow = 0;
				this.poblarConConjuntos(-Math.floor(this.zoom), presenciaRow);
			}
		}

	}
	poblarConConjuntos(potencia, presencia) {
		console.log(`Poblando con conjuntos de potencia ${potencia} con presencia ${presencia}`);
		const esquinaFinalCanvas = {
			x: this.esquinaVisible.x + this.dimensionesCanvas.x * Math.pow(10, -this.zoom / 2),
			y: this.esquinaVisible.y + this.dimensionesCanvas.y * Math.pow(10, -this.zoom / 2),
		}

		const tipoConjunto = potencia % 2;

		//Calcular tamaño de este conjunto.
		const anchoConjunto = 6 * Math.pow(10, Math.ceil(potencia / 2) + 1);
		const altoConjunto = 6 * Math.pow(10, Math.ceil((potencia + 1) / 2));

		const identificadoresUltimoConjunto = {
			x: Math.floor(esquinaFinalCanvas.x / anchoConjunto),
			y: Math.floor(esquinaFinalCanvas.y / altoConjunto)
		}
		const identificadoresPrimerConjunto = { // Número parecido a coordenada que identifica con una label cada conjunto de esta potencia
			x: Math.floor(this.esquinaVisible.x / anchoConjunto),
			y: Math.floor(this.esquinaVisible.y / altoConjunto)
		}
		if (identificadoresPrimerConjunto.x < 0) identificadoresPrimerConjunto.x = 0;
		if (identificadoresPrimerConjunto.y < 0) identificadoresPrimerConjunto.y = 0;

		const numeroPrimerConjunto = this.identificadorConjuntoToNumero(potencia, identificadoresPrimerConjunto);

		//Dibujar

		let identificadorDibujar = {
			x: identificadoresPrimerConjunto.x,
			y: identificadoresPrimerConjunto.y,
		}
		let numeroDibujar = numeroPrimerConjunto;
		let guarda = 0;
		while (guarda < 50000 && numeroDibujar < Math.floor(this.numero / Math.pow(10, potencia))) {
			if (identificadorDibujar.x <= identificadoresUltimoConjunto.x && identificadorDibujar.x <= identificadoresUltimoConjunto.x) {
				this.dibujarConjuntoByNumero(potencia, numeroDibujar, presencia);
			}

			numeroDibujar++;
			identificadorDibujar = this.numeroConjuntoToIdentificador(potencia, numeroDibujar);
			/* 			console.log(`Proximo dibujar: ${JSON.stringify(identificadorDibujar)}`); */
			guarda++;
			if (identificadorDibujar.x > identificadoresUltimoConjunto.x && identificadorDibujar.y > identificadoresUltimoConjunto.y) {
				break;
			}
		}
	}
	dibujarConjuntoByNumero(potencia, numero, presencia) {
		let zoomCorregido = this.zoom / 2;
		const tipoConjunto = potencia % 2;
		const anchoConjunto = 6 * Math.pow(10, Math.ceil(potencia / 2) + 1);
		const altoConjunto = 6 * (Math.pow(10, Math.ceil((potencia + 1) / 2)));

		const posicion = this.numeroConjuntoToIdentificador(potencia, numero);
		this.lapiz.beginPath();

		let xZoomed = (posicion.x * anchoConjunto - this.esquinaVisible.x) * Math.pow(10, zoomCorregido);
		let yZoomed = (posicion.y * altoConjunto - this.esquinaVisible.y) * Math.pow(10, zoomCorregido);

		let anchoZoomed = anchoConjunto * Math.pow(10, zoomCorregido);
		let altoZoomed = altoConjunto * Math.pow(10, zoomCorregido);

		let xFinal = xZoomed;
		let yFinal = yZoomed;
		let anchoFinal = anchoZoomed;
		let altoFinal = altoZoomed;


		let minPadding = {
			x: tipoConjunto === 0 ? 2 : 0.5,
			y: tipoConjunto === 0 ? 2 : 10,
		}//Porcentaje
		let padding = {
			x: 0,
			y: 0
		}
		let proximoContrario; //Proximo número de tipo contrario a este. Ej: Si estamos dibujando squares, el más cercano número superior a this.zoom que es de tipo row, %2===1.
		let rangoAsMain;//Longitud del recorrido durante el cual este conjunto es main. Se saca de static properties de esta clase.
		let boundariesAsMain;//Umbrales en los cuales este conjunto es main.
		let recorridoAsMain;//Cuanto del rangoAsMain ha sido recorrido hacía abajo. En porcentajes.

		if (tipoConjunto === 0) {
			proximoContrario = Math.ceil(this.zoom) % 2 === 1 ? Math.ceil(this.zoom) : Math.ceil(this.zoom) + 1;
			rangoAsMain = gridNumeros.longitudSquareAsMain;
			boundariesAsMain = {
				start: -potencia - gridNumeros.rangoSquareAbajo,
				end: -potencia + 1 - gridNumeros.rangoRowAbajo
			}

		}
		else {
			proximoContrario = Math.ceil(this.zoom) % 2 === 0 ? Math.ceil(this.zoom) : Math.ceil(this.zoom) + 1;
			rangoAsMain = gridNumeros.longitudRowAsMain;
			boundariesAsMain = {
				start: -potencia - gridNumeros.rangoRowAbajo,
				end: -potencia + 1 - gridNumeros.rangoSquareAbajo
			}
		}

		recorridoAsMain = (boundariesAsMain.end - this.zoom) / (rangoAsMain / 100);
		/* 		console.log(`boundaries: ${JSON.stringify(boundariesAsMain)}, recorrido: ${recorridoAsMain}`); */
		if (recorridoAsMain < 0) recorridoAsMain = 0;
		if (recorridoAsMain > 100) recorridoAsMain = 100;
		padding.x = recorridoAsMain * 0.1;
		padding.y = recorridoAsMain * 0.1;
		/* if (padding.x < minPadding.x) padding.x = minPadding.x;
		if (padding.y < minPadding.y) padding.y = minPadding.y; */

		/* let conjuntoContenedorEstaPresente = this.zoom % 1 != 0 && ((tipoConjunto === 0 && Math.abs(this.zoom - Math.floor(this.zoom)) <= gridNumeros.rangoRowArriba) || (tipoConjunto === 1 && Math.abs(this.zoom - Math.floor(this.zoom)) <= gridNumeros.rangoAquareArriba));
		if (conjuntoContenedorEstaPresente) {
			padding.x *= 2;
			padding.y *= 2;
		} */
		xFinal = xFinal + anchoZoomed * padding.x / 100;
		yFinal = yFinal + altoZoomed * padding.y / 100;
		anchoFinal = anchoZoomed - anchoZoomed * 2 * padding.x / 100;
		altoFinal = altoZoomed - altoZoomed * 2 * padding.y / 100;
		let opacidad = presencia / 100;

		this.lapiz.rect(xFinal, yFinal, anchoFinal, altoFinal);
		this.lapiz.strokeStyle = `rgba(0, 0, 0, ${opacidad})`;
		this.lapiz.stroke();
	}
	numeroConjuntoToIdentificador(potencia, numero) {
		let tipo = potencia % 2;
		//Se obtiene el identificador sacando digitos intercalados de numero.

		let numeroString = String(numero);
		let digitos1 = [];
		let digitos2 = [];

		for (let i = numeroString.length - 1; i >= 0; i--) {
			let paso = numeroString.length - 1 - i;
			if (paso % 2 === 0) {
				digitos1.push(numeroString.charAt(i));
			}
			else {
				digitos2.push(numeroString.charAt(i));
			}
		}
		let posicion1 = digitos1.reduce((acc, digito, index) => {
			return acc + digito * Math.pow(10, index)
		}, 0);
		let posicion2 = digitos2.reduce((acc, digito, index) => {
			return acc + digito * Math.pow(10, index)
		}, 0);
		return {
			x: tipo === 0 ? posicion1 : posicion2,
			y: tipo === 1 ? posicion1 : posicion2,
		}

	}
	identificadorConjuntoToNumero(potencia, identificador) {
		let tipo = potencia % 2;

		let base = tipo === 0 ? 'x' : 'y';

		let identificadorString = {
			x: String(identificador.x),
			y: String(identificador.y),
		}
		let maxLength = Math.max(identificadorString.x.length, identificadorString.y.length);
		if (identificadorString.x.length < maxLength) {
			identificadorString.x = '0' + identificadorString.x;
		}
		if (identificadorString.y.length < maxLength) {
			identificadorString.y = '0' + identificadorString.y;
		}

		let numeroString = '';
		for (let i = maxLength - 1; i >= 0; i--) {
			let paso = maxLength - 1 - i;
			if (tipo === 0) {
				numeroString = identificadorString.x.charAt(i) + numeroString;
				numeroString = identificadorString.y.charAt(i) + numeroString;
			}
			else {
				numeroString = identificadorString.y.charAt(i) + numeroString;
				numeroString = identificadorString.x.charAt(i) + numeroString;
			}

		}
		return Number(numeroString);
	}
	cambiarZoom(e) {
		let cambio = 0;
		if (e.deltaY > 0) {
			cambio = -0.05;
		}
		if (e.deltaY < 0) {
			cambio = 0.05;
		}
		this.zoom += cambio;
		this.zoom = Number((this.zoom).toFixed(2));

		this.redibujar();

		this.shadowRoot.querySelector("#labelZoom").textContent = this.zoom;

		e.preventDefault();
	}
	connectedCallback() {

		console.log(`Connected`);

		const shadowRoot = this.attachShadow({ mode: "open" });

		const labelZoom = document.createElement("div");
		labelZoom.id = "labelZoom";
		shadowRoot.appendChild(labelZoom);

		let elCanvas = document.createElement("canvas");
		elCanvas.id = "elCanvas";
		const boundingContenedor = this.parentElement.getBoundingClientRect();
		const anchoContenedor = boundingContenedor.width;
		elCanvas.width = anchoContenedor;
		elCanvas.height = anchoContenedor;

		const estilo = new CSSStyleSheet();
		estilo.replaceSync(`
#labelZoom{
	text-align: center;
	color: gray;
}
#elCanvas{
}
		`);
		shadowRoot.adoptedStyleSheets = [estilo];

		shadowRoot.appendChild(elCanvas);

		this.elCanvas = elCanvas;
		this.lapiz = this.elCanvas.getContext("2d");
		this.dimensionesCanvas = {
			x: elCanvas.width,
			y: elCanvas.height,
		}


		this.redibujar();
		elCanvas.addEventListener("wheel", (e) => { this.cambiarZoom(e) }, { passive: false });
		this.conectado = true;
	}
	disconnectedCallback() {
		let elCanvas = this.shadowRoot?.querySelector("#elCanvas");
		if (elCanvas) {
			elCanvas.removeEventListener("wheel", this.cambiarZoom);
		}
	}
}


window.customElements.define("grid-numeros", gridNumeros);

