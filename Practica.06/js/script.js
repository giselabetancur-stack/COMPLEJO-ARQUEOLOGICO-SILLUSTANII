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
    // 2. BUSCADOR DE VIDEOS
    // =====================================================

    const formularioBusqueda =
        document.querySelector(".buscador");

    const campoBusqueda =
        document.querySelector("#buscar");

    const tarjetas =
        document.querySelectorAll(".tarjeta-video");

    if (formularioBusqueda && campoBusqueda) {

        formularioBusqueda.addEventListener("submit", (evento) => {

            evento.preventDefault();

            const busqueda = campoBusqueda.value
                .trim()
                .toLowerCase();

            let resultados = 0;

            tarjetas.forEach(tarjeta => {

                const contenido =
                    tarjeta.textContent.toLowerCase();

                const coincide =
                    contenido.includes(busqueda);

                tarjeta.style.display =
                    coincide || busqueda === "" ? "" : "none";

                if (coincide || busqueda === "") {
                    resultados++;
                }

            });

            if (busqueda !== "" && resultados === 0) {

                alert(
                    "No se encontraron videos relacionados con tu búsqueda."
                );

            }

        });

    }


    // =====================================================
    // 3. FORMULARIO DE CONTACTO
    // =====================================================

    const formularioContacto =
        document.querySelector("#formulario-contacto");

    const resultadoFormulario =
        document.querySelector("#resultado-formulario");

    if (formularioContacto && resultadoFormulario) {

        formularioContacto.addEventListener("submit", (evento) => {

            evento.preventDefault();

            if (!formularioContacto.checkValidity()) {

                formularioContacto.reportValidity();

                return;

            }

            resultadoFormulario.textContent =
                "¡Gracias por escribirnos! Tu formulario se completó correctamente.";

            resultadoFormulario.style.color = "#d92d87";

            formularioContacto.reset();

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
    // 5. DATOS DE SILLUSTANI
    // ==========================================

    const datosSillustani = [
        {
            titulo: "Ubicación",
            descripcion: "El complejo arqueológico de Sillustani se encuentra cerca de la ciudad de Puno.",
            categoria: "Patrimonio"
        },
        {
            titulo: "Chullpas",
            descripcion: "Son construcciones funerarias de piedra que destacan por su arquitectura.",
            categoria: "Arquitectura"
        },
        {
            titulo: "Lago Umayo",
            descripcion: "Sillustani se encuentra junto al hermoso lago Umayo.",
            categoria: "Naturaleza"
        },
        {
            titulo: "Cultura Kolla",
            descripcion: "El sitio arqueológico está relacionado con la cultura Kolla.",
            categoria: "Historia"
        }
    ];

    // Seleccionar el contenedor del HTML
    const contenedorDatos = document.querySelector("#contenedor-datos");

    // Función para calcular la cantidad de datos
    function calcularTotal(datos) {
        return datos.reduce((total) => total + 1, 0);
    }

    // Recorrer el arreglo y crear las tarjetas
    if (contenedorDatos) {

        for (const dato of datosSillustani) {

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

        // Mostrar resumen
        const resumen = document.createElement("p");
        resumen.textContent = "Total de datos registrados: " + calcularTotal(datosSillustani);

        contenedorDatos.append(resumen);
    }

});