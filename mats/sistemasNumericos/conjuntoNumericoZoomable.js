let ConjuntoNumericoZoomable;
ConjuntoNumericoZoomable = {
    template: `
        <div class="conjuntoNumericoZoomable" :style="estiloConjunto">
            <div class="contenedorSubconjuntos" v-if="!this.outOfSight && !ofuscado && (childrenVivos || !this.lleno) && orden>1" :style="[estiloContenedorSubconjuntos]">
                <ConjuntoNumericoZoomable v-for="(subnumero, index) of subnumeros" :index="index" :numero="subnumero" :orden="orden-1" :zoom="zoom" :ordenMinimo="ordenMinimo" :refreshSight="refreshSight"/>
            </div>
            <div class="contenedorUnidadesPlaceholder" v-show="(ofuscamiento<=1 && !childrenVivos && lleno) || orden===ordenMinimo+1" :style="[estiloContenedorUnidadesPlaceholder]">
                <div :class="{bolitaNumero:orden===1}" class="unidadPlaceholder" :style="[estiloUnidadesPlaceholder]" v-for="subnumero of subnumeros">
                    <span v-if="orden>1">{{getNombreConjuntoByOrden(orden-1)}}</span>
                </div>
            </div>
            <div class="nombreConjunto" v-show="ofuscamiento>0 && !outOfSight && lleno" :style="[estiloNombreConjunto]">
                <span v-show="orden!=0">{{nombreConjunto}}</span>
            </div>
        </div>
    `,
    name: "ConjuntoNumericoZoomable",
    components: {
        ConjuntoNumericoZoomable
    },
    props: {
        ordenMinimo: {
            type: Number,
            default: 0,
        },
        base: {
            type: Boolean,
        },
        numero: {
            type: Number,
            required: true,
        },
        index: { //El index dentro del conjunto parent. Permite saber si ésta es la primera o la segunda decena de la parent centena, por ejemplo.
            type: Number,
            required: true,
        },
        orden: {
            type: Number,
            required: true,
        },
        zoom: {
            type: Number,
            required: true,
        },
        refreshSight: {
            type: Number,
            required: true
        }
    },
    data() {
        let baseInicio = 650;
        let baseFinal = 360;
        return {
            spacingSubnumeros: 0.5, //El spacing entre números internos es 50% del tamaño de los números internos.
            baseSize: 40,
            baseGap: 20,
            baseFontSize: 15,
            outOfSight: true,

            boundariesOfuscamiento: {
                row: {
                    inicio: baseInicio,
                    final: baseFinal,
                },
                column: {
                    inicio: baseInicio * 0.4,
                    final: baseFinal * 0.5,
                }
            },
        }
    },
    computed: {
        orientacion() {
            return this.orden % 2 === 0 ? 'column' : 'row';
        },
        colorRepresentativo() {
            let colorBase = 12021615;
            let intervalo = 2796202.5;
            let esteColor = colorBase + intervalo * this.orden;
            if (esteColor >= 16777215) {
                esteColor = esteColor % 16777215;
            }
            let enString = Math.round(esteColor).toString(16);
            while (enString.length < 6) {
                enString = "0" + enString;
            }
            return "#" + enString;
        },
        colorRepresentativoChildren() {
            let colorBase = 12021615;
            let intervalo = 2796202.5;
            let esteColor = colorBase + intervalo * (this.orden - 1);
            if (esteColor >= 16777215) {
                esteColor = esteColor % 16777215;
            }
            let enString = Math.round(esteColor).toString(16);
            while (enString.length < 6) {
                enString = "0" + enString;
            }
            return "#" + enString;

        },
        filasSubconjuntos() {
            let fila1 = {
                indexFila: 0,
                inicio: 0,
                final: 3, //No incluido
            }
            let fila2 = {
                indexFila: 1,
                inicio: 3,
                final: 7, //No incluido
            }
            let fila3 = {
                indexFila: 2,
                inicio: 7,
                final: 10, //No incluido
            }
            return [fila1, fila2, fila3];
        },
        nombreConjunto() {
            return getNombreConjuntoNumericoFromPotencia(this.orden);
        },
        lleno() {
            return this.subnumeros.length === 10
        },
        umbralOfuscacion() {
            return Math.pow(0.5, this.orden);
        },
        unidadesCercaniaUmbral() {
            return this.umbralOfuscacion / 10;
        },
        ofuscamiento() {
            if (!this.lleno) {
                return 0;
            }
            let anchoInicio = this.boundariesOfuscamiento.row.inicio;
            let anchoFinal = this.boundariesOfuscamiento.row.final;

            if (this.orientacion === 'column') {
                anchoInicio = this.boundariesOfuscamiento.column.inicio;
                anchoFinal = this.boundariesOfuscamiento.column.final;
            }
            const step = (anchoFinal - anchoInicio) / 10;
            return (10 - (anchoFinal - this.ancho) / step) / 10;
        },
        ofuscado() {
            return this.orden === this.ordenMinimo || this.ofuscamiento >= 1 || this.outOfSight;
        },
        childrenVivos() {//Children están vivos como componentesVue si este conjunto es tan ancho o alto como para alojar children grandes con ofuscamiento < 1;
            if (this.orientacion === 'row') {
                if (this.ancho >= this.boundariesOfuscamiento.column.final * 10) {
                    return true;
                }
            }
            else if (this.orientacion === 'column') {
                if (this.ancho >= this.boundariesOfuscamiento.row.final) {
                    return true;
                }
            }
            return false;

        },
        subnumeros() {
            let porcionMaxima = Math.pow(10, this.orden - 1);
            let cantidadTotal = this.numero;
            let subnumeros = [];
            while (cantidadTotal > porcionMaxima) {
                subnumeros.push(porcionMaxima);
                cantidadTotal -= porcionMaxima;
            }
            if (cantidadTotal > 0.0000001) {
                subnumeros.push(cantidadTotal);
            }
            return subnumeros;
        },
        factorZoom() {
            return Math.pow(1.05, this.zoom);
        },
        estiloContenedorUnidadesPlaceholder() {
            let factorMagnificacion = Math.pow(10, Math.floor((this.orden - 1) / 2));
            return {
                flexDirection: this.orden % 2 === 0 ? 'column' : 'row',
                fontSize: `${this.baseFontSize * factorMagnificacion * this.factorZoom}px`
            }
        },
        estiloUnidadesPlaceholder() {
            return {
                backgroundColor: this.colorRepresentativoChildren,
                width: this.anchoChildren + 'px',
                height: this.altoChildren + 'px',
                fontSize: this.orientacion==='row'? this.anchoChildren*0.22+'px':this.altoChildren*0.7+'px',
            }
        },
        estiloContenedorSubconjuntos() {
            return {
                flexDirection: this.orden % 2 === 0 ? 'column' : 'row',
            }
        },
        factorMagnificacion() {
            return Math.pow(10, Math.floor(this.orden / 2));
        },
        ancho() {
            let ancho = this.baseSize * this.factorMagnificacion * this.factorZoom;
            if (this.orientacion === 'row') {
                ancho *= 10;
            }
            return ancho;
        },
        anchoChildren() {
            return this.orientacion === 'column' ? this.ancho - 5 : (this.ancho / 10) - 5;
        },
        alto() {
            return this.baseSize * this.factorMagnificacion * this.factorZoom;
        },
        altoChildren() {
            return this.orientacion === 'row' ? this.alto - 5 : (this.alto / 10) - 5;
        },
        estiloConjunto() {
            let baseFontSize = 9;
            if (this.orientacion === 'row') {
                baseFontSize = 16;
            }
            const estiloParaConjuntoBase = {
            }
            let estiloFinal = {
                minWidth: this.ancho + 'px',
                minHeight: this.alto + 'px',
                borderRadius: this.orden === 0 ? '50%' : this.ofuscado ? `${1 * this.factorMagnificacion * this.factorZoom}px` : '0px',
                fontSize: `${baseFontSize * this.factorMagnificacion * this.factorZoom}px`,
            }
            if (this.base) {
                estiloFinal = { ...estiloFinal, ...estiloParaConjuntoBase };
            }

            return estiloFinal
        },
        estiloNombreConjunto() {
            return {
                backgroundColor: this.colorRepresentativo,
                opacity: this.ofuscamiento
            }
        }
    },
    methods: {
        getNombreConjuntoByOrden(orden) {
            return getNombreConjuntoNumericoFromPotencia(orden);
        },
        setOutOfSight() {
            let offset = this.$el.getBoundingClientRect();
            if (offset.bottom < 0 || offset.top > window.innerHeight || offset.left > window.innerWidth || offset.right < 0) {
                this.outOfSight = true;
                return;
            }
            this.outOfSight = false;
        }
    },
    watch: {
        refreshSight: {
            handler: function() {
                console.log(`Alive`);
                this.setOutOfSight();
            },
        }
    },
    mounted() {
        this.setOutOfSight();
    }
}


