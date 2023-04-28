const minNumeroDefault = -250;
const operacionesDefault = ["suma", "resta", "multiplicacion", "division", "potenciacion", "radicacion"];

const maxNumeroDefault = 250;

const minGradoRadicacionDefault = 2;
const maxGradoRadicacionDefault = 6;

const minGradoPotenciacionDefault = 2;
const maxGradoPotenciacionDefault = 6;

const minDenominadorEnteroDefault = 2;
const maxDenominadorEnteroDefault = 30;

const minBasePotenciaDefault = 2;
const maxBasePotenciaDefault = 15;

const minExponentePotenciaDefault = 2;
const maxExponentePotenciaDefault = 6;

function getBaseLog(base, res) {
    return Math.log(res) / Math.log(base);
}

function getDivisoresEnteros(num) {

    let lista = [];
    for (var i = Math.floor(num / 2); i > 0; i--) {
        if (num % i === 0) {
            lista.push(i);
        }
    }

    if (num % 1 === 0) {
        lista = [num, ...lista];
    }

    return lista;
}

function getSimboloOperacion(operacion) {
    if (!operacionesDefault.includes(operacion)) {
        throw "Operación no conocida";
    }

    if (operacion === 'suma') {
        return '+';
    }
    if (operacion === 'resta') {
        return '-';
    }
    if (operacion === 'multiplicacion') {
        return ' \\times ';
    }
    if (operacion === 'division') {
        return ' \\over ';
    }
    if (operacion === 'potenciacion') {
        return '^';
    }
    if (operacion === 'radicacion') {
        return 'sqrt';
    }
}

function generarNumero(opciones) {
    let maxNumero = maxNumeroDefault;
    let minNumero = minNumeroDefault;
    if (opciones?.maxNumero) {
        maxNumero = opciones.maxNumero;
    }
    if (opciones?.minNumero) {
        minNumero = opciones.minNumero;
    }

    let rangoNumero = maxNumero - minNumero;
    return Math.round(Math.random() * rangoNumero) + minNumero;
}

function operarNumeros(expresion) {
    const { operacion, numero1, numero2 } = expresion;

    if (!operacionesDefault.includes(operacion)) {
        throw "Operación faltante";
    }

    if (!numero1 || !numero2) {
        throw "Falta un número para ejecutar la operación";
    }

    if (operacion === 'suma') {
        return numero1 + numero2;
    }

    if (operacion === 'resta') {
        return numero1 - numero2;
    }

    if (operacion === 'multiplicacion') {
        return numero1 * numero2;
    }

    if (operacion === 'division') {
        return numero1 / numero2;
    }

    if (operacion === 'potenciacion') {
        return Math.pow(numero1, numero2);
    }

    if (operacion === 'radicacion') {
        return Math.pow(numero1, 1 / numero2);
    }
}

function setNumeroFaltante(expresion, opciones) {
    let { operacion, valor, numero1, numero2 } = expresion;
    if (!operacion) {
        throw "Falta la operación"
    }

    if (!numero1 && !numero2) {
        throw "Faltan ambos números"
    }

    if (numero1 && numero2) {
        throw "Ambos números ya están decididos";
    }

    if (expresion.operacion === 'suma') {
        if (!expresion.numero1) {
            expresion.numero1 = expresion.valor - expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2 = expresion.valor - expresion.numero1;
        }
    }

    if (expresion.operacion === 'multiplicacion') {
        if (!expresion.numero1) {
            expresion.numero1 = expresion.valor / expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2 = expresion.valor / expresion.numero1;
        }
    }

    if (expresion.operacion === 'division') {
        if (!expresion.numero1) {
            expresion.numero1 = expresion.valor * expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2 = expresion.numero1 / expresion.valor;
        }
    }

    if (expresion.operacion === 'resta') {
        if (!expresion.numero1) {
            expresion.numero1 = expresion.valor + expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2 = expresion.numero1 - expresion.valor;
        }
    }

    if (expresion.operacion === 'potenciacion') {
        if (!expresion.numero1) {
            expresion.numero1 = Math.pow(expresion.valor, 1 / expresion.numero2);
        }
        if (!expresion.numero2) {
            expresion.numero2 = getBaseLog(expresion.numero1, expresion.valor);

            let num2Rounded = Math.round(expresion.numero2);
            if (Math.abs(expresion.numero2 - num2Rounded) < 0.00001) {
                expresion.numero2 = num2Rounded;
            }
            // throw "Aún no desarrollado"
        }
    }

    if (expresion.operacion === 'radicacion') {
        if (!expresion.numero1) {
            expresion.numero1 = Math.pow(expresion.valor, expresion.numero2);
        }
        if (!expresion.numero2) {
            let potencia = getBaseLog(expresion.numero1, expresion.valor);
            expresion.numero2 = 1 / potencia;
            // throw "Aún no desarrollado"

            let num2Rounded = Math.round(expresion.numero2);
            if (Math.abs(expresion.numero2 - num2Rounded) < 0.00001) {
                expresion.numero2 = num2Rounded;
            }
        }
    }

    return expresion;
}

