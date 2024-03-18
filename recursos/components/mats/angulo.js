import { radToDeg, truncar } from "https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/nodosConocimiento/recursos/funciones/utilsMats.js"
export const componenteAngulo = {
    template: `
        <div class="componenteAngulo" :style="[estiloComponente]">
            <div class="linea linea1" :style="[estiloLinea1]">
            </div>
            <div class="linea linea2" :style="[estiloLinea2]">
            </div>
            <canvas class="canvasAngulo" ref="canvasAngulo" v-if="anguloRepresentado">
            </canvas>
            <div :style="[estiloLabel]" class="label labelAngulo" :class="{explicitable: anguloExplicitable, explicitado: anguloExplicitado}" v-show="anguloSimbolizado">
                <span class="visibleNormalmente">{{simboloAngulo}}</span><span class="visibleHovered">={{numeroGrados}}</span>
            </div>
        </div>
    `,
    props: {
        size: {
            type: Number,
            default: 200,
        },
        angulo: {
            type: Number,
            default: Math.PI / 4,
        },
        colorAngulo: {
            type: String,
            default: 'var(paletaActual)',
        },
        rotacion: {
            type: Number,
            default: 0,
        },
        porcentajeTrazoAngulo: {
            type: Number,
            default: 15,
        },
        anguloRepresentado: {
            type: Boolean,
            default: true,
        },
        anguloSimbolizado: {
            type: Boolean,
            default: true,
        },
        anguloExplicitable: {
            type: Boolean,
            default: true,
        },
        anguloExplicitado: {
            type: Boolean,
            default: false,
        },
        simboloAngulo: {
            type: String,
            default: 'α',
        },
        enGrados: {
            type: Boolean,
            default: false,
        },
        decimales: {
            type: Number,
            default: 2
        }

    },
    data() {
        return {
            widthCanvas: 0,
            heightCanvas: 0,

            canvasConfigurado: false,
        }
    },
    computed: {
        estiloLabel() {
            let radio = this.widthCanvas * (this.porcentajeTrazoAngulo + 10) / 100;
            let vector = {
                x: radio * Math.cos(this.rotacion + this.angulo / 2),
                y: radio * Math.sin(this.rotacion + this.angulo / 2),
            }
            return {
                left: `calc(50% + ${vector.x}px)`,
                top: `calc(50% + ${vector.y}px)`,
            }

        },
        numeroGrados() {
            let angulo = this.angulo;
            if (this.enGrados) {
                angulo = radToDeg(angulo);
            }
            if (this.decimales != -1) {
                angulo = Number(truncar(angulo, this.decimales));

            }
            return angulo;
        },
        estiloComponente() {
            return {
                width: this.size + 'px',
                height: this.size + 'px',
            }
        },
        estiloLinea1() {
            return {
                transform: `rotate(${this.rotacion}rad)`,
            }
        },
        estiloLinea2() {
            return {
                transform: `rotate(${this.angulo + this.rotacion}rad)`,
            }
        }
    },
    methods: {
        radToDeg,
        configurarCanvas() {
            console.log(`Configurando canvas`);
            const canvas = this.$refs.canvasAngulo;
            const offsetCanvas = canvas.getBoundingClientRect();
            canvas.width = offsetCanvas.width;
            this.widthCanvas = canvas.width;
            canvas.height = offsetCanvas.height;
            this.heightCanvas = canvas.height;

            this.canvasConfigurado = true;
        },
        trazarAngulo() {
            if (!this.$refs.canvasAngulo) {
                console.log(`No hay canvas`);
                return;
            }
            if (!this.canvasConfigurado) {
                this.configurarCanvas();
            }
            console.log(`Trazando ángulo`);
            const lapiz = this.$refs.canvasAngulo.getContext("2d");
            const radio = this.widthCanvas * this.porcentajeTrazoAngulo / 100;
            lapiz.clearRect(0, 0, this.widthCanvas, this.heightCanvas);
            lapiz.beginPath();
            lapiz.arc(this.widthCanvas / 2, this.heightCanvas / 2, radio, this.rotacion, this.rotacion + this.angulo);
            lapiz.stroke();
        }
    },
    watch: {
        angulo: {
            handler: function() {
                this.trazarAngulo();
            },
            immediate: true

        }
    },
    mounted() {
        this.$nextTick(() => {
            this.configurarCanvas();
            this.trazarAngulo();

        });
    }

}
