document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-contacto");
    const btnLimpiar = document.getElementById("btn-limpiar");

    const campos = {
        nombre: document.getElementById("contact-nombre"),
        direccion: document.getElementById("contact-direccion"),
        telefono: document.getElementById("contact-telefono"),
        email: document.getElementById("contact-email"),
        mensaje: document.getElementById("contact-mensaje")
    };

    const fb = {
        nombre: document.getElementById("fb-contact-nombre"),
        direccion: document.getElementById("fb-contact-direccion"),
        telefono: document.getElementById("fb-contact-telefono"),
        email: document.getElementById("fb-contact-email"),
        mensaje: document.getElementById("fb-contact-mensaje")
    };

    function validar() {
        let ok = true;

        // ===== NOMBRE =====
        if (campos.nombre.value.trim() === "") {
            fb.nombre.textContent = "Debe ingresar un nombre.";
            ok = false;
        } else if (campos.nombre.value.trim().length < 3) {
            fb.nombre.textContent = "El nombre es demasiado corto.";
            ok = false;
        } else fb.nombre.textContent = "";

        // ===== DIRECCIÓN =====
        if (campos.direccion.value.trim() === "") {
            fb.direccion.textContent = "Debe ingresar una dirección.";
            ok = false;
        } else fb.direccion.textContent = "";

        // ===== TELÉFONO =====
        const tel = campos.telefono.value.trim();
        if (tel === "") {
            fb.telefono.textContent = "Debe ingresar un número de teléfono.";
            ok = false;
        } else if (!/^[0-9]{8,15}$/.test(tel)) {
            fb.telefono.textContent = "Ingrese un teléfono válido (solo números min-8).";
            ok = false;
        } else fb.telefono.textContent = "";

        // ===== EMAIL =====
        const correo = campos.email.value.trim();
        if (correo === "") {
            fb.email.textContent = "Debe ingresar un correo electrónico.";
            ok = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            fb.email.textContent = "Correo inválido.";
            ok = false;
        } else fb.email.textContent = "";

        // ===== MENSAJE =====
        const msg = campos.mensaje.value.trim();
        if (msg === "") {
            fb.mensaje.textContent = "Debe ingresar un mensaje.";
            ok = false;
        } else if (msg.length < 10) {
            fb.mensaje.textContent = "El mensaje debe tener al menos 10 caracteres.";
            ok = false;
        } else fb.mensaje.textContent = "";

        return ok;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (validar()) {
            alert("Formulario válido ✔ (no se envía porque es demo)");
            form.reset();
        }
    });

    btnLimpiar.addEventListener("click", () => {
        form.reset();
        Object.values(fb).forEach(s => s.textContent = "");
    });

});
