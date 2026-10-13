import * as THREE from "three";
import { EquipmentHotspot } from "./ACDiagnosticScene";

export class PumpManifoldScene {
  public group: THREE.Group;
  public clickables: Array<{
    mesh: THREE.Object3D;
    hotspot?: EquipmentHotspot;
    valveId?: string;
  }> = [];

  private gaugeNeedle!: THREE.Mesh;
  private valveHandle!: THREE.Group;
  private waterParticles!: THREE.Points;
  private leakDrops!: THREE.Points;
  private valveIsOpen = true;

  private animatedObjects: Array<{
    update: (delta: number, elapsed: number) => void;
  }> = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "PumpManifoldScene";
    this.buildManifold();
  }

  private buildManifold() {
    // 1. Concrete Equipment Plinth
    const plinthGeo = new THREE.BoxGeometry(4.6, 0.4, 2.6);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -1.2;
    plinth.receiveShadow = true;
    this.group.add(plinth);

    // 2. Electric Motor Body (Cast Iron Green/Teal)
    const motorGroup = new THREE.Group();
    motorGroup.position.set(-1.0, -0.4, 0);

    const motorGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 24);
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.4,
      metalness: 0.3,
    });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.castShadow = true;
    motorGroup.add(motor);

    // Motor Cooling Ribs
    for (let i = -0.6; i <= 0.6; i += 0.2) {
      const ribGeo = new THREE.TorusGeometry(0.58, 0.03, 6, 24);
      const ribMat = new THREE.MeshStandardMaterial({ color: 0x115e59 });
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.x = i;
      rib.rotation.y = Math.PI / 2;
      motorGroup.add(rib);
    }

    // Terminal Junction Box on top
    const termBoxGeo = new THREE.BoxGeometry(0.5, 0.3, 0.4);
    const termBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const termBox = new THREE.Mesh(termBoxGeo, termBoxMat);
    termBox.position.set(0, 0.65, 0);
    motorGroup.add(termBox);
    this.group.add(motorGroup);

    // 3. Volute Impeller Pump Head (Right side of motor)
    const pumpHeadGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.5, 24);
    const pumpHeadMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      metalness: 0.5,
      roughness: 0.3,
    });
    const pumpHead = new THREE.Mesh(pumpHeadGeo, pumpHeadMat);
    pumpHead.position.set(0.1, -0.4, 0);
    pumpHead.rotation.z = Math.PI / 2;
    this.group.add(pumpHead);

    // 4. Pressure Vessel / Expansion Tank (Blue)
    const tankGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.4, 24);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.2,
      roughness: 0.3,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(1.4, 0.3, 0);
    tank.castShadow = true;
    this.group.add(tank);

    // 5. Water Pipeline Manifold (Pipes)
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
    });

    // Vertical riser pipe
    const riserGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
    const riser = new THREE.Mesh(riserGeo, pipeMat);
    riser.position.set(0.1, 0.4, 0);
    this.group.add(riser);

    // Horizontal delivery pipe
    const horizPipeGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.5, 16);
    const horizPipe = new THREE.Mesh(horizPipeGeo, pipeMat);
    horizPipe.rotation.z = Math.PI / 2;
    horizPipe.position.set(0.7, 1.0, 0);
    this.group.add(horizPipe);

    // 6. Analog Pressure Gauge (Top of manifold)
    const gaugeGroup = new THREE.Group();
    gaugeGroup.position.set(0.1, 1.25, 0);

    const gaugeBodyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 24);
    const gaugeBodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
    });
    const gaugeBody = new THREE.Mesh(gaugeBodyGeo, gaugeBodyMat);
    gaugeBody.rotation.x = Math.PI / 2;
    gaugeGroup.add(gaugeBody);

    // White dial face
    const dialGeo = new THREE.CircleGeometry(0.28, 24);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.z = 0.07;
    gaugeGroup.add(dial);

    // Animated Red Indicator Needle
    const needleGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    this.gaugeNeedle = new THREE.Mesh(needleGeo, needleMat);
    this.gaugeNeedle.position.set(0, 0.09, 0.08);
    gaugeGroup.add(this.gaugeNeedle);
    this.group.add(gaugeGroup);

    // 7. Interactive Brass Gate Valve
    this.valveHandle = new THREE.Group();
    this.valveHandle.position.set(1.4, 1.0, 0);

    const valveStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.7 })
    );
    valveStem.position.y = 0.18;
    this.valveHandle.add(valveStem);

    const wheelGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = 0.36;
    this.valveHandle.add(wheel);

    this.group.add(this.valveHandle);

    this.clickables.push({
      mesh: wheel,
      valveId: "main-delivery-valve",
      hotspot: {
        id: "pump-valve-01",
        name: "Delivery Gate Valve & Seal",
        category: "plumbing",
        healthScore: 72,
        status: "warning",
        faultDetails: "Valve packing gland shows minor weeping leak. Pressure regulator oscillates under high flow.",
        recommendedService: "Gland Packing Replacement & Valve Reseating",
        estimatedCost: 350,
        serviceId: "srv-plumb-valve",
      },
    });

    // 8. Animated Water Particles inside pipe
    this.setupWaterParticles();

    // 9. Animated Water Drips / Leak Effect
    this.setupLeakParticles();

    // 10. Diagnostic Hotspots
    this.createDiagnosticHotspots();
  }

  private setupWaterParticles() {
    const count = 40;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0.1 + Math.random() * 1.2;
      pos[i * 3 + 1] = 1.0 + (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.waterParticles = new THREE.Points(geo, mat);
    this.group.add(this.waterParticles);

    this.animatedObjects.push({
      update: (delta) => {
        if (!this.valveIsOpen) return;
        const attr = this.waterParticles.geometry.attributes.position as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        for (let i = 0; i < count; i++) {
          arr[i * 3] += delta * 1.5; // Flow to the right
          if (arr[i * 3] > 1.4) {
            arr[i * 3] = 0.1;
          }
        }
        attr.needsUpdate = true;
      },
    });
  }

  private setupLeakParticles() {
    const count = 15;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0.1;
      pos[i * 3 + 1] = 0.3 - (i / count) * 0.8;
      pos[i * 3 + 2] = 0.18;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x0284c7,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });

    this.leakDrops = new THREE.Points(geo, mat);
    this.group.add(this.leakDrops);

    this.animatedObjects.push({
      update: (delta) => {
        const attr = this.leakDrops.geometry.attributes.position as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        for (let i = 0; i < count; i++) {
          arr[i * 3 + 1] -= delta * 1.2; // Drip down
          if (arr[i * 3 + 1] < -0.8) {
            arr[i * 3 + 1] = 0.35; // Reset to pipe joint
          }
        }
        attr.needsUpdate = true;
      },
    });
  }

  private createDiagnosticHotspots() {
    // Hotspot: Impeller Casing
    const impCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
      })
    );
    impCore.position.set(0.1, -0.4, 0.45);
    this.group.add(impCore);

    this.clickables.push({
      mesh: impCore,
      hotspot: {
        id: "pump-impeller-01",
        name: "Brass Impeller & Mechanical Seal",
        category: "plumbing",
        healthScore: 56,
        status: "critical",
        faultDetails: "Silicon carbide mechanical seal worn out. Air ingress causing loss of prime and suction cavity cavitation.",
        recommendedService: "Mechanical Seal Kit Overhaul + Impeller Scale Removal",
        estimatedCost: 750,
        serviceId: "srv-plumb-seal",
      },
    });

    // Hotspot: Expansion Diaphragm Tank
    const tankCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
      })
    );
    tankCore.position.set(1.4, 0.8, 0.4);
    this.group.add(tankCore);

    this.clickables.push({
      mesh: tankCore,
      hotspot: {
        id: "pump-tank-02",
        name: "Hydro-Pneumatic Diaphragm Tank (24L)",
        category: "plumbing",
        healthScore: 88,
        status: "good",
        faultDetails: "Pre-charge nitrogen pressure at 28 PSI (nominal: 25-30 PSI). EPDM membrane in healthy elasticity.",
        recommendedService: "Periodic air pre-charge pressure validation",
        estimatedCost: 250,
        serviceId: "srv-plumb-tank",
      },
    });
  }

  public toggleValve(): boolean {
    this.valveIsOpen = !this.valveIsOpen;
    if (this.valveHandle) {
      this.valveHandle.rotation.y += Math.PI / 2;
    }
    return this.valveIsOpen;
  }

  public update(delta: number, elapsed: number) {
    this.animatedObjects.forEach((obj) => obj.update(delta, elapsed));

    // Animate pressure gauge needle
    if (this.gaugeNeedle) {
      const baseAngle = this.valveIsOpen ? 0.8 : -0.6;
      // subtle needle jitter for realistic analog meter
      this.gaugeNeedle.rotation.z = baseAngle + Math.sin(elapsed * 10) * 0.04;
    }
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
