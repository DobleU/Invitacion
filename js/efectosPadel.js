// script.js

window.onload = function() {
	
    const player1 = document.querySelector('.player1');
    const player2 = document.querySelector('.player2');
	const logo = document.querySelector('.logoPadel');

 // Función para ajustar la escala del logo en función del tamaño de la ventana
    function adjustLogoScale() {
        if (window.innerWidth <= 768) {
            logo.style.transform = 'translate(-50%, -100%) scale(1)';
        } else {
            logo.style.transform = 'translate(-50%, -50%) scale(4)';
        }
    }

    // Añadir clase para desactivar animaciones en dispositivos móviles
    if (window.innerWidth <= 768) {
        //document.body.classList.add('no-animation');
       // adjustLogoScale();
    }
	else
	{
		
				// Animación de la primera jugadora
			setTimeout(() => {
				player1.style.transform =  'translate(-100%, -20%)';
			}, 500);

			// Animación de la segunda jugadora
			setTimeout(() => {
				player2.style.transform = 'translate(100%, -40%)';
			}, 3000);
			
			 // Animación del logo
			setTimeout(() => {
				logo.style.transform = 'translate(-50%, -50%) scale(4)';
			}, 5500);
			
	
	}

  
	
	 function reloadPage() {
            // Reload the page
            location.reload();
        }

        window.addEventListener('resize', function() {
            // Clear the timer if it's already set
            clearTimeout(window.resizeTimeout);
            // Set a new timer to reload the page after resizing is complete
            window.resizeTimeout = setTimeout(reloadPage, 500);
        });


    
	
	
	 

	
};
