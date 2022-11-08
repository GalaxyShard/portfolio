"use strict";
// functions that should be in Math
function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}
function lerp(a, b, t) {
    return a+(b-a)*t;
}
function mod(a, n) {
    return a - (n * Math.floor(a/n));
}
function roundToNearest(a, inc) {
    return Math.round(a/inc)*inc;
}

// helper functions
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

function Vec2(x,y) { return new THREE.Vector2(x,y); }
const map = [
    { // 0
        pos:Vec2(0,0),
        northeast:1,
        northwest:3,
    },
    { // 1
        pos:Vec2(2,-4),
        northwest:2,
        southwest:0,
    },
    { // 2
        pos:Vec2(0,-8),
        southeast:1,
        southwest:3,
    },
    { // 3
        pos:Vec2(-2,-4),
        northeast:2,
        southeast:0,
        north:4,
    },
    { // 4
        pos:Vec2(-2, -8),
        south:3
    },
];

var currentArea = map[0];

const defaultPitch = 0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 0);
camera.rotation.order = "YXZ";
camera.rotation.x = defaultPitch;
camera.layers.enable(1);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
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
cube.position.set(0,2,-4);
cube.rotation.x = Math.PI/16;
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

const pointLight1 = new THREE.PointLight(0xffffff, 10, 100);
pointLight1.position.set(-2, 2, -8);
scene.add(pointLight1);

const loader = new THREE.GLTFLoader();
loader.load("models/billboard.glb", (gltf) => {
    gltf.scene.scale.set(0.4,0.4,0.4);
    gltf.scene.position.set(-2, 0, -9);
    scene.add(gltf.scene);

    const aboutTex = new THREE.TextureLoader().load("images/about.png");
    const overlayGeo = new THREE.PlaneGeometry(1.5, 0.75);
    const overlayMat = new THREE.MeshLambertMaterial({
        map:aboutTex
    });
    const overlay = new THREE.Mesh(overlayGeo, overlayMat);
    overlay.position.set(-2, 1, -9+0.01);
    scene.add(overlay);
});

var camTargetRotation = 0;
var isMoving = false;

const raycaster = new THREE.Raycaster();
const targetPos = new THREE.Vector3();

const dpad = document.getElementById("dpad");
const rotateUI = document.getElementById("rotate");
const moveControls = {
    north:dpad.getElementsByClassName("north")[0],
    south:dpad.getElementsByClassName("south")[0],
    west:dpad.getElementsByClassName("west")[0],
    east:dpad.getElementsByClassName("east")[0],

    northwest:dpad.getElementsByClassName("northwest")[0],
    southwest:dpad.getElementsByClassName("southwest")[0],
    northeast:dpad.getElementsByClassName("northeast")[0],
    southeast:dpad.getElementsByClassName("southeast")[0]
};
const rotateControls = {
    left:rotateUI.getElementsByClassName("left")[0],
    right:rotateUI.getElementsByClassName("right")[0]
}
function updateUI() {
    for (const key in moveControls) {
        const element = moveControls[key];
        element.style.opacity = currentArea[key]!==undefined ? "1" : "0";
    }
}
updateUI();
for (const key in moveControls) {
    moveControls[key].addEventListener("pointerdown", e => {
        if (isMoving) {
            return;
        }
        let index = currentArea[key];
        if (index === undefined) {
            return;
        }
        currentArea = map[index];
        isMoving = true;
        targetPos.set(currentArea.pos.x, 0, currentArea.pos.y);
        
        let rotation = camera.rotation.y;
        camera.lookAt(targetPos.x, 0, targetPos.z);
        camTargetRotation = camera.rotation.y;
        camera.rotation.set(defaultPitch, rotation, 0);

        updateUI();
    });
}

rotateControls.left.addEventListener("pointerdown", e => {
    camTargetRotation = roundToNearest(camTargetRotation, Math.PI/2) + Math.PI/2;
});
rotateControls.right.addEventListener("pointerdown", e => {
    camTargetRotation = roundToNearest(camTargetRotation, Math.PI/2) - Math.PI/2;
});

function iosZoomFix(element) {
    element.addEventListener("touchstart", e => {
        e.preventDefault();
    });
}
iosZoomFix(dpad);
iosZoomFix(rotateUI);
for (const key in moveControls) {
    iosZoomFix(moveControls[key]);
}
for (const key in rotateControls) {
    iosZoomFix(rotateControls[key]);
}

const lastWindowSize = {width:window.innerHeight, height:window.innerHeight};
function updateAspectRatio() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = 60 / Math.min(camera.aspect/1.125, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    lastWindowSize.width = window.innerWidth;
    lastWindowSize.height = window.innerHeight;
}
updateAspectRatio();

const clock = new THREE.Clock();
const camClock = new THREE.Clock();

const camOffset = new THREE.Vector3(0,0,0);
const camTargetOffset = new THREE.Vector3(0,0,0);
const tempEuler = new THREE.Euler(0, 0, 0, "YXZ");
const tempQuaternion = new THREE.Quaternion();

function animate() {
	requestAnimationFrame(animate);
    
    if (lastWindowSize.width != window.innerWidth || lastWindowSize.height != window.innerHeight) {
        updateAspectRatio();
    }
    const dt = Math.min(clock.getDelta(), 0.1);

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

        const sqrDist = camera.position.distanceToSquared(targetPos);
        isMoving = sqrDist > 0.01;

        if (!isMoving) {
            camTargetRotation = roundToNearest(camTargetRotation, Math.PI/2);
        }
    }
    tempEuler.set(defaultPitch, camTargetRotation, 0);
    tempQuaternion.setFromEuler(tempEuler);
    camera.quaternion.slerp(tempQuaternion, dt*6);
    dpad.style.transform = "rotate(" + (camera.rotation.y) + "rad)";

    renderer.render(scene, camera);
}
animate();