"use strict";
function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.outerWidth / window.outerHeight, 0.1, 1000);
camera.position.set(0, 1, 0);
camera.rotation.order = "YXZ";
//camera.rotation.x = -Math.PI/32;

const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.setSize(window.outerWidth, window.outerHeight);
document.body.appendChild(renderer.domElement);

const floorGeometry = new THREE.BoxGeometry(100, .1, 100);
const floorTex = new THREE.TextureLoader().load("images/floor.png");
floorTex.repeat.set(50, 50);
floorTex.wrapS = THREE.RepeatWrapping;
floorTex.wrapT = THREE.RepeatWrapping;
floorTex.magFilter = THREE.NearestFilter;
//const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const floorMat = new THREE.MeshStandardMaterial({
    map:floorTex, color: 0xFFFFFF, roughness:0.8, metalness:0.4, bumpScale:0.005
});
// const material = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
const floor = new THREE.Mesh(floorGeometry, floorMat);
scene.add(floor);


const textCanvas = document.createElement("canvas");
textCanvas.width = 800;
textCanvas.height = 400;
const textContext = textCanvas.getContext("2d");
textContext.fillStyle = "white";
textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
textContext.font = `80px Arial`;
textContext.fillStyle = "black";
textContext.textAlign = "center";
textContext.fillText("Tap anywhere to move", textCanvas.width / 2, textCanvas.height / 2);

const guideTex = new THREE.CanvasTexture(textCanvas);

const cubeGeo = new THREE.BoxGeometry(2,1,1);
//const cubeMat = new THREE.MeshStandardMaterial({
//    color: 0xFFFFFF, roughness:0.8, metalness:0.4, bumpScale:0.005
//});
const cubeMat = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF
});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(0,1,-4);
scene.add(cube);

const planeGeo = new THREE.PlaneGeometry(2, 1);
const planeMat = new THREE.MeshLambertMaterial({
    map:guideTex
});
const plane = new THREE.Mesh(planeGeo, planeMat);
cube.add(plane);
plane.position.z = 0.501;
//plane.

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(1, 1, -2).normalize();
scene.add(sun);

const pointLight = new THREE.PointLight(0xffffff, 10, 100);
pointLight.position.set(0, 4, -2);
scene.add(pointLight);


var keysHeld = {};
function getDir(plus, neg) {
    var dir = 0;
    if (keysHeld[plus]) {
        dir++;
    }
    if (keysHeld[neg]) {
        dir--;
    }
    return dir;
}
document.addEventListener("keydown", e => {
    if (e.repeat) { return; }
    keysHeld[e.code] = true;
})
document.addEventListener("keyup", e => {
    delete keysHeld[e.code];
})

var lastWindowSize = {width:window.outerHeight, height:window.outerHeight};
function updateAspectRatio() {
    camera.aspect = window.outerWidth / window.outerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.outerWidth, window.outerHeight);
    lastWindowSize.width = window.outerWidth;
    lastWindowSize.height = window.outerHeight;
}
//window.addEventListener("resize", () => {
//    setTimeout(updateAspectRatio, 0);
//    updateAspectRatio();
//});
const clock = new THREE.Clock();
const camClock = new THREE.Clock();
const zero3 = new THREE.Vector3(0,0,0);

const dpad = document.getElementById("dpad");
const rotateUI = document.getElementById("rotate");
//const controls = {
//    up: dpad.getElementsByClassName("up")[0],
//    down: dpad.getElementsByClassName("down")[0],
//    left: dpad.getElementsByClassName("left")[0],
//    right: dpad.getElementsByClassName("right")[0],
//    rotateLeft: rotateUI.getElementsByClassName("left")[0],
//    rotateRight: rotateUI.getElementsByClassName("right")[0]
//};
var uiDir = new THREE.Vector3(0,0,0);
var uiRotateDir = 0;
var moveDir = new THREE.Vector3(0,0,0);
var camOffset = new THREE.Vector3(0,0,0);
var camTargetOffset = new THREE.Vector3(0,0,0);

//function addEvents(element, callback) {
//    element.addEventListener("touchstart", e => { callback(1); });
//    element.addEventListener("touchend", e => {
//        callback(-1);
//        e.preventDefault(); // for preventing zoom on iOS
//    });
//    element.addEventListener("mousedown", e => { callback(1); });
//    element.addEventListener("mouseup", e => { callback(-1); });
//}
//addEvents(controls.up, a => { uiDir.z -= a; });
//addEvents(controls.down, a => { uiDir.z += a; });
//addEvents(controls.left, a => { uiDir.x -= a; });
//addEvents(controls.right, a => { uiDir.x += a; });
//addEvents(controls.rotateLeft, a => { uiRotateDir -= a; });
//addEvents(controls.rotateRight, a => { uiRotateDir += a; });

function applyYEuler(vector, euler) {
    var x = euler.x, z = euler.z;
    euler.x = euler.z = 0;
    vector.applyEuler(euler);
    euler.x = x, euler.z = z;
    return vector;
}

function animate() {
	requestAnimationFrame(animate);
    
    if (lastWindowSize.width != window.outerWidth || lastWindowSize.height != window.outerHeight) {
        updateAspectRatio();
    }

    const dt = clock.getDelta();
    

    //camera.rotation.y -= (getDir("ArrowRight", "ArrowLeft")+uiRotateDir)*3*dt;
    moveDir.set(
        getDir("KeyD", "KeyA"),
        0,
        -(getDir("KeyW", "KeyS") + getDir("ArrowUp", "ArrowDown"))
    ).add(uiDir);
    
    camTargetOffset.set(0,0,0);
    if (!moveDir.equals(zero3)) {
        applyYEuler(moveDir.normalize(), camera.rotation);
        camera.position.add(moveDir.multiplyScalar(dt*4));
        
        camTargetOffset.y = Math.sin(camClock.getElapsedTime()*10)*0.1;
    }
    camera.position.sub(camOffset);
    camOffset.lerp(camTargetOffset, dt*10); // TODO: switch over to movetowards
    camera.position.add(camOffset);

    camera.lookAt(0,1,-4);

    renderer.render(scene, camera);
}
animate();