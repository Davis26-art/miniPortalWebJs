/* ==========================================================================
    Demo de modales y autenticación simple usando localStorage/sessionStorage.

   Qué hace este archivo:
   - Controla la apertura y cierre de ventanas modales (popups) en la página.
   - Implementa un formulario de registro y otro de login guardando usuarios
     en localStorage (simulando una base de datos pequeña en el navegador).
   - Gestiona la "sesión" del usuario guardando un objeto en sessionStorage.
   - Al iniciar sesión o registrarse correctamente redirige al `panelMascotas.html`.

   IMPORTANTE:
   - Esto es solo para DEMOSTRACIÓN y aprendizaje. NO se debe usar la 
     funcion nativa "btoa" ni guardar contraseñas en texto real en producción.
     En un proyecto real las contraseñas se manejan y almacenan en el servidor con hashing.
   - sessionStorage guarda datos **solo** para la pestaña actual. Si cierras la
     pestaña la "sesión" desaparece. .
   ========================================================================== */

/* ---------- Helpers de DOM (pequeñas funciones para evitar repetir código) ---------- */

/*
  qs(selector, contexto)
  - selector: string CSS (ej. '#mi-id' o '.mi-clase' o 'button')
  - contexto: elemento DOM donde buscar (por defecto document)
  Devuelve el primer elemento que coincide o null si no existe.
*/
function qs(selector, contexto = document) {
  return contexto.querySelector(selector);
}

/*
  qsa(selector, contexto)
  - Igual que qs pero devuelve **todos** los elementos que coinciden como
    un array (Array.from transforma la NodeList en un array real).
*/
function qsa(selector, contexto = document) {
  return Array.from(contexto.querySelectorAll(selector));
}

/* ---------- Manejo de modales (ventanas emergentes) ---------- */

/*
  Idea general:
  - Cada overlay/modal tiene el atributo data-modal.
  - Para mostrar/ocultar se usa aria-hidden="true" o "false".
  - Al abrir guardamos el foco previo (para restaurarlo al cerrar).
  - Al abrir ponemos foco en el primer control dentro del modal (accesibilidad).
  - Implementamos: clic fuera para cerrar, botón con [data-cerrar], ESC para cerrar,
    y un simple "focus trap" para que el tabulado no salga del modal mientras está abierto.
*/

// Seleccionamos todos los overlays/modales al cargar el archivo
const modales = qsa("[data-modal]");

// guardamos el elemento que tenía el foco antes de abrir un modal
let focoPrevio = null;

/*
  abrirModalPorId(idOverlay)
  - idOverlay: id del elemento overlay (ej. "overlay-auth")
  Abre el overlay, guarda foco anterior y pone focus en el primer control.
*/
function abrirModalPorId(idOverlay) {
  const overlay = document.getElementById(idOverlay);
  if (!overlay) return; // Si no existe el overlay, no hacemos nada

  // Guardamos el elemento que tenía el foco antes de abrir (si existe)
  focoPrevio = document.activeElement;

  // Cambiamos aria-hidden a "false" para que el CSS muestre el overlay
  overlay.setAttribute("aria-hidden", "false");

  // Buscamos el primer elemento interactivo dentro del modal para enfocar
  const primerInteractivo = overlay.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (primerInteractivo) primerInteractivo.focus();

  // Bloqueamos el scroll de la página principal mientras el modal está abierto
  document.body.style.overflow = "hidden";
}

/*
  cerrarModal(overlay)
  - overlay: el elemento overlay (no su id)
  Cierra el overlay, restaura foco y desbloquea scroll.
*/
function cerrarModal(overlay) {
  if (!overlay) return;
  overlay.setAttribute("aria-hidden", "true");

  // Restauramos el foco al elemento que tenía antes de abrir (si existe y puede enfocarse)
  if (focoPrevio && typeof focoPrevio.focus === "function") {
    focoPrevio.focus();
  }

  // Quitamos la restricción de scroll
  document.body.style.overflow = "";
}