function generarExpresionNumerica(expresion, opciones) {
    let { valor, operacion, numero1, numero2 } = expresion;
    console.log("Generando expresión numérica para el valor " + expresion.valor);
//    opciones={
//        keepInteger: "Que el valor de la expresión sea entero",
//        operaciones: "array de operaciones permitidas para el caso en que no se haya específicado una.",
//        maxBasePotencia: "",
//        minBasePotencia:"",
//        minExponentePotencia: "",
//        maxExponentePotencia: "",
//        minGradoRadicacion: "",
//        maxGradoRadicacion: "",
//        maxDenominadorEntero: "",
//        minDenominadorEntero: "",
//    }

    let operaciones = operacionesDefault;
    if (opciones.operaciones) {
        operaciones = opciones.operaciones.filter(op => operacionesDefault.includes(op));
    }

    if (operacion && !operaciones.includes(operacion)) {
        throw `La operación ${operacion} no es conocida`;
    }
    if (!operacion) {
        let indexOperacion = Math.floor(Math.random() * operaciones.length);
        operacion = operaciones[indexOperacion];
        expresion.operacion = operacion;
    }

    //Ya hay operación.

    if (!expresion.valor) {//NO se ha fijado valor de la expresión.
        if (!expresion.numero1 && !expresion.numero2) {
            let num1 = generarNumero(opciones);
            let num2 = generarNumero(opciones);

            if (expresion.operacion === 'potenciacion') {
                let maxBasePotencia = opciones.maxBasePotencia || maxBasePotenciaDefault;
                let minBasePotencia = opciones.minBasePotencia || minBasePotenciaDefault;

                let rangoBasePotencia = maxBasePotencia - minBasePotencia;
                num1 = Math.round(Math.random() * rangoBasePotencia) + minBasePotencia;

                let maxExponentePotencia = opciones.maxExponentePotencia || maxExponentePotenciaDefault;
                let minExponentePotencia = opciones.minExponentePotencia || minExponentePotenciaDefault;
                let rangoExponente = maxExponentePotencia - minExponentePotencia;
                num2 = Math.round(Math.random() * rangoExponente) + minExponentePotencia;
            }

            if (expresion.operacion === 'radicacion') {
                let maxBasePotencia = opciones.maxBasePotencia || maxBasePotenciaDefault;
                let minBasePotencia = opciones.minBasePotencia || minBasePotenciaDefault;

                let rangoBasePotencia = maxBasePotencia - minBasePotencia;
                let valorExpresion = Math.round(Math.random() * rangoBasePotencia) + minBasePotencia;

                let maxGradoRadicacion = opciones.maxGradoRadicacion || maxGradoRadicacionDefault;
                let minGradoRadicacion = opciones.minGradoRadicacion || minGradoRadicacionDefault;

                let rangoGrado = maxGradoRadicacion - minGradoRadicacion;
                num2 = Math.round(Math.random() * rangoGrado) + minGradoRadicacion;

                num1 = Math.pow(valorExpresion, num2);
            }
            if (expresion.operacion === 'division') {
                while (num2 === 0) {
                    num2 = generarNumero(opciones);
                }
            }

            expresion.numero1 = num1;
            expresion.numero2 = num2;

            expresion.valor = operarNumeros(expresion);
        }

        if (!expresion.numero1) {
            expresion.numero1 = generarNumero();
            expresion.valor = operarNumeros(expresion);
        }
        else if (!expresion.numero2) {
            expresion.numero2 = generarNumero();
            expresion.valor = operarNumeros(expresion);
        }
    }

    //Generando expresión para un valor dado
    if (expresion.valor) {
        if (!expresion.numero1 && !expresion.numero2) { //Generando ámbos números base

            //Empezando por el número 1.
            expresion.numero1 = generarNumero();
            if (expresion.operacion === 'potenciacion' && opciones.keepInteger) {
                throw "Error para potenciacion. No es posible generar expresión: No se puede prever que un valor dado tendrá raiz entera de grado n"
            }
            if (expresion.operacion === 'radicacion') {
                let maxGradoRadicacion = opciones.maxGradoRadicacion || maxGradoRadicacionDefault;
                let minGradoRadicacion = opciones.minGradoRadicacion || minGradoRadicacionDefault;

                let rangoExponente = maxGradoRadicacion - minGradoRadicacion;
                let exponente = Math.floor(Math.random() * rangoExponente) + minGradoRadicacion;

                expresion.numero1 = Math.pow(expresion.valor, exponente);
            }
            if (expresion.operacion === 'division' && opciones.keepInteger) {
                let maxDenominadorEntero = opciones.maxDenominadorEntero || maxDenominadorEnteroDefault;
                let minDenominadorEntero = opciones.minDenominadorEntero || minDenominadorEnteroDefault;

                let rangoDenominadorEntero = maxDenominadorEntero - minDenominadorEntero;
                let denominador = Math.round(Math.random() * rangoDenominadorEntero) + minDenominadorEntero;
                expresion.numero1 = valor * denominador;
            }
            if (expresion.operacion === 'multiplicacion' && opciones.keepInteger) {
                let divisores = getDivisoresEnteros(expresion.valor);
                let cantDivisores = divisores.length;
                let indexDivisor = Math.floor(Math.random() * cantDivisores);

                expresion.numero1 = divisores[indexDivisor];
            }
        }

        if (!expresion.numero1 || !expresion.numero2) {

            expresion = setNumeroFaltante(expresion);
        }
    }

    return expresion
}

