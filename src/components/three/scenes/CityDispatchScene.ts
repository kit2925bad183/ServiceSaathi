import * as THREE from "three";

export interface CityDispatchTelemetry {
  id: string;
  type: "hub" | "building" | "van";
  title: string;
  category: "ac" | "electrical" | "plumbing" | "cleaning" | "central";
  address: string;
  status: "idle" | "en-route" | "in-service" | "critical";
  technicianName?: string;
  etaMinutes?: number;
  activeJobId?: string;
  faultSummary: string;
  suggestedAction: string;
  estimatedPrice: number;
}

export class CityDispatchScene {
  public group: THREE.Group;
  public clickables: Array<{ mesh: THREE.Object3D; telemetry: CityDispatchTelemetry }> = [];
  private animatedObjects: Array<{
    update: (delta: number, elapsed: number) => void;
  }> = [];
  private streetLights: THREE.PointLight[] = [];

  // Dynamic Weather - Monsoon Rain Simulation
  private isMonsoonRain = false;
  private rainParticles?: THREE.Points;
  private rainMaterial?: THREE.PointsMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "CityDispatchScene";
    this.buildScene();
    this.setupRain();
  }

  private buildScene() {
    // 1. Stylized Isometric Circular Base
    const baseGeo = new THREE.CylinderGeometry(15, 15.5, 1.2, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.6;
    base.receiveShadow = true;
    this.group.add(base);

    // Top ground platform
    const groundGeo = new THREE.CylinderGeometry(14.6, 14.6, 0.1, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0.05;
    ground.receiveShadow = true;
    this.group.add(ground);

    // 2. Intersecting Asphalt Avenues & Roundabout
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    // Roundabout Center
    const roundaboutGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.08, 32);
    const roundabout = new THREE.Mesh(roundaboutGeo, roadMat);
    roundabout.position.y = 0.08;
    roundabout.receiveShadow = true;
    this.group.add(roundabout);

    // Roads crossing
    const roadH = new THREE.Mesh(new THREE.BoxGeometry(26, 0.06, 2.8), roadMat);
    roadH.position.set(0, 0.08, 0);
    roadH.receiveShadow = true;
    this.group.add(roadH);

    const roadV = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 26), roadMat);
    roadV.position.set(0, 0.08, 0);
    roadV.receiveShadow = true;
    this.group.add(roadV);

    // Roundabout inner fountain / island
    const centerGrassGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.18, 24);
    const centerGrassMat = new THREE.MeshStandardMaterial({ color: 0x0f766e });
    const centerGrass = new THREE.Mesh(centerGrassGeo, centerGrassMat);
    centerGrass.position.y = 0.16;
    this.group.add(centerGrass);

    // Central Radio Dispatch Tower (Pulsing antenna beacon)
    const towerGeo = new THREE.CylinderGeometry(0.1, 0.25, 4.5, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.7, roughness: 0.2 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(0, 2.3, 0);
    this.group.add(tower);

    // Tower Beacon Sphere
    const beaconSphereGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.8,
    });
    const beaconSphere = new THREE.Mesh(beaconSphereGeo, beaconMat);
    beaconSphere.position.set(0, 4.6, 0);
    this.group.add(beaconSphere);

    // Animated Radio Wave Ring
    const waveRingGeo = new THREE.RingGeometry(0.2, 0.5, 32);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    waveRing.rotation.x = Math.PI / 2;
    waveRing.position.set(0, 4.6, 0);
    this.group.add(waveRing);

    this.animatedObjects.push({
      update: (_delta, elapsed) => {
        const scale = 1 + (elapsed * 2) % 6;
        waveRing.scale.set(scale, scale, 1);
        waveRingMat.opacity = Math.max(0, 1 - scale / 6.5);
      },
    });

    // 3. Buildings: 4 Specialized Hubs
    // A: HVAC Residential Apartments (Top-Left)
    this.createServiceHub({
      position: new THREE.Vector3(-6.5, 0, -6.0),
      size: new THREE.Vector3(4.2, 5.0, 3.6),
      color: 0xffffff,
      roofColor: 0x0f766e,
      label: "Apex AC & Refrigeration Zone",
      telemetry: {
        id: "loc-ac-101",
        type: "building",
        title: "Skyline Residency - 4BHK Split AC Repair",
        category: "ac",
        address: "Block B, Flat 402, Race Course Road",
        status: "in-service",
        technicianName: "Murugan S. (HVAC Specialist)",
        etaMinutes: 12,
        activeJobId: "JOB-AC-8492",
        faultSummary: "Indoor evaporator coil choked with fine dust; cooling drop of 7°C.",
        suggestedAction: "High-Pressure Jet Spray Foam Cleaning + Gas Pressure Test",
        estimatedPrice: 799,
      },
      accessory: "ac-units",
    });

    // B: Commercial Power & Electrical Substation (Top-Right)
    this.createServiceHub({
      position: new THREE.Vector3(6.5, 0, -6.0),
      size: new THREE.Vector3(3.8, 6.8, 3.8),
      color: 0xf1f5f9,
      roofColor: 0xd97706,
      label: "GridTech Commercial Power Hub",
      telemetry: {
        id: "loc-elec-204",
        type: "building",
        title: "TechPark Tower 3 - MCB Tripping Diagnostics",
        category: "electrical",
        address: "Floor 4 Server Room, Avinashi Road",
        status: "critical",
        technicianName: "Karthik Natarajan (A-Grade Wireman)",
        etaMinutes: 8,
        activeJobId: "JOB-ELE-9104",
        faultSummary: "Main 63A distribution breaker tripping repeatedly under 18kW surge load.",
        suggestedAction: "Thermal Imaging Inspection + 3-Phase Phase Balancing & C-Curve MCB Replacement",
        estimatedPrice: 1450,
      },
      accessory: "transformer",
    });

    // C: Sanitary Water Villa (Bottom-Left)
    this.createServiceHub({
      position: new THREE.Vector3(-6.5, 0, 6.0),
      size: new THREE.Vector3(4.4, 3.5, 3.8),
      color: 0xffffff,
      roofColor: 0x0284c7,
      label: "Greenfield Villa Water Infrastructure",
      telemetry: {
        id: "loc-plumb-307",
        type: "building",
        title: "Villa 18 - Pressure Booster Pump Failure",
        category: "plumbing",
        address: "Greenfield Enclave, Gandhipuram",
        status: "en-route",
        technicianName: "Vignesh P. (Plumbing & Pumps)",
        etaMinutes: 19,
        activeJobId: "JOB-PLM-4421",
        faultSummary: "Hydro-pneumatic pump dry running with rattling impeller vibration.",
        suggestedAction: "Automatic Flow Sensor Replacement + 1HP Booster Servicing",
        estimatedPrice: 950,
      },
      accessory: "water-tank",
    });

    // D: Deep Cleaning & Hygiene Facility (Bottom-Right)
    this.createServiceHub({
      position: new THREE.Vector3(6.5, 0, 6.0),
      size: new THREE.Vector3(4.8, 3.8, 4.0),
      color: 0xf8fafc,
      roofColor: 0x059669,
      label: "CleanPro Industrial Sanitization Depot",
      telemetry: {
        id: "loc-clean-412",
        type: "building",
        title: "Apex Logistics HQ - Complete Deep Cleaning",
        category: "cleaning",
        address: "Warehouse Bay 6, Peelamedu",
        status: "idle",
        technicianName: "Team Alpha (3 Crew Members)",
        etaMinutes: 35,
        activeJobId: "JOB-CLN-7730",
        faultSummary: "Post-construction mechanized scrub + antibacterial fogging requested.",
        suggestedAction: "Rotary Single-Disc Floor Scrubbing + Restroom Descaling",
        estimatedPrice: 2899,
      },
      accessory: "cleaning-van",
    });

    // 4. Traveling Technician Vans along Road Network
    this.createTechnicianVans();

    // 5. Pulsing Laser Dispatch Lines
    this.createDispatchLines();

    // 6. Street Lighting for Sunset / Night Simulation
    this.createStreetLighting();

    // 7. Foliage / Urban Landscaping
    this.createFoliage();
  }

  private createServiceHub(opts: {
    position: THREE.Vector3;
    size: THREE.Vector3;
    color: number;
    roofColor: number;
    label: string;
    telemetry: CityDispatchTelemetry;
    accessory: "ac-units" | "transformer" | "water-tank" | "cleaning-van";
  }) {
    const building = new THREE.Group();
    building.name = opts.label;
    building.position.copy(opts.position);

    const { x: w, y: h, z: d } = opts.size;

    // Body
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: opts.color,
      roughness: 0.35,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = h / 2 + 0.1;
    body.castShadow = true;
    body.receiveShadow = true;
    building.add(body);

    // Roof
    const roofGeo = new THREE.BoxGeometry(w + 0.3, 0.25, d + 0.3);
    const roofMat = new THREE.MeshStandardMaterial({
      color: opts.roofColor,
      roughness: 0.3,
      metalness: 0.2,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.2;
    roof.castShadow = true;
    building.add(roof);

    // Glowing Windows
    const winGeo = new THREE.BoxGeometry(0.48, 0.6, 0.05);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.1,
    });
    const rows = Math.max(1, Math.floor(h / 1.3));
    for (let r = 0; r < rows; r++) {
      const yPos = 0.9 + r * 1.2;
      const win1 = new THREE.Mesh(winGeo, winMat);
      win1.position.set(-w / 3.8, yPos, d / 2 + 0.03);
      building.add(win1);

      const win2 = new THREE.Mesh(winGeo, winMat);
      win2.position.set(w / 3.8, yPos, d / 2 + 0.03);
      building.add(win2);
    }

    // Doorway
    const doorGeo = new THREE.BoxGeometry(0.8, 1.1, 0.06);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.65, d / 2 + 0.03);
    building.add(door);

    // Accessory models on roof / side
    if (opts.accessory === "ac-units") {
      // Outdoor AC compressor units
      const acGeo = new THREE.BoxGeometry(0.9, 0.65, 0.45);
      const acMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const ac1 = new THREE.Mesh(acGeo, acMat);
      ac1.position.set(-w / 4, h + 0.55, 0);
      building.add(ac1);
      const ac2 = new THREE.Mesh(acGeo, acMat);
      ac2.position.set(w / 4, h + 0.55, 0);
      building.add(ac2);
    } else if (opts.accessory === "transformer") {
      // High-voltage transformer box
      const transGeo = new THREE.BoxGeometry(0.9, 1.3, 0.9);
      const transMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4 });
      const trans = new THREE.Mesh(transGeo, transMat);
      trans.position.set(w / 2 + 0.7, 0.75, 0);
      building.add(trans);
    } else if (opts.accessory === "water-tank") {
      // Overhead water storage tank
      const tankGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.1, 16);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(0, h + 0.8, 0);
      building.add(tank);
    }

    // Interactive Floating Beacon Pin
    const pin = this.createFloatingPin(opts.roofColor, opts.label);
    pin.position.set(0, h + 2.0, 0);
    building.add(pin);

    // Register clickables for raycasting
    this.clickables.push({ mesh: body, telemetry: opts.telemetry });
    this.clickables.push({ mesh: pin, telemetry: opts.telemetry });

    // Floating bobbing animation for pin
    this.animatedObjects.push({
      update: (_delta, elapsed) => {
        pin.position.y = h + 2.0 + Math.sin(elapsed * 2.5 + opts.position.x) * 0.2;
        pin.rotation.y = elapsed * 1.5;
      },
    });

    this.group.add(building);
  }

  private createFloatingPin(colorHex: number, name: string): THREE.Group {
    const pin = new THREE.Group();
    pin.name = `Pin-${name}`;

    // Diamond / Octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.45, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.3,
    });
    const octa = new THREE.Mesh(octaGeo, octaMat);
    pin.add(octa);

    // Glowing Pulse Ring
    const ringGeo = new THREE.RingGeometry(0.55, 0.75, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.4;
    pin.add(ring);

    return pin;
  }

  private createTechnicianVans() {
    // Van 1 (AC Fleet) along X road
    const van1 = this.createVanMesh(0x0d9488);
    this.group.add(van1);

    // Van 2 (Electric Fleet) along Z road
    const van2 = this.createVanMesh(0xd97706);
    this.group.add(van2);

    this.animatedObjects.push({
      update: (_delta, elapsed) => {
        // Van 1 patrols between -8 and 8 on X
        const posX = Math.sin(elapsed * 0.4) * 8.5;
        const dirX = Math.cos(elapsed * 0.4) >= 0 ? 1 : -1;
        van1.position.set(posX, 0.1, 0.6);
        van1.rotation.y = dirX > 0 ? 0 : Math.PI;

        // Van 2 patrols between -8 and 8 on Z
        const posZ = Math.cos(elapsed * 0.35) * 8.5;
        const dirZ = -Math.sin(elapsed * 0.35) >= 0 ? 1 : -1;
        van2.position.set(-0.6, 0.1, posZ);
        van2.rotation.y = dirZ > 0 ? -Math.PI / 2 : Math.PI / 2;
      },
    });

    const vanTelemetry1: CityDispatchTelemetry = {
      id: "van-ac-01",
      type: "van",
      title: "ServiceSaathi Rapid HVAC Van #01",
      category: "ac",
      address: "En Route to Skyline Residency (Zone 2)",
      status: "en-route",
      technicianName: "Murugan Selvam",
      etaMinutes: 12,
      activeJobId: "JOB-AC-8492",
      faultSummary: "Equipped with high-pressure jet pump, R32 charging manifold, and vacuum gauges.",
      suggestedAction: "Monitor GPS live route in dashboard or book next slot.",
      estimatedPrice: 799,
    };
    this.clickables.push({ mesh: van1, telemetry: vanTelemetry1 });
  }

  private createVanMesh(bodyColorHex: number): THREE.Group {
    const van = new THREE.Group();
    van.name = "technician-van";

    // Van Main Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.75, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColorHex,
      roughness: 0.3,
      metalness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    van.add(body);

    // Windshield
    const cabGeo = new THREE.BoxGeometry(0.5, 0.45, 0.76);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0.48, 0.75, 0);
    van.add(cab);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
    const positions = [
      [0.55, 0.2, 0.42],
      [-0.55, 0.2, 0.42],
      [0.55, 0.2, -0.42],
      [-0.55, 0.2, -0.42],
    ];
    positions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, y, z);
      van.add(wheel);
    });

    // Roof Flash Beacon
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.0,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0.1, 0.95, 0);
    van.add(beacon);

    // Headlights (Spotlights)
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.12), hlMat);
    hl1.position.set(0.82, 0.45, 0.25);
    van.add(hl1);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.12), hlMat);
    hl2.position.set(0.82, 0.45, -0.25);
    van.add(hl2);

    return van;
  }

  private createDispatchLines() {
    // Create animated neon dispatch curves from center tower to each hub
    const destinations = [
      new THREE.Vector3(-6.5, 3.0, -6.0),
      new THREE.Vector3(6.5, 3.5, -6.0),
      new THREE.Vector3(-6.5, 2.5, 6.0),
      new THREE.Vector3(6.5, 2.8, 6.0),
    ];

    destinations.forEach((dest, index) => {
      const start = new THREE.Vector3(0, 4.6, 0);
      const mid = new THREE.Vector3(
        dest.x * 0.5,
        Math.max(start.y, dest.y) + 2.5,
        dest.z * 0.5
      );

      const curve = new THREE.QuadraticBezierCurve3(start, mid, dest);
      const points = curve.getPoints(32);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const colors = [0x0d9488, 0xd97706, 0x0284c7, 0x10b981];
      const lineMat = new THREE.LineDashedMaterial({
        color: colors[index % colors.length],
        dashSize: 0.6,
        gapSize: 0.4,
        scale: 1,
        transparent: true,
        opacity: 0.75,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      this.group.add(line);

      // Animate line dash offset by rotating or pulsing
      this.animatedObjects.push({
        update: (_delta, elapsed) => {
          lineMat.opacity = 0.4 + Math.sin(elapsed * 4 + index) * 0.35;
        },
      });
    });
  }

  private createStreetLighting() {
    // 4 decorative street lamps at road corners
    const lampPositions = [
      [-2.2, -2.2],
      [2.2, -2.2],
      [-2.2, 2.2],
      [2.2, 2.2],
    ];

    lampPositions.forEach(([x, z]) => {
      const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.8, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 0.9, z);
      this.group.add(post);

      const bulbGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: 0.8,
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(x, 1.8, z);
      this.group.add(bulb);

      const pLight = new THREE.PointLight(0xfef08a, 0.8, 8);
      pLight.position.set(x, 1.85, z);
      this.group.add(pLight);
      this.streetLights.push(pLight);
    });
  }

  private createFoliage() {
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const foliageGeo = new THREE.SphereGeometry(0.65, 12, 12);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 });

    const treePositions = [
      [-3.8, -4.5],
      [-9.5, -2.0],
      [4.2, -8.5],
      [-9.0, 3.5],
      [9.5, 2.5],
      [3.8, 8.5],
      [-4.0, 4.0],
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.4;
      trunk.castShadow = true;
      tree.add(trunk);

      const fol = new THREE.Mesh(foliageGeo, foliageMat);
      fol.position.y = 1.05;
      fol.castShadow = true;
      tree.add(fol);

      tree.position.set(tx, 0, tz);
      this.group.add(tree);
    });
  }

  private setupRain() {
    const rainCount = 450;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = 1 + Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    this.rainMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.rainParticles = new THREE.Points(geo, this.rainMaterial);
    this.group.add(this.rainParticles);

    this.animatedObjects.push({
      update: (delta) => {
        if (!this.isMonsoonRain || !this.rainParticles) return;
        const pArray = geo.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          pArray[i * 3 + 1] -= delta * 24; // Rapid monsoon rainfall
          pArray[i * 3] -= delta * 4;     // Wind slant
          if (pArray[i * 3 + 1] < 0) {
            pArray[i * 3 + 1] = 18 + Math.random() * 4;
            pArray[i * 3] = (Math.random() - 0.5) * 30;
          }
        }
        geo.attributes.position.needsUpdate = true;
      },
    });
  }

  public setMonsoonRain(enabled: boolean): boolean {
    this.isMonsoonRain = enabled;
    if (this.rainMaterial) {
      this.rainMaterial.opacity = enabled ? 0.75 : 0;
    }
    return this.isMonsoonRain;
  }

  public toggleMonsoonRain(): boolean {
    return this.setMonsoonRain(!this.isMonsoonRain);
  }

  public getMonsoonRain(): boolean {
    return this.isMonsoonRain;
  }

  public setTimeOfDay(mode: "day" | "sunset" | "night") {
    const intensityMap = {
      day: 0.2,
      sunset: 1.2,
      night: 2.2,
    };
    const targetIntensity = intensityMap[mode];
    this.streetLights.forEach((light) => {
      light.intensity = targetIntensity;
    });
  }

  public update(delta: number, elapsed: number) {
    this.animatedObjects.forEach((obj) => obj.update(delta, elapsed));
  }

  public dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}
