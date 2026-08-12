import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// An endless 3D runner for Maya: dodge obstacles, catch hearts. Built with
// Three.js, kept as a single self-contained overlay (own HUD, own start /
// pause / game-over screens) rather than reusing the app's stage-detail
// UI, since a game needs its own pacing and full-bleed canvas.
//
// The render loop, HUD text, and overlay visibility are all driven
// imperatively via refs instead of React state. At 60fps that's the only
// way to avoid re-render churn, it's the same approach the original
// vanilla-JS prototype used, just wired through refs instead of
// document.getElementById.

const HIGH_SCORE_KEY = "heartRunnerHighScore";

const LANE_X = [-2.4, 0, 2.4];
const PLAYER_HALF_WIDTH = 0.5;
const PLAYER_HALF_DEPTH = 0.4;
const JUMP_HEIGHT = 3.0;
const JUMP_DURATION = 0.55;
const SLIDE_DURATION = 0.55;
const LANE_CHANGE_DURATION = 0.18;
const SPAWN_Z = 70;
const DESPAWN_Z = -8;
const BASE_SPEED = 13;
const MAX_SPEED = 29;
const BASE_FOV = 62;

const PALETTE = {
  skinTones: ["#FFE0BD", "#C68C55", "#8D5524"],
  cape: "#FF6B6B",
  mask: "#FF6B6B",
  suit: "#5B5470",
  ground: 0x9ad1ec,
  sideProp: [0xffd6d6, 0xbfeeda, 0xffd166, 0x8b7fe8, 0x4ecdc4, 0xf868b0],
  barrier: 0xff9f1c,
  overhead: 0x2fbf71,
  block: 0x6c5fd1,
  heart: 0xff5c7a,
};

