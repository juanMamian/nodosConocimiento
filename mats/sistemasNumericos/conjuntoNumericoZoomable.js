let ConjuntoNumericoZoomable;
ConjuntoNumericoZoomable = {
    template: `
        <div class="conjuntoNumericoZoomable" :style="estiloConjunto">
            <div class="contenedorSubconjuntos" v-if="!ofuscado && orden>0" :style="[estiloContenedorSubconjuntos]">
                <ConjuntoNumericoZoomable v-for="(subnumero, index) of subnumeros" :index="index" :numero="subnumero" :orden="orden-1" :zoom="zoom"/>
            </div>
            <div class="nombreConjunto" v-show="ofuscado">
                {{nombreConjunto}}
            </div>
        </div>
    `,
    name: "ConjuntoNumericoZoomable",
    components: {
        ConjuntoNumericoZoomable
    },
    props: {
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
            if (esteColor > 16777215) {
                esteColor = esteColor % 16777215;
            }
            return "#" + Math.round(esteColor).toString(16);
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
        ofuscado() {
            let umbral=3;
            if(this.orientacion==='row'){
                umbral=umbral*10;
            }
            if(this.orden===2 && this.index===0){
                console.log(`Comparando ${Math.pow(10, Math.floor(this.orden/2))} y ${this.factorZoom} con ${umbral}`);
            }
            if(this.orden===1 && this.index===0){
                console.log(`Comparando decena; ${Math.pow(10, Math.floor(this.orden/2))} y ${this.factorZoom} con ${umbral}`);
            }
            return Math.pow(10, Math.floor(this.orden / 2)) * this.factorZoom<umbral;
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
        estiloConjunto() {
            const factorMagnificacion = Math.pow(10, Math.floor(this.orden / 2));
            let ancho = this.baseSize * factorMagnificacion;
            if (this.orientacion === 'row') {
                ancho = ancho * 10;
            }
            const alto = this.baseSize * factorMagnificacion;
            const estiloParaConjuntoBase = {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${this.factorZoom})`,
                width: ancho + 'px',
                height: alto + 'px',
                fontSize: '19px',
            }
            let estiloFinal = {
                borderRadius: this.orden === 0 ? '50%' : '5px',
                backgroundColor: this.ofuscado || this.orden === 0 ? this.colorRepresentativo : 'transparent',

            }
            if (this.base) {
                estiloFinal = { ...estiloFinal, ...estiloParaConjuntoBase };
            }

            return estiloFinal
        }
    }
}
