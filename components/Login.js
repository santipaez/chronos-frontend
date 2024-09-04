$(document).ready(function () {
    // on ready
});


async function login() {
    let data = {};
    data.email = document.getElementById('txtEmail').value;
    data.password = document.getElementById('txtPassword').value;

    const request = await fetch('api/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const respuesta = await request.text();
    if (respuesta != 'FAIL') {
        localStorage.token = respuesta;
        localStorage.email = datos.email;
        window.location.href = 'users.html'
    } else {
        alert("Las credenciales son incorrectas. Por favor intente nuevamente.");
    }

}