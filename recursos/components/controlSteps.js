export const componenteControlSteps = {
    template: `
        <div class="componenteControlSteps">
            <img class="icono" src="http://127.0.0.1:8080/recursos/iconos/shoePrints.svg">
            <input type="range" min="0" :max="steps.length-1" v-model.number="step">
            <div class="flexHorizontal">
                <button class="boton" @click="stepBackward" :disabled="step<=0">
                    Anterior
                </button>
                <button class="boton" @click="stepForward" :disabled="(steps[step].acciones && steps[step].acciones.some(accion=>!accionesRealizadas.includes(accion))) || step>=steps.length-1">
                    Siguiente
                </button>
            </div>

            <div class="contenedorRelato">
                <transition name="fadeIn">
                    <div class="itemRelato" :key="step">
                    {{steps[step].texto}}
                    </div>
                </transition>

                <transition name="fadeIn">
                    <button class="boton" v-if="siguienteAccion" @click="ejecutarSiguienteAccion">
                        {{siguienteAccion}}
                    </button>
                </transition>
            </div>
                <slot>
                </slot>
        </div>
    `,
    props: {
        steps: {//Array con objetos que tienen: {relato, acciones}
            type: Array,
            default: [],
        },
        stepInicial: {
            type: Number,
            default: 0,
        }
    },
    data() {
        return {
            step: this.stepInicial,
            accionesRealizadas: [],
        }
    },
    computed: {
        currentStep() {
            if (this.step >= this.steps.length) {
                return this.steps[this.steps.length - 1];
            }
            if (this.step < 0) {
                return this.steps[0];
            }
            return this.steps[this.step];
        },
        siguienteAccion() {
            if (!this.currentStep.acciones) {
                return null
            }
            let acciones = this.currentStep.acciones;
            for (var i = 0; i < acciones.length; i++) {
                if (!this.accionesRealizadas.includes(acciones[i])) {
                    return acciones[i];
                }
            }
            return null;
        }
    },
    methods: {
        ejecutarSiguienteAccion() {
            if (!this.siguienteAccion) {
                console.log(`No había siguiente acción`);
                return;
            }
            if (this.accionesRealizadas.includes(this.siguienteAccion)) {
                console.log(`Acción ya estaba realizada`);
                return;
            }
            this.accionesRealizadas = [...this.accionesRealizadas, this.siguienteAccion];
        },
        stepForward() {
            if (this.steps[this.step].acciones && this.steps[this.step].acciones.some(accion => !this.accionesRealizadas.includes(accion))) {
                console.log(`Hay acciones sin realizar`);
                return;
            }
            if (this.step >= this.steps.length - 1) {
                console.log(`No hay más steps`);
                return;
            }
            this.step++
        },
        stepBackward() {
            if (this.step < 1) {
                console.log(`No hay steps menores`);
                return;
            }
            this.step--

        }
    },
    watch: {
        step(step) {
            this.accionesRealizadas = [];
            this.$emit('step', step);
        },
        accionesRealizadas(acciones) {
            this.$emit("accionesRealizadas", acciones);
        }

    }

}