/*
  inicializarModales()
  - Recorre todos los overlays y les añade listeners:
    * Click fuera para cerrar
    * Click en elementos con [data-cerrar] para cerrar
    * Esc para cerrar
    * Focus trap básico con Tab / Shift+Tab
*/
function inicializarModales() {
  modales.forEach((overlay) => {
    // Por defecto los ocultamos (aria-hidden="true")
    overlay.setAttribute("aria-hidden", "true");

    // Listener para manejar clicks dentro del overlay
    overlay.addEventListener("click", (e) => {
      // Si el click fue exactamente en el overlay (es decir, fuera del .modal), cerramos
      const esClickFuera = e.target === overlay;
      if (esClickFuera) cerrarModal(overlay);

      // Si el elemento clicado (o alguno de sus padres) tiene [data-cerrar], cerramos
      if (e.target && e.target.closest("[data-cerrar]")) {
        const boton = e.target.closest("[data-cerrar]");
        const modalPadre = boton && boton.closest("[data-modal]");
        if (modalPadre) cerrarModal(modalPadre);
      }
    });

    // Listener global para ESC (cerrar modal activo)
    // NOTA: ponemos el listener aquí pero chequeamos el overlay concreto
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        overlay.getAttribute("aria-hidden") === "false"
      ) {
        cerrarModal(overlay);
      }
    });

    // Focus trap simple: impedir que con TAB el foco salga del modal
    overlay.addEventListener("keydown", (e) => {
      // Solo nos interesa la tecla Tab y cuando el overlay está abierto
      if (e.key !== "Tab" || overlay.getAttribute("aria-hidden") === "true")
        return;

      // Conseguimos la lista de elementos enfocables dentro del overlay
      const focables = qsa(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        overlay
      ).filter((el) => !el.hasAttribute("disabled")); // excluimos deshabilitados

      if (focables.length === 0) {
        // Si no hay focables, cancelamos el tab
        e.preventDefault();
        return;
      }

      const primer = focables[0];
      const ultimo = focables[focables.length - 1];

      // Si estamos en el último y no se pulsa Shift, saltamos al primero
      if (!e.shiftKey && document.activeElement === ultimo) {
        primer.focus();
        e.preventDefault();
      }
      // Si estamos en el primero y se pulsa Shift+Tab, saltamos al último
      else if (e.shiftKey && document.activeElement === primer) {
        ultimo.focus();
        e.preventDefault();
      }
    });
  });
}

/* ---------- Lógica de autenticación simple (registro / login) ---------- */

/*
  Llaves (keys) usadas en localStorage y sessionStorage:
  - LLAVE_USUARIOS: string donde guardamos el array con todos los usuarios registrados.
  - LLAVE_SESION: string donde guardamos la sesión actual (objeto JSON).
*/
const LLAVE_USUARIOS = "demo_usuarios";
const LLAVE_SESION = "demo_sesion";

/*
  obtenerUsuarios()
  - Lee localStorage[LLAVE_USUARIOS], lo parsea y devuelve un array de usuarios.
  - Si no hay nada devuelve [].
*/
function obtenerUsuarios() {
  const raw = localStorage.getItem(LLAVE_USUARIOS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    // Si hay un error al parsear (texto corrupto), devolvemos arreglo vacío
    return [];
  }
}

/*
  guardarUsuarios(u)
  - Recibe un array 'u' y lo guarda en localStorage como texto JSON.
*/
function guardarUsuarios(u) {
  localStorage.setItem(LLAVE_USUARIOS, JSON.stringify(u));
}

/*
  generarId(prefijo)
  - Crea un id simple y único usando la hora y un número aleatorio.
  - No es criptográficamente seguro, pero sirve para identificar usuarios en demo.
*/
function generarId(prefijo = "") {
  return (
    prefijo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  );
}

/*
  mostrarEstadoUsuario()
  - Actualiza la parte de la UI (#estado-usuario) que muestra si hay sesión iniciada.
  - Si hay sesión muestra el username y un botón de "Cerrar sesión".
  - Si no hay sesión muestra un texto indicando que no hay nadie conectado.
*/
function mostrarEstadoUsuario() {
  const cont = qs("#estado-usuario");
  const sesion = sessionStorage.getItem(LLAVE_SESION);

  // Si el elemento no existe en la página (por si se usa el script en otra página), salimos
  if (!cont) return;

  if (!sesion) {
    cont.innerHTML = "<p>No hay sesión iniciada.</p>";
    return;
  }

  try {
    const obj = JSON.parse(sesion);
    // Mostramos nombre y un botón pequeño para logout
    cont.innerHTML = `<p>Sesión iniciada como <strong>${obj.username}</strong>. <button id="btn-logout-mini" class="btn btn-outline">Cerrar sesión</button></p>`;

    // Asociamos evento al botón creado dinámicamente
    qs("#btn-logout-mini").addEventListener("click", () => {
      sessionStorage.removeItem(LLAVE_SESION); // borramos la sesión
      mostrarEstadoUsuario(); // actualizamos la UI
      // Si quieres redirigir al index al cerrar: descomenta la línea siguiente
      // location.replace('index.html');
    });
  } catch {
    cont.innerHTML = "<p>Error leyendo sesión.</p>";
  }
}

