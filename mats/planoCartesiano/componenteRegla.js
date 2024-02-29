const componenteRegla = {
    template: `
        <div class="componenteRegla" @mousedown.left.exact="iniciarGrab" @mouseup="ungrab" :class="{grabbed}" :style="[offset]">
            <div class="segmentoRegla" v-for="cuenta of longitud"></div>
            <div class="handlerRegla" @mousedown.stop="iniciarGrabRotacion"></div>
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
        }
    },
    data() {
        return {
            grabbed: false,
            grabPos: {
                x: 0, y: 0
            },
            direccion: 0,

            grabbedRotacion: false,
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
    methods: {
        iniciarGrab(evento) {
            let offsetEl = this.$el.getBoundingClientRect();
            this.grabbed = true;
            this.grabPos.x = evento.clientX - offsetEl.left;
            this.grabPos.y = evento.clientY - offsetEl.top;
            this.$emit("grabbed");
        },
        ungrab() {
            console.log("Ungrabbing");
            this.grabbed = false;
            this.grabbedRotacion = false;
        },

        iniciarGrabRotacion() {
            this.grabbedRotacion = true;
        },
        moverRotacion(evento, parentOffset) {
            let posX = evento.clientX - parentOffset.left - this.posicion.x;
            let posY = evento.clientY - parentOffset.top - this.posicion.y;
            let direccion = Math.atan2(posY, posX);
            this.direccion = radToDeg(direccion);
        }

    }
}

const radToDeg = function(rad) {
    return Math.round((rad * 180) / Math.PI);
}
