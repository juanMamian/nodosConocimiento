let ConjuntoNumericoZoomable;
ConjuntoNumericoZoomable = {
    template: `
        <div class="conjuntoNumericoZoomable" :style="estiloConjunto">
            <div class="contenedorSubconjuntos" v-if="!ofuscado && orden>0" :style="[estiloContenedorSubconjuntos]">
                <ConjuntoNumericoZoomable v-for="(subnumero, index) of subnumeros" :index="index" :numero="subnumero" :orden="orden-1" :zoom="zoom" :ordenMinimo="ordenMinimo"/>
            </div>
            <div class="nombreConjunto" v-show="ofuscamiento>0" :style="[estiloNombreConjunto]">
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
        }
    },
    data() {
        return {
            spacingSubnumeros: 0.5, //El spacing entre números internos es 50% del tamaño de los números internos.
            baseSize: 40,
            baseGap: 20,
            baseFontSize: 15,
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
            if (this.orden === 2 && this.index === 0) {
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
            let anchoInicio=350;
            let anchoFinal=300;
            if(this.orientacion==='column'){
                anchoInicio*=0.5;
                anchoFinal*=0.5;
            }
            const step=(anchoFinal-anchoInicio)/10;
            if(this.orden===2 && this.index===0){
                console.log(`En la primera centena: ofuscamiento: ${(10-(anchoFinal-this.ancho)/step)/10}`)
            }
            return (10-(anchoFinal-this.ancho)/step)/10;
        },
        ofuscado() {
            return this.orden===this.ordenMinimo || this.ofuscamiento>=1;
        },
        outOfSight() {

        },
        subnumeros() {
            let porcionMaxima = Math.pow(10, this.orden - 1);
            let cantidadTotal = this.numero;
            let subnumeros = [];
            while (cantidadTotal > porcionMaxima) {
                subnumeros.push(porcionMaxima);
                cantidadTotal -= porcionMaxima;
            }
            subnumeros.push(cantidadTotal);
            return subnumeros;
        },
        factorZoom() {
            return Math.pow(1.2, this.zoom);
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
        estiloConjunto() {
            let baseFontSize = 9;
            if (this.orientacion === 'row') {
                baseFontSize = 16;
            }
            const alto = this.baseSize * this.factorMagnificacion;
            const estiloParaConjuntoBase = {
                alignSelf: 'center',
                justifySelf: 'center',
            }
            let estiloFinal = {
                minWidth: this.ancho + 'px',
                minHeight: alto * this.factorZoom + 'px',
                borderRadius: this.orden === 0 ? '50%' : this.ofuscado ? `${1 * this.factorMagnificacion * this.factorZoom}px` : '0px',
                fontSize: `${baseFontSize * this.factorMagnificacion * this.factorZoom}px`,
                backgroundColor: this.ofuscado ? this.colorRepresentativo : 'transparent',
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
}


const VentanaConjuntosZoomables = {
    template: `
        <div class="ventanaConjuntosZoomables" @wheel.ctrl.prevent="zoomView">
<span style="z-index: 100; position: fixed; top: 2vh; left: 2vw">    {{Math.pow(1.2, zoom)}}</span>
            <conjunto-numerico-zoomable :numero="numero" :index="0" :orden="ordenNumero" :zoom="zoom" :base="true">
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
            zoom: 0,
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
        }
    },
    mounted() {
        console.log("Setting up scroll handler");
    }
}
