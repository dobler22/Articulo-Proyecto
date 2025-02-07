const express = require('express');
const multer = require('multer');
const objetosController = require('../controllers/modelosController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 📌 Definir rutas con logs en terminal
router.post('/', upload.fields([{ name: 'modelo_3d' }, { name: 'textura' }]), async (req, res) => {
    console.log('📥 Recibiendo solicitud para subir un modelo 3D...');
    try {
        const resultado = await objetosController.subirObjeto3D(req, res);
        console.log('✅ Modelo 3D guardado con éxito:', resultado);
    } catch (error) {
        console.error('❌ Error al subir el modelo 3D:', error);
    }
});

router.get('/', (req, res) => objetosController.obtenerObjetos3D(req, res));

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`🔍 Solicitando modelo 3D con ID: ${id}`);
    try {
        const modelo = await objetosController.obtenerObjetoPorId(id);
        if (modelo.error) {
            return res.status(404).json(modelo);
        }
        console.log('✅ Modelo obtenido:', modelo);
        res.set('Content-Type', 'application/octet-stream');
        res.send(modelo.modelo_3d);
    } catch (error) {
        console.error('❌ Error al obtener modelo:', error);
        res.status(500).json({ error: 'Error al obtener el modelo desde la base de datos' });
    }
});


module.exports = router;
