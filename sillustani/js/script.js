"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // 0. UTILIDADES
    // =====================================================

    const $ = (selector, raiz = document) => raiz.querySelector(selector);
    const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

    // Evita insertar HTML no deseado al mostrar textos guardados
    const esc = (texto) =>
        String(texto ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    // Quita tildes y pasa a minúsculas para buscar sin importar acentos
    const normalizar = (texto) =>
        String(texto ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "");

    // Solo se aceptan rutas del proyecto o enlaces http(s)
    const urlSegura = (url) =>
        /^(https?:\/\/|img\/|video\/|\.\/)/i.test(String(url ?? "").trim())
            ? String(url).trim()
            : "";

    const almacen = {
        leer(clave) {
            try {
                const valor = localStorage.getItem(clave);
                return valor ? JSON.parse(valor) : null;
            } catch { return null; }
        },
        guardar(clave, valor) {
            try {
                localStorage.setItem(clave, JSON.stringify(valor));
                return true;
            } catch { return false; }
        },
        borrar(clave) {
            try { localStorage.removeItem(clave); } catch { /* sin acción */ }
        }
    };

    const reducirMovimiento =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    // =====================================================
    // 1. DATOS DEL CATÁLOGO Y DE LAS NOTICIAS
    //    (se pueden editar desde el panel de administración)
    // =====================================================

    const CATEGORIAS = ["Historia", "Cultura", "Paisajes", "Visita"];

    const RECURSOS_INICIALES = [
        {
            id: "r1", titulo: "¿Quiénes fueron los collas?",
            categoria: "Historia", tipo: "Video",
            imagen: "img/collas.jpg", video: "", duracion: "09:15",
            canal: "Historia del Altiplano",
            datos: "15 mil vistas · hace 1 semana",
            alt: "Ilustración de las chullpas al amanecer",
            descripcion: "Un recorrido introductorio por el Reino Colla (Qolla), que se asentó en la península de Umayo y levantó las chullpas de Sillustani."
        },
        {
            id: "r2", titulo: "Chullpas collas e incas: ¿en qué se diferencian?",
            categoria: "Historia", tipo: "Video",
            imagen: "img/chullpas-incas.jpg", video: "", duracion: "14:02",
            canal: "Historia del Altiplano",
            datos: "6,7 mil vistas · hace 2 semanas",
            alt: "Chullpas collas e incas de diferentes tamaños",
            descripcion: "Compara materiales, técnicas constructivas, formas y acabados de las chullpas, desde los bloques de piedra labrados hasta la mampostería irregular."
        },
        {
            id: "r3", titulo: "La chullpa del Lagarto y su figura tallada",
            categoria: "Historia", tipo: "Video",
            imagen: "img/lagarto.jpg", video: "", duracion: "07:48",
            canal: "Puno Arqueológico",
            datos: "4,1 mil vistas · hace 3 semanas",
            alt: "Representación de la chullpa del Lagarto",
            descripcion: "Explica la chullpa conocida como «del Lagarto» y la figura tallada que la distingue."
        },
        {
            id: "r4", titulo: "Ritos funerarios en el altiplano",
            categoria: "Cultura", tipo: "Video",
            imagen: "img/ritos.jpg", video: "", duracion: "11:30",
            canal: "Puno Arqueológico",
            datos: "3,5 mil vistas · hace 1 mes",
            alt: "Representación de chullpas al anochecer",
            descripcion: "Una aproximación a las prácticas funerarias asociadas a las torres de piedra de este complejo funerario."
        },
        {
            id: "r5", titulo: "Artesanía y textiles a la entrada del complejo",
            categoria: "Cultura", tipo: "Video",
            imagen: "img/artesania.jpg", video: "", duracion: "10:05",
            canal: "Hecho en Puno",
            datos: "5,9 mil vistas · hace 1 mes",
            alt: "Artesanía y textiles de la región Puno",
            descripcion: "Muestra de artesanías y textiles de la región Puno que se pueden encontrar a la entrada del complejo."
        },
        {
            id: "r6", titulo: "Atardecer en la laguna Umayo",
            categoria: "Paisajes", tipo: "Video",
            imagen: "img/atardecer.jpg", video: "", duracion: "04:20",
            canal: "Sillustani Videos",
            datos: "21 mil vistas · hace 2 semanas",
            alt: "Atardecer sobre la laguna Umayo",
            descripcion: "El atardecer sobre la laguna Umayo, junto a la cual se ubica el complejo arqueológico."
        },
        {
            id: "r7", titulo: "Panorámica del complejo arqueológico",
            categoria: "Paisajes", tipo: "Foto",
            imagen: "img/sillustani.jpg", video: "", duracion: "",
            canal: "Sillustani Videos",
            datos: "Fotografía ilustrativa",
            alt: "Complejo arqueológico de Sillustani",
            descripcion: "Vista general de las chullpas de Sillustani sobre la península de la laguna Umayo."
        },
        {
            id: "r8", titulo: "Cómo llegar a Sillustani desde Puno",
            categoria: "Visita", tipo: "Video",
            imagen: "img/como-llegar.jpg", video: "", duracion: "06:45",
            canal: "Rutas de Puno",
            datos: "9,3 mil vistas · hace 5 días",
            alt: "Camino hacia las chullpas de Sillustani",
            descripcion: "Referencias para llegar desde la ciudad de Puno (unos 31 km) hasta el complejo, en la zona de Atuncolla."
        },
        {
            id: "r9", titulo: "Consejos para tu visita: altura, clima y abrigo",
            categoria: "Visita", tipo: "Video",
            imagen: "img/consejos.jpg", video: "", duracion: "08:20",
            canal: "Rutas de Puno",
            datos: "2,8 mil vistas · hace 2 meses",
            alt: "Paisaje del Complejo Arqueológico de Sillustani",
            descripcion: "Recomendaciones generales sobre la altura, el clima y el abrigo para disfrutar tu visita."
        }
    ];

    const NOTICIAS_INICIALES = [
        {
            id: "n1", titulo: "Festival Cultural en Sillustani",
            texto: "Vive nuestra tradición con danzas típicas, música andina y expresiones culturales de nuestra región.",
            fecha: "15 de agosto de 2026",
            imagen: "img/artesania.jpg",
            enlace: "#contacto"
        },
        {
            id: "n2", titulo: "La belleza de la laguna Umayo",
            texto: "Descubre uno de los paisajes más representativos del Complejo Arqueológico de Sillustani.",
            fecha: "Información cultural",
            imagen: "img/atardecer.jpg",
            enlace: "#visita"
        }
    ];

    const IMAGENES_DISPONIBLES = [
        "img/artesania.jpg", "img/atardecer.jpg", "img/chullpas-incas.jpg",
        "img/collas.jpg", "img/como-llegar.jpg", "img/consejos.jpg",
        "img/lagarto.jpg", "img/ritos.jpg", "img/sillustani.jpg"
    ];

    const CLAVES = {
        recursos: "sv_recursos_v1",
        noticias: "sv_noticias_v1",
        sesion: "sv_sesion_admin"
    };

    const clonar = (objeto) => JSON.parse(JSON.stringify(objeto));

    const datos = {
        recursos: almacen.leer(CLAVES.recursos) ?? clonar(RECURSOS_INICIALES),
        noticias: almacen.leer(CLAVES.noticias) ?? clonar(NOTICIAS_INICIALES)
    };

    // Si una imagen no existe, se muestra la imagen principal
    document.addEventListener("error", (evento) => {
        const img = evento.target;
        if (img instanceof HTMLImageElement && !img.dataset.respaldo) {
            img.dataset.respaldo = "1";
            img.src = "img/sillustani.jpg";
        }
    }, true);


    // =====================================================
    // 2. MENÚ PARA CELULARES
    // =====================================================

    const botonMenu = $("#boton-menu");
    const navegacion = $("#navegacion");

    function cerrarMenu() {
        navegacion.classList.remove("abierta");
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
        botonMenu.textContent = "☰";
    }

    if (botonMenu && navegacion) {

        botonMenu.addEventListener("click", () => {
            const abierto = navegacion.classList.toggle("abierta");
            botonMenu.setAttribute("aria-expanded", String(abierto));
            botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
            botonMenu.textContent = abierto ? "✕" : "☰";
        });

        $$("a", navegacion).forEach((enlace) =>
            enlace.addEventListener("click", cerrarMenu)
        );

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && navegacion.classList.contains("abierta")) {
                cerrarMenu();
                botonMenu.focus();
            }
        });
    }


    // =====================================================
    // 3. ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE
    // =====================================================

    const enlacesMenu = $$(".navegacion .enlace");
    const seccionesMenu = ["historia", "galeria", "visita", "noticias", "contacto"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    let esperandoCuadro = false;

    function actualizarEnlaceActivo() {
        esperandoCuadro = false;

        let idActual = "inicio";
        seccionesMenu.forEach((seccion) => {
            if (seccion.getBoundingClientRect().top <= 170) {
                idActual = seccion.id;
            }
        });

        enlacesMenu.forEach((enlace) => {
            const activo = enlace.getAttribute("href") === `#${idActual}`;
            enlace.classList.toggle("activo", activo);
            if (activo) {
                enlace.setAttribute("aria-current", "true");
            } else {
                enlace.removeAttribute("aria-current");
            }
        });
    }

    window.addEventListener("scroll", () => {
        if (!esperandoCuadro) {
            esperandoCuadro = true;
            requestAnimationFrame(actualizarEnlaceActivo);
        }
    }, { passive: true });

    actualizarEnlaceActivo();


    // =====================================================
    // 4. CATÁLOGO: FILTROS, BÚSQUEDA Y TARJETAS  (RF-02)
    // =====================================================

    const catalogo = $("#catalogo");
    const contador = $("#contador-resultados");
    const sinResultados = $("#sin-resultados");
    const campoBusqueda = $("#buscar");
    const formularioBusqueda = $("#buscador");
    const selectTipo = $("#filtro-tipo");
    const botonesCategoria = $$(".categoria[data-categoria]");

    const filtro = { categoria: "todas", tipo: "todos", texto: "" };
    let idsVisibles = [];

    function recursosFiltrados() {
        const texto = normalizar(filtro.texto.trim());

        return datos.recursos.filter((r) => {
            const coincideCategoria =
                filtro.categoria === "todas" || r.categoria === filtro.categoria;

            const coincideTipo =
                filtro.tipo === "todos" || r.tipo === filtro.tipo;

            const coincideTexto =
                !texto ||
                normalizar(
                    [r.titulo, r.descripcion, r.canal, r.categoria, r.tipo].join(" ")
                ).includes(texto);

            return coincideCategoria && coincideTipo && coincideTexto;
        });
    }

    function tarjetaHTML(r) {
        const esVideo = r.tipo === "Video";

        return `
        <article class="tarjeta-video">
            <button type="button" class="miniatura" data-ver="${esc(r.id)}"
                aria-label="Abrir ${esVideo ? "video" : "fotografía"}: ${esc(r.titulo)}">
                <img src="${esc(urlSegura(r.imagen))}" alt="${esc(r.alt || r.titulo)}"
                    width="640" height="360" loading="lazy">
                <span class="insignia ${esVideo ? "insignia-video" : ""}">${esc(r.tipo)}</span>
                ${esVideo ? '<span class="reproducir" aria-hidden="true">▶</span>' : ""}
                ${r.duracion ? `<span class="duracion">${esc(r.duracion)}</span>` : ""}
            </button>
            <div class="informacion-video">
                <p class="etiqueta-categoria">${esc(r.categoria)}</p>
                <h3>${esc(r.titulo)}</h3>
                <p class="canal">${esc(r.canal)}</p>
                <p class="datos">${esc(r.datos)}</p>
            </div>
        </article>`;
    }

    function renderCatalogo() {
        const lista = recursosFiltrados();
        idsVisibles = lista.map((r) => r.id);

        catalogo.innerHTML = lista.map(tarjetaHTML).join("");
        sinResultados.hidden = lista.length > 0;

        const total = datos.recursos.length;
        contador.textContent =
            lista.length === total
                ? `Mostrando ${total} recursos`
                : `Mostrando ${lista.length} de ${total} recursos`;
    }

    function marcarCategoria(categoria) {
        filtro.categoria = categoria;
        botonesCategoria.forEach((boton) => {
            const activa = boton.dataset.categoria === categoria;
            boton.classList.toggle("activa", activa);
            boton.setAttribute("aria-pressed", String(activa));
        });
    }

    botonesCategoria.forEach((boton) =>
        boton.addEventListener("click", () => {
            marcarCategoria(boton.dataset.categoria);
            renderCatalogo();
        })
    );

    selectTipo.addEventListener("change", () => {
        filtro.tipo = selectTipo.value;
        renderCatalogo();
    });

    // Búsqueda en vivo
    campoBusqueda.addEventListener("input", () => {
        filtro.texto = campoBusqueda.value;
        renderCatalogo();
    });

    formularioBusqueda.addEventListener("submit", (evento) => {
        evento.preventDefault();
        filtro.texto = campoBusqueda.value;
        renderCatalogo();
        document.getElementById("galeria").scrollIntoView({
            behavior: reducirMovimiento ? "auto" : "smooth"
        });
    });

    $("#limpiar-filtros").addEventListener("click", () => {
        filtro.texto = "";
        filtro.tipo = "todos";
        campoBusqueda.value = "";
        selectTipo.value = "todos";
        marcarCategoria("todas");
        renderCatalogo();
    });


    // =====================================================
    // 5. NOTICIAS Y EVENTOS
    // =====================================================

    const ENLACES_PERMITIDOS = ["#historia", "#galeria", "#visita", "#contacto"];

    function renderNoticias() {
        $("#contenedor-noticias").innerHTML = datos.noticias.map((n) => `
        <article class="tarjeta-noticia">
            <img src="${esc(urlSegura(n.imagen))}" alt="${esc(n.titulo)}"
                width="640" height="360" loading="lazy">
            <div class="contenido-noticia">
                <h3>${esc(n.titulo)}</h3>
                <p>${esc(n.texto)}</p>
                <p class="fecha-noticia">▣ ${esc(n.fecha)}</p>
                <a href="${ENLACES_PERMITIDOS.includes(n.enlace) ? n.enlace : "#contacto"}"
                    class="boton-noticia">Leer más →</a>
            </div>
        </article>`).join("");
    }


    // =====================================================
    // 6. VISOR DE FOTOS Y VIDEOS  (RF-03)
    // =====================================================

    const visor = $("#visor");
    const visorMedia = $("#visor-media");
    let indiceVisor = 0;

    function embedYouTube(url) {
        const m = String(url).match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/
        );
        return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
    }

    function mediaHTML(r) {
        const video = urlSegura(r.video);
        const imagen = esc(urlSegura(r.imagen));

        if (r.tipo === "Video" && video) {
            const embed = embedYouTube(video);

            if (embed) {
                return `<iframe src="${esc(embed)}" title="${esc(r.titulo)}"
                    allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
            }

            return `<video controls preload="metadata" poster="${imagen}" src="${esc(video)}">
                Tu navegador no puede reproducir este video.
            </video>`;
        }

        const aviso = r.tipo === "Video"
            ? '<p class="visor-aviso">Vista previa del video. El archivo aún no está disponible.</p>'
            : "";

        return `<img src="${imagen}" alt="${esc(r.alt || r.titulo)}">${aviso}`;
    }

    function mostrarEnVisor(indice) {
        const id = idsVisibles[indice];
        const r = datos.recursos.find((item) => item.id === id);
        if (!r) return;

        indiceVisor = indice;

        visorMedia.innerHTML = mediaHTML(r);
        $("#visor-categoria").textContent = `${r.categoria} · ${r.tipo}`;
        $("#visor-titulo").textContent = r.titulo;
        $("#visor-meta").textContent =
            [r.canal, r.duracion, r.datos].filter(Boolean).join(" · ");
        $("#visor-descripcion").textContent = r.descripcion;
        $("#visor-posicion").textContent = `${indice + 1} de ${idsVisibles.length}`;

        $("#visor-anterior").disabled = indice === 0;
        $("#visor-siguiente").disabled = indice === idsVisibles.length - 1;
    }

    catalogo.addEventListener("click", (evento) => {
        const boton = evento.target.closest("[data-ver]");
        if (!boton) return;

        const indice = idsVisibles.indexOf(boton.dataset.ver);
        if (indice === -1) return;

        mostrarEnVisor(indice);
        visor.showModal();
    });

    $("#visor-anterior").addEventListener("click", () => mostrarEnVisor(indiceVisor - 1));
    $("#visor-siguiente").addEventListener("click", () => mostrarEnVisor(indiceVisor + 1));

    visor.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft" && indiceVisor > 0) {
            mostrarEnVisor(indiceVisor - 1);
        }
        if (evento.key === "ArrowRight" && indiceVisor < idsVisibles.length - 1) {
            mostrarEnVisor(indiceVisor + 1);
        }
    });

    // Al cerrar se limpia el contenido para detener videos
    visor.addEventListener("close", () => { visorMedia.innerHTML = ""; });


    // =====================================================
    // 7. CIERRE GENERAL DE VENTANAS (botón ✕ y clic afuera)
    // =====================================================

    $$("dialog").forEach((dialogo) => {

        dialogo.addEventListener("click", (evento) => {
            if (evento.target === dialogo || evento.target.closest("[data-cerrar]")) {
                dialogo.close();
            }
        });

    });


    // =====================================================
    // 8. ADMINISTRADOR: INICIO DE SESIÓN  (RF-05, RNF-02)
    //
    //    IMPORTANTE: esta validación se hace en el navegador y
    //    sirve para el prototipo. No es seguridad real: para
    //    producción, la autenticación debe hacerse en un
    //    servidor (con base de datos y HTTPS).
    // =====================================================

    const ADMIN = {
        usuario: "admin",
        sal: "sillustani-sis302",
        // SHA-256 de "sal:contraseña". La contraseña NO está escrita aquí.
        hash: "35fa3e5e75f0cfc8317e8e43c14b76b4a022451e20d4f2181fd110a440ac47ef"
    };

    const dialogoLogin = $("#dialogo-login");
    const formLogin = $("#form-login");
    const errorLogin = $("#login-error");
    const dialogoAdmin = $("#dialogo-admin");

    let intentosFallidos = 0;
    let bloqueadoHasta = 0;

    const sesionActiva = () => sessionStorage.getItem(CLAVES.sesion) === "1";

    async function sha256(texto) {
        const bytes = new TextEncoder().encode(texto);
        const resumen = await crypto.subtle.digest("SHA-256", bytes);
        return [...new Uint8Array(resumen)]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    $("#abrir-admin").addEventListener("click", () => {
        if (sesionActiva()) {
            abrirPanel();
        } else {
            formLogin.reset();
            errorLogin.textContent = "";
            dialogoLogin.showModal();
        }
    });

    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const espera = Math.ceil((bloqueadoHasta - Date.now()) / 1000);
        if (espera > 0) {
            errorLogin.textContent =
                `Demasiados intentos. Espera ${espera} s para volver a intentar.`;
            return;
        }

        if (!window.crypto?.subtle) {
            errorLogin.textContent =
                "Este navegador no permite validar la contraseña. Abre la página desde localhost o HTTPS.";
            return;
        }

        const usuario = $("#login-usuario").value.trim();
        const clave = $("#login-clave").value;
        const hash = await sha256(`${ADMIN.sal}:${clave}`);

        if (usuario === ADMIN.usuario && hash === ADMIN.hash) {
            intentosFallidos = 0;
            sessionStorage.setItem(CLAVES.sesion, "1");
            dialogoLogin.close();
            formLogin.reset();
            abrirPanel();
            return;
        }

        intentosFallidos++;
        formLogin.reset();

        if (intentosFallidos >= 5) {
            bloqueadoHasta = Date.now() + 30000;
            intentosFallidos = 0;
            errorLogin.textContent = "Acceso denegado. Espera 30 s antes de intentar de nuevo.";
        } else {
            errorLogin.textContent = "Usuario o contraseña incorrectos. Acceso denegado.";
        }
    });

    $("#cerrar-sesion").addEventListener("click", () => {
        sessionStorage.removeItem(CLAVES.sesion);
        dialogoAdmin.close();
    });


    // =====================================================
    // 9. ADMINISTRADOR: REGISTRAR, EDITAR Y ELIMINAR (RF-05)
    // =====================================================

    const COLECCIONES = {
        recursos: {
            titulo: "Videos y fotos del catálogo",
            clave: CLAVES.recursos,
            inicial: RECURSOS_INICIALES,
            prefijo: "r",
            nombre: "recurso",
            detalle: (r) => `${r.tipo} · ${r.categoria}`,
            campos: [
                { id: "titulo", etiqueta: "Título", tipo: "text", requerido: true, min: 3, max: 90 },
                { id: "categoria", etiqueta: "Categoría", tipo: "select", requerido: true,
                  opciones: CATEGORIAS.map((c) => [c, c]) },
                { id: "tipo", etiqueta: "Tipo", tipo: "select", requerido: true,
                  opciones: [["Video", "Video"], ["Foto", "Fotografía"]] },
                { id: "imagen", etiqueta: "Imagen o miniatura", tipo: "text", requerido: true,
                  lista: "lista-imagenes",
                  ayuda: "Formato recomendado: JPG, 640 × 360 px. Ejemplo: img/lagarto.jpg" },
                { id: "video", etiqueta: "Video (opcional)", tipo: "text",
                  ayuda: "Archivo .mp4 o .webm (ej. video/chullpas.mp4) o enlace de YouTube." },
                { id: "duracion", etiqueta: "Duración (solo videos)", tipo: "text",
                  patron: "\\d{1,2}:\\d{2}", ayuda: "Formato mm:ss, por ejemplo 09:15." },
                { id: "canal", etiqueta: "Canal o autor", tipo: "text", requerido: true, max: 60 },
                { id: "descripcion", etiqueta: "Descripción", tipo: "textarea", requerido: true, min: 10, max: 400 },
                { id: "alt", etiqueta: "Texto alternativo de la imagen (opcional)", tipo: "text", max: 120 },
                { id: "datos", etiqueta: "Datos (vistas, fecha) (opcional)", tipo: "text", max: 60 }
            ]
        },
        noticias: {
            titulo: "Noticias y eventos",
            clave: CLAVES.noticias,
            inicial: NOTICIAS_INICIALES,
            prefijo: "n",
            nombre: "noticia",
            detalle: (n) => n.fecha,
            campos: [
                { id: "titulo", etiqueta: "Título", tipo: "text", requerido: true, min: 3, max: 90 },
                { id: "texto", etiqueta: "Texto", tipo: "textarea", requerido: true, min: 10, max: 300 },
                { id: "fecha", etiqueta: "Fecha o etiqueta", tipo: "text", requerido: true, max: 40 },
                { id: "imagen", etiqueta: "Imagen", tipo: "text", requerido: true, lista: "lista-imagenes",
                  ayuda: "Ejemplo: img/atardecer.jpg" },
                { id: "enlace", etiqueta: "Botón «Leer más» lleva a", tipo: "select", requerido: true,
                  opciones: [["#historia", "Conoce Sillustani"], ["#galeria", "Galería"],
                             ["#visita", "Visita"], ["#contacto", "Contacto"]] }
            ]
        }
    };

    let coleccionActual = "recursos";

    const formAdmin = $("#form-admin");
    const listaAdmin = $("#lista-admin");
    const mensajeAdmin = $("#mensaje-admin");

    function avisoAdmin(texto, error = false) {
        mensajeAdmin.textContent = texto;
        mensajeAdmin.style.color = error ? "#b3261e" : "#2f7a50";
    }

    function campoHTML(campo, valor) {
        const id = `adm-${campo.id}`;
        const atributos = [
            `id="${id}"`, `name="${campo.id}"`,
            campo.requerido ? "required" : "",
            campo.min ? `minlength="${campo.min}"` : "",
            campo.max ? `maxlength="${campo.max}"` : "",
            campo.patron ? `pattern="${campo.patron}"` : "",
            campo.lista ? `list="${campo.lista}"` : "",
            campo.ayuda ? `aria-describedby="${id}-ayuda"` : ""
        ].filter(Boolean).join(" ");

        let control;

        if (campo.tipo === "select") {
            control = `<select ${atributos}>` + campo.opciones.map(([v, t]) =>
                `<option value="${esc(v)}" ${v === valor ? "selected" : ""}>${esc(t)}</option>`
            ).join("") + "</select>";
        } else if (campo.tipo === "textarea") {
            control = `<textarea ${atributos} rows="3">${esc(valor)}</textarea>`;
        } else {
            control = `<input type="text" ${atributos} value="${esc(valor)}">`;
        }

        return `
        <div class="campo">
            <label for="${id}">${esc(campo.etiqueta)}${campo.requerido ? " <span>*</span>" : ""}</label>
            ${control}
            ${campo.ayuda ? `<small class="ayuda-campo" id="${id}-ayuda">${esc(campo.ayuda)}</small>` : ""}
        </div>`;
    }

    function construirFormulario(item = null) {
        const col = COLECCIONES[coleccionActual];

        $("#admin-form-titulo").textContent =
            item ? `Editar ${col.nombre}` : `Registrar ${col.nombre} nuevo`;

        formAdmin.innerHTML =
            `<input type="hidden" name="id" value="${esc(item?.id ?? "")}">` +
            col.campos.map((c) => campoHTML(c, item?.[c.id] ?? (c.opciones ? c.opciones[0][0] : ""))).join("") +
            `<datalist id="lista-imagenes">${
                IMAGENES_DISPONIBLES.map((i) => `<option value="${i}">`).join("")
            }</datalist>
            <div class="acciones-form">
                <button type="submit" class="boton-enviar">${item ? "Guardar cambios" : "Registrar"}</button>
                ${item ? '<button type="button" class="boton-texto" id="cancelar-edicion">Cancelar edición</button>' : ""}
            </div>`;
    }

    function renderListaAdmin() {
        const col = COLECCIONES[coleccionActual];
        const items = datos[coleccionActual];

        $("#admin-lista-titulo").textContent = `${col.titulo} (${items.length})`;

        listaAdmin.innerHTML = items.length
            ? items.map((item) => `
            <li>
                <div class="admin-item-texto">
                    <strong>${esc(item.titulo)}</strong>
                    <small>${esc(col.detalle(item))}</small>
                </div>
                <div class="admin-item-acciones">
                    <button type="button" class="boton-texto" data-editar="${esc(item.id)}"
                        aria-label="Editar ${esc(item.titulo)}">Editar</button>
                    <button type="button" class="boton-texto peligro" data-eliminar="${esc(item.id)}"
                        aria-label="Eliminar ${esc(item.titulo)}">Eliminar</button>
                </div>
            </li>`).join("")
            : "<li class='admin-vacio'>No hay elementos registrados.</li>";
    }

    function refrescarSitio() {
        renderCatalogo();
        renderNoticias();
        renderListaAdmin();
    }

    function guardarColeccion() {
        const col = COLECCIONES[coleccionActual];
        if (!almacen.guardar(col.clave, datos[coleccionActual])) {
            avisoAdmin("No se pudo guardar en este navegador (almacenamiento lleno o bloqueado).", true);
            return false;
        }
        return true;
    }

    function abrirPanel() {
        if (!sesionActiva()) return;
        coleccionActual = coleccionActual in COLECCIONES ? coleccionActual : "recursos";
        mensajeAdmin.textContent = "";
        renderListaAdmin();
        construirFormulario();
        if (!dialogoAdmin.open) dialogoAdmin.showModal();
    }

    // Pestañas: recursos / noticias
    $$(".pestana").forEach((pestana) =>
        pestana.addEventListener("click", () => {
            coleccionActual = pestana.dataset.coleccion;
            $$(".pestana").forEach((p) => {
                const activa = p === pestana;
                p.classList.toggle("activa", activa);
                p.setAttribute("aria-pressed", String(activa));
            });
            mensajeAdmin.textContent = "";
            renderListaAdmin();
            construirFormulario();
        })
    );

    // Editar / eliminar desde la lista
    listaAdmin.addEventListener("click", (evento) => {
        if (!sesionActiva()) return;

        const botonEditar = evento.target.closest("[data-editar]");
        const botonEliminar = evento.target.closest("[data-eliminar]");

        if (botonEditar) {
            const item = datos[coleccionActual].find((i) => i.id === botonEditar.dataset.editar);
            if (item) {
                construirFormulario(item);
                mensajeAdmin.textContent = "";
                $("#adm-titulo").focus();
            }
        }

        if (botonEliminar) {
            const item = datos[coleccionActual].find((i) => i.id === botonEliminar.dataset.eliminar);
            if (!item) return;

            if (!confirm(`¿Eliminar «${item.titulo}»? Esta acción no se puede deshacer.`)) return;

            datos[coleccionActual] = datos[coleccionActual].filter((i) => i.id !== item.id);

            if (guardarColeccion()) {
                refrescarSitio();
                construirFormulario();
                avisoAdmin("Contenido eliminado correctamente.");
            }
        }
    });

    // Cancelar edición
    formAdmin.addEventListener("click", (evento) => {
        if (evento.target.id === "cancelar-edicion") {
            construirFormulario();
            mensajeAdmin.textContent = "";
        }
    });

    // Registrar o guardar cambios
    formAdmin.addEventListener("submit", (evento) => {
        evento.preventDefault();
        if (!sesionActiva()) return;

        if (!formAdmin.checkValidity()) {
            formAdmin.reportValidity();
            return;
        }

        const col = COLECCIONES[coleccionActual];
        const formData = new FormData(formAdmin);
        const nuevo = {};

        col.campos.forEach((c) => {
            nuevo[c.id] = String(formData.get(c.id) ?? "").trim();
        });

        // Validaciones adicionales
        if (!urlSegura(nuevo.imagen)) {
            avisoAdmin("La imagen debe ser una ruta como img/foto.jpg o un enlace http(s).", true);
            return;
        }

        if (nuevo.video) {
            const valido = urlSegura(nuevo.video) &&
                (embedYouTube(nuevo.video) || /\.(mp4|webm|ogg)(\?.*)?$/i.test(nuevo.video));
            if (!valido) {
                avisoAdmin("El video debe ser un archivo .mp4/.webm/.ogg o un enlace de YouTube.", true);
                return;
            }
        }

        const idExistente = String(formData.get("id") ?? "");
        const editando = Boolean(idExistente);

        if (!confirm(editando ? "¿Guardar los cambios?" : "¿Registrar este contenido?")) return;

        if (editando) {
            datos[coleccionActual] = datos[coleccionActual].map((i) =>
                i.id === idExistente ? { ...i, ...nuevo } : i
            );
        } else {
            datos[coleccionActual].push({ id: `${col.prefijo}${Date.now()}`, ...nuevo });
        }

        if (guardarColeccion()) {
            refrescarSitio();
            construirFormulario();
            avisoAdmin(editando ? "Cambios guardados." : "Contenido registrado correctamente.");
        }
    });

    // Restaurar contenido original
    $("#restaurar").addEventListener("click", () => {
        if (!sesionActiva()) return;

        const col = COLECCIONES[coleccionActual];
        if (!confirm(`¿Restaurar «${col.titulo}» al contenido original? Se perderán tus cambios.`)) return;

        almacen.borrar(col.clave);
        datos[coleccionActual] = clonar(col.inicial);
        refrescarSitio();
        construirFormulario();
        avisoAdmin("Contenido original restaurado.");
    });


    // =====================================================
    // 10. FORMULARIO DE CONTACTO
    // =====================================================

    const formularioContacto = $("#formulario-contacto");
    const resultadoFormulario = $("#resultado-formulario");

    if (formularioContacto && resultadoFormulario) {

        formularioContacto.addEventListener("submit", (evento) => {
            evento.preventDefault();

            if (!formularioContacto.checkValidity()) {
                formularioContacto.reportValidity();
                return;
            }

            resultadoFormulario.textContent =
                "¡Gracias por escribirnos! Tu formulario se completó correctamente.";
            resultadoFormulario.style.color = "#2f7a50";

            formularioContacto.reset();
        });

    }


    // =====================================================
    // 11. CARRUSEL DE IMÁGENES DE LA PORTADA
    // =====================================================

    const imagenPortada = $("#imagen-sillustani");
    const puntos = $$(".indicadores .punto");

    const IMAGENES_PORTADA = [
        { src: "img/sillustani.jpg", alt: "Complejo arqueológico de Sillustani" },
        { src: "img/collas.jpg", alt: "Ilustración de las chullpas al amanecer" },
        { src: "img/chullpas-incas.jpg", alt: "Chullpas collas e incas de diferentes tamaños" },
        { src: "img/lagarto.jpg", alt: "Representación de la chullpa del Lagarto" }
    ];

    if (imagenPortada && puntos.length === IMAGENES_PORTADA.length) {

        const portada = imagenPortada.closest(".portada");
        const INTERVALO = 5000;

        let actual = 0;
        let temporizador = null;
        let esperaCambio = null;

        // Precarga para que el cambio sea suave
        IMAGENES_PORTADA.forEach(({ src }) => { new Image().src = src; });

        function cambiarImagen(indice) {
            actual = indice;

            puntos.forEach((punto, i) => {
                const activo = i === actual;
                punto.classList.toggle("seleccionado", activo);
                if (activo) {
                    punto.setAttribute("aria-current", "true");
                } else {
                    punto.removeAttribute("aria-current");
                }
            });

            imagenPortada.style.opacity = "0";
            clearTimeout(esperaCambio);

            esperaCambio = setTimeout(() => {
                imagenPortada.dataset.respaldo = "";
                imagenPortada.src = IMAGENES_PORTADA[actual].src;
                imagenPortada.alt = IMAGENES_PORTADA[actual].alt;
                imagenPortada.style.opacity = "1";
            }, reducirMovimiento ? 0 : 250);
        }

        function detener() {
            clearInterval(temporizador);
            temporizador = null;
        }

        function iniciar() {
            detener();
            if (reducirMovimiento) return;

            temporizador = setInterval(() => {
                cambiarImagen((actual + 1) % IMAGENES_PORTADA.length);
            }, INTERVALO);
        }

        puntos.forEach((punto) =>
            punto.addEventListener("click", () => {
                cambiarImagen(Number(punto.dataset.indice));
                iniciar();
            })
        );

        // Se pausa al pasar el cursor o al usar el teclado dentro de la portada
        portada.addEventListener("mouseenter", detener);
        portada.addEventListener("mouseleave", iniciar);
        portada.addEventListener("focusin", detener);
        portada.addEventListener("focusout", iniciar);

        // Se pausa si la pestaña no está visible
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) { detener(); } else { iniciar(); }
        });

        iniciar();
    }


    // =====================================================
    // 12. PRIMERA CARGA
    // =====================================================

    renderCatalogo();
    renderNoticias();

});
