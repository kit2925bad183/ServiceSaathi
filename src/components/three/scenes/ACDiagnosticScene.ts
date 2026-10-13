import * as THREE from "three";

export interface EquipmentHotspot {
  id: string;
  name: string;
  category: "ac" | "electrical" | "plumbing";
  healthScore: number; // 0 - 100
  status: "good" | "warning" | "critical";
  faultDetails: string;
  recommendedService: string;
  estimatedCost: number;
  serviceId?: string;
}

export class ACDiagnosticScene {
  public group: THREE.Group;
  public clickables: Array<{ mesh: THREE.Object3D; hotspot: EquipmentHotspot }> = [];
  private animatedObjects: Array<{
    update: (delta: number, elapsed: number) => void;
  }> = [];

  // Explodable sub-assemblies
  private frontCover!: THREE.Group;
  private topLid!: THREE.Group;
  private fanAssembly!: THREE.Group;
  private fanBlades!: THREE.Group;

  // Thermal FLIR Mode
  private isThermalMode = false;
  private compCylinder!: THREE.Mesh;
  private compDefaultMat!: THREE.Material;
  private compThermalMat!: THREE.Material;
  private finBlock!: THREE.Mesh;
  private finDefaultMat!: THREE.Material;
  private finThermalMat!: THREE.Material;
  private refrigerantParticles?: THREE.Points;

