```js
const TOKEN_KEY = "infdemic_token";
const USUARIO_KEY = "infdemic_usuario";

function guardarSesion(token, usuario) {
    sessionStorage.setItem(TOKEN_KEY, token);

    sessionStorage.setItem(
        USUARIO_KEY,
        JSON.stringify(usuario)
    );
}

function obtenerToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

function obtenerUsuario() {
    const usuarioGuardado =
        sessionStorage.getItem(USUARIO_KEY);

    if (!usuarioGuardado) {
        return null;
    }

    try {
        return JSON.parse(usuarioGuardado);
    } catch (error) {
        borrarSesion();
        return null;
    }
}

function borrarSesion() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USUARIO_KEY);
}

function cerrarSesion() {
    borrarSesion();
    window.location.href = "login.html";
}

function redirigirSegunRol(usuario) {
    if (!usuario) {
        window.location.href = "login.html";
        return;
    }

    if (usuario.rol === "medico") {
        window.location.href = "index.html";
        return;
    }

    if (usuario.rol === "investigador") {
        window.location.href = "investigador.html";
        return;
    }

    if (usuario.rol === "administrador") {
        window.location.href = "admin.html";
        return;
    }

    borrarSesion();
    window.location.href = "login.html";
}

function protegerPagina(rolesPermitidos) {
    const token = obtenerToken();
    const usuario = obtenerUsuario();

    if (!token || !usuario) {
        window.location.href = "login.html";
        return false;
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
        redirigirSegunRol(usuario);
        return false;
    }

    return true;
}

function configurarNavegacion() {
    const usuario = obtenerUsuario();

    if (!usuario) {
        return;
    }

    const nombreUsuario =
        document.getElementById("nombreUsuario");

    if (nombreUsuario) {
        nombreUsuario.textContent =
            usuario.nombre + " (" + usuario.rol + ")";
    }

    const elementosConRoles =
        document.querySelectorAll("[data-roles]");

    elementosConRoles.forEach(function (elemento) {
        const rolesPermitidos =
            elemento.dataset.roles
                .split(",")
                .map(function (rol) {
                    return rol.trim();
                });

        if (!rolesPermitidos.includes(usuario.rol)) {
            elemento.hidden = true;
        }
    });

    const botonCerrarSesion =
        document.getElementById("btnCerrarSesion");

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener(
            "click",
            cerrarSesion
        );
    }
}

function peticionAutenticada(url, opciones) {
    const token = obtenerToken();

    if (!token) {
        window.location.href = "login.html";

        return Promise.reject(
            new Error("No existe una sesión activa.")
        );
    }

    const configuracion = opciones || {};

    const cabeceras =
        new Headers(configuracion.headers || {});

    cabeceras.set(
        "Authorization",
        "Bearer " + token
    );

    if (
        configuracion.body &&
        !cabeceras.has("Content-Type")
    ) {
        cabeceras.set(
            "Content-Type",
            "application/json"
        );
    }

    configuracion.headers = cabeceras;

    return fetch(url, configuracion)
        .then(function (respuesta) {
            if (respuesta.status === 401) {
                borrarSesion();

                window.location.href =
                    "login.html";

                throw new Error(
                    "La sesión ha caducado. Inicia sesión otra vez."
                );
            }

            return respuesta;
        });
}
```
