export const componenteFlechaVector = {
    template: `
        <div class="componenteFlechaVector" :class="{esconderPunta, invertido}" :style="[offset]">
            <div class="puntoAplicacion" v-if="mostrarPuntoAplicacion"></div>
            <div class="simbolo" v-if="simbolo" v-show="mostrandoNotacion" :style="[offsetSimbolo]">
                <span>{{simbolo}}</span>
                <span class="flechitaNotacionVector">&#8407;</span>
            </div>
        </div>
    `,

    props: {
        magnitud: {
            type: Number,
            default: 20,
        },
        factorMagnitud:{
            type: Number,
            default: 20,
        },
        direccion: {
            type: Number,
            default: 0,
        },
        simbolo: {
            type: String,
        },
        esconderPunta: {
            type: Boolean,
            default: false,
        },
        invertido: {
            type: Boolean,
            default: false,
        },
        mostrandoNotacion: {
            type: Boolean,
            default: false,
        },
        mostrarPuntoAplicacion:{
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
        }
    },
    computed: {
        offset() {
            return {
                width: this.magnitud * this.factorMagnitud + 'px',
                transform: `rotate(-${this.direccion}deg)`,
            }

        },
        offsetSimbolo() {
            return {
                transform: `rotate(${this.direccion}deg)`,
                left: 'calc(100% + 10px)',
                top: '10px'
            }
        }
    }
}

function degToRad(deg) {
    return (Math.PI / 180) * deg;
}
