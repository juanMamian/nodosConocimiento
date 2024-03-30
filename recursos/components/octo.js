export const componenteOcto = {
    template: `
        <div class="componenteOcto" :style="[estiloComponente]">
            <div class="fila">
                <div class="barrita horizontal" :style="[estiloBarrita1]">
                </div>
            </div>
            <div class="fila doble">
                <div class="barrita vertical" :style="[estiloBarrita2]">
                </div>
                <div class="barrita vertical" :style="[estiloBarrita3]">
                </div>
            </div>
            <div class="fila">
                <div class="barrita horizontal" :style="[estiloBarrita4]">
                </div>
            </div>
            <div class="fila doble">
                <div class="barrita vertical" :style="[estiloBarrita5]">
                </div>
                <div class="barrita vertical" :style="[estiloBarrita6]">
                </div>
            </div>
            <div class="fila">
                <div class="barrita horizontal" :style="[estiloBarrita7]">
                </div>
            </div>
        </div>
    `,
    props: {
        numero: {
            type: Number,
            default: null,
        },
    },
    computed: {
        estiloComponente() {
            return {
            }
        },
        estiloBarrita1() {
            let numerosRelevantes = [2, 3, 5, 6, 7, 8, 9, 0];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },
        estiloBarrita2() {
            let numerosRelevantes = [4, 5, 6, 8, 9, 0];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },
        estiloBarrita3() {
            let numerosRelevantes = [1, 2, 3, 4, 7, 8, 9, 0];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },
        estiloBarrita4() { //La de enmedio.
            let numerosRelevantes = [2, 3, 4, 5, 6, 8, 9];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },
        estiloBarrita5() {
            let numerosRelevantes = [2, 6, 8, 0];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },
        estiloBarrita6() {
            let numerosRelevantes = [1, 3, 4, 5, 6, 7, 8, 9, 0];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },
        estiloBarrita7() { //La barra horizontal de abajo
            let numerosRelevantes = [2, 3, 5, 6, 8, 0];
            return {
                backgroundColor: numerosRelevantes.includes(this.numero) ? 'black' : '#8080802b',
            }
        },

    }

}

