export const componenteCirculo = {
    template: `
        <div class="componenteCirculo" :class="{conCentro}" ref="componenteCirculo" :style="[estiloCirculo]">
            <div class="representacionDiametro" :style="[{transform: 'rotate(' + -rotacionDiametro + 'rad)'}]">
                <div class="label"
                    :style="[{transform: 'translate(-50%, -50%) rotate('+ rotacionDiametro +'rad)'}]">
                    <span class="visibleNormalmente">D</span><span class="visibleHovered">={{truncar(diametro)}}</span>
                </div>
            </div>
            <div class="representacionRadio" :style="[{transform: 'rotate(' + -rotacionRadio + 'rad)'}]">
                <div class="label"
                    :style="[{transform: 'translate(-50%, -50%) rotate('+ rotacionRadio +'rad)'}]">
                    <span class="visibleNormalmente">r</span><span class="visibleHovered">={{truncar(radio)}}</span>
                </div>
            </div>
            <div class="labelCircunferencia label">
                <span class="visibleNormalmente">C</span> <span class="visibleHovered">={{truncar(circunferencia)}}</span>
            </div>
        </div>
    `,
    props: {
        rotacionRadio: {
            type: Number,
            default: Math.PI / 6,
        },
        rotacionDiametro: {
            type: Number,
            default: 0,
        },
        determinante: { //Magnitud que determina el círculo. Sólo puede ser una
            type: Object,
            default: { radio: 2 },
            validator(value) {
                const valores = ["radio", "diametro", "circunferencia"];
                return Object.keys(value).length === 1 && valores.includes(Object.keys(value)[0]);
            }
        },
        decimales: {
            type: Number,
            default: 2,
        },
        conCentro: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            radio: 0,
            diametro: 0,
            circunferencia: 0,

            unidad: 20,
        }
    },
    computed: {
        estiloCirculo() {
            return {
                width: this.diametro * this.unidad + 'px',
                height: this.diametro * this.unidad + 'px',
            }
        }
    },
    methods: {
        truncar(num) {
            let versionTruncada = num.toFixed(this.decimales);
            if (Number(versionTruncada.split(".")[1]) === 0) {
                return num
            }
            return versionTruncada;
        },
    },
    watch: {
        determinante: {
            handler: function(determinante) {
                const keyDato = Object.keys(determinante)[0];
                const dato = Object.values(determinante)[0];
                if (keyDato === 'radio') {
                    this.radio = dato;
                    this.diametro = dato * 2;
                    this.circunferencia = dato * 2 * Math.PI;
                }
                else if (keyDato === 'diametro') {
                    this.diametro = dato;
                    this.radio = dato / 2;
                    this.circunferencia = dato * Math.PI;
                }
                else if (keyDato === 'circunferencia') {
                    this.circunferencia = dato;
                    this.radio = dato / (2 * Math.PI);
                    this.diametro = dato / Math.PI;
                }
                else {
                    console.log(`Determinante desconocido`);
                }
            },
            immediate: true
        }
    }
}