/*
  mostrarErrorEnCampo(idFeedback, mensaje)
  - idFeedback: selector del span donde mostrar el mensaje (ej. "#fb-reg-email")
  - mensaje: texto a mostrar. Si es vacío borra el mensaje.
*/
function mostrarErrorEnCampo(idFeedback, mensaje) {
  const el = qs(idFeedback);
  if (el) el.textContent = mensaje || "";
}

/* -------------------- Manejar el formulario de registro -------------------- */

/*
  manejarRegistroForm(e)
  - Handler para el submit del formulario de registro.
  - Valida campos, muestra errores en los spans correspondientes y si todo está bien:
    * crea un objeto nuevo de usuario
    * lo guarda en localStorage
    * inicia una "sesión" (sessionStorage)
    * redirige al panelMascotas
*/
function manejarRegistroForm(e) {
  e.preventDefault(); // Evitamos que el formulario haga submit tradicional y recargue la página

  // Leemos valores de los inputs
  const nombre = qs("#reg-nombre").value.trim();
  const usuario = qs("#reg-usuario").value.trim();
  const email = qs("#reg-email").value.trim().toLowerCase();
  const pass = qs("#reg-pass").value;
  const pass2 = qs("#reg-pass2").value;

  // Limpiamos mensajes previos
  [
    "#fb-reg-nombre",
    "#fb-reg-usuario",
    "#fb-reg-email",
    "#fb-reg-pass",
    "#fb-reg-pass2",
  ].forEach((id) => mostrarErrorEnCampo(id, ""));

  // Validaciones simples (cliente)
  let valido = true;
  if (!nombre) {
    mostrarErrorEnCampo("#fb-reg-nombre", "Nombre requerido");
    valido = false;
  }
  if (!usuario || usuario.length < 3) {
    mostrarErrorEnCampo("#fb-reg-usuario", "Usuario: mínimo 3 caracteres");
    valido = false;
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    mostrarErrorEnCampo("#fb-reg-email", "Email inválido");
    valido = false;
  }
  if (!pass || pass.length < 6) {
    mostrarErrorEnCampo("#fb-reg-pass", "Contraseña mínimo 6 caracteres");
    valido = false;
  }
  if (pass !== pass2) {
    mostrarErrorEnCampo("#fb-reg-pass2", "Las contraseñas no coinciden");
    valido = false;
  }

  // Comprobamos duplicados en "base de datos" (localStorage)
  const usuarios = obtenerUsuarios();
  if (usuarios.find((u) => u.email === email)) {
    mostrarErrorEnCampo("#fb-reg-email", "Email ya registrado");
    valido = false;
  }
  if (usuarios.find((u) => u.username === usuario)) {
    mostrarErrorEnCampo("#fb-reg-usuario", "Usuario ya existe");
    valido = false;
  }

  if (!valido) return; // Si algo no es válido, salimos y no continuamos

  // Crear el usuario nuevo (objeto)
  const nuevo = {
    id: generarId("u-"), // id único
    username: usuario, // nombre corto para login
    email: email,
    password: btoa(pass), // btoa() convierte a base64 -> SOLO PARA DEMO (no seguro)
    fullName: nombre,
  };

  // Guardamos el usuario en la "base" (localStorage)
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);

  // Iniciamos sesión automáticamente (guardamos en sessionStorage)
  sessionStorage.setItem(
    LLAVE_SESION,
    JSON.stringify({ userId: nuevo.id, username: nuevo.username })
  );

  // Redirigimos al panelMascotas; usamos replace para que el botón "atrás" no vuelva aquí
  location.replace("panelMascotas.html");
}

/* -------------------- Manejar el formulario de login -------------------- */

