const bloqueComponent={    
    props:{
        tipo:String,
        textocabecera:String,
        textoboton:{
            type: String,
            default: "Mostrar"
        }
    },
    data(){
        return{
            desplegado: false,
        }
    },
    computed:{
        ejemplo(){
            return this.tipo==='ejemplo'
        },
        herramientaInteractiva(){
            return this.tipo==='herramientaInteractiva'
        },
        spoiler(){
            return this.tipo==='spoiler'
        },
        cuento(){
            return this.tipo==='cuento'
        },
        evaluacion(){
            return this.tipo==='evaluacion'
        },
        iconoSrc(){
            if(this.ejemplo){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/iconoEjemplo.svg"
            }
            else if(this.herramientaInteractiva){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/iconoHerramientaInteractiva.svg"
            }
            else if(this.cuento){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/iconoCuento.svg"
            }
            else if(this.spoiler){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/iconoSpoiler.svg"
            }
            else if(this.evaluacion){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/iconoEvaluacion.svg"
            }
            return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/puzzlePiece.svg"
        },
        textoCerrarBoton(){
            if(this.textoboton==='Iniciar' || this.textoboton==='Intentar'){
                return "Cerrar"
            }
            return "Ocultar"

        },
        slotFilled(){           
            return this.$slots.default;
        }
    },
    watch:{
        desplegado(desplegado){
            if(desplegado){
                this.$emit('desplegado');
            }
            else{
                this.$emit('plegado');
            }
        }
    },
    template:'<div class="bloque-component" :class="{ejemplo, herramientaInteractiva, spoiler, cuento}"><div id="zonaCabecera" :class="{ejemplo, herramientaInteractiva, spoiler, cuento}"><img class="iconoBloque" :src="iconoSrc" /><div v-if="spoiler" id="textoSpoiler">¡Spoiler alert!</div><div class="textoCabecera">{{textocabecera}}</div><slot name="cabecera"></slot></div><div class="boton" v-if="slotFilled" v-on:click="desplegado=!desplegado">{{desplegado?textoCerrarBoton:textoboton}}</div><div id="desplegable" v-show="desplegado"><slot></slot></div></div>',    
}
