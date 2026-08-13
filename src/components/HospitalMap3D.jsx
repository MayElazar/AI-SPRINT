import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// The full Cath Lab unit, one room per real stage of the visit (Checked
// in -> Prep -> Procedure -> Recovery -> Ready), plus the Hospital tour
// stage's Family waiting area, Cafeteria, and Quiet room, laid out as a
// single corridor with rooms lining both sides, dollhouse-style: walls
// with a real door gap, and furniture specific to what each room is for.
const WALL_HEIGHT = 1.05;
const WALL_THICK = 0.12;
const DOOR_WIDTH = 1.25;

const ROOMS = [
  {
    key: "reception",
    label: "Reception",
    desc: "Where Maya's details get confirmed before anything else starts.",
    color: 0x6a45b0,
    x: -2.1,
    z: 0,
    w: 3.6,
    d: 3.2,
    doorWall: "east",
    furniture: "reception",
  },
  {
    key: "waiting",
    label: "Family waiting area",
    desc: "Right outside the unit, with charging points and a TV.",
    color: 0x00b5d6,
    x: 2.2,
    z: 2.4,
    w: 3.4,
    d: 3,
    doorWall: "south",
    furniture: "waiting",
  },
  {
    key: "prep",
    label: "Prep bay",
    desc: "IV line, final checks, a word with the anesthesia team.",
    color: 0xef4c67,
    x: 4.6,
    z: -2.4,
    w: 3,
    d: 3,
    doorWall: "north",
    furniture: "prep",
  },
  {
    key: "cathlab",
    label: "Cath Lab, procedure room",
    desc: "Typically 2 to 3 hours. Where the procedure itself happens.",
    color: 0xf7c0cd,
    x: 8.2,
    z: 3.4,
    w: 5.6,
    d: 5,
    doorWall: "south",
    furniture: "cathlab",
  },
  {
    key: "recovery",
    label: "Recovery bay",
    desc: "Out of the procedure, being watched as she wakes.",
    color: 0x96cb63,
    x: 9.6,
    z: -2.7,
    w: 4,
    d: 3.6,
    doorWall: "north",
    furniture: "recovery",
  },
  {
    key: "quiet",
    label: "Quiet room",
    desc: "Past reception, same floor, if you need a few minutes alone.",
    color: 0xc9b8e8,
    x: 13.1,
    z: 2.2,
    w: 2.6,
    d: 2.6,
    doorWall: "south",
    furniture: "quiet",
  },
  {
    key: "discharge",
    label: "Discharge room",
    desc: "The last stop. Instructions get written down as Galit covers them.",
    color: 0xd9a066,
    x: 13.5,
    z: -2.3,
    w: 2.6,
    d: 2.8,
    doorWall: "north",
    furniture: "discharge",
  },
  {
    key: "cafeteria",
    label: "Cafeteria",
    desc: "Ground floor, open from 7am.",
    color: 0xffc645,
    x: 17.3,
    z: -2.7,
    w: 3.8,
    d: 3.6,
    doorWall: "north",
    furniture: "cafeteria",
  },
];

// Where each room's door sits, so a route can be drawn from Reception
// (the entrance) to whichever room the user picks.
function doorPoint(r) {
  const hw = r.w / 2;
  const hd = r.d / 2;
  switch (r.doorWall) {
    case "north":
      return { x: r.x, z: r.z - hd };
    case "south":
      return { x: r.x, z: r.z + hd };
    case "east":
      return { x: r.x + hw, z: r.z };
    case "west":
      return { x: r.x - hw, z: r.z };
    default:
      return { x: r.x, z: r.z };
  }
}

const ROUTE_COLOR = 0xff5a7a;
// Reception is the entrance every route starts from, so it doubles as
// the "you are here" point. The waiting area is highlighted by default
// on open, since "where do I wait" is the question most families
// actually have walking in.
const YOU_ARE_HERE_KEY = "reception";
const DEFAULT_ROUTE_KEY = "waiting";
const HERE_COLOR = 0x004c9a;

