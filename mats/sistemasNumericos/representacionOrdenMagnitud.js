let representacionOrdenMagnitudComponente;
representacionOrdenMagnitudComponente = {
    template: `
        <div class="ordenMagnitudComponente" :class="{ultimo}">
           <div v-if="ultimo" style="overflow: hidden">
                <div id="contenedorSubordenes" class="contenedorSubpartes" v-if="factores.length>1">
                    <representacion-orden-magnitud-componente :factores="sigFactores" v-for="conjunto, index of (ultimo?factores[0]+1:10)" :ultimo="ultimo&&index===factores[0]" />
                </div>
                <div id="contenedorBolitas" class="contenedorSubpartes" v-if="factores.length===1">
                    <div class="bolitaNumero" v-for="bolita of (ultimo?factores[0]:10)">
                    </div>
                </div>
            </div>
           <div id="nombreOrden" v-if="!ultimo"> 
                {{nombreOrden}}
           </div>
        </div>
    `,
    name: "representacionOrdenMagnitudComponente",
    components: {
        representacionOrdenMagnitudComponente
    },
    props: {
        factores: {
            type: Array,
            required: true,
        },
        ultimo: {
            type: Boolean
        }
    },
    data() {
        return {
            ordenesBase: ["unidad", "decena", "centena"],
            ordenesSecundarios: ['', 'millon', 'billon', 'trillon', 'cuatrillon', 'quintillon', 'sextillon'],
        }
    },
    computed: {
        sigFactores() {
            return this.factores.slice(1);
        },
        orden() {
            return this.factores.length;
        },
        nombreOrden() {
            const ordenBase = this.ordenesBase[this.factores.length % 3];
            const mil = this.factores.length % 6 > 3;
            const ordenSecundario = Math.floor(this.factores.length / 6);
            return `${ordenBase} - ${mil ? 'mil' : ''} - ${this.ordenesSecundarios[ordenSecundario]}`;
        }
    },
    watch:{
        factores(){
            let ultimoFactor=this.factores[this.factores.length-1];
            if(this.ultimo && ultimoFactor===10){
                
            }

        }
    }
}