const VentanaConjuntosZoomables = {
    template: `
        <div class="ventanaConjuntosZoomables" @wheel.ctrl.prevent="zoomView">
<span style="z-index: 100; position: fixed; top: 2vh; left: 2vw">    {{Math.pow(1.2, zoom)}}</span>
            <conjunto-numerico-zoomable :numero="numero" :index="0" :orden="ordenNumero" :zoom="zoom" :base="true" :refreshSight="refreshSight">
            </conjunto-numerico-zoomable>
        </div>
    `,
    name: "VentanaConjuntosZoomables",
    components: {
        ConjuntoNumericoZoomable
    },
    props: {
        numero: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            zoom: -10,
            refreshSight: 0,
            dateLastRefreshSight: Date.now(),
            timerRefreshSight: null,

        }
    },
    computed: {
        ordenNumero() {
            let potenciaPosible = 0;
            while (Math.floor(this.numero / Math.pow(10, potenciaPosible)) > 1) {
                potenciaPosible++
            }
            return potenciaPosible;
        },
    },
    methods: {
        zoomView(evento) {
            if (evento.deltaY > 0) {
                this.zoom -= 1;
            }
            else {
                this.zoom += 1;
            }
        },
        increaseRefreshSight() {
            console.log("Refreshing sight");
            this.refreshSight++;
            this.dateLastRefreshSight = Date.now();
        },
        debounceRefreshSight() {
            let umbral = 200;
            if (Date.now() - this.dateLastRefreshSight < umbral) {
                clearTimeout(this.timerRefreshSight);
                this.timerRefreshSight = setTimeout(() => {
                    this.increaseRefreshSight();
                }, umbral);
                return;
            }
            else {
                this.increaseRefreshSight();
            }
        }
    },
    watch: {
        zoom() {
            this.debounceRefreshSight();
        }
    },
    mounted() {
        console.log("Setting up scroll handler");
        window.addEventListener("wheel", this.debounceRefreshSight);
    },
    beforeDestroy() {
        window.removeEventListener("wheel", this.debounceRefreshSight);
    }
}
