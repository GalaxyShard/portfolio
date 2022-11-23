import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
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
// This is the map, each element is a location which has a position and
// all of the other locations that the player can go to from there
const map = {
    spawn: {
        pos:Vec2(0,0),
        northeast:"toProjects",
        northwest:"toAbout",
        south:"toContact",
    },
    toAbout: {
        pos:Vec2(-2,-4),
        southeast:"spawn",
        north:"about",
    },
    toProjects: {
        pos:Vec2(2,-4),
        northwest:"about",
        southwest:"spawn",
        north:"project0",
    },
    toContact: {
        pos:Vec2(0, 4),
        north:"spawn",
        south:"contact",
    },
    contact: {
        pos:Vec2(0, 8),
        north:"toContact",
    },
    about: {
        pos:Vec2(-2, -8),
        south:"toAbout",
        southeast:"toProjects",
    },
    project0: {
        pos:Vec2(2, -12),
        south:"toProjects",
        north:"project1",
    },
    project1: {
        pos:Vec2(2, -18),
        south:"project0",

    }
};
var currentArea = map.spawn;

// Sets the pitch for the camera, can be used to look slightly up or down
const defaultPitch = 0;

const scene = new THREE.Scene();

// fov and aspect ratio are set later
// YXZ rotation order to prevent gimbal lock when there is pitch
const camera = new THREE.PerspectiveCamera(1,1, 0.1, 1000);
camera.position.set(0, 1, 0);
camera.rotation.order = "YXZ";
camera.rotation.x = defaultPitch;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

// Creates the floor, 100x100 meters, uses floor.png for a repeating texture
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

// Creates text which can be turned into a texture and put on an object
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

// Creates a 3D object to display the guide text
const guideCubeGeo = new THREE.BoxGeometry(2, 0.5, 1);
const guideCubeMat = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF
});
const guideCube = new THREE.Mesh(guideCubeGeo, guideCubeMat);
guideCube.position.set(0,2,-4);
guideCube.rotation.x = Math.PI/16;
scene.add(guideCube);

const guidePlaneGeo = new THREE.PlaneGeometry(2, .5);
const guidePlaneMat = new THREE.MeshLambertMaterial({
    map:guideTex
});
const guidePlane = new THREE.Mesh(guidePlaneGeo, guidePlaneMat);
guideCube.add(guidePlane);
guidePlane.position.z = 0.501;

// Sets up the lighting in the scene
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(1, 1, -2).normalize();
scene.add(sun);

function newLight(intensity, dist, posX,posY,posZ) {
    const pointLight = new THREE.PointLight(0xffffff, intensity, dist);
    pointLight.position.set(posX,posY,posZ);
    scene.add(pointLight);
    return pointLight;
}
newLight(10,100, 0,2,-1); // spawn
newLight(5,100, -2,2,-8); // about
newLight(5,100, 2,2,-12); // project0
newLight(5,100, 2,2,-18); // project1
newLight(5,100, 2, 1.75, -8); // project section
//newLight(10,100, -8, 1.75, 0); // inspirations section
newLight(5,100, 0, 2, 8); // contact

// Inserts 3D text above each section
new FontLoader().loadAsync("./assets/helvetiker.typeface.json").then((font) => {
    const textMat = new THREE.MeshLambertMaterial({
        color:0xFFFFFF
    });
    function createText(text, posX, posY, posZ, yaw) {
        const geo = new TextGeometry(text, {
            font: font,
            size: .5,
            height: .1,
            curveSegments: 1,
        
            bevelThickness: 0.1,
            bevelSize: 0.01,
            bevelEnabled: true
        });
        geo.computeBoundingBox();
        geo.center();
        const textMesh = new THREE.Mesh(geo, textMat);
        textMesh.position.set(posX, posY, posZ);
        textMesh.rotation.y = yaw;
        scene.add(textMesh);
        return textMesh;
    }
    createText("About", -2, 1.75, -9.25, 0);
    createText("Projects", 2, 1.75, -9.25, 0);
    //createText("Inspirations", 9.25, 1.75, 0, -Math.PI/2);
    createText("Contact", 0, 1.75, 9.25, Math.PI);
});
// 'popups' is a list of objects that, when double clicked, display a popup with information
var popups = [];

