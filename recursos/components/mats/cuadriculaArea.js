export const componenteCuadriculaArea = {
    template: `
        <div class="componenteCuadriculaArea" :style="estiloComponente">
            <transition name=scaleInTop>
                <div class="lado ladoTop" v-show="mostrandoUnidadesTop">
                    <div class="lineaUnitaria" v-for="num of ancho" :style="[estiloLineaUnitaria]"></div>
                </div>
            </transition>
            <transition name=scaleInLeft>
                <div class="lado ladoLeft" v-show="mostrandoUnidadesLeft">
                    <div class="lineaUnitaria" v-for="num of alto" :style="[estiloLineaUnitaria]"></div>
                </div>
            </transition>
            <div class="cuadricula" :style="[estiloCuadricula]">
                <transition-group name='unfoldIn'>
                    <div class="cuadroUnitario" v-for="num of (filasMostradasRealmente*ancho)" :key="num" :style="[{gridColumnStart: num%ancho, gridRowStart: Math.ceil(num/ancho)}]">
                    </div>
                </transition-group>
            </div>
            <slot>
            </slot>

        </div>
    `,
    props: {
        mostrandoUnidadesTop: {
            type: Boolean,
            default: false,
        },
        mostrandoUnidadesBottom: {
            type: Boolean,
            default: false,
        },
        mostrandoUnidadesRight: {
            type: Boolean,
            default: false,
        },
        mostrandoUnidadesLeft: {
            type: Boolean,
            default: false,
        },
        ancho: {
            type: Number,
            default: 4,
        },
        alto: {
            type: Number,
            default: 4
        },
        unidad: {
            type: Number,
            default: 20,
        },
        filasMostradas: {
            type: Number,
            default: -1,
        }
    },
    data() {
        return {}
    },
    methods: {
        setFilasMostradas(filas) {
            this.filasMostradas = filas;
        }
    },
    computed: {
        filasMostradasRealmente() {
            if (this.filasMostradas < 0) {
                return this.alto
            }
            return this.filasMostradas;
        },
        estiloLineaUnitaria() {
            return {
            }
        },
        estiloCuadroUnitario() {
            return {
            }
        },
        estiloCuadricula() {
            return {
                width: this.ancho * this.unidad + 'px',
                height: this.alto * this.unidad + 'px',
                gridTemplateRows: `repeat(${this.alto}, 1fr)`,
                gridTemplateColumns: `repeat(${this.ancho}, 1fr)`,
            }
        },
        estiloComponente() {
            return {
                width: this.ancho * this.unidad + 'px',
                height: this.alto * this.unidad + 'px',
            }
        }
    }
}
