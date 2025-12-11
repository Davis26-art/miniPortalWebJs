(function () {

  const LLAVE_SESION = "demo_sesion";
  const LLAVE_USUARIOS = "demo_usuarios";
  const LLAVE_MASCOTAS = "demo_mascotas";   // <-- NUEVA CLAVE

  // =============================
  // ⚡ FUNCIONES DE MASCOTAS
  // =============================

  // Obtener mascotas guardadas
  function obtenerMascotas() {
    const raw = localStorage.getItem(LLAVE_MASCOTAS);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }

  // Guardar todas las mascotas
  function guardarMascotas(lista) {
    localStorage.setItem(LLAVE_MASCOTAS, JSON.stringify(lista));
  }

  // Crear el HTML de una card
  function mascotaCardHTML(m) {
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
                  style="background-color: #2badb6; color: azure;">
            Ver detalles
          </button>
        </div>
      </div>
    `;
  }


  // =============================
  // ⚡ LÓGICA PRINCIPAL
  // =============================

  function init() {

    // --------------------------------------
    // 1. VERIFICAR SESIÓN
    // --------------------------------------
    const sesionRaw = sessionStorage.getItem(LLAVE_SESION);
    if (!sesionRaw) {
      location.replace("index.html");
      return;
    }

    let sesion;
    try { sesion = JSON.parse(sesionRaw); }
    catch {
      sessionStorage.removeItem(LLAVE_SESION);
      location.replace("index.html");
      return;
    }

    const username = sesion.username || "usuario";
    document.getElementById("usuario-nombre").textContent = username;


    // --------------------------------------
    // 2. MOSTRAR MASCOTAS GUARDADAS
    // --------------------------------------
    const listaMascotas = document.getElementById("lista-mascotas");
    const mascotasGuardadas = obtenerMascotas();

    mascotasGuardadas.forEach(m => {
      listaMascotas.insertAdjacentHTML("beforeend", mascotaCardHTML(m));
    });


    // --------------------------------------
    // 3. AGREGAR MASCOTAS NUEVAS
    // --------------------------------------
    const btnGuardar = document.getElementById("btn-guardar-mascota");

    btnGuardar.addEventListener("click", () => {

      const nombre = document.getElementById("mascota-nombre").value.trim();
      const animal = document.getElementById("mascota-animal").value.trim();
      const raza = document.getElementById("mascota-raza").value.trim();
      const edad = document.getElementById("mascota-edad").value.trim();
      const img = document.getElementById("mascota-img").value.trim();

      if (!nombre || !animal || !raza || !edad || !img) {
        alert("Completa todos los campos");
        return;
      }

      const mascotaNueva = { nombre, animal, raza, edad, img };

      // Guardar en localStorage
      mascotasGuardadas.push(mascotaNueva);
      guardarMascotas(mascotasGuardadas);

      // Pintar en pantalla
      listaMascotas.insertAdjacentHTML("beforeend", mascotaCardHTML(mascotaNueva));

      // Limpiar campos
      document.getElementById("mascota-nombre").value = "";
      document.getElementById("mascota-animal").value = "";
      document.getElementById("mascota-raza").value = "";
      document.getElementById("mascota-edad").value = "";
      document.getElementById("mascota-img").value = "";

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgregarMascota"));
      modal.hide();
    });

  }

  document.addEventListener("DOMContentLoaded", init);

})();