/*
  manejarLoginForm(e)
  - Handler para submit del formulario de login.
  - Valida campos, busca el usuario por email o username y compara contraseña.
  - Si todo ok, guarda la sesión y dirige al panelMascotas.
*/
function manejarLoginForm(e) {
  e.preventDefault();

  const iden = qs("#login-iden").value.trim().toLowerCase(); // puede ser email o username
  const pass = qs("#login-pass").value;

  // Limpiamos mensajes previos
  ["#fb-login-iden", "#fb-login-pass"].forEach((id) =>
    mostrarErrorEnCampo(id, "")
  );

  // Validaciones sencillas
  if (!iden) {
    mostrarErrorEnCampo("#fb-login-iden", "Ingrese email o usuario");
    return;
  }
  if (!pass) {
    mostrarErrorEnCampo("#fb-login-pass", "Ingrese contraseña");
    return;
  }

  // Buscamos en localStorage
  const usuarios = obtenerUsuarios();
  const usuarioEncontrado = usuarios.find(
    (u) => u.email === iden || u.username.toLowerCase() === iden
  );

  if (!usuarioEncontrado) {
    mostrarErrorEnCampo("#fb-login-iden", "Usuario no encontrado");
    return;
  }

  // Comparamos la contraseña (recordar que en este demo se usó btoa)
  if (usuarioEncontrado.password !== btoa(pass)) {
    mostrarErrorEnCampo("#fb-login-pass", "Contraseña incorrecta");
    return;
  }

  // Si llegamos aquí: login correcto -> guardamos la sesión
  sessionStorage.setItem(
    LLAVE_SESION,
    JSON.stringify({
      userId: usuarioEncontrado.id,
      username: usuarioEncontrado.username,
    })
  );

  // Redirigimos al panelMascotas.
  location.replace("panelMascotas.html");
}

/* ---------- Inicialización: conectar todo al DOM y eventos ---------- */

/*
  iniciarDemo()
  - Esta función se ejecuta al cargar la página y:
    * inicializa modales (listeners)
    * conecta botones que abren modales
    * añade funcionalidad a las tabs (login/registro)
    * vincula los submit de formularios con sus handlers
    * conecta botones con data-cerrar (si existen)
    * muestra estado del usuario
*/
function iniciarDemo() {
  // 1) Preparamos los modales (abrir/cerrar/escape/focus-trap)
  inicializarModales();


  // 2) Botones que abren los modales (los obtuvimos en el HTML)
  qs("#btn-abrir-login").addEventListener("click", () =>
    abrirModalPorId("overlay-auth")
  );

  // 3) Tabs dentro del modal de auth: cambiamos entre Login y Registro
  qsa(".tabs .tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const destino = tab.getAttribute("data-toggle"); // 'login' o 'registro'
      // quitamos la clase activo de todas las tabs y la ponemos en la pulsada
      qsa(".tabs .tab").forEach((t) => t.classList.remove("activo"));
      tab.classList.add("activo");

      // mostramos el formulario correspondiente (quitar/poner .oculto)
      if (destino === "login") {
        qs("#form-login").classList.remove("oculto");
        qs("#form-registro").classList.add("oculto");
      } else {
        qs("#form-login").classList.add("oculto");
        qs("#form-registro").classList.remove("oculto");
      }
    });
  });

  // 4) Conectamos los formularios a sus funciones manejadoras.
  //    Además validamos que existan antes de asignar eventos (evita errores
  //    si este script se usa en otra página que no tiene los formularios).

  const formRegistro = qs("#form-registro");
  const formLogin = qs("#form-login");

  // Si existe el form de registro → conectarlo
  if (formRegistro) {
    formRegistro.addEventListener("submit", manejarRegistroForm);

    qsa("#form-registro input").forEach((input) => {
      input.addEventListener("input", () => {
        const fb = input.dataset.feedback;
        if (fb) mostrarErrorEnCampo(fb, "");
      });
    });
  }

  // Si existe el form de login → conectarlo
  if (formLogin) {
    formLogin.addEventListener("submit", manejarLoginForm);

    qsa("#form-login input").forEach((input) => {
      input.addEventListener("input", () => {
        const fb = input.dataset.feedback;
        if (fb) mostrarErrorEnCampo(fb, "");
      });
    });
  }


  // 5) Si hay botones con [data-cerrar] en el DOM, los conectamos para cerrar el modal
  qsa("[data-cerrar]").forEach((b) =>
    b.addEventListener("click", (e) => {
      const overlay = e.target.closest("[data-modal]");
      if (overlay) cerrarModal(overlay);
    })
  );

  // 6) Mostramos el estado del usuario (si está logueado o no)
  mostrarEstadoUsuario();
}

// Esperamos a que el DOM esté listo para ejecutar iniciarDemo()
// Esto evita errores de "elemento no encontrado" si el script se carga en <head>
document.addEventListener("DOMContentLoaded", iniciarDemo);