export default function HeartRunner({ onClose }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const flashRef = useRef(null);
  const swipeHintRef = useRef(null);
  const heartCountRef = useRef(null);
  const distanceValRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const pauseOverlayRef = useRef(null);
  const gameoverOverlayRef = useRef(null);
  const menuHighScoreRef = useRef(null);
  const finalScoreRef = useRef(null);
  const finalHeartsRef = useRef(null);
  const finalDistanceRef = useRef(null);
  const newBestBadgeRef = useRef(null);
  const howBoxRef = useRef(null);
  const apiRef = useRef({});
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const canvas = canvasRef.current;

    /* ---------------- audio (tiny WebAudio blips, no files) ---------------- */
    let audioCtx = null;
    function ensureAudio() {
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
          audioCtx = null;
        }
      }
      return audioCtx;
    }
    function tone(freq, dur, type) {
      const ctx = ensureAudio();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.25));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + (dur || 0.25));
      } catch {
        /* noop: audio is a nice-to-have, never block the game on it */
      }
    }
    const sfxJump = () => tone(520, 0.18, "sine");
    const sfxSlide = () => tone(220, 0.18, "sawtooth");
    const sfxHeart = () => {
      tone(880, 0.12, "triangle");
      setTimeout(() => tone(1046, 0.14, "triangle"), 60);
    };
    const sfxCrash = () => tone(120, 0.4, "sawtooth");
    const sfxSwitch = () => tone(660, 0.08, "square");

    /* ---------------- renderer / scene / camera ---------------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xbfe3f0, 42, 88);

    const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 200);
    let camFollowX = 0;

    // Gradient sky dome instead of a flat background color, sits behind
    // everything (BackSide, no depth write) so it always fills the frame.
    function buildSkyDome() {
      const c = document.createElement("canvas");
      c.width = 2;
      c.height = 256;
      const ctx = c.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#4FB6EE");
      grad.addColorStop(0.5, "#AEE0F5");
      grad.addColorStop(0.82, "#FDEBCB");
      grad.addColorStop(1, "#FFD8B8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(120, 24, 16),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
      );
      return mesh;
    }
    scene.add(buildSkyDome());

    function buildSunGlow() {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(255,246,222,0.95)");
      g.addColorStop(0.4, "rgba(255,230,180,0.35)");
      g.addColorStop(1, "rgba(255,230,180,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
      );
      spr.scale.set(34, 34, 1);
      spr.position.set(-15, 17, 92);
      return spr;
    }
    scene.add(buildSunGlow());

    scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x6b8a5a, 0.95));
    const sun = new THREE.DirectionalLight(0xfff3dd, 1.2);
    sun.position.set(-8, 16, -10);
    scene.add(sun);

    /* ---------------- post-processing: subtle Unreal-style bloom ---------------- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.4, 0.78);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    function resize() {
      const w = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
      const h = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    /* ---------------- ground, rails, ties, side scenery ---------------- */
    const disposables = [];
    const track = (obj) => {
      disposables.push(obj);
      return obj;
    };

    const groundMat = track(new THREE.MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.85, metalness: 0.05 }));
    const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(14, 300)), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = 100;
    scene.add(ground);

    const railMat = track(new THREE.MeshStandardMaterial({ color: 0x8a93a6, roughness: 0.3, metalness: 0.6 }));
    const railGeo = track(new THREE.BoxGeometry(0.12, 0.09, 300));
    LANE_X.forEach((lx) => {
      [-0.62, 0.62].forEach((off) => {
        const r = new THREE.Mesh(railGeo, railMat);
        r.position.set(lx + off, 0.045, 100);
        scene.add(r);
      });
    });

    const tieMat = track(new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.85 }));
    const tieGeo = track(new THREE.BoxGeometry(8.6, 0.12, 0.55));
    const TIE_SPACING = 2.2;
    const TIE_COUNT = 36;
    const TIE_TOTAL = TIE_SPACING * TIE_COUNT;
    const ties = [];
    for (let ti = 0; ti < TIE_COUNT; ti++) {
      const t = new THREE.Mesh(tieGeo, tieMat);
      t.position.set(0, 0.01, ti * TIE_SPACING);
      scene.add(t);
      ties.push(t);
    }

    const trunkMat = track(new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.9 }));
    const leafGeo = track(new THREE.ConeGeometry(1, 1.6, 10));
    const trunkGeo = track(new THREE.CylinderGeometry(0.14, 0.18, 1, 8));
    const hillGeo = track(new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7));

    const PROP_SPACING = 8;
    const PROP_COUNT = 18;
    const PROP_TOTAL = PROP_SPACING * PROP_COUNT;
    const sideProps = [];
    [-1, 1].forEach((side) => {
      for (let i = 0; i < PROP_COUNT; i++) {
        const group = new THREE.Group();
        const baseX = side * (6.8 + Math.random() * 2.2);
        const baseZ = i * PROP_SPACING + Math.random() * 3;
        if (Math.random() < 0.55) {
          const leafColor = [0x6fcf97, 0x4ecdc4, 0xbfeeda][Math.floor(Math.random() * 3)];
          const leafMat = track(new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.75 }));
          const scale = 1.6 + Math.random() * 2.4;
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.scale.set(scale * 0.6, scale * 1.1, scale * 0.6);
          trunk.position.y = scale * 0.5;
          const leaves = new THREE.Mesh(leafGeo, leafMat);
          leaves.scale.set(scale, scale, scale);
          leaves.position.y = scale * 1.35;
          group.add(trunk);
          group.add(leaves);
        } else {
          const hillColor = PALETTE.sideProp[Math.floor(Math.random() * PALETTE.sideProp.length)];
          const hillMat = track(new THREE.MeshStandardMaterial({ color: hillColor, roughness: 0.7 }));
          const hs = 1.6 + Math.random() * 2.6;
          const hill = new THREE.Mesh(hillGeo, hillMat);
          hill.scale.set(hs, hs * 0.9, hs);
          group.add(hill);
        }
        group.position.set(baseX, 0, baseZ);
        scene.add(group);
        sideProps.push(group);
      }
    });

    function updateScenery(dt, speed) {
      ties.forEach((m) => {
        m.position.z -= speed * dt;
        if (m.position.z < -3) m.position.z += TIE_TOTAL;
      });
      sideProps.forEach((m) => {
        m.position.z -= speed * dt;
        if (m.position.z < -10) m.position.z += PROP_TOTAL;
      });
    }

    /* ---------------- player ---------------- */
    function buildPlayer() {
      const root = new THREE.Group();
      const visual = new THREE.Group();
      root.add(visual);

      const shadowMat = track(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }));
      const shadow = new THREE.Mesh(track(new THREE.CircleGeometry(0.5, 20)), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, 0.015, 0);
      root.add(shadow);

      // Physical material (clearcoat) instead of flat Standard, gives the
      // hero's suit and cape a soft glossy sheen under the sun light.
      const bodyMat = track(
        new THREE.MeshPhysicalMaterial({ color: PALETTE.suit, roughness: 0.4, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.25 })
      );
      const torso = new THREE.Mesh(track(new THREE.CylinderGeometry(0.36, 0.44, 1.0, 16)), bodyMat);
      torso.position.y = 1.15;
      visual.add(torso);

      const hip = new THREE.Mesh(track(new THREE.SphereGeometry(0.42, 14, 14)), bodyMat);
      hip.position.y = 0.62;
      hip.scale.set(1, 0.6, 1);
      visual.add(hip);

      const headMat = track(new THREE.MeshStandardMaterial({ color: PALETTE.skinTones[0], roughness: 0.6 }));
      const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.5, 24, 24)), headMat);
      head.position.y = 2.02;
      visual.add(head);

      const hairMat = track(new THREE.MeshStandardMaterial({ color: 0x3b2a22, roughness: 0.7 }));
      const hair = new THREE.Mesh(track(new THREE.SphereGeometry(0.51, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2.1)), hairMat);
      hair.position.set(0, 2.1, -0.02);
      visual.add(hair);

      const maskMat = track(new THREE.MeshPhysicalMaterial({ color: PALETTE.mask, clearcoat: 0.5, roughness: 0.35 }));
      const mask = new THREE.Mesh(track(new THREE.BoxGeometry(1.02, 0.19, 0.5)), maskMat);
      mask.position.set(0, 2.1, 0.06);
      visual.add(mask);

      const eyeMat = track(new THREE.MeshStandardMaterial({ color: 0x2b2338 }));
      const eyeGeo = track(new THREE.SphereGeometry(0.045, 10, 10));
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.17, 2.02, 0.44);
      visual.add(eyeL);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.17, 2.02, 0.44);
      visual.add(eyeR);

      const cheekMat = track(new THREE.MeshStandardMaterial({ color: 0xff9fa8, roughness: 0.9, transparent: true, opacity: 0.55 }));
      const cheekGeo = track(new THREE.SphereGeometry(0.075, 8, 8));
      const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
      cheekL.position.set(-0.3, 1.92, 0.34);
      visual.add(cheekL);
      const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
      cheekR.position.set(0.3, 1.92, 0.34);
      visual.add(cheekR);

      const capeShape = new THREE.Shape();
      capeShape.moveTo(-0.38, 1.6);
      capeShape.lineTo(0.38, 1.6);
      capeShape.quadraticCurveTo(0.5, 0.9, 0.3, 0.2);
      capeShape.lineTo(-0.3, 0.2);
      capeShape.quadraticCurveTo(-0.5, 0.9, -0.38, 1.6);
      const capeMat = track(
        new THREE.MeshPhysicalMaterial({ color: PALETTE.cape, side: THREE.DoubleSide, roughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.3 })
      );
      const cape = new THREE.Mesh(track(new THREE.ShapeGeometry(capeShape)), capeMat);
      cape.position.set(0, 0, -0.28);
      visual.add(cape);

      const limbMat = bodyMat;
      const armGeo = track(new THREE.CylinderGeometry(0.09, 0.09, 0.68, 10));
      const legGeo = track(new THREE.CylinderGeometry(0.12, 0.11, 0.78, 10));

      function makeLimb(geo, mat2, shoulderPos) {
        const pivot = new THREE.Group();
        pivot.position.copy(shoulderPos);
        const mesh = new THREE.Mesh(geo, mat2 || limbMat);
        mesh.position.y = -geo.parameters.height / 2;
        pivot.add(mesh);
        visual.add(pivot);
        return pivot;
      }
      const skinLimbMat = track(new THREE.MeshStandardMaterial({ color: PALETTE.skinTones[0] }));
      const leftArm = makeLimb(armGeo, skinLimbMat, new THREE.Vector3(-0.42, 1.55, 0));
      const rightArm = makeLimb(armGeo, skinLimbMat, new THREE.Vector3(0.42, 1.55, 0));
      const leftLeg = makeLimb(legGeo, bodyMat, new THREE.Vector3(-0.2, 0.78, 0));
      const rightLeg = makeLimb(legGeo, bodyMat, new THREE.Vector3(0.2, 0.78, 0));

      return {
        root,
        visual,
        shadow,
        limbs: { leftArm, rightArm, leftLeg, rightLeg },
      };
    }

    const player = buildPlayer();
    scene.add(player.root);

    const playerState = {
      laneIndex: 1,
      fromX: LANE_X[1],
      toX: LANE_X[1],
      laneChangeT: 1,
      vMode: "ground",
      vT: 0,
      runPhase: 0,
      alive: true,
    };

    function currentPlayerX() {
      if (playerState.laneChangeT >= 1) return playerState.toX;
      const e = 1 - Math.pow(1 - playerState.laneChangeT, 3);
      return playerState.fromX + (playerState.toX - playerState.fromX) * e;
    }

    function changeLane(dir) {
      if (!playerState.alive) return;
      const next = playerState.laneIndex + dir;
      if (next < 0 || next > 2) return;
      playerState.laneIndex = next;
      playerState.fromX = currentPlayerX();
      playerState.toX = LANE_X[next];
      playerState.laneChangeT = 0;
      sfxSwitch();
    }
    function doJump() {
      if (!playerState.alive) return;
      if (playerState.vMode === "ground") {
        playerState.vMode = "jump";
        playerState.vT = 0;
        sfxJump();
      }
    }
    function doSlide() {
      if (!playerState.alive) return;
      if (playerState.vMode === "ground") {
        playerState.vMode = "slide";
        playerState.vT = 0;
        sfxSlide();
      }
    }

    function updatePlayer(dt) {
      if (playerState.laneChangeT < 1) {
        playerState.laneChangeT = Math.min(1, playerState.laneChangeT + dt / LANE_CHANGE_DURATION);
      }
      const x = currentPlayerX();
      player.root.position.x = x;

      const tiltTarget = (playerState.toX - x) * -0.25;
      player.visual.rotation.z += (tiltTarget - player.visual.rotation.z) * Math.min(1, dt * 10);

      let jumpY = 0;
      if (playerState.vMode === "jump") {
        playerState.vT += dt;
        const p = Math.min(1, playerState.vT / JUMP_DURATION);
        jumpY = JUMP_HEIGHT * 4 * p * (1 - p);
        if (p >= 1) playerState.vMode = "ground";
      } else if (playerState.vMode === "slide") {
        playerState.vT += dt;
        const sp = Math.min(1, playerState.vT / SLIDE_DURATION);
        if (sp >= 1) playerState.vMode = "ground";
      }
      player.root.position.y = jumpY;

      const shadowScale = Math.max(0.35, 1 - (jumpY / JUMP_HEIGHT) * 0.65);
      player.shadow.scale.set(shadowScale, shadowScale, shadowScale);
      player.shadow.position.y = 0.015 - jumpY;
      player.shadow.material.opacity = 0.28 * shadowScale;

      const targetScaleY = playerState.vMode === "slide" ? 0.55 : 1;
      player.visual.scale.y += (targetScaleY - player.visual.scale.y) * Math.min(1, dt * 12);
      const targetPitch = playerState.vMode === "slide" ? -0.55 : playerState.vMode === "jump" ? 0.12 : 0;
      player.visual.rotation.x += (targetPitch - player.visual.rotation.x) * Math.min(1, dt * 10);

      const running = playerState.vMode === "ground";
      if (running || playerState.vMode === "jump") {
        playerState.runPhase += dt * (running ? 9 : 5);
      }
      const swing = running ? Math.sin(playerState.runPhase) * 0.75 : playerState.vMode === "jump" ? 0.5 : 0;
      player.limbs.leftArm.rotation.x = swing;
      player.limbs.rightArm.rotation.x = -swing;
      player.limbs.leftLeg.rotation.x = -swing * 0.9;
      player.limbs.rightLeg.rotation.x = swing * 0.9;
    }

    /* ---------------- obstacles & hearts ---------------- */
    function buildHeartGeometry(scale) {
      const s = new THREE.Shape();
      const x = 0,
        y = 0;
      s.moveTo(x, y);
      s.bezierCurveTo(x, y + 0.3, x - 0.6, y + 0.3, x - 0.6, y - 0.05);
      s.bezierCurveTo(x - 0.6, y - 0.35, x - 0.3, y - 0.55, x, y - 0.8);
      s.bezierCurveTo(x + 0.3, y - 0.55, x + 0.6, y - 0.35, x + 0.6, y - 0.05);
      s.bezierCurveTo(x + 0.6, y + 0.3, x, y + 0.3, x, y);
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
      geo.scale(scale, scale, scale);
      geo.center();
      return geo;
    }
    function stripeTexture(colorA, colorB) {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = colorB;
      for (let i = -64; i < 64; i += 16) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 8, 0);
        ctx.lineTo(i + 8 + 64, 64);
        ctx.lineTo(i + 64, 64);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 1);
      return tex;
    }
    function signTexture() {
      const c = document.createElement("canvas");
      c.width = 96;
      c.height = 96;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#2C3244";
      ctx.fillRect(0, 0, 96, 96);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(76, 76);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(76, 20);
      ctx.lineTo(20, 76);
      ctx.stroke();
      return new THREE.CanvasTexture(c);
    }

    const sharedGeo = {
      barrier: track(new THREE.BoxGeometry(1.9, 1.0, 0.6)),
      overhead: track(new THREE.BoxGeometry(7.0, 0.5, 0.5)),
      block: track(new THREE.BoxGeometry(1.9, 3.2, 1.0)),
      heart: track(buildHeartGeometry(0.28)),
    };
    const obstacleMats = {
      barrier: track(new THREE.MeshStandardMaterial({ map: track(stripeTexture("#FF9F1C", "#FFFFFF")), roughness: 0.5 })),
      overhead: track(new THREE.MeshStandardMaterial({ color: PALETTE.overhead, roughness: 0.5 })),
      block: track(new THREE.MeshStandardMaterial({ map: track(signTexture()), roughness: 0.45 })),
    };
    // Emissive intensity turned up so the bloom pass actually catches
    // these, hearts should read as the brightest, most "collectible"
    // thing on screen.
    const heartMat = track(new THREE.MeshStandardMaterial({ color: PALETTE.heart, roughness: 0.3, emissive: 0xff2f57, emissiveIntensity: 0.9 }));
    const heartGlowMat = track(new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.45 }));

    let activeObstacles = [];
    let activeHearts = [];
    let burstParticles = [];

    function spawnObstacle(type, lanes, z) {
      lanes.forEach((laneIdx) => {
        const mesh = new THREE.Mesh(sharedGeo[type], obstacleMats[type]);
        const baseY = type === "barrier" ? 0.5 : type === "overhead" ? 1.55 : 1.6;
        mesh.position.set(LANE_X[laneIdx], baseY, z);
        if (type === "overhead") mesh.position.x = 0;
        scene.add(mesh);
        const entry = { mesh, type, lane: laneIdx, halfDepth: type === "barrier" ? 0.3 : type === "overhead" ? 0.25 : 0.5 };
        activeObstacles.push(entry);
        if (type === "overhead") entry.spanAll = true;
      });
    }
    function spawnHeart(laneIdx, z, yOffset) {
      const mesh = new THREE.Mesh(sharedGeo.heart, heartMat);
      mesh.position.set(LANE_X[laneIdx], 1.1 + (yOffset || 0), z);
      mesh.rotation.z = Math.PI;
      const glow = new THREE.Mesh(sharedGeo.heart, heartGlowMat);
      glow.scale.set(1.35, 1.35, 0.4);
      glow.position.z = -0.06;
      mesh.add(glow);
      scene.add(mesh);
      activeHearts.push({ mesh, lane: laneIdx, phase: Math.random() * Math.PI * 2 });
    }

    let nextWaveDist = 18;
    function maybeSpawnWave(distance) {
      if (distance < nextWaveDist) return;
      const difficulty = Math.min(1, distance / 2200);
      const minGap = 20 - difficulty * 7;
      const maxGap = 30 - difficulty * 8;
      nextWaveDist = distance + minGap + Math.random() * (maxGap - minGap);

      const roll = Math.random();
      let safeLanes = [0, 1, 2];

      if (roll < 0.16) {
        for (let i = 0; i < 3; i++) spawnHeart(i, SPAWN_Z + i * 1.2, i === 1 ? 0.9 : 0.15);
        for (let k = 0; k < 3; k++) spawnHeart(k, SPAWN_Z + 4 + k * 1.2, k === 1 ? 0.9 : 0.15);
        return;
      }

      if (roll < 0.34) {
        const l = Math.floor(Math.random() * 3);
        spawnObstacle("barrier", [l], SPAWN_Z);
        safeLanes = [0, 1, 2].filter((x) => x !== l);
      } else if (roll < 0.5) {
        spawnObstacle("overhead", [0], SPAWN_Z);
        safeLanes = [0, 1, 2];
      } else if (roll < 0.68) {
        const lanes2 = [0, 1, 2];
        const clear = lanes2.splice(Math.floor(Math.random() * 3), 1)[0];
        spawnObstacle("barrier", lanes2, SPAWN_Z);
        safeLanes = [clear];
      } else if (roll < 0.84 && difficulty > 0.12) {
        const l2 = Math.floor(Math.random() * 3);
        spawnObstacle("block", [l2], SPAWN_Z);
        safeLanes = [0, 1, 2].filter((x) => x !== l2);
      } else if (difficulty > 0.3) {
        const lanes3 = [0, 1, 2];
        const clear2 = lanes3.splice(Math.floor(Math.random() * 3), 1)[0];
        spawnObstacle("block", lanes3, SPAWN_Z);
        safeLanes = [clear2];
      } else {
        const l3 = Math.floor(Math.random() * 3);
        spawnObstacle("barrier", [l3], SPAWN_Z);
        safeLanes = [0, 1, 2].filter((x) => x !== l3);
      }

      if (Math.random() < 0.7 && safeLanes.length) {
        const guideLane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
        for (let j = 0; j < 4; j++) spawnHeart(guideLane, SPAWN_Z + 6 + j * 1.6, 0);
      }
    }

    function spawnBurst(pos) {
      for (let i = 0; i < 7; i++) {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ color: PALETTE.heart, transparent: true, opacity: 1 })
        );
        mesh.position.copy(pos);
        scene.add(mesh);
        const ang = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 1.5;
        burstParticles.push({
          mesh,
          vel: new THREE.Vector3(Math.cos(ang) * speed, 2 + Math.random() * 2, Math.sin(ang) * speed * 0.4),
          life: 0.5,
        });
      }
    }

    function updateObstaclesAndHearts(dt, speed) {
      for (let i = activeObstacles.length - 1; i >= 0; i--) {
        const o = activeObstacles[i];
        o.mesh.position.z -= speed * dt;
        if (o.mesh.position.z < DESPAWN_Z) {
          scene.remove(o.mesh);
          activeObstacles.splice(i, 1);
        }
      }
      for (let j = activeHearts.length - 1; j >= 0; j--) {
        const h = activeHearts[j];
        h.mesh.position.z -= speed * dt;
        h.phase += dt * 3;
        h.mesh.position.y = 1.1 + Math.sin(h.phase) * 0.12;
        h.mesh.rotation.y += dt * 2.2;
        if (h.mesh.position.z < DESPAWN_Z) {
          scene.remove(h.mesh);
          activeHearts.splice(j, 1);
        }
      }
      for (let k = burstParticles.length - 1; k >= 0; k--) {
        const b = burstParticles[k];
        b.life -= dt;
        b.mesh.position.addScaledVector(b.vel, dt);
        b.vel.y -= dt * 6;
        b.mesh.material.opacity = Math.max(0, b.life / 0.5);
        if (b.life <= 0) {
          scene.remove(b.mesh);
          b.mesh.geometry.dispose();
          b.mesh.material.dispose();
          burstParticles.splice(k, 1);
        }
      }
    }

    function checkCollisions() {
      const px = player.root.position.x;
      const py = player.root.position.y;

      for (let i = 0; i < activeObstacles.length; i++) {
        const o = activeObstacles[i];
        const z = o.mesh.position.z;
        if (z < -PLAYER_HALF_DEPTH - o.halfDepth || z > PLAYER_HALF_DEPTH + o.halfDepth) continue;

        const laneX = o.spanAll ? null : LANE_X[o.lane];
        const xHit = o.spanAll ? true : Math.abs(px - laneX) < PLAYER_HALF_WIDTH + 0.95;
        if (!xHit) continue;

        if (o.type === "block") {
          crash();
          return;
        } else if (o.type === "barrier") {
          if (py < 1.1) {
            crash();
            return;
          }
        } else if (o.type === "overhead") {
          if (playerState.vMode !== "slide") {
            crash();
            return;
          }
        }
      }

      for (let j = activeHearts.length - 1; j >= 0; j--) {
        const h = activeHearts[j];
        const hz = h.mesh.position.z;
        if (hz < -0.7 || hz > 0.9) continue;
        const hx = LANE_X[h.lane];
        if (Math.abs(px - hx) < PLAYER_HALF_WIDTH + 0.6) {
          spawnBurst(h.mesh.position);
          scene.remove(h.mesh);
          activeHearts.splice(j, 1);
          heartsCollected++;
          sfxHeart();
          updateHUD();
        }
      }
    }

    /* ---------------- game state ---------------- */
    const STATE = { MENU: "menu", PLAYING: "playing", PAUSED: "paused", GAMEOVER: "gameover" };
    let gameState = STATE.MENU;
    let distance = 0;
    let speed = BASE_SPEED;
    let heartsCollected = 0;
    let shakeTime = 0;
    let shakeMag = 0;

    function resetWorld() {
      activeObstacles.forEach((o) => scene.remove(o.mesh));
      activeHearts.forEach((h) => scene.remove(h.mesh));
      burstParticles.forEach((b) => scene.remove(b.mesh));
      activeObstacles = [];
      activeHearts = [];
      burstParticles = [];
      distance = 0;
      speed = BASE_SPEED;
      heartsCollected = 0;
      nextWaveDist = 16;
      playerState.laneIndex = 1;
      playerState.fromX = LANE_X[1];
      playerState.toX = LANE_X[1];
      playerState.laneChangeT = 1;
      playerState.vMode = "ground";
      playerState.vT = 0;
      playerState.alive = true;
      player.visual.rotation.set(0, 0, 0);
      player.visual.scale.set(1, 1, 1);
      player.root.position.set(LANE_X[1], 0, 0);
      updateHUD();
    }

    function crash() {
      if (!playerState.alive) return;
      playerState.alive = false;
      gameState = STATE.GAMEOVER;
      sfxCrash();
      shakeTime = 0.35;
      shakeMag = 0.35;
      if (flashRef.current) flashRef.current.classList.add("hit");
      setTimeout(() => {
        if (flashRef.current) flashRef.current.classList.remove("hit");
      }, 180);
      setTimeout(showGameOver, 500);
    }

    function updateHUD() {
      if (heartCountRef.current) heartCountRef.current.textContent = String(heartsCollected);
      if (distanceValRef.current) distanceValRef.current.textContent = String(Math.floor(distance));
    }

    function showOverlay(ref) {
      [menuOverlayRef, pauseOverlayRef, gameoverOverlayRef].forEach((r) => r.current && r.current.classList.remove("active"));
      if (ref.current) ref.current.classList.add("active");
    }
    function hideOverlays() {
      [menuOverlayRef, pauseOverlayRef, gameoverOverlayRef].forEach((r) => r.current && r.current.classList.remove("active"));
    }

    function showGameOver() {
      const score = Math.floor(distance) + heartsCollected * 10;
      const best = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
      const isNew = score > best;
      if (isNew) localStorage.setItem(HIGH_SCORE_KEY, String(score));
      if (finalScoreRef.current) finalScoreRef.current.textContent = String(score);
      if (finalHeartsRef.current) finalHeartsRef.current.textContent = String(heartsCollected);
      if (finalDistanceRef.current) finalDistanceRef.current.textContent = String(Math.floor(distance));
      if (newBestBadgeRef.current) newBestBadgeRef.current.style.display = isNew ? "block" : "none";
      showOverlay(gameoverOverlayRef);
    }

    apiRef.current.startGame = function () {
      hideOverlays();
      resetWorld();
      gameState = STATE.PLAYING;
      if (swipeHintRef.current) {
        swipeHintRef.current.style.opacity = "0.95";
        setTimeout(() => {
          if (swipeHintRef.current) swipeHintRef.current.style.opacity = "0";
        }, 3500);
      }
    };
    apiRef.current.pause = function () {
      if (gameState !== STATE.PLAYING) return;
      gameState = STATE.PAUSED;
      showOverlay(pauseOverlayRef);
    };
    apiRef.current.resume = function () {
      gameState = STATE.PLAYING;
      hideOverlays();
    };
    apiRef.current.goToMenu = function () {
      gameState = STATE.MENU;
      if (menuHighScoreRef.current) menuHighScoreRef.current.textContent = localStorage.getItem(HIGH_SCORE_KEY) || "0";
      showOverlay(menuOverlayRef);
    };
    apiRef.current.toggleHow = function () {
      const el = howBoxRef.current;
      if (!el) return;
      el.style.display = el.style.display === "none" || !el.style.display ? "block" : "none";
    };

    if (menuHighScoreRef.current) menuHighScoreRef.current.textContent = localStorage.getItem(HIGH_SCORE_KEY) || "0";

    /* ---------------- input ---------------- */
    function onKeyDown(e) {
      if (gameState === STATE.PLAYING) {
        if (e.code === "ArrowLeft" || e.code === "KeyA") changeLane(-1);
        else if (e.code === "ArrowRight" || e.code === "KeyD") changeLane(1);
        else if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") doJump();
        else if (e.code === "ArrowDown" || e.code === "KeyS") doSlide();
        else if (e.code === "KeyP" || e.code === "Escape") apiRef.current.pause();
      } else if (gameState === STATE.PAUSED && (e.code === "KeyP" || e.code === "Escape")) {
        apiRef.current.resume();
      }
    }
    window.addEventListener("keydown", onKeyDown);

    let touchStart = null;
    function onTouchStart(e) {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
    }
    function onTouchEnd(e) {
      if (!touchStart || gameState !== STATE.PLAYING) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - touchStart.time;
      if (dist > 28 && elapsed < 500) {
        if (Math.abs(dx) > Math.abs(dy)) changeLane(dx > 0 ? 1 : -1);
        else if (dy < 0) doJump();
        else doSlide();
      }
      touchStart = null;
    }
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    /* ---------------- main loop ---------------- */
    const clock = new THREE.Clock();
    let rafId = null;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (gameState === STATE.PLAYING) {
        distance += speed * dt;
        speed = Math.min(MAX_SPEED, BASE_SPEED + distance * 0.0035);
        updatePlayer(dt);
        updateScenery(dt, speed);
        updateObstaclesAndHearts(dt, speed);
        maybeSpawnWave(distance);
        checkCollisions();
        updateHUD();
      } else if (gameState === STATE.GAMEOVER) {
        updateObstaclesAndHearts(dt, speed * 0.2);
      }

      camFollowX += (player.root.position.x - camFollowX) * Math.min(1, dt * 6);
      let shakeX = 0,
        shakeY = 0;
      if (shakeTime > 0) {
        shakeTime -= dt;
        const m = shakeMag * (shakeTime / 0.35);
        shakeX = (Math.random() - 0.5) * m;
        shakeY = (Math.random() - 0.5) * m;
      }
      camera.position.set(camFollowX * 0.6 + shakeX, 4.6 + shakeY, -7.5);
      camera.lookAt(camFollowX * 0.6, 1.6 + player.root.position.y * 0.15, 10);

      // A touch of extra FOV as speed ramps up reads as velocity, a
      // cheap trick real racing/runner games lean on constantly.
      const speedT = (speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
      camera.fov = BASE_FOV + speedT * 6;
      camera.updateProjectionMatrix();

      composer.render();
    }
    animate();

    /* ---------------- cleanup ---------------- */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      if (audioCtx) {
        try {
          audioCtx.close();
        } catch {
          /* already closed */
        }
      }
      [...activeObstacles.map((o) => o.mesh), ...activeHearts.map((h) => h.mesh), ...burstParticles.map((b) => b.mesh)].forEach((mesh) =>
        scene.remove(mesh)
      );
      disposables.forEach((d) => d.dispose && d.dispose());
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="heart-runner-overlay" ref={containerRef}>
      <canvas ref={canvasRef} className="hr-canvas" />
      <div className="hr-vignette" aria-hidden="true" />
      <div className="hr-flash" ref={flashRef} />

      <button className="hr-exit-btn" onClick={onClose} aria-label="Exit game">
        ✕
      </button>

      <div className="hr-hud">
        <button className="hr-pause-btn" onClick={() => apiRef.current.pause()} aria-label="Pause">
          ⏸️
        </button>
        <div className="hr-pill">
          💗 <span ref={heartCountRef}>0</span>
        </div>
      </div>
      <div className="hr-pill hr-distance-pill">
        🏁 <span ref={distanceValRef}>0</span>m
      </div>
      <div className="hr-swipe-hint" ref={swipeHintRef}>
        👆 Swipe left / right / up / down to move
      </div>

      <div className="hr-overlay active" ref={menuOverlayRef}>
        <div className="hr-panel">
          <span className="hr-eyebrow">Hospital Kingdom Dash</span>
          <h1 className="hr-h1">Heart Runner</h1>
          <p className="hr-subtitle">Run down the Hospital Kingdom track, dodge obstacles, and catch as many hearts as you can!</p>
          <div className="hr-stat-row">
            <div className="hr-stat">
              <div className="hr-stat-val" ref={menuHighScoreRef}>
                0
              </div>
              <div className="hr-stat-lbl">Best Score</div>
            </div>
          </div>
          <div className="hr-btn-col">
            <button className="hr-btn" onClick={() => apiRef.current.startGame()}>
              ▶️ Start Running
            </button>
            <button className="hr-btn hr-btn-secondary" onClick={() => apiRef.current.toggleHow()}>
              ❓ How to Play
            </button>
          </div>
          <div className="hr-how-box" ref={howBoxRef} style={{ display: "none" }}>
            <b>Swipe or use arrow keys / WASD:</b>
            <br />
            ⬅️➡️ Change lanes &nbsp; ⬆️ Jump over barriers &nbsp; ⬇️ Slide under signs
            <br />
            Watch out for tall blockers, you can only dodge those by switching lanes!
          </div>
        </div>
      </div>

      <div className="hr-overlay" ref={pauseOverlayRef}>
        <div className="hr-panel">
          <h2 className="hr-h2">Paused</h2>
          <p className="hr-subtitle">Take a breather, Hero.</p>
          <div className="hr-btn-col">
            <button className="hr-btn" onClick={() => apiRef.current.resume()}>
              ▶️ Resume
            </button>
            <button className="hr-btn hr-btn-secondary" onClick={() => apiRef.current.goToMenu()}>
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>

      <div className="hr-overlay" ref={gameoverOverlayRef}>
        <div className="hr-panel">
          <span className="hr-eyebrow">Run Complete</span>
          <h2 className="hr-h2">Nice run, Hero! 🎉</h2>
          <div className="hr-new-best" ref={newBestBadgeRef} style={{ display: "none" }}>
            🌟 New Best Score!
          </div>
          <div className="hr-stat-row">
            <div className="hr-stat">
              <div className="hr-stat-val" ref={finalScoreRef}>
                0
              </div>
              <div className="hr-stat-lbl">Score</div>
            </div>
            <div className="hr-stat">
              <div className="hr-stat-val" ref={finalHeartsRef}>
                0
              </div>
              <div className="hr-stat-lbl">Hearts</div>
            </div>
            <div className="hr-stat">
              <div className="hr-stat-val" ref={finalDistanceRef}>
                0
              </div>
              <div className="hr-stat-lbl">Meters</div>
            </div>
          </div>
          <div className="hr-btn-col">
            <button className="hr-btn" onClick={() => apiRef.current.startGame()}>
              🔄 Run Again
            </button>
            <button className="hr-btn hr-btn-secondary" onClick={() => apiRef.current.goToMenu()}>
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
