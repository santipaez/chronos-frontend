// Call the dataTables jQuery plugin
$(document).ready(function () {
    loadUsers();
    $('#users').DataTable();
    updateUserEmail();
});

function updateUserEmail() {
    document.getElementById('txt-user-email').outerHTML = localStorage.email;
}

async function loadUsers() {
    const request = await fetch('/users', {
        method: 'GET',
        headers: getHeaders()
    });
    const users = await request.json();

    let listHtml = '';
    for (let user of users) {
        let deleteButton = '<a href="#" onclick="deleteUser(' + user.id + ')" class="btn btn-danger btn-circle btn-sm"><i class="fas fa-trash"></i></a>';

        let phoneText = user.phone == null ? '-' : user.phone;
        let userHtml = '<tr><td>' + user.id + '</td><td>' + user.firstName + ' ' + user.lastName + '</td><td>'
            + user.email + '</td><td>' + phoneText
            + '</td><td>' + deleteButton + '</td></tr>';
        listHtml += userHtml;
    }

    document.querySelector('#users tbody').outerHTML = listHtml;
}

function getHeaders() {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': localStorage.token
    };
}

async function deleteUser(id) {

    if (!confirm('¿Quieres eliminar este usuario?')) {
        return;
    }

    const request = await fetch('/users/' + id, {
        method: 'DELETE',
        headers: getHeaders()
    });

    location.reload()
}