// Creates all of the billboards
const loader = new GLTFLoader();
loader.loadAsync("models/billboard.glb").then(gltf => {
    gltf.scene.scale.set(0.4,0.4,0.4);
    function createBoard(posX, posY, posZ, yaw) {
        var board = gltf.scene.clone();
        board.position.set(posX,posY,posZ);
        board.rotation.y = yaw;
        scene.add(board);
        return board;
    }
    const project0 = createBoard(1, 0, -12, Math.PI/2);
    const project1 = createBoard(3, 0, -18, -Math.PI/2);
    const backButton = createBoard(-1.25, 0, 0, Math.PI/2);
    const about = createBoard(-2, 0, -9, 0);
    const contact = createBoard(0, 0, 9, Math.PI);

    const overlayGeo = new THREE.PlaneGeometry(4, 2);
    function addOverlay(billboard, texturePath) {
        const mat = new THREE.MeshLambertMaterial();
        new THREE.TextureLoader().loadAsync(texturePath).then(tex => {
            mat.map = tex;
            mat.needsUpdate = true;
        });
        const overlay = new THREE.Mesh(overlayGeo, mat);
        overlay.position.set(0,2.5,0.01);
        billboard.add(overlay);
        return overlay;
    }
    // TODO: remove these images, possibly use CSS3DRenderer to display the iframes in 3D space directly
    const aboutOverlay = addOverlay(about, "images/about.png");
    const project0Overlay = addOverlay(project0, "images/retro-remake.png");
    const project1Overlay = addOverlay(project1, "images/cups-pups.png");
    const backBtnOverlay = addOverlay(backButton, "images/backbtn.png");
    const contactOverlay = addOverlay(contact, "images/contact.png");

    popups[popups.length] = {
        object:aboutOverlay,
        iframe:"subpages/about.html"
    };
    popups[popups.length] = {
        object:project0Overlay,
        iframe:"subpages/retro-remake.html",
        href:"https://galaxyshard-wdpp.github.io/retro-c-binary"
    };
    popups[popups.length] = {
        object:project1Overlay,
        iframe:"subpages/cups-pups.html",
        href:"https://galaxyshard-wdpp.github.io/cups-pups"
    };
    popups[popups.length] = {
        object:backBtnOverlay,
        href:"./"
    };
    popups[popups.length] = {
        object:contactOverlay,
        iframe:"subpages/contact.html"
    };
});
// This is the target yaw of the camera, used to smoothly look around
var camTargetRotation = 0;
var isMoving = false;

// Finds the objects in front of the pointer
const raycaster = new THREE.Raycaster();
const pointerPos = new THREE.Vector2();
function raycastScreenPoint(x,y) {
	pointerPos.x = x / document.body.clientWidth * 2 - 1;
	pointerPos.y = -y / document.body.clientHeight * 2 + 1;
    raycaster.setFromCamera(pointerPos, camera);
    const hits = raycaster.intersectObjects(scene.children);
    return hits;
}

const popup = document.getElementById("popup");
const closePopup = popup.getElementsByClassName("close")[0];
const newTab = popup.getElementsByClassName("open")[0];
const popupFrame = popup.getElementsByTagName("iframe")[0];
closePopup.addEventListener("click", _ => {
    popup.classList.remove("opened");
});

var lastClickTime = performance.now();
window.addEventListener("pointerdown", e => {
    const hits = raycastScreenPoint(e.clientX, e.clientY);

    if (hits.length > 0) {
        // ignore far billboards
        if (hits[0].distance > 3) {
            return;
        }
        // find if the object clicked on was a billboard
        const frame = popups.find((value) => value.object==hits[0].object);
        
        if (frame) {
            // check for a double click
            var time = performance.now();
            if (time-lastClickTime < 250 /* ms */) {
                // if there is a subpage open it, otherwise navigate directly to site
                if (frame.iframe) {
                    popupFrame.src = frame.iframe;
                    
                    // disable "Open in new tab" if there is no dedicated website
                    newTab.href = frame.href || "javascript:void()";
                    if (frame.href) {
                        newTab.classList.remove("invisible");
                    } else {
                        newTab.classList.add("invisible");
                    }
                    popup.classList.add("opened");

                } else {
                    window.location.href = frame.href;
                }
            } else {
                lastClickTime = time;
            }
        }
    }
});
// Used for smoothly moving the camera
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
function updateDPad() {
    for (const key in moveControls) {
        const element = moveControls[key];
        if (currentArea[key] === undefined) {
            element.classList.add("invisible");
        } else {
            element.classList.remove("invisible");
        }
    }
}
updateDPad();
for (const key in moveControls) {
    moveControls[key].addEventListener("pointerdown", _ => {
        if (isMoving) {
            return;
        }
        let index = currentArea[key];
        if (index === undefined) {
            return;
        }
        // finds the next area, then starts moving and looking towards it
        currentArea = map[index];
        isMoving = true;
        targetPos.set(currentArea.pos.x, 0, currentArea.pos.y);
        
        let rotation = camera.rotation.y;
        camera.lookAt(targetPos.x, 0, targetPos.z);
        camTargetRotation = camera.rotation.y;
        camera.rotation.set(defaultPitch, rotation, 0);

        updateDPad();
    });
}

