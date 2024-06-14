const bloqueComponent = {
    props: {
        tipo: String,
        textocabecera: String,
        textoBoton: {
            type: String,
            default: "Mostrar"
        }
    },
    data() {
        return {
            desplegado: false,
        }
    },
    computed: {
        ejemplo() {
            return this.tipo === 'ejemplo'
        },
        herramientaInteractiva() {
            return this.tipo === 'herramientaInteractiva'
        },
        spoiler() {
            return this.tipo === 'spoiler'
        },
        cuento() {
            return this.tipo === 'cuento'
        },
        evaluacion() {
            return this.tipo === 'evaluacion'
        },
        iconoSrc() {
            if (this.ejemplo) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoEjemplo.svg"
            }
            else if (this.herramientaInteractiva) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoHerramientaInteractiva.svg"
            }
            else if (this.cuento) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoCuento.svg"
            }
            else if (this.spoiler) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoSpoiler.svg"
            }
            else if (this.evaluacion) {
                return "http://127.0.0.1:8080/recursos/iconos/iconoEvaluacion.svg"
            }
            return "http://127.0.0.1:8080/recursos/iconos/puzzlePiece.svg"
        },
        textoCerrarBoton() {
            if (this.textoBoton === 'Iniciar' || this.textoBoton === 'Intentar') {
                return "Cerrar"
            }
            return "Ocultar"

        },
        slotFilled() {
            return this.$slots.default;
        }
    },
    watch: {
        desplegado(desplegado) {
            if (desplegado) {
                this.$emit('desplegado');
            }
            else {
                this.$emit('plegado');
            }
        }
    },
    template: `<div class="componente-bloque" :class="{ejemplo, herramientaInteractiva, spoiler, cuento}">
                    <div class="zonaCabecera" :class="{ejemplo, herramientaInteractiva, spoiler, cuento}">
                        <img class="iconoBloque" :src="iconoSrc" />
                            <div v-if="spoiler" id="textoSpoiler">
                                ¡Spoiler alert!
                            </div>
                            <div class="textoCabecera">
                                {{textocabecera}} 
                                <slot name="cabecera"> 
                                </slot>
                            </div> 
                    </div> 
                    <div class="boton" v-if="slotFilled" v-on:click="desplegado=!desplegado">
                        {{desplegado?textoCerrarBoton:textoBoton}} 
                    </div> 
                    <div id="desplegable" v-show="desplegado"> 
                        <slot></slot> 
                    </div> 
                </div>`,
}

