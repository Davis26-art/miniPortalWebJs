(function () {

  const LLAVE_SESION = "demo_sesion";
  const LLAVE_MASCOTAS = "demo_mascotas";

  // ============================================================
  // 🔧 UTILIDADES LOCALSTORAGE
  // ============================================================

  const obtenerMascotas = () => {
    try {
      return JSON.parse(localStorage.getItem(LLAVE_MASCOTAS)) || [];
    } catch {
      return [];
    }
  };

  const guardarMascotas = (lista) =>
    localStorage.setItem(LLAVE_MASCOTAS, JSON.stringify(lista));


  // ============================================================
  // 🔧 SNACKBAR (MENSAJES DE ÉXITO)
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
  // 🐾 HTML DE UNA CARD DE MASCOTA
  // ============================================================

  function crearCardMascota(m, index) {
    return `
      <div class="col-md-3">
        <div class="pet-card p-3 shadow-sm h-100">
          <img src="${m.img}" class="pet-img mx-auto d-block">
          
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
  // 📌 MOSTRAR LISTA DE MASCOTAS
  // ============================================================

  function mostrarListaMascotas() {
    const lista = document.getElementById("lista-mascotas");
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
  // 📌 MODAL DETALLES
  // ============================================================

  let mascotaActual = null;

  window.abrirDetallesMascota = function (index) {
    const mascotas = obtenerMascotas();
    mascotaActual = index;

    const m = mascotas[index];

    document.getElementById("detalle-img").src = m.img;
    document.getElementById("detalle-img-input").value = m.img;
    document.getElementById("detalle-nombre").value = m.nombre;
    document.getElementById("detalle-animal").value = m.animal;
    document.getElementById("detalle-raza").value = m.raza;
    document.getElementById("detalle-edad").value = m.edad;

    mostrarHistorial(m.historial || []);

    new bootstrap.Modal(document.getElementById("modalDetallesMascota")).show();
  };


  // ============================================================
  // 📌 HISTORIAL MÉDICO
  // ============================================================

  function mostrarHistorial(historial) {
    const cont = document.getElementById("detalle-historial");
    cont.innerHTML = "";

    if (!historial.length) {
      cont.innerHTML = `<p class="text-muted text-center">Sin historial médico.</p>`;
      return;
    }

    historial.forEach((h, i) => {
      cont.innerHTML += `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <span>• ${h}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="borrarHistorial(${i})">✖</button>
        </div>`;
    });
  }


  window.borrarHistorial = function (i) {
    const mascotas = obtenerMascotas();
    const m = mascotas[mascotaActual];

    if (!m.historial) return;

    m.historial.splice(i, 1);

    guardarMascotas(mascotas);
    mostrarHistorial(m.historial);
    mostrarSnack("Entrada eliminada");
  };


  document.getElementById("btn-agregar-historial").addEventListener("click", () => {
    const texto = document.getElementById("detalle-historial-nuevo").value.trim();
    if (!texto) return;

    const mascotas = obtenerMascotas();
    const m = mascotas[mascotaActual];

    if (!m.historial) m.historial = [];
    m.historial.push(texto);

    guardarMascotas(mascotas);
    mostrarHistorial(m.historial);

    document.getElementById("detalle-historial-nuevo").value = "";

    mostrarSnack("Historial agregado");
  });


  // ============================================================
  // 📌 GUARDAR CAMBIOS EN DETALLES
  // ============================================================

  document.getElementById("btn-guardar-detalles").addEventListener("click", () => {
    const mascotas = obtenerMascotas();
    const m = mascotas[mascotaActual];

    m.nombre = document.getElementById("detalle-nombre").value.trim();
    m.animal = document.getElementById("detalle-animal").value.trim();
    m.raza = document.getElementById("detalle-raza").value.trim();
    m.edad = document.getElementById("detalle-edad").value.trim();
    m.img = document.getElementById("detalle-img-input").value.trim();

    guardarMascotas(mascotas);

    mostrarListaMascotas();
    mostrarSnack("Cambios guardados ✔");
  });


  // ============================================================
  // ❌ BORRAR MASCOTA
  // ============================================================

  document.getElementById("btn-borrar-mascota").addEventListener("click", () => {
    if (mascotaActual === null) return;

    if (!confirm("¿Seguro que quieres borrar esta mascota?")) return;

    const mascotas = obtenerMascotas();
    mascotas.splice(mascotaActual, 1);

    guardarMascotas(mascotas);
    mostrarListaMascotas();

    mascotaActual = null;

    bootstrap.Modal.getInstance(
      document.getElementById("modalDetallesMascota")
    ).hide();

    mostrarSnack("Mascota eliminada");
  });


  // ============================================================
  // 🚀 AGREGAR NUEVA MASCOTA
  // ============================================================

  function registrarEventosNuevaMascota() {
    document.getElementById("btn-guardar-mascota").addEventListener("click", () => {
      const nombre = document.getElementById("mascota-nombre").value.trim();
      const animal = document.getElementById("mascota-animal").value.trim();
      const raza = document.getElementById("mascota-raza").value.trim();
      const edad = document.getElementById("mascota-edad").value.trim();
      const img = document.getElementById("mascota-img").value.trim();

      if (!nombre || !animal || !raza || !edad || !img) {
        mostrarSnack("Completa todos los campos");
        return;
      }

      const nueva = { nombre, animal, raza, edad, img, historial: [] };
      const mascotas = obtenerMascotas();

      mascotas.push(nueva);
      guardarMascotas(mascotas);

      mostrarListaMascotas();

      document.getElementById("mascota-nombre").value = "";
      document.getElementById("mascota-animal").value = "";
      document.getElementById("mascota-raza").value = "";
      document.getElementById("mascota-edad").value = "";
      document.getElementById("mascota-img").value = "";

      bootstrap.Modal.getInstance(
        document.getElementById("modalAgregarMascota")
      ).hide();

      mostrarSnack("Mascota registrada");
    });
  }


  // ============================================================
  // 🚀 INICIALIZAR
  // ============================================================

  function init() {
    // Validar sesión
    if (!sessionStorage.getItem(LLAVE_SESION)) {
      location.replace("index.html");
      return;
    }

    mostrarListaMascotas();
    registrarEventosNuevaMascota();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
