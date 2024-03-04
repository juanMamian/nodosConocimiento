const componenteRegla = {
    template: `
        <div class="componenteRegla" :class="{grabbed}" :style="[offset]">
            <div class="segmentoRegla" v-for="cuenta of longitud"></div>
            <div class="handlerRegla" @click.stop="" @mousedown.left.stop="$emit('iniciarGrabRotacion')"></div>
        </div>
    `,
    props: {
        longitud: {
            type: Number,
            default: 5,
        },
        posicion: {
            type: Object,
            default: {
                x: 0,
                y: 0,
            }
        },
        direccionFromOutside: {
            type: Number,
            default: 0,
        },
        grabbed:{
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            grabPos: {
                x: 0, y: 0
            },
            direccion: 0,

        }
    },
    computed: {
        offset() {
            return {
                left: Math.round(this.posicion.x) + 'px',
                top: Math.round(this.posicion.y) + 'px',
                transform: `rotate(${this.direccion}deg)`
            }
        }
    },
    watch: {
        direccionFromOutside(dir) {
            this.direccion = radToDeg(dir);
        }
    }
}

const radToDeg = function(rad) {
    return Math.round((rad * 180) / Math.PI);
}
