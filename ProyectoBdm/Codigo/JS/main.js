// Oculta el degradado negro al llegar al final del scroll
window.addEventListener('scroll', function() {
	const scrollTop = window.scrollY || window.pageYOffset;
	const windowHeight = window.innerHeight;
	const docHeight = document.documentElement.scrollHeight;
	if (scrollTop + windowHeight >= docHeight - 2) {
		document.body.classList.add('hide-gradient');
	} else {
		document.body.classList.remove('hide-gradient');
	}
});
