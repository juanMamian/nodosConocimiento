//Representa un número como una grid de bolitas organizadas de forma que se puede analizar el sistema decimal.
//10 unidades en fila forman una decena. 10 decenas en columna forman un centana (De forma cuadrada). 10 centenas en fila forman un mil, etc.
export class RepresentacionDecimalNumero extends HTMLElement {
	static observedAttributes = ["cantidad", "niveles-incluidos"];

	shadowRoot;

	static minZoom = -5;
	static maxZoom = 5;
	zoom = 1;
	multiplicadorZoom = 10;
	esquinaVista = { x: 0, y: 0 }
	elCanvas;
	lapiz;

	cantidad = "";

	zonas = {}//Zonas para dibujo de conjuntos según su nivel. Ver: "trazar zonas".
	pathsPorNivel = {} //Path2D que contienen los rectangulos correspondientes a cada nivel.
	pathsExternosPorNivel = {} //Path2D que contienen los rectangulos correspondientes a cada nivel que no están contenidos en ningún otro conjunto.

	nivelesIncluidos;

	lastPointerPosition = {
		x: null,
		y: null
	}
	lastDistanciaPinch = null;

	canceladorDeHandlers = new AbortController();
	punterosActivos = new Map();

	constructor() {
		super();
		this.calcularMultiplicadorZoom()
	}
	connectedCallback() {
		console.log(`Conectado`);
		const boundingThis = this.getBoundingClientRect();
		const minAncho = 100;
		let ancho = boundingThis.width || minAncho;
		this.shadowRoot = this.attachShadow({ mode: "open" });

		//Info zoom.
		const infoZoom = document.createElement("div");
		infoZoom.setAttribute("id", "infoZoom");
		infoZoom.textContent = "";
		this.shadowRoot.appendChild(infoZoom);
		//Info esquina.
		const infoEsquina = document.createElement("div");
		infoEsquina.setAttribute("id", "infoEsquina");
		infoEsquina.textContent = "";
		this.shadowRoot.appendChild(infoEsquina);
		//Info niveles.
		const infoNiveles = document.createElement("div");
		infoNiveles.setAttribute("id", "infoNiveles");
		infoNiveles.textContent = "1";
		this.shadowRoot.appendChild(infoNiveles);

		//Canvas principal
		this.elCanvas = document.createElement("canvas");
		this.lapiz = this.elCanvas.getContext("2d");
		this.elCanvas.setAttribute("id", "elCanvas");
		this.elCanvas.setAttribute("width", boundingThis.width);
		this.elCanvas.setAttribute("height", boundingThis.width);
		this.shadowRoot.appendChild(this.elCanvas);

		//Estilo

		const estilo = new CSSStyleSheet();
		estilo.replaceSync(`
			#elCanvas{
			border: 2px dashed gray;
			touch-action: none;
			}
		`);
		this.shadowRoot.adoptedStyleSheets = [estilo];

		//Eventos.
		this.elCanvas.addEventListener("wheel", (e) => { this.handleWheel(e) }, { passive: false });
		this.elCanvas.addEventListener("pointermove", (e) => this.handlePointerMove(e));
		this.elCanvas.addEventListener("dblclick", (e) => this.centrarRepresentacionNumero())
		this.elCanvas.addEventListener("pointerdown", (e) => this.punterosActivos.set(e.pointerId, e))
		this.elCanvas.addEventListener("pointermove", (e) => this.punterosActivos.set(e.pointerId, e))
		this.elCanvas.addEventListener("pointerup", (e) => {
			this.punterosActivos.delete(e.pointerId)
			this.lastDistanciaPinch = null;
		})
		this.elCanvas.addEventListener("pointercancel", (e) => {
			this.punterosActivos.delete(e.pointerId);
			this.lastDistanciaPinch = null;
		})
		document.addEventListener("pointerup", (e) => this.handlePointerup(e), { signal: this.canceladorDeHandlers.signal });



		if (!this.nivelesIncluidos) {
			this.setNivelesVisiblesSegunZoom();
		}
		this.dibujarTodo();
		this.centrarRepresentacionNumero();
	}
	disconnectedCallback() {
		this.canceladorDeHandlers.abort();
	}
	centrarRepresentacionNumero() {
		let zonaMaxima = Object.keys(this.zonas).reduce((acc, curr) => {
			return curr > acc ? curr : acc
		});
		let boundingCanvas = this.elCanvas.getBoundingClientRect();
		let sizeCanvas = { //Size en unidades internas de la representación del número, no en pixeles.
			width: boundingCanvas.width / this.multiplicadorZoom,
			height: boundingCanvas.height / this.multiplicadorZoom,
		}
		let centroVista = {
			x: boundingCanvas.width / this.multiplicadorZoom,
			y: boundingCanvas.height / this.multiplicadorZoom
		}
		if (Object.entries(this.zonas).some((entrada => entrada[0] != zonaMaxima && entrada[1].width != 0 && entrada[1].height != 0))) { //Hay que centrar en el intermedio de esta zona máxima y una supuesta siguiente.
			centroVista.x = this.zonas[zonaMaxima].width / this.multiplicadorZoom * (zonaMaxima % 2 === 0 ? 1.5 : 0.5);
			centroVista.y = this.zonas[zonaMaxima].height / this.multiplicadorZoom * (zonaMaxima % 2 != 0 ? 1.5 : 0.5);
		}
		else {
			centroVista.x = this.zonas[zonaMaxima].width / 2 / this.multiplicadorZoom;
			centroVista.y = this.zonas[zonaMaxima].height / 2 / this.multiplicadorZoom;
		}
		this.esquinaVista.x = centroVista.x - sizeCanvas.width / 2;
		this.esquinaVista.y = centroVista.y - sizeCanvas.height / 2;

		this.dibujarTodo();
	}
	handleWheel(evento) {
		evento.preventDefault();
		const step = 0.03;
		const boundingCanvas = this.elCanvas.getBoundingClientRect();
		const posicionEvento = {
			x: this.esquinaVista.x + (evento.clientX - boundingCanvas.left) / this.multiplicadorZoom,
			y: this.esquinaVista.y + (evento.clientY - boundingCanvas.top) / this.multiplicadorZoom,
		}
		if (evento.deltaY < 0) {
			this.setZoom(this.zoom + step, posicionEvento);
		}
		else {
			this.setZoom(this.zoom - step, posicionEvento);
		}
	}
	setZoom(nuevoZoom, centro) {
		let viejoMultiplicadorZoom = this.multiplicadorZoom;
		let distanciaEsquinaCentro;
		let nuevaDistanciaEsquinaCentro;
		if (centro?.x && centro.y) {//Hacer cambio de zoom centrado en este lugar: la distancia (px) entre este centro y la esquina es inversamente proporcional al camibio de zoom.
			distanciaEsquinaCentro = {
				x: this.esquinaVista.x - centro.x,
				y: this.esquinaVista.y - centro.y,
			}
		}
		this.zoom = nuevoZoom;
		this.shadowRoot.querySelector("#infoZoom").textContent = this.zoom;
		this.multiplicadorZoom = Math.pow(10, this.zoom);

		if (centro?.x && centro.y) {
			nuevaDistanciaEsquinaCentro = {
				x: distanciaEsquinaCentro.x / (this.multiplicadorZoom / viejoMultiplicadorZoom),
				y: distanciaEsquinaCentro.y / (this.multiplicadorZoom / viejoMultiplicadorZoom),
			}
			this.esquinaVista.x = centro.x + nuevaDistanciaEsquinaCentro.x;
			this.esquinaVista.y = centro.y + nuevaDistanciaEsquinaCentro.y;
		}


		if (!this.nivelesIncluidos) {
			this.setNivelesVisiblesSegunZoom();
		}
		this.dibujarTodo();

	}
	attributeChangedCallback(nombre, valorAntes, valorAhora) {
		if (nombre === "cantidad") {
			this.cantidad = Number(valorAhora);
		}
		if (nombre === "niveles-incluidos") {
			let nuevoArray = JSON.parse(valorAhora);
			if (nuevoArray instanceof Array || nuevoArray.some(el => typeof el != Number)) {
				this.nivelesIncluidos = nuevoArray;
				this.nivelesVisibles = this.nivelesIncluidos.sort((a, b) => Number(b) - Number(a));
			}
			else {
				console.log(`Error, atributo ${nombre} debe ser un array`);
			}
		}
	}
	calcularZonas() {//Crear boundaries para el dibujado de conjuntos. Hay una zona en la que se pueden dibujar conjuntos de nivel 2, otra para los de nivel 1, etc. (En la zona de nivel 2 se puede dibujar cualquier conjunto menor o igual a 2).
		this.zonas = {};
		let [parteEntera = "", parteDecimal = ""] = String(this.cantidad).split(".");

		let offset = {
			x: 0 - this.esquinaVista.x * this.multiplicadorZoom,
			y: 0 - this.esquinaVista.y * this.multiplicadorZoom,
		}; //Posición en la que iniciar la zona. Al terminar cada zona, la siguiente empieza en la esquina superior derecha (Si era zona en forma de fila) o inferior izquierda (Si era zona en forma de columna).
		//Las zonas para niveles pares son en forma de fila y las impares son en forma de columna.
		for (let i = parteEntera.length - 1; i >= -parteDecimal.length; i--) {
			const esteCaracter = i >= 0 ? parteEntera.charAt(parteEntera.length - 1 - i) : parteDecimal.charAt(1 + i);
			const esteFactor = Number(esteCaracter);
			let sizeEstosConjuntos = this.calcularSizeConjuntoSegunNivel(i);

			const sizeZona = {
				width: i % 2 === 0 ? sizeEstosConjuntos.width * esteFactor : sizeEstosConjuntos.width,
				height: i % 2 != 0 ? sizeEstosConjuntos.height * esteFactor : sizeEstosConjuntos.height,
			}

			this.zonas[i] = {
				x: offset.x,
				y: offset.y,
				width: sizeZona.width,
				height: sizeZona.height,
				factor: esteFactor,
			}
			offset.x += i % 2 === 0 ? sizeZona.width : 0;
			offset.y += i % 2 != 0 ? sizeZona.height : 0;
		}
	}
	trazarZonas() {
		Object.entries(this.zonas).forEach(entrada => {
			let zona = entrada[1];
			let esquinas = [
				{
					x: zona.x,
					y: zona.y,
				},
				{
					x: zona.x + zona.width,
					y: zona.y,
				},
				{
					x: zona.x + zona.width,
					y: zona.y + zona.height,
				},
				{
					x: zona.x,
					y: zona.y + zona.height,
				}
			];


			this.lapiz.save();
			this.lapiz.lineWidth = 1;
			let color = RepresentacionDecimalNumero.calcularColorSegunNivel(entrada[0]);
			this.lapiz.strokeStyle = `rgb(${color.rojo},${color.verde},${color.azul})`;
			this.lapiz.beginPath();
			this.lapiz.moveTo(esquinas[0].x, esquinas[0].y);
			this.lapiz.lineTo(esquinas[1].x, esquinas[1].y);
			this.lapiz.lineTo(esquinas[2].x, esquinas[2].y);
			this.lapiz.lineTo(esquinas[3].x, esquinas[3].y);
			this.lapiz.lineTo(esquinas[0].x, esquinas[0].y);
			this.lapiz.stroke();
			this.lapiz.restore();
		})
	}
	handlePointerup(evento) {
		this.lastPointerPosition.x = null;
		this.lastPointerPosition.y = null;
		this.lastDistanciaPinch = null;
	}
	handleTouchmove(evento) {
		if (evento.touches.length === 1) {
			if (this.lastTouchmovePos.x != null && this.lastTouchmovePos.y != null) {
				const delta = {
					x: evento.touches[0].clientX - this.lastTouchmovePos.x,
					y: evento.touches[0].clientY - this.lastTouchmovePos.y,
				}

				this.setEsquinaVista(this.esquinaVista.x - delta.x / this.multiplicadorZoom, this.esquinaVista.y - delta.y / this.multiplicadorZoom);
				evento.preventDefault();

			}
			this.lastTouchmovePos = {
				x: evento.touches[0].clientX,
				y: evento.touches[0].clientY,
			}
		}
	}
	handlePointerMove(evento) {
		evento.preventDefault();
		evento.stopPropagation();

		if (this.punterosActivos.size === 1) { //Panning
			if (evento instanceof MouseEvent && evento.buttons != 1) {
				return;
			}
			if (this.lastPointerPosition.x != null && this.lastPointerPosition.y != null) {
				this.elCanvas.setPointerCapture(evento.pointerId);
				const delta = {
					x: evento.clientX - this.lastPointerPosition.x,
					y: evento.clientY - this.lastPointerPosition.y,
				}
				this.setEsquinaVista(this.esquinaVista.x - delta.x / this.multiplicadorZoom, this.esquinaVista.y - delta.y / this.multiplicadorZoom);

				this.dibujarTodo();
			}
			this.lastPointerPosition.x = evento.clientX;
			this.lastPointerPosition.y = evento.clientY;
		}
		else if (this.punterosActivos.size === 2) {
			const punteros = Array.from(this.punterosActivos.values());
			const diferencia = {
				x: punteros[0].clientX - punteros[1].clientX,
				y: punteros[0].clientY - punteros[1].clientY,
			}
			console.log(`Esquina vista: ${JSON.stringify(this.esquinaVista)}`);
			const boundingCanvas = this.elCanvas.getBoundingClientRect();
			const centroPinch = {
				x: this.esquinaVista.x + ((punteros[0].clientX - boundingCanvas.left * 2 + punteros[1].clientX) / 2) / this.multiplicadorZoom,
				y: this.esquinaVista.y + ((punteros[0].clientY - boundingCanvas.top * 2 + punteros[1].clientY) / 2) / this.multiplicadorZoom,
			}
			console.log(`Centro pinch: ${JSON.stringify(centroPinch)}`);

			const distancia = Math.sqrt(Math.pow(diferencia.x, 2) + Math.pow(diferencia.y, 2));

			if (this.lastDistanciaPinch == null) {
				this.lastDistanciaPinch = distancia;
			}
			else {
				const step = 0.035;
				let nuevoZoom = this.zoom;
				const umbralDistancia = 10;
				if (distancia > this.lastDistanciaPinch + umbralDistancia) {
					nuevoZoom += step;
					this.lastDistanciaPinch = distancia;
				}
				else if (distancia < this.lastDistanciaPinch - umbralDistancia) {
					nuevoZoom -= step;
					this.lastDistanciaPinch = distancia;
				}
				this.setZoom(nuevoZoom, centroPinch);
			}
		}

	}
	setEsquinaVista(nuevoX, nuevoY) {
		this.esquinaVista.x = nuevoX;
		this.esquinaVista.y = nuevoY;

		this.shadowRoot.querySelector("#infoEsquina").innerText = JSON.stringify(this.esquinaVista);

	}
	dibujarTodo() {
		this.lapiz.clearRect(0, 0, this.elCanvas.width, this.elCanvas.height);
		this.calcularZonas();
		//this.trazarZonas();
		this.calcularPathsConjuntos();
		this.trazarConjuntos();
	}
	calcularPathsConjuntos() {
		//Crear el objeto "paths por nivel"
		this.pathsPorNivel = {};
		this.pathsExternosPorNivel = {};
		for (let i = 0; i < this.nivelesVisibles.length; i++) {
			this.pathsPorNivel[this.nivelesVisibles[i]] = new Path2D();
			this.pathsExternosPorNivel[this.nivelesVisibles[i]] = new Path2D();
		}

		//Add conjuntos en cada zona.
		Object.entries(this.zonas).forEach(entrada => {
			const nivelZona = entrada[0];
			const zona = entrada[1];
			if (zona.x > this.elCanvas.width || zona.y > this.elCanvas.height) {
				return
			}
			let maxNivelDibujable;
			for (let i = 0; i < this.nivelesVisibles.length; i++) {
				if (this.nivelesVisibles[i] <= nivelZona) {
					maxNivelDibujable = this.nivelesVisibles[i];
					break;
				}
			}
			if (maxNivelDibujable == null) {//Ninguno de los niveles visibles podía ser dibujado en esta zona (Era zona para niveles bajos).
				maxNivelDibujable = nivelZona;
				if (!this.pathsExternosPorNivel[nivelZona]) this.pathsExternosPorNivel[nivelZona] = new Path2D();

			}

			const diferenciaNiveles = nivelZona - maxNivelDibujable;

			const cupo = {
				x: Math.pow(10, maxNivelDibujable % 2 === 0 ? Math.ceil(diferenciaNiveles / 2) : Math.floor(diferenciaNiveles / 2)),
				y: Math.pow(10, maxNivelDibujable % 2 === 0 ? Math.floor(diferenciaNiveles / 2) : Math.ceil(diferenciaNiveles / 2)),
			}
			if (nivelZona % 2 === 0) {
				cupo.x *= zona.factor;
			}
			else {
				cupo.y *= zona.factor;
			}

			const espacioUnidad = {
				width: zona.width / cupo.x,
				height: zona.height / cupo.y,
			}


			const posicionInicial = {
				x: zona.x >= 0 ? zona.x : zona.x % espacioUnidad.width,
				y: zona.y >= 0 ? zona.y : zona.y % espacioUnidad.height,
			}
			let posicion = JSON.parse(JSON.stringify(posicionInicial));
			while (posicion.x < zona.x + zona.width - 1 && posicion.y < zona.y + zona.height - 1 && posicion.x < this.elCanvas.width && posicion.y < this.elCanvas.height) {
				this.addConjuntoToPathNivel(maxNivelDibujable, { x: posicion.x + espacioUnidad.width / 2, y: posicion.y + espacioUnidad.height / 2 }, undefined, true);
				posicion.x += espacioUnidad.width;
				if (posicion.x >= zona.x + zona.width - 1 || posicion.x >= this.elCanvas.width) {
					posicion.x = posicionInicial.x;
					posicion.y += espacioUnidad.height;
				}
			}

			/* for (let i = 0; i < cupo.y; i++) {
				for (let j = 0; j < cupo.x; j++) {
					this.addConjuntoToPathNivel(maxNivelDibujable, { x: zona.x + espacioUnidad.width * (j + 0.5), y: zona.y + espacioUnidad.height * (i + 0.5) });
				}
			} */

		});
	}
	addConjuntoToPathNivel(nivel, posicion, size, esExterno) {
		const path = new Path2D();
		if (!size) {
			size = this.calcularSizeConjuntoSegunNivel(nivel);
		}

		const { zonaMaxRelevancia, zoomDemasiadoPequeno, zoomDemasiadoGrande } = this.getBoundariesZoomConjuntoSegunNivel(nivel);
		let porcentajePadding = 0;
		const maxPorcentajePadding = nivel % 2 === 0 ? 4 : 2;
		if (this.zoom > zonaMaxRelevancia[0] && this.zoom < zonaMaxRelevancia[1]) {
			porcentajePadding = maxPorcentajePadding;
		}
		else if (this.zoom < zonaMaxRelevancia[0]) {
			porcentajePadding = (this.zoom - zoomDemasiadoPequeno) * maxPorcentajePadding / (zonaMaxRelevancia[0] - zoomDemasiadoPequeno)
		}
		else if (this.zoom > zonaMaxRelevancia[1]) {
			porcentajePadding = maxPorcentajePadding - (this.zoom - zonaMaxRelevancia[1]) * maxPorcentajePadding / (zoomDemasiadoGrande - zonaMaxRelevancia[1]);
		}
		if (porcentajePadding < 0) porcentajePadding = 0;
		if (porcentajePadding > 100) porcentajePadding = 100;
		const paddingVertical = size.height * porcentajePadding / 100;
		let paddingHorizontal = size.width * porcentajePadding / 100;

		const esquinas = [
			{
				x: posicion.x - size.width / 2 + paddingHorizontal,
				y: posicion.y - size.height / 2 + paddingVertical,
			},
			{
				x: posicion.x + size.width / 2 - paddingHorizontal,
				y: posicion.y - size.height / 2 + paddingVertical,
			},
			{
				x: posicion.x + size.width / 2 - paddingHorizontal,
				y: posicion.y + size.height / 2 - paddingVertical,
			},
			{
				x: posicion.x - size.width / 2 + paddingHorizontal,
				y: posicion.y + size.height / 2 - paddingVertical,
			},
		];

		let porcentajeRadioEsquina = 1;
		if (nivel === 0) {
			let maxPorcentajeRadioEsquina = 30;
			porcentajeRadioEsquina = maxPorcentajeRadioEsquina;
			if (this.zoom > zonaMaxRelevancia[0]) {
				porcentajeRadioEsquina = maxPorcentajeRadioEsquina - maxPorcentajeRadioEsquina * (this.zoom - zonaMaxRelevancia[0]) / (zoomDemasiadoGrande - zonaMaxRelevancia[0]);
			}
			else if (this.zoom < zonaMaxRelevancia[0]) {
				porcentajeRadioEsquina = maxPorcentajeRadioEsquina * (this.zoom - zoomDemasiadoPequeno) / (zonaMaxRelevancia[0] - zoomDemasiadoPequeno);
			}
			if (porcentajeRadioEsquina < 0) porcentajeRadioEsquina = 0;
			if (porcentajeRadioEsquina > 100) porcentajeRadioEsquina = 100;
		}
		const radioEsquina = (esquinas[3].y - esquinas[0].y) * porcentajeRadioEsquina / 100;

		path.moveTo((esquinas[0].x + esquinas[1].x) / 2, esquinas[0].y);
		path.arcTo(esquinas[1].x, esquinas[1].y, esquinas[2].x, esquinas[2].y, radioEsquina);
		path.arcTo(esquinas[2].x, esquinas[2].y, esquinas[3].x, esquinas[3].y, radioEsquina);
		path.arcTo(esquinas[3].x, esquinas[3].y, esquinas[0].x, esquinas[0].y, radioEsquina);
		path.arcTo(esquinas[0].x, esquinas[0].y, esquinas[1].x, esquinas[1].y, radioEsquina);
		path.closePath();

		if (!esExterno && !this.pathsPorNivel[nivel]) {
			console.log(`No había pathPorNivel para este nivel`);
			throw "Path no disponible";
		}
		else if (esExterno && !this.pathsExternosPorNivel[nivel]) {
			console.log(`No había pathPorNivel para este nivel`);
			throw "Path externo no disponible";
		}
		if (esExterno) {
			this.pathsExternosPorNivel[nivel].addPath(path);
		}
		else {
			this.pathsPorNivel[nivel].addPath(path);
		}

		//Si hay conjuntos menores, llamar esta misma función para ellos.
		const indexEsteNivelEnVisibles = this.nivelesVisibles.indexOf(nivel);
		if (indexEsteNivelEnVisibles < 0) {
			return;
		}

		let siguienteIndex = indexEsteNivelEnVisibles + 1;
		if (siguienteIndex < this.nivelesVisibles.length) {
			const nivelDibujable = this.nivelesVisibles[siguienteIndex];
			const zona = {
				x: esquinas[0].x,
				y: esquinas[0].y,
				width: esquinas[1].x - esquinas[0].x,
				height: esquinas[3].y - esquinas[0].y,
			}
			const diferenciaNiveles = nivel - nivelDibujable;

			const cupo = {
				x: Math.pow(10, nivelDibujable % 2 === 0 ? Math.ceil(diferenciaNiveles / 2) : Math.floor(diferenciaNiveles / 2)),
				y: Math.pow(10, nivelDibujable % 2 === 0 ? Math.floor(diferenciaNiveles / 2) : Math.ceil(diferenciaNiveles / 2)),
			}

			const espacioUnidad = {
				width: zona.width / cupo.x,
				height: zona.height / cupo.y,
			}

			const posicionInicial = {
				x: zona.x >= 0 ? zona.x : zona.x % espacioUnidad.width,
				y: zona.y >= 0 ? zona.y : zona.y % espacioUnidad.height,
			}
			let posicion = JSON.parse(JSON.stringify(posicionInicial));
			let contador = 0;
			while (posicion.x < zona.x + zona.width - 1 && posicion.y < zona.y + zona.height - 1 && posicion.x < this.elCanvas.width && posicion.y < this.elCanvas.height) {
				this.addConjuntoToPathNivel(nivelDibujable, { x: posicion.x + espacioUnidad.width / 2, y: posicion.y + espacioUnidad.height / 2 }, espacioUnidad, false);
				posicion.x += espacioUnidad.width;
				if (posicion.x >= zona.x + zona.width - 1 || posicion.x >= this.elCanvas.width) {
					posicion.x = posicionInicial.x;
					posicion.y += espacioUnidad.height;
				}
				contador++;
			}
		}
	}
	getBoundariesZoomConjuntoSegunNivel(nivel) {
		const zoomMaxRelevancia = nivel % 2 === 0 ? 2.0 - 0.5 * nivel : 2.0 - 0.5 * nivel; //Zoom en el que este conjunto debería estar más visible. Mediante padding y opacidad.
		const zonaMaxRelevancia = [zoomMaxRelevancia - 0.1, zoomMaxRelevancia + 0.1];
		const zoomDemasiadoPequeno = nivel % 2 == 0 ? zonaMaxRelevancia[0] - 0.6 : zonaMaxRelevancia[0] - 0.4; //Zoom en el que estos conjuntos son tan pequeños que no vale la pena renderizarlos.
		const zoomDemasiadoGrande = zonaMaxRelevancia[1] + 0.2; //Zoom en el que estos conjuntos son tan grandes que no vale la pena renderizarlos.

		return {
			zoomMaxRelevancia, zonaMaxRelevancia, zoomDemasiadoPequeno, zoomDemasiadoGrande
		}

	}

