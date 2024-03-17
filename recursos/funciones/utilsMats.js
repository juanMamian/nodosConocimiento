export const degToRad = function(deg) {
    return deg * Math.PI / 180;
}
export const radToDeg = function(rad) {
    return rad * 180 / Math.PI;
}
export const truncar = function(num, decimales) {
    let versionTruncada = num.toFixed(decimales);
    if (Number(versionTruncada.split(".")[1]) === 0) {
        return num
    }
    return versionTruncada;
}
