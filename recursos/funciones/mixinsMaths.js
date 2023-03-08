const minNumeroDefault = -250;
const operaciones = ["suma", "resta", "multiplicacion", "division", "potenciacion", "radicacion"];

const maxNumeroDefault = 250;

const minGradoRadicacionDefault=2;
const maxGradoRadicacionDefault=6;

const minGradoPotenciacionDefault=2;
const maxGradoPotenciacionDefault=6;

const minDenominadorEnteroDefault=2;
const maxDenominadorEnteroDefault=30;

const minBasePotenciaDefault=2;
const maxBasePotenciaDefault=15;

const minExponentePotenciaDefault=2;
const maxExponentePotenciaDefault=6;

function getBaseLog(base, res){
    return Math.log(res) / Math.log(base);
}

function getDivisoresEnteros(num){
    
    let lista=[];
    for (var i=Math.floor(num/2);i>0;i--){
        if(num%i===0){
            lista.push(i);
        }
    }

    if(num%1===0){
        lista=[num, ...lista];
    }

    return lista;
}

function getSimboloOperacion(operacion) {
    if (!operaciones.includes(operacion)) {
        throw "Operación no conocida";
        return;
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

    if (!operaciones.includes(operacion)) {
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
    console.log("Setting número faltante en: ");
    console.table(expresion);
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
            expresion.numero1= expresion.valor - expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2= expresion.valor - expresion.numero1;
        }
    }

    if (expresion.operacion === 'multiplicacion') {
        if (!expresion.numero1) {
            expresion.numero1= expresion.valor / expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2= expresion.valor / expresion.numero1;
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
            expresion.numero2=getBaseLog(expresion.numero1, expresion.valor);
            
            let num2Rounded=Math.round(expresion.numero2);
            if(Math.abs(expresion.numero2 - num2Rounded)<0.00001){
                expresion.numero2=num2Rounded;
            }
            // throw "Aún no desarrollado"
        }
    }

    if (expresion.operacion === 'radicacion') {
        if (!expresion.numero1) {
            expresion.numero1 = Math.pow(expresion.valor, expresion.numero2);
        }
        if (!expresion.numero2) {
            let potencia=getBaseLog(expresion.numero1, expresion.valor);
            expresion.numero2=1/potencia;
            // throw "Aún no desarrollado"
            
            let num2Rounded=Math.round(expresion.numero2);
            if(Math.abs(expresion.numero2 - num2Rounded)<0.00001){
                expresion.numero2=num2Rounded;
            }
        }
    }

    return expresion;
}

