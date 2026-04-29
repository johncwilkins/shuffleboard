import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log("engine.js loaded");

window.engine = (function () {
    let scene;
    let camera;
    let renderer;
    let controls;
    let container;
    let objectMap = {};
    let dotNetHelper = null;
    let raycaster;
    let mouse;
    let modelRoot = null;

    function init(containerId, modelUrl, dotNetRef) {
        console.log("engine.init called", containerId, modelUrl);
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        dotNetHelper = dotNetRef;

        container = document.getElementById(containerId);
        if (!container) {
            console.error("Container not found:", containerId);
            return;
        }

        container.innerHTML = "";

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x202020);

        camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(3, 3, 6);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const directional = new THREE.DirectionalLight(0xffffff, 1.5);
        directional.position.set(5, 10, 7);
        scene.add(directional);

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        renderer.domElement.tabIndex = 0;
        renderer.domElement.style.outline = "none";

        renderer.domElement.addEventListener("click", onMouseClick);
        renderer.domElement.addEventListener("mousemove", onMouseMove);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("resize", onResize);
        renderer.domElement.addEventListener("mouseenter", onMouseEnter);
        renderer.domElement.addEventListener("mouseleave", onMouseLeave);

        loadModel(modelUrl);

        animate();
    }

    function loadModel(url) {
        const loader = new GLTFLoader();

        loader.load(
            url,
            (gltf) => {
                const root = gltf.scene;
                modelRoot = root;
                scene.add(root);

                objectMap = {};

                root.traverse((obj) => {
                    if (obj.name) {
                        objectMap[obj.name] = obj;
                    }
                });
                console.log("Model loaded");
                console.log("Object map:", objectMap);

                frameModel(root);
                reportObjectStates();
            },
            undefined,
            (error) => {
                console.error("Failed to load model:", error);
            }
        );
    }

    function frameModel(root) {
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        root.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * Math.PI / 180;
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.8;

        camera.position.set(cameraZ * 0.6, cameraZ * 0.4, cameraZ);
        controls.target.set(0, 0, 0);
        controls.update();
    }

    function applyCamera(cameraState) {
        if (!cameraState || !camera) {
            return;
        }

        camera.position.set(cameraState.x, cameraState.y, cameraState.z);
        camera.fov = cameraState.fov;
        camera.updateProjectionMatrix();

        if (controls) {
            controls.target.set(cameraState.tx, cameraState.ty, cameraState.tz);
            controls.update();
        } else {
            camera.lookAt(cameraState.tx, cameraState.ty, cameraState.tz);
        }
    }

    function setPosition(name, x, y, z) {
        const obj = objectMap[name];
        if (!obj) {
            console.warn("Object not found:", name);
            return;
        }

        obj.position.set(x, y, z);
    }

    function setRotation(name, rx, ry, rz) {
        const obj = objectMap[name];
        if (!obj) {
            console.warn("Object not found:", name);
            return;
        }

        obj.rotation.set(rx, ry, rz);
    }

    function applyFrame(frame) {
        if (!frame) {
            console.warn("applyFrame received null frame");
            return;
        }

        if (frame.objects && Array.isArray(frame.objects)) {
            for (const state of frame.objects) {
                const obj = objectMap[state.name];
                if (!obj) {
                    continue;
                }

                obj.position.set(state.x, state.y, state.z);
                obj.rotation.set(state.rx, state.ry, state.rz);
            }
        }

        if (frame.camera) {
            applyCamera(frame.camera);
        }
    }

    function onKeyDown(event) {
        if (!dotNetHelper) return;

        dotNetHelper.invokeMethodAsync("OnKeyDown", event.key)
            .catch(err => console.error("OnKeyDown failed:", err));
    }

    function onKeyUp(event) {
        if (!dotNetHelper) return;

        dotNetHelper.invokeMethodAsync("OnKeyUp", event.key)
            .catch(err => console.error("OnKeyUp failed:", err));
    }

    function onMouseClick(event) {
        if (!dotNetHelper || !renderer || !camera || !modelRoot) return;

        const rect = renderer.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // still report raw click position
        dotNetHelper.invokeMethodAsync("OnMouseClick", x, y)
            .catch(err => console.error("OnMouseClick failed:", err));

        // normalized device coordinates for raycasting
        mouse.x = (x / rect.width) * 2 - 1;
        mouse.y = -(y / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(modelRoot, true);

        if (intersects.length > 0) {
            const picked = intersects[0].object;
            const objectName = picked.name || "(unnamed object)";

            console.log("Picked object:", objectName);

            dotNetHelper.invokeMethodAsync("OnObjectPicked", objectName)
                .catch(err => console.error("OnObjectPicked failed:", err));
        } else {
            dotNetHelper.invokeMethodAsync("OnObjectPicked", "(none)")
                .catch(err => console.error("OnObjectPicked failed:", err));
        }
    }

    function onResize() {
        if (!container || !camera || !renderer) return;

        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (controls) {
            controls.update();
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    function reportObjectStates() {
        if (!dotNetHelper) return;

        const states = Object.values(objectMap).map(obj => ({
            name: obj.name,
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
            rx: obj.rotation.x,
            ry: obj.rotation.y,
            rz: obj.rotation.z
        }));

        dotNetHelper.invokeMethodAsync("OnModelObjectsLoaded", states)
            .catch(err => console.error("OnModelObjectsLoaded failed:", err));
    }
    function onMouseMove(event) {
        if (!dotNetHelper || !renderer || !camera) return;

        const rect = renderer.domElement.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;

        // normalized device coords
        mouse.x = (px / rect.width) * 2 - 1;
        mouse.y = -(py / rect.height) * 2 + 1;

        // optional: raycast for world position
        raycaster.setFromCamera(mouse, camera);

        let wx = 0, wy = 0, wz = 0;
        let hit = false;

        if (modelRoot) {
            const intersects = raycaster.intersectObject(modelRoot, true);

            if (intersects.length > 0) {
                const p = intersects[0].point;
                wx = p.x;
                wy = p.y;
                wz = p.z;
                hit = true;
            }
        }
        dotNetHelper.invokeMethodAsync(
            "OnMouseMove",
            px, py,
            wx, wy, wz,
            hit
        ).catch(err => console.error("OnMouseMove failed:", err));
    }

        function onMouseEnter() {
            if (!dotNetHelper) return;

            dotNetHelper.invokeMethodAsync("OnMouseOverCanvas", true)
                .catch(err => console.error("OnMouseOverCanvas failed:", err));
        }

        function onMouseLeave() {
            if (!dotNetHelper) return;

            dotNetHelper.invokeMethodAsync("OnMouseOverCanvas", false)
                .catch(err => console.error("OnMouseOverCanvas failed:", err));
        }


    

    return {
        init,
        setPosition,
        setRotation,
        applyFrame
    };
})();