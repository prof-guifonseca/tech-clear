'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import qrcode from 'qrcode-generator';

import './lixeira-maker.css';

export default function LixeiraMakerScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const $ = <T extends Element = HTMLElement>(sel: string) =>
      root.querySelector(sel) as T | null;
    const $$ = <T extends Element = HTMLElement>(sel: string) =>
      Array.from(root.querySelectorAll(sel)) as T[];

    const COLORS = {
      plastic: 0xd32f2f,
      paperMetal: 0x1976d2,
      organic: 0x5d4037,
      reject: 0x5e5e5e,
    } as const;
    type Kind = keyof typeof COLORS;
    const NAMES: Record<Kind, string> = {
      plastic: 'Plástico',
      paperMetal: 'Papel/Metal',
      organic: 'Orgânico',
      reject: 'Rejeito',
    };
    const COMPARTMENT_BEARING: Record<Kind, number> = {
      plastic: (3 * Math.PI) / 2,
      paperMetal: 0,
      organic: Math.PI / 2,
      reject: Math.PI,
    };

    const BOM = [
      { key: 'arduino',    cat: 'electronic', name: 'Arduino Uno R3 (clone)',         qty: 1, unit: 55, note: 'controlador principal' },
      { key: 'esp32cam',   cat: 'electronic', name: 'ESP32-CAM com placa USB',        qty: 1, unit: 75, note: 'visão por câmera + WiFi' },
      { key: 'hcsr04',     cat: 'electronic', name: 'HC-SR04 ultrassônico',           qty: 1, unit: 12, note: 'detecta aproximação' },
      { key: 'sg90',       cat: 'electronic', name: 'Servomotor SG90 9g',             qty: 1, unit: 15, note: 'gira a calha' },
      { key: 'inductive',  cat: 'electronic', name: 'Sensor indutivo LJ12A3 (4 mm)',  qty: 1, unit: 28, note: 'confirma metal' },
      { key: 'humidity',   cat: 'electronic', name: 'Sensor capacitivo de umidade',   qty: 1, unit: 9,  note: 'detecta orgânico/molhado' },
      { key: 'loadcell',   cat: 'electronic', name: 'Célula de carga 1 kg + HX711',   qty: 1, unit: 38, note: 'pesagem do item' },
      { key: 'oled',       cat: 'electronic', name: 'OLED 0.96" 128×64 I²C',          qty: 1, unit: 25, note: 'feedback visual + QR' },
      { key: 'ledring',    cat: 'electronic', name: 'Anel WS2812 com 8 LEDs',         qty: 1, unit: 18, note: 'cor por categoria' },
      { key: 'buzzer',     cat: 'electronic', name: 'Buzzer passivo 5 V',             qty: 1, unit: 4,  note: 'sinal sonoro' },
      { key: 'button',     cat: 'electronic', name: 'Botão tátil',                    qty: 1, unit: 2,  note: 'reset/manual' },
      { key: 'breadboard', cat: 'electronic', name: 'Protoboard 400 furos',           qty: 1, unit: 12, note: 'prototipagem' },
      { key: 'jumpers',    cat: 'electronic', name: 'Kit jumpers M-M / M-F / F-F',    qty: 1, unit: 18, note: 'ligação' },
      { key: 'psu',        cat: 'electronic', name: 'Fonte 5 V 2 A USB',              qty: 1, unit: 28, note: 'alimentação' },
      { key: 'drum',       cat: 'structural', name: 'Tambor 20 L (doação/reuso)',     qty: 1, unit: 0,  note: 'corpo principal' },
      { key: 'paint',      cat: 'structural', name: 'Tinta spray (4 cores + primer)', qty: 5, unit: 13, note: 'pintura CONAMA' },
      { key: 'cardboard',  cat: 'structural', name: 'Papelão duplo (caixas reaproveitadas)', qty: 1, unit: 0, note: 'divisórias internas' },
      { key: 'mdf',        cat: 'structural', name: 'MDF 6 mm (sobras)',              qty: 1, unit: 12, note: 'tampa e suporte' },
      { key: 'pvc',        cat: 'structural', name: 'Tubo PVC 75 mm × 30 cm',         qty: 1, unit: 14, note: 'calha' },
      { key: 'hinge',      cat: 'structural', name: 'Dobradiça pequena',              qty: 2, unit: 4,  note: 'tampa motorizada' },
      { key: 'stickers',   cat: 'structural', name: 'Adesivos coloridos',             qty: 1, unit: 8,  note: 'etiquetas dos compartimentos' },
      { key: 'tape',       cat: 'structural', name: 'Fita isolante (4 cores)',        qty: 4, unit: 4,  note: 'detalhes/identificação' },
      { key: 'screws',     cat: 'structural', name: 'Parafusos diversos',             qty: 1, unit: 10, note: 'montagem' },
      { key: 'glue',       cat: 'structural', name: 'Cola quente + bastão',           qty: 1, unit: 14, note: 'fixação rápida' },
      { key: 'feet',       cat: 'structural', name: 'Pés de borracha',                qty: 4, unit: 2,  note: 'antiderrapante' },
    ];
    const BOM_TOTAL = BOM.reduce((s, i) => s + i.qty * i.unit, 0);

    const MAT = {
      aluBrushed: new THREE.MeshStandardMaterial({ color: 0xa9adb1, metalness: 0.85, roughness: 0.46 }),
      drumGray: new THREE.MeshStandardMaterial({ color: 0xb6bcc4, metalness: 0.45, roughness: 0.65 }),
      cardBrown: new THREE.MeshStandardMaterial({ color: 0xb38a4e, metalness: 0.0, roughness: 0.95 }),
      mdfWood: new THREE.MeshStandardMaterial({ color: 0xcfa56b, metalness: 0.0, roughness: 0.85 }),
      plasticWhite: new THREE.MeshStandardMaterial({ color: 0xeceff2, metalness: 0.05, roughness: 0.55 }),
      pvcWhite: new THREE.MeshStandardMaterial({ color: 0xe6e9ed, metalness: 0.05, roughness: 0.45 }),
      arduinoBlue: new THREE.MeshStandardMaterial({ color: 0x0a4d9e, metalness: 0.2, roughness: 0.6 }),
      pcbGreen: new THREE.MeshStandardMaterial({ color: 0x0e5a2c, metalness: 0.2, roughness: 0.65 }),
      chipBlack: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.4, roughness: 0.5 }),
      metalSilver: new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.92, roughness: 0.32 }),
      cameraLens: new THREE.MeshStandardMaterial({ color: 0x0a0a0e, metalness: 0.6, roughness: 0.2 }),
      sensorChrome: new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 0.85, roughness: 0.35 }),
      rubber: new THREE.MeshStandardMaterial({ color: 0x14171c, metalness: 0.0, roughness: 0.95 }),
      ledOff: new THREE.MeshStandardMaterial({ color: 0x2a2f3a, metalness: 0.0, roughness: 0.4, emissive: 0x000000 }),
      ledRingOn: new THREE.MeshStandardMaterial({ color: 0xeaf2ff, emissive: 0xa0c8ff, emissiveIntensity: 0.9, metalness: 0, roughness: 0.3 }),
      ledGreen: new THREE.MeshStandardMaterial({ color: 0x66ff88, emissive: 0x44ff66, emissiveIntensity: 1.4, metalness: 0, roughness: 0.2 }),
      ledRed: new THREE.MeshStandardMaterial({ color: 0xff5566, emissive: 0xff2233, emissiveIntensity: 1.4, metalness: 0, roughness: 0.2 }),
      floor: new THREE.MeshStandardMaterial({ color: 0x171b22, metalness: 0.0, roughness: 1.0 }),
      glass: new THREE.MeshStandardMaterial({ color: 0xb9d6e6, metalness: 0.0, roughness: 0.06, transparent: true, opacity: 0.22 }),
      wireRed: new THREE.MeshStandardMaterial({ color: 0xc63b3b, metalness: 0.0, roughness: 0.8 }),
      wireBlack: new THREE.MeshStandardMaterial({ color: 0x1a1a1d, metalness: 0.0, roughness: 0.8 }),
      wireYellow: new THREE.MeshStandardMaterial({ color: 0xe0b631, metalness: 0.0, roughness: 0.8 }),
    };
    function paintMat(hex: number) {
      return new THREE.MeshStandardMaterial({ color: hex, metalness: 0.1, roughness: 0.55 });
    }

    const BOM_MESHES: Record<string, THREE.Object3D[]> = {};
    function tagBom<T extends THREE.Object3D>(mesh: T, key: string): T {
      mesh.userData = mesh.userData || {};
      mesh.userData.bomKey = key;
      if (!BOM_MESHES[key]) BOM_MESHES[key] = [];
      BOM_MESHES[key].push(mesh);
      return mesh;
    }

    const stage = $('.lk-stage')!;
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d12);
    scene.fog = new THREE.Fog(0x0b0d12, 320, 720);

    const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.5, 2000);
    camera.position.set(160, 110, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x8090a8, 0.34));
    const keyLight = new THREE.DirectionalLight(0xfff3df, 1.05);
    keyLight.position.set(120, 220, 160);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -150;
    keyLight.shadow.camera.right = 150;
    keyLight.shadow.camera.top = 180;
    keyLight.shadow.camera.bottom = -50;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 600;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0x9ec5ff, 0.45);
    fill.position.set(-180, 120, 60);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffaf66, 0.32);
    rim.position.set(0, 60, -180);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(420, 64), MAT.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(420, 42, 0x2a3242, 0x1a1f2a);
    grid.position.y = 0.05;
    scene.add(grid);

    function makeOrbit(camera: THREE.PerspectiveCamera, dom: HTMLElement) {
      const target = new THREE.Vector3(0, 50, 0);
      const sph = new THREE.Spherical();
      const offset = new THREE.Vector3();
      offset.copy(camera.position).sub(target);
      sph.setFromVector3(offset);
      const state = {
        isDown: false,
        button: 0,
        lastX: 0,
        lastY: 0,
        autoRotate: true,
        autoRotateSpeed: 0.0017,
        minDistance: 55,
        maxDistance: 520,
        minPolar: 0.18,
        maxPolar: Math.PI / 2 - 0.04,
      };
      function onDown(e: MouseEvent) {
        e.preventDefault();
        state.isDown = true;
        state.button = e.button;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
      }
      function onMove(e: MouseEvent) {
        if (!state.isDown) return;
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        if (state.button === 2 || e.shiftKey) {
          const ps = sph.radius * 0.0018;
          const right = new THREE.Vector3();
          right.setFromMatrixColumn(camera.matrix, 0);
          const up = new THREE.Vector3();
          up.setFromMatrixColumn(camera.matrix, 1);
          target.add(right.multiplyScalar(-dx * ps)).add(up.multiplyScalar(dy * ps));
        } else {
          sph.theta -= dx * 0.005;
          sph.phi -= dy * 0.005;
          sph.phi = Math.max(state.minPolar, Math.min(state.maxPolar, sph.phi));
        }
      }
      function onUp() {
        state.isDown = false;
      }
      function onWheel(e: WheelEvent) {
        e.preventDefault();
        const f = Math.exp(e.deltaY * 0.0012);
        sph.radius = Math.max(state.minDistance, Math.min(state.maxDistance, sph.radius * f));
      }
      let pinchDist = 0;
      function onTouchStart(e: TouchEvent) {
        if (e.touches.length === 1) {
          state.isDown = true;
          state.button = 0;
          state.lastX = e.touches[0].clientX;
          state.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          pinchDist = Math.hypot(dx, dy);
        }
      }
      function onTouchMove(e: TouchEvent) {
        if (e.touches.length === 1 && state.isDown) {
          e.preventDefault();
          const dx = e.touches[0].clientX - state.lastX;
          const dy = e.touches[0].clientY - state.lastY;
          state.lastX = e.touches[0].clientX;
          state.lastY = e.touches[0].clientY;
          sph.theta -= dx * 0.006;
          sph.phi -= dy * 0.006;
          sph.phi = Math.max(state.minPolar, Math.min(state.maxPolar, sph.phi));
        } else if (e.touches.length === 2) {
          e.preventDefault();
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const d = Math.hypot(dx, dy);
          if (pinchDist > 0) {
            const f = pinchDist / d;
            sph.radius = Math.max(state.minDistance, Math.min(state.maxDistance, sph.radius * f));
          }
          pinchDist = d;
        }
      }
      function onTouchEnd() {
        state.isDown = false;
        pinchDist = 0;
      }
      const onCtxMenu = (e: Event) => e.preventDefault();
      dom.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      dom.addEventListener('wheel', onWheel, { passive: false });
      dom.addEventListener('contextmenu', onCtxMenu);
      dom.addEventListener('touchstart', onTouchStart, { passive: false });
      dom.addEventListener('touchmove', onTouchMove, { passive: false });
      dom.addEventListener('touchend', onTouchEnd);
      function update() {
        if (state.autoRotate && !state.isDown) {
          sph.theta += state.autoRotateSpeed;
        }
        offset.setFromSpherical(sph);
        camera.position.copy(target).add(offset);
        camera.lookAt(target);
      }
      function setView(name: string) {
        const r = 210;
        if (name === 'front') {
          sph.radius = r;
          sph.theta = 0;
          sph.phi = Math.PI / 2 - 0.25;
        } else if (name === 'side') {
          sph.radius = r;
          sph.theta = Math.PI / 2;
          sph.phi = Math.PI / 2 - 0.25;
        } else if (name === 'top') {
          sph.radius = r * 0.95;
          sph.theta = Math.PI / 4;
          sph.phi = 0.25;
        } else if (name === 'iso') {
          sph.radius = r;
          sph.theta = Math.PI / 4 + 0.3;
          sph.phi = Math.PI / 2 - 0.55;
        }
      }
      function dispose() {
        dom.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        dom.removeEventListener('wheel', onWheel);
        dom.removeEventListener('contextmenu', onCtxMenu);
        dom.removeEventListener('touchstart', onTouchStart);
        dom.removeEventListener('touchmove', onTouchMove);
        dom.removeEventListener('touchend', onTouchEnd);
      }
      return { update, target, state, setView, dispose };
    }
    const orbit = makeOrbit(camera, renderer.domElement);

    function nm<T extends THREE.Object3D>(g: T, n: string): T {
      g.name = n;
      return g;
    }
    function box(w: number, h: number, d: number, mat: THREE.Material, x?: number, y?: number, z?: number) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x || 0, y || 0, z || 0);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(rt: number, rb: number, h: number, segs: number | undefined, mat: THREE.Material) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs || 32), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function torus(r: number, tube: number, segs: number | undefined, mat: THREE.Material) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, segs || 24), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function wire(start: THREE.Vector3, end: THREE.Vector3, sag: number, color: 'r' | 'y' | 'k') {
      const g = new THREE.Group();
      const mat = color === 'r' ? MAT.wireRed : color === 'y' ? MAT.wireYellow : MAT.wireBlack;
      const segs = 8;
      const sp = start;
      const ep = end;
      let prev = sp.clone();
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        const p = new THREE.Vector3(
          sp.x + (ep.x - sp.x) * t,
          sp.y + (ep.y - sp.y) * t - sag * Math.sin(t * Math.PI),
          sp.z + (ep.z - sp.z) * t,
        );
        const dir = new THREE.Vector3().subVectors(p, prev);
        const len = dir.length();
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, len, 6), mat);
        seg.position.copy(prev).add(p).multiplyScalar(0.5);
        seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        seg.castShadow = true;
        g.add(seg);
        prev = p;
      }
      return g;
    }

    function buildBase() {
      const g = nm(new THREE.Group(), 'base');
      for (const ang of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
        const r = 19;
        const foot = cyl(2, 2.4, 1.6, 16, MAT.rubber);
        foot.position.set(Math.cos(ang) * r, 0.8, Math.sin(ang) * r);
        tagBom(foot, 'feet');
        foot.userData.label = 'Pé de borracha (R$ 2 cada × 4)';
        g.add(foot);
      }
      return g;
    }

    function buildDrum() {
      const g = nm(new THREE.Group(), 'drum');
      const R = 22;
      const Hd = 60;
      const baseY = 1.6;
      const body = cyl(R, R, Hd, 64, MAT.drumGray);
      body.position.y = baseY + Hd / 2;
      tagBom(body, 'drum');
      body.userData.label = 'Tambor 20 L (corpo principal)';
      g.add(body);
      const rim = torus(R - 0.05, 0.6, 28, MAT.metalSilver);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = baseY + 1.0;
      g.add(rim);
      const rimT = torus(R - 0.05, 0.6, 28, MAT.metalSilver);
      rimT.rotation.x = Math.PI / 2;
      rimT.position.y = baseY + Hd;
      g.add(rimT);

      function paintPatch(centerAng: number, hex: number) {
        const arcHalf = (Math.PI / 4) * 0.85;
        const angA = centerAng - arcHalf;
        const angB = centerAng + arcHalf;
        const r1 = R + 0.05;
        const r2 = R + 0.4;
        const segs = 18;
        const shape = new THREE.Shape();
        for (let i = 0; i <= segs; i++) {
          const a = angA + (i / segs) * (angB - angA);
          const x = Math.cos(a) * r2;
          const y = Math.sin(a) * r2;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        for (let i = segs; i >= 0; i--) {
          const a = angA + (i / segs) * (angB - angA);
          shape.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        }
        shape.closePath();
        const geom = new THREE.ExtrudeGeometry(shape, { depth: Hd * 0.78, bevelEnabled: false });
        geom.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(geom, paintMat(hex));
        mesh.position.y = baseY + Hd * 0.5 + (Hd * 0.78) / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        tagBom(mesh, 'paint');
        mesh.userData.label = 'Tinta spray (CONAMA)';
        return mesh;
      }
      g.add(paintPatch(COMPARTMENT_BEARING.plastic, COLORS.plastic));
      g.add(paintPatch(COMPARTMENT_BEARING.paperMetal, COLORS.paperMetal));
      g.add(paintPatch(COMPARTMENT_BEARING.organic, COLORS.organic));
      g.add(paintPatch(COMPARTMENT_BEARING.reject, COLORS.reject));

      function makeLabel(text: string, hex: number) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const cx = c.getContext('2d')!;
        cx.fillStyle = '#ffffff';
        cx.fillRect(0, 0, 256, 128);
        cx.fillStyle = '#' + hex.toString(16).padStart(6, '0');
        cx.fillRect(0, 0, 256, 28);
        cx.fillStyle = '#0a1a2a';
        cx.font = 'bold 36px sans-serif';
        cx.fillText(text, 16, 80);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshStandardMaterial({ map: tex, metalness: 0, roughness: 0.55 });
      }
      function attachLabel(centerAng: number, text: string, hex: number) {
        const lblPlane = new THREE.Mesh(new THREE.PlaneGeometry(11, 5.5), makeLabel(text, hex));
        lblPlane.position.set(
          Math.cos(centerAng) * (R + 0.45),
          baseY + Hd * 0.32,
          Math.sin(centerAng) * (R + 0.45),
        );
        lblPlane.lookAt(
          new THREE.Vector3(Math.cos(centerAng) * (R + 50), baseY + Hd * 0.32, Math.sin(centerAng) * (R + 50)),
        );
        tagBom(lblPlane, 'stickers');
        lblPlane.userData.label = 'Adesivo da categoria';
        g.add(lblPlane);
      }
      attachLabel(COMPARTMENT_BEARING.plastic, 'PLÁSTICO', COLORS.plastic);
      attachLabel(COMPARTMENT_BEARING.paperMetal, 'PAPEL/METAL', COLORS.paperMetal);
      attachLabel(COMPARTMENT_BEARING.organic, 'ORGÂNICO', COLORS.organic);
      attachLabel(COMPARTMENT_BEARING.reject, 'REJEITO', COLORS.reject);

      const bottom = cyl(R - 0.4, R - 0.4, 0.5, 64, MAT.drumGray);
      bottom.position.y = baseY + 0.25;
      g.add(bottom);
      g.userData.R = R;
      g.userData.Hd = Hd;
      g.userData.baseY = baseY;
      return g;
    }

    function buildDividers() {
      const g = nm(new THREE.Group(), 'dividers');
      const R = 22 - 0.6;
      const Hd = 50;
      const baseY = 2.0;
      const t = 0.6;
      function divider(angle: number) {
        const len = 2 * R;
        const wall = box(len, Hd, t, MAT.cardBrown, 0, baseY + Hd / 2, 0);
        wall.rotation.y = -angle;
        tagBom(wall, 'cardboard');
        wall.userData.label = 'Divisória de papelão duplo';
        return wall;
      }
      g.add(divider(Math.PI / 4));
      g.add(divider((3 * Math.PI) / 4));
      return g;
    }

    function buildLid() {
      const g = nm(new THREE.Group(), 'lid');
      const baseY = 1.6;
      const Hd = 60;
      const R = 22;
      const lidY = baseY + Hd + 0.6;
      const outerR = R + 0.05;
      const holeR = 7;
      const ring = new THREE.Shape();
      ring.absarc(0, 0, outerR, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
      ring.holes.push(hole);
      const geom = new THREE.ExtrudeGeometry(ring, { depth: 1.0, bevelEnabled: false });
      geom.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geom, MAT.mdfWood);
      mesh.position.y = lidY + 1.0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tagBom(mesh, 'mdf');
      mesh.userData.label = 'Tampa em MDF 6 mm';
      g.add(mesh);
      const r = torus(holeR + 0.4, 0.4, 24, MAT.metalSilver);
      r.rotation.x = Math.PI / 2;
      r.position.y = lidY + 1.0;
      g.add(r);
      g.userData.lidY = lidY;
      return g;
    }

    function buildSensorBox() {
      const g = nm(new THREE.Group(), 'sensorBox');
      const baseY = 1.6;
      const Hd = 60;
      const lidY = baseY + Hd + 0.6 + 1.0;
      const boxY = lidY + 0.4;
      const Wb = 22;
      const Db = 8;
      const Hb = 8;
      const wallT = 0.4;

      const back = box(Wb, Hb, wallT, MAT.mdfWood, 0, boxY + Hb / 2, Db / 2 - wallT / 2);
      const front = box(Wb, Hb, wallT, MAT.mdfWood, 0, boxY + Hb / 2, -Db / 2 + wallT / 2);
      const right = box(wallT, Hb, Db - 2 * wallT, MAT.mdfWood, Wb / 2 - wallT / 2, boxY + Hb / 2, 0);
      const left = box(wallT, Hb, Db - 2 * wallT, MAT.mdfWood, -Wb / 2 + wallT / 2, boxY + Hb / 2, 0);
      const bottom = box(Wb, wallT, Db, MAT.mdfWood, 0, boxY + wallT / 2, 0);
      const top = box(Wb, wallT, Db, MAT.glass, 0, boxY + Hb - wallT / 2, 0);
      [back, front, right, left, bottom].forEach((m) => {
        tagBom(m, 'mdf');
        m.userData.label = 'Caixa MDF da eletrônica';
        g.add(m);
      });
      g.add(top);

      const arduino = new THREE.Group();
      arduino.add(box(7, 0.4, 5, MAT.arduinoBlue));
      arduino.add(box(1.4, 1.1, 1.4, MAT.metalSilver, -2.4, 0.7, 1.6));
      arduino.add(box(1.0, 1.0, 1.4, MAT.chipBlack, -2.5, 0.7, -1.4));
      arduino.add(box(2.0, 0.5, 1.0, MAT.chipBlack, 1.0, 0.4, 0.0));
      for (let i = -2.5; i <= 2.5; i += 0.5) {
        arduino.add(box(0.2, 0.4, 0.2, MAT.metalSilver, i, 0.4, 2.2));
        arduino.add(box(0.2, 0.4, 0.2, MAT.metalSilver, i, 0.4, -2.2));
      }
      arduino.position.set(-5, boxY + 0.6, 0);
      arduino.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          tagBom(o, 'arduino');
          o.userData.label = 'Arduino Uno R3';
        }
      });
      g.add(arduino);

      const esp = new THREE.Group();
      esp.add(box(2.7, 0.3, 4.0, MAT.pcbGreen));
      esp.add(box(1.0, 0.6, 1.0, MAT.chipBlack, 0, 0.4, -0.5));
      const espLens = cyl(0.6, 0.6, 0.5, 16, MAT.cameraLens);
      espLens.rotation.x = Math.PI / 2;
      espLens.position.set(0, 0.4, 1.4);
      esp.add(espLens);
      esp.position.set(2, boxY + 0.7, 0);
      esp.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          tagBom(o, 'esp32cam');
          o.userData.label = 'ESP32-CAM';
        }
      });
      g.add(esp);

      const oled = new THREE.Group();
      const oledBody = box(2.7, 1.6, 0.4, MAT.chipBlack);
      oled.add(oledBody);
      const oledCanvas = document.createElement('canvas');
      oledCanvas.width = 256;
      oledCanvas.height = 128;
      const ox = oledCanvas.getContext('2d')!;

      function drawQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, text: string) {
        try {
          const qr = qrcode(0, 'M');
          qr.addData(text);
          qr.make();
          const count = qr.getModuleCount();
          const px = size / count;
          ctx.fillStyle = '#000814';
          ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
          ctx.fillStyle = '#cfe1ff';
          for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
              if (qr.isDark(r, c)) {
                ctx.fillRect(
                  Math.floor(x + c * px),
                  Math.floor(y + r * px),
                  Math.ceil(px) + 0.5,
                  Math.ceil(px) + 0.5,
                );
              }
            }
          }
        } catch (e) {
          console.warn('Falha ao gerar QR:', e);
          ctx.fillStyle = '#001a30';
          ctx.fillRect(x, y, size, size);
          ctx.strokeStyle = '#5a8aaf';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);
          ctx.fillStyle = '#9bd6ff';
          ctx.font = 'bold 13px monospace';
          ctx.fillText('TECH', x + size / 2 - 18, y + size / 2 - 4);
          ctx.fillText('CLEAR', x + size / 2 - 22, y + size / 2 + 14);
        }
      }

      type OLEDState = {
        qr?: string;
        title?: string;
        detail?: string;
        color?: string;
        confidence?: number;
        foot?: string;
      };
      function drawOLED(s: OLEDState) {
        ox.fillStyle = '#000814';
        ox.fillRect(0, 0, 256, 128);
        if (s.qr) {
          drawQR(ox, 6, 6, 116, s.qr);
          ox.fillStyle = '#9bd6ff';
          ox.font = 'bold 16px sans-serif';
          ox.fillText('ESCANEIE', 134, 36);
          ox.font = '12px sans-serif';
          ox.fillStyle = '#cfe1ff';
          ox.fillText('para iniciar', 134, 60);
          ox.fillText('sessão no app', 134, 78);
          ox.font = '10px monospace';
          ox.fillStyle = '#5a8aaf';
          const code = (s.qr.split('/').pop() || '').slice(0, 8);
          ox.fillText('id ' + code, 134, 116);
          return;
        }
        ox.fillStyle = '#9bd6ff';
        ox.font = '10px monospace';
        ox.fillText('TECH-CLEAR', 6, 12);
        ox.strokeStyle = '#1a3a55';
        ox.beginPath();
        ox.moveTo(0, 16);
        ox.lineTo(256, 16);
        ox.stroke();
        ox.font = 'bold 22px sans-serif';
        ox.fillStyle = s.color || '#9bff9b';
        ox.fillText(s.title || 'PRONTO', 6, 56);
        ox.font = '13px sans-serif';
        ox.fillStyle = '#cfe1ff';
        ox.fillText(s.detail || 'aguardando...', 6, 78);
        if (typeof s.confidence === 'number') {
          ox.fillStyle = '#1a3a55';
          ox.fillRect(6, 92, 244, 6);
          ox.fillStyle = '#9bd6ff';
          ox.fillRect(6, 92, 244 * s.confidence, 6);
        }
        ox.fillStyle = '#5a8aaf';
        ox.font = '10px monospace';
        ox.fillText(s.foot || 'wifi: ok | servo: idle', 6, 118);
      }
      drawOLED({ qr: 'techclear://join/' + Math.random().toString(36).slice(2, 8).toUpperCase() });
      const oledTex = new THREE.CanvasTexture(oledCanvas);
      oledTex.colorSpace = THREE.SRGBColorSpace;
      const oledMat = new THREE.MeshStandardMaterial({
        map: oledTex,
        emissive: 0xffffff,
        emissiveMap: oledTex,
        emissiveIntensity: 0.7,
        metalness: 0,
        roughness: 0.3,
      });
      const oledScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.4), oledMat);
      oledScreen.position.z = -0.21;
      oledScreen.rotation.y = Math.PI;
      oled.add(oledScreen);
      oled.position.set(-3, boxY + 4, -Db / 2 - 0.05);
      oled.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          tagBom(o, 'oled');
          o.userData.label = 'Display OLED 128×64';
        }
      });
      g.add(oled);
      g.userData.drawOLED = drawOLED;
      g.userData.oledTex = oledTex;

      const hcsr = new THREE.Group();
      hcsr.add(box(4.5, 0.6, 2.0, MAT.pcbGreen, 0, 0, 0));
      const eye1 = cyl(0.85, 0.85, 0.9, 18, MAT.metalSilver);
      eye1.position.set(-1.4, 0.75, 0);
      hcsr.add(eye1);
      const eye2 = cyl(0.85, 0.85, 0.9, 18, MAT.metalSilver);
      eye2.position.set(1.4, 0.75, 0);
      hcsr.add(eye2);
      hcsr.position.set(6, boxY + Hb + 0.1, 0);
      hcsr.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          tagBom(o, 'hcsr04');
          o.userData.label = 'Sensor ultrassônico HC-SR04';
        }
      });
      g.add(hcsr);

      const wsRing = new THREE.Group();
      const ringR = 7.5;
      const leds: THREE.Mesh[] = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const off = MAT.ledOff.clone();
        const ld = cyl(0.5, 0.5, 0.4, 12, off);
        ld.rotation.x = Math.PI / 2;
        ld.position.set(Math.cos(a) * ringR, lidY + 1.4, Math.sin(a) * ringR);
        ld.userData = { led: true, offMat: off, bomKey: 'ledring', label: 'Anel WS2812 (8 LEDs)' };
        leds.push(ld);
        BOM_MESHES['ledring'] = BOM_MESHES['ledring'] || [];
        BOM_MESHES['ledring'].push(ld);
        wsRing.add(ld);
      }
      g.userData.leds = leds;
      g.add(wsRing);

      const buzzer = cyl(0.7, 0.7, 0.8, 16, MAT.chipBlack);
      buzzer.position.set(8, boxY + 0.9, 1.5);
      buzzer.rotation.x = Math.PI / 2;
      tagBom(buzzer, 'buzzer');
      buzzer.userData.label = 'Buzzer passivo 5 V';
      g.add(buzzer);

      const btnBase = box(1.2, 0.4, 1.2, MAT.metalSilver, 8, boxY + 0.6, -1.5);
      tagBom(btnBase, 'button');
      btnBase.userData.label = 'Botão tátil';
      g.add(btnBase);
      const btnTop = cyl(0.45, 0.45, 0.4, 12, paintMat(0xd83a3a));
      btnTop.position.set(8, boxY + 1.0, -1.5);
      tagBom(btnTop, 'button');
      btnTop.userData.label = 'Botão tátil';
      g.add(btnTop);

      const bb = box(8, 0.6, 4.5, MAT.plasticWhite);
      bb.position.set(0, boxY + 0.7, 1.6);
      tagBom(bb, 'breadboard');
      bb.userData.label = 'Protoboard 400 furos';
      g.add(bb);

      const psu = box(4, 2.2, 2.6, MAT.chipBlack, -Wb / 2 - 3, boxY + 1.1, 0);
      tagBom(psu, 'psu');
      psu.userData.label = 'Fonte 5 V 2 A';
      g.add(psu);
      g.add(
        wire(
          new THREE.Vector3(-Wb / 2 - 3 + 2, boxY + 1.1, 0),
          new THREE.Vector3(-5 - 2.4, boxY + 1.0, -1.4),
          0.4,
          'k',
        ),
      );

      g.userData.boxY = boxY;
      g.userData.Hb = Hb;
      return g;
    }

    function buildSorter() {
      const g = nm(new THREE.Group(), 'sorter');
      const SY = 38;
      const tray = cyl(5, 5, 0.4, 24, MAT.glass);
      tray.position.y = SY + 6;
      g.add(tray);
      const cap = box(2.5, 0.3, 1.4, MAT.pcbGreen, 4, SY + 6.5, 0);
      tagBom(cap, 'humidity');
      cap.userData.label = 'Sensor capacitivo de umidade';
      g.add(cap);
      const ind = cyl(0.9, 0.9, 3.0, 16, MAT.sensorChrome);
      ind.position.set(-4, SY + 6.5, 0);
      ind.rotation.x = Math.PI / 2;
      tagBom(ind, 'inductive');
      ind.userData.label = 'Sensor indutivo (metal)';
      g.add(ind);
      const lc = box(7, 1.0, 1.8, MAT.metalSilver, 0, SY + 5.4, 0);
      tagBom(lc, 'loadcell');
      lc.userData.label = 'Célula de carga 1 kg';
      g.add(lc);
      const hx = box(2.4, 0.5, 1.6, MAT.pcbGreen, 0, SY + 5.0, 2.0);
      tagBom(hx, 'loadcell');
      hx.userData.label = 'Módulo HX711';
      g.add(hx);
      g.add(box(0.8, 0.25, 0.6, MAT.chipBlack, 0, SY + 5.3, 2.0));

      const chute = new THREE.Group();
      chute.name = 'sorter.chute';
      const tubeStart = new THREE.Vector3(0, SY + 1, 0);
      const tubeEnd = new THREE.Vector3(11, SY - 6, 0);
      const tubeDir = new THREE.Vector3().subVectors(tubeEnd, tubeStart);
      const tubeLen = tubeDir.length();
      const tube = cyl(3.75, 3.75, tubeLen, 24, MAT.pvcWhite);
      tube.position.copy(tubeStart).add(tubeEnd).multiplyScalar(0.5);
      tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tubeDir.clone().normalize());
      tagBom(tube, 'pvc');
      tube.userData.label = 'Tubo PVC 75 mm (calha)';
      chute.add(tube);
      g.add(chute);
      g.userData.chute = chute;

      const servo = new THREE.Group();
      servo.add(box(2.3, 1.2, 1.2, paintMat(0x2966c2), 0, 0, 0));
      const shaft = cyl(0.3, 0.3, 1.6, 12, paintMat(0xeac34a));
      shaft.position.y = 1.0;
      servo.add(shaft);
      servo.position.set(0, SY + 4, 0);
      servo.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          tagBom(o, 'sg90');
          o.userData.label = 'Servomotor SG90';
        }
      });
      g.add(servo);

      g.userData.sorterY = SY;
      return g;
    }

    function buildVisibleWiring(boxY: number, sorterY: number) {
      const g = nm(new THREE.Group(), 'wiring');
      g.add(wire(new THREE.Vector3(-2, boxY + 0.4, -2.5), new THREE.Vector3(-4, sorterY + 6.5, -1), 1.0, 'r'));
      g.add(wire(new THREE.Vector3(-1, boxY + 0.4, -2.5), new THREE.Vector3(0, sorterY + 5.0, 2.0), 1.0, 'k'));
      g.add(wire(new THREE.Vector3(0, boxY + 0.4, -2.5), new THREE.Vector3(4, sorterY + 6.5, 0), 1.0, 'y'));
      g.add(wire(new THREE.Vector3(1, boxY + 0.4, -2.5), new THREE.Vector3(0, sorterY + 4, 0), 0.8, 'r'));
      g.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          tagBom(o, 'jumpers');
          o.userData.label = 'Jumpers (cabos)';
        }
      });
      return g;
    }

    function buildItem(kind: Kind) {
      const g = new THREE.Group();
      g.name = 'item.' + kind;
      if (kind === 'plastic') {
        g.add(cyl(1.9, 2.1, 5.5, 24, paintMat(0xfff0a0)));
      } else if (kind === 'paperMetal') {
        g.add(cyl(1.5, 1.5, 5.0, 24, MAT.metalSilver));
      } else if (kind === 'organic') {
        const a = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12), paintMat(0x6a8a3a));
        a.scale.set(1.4, 0.5, 1.0);
        g.add(a);
      } else if (kind === 'reject') {
        const a = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 0), paintMat(0x6c5e54));
        a.scale.set(1.1, 0.8, 1.1);
        g.add(a);
      }
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      return g;
    }

    const bin = new THREE.Group();
    bin.name = 'bin';
    const base = buildBase();
    bin.add(base);
    const drum = buildDrum();
    bin.add(drum);
    const dividers = buildDividers();
    bin.add(dividers);
    const lid = buildLid();
    bin.add(lid);
    const sensorBox = buildSensorBox();
    bin.add(sensorBox);
    const sorter = buildSorter();
    bin.add(sorter);
    const wiring = buildVisibleWiring(sensorBox.userData.boxY, sorter.userData.sorterY);
    bin.add(wiring);
    scene.add(bin);

    function setLabel(obj: THREE.Object3D, label: string) {
      obj.userData = obj.userData || {};
      obj.userData.label = label;
    }
    setLabel(base, 'Pés de borracha');
    setLabel(drum, 'Tambor 20 L (corpo)');
    setLabel(dividers, 'Divisórias internas em papelão');
    setLabel(lid, 'Tampa MDF com abertura central');
    setLabel(sensorBox, 'Caixa MDF com eletrônica');
    setLabel(sorter, 'Mecanismo de separação (calha PVC + servo)');
    setLabel(wiring, 'Fiação visível');

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoverEnabled = true;
    const annotEl = $('.lk-annot')!;

    function findUserData(obj: THREE.Object3D | null, prop: string): unknown {
      let o: THREE.Object3D | null = obj;
      while (o) {
        if (o.userData && o.userData[prop] !== undefined) return o.userData[prop];
        o = o.parent;
      }
      return null;
    }

    function onPointerMove(e: PointerEvent) {
      pointer.x = (e.clientX / W()) * 2 - 1;
      pointer.y = -(e.clientY / H()) * 2 + 1;
      if (!hoverEnabled) {
        annotEl.classList.remove('show');
        clearHL();
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(bin.children, true);
      if (hits.length) {
        const obj = hits[0].object;
        const label = findUserData(obj, 'label') as string | null;
        const bomKey = findUserData(obj, 'bomKey') as string | null;
        if (label) {
          annotEl.textContent = label;
          (annotEl as HTMLElement).style.left = e.clientX + 'px';
          (annotEl as HTMLElement).style.top = e.clientY + 'px';
          annotEl.classList.add('show');
        } else annotEl.classList.remove('show');
        if (bomKey) {
          highlightBom(bomKey);
          const row = $('.lk-bom .row[data-key="' + bomKey + '"]');
          if (row) row.classList.add('hl');
        } else clearHL();
      } else {
        annotEl.classList.remove('show');
        clearHL();
      }
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    type HLMesh = THREE.Mesh & {
      userData: { _hlSaved?: { emissive: THREE.Color | null; emissiveIntensity: number } };
    };
    let hlMeshes: HLMesh[] = [];
    function highlightBom(key: string) {
      if (hlMeshes.length) {
        clearHL();
      }
      const arr = BOM_MESHES[key];
      if (!arr) return;
      for (const m of arr as HLMesh[]) {
        const mat = m.material as THREE.MeshStandardMaterial | undefined;
        if (!m.isMesh || !mat) continue;
        m.userData._hlSaved = m.userData._hlSaved || {
          emissive: mat.emissive ? mat.emissive.clone() : null,
          emissiveIntensity: mat.emissiveIntensity || 0,
        };
        if (mat.emissive) {
          mat.emissive.setHex(0x4ea1ff);
          mat.emissiveIntensity = 0.55;
          mat.needsUpdate = true;
        }
        hlMeshes.push(m);
      }
    }
    function clearHL() {
      for (const m of hlMeshes) {
        const mat = m.material as THREE.MeshStandardMaterial | undefined;
        if (m.userData._hlSaved && mat && mat.emissive) {
          if (m.userData._hlSaved.emissive) {
            mat.emissive.copy(m.userData._hlSaved.emissive);
          }
          mat.emissiveIntensity = m.userData._hlSaved.emissiveIntensity;
          mat.needsUpdate = true;
        }
      }
      hlMeshes.length = 0;
      $$('.lk-bom .row.hl').forEach((r) => r.classList.remove('hl'));
    }

    function setXray(on: boolean) {
      const mats = [MAT.drumGray, MAT.mdfWood];
      for (const m of mats) {
        m.transparent = on;
        m.opacity = on ? 0.22 : 1.0;
        m.depthWrite = !on;
        m.needsUpdate = true;
      }
    }
    function setExploded(on: boolean) {
      if (on) {
        lid.position.y = 14;
        sensorBox.position.y = 28;
        sorter.position.y = 8;
        dividers.position.y = -2;
      } else {
        lid.position.y = 0;
        sensorBox.position.y = 0;
        sorter.position.y = 0;
        dividers.position.y = 0;
      }
    }

    type AnimState = {
      active: boolean;
      kind: Kind | null;
      t: number;
      item: THREE.Group | null;
      leds: THREE.Mesh[];
      confidence: number;
      contam: boolean;
      finalKind: Kind | null;
      rotateStart: number | null;
      rotateEnd: number | null;
      scanning?: boolean;
      identified?: boolean;
      openedShown?: boolean;
      statsApplied?: boolean;
    };
    const anim: AnimState = {
      active: false,
      kind: null,
      t: 0,
      item: null,
      leds: sensorBox.userData.leds as THREE.Mesh[],
      confidence: 0,
      contam: false,
      finalKind: null,
      rotateStart: null,
      rotateEnd: null,
    };
    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * Math.min(1, Math.max(0, t));
    }
    function smooth(t: number) {
      return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
    }

    function setStatus(title: string, detail: string, color?: string) {
      $('#lk-status-title')!.textContent = title;
      $('#lk-status-detail')!.textContent = detail;
      const led = $('#lk-status-led') as HTMLElement;
      led.style.background = color || '#7ee787';
      led.style.boxShadow = '0 0 8px ' + (color || '#7ee787');
    }

    function genSessionToken() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let t = '';
      for (let i = 0; i < 6; i++) t += chars[Math.floor(Math.random() * chars.length)];
      return t;
    }
    let SESSION_QR = 'techclear://join/' + genSessionToken();
    function rotateSessionToken() {
      SESSION_QR = 'techclear://join/' + genSessionToken();
    }

    type OLEDState = {
      qr?: string;
      title?: string;
      detail?: string;
      color?: string;
      confidence?: number;
      foot?: string;
    };
    function refreshOLED(s?: OLEDState) {
      const drawOLED = sensorBox.userData.drawOLED as ((s: OLEDState) => void) | undefined;
      if (!drawOLED) return;
      const idle = !anim.active && (!s || Object.keys(s).length === 0);
      const payload: OLEDState = idle
        ? { qr: SESSION_QR }
        : Object.assign(
            {
              title: 'PRONTO',
              detail: 'aguardando...',
              color: '#9bff9b',
              foot: 'wifi: ok | servo: ' + (anim.active ? 'mov' : 'idle'),
            },
            s || {},
          );
      drawOLED(payload);
      const oledTex = sensorBox.userData.oledTex as THREE.CanvasTexture;
      oledTex.needsUpdate = true;
    }

    const CONFIDENCE_RANGE: Record<Kind, [number, number]> = {
      plastic: [0.85, 0.95],
      paperMetal: [0.86, 0.96],
      organic: [0.78, 0.9],
      reject: [0.72, 0.88],
    };
    function rollConfidence(kind: Kind) {
      const r = CONFIDENCE_RANGE[kind] || [0.8, 0.92];
      return r[0] + Math.random() * (r[1] - r[0]);
    }
    const T = { detect: 0.45, fall1: 0.85, scan: 1.6, rotate: 1.0, fall2: 0.85, rest: 0.5 };
    const CONTAM_PROB = 0.15;

    function startDemo(kind: Kind) {
      if (anim.active) return;
      anim.active = true;
      anim.kind = kind;
      anim.t = 0;
      anim.scanning = false;
      anim.identified = false;
      anim.openedShown = false;
      anim.statsApplied = false;
      anim.rotateStart = null;
      anim.rotateEnd = null;
      sorter.userData.chute.rotation.y = 0;
      anim.leds.forEach((ld) => {
        ld.material = ld.userData.offMat;
      });
      anim.confidence = rollConfidence(kind);
      const cantBeContam = kind === 'reject' || kind === 'organic';
      anim.contam = !cantBeContam && Math.random() < CONTAM_PROB;
      anim.finalKind = anim.contam ? 'reject' : kind;
      if (anim.item) {
        bin.remove(anim.item);
      }
      anim.item = buildItem(kind);
      const lidY = 1.6 + 60 + 0.6 + 1.0;
      anim.item.position.set(0, lidY + 14, 0);
      anim.item.rotation.set(Math.random() * 0.6, Math.random() * Math.PI * 2, Math.random() * 0.6);
      bin.add(anim.item);
      setStatus('Detectando', 'HC-SR04: aproximação', '#9ec5ff');
      refreshOLED({ title: 'DETECT.', detail: 'HC-SR04 ativo', color: '#9bd6ff' });
    }
    function stopDemo() {
      anim.active = false;
      anim.kind = null;
      anim.t = 0;
      if (anim.item) {
        bin.remove(anim.item);
        anim.item = null;
      }
      sorter.userData.chute.rotation.y = 0;
      if (anim.leds)
        anim.leds.forEach((l) => {
          l.material = l.userData.offMat;
        });
      setStatus('Pronto', 'Aguardando entrada de resíduo', '#7ee787');
      refreshOLED({});
    }
    function chuteAngleFor(kind: Kind) {
      return -COMPARTMENT_BEARING[kind];
    }

    function updateAnim(dt: number) {
      if (!anim.active || !anim.item || !anim.finalKind) return;
      anim.t += dt;
      let t = anim.t;

      let p = T.detect;
      if (t < p) {
        const idx = Math.floor((t * 14) % 8);
        anim.leds.forEach((ld, i) => {
          ld.material = i === idx ? MAT.ledRingOn : ld.userData.offMat;
        });
        anim.item.position.y = 1.6 + 60 + 1.6 + 14 - smooth(t / p) * 5;
        return;
      }
      t -= p;

      p = T.fall1;
      const trayY = sorter.userData.sorterY + 6.4;
      if (t < p) {
        const k = smooth(t / p);
        const y0 = 1.6 + 60 + 1.6 + 9;
        anim.item.position.y = lerp(y0, trayY, k);
        anim.item.rotation.x += dt * 1.6;
        anim.item.rotation.z += dt * 0.8;
        if (t / p > 0.6 && !anim.scanning) {
          anim.scanning = true;
          setStatus('Analisando', 'VOC + indutivo + balança', '#ffb84a');
        }
        return;
      }
      t -= p;

      p = T.scan;
      if (t < p) {
        const idx = Math.floor((t * 10) % 8);
        anim.leds.forEach((ld, i) => {
          const on = i === idx || i === (idx + 4) % 8;
          ld.material = on ? MAT.ledRingOn : ld.userData.offMat;
        });
        const liveConf = anim.confidence * smooth(t / (p * 0.85));
        refreshOLED({
          title: 'ANÁLISE',
          detail: anim.contam ? 'umidade alta!' : 'classificando...',
          color: anim.contam ? '#ff8a8a' : '#ffd28a',
          confidence: liveConf,
        });
        if (t > p * 0.78 && !anim.identified) {
          anim.identified = true;
          const k = anim.finalKind;
          const okColor: Record<Kind, string> = {
            plastic: '#ff8888',
            paperMetal: '#9ec5ff',
            organic: '#c1a08a',
            reject: '#bcbcbc',
          };
          const head = anim.contam ? 'CONTAMIN.' : NAMES[k].toUpperCase();
          const det = anim.contam ? 'lave/seque' : '→ ' + NAMES[k];
          setStatus(anim.contam ? 'Contaminado' : 'Identificado', det, okColor[k]);
          refreshOLED({ title: head, detail: det, color: okColor[k], confidence: anim.confidence });
          const colorMat = paintMat(COLORS[k]);
          anim.leds.forEach((ld) => {
            ld.material = colorMat;
          });
        }
        anim.item.position.y = trayY + Math.sin(t * 8) * 0.05;
        anim.item.rotation.y += dt * 0.5;
        return;
      }
      t -= p;
      anim.leds.forEach((ld) => {
        ld.material = ld.userData.offMat;
      });

      p = T.rotate;
      if (anim.rotateStart === null) {
        const rs = sorter.userData.chute.rotation.y as number;
        let re = chuteAngleFor(anim.finalKind);
        let delta = re - rs;
        while (delta > Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;
        re = rs + delta;
        anim.rotateStart = rs;
        anim.rotateEnd = re;
      }
      if (t < p) {
        const k = smooth(t / p);
        sorter.userData.chute.rotation.y = lerp(anim.rotateStart, anim.rotateEnd!, k);
        return;
      }
      t -= p;

      p = T.fall2;
      if (t < p) {
        const tt = t / p;
        const bearing = COMPARTMENT_BEARING[anim.finalKind];
        const R = 13;
        const startX = 0;
        const startZ = 0;
        const startY = trayY;
        const targetX = Math.cos(bearing) * R;
        const targetZ = Math.sin(bearing) * R;
        const targetY = 6;
        anim.item.position.x = lerp(startX, targetX, tt);
        anim.item.position.z = lerp(startZ, targetZ, tt);
        anim.item.position.y = startY + (targetY - startY) * (tt * tt);
        anim.item.rotation.x += dt * 4;
        anim.item.rotation.z += dt * 3;
        return;
      }
      t -= p;

      p = T.rest;
      if (t < p) {
        if (!anim.statsApplied) {
          anim.statsApplied = true;
          refreshOLED({
            title: 'OK',
            detail: 'evento → app',
            color: '#9bff9b',
            confidence: anim.confidence,
            foot: 'wifi: ✓ enviado',
          });
        }
        return;
      }

      anim.active = false;
      anim.scanning = false;
      anim.identified = false;
      anim.statsApplied = false;
      anim.rotateStart = null;
      anim.rotateEnd = null;
      rotateSessionToken();
      setStatus('Pronto', 'Aguardando próximo descarte', '#7ee787');
      refreshOLED({});
      window.setTimeout(() => {
        if (!anim.active) sorter.userData.chute.rotation.y = 0;
      }, 1200);
    }

    const demoBtns = $$('[data-demo]');
    const demoHandlers: Array<() => void> = [];
    demoBtns.forEach((b) => {
      const handler = () => startDemo(b.getAttribute('data-demo') as Kind);
      b.addEventListener('click', handler);
      demoHandlers.push(() => b.removeEventListener('click', handler));
    });
    const stopBtn = $('#lk-btn-stop')!;
    const stopHandler = () => stopDemo();
    stopBtn.addEventListener('click', stopHandler);

    const toggleHandlers: Array<() => void> = [];
    function bindToggle(id: string, onChange: (on: boolean) => void) {
      const el = $('#' + id) as HTMLElement;
      const handler = () => {
        const on = el.getAttribute('data-on') !== 'true';
        el.setAttribute('data-on', String(on));
        onChange(on);
      };
      el.addEventListener('click', handler);
      toggleHandlers.push(() => el.removeEventListener('click', handler));
    }
    bindToggle('lk-t-xray', setXray);
    bindToggle('lk-t-explode', setExploded);
    bindToggle('lk-t-annotations', (on) => {
      hoverEnabled = on;
      if (!on) {
        annotEl.classList.remove('show');
        clearHL();
      }
    });
    bindToggle('lk-t-rotate', (on) => {
      orbit.state.autoRotate = on;
    });

    const viewBtns = $$('[data-view]');
    const viewHandlers: Array<() => void> = [];
    viewBtns.forEach((b) => {
      const handler = () => orbit.setView(b.getAttribute('data-view')!);
      b.addEventListener('click', handler);
      viewHandlers.push(() => b.removeEventListener('click', handler));
    });

    function renderBOM(filterCat: string) {
      const body = $('#lk-bom-body')!;
      body.innerHTML = '';
      const items = BOM.filter((it) => filterCat === 'all' || it.cat === filterCat);
      for (const it of items) {
        const row = document.createElement('div');
        row.className = 'row';
        row.setAttribute('data-key', it.key);
        const subtotal = it.qty * it.unit;
        const ic = it.cat === 'electronic' ? '⚡' : '⌂';
        row.innerHTML =
          '<div class="ic">' +
          ic +
          '</div>' +
          '<div class="nm">' +
          it.name +
          '<small>' +
          it.note +
          '</small></div>' +
          '<div class="qt">' +
          it.qty +
          '×</div>' +
          '<div class="pr">' +
          (subtotal === 0 ? 'doação' : 'R$ ' + subtotal.toFixed(0)) +
          '</div>';
        row.addEventListener('mouseenter', () => highlightBom(it.key));
        row.addEventListener('mouseleave', () => clearHL());
        body.appendChild(row);
      }
      $('#lk-bom-total')!.textContent = 'R$ ' + BOM_TOTAL.toFixed(0).replace('.', ',');
      $('#lk-hdr-total')!.textContent = 'R$ ' + BOM_TOTAL.toFixed(0).replace('.', ',');
    }
    const tabBtns = $$('.lk-bom .tab');
    const tabHandlers: Array<() => void> = [];
    tabBtns.forEach((tab) => {
      const handler = () => {
        $$('.lk-bom .tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderBOM(tab.getAttribute('data-cat')!);
      };
      tab.addEventListener('click', handler);
      tabHandlers.push(() => tab.removeEventListener('click', handler));
    });
    renderBOM('all');

    const clock = new THREE.Clock();
    let rafId = 0;
    function tick() {
      const dt = Math.min(0.05, clock.getDelta());
      orbit.update();
      updateAnim(dt);
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    }
    function onResize() {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    }
    window.addEventListener('resize', onResize);

    setStatus('Pronto', 'Aguardando entrada de resíduo', '#7ee787');
    refreshOLED({});
    tick();
    window.requestAnimationFrame(onResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      stopBtn.removeEventListener('click', stopHandler);
      demoHandlers.forEach((d) => d());
      toggleHandlers.forEach((d) => d());
      viewHandlers.forEach((d) => d());
      tabHandlers.forEach((d) => d());
      orbit.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mat = m.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else mat?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="lk-scene">
      <div className="lk-stage" />

      <Link href="/" className="lk-back">
        ← Voltar
      </Link>

      <div className="lk-header">
        <h1>Tech-clear — Lixeira Inteligente Maker</h1>
        <div className="sub">
          Tambor 20L reaproveitado · Arduino · 4 compartimentos · feito com material acessível
        </div>
        <div className="total">
          <span className="num" id="lk-hdr-total">R$ 0</span>
          <span className="lbl">custo estimado</span>
        </div>
      </div>

      <div className="lk-panel" id="lk-panel">
        <h3>Demonstração</h3>
        <div className="lk-row">
          <button className="lk-btn" data-demo="plastic">
            <span className="dot" style={{ background: 'var(--plastic)' }} />Plástico
          </button>
          <button className="lk-btn" data-demo="paperMetal">
            <span className="dot" style={{ background: 'var(--paperMetal)' }} />Papel/Metal
          </button>
          <button className="lk-btn" data-demo="organic">
            <span className="dot" style={{ background: 'var(--organic)' }} />Orgânico
          </button>
          <button className="lk-btn" data-demo="reject">
            <span className="dot" style={{ background: 'var(--reject)' }} />Rejeito
          </button>
          <button className="lk-btn full" id="lk-btn-stop">
            Parar / Resetar
          </button>
        </div>

        <h3>Vistas</h3>
        <div className="lk-toggle" data-on="false" id="lk-t-xray">
          <span>Raio-X (paredes transparentes)</span>
          <span className="sw" />
        </div>
        <div className="lk-toggle" data-on="false" id="lk-t-explode">
          <span>Vista explodida</span>
          <span className="sw" />
        </div>
        <div className="lk-toggle" data-on="true" id="lk-t-annotations">
          <span>Anotações ao passar o mouse</span>
          <span className="sw" />
        </div>
        <div className="lk-toggle" data-on="true" id="lk-t-rotate">
          <span>Rotação automática</span>
          <span className="sw" />
        </div>

        <h3>Câmera</h3>
        <div className="lk-row">
          <button className="lk-btn" data-view="front">Frente</button>
          <button className="lk-btn" data-view="side">Lateral</button>
          <button className="lk-btn" data-view="top">Topo</button>
          <button className="lk-btn" data-view="iso">Isométrica</button>
        </div>

        <h3>Compartimentos</h3>
        <div className="lk-legend">
          <div className="item"><span className="swatch" style={{ background: 'var(--plastic)' }} />Vermelho — Plástico (frente)</div>
          <div className="item"><span className="swatch" style={{ background: 'var(--paperMetal)' }} />Azul — Papel + Metal (direita)</div>
          <div className="item"><span className="swatch" style={{ background: 'var(--organic)' }} />Marrom — Orgânico (atrás)</div>
          <div className="item"><span className="swatch" style={{ background: 'var(--reject)' }} />Cinza — Rejeito (esquerda)</div>
        </div>

        <h3>Princípio do projeto</h3>
        <div className="lk-legend">
          <div className="item">
            A lixeira só identifica e roteia. Toda gamificação (pontos, badges, missões) está no app, que recebe os eventos via WiFi.
          </div>
        </div>
      </div>

      <div className="lk-bom">
        <div className="head">
          <h3>Lista de Materiais (BOM)</h3>
          <span className="tot" id="lk-bom-total">R$ 0,00</span>
        </div>
        <div className="tabs">
          <button className="tab active" data-cat="all">Tudo</button>
          <button className="tab" data-cat="electronic">Eletrônica</button>
          <button className="tab" data-cat="structural">Estrutura</button>
        </div>
        <div className="body" id="lk-bom-body" />
        <div className="footer">
          <span>Preços estimados (BR · 2026)</span>
          <span>Passe o mouse → realça no 3D</span>
        </div>
      </div>

      <div className="lk-status">
        <span className="led" id="lk-status-led" />
        <span><b id="lk-status-title">Pronto</b></span>
        <span id="lk-status-detail">Aguardando entrada de resíduo</span>
      </div>

      <div className="lk-annot" />
    </div>
  );
}
