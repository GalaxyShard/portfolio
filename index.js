"use strict";
function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}
function lerp(a, b, t) {
    return a+(b-a)*t;
}
/*
    start at 0
    map = [
        {pos:(0,0,0), forward:1},
        {pos:(0,0,-1), backward:0}
    ]
*/
const Vec2 = THREE.Vector2;
//const map = [
//    { // 0
//        pos: new Vec2(0,0),
//        rotation:0,
//        up:1
//    },
//    { // 1
//        pos: new Vec2(2,-4),
//        rotation:Math.PI*0.125,
//        down:0,
//        up:2
//    },
//    { // 2
//        pos:new Vec2(0, -8),
//        rotation:0,
//        down:1
//    }
//];
const map = [
    { // 0
        pos: new Vec2(0,0),
        rotation:0,
        down:1,
        up:2
    },
    { // 1
        pos: new Vec2(0,0),
        rotation:Math.PI,
        down:0
    },
    { // 2
        pos: new Vec2(2,-4),
        rotation:0,
        down:1
    }
];
var currentArea = map[0];

const defaultPitch = -Math.PI/16;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.outerWidth / window.outerHeight, 0.1, 1000);
camera.position.set(0, 1, 0);
camera.rotation.order = "YXZ";
camera.rotation.x = defaultPitch;
camera.layers.enable(1);

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
const floorMat = new THREE.MeshStandardMaterial({
    map:floorTex, color: 0xFFFFFF, roughness:0.8, metalness:0.4, bumpScale:0.005
});
const floor = new THREE.Mesh(floorGeometry, floorMat);
scene.add(floor);


const textCanvas = document.createElement("canvas");
textCanvas.width = 800;
textCanvas.height = 200;
const textContext = textCanvas.getContext("2d");
textContext.fillStyle = "white";
textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
textContext.font = `70px Arial`;
textContext.fillStyle = "black";
textContext.textAlign = "center";
textContext.fillText("Tap the arrows to move", textCanvas.width / 2, textCanvas.height / 2);

const guideTex = new THREE.CanvasTexture(textCanvas);

const cubeGeo = new THREE.BoxGeometry(2, 0.5, 1);
const cubeMat = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF
});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(0,.25,-4);
scene.add(cube);

const planeGeo = new THREE.PlaneGeometry(2, .5);
const planeMat = new THREE.MeshLambertMaterial({
    map:guideTex
});
const plane = new THREE.Mesh(planeGeo, planeMat);
cube.add(plane);
plane.position.z = 0.501;

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(1, 1, -2).normalize();
scene.add(sun);

const pointLight = new THREE.PointLight(0xffffff, 10, 100);
pointLight.position.set(0, 2, -1);
scene.add(pointLight);

const pointerIndicatorGeo = new THREE.SphereGeometry(0.08, 12, 12);
const moveIndicatorGeo = new THREE.SphereGeometry(0.081, 12, 12);
const pointerMat = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF
});
const moveIndicatorMat = new THREE.MeshLambertMaterial({
    color: 0x80FF80
});
const pointerIndicator = new THREE.Mesh(pointerIndicatorGeo, pointerMat);
pointerIndicator.layers.set(1);
scene.add(pointerIndicator);


const moveIndicator = new THREE.Mesh(moveIndicatorGeo, moveIndicatorMat);
moveIndicator.layers.set(1);
scene.add(moveIndicator);

function moveVector3To(v0, v1, delta) {
    var toX = v1.x-v0.x;
    var toY = v1.y-v0.y;
    var toZ = v1.z-v0.z;
    var sqrDist = toX*toX + toY*toY + toZ*toZ;
    if (sqrDist === 0 || sqrDist <= delta*delta) {
        v0.copy(v1);
        return;
    }
    var dist = Math.sqrt(sqrDist);
    v0.x += toX/dist*delta;
    v0.y += toY/dist*delta;
    v0.z += toZ/dist*delta;
}

const raycaster = new THREE.Raycaster();
//const pointerPos = new THREE.Vector2();
const targetPos = new THREE.Vector3();