function reexpresionarExpresion(expresion, reexpresiones, opciones, opcionesGenerarExpresion) {
    //Esta función recorre una expresión numérica buscando un número escrito de manera explícita para convertirlo en expresión numérica. Repite esa acción 
    //{{reexpresiones}} veces.

    if (!reexpresiones || (typeof reexpresiones) != "number") {
        throw "No se especificó el número de reexpresiones";
    }
    console.log(`Reexpresionando ${reexpresiones} veces la expresión`);
    console.table(expresion);

    for (var i = 0; i < reexpresiones; i++) {
        //Encontrar el lugar donde se hará reexpresión.

        let guarda = 0;
        let lugarActual = expresion;
        while (guarda < 100) {
            guarda++;

            let direccion = Math.ceil(Math.random() * 2);
            console.log("Entrando en dirección " + direccion);
            numeroActual = direccion === 1 ? lugarActual.numero1 : lugarActual.numero2;


            if (typeof numeroActual === "number") {
                console.log("Se reexpresionará el " + numeroActual);
                if (direccion === 1) {
                    lugarActual.numero1 = generarExpresionNumerica({ valor: numeroActual }, opcionesGenerarExpresion);
                }
                else {
                    lugarActual.numero2 = generarExpresionNumerica({ valor: numeroActual }, opcionesGenerarExpresion);
                }

                break;
            }

            lugarActual = direccion === 1 ? lugarActual.numero1 : lugarActual.numero2
        }
    }


    return expresion;
}

