const recuadroComponent = {

    props: {
        tipo: String,
        modo: String,
    },
    computed: {
        datoPrevio() {
            return this.tipo === 'datoPrevio'
        },
        datoNuevo() {
            return this.tipo === 'datoNuevo'
        },
        descubrimiento() {
            return this.tipo === 'descubrimiento'
        },
        instruccion() {
            return this.tipo === 'instruccion'
        },
        instruccionPointer() {
            return this.tipo === 'instruccionPointer'
        },
        instruccionTeclado() {
            return this.tipo === 'instruccionTeclado'
        },
        reto() {
            return this.tipo === 'reto'
        },
        infoResultado() {
            return this.tipo === 'infoResultado'
        },
        correcto() {
            return this.modo === 'correcto';
        },
        incorrecto() {
            return this.modo === 'incorrecto';
        },
        srcIcono() {
            if (this.modo === 'incorrecto') {
                return "http://127.0.0.1:8080/recursos/iconos/circleEquis.svg";
            }


            if (this.descubrimiento) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoDescubrimiento.png";
            }
            else if (this.instruccionPointer) {
                return "http://127.0.0.1:8080/recursos/iconos/handPointer.svg";
            }
            else if (this.instruccionTeclado) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoInstruccionTeclado.svg";
            }
            else if (this.infoResultado) {
                if (this.modo === 'correcto') {
                    return "http://127.0.0.1:8080/recursos/iconos/circleCheck.svg";
                }
                return "http://127.0.0.1:8080/recursos/iconos/circleEquis.svg";
            }
            return "http://127.0.0.1:8080/recursos/iconos/bombillo.png";

        }
    },
    template: `<div class="componente-recuadro" :class="{datoPrevio, datoNuevo, descubrimiento, instruccion, instruccionPointer, infoResultado, instruccionTeclado, reto, correcto, incorrecto}">
                    <img class="iconoRecuadro" :src="srcIcono" />
                    <div class="textoRecuadro">
                        <slot>{{modo}}</slot>
                    </div>
                </div>`,
}
