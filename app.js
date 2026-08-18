(function () {
  const wishEl = document.querySelector("#wish");
  const countdownEl = document.querySelector("#countdown");
  const countdownFill = document.querySelector("#countdown-fill");
  const letterStage = document.querySelector("#letter-stage");
  const letterClose = document.querySelector("#letter-close");
  let candlesLit = true;
  const loaderEl = document.querySelector("#loader");
  const loaderFill = document.querySelector("#loader-fill");
  const loaderTitle = document.querySelector(".loader-title");
  const loaderNote = document.querySelector(".loader-note");

  /*
   * ============================================================
   * EDIT THIS SECTION to move / scale / recolor the 3D scene
   * x = left(-) / right(+)
   * y = down(-) / up(+)
   * z = closer to camera(+) / farther back(-)
   * ============================================================
   */
  const LAYOUT = {
    camera: { x: 0.2, y: 5.4, z: 12.4 },
    cameraLookAt: { x: 0, y: 2.3, z: 0 },

    floor: { y: 0, radius: 16, color: 0x1c2a44 },

    pedestal: {
      x: 0,
      y: 0,
      lowerHeight: 0.34,
      lowerRadius: 3.05,
      upperHeight: 0.42,
      upperRadius: 2.25,
      color: 0xd4af37
    },

    // Custom cake sits on the top step
    mainCake: { x: 0, y: 0.76, z: 0, spin: 0.12 },

    gifts: [
      { x: -5.8, z: 2.8, rotY: 0.4, y: 0 },
      { x: 5.9, z: 2.5, rotY: -0.55, y: 0 },
      { x: -5.4, z: -2.6, rotY: 1.1, y: 0 },
      { x: 5.6, z: -2.3, rotY: -1.05, y: 0 },
      { x: -2.4, z: 4.8, rotY: 0.2, y: 0 },
      { x: 2.7, z: 4.6, rotY: -0.3, y: 0 },
      { x: 0.2, z: -5.2, rotY: 0.85, y: 0 },
      { x: -7.0, z: 0.3, rotY: 1.45, y: 0 },
      { x: 7.1, z: 0.1, rotY: -1.4, y: 0 }
    ],

    balloons: [
      { x: -5.4, y: 3.4, z: -1.2, scale: 1.0, color: 0xd4af37 },
      { x: -3.9, y: 4.8, z: 1.4, scale: 0.82, color: 0x2a6f7a },
      { x: 5.5, y: 3.6, z: -1.0, scale: 1.08, color: 0xf3e6c4 },
      { x: 4.2, y: 5.0, z: 1.5, scale: 0.86, color: 0x1e3a5f },
      { x: -1.5, y: 5.6, z: -2.8, scale: 0.74, color: 0xc1121f },
      { x: 1.6, y: 5.7, z: -2.5, scale: 0.78, color: 0x7c9a6d }
    ]
  };

  function setProgress(label, value) {
    loaderTitle.textContent = label;
    loaderFill.style.width = Math.round(value * 100) + "%";
  }

  function fail(message, error) {
    if (error) console.error(error);
    loaderTitle.textContent = message;
    if (loaderNote) {
      loaderNote.textContent = "Double-click open.bat, then wait for the models to load.";
    }
  }

  if (typeof THREE === "undefined" || !THREE.OBJLoader || !THREE.OrbitControls) {
    fail("Three.js did not load. Refresh, or run open.bat.");
    return;
  }

  const canvas = document.querySelector("#scene");
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x10182a, 16, 36);
  scene.background = new THREE.Color(0x10182a);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.55;

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(LAYOUT.camera.x, LAYOUT.camera.y, LAYOUT.camera.z);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 18;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(LAYOUT.cameraLookAt.x, LAYOUT.cameraLookAt.y, LAYOUT.cameraLookAt.z);

  scene.add(new THREE.HemisphereLight(0xffefd2, 0x152033, 0.22));

  const keyLight = new THREE.DirectionalLight(0xfff6e8, 0.55);
  keyLight.position.set(5.5, 10, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x7ea0c4, 0.18);
  fillLight.position.set(-7, 3, -3);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xd4af37, 2.4, 18, 2);
  rimLight.position.set(0, 4.8, 2);
  scene.add(rimLight);

  const cakeGlow = new THREE.PointLight(0xffe08a, 1.6, 9, 2);
  cakeGlow.position.set(0, 3.4, 0);
  scene.add(cakeGlow);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(LAYOUT.floor.radius, 72),
    new THREE.MeshStandardMaterial({
      color: LAYOUT.floor.color,
      roughness: 0.96,
      metalness: 0.04
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = LAYOUT.floor.y;
  scene.add(floor);

  const pedestalGroup = new THREE.Group();
  const lowerStep = new THREE.Mesh(
    new THREE.CylinderGeometry(
      LAYOUT.pedestal.lowerRadius - 0.15,
      LAYOUT.pedestal.lowerRadius,
      LAYOUT.pedestal.lowerHeight,
      48
    ),
    new THREE.MeshStandardMaterial({
      color: LAYOUT.pedestal.color,
      roughness: 0.34,
      metalness: 0.38
    })
  );
  lowerStep.position.y = LAYOUT.pedestal.lowerHeight / 2;

  const upperStep = new THREE.Mesh(
    new THREE.CylinderGeometry(
      LAYOUT.pedestal.upperRadius,
      LAYOUT.pedestal.upperRadius + 0.18,
      LAYOUT.pedestal.upperHeight,
      48
    ),
    new THREE.MeshStandardMaterial({
      color: 0xf3e6c4,
      roughness: 0.28,
      metalness: 0.35
    })
  );
  upperStep.position.y = LAYOUT.pedestal.lowerHeight + LAYOUT.pedestal.upperHeight / 2;

  pedestalGroup.add(lowerStep);
  pedestalGroup.add(upperStep);
  pedestalGroup.position.set(LAYOUT.pedestal.x, LAYOUT.pedestal.y, 0);
  scene.add(pedestalGroup);

  const animated = [];
  const flames = [];
  const objLoader = new THREE.OBJLoader();

  function makeMaterial(color, extras) {
    extras = extras || {};
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: extras.roughness != null ? extras.roughness : 0.45,
      metalness: extras.metalness != null ? extras.metalness : 0.08,
      emissive: extras.emissive || 0x000000,
      emissiveIntensity: extras.emissiveIntensity || 0
    });
  }

  function makeWrapTexture(base, accent, style) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = accent;
    if (style === "stripe") {
      ctx.save();
      ctx.translate(64, 64);
      ctx.rotate(0.45);
      for (let i = -160; i < 160; i += 18) ctx.fillRect(i, -200, 7, 400);
      ctx.restore();
    } else {
      for (let y = 10; y < 128; y += 22) {
        for (let x = 10; x < 128; x += 22) {
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  const wrapPapers = [
    makeWrapTexture("#9b1c1c", "#f4d03f", "stripe"),
    makeWrapTexture("#7f1d1d", "#fff1e6", "dot"),
    makeWrapTexture("#c41e3a", "#fde68a", "stripe"),
    makeWrapTexture("#b91c1c", "#fecaca", "dot"),
    makeWrapTexture("#be123c", "#fef3c7", "stripe")
  ];

  function paintFor(name, wrapIndex) {
    const n = name.toLowerCase();
    if (n.indexOf("holder") !== -1) return makeMaterial(0xd4af37, { roughness: 0.22, metalness: 0.78 });
    if (n.indexOf("balloon") !== -1) {
      return new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,
        roughness: 0.18,
        metalness: 0.08,
        clearcoat: 0.7,
        clearcoatRoughness: 0.18,
        emissive: 0x000000,
        emissiveIntensity: 0
      });
    }
    if (n.indexOf("hat") !== -1) return makeMaterial(0x9b1c1c, { roughness: 0.4, metalness: 0.08 });
    if (n.indexOf("happy") !== -1 || n.indexOf("decoration") !== -1) {
      return makeMaterial(0xe11d2e, {
        roughness: 0.35,
        metalness: 0.12,
        emissive: 0x5a1010,
        emissiveIntensity: 0.25
      });
    }
    if (n.indexOf("roban") !== -1 || n.indexOf("sweep") !== -1) {
      return makeMaterial(0xf0c94d, { roughness: 0.28, metalness: 0.55, emissive: 0x5a3a00, emissiveIntensity: 0.12 });
    }
    if (n.indexOf("cube") !== -1 || n.indexOf("extrude") !== -1 || n.indexOf("door") !== -1) {
      const paper = wrapPapers[(wrapIndex || 0) % wrapPapers.length];
      return new THREE.MeshStandardMaterial({
        map: paper,
        color: 0xffffff,
        roughness: 0.48,
        metalness: 0.08
      });
    }
    if (n.indexOf("cylinder") !== -1 || n.indexOf("platonic") !== -1) {
      return makeMaterial(0xc1121f, { roughness: 0.35, metalness: 0.18, emissive: 0x3b0008, emissiveIntensity: 0.12 });
    }
    return makeMaterial(0xc41e3a, { roughness: 0.45, metalness: 0.1 });
  }

  function colorCakeByHeight(mesh) {
    const pos = mesh.geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    let ymin = Infinity;
    let ymax = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < ymin) ymin = y;
      if (y > ymax) ymax = y;
    }
    const body = new THREE.Color(0x9b1c1c);
    const frost = new THREE.Color(0xffc9b5);
    const deco = new THREE.Color(0xe11d2e);
    const candle = new THREE.Color(0xffe08a);
    const flame = new THREE.Color(0xff7b00);
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - ymin) / (ymax - ymin + 0.0001);
      const c = t < 0.2 ? body : t < 0.52 ? frost : t < 0.76 ? deco : t < 0.92 ? candle : flame;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    mesh.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    mesh.material = makeMaterial(0xffffff, { roughness: 0.42, metalness: 0.06 });
    mesh.material.vertexColors = true;
  }

  function pruneJunk(root) {
    const kill = [];
    root.traverse(function (child) {
      const name = (child.name || "").toLowerCase();
      if (name.indexOf("plane") !== -1 || name.indexOf("ckae") !== -1) kill.push(child);
    });
    kill.forEach(function (child) {
      if (child.parent) child.parent.remove(child);
    });
  }

  function paintObject(root) {
    pruneJunk(root);
    let wrapIndex = 0;

    root.traverse(function (child) {
      if (!child.isMesh) return;
      const parentName = child.parent && child.parent.name ? child.parent.name : "";
      const name = (child.name + " " + parentName).toLowerCase();
      if (name.indexOf("cake") !== -1) {
        colorCakeByHeight(child);
        return;
      }
      child.material = paintFor(name, wrapIndex);
      wrapIndex += 1;
    });
  }

  function ensureRenderable(root) {
    root.traverse(function (child) {
      if (!child.isMesh || !child.geometry) return;
      const geometry = child.geometry;
      if (geometry.index && geometry.attributes.position && geometry.attributes.position.count > 65535) {
        child.geometry = geometry.toNonIndexed();
      }
    });
  }

  function visibleBox(object) {
    const box = new THREE.Box3();
    object.updateWorldMatrix(true, true);
    object.traverse(function (child) {
      if (!child.isMesh || !child.visible || !child.geometry) return;
      if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
      const part = child.geometry.boundingBox.clone();
      part.applyMatrix4(child.matrixWorld);
      box.union(part);
    });
    return box;
  }

  function fitModel(object, size, mode) {
    ensureRenderable(object);
    const wrapper = new THREE.Group();
    wrapper.add(object);

    const box = visibleBox(wrapper);
    if (!box.isEmpty()) object.position.sub(box.getCenter(new THREE.Vector3()));

    const sized = visibleBox(wrapper).getSize(new THREE.Vector3());
    const dim =
      mode === "max"
        ? Math.max(sized.x, sized.y, sized.z)
        : mode === "xz"
          ? Math.max(sized.x, sized.z)
          : Math.max(sized.y, 0.0001);
    wrapper.scale.setScalar(size / Math.max(dim, 0.0001));

    const grounded = visibleBox(wrapper);
    if (!grounded.isEmpty()) wrapper.position.y -= grounded.min.y;
    return wrapper;
  }

  function place(wrapper, x, y, z, kind, extra) {
    extra = extra || {};
    wrapper.position.set(x, y, z);
    wrapper.userData = extra;
    wrapper.userData.kind = kind;
    wrapper.userData.baseY = y;
    scene.add(wrapper);
    animated.push(wrapper);
    return wrapper;
  }

  function clonePainted(source) {
    const clone = source.clone(true);
    clone.traverse(function (child) {
      if (child.isMesh && child.material) child.material = child.material.clone();
    });
    return clone;
  }

  function loadObj(url) {
    return new Promise(function (resolve, reject) {
      objLoader.load(url, resolve, undefined, reject);
    });
  }

  function addConfetti() {
    const count = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 12;
      positions[i3 + 1] = Math.random() * 8 + 1;
      positions[i3 + 2] = (Math.random() - 0.5) * 12;
      const palette = [
        [0.83, 0.69, 0.22],
        [0.95, 0.90, 0.77],
        [0.16, 0.44, 0.48],
        [0.76, 0.07, 0.12],
        [0.49, 0.60, 0.43]
      ][i % 5];
      colors[i3] = palette[0];
      colors[i3 + 1] = palette[1];
      colors[i3 + 2] = palette[2];
      speeds[i] = 0.006 + Math.random() * 0.01;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.9 })
    );
    scene.add(points);
    return { points: points, speeds: speeds, count: count };
  }

  function makeTallCake() {
    const group = new THREE.Group();
    const cream = makeMaterial(0xfff3e0, { roughness: 0.48, metalness: 0.04 });
    const pistachio = makeMaterial(0x7c9a6d, { roughness: 0.46, metalness: 0.05 });
    const chocolate = makeMaterial(0x6b3e26, { roughness: 0.55, metalness: 0.04 });
    const icing = makeMaterial(0xfffaf2, { roughness: 0.3, metalness: 0.06 });
    const gold = makeMaterial(0xd4af37, { roughness: 0.22, metalness: 0.72 });
    const berry = makeMaterial(0xc1121f, { roughness: 0.28, metalness: 0.12, emissive: 0x4a0010, emissiveIntensity: 0.18 });
    const candleWax = makeMaterial(0xfff8dc, { roughness: 0.35, metalness: 0.05 });
    const candleStripe = makeMaterial(0x2a6f7a, { roughness: 0.35, metalness: 0.08 });
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffc14d,
      emissive: 0xff6a00,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0
    });

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.95, 0.1, 48), gold);
    plate.position.y = 0.05;
    group.add(plate);

    const layers = [
      { r: 1.62, h: 0.72, colorMat: chocolate },
      { r: 1.28, h: 0.62, colorMat: cream },
      { r: 0.96, h: 0.54, colorMat: pistachio }
    ];
    let y = 0.1;
    layers.forEach(function (spec) {
      const layer = new THREE.Mesh(new THREE.CylinderGeometry(spec.r, spec.r * 1.02, spec.h, 48), spec.colorMat);
      layer.position.y = y + spec.h / 2;
      group.add(layer);

      const dripCount = 18;
      for (let i = 0; i < dripCount; i++) {
        const a = (i / dripCount) * Math.PI * 2 + spec.r;
        const drip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), icing);
        drip.scale.set(0.7, 1.35 + (i % 3) * 0.18, 0.7);
        drip.position.set(Math.cos(a) * spec.r * 0.96, y + spec.h - 0.02, Math.sin(a) * spec.r * 0.96);
        group.add(drip);
      }

      const rim = new THREE.Mesh(new THREE.TorusGeometry(spec.r * 0.97, 0.08, 10, 36), icing);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = y + spec.h;
      group.add(rim);
      y += spec.h;
    });

    for (let i = 0; i < 16; i++) {
      const strawberryMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), berry);
      strawberryMesh.scale.set(0.85, 1.15, 0.85);
      const a = (i / 16) * Math.PI * 2;
      strawberryMesh.position.set(Math.cos(a) * 0.78, y + 0.08, Math.sin(a) * 0.78);
      group.add(strawberryMesh);
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const candle = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.58, 12), candleWax);
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 16), candleStripe);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = 0.08;
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), flameMat);
      flame.scale.set(0.7, 1.55, 0.7);
      flame.position.y = 0.4;
      flames.push(flame);
      candle.add(body);
      candle.add(stripe);
      candle.add(flame);
      candle.position.set(Math.cos(a) * 0.38, y + 0.38, Math.sin(a) * 0.38);
      group.add(candle);
    }

    return group;
  }

  function makeGiftBox(width, height, depth, wrapColor, ribbonColor) {
    const group = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      makeMaterial(wrapColor, { roughness: 0.42, metalness: 0.08, emissive: wrapColor, emissiveIntensity: 0.06 })
    );
    box.position.y = height / 2;

    const ribbon = makeMaterial(ribbonColor, { roughness: 0.28, metalness: 0.45, emissive: ribbonColor, emissiveIntensity: 0.08 });
    const bandX = new THREE.Mesh(new THREE.BoxGeometry(width * 1.02, height * 1.02, depth * 0.14), ribbon);
    bandX.position.y = height / 2;
    const bandZ = new THREE.Mesh(new THREE.BoxGeometry(width * 0.14, height * 1.02, depth * 1.02), ribbon);
    bandZ.position.y = height / 2;

    const knot = new THREE.Mesh(new THREE.SphereGeometry(Math.min(width, depth) * 0.12, 12, 12), ribbon);
    knot.position.y = height + 0.04;
    const loopA = new THREE.Mesh(new THREE.TorusGeometry(width * 0.16, width * 0.045, 8, 16), ribbon);
    loopA.rotation.y = 0.7;
    loopA.scale.set(1, 0.65, 1);
    loopA.position.set(-width * 0.12, height + 0.05, 0);
    const loopB = loopA.clone();
    loopB.rotation.y = -0.7;
    loopB.position.x = width * 0.12;

    group.add(box, bandX, bandZ, knot, loopA, loopB);
    return group;
  }

  function makeGiftPile(seed) {
    const palettes = [
      { wrap: 0x1e3a5f, ribbon: 0xd4af37 },
      { wrap: 0xf3e6c4, ribbon: 0x2a6f7a },
      { wrap: 0x2a6f7a, ribbon: 0xf3e6c4 },
      { wrap: 0x7c9a6d, ribbon: 0xd4af37 },
      { wrap: 0xd4af37, ribbon: 0x1e3a5f },
      { wrap: 0x3d4f6f, ribbon: 0xc1121f }
    ];
    const pile = new THREE.Group();
    const count = 2 + (seed % 2);
    let y = 0;
    for (let i = 0; i < count; i++) {
      const palette = palettes[(seed + i) % palettes.length];
      const w = 0.85 - i * 0.12;
      const h = 0.62 - i * 0.08;
      const d = 0.75 - i * 0.1;
      const box = makeGiftBox(w, h, d, palette.wrap, palette.ribbon);
      box.position.y = y;
      box.rotation.y = (i - 1) * 0.28;
      pile.add(box);
      y += h;
    }
    return pile;
  }

  const confetti = addConfetti();

  async function buildScene() {
    setProgress("Inflating balloons", 0.12);
    const balloonObj = await loadObj("./Balloon.obj");
    paintObject(balloonObj);
    const balloonTemplate = fitModel(balloonObj, 2.2, "height");

    LAYOUT.balloons.forEach(function (spot, index) {
      const balloon = index === 0 ? balloonTemplate : clonePainted(balloonTemplate);
      balloon.traverse(function (child) {
        if (child.isMesh) {
          child.material.color.setHex(spot.color);
          child.material.emissive.setHex(0x000000);
        }
      });
      balloon.scale.multiplyScalar(spot.scale);
      place(balloon, spot.x, spot.y, spot.z, "balloon", {
        phase: index * 0.9,
        sway: 0.7 + index * 0.07
      });
    });

    setProgress("Wrapping the gifts", 0.45);
    LAYOUT.gifts.forEach(function (spot, index) {
      const pile = makeGiftPile(index);
      pile.rotation.y = spot.rotY;
      place(pile, spot.x, spot.y, spot.z, "gift", { phase: index * 0.7 });
    });

    setProgress("Building Zandra's cake", 0.8);
    const cake = makeTallCake();
    place(cake, LAYOUT.mainCake.x, LAYOUT.mainCake.y, LAYOUT.mainCake.z, "mainCake", { phase: 0 });

    setProgress("Ready for Zandra", 1);
    loaderEl.classList.add("is-hidden");
    startWish();
  }

  function startWish() {
    let left = 28;
    wishEl.classList.add("is-on");
    countdownEl.textContent = String(left);
    countdownFill.style.setProperty("--p", "1");

    const tick = setInterval(function () {
      left -= 1;
      countdownEl.textContent = String(Math.max(left, 0));
      countdownFill.style.setProperty("--p", String(Math.max(left, 0) / 28));
      if (left <= 0) {
        clearInterval(tick);
        candlesLit = false;
        wishEl.classList.remove("is-on");
        wishEl.classList.add("is-off");
        letterStage.classList.add("is-on");
        document.body.classList.add("letter-open");
        requestAnimationFrame(function () {
          letterStage.classList.add("is-open");
        });
      }
    }, 1000);
  }

  if (letterClose) {
    letterClose.addEventListener("click", function () {
      letterStage.classList.remove("is-open");
      letterStage.classList.remove("is-on");
      document.body.classList.remove("letter-open");
    });
  }

  function animate() {
    const t = performance.now() / 1000;
    rimLight.intensity = 2.2 + Math.sin(t * 1.6) * 0.35;
    cakeGlow.intensity = 1.5 + Math.sin(t * 2.1) * 0.25;

    animated.forEach(function (object) {
      const data = object.userData;
      const kind = data.kind;
      const baseY = data.baseY;
      const phase = data.phase || 0;
      const sway = data.sway || 1;

      if (kind === "mainCake") {
        object.rotation.y = t * LAYOUT.mainCake.spin;
        object.position.y = baseY + Math.sin(t * 1.1) * 0.03;
      } else if (kind === "gift") {
        object.position.y = baseY;
      } else if (kind === "balloon") {
        object.position.y = baseY + Math.sin(t * 1.05 + phase) * 0.18;
        object.rotation.z = Math.sin(t * 0.9 + phase) * 0.1 * sway;
        object.rotation.x = Math.cos(t * 0.8 + phase) * 0.05;
      }
    });

    flames.forEach(function (flame, i) {
      if (!candlesLit) {
        flame.scale.set(0.01, 0.01, 0.01);
        flame.material.emissiveIntensity = 0;
        flame.visible = false;
        return;
      }
      const pulse = 1 + Math.sin(t * 9 + i * 1.3) * 0.18;
      flame.scale.set(0.7 * pulse, 1.55 * pulse, 0.7 * pulse);
      flame.material.emissiveIntensity = 1.5 + Math.sin(t * 11 + i) * 0.4;
    });

    const positions = confetti.points.geometry.attributes.position.array;
    for (let i = 0; i < confetti.count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] -= confetti.speeds[i];
      positions[i3] += Math.sin(t + i) * 0.002;
      if (positions[i3 + 1] < -0.2) {
        positions[i3 + 1] = 8 + Math.random() * 3;
        positions[i3] = (Math.random() - 0.5) * 12;
        positions[i3 + 2] = (Math.random() - 0.5) * 12;
      }
    }
    confetti.points.geometry.attributes.position.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  buildScene().catch(function (error) {
    fail("Three.js could not load the OBJ models.", error);
  });
})();
