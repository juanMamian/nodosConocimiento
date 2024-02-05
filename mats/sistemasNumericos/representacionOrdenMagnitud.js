let conjuntoNumerico;
conjuntoNumerico = {
    template: `
        <div class="conjuntoNumerico" :class="{bolitaNumero: esUnidad}" @dblclick.stop="toggleDoblar" :style="[estiloConjunto]">
            <div id="nombreConjunto" v-if="orden>0" :style="[estiloNombreConjunto]" v-show="mostrandoNombre && lleno" ref="nombreConjunto">
                {{nombreOrden}}
            </div>
            <div class="contenedorSubconjuntos" :class="{lleno}" v-if="orden>0" v-show="mostrandoSubconjuntos" ref="contenedorSubconjuntos" :style="[estiloContenedorSubconjuntos]">
                    <conjunto-numerico v-for="(subnumero, index) of subnumeros" :key="'subnumero'+index" :numero="subnumero" />
            </div>
        </div>
    `,
    name: "conjuntoNumerico",
    components: {
        conjuntoNumerico
    },
    props: {
        numero: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            doblar: false,
            mostrandoSubconjuntos: true,
            mostrandoNombre: false,
        }
    },
    methods: {
        toggleDoblar() {
            if(this.subnumeros.length!=10){
                return;
            }
            if(this.mostrandoSubconjuntos && !this.mostrandoNombre){
                this.doblar();
            }
            else if(!this.mostrandoSubconjuntos && this.mostrandoNombre){
                this.desdoblar();
            }
            else{
                console.log(`No había condiciones para toggle doblar`);
            }
        },
        doblar(){

        }

    },
    computed: {
        esUnidad(){
            return this.orden===0;
        },
        estiloConjunto() {
            return {
                borderRadius: this.esUnidad ? '50%' : '10px',
                borderColor: this.lleno?'black':'transparent',
            }
        },
        estiloNombreConjunto(){
            return {

            }
        },
        estiloContenedorSubconjuntos(){
            return {

            }
        },
        lleno(){
            return this.numero===Math.pow(10, this.orden);
        },
        orden() {
            let potencia = -20;
            while (potencia < 20) {
                let divisor = Math.pow(10, potencia);
                if (this.numero / divisor <= 10) {
                    return potencia + 1;
                }
                potencia++;
            }
            console.log(`Error, el orden resultó mayor que 20`);
            return 0;
        },
        nombreOrden() {
            const bases = ['unidad', 'decena', 'centena'];
            const illones = ['', 'millones', 'billones', 'trillones', 'cuatrillones', 'quintillones', 'sextillones'];
            const base = bases[this.orden % 3];
            const mil = this.orden % 6 >= 3;
            const illon = illones[Math.floor(this.orden / 6)];
            return base + (mil ? ' mil' : '') + (illon ? ' ' + illon : '');
        },
        subnumeros() {
            let paquete = Math.pow(10, this.orden - 1);
            let cantidad = this.numero;
            let subnumeros = [];
            while (cantidad > paquete) {
                cantidad -= paquete;
                subnumeros.push(paquete);
            }
            subnumeros.push(cantidad);
            return subnumeros;
        }

    },
    watch: {
    },
    mounted() {
    }
}

