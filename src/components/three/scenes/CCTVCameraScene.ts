import * as THREE from "three";
import { EquipmentHotspot } from "./ACDiagnosticScene";

export interface CCTVTelemetryData {
  panAngle: number;
  tiltAngle: number;
  zoomLevel: number;
  irNightMode: boolean;
  bitrateKbps: number;
  fps: number;
  motionDetected: boolean;
}

export class CCTVCameraScene {
  public group: THREE.Group;
  public clickables: Array<{
    mesh: THREE.Object3D;
    hotspot?: EquipmentHotspot;
    actionId?: string;
  }> = [];

  public telemetry: CCTVTelemetryData = {
    panAngle: 15,
    tiltAngle: -25,
    zoomLevel: 1.0,
    irNightMode: false,
    bitrateKbps: 6144,
    fps: 30,
    motionDetected: false,
  };

  // PTZ Sub-Assemblies
  private panYoke!: THREE.Group;
  private tiltTurret!: THREE.Group;
  private irLeds: THREE.Mesh[] = [];
  private lensGlow!: THREE.Mesh;
  private nvrLeds: THREE.Mesh[] = [];

  private animatedObjects: Array<{
    update: (delta: number, elapsed: number) => void;
  }> = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "CCTVCameraScene";
    this.buildScene();
  }

  private buildScene() {
    // 1. Concrete / Brick Wall Backing
    const wallGeo = new THREE.BoxGeometry(5.4, 4.4, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 0, -1.2);
    wall.receiveShadow = true;
    this.group.add(wall);

    // Architectural Mortar Lines / Texture trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.08, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    trim.position.set(0, 1.2, -1.2);
    this.group.add(trim);

    // 2. Weatherproof IP67 Aluminum Junction Box
    const jBoxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.35);
    const jBoxMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.4,
      roughness: 0.3,
    });
    const jBox = new THREE.Mesh(jBoxGeo, jBoxMat);
    jBox.position.set(-0.6, 1.2, -0.85);
    jBox.castShadow = true;
    this.group.add(jBox);

    // Flexible Corrugated Conduit Tube
    const conduitGeo = new THREE.TorusGeometry(0.5, 0.04, 8, 24, Math.PI / 2);
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.position.set(-0.2, 1.2, -0.85);
    conduit.rotation.z = Math.PI;
    this.group.add(conduit);

    // 3. Heavy-Duty Aluminum Gooseneck Wall Arm Bracket
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 1.2, -0.9);

    const baseFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.5, roughness: 0.2 })
    );
    baseFlange.rotation.x = Math.PI / 2;
    armGroup.add(baseFlange);

    // Cantilever horizontal pipe arm
    const armPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.5, roughness: 0.2 })
    );
    armPipe.rotation.x = Math.PI / 2;
    armPipe.position.z = 0.75;
    armPipe.castShadow = true;
    armGroup.add(armPipe);

    // Downward elbow socket
    const elbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.5, roughness: 0.2 })
    );
    elbow.position.z = 1.5;
    armGroup.add(elbow);

    const downSocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.3 })
    );
    downSocket.position.set(0, -0.2, 1.5);
    armGroup.add(downSocket);

    this.group.add(armGroup);

    // 4. MOTORIZED PTZ SPEED DOME CAMERA ASSEMBLY
    // Root position under bracket
    const ptzRoot = new THREE.Group();
    ptzRoot.position.set(0, 0.8, 0.6);

    // Upper stationary housing collar
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.52, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.2 })
    );
    collar.position.y = 0.15;
    collar.castShadow = true;
    ptzRoot.add(collar);

    // PAN YOKE (Rotates Horizontally)
    this.panYoke = new THREE.Group();
    this.panYoke.position.y = 0;
    this.panYoke.rotation.y = (this.telemetry.panAngle * Math.PI) / 180;

    // Yoke bracket arms
    const yokeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const yokeArmLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.3), yokeMat);
    yokeArmLeft.position.set(-0.55, -0.35, 0);
    this.panYoke.add(yokeArmLeft);

    const yokeArmRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.3), yokeMat);
    yokeArmRight.position.set(0.55, -0.35, 0);
    this.panYoke.add(yokeArmRight);

    // TILT TURRET (Pivots Vertically between the yoke arms)
    this.tiltTurret = new THREE.Group();
    this.tiltTurret.position.set(0, -0.4, 0);
    this.tiltTurret.rotation.x = (this.telemetry.tiltAngle * Math.PI) / 180;

    // Spherical Optical Housing
    const sphereTurret = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 32, 24),
      new THREE.MeshStandardMaterial({
        color: 0x020617,
        roughness: 0.1,
        metalness: 0.8,
      })
    );
    sphereTurret.castShadow = true;
    this.tiltTurret.add(sphereTurret);

    // Front Camera Lens Bezel (Machined aluminum ring)
    const bezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.04, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.85, roughness: 0.2 })
    );
    bezel.position.z = 0.44;
    this.tiltTurret.add(bezel);

    // 4K Optical Glass Element
    const lensGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32),
      new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        roughness: 0.05,
        metalness: 0.9,
      })
    );
    lensGlass.rotation.x = Math.PI / 2;
    lensGlass.position.z = 0.46;
    this.tiltTurret.add(lensGlass);

    // Inner Lens Aperture Core
    this.lensGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    this.lensGlow.position.z = 0.488;
    this.tiltTurret.add(this.lensGlow);

    // Ring of 8 Infrared IR Matrix LEDs around the lens
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const irLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x334155 }) // Off by default
      );
      irLed.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.4);
      this.tiltTurret.add(irLed);
      this.irLeds.push(irLed);
    }

    this.panYoke.add(this.tiltTurret);
    ptzRoot.add(this.panYoke);
    this.group.add(ptzRoot);

    // Clickable Hotspot 1: Optical Lens
    const lensHotspot: EquipmentHotspot = {
      id: "hotspot-cctv-lens",
      name: "Sony Starvis 4K 8MP Optical Sensor & IR Cut",
      category: "electrical",
      healthScore: 96,
      status: "good",
      faultDetails: "Focal plane calibrated. 0.005 Lux low-light sensitivity nominal. Anti-fog seal active.",
      recommendedService: "Hydrophobic Optical Coating & Lens Surface Polishing",
      estimatedCost: 999,
    };
    this.clickables.push({ mesh: this.tiltTurret, hotspot: lensHotspot, actionId: "lens-inspect" });

    // Clickable Hotspot 2: Motorized Gimbal
    const gimbalHotspot: EquipmentHotspot = {
      id: "hotspot-cctv-gimbal",
      name: "Dual-Axis Micro-Stepper PTZ Drive Motor",
      category: "electrical",
      healthScore: 84,
      status: "warning",
      faultDetails: "Minor gear-track friction detected during fast preset sweeps (2.4° backlash).",
      recommendedService: "PTZ Belt Re-Tensioning & Synthetic Lubrication",
      estimatedCost: 1250,
    };
    this.clickables.push({ mesh: this.panYoke, hotspot: gimbalHotspot, actionId: "ptz-control" });

    // 5. Rackmount 16-Channel 4K NVR & PoE Switch Unit (Bottom of wall)
    const nvrRack = new THREE.Group();
    nvrRack.position.set(0, -1.2, -0.6);

    // Metal 1U chassis
    const nvrBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.4, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
    );
    nvrBody.castShadow = true;
    nvrRack.add(nvrBody);

    // Front bezel rack ears
    const earL = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.44, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    earL.position.set(-1.22, 0, 0.44);
    nvrRack.add(earL);

    const earR = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.44, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    earR.position.set(1.22, 0, 0.44);
    nvrRack.add(earR);

    // 8x PoE RJ45 Port array with green/amber link LEDs
    for (let i = 0; i < 8; i++) {
      const port = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.08, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      port.position.set(-0.8 + i * 0.14, 0.04, 0.46);
      nvrRack.add(port);

      const linkLed = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 0.01),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      linkLed.position.set(-0.8 + i * 0.14, 0.11, 0.46);
      nvrRack.add(linkLed);
      this.nvrLeds.push(linkLed);
    }

    // Power & HDD Activity LEDs
    const hddLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    hddLed.position.set(0.9, 0.05, 0.46);
    nvrRack.add(hddLed);
    this.nvrLeds.push(hddLed);

    this.group.add(nvrRack);

    // Clickable Hotspot 3: NVR Unit
    const nvrHotspot: EquipmentHotspot = {
      id: "hotspot-cctv-nvr",
      name: "16-Channel 4K Enterprise NVR & 8TB Surveillance HDD",
      category: "electrical",
      healthScore: 91,
      status: "good",
      faultDetails: "Seagate SkyHawk 8TB drive SMART status: PASSED. Zero bad sectors. 28 days retention.",
      recommendedService: "Thermal Dusting & Network Hardening Audit",
      estimatedCost: 1500,
    };
    this.clickables.push({ mesh: nvrRack, hotspot: nvrHotspot });

    // Blue Cat6 Ethernet Patch Cable running up wall
    const cablePoints = [
      new THREE.Vector3(0.5, -1.0, -0.6),
      new THREE.Vector3(0.5, 0.2, -0.9),
      new THREE.Vector3(-0.6, 0.8, -0.9),
      new THREE.Vector3(-0.6, 1.2, -0.85),
    ];
    const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 32, 0.025, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    this.group.add(cable);

    // Animation Loop
    this.animatedObjects.push({
      update: (delta, elapsed) => {
        // Blink NVR link LEDs
        this.nvrLeds.forEach((led, idx) => {
          const mat = led.material as THREE.MeshBasicMaterial;
          mat.color.setHex(Math.sin(elapsed * 12 + idx) > 0.2 ? 0x10b981 : 0x064e3b);
        });

        // Slight ambient lens glow breathing
        if (this.lensGlow) {
          const mat = this.lensGlow.material as THREE.MeshBasicMaterial;
          if (this.telemetry.irNightMode) {
            mat.color.setHex(0xdc2626); // Red IR glow
          } else {
            mat.color.setHex(0x10b981); // Emerald glass reflection
          }
        }
      },
    });
  }

  // Interactive Pan / Tilt
  public panBy(deltaDegrees: number) {
    this.telemetry.panAngle = (this.telemetry.panAngle + deltaDegrees) % 360;
    if (this.panYoke) {
      this.panYoke.rotation.y = (this.telemetry.panAngle * Math.PI) / 180;
    }
  }

  public tiltBy(deltaDegrees: number) {
    this.telemetry.tiltAngle = Math.max(-65, Math.min(25, this.telemetry.tiltAngle + deltaDegrees));
    if (this.tiltTurret) {
      this.tiltTurret.rotation.x = (this.telemetry.tiltAngle * Math.PI) / 180;
    }
  }

  public toggleIrNightMode(): boolean {
    this.telemetry.irNightMode = !this.telemetry.irNightMode;
    const isNight = this.telemetry.irNightMode;

    this.irLeds.forEach((led) => {
      const mat = led.material as THREE.MeshBasicMaterial;
      mat.color.setHex(isNight ? 0xef4444 : 0x334155);
    });

    return isNight;
  }

  public update(delta: number, elapsed: number) {
    this.animatedObjects.forEach((obj) => obj.update(delta, elapsed));
  }

  public dispose() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
