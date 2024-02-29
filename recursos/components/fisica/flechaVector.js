const FlechaVector={
    template:`
        <div class="componenteFlechaVector">

        </div>
    `,

    props:{
        magnitud:{
            type: Number,
            default: 5,
        },
        direccion:{
            type: Number,
            default: 0,
        }
    },
    data(){
        return {
        }
    }
}
