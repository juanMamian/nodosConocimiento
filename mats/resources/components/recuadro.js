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
                return "http://127.0.0.1:8080/recursos/iconos/circle-exclamation-solid.svg";
            }
            else if(this.instruccionPointer){
                return "http://127.0.0.1:8080/recursos/iconos/handPointer.svg";
            }
            else if(this.instruccionTeclado){
                return "http://127.0.0.1:8080/recursos/iconos/iconoInstruccionTeclado.svg";
            }
            return "http://127.0.0.1:8080/recursos/iconos/bombillo.png";

        }
    },
    template:'<div class="recuadro" :class="{datoPrevio, datoNuevo, descubrimiento, instruccion, instruccionPointer, instruccionTeclado}"> <img class="iconoRecuadro" :src="srcIcono" /> <div class="textoRecuadro"> <slot></slot> </div> </div>',    
}
