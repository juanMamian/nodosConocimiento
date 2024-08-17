import "http://127.0.0.1:8080/recursos/librerias/vue.global.js"
const { ref, watch } = Vue;

export const useUpdateMovimientoLibreCargasElectricas = function(vertices = [[0, 0], [100, 0], [100, 100], [0, 100]], periodoUpdate = 300) {//vertices holds an array of vertices describing the boundaries of the container.
    let timeoutUpdate = null;
    const allowUpdate = ref(false);
    const cargas = ref([{
        x: 40,
        y: 40,
        fuerza: {
            x: 0,
            y: 0
        },
        velocidad: {
            x: 0,
            y: 0
        }
    },
    {
        x: 100,
        y: 90,
        fuerza: {
            x: 0,
            y: 0
        },
        velocidad: {
            x: 0,
            y: 0
        }
    }
    ]);
    function updatePosiciones() {
        if (!allowUpdate) {
            return;
        }
        for (let i = 0; i < cargas.value.length; i++) {
            cargas.value[i].fuerza.x = 0;
            cargas.value[i].fuerza.y = 0;
        }
        for (let i = 0; i < cargas.value.length; i++) {
            for (let j = i + 1; j < cargas.value.length; j++) {//Calcular la fuerza de repulsión mutua con otras cargas.
                let posCarga2 = {
                    x: cargas.value[j].x,
                    y: cargas.value[j].y,
                };
                if (posCarga2.x === cargas.value[i].x && posCarga2.y === cargas.value[i].y) {//Están en la misma posición, se desplazara en una unidad una de las dos para evitar cálculos con distancia cero.
                    let direccionDesplazamiento = Math.random() * Math.PI * 2;
                    posCarga2.x += Math.cos(direccionDesplazamiento);
                    posCarga2.y += Math.sin(direccionDesplazamiento);
                }
                let vectorDistancia = { //Vector originado en 2 hacia 1.
                    x: cargas.value[i].x - posCarga2.x,
                    y: cargas.value[i].y - posCarga2.y,
                }
                const moduloDistancia = Math.sqrt(Math.pow(vectorDistancia.x, 2) + Math.pow(vectorDistancia.y, 2));
                const direccionDistancia = Math.atan2(vectorDistancia.y, vectorDistancia.x);

                const factorConstante = 92000;
                let vectorFuerza = {// Fuerza de repulsión experimentada por 1. Su versión inversa es experimentada por cargas.value[j].
                    x: factorConstante * Math.cos(direccionDistancia) / Math.pow(moduloDistancia, 2),
                    y: factorConstante * Math.sin(direccionDistancia) / Math.pow(moduloDistancia, 2),
                }
                //Add fuerza a cargas.value[i]
                cargas.value[i].fuerza.x += vectorFuerza.x;
                cargas.value[i].fuerza.y += vectorFuerza.y;

                //Add fuerza a cargas.value[j]
                cargas.value[j].fuerza.x -= vectorFuerza.x;
                cargas.value[j].fuerza.y -= vectorFuerza.y;
            }

            //Ahora que está formada la fuerza, se debe afectar la velocidad.
            const masaImaginaria = 1;
            let aceleracion = {
                x: cargas.value[i].fuerza.x / masaImaginaria,
                y: cargas.value[i].fuerza.y / masaImaginaria,
            }
            cargas.value[i].velocidad.x += aceleracion.x * periodoUpdate / 1000;
            cargas.value[i].velocidad.y += aceleracion.y * periodoUpdate / 1000;
            //Cap velocidad
            const maxVelocidad = 15;
            const razonRespectoMax = Math.sqrt(Math.pow(cargas.value[i].velocidad.x, 2) + Math.pow(cargas.value[i].velocidad.y, 2)) / maxVelocidad;
            if (razonRespectoMax > 1) { //Ajustar para que el módulo de velocidad sea maxVelocidad.
                cargas.value[i].velocidad.x /= razonRespectoMax;
                cargas.value[i].velocidad.y /= razonRespectoMax;
            }

            let nuevaPos = {
                x: cargas.value[i].x + cargas.value[i].velocidad.x * periodoUpdate / 100,
                y: cargas.value[i].y + cargas.value[i].velocidad.y * periodoUpdate / 100,
            }

            if (!puntoInside(nuevaPos, vertices)) {
                if (i === 1) {
                    console.log(`${i} salió`);
                }

                //Bounce 
                for (let k = 0; k < vertices.length; k++) {
                    const punto1 = vertices[k];
                    const punto2 = k === vertices.length - 1 ? vertices[0] : vertices[k + 1];
                    if (lineIntersection([cargas.value[i].x, cargas.value[i].y], [nuevaPos.x, nuevaPos.y], punto1, punto2)) {
                        const vectorLadoSalida = [
                            punto2[0] - punto1[0],
                            punto2[1] - punto1[1]
                        ]
                        let vectorNormalSalida = [
                            vectorLadoSalida[1],
                            -vectorLadoSalida[0]
                        ];
                        const magnitudVectorNormal = Math.sqrt(vectorNormalSalida[0] ** 2 + vectorNormalSalida[1] ** 2);
                        vectorNormalSalida = [vectorNormalSalida[0] / magnitudVectorNormal, vectorNormalSalida[1] / magnitudVectorNormal];

                        const dotProduct = cargas.value[i].velocidad.x * vectorNormalSalida[0] + cargas.value[i].velocidad.y * vectorNormalSalida[1];
                        const nuevaVelocidad = {
                            x: cargas.value[i].velocidad.x - 2 * dotProduct * vectorNormalSalida[0],
                            y: cargas.value[i].velocidad.y - 2 * dotProduct * vectorNormalSalida[1],
                        };
                        cargas.value[i].velocidad = nuevaVelocidad;
                        nuevaPos = {
                            x: cargas.value[i].x + cargas.value[i].velocidad.x * periodoUpdate / 100,
                            y: cargas.value[i].y + cargas.value[i].velocidad.y * periodoUpdate / 100,
                        }

                    }

                }
            }

            cargas.value[i].x = nuevaPos.x;
            cargas.value[i].y = nuevaPos.y;

        }

        timeoutUpdate = setTimeout(updatePosiciones, periodoUpdate * 2);
    }
    function getEstilo(carga) {
        return {
            transform: `translate(calc(-50% + ${carga.x}px), calc(-50% + ${carga.y}px))`,
            transition: `transform ${periodoUpdate}ms linear`,
        }
    }
    watch(allowUpdate, (allow) => {
        console.log(`Allowing`);
        if (allow) {
            clearTimeout(timeoutUpdate);
            updatePosiciones();
        }
        else {
            clearTimeout(timeoutUpdate);
        }
    })
    console.log(`returning`);

    return {
        timeoutUpdate, updatePosiciones, allowUpdate, cargas, getEstilo
    }

}

function puntoInside(punto, verticesFigura) {
    const { x, y } = punto;
    if (x > 300) {
        console.log(`Fuera de 300`);
    }
    let dentro = false;

    for (let i = 0, j = verticesFigura.length - 1; i < verticesFigura.length; j = i++) {
        const [x1, y1] = verticesFigura[i];
        const [x2, y2] = verticesFigura[j];

        if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
            dentro = !dentro;
        }
    }

    return dentro;
}
function lineIntersection(p1, p2, p3, p4) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const [x3, y3] = p3;
    const [x4, y4] = p4;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // If the denominator is 0, the lines are parallel
    if (denominator === 0) {
        return false;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    // Check if the intersection point lies within both line segments
    return (t >= 0 && t <= 1) && (u >= 0 && u <= 1);
}
