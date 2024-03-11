import "https://pe-pe-pe.herokuapp.com/public/resources/libraries/vue.global.js"
const { ref } = Vue;

export const useUtils = function() {
    function scrollToElemento(elemento) {
        const offsetElemento = elemento.getBoundingClientRect();
        if (offsetElemento.top > window.innerHeight) { //Hacer scroll
            elemento.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }
    return { scrollToElemento };

}
