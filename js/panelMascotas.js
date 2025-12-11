(function () {

  const LLAVE_SESION = "demo_sesion";
  const LLAVE_USUARIOS = "demo_usuarios"; // existe en tu app
  // NOTE: no hay una sola LLAVE_MASCOTAS global — la calculamos por usuario:
  let USUARIO_ID_ACTUAL = null;
  let KEY_MASCOTAS_USUARIO = null;

  // -------------------------
  // UTIL: obtener sesión y establecer key por usuario
  // -------------------------
  function getSesion() {
    try {
      const raw = sessionStorage.getItem(LLAVE_SESION);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setKeysUsuario() {
    const ses = getSesion();
    if (!ses || !ses.userId) {
      USUARIO_ID_ACTUAL = null;
      KEY_MASCOTAS_USUARIO = null;
      return;
    }
    USUARIO_ID_ACTUAL = ses.userId;
    KEY_MASCOTAS_USUARIO = `demo_mascotas_${USUARIO_ID_ACTUAL}`;
  }

  // ============================================================
  // UTILIDADES localStorage (por usuario)
  // ============================================================
  const obtenerMascotas = () => {
    if (!KEY_MASCOTAS_USUARIO) return [];
    try {
      return JSON.parse(localStorage.getItem(KEY_MASCOTAS_USUARIO)) || [];
    } catch {
      return [];
    }
  };

  const guardarMascotas = (lista) => {
    if (!KEY_MASCOTAS_USUARIO) return;
    localStorage.setItem(KEY_MASCOTAS_USUARIO, JSON.stringify(lista));
  };

  // ============================================================
  // SNACKBAR
  // ============================================================
  function mostrarSnack(texto) {
    const snack = document.getElementById("snack");
    if (!snack) return;

    snack.textContent = texto;
    snack.classList.add("show");

    setTimeout(() => {
      snack.classList.remove("show");
    }, 2200);
  }

  // ============================================================
  // CARD HTML
  // ============================================================
  function crearCardMascota(m, index) {
    // Uso de clases ya definidas en tu CSS; h-100 para igual altura
    return `
      <div class="col-md-3">
        <div class="pet-card p-3 shadow-sm h-100 d-flex flex-column">
          <img src="${m.img}" class="pet-img mx-auto d-block" alt="${m.nombre}">
          <h5 class="text-center fw-bold mt-2">${m.nombre}</h5>

          <div class="pet-info row text-center mt-2 small">
            <div class="col">${m.animal}</div>
            <div class="col">${m.raza}</div>
            <div class="col">${m.edad}</div>
          </div>

          <hr>

          <button class="btn w-100 mt-auto"
            style="background-color: #2badb6; color: white;"
            onclick="abrirDetallesMascota(${index})">
            Ver detalles
          </button>
        </div>
      </div>
    `;
  }

  // ============================================================
  // MOSTRAR LISTA
  // ============================================================
  function mostrarListaMascotas() {
    const lista = document.getElementById("lista-mascotas");
    if (!lista) return;

    const mascotas = obtenerMascotas();
    lista.innerHTML = "";

    if (mascotas.length === 0) {
      lista.innerHTML = `
        <p class="text-center text-muted fs-5 my-5">
          Aún no has registrado mascotas 🐾
        </p>`;
      return;
    }

    mascotas.forEach((m, i) => {
      lista.innerHTML += crearCardMascota(m, i);
    });
  }

  // ============================================================
  // MODAL DETALLES
  // ============================================================
  let mascotaActual = null;

  window.abrirDetallesMascota = function (index) {
    const mascotas = obtenerMascotas();
    if (!mascotas[index]) return;
    mascotaActual = index;

    const m = mascotas[index];

    const elImg = document.getElementById("detalle-img");
    const elImgIn = document.getElementById("detalle-img-input");
    const elNombre = document.getElementById("detalle-nombre");
    const elAnimal = document.getElementById("detalle-animal");
    const elRaza = document.getElementById("detalle-raza");
    const elEdad = document.getElementById("detalle-edad");

    if (elImg) elImg.src = m.img || "";
    if (elImgIn) elImgIn.value = m.img || "";
    if (elNombre) elNombre.value = m.nombre || "";
    if (elAnimal) elAnimal.value = m.animal || "";
    if (elRaza) elRaza.value = m.raza || "";
    if (elEdad) elEdad.value = m.edad || "";

    mostrarHistorial(m.historial || []);

    const modalEl = document.getElementById("modalDetallesMascota");
    if (modalEl) new bootstrap.Modal(modalEl).show();
  };

  // ============================================================
  // HISTORIAL
  // ============================================================
  function mostrarHistorial(historial) {
    const cont = document.getElementById("detalle-historial");
    if (!cont) return;
    cont.innerHTML = "";

    if (!historial || historial.length === 0) {
      cont.innerHTML = `<p class="text-muted text-center">Sin historial médico.</p>`;
      return;
    }

    historial.forEach((h, i) => {
      cont.innerHTML += `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <span class="me-2">• ${h}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="borrarHistorial(${i})">✖</button>
        </div>`;
    });
  }

  window.borrarHistorial = function (i) {
    const mascotas = obtenerMascotas();
    const m = mascotas[mascotaActual];
    if (!m || !m.historial) return;

    m.historial.splice(i, 1);
    guardarMascotas(mascotas);
    mostrarHistorial(m.historial);
    mostrarSnack("Entrada eliminada");
  };

  // ============================================================
  // GUARDAR DETALLES EDITADOS
  // ============================================================
  function initGuardarDetalles() {
    const btn = document.getElementById("btn-guardar-detalles");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const mascotas = obtenerMascotas();
      const m = mascotas[mascotaActual];
      if (!m) return;

      const nombre = (document.getElementById("detalle-nombre") || {}).value || "";
      const animal = (document.getElementById("detalle-animal") || {}).value || "";
      const raza = (document.getElementById("detalle-raza") || {}).value || "";
      const edad = (document.getElementById("detalle-edad") || {}).value || "";
      const img = (document.getElementById("detalle-img-input") || {}).value || "";

      m.nombre = nombre.trim();
      m.animal = animal.trim();
      m.raza = raza.trim();
      m.edad = edad.trim();
      m.img = img.trim();

      guardarMascotas(mascotas);
      mostrarListaMascotas();
      mostrarSnack("Cambios guardados ✔");
    });
  }

  // ============================================================
  // ELIMINAR MASCOTA
  // ============================================================
  function initBorrarMascota() {
    const btn = document.getElementById("btn-borrar-mascota");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (mascotaActual === null) return;
      if (!confirm("¿Seguro que quieres borrar esta mascota?")) return;

      const mascotas = obtenerMascotas();
      mascotas.splice(mascotaActual, 1);
      guardarMascotas(mascotas);
      mostrarListaMascotas();
      mascotaActual = null;

      const modalEl = document.getElementById("modalDetallesMascota");
      const instance = bootstrap.Modal.getInstance(modalEl);
      if (instance) instance.hide();

      mostrarSnack("Mascota eliminada");
    });
  }

  // ============================================================
  // AGREGAR HISTORIAL
  // ============================================================
  function initAgregarHistorial() {
    const btn = document.getElementById("btn-agregar-historial");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const txtEl = document.getElementById("detalle-historial-nuevo");
      if (!txtEl) return;
      const texto = txtEl.value.trim();
      if (!texto) return;

      const mascotas = obtenerMascotas();
      const m = mascotas[mascotaActual];
      if (!m) return;
      if (!m.historial) m.historial = [];
      m.historial.push(texto);

      guardarMascotas(mascotas);
      mostrarHistorial(m.historial);
      txtEl.value = "";
      mostrarSnack("Historial agregado");
    });
  }

  // ============================================================
  // REGISTRAR NUEVA MASCOTA
  // ============================================================
  function registrarEventosNuevaMascota() {
    const btn = document.getElementById("btn-guardar-mascota");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const nombre = (document.getElementById("mascota-nombre") || {}).value || "";
      const animal = (document.getElementById("mascota-animal") || {}).value || "";
      const raza = (document.getElementById("mascota-raza") || {}).value || "";
      const edad = (document.getElementById("mascota-edad") || {}).value || "";
      const img = (document.getElementById("mascota-img") || {}).value || "";

      if (!nombre.trim() || !animal.trim() || !raza.trim() || !edad.trim() || !img.trim()) {
        mostrarSnack("Completa todos los campos");
        return;
      }

      const nueva = { nombre: nombre.trim(), animal: animal.trim(), raza: raza.trim(), edad: edad.trim(), img: img.trim(), historial: [] };
      const mascotas = obtenerMascotas();
      mascotas.push(nueva);
      guardarMascotas(mascotas);
      mostrarListaMascotas();

      // limpiar inputs
      ["mascota-nombre","mascota-animal","mascota-raza","mascota-edad","mascota-img"].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.value = "";
      });

      const modalEl = document.getElementById("modalAgregarMascota");
      const instance = bootstrap.Modal.getInstance(modalEl);
      if (instance) instance.hide();

      mostrarSnack("Mascota registrada");
    });
  }

  // ============================================================
  // NAVBAR: mostrar datos usuario, logout, delete, volver
  // ============================================================
  function mostrarDatosUsuarioEnDashboard() {
    const ses = getSesion();
    if (!ses) return;
    const contNombre = document.getElementById("usuario-nombre");
    const contInfoPriv = document.getElementById("info-privada");
    const contEmail = document.getElementById("email-privado");

    if (contNombre) contNombre.textContent = ses.username || "usuario";

    // Intentamos buscar fullName/email en la "base" demo_usuarios
    try {
      const usuariosRaw = localStorage.getItem(LLAVE_USUARIOS);
      if (usuariosRaw) {
        const usuarios = JSON.parse(usuariosRaw);
        const u = usuarios.find(x => x.id === ses.userId);
        if (u) {
          if (contNombre) contNombre.textContent = u.fullName || u.username || ses.username;
          if (contEmail) contEmail.textContent = "Email: " + (u.email || "");
        } else {
          if (contEmail) contEmail.textContent = "";
        }
      }
    } catch {
      if (contEmail) contEmail.textContent = "";
    }

    if (contInfoPriv) contInfoPriv.textContent = "Este contenido sólo es visible para usuarios autenticados.";
  }

  function initNavButtons() {
    // volver
    const btnVolver = document.getElementById("btn-volver");
    if (btnVolver) btnVolver.addEventListener("click", () => location.replace("index.html"));

    // logout
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) btnLogout.addEventListener("click", () => {
      sessionStorage.removeItem(LLAVE_SESION);
      mostrarSnack("Sesión cerrada");
      setTimeout(()=> location.replace("index.html"), 700);
    });

    // delete account
    const btnDelete = document.getElementById("btn-delete");
    if (btnDelete) btnDelete.addEventListener("click", () => {
      if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esto NO se puede deshacer.")) return;
      // eliminar sesion y datos del usuario (solo sus mascotas)
      sessionStorage.removeItem(LLAVE_SESION);
      if (KEY_MASCOTAS_USUARIO) localStorage.removeItem(KEY_MASCOTAS_USUARIO);
      mostrarSnack("Cuenta eliminada");
      setTimeout(()=> location.replace("index.html"), 700);
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    const ses = getSesion();
    if (!ses) {
      location.replace("index.html");
      return;
    }

    // set keys usuario
    setKeysUsuario();

    // mostrar datos user, inicializar listeners
    mostrarDatosUsuarioEnDashboard();
    initNavButtons();

    // listeners y render
    registrarEventosNuevaMascota();
    initGuardarDetalles();
    initBorrarMascota();
    initAgregarHistorial();

    mostrarListaMascotas();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
