document.addEventListener('DOMContentLoaded', function() {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('user-list');
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.email}</td>
                    <td>${user.peso}</td>
                    <td>${user.altura}</td>
                    <td>${user.objetivo}</td>
                `;
                userList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al obtener usuarios:', error);
        });
});
