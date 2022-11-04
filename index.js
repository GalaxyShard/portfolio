
function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 0);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
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
const cube = new THREE.Mesh(floorGeometry, floorMat);
scene.add(cube);


const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(1, 1, -2).normalize();
scene.add(sun);

const ambient = new THREE.AmbientLight(0xffffff, 1);
ambient.position.set(0, 4, 0);
scene.add(ambient);


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


window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
const clock = new THREE.Clock();
const camClock = new THREE.Clock();
var camOffset = new THREE.Vector3(0,0,0);
const zero3 = new THREE.Vector3(0,0,0);
function animate() {
	requestAnimationFrame(animate);
    
    const dt = clock.getDelta();

    // camera.rotation.x += getDir("ArrowUp", "ArrowDown")*2*dt;
    camera.rotation.y -= (getDir("ArrowRight", "ArrowLeft")+getDir("KeyD", "KeyA"))*2*dt;
    var dir = new THREE.Vector3(0, 0, -(getDir("KeyW", "KeyS")+getDir("ArrowUp", "ArrowDown")));
    
    var camTargetOff = new THREE.Vector3(0, 0, 0);
    if (!dir.equals(zero3)) {
        dir.normalize().applyQuaternion(camera.quaternion);
        camera.position.add(dir.multiplyScalar(dt*4));
        
        camTargetOff.y = Math.sin(camClock.getElapsedTime())*10;
    } else {
    }
    camera.position.sub(camOffset);
    camOffset.lerp(camTargetOff, dt*10); // TODO: switch over to movetowards
    camera.position.add(camOffset);
    

    renderer.render(scene, camera);
}
animate();