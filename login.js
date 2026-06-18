```js
const API_URL = "/api";

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const token = obtenerToken();
        const usuario = obtenerUsuario();

        if (token && usuario) {
            redirigirSegunRol(usuario);
            return;
        }

        const formulario =
            document.getElementById("formLogin");

        const mensaje =
            document.getElementById("mensajeLogin");

        formulario.addEventListener(
            "submit",
            function (evento) {
                evento.preventDefault();

                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();

                const password =
                    document
                        .getElementById("password")
                        .value;

                mensaje.innerHTML =
                    "<p>Comprobando credenciales...</p>";

                fetch(API_URL + "/login", {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                })
                    .then(function (respuesta) {
                        return respuesta
                            .json()
                            .then(function (datos) {
                                if (!respuesta.ok) {
                                    throw new Error(
                                        datos.error ||
                                        "No se pudo iniciar sesión."
                                    );
                                }

                                return datos;
                            });
                    })
                    .then(function (datos) {
                        guardarSesion(
                            datos.token,
                            datos.usuario
                        );

                        redirigirSegunRol(
                            datos.usuario
                        );
                    })
                    .catch(function (error) {
                        mensaje.innerHTML =
                            '<div class="resultado error">' +
                            error.message +
                            "</div>";
                    });
            }
        );
    }
);
```
