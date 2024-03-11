export const componenteTriangulo = {
    template: `
        <div class="componenteTriangulo" :class="{conCentro}" ref="componenteTriangulo" :style="[estiloTriangulo]">
            <div class="lado ladoBase">
            </div>
            <div class="lado lado1" :style="[estiloLado1]">
            </div>
            <div class="lado lado2" :style="[estiloLado2]">
            </div>
            <div  class="label labelLargo" :class="{simbolizado: propiedadesSimbolizadas.includes('largo'), explicitable: propiedadesExplicitables.includes('largo'), explicitado: propiedadesExplicitadas.includes('largo')}">
                <span class="visibleNormalmente">l</span><span class="visibleHovered">={{truncar(largo)}}</span>
            </div>
            <div class="label labelAncho" :class="{simbolizado: propiedadesSimbolizadas.includes('ancho'), explicitable: propiedadesExplicitables.includes('ancho'), explicitado: propiedadesExplicitadas.includes('ancho')}">
                <span class="visibleNormalmente">a</span><span class="visibleHovered">={{' ' + truncar(ancho)}}</span>
            </div>
            <slot>
            </slot>
        </div>
    `,
    props: {
        decimales: {
            type: Number,
            default: 2,
        },
        conCentro: {
            type: Boolean,
            default: false,
        },
        propiedadesRepresentadas: {
            type: Array,
            default: ["largo", "ancho"],
        },
        propiedadesSimbolizadas: { //Propiedades cuyo símbolo aparece junto a su representación.
            type: Array,
            default: ["largo", "ancho"]
        },
        propiedadesExplicitables: { //Propiedades cuyo valor se puede conocer mediante hover.
            type: Array,
            default: ["largo", "ancho"]
        },
        propiedadesExplicitadas: { //Propiedades cuyo valor está siempre explícito sin necesidad de hover.
            type: Array,
            default: [],
        },
        largo: {
            type: Number,
            default: 3,
        },
        ancho: {
            type: Number,
            default: 5
        },
        xPunta: {
            type: Number,
            default: 3,
            validator: (value, props) => {
                return value <= props.ancho && value >= 0
            }
        },
        unidad: {
            type: Number,
            default: 20,
        }

    },
    data() {
        return {

        }
    },
    computed: {
        estiloTriangulo() {
            return {
                width: this.ancho * this.unidad + 'px',
                height: this.largo * this.unidad + 'px',
            }
        },
        rotacionLado1() {
            return Math.atan2(this.largo, this.xPunta);
        },
        rotacionLado2() { //Con referencia al sentido negativo del eje horizontal.
            return Math.atan2(this.largo, this.ancho - this.xPunta);
        },
        estiloLado1() {
            return {
                width: this.unidad * this.xPunta / Math.cos(this.rotacionLado1) + 'px',
                transform: `rotate(-${this.rotacionLado1}rad)`
            }
        },
        estiloLado2() {
            return {
                width: this.unidad * (this.ancho - this.xPunta) / Math.cos(this.rotacionLado2) + 'px',
                transform: `rotate(${Math.PI + this.rotacionLado2}rad)`,
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
    }
}