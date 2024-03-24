import "https://pe-pe-pe.herokuapp.com/public/resources/libraries/vue.global.js"
const { ref } = Vue;

export const useEvaluacionNodo = function(addToGenerarReto, addToReiniciarReto, recolectarRespuestaUsuario) {
    const dificultad=ref(1);
    const versionReto = ref(0);
    const reto = ref(null);
    function reiniciarReto() {
        reto.value = null;
        respuesta.value = null;
        respuestaUsuarioCorrecta.value = null;
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

    function evaluarRespuestaUsuario(respuestaUsuario, numerica = false) {
        if (respuestaUsuario == null) {
            if (recolectarRespuestaUsuario) {
                respuestaUsuario = recolectarRespuestaUsuario();
            }
            else {
                if (!inputRespuestaUsuario.value) {
                    console.log(`No había input de respuesta usuario`);
                    return;
                }
                if(!inputRespuestaUsuario.value.value){
                    console.log(`No había respuesta en el input`);
                    return;
                }

                respuestaUsuario = inputRespuestaUsuario.value.value.trim();
            }
        }
        if (respuestaUsuario == null) {
            console.log(`No hay respuesta usuario`);
            return;
        }
        if (numerica) {
            respuestaUsuario = Number(respuestaUsuario);
        }
        respuestaUsuarioCorrecta.value = false;
        if (respuestaUsuario === respuesta.value) {
            respuestaUsuarioCorrecta.value = true;
        }
        versionRespuestaUsuario.value++;

    }

    return {
        dificultad, versionReto, reto, reiniciarReto, generarReto,
        respuesta, respuestaUsuarioCorrecta, versionRespuestaUsuario, inputRespuestaUsuario, evaluarRespuestaUsuario

    }
}
