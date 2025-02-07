const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables de entorno

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',     // Usuario de la base de datos
    host: process.env.DB_HOST || 'localhost',    // Host de la base de datos
    database: process.env.DB_NAME || 'realidad-aumentada', // Nombre de la base de datos
    password: process.env.DB_PASSWORD || '1510', // Contraseña
    port: process.env.DB_PORT || 5432,           // Puerto de conexión
});

pool.on('connect', () => {
    console.log('Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Error en la conexión a la base de datos', err);
    process.exit(-1);
});

module.exports = pool;