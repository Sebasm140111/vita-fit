document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#form-sugerencias').forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nombre = form.querySelector('#nombre-sugerencia').value;
            const sugerencia = form.querySelector('#sugerencia').value;

            try {
                const response = await fetch('/api/sugerencias', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nombre, sugerencia }),
                });

                if (!response.ok) {
                    throw new Error('Error al enviar la sugerencia');
                }

                form.reset();
                const confirmacion = form.nextElementSibling;
                confirmacion.textContent = 'Sugerencia enviada con éxito';
                setTimeout(() => {
                    confirmacion.textContent = '';
                }, 3000);
                cargarSugerencias();
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });

    // Función para cargar sugerencias
    async function cargarSugerencias() {
        try {
            const response = await fetch('/api/sugerencias');
            const sugerencias = await response.json();

            document.querySelectorAll('#sugerencias-lista').forEach(lista => {
                lista.innerHTML = '';
                sugerencias.forEach(sug => {
                    const div = document.createElement('div');
                    div.classList.add('sugerencia-item');
                    div.innerHTML = `<strong>${sug.nombre}</strong>: ${sug.sugerencia}`;
                    lista.appendChild(div);
                });
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('section');
    const logoutItem = document.getElementById('logout-item');
    const registroItem = document.getElementById('registro-item');
    const loginItem = document.getElementById('login-item');
    const objetivoItem = document.getElementById('objetivo-item');
    const calculadoraItem = document.getElementById('calculadora-item');
    const alimentosItem = document.getElementById('alimentos-item');
    const registroError = document.getElementById('registro-error');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetSection = this.getAttribute('data-section');

            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            navLinks.forEach(nav => {
                if (nav === this) {
                    nav.classList.add('active');
                } else {
                    nav.classList.remove('active');
                }
            });
        });
    });

    document.getElementById('form-registro').addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const peso = document.getElementById('peso').value;
        const altura = document.getElementById('altura').value;
        const objetivo = document.getElementById('objetivo').value;
        const password = document.getElementById('password').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, peso, altura, objetivo, password }),
        })
        .then(response => response.text())
        .then(data => {
            if (data === "El email ya está en uso") {
                registroError.textContent = data;
            } else {
                alert(data);
                registroError.textContent = "";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    document.getElementById('form-login').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            if (data === "Inicio de sesión exitoso") {
                hideLoginRegister();
                showAuthenticatedOptions();
                loadUserObjective();
                sections.forEach(section => {
                    if (section.id === "objetivo") {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });

                navLinks.forEach(nav => {
                    if (nav.getAttribute('data-section') === "objetivo") {
                        nav.classList.add('active');
                    } else {
                        nav.classList.remove('active');
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('/logout', {
            method: 'POST',
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            showLoginRegister();
            hideAuthenticatedOptions();
            sections.forEach(section => {
                if (section.id === "inicio") {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            navLinks.forEach(nav => {
                if (nav.getAttribute('data-section') === "inicio") {
                    nav.classList.add('active');
                } else {
                    nav.classList.remove('active');
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    function hideLoginRegister() {
        registroItem.style.display = 'none';
        loginItem.style.display = 'none';
    }

    function showLoginRegister() {
        registroItem.style.display = 'block';
        loginItem.style.display = 'block';
    }

    function showAuthenticatedOptions() {
        objetivoItem.style.display = 'block';
        calculadoraItem.style.display = 'block';
        alimentosItem.style.display = 'block';
        logoutItem.style.display = 'block';
    }

    function hideAuthenticatedOptions() {
        objetivoItem.style.display = 'none';
        calculadoraItem.style.display = 'none';
        alimentosItem.style.display = 'none';
        logoutItem.style.display = 'none';
    }

    function loadUserObjective() {
        fetch('/objetivo')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                let objetivoHTML = `<h3>Objetivo: ${data.objetivo.charAt(0).toUpperCase() + data.objetivo.slice(1)}</h3>`;
                let rutinaHTML = "<h3>Rutina Semanal</h3><table class='routine-table'><thead><tr><th>Día</th><th>Ejercicios</th></tr></thead><tbody>";
                Object.keys(data.rutina).forEach(dia => {
                    rutinaHTML += `<tr><td>${dia.charAt(0).toUpperCase() + dia.slice(1)}</td><td>${data.rutina[dia].join(", ")}</td></tr>`;
                });
                rutinaHTML += "</tbody></table>";
                document.getElementById('contenido-objetivo').innerHTML = objetivoHTML + rutinaHTML;
            })
            .catch(error => {
                document.getElementById('contenido-objetivo').innerHTML = `Error al cargar el objetivo y la rutina: ${error.message}`;
                console.error('Error:', error);
            });
    }

    document.getElementById('form-calculadora').addEventListener('submit', function(e) {
        e.preventDefault();
        const peso = document.getElementById('peso-calc').value;
        const altura = document.getElementById('altura-calc').value;
        const edad = document.getElementById('edad').value;
        const genero = document.getElementById('genero').value;

        let calorias;
        if (genero === 'masculino') {
            calorias = 10 * peso + 6.25 * altura - 5 * edad + 5;
        } else {
            calorias = 10 * peso + 6.25 * altura - 5 * edad - 161;
        }

        document.getElementById('resultado-calculadora').textContent = `Calorías diarias: ${calorias}`;
    });

    //const alimentos = {
    //    "manzana": 52,
    //    "queso": 402,
    //    "platano": 89,
    //    "naranja": 47,
    //    "pera": 57,
    //    "uva": 69,
    //    "sandia": 30,
    //    "fresa": 32,
    //    "pollo": 165,
    //    "ternera": 250,
    //    "salmon": 208,
    //    "arroz": 130,
    //    "pasta": 131,
    //    "pan": 265
    //};

    const alimentos = {
        "manzana": 52,
        "queso": 402,
        "platano": 89,
        "naranja": 47,
        "pera": 57,
        "uva": 69,
        "sandia": 30,
        "fresa": 32,
        "pollo": 165,
        "ternera": 250,
        "salmon": 208,
        "arroz": 130,
        "pasta": 131,
        "pan": 265,
        "huevo": 155,
        "leche": 42,
        "yogur": 59,
        "almendra": 576,
        "nuez": 654,
        "aguacate": 160,
        "tomate": 18,
        "lechuga": 15,
        "pepino": 16,
        "zanahoria": 41,
        "brocoli": 34,
        "espinaca": 23,
        "papa": 77,
        "camote": 86,
        "quinoa": 120,
        "lentejas": 116,
        "garbanzos": 164,
        "frijoles": 347,
        "aceite de oliva": 884,
        "mantequilla": 717,
        "miel": 304,
        "azucar": 387,
        "chocolate": 546,
        "cafe": 2,
        "te": 1,
        "hamburguesa": 295,
        "pizza": 266,
        "hot dog": 290,
        "papas fritas": 312,
        "donut": 452,
        "helado": 207,
        "refresco": 150,
        "nachos": 346,
        "burrito": 290,
        "tacos": 226,
        "pollo frito": 246,
        "chips de tortilla": 489,
        "chocolate con leche": 535,
        "pastel de chocolate": 371,
        "galletas de chocolate": 502,
        "cereal azucarado": 379,
        "bebida energética": 45,
        "malteada": 360,
        "empanada": 250,
        "croissant": 406,
        "chirimoya": 75,
        "guanabana": 66,
        "jengibre": 80,
        "durian": 147,
        "rambutan": 68,
        "kale": 49,
        "alga nori": 35,
        "tempeh": 193,
        "jackfruit": 95,
        "pitaya": 50,
        "carambola": 31,
        "maca": 325,
        "goji berries": 349,
        "azufaifo": 79,
        "longan": 60,
        "ackee": 151,
        "litchi": 66,
        "mangostan": 73,
        "bocadillo de jícama": 38,
        "zapote negro": 45,
        "araruta": 65,
        "kamut": 335,
        "freekeh": 352,
        "amaranth": 371,
        "teff": 367,
        "mijo": 378,
        "fonio": 364,
        "yuca": 160,
        "taro": 142,
        "ñame": 118,
        "palmito": 32,
        "huitlacoche": 43,
        "miso": 198,
        "natto": 212,
        "seitan": 370
    };


    document.getElementById('buscar-btn').addEventListener('click', function() {
        const alimento = document.getElementById('buscar-alimento').value.toLowerCase();
        const calorias = alimentos[alimento];
        if (calorias) {
            document.getElementById('resultado-alimentos').textContent = `Calorías de ${alimento.charAt(0).toUpperCase() + alimento.slice(1)}: ${calorias} cal por 100g`;
        } else {
            document.getElementById('resultado-alimentos').textContent = `Alimento no encontrado.`;
        }
    });
});
