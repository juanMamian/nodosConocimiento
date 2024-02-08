let conjuntoNumerico;
conjuntoNumerico = {
    template: `
        <div class="conjuntoNumerico" :class="{bolitaNumero: esUnidad}" @dblclick="toggleDoblar" :style="[estiloConjunto]">
            <div class="labelConjunto" v-show="labels.includes(orden) && !mostrandoNombre && mostrandoSubconjuntos && lleno">
                {{nombreOrden}}
            </div>
            <div id="nombreConjunto" v-if="orden>0" :style="[estiloNombre]" ref="nombreConjunto" v-show="mostrandoNombre && lleno">
                {{nombreOrden}}
            </div>
            <div class="contenedorSubconjuntos"  :class="{lleno}" v-if="orden>0 && mostrandoSubconjuntos" ref="contenedorSubconjuntos" :style="[estiloContenedorSubconjuntos]">
                    <conjunto-numerico :ordenPresentadoInicialmente="ordenPresentadoInicialmente" :numero-total="numeroTotal" :orden="orden-1" :cadena-index="cadenaIndex+index" v-for="(subnumero, index) of subnumeros" :ultimo="subnumeros.length===index+1 && ultimo" ref="subconjuntos" :key="orden-1 + '-' + Number(cadenaIndex)*10+index " :numero="subnumero" :identificadorOrden="Number(cadenaIndex)*10+index" >
                    </conjunto-numerico>
            </div>
        </div>
    `,
    name: "conjuntoNumerico",
    components: {
        conjuntoNumerico
    },
    props: {
        labels: {
            type: Array,
            default: []
        },
        ordenPresentadoInicialmente: {
            type: Number,
            default: 0,
        },
        numeroTotal: {
            type: Number,
            required: true,
        },
        orden: {
            type: Number,
            required: true,
        },
        identificadorOrden: {
            type: Number,
        },
        numero: {
            type: Number,
            required: true,
        },
        ultimo: {
            type: Boolean,
        },
        cadenaIndex: {
            type: String,
        }
    },
    data() {
        let mostrandoNombre = this.orden === this.ordenPresentadoInicialmente && this.orden != 0;
        return {
            mostrandoSubconjuntos: this.orden > this.ordenPresentadoInicialmente,
            mostrandoNombre,
            estiloNombre: {
                width: '110px',
                height: '30px',
            },
            estiloContenedorSubconjuntos: {
            },
        }
    },
    methods: {
        toggleDoblar(evento) {
            if (this.orden < 1) {
                return;
            }
            if (!this.lleno) {
                return;
            }
            if (this.mostrandoSubconjuntos && !this.mostrandoNombre) {
                evento.stopPropagation();
                this.doblar();
            }
            else if (!this.mostrandoSubconjuntos && this.mostrandoNombre) {
                evento.stopPropagation();
                this.desdoblar();
            }
            else {
                console.log(`No había condiciones para toggle doblar`);
            }
        },
        ocultarChildren() {
            let children = this.$refs.subconjuntos;
            if (children && children.length > 0) {
                for (let child of children) {
                    child.ocultarmeAndChildren();
                }
            }
        },
        ocultarmeAndChildren() {
            let children = this.$refs.subconjuntos;
            if (children && children.length > 0) {
                for (let child of children) {
                    child.ocultarmeAndChildren();
                }
            }
            this.forceDoblar();
        },
        forceDoblar() {
            this.mostrandoSubconjuntos = false;
            this.mostrandoNombre = true;
        },
        forceDesdoblar() {
            console.log(`Forcingly desdoblando`);
            this.mostrandoSubconjuntos = true;
            this.mostrandoNombre = false;
        },
        doblar() {
            if (!this.lleno) {
                console.log("No lleno");
                this.mostrandoSubconjuntos = true;
                this.mostrandoNombre = false;
                return;
            }
            console.log(`Doblando ${this.cadenaIndex}`);

            if (!this.mostrandoSubconjuntos || this.mostrandoNombre) {
                console.log("No se podía doblar");
                return;
            }
            let anchoInicial = this.$refs.contenedorSubconjuntos.offsetWidth;
            let altoInicial = this.$refs.contenedorSubconjuntos.offsetHeight;
            this.mostrandoNombre = true;
            this.estiloContenedorSubconjuntos.position = 'absolute';
            this.estiloNombre.width = anchoInicial + 'px';
            this.estiloNombre.height = altoInicial + 'px';
            this.$nextTick(() => {
                this.$refs.nombreConjunto.animate([
                    {
                        transform: 'translateY(-100%)',
                    },
                    {
                        transform: 'translateY(0%)',
                    },

                ], { duration: 1000 }).finished.then(() => {
                    this.mostrandoSubconjuntos = false;
                    this.estiloContenedorSubconjuntos.position = undefined;
                    this.$refs.nombreConjunto.animate([
                        {
                            width: anchoInicial + 'px',
                            height: altoInicial + 'px',
                        },
                        {
                            width: '110px',
                            height: '30px',
                        }
                    ], { duration: 1000 }).finished.then(() => {
                        this.estiloNombre.width = '110px';
                        this.estiloNombre.height = '30px';
                    })
                })
            })

        },
        desdoblar() {
            console.log(`Desdoblando`);
            this.mostrandoNombre = false;
            this.mostrandoSubconjuntos = true;
        }

    },
    computed: {
        layoutNombre() {
        },
        esUnidad() {
            return this.orden === 0;
        },
        estiloConjunto() {
            let colorFondo = 0;

            return {
                border: this.lleno ? '1px dashed black' : '',
            }
        },
        lleno() {
            return this.numero === Math.pow(10, this.orden);
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
        mostrandoNombre: {
            handler: function(nuevo, viejo) {
            },
            immediate: true
        },
    },
    mounted() {
    }
}