export default function HospitalMap3D({ onClose }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const routeRef = useRef({});
  const hereLabelRef = useRef(null);
  const [selectedKey, setSelectedKey] = useState(DEFAULT_ROUTE_KEY);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef3fb);
    scene.fog = new THREE.Fog(0xeef3fb, 26, 50);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 120);
    camera.position.set(20, 16, 23);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(7, 0.3, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 16;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(14, 22, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbcd4ff, 0.3);
    fill.position.set(-10, 8, -10);
    scene.add(fill);

    const backdrop = new THREE.Mesh(
      new THREE.CircleGeometry(26, 64),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 })
    );
    backdrop.rotation.x = -Math.PI / 2;
    backdrop.position.set(7, -0.02, 0);
    scene.add(backdrop);

    const grid = new THREE.GridHelper(56, 56, 0xd8e2f0, 0xecf1fa);
    grid.position.x = 7;
    scene.add(grid);

    const buildingGroup = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x1a1330, transparent: true, opacity: 0.22 });

    function addEdges(mesh) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMat);
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      buildingGroup.add(edges);
    }

    // One straight wall run along the x or z axis, with a door-width gap
    // left open in the middle when this run is the room's doorWall.
    function addWallRun(cx, cz, length, axis, hasDoor) {
      if (!hasDoor) {
        const geo =
          axis === "x"
            ? new THREE.BoxGeometry(length, WALL_HEIGHT, WALL_THICK)
            : new THREE.BoxGeometry(WALL_THICK, WALL_HEIGHT, length);
        const mesh = new THREE.Mesh(geo, wallMat);
        mesh.position.set(cx, WALL_HEIGHT / 2, cz);
        buildingGroup.add(mesh);
        addEdges(mesh);
        return;
      }
      const segLen = (length - DOOR_WIDTH) / 2;
      if (segLen <= 0.05) return;
      const offset = segLen / 2 + DOOR_WIDTH / 2;
      [-1, 1].forEach((sign) => {
        const geo =
          axis === "x"
            ? new THREE.BoxGeometry(segLen, WALL_HEIGHT, WALL_THICK)
            : new THREE.BoxGeometry(WALL_THICK, WALL_HEIGHT, segLen);
        const mesh = new THREE.Mesh(geo, wallMat);
        if (axis === "x") mesh.position.set(cx + sign * offset, WALL_HEIGHT / 2, cz);
        else mesh.position.set(cx, WALL_HEIGHT / 2, cz + sign * offset);
        buildingGroup.add(mesh);
        addEdges(mesh);
      });
    }

    // ---------- furniture helpers ----------
    function addChair(x, z, angle, color) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.34), mat);
      seat.position.set(x, 0.2, z);
      buildingGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.05), mat);
      back.position.set(x - Math.sin(angle) * 0.145, 0.36, z - Math.cos(angle) * 0.145);
      back.rotation.y = angle;
      buildingGroup.add(back);
    }

    function addTable(x, z, w, d, color, tHeight = 0.32) {
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.06, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      );
      top.position.set(x, tHeight, z);
      buildingGroup.add(top);
      const legMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: 0.7 });
      const legGeo = new THREE.CylinderGeometry(0.03, 0.03, tHeight, 8);
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].forEach(([sx, sz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(x + (sx * (w - 0.16)) / 2, tHeight / 2, z + (sz * (d - 0.16)) / 2);
        buildingGroup.add(leg);
      });
    }

    function addBench(x, z, w, d, color) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), mat);
      seat.position.set(x, 0.2, z);
      buildingGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.34, 0.08), mat);
      back.position.set(x, 0.4, z - d / 2 + 0.04);
      buildingGroup.add(back);
    }

    function addPlant(x, z) {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.09, 0.2, 10),
        new THREE.MeshStandardMaterial({ color: 0xb5a48c, roughness: 0.8 })
      );
      pot.position.set(x, 0.1, z);
      buildingGroup.add(pot);
      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x6fae55, roughness: 0.85 })
      );
      leaves.position.set(x, 0.37, z);
      buildingGroup.add(leaves);
    }

    function addTV(x, z, angle) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.34, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x1a1e28, roughness: 0.35 })
      );
      panel.position.set(x, 0.78, z);
      panel.rotation.y = angle;
      buildingGroup.add(panel);
    }

    function addDesk(x, z, w, d, color) {
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.42, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      );
      top.position.set(x, 0.21, z);
      buildingGroup.add(top);
      addEdges(top);
    }

    function addFileCabinet(x, z) {
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.7, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xb9c2cf, roughness: 0.5 })
      );
      cab.position.set(x, 0.35, z);
      buildingGroup.add(cab);
      addEdges(cab);
    }

    function addCounter(x, z, w, d, color = 0xe4e9f0) {
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.5, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      );
      top.position.set(x, 0.25, z);
      buildingGroup.add(top);
      addEdges(top);
    }

    function addBed(x, z, w, d, color = 0xdfe6f2) {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.32, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      base.position.set(x, 0.16, z);
      buildingGroup.add(base);
      addEdges(base);
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.82, 0.08, d * 0.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 })
      );
      pillow.position.set(x, 0.36, z - d / 2 + d * 0.2);
      buildingGroup.add(pillow);
    }

    function addIVPole(x, z) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: 0xb0b8c4 })
      );
      pole.position.set(x, 0.55, z);
      buildingGroup.add(pole);
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.16, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xdcecf7, transparent: true, opacity: 0.85 })
      );
      bag.position.set(x, 1.02, z);
      buildingGroup.add(bag);
    }

    function addCart(x, z, color = 0xe4e9f0) {
      [0.14, 0.3, 0.46].forEach((y) => {
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.03, 0.28),
          new THREE.MeshStandardMaterial({ color })
        );
        shelf.position.set(x, y, z);
        buildingGroup.add(shelf);
      });
    }

    function addMonitor(x, z, angle) {
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1c2230, emissive: 0x1f5c7a, emissiveIntensity: 0.5 })
      );
      screen.position.set(x, 1.1, z);
      screen.rotation.y = angle;
      buildingGroup.add(screen);
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6),
        new THREE.MeshStandardMaterial({ color: 0x9aa3b0 })
      );
      arm.position.set(x, 0.92, z);
      buildingGroup.add(arm);
    }

    function addCArm(x, z, angle = 0) {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.05, 10, 28, Math.PI * 1.5),
        new THREE.MeshStandardMaterial({ color: 0xe7ebf1, roughness: 0.4, metalness: 0.15 })
      );
      arc.position.set(x, 0.75, z);
      arc.rotation.set(Math.PI / 2, 0, angle);
      buildingGroup.add(arc);
      const detector = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a2f3a })
      );
      detector.position.set(x + Math.cos(angle) * 0.58, 1.3, z + Math.sin(angle) * 0.58);
      detector.rotation.x = Math.PI / 2;
      buildingGroup.add(detector);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0xd7dce4 })
      );
      base.position.set(x, 0.25, z);
      buildingGroup.add(base);
    }

    function addProcTable(x, z) {
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 0.65),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      );
      top.position.set(x, 0.5, z);
      buildingGroup.add(top);
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.45, 10),
        new THREE.MeshStandardMaterial({ color: 0xb0b8c4 })
      );
      leg.position.set(x, 0.25, z);
      buildingGroup.add(leg);
    }

    function addCurtainDivider(x, z, length, axis) {
      const geo =
        axis === "x"
          ? new THREE.BoxGeometry(length, 1.0, 0.03)
          : new THREE.BoxGeometry(0.03, 1.0, length);
      const curtain = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: 0xcfe3f2, transparent: true, opacity: 0.55, roughness: 0.8 })
      );
      curtain.position.set(x, 0.8, z);
      buildingGroup.add(curtain);
    }

    // ---------- corridor ----------
    const corridor = new THREE.Mesh(
      new THREE.PlaneGeometry(20.4, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xdfe6f2, roughness: 0.95 })
    );
    corridor.rotation.x = -Math.PI / 2;
    corridor.position.set(9.4, 0.006, 0);
    buildingGroup.add(corridor);
    addPlant(1, -0.6);
    addPlant(6.4, 0.6);
    addPlant(12, -0.6);

    // ---------- rooms ----------
    const raycastTargets = [];
    const markers = [];

    ROOMS.forEach((r) => {
      const west = r.x - r.w / 2;
      const east = r.x + r.w / 2;
      const north = r.z - r.d / 2;
      const south = r.z + r.d / 2;

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(r.w, r.d),
        new THREE.MeshStandardMaterial({ color: r.color, roughness: 0.92 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(r.x, 0.01, r.z);
      floor.userData.key = r.key;
      buildingGroup.add(floor);
      raycastTargets.push(floor);

      addWallRun(r.x, north, r.w, "x", r.doorWall === "north");
      addWallRun(r.x, south, r.w, "x", r.doorWall === "south");
      addWallRun(west, r.z, r.d, "z", r.doorWall === "west");
      addWallRun(east, r.z, r.d, "z", r.doorWall === "east");

      const hw = r.w / 2;
      const hd = r.d / 2;

      if (r.furniture === "reception") {
        addDesk(r.x, r.z + hd - 0.6, 1.3, 0.55, 0xffffff);
        addChair(r.x, r.z + hd - 1.1, Math.PI, 0xffffff);
        addChair(r.x - 0.55, r.z - hd + 0.55, 0, 0xe7ebf1);
        addChair(r.x + 0.55, r.z - hd + 0.55, 0, 0xe7ebf1);
        addPlant(r.x - hw + 0.4, r.z - hd + 0.4);
        addFileCabinet(r.x + hw - 0.4, r.z + hd - 0.4);
      } else if (r.furniture === "waiting") {
        [-1.1, -0.4, 0.3, 1.0].forEach((dz) => addChair(r.x - hw + 0.4, r.z + dz, Math.PI / 2, 0xffffff));
        addTable(r.x - hw + 0.4, r.z + 1.5, 0.5, 0.5, 0xf3ede2, 0.24);
        addTV(r.x + hw - 0.15, r.z, -Math.PI / 2);
        addPlant(r.x + hw - 0.4, r.z - hd + 0.4);
      } else if (r.furniture === "prep") {
        addBed(r.x, r.z - 0.15, 1.6, 0.85, 0xdfe6f2);
        addIVPole(r.x - 1.0, r.z - 0.35);
        addCart(r.x + 1.1, r.z - hd + 0.4);
        addCurtainDivider(r.x, r.z + hd - 0.5, r.w - 0.4, "x");
      } else if (r.furniture === "cathlab") {
        addProcTable(r.x, r.z);
        addCArm(r.x + 1.0, r.z, Math.PI / 2);
        addMonitor(r.x - hw + 0.5, r.z - 1.4, Math.PI / 5);
        addMonitor(r.x - hw + 0.5, r.z - 0.7, Math.PI / 5);
        addCounter(r.x + hw - 0.3, r.z + hd - 0.6, 1.6, 0.5, 0xe4e9f0);
        addCart(r.x - hw + 0.5, r.z + hd - 0.5);
      } else if (r.furniture === "recovery") {
        addBed(r.x - 1.0, r.z - 0.5, 1.4, 0.75, 0xdfe6f2);
        addBed(r.x + 1.0, r.z - 0.5, 1.4, 0.75, 0xdfe6f2);
        addMonitor(r.x - 1.0, r.z - hd + 0.35, 0);
        addMonitor(r.x + 1.0, r.z - hd + 0.35, 0);
        addCurtainDivider(r.x, r.z - 0.5, 1.4, "z");
        addChair(r.x - 1.0, r.z + hd - 0.5, Math.PI, 0xffffff);
        addChair(r.x + 1.0, r.z + hd - 0.5, Math.PI, 0xffffff);
      } else if (r.furniture === "quiet") {
        addBench(r.x, r.z + hd - 0.45, 1.7, 0.5, 0xffffff);
        addPlant(r.x - hw + 0.4, r.z - hd + 0.4);
        addTable(r.x + hw - 0.5, r.z + 0.2, 0.4, 0.4, 0xf3ede2, 0.22);
      } else if (r.furniture === "discharge") {
        addDesk(r.x, r.z + hd - 0.6, 1.2, 0.5, 0xffffff);
        addChair(r.x, r.z + hd - 1.1, Math.PI, 0xffffff);
        addChair(r.x - 0.55, r.z - hd + 0.55, 0, 0xe7ebf1);
        addChair(r.x + 0.55, r.z - hd + 0.55, 0, 0xe7ebf1);
        addFileCabinet(r.x - hw + 0.4, r.z + hd - 0.4);
      } else if (r.furniture === "cafeteria") {
        addTable(r.x - 1.1, r.z - 0.2, 0.8, 0.8, 0xf3ede2, 0.32);
        addChair(r.x - 1.1, r.z - 0.85, 0, 0xffffff);
        addChair(r.x - 1.1, r.z + 0.45, Math.PI, 0xffffff);
        addTable(r.x + 1.1, r.z + 0.4, 0.8, 0.8, 0xf3ede2, 0.32);
        addChair(r.x + 1.1, r.z - 0.25, 0, 0xffffff);
        addChair(r.x + 1.1, r.z + 1.05, Math.PI, 0xffffff);
        addCounter(r.x, r.z - hd + 0.3, 2.6, 0.4, 0xe4e9f0);
      }

      const markerMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: r.color,
        emissiveIntensity: 0.9,
        roughness: 0.3,
      });
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), markerMat);
      marker.position.set(r.x, WALL_HEIGHT + 0.55, r.z);
      marker.userData.key = r.key;
      buildingGroup.add(marker);
      raycastTargets.push(marker);
      markers.push(marker);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.27, 24),
        new THREE.MeshBasicMaterial({ color: r.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
      );
      ring.position.copy(marker.position);
      ring.rotation.x = -Math.PI / 2;
      buildingGroup.add(ring);
    });

    scene.add(buildingGroup);

    // ---------- "you are here" pin, at Reception, the entrance ----------
    const hereRoom = ROOMS.find((r) => r.key === YOU_ARE_HERE_KEY);
    const hereGroup = new THREE.Group();
    const hereMat = new THREE.MeshStandardMaterial({
      color: HERE_COLOR,
      emissive: HERE_COLOR,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const pinHeight = 0.55;
    const pinBaseY = WALL_HEIGHT + 0.85;
    const hereSphere = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), hereMat);
    hereSphere.position.set(hereRoom.x, pinBaseY + pinHeight, hereRoom.z);
    hereGroup.add(hereSphere);
    const hereCone = new THREE.Mesh(new THREE.ConeGeometry(0.14, pinHeight, 18), hereMat);
    hereCone.position.set(hereRoom.x, pinBaseY + pinHeight / 2, hereRoom.z);
    hereGroup.add(hereCone);
    // A stem down to the floor, so the pin visibly marks a spot rather
    // than just floating near the room.
    const hereStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, pinBaseY, 6),
      new THREE.MeshBasicMaterial({ color: HERE_COLOR, transparent: true, opacity: 0.35 })
    );
    hereStem.position.set(hereRoom.x, pinBaseY / 2, hereRoom.z);
    hereGroup.add(hereStem);
    const hereRing = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.32, 32),
      new THREE.MeshBasicMaterial({ color: HERE_COLOR, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
    );
    hereRing.rotation.x = -Math.PI / 2;
    hereRing.position.set(hereRoom.x, 0.025, hereRoom.z);
    hereGroup.add(hereRing);
    scene.add(hereGroup);

    // ---------- route from Reception to the selected room ----------
    const doorPoints = {};
    ROOMS.forEach((r) => {
      doorPoints[r.key] = doorPoint(r);
    });
    const routeGroup = new THREE.Group();
    scene.add(routeGroup);

    function updateRoute(key) {
      while (routeGroup.children.length) {
        const c = routeGroup.children.pop();
        c.geometry?.dispose();
        c.material?.dispose();
      }
      routeRef.current.marker = null;
      routeRef.current.waypoints = null;
      routeRef.current.totalLen = 0;
      if (!key || key === "reception") return;

      const room = ROOMS.find((r) => r.key === key);
      const start = doorPoints.reception;
      const doorP = doorPoints[key];
      const bend = { x: room.x, z: 0 };
      const pts = [start, bend, doorP, { x: room.x, z: room.z }].map(
        (p) => new THREE.Vector3(p.x, 0.045, p.z)
      );

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: ROUTE_COLOR })
      );
      routeGroup.add(line);

      // Breadcrumb dots spaced evenly along the route, like a walking path.
      const spacing = 0.5;
      let carry = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const segLen = a.distanceTo(b);
        let t = spacing - carry;
        while (t < segLen) {
          const p = a.clone().lerp(b, t / segLen);
          const dot = new THREE.Mesh(
            new THREE.CircleGeometry(0.05, 12),
            new THREE.MeshBasicMaterial({ color: ROUTE_COLOR })
          );
          dot.rotation.x = -Math.PI / 2;
          dot.position.set(p.x, 0.05, p.z);
          routeGroup.add(dot);
          t += spacing;
        }
        carry = spacing - (segLen - (t - spacing));
      }

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: ROUTE_COLOR, emissive: ROUTE_COLOR, emissiveIntensity: 0.6 })
      );
      routeGroup.add(marker);

      let totalLen = 0;
      for (let i = 1; i < pts.length; i++) totalLen += pts[i - 1].distanceTo(pts[i]);

      routeRef.current.marker = marker;
      routeRef.current.waypoints = pts;
      routeRef.current.totalLen = totalLen || 1;
    }

    routeRef.current.update = updateRoute;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = null;

    function onPointerDown(e) {
      downPos = { x: e.clientX, y: e.clientY };
    }

    function onPointerUp(e) {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (moved > 6) return; // treat as a drag, not a tap

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(raycastTargets);
      const hit = hits.find((h) => h.object.userData.key);
      if (hit) {
        setSelectedKey(hit.object.userData.key);
        setAutoRotate(false);
        controls.autoRotate = false;
      }
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    let raf;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      markers.forEach((m) => {
        m.position.y = WALL_HEIGHT + 0.55 + Math.sin(t * 2 + m.position.x) * 0.05;
      });

      // Pulse the "you are here" ring on a loop, and keep its DOM label
      // pinned to the pin's projected screen position as the camera
      // orbits, since a canvas can't render real DOM text itself.
      const pulse = (Math.sin(t * 2.2) + 1) / 2;
      hereRing.scale.setScalar(1 + pulse * 0.7);
      hereRing.material.opacity = 0.6 - pulse * 0.35;
      if (hereLabelRef.current) {
        const screenPos = hereSphere.position.clone().project(camera);
        if (screenPos.z < 1) {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          const x = (screenPos.x * 0.5 + 0.5) * w;
          const y = (-screenPos.y * 0.5 + 0.5) * h;
          hereLabelRef.current.style.opacity = "1";
          hereLabelRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -135%)`;
        } else {
          hereLabelRef.current.style.opacity = "0";
        }
      }

      // Walk the route marker along the highlighted path on a loop.
      const rs = routeRef.current;
      if (rs.marker && rs.waypoints && rs.waypoints.length > 1) {
        const speed = 1.7; // units per second
        const loopTime = rs.totalLen / speed;
        const target = ((t % loopTime) / loopTime) * rs.totalLen;
        let acc = 0;
        let idx = 0;
        for (; idx < rs.waypoints.length - 1; idx++) {
          const segLen = rs.waypoints[idx].distanceTo(rs.waypoints[idx + 1]);
          if (acc + segLen >= target) break;
          acc += segLen;
        }
        const a = rs.waypoints[idx];
        const b = rs.waypoints[Math.min(idx + 1, rs.waypoints.length - 1)];
        const segLen = a.distanceTo(b) || 1;
        const localT = Math.min(1, (target - acc) / segLen);
        rs.marker.position.copy(a.clone().lerp(b, localT));
        rs.marker.position.y = 0.1;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    routeRef.current.update?.(selectedKey);
  }, [selectedKey]);

  function selectRoom(key) {
    setSelectedKey((cur) => (cur === key ? null : key));
    setAutoRotate(false);
  }

  return (
    <div className="map3d-overlay">
      <div className="map3d-topbar">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          ←
        </button>
        <div className="map3d-title">Hospital map · 3D</div>
        <button className="story-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="map3d-canvas-wrap">
        <div className="map3d-canvas" ref={mountRef} />
        <div className="map3d-here-label" ref={hereLabelRef}>
          <span className="map3d-here-dot" aria-hidden="true" />
          You are here
        </div>
        <div className="map3d-tip">
          <div className="map3d-tip-title">Tip</div>
          <div>Drag to rotate</div>
          <div>Scroll to zoom</div>
          <div>Tap a dot to explore</div>
        </div>
        <label className="map3d-autorotate">
          <span>Auto rotate</span>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
        </label>
      </div>

      <div className="map3d-body">
        <div className="qa-scope-note">
          {selectedKey
            ? `You are here at Reception. The highlighted path leads to ${ROOMS.find((r) => r.key === selectedKey)?.label}, tap that room again to collapse it.`
            : "Tap any glowing dot on the map, or a room below, to see how to get there."}
        </div>

        <div className="section-label">All locations</div>
        <div className="path-list">
          {ROOMS.map((r) => {
            const isOpen = selectedKey === r.key;
            return (
              <div key={r.key} className={`map3d-loc ${isOpen ? "open" : ""}`}>
                <button className="path-item" onClick={() => selectRoom(r.key)}>
                  <div
                    className="map3d-legend-dot"
                    style={{ background: `#${r.color.toString(16).padStart(6, "0")}` }}
                  />
                  <div className="path-body">
                    <div className="path-name">{r.label}</div>
                  </div>
                  <div className="path-chev" style={{ transform: isOpen ? "rotate(90deg)" : "none" }}>
                    ›
                  </div>
                </button>
                {isOpen && (
                  <div className="map3d-loc-detail">
                    <div className="story-quote-sub">{r.desc}</div>
                    {r.key !== "reception" && (
                      <div className="map3d-route-hint">
                        <span className="map3d-route-dot" aria-hidden="true" />
                        Route from Reception is drawn on the map above.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
