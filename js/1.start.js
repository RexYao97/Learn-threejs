import * as THREE from "../node_modules/three/build/three.module.js";
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js";
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var frustumSize = 600; // 比例
var renderer; // 渲染器
var activeCamera, activeHelper; // 活动的摄像机和边框

var cameraPerspectiveHelper, cameraPerspective; // 移动的 透视摄像机
var cameraOrtho, cameraOrthoHelper; //移动的 正交相机
var mesh; // 生成的 球体
var scene; // 场景
var cameraRig; // 相机组
var camera; //第三视角的相机
var stats; // stats 渲染率检测器
init();
animate();
function init() {
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  var container = document.createElement("div"); // 节点
  document.body.appendChild(container); // 添加到html body
  scene = new THREE.Scene(); // 初始化场景
  // 第一个相机
  camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 10000);
  camera.position.z = 2500;

  // 第二个相机 透视相机
  cameraPerspective = new THREE.PerspectiveCamera(50, 0.5 * aspect, 150, 1000);
  // 这个是将相机的边框显示出来
  cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);
  scene.add(cameraPerspectiveHelper);

  // 第三个相机 是正交摄像机
  cameraOrtho = new THREE.OrthographicCamera(
    (0.5 * frustumSize * aspect) / -2,
    (0.5 * frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    150,
    1000
  );
  // 同样是把相机的边框显示出来
  cameraOrthoHelper = new THREE.CameraHelper(cameraOrtho);
  scene.add(cameraOrthoHelper);
  // 将第二个相机作为运动的相机
  activeCamera = cameraPerspective;
  activeHelper = cameraPerspectiveHelper;

  // 重置相机的方向
  cameraOrtho.rotation.y = Math.PI;
  cameraPerspective.rotation.y = Math.PI;
  // 利用组来进行控制
  cameraRig = new THREE.Group();
  cameraRig.add(cameraPerspective);
  cameraRig.add(cameraOrtho);
  scene.add(cameraRig);
  // 创建一个球体
  mesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry(100, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  scene.add(mesh);
  var mesh2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(50, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
  );
  mesh2.position.y = 150;
  // 将球体2 添加到球体1 合并为一组
  mesh.add(mesh2);
  // 第三个球体
  var mesh3 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(5, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
  );
  mesh3.position.z = 150;
  // 添加到摄像机组 合并
  cameraRig.add(mesh3);
  // 生成星星
  var geometry = new THREE.BufferGeometry();
  var vertices = [];
  for (var i = 0; i < 10000; i++) {
    vertices.push(THREE.Math.randFloatSpread(2000)); // x
    vertices.push(THREE.Math.randFloatSpread(2000)); // y
    vertices.push(THREE.Math.randFloatSpread(2000)); // z
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  // 根据geometry 里的信息 生成 points
  var particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0x888888 })
  );
  scene.add(particles);
  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  // 添加到节点
  container.appendChild(renderer.domElement);
  renderer.autoClear = false;

  stats = new Stats();
  container.appendChild(stats.dom);
  // 缩放事件
  window.addEventListener("resize", onWindowResize, false);
  // 点击事件
  document.addEventListener("keydown", onKeyDown, false);
}
function onKeyDown() {
  switch (event.keyCode) {
    case 79 /*O*/:
      activeCamera = cameraOrtho;
      activeHelper = cameraOrthoHelper;
      break;
    case 80 /*P*/:
      activeCamera = cameraPerspective;
      activeHelper = cameraPerspectiveHelper;
      break;
  }
}
function onWindowResize() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  camera.aspect = 0.5 * aspect;
  camera.updateProjectionMatrix();
  cameraPerspective.aspect = 0.5 * aspect;
  cameraPerspective.updateProjectionMatrix();
  cameraOrtho.left = (-0.5 * frustumSize * aspect) / 2;
  cameraOrtho.right = (0.5 * frustumSize * aspect) / 2;
  cameraOrtho.top = frustumSize / 2;
  cameraOrtho.bottom = -frustumSize / 2;
  cameraOrtho.updateProjectionMatrix();
}
function render() {
  // 获取时间
  var r = Date.now() * 0.0005;
  // 通过时间 来控制动画
  mesh.position.x = 700 * Math.cos(r);
  mesh.position.z = 700 * Math.sin(r);
  mesh.position.y = 700 * Math.sin(r);
  mesh.children[0].position.x = 70 * Math.cos(2 * r);
  mesh.children[0].position.z = 70 * Math.sin(r);
  // 控制摄像机移动
  if (activeCamera === cameraPerspective) {
    cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
    cameraPerspective.far = mesh.position.length();
    cameraPerspective.updateProjectionMatrix();
    cameraPerspectiveHelper.update();
    cameraPerspectiveHelper.visible = true;
    cameraOrthoHelper.visible = false;
  } else {
    cameraOrtho.far = mesh.position.length();
    cameraOrtho.updateProjectionMatrix();
    cameraOrthoHelper.update();
    cameraOrthoHelper.visible = true;
    cameraPerspectiveHelper.visible = false;
  }
  //

  cameraRig.lookAt(mesh.position);
  renderer.clear();
  activeHelper.visible = false;
  renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.render(scene, activeCamera);

  activeHelper.visible = true;
  renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.render(scene, camera);
}
function animate() {
  requestAnimationFrame(animate);
  render();
  // stats.update();
}
