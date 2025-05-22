import RendererTool from "./RendererTool.js";
import FileManager from "../../src/network/FileManager.js";
import GroundRenderer from "../../src/render/map/Ground.js";
import MapLoader from "../../src/network/MapLoader.js";
import CameraMap from "./CameraMap.js";
import MapGrid from "./MapGrid.js";
import Models from "../../src/render/map/Models.js";
import * as THREE from 'three';
import { ConvexObjectBreaker } from "three/examples/jsm/Addons.js";
var MapEditor = {};
var threejs_scene=null;
var world=null;
var models=null;
var ground=null;
const box_material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true});
var threejs_renderer=null;
var threejs_camera=null;
var raycaster = new THREE.Raycaster();
const axesHelper = new THREE.AxesHelper(20);
var selObject = null;
var all_boxes=[]

MapEditor.b_init=false;

function onMouseDown(pointer) {
  raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), threejs_camera);
  const intersects = raycaster.intersectObjects( all_boxes);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const object = intersect.object;
    const inst_id = object.inst_id;
    // axesHelper.position.set(0, object.position.y, 0);
    object.parent.add(axesHelper);
    selObject=object;
    transformModel(inst_id, [0,0,0], [2,0,0], [0,0,0], object.parent)
    
  }
}

MapEditor.moveCameraToSelected = function() {
  var pos = selObject.parent.position;
  
  CameraMap.position[0]=pos.x;
  CameraMap.position[2]=pos.z;
  console.log(CameraMap.position);
}

MapEditor.init = function() {
  threejs_renderer=new THREE.WebGLRenderer();
  threejs_renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(threejs_renderer.domElement);
  threejs_renderer.domElement.style.position = 'absolute';
  threejs_renderer.domElement.style.top = '0';
  threejs_renderer.domElement.style.left = '0';
  threejs_renderer.domElement.style.width = '100%';
  threejs_renderer.domElement.style.height = '100%';
  threejs_renderer.domElement.style.zIndex = '0';
  threejs_renderer.domElement.style.pointerEvents = 'none';
  threejs_renderer.setClearColor(0x000000, 0);
  RendererTool.init();
  RendererTool.render(MapEditor.render);
  CameraMap.init();
  CameraMap.onMouseDown = onMouseDown;
  // threejs_renderer = new THREE.WebGLRenderer({canvas: RendererTool.canvas,context: RendererTool.gl,preserveDrawingBuffer: true});
  threejs_scene = new THREE.Scene();
  threejs_camera = new THREE.PerspectiveCamera(CameraMap.vFov, window.innerWidth/window.innerHeight, 10, 1000);
  MapEditor.b_init=true;
};

MapEditor.loadMap = function(map_name) {
  MapEditor.showMap(map_name);
}

MapEditor.showModels = function() {
  Models.b_show = !Models.b_show;
}

MapEditor.showBoxes = function() {
  for (var i = 0; i < all_boxes.length; i++) {
    all_boxes[i].visible = !all_boxes[i].visible;
  }
}

function transformModel(inst_id, d_r, d_p, d_s, node) {
  var inst_r = world.models[inst_id].rotation;
  var inst_p = world.models[inst_id].position;
  var inst_s = world.models[inst_id].scale;
  inst_r[0] += d_r[0];
  inst_r[1] += d_r[1];
  inst_r[2] += d_r[2];
  inst_p[0] += d_p[0];
  inst_p[1] += d_p[1];
  inst_p[2] += d_p[2];
  inst_s[0] += d_s[0];
  inst_s[1] += d_s[1];
  inst_s[2] += d_s[2];
  var rsm_name = world.models[inst_id].filename;
  var rsm = models.rsms.find(rsm => rsm.filename === rsm_name);
  var new_inst_matrix = rsm.getInstanceMatrix(world.models[inst_id], ground.width, ground.height);
  var node_meshes = rsm.compileOne(new_inst_matrix);
  var inst_info =models.raw_mapping[inst_id];
  for (var i = 0; i < inst_info.length; i++) {
    var offset = inst_info[i][0];
    var count = inst_info[i][1];
    var tex_id = inst_info[i][2];
    var node_id = inst_info[i][3];
    var mesh = node_meshes[node_id][tex_id];
    Models.setBuffer(mesh, offset);
  }
  Models.updateBuffer(RendererTool.gl);
  updateBox(inst_p, inst_r, inst_s, node);
}

