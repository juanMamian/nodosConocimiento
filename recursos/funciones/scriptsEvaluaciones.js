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

function evaluarRespuestaUsuario(respuestaUsuario) {
    console.log(`Comparando ${respuestaUsuario} con ${respuesta}`);
    if (respuestaUsuario === respuesta) {
        anunciarRespuestaCorrecta();
    }
    else {
        anunciarRespuestaIncorrecta();
    }

}
