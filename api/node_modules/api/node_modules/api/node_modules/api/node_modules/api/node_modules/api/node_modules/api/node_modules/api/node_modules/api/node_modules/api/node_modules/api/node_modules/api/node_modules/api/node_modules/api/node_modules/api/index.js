const express = require('express');
const cors = require('cors');
require('dotenv').config();

const objetosRoutes = require('./routes/modelosRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/objetos', objetosRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