function raycastScreenPoint(x,y) {
	pointerPos.x = x / window.outerWidth * 2 - 1;
	pointerPos.y = -y / window.outerHeight * 2 + 1;
    raycaster.setFromCamera(pointerPos, camera);
    const hits = raycaster.intersectObjects(scene.children);
    return hits;
}
//function updateIndicator(e) {
//    var hits = raycastScreenPoint(e.clientX, e.clientY);
//    if (hits.length > 0) {
//        pointerIndicator.position.copy(hits[0].point);
//    }
//}
//window.addEventListener("pointermove", updateIndicator);
//window.addEventListener("pointerdown", updateIndicator);
//function handleClick(e) {
//    var hits = raycastScreenPoint(e.clientX, e.clientY);
//    if (hits.length > 0) {
//        isMoving = true;
//        targetPos.copy(hits[0].point);
//        moveIndicator.position.copy(targetPos);
//    }
//}
//window.addEventListener("pointerup", handleClick);
const dpad = document.getElementById("dpad");
const controls = {
    up:dpad.getElementsByClassName("up")[0],
    down:dpad.getElementsByClassName("down")[0],
    left:dpad.getElementsByClassName("left")[0],
    right:dpad.getElementsByClassName("right")[0]
};
function updateUI() {
    for (const key in controls) {
        const element = controls[key];
        element.style.display = currentArea[key]!==undefined ? "block" : "none";
    }
}
updateUI();
function addListeners(id) {
    controls[id].addEventListener("pointerdown", e => {
        if (isMoving) {
            return;
        }
        var index = currentArea[id];
        if (index === undefined) {
            return;
        }
        currentArea = map[index];
        isMoving = true;
        targetPos.set(currentArea.pos.x, 0, currentArea.pos.y);

        for (const key in controls) {
            const element = controls[key];
            element.style.display = "none";
        }
    });
}
addListeners("up");
addListeners("down");
addListeners("left");
addListeners("right");

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
const clock = new THREE.Clock();
const camClock = new THREE.Clock();
const zero3 = new THREE.Vector3(0,0,0);

var uiDir = new THREE.Vector3(0,0,0);
var uiRotateDir = 0;
var moveDir = new THREE.Vector3(0,0,0);
var camOffset = new THREE.Vector3(0,0,0);
var camTargetOffset = new THREE.Vector3(0,0,0);
var camTempRotation = new THREE.Quaternion();
var camTargetRotation = new THREE.Quaternion();

function applyYEuler(vector, euler) {
    var x = euler.x, z = euler.z;
    euler.x = euler.z = 0;
    vector.applyEuler(euler);
    euler.x = x, euler.z = z;
    return vector;
}
var isMoving = false;
function animate() {
	requestAnimationFrame(animate);
    
    if (lastWindowSize.width != window.outerWidth || lastWindowSize.height != window.outerHeight) {
        updateAspectRatio();
    }
    const dt = clock.getDelta();

    camTargetOffset.set(0,0,0);
    if (isMoving) {
        camTargetOffset.y = Math.sin(camClock.getElapsedTime()*10)*0.08;
    }
    camera.position.sub(camOffset);
    camOffset.lerp(camTargetOffset, dt*10); // switch over to moveto?
    camera.position.add(camOffset);
    
    if (isMoving) {
        targetPos.y = camera.position.y;
        moveVector3To(camera.position, targetPos, dt*4);

        var rotation = camera.rotation.y;
        //camTempRotation.copy(camera.quaternion);
        camera.lookAt(targetPos.x, 0, targetPos.z);
        camera.rotation.x = defaultPitch;
        camera.rotation.y = lerp(rotation, camera.rotation.y, dt*6);
        //camTargetRotation.copy(camera.quaternion);
        //camera.quaternion.copy(camTempRotation);
        //camera.quaternion.slerp(camTargetRotation, dt*6);

        const sqrDist = camera.position.distanceToSquared(targetPos);
        isMoving = sqrDist > 0.01;

        if (!isMoving) {
            updateUI();
        }
    } else {

        camera.rotation.y = lerp(camera.rotation.y, currentArea.rotation, dt*6);
    }
    //raycastScreenPoint(pointerPos.x, pointerPos.y);
    //raycaster.setFromCamera(pointerPos, camera);
    //const hits = raycaster.intersectObjects(scene.children);
    //if (hits.length > 0) {
    //    pointerIndicator.position.copy(hits[0].point);
    //} else {
    //    pointerIndicator.position.set(0,0,0);
    //}
    renderer.render(scene, camera);
}
animate();