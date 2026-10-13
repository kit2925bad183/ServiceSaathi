import * as THREE from "three";
import { EquipmentHotspot } from "./ACDiagnosticScene";

export interface McbSwitchState {
  id: number;
  label: string;
  ratingAmps: number;
  isOn: boolean;
  leverMesh: THREE.Group;
  indicatorMat: THREE.MeshBasicMaterial;
}

export class ElectricalBoardScene {
  public group: THREE.Group;
  public clickables: Array<{
    mesh: THREE.Object3D;
    hotspot?: EquipmentHotspot;
    mcbId?: number;
  }> = [];
  public mcbSwitches: McbSwitchState[] = [];
  private sparkParticles?: THREE.Points;
  private sparkMaterial?: THREE.PointsMaterial;
  private sparkActive = false;
  private sparkTime = 0;

  private animatedObjects: Array<{
    update: (delta: number, elapsed: number) => void;
  }> = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "ElectricalBoardScene";
    this.buildBoard();
  }

  private buildBoard() {
    // 1. Wall Backing & Enclosure Box
    const enclosureGeo = new THREE.BoxGeometry(4.8, 3.6, 0.6);
    const enclosureMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.4,
    });
    const enclosure = new THREE.Mesh(enclosureGeo, enclosureMat);
    enclosure.receiveShadow = true;
    this.group.add(enclosure);

    // Inner White Mounting Plate
    const plateGeo = new THREE.BoxGeometry(4.5, 3.3, 0.05);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.z = 0.28;
    this.group.add(plate);

    // DIN Rail (Galvanized Steel Mounting Track)
    const dinRailGeo = new THREE.BoxGeometry(4.1, 0.18, 0.08);
    const dinRailMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.2,
    });
    const dinRail = new THREE.Mesh(dinRailGeo, dinRailMat);
    dinRail.position.set(0, 0.1, 0.35);
    this.group.add(dinRail);

    // Neutral Busbar & Ground Terminal at top
    const busbarGeo = new THREE.BoxGeometry(3.6, 0.12, 0.06);
    const busbarMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Brass / Copper
      metalness: 0.8,
      roughness: 0.3,
    });
    const neutralBusbar = new THREE.Mesh(busbarGeo, busbarMat);
    neutralBusbar.position.set(0, 1.3, 0.33);
    this.group.add(neutralBusbar);

    // 2. Main 63A Double Pole Isolator Switch (Left)
    this.createMainIsolator(-1.5, 0.1, 0.42);

    // 3. 5 Individual Single-Pole MCB Breakers
    const mcbConfigs = [
      { id: 1, label: "Lighting (10A)", amps: 10, defaultOn: true },
      { id: 2, label: "Kitchen Appliances (16A)", amps: 16, defaultOn: true },
      { id: 3, label: "Master AC Inverter (16A)", amps: 16, defaultOn: false }, // Tripped/Faulty
      { id: 4, label: "Living Room HVAC (16A)", amps: 16, defaultOn: true },
      { id: 5, label: "Geyser & Booster (20A)", amps: 20, defaultOn: true },
    ];

    mcbConfigs.forEach((cfg, index) => {
      const posX = -0.6 + index * 0.58;
      this.createMcbBreaker(posX, 0.1, 0.42, cfg);
    });

    // 4. Spark Particle System for Simulated Overload Trips
    this.setupSparkParticles();

    // 5. Diagnostic Hotspots
    this.createDiagnosticHotspots();
  }

  private createMainIsolator(x: number, y: number, z: number) {
    const isolatorGroup = new THREE.Group();
    isolatorGroup.position.set(x, y, z);

    // Double-width body
    const bodyGeo = new THREE.BoxGeometry(0.7, 1.3, 0.45);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    isolatorGroup.add(body);

    // Red Main Switch Lever
    const leverGeo = new THREE.BoxGeometry(0.5, 0.3, 0.25);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const lever = new THREE.Mesh(leverGeo, leverMat);
    lever.position.set(0, 0.05, 0.28);
    isolatorGroup.add(lever);

    // Indicator Dot
    const indGeo = new THREE.BoxGeometry(0.2, 0.08, 0.02);
    const indMat = new THREE.MeshBasicMaterial({ color: 0x16a34a }); // Green = Closed/Active
    const ind = new THREE.Mesh(indGeo, indMat);
    ind.position.set(0, 0.45, 0.24);
    isolatorGroup.add(ind);

    this.group.add(isolatorGroup);
  }

  private createMcbBreaker(
    x: number,
    y: number,
    z: number,
    cfg: { id: number; label: string; amps: number; defaultOn: boolean }
  ) {
    const mcb = new THREE.Group();
    mcb.position.set(x, y, z);

    // MCB Casing
    const casingGeo = new THREE.BoxGeometry(0.48, 1.25, 0.42);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.castShadow = true;
    mcb.add(casing);

    // Status Indicator Window
    const indGeo = new THREE.BoxGeometry(0.2, 0.08, 0.02);
    const indMat = new THREE.MeshBasicMaterial({
      color: cfg.defaultOn ? 0x16a34a : 0xdc2626, // Green when ON, Red when OFF
    });
    const ind = new THREE.Mesh(indGeo, indMat);
    ind.position.set(0, 0.42, 0.22);
    mcb.add(ind);

    // Toggle Lever Pivot Group
    const leverPivot = new THREE.Group();
    leverPivot.position.set(0, 0.05, 0.22);

    const leverGeo = new THREE.BoxGeometry(0.32, 0.22, 0.18);
    const leverMat = new THREE.MeshStandardMaterial({
      color: cfg.id === 3 ? 0xf59e0b : 0x1e293b, // Yellow for AC breaker, dark for others
      roughness: 0.3,
    });
    const leverMesh = new THREE.Mesh(leverGeo, leverMat);
    leverMesh.position.set(0, 0, 0.08);
    leverPivot.add(leverMesh);

    // Position lever based on ON / OFF state
    // ON = tilted up (+0.35 rad), OFF = tilted down (-0.35 rad)
    leverPivot.rotation.x = cfg.defaultOn ? 0.35 : -0.35;
    mcb.add(leverPivot);

    this.group.add(mcb);

    // Register switch state
    const state: McbSwitchState = {
      id: cfg.id,
      label: cfg.label,
      ratingAmps: cfg.amps,
      isOn: cfg.defaultOn,
      leverMesh: leverPivot,
      indicatorMat: indMat,
    };
    this.mcbSwitches.push(state);

    // Register click target
    this.clickables.push({
      mesh: casing,
      mcbId: cfg.id,
      hotspot: {
        id: `mcb-circuit-${cfg.id}`,
        name: `Circuit #${cfg.id} - ${cfg.label}`,
        category: "electrical",
        healthScore: cfg.id === 3 ? 35 : 94,
        status: cfg.id === 3 ? "critical" : "good",
        faultDetails:
          cfg.id === 3
            ? "Thermal bimetallic strip triggered due to 24.8A sustained overload on 16A rated breaker."
            : `Circuit operating nominal within rated ${cfg.amps}A capacity. Clean power factor.`,
        recommendedService:
          cfg.id === 3
            ? "Replace with Type-C 25A High-Inrush Breaker + Phase Balancing Inspection"
            : "Routine terminal screw re-torque & thermographic scan",
        estimatedCost: cfg.id === 3 ? 450 : 250,
        serviceId: "srv-elec-mcb",
      },
    });
  }

  public toggleMcb(id: number): boolean {
    const sw = this.mcbSwitches.find((s) => s.id === id);
    if (!sw) return false;

    sw.isOn = !sw.isOn;
    sw.leverMesh.rotation.x = sw.isOn ? 0.35 : -0.35;
    sw.indicatorMat.color.setHex(sw.isOn ? 0x16a34a : 0xdc2626);
    return sw.isOn;
  }

  public getCurrentLoad(): { totalAmps: number; totalWatts: number; activeCircuits: number } {
    let totalAmps = 0;
    let activeCircuits = 0;
    this.mcbSwitches.forEach((sw) => {
      if (sw.isOn) {
        totalAmps += sw.ratingAmps * 0.65; // realistic operating draw
        activeCircuits++;
      }
    });
    return {
      totalAmps: Math.round(totalAmps * 10) / 10,
      totalWatts: Math.round(totalAmps * 230),
      activeCircuits,
    };
  }

  public triggerFaultSimulation(): { mcbId: number; message: string } {
    // Force trip Circuit 3 (Master AC)
    const target = this.mcbSwitches.find((s) => s.id === 3);
    if (target) {
      target.isOn = false;
      target.leverMesh.rotation.x = -0.35; // Flip down
      target.indicatorMat.color.setHex(0xdc2626); // Red
    }

    // Trigger visual spark particle burst
    this.sparkActive = true;
    this.sparkTime = 0;
    if (this.sparkMaterial) {
      this.sparkMaterial.opacity = 1.0;
    }

    return {
      mcbId: 3,
      message:
        "CRITICAL OVERLOAD TRIP: Circuit #3 (16A AC Breaker) tripped under 26.2A inrush current! Bimetallic latch open.",
    };
  }

  private setupSparkParticles() {
    const particleCount = 60;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0.56; // near circuit 3
      positions[i * 3 + 1] = 0.1;
      positions[i * 3 + 2] = 0.7;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 4,
          (Math.random() - 0.5) * 4
        )
      );
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.sparkMaterial = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.sparkParticles = new THREE.Points(geometry, this.sparkMaterial);
    this.group.add(this.sparkParticles);

    this.animatedObjects.push({
      update: (delta) => {
        if (!this.sparkActive || !this.sparkParticles || !this.sparkMaterial) return;

        this.sparkTime += delta;
        const posAttr = this.sparkParticles.geometry.attributes
          .position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const v = velocities[i];
          array[i * 3] += v.x * delta;
          array[i * 3 + 1] += v.y * delta - 9.8 * delta * delta; // gravity
          array[i * 3 + 2] += v.z * delta;
        }
        posAttr.needsUpdate = true;
        this.sparkMaterial.opacity = Math.max(0, 1.0 - this.sparkTime * 2.5);

        if (this.sparkTime > 0.45) {
          this.sparkActive = false;
          this.sparkMaterial.opacity = 0;
        }
      },
    });
  }

  private createDiagnosticHotspots() {
    // Earthing busbar hotspot
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-1.2, 1.35, 0.4);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
      })
    );
    earthGroup.add(core);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.28, 20),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      })
    );
    ring.rotation.x = Math.PI / 2;
    earthGroup.add(ring);
    this.group.add(earthGroup);

    this.clickables.push({
      mesh: core,
      hotspot: {
        id: "elec-earth-01",
        name: "Protective Earth Ground Busbar",
        category: "electrical",
        healthScore: 92,
        status: "good",
        faultDetails: "Earth resistance measured at 1.8 Ohms (compliant with IS 3043 standard < 2.0 Ohms).",
        recommendedService: "Annual chemical earthing pit moisture treatment",
        estimatedCost: 350,
        serviceId: "srv-elec-earth",
      },
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
