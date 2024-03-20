import "https://pe-pe-pe.herokuapp.com/public/resources/libraries/vue.global.js"
const { ref } = Vue;

export const useEvaluacionNodo = function(addToGenerarReto, addToReiniciarReto) {
    const versionReto = ref(0);
    const reto = ref(null);
    function reiniciarReto() {
        reto.value = null;
        respuestaUsuarioCorrecta.value=null;
        if (addToReiniciarReto) {
            addToReiniciarReto();
        }
    }
    function generarReto() {
        reiniciarReto();
        if (addToGenerarReto) {
            addToGenerarReto();
        }

        versionReto.value++;
    }

    const respuesta = ref(null);
    const respuestaUsuarioCorrecta = ref(null);
    const versionRespuestaUsuario = ref(0);
    const inputRespuestaUsuario = ref(null);

    function evaluarRespuestaUsuario(numerica = false) {
        if (!inputRespuestaUsuario.value) {
            console.log(`No había input de respuesta usuario`);
            return;
        }
        let respuestaUsuario = inputRespuestaUsuario.value.value.trim();
        if (numerica) {
            respuestaUsuario = Number(respuestaUsuario);
        }
    }

    return {
        versionReto, reto, reiniciarReto, generarReto,
        respuesta, respuestaUsuarioCorrecta, versionRespuestaUsuario, inputRespuestaUsuario, evaluarRespuestaUsuario

    }
}
