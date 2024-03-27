export const degToRad = function(deg) {
    return deg * Math.PI / 180;
}
export const radToDeg = function(rad) {
    return rad * 180 / Math.PI;
}
export const truncar = function(num, decimales) {
    let versionTruncada = num.toFixed(decimales);
    //console.log(`Truncando ${num} con ${decimales} decimales`);
    let [parteEntera, parteDecimal] = versionTruncada.split('.');
    //console.log(`Parte decimal: ${parteDecimal}`);
    for (let i = parteDecimal.length - 1; i >= 0; i--) {
        if (parteDecimal[i] === '0') {
            parteDecimal = parteDecimal.slice(0, i);
        }
        else {
            break;
        }
    }
    //console.log(`Queda en ${parteDecimal}`);
    let versionFinal = parteEntera;
    if (Number(parteDecimal) > 0) {
        versionFinal += '.' + parteDecimal;
    }

    return versionFinal;
}
