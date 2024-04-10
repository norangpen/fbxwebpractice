import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/FBXLoader.js';

let camera, scene, renderer, clock;
let mixers = [];
let currentAnimation = 0;
let switchTime = 10; // Switch every 10 seconds
let nextSwitch = switchTime;

function init() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Modify these values to adjust the camera's position and FOV
    const cameraFOV = 75;  // Field of View
    const cameraPositionZ = 100; // Distance from the scene along the Z-axis

    camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(100, 100, cameraPositionZ);


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 0).normalize();
    scene.add(directionalLight);

    const loader = new FBXLoader();
    loadFBXAnimation(loader, 'models/samba.fbx');
    loadFBXAnimation(loader, 'models/hiphop.fbx');

    window.addEventListener('resize', onWindowResize, false);
}

function loadFBXAnimation(loader, path) {
    loader.load(path, (object) => {
        const mixer = new THREE.AnimationMixer(object);
        mixers.push(mixer);

        const action = mixer.clipAction(object.animations[0]);
        action.play();

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        if (scene.children.length === 1) { // Assuming the first loaded animation is initially visible
            scene.add(object);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    mixers.forEach((mixer, index) => {
        if (index === currentAnimation) {
            mixer.update(delta);
        }
    });

    if (mixers.length > 1 && (nextSwitch -= delta) <= 0) {
        nextSwitch = switchTime;
        currentAnimation = (currentAnimation + 1) % mixers.length;

        // Swap the FBX models in the scene
        scene.remove(scene.children[1]); // Assuming the first child is a light
        scene.add(mixers[currentAnimation].getRoot());
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
