// Austin Bullard
// Dheeraj Nalluri
// CS336 Final Project - Water
// November 5th, 2017

var scene, camera, renderer;

var width  = window.innerWidth;
var height = window.innerHeight;

var water;
var time = 0.0;

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
  if (event.which == null) {
    return String.fromCharCode(event.keyCode); // IE
  } else if (event.which!=0 && event.charCode!=0) {
    return String.fromCharCode(event.which);   // the rest
  } else {
    return null; // special key
  }
}

function handleKeyPress(event)
{
  var ch = getChar(event);
  if (cameraControl(camera, ch)) return;
}

function init() {

  window.onkeypress = handleKeyPress;

  scene = new THREE.Scene();
  initSkybox();
  initMesh();
  initCamera();
  initLights();
  initRenderer();
  initWater();
  initFog();
  //initReflections();
  initSounds();

  document.body.appendChild(renderer.domElement);

  var render = function () {
      time++;
      water.material.uniforms.time.value = time;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
  };

  render();
}

function initSkybox(){
  scene.background = new THREE.CubeTextureLoader()
    .setPath( 'images/other/' )
    .load( [
      'right.png',
      'left.png',
      'top.png',
      'bottom.png',
      'front.png',
      'back.png'
    ]);
}

function initMesh() {
  var loader = new THREE.JSONLoader();

  // island model
  loader.load('./models/island.json', function(geometry, materials) {
      var island = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      island.scale.x = island.scale.y = island.scale.z = 0.88;
      island.position.z = 2.3;
      island.position.y = 0.3;
      island.rotation.y = -1.57;
      island.receiveShadow = true;
      scene.add(island);
  });

  // palm tree model
  loader.load('./models/palmtree.json', function(geometry, materials) {
      var tree = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      tree.scale.x = tree.scale.y = tree.scale.z = 0.35;
      tree.position.set(1, 1.7, 1.6);
      tree.castShadow = true;
      tree.receiveShadow = true;
      scene.add(tree);

      var tree2 = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      tree2.scale.x = tree2.scale.y = tree2.scale.z = 0.35;
      tree2.position.set(-1, 1.7, 2.9);
      tree2.castShadow = true;
      tree2.receiveShadow = true;
      scene.add(tree2);
  });

  // kame house model
  loader.load('./models/kame.json', function(geometry, materials) {
      var house = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      house.scale.x = house.scale.y = house.scale.z = 0.18;
      //house.rotation.set(0, 0.8, -0.03);
      house.rotation.set(0, 0.8, 0);
      house.position.set(0.45, 2.17, 2.8);
      house.castShadow = true;
      house.receiveShadow = true;
      scene.add(house);
  });

  // bush model
  loader.load('./models/bush.json', function(geometry, materials) {
      var bush = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      bush.scale.x = bush.scale.y = bush.scale.z = 0.35;
      bush.position.set(-1, 2.0, 2.6);
      bush.castShadow = true;
      bush.receiveShadow = true;
      scene.add(bush);

      var bush2 = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      bush2.scale.x = bush2.scale.y = bush2.scale.z = 0.35;
      bush2.position.set(-1.1, 1.9, 2.9);
      bush2.castShadow = true;
      bush2.receiveShadow = true;
      scene.add(bush2);

      var bush3 = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      bush3.scale.x = bush3.scale.y = bush3.scale.z = 0.35;
      bush3.position.set(1, 1.9, 1);
      bush3.castShadow = true;
      bush3.receiveShadow = true;
      scene.add(bush3);
  });

  // rock model
  loader.load('./models/rock.json', function(geometry, materials) {
      var rock = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      rock.scale.x = rock.scale.y = rock.scale.z = 0.4;
      rock.position.set(-0.7, 2.2, 4.3);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
  });
}

function initLights() {
  var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    light.position.set(0, 40, 30);
    light.castShadow = true;
    scene.add(light);

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(90, width / height, 1, 10000);
    camera.position.set(2.5, 3.2, 5.7);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer( {antialias: true} );
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function initWater() {
  var loader = new THREE.TextureLoader();
  var texture = loader.load('./images/waternormals.jpg');

  var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 1000, 1000);
  var tempMaterial = new THREE.MeshPhongMaterial({color:0x00ccff, specular: 0x222222, shininess: 1, opacity: 0.8});
  var material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      timeScale: { value: 0.01 },
      time: { value: time },
      wave1: { value: new THREE.Vector3(-1.0, -1.0, 0.01) },
      wave2: { value: new THREE.Vector3(-0.5, -0.5, 0.01) },
      wave3: { value: new THREE.Vector3(0.5, 0.0, 0.01) }
    },
  	vertexShader: document.getElementById( 'vertexShader' ).textContent,
  	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  });

  water = new THREE.Mesh(geometry, material);
  water.rotation.x = -1.57;
  water.position.y = 1.85;
  scene.add(water);

  // sea floor
  geometry = new THREE.PlaneGeometry(2000, 2000, 4);
  material = new THREE.MeshBasicMaterial({ color: 0x110084 });
  var seaFloor = new THREE.Mesh(geometry, material);
  seaFloor.rotation.x = -1.57;
  seaFloor.position.y = 0.4;
  scene.add(seaFloor);
}

function initReflections() {

}

function initFog() {
    scene.fog = new THREE.FogExp2( 0xaabbbb, 0.01 );
}

function initSounds() {
    var listener = new THREE.AudioListener();
    camera.add(listener);

    var sound = new THREE.Audio(listener);

    var audioLoader = new THREE.AudioLoader();

    audioLoader.load('sounds/Beach Waves-SoundBible.com-1024681188.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
}