var onWorldComplete = function(data) {
  world=data;
	MapEditor.light   = data.light;
	MapEditor.light.direction = new Float32Array(3);
	var longitude        = MapEditor.light.longitude * Math.PI / 180;
	var latitude         = MapEditor.light.latitude  * Math.PI / 180;
	MapEditor.light.direction[0] = -Math.cos(longitude) * Math.sin(latitude);
	MapEditor.light.direction[1] = -Math.cos(latitude);
	MapEditor.light.direction[2] = -Math.sin(longitude) * Math.sin(latitude);
}

var onGroundComplete = function(data) {
  ground=data;
  GroundRenderer.init(RendererTool.gl,data);
  // MapGrid.init(RendererTool.gl,data,threejs_scene);
}

var onAltitudeComplete = function() {
  // console.log("onAltitudeComplete");
}

var updateBox= function(inst_p, inst_r, inst_s, node) {
  node.position.set(inst_p[0]+ground.width, inst_p[1], inst_p[2]+ground.height);
  var euler = new THREE.Euler( inst_r[0]/180*Math.PI, inst_r[1]/180*Math.PI,inst_r[2]/180*Math.PI, "ZXY");
  node.setRotationFromEuler(euler);
  node.scale.set(inst_s[0], inst_s[1], inst_s[2]);
}

var onModelsComplete = function(data) {
  models=data;
  console.log("onModelsComplete", data);
  console.log("world", world);
  Models.init( RendererTool.gl, data );
  for (var inst_id in models.raw_mapping) {
    var rsm_name = world.models[inst_id].filename;
    var inst_p = world.models[inst_id].position;
    var inst_r = world.models[inst_id].rotation;
    var inst_s = world.models[inst_id].scale;
    
    let rsm = models.rsms.find(rsm => rsm.filename === rsm_name);
    const min = rsm.box.min;
    const max = rsm.box.max;
    const size = [
      max[0] - min[0],
      max[1] - min[1],
      max[2] - min[2]
    ];
    const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const box = new THREE.Mesh(geometry, box_material);
    all_boxes.push(box);
    box.position.set(0, rsm.box.center[1],0);
    box.name = rsm_name;
    box.inst_id = inst_id;
    box.visible = false;
    const node = new THREE.Object3D();
    node.add(box);
    updateBox(inst_p, inst_r, inst_s, node);
    threejs_scene.add(node);
  }
}

var onProgressUpdate = function() {
  // console.log("onProgressUpdate");
}

var onMapComplete = function() {
  console.log("onMapComplete");
  RendererTool.rendering = true;
}

MapEditor.clearMap = function() {
  threejs_scene.clear();
  threejs_scene.add(threejs_camera);  
  all_boxes = [];
  GroundRenderer.free(RendererTool.gl);
  Models.free(RendererTool.gl);
}

MapEditor.showMap = function(map_name) {
  MapEditor.clearMap();
  FileManager.clear(RendererTool.gl);
  RendererTool.rendering = false;
  MapLoader.MAP_WORLD=onWorldComplete.bind(MapEditor)
  MapLoader.MAP_GROUND=onGroundComplete.bind(MapEditor)
  MapLoader.MAP_ALTITUDE=onAltitudeComplete.bind(MapEditor)
  MapLoader.MAP_MODELS=onModelsComplete.bind(MapEditor)
  MapLoader.MAP_PROGRESS=onProgressUpdate.bind(MapEditor)
  MapLoader.MAP_COMPLETE=onMapComplete.bind(MapEditor)
  MapLoader.load(map_name);
};

MapEditor.light = {
  direction: [0, 0, 1],
  opacity: 1,
  ambient: [0.2, 0.2, 0.2],
  diffuse: [1, 1, 1]
}

MapEditor.fog = {
  use: false,
  exist: true,
  near: 1,
  far: 1000,
  color: [0.2, 0.2, 0.2]
}

MapEditor.render = function(tick, gl) {
  CameraMap.update(tick);
  var modelView  = CameraMap.modelView;
  var projection = CameraMap.projection;
  var normalMat  = CameraMap.normalMat;
  let modelView3 = new THREE.Matrix4();
  modelView3.fromArray(modelView);
  threejs_camera.matrixAutoUpdate = false;
  threejs_camera.matrix= new THREE.Matrix4();
  threejs_camera.applyMatrix4(modelView3.clone().invert());
  // console.log(modelView3.clone().invert());
  // threejs_camera.matrix.copy(modelView3.clone().invert());
  
  var fog        = MapEditor.fog;
  var light      = MapEditor.light;
  GroundRenderer.render(gl, modelView, projection, normalMat, fog, light);
  Models.render(gl, modelView, projection, normalMat, fog, light );
  threejs_renderer.render(threejs_scene, threejs_camera);
  // MapGrid.render(gl, CameraMap.modelView, CameraMap.projection);
};

export default MapEditor;