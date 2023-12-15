//DECLARACION DE VARIABLES Y MANIPULACION DE DOM
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("convertidor");
  const grafico = document.getElementById("myChart");
  let graficoHistorico;
  //API
  const api = "https://mindicador.cl/api";
  //SOLICITUD DE DATOS DE MONEDA, SE AGREGA TRY CATCH EN CASO DE QUE LA API NO FUNCIONE
  const solicitarDatoMoneda = async (moneda) => {
    try {
      const respuesta = await fetch(`${api}/${moneda}`);
      const datos = await respuesta.json();
      return datos.serie;
    } catch (error) {
      console.error("Error al obtener datos de la moneda:", error);
      throw error;
    }
  };
  //DARLE FORMATO A LA FECHA DEL GRAFICO
  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const año = fechaObj.getFullYear().toString().slice(2);
    return `${dia}/${mes}/${año}`;
  };
  //OBTENER FECHAS PARA EL GRAFICO
  const obtenerFechasFormateadas = (datos) =>
    datos.map((item) => formatearFecha(item.fecha));

  const obtenerValores = (datos) => datos.map((item) => item.valor);
  //QUITAR GRAFICO PARA PODER ENDERIZAR UNO NUEVO
  const quitarGraficoAnterior = () => {
    if (graficoHistorico) {
      graficoHistorico.destroy();
    }
  };
  //RENDERIZAR GRAFICO
  const renderizarGrafico = (fechas, valores) => {
    quitarGraficoAnterior();
    const contexto = grafico.getContext("2d");
    //PARAMETROS DEL GRAFICO
    graficoHistorico = new Chart(contexto, {
      type: "line",
      data: {
        labels: fechas,
        datasets: [
          {
            label: "Tasa de Cambio",
            data: valores,
            borderColor: "white",
            borderWidth: 3,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "gray",
            },
          },
          y: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "gray",
            },
          },
        },
      },
    });
  };
  //MOSTRAR TOTAL DE LA MONEDA, EN UN FORMATO ENTENDIBLE PARA USUARIOS DEL PAIS
  const mostrarTotal = (total, moneda) => {
    const elementoTotalValor = document.getElementById("total-valor");
    const totalFormateado = total.toLocaleString("es-CL", {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: 2,
    });
    elementoTotalValor.innerText = totalFormateado;
  };
  //CALCULO REALIZADO EN LA CONVERSION
  const calcularTotalMoneda = (valor, datos, moneda) => {
    const tasaCambio = datos[datos.length - 1].valor;
    const total = valor / tasaCambio;
    mostrarTotal(total, obtenerCodigoMoneda(moneda));
    return total;
  };
  //FORMATO DE DIVISAS
  const obtenerCodigoMoneda = (moneda) => {
    const monedasCodigo = {
      dolar: "USD",
      euro: "EUR",
      uf: "CLF",
    };
    return monedasCodigo[moneda] || "USD";
  };
  //FUNCION PRINCIPAL QUE OBTIENE LOS DATOS, ACTUALIZA EL DOM Y RENDERIZA EL GRAFICO, ADEMAS MANEJA LA FALTA DE ALGUN DATO
  const convertirValorMoneda = async (valor, moneda) => {
    try {
      const datosTasaCambio = await solicitarDatoMoneda(moneda);
      if (datosTasaCambio.length === 0) {
        throw new Error("No se encontraron datos para la moneda seleccionada.");
      }

      const fechas = obtenerFechasFormateadas(datosTasaCambio);
      const valores = obtenerValores(datosTasaCambio);

      calcularTotalMoneda(valor, datosTasaCambio, moneda);
      renderizarGrafico(fechas, valores);
    } catch (error) {
      console.error(
        `Error al calcular el valor en la moneda (${moneda}):`,
        error.message
      );
    }
  };
  //COMPORTAMIENTO DEL FORMULARIO, SE AGREGAN EVENTOS EN CASO DE QUE LOS VALORES INGRESADOS NO SEAN CORRECTOS
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inputValor = document.getElementsByName("valor")[0];
    const selectMoneda = document.getElementsByName("moneda")[0];

    const valor = parseFloat(inputValor.value);
    const moneda = selectMoneda.value;

    if (!isNaN(valor) && moneda) {
      await convertirValorMoneda(valor, moneda);
    } else {
      alert("Por favor, complete todos los campos correctamente.");
    }
  });
});
