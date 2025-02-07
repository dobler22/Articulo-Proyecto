const pool = require('../config/database');


const obtenerObjetos3D = async (req, res) => {
    console.log("🔍 Consultando modelos en la base de datos...");
    try {
        const result = await pool.query('SELECT id, nombre, descripcion FROM objetos_3d');
        console.log("✅ Modelos obtenidos:", result.rows);

        // 📌 Verificar si `res` existe antes de llamar `json`
        if (!res || typeof res.json !== 'function') {
            throw new Error("❌ El objeto 'res' no está definido o no es una respuesta HTTP válida.");
        }

        return res.json(result.rows);
    } catch (error) {
        console.error("❌ Error al obtener modelos:", error);

        // 📌 Verificar si `res` está disponible antes de usar `status`
        if (res && typeof res.status === 'function') {
            return res.status(500).json({ error: "Error al obtener los modelos desde la base de datos" });
        } else {
            throw error; // Si `res` no está definido, lanzar el error para depuración
        }
    }
};

// 🔽 Obtener un modelo por ID
const obtenerObjetoPorId = async (id) => {
    try {
        console.log(`🔍 Buscando modelo con ID: ${id}`);
        const result = await pool.query('SELECT modelo_3d FROM objetos_3d WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            console.log(`⚠️ Modelo con ID ${id} no encontrado.`);
            return { error: 'Modelo no encontrado' };
        }

        console.log("✅ Modelo encontrado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error al obtener modelo:", error);
        throw new Error("Error al obtener el modelo desde la base de datos");
    }
};

// 🔼 Subir un modelo 3D
const subirObjeto3D = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const modelo_3d = req.files['modelo_3d'][0].buffer;
        const textura = req.files['textura'] ? req.files['textura'][0].buffer : null;

        const result = await pool.query(
            `INSERT INTO objetos_3d (nombre, descripcion, modelo_3d, textura) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [nombre, descripcion, modelo_3d, textura]
        );

        console.log("✅ Modelo guardado con éxito:", result.rows[0]);
        res.json({ id: result.rows[0].id, mensaje: '✅ Modelo 3D guardado con éxito' });
    } catch (error) {
        console.error("❌ Error al guardar el modelo 3D:", error);
        res.status(500).json({ error: "Error al guardar el modelo 3D" });
    }
};

// ✅ Exportar correctamente las funciones
module.exports = {
    obtenerObjetos3D,
    obtenerObjetoPorId,
    subirObjeto3D
};
