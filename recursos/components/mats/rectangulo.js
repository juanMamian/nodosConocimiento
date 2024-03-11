
export const componenteRectangulo = {
    template: `
        <div class="componenteRectangulo" :class="{conCentro}" ref="componenteRectangulo" :style="[estiloRectangulo]">
            <div  class="label labelLargo" :class="{simbolizado: propiedadesSimbolizadas.includes('largo'), explicitable: propiedadesExplicitables.includes('largo'), explicitado: propiedadesExplicitadas.includes('largo')}">
                <span class="visibleNormalmente">l</span><span class="visibleHovered">={{truncar(largo)}}</span>
            </div>
            <div class="label labelAncho" :class="{simbolizado: propiedadesSimbolizadas.includes('ancho'), explicitable: propiedadesExplicitables.includes('ancho'), explicitado: propiedadesExplicitadas.includes('ancho')}">
                <span class="visibleNormalmente">a</span><span class="visibleHovered">={{' ' + truncar(ancho)}}</span>
            </div>
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
        estiloRectangulo() {
            return {
                width: this.ancho * this.unidad + 'px',
                height: this.largo * this.unidad + 'px',
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
