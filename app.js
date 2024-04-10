import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let clock, mixers = [];
let currentAnimation = 0;
let switchTime = 10; // Switch every 10 seconds
let nextSwitch = switchTime;

function init() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -100, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
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

        mixer.clipAction(object.animations[0]).play();

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        if (mixers.length === 1) { // Add the first model to the scene
            scene.add(object);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixers[currentAnimation]) {
        mixers[currentAnimation].update(delta);
    }

    if (mixers.length > 1 && (nextSwitch -= delta) <= 0) {
        nextSwitch = switchTime;
        scene.remove(scene.children.find(child => child.type === 'Group'));

        currentAnimation = (currentAnimation + 1) % mixers.length;
        scene.add(mixers[currentAnimation].getRoot());
    }

    controls.update(); // Required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
