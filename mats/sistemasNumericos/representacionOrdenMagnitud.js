let representacionOrdenMagnitudComponente;
representacionOrdenMagnitudComponente = {
    template: `
        <div class="ordenMagnitudComponente" :class="{ultimo}" @dblclick.stop="toggleDoblar">
               <div id="contenedorDobleSubpartes" v-if="!resumida" ref="contenedorDobleSubpartes">
                    <div id="contenedorSubordenes" class="contenedorSubpartes" v-if="factores.length>1">
                        <representacion-orden-magnitud-componente :cantidad-original="cantidadOriginal" :cadena-index="cadenaIndex+index" :index="index" :factores="sigFactores" ref="subordenes" v-for="(conjunto, index) of cantidadChildren+1" :ultimo="ultimo && index===factores[0]" :key="cadenaIndex+'suborden'+index" />
                    </div>
                    <div id="contenedorBolitas" class="contenedorSubpartes" v-if="factores.length===1"  >
                        <div class="bolitaNumero" v-for="(bolita, index) of cantidadChildren" :key="'subbolita'+index" >
                        </div>
                    </div>
                </div>
               <div id="nombreOrden" v-else :style="[estiloNombreOrden]" ref="nombreOrden">  
                    {{nombreOrden}}
               </div>
        </div>
    `,
    name: "representacionOrdenMagnitudComponente",
    components: {
        representacionOrdenMagnitudComponente
    },
    props: {
        index: {
            type: Number,
        },
        cadenaIndex: {
            type: String,
            required: true,
        },
        cantidadOriginal: {
            type: Number,
        },
        factores: {
            type: Array,
            required: true,
        },
        ultimo: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            ordenesBase: ["unidad", "decena", "centena"],
            ordenesSecundarios: ['', 'millon', 'billon', 'trillon', 'cuatrillon', 'quintillon', 'sextillon'],
            resumida: false,
            doblada: false,
            estiloNombreOrden: {
                width: '100px',
                height: '50px'
            }
        }
    },
    methods: {
        toggleDoblar() {
            if (this.resumida) {
                this.desdoblar();
            }
            else {
                this.doblar();
            }
        },
        doblar() {
            console.log(`Doblando ${this.nombreOrden} ${this.index}`);
            let anchoInicial = this.$el.offsetWidth;
            let altoInicial = this.$el.offsetHeight;
            this.$refs.contenedorDobleSubpartes.animate([
                {
                    transform: 'translateY(0px)'
                },
                {
                    transform: 'translateY(100%)'
                }
            ], { duration: 1000 }).finished.then(() => {
                this.resumida = true;
                this.estiloNombreOrden.width = anchoInicial + 'px';
                this.estiloNombreOrden.height = altoInicial + 'px';
                this.$nextTick(() => {
                    this.$refs.nombreOrden.animate([
                        {
                            transform: 'translateY(-100%)'
                        },
                        {
                            transform: 'translateY(0px)'
                        }
                    ], { duration: 1000 }).finished.then(() => {
                        this.estiloNombreOrden.width = undefined;
                        this.estiloNombreOrden.height = undefined;
                        this.doblada = true
                    });
                })
            })
        },
        desdoblar() {
            console.log(`Desdoblando ${this.nombreOrden} ${this.index} con ${this.$refs.subordenes.length}`);

            this.$refs.subordenes.forEach(suborden => {
                console.log(`checking suborden antes de desdoblar: ${suborden.dat.doblada}`);
            })
            this.resumida = false;
            this.doblada = false;
        }
    },
    computed: {
        sigFactores() {
            return this.factores.slice(1);
        },
        orden() {
            return this.factores.length;
        },
        cantidadChildren() {
            return this.ultimo ? this.factores[0] : 10;
        },
        nombreOrden() {
            const ordenBase = this.ordenesBase[this.factores.length % 3];
            const mil = this.factores.length % 6 > 3;
            const ordenSecundario = Math.floor(this.factores.length / 6);
            return `${ordenBase}  ${mil ? 'mil' : ''} ${this.ordenesSecundarios[ordenSecundario]}`;
        }
    },
    watch: {
        factores() {
            let ultimoFactor = this.factores[this.factores.length - 1];
            if (this.ultimo && ultimoFactor === 10) {

            }
        },
        cantidadChildren(valor, anteriorValor) {
            if (valor === 10) {
                this.doblar();
            }
        },
        nombreOrden(nuevo, viejo) {
            console.log(`${viejo} se convierte en ${nuevo}`);
            this.resumida = false;
            this.doblada = false;
        }
    },
    mounted() {
        if (!this.ultimo) {
            this.doblar();
        }
    }
}