rotateControls.left.addEventListener("pointerdown", _ => {
    camTargetRotation = roundToNearest(camTargetRotation, Math.PI/2) + Math.PI/2;
});
rotateControls.right.addEventListener("pointerdown", _ => {
    camTargetRotation = roundToNearest(camTargetRotation, Math.PI/2) - Math.PI/2;
});

// fixes iOS zooming in on double clicks
// touch-action:none; is supposed to already do this
function iosZoomFix(element) {
    element.addEventListener("touchstart", e => {
        e.preventDefault();
    });
}
iosZoomFix(renderer.domElement);
iosZoomFix(dpad);
iosZoomFix(rotateUI);
for (const key in moveControls) {
    iosZoomFix(moveControls[key]);
}
for (const key in rotateControls) {
    iosZoomFix(rotateControls[key]);
}

// updates the aspect ratio of the camera to adjust for mobile or pc and screen size changes
const lastWindowSize = {};
function updateAspectRatio() {
    camera.aspect = document.body.clientWidth / document.body.clientHeight;
    camera.fov = 70 / Math.min(camera.aspect, 1);
    camera.updateProjectionMatrix();

    renderer.setSize(document.body.clientWidth, document.body.clientHeight);

    lastWindowSize.width = document.body.clientWidth;
    lastWindowSize.height = document.body.clientHeight;
}
updateAspectRatio();

const clock = new THREE.Clock();

// for the head-bobbing effect
const camClock = new THREE.Clock();
const camOffset = new THREE.Vector3(0,0,0);
const camTargetOffset = new THREE.Vector3(0,0,0);

const tempEuler = new THREE.Euler(0, 0, 0, "YXZ");
const tempQuaternion = new THREE.Quaternion();

// renders the scene, usually runs 60 times a second
function animate() {
	requestAnimationFrame(animate);
    
    if (lastWindowSize.width != document.body.clientWidth || lastWindowSize.height != document.body.clientHeight) {
        updateAspectRatio();
    }
    const dt = Math.min(clock.getDelta(), 0.1);

    // head-bobbing effect
    camTargetOffset.set(0,0,0);
    if (isMoving) {
        camTargetOffset.y = Math.sin(camClock.getElapsedTime()*10)*0.08;
    }
    camera.position.sub(camOffset);
    camOffset.lerp(camTargetOffset, dt*10); // switch over to moveto?
    camera.position.add(camOffset);
    
    if (isMoving) {
        // moves towards the destination at a constant speed, ignoring the y-axis
        targetPos.y = camera.position.y;
        moveVector3To(camera.position, targetPos, dt*4);

        const sqrDist = camera.position.distanceToSquared(targetPos);
        const threshold = 0.001;
        isMoving = sqrDist > threshold*threshold;

        if (!isMoving) {
            // rounds the rotation to the nearest 90 degree increment
            camTargetRotation = roundToNearest(camTargetRotation, Math.PI/2);
        }
    }
    // smoothly rotates the camera to the target rotation
    tempEuler.set(defaultPitch, camTargetRotation, 0);
    tempQuaternion.setFromEuler(tempEuler);
    camera.quaternion.slerp(tempQuaternion, dt*6);

    // rotate the dpad so that north always faces towards the -Z axis
    dpad.style.transform = "rotate(" + (camera.rotation.y) + "rad)";

    renderer.render(scene, camera);
}
animate();