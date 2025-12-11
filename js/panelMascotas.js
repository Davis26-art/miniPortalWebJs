// --------------------------------------------------------------
// js/panelMascotas.js
// Archivo encargado de:
//
// 1. Revisar si el usuario tiene una sesión iniciada.
// 2. Mostrar los datos del usuario en el panelMascotas.
// 3. Permitir cerrar sesión.
// 4. Permitir eliminar la cuenta del usuario.
// --------------------------------------------------------------


// Todo este archivo está envuelto en una función que se ejecuta sola.
// Esto se usa para que las variables NO se mezclen con otras partes del sitio.
(function () {

  // Nombre de las claves donde guardamos información en localStorage/sessionStorage
  // Puedes pensar en esto como "los rótulos de las cajas" donde guardamos datos.
  const LLAVE_SESION = "demo_sesion";      // Aquí se guarda la sesión actual (solo mientras el navegador está abierto)
  const LLAVE_USUARIOS = "demo_usuarios";  // Aquí se guardan las cuentas registradas


  // --------------------------------------------------------------
  // Función que envía al usuario al inicio (index.html)
  // --------------------------------------------------------------
  function redirectToIndex() {
    // location.replace() cambia de página SIN dejar que el usuario vuelva atrás
    // Esto evita que el usuario regrese al panelMascotas después de cerrar la sesión.
    location.replace("index.html");
  }


  // --------------------------------------------------------------
  // Función para obtener TODOS los usuarios guardados en localStorage
  // Devuelve un array (lista) de usuarios o [] si no hay nada.
  // --------------------------------------------------------------
  function obtenerUsuarios() {
    const raw = localStorage.getItem(LLAVE_USUARIOS); // Recuperamos lo que está guardado

    if (!raw) return []; // Si no hay nada guardado, regresamos una lista vacía []

    try {
      return JSON.parse(raw); // Convertimos el texto a un array de usuarios
    } catch {
      // Si algo sale mal, devolvemos una lista vacía
      return [];
    }
  }


  // --------------------------------------------------------------
  // Guarda la lista de usuarios nuevamente en localStorage
  // Recibe un array de usuarios como parámetro
  // --------------------------------------------------------------
  function guardarUsuarios(u) {
    // JSON.stringify() convierte objetos/arrays a texto para poder guardarlos
    localStorage.setItem(LLAVE_USUARIOS, JSON.stringify(u));
  }


  // --------------------------------------------------------------
  // Elimina un usuario de la lista usando su ID
  // --------------------------------------------------------------
  function eliminarUsuarioPorId(userId) {
    const usuarios = obtenerUsuarios(); // Traemos todos los usuarios
    const filtrados = usuarios.filter((u) => u.id !== userId); // Quitamos el usuario que tenga ese ID
    guardarUsuarios(filtrados); // Guardamos la lista actualizada
  }


  // --------------------------------------------------------------
  // FUNCIÓN PRINCIPAL — Se ejecuta cuando el HTML ya está cargado
  // --------------------------------------------------------------
  function init() {

    // 1. Revisamos si existe una sesión guardada
    const sesionRaw = sessionStorage.getItem(LLAVE_SESION);

    if (!sesionRaw) {
      // Si NO existe sesión, enviamos al usuario al inicio
      redirectToIndex();
      // Detenemos la función aqureturn; í
    }


    // 2. Intentamos convertir esa sesión a un objeto JS
    let sesion;
    try {
      sesion = JSON.parse(sesionRaw);
    } catch {
      // Si la sesión está dañada o corrupta:
      sessionStorage.removeItem(LLAVE_SESION); // La borramos
      redirectToIndex(); // Y sacamos al usuario del panelMascotas
      return;
    }


    // 3. Extraemos los datos básicos de la sesión
    const userId = sesion.userId;
    const username = sesion.username || "usuario";

    // Mostramos el nombre del usuario en el panelMascotas
    document.getElementById("usuario-nombre").textContent = username;


    // 4. Buscamos el usuario completo en localStorage
    const usuarios = obtenerUsuarios();
    const usuarioObj = usuarios.find((u) => u.id === userId);


    // 5. Si encontramos el usuario, mostramos más datos
    if (usuarioObj) {
      const full = usuarioObj.fullName || usuarioObj.username || username;
      const email = usuarioObj.email || "";

      document.getElementById("usuario-nombre").textContent = full;
      document.getElementById("info-privada").textContent =
        "Este contenido sólo es visible para usuarios autenticados.";
      document.getElementById("email-privado").textContent = "Email: " + email;

    } else {
      // Si NO encontramos ese usuario en localStorage, mostramos lo básico
      document.getElementById("info-privada").textContent =
        "Usuario autenticado (datos limitados). ID: " + (userId || "n/a");
      document.getElementById("email-privado").textContent = "";
    }


    // --------------------------------------------------------------
    // BOTÓN: Cerrar sesión
    // Borra la sesión y envía al usuario al index
    // --------------------------------------------------------------
    document.getElementById("btn-logout").addEventListener("click", () => {
      sessionStorage.removeItem(LLAVE_SESION); // Quitamos la sesión
      redirectToIndex();
    });


    // --------------------------------------------------------------
    // BOTÓN: Eliminar cuenta
    // Pregunta al usuario, borra la cuenta y destruye la sesión
    // --------------------------------------------------------------
    document.getElementById("btn-delete").addEventListener("click", () => {

      const confirmar = confirm(
        "¿Estás seguro? Esto eliminará tu cuenta permanentemente."
      );

      if (!confirmar) return; // Si cancela, no hacemos nada

      if (userId) {
        eliminarUsuarioPorId(userId); // Eliminamos al usuario
      }

      sessionStorage.removeItem(LLAVE_SESION); // Quitamos la sesión
      redirectToIndex(); // Lo mandamos al inicio
    });


    // --------------------------------------------------------------
    // BOTÓN: Volver al inicio SIN cerrar sesión
    // (Esto es útil para pruebas)
    // --------------------------------------------------------------
    const btnVolver = document.getElementById("btn-volver");
    if (btnVolver) {
      btnVolver.addEventListener("click", () => location.href = "index.html");
    }

  }


  // --------------------------------------------------------------
  // Ejecutamos "init" cuando el HTML ya terminó de cargarse
  // --------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", init);

})(); // Fin del auto-ejecutable
