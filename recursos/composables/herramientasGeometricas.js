import { ref } from "https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/nodosConocimiento/resources/libraries/vue.global.js"

export function useDibujarRegla() {
    const zonaRegla = ref(null);
    const mostrandoRegla = ref(false);
    const puntoInicioRegla = ref({
        x: 0,
        y: 0,
    });
    const sizeRegla = ref(0);
    const direccionRegla = ref(0);

    const drawingRegla = ref(false);
    function iniciarDrawRegla(evento) {
        if (!zonaRegla.value) {
            console.log(`No hay zona regla`);
            return;
        }
        const offsetZona = zonaRegla.value.getBoundingClientRect();

        puntoInicioRegla.value.x = evento.clientX - offsetZona.left;
        puntoInicioRegla.value.x = evento.clientY - offsetZona.top;
        drawingRegla.value = true;
    }
    function drawRegla(evento) {
        if (!drawingRegla.value) {
            return;
        }
        const offsetZona = zonaRegla.value.getBoundingClientRect();
        let posMouse = {
            x: evento.clientX - offsetZona.left,
            y: evento.clientY - offsetZona.top,
        };
        let vectorRegla = {
            x: posMouse.x - puntoInicioRegla.value.x,
            y: posMouse.y - puntoInicioRegla.value.y,
        }
        direccionRegla.value = Math.atan2(vectorRegla.y, vectorRegla.x);
    }
    function cancelDrawingRegla() {
        drawingRegla.value = false;
    }

    return {
        zonaRegla,
        mostrandoRegla,
        puntoInicioRegla,
        sizeRegla,
        direccionRegla,
        iniciarDrawRegla,
        drawRegla,
        cancelDrawingRegla,
    }

}
