(function () {

  const LLAVE_SESION = "demo_sesion";
  const LLAVE_MASCOTAS = "demo_mascotas";

  // =============================
  // ⚡ UTILIDADES LOCALSTORAGE
  // =============================

  function obtenerMascotas() {
    try {
      return JSON.parse(localStorage.getItem(LLAVE_MASCOTAS)) || [];
    } catch {
      return [];
    }
  }

  function guardarMascotas(lista) {
    localStorage.setItem(LLAVE_MASCOTAS, JSON.stringify(lista));
  }

  // =============================
  // ⚡ HTML DE UNA CARD DE MASCOTA
  // =============================

  function crearCardMascota(m, index) {
    return `
      <div class="col-md-3"> 
        <div class="pet-card p-3 shadow-sm"> 
        <img src="${m.img}" class="pet-img mx-auto d-block"> 
        <h5 class="text-center fw-bold mt-2">${m.nombre}</h5> 
        <div class="pet-info row text-center mt-2"> 
          <div class="col">${m.animal}</div> 
          <div class="col">${m.raza}</div> 
          <div class="col">${m.edad}</div> 
        </div>

        <hr> 
        <button class="btn w-100 mt-2" 
        style="background-color: #2badb6; color: azure;"
        onclick="abrirDetallesMascota(${index})"> Ver detalles </button>

        </div>
      </div>
    `;
  }

  // =============================
  // ⚡ CARGAR LISTA DE MASCOTAS
  // =============================

  function mostrarListaMascotas() {
    const lista = document.getElementById("lista-mascotas");
    const mascotas = obtenerMascotas();

    lista.innerHTML = "";

    if (mascotas.length === 0) {
      lista.innerHTML = `
        <p class="text-center text-muted fs-5 my-5">
          Aún no has registrado mascotas 🐾
        </p>
      `;
      return;
    }

    mascotas.forEach((m, index) => {
      lista.innerHTML += crearCardMascota(m, index);
    });
  }

  // =============================
  // ⚡ MODAL DE DETALLES
  // =============================

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
  }

  function mostrarHistorial(historial) {
    const cont = document.getElementById("detalle-historial");
    cont.innerHTML = "";

    if (!historial || historial.length === 0) {
      cont.innerHTML = `<p class="text-muted text-center">Sin historial médico.</p>`;
      return;
    }

    historial.forEach((h, idx) => {
      cont.innerHTML += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <span>• ${h}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="borrarHistorial(${idx})">
          ✖
        </button>
      </div>
    `;
    });
  }

  // =============================
  // ⚡ GUARDAR CAMBIOS EN DETALLES
  // =============================

  document.getElementById("btn-guardar-detalles").addEventListener("click", () => {
    const mascotas = obtenerMascotas();
    const m = mascotas[mascotaActual];

    m.nombre = document.getElementById("detalle-nombre").value;
    m.animal = document.getElementById("detalle-animal").value;
    m.raza = document.getElementById("detalle-raza").value;
    m.edad = document.getElementById("detalle-edad").value;
    m.img = document.getElementById("detalle-img-input").value;

    guardarMascotas(mascotas);
    mostrarListaMascotas();
  });


  document.getElementById("btn-borrar-mascota").addEventListener("click", () => {
    if (mascotaActual === null) return;

    const mascotas = obtenerMascotas();

    // Confirmación (opcional)
    if (!confirm("¿Seguro que quieres borrar esta mascota?")) return;

    // Eliminar mascota por índice
    mascotas.splice(mascotaActual, 1);

    guardarMascotas(mascotas);
    mostrarListaMascotas();

    mascotaActual = null;

    // Cerrar modal
    bootstrap.Modal.getInstance(
      document.getElementById("modalDetallesMascota")
    ).hide();
  });


  // =============================
  // ⚡ AGREGAR HISTORIAL
  // =============================

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
  });

  // =============================
  // ⚡ INICIALIZAR PÁGINA
  // =============================

  function init() {
    // Validar sesión
    const rawSesion = sessionStorage.getItem(LLAVE_SESION);
    if (!rawSesion) {
      location.replace("index.html");
      return;
    }

    // Mostrar mascotas guardadas
    mostrarListaMascotas();

    // Botón guardar nueva mascota
    document.getElementById("btn-guardar-mascota").addEventListener("click", () => {
      const nombre = document.getElementById("mascota-nombre").value.trim();
      const animal = document.getElementById("mascota-animal").value.trim();
      const raza = document.getElementById("mascota-raza").value.trim();
      const edad = document.getElementById("mascota-edad").value.trim();
      const img = document.getElementById("mascota-img").value.trim();

      if (!nombre || !animal || !raza || !edad || !img) {
        alert("Completa todos los campos");
        return;
      }

      const mascota = { nombre, animal, raza, edad, img, historial: [] };

      const mascotas = obtenerMascotas();
      mascotas.push(mascota);
      guardarMascotas(mascotas);

      mostrarListaMascotas();

      // Limpiar
      document.getElementById("mascota-nombre").value = "";
      document.getElementById("mascota-animal").value = "";
      document.getElementById("mascota-raza").value = "";
      document.getElementById("mascota-edad").value = "";
      document.getElementById("mascota-img").value = "";

      bootstrap.Modal.getInstance(document.getElementById("modalAgregarMascota")).hide();
    });
  }

  window.borrarHistorial = function (idx) {
    const mascotas = obtenerMascotas();
    const m = mascotas[mascotaActual];

    if (!m.historial) return;

    m.historial.splice(idx, 1);

    guardarMascotas(mascotas);
    mostrarHistorial(m.historial);
  };


  document.addEventListener("DOMContentLoaded", init);

})();
