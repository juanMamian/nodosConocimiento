export const componenteControlSteps = {
    template: `
        <div class="componenteControlSteps">
            <img class="icono" src="https://juanmamian.github.io/recursos/iconos/shoePrints.svg">
            <input type="range" min="-1" :max="substeps.length-1" v-model.number="indexExecutedSubstep">

            <div class="contenedorRelato">
                    <div class="itemRelato" :class="{ itemRelatoActivo: executionStep>=indexEsteStep }" :key="indexEsteStep" v-for="( esteStep, indexEsteStep ) of steps">
                        {{esteStep.texto}}
                        <div class="contenedorIconoEjecutarAccion" v-for="( accion, indexEstaAccion ) of esteStep.acciones">
                            <button class="boton activador activo" v-if="getTupleSubstepIndex([indexEsteStep, indexEstaAccion])<=indexExecutedSubstep" @click="unsetExecutedTuple([indexEsteStep, indexEstaAccion])">
                                <img src="https://juanmamian.github.io/recursos/iconos/squareCheck.svg" class="iconoEjecutarAccion" >
                            </button>
                            <button class="boton" v-else @click="setExecutedTuple([indexEsteStep, indexEstaAccion])" :disabled="strictlyProgressive && indexExecutedSubstep+1!=getTupleSubstepIndex([indexEsteStep, indexEstaAccion])">
                                <img src="https://juanmamian.github.io/recursos/iconos/circlePlay.svg" class="iconoEjecutarAccion">
                            </button>
                        </div>
                    </div>

            </div>
                <slot>
                </slot>
        </div>
    `,
    props: {
        strictlyProgressive: { //Every action can be executed only if previous ones has been as well
            type: Boolean,
            default: true,
        },
        steps: {//Array con objetos que tienen: {relato, acciones}
            type: Array,
            default: () => [],
            validator(value) {
                return value.every(s => !s.acciones || s.acciones.length < 10)
            }
        },
        indexEx: {
            type: Number, // Tuple. First element signals the step and second the executed action.
            default: -1,
        },
    },
    data() {
        return {
            accionesRealizadas: [],
            indexExecutedSubstep: this.indexEx,
        }
    },
    computed: {
        substeps() {
            let arreglo = []; //Tuple array holding every possible [step, action] combination.
            for (let i = 0; i < this.steps.length; i++) {
                for (let j = 0; j < this.steps[i].acciones.length; j++) {
                    arreglo.push([i, j]);
                }
            }
            return arreglo;
        },
        decimalTupleStep() {
            return this.tupleStep[0] * 10 + this.tupleStep[1]
        },
        executedTuple() {
            return this.substeps[this.indexExecutedSubstep];
        },
        executionStep() {//Step currently waiting for actions execution.
            if (this.indexExecutedSubstep == null || this.indexExecutedSubstep < 0) {
                return 0;
            }
            if (this.indexExecutedSubstep >= this.substeps.length - 1) {
                return this.substeps[this.substeps.length - 1][0];
            }
            return this.substeps[this.indexExecutedSubstep + 1][0];
        },
        totalSubsteps() {
            return this.steps.reduce((acc, s) => {
                if (s.acciones) {
                    return s.acciones.length + acc
                }
                return acc
            }, 0)
        }
    },
    methods: {
        reiniciar() {
            console.log(`Reiniciando`);
            this.indexExecutedSubstep = -1;
        },
        setExecutedTuple(tuple) {
            let tIndex = this.substeps.findIndex(st => st[0] === tuple[0] && st[1] === tuple[1]);
            if (tIndex < 0) {
                console.log(`Setting executed an unexisting tuple`);
                return;
            }
            this.indexExecutedSubstep = tIndex;
        },
        unsetExecutedTuple(tuple) {
            let tIndex = this.substeps.findIndex(st => st[0] === tuple[0] && st[1] === tuple[1]);
            if (tIndex < 0) {
                console.log(`Setting unexecuted an unexisting tuple`);
                return;
            }
            this.indexExecutedSubstep = tIndex - 1;
        },
        getTupleSubstepIndex(tuple) { //Get the substep index of a [step, action] tuple.
            return this.substeps.findIndex(st => st[0] === tuple[0] && st[1] === tuple[1]);
        }
    },
    watch: {
        indexEx(index) {
            this.indexExecutedSubstep = index;
        },
        indexExecutedSubstep(index) {
            if (index < -1) {
                console.log(`Index executed went under -1`);
                return;
            }
            console.log(`Notificando`);
            if (index < 0) {
                this.$emit('executedTuples', []);
            }
            let executedList = this.substeps.slice(0, index + 1);
            this.$emit('executedTuples', executedList);
        },
        executionStep: {
            handler: function() {
                this.$emit('executionStep', this.executionStep);
            },
            immediate: true,
        }

    }

}
