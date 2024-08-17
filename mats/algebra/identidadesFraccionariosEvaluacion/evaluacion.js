import { useEvaluacionNodo } from "http://127.0.0.1:8080/recursos/composables/evaluacionNodo.js"
export const useEvaluacionIdentidadesFraccionarios = function() {
	const { versionReto, dificultad, reto, reiniciarReto, generarReto, respuesta, respuestaUsuarioCorrecta, versionRespuestaUsuario, inputRespuestaUsuario, evaluarRespuestaUsuario } = useEvaluacionNodo();
	function addToGenerarReto() {

	}

	return {
		dificultad, versionReto, reto, reiniciarReto, generarReto, respuesta, respuestaUsuarioCorrecta, versionRespuestaUsuario, inputRespuestaUsuario, evaluarRespuestaUsuario
	}
}