function toMathJax(expresion, opciones) {
    let res = "";
    let operacionesAditivas = ["suma", "resta"];
    let operacionesExplicitas = ["division"]

    if (!expresion || !expresion.operacion || !expresion.valor || !expresion.numero1 || !expresion.numero2) {
        throw "Expresión incompleta";
    }

    let lado1 = expresion.numero1;
    let textoLado1 = "";
    if (typeof lado1 != "number") {
        textoLado1 = toMathJax(lado1);
    }
    else {
        textoLado1 = String(lado1);
    }

    let lado2 = expresion.numero2;
    let textoLado2 = "";
    if (typeof lado2 != "number") {
        textoLado2 = toMathJax(lado2);
    }
    else {
        textoLado2 = String(lado2);
    }

    textoLado1 = "{" + textoLado1 + "}";

    let esNumNegativo = typeof lado1 === 'number' && lado1 < 0;
    let esAditiva=lado1.operacion && operacionesAditivas.includes(lado1.operacion);
    let esAditivaParentesable=(esAditiva && !operacionesAditivas.includes(expresion.operacion));
    let parentesable = esAditivaParentesable || esNumNegativo;
    let enOperacionExplicita = operacionesExplicitas.includes(expresion.operacion) || expresion.operacion === 'radicacion'; //Para el número 1 la radicación es una operación que explicita la expresión
    let lado1NecesitaParentesis = parentesable && !enOperacionExplicita;

    let enCasoEspecial = expresion.operacion === 'potencia' && lado1.operacion === 'division';

    if (enCasoEspecial) {
        lado1NecesitaParentesis = true;
    }

    if (lado1NecesitaParentesis) {
        console.log("Parentesing la expresion");
        console.table(lado1);
        textoLado1 = "{(" + textoLado1 + ")}";
    }


    textoLado2 = "{" + textoLado2 + "}";

    esNumNegativo = typeof lado2 === 'number' && lado2 < 0;
    esAditiva=lado2.operacion && operacionesAditivas.includes(lado2.operacion);
    esAditivaParentesable=(esAditiva && expresion.operacion!='suma');
    parentesable = esAditivaParentesable || esNumNegativo;
    enOperacionExplicita = operacionesExplicitas.includes(expresion.operacion);
    lado2NecesitaParentesis = parentesable && !enOperacionExplicita;

    enCasoEspecial = typeof lado2 != 'number' && (expresion.operacion === 'potenciacion' || expresion.operacion === 'radicacion');
    if (enCasoEspecial) {
        lado2NecesitaParentesis = true;
    }

    if (lado2NecesitaParentesis) {
        console.log("Parentesing la expresion");
        console.table(lado2);
        textoLado2 = "{(" + textoLado2 + ")}";
    }


    if (expresion.operacion != 'radicacion') {

        res = textoLado1 + getSimboloOperacion(expresion.operacion) + textoLado2;
    }

    if (expresion.operacion === 'radicacion') {

        res = `\\sqrt[${textoLado2}]{${textoLado1}}`;
    }


    return res;

}

const mixinExpresionesNumericas = {
    methods: {
        expresionNumericaGenerarExpresionNumerica(expresion, opciones={keepInteger:true}) {
            return generarExpresionNumerica(expresion, opciones || {})
        },
        expresionNumericaGenerarNumero(opciones) {
            return generarNumero(opciones);
        },
        expresionNumericaToMathJax(expresion, opciones) {
            return toMathJax(expresion, opciones || {});
        },
        expresionNumericaSetNumeroFaltante(expresion) {
            return setNumeroFaltante(expresion);
        },
        expresionNumericaOperarNumeros(expresion) {
            return operarNumeros(expresion);
        },
        expresionNumericaGenerarNumero(opciones) {
            return generarNumero(opciones);
        },
        expresionNumericaGetSimboloOperacion(operacion) {
            return getSimboloOperacion(operacion);
        },
        expresionNumericaReexpresionarExpresion(expresion={}, reexpresiones={}, opciones={}, opcionesGenerarExpresion={keepInteger:true}) {
            return reexpresionarExpresion(expresion, reexpresiones, opciones, opcionesGenerarExpresion);
        }
    }
}
