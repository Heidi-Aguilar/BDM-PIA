const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const selectPhotoBtn = document.querySelector('.btn-select-photo');
const inputFoto = document.querySelector('.input-foto');
const photoPreview = document.querySelector('.photoPreview');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

selectPhotoBtn.addEventListener('click', () => {
  inputFoto.click();
});

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