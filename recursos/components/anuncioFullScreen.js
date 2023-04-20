const anuncioFullScreen={
    props:{
        
    },
    data(){
        return {

        }
    },
    methods:{
        cerrar(){
            this.$emit('cerrarme');
        }
    },
    computed:{
        iconoSrc(){
            return "http://192.168.1.105:3000/public/atlasConocimiento/recursos/iconos/triangleExclamation.svg"
            
        }
    },
    template: "<div class='anuncio-full-screen-component'> <div class='zonaOscura' @click.self='cerrar'> <div class='anuncio'> <img :src='iconoSrc' class='iconoAnuncio' alt='Alerta'> <slot name='contenido'> </slot> <div class='boton' @click.stop='cerrar'> Aceptar </div> </div> </div> </div>"
}