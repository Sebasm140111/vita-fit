const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
}));

db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, email TEXT, peso INTEGER, altura INTEGER, objetivo TEXT, password TEXT)");
    db.run("CREATE TABLE sugerencias (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, sugerencia TEXT)");
});

app.post('/register', (req, res) => {
    const { nombre, email, peso, altura, objetivo, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            return res.status(500).send("Error al verificar el email");
        }
        if (row) {
            return res.status(400).send("El email ya está en uso");
        }

        db.run("INSERT INTO users (nombre, email, peso, altura, objetivo, password) VALUES (?, ?, ?, ?, ?, ?)", [nombre, email, peso, altura, objetivo, password], function (err) {
            if (err) {
                return res.status(500).send("Error al registrar usuario");
            }
            res.status(200).send("Usuario registrado exitosamente");
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) {
            return res.status(500).send("Error al iniciar sesión");
        }
        if (row) {
            req.session.userId = row.id;
            req.session.userObjetivo = row.objetivo;
            console.log("Sesión iniciada:", req.session);
            res.status(200).send("Inicio de sesión exitoso");
        } else {
            res.status(400).send("Credenciales incorrectas");
        }
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).send("No autorizado");
}

app.get('/objetivo', isAuthenticated, (req, res) => {
    console.log("Sesión en /objetivo:", req.session);
    const rutinas = {
        subir: {
            lunes: [
                "1. Sentadillas con barra<br>• 4 series de 6-8 repeticiones<br>• Descanso: 2-3 minutos entre series<br><a href='https://youtube.com/shorts/NHD0vH7XXgw?si=r7ZAQVEp_axxM6pz' target='_blank'>Ver Video</a>",
                "2. Peso muerto rumano<br>• 4 series de 8-10 repeticiones<br>• Descanso: 2-3 minutos entre series<br><a href='https://youtube.com/shorts/9z6AYqXkBbY?si=F4p9NbL9Sdym4osC' target='_blank'>Ver Video</a>",
                "3. Prensa de pierna<br>• 4 series de 10-12 repeticiones<br>• Descanso: 2-3 minutos entre series<br><a href='https://youtube.com/shorts/OT7gKslX6pA?si=q6PQxhg9FjBE0-JG' target='_blank'>Ver Video</a>",
                "4. Extensiones de cuadriceps<br>• 3 series de 12-15 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/ESxIZ13Uq6c?si=C8sLubvfe5daFVmG' target='_blank'>Ver Video</a>"
            ],
            martes: [
                "1. Press de banca con barra<br>o 4 series de 10-12 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=gRVjAtPip0Y' target='_blank'>Ver Video</a>",
                "2. Press inclinado con mancuernas<br>o 4 series de 10-12 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=6t_j-2dA5RI' target='_blank'>Ver Video</a>",
                "3. Aperturas con mancuernas<br>o 3 series de 12-15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=eozdVDA78K0' target='_blank'>Ver Video</a>",
                "4. Fondos en paralelas<br>o 3 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=2z8JmcrW-As' target='_blank'>Ver Video</a>"
            ],
            miercoles: [
                "1. Dominadas<br>o 4 series de 8-10 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=eGo4IYlbE5g' target='_blank'>Ver Video</a>",
                "2. Remo con barra<br>o 4 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=GZbfZ033f74' target='_blank'>Ver Video</a>",
                "3. Pullover con mancuerna<br>o 3 series de 12-15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=3K8T2R0mK1E' target='_blank'>Ver Video</a>"
            ],
            jueves: [
                "1. Press militar con barra<br>o 4 series de 8-10 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=2yjwXTZQDDI' target='_blank'>Ver Video</a>",
                "2. Elevaciones laterales con mancuernas<br>o 4 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=3VcKaXpzqRo' target='_blank'>Ver Video</a>",
                "3. Elevaciones frontales con mancuernas<br>o 3 series de 12-15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=-t7fuZ0KhDA' target='_blank'>Ver Video</a>",
                "4. Encogimientos de hombros con mancuernas<br>o 4 series de 12-15 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=Nu81NaTz0WU' target='_blank'>Ver Video</a>"
            ],
            viernes: [
                "1. Sentadillas frontales<br>• 4 series de 10-12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/nOilmCM2TPI?si=_ALZPL41eWCYfR8U' target='_blank'>Ver Video</a>",
                "2. Zancadas con barra o mancuernas<br>• 4 series de 10-12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/PP8o3mliQMY?si=SnaYX8-ZUV31b_E3' target='_blank'>Ver Video</a>",
                "3. Peso muerto convencional<br>• 4 series de 8-10 repeticiones<br>• Descanso: 2-3 minutos entre series<br><a href='https://youtube.com/shorts/rzpikhhtwwA?si=kwySW5ZbnmxdZcBx' target='_blank'>Ver Video</a>",
                "4. Curl de pierna sentado<br>• 3 series de 12-15 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/XG2XVE_VcTM?si=59NihM63lywsJMNT' target='_blank'>Ver Video</a>"
            ],
            sabado: ["Cardio ligero", "Abdominales"],
            domingo: ["Descanso"]
        },
        bajar: {
            lunes: [
                "1. Sentadillas con salto<br>• 4 series de 15 repeticiones<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/eGmFnqFNGfk?si=xeBL6kbxmJ9obAMp' target='_blank'>Ver Video</a>",
                "2. Zancadas caminando con mancuernas<br>• 4 series de 12 repeticiones por pierna<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/tsyHY_g6LpI?si=yg_-xqOLdmtfDbmt' target='_blank'>Ver Video</a>",
                "3. Step - ups en caja con mancuernas<br>• 3 series de 15 repeticiones por pierna<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/RMZYJXb5dog?si=UJdKLKP8519ITUrY' target='_blank'>Ver Video</a>",
                "4. Elevaciones de talones (gemelos) con peso corporal<br>• 4 series de 20 repeticiones<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/xpew3QSgUVw?si=inJ2r3OtUvi8xsjq' target='_blank'>Ver Video</a>"
            ],
            martes: [
                "1. Press de banca con barra<br>o 4 series de 10 - 12 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=gRVjAtPip0Y' target='_blank'>Ver Video</a>",
                "2. Flexiones<br>o 4 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=Eh00_rniF8E' target='_blank'>Ver Video</a>",
                "3. Aperturas con mancuernas<br>o 3 series de 12 - 15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=eozdVDA78K0' target='_blank'>Ver Video</a>",
                "4. Fondos en banco<br>o 3 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=6RHp6A_-1_o' target='_blank'>Ver Video</a>",
                "5. Extensiones de tríceps en polea<br>o 3 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=2-LAMcpzODU' target='_blank'>Ver Video</a>"
            ],
            miercoles: [
                "1. Dominadas asistidas o normales<br>o 4 series de 8 - 10 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=eGo4IYlbE5g' target='_blank'>Ver Video</a>",
                "2. Remo con mancuernas<br>o 4 series de 12 - 15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=KI8u58hPam4' target='_blank'>Ver Video</a>",
                "3. Pullover con mancuerna<br>o 3 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=3K8T2R0mK1E' target='_blank'>Ver Video</a>",
                "4. Curl de bíceps con mancuernas<br>o 3 series de 12 - 15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=in7PaeYlhrM' target='_blank'>Ver Video</a>"
            ],
            jueves: [
                "1. Press militar con mancuernas<br>o 4 series de 10 - 12 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=B-aVuyhvLHU' target='_blank'>Ver Video</a>",
                "2. Elevaciones laterales con mancuernas<br>o 4 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=3VcKaXpzqRo' target='_blank'>Ver Video</a>",
                "3. Elevaciones frontales con mancuernas<br>o 3 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=-t7fuZ0KhDA' target='_blank'>Ver Video</a>",
                "4. Encogimientos de hombros con mancuernas<br>o 4 series de 15 - 20 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=Nu81NaTz0WU' target='_blank'>Ver Video</a>"
            ],
            viernes: [
                "1. Sentadillas con barra<br>• 4 series de 10-12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/Ur-zj6AiO44?si=dtJvsjfJoyTvPwWr' target='_blank'>Ver Video</a>",
                "2. Peso muerto rumano con mancuernas<br>• 4 series de 12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/dTwLr-X419I?si=gY7QP6AxgGpblU9E' target='_blank'>Ver Video</a>",
                "3. Zancadas laterales<br>• 3 series de 15 repeticiones por pierna<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/DWVIigKu5oU?si=sfoxviwMbOspfevK' target='_blank'>Ver Video</a>",
                "4. Extensiones de cuadriceps<br>• 3 series de 15 repeticiones<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/RiWKdWsufUw?si=7Na7jIUuCdaqcPfq' target='_blank'>Ver Video</a>"
            ],
            sabado: ["Correr", "Saltos de tijera"],
            domingo: ["Descanso"]
        },
        mantener: {
            lunes: [
                "1. Sentadillas con barra<br>• 4 series de 8-10 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/NHD0vH7XXgw?si=j7LBX_tANWYDPBdU' target='_blank'>Ver Video</a>",
                "2. Peso muerto rumano<br>• 4 series de 10-12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/9z6AYqXkBbY?si=BwRP-3ScMb40UdAR' target='_blank'>Ver Video</a>",
                "3. Prensa de pierna<br>• 3 series de 12-15 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/OT7gKslX6pA?si=z3wspHl3rhEV20WN' target='_blank'>Ver Video</a>",
                "4. Extensiones de cuadriceps<br>• 3 series de 15 repeticiones<br>• Descanso: 1 minuto entre series<br><a href='https://youtube.com/shorts/FtXooCm3wdQ?si=Iq8WPXRlrV4IRvav' target='_blank'>Ver Video</a>",
                "5. Curl de pierna acostado<br>• 3 series de 15 repeticiones<br>• Descanso: 1 minuto entre series<br><a href='https://www.youtube.com/shorts/ipKwF8CmZt8' target='_blank'>Ver Video</a>"
            ],
            martes: [
                "1. Press de banca con barra<br>o 3 series de 8-10 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=gRVjAtPip0Y' target='_blank'>Ver Video</a>",
                "2. Press inclinado con mancuernas<br>o 3 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=6t_j-2dA5RI' target='_blank'>Ver Video</a>",
                "3. Aperturas con mancuernas<br>o 3 series de 12-15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=eozdVDA78K0' target='_blank'>Ver Video</a>",
                "4. Fondos en paralelas<br>o 3 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=2z8JmcrW-As' target='_blank'>Ver Video</a>"
            ],
            miercoles: [
                "1. Dominadas<br>o 4 series de 8-10 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=eGo4IYlbE5g' target='_blank'>Ver Video</a>",
                "2. Remo con barra<br>o 4 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=GZbfZ033f74' target='_blank'>Ver Video</a>",
                "3. Pullover con mancuerna<br>o 3 series de 12-15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=3K8T2R0mK1E' target='_blank'>Ver Video</a>"
            ],
            jueves: [
                "1. Press militar con barra<br>o 4 series de 8-10 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=2yjwXTZQDDI' target='_blank'>Ver Video</a>",
                "2. Elevaciones laterales con mancuernas<br>o 4 series de 10-12 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=3VcKaXpzqRo' target='_blank'>Ver Video</a>",
                "3. Elevaciones frontales con mancuernas<br>o 3 series de 12-15 repeticiones<br>o Descanso: 1 minuto<br><a href='https://www.youtube.com/watch?v=-t7fuZ0KhDA' target='_blank'>Ver Video</a>",
                "4. Encogimientos de hombros con mancuernas<br>o 4 series de 12-15 repeticiones<br>o Descanso: 1-2 minutos<br><a href='https://www.youtube.com/watch?v=Nu81NaTz0WU' target='_blank'>Ver Video</a>"
            ],
            viernes: [
                "1. Sentadillas frontales<br>• 4 series de 10-12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/nOilmCM2TPI?si=_ALZPL41eWCYfR8U' target='_blank'>Ver Video</a>",
                "2. Zancadas con barra o mancuernas<br>• 4 series de 10-12 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/PP8o3mliQMY?si=SnaYX8-ZUV31b_E3' target='_blank'>Ver Video</a>",
                "3. Peso muerto convencional<br>• 4 series de 8-10 repeticiones<br>• Descanso: 2-3 minutos entre series<br><a href='https://youtube.com/shorts/rzpikhhtwwA?si=kwySW5ZbnmxdZcBx' target='_blank'>Ver Video</a>",
                "4. Curl de pierna sentado<br>• 3 series de 12-15 repeticiones<br>• Descanso: 1-2 minutos entre series<br><a href='https://youtube.com/shorts/XG2XVE_VcTM?si=59NihM63lywsJMNT' target='_blank'>Ver Video</a>"
            ],
            sabado: ["Cardio ligero", "Abdominales"],
            domingo: ["Descanso"]
        }
    };


    const objetivo = req.session.userObjetivo;
    if (rutinas[objetivo]) {
        res.json({ objetivo: objetivo, rutina: rutinas[objetivo] });
    } else {
        res.status(400).send("Objetivo no reconocido");
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error al cerrar sesión");
        }
        res.status(200).send("Cierre de sesión exitoso");
    });
});

app.post('/api/sugerencias', (req, res) => {
    const { nombre, sugerencia } = req.body;
    db.run("INSERT INTO sugerencias (nombre, sugerencia) VALUES (?, ?)", [nombre, sugerencia], function (err) {
        if (err) {
            return res.status(500).send("Error al guardar sugerencia");
        }
        res.status(200).send("Sugerencia enviada con éxito");
    });
});

app.get('/api/sugerencias', (req, res) => {
    db.all("SELECT * FROM sugerencias", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error al obtener sugerencias");
        }
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
