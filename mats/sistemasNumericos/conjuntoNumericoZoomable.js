let ConjuntoNumericoZoomable;
ConjuntoNumericoZoomable = {
    template: `
        <div class="conjuntoNumericoZoomable" :style="estiloConjunto">
            <div class="contenedorSubconjuntos" v-if="!ofuscado && orden>0">
                <div class="filaSubconjuntos" v-for="fila of filasSubconjuntos" :style="[estiloFilaSubconjuntos]">
                    <ConjuntoNumericoZoomable v-for="(subnumero, index) of subnumeros.slice(fila.inicio, fila.final)" :index="index" :numero="subnumero" :orden="orden-1" :zoom="zoom"/>
                </div>
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
        colorRepresentativo() {
            let colorBase = 12021615;
            let intervalo = 2796202.5;
            let esteColor = colorBase + intervalo * this.orden;
            if (esteColor > 16777215) {
                esteColor = esteColor % 16777215;
            }
            return "#" + Math.round(esteColor).toString(16);
        },
        estiloFilaSubconjuntos() {
            return {
            }
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
        scaling() {
            const factorZoomOrden = 5.5; //5.5 está basado en una anchura máxima de 4 subnúmeros con spacing de 0.5 veces cada subnúmero. Total: 5.5
            let scalingUp = Math.pow(factorZoomOrden, this.orden);
            let scalingFinal = scalingUp * this.zoom / 100;
            return scalingFinal;
        },
        ofuscado() {
            const umbral = 0.5
            return this.scaling < umbral;
        },
        outOfSight(){
            
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
            return this.zoom / 100;
        },
        estiloConjunto() {
            let factorGap = 0;
            let iteraciones = 1;
            let ordenCorregido=Math.ceil(this.orden/2);
            while (iteraciones <= ordenCorregido) {
                factorGap += Math.pow(10, iteraciones);
                iteraciones++;
            }
            let extension=this.factorZoom * (Math.pow(10, ordenCorregido) * this.baseSize + factorGap*this.baseGap) + 'px';
            let direccion=ordenCorregido%2!=0?'horizontal':'vertical';
            console.log(`Para orden ${this.orden} (${direccion}) se tiene un fg ${factorGap}`);
            return {
                borderRadius: this.orden === 0 ? '50%' : '5px',
                width: 
                height:
                fontSize: Math.round(this.baseFontSize * this.scaling) + 'px',
                gridArea: this.index + 1,
                backgroundColor: this.ofuscado ? this.colorRepresentativo : 'transparent',
            }
        }
    }
}
