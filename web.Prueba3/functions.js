const API_URL = 'http://localhost:3000/api/objetos';

// Función para subir un modelo
async function subirModelo(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('modelo_3d', document.getElementById('modelo_3d').files[0]);
    formData.append('textura', document.getElementById('textura').files[0]);

    const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        alert('Modelo subido con éxito');
        cargarModelos();
    } else {
        alert('Error al subir el modelo');
    }
}

document.getElementById('uploadForm').addEventListener('submit', subirModelo);

// Función para cargar los modelos disponibles
async function cargarModelos() {
    const response = await fetch(API_URL);
    const modelos = await response.json();
    const container = document.getElementById('modelosContainer');
    container.innerHTML = '';

    modelos.forEach(modelo => {
        const card = document.createElement('div');
        card.className = 'card p-4 border border-gray-300 rounded-lg shadow-lg bg-white';
        card.innerHTML = `
            <h3 class='text-xl font-bold mb-2 text-gray-700'>${modelo.nombre}</h3>
            <p class='text-gray-600 mb-4'>${modelo.descripcion}</p>
            <div class="viewer bg-gray-900 flex justify-center items-center rounded-lg overflow-hidden" id="viewer-${modelo.id}"></div>
            <button class='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition' onclick="visualizarModelo(${modelo.id}, 'viewer-${modelo.id}')">Ver Modelo</button>
        `;
        container.appendChild(card);
    });
}

// Función para visualizar un modelo en Three.js con mejor iluminación y texturas
async function visualizarModelo(id, containerId) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        alert('Error al cargar el modelo');
        return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI;

    // Iluminación mejorada
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Cargar modelo con o sin texturas
    const objLoader = new THREE.OBJLoader();
    const mtlLoader = new THREE.MTLLoader();

    mtlLoader.load(`/ruta/a/la/textura-${id}.mtl`, (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(url, (object) => {
            object.traverse((child) => {
                if (child.isMesh && !child.material.map) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.5,
                        metalness: 0.5,
                    });
                }
            });
            scene.add(object);
            animate();
        }, undefined, (error) => {
            console.error('Error al cargar el modelo:', error);
            alert('Error al visualizar el modelo. Revisa la consola para más detalles.');
        });
    }, undefined, (error) => {
        console.error('No se encontró textura, cargando modelo sin textura:', error);
        objLoader.load(url, (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.5,
                        metalness: 0.5,
                    });
                }
            });
            scene.add(object);
            animate();
        }, undefined, (error) => {
            console.error('Error al cargar el modelo:', error);
            alert('Error al visualizar el modelo. Revisa la consola para más detalles.');
        });
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
}

// Cargar modelos al inicio
cargarModelos();
