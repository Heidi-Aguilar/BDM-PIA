// Gestión de publicaciones de foros en el panel admin
// Simulación: las publicaciones se leen de localStorage['publicacionesForo'] (array de objetos)
// Cada objeto: {usuario, contenido, categoria, fecha, id}

document.addEventListener('DOMContentLoaded', function() {
  const tbody = document.getElementById('tbody-publicaciones');
  if (!tbody) return;

  function cargarPublicaciones() {
    tbody.innerHTML = '';
    let publicaciones = [];
    try {
      publicaciones = JSON.parse(localStorage.getItem('publicacionesForo')) || [];
    } catch (e) { publicaciones = []; }
    publicaciones.forEach(pub => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${pub.usuario || 'Anónimo'}</td>
        <td>${pub.contenido}</td>
        <td>${pub.categoria || '-'}</td>
        <td>${pub.fecha}</td>
        <td>
          <button class="btn-eliminar-pub" data-id="${pub.id}" style="background:#b00;color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  cargarPublicaciones();

  tbody.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-eliminar-pub')) {
      const id = e.target.getAttribute('data-id');
      let publicaciones = JSON.parse(localStorage.getItem('publicacionesForo')) || [];
      publicaciones = publicaciones.filter(pub => pub.id != id);
      localStorage.setItem('publicacionesForo', JSON.stringify(publicaciones));
      cargarPublicaciones();
    }
  });
});
