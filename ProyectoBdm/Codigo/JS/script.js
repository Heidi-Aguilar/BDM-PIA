const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const selectPhotoBtn = document.querySelector('.btn-select-photo');
const inputFoto = document.querySelector('.input-foto');
const photoPreview = document.querySelector('.photoPreview');

registerBtn && registerBtn.addEventListener('click', () => {
  container.classList.add('active');
});

loginBtn && loginBtn.addEventListener('click', () => {
  container.classList.remove('active');
});

if (selectPhotoBtn && inputFoto && photoPreview) {
  selectPhotoBtn.addEventListener('click', () => inputFoto.click());

  inputFoto.addEventListener('change', () => {
    if (inputFoto.files && inputFoto.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(inputFoto.files[0]);
    }
  });
}

// Utility
function showError(input, message) {
  if (!input) return;
  let errorDiv = input.parentElement.querySelector('.error-msg');
  if (!errorDiv) {
    // try next sibling
    errorDiv = input.nextElementSibling;
    while (errorDiv && !errorDiv.classList.contains('error-msg')) {
      errorDiv = errorDiv.nextElementSibling;
    }
  }
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    input.classList.add('input-error');
  }
}

function clearErrors(form) {
  if (!form) return;
  const errors = form.querySelectorAll('.error-msg');
  errors.forEach(err => {
    err.textContent = '';
    err.style.display = 'none';
  });
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('input-error'));
}

function getUsersKey() { return 'app_users_v1'; }

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.form-box.login form');
  const registerForm = document.querySelector('.form-box.register form');

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(loginForm);
      const emailInput = loginForm.querySelector('#correoInicioSesion');
      const passwordInput = loginForm.querySelector('#passwordInicioSesion');
      let valid = true;
      if (!emailInput.value || !emailInput.value.includes('@')) {
        showError(emailInput, 'Por favor, ingresa un correo válido.');
        valid = false;
      }
      if (!passwordInput.value || passwordInput.value.length < 8) {
        showError(passwordInput, 'La contraseña debe tener al menos 8 caracteres.');
        valid = false;
      }
      if (!valid) return;

      const users = JSON.parse(localStorage.getItem(getUsersKey()) || '[]');
      const found = users.find(u => u.email.toLowerCase() === emailInput.value.toLowerCase() && u.password === passwordInput.value);
      if (!found) {
        showError(emailInput, 'Credenciales incorrectas');
        showError(passwordInput, ' ');
        return;
      }

      localStorage.setItem('sesionIniciada', 'true');
      localStorage.setItem('currentUser', JSON.stringify(found));
      window.location.href = '../HTML/principal.html';
    });
  }

  // REGISTER
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(registerForm);

      const nombres = registerForm.querySelector('.input-nombres');
      const apellidoP = registerForm.querySelector('.input-apellidoP');
      const apellidoM = registerForm.querySelector('.input-apellidoM');
      const emailInput = registerForm.querySelector('.input-email');
      const passwordInput = registerForm.querySelector('.input-password');
      const pwMsg = registerForm.querySelector('.pwMsg');
      const fechaNacimiento = registerForm.querySelector('.input-fechaNacimiento');

      let isValid = true;
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

      if (!nombres.value.trim()) { showError(nombres, 'Por favor, ingresa tu nombre.'); isValid = false; }
      if (!apellidoP.value.trim()) { showError(apellidoP, 'Por favor, ingresa tu apellido paterno.'); isValid = false; }
      if (!apellidoM.value.trim()) { showError(apellidoM, 'Por favor, ingresa tu apellido materno.'); isValid = false; }
      if (!emailInput.value || !emailInput.value.includes('@')) { showError(emailInput, 'Por favor, ingresa un correo válido.'); isValid = false; }
      if (!regex.test(passwordInput.value)) {
        pwMsg.textContent = 'Debe tener: 8 caracteres, mayúscula, minúscula, número y un carácter especial.';
        pwMsg.style.color = 'red';
        passwordInput.classList.add('input-error');
        isValid = false;
      } else {
        pwMsg.textContent = 'Contraseña válida ✅';
        pwMsg.style.color = 'green';
        passwordInput.classList.remove('input-error');
      }

      if (fechaNacimiento) {
        if (fechaNacimiento.value) {
          const hoy = new Date();
          const cumple = new Date(fechaNacimiento.value);
          let edad = hoy.getFullYear() - cumple.getFullYear();
          const mes = hoy.getMonth() - cumple.getMonth();
          if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) edad--;
          if (edad < 18) { showError(fechaNacimiento, 'Debes ser mayor de 18 años para registrarte.'); isValid = false; }
        } else { showError(fechaNacimiento, 'Por favor, ingresa tu fecha de nacimiento.'); isValid = false; }
      }

      if (!isValid) return;

          // crear objeto usuario con campos completos del formulario
          const firstNames = nombres.value.trim();
          const apellidoPVal = apellidoP.value.trim();
          const apellidoMVal = apellidoM.value.trim();
          const fullName = `${firstNames} ${apellidoPVal} ${apellidoMVal}`.trim();
          const email = emailInput.value.trim();
          const password = passwordInput.value;
          const role = 'user';
          const fechaNac = fechaNacimiento ? fechaNacimiento.value : '';
          const paisNacimientoEl = registerForm.querySelector('.input-paisNacimiento');
          const paisNacimiento = paisNacimientoEl ? paisNacimientoEl.value : '';
          const nacionalidadEl = registerForm.querySelector('.input-nacionalidad');
          const nacionalidad = nacionalidadEl ? nacionalidadEl.value : '';
          const generoEl = registerForm.querySelector('[name="genero"]');
          const genero = generoEl ? generoEl.value : '';
          // foto: si se cargó preview, usar dataURL
          const photo = (photoPreview && photoPreview.src && photoPreview.src.startsWith('data:')) ? photoPreview.src : null;

          const users = JSON.parse(localStorage.getItem(getUsersKey()) || '[]');
          const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
          if (exists) { showError(emailInput, 'El email ya está registrado'); return; }

          const newUser = {
            name: fullName,
            firstNames,
            apellidoP: apellidoPVal,
            apellidoM: apellidoMVal,
            email,
            password,
            role,
            fechaNacimiento: fechaNac,
            paisNacimiento,
            nacionalidad,
            genero,
            photo
          };
      users.push(newUser);
      localStorage.setItem(getUsersKey(), JSON.stringify(users));

  // signal other tabs that users changed
  try { localStorage.setItem('users_updated', Date.now().toString()); } catch (e) { /* ignore */ }
      // BroadcastChannel for same-tab/window updates
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('users_channel');
          bc.postMessage({ type: 'users_updated' });
          bc.close();
        }
      } catch (e) { /* ignore */ }

      // iniciar sesión automáticamente
      localStorage.setItem('sesionIniciada', 'true');
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      window.location.href = '../HTML/principal.html';
    });
  }
});
