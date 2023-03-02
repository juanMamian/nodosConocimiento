const recuadroComponent={
    
    props:{
        tipo:String,        
    },
    computed:{
        datoPrevio(){
            return this.tipo==='datoPrevio'
        },
        datoNuevo(){
            return this.tipo==='datoNuevo'
        },
        descubrimiento(){
            return this.tipo==='descubrimiento'
        },
                instruccion(){
            return this.tipo==='instruccion'
        },
        instruccionPointer(){
            return this.tipo==='instruccionPointer'
        },
        instruccionTeclado(){
            return this.tipo==='instruccionTeclado'
        },
        srcIcono(){
            if(this.descubrimiento){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/circle-exclamation-solid.svg";
            }
            else if(this.instruccionPointer){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/handPointer.svg";
            }
            else if(this.instruccionTeclado){
                return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/iconoInstruccionTeclado.svg";
            }
            return "http://192.168.1.100:3000/public/atlasConocimiento/recursos/iconos/bombillo.png";

        }
    },
    template:'<div class="recuadro" :class="{datoPrevio, datoNuevo, descubrimiento, instruccion, instruccionPointer, instruccionTeclado}"> <img class="iconoRecuadro" :src="srcIcono" /> <div class="textoRecuadro"> <slot></slot> </div> </div>',    
}