// Gestión de aceptar publicaciones en admin

document.addEventListener('DOMContentLoaded', function() {
  const tbody = document.getElementById('tbody-publicaciones');
  if (!tbody) return;

  function cargarPublicaciones() {
    tbody.innerHTML = '';
    let publicaciones = [];
    // Buscar todas las claves de publicaciones de foros
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('publicacionesForo_')) {
        try {
          const arr = JSON.parse(localStorage.getItem(key)) || [];
          // Agregar el nombre del foro a cada publicación
          const foro = key.replace('publicacionesForo_', '');
          arr.forEach(pub => pub._foro = foro);
          publicaciones = publicaciones.concat(arr);
        } catch (e) {}
      }
    }
    publicaciones.forEach(pub => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${pub.usuario || 'Anónimo'}</td>
        <td>${pub.contenido}</td>
        <td>${pub.categoria || '-'}</td>
        <td>${pub.fecha}</td>
        <td>${pub._foro ? pub._foro : '-'}</td>
        <td>${pub.imagen ? `<img src="${pub.imagen}" alt="Imagen" style="max-width:80px;max-height:80px;display:block;margin:0 auto 4px auto;border-radius:6px;box-shadow:0 1px 4px #0002;">` : ''}</td>
        <td>
          <button class="btn-aceptar-pub" data-id="${pub.id}" data-foro="${pub._foro || ''}" style="background:#0f4a00;color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;${pub.estado==='aceptada'?'display:none;':''}">Aceptar</button>
          <button class="btn-eliminar-pub" data-id="${pub.id}" data-foro="${pub._foro || ''}" style="background:#b00;color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;">Eliminar</button>
          <span class="estado-pub" style="display:block;margin-top:6px;font-weight:bold;color:${pub.estado==='aceptada'?'#0a4a00':'#b00'};">${pub.estado==='aceptada'?'Aceptada':'Pendiente'}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  cargarPublicaciones();

  tbody.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-eliminar-pub')) {
      const id = e.target.getAttribute('data-id');
      const foro = e.target.getAttribute('data-foro');
      const key = 'publicacionesForo_' + foro;
      let publicaciones = JSON.parse(localStorage.getItem(key)) || [];
      publicaciones = publicaciones.filter(pub => pub.id != id);
      localStorage.setItem(key, JSON.stringify(publicaciones));
      cargarPublicaciones();
    }
    if (e.target.classList.contains('btn-aceptar-pub')) {
      const id = e.target.getAttribute('data-id');
      const foro = e.target.getAttribute('data-foro');
      const key = 'publicacionesForo_' + foro;
      let publicaciones = JSON.parse(localStorage.getItem(key)) || [];
      publicaciones = publicaciones.map(pub => pub.id == id ? {...pub, estado:'aceptada'} : pub);
      localStorage.setItem(key, JSON.stringify(publicaciones));
      cargarPublicaciones();
      // Forzar actualización en la ventana actual del foro
      window.dispatchEvent(new StorageEvent('storage', { key }));
    }
  });
});