  private explodeProgress = 0; // 0 = assembled, 1 = fully exploded

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "ACDiagnosticScene";
    this.buildModel();
  }

  private buildModel() {
    // 1. Equipment Stand / Testing Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(4.2, 4.6, 0.4, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.3,
      roughness: 0.7,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.2;
    pedestal.receiveShadow = true;
    this.group.add(pedestal);

    // Rubber anti-vibration mount pads
    const padMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
    const pad1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 1.6), padMat);
    pad1.position.set(-1.4, -0.95, 0);
    this.group.add(pad1);
    const pad2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 1.6), padMat);
    pad2.position.set(1.4, -0.95, 0);
    this.group.add(pad2);

    // 2. Chassis Base Tray
    const baseTrayGeo = new THREE.BoxGeometry(4.0, 0.15, 2.2);
    const baseTrayMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    });
    const baseTray = new THREE.Mesh(baseTrayGeo, baseTrayMat);
    baseTray.position.y = -0.8;
    this.group.add(baseTray);

    // 3. INTERNAL COMPONENTS (Visible during exploded view)
    // A: Rotary Compressor (Cylinder + accumulator)
    const compressorGroup = new THREE.Group();
    compressorGroup.position.set(1.1, -0.1, 0.1);

    const compCylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 24);
    this.compDefaultMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.7,
    });
    this.compThermalMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // 95°C Hot zone
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      roughness: 0.3,
    });
    this.compCylinder = new THREE.Mesh(compCylinderGeo, this.compDefaultMat);
    this.compCylinder.castShadow = true;
    compressorGroup.add(this.compCylinder);

    // Accumulator tube beside compressor
    const accGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 16);
    const acc = new THREE.Mesh(accGeo, this.compDefaultMat);
    acc.position.set(0.6, -0.15, 0);
    compressorGroup.add(acc);

    // Copper discharge tube curves
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.85,
      roughness: 0.2,
    });
    const tubeGeo = new THREE.TorusGeometry(0.4, 0.05, 8, 16, Math.PI);
    const copperTube = new THREE.Mesh(tubeGeo, copperMat);
    copperTube.position.set(0.3, 0.6, 0);
    compressorGroup.add(copperTube);
    this.group.add(compressorGroup);

    // B: Condenser Cooling Coil Fins Matrix (Left side)
    const coilGroup = new THREE.Group();
    coilGroup.position.set(-0.8, 0.3, -0.5);

    // Aluminum fins block (Curved L-shape representation)
    const finBlockGeo = new THREE.BoxGeometry(2.2, 1.9, 0.25);
    this.finDefaultMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.5,
      roughness: 0.3,
    });
    this.finThermalMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // 12°C Cold heat absorption
      emissive: 0x06b6d4,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    this.finBlock = new THREE.Mesh(finBlockGeo, this.finDefaultMat);
    this.finBlock.castShadow = true;
    coilGroup.add(this.finBlock);

    // Copper U-bends on coil side
    for (let i = -0.7; i <= 0.7; i += 0.3) {
      const uBend = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI), copperMat);
      uBend.position.set(-1.12, i, 0);
      uBend.rotation.y = Math.PI / 2;
      coilGroup.add(uBend);
    }
    this.group.add(coilGroup);

    // C: Refrigerant Vapor Flow Particle Cycle
    this.setupRefrigerantCycle();

    // C: Electrical PCB Control Box & Capacitor
    const pcbGroup = new THREE.Group();
    pcbGroup.position.set(1.2, 0.8, -0.4);

    const pcbBoxGeo = new THREE.BoxGeometry(1.0, 0.9, 0.6);
    const pcbBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const pcbBox = new THREE.Mesh(pcbBoxGeo, pcbBoxMat);
    pcbGroup.add(pcbBox);

    // Silver Cylindrical Run Capacitor
    const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1,
    });
    const capacitor = new THREE.Mesh(capGeo, capMat);
    capacitor.position.set(0.2, 0.55, 0);
    pcbGroup.add(capacitor);
    this.group.add(pcbGroup);

    // D: Brass Service Port Valves
    const valveGroup = new THREE.Group();
    valveGroup.position.set(1.8, -0.5, 0.6);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.25,
    });
    const valve1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12), brassMat);
    valve1.rotation.z = Math.PI / 2;
    valveGroup.add(valve1);
    const valve2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12), brassMat);
    valve2.position.set(0, -0.2, 0);
    valve2.rotation.z = Math.PI / 2;
    valveGroup.add(valve2);
    this.group.add(valveGroup);

    // 4. MOVABLE / EXPLODABLE SUB-ASSEMBLIES
    // A: Fan Assembly (Fan Motor + Blades)
    this.fanAssembly = new THREE.Group();
    this.fanAssembly.position.set(-0.8, 0.3, 0.1);

    const fanMotorGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 16);
    const fanMotorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const fanMotor = new THREE.Mesh(fanMotorGeo, fanMotorMat);
    fanMotor.rotation.x = Math.PI / 2;
    this.fanAssembly.add(fanMotor);

    // Fan Blades (Spinning)
    this.fanBlades = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    for (let b = 0; b < 3; b++) {
      const bladeGeo = new THREE.BoxGeometry(0.8, 0.22, 0.03);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = 0.42;
      blade.rotation.z = 0.2;

      const pivot = new THREE.Group();
      pivot.rotation.z = (b * Math.PI * 2) / 3;
      pivot.add(blade);
      this.fanBlades.add(pivot);
    }
    this.fanAssembly.add(this.fanBlades);
    this.group.add(this.fanAssembly);

    // B: Front Cover Shell with Fan Grille
    this.frontCover = new THREE.Group();
    this.frontCover.position.set(0, 0.3, 1.05);

    const coverGeo = new THREE.BoxGeometry(3.9, 2.1, 0.12);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
    });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.castShadow = true;
    this.frontCover.add(cover);

    // Circular protective fan cutout grille
    const grillRingGeo = new THREE.TorusGeometry(0.8, 0.04, 8, 24);
    const grillRingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const grillRing = new THREE.Mesh(grillRingGeo, grillRingMat);
    grillRing.position.set(-0.8, 0, 0.07);
    this.frontCover.add(grillRing);

    // Brand Badge "ServiceSaathi Inverter V"
    const badgeGeo = new THREE.BoxGeometry(0.8, 0.2, 0.02);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x0d9488 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(1.1, 0.7, 0.07);
    this.frontCover.add(badge);
    this.group.add(this.frontCover);

    // C: Top Lid Cover
    this.topLid = new THREE.Group();
    this.topLid.position.set(0, 1.4, 0);

    const lidGeo = new THREE.BoxGeometry(4.0, 0.1, 2.3);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.castShadow = true;
    this.topLid.add(lid);
    this.group.add(this.topLid);

    // 5. DIAGNOSTIC HOTSPOTS
    // Hotspot 1: Cooling Coil
    this.createHotspot({
      position: new THREE.Vector3(-0.8, 1.1, -0.4),
      color: 0x0284c7,
      hotspot: {
        id: "ac-coil-01",
        name: "Aluminum Condenser Coil Fins",
        category: "ac",
        healthScore: 42,
        status: "critical",
        faultDetails: "Severe dust & particulate film blocking 65% of micro-channels. Heat transfer efficiency reduced by 7.4°C.",
        recommendedService: "High-Pressure Jet Foam Deep Cleaning + Antibacterial Rinse",
        estimatedCost: 499,
        serviceId: "srv-ac-jet-clean",
      },
    });

    // Hotspot 2: Run Capacitor
    this.createHotspot({
      position: new THREE.Vector3(1.4, 1.2, -0.4),
      color: 0xd97706,
      hotspot: {
        id: "ac-cap-02",
        name: "Dual Run Capacitor (45+5 μF)",
        category: "ac",
        healthScore: 28,
        status: "critical",
        faultDetails: "Capacitance dropped to 19.2 μF with high dielectric heat loss. High risk of compressor locked-rotor trip.",
        recommendedService: "Heavy-Duty 450V Surge-Protected Capacitor Replacement",
        estimatedCost: 350,
        serviceId: "srv-ac-capacitor",
      },
    });

    // Hotspot 3: Service Valves & Refrigerant
    this.createHotspot({
      position: new THREE.Vector3(1.8, -0.2, 0.6),
      color: 0x10b981,
      hotspot: {
        id: "ac-gas-03",
        name: "R32 Refrigerant Service Port",
        category: "ac",
        healthScore: 78,
        status: "warning",
        faultDetails: "Suction line pressure at 108 PSI (standard: 125-135 PSI). Minor micro-seepage suspected at flare nut joint.",
        recommendedService: "Electronic Gas Leak Detection & 250g R32 Refrigerant Top-up",
        estimatedCost: 1199,
        serviceId: "srv-ac-gas-refill",
      },
    });

    // Hotspot 4: Fan Motor
    this.createHotspot({
      position: new THREE.Vector3(-0.8, 0.3, 0.4),
      color: 0x6366f1,
      hotspot: {
        id: "ac-fan-04",
        name: "BLDC Condenser Fan Motor",
        category: "ac",
        healthScore: 89,
        status: "good",
        faultDetails: "Motor bearings operating smoothly at 920 RPM. Slight dust deposition on blade trailing edges.",
        recommendedService: "Preventive Inspection & Aerodynamic Blade Balancing",
        estimatedCost: 299,
        serviceId: "srv-ac-fan-service",
      },
    });

    // Fan spinning animation
    this.animatedObjects.push({
      update: (delta) => {
        if (this.fanBlades) {
          this.fanBlades.rotation.z += delta * 12; // Realistic fast spin
        }
      },
    });
  }

  private createHotspot(opts: {
    position: THREE.Vector3;
    color: number;
    hotspot: EquipmentHotspot;
  }) {
    const group = new THREE.Group();
    group.position.copy(opts.position);

    // Glowing core sphere
    const coreGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: opts.color,
      emissive: opts.color,
      emissiveIntensity: 0.9,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Pulsing outer halo ring
    const ringGeo = new THREE.RingGeometry(0.24, 0.38, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: opts.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    this.group.add(group);
    this.clickables.push({ mesh: core, hotspot: opts.hotspot });

    this.animatedObjects.push({
      update: (_delta, elapsed) => {
        const pulse = 1 + Math.sin(elapsed * 4 + opts.position.x) * 0.25;
        ring.scale.set(pulse, pulse, pulse);
        ring.lookAt(0, 0, 10); // Billboard to general camera direction
      },
    });
  }

  private setupRefrigerantCycle() {
    const pCount = 70;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const t = Math.random();
      // Flow along path between compressor (1.1, 0.4) and coil (-0.8, 0.3)
      pos[i * 3] = 1.1 - t * 1.9;
      pos[i * 3 + 1] = 0.4 + Math.sin(t * Math.PI) * 0.3;
      pos[i * 3 + 2] = -0.1 - t * 0.4;

      // Half hot vapor (orange-red), half cold liquid (cyan-blue)
      if (t < 0.5) {
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.3;
        colors[i * 3 + 2] = 0.1;
      } else {
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.refrigerantParticles = new THREE.Points(geo, mat);
    this.group.add(this.refrigerantParticles);

    this.animatedObjects.push({
      update: (delta) => {
        const pArray = geo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          pArray[i * 3] -= delta * 0.8;
          if (pArray[i * 3] < -0.9) {
            pArray[i * 3] = 1.1 + Math.random() * 0.1;
          }
        }
        geo.attributes.position.needsUpdate = true;
      },
    });
  }

  public setThermalMode(enabled: boolean) {
    this.isThermalMode = enabled;
    if (this.compCylinder) {
      this.compCylinder.material = enabled ? this.compThermalMat : this.compDefaultMat;
    }
    if (this.finBlock) {
      this.finBlock.material = enabled ? this.finThermalMat : this.finDefaultMat;
    }
    if (this.refrigerantParticles) {
      (this.refrigerantParticles.material as THREE.PointsMaterial).size = enabled ? 0.14 : 0.08;
      (this.refrigerantParticles.material as THREE.PointsMaterial).opacity = enabled ? 0.95 : 0.75;
    }
    return this.isThermalMode;
  }

  public toggleThermalMode(): boolean {
    return this.setThermalMode(!this.isThermalMode);
  }

  public getThermalMode(): boolean {
    return this.isThermalMode;
  }

  public setExplode(progress: number) {
    // progress: 0 (assembled) -> 1 (fully exploded)
    this.explodeProgress = THREE.MathUtils.clamp(progress, 0, 1);

    // Move front cover forward on Z
    this.frontCover.position.z = 1.05 + this.explodeProgress * 2.2;
    // Move top lid upward on Y
    this.topLid.position.y = 1.4 + this.explodeProgress * 1.5;
    // Move fan assembly forward on Z
    this.fanAssembly.position.z = 0.1 + this.explodeProgress * 1.2;
  }

  public getExplodeProgress(): number {
    return this.explodeProgress;
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
