export const degToRad = function(deg) {
    return deg * Math.PI / 180;
}
export const radToDeg = function(rad) {
    return rad * 180 / Math.PI;
}
export const truncar = function(num, decimales) {
    let versionTruncada = num.toFixed(decimales);
    let [parteEntera, parteDecimal] = versionTruncada.split('.');
    for (let i = parteDecimal.length - 1; i >= 0; i--) {
        if (versionTruncada[i] === '0') {
            versionTruncada = versionTruncada.slice(0, i);
        }
        else {
            break;
        }
    }
    let versionFinal = parteEntera;
    if (Number(parteDecimal) > 0) {
        versionFinal += '.' + parteDecimal;
    }

    return versionFinal;
}
