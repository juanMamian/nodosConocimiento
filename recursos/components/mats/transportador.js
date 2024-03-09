export const componenteTransportador = {

    props: {
        labelsHoverables: {
            type: Boolean,
            default: false,
        },
        mostrandoDivisiones: {
            type: Boolean,
            default: true,
        },
        stepMarcas: {
            type: Number,
            default: 0,
        },
        rangosMarcados: {
            type: Array,
            default: [],
        },
        rangosDecimales:{
            type: Boolean,
            default: false,
        }
    },
    template: `
        <div class="componenteTransportador">
            <div class="circulo">
                <div class="centroTransportador"></div>
                <div class="contenedorLabelsRangos">
                    <div class="labelRango" v-for="dato of datosLabelsRangos" :style="dato.offset">{{dato.amplitud}}°</div>
                </div>
                <div class="contenedorDivisiones" v-show="mostrandoDivisiones">
                    <transition-group name="fadeIn">
                        <div class="divisionSexagesimal" v-for="num of 360" :class="{marcada: (stepMarcas>0 && num%stepMarcas===0) || rangosCorregidos.some(rango=>rango[0]<num-1 && rango[1]>=num-1), hovered: labelHovered===num}" :style="[{transform: 'rotate('+(1-num)+'deg)', animationDelay: num}]" @pointermove="labelsHoverables?setLabelHovered(num):''" :key="'subd'+num">
                            <div class="parteVisible"> </div>
                            <div class="labelDivision" :style="[{transform: 'rotate('+(num)+'deg)'}]"
                                v-show="labelHovered===num">
                                {{num}}
                            </div>
                        </div>
                    </transition-group>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            labelHovered: null,
            divisionesMarcadas: [],
        }
    },
    methods: {
        setLabelHovered(num) {
            this.labelHovered = num
        }
    },
    computed: {
        rangosCorregidos() {
            let rangos = [];
            for (let rango of this.rangosMarcados) {
                let inicio = rango[0] % 360;
                if (inicio < 0) {
                    inicio += 360;
                }
                let final = rango[1] % 360;
                if (final < 0) {
                    final += 360;
                }
                if (inicio > final) { //Hay que dar la vuelta a través del cero
                    rangos.push([inicio, 360]);
                    rangos.push([0, final]);
                }
                else {
                    rangos.push([inicio, final]);
                }
            }
            return rangos;
        },
        datosLabelsRangos() {
            let datos = [];
            for (let rango of this.rangosMarcados) {
                let inicio = rango[0] % 360;
                if (inicio < 0) {
                    inicio += 360;
                }
                let final = rango[1] % 360;
                if (final < 0) {
                    final += 360;
                }
                if (final < inicio) {
                    final += 360;
                }
                let anguloMedio = (final + inicio) / 2;
                let posX = 70 * Math.cos(anguloMedio * Math.PI / 180);
                let posY = 70 * Math.sin(anguloMedio * Math.PI / 180);
                let amplitud = final - inicio;
                if(!this.rangosDecimales){
                    amplitud=Math.round(amplitud);
                }
                let offset = {
                    left: 50 + posX + '%',
                    top: 50 - posY + '%'
                }
                datos.push({amplitud, offset});
            }
            return datos;
        }


    }

}
