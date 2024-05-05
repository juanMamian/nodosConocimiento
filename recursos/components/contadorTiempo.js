import { componenteOcto } from "http://127.0.0.1:8080/recursos/components/octo.js"
export const componenteContadorTiempo = {
    template: `
        <div class="componenteContadorTiempo">
            <div class="circuloReloj" :style="[estiloCirculo]">
                <div class="aguja horero" :style="[estiloHorero]">
                </div>
                <div class="aguja minutero" :style="[estiloMinutero]">
                </div>
                <div class="aguja segundero" :style="[estiloSegundero]">
                </div>
            </div>
            <div class="display" :style="[estiloDisplay]">
                <template v-if="conHoras">
                <componente-octo :style="[estiloOctos]" :numero="Number(horasString.charAt(0))">
                </componente-octo>
                <componente-octo :style="[estiloOctos]" :numero="Number(horasString.charAt(1))">
                </componente-octo>
                <div class="dosPuntos">:</div>
                </template>
                <componente-octo :style="[estiloOctos]" :numero="Number(minutosString.charAt(0))">
                </componente-octo>
                <componente-octo :style="[estiloOctos]" :numero="Number(minutosString.charAt(1))">
                </componente-octo>
                <div class="dosPuntos">:</div>
                <componente-octo :style="[estiloOctos]" :numero="Number(segundosString.charAt(0))">
                </componente-octo>
                <componente-octo :style="[estiloOctos]" :numero="Number(segundosString.charAt(1))">
                </componente-octo>
                <div class="dosPuntos">:</div>
                <template v-if="conCentesimas">
                <componente-octo :style="[estiloOctos]" :numero="Number(centesimasString.charAt(0))">
                </componente-octo>
                <componente-octo :style="[estiloOctos]" :numero="Number(centesimasString.charAt(1))">
                </componente-octo>
                </template>
            </div>
        </div>
    `,
    props: {
        estado: {
            type: String,
            default: "pause"
        },
        conCentesimas: {
            type: Boolean,
            default: true,
        },
        conHoras: {
            type: Boolean,
            default: false,
        },
        step: {// Resolución del reloj en milésimas.
            type: Number,
            default: 107,
        },
        sizeOctos: {
            type: Number,
            default: 10,
        },
        sizeCirculo: {
            type: Number,
            default: 50,
        }
    },
    components: {
        componenteOcto,
    },
    data() {
        return {
            milesimas: 0,
            dateInicio: null,
            centesimas: 0,
            segundos: 0,
            minutos: 0,
            horas: 0,

            timerStep: null,
        }
    },
    computed: {
        estiloHorero(){
            return {
                transform: `rotate(${-Math.PI/2 + this.horas*Math.PI/6}rad)`
            }
        },
        estiloMinutero(){
            return {
                transform: `rotate(${-Math.PI/2 + this.minutos*Math.PI/30}rad)`
            }
        },
        estiloSegundero(){
            return {
                transform: `rotate(${-Math.PI/2 + this.segundos*Math.PI/30}rad)`
            }
        },
        estiloCirculo() {
            return {
                width: this.sizeCirculo + 'px',
                height: this.sizeCirculo + 'px',
            }
        },
        estiloDisplay() {
            return {
                fontSize: this.sizeOctos * 8 + 'px'
            }
        },
        estiloOctos() {
            return {
                width: this.sizeOctos * 5 + 'px',
                height: this.sizeOctos * 10 + 'px',
            }
        },
        horasString() {
            let string = String(this.horas);
            if (string.length < 2) {
                string = '0' + string;
            }
            return string;
        },
        minutosString() {
            let string = String(this.minutos);
            if (string.length < 2) {
                string = '0' + string;
            }
            return string;
        },
        segundosString() {
            let string = String(this.segundos);
            if (string.length < 2) {
                string = '0' + string;
            }
            return string;
        },
        centesimasString() {
            let string = String(this.centesimas);
            if (string.length < 2) {
                string = '0' + string;
            }
            return string;
        },
    },
    methods: {
        activarTimer() {
            clearInterval(this.timerStep);
            this.timerStep = setInterval(this.ejecutarStep, this.step);
        },
        ejecutarStep() {
            if (!this.dateInicio) {
                this.$emit("tiempo", 0);
                return;
            }
            let tiempoTranscurrido = Date.now() - this.dateInicio;
            this.$emit("tiempo", tiempoTranscurrido);
            this.horas = Math.floor(tiempoTranscurrido / (1000 * 60 * 60));
            tiempoTranscurrido -= this.horas * 60 * 60 * 1000;
            this.minutos = Math.floor(tiempoTranscurrido / (1000 * 60));
            tiempoTranscurrido -= this.minutos * 60 * 1000;
            this.segundos = Math.floor(tiempoTranscurrido / (1000));
            tiempoTranscurrido -= this.segundos * 1000;
            this.centesimas = Math.floor(tiempoTranscurrido / 10);
        },
        forceSetTime(millis) {
            console.log(`Forcing time to ${millis}`);
            this.dateInicio = Date.now() - millis;
            this.ejecutarStep();
        }
    },
    watch: {
        estado: {
            handler: function(estado, estadoPrevio) {
                console.log(`Cambio a ${estado} `);
                if (estado === 'play') {
                    this.dateInicio = Date.now();
                    if (!this.dateInicio) {
                        this.dateInicio = Date.now();
                    }
                    this.activarTimer();

                }
                if (estado === 'stop') {
                    this.dateInicio = null;
                    this.centesimas = 0;
                    this.segundos = 0;
                    this.minutos = 0;
                    this.horas = 0;

                    clearInterval(this.timerStep);
                    this.ejecutarStep();
                }
                if (estado === 'pause') {
                    clearInterval(this.timerStep);
                }
            },
            immediate: true,
        }
    }

}
