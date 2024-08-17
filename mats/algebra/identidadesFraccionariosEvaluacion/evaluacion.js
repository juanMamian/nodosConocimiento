import { useEvaluacionNodo } from "https://juanmamian.github.io/nodosConocimiento/recursos/composables/evaluacionNodo.js"
export const useEvaluacionIdentidadesFraccionarios = function() {
	const { versionReto, dificultad, reto, reiniciarReto, generarReto, respuesta, respuestaUsuarioCorrecta, versionRespuestaUsuario, inputRespuestaUsuario, evaluarRespuestaUsuario } = useEvaluacionNodo();
	function addToGenerarReto() {

	}

	return {
		dificultad, versionReto, reto, reiniciarReto, generarReto, respuesta, respuestaUsuarioCorrecta, versionRespuestaUsuario, inputRespuestaUsuario, evaluarRespuestaUsuario
	}
}