function generarExpresionNumerica(expresion, opciones) {
    let { valor, operacion, numero1, numero2 } = expresion;
    console.log("Generando expresión numérica para el valor "+expresion.valor);
    
    if (operacion && !operaciones.includes(operacion)) {
        throw `La operación ${operacion} no es conocida`;
    }
    if (!operacion) {
        let indexOperacion = Math.floor(Math.random() * operaciones.length);
        operacion = operaciones[indexOperacion];
        expresion.operacion=operacion;
    }

    //Ya hay operación.

    if (!expresion.valor) {//NO se ha fijado valor de la expresión.
        if (!expresion.numero1 && !expresion.numero2) {
            let num1 = generarNumero(opciones);
            let num2 = generarNumero(opciones);

            if(expresion.operacion==='potenciacion'){
                let maxBasePotencia=opciones.maxBasePotencia || maxBasePotenciaDefault;
                let minBasePotencia=opciones.minBasePotencia || minBasePotenciaDefault;
                
                let rangoBasePotencia=maxBasePotencia - minBasePotencia;
                num1=Math.round(Math.random()*rangoBasePotencia)+minBasePotencia;

                let maxExponentePotencia=opciones.maxExponentePotencia || maxExponentePotenciaDefault;
                let minExponentePotencia=opciones.minExponentePotencia || minExponentePotenciaDefault;
                let rangoExponente=maxExponentePotencia-minExponentePotencia;
                num2=Math.round(Math.random()*rangoExponente)+minExponentePotencia;
            }

            if(expresion.operacion==='radicacion'){
                let maxBasePotencia=opciones.maxBasePotencia || maxBasePotenciaDefault;
                let minBasePotencia=opciones.minBasePotencia || minBasePotenciaDefault;

                let rangoBasePotencia=maxBasePotencia - minBasePotencia;
                let valorExpresion=Math.round(Math.random()*rangoBasePotencia)+minBasePotencia;

                let maxGradoRadicacion=opciones.maxGradoRadicacion || maxGradoRadicacionDefault;
                let minGradoRadicacion=opciones.minGradoRadicacion || minGradoRadicacionDefault;

                let rangoGrado=maxGradoRadicacion-minGradoRadicacion;
                num2=Math.round(Math.random()*rangoGrado)+minGradoRadicacion;

                num1=Math.pow(valorExpresion, num2);
            }
            if(expresion.operacion==='division'){
                while(num2===0){
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
            if(expresion.operacion==='potenciacion' && opciones.keepInteger){
                throw "Error para potenciacion. No es posible generar expresión: No se puede prever que un valor dado tendrá raiz entera de grado n"
            }
            if(expresion.operacion==='radicacion'){
                let maxExponentePotencia = opciones.maxExponentePotencia || maxExponentePotenciaDefault;
                let minExponentePotencia = opciones.minExponentePotencia || minExponentePotenciaDefault;

                let rangoExponente=maxExponentePotencia - minExponentePotencia;
                let exponente=Math.floor(Math.random()*rangoExponente) + minExponentePotencia;

                expresion.numero1=Math.pow(expresion.valor, exponente);
            }
            if(expresion.operacion==='division' && opciones.keepInteger){
                let maxDenominadorEntero=opciones.maxDenominadorEntero || maxDenominadorEnteroDefault;
                let minDenominadorEntero=opciones.minDenominadorEntero || minDenominadorEnteroDefault;

                let rangoDenominadorEntero=maxDenominadorEntero-minDenominadorEntero;
                let denominador=Math.round(Math.random()*rangoDenominadorEntero) + minDenominadorEntero;
                expresion.numero1=valor*denominador;
            }
            if(expresion.operacion==='multiplicacion' && opciones.keepInteger){
                console.log("Getting divisores enteros de "+expresion.valor);
                let divisores=getDivisoresEnteros(expresion.valor);
                console.log(`Son ${divisores}`);
                let cantDivisores=divisores.length;
                let indexDivisor=Math.floor(Math.random()*cantDivisores);
                console.log(`Se usará el ${indexDivisor}`);
                
                expresion.numero1=divisores[indexDivisor];
            }
        }        

        if(!expresion.numero1 || !expresion.numero2){
            
            expresion=setNumeroFaltante(expresion);
        }        
    }    
      
    console.log("Resultó: ");
    console.table({...expresion});
    return expresion
}

function toMathJax(expresion) {
    let res = "";
    console.log(`LLevando a string la expresión`)
    console.table(expresion);
    if (!expresion || !expresion.operacion || !expresion.valor || !expresion.numero1 || !expresion.numero2) {
        throw "Expresión incompleta";
    }
    if (expresion.operacion != 'radicacion') {
        res = expresion.numero1 + getSimboloOperacion(expresion.operacion) + expresion.numero2;
    }

    if(expresion.operacion==='radicacion'){
        res= `\\sqrt[${expresion.numero2}]{${expresion.numero1}}`;
        console.log(`Quedó: ${res}`);
    }


    return res;

}

const mixinExpresionesNumericas = {
    methods: {
        expresionNumericaGenerarExpresionNumerica(expresion, opciones) {
            return generarExpresionNumerica(expresion, opciones)
        },
        expresionNumericaGenerarNumero(opciones) {
            return generarNumero(opciones);
        },
        expresionNumericaToMathJax(expresion) {
            return toMathJax(expresion);
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
        }
    }
}
