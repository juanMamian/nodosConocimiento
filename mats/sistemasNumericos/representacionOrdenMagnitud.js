let conjuntoNumerico;
conjuntoNumerico = {
    template: `
        <div class="conjuntoNumerico" :class="{bolitaNumero: esUnidad}"  :style="[estiloConjunto]" @mouseenter="hoveringMe=true">
            <div class="labelConjunto" ref="label" v-show="labeled && !mostrandoNombre && mostrandoSubconjuntos && lleno" :style="[estiloLabel]" @dblclick="toggleDoblar">
                {{nombreOrden}}
            </div>
            <div id="nombreConjunto" v-if="orden>0" :style="[estiloNombre, {backgroundColor: colorRepresentativo}]" ref="nombreConjunto" v-show="mostrandoNombre && lleno">
                {{nombreOrden}}
            </div>
            <div class="contenedorSubconjuntos"  :class="{lleno}" v-if="orden>0 && mostrandoSubconjuntos" ref="contenedorSubconjuntos" :style="[estiloContenedorSubconjuntos]">
                    <conjunto-numerico :labels="labels" :ordenPresentadoInicialmente="ordenPresentadoInicialmente" :numero-total="numeroTotal" :orden="orden-1" :cadena-index="cadenaIndex+index" v-for="(subnumero, index) of subnumeros" :ultimo="subnumeros.length===index+1 && ultimo" ref="subconjuntos" :key="orden-1 + '-' + Number(cadenaIndex)*10+index " :numero="subnumero" :identificadorOrden="Number(cadenaIndex)*10+index" >
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
            hoveringMe: false,
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
            let anchoLabel = this.$refs.label.offsetWidth;
            let altoLabel = this.$refs.label.offsetHeight;
            this.estiloNombre.width = anchoInicial + 'px';
            this.estiloNombre.height = altoInicial + 'px';
            this.$nextTick(() => {
                //                this.$refs.nombreConjunto.animate([
                //                    {
                //                        width: anchoLabel + 'px',
                //                        height: altoLabel + 'px',
                //                    },
                //                    {
                //                        width: '110px',
                //                        height: '30px',
                //                    },
                //
                //                ], { duration: 1000 }).finished.then(() => {
                //                });
                console.log(`Iniciando animación`);
                this.$refs.contenedorSubconjuntos.animate([
                    {
                        transform: 'scale(1)'
                    },
                    {
                        transform: 'scale(0)'
                    }
                ], { duration: 1000 }).finished.then(() => {
                    console.log(`Animación completada`);
                    this.mostrandoSubconjuntos = false;
                    this.mostrandoNombre = true;
                    this.estiloContenedorSubconjuntos.position = undefined;
                });
            })

        },
        desdoblar() {
            console.log(`Desdoblando`);
            this.mostrandoNombre = false;
            this.mostrandoSubconjuntos = true;
        },
        palabraToPlural(palabra) {
            let vocales = ["a", "e", "i", "o", "u"];
            if (vocales.includes(palabra.charAt(palabra.length - 1))) {
                return palabra + "s";
            }
            if (palabra.charAt(palabra.length - 1) === "z") {
                palabra = palabra.slice(palabra.length - 1) + "c";
            }
            return palabra + "es"

        }

    },
    computed: {
        labeled() {
            return this.labels.includes(this.orden);
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
        estiloLabel() {
            return {
                backgroundColor: this.colorRepresentativo,
            }
        },
        layoutNombre() {
        },
        esUnidad() {
            return this.orden === 0;
        },
        estiloConjunto() {
            let colorFondo = 0;

            return {
                border: this.lleno && this.labeled ? '1px dashed black' : '',
                borderColor: this.colorRepresentativo,
            }
        },
        lleno() {
            return this.numero === Math.pow(10, this.orden);
        },
        nombreOrden() {
            const bases = ['unidad', 'decena', 'centena'];
            const illones = ['', 'millon', 'billon', 'trillon', 'cuatrillon', 'quintillon', 'sextillon'];
            const base = bases[this.orden % 3];
            const mil = this.orden % 6 >= 3;
            const illon = illones[Math.floor(this.orden / 6)];
            let nombreFinal = "";
            if (this.orden === 0) {
                return "Unidad"
            }
            if (this.orden % 3 != 0) {
                nombreFinal += base.charAt(0).toUpperCase() + base.slice(1);
            }
            if (mil) {
                if (this.orden % 3 != 0) {
                    nombreFinal += " de miles"
                }
                else {
                    nombreFinal += "Mil"
                }
            }
            if (illon) {
                if (this.orden % 3 != 0) {//Hay base
                    nombreFinal += " de " + this.palabraToPlural(illon);
                }
                else if (!mil) {//No hay ni base ni miles. Es simplemente el illon con upper case en la inicial.
                    nombreFinal += illon.charAt(0).toUpperCase() + illon.slice(1);
                }
                else {//es sin base pero con miles.
                    nombreFinal += " " + this.palabraToPlural(illon);
                }
            }

            return nombreFinal
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

function getNombreConjuntoNumericoFromPotencia(potencia) {
    const bases = ['unidad', 'decena', 'centena'];
    const illones = ['', 'millon', 'billon', 'trillon', 'cuatrillon', 'quintillon', 'sextillon'];
    const base = bases[potencia % 3];
    const mil = potencia % 6 >= 3;
    const illon = illones[Math.floor(potencia / 6)];
    let nombreFinal = "";
    if (potencia === 0) {
        return "Unidad"
    }
    if (potencia % 3 != 0) {
        nombreFinal += base.charAt(0).toUpperCase() + base.slice(1);
    }
    if (mil) {
        if (potencia % 3 != 0) {
            nombreFinal += " de miles"
        }
        else {
            nombreFinal += "Mil"
        }
    }
    if (illon) {
        if (potencia % 3 != 0) {//Hay base
            nombreFinal += " de " + this.palabraToPlural(illon);
        }
        else if (!mil) {//No hay ni base ni miles. Es simplemente el illon con upper case en la inicial.
            nombreFinal += illon.charAt(0).toUpperCase() + illon.slice(1);
        }
        else {//es sin base pero con miles.
            nombreFinal += " " + this.palabraToPlural(illon);
        }
    }

    return nombreFinal

}
