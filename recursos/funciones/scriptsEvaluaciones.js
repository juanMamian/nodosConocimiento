function anunciarRespuestaIncorrecta() {
    const anuncioIncorrecto = document.querySelector(".anuncioRespuestaIncorrecta");
    const anuncioCorrecto = document.querySelector(".anuncioRespuestaCorrecta");
    anuncioIncorrecto.style.display = "flex";
    anuncioCorrecto.style.display = "none";
}
function anunciarRespuestaCorrecta() {
    const anuncioCorrecto = document.querySelector(".anuncioRespuestaCorrecta");
    const anuncioIncorrecto = document.querySelector(".anuncioRespuestaIncorrecta");
    anuncioCorrecto.style.display = "flex";
    anuncioIncorrecto.style.display = "none";
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