	trazarConjuntos() {

		Object.entries(this.pathsExternosPorNivel).forEach(entrada => {
			const nivelPath = entrada[0];
			const elPath = entrada[1];

			this.trazarMultipath(nivelPath, elPath, { externo: true });
		});
		Object.entries(this.pathsPorNivel).forEach(entrada => {
			const nivelPath = entrada[0];
			const elPath = entrada[1];
			this.trazarMultipath(nivelPath, elPath);
		});
	}
	trazarMultipath(nivelPath, elPath, opciones) {

		const { zonaMaxRelevancia, zoomDemasiadoPequeno, zoomDemasiadoGrande } = this.getBoundariesZoomConjuntoSegunNivel(nivelPath)

		let opacidad = 1;
		const maxLineWidth = 6;
		let lineWidth = maxLineWidth;
		lineWidth = maxLineWidth * (this.zoom - zoomDemasiadoPequeno) / (zoomDemasiadoGrande - zoomDemasiadoPequeno);
		if (this.zoom > zonaMaxRelevancia[1]) {
			opacidad = 1 - (this.zoom - zonaMaxRelevancia[1]) / (zoomDemasiadoGrande - zonaMaxRelevancia[1]);
		}
		else if (this.zoom < zonaMaxRelevancia[0]) {
			if (opciones?.externo) {
				opacidad = 1;
			}
			else {
				opacidad = (this.zoom - zoomDemasiadoPequeno) / (zonaMaxRelevancia[0] - zoomDemasiadoPequeno)
			}
			if (this.nivelesIncluidos) {
				if (opacidad < 0.5) opacidad = 0.5;
			}
		}
		if (opacidad < 0) opacidad = 0;
		if (opacidad > 1) opacidad = 1;
		if (lineWidth > maxLineWidth) lineWidth = maxLineWidth;
		if (lineWidth < 0.4) lineWidth = 0.4;
		this.lapiz.lineWidth = lineWidth;

		const color = RepresentacionDecimalNumero.calcularColorSegunNivel(nivelPath);
		this.lapiz.strokeStyle = `rgb(${color.rojo},${color.verde},${color.azul}, ${opacidad})`;


		this.lapiz.stroke(elPath);
	}
	setNivelesVisiblesSegunZoom() { //Debe estar sorted de mayor a menor pues se iterará sobre este array al construir los subpaths.
		this.calcularMultiplicadorZoom();
		let minimoConjuntoCuadradoVisible = Math.ceil(2.5 - 2 * this.zoom);
		if (minimoConjuntoCuadradoVisible % 2 != 0) minimoConjuntoCuadradoVisible++;
		let minimoConjuntoRectangularVisible = Math.ceil(2.4 - 2 * this.zoom);
		if (minimoConjuntoRectangularVisible % 2 === 0) minimoConjuntoRectangularVisible++;
		this.nivelesVisibles = [minimoConjuntoCuadradoVisible, minimoConjuntoCuadradoVisible + 2, minimoConjuntoCuadradoVisible + 4,
			minimoConjuntoRectangularVisible, minimoConjuntoRectangularVisible + 2, minimoConjuntoRectangularVisible + 4
		].sort((a, b) => Number(b) - Number(a));

		this.shadowRoot.querySelector("#infoNiveles").textContent = JSON.stringify(this.nivelesVisibles);
	}
	calcularMultiplicadorZoom() {
		return Math.pow(10, this.zoom);
	}
	calcularSizeConjuntoSegunNivel(nivel) {
		return {
			width: Math.pow(10, Math.ceil(nivel / 2)) * this.multiplicadorZoom,
			height: Math.pow(10, Math.floor(nivel / 2)) * this.multiplicadorZoom,
		}
	}
	static crearPathRectangulo(ancho, alto, radioEsquinas = 5) {
		const path = new Path2D();
		path.moveTo(ancho / 2, 0);
		path.arcTo(ancho, 0, ancho, alto, radioEsquinas);
		path.arcTo(ancho, alto, 0, alto, radioEsquinas);
		path.arcTo(0, alto, 0, 0, radioEsquinas);
		path.arcTo(0, 0, 50, 0, radioEsquinas);
		path.closePath();
		return path;
	}
	static calcularColorSegunNivel(nivel) {
		nivel = Number(nivel);
		let baseRojo = Math.abs(nivel % 3) === 0 ? 128 : 0;
		let baseVerde = Math.abs(nivel % 3) === 1 ? 128 : 0;
		let baseAzul = Math.abs(nivel % 3) === 2 ? 128 : 0;

		let offset = Math.floor(Math.abs(nivel) / 3);
		if (nivel < 0) offset = -offset;


		let rojo = baseRojo + offset * 5;
		let verde = baseVerde + offset * 5;
		let azul = baseAzul + offset * 5;


		if (rojo > 255) rojo = rojo % 256;
		if (verde > 255) verde = verde % 256;
		if (azul > 255) azul = azul % 256;

		if (rojo < 0) rojo = 256 - Math.abs(rojo) % 256;
		if (verde < 0) verde = 256 - Math.abs(verde) % 256;
		if (azul < 0) azul = 256 - Math.abs(azul) % 256;


		return {
			rojo, verde, azul
		}
	}

}
