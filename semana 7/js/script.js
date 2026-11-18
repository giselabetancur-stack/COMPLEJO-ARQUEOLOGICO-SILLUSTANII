document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // 1. MENÚ PARA CELULARES
    // =====================================================

    const botonMenu = document.querySelector("#boton-menu");
    const navegacion = document.querySelector("#navegacion");

    if (botonMenu && navegacion) {

        botonMenu.addEventListener("click", () => {

            navegacion.classList.toggle("abierta");

            const estaAbierto =
                navegacion.classList.contains("abierta");

            botonMenu.setAttribute("aria-expanded", estaAbierto);

            botonMenu.textContent = estaAbierto ? "✕" : "☰";

        });

        // Cerrar el menú al seleccionar una sección
        navegacion.querySelectorAll("a").forEach(enlace => {

            enlace.addEventListener("click", () => {

                navegacion.classList.remove("abierta");

                botonMenu.setAttribute("aria-expanded", "false");

                botonMenu.textContent = "☰";

            });

        });

    }


    // =====================================================
    // 2. BUSCADOR DE VIDEOS (input + submit)
    // =====================================================

    const formularioBusqueda = document.querySelector(".buscador");
    const campoBusqueda = document.querySelector("#buscar");
    const tarjetas = document.querySelectorAll(".tarjeta-video");

    // Muestra solo las tarjetas que coinciden con lo escrito
    function filtrarVideos() {
        const busqueda = campoBusqueda.value.trim().toLowerCase();
        let resultados = 0;

        tarjetas.forEach(tarjeta => {
            const coincide = tarjeta.textContent.toLowerCase().includes(busqueda);
            tarjeta.style.display = coincide ? "" : "none";
            if (coincide) resultados++;
        });

        return resultados;
    }

    if (formularioBusqueda && campoBusqueda) {

        // INPUT: filtra en cada letra que escribes
        campoBusqueda.addEventListener("input", filtrarVideos);

        // SUBMIT: al presionar Enter o la lupa, va a la galería
        formularioBusqueda.addEventListener("submit", (evento) => {
            evento.preventDefault();
            if (filtrarVideos() === 0) {
                alert("No se encontraron videos relacionados con tu búsqueda.");
            }
            document.querySelector("#galeria").scrollIntoView();
        });
    }


    // =====================================================
    // 3. FORMULARIO DE CONTACTO (submit + input)
    // =====================================================

    const formularioContacto = document.querySelector("#formulario-contacto");
    const resultadoFormulario = document.querySelector("#resultado-formulario");

    // Muestra (o borra) el mensaje de error de un campo
    function mostrarError(campo, mensaje) {
        const error = document.querySelector("#error-" + campo.id);
        error.textContent = mensaje;
        campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
        return mensaje === "";   // true = el campo está bien
    }

    // Revisa un campo y elige el mensaje en español
    function validarCampo(campo) {
        if (campo.type === "checkbox") {
            return mostrarError(campo, campo.checked ? "" : "Debes aceptar la política de privacidad.");
        }
        if (campo.validity.valueMissing) {
            if (campo.tagName === "SELECT") {
                return mostrarError(campo, "Elige un tipo de consulta.");
            }
            return mostrarError(campo, "Este campo es obligatorio.");
        }
        if (campo.validity.typeMismatch) {
            return mostrarError(campo, "El correo debe tener la forma nombre@dominio.com");
        }
        if (campo.validity.tooShort) {
            return mostrarError(campo, `Escribe al menos ${campo.minLength} caracteres.`);
        }
        return mostrarError(campo, "");
    }

    if (formularioContacto && resultadoFormulario) {

        const campos = formularioContacto.querySelectorAll("input, select, textarea");

        // SUBMIT: valida todo antes de enviar
        formularioContacto.addEventListener("submit", (evento) => {
            evento.preventDefault();

            let todoBien = true;
            campos.forEach(campo => {
                if (!validarCampo(campo)) todoBien = false;
            });

            if (!todoBien) {
                resultadoFormulario.textContent = "";
                return;
            }

            resultadoFormulario.textContent =
                "¡Gracias por escribirnos! Tu formulario se completó correctamente.";
            resultadoFormulario.style.color = "#d92d87";
            formularioContacto.reset();
        });

                // CHANGE: al elegir una opción, se valida el tipo de consulta
        const tipoConsulta = document.querySelector("#tipo-consulta");
        tipoConsulta.addEventListener("change", () => {
            validarCampo(tipoConsulta);
            console.log("Tipo de consulta elegido:", tipoConsulta.value);
        });

        
        // INPUT: si el campo tenía error, se revisa mientras escribes
        campos.forEach(campo => {
            campo.addEventListener("input", () => {
                if (campo.getAttribute("aria-invalid") === "true") {
                    validarCampo(campo);
                }
            });
        });
    }

    // =====================================================
    // 4. CARRUSEL DE IMÁGENES DE SILLUSTANI
    // =====================================================

    const imagenSillustani =
        document.querySelector("#imagen-sillustani");

    const puntos =
        document.querySelectorAll(".indicadores .punto");

    if (imagenSillustani && puntos.length === 4) {

        // Imágenes que aparecerán en la portada
        const imagenes = [
            "img/sillustani.jpg",
            "img/collas.jpg",
            "img/chullpas-incas.jpg",
            "img/lagarto.jpg"
        ];

        let imagenActual = 0;

        let temporizador = null;

        let tiempoCambio = null;


        // CAMBIAR IMAGEN
        function cambiarImagen(indice) {

            // Comprobar que el índice sea válido
            if (indice < 0 || indice >= imagenes.length) {
                return;
            }

            imagenActual = indice;

            // Ocultar suavemente la imagen actual
            imagenSillustani.style.opacity = "0";

            // Cambiar la imagen después de la transición
            clearTimeout(tiempoCambio);

            tiempoCambio = setTimeout(() => {

                imagenSillustani.src = imagenes[imagenActual];

                imagenSillustani.style.opacity = "1";

            }, 250);


            // Actualizar el indicador seleccionado
            puntos.forEach((punto, i) => {

                punto.classList.toggle(
                    "seleccionado",
                    i === imagenActual
                );

            });

        }


        // INICIAR CAMBIO AUTOMÁTICO
        function iniciarCarrusel() {

            clearInterval(temporizador);

            temporizador = setInterval(() => {

                const siguiente =
                    (imagenActual + 1) % imagenes.length;

                cambiarImagen(siguiente);

            }, 1800);

        }


        // CLIC EN LOS INDICADORES
        puntos.forEach(punto => {

            punto.addEventListener("click", () => {

                const indice =
                    Number(punto.dataset.indice);

                cambiarImagen(indice);

                // Reiniciar el tiempo automático
                iniciarCarrusel();

            });

        });


        // INICIAR EL CARRUSEL
        iniciarCarrusel();

    }

    // ==========================================
    // 5. DATOS DE SILLUSTANI (cargados desde JSON)
    // ==========================================

    const contenedorDatos = document.querySelector("#contenedor-datos");

    // Función para calcular la cantidad de datos
    function calcularTotal(datos) {
        return datos.reduce((total) => total + 1, 0);
    }

    // Crea las tarjetas con los datos recibidos
    function mostrarDatos(datos) {
        for (const dato of datos) {
            const tarjeta = document.createElement("article");
            const titulo = document.createElement("h3");
            const descripcion = document.createElement("p");
            const categoria = document.createElement("span");

            tarjeta.classList.add("tarjeta-dato");

            titulo.textContent = dato.titulo;
            descripcion.textContent = dato.descripcion;
            categoria.textContent = dato.categoria;

            tarjeta.append(titulo, descripcion, categoria);
            contenedorDatos.append(tarjeta);
        }

        const resumen = document.createElement("p");
        resumen.textContent = "Total de datos registrados: " + calcularTotal(datos);
        contenedorDatos.append(resumen);
    }

    // Pide el archivo JSON al servidor
    if (contenedorDatos) {
        fetch("data/datos.json")
            .then((respuesta) => {
                if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
                return respuesta.json();
            })
            .then((datos) => {
                mostrarDatos(datos);
                console.log("Datos cargados desde JSON:", datos.length);
            })
            .catch((error) => {
                contenedorDatos.textContent = "No se pudieron cargar los datos de Sillustani.";
                console.log("Error al cargar los datos:", error.message);
            });
    }
});