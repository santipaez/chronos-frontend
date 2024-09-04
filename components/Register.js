$(document).ready(function () {
    // on ready
});


async function register() {
    let data = {};
    data.name = document.getElementById('txtUsername').value;
    data.email = document.getElementById('txtEmail').value;
    data.password = document.getElementById('txtPassword').value;

    let repeatPassword = document.getElementById('txtRepeatPassword').value;

    if (repeatPassword != data.password) {
        alert('Ingresaste una contraseña distinta. Por favor, intenta nuevamente.');
        return;
    }

    const request = await fetch('api/users', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    alert("Cuenta creada con éxito. Por favor, inicia sesión.");
    window.location.href = 'login.html'

}