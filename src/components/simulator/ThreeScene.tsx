import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimulatorElement } from '../../types';

interface ThreeSceneProps {
  elements: SimulatorElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementTransform?: (id: string, updates: Partial<SimulatorElement>) => void;
  onRegisterSnapshot?: (fn: (() => string | null) | null) => void;
  cameraPreset: 'frontal' | 'isometric' | 'lateral' | 'top';
  isArPassthrough?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  elements,
  selectedId,
  onSelectElement,
  onUpdateElementTransform,
  onRegisterSnapshot,
  cameraPreset,
  isArPassthrough = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const floorRef = useRef<THREE.Mesh | null>(null);

  const onSelectRef = useRef(onSelectElement);
  onSelectRef.current = onSelectElement;
  const onUpdateTransformRef = useRef(onUpdateElementTransform);
  onUpdateTransformRef.current = onUpdateElementTransform;
  const onRegisterSnapshotRef = useRef(onRegisterSnapshot);
  onRegisterSnapshotRef.current = onRegisterSnapshot;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 500;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? (gl as any).UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    if (!isArPassthrough) {
      scene.background = new THREE.Color(0xFDF7F8);
      scene.fog = new THREE.Fog(0xFDF7F8, 8, 22);
    } else {
      scene.background = null;
      scene.fog = null;
    }

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 1.65, 5.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xFFFDFB, 0xEED9DD, 0.95);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFF8F0, 1.55);
    keyLight.position.set(3.5, 6, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -1;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xF6CFD6, 0.75);
    rimLight.position.set(-4, 4, -3);
    scene.add(rimLight);

    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xFAF0F2,
      roughness: 0.9,
      metalness: 0.04,
      transparent: isArPassthrough,
      opacity: isArPassthrough ? 0.18 : 1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);
    floorRef.current = floor;

    if (!isArPassthrough) {
      const gridHelper = new THREE.GridHelper(12, 24, 0xF6CFD6, 0xEFE2E4);
      gridHelper.position.y = 0.005;
      scene.add(gridHelper);
    }

    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controls.target.set(0, 1.1, 0);
    controlsRef.current = controls;

    // Interactive Click & Drag on Floor Plane in 3D / AR Mode
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeHit = new THREE.Vector3();

    let draggingGroup: THREE.Object3D | null = null;
    let draggingId: string | null = null;
    const dragOffset = new THREE.Vector3();

    const resolveDraggingGroup = (): THREE.Object3D | null => {
      if (!draggingId) return null;
      if (draggingGroup && draggingGroup.parent === objectsGroup) {
        return draggingGroup;
      }
      const found = objectsGroup.children.find((child) => child.userData.id === draggingId) || null;
      draggingGroup = found;
      return found;
    };

    const updatePointerNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (event: PointerEvent) => {
      updatePointerNdc(event.clientX, event.clientY);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(objectsGroup.children, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && topObj.parent && topObj.parent !== objectsGroup) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData.id) {
          draggingId = String(topObj.userData.id);
          draggingGroup = topObj;
          onSelectRef.current(draggingId);
          controls.enabled = false;
          renderer.domElement.style.cursor = 'grabbing';

          if (raycaster.ray.intersectPlane(floorPlane, planeHit)) {
            dragOffset.copy(topObj.position).sub(planeHit);
          } else {
            dragOffset.set(0, 0, 0);
          }

          try {
            renderer.domElement.setPointerCapture(event.pointerId);
          } catch {
            // ignore capture errors
          }
        }
      } else {
        onSelectRef.current(null);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointerNdc(event.clientX, event.clientY);
      raycaster.setFromCamera(pointer, camera);

      const activeGroup = resolveDraggingGroup();
      if (activeGroup) {
        if (raycaster.ray.intersectPlane(floorPlane, planeHit)) {
          const nextX = Math.max(-2.1, Math.min(2.1, planeHit.x + dragOffset.x));
          const nextZ = Math.max(-1.6, Math.min(1.6, planeHit.z + dragOffset.z));
          activeGroup.position.set(nextX, 0, nextZ);
        }
        return;
      }

      // Hover cursor hint
      const hoverHits = raycaster.intersectObjects(objectsGroup.children, true);
      renderer.domElement.style.cursor = hoverHits.length > 0 ? 'move' : 'grab';
    };

    const finishDrag = (event: PointerEvent) => {
      const activeGroup = resolveDraggingGroup();
      if (!activeGroup) {
        draggingId = null;
        draggingGroup = null;
        return;
      }
      const movedId = draggingId;
      const finalX = activeGroup.position.x;
      const finalZ = activeGroup.position.z;

      draggingId = null;
      draggingGroup = null;
      controls.enabled = true;
      renderer.domElement.style.cursor = 'grab';

      try {
        renderer.domElement.releasePointerCapture(event.pointerId);
      } catch {
        // ignore release errors
      }

      if (movedId && onUpdateTransformRef.current) {
        const mappedX = Math.max(5, Math.min(95, 50 + (finalX / 3.6) * 100));
        const mappedY = Math.max(10, Math.min(90, 50 + (finalZ / 1.4) * 100));
        onUpdateTransformRef.current(movedId, {
          x: Number(mappedX.toFixed(1)),
          y: Number(mappedY.toFixed(1)),
          z: Number(finalZ.toFixed(3)),
        });
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', finishDrag);
    renderer.domElement.addEventListener('pointercancel', finishDrag);

    let animId = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    if (onRegisterSnapshotRef.current) {
      onRegisterSnapshotRef.current(() => {
        try {
          renderer.render(scene, camera);
          return renderer.domElement.toDataURL('image/png');
        } catch {
          return null;
        }
      });
    }

    return () => {
      cancelAnimationFrame(animId);
      if (onRegisterSnapshotRef.current) {
        onRegisterSnapshotRef.current(null);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', finishDrag);
      renderer.domElement.removeEventListener('pointercancel', finishDrag);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isArPassthrough]);

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (cameraPreset) {
      case 'frontal':
        camera.position.set(0, 1.65, 5.0);
        controls.target.set(0, 1.1, 0);
        break;
      case 'isometric':
        camera.position.set(3.2, 2.4, 3.8);
        controls.target.set(0, 1.0, 0);
        break;
      case 'lateral':
        camera.position.set(-4.2, 1.6, 1.2);
        controls.target.set(0, 1.0, 0);
        break;
      case 'top':
        camera.position.set(0, 5.0, 0.8);
        controls.target.set(0, 0.5, 0);
        break;
    }
  }, [cameraPreset]);

  useEffect(() => {
    if (!objectsGroupRef.current || !sceneRef.current) return;
    const group = objectsGroupRef.current;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      obj.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    elements.forEach((item) => {
      const elementGroup = create3DModelForElement(item, selectedId === item.id);
      elementGroup.userData = { id: item.id };

      const posX = ((item.x - 50) / 100) * 3.6;
      const posZ = item.z !== undefined ? item.z : ((item.y - 50) / 100) * 1.4;
      elementGroup.position.set(posX, 0, posZ);
      elementGroup.rotation.y = (item.rotation * Math.PI) / 180;
      const s = item.scale;
      elementGroup.scale.set(s, s, s);

      group.add(elementGroup);
    });
  }, [elements, selectedId]);

  return (
    <div className="relative w-full h-full min-h-[460px] overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

function seededRand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function create3DModelForElement(item: SimulatorElement, isSelected: boolean): THREE.Group {
  const root = new THREE.Group();
  const baseColor = new THREE.Color(item.color || '#F6CFD6');
  const accentColor = new THREE.Color(item.accentColor || '#F9E396');

  if (isSelected) {
    const ringGeo = new THREE.RingGeometry(0.68, 0.76, 36);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xC84673, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    root.add(ring);

    const innerRingGeo = new THREE.RingGeometry(0.58, 0.62, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0xF9E396, side: THREE.DoubleSide });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.025;
    root.add(innerRing);
  }

  switch (item.type) {
    case 'panel-arch': {
      const archGroup = new THREE.Group();
      const shape = new THREE.Shape();
      const w = 0.95;
      const h = 1.9;
      const r = w / 2;
      shape.moveTo(-r, 0);
      shape.lineTo(r, 0);
      shape.lineTo(r, h - r);
      shape.absarc(0, h - r, r, 0, Math.PI, false);
      shape.lineTo(-r, 0);

      const archGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      });
      archGeo.center();
      const archMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.72,
        metalness: 0.05,
      });
      const archMesh = new THREE.Mesh(archGeo, archMat);
      archMesh.position.y = h / 2;
      archMesh.castShadow = true;
      archMesh.receiveShadow = true;
      archGroup.add(archMesh);

      const ribCount = 14;
      for (let i = 0; i < ribCount; i++) {
        const ribGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8);
        const ribMat = new THREE.MeshStandardMaterial({
          color: baseColor.clone().offsetHSL(0, 0, -0.05),
          roughness: 0.8,
        });
        const rib = new THREE.Mesh(ribGeo, ribMat);
        const rx = -0.38 + (i / (ribCount - 1)) * 0.76;
        rib.position.set(rx, 0.72, 0.05);
        rib.castShadow = true;
        archGroup.add(rib);
      }

      const signGeo = new THREE.BoxGeometry(0.52, 0.12, 0.025);
      const signMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 1.45, 0.06);
      archGroup.add(sign);

      root.add(archGroup);
      break;
    }

    case 'arch-metal-circle': {
      const ringGroup = new THREE.Group();
      const metalMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.78,
        roughness: 0.25,
      });
      const torus = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.035, 16, 64), metalMat);
      torus.position.y = 1.15;
      torus.castShadow = true;
      ringGroup.add(torus);

      const innerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.018, 12, 64), metalMat);
      innerTorus.position.y = 1.15;
      ringGroup.add(innerTorus);

      const legGeo = new THREE.BoxGeometry(0.35, 0.04, 0.5);
      const leg1 = new THREE.Mesh(legGeo, metalMat);
      leg1.position.set(-0.6, 0.02, 0);
      leg1.castShadow = true;
      const leg2 = new THREE.Mesh(legGeo, metalMat);
      leg2.position.set(0.6, 0.02, 0);
      leg2.castShadow = true;
      ringGroup.add(leg1, leg2);

      root.add(ringGroup);
      break;
    }

    case 'arch-metal-rect': {
      const rectGroup = new THREE.Group();
      const metalMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.75,
        roughness: 0.28,
      });
      const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.05, 12);
      const leftPost = new THREE.Mesh(postGeo, metalMat);
      leftPost.position.set(-0.85, 1.025, 0);
      leftPost.castShadow = true;
      const rightPost = new THREE.Mesh(postGeo, metalMat);
      rightPost.position.set(0.85, 1.025, 0);
      rightPost.castShadow = true;

      const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.75, 12), metalMat);
      topBar.rotation.z = Math.PI / 2;
      topBar.position.set(0, 2.05, 0);
      topBar.castShadow = true;

      const footGeo = new THREE.BoxGeometry(0.32, 0.04, 0.45);
      const foot1 = new THREE.Mesh(footGeo, metalMat);
      foot1.position.set(-0.85, 0.02, 0);
      const foot2 = new THREE.Mesh(footGeo, metalMat);
      foot2.position.set(0.85, 0.02, 0);

      const drapeMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.85,
        transparent: true,
        opacity: 0.55,
      });
      const drape = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.95, 0.02), drapeMat);
      drape.position.set(-0.52, 1.0, 0.01);

      rectGroup.add(leftPost, rightPost, topBar, foot1, foot2, drape);
      root.add(rectGroup);
      break;
    }

    case 'curtain-lights': {
      const curtainGroup = new THREE.Group();
      const fabricMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.9,
        transparent: true,
        opacity: 0.82,
      });
      const backdrop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.1, 0.04), fabricMat);
      backdrop.position.set(0, 1.05, -0.2);
      backdrop.receiveShadow = true;
      curtainGroup.add(backdrop);

      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xFFFDF0,
        emissive: accentColor,
        emissiveIntensity: 1.5,
      });
      for (let col = -3; col <= 3; col++) {
        for (let row = 0; row < 5; row++) {
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), bulbMat);
          bulb.position.set(col * 0.28, 0.35 + row * 0.4, -0.16);
          curtainGroup.add(bulb);
        }
      }
      root.add(curtainGroup);
      break;
    }

    case 'cylinder-tall':
    case 'cylinder-medium':
    case 'cylinder-low': {
      const heights = {
        'cylinder-tall': 0.95,
        'cylinder-medium': 0.75,
        'cylinder-low': 0.55,
      };
      const radius = {
        'cylinder-tall': 0.24,
        'cylinder-medium': 0.23,
        'cylinder-low': 0.22,
      };
      const h = heights[item.type as keyof typeof heights] || 0.75;
      const r = radius[item.type as keyof typeof radius] || 0.23;

      const cylGroup = new THREE.Group();
      const cylMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.65,
        metalness: 0.08,
      });
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 36), cylMat);
      cyl.position.y = h / 2;
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      cylGroup.add(cyl);

      const rimMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.65,
        roughness: 0.28,
      });
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.015, r + 0.015, 0.03, 36), rimMat);
      rim.position.y = h + 0.015;
      rim.castShadow = true;
      cylGroup.add(rim);

      root.add(cylGroup);
      break;
    }

    case 'table-main': {
      const tableGroup = new THREE.Group();
      const topMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.55,
        metalness: 0.08,
      });
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.75), topMat);
      top.position.y = 0.78;
      top.castShadow = true;
      tableGroup.add(top);

      const legMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.6,
        roughness: 0.3,
      });
      const legPositions = [
        [-0.72, -0.3],
        [0.72, -0.3],
        [-0.72, 0.3],
        [0.72, 0.3],
      ];
      legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.75, 16), legMat);
        leg.position.set(lx, 0.375, lz);
        leg.castShadow = true;
        tableGroup.add(leg);
      });

      root.add(tableGroup);
      break;
    }

    case 'table-round': {
      const roundGroup = new THREE.Group();
      const topMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.5 });
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 32), topMat);
      top.position.y = 0.74;
      top.castShadow = true;

      const metalMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.65, roughness: 0.25 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.72, 16), metalMat);
      stem.position.y = 0.36;
      stem.castShadow = true;

      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.04, 24), metalMat);
      foot.position.y = 0.02;
      foot.castShadow = true;

      roundGroup.add(top, stem, foot);
      root.add(roundGroup);
      break;
    }

    case 'chair-throne': {
      const chairGroup = new THREE.Group();
      const fabricMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.85 });
      const goldMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.7, roughness: 0.28 });

      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.14, 24), fabricMat);
      seat.position.y = 0.48;
      seat.castShadow = true;

      const backShape = new THREE.CylinderGeometry(0.32, 0.32, 0.75, 24, 1, false, Math.PI * 0.6, Math.PI * 0.8);
      const backrest = new THREE.Mesh(backShape, fabricMat);
      backrest.position.set(0, 0.85, -0.04);
      backrest.castShadow = true;

      const legOffsets = [
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ];
      legOffsets.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.44, 12), goldMat);
        leg.position.set(lx, 0.22, lz);
        leg.castShadow = true;
        chairGroup.add(leg);
      });

      chairGroup.add(seat, backrest);
      root.add(chairGroup);
      break;
    }

    case 'balloon-garland-curved':
    case 'balloon-asymmetric':
    case 'balloon-double-cascade': {
      const garlandGroup = new THREE.Group();

      const curvePoints =
        item.type === 'balloon-double-cascade'
          ? [
              new THREE.Vector3(-1.1, 0.15, 0),
              new THREE.Vector3(-0.95, 1.3, 0.1),
              new THREE.Vector3(-0.35, 2.05, 0.15),
              new THREE.Vector3(0.45, 2.05, 0.1),
              new THREE.Vector3(1.0, 1.35, 0.05),
              new THREE.Vector3(1.15, 0.25, 0),
            ]
          : item.type === 'balloon-asymmetric'
          ? [
              new THREE.Vector3(-0.95, 0.2, 0),
              new THREE.Vector3(-0.9, 1.2, 0.1),
              new THREE.Vector3(-0.4, 2.0, 0.15),
              new THREE.Vector3(0.5, 2.1, 0.05),
              new THREE.Vector3(1.0, 1.6, -0.1),
            ]
          : [
              new THREE.Vector3(-0.8, 0.3, 0),
              new THREE.Vector3(-0.6, 1.3, 0.1),
              new THREE.Vector3(0.0, 1.9, 0.15),
              new THREE.Vector3(0.7, 1.7, 0.1),
              new THREE.Vector3(1.1, 0.8, -0.05),
            ];

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const points = curve.getPoints(item.type === 'balloon-double-cascade' ? 30 : 24);
      const softWhite = new THREE.Color('#FFFDFB');

      points.forEach((pt, idx) => {
        const isCluster = idx % 2 === 0;
        const clusterSize = isCluster ? 3 : 1;

        for (let b = 0; b < clusterSize; b++) {
          const seed = idx * 17 + b * 31;
          const radius = 0.12 + seededRand(seed) * 0.16;
          const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);

          const rPick = seededRand(seed + 5);
          const pickColor = rPick > 0.55 ? baseColor : rPick > 0.2 ? accentColor : softWhite;
          const isChrome = rPick < 0.18;

          const sphereMat = new THREE.MeshStandardMaterial({
            color: pickColor,
            roughness: isChrome ? 0.22 : 0.38,
            metalness: isChrome ? 0.65 : 0.05,
          });

          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          const offset = new THREE.Vector3(
            (seededRand(seed + 1) - 0.5) * 0.24,
            (seededRand(seed + 2) - 0.5) * 0.24,
            (seededRand(seed + 3) - 0.5) * 0.24
          );
          sphere.position.copy(pt).add(offset);
          sphere.castShadow = true;
          garlandGroup.add(sphere);
        }
      });

      root.add(garlandGroup);
      break;
    }

    case 'balloon-column': {
      const colGroup = new THREE.Group();
      const layers = 8;
      for (let l = 0; l < layers; l++) {
        const y = 0.2 + l * 0.24;
        const count = 4;
        for (let c = 0; c < count; c++) {
          const angle = (c / count) * Math.PI * 2 + l * 0.5;
          const seed = l * 13 + c * 7;
          const dist = 0.16 + seededRand(seed) * 0.07;
          const r = 0.13 + seededRand(seed + 1) * 0.07;

          const pickColor = (l + c) % 2 === 0 ? baseColor : accentColor;
          const sphereMat = new THREE.MeshStandardMaterial({
            color: pickColor,
            roughness: 0.35,
            metalness: 0.1,
          });
          const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), sphereMat);
          sphere.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
          sphere.castShadow = true;
          colGroup.add(sphere);
        }
      }
      root.add(colGroup);
      break;
    }

    case 'balloon-giant': {
      const giantGroup = new THREE.Group();
      const jumboMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.25,
        metalness: 0.12,
      });
      const jumbo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), jumboMat);
      jumbo.position.y = 1.75;
      jumbo.castShadow = true;
      giantGroup.add(jumbo);

      const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.08, 12), jumboMat);
      knot.position.y = 1.32;
      giantGroup.add(knot);

      const str = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 1.3, 6),
        new THREE.MeshBasicMaterial({ color: accentColor })
      );
      str.position.y = 0.65;
      giantGroup.add(str);

      root.add(giantGroup);
      break;
    }

    case 'neon-sign': {
      const neonGroup = new THREE.Group();
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.36),
        new THREE.MeshStandardMaterial({ color: accentColor, transparent: true, opacity: 0.18 })
      );
      back.position.y = 1.5;
      neonGroup.add(back);

      const barGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.64, 8);
      const neonMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: 1.35,
        roughness: 0.1,
      });
      const bar1 = new THREE.Mesh(barGeo, neonMat);
      bar1.rotation.z = Math.PI / 2;
      bar1.position.set(0, 1.56, 0.02);
      const bar2 = new THREE.Mesh(barGeo, neonMat);
      bar2.rotation.z = Math.PI / 2;
      bar2.position.set(0, 1.44, 0.02);
      neonGroup.add(bar1, bar2);

      root.add(neonGroup);
      break;
    }

    case 'led-numbers': {
      const numGroup = new THREE.Group();
      const numGeo = new THREE.BoxGeometry(0.3, 0.9, 0.15);
      const numMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.6 });
      const num1 = new THREE.Mesh(numGeo, numMat);
      num1.position.set(-0.2, 0.45, 0);
      num1.castShadow = true;
      const num2 = new THREE.Mesh(numGeo, numMat);
      num2.position.set(0.2, 0.45, 0);
      num2.castShadow = true;
      numGroup.add(num1, num2);

      for (let i = 0; i < 4; i++) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 12, 12),
          new THREE.MeshStandardMaterial({
            color: accentColor,
            emissive: accentColor,
            emissiveIntensity: 1.5,
          })
        );
        bulb.position.set(-0.2, 0.2 + i * 0.2, 0.08);
        numGroup.add(bulb);
      }

      root.add(numGroup);
      break;
    }

    case 'floral-arrangement': {
      const florGroup = new THREE.Group();
      const urn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.13, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.75 })
      );
      urn.position.y = 0.225;
      urn.castShadow = true;
      florGroup.add(urn);

      for (let f = 0; f < 9; f++) {
        const seed = f * 19;
        const rose = new THREE.Mesh(
          new THREE.SphereGeometry(0.09 + seededRand(seed) * 0.05, 12, 12),
          new THREE.MeshStandardMaterial({
            color: f % 2 === 0 ? baseColor : accentColor,
            roughness: 0.7,
          })
        );
        rose.position.set(
          (seededRand(seed + 1) - 0.5) * 0.28,
          0.48 + seededRand(seed + 2) * 0.24,
          (seededRand(seed + 3) - 0.5) * 0.28
        );
        rose.castShadow = true;
        florGroup.add(rose);
      }

      root.add(florGroup);
      break;
    }

    case 'cake-stand': {
      const cakeGroup = new THREE.Group();
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.14, 0.15, 24),
        new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.6, roughness: 0.3 })
      );
      stand.position.y = 0.075;
      cakeGroup.add(stand);

      const tier1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.16, 24),
        new THREE.MeshStandardMaterial({ color: 0xFFFDFB, roughness: 0.85 })
      );
      tier1.position.y = 0.23;
      tier1.castShadow = true;
      cakeGroup.add(tier1);

      const tier2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.14, 24),
        new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 })
      );
      tier2.position.y = 0.38;
      tier2.castShadow = true;
      cakeGroup.add(tier2);

      root.add(cakeGroup);
      break;
    }

    default: {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.4),
        new THREE.MeshStandardMaterial({ color: baseColor })
      );
      box.position.y = 0.3;
      box.castShadow = true;
      root.add(box);
      break;
    }
  }

  return root;
}
