  // Sincronizar categorías dinámicamente desde localStorage por foro
  function renderCategoriasForo() {
    const foroCatKey = 'categoriasForo_' + window.location.pathname.split('/').pop().replace('.html', '');
    let cats = [];
    try { cats = JSON.parse(localStorage.getItem(foroCatKey)) || []; } catch(e) { cats = []; }
    document.querySelectorAll('.select-categoria').forEach(select => {
      // Guardar valor actual
      const prev = select.value;
      // Limpiar opciones
      select.innerHTML = '<option value="" disabled selected>Selecciona categoría</option>';
      cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });
      // Restaurar valor si existe
      if (prev && cats.includes(prev)) select.value = prev;
    });
  }

  // Inicializar categorías al cargar
  renderCategoriasForo();
  // Actualizar categorías si cambian en otra pestaña
  window.addEventListener('storage', function(e) {
    const foroCatKey = 'categoriasForo_' + window.location.pathname.split('/').pop().replace('.html', '');
    if (e.key === foroCatKey) renderCategoriasForo();
  });
// Funcionalidad para publicar comentarios en todos los foros

document.addEventListener('DOMContentLoaded', function() {
  // Determinar clave única de publicaciones para este foro
  const foroKey = (() => {
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    return 'publicacionesForo_' + file;
  })();

  // Actualizar publicaciones aceptadas en tiempo real si cambia localStorage
  window.addEventListener('storage', function(e) {
    if (e.key === foroKey) {
      document.querySelectorAll('.publicacion[data-dinamica="1"]').forEach(pub => pub.remove());
      renderPublicacionesAceptadas();
    }
  });
  // Mostrar publicaciones aceptadas al cargar
  function renderPublicacionesAceptadas() {
    let publicaciones = [];
    try {
      publicaciones = JSON.parse(localStorage.getItem(foroKey)) || [];
    } catch (e) { publicaciones = []; }
    const aceptadas = publicaciones.filter(pub => pub.estado === 'aceptada');
  // Eliminar publicaciones dinámicas previas antes de renderizar
  document.querySelectorAll('.publicacion[data-dinamica="1"]').forEach(pub => pub.remove());
  // Insertar publicaciones dinámicas después del título 'Publicaciones recientes'
  const publicacionesContainer = document.querySelectorAll('.container')[1];
  if (publicacionesContainer) {
    // Ordenar de más reciente a más antigua
    const aceptadasDesc = [...aceptadas].sort((a, b) => b.id - a.id);
    // Buscar el primer div.publicacion (estática)
    let firstStatic = publicacionesContainer.querySelector('.publicacion');
    aceptadasDesc.forEach(pub => {
      const publicacion = document.createElement('div');
      publicacion.className = 'publicacion';
      publicacion.setAttribute('data-dinamica', '1');
      let contenido = `<p><strong>${pub.usuario || 'Anónimo'}:</strong> ${pub.contenido}</p>`;
      if (pub.imagen) {
        contenido += `<img src='${pub.imagen}' alt='Imagen usuario' style='max-width:220px;display:block;margin:10px 0;border-radius:10px;'>`;
      }
      contenido += `<div class='publicacion-meta'>Publicado el ${pub.fecha}${pub.categoria ? ' | Categoría: ' + pub.categoria : ''}</div>`;
      publicacion.innerHTML = contenido;
      // Crear contenedor de acciones
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'publicacion-actions';
      actionsDiv.style.marginTop = '8px';
      // Botón Like
      const likeBtn = document.createElement('button');
      likeBtn.className = 'btn-like';
      likeBtn.style.marginRight = '10px';
      likeBtn.style.background = '#e0e0e0';
      likeBtn.style.border = 'none';
      likeBtn.style.borderRadius = '8px';
      likeBtn.style.cursor = 'pointer';
      likeBtn.style.padding = '6px 12px';
      likeBtn.innerHTML = '👍 <span class="like-count">0</span>';
      likeBtn.addEventListener('click', function() {
        const countSpan = likeBtn.querySelector('.like-count');
        let count = parseInt(countSpan.textContent) || 0;
        count++;
        countSpan.textContent = count;
        likeBtn.disabled = true;
        likeBtn.style.background = '#b2ffb2';
      });
      actionsDiv.appendChild(likeBtn);
      // Botón Eliminar (solo para publicaciones del usuario actual)
      if (pub.usuario === 'Tú') {
        const eliminarBtn = document.createElement('button');
        eliminarBtn.className = 'btn-eliminar-publicacion';
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.style.background = '#b00';
        eliminarBtn.style.color = '#fff';
        eliminarBtn.style.border = 'none';
        eliminarBtn.style.borderRadius = '8px';
        eliminarBtn.style.cursor = 'pointer';
        eliminarBtn.style.padding = '6px 12px';
        eliminarBtn.style.marginLeft = '10px';
        eliminarBtn.addEventListener('click', function() {
          // Eliminar del localStorage
          let publicaciones = [];
          try {
            publicaciones = JSON.parse(localStorage.getItem(foroKey)) || [];
          } catch (e) { publicaciones = []; }
          publicaciones = publicaciones.filter(p => p.id !== pub.id);
          localStorage.setItem(foroKey, JSON.stringify(publicaciones));
          // Eliminar del DOM
          publicacion.remove();
        });
        actionsDiv.appendChild(eliminarBtn);
      }
      // Botón Responder
      const responderBtn = document.createElement('button');
      responderBtn.className = 'btn-responder';
      responderBtn.textContent = 'Responder';
      responderBtn.addEventListener('click', function() {
        // Evitar múltiples cajas de respuesta
        if (publicacion.querySelector('.respuesta-box')) return;
        // Crear caja de respuesta
        const respuestaBox = document.createElement('div');
        respuestaBox.className = 'respuesta-box';
        respuestaBox.style.marginTop = '10px';
        respuestaBox.innerHTML = `
          <textarea placeholder=\"Escribe tu respuesta...\" style=\"width:100%;min-height:40px;resize:none;padding:8px;border-radius:8px;\"></textarea>
          <button class=\"btn-enviar-respuesta\" style=\"margin-top:5px;background:#0f4a00;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;\">Enviar</button>
        `;
        publicacion.appendChild(respuestaBox);
        // Evento para enviar respuesta
        respuestaBox.querySelector('.btn-enviar-respuesta').addEventListener('click', function() {
          const textarea = respuestaBox.querySelector('textarea');
          const texto = textarea.value.trim();
          if (!texto) {
            textarea.focus();
            textarea.placeholder = '¡Escribe una respuesta!';
            return;
          }
          // Crear comentario de respuesta
          const respuesta = document.createElement('div');
          respuesta.className = 'comentario-respuesta';
          respuesta.style.margin = '8px 0 0 0';
          respuesta.style.padding = '8px 12px';
          respuesta.style.background = '#f3f3f3';
          respuesta.style.borderRadius = '8px';
          respuesta.innerHTML = `<strong>Tú respondiste:</strong> ${texto}`;
          // Botón eliminar para la respuesta
          const eliminarRespuestaBtn = document.createElement('button');
          eliminarRespuestaBtn.textContent = 'Eliminar';
          eliminarRespuestaBtn.className = 'btn-eliminar-respuesta';
          eliminarRespuestaBtn.style.background = '#b00';
          eliminarRespuestaBtn.style.color = '#fff';
          eliminarRespuestaBtn.style.border = 'none';
          eliminarRespuestaBtn.style.borderRadius = '8px';
          eliminarRespuestaBtn.style.cursor = 'pointer';
          eliminarRespuestaBtn.style.padding = '4px 10px';
          eliminarRespuestaBtn.style.marginLeft = '10px';
          eliminarRespuestaBtn.addEventListener('click', function() {
            respuesta.remove();
          });
          respuesta.appendChild(eliminarRespuestaBtn);
          publicacion.appendChild(respuesta);
          respuestaBox.remove();
        });
      });
      actionsDiv.appendChild(responderBtn);
      publicacion.appendChild(actionsDiv);
      // Insertar antes del primer div.publicacion (estática), o al final si no hay
      if (firstStatic) {
        publicacionesContainer.insertBefore(publicacion, firstStatic);
      } else {
        publicacionesContainer.appendChild(publicacion);
      }
    });
  }
  }
  renderPublicacionesAceptadas();

  // Hacer funcionales los botones responder y like en publicaciones inventadas (estáticas)
  document.querySelectorAll('.publicacion:not([data-dinamica="1"])').forEach(function(pub) {
    // Botón responder
    const responderBtn = pub.querySelector('.btn-responder');
    if (responderBtn && !responderBtn.dataset.listener) {
      responderBtn.addEventListener('click', function() {
        if (pub.querySelector('.respuesta-box')) return;
        const respuestaBox = document.createElement('div');
        respuestaBox.className = 'respuesta-box';
        respuestaBox.style.marginTop = '10px';
        respuestaBox.innerHTML = `
          <textarea placeholder="Escribe tu respuesta..." style="width:100%;min-height:40px;resize:none;padding:8px;border-radius:8px;"></textarea>
          <button class="btn-enviar-respuesta" style="margin-top:5px;background:#0f4a00;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;">Enviar</button>
        `;
        pub.appendChild(respuestaBox);
        respuestaBox.querySelector('.btn-enviar-respuesta').addEventListener('click', function() {
          const textarea = respuestaBox.querySelector('textarea');
          const texto = textarea.value.trim();
          if (!texto) {
            textarea.focus();
            textarea.placeholder = '¡Escribe una respuesta!';
            return;
          }
          const respuesta = document.createElement('div');
          respuesta.className = 'comentario-respuesta';
          respuesta.style.margin = '8px 0 0 0';
          respuesta.style.padding = '8px 12px';
          respuesta.style.background = '#f3f3f3';
          respuesta.style.borderRadius = '8px';
          respuesta.innerHTML = `<strong>Tú respondiste:</strong> ${texto}`;
          // Botón eliminar para la respuesta
          const eliminarRespuestaBtn = document.createElement('button');
          eliminarRespuestaBtn.textContent = 'Eliminar';
          eliminarRespuestaBtn.className = 'btn-eliminar-respuesta';
          eliminarRespuestaBtn.style.background = '#b00';
          eliminarRespuestaBtn.style.color = '#fff';
          eliminarRespuestaBtn.style.border = 'none';
          eliminarRespuestaBtn.style.borderRadius = '8px';
          eliminarRespuestaBtn.style.cursor = 'pointer';
          eliminarRespuestaBtn.style.padding = '4px 10px';
          eliminarRespuestaBtn.style.marginLeft = '10px';
          eliminarRespuestaBtn.addEventListener('click', function() {
            respuesta.remove();
          });
          respuesta.appendChild(eliminarRespuestaBtn);
          pub.appendChild(respuesta);
          respuestaBox.remove();
        });
      });
      responderBtn.dataset.listener = 'true';
    }
    // Botón like
    if (!pub.querySelector('.btn-like')) {
      const actions = pub.querySelector('.publicacion-actions');
      if (actions) {
        const likeBtn = document.createElement('button');
        likeBtn.className = 'btn-like';
        likeBtn.style.marginRight = '10px';
        likeBtn.style.background = '#e0e0e0';
        likeBtn.style.border = 'none';
        likeBtn.style.borderRadius = '8px';
        likeBtn.style.cursor = 'pointer';
        likeBtn.style.padding = '6px 12px';
        likeBtn.innerHTML = '👍 <span class="like-count">0</span>';
        likeBtn.addEventListener('click', function() {
          const countSpan = likeBtn.querySelector('.like-count');
          let count = parseInt(countSpan.textContent) || 0;
          count++;
          countSpan.textContent = count;
          likeBtn.disabled = true;
          likeBtn.style.background = '#b2ffb2';
        });
        actions.insertBefore(likeBtn, actions.firstChild);
      }
    }
  });
  // Exponer la función para que pueda ser llamada desde admin-publicaciones-aceptar.js
  window.renderPublicacionesAceptadas = renderPublicacionesAceptadas;
  // Funcionalidad de buscador
  const buscador = document.querySelector('.busqueda');
  if (buscador) {
    buscador.addEventListener('input', function() {
      const texto = buscador.value.trim().toLowerCase();
      document.querySelectorAll('.publicacion').forEach(function(pub) {
        const contenido = pub.textContent.toLowerCase();
        if (contenido.includes(texto)) {
          pub.style.display = '';
        } else {
          pub.style.display = 'none';
        }
      });
    });
  }
  // ...el resto del código permanece igual...
  const publicarBtns = document.querySelectorAll('.btn-publicar');

  // Previsualización de imagen al seleccionar archivo
  document.querySelectorAll('.comentario-box input[type="file"]').forEach(function(fileInput) {
    let previewImg = null;
    fileInput.addEventListener('change', function() {
      const comentarioBox = fileInput.closest('.comentario-box');
      if (!comentarioBox) return;
      if (previewImg) previewImg.remove();
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImg = document.createElement('img');
          previewImg.src = e.target.result;
          previewImg.alt = 'Previsualización';
          previewImg.style.maxWidth = '180px';
          previewImg.style.maxHeight = '120px';
          previewImg.style.display = 'block';
          previewImg.style.margin = '10px 0 0 0';
          previewImg.style.borderRadius = '10px';
          // Insertar justo antes del área de texto
          const textarea = comentarioBox.querySelector('textarea');
          if (textarea) {
            comentarioBox.insertBefore(previewImg, textarea.nextSibling);
          } else {
            comentarioBox.appendChild(previewImg);
          }
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    });
    // Limpiar previsualización al publicar
    const publicarBtn = fileInput.closest('.comentario-box')?.querySelector('.btn-publicar');
    if (publicarBtn) {
      publicarBtn.addEventListener('click', function() {
        if (previewImg) previewImg.remove();
      });
    }
  });

  publicarBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const comentarioBox = btn.closest('.comentario-box');
      if (!comentarioBox) return;
      const textarea = comentarioBox.querySelector('textarea');
      const categoria = comentarioBox.querySelector('.select-categoria');
      const fileInput = comentarioBox.querySelector('input[type="file"]');
      const comentario = textarea.value.trim();
      if (!comentario) {
        textarea.focus();
        textarea.placeholder = '¡Escribe un comentario!';
        return;
      }
      // Imagen
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          finalizarPublicacion(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        finalizarPublicacion('');
      }
      function finalizarPublicacion(imagenDataUrl) {
        // Fecha y categoría
        const fecha = new Date();
        const fechaStr = fecha.toLocaleDateString('es-MX') + ' ' + fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'});
        let categoriaStr = '';
        let categoriaVal = '';
        if (categoria && categoria.value) {
          categoriaStr = ` | Categoría: ${categoria.value}`;
          categoriaVal = categoria.value;
        }
        // Guardar en localStorage para admin (estado: pendiente)
        let publicaciones = [];
        try {
          publicaciones = JSON.parse(localStorage.getItem(foroKey)) || [];
        } catch (e) { publicaciones = []; }
        publicaciones.push({
          id: Date.now(),
          usuario: 'Tú',
          contenido: comentario,
          categoria: categoriaVal,
          fecha: fechaStr,
          estado: 'pendiente',
          imagen: imagenDataUrl
        });
        localStorage.setItem(foroKey, JSON.stringify(publicaciones));
        // Mensaje de enviado a revisión
        let aviso = document.createElement('div');
        aviso.textContent = 'Tu publicación se ha enviado al administrador para su revisión.';
        aviso.style.background = '#e0ffe0';
        aviso.style.color = '#0a4a00';
        aviso.style.padding = '10px';
        aviso.style.margin = '10px 0';
        aviso.style.borderRadius = '8px';
        // Insertar aviso justo arriba del textarea dentro de la caja de comentario
        const textarea = comentarioBox.querySelector('textarea');
        if (textarea) {
          comentarioBox.insertBefore(aviso, textarea);
        } else {
          comentarioBox.insertBefore(aviso, comentarioBox.firstChild);
        }
        setTimeout(()=>{ aviso.remove(); }, 3500);
        textarea.value = '';
        if (fileInput) fileInput.value = '';
        if (categoria) categoria.selectedIndex = 0;
        // Limpiar solo publicaciones dinámicas (aceptadas previamente renderizadas)
        document.querySelectorAll('.publicacion[data-dinamica="1"]').forEach(pub => pub.remove());
        renderPublicacionesAceptadas();
      }
    });
  });

  // (Eliminada función duplicada, solo queda la versión principal arriba)
});
