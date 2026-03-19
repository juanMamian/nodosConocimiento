const sendHeight = () => {
    window.parent.postMessage(
        { type: 'resize', height: document.body.scrollHeight },
        '*' // or specify parent origin for security
    );
};

if (document.readyState === 'complete') {
    sendHeight(); // already loaded, call immediately
} else {
    window.addEventListener('load', sendHeight);
}
window.addEventListener('resize', sendHeight);

function anunciarRespuestaIncorrecta() {
    document.querySelector("#declaracionRespuesta").anunciarRespuestaIncorrecta();
}
function anunciarRespuestaCorrecta() {
    document.querySelector("#declaracionRespuesta").anunciarRespuestaCorrecta();
}

let respuesta = null;

function evaluarRespuestaUsuario() {
	const respuestaUsuario = recolectarRespuestaUsuario();
	console.log(`Comparando ${respuestaUsuario} con ${respuesta}`);
    if (respuestaUsuario === respuesta) {
        anunciarRespuestaCorrecta();
    }
    else {
        anunciarRespuestaIncorrecta();
    }

}

function generarReto() {
    try {
        generadorReto()
    } catch (error) {
        console.log(`Error llamando el generador de reto: ${error}`);
    }
}
function reiniciarGeneral() {
    try {
        const declaracionRespuesta = document.querySelector("#declaracionRespuesta");
        if (declaracionRespuesta) {
            declaracionRespuesta.reiniciar();
        }
        reiniciarEspecifico();
    }
    catch (error) {
        console.log(`Error con reiniciar específico: ${error}`);
    }
}

document.addEventListener("triggerRefreshPregunta", () => {
    try {
        reiniciarGeneral();
        generarReto();
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})

reiniciarGeneral();
