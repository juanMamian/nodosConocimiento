import "https://juanmamian.github.io/recursos/librerias/vue.global.js"
const ref = Vue.ref;

const radToDeg = function(rad) {
    return Math.round((rad * 180) / Math.PI);
}

export function useDibujarRegla() {
    const regla = ref(null);
    const reglaGrabbed = ref(false);
    const reglaGrabbedRotacion = ref(false);
    const reglaGrabPos = ref({
        x: 0,
        y: 0
    })

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
        if (reglaGrabbed.value || reglaGrabbedRotacion.value) {
            return;
        }
        sizeRegla.value = 0;
        direccionRegla.value = 0;
        const offsetZona = zonaRegla.value.getBoundingClientRect();

        puntoInicioRegla.value.x = evento.clientX - offsetZona.left;
        puntoInicioRegla.value.y = evento.clientY - offsetZona.top;
        drawingRegla.value = true;
        mostrandoRegla.value = true;
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
        sizeRegla.value = Math.round(Math.sqrt(Math.pow(vectorRegla.x, 2) + Math.pow(vectorRegla.y, 2)) / 20);
        direccionRegla.value = Math.atan2(vectorRegla.y, vectorRegla.x);
    }
    function cancelDrawingRegla() {
        drawingRegla.value = false;
    }
    function ocultarRegla() {
        mostrandoRegla.value = false;
    }
    function iniciarGrabRegla(evento) {
        if (!regla.value?.$el) {
            console.log("No regla");
            return;
        }
        const offsetZona=zonaRegla.value.getBoundingClientRect();
        reglaGrabbed.value = true;
        reglaGrabPos.value.x = evento.clientX - offsetZona.x - puntoInicioRegla.value.x;
        reglaGrabPos.value.y = evento.clientY - offsetZona.y - puntoInicioRegla.value.y;
    }
    function moverRegla(evento) {
        if (!regla.value) {
            return;
        }
        if (!reglaGrabbed.value && !reglaGrabbedRotacion.value) {
            return;
        }
        let offsetZona = zonaRegla.value.getBoundingClientRect();
        if (reglaGrabbed.value) {
            let posX = evento.clientX;
            let posY = evento.clientY;
            puntoInicioRegla.value.x = (posX - reglaGrabPos.value.x) - offsetZona.left;
            puntoInicioRegla.value.y = (posY - reglaGrabPos.value.y) - offsetZona.top;
        }
        if (reglaGrabbedRotacion.value) {
            drawRegla(evento);
        }
    }

    function ungrabRegla() {
        reglaGrabbed.value = false;
        reglaGrabbedRotacion.value = false;
    }

    function iniciarGrabRotacionRegla() {
        reglaGrabbedRotacion.value = true;
        drawingRegla.value=true;
    }

    return {
        regla,
        zonaRegla,
        mostrandoRegla,
        puntoInicioRegla,
        sizeRegla,
        direccionRegla,
        iniciarDrawRegla,
        drawRegla,
        cancelDrawingRegla,
        ocultarRegla,
        iniciarGrabRegla,
        moverRegla,
        ungrabRegla,
        iniciarGrabRotacionRegla,
    }

}
