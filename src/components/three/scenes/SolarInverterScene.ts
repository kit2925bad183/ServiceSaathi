import * as THREE from "three";
import { EquipmentHotspot } from "./ACDiagnosticScene";

export interface SolarTelemetryData {
  solarGenerationKw: number;
  batterySocPercent: number;
  gridExportKw: number;
  panelEfficiency: number;
  isCleaned: boolean;
  isIsolatorConnected: boolean;
}

export class SolarInverterScene {
  public group: THREE.Group;
  public clickables: Array<{
    mesh: THREE.Object3D;
    hotspot?: EquipmentHotspot;
    actionId?: string;
  }> = [];

  // State
  public telemetry: SolarTelemetryData = {
    solarGenerationKw: 3.2,
    batterySocPercent: 88,
    gridExportKw: 2.1,
    panelEfficiency: 76,
    isCleaned: false,
    isIsolatorConnected: true,
  };

  // Interactive meshes
  private dustLayers: THREE.Mesh[] = [];
  private isolatorLever!: THREE.Group;
  private energyParticles!: THREE.Points;
  private washSprayParticles!: THREE.Points;
  private washSprayActive = false;
  private washSprayTimer = 0;
  private inverterLcdMesh!: THREE.Mesh;
  private batteryLeds: THREE.Mesh[] = [];

  private animatedObjects: Array<{
    update: (delta: number, elapsed: number) => void;
  }> = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "SolarInverterScene";
    this.buildScene();
  }

  private buildScene() {
    // 1. Rooftop Platform & Terracotta Roof Tiles
    const roofPlinthGeo = new THREE.BoxGeometry(6.4, 0.4, 4.4);
    const roofPlinthMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
    });
    const roofPlinth = new THREE.Mesh(roofPlinthGeo, roofPlinthMat);
    roofPlinth.position.y = -1.2;
    roofPlinth.receiveShadow = true;
    this.group.add(roofPlinth);

    // Weathered Rooftop Surface / Parapet
    const tileGeo = new THREE.BoxGeometry(6.2, 0.08, 4.2);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Warm terracotta roof
      roughness: 0.9,
    });
    const tileBase = new THREE.Mesh(tileGeo, tileMat);
    tileBase.position.y = -0.96;
    tileBase.receiveShadow = true;
    this.group.add(tileBase);

    // Parapet Wall Backing for Inverter Mounting
    const wallGeo = new THREE.BoxGeometry(2.4, 3.2, 0.3);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(2.0, 0.6, -1.2);
    wall.receiveShadow = true;
    this.group.add(wall);

    // 2. Solar PV Racking Rails (Aluminum Struts)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.2,
    });
    const strutLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), railMat);
    strutLeft.position.set(-2.4, -0.4, -0.8);
    this.group.add(strutLeft);

    const strutRight = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), railMat);
    strutRight.position.set(0.2, -0.4, -0.8);
    this.group.add(strutRight);

    // 3. 4-Panel Monocrystalline Photovoltaic Array (Tilted at 20 degrees)
    const arrayGroup = new THREE.Group();
    arrayGroup.position.set(-1.1, -0.3, 0.1);
    arrayGroup.rotation.x = 0.32; // Tilt facing sun

    const panelFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });

    const siliconCellMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep blue-black crystalline silicon
      roughness: 0.15,
      metalness: 0.65,
    });

    const dustMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Indian dust / atmospheric soiling
      transparent: true,
      opacity: 0.55,
      roughness: 0.95,
    });

    // 2x2 Solar PV Grid
    const panelCoords = [
      { x: -0.9, y: 0.7 },
      { x: 0.9, y: 0.7 },
      { x: -0.9, y: -0.7 },
      { x: 0.9, y: -0.7 },
    ];

    panelCoords.forEach((coord, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(coord.x, coord.y, 0);

      // Aluminum Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.25, 0.06), panelFrameMat);
      frame.castShadow = true;
      pGroup.add(frame);

      // Silicon Glass Surface
      const cell = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.15, 0.02), siliconCellMat);
      cell.position.z = 0.03;
      pGroup.add(cell);

      // Grid busbar lines
      for (let i = -0.6; i <= 0.6; i += 0.3) {
        const busbar = new THREE.Mesh(new THREE.BoxGeometry(0.015, 1.1, 0.01), railMat);
        busbar.position.set(i, 0, 0.04);
        pGroup.add(busbar);
      }

      // Removable Dust Soiling Layer
      const dust = new THREE.Mesh(new THREE.BoxGeometry(1.54, 1.14, 0.015), dustMat.clone());
      dust.position.z = 0.045;
      pGroup.add(dust);
      this.dustLayers.push(dust);

      arrayGroup.add(pGroup);
    });

    this.group.add(arrayGroup);

    // Register PV Panel Array as clickable hotspot
    const pvHotspot: EquipmentHotspot = {
      id: "hotspot-solar-panels",
      name: "Monocrystalline Bifacial PV Array (2.2 kWp)",
      category: "electrical",
      healthScore: 72,
      status: "warning",
      faultDetails: "Particulate soiling & bird drops reducing solar absorption by 24%.",
      recommendedService: "Pressurized Deionized Water Jet Wash & Anti-Static Sealant",
      estimatedCost: 1499,
    };
    this.clickables.push({ mesh: arrayGroup, hotspot: pvHotspot, actionId: "clean-panels" });

    // 4. Smart Hybrid Solar Inverter (Mounted on wall)
    const inverterGroup = new THREE.Group();
    inverterGroup.position.set(2.0, 0.7, -1.0);

    const inverterChassisGeo = new THREE.BoxGeometry(1.1, 1.4, 0.35);
    const inverterChassisMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean industrial white
      roughness: 0.3,
      metalness: 0.3,
    });
    const inverterChassis = new THREE.Mesh(inverterChassisGeo, inverterChassisMat);
    inverterChassis.castShadow = true;
    inverterGroup.add(inverterChassis);

    // Side Cooling Aluminum Heatsink Fins
    for (let i = -0.55; i <= 0.55; i += 0.12) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.15), railMat);
      fin.position.set(-0.58, i, -0.05);
      inverterGroup.add(fin);
    }

    // LCD Telemetry Display Screen
    const lcdGeo = new THREE.BoxGeometry(0.65, 0.38, 0.02);
    const lcdMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Emerald green backlit solar LCD
      emissive: 0x059669,
      emissiveIntensity: 0.65,
    });
    this.inverterLcdMesh = new THREE.Mesh(lcdGeo, lcdMat);
    this.inverterLcdMesh.position.set(0, 0.28, 0.18);
    inverterGroup.add(this.inverterLcdMesh);

    // Inverter Status LEDs (Power, Invert, Fault)
    const ledGreen = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    ledGreen.position.set(-0.2, 0.02, 0.18);
    inverterGroup.add(ledGreen);

    const ledAmber = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    ledAmber.position.set(0, 0.02, 0.18);
    inverterGroup.add(ledAmber);

    const ledRed = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    ledRed.position.set(0.2, 0.02, 0.18);
    inverterGroup.add(ledRed);

    // Inverter Hotspot
    const inverterHotspot: EquipmentHotspot = {
      id: "hotspot-solar-inverter",
      name: "ServiceSaathi 5kW Hybrid String Inverter",
      category: "electrical",
      healthScore: 94,
      status: "good",
      faultDetails: "Operating normally. Dual MPPT efficiency at 98.4%. Grid sync synchronized at 50.0 Hz.",
      recommendedService: "Annual Heat Sink Dusting & Firmware Telemetry Verification",
      estimatedCost: 999,
    };
    this.clickables.push({ mesh: inverterGroup, hotspot: inverterHotspot });
    this.group.add(inverterGroup);

    // 5. LiFePO4 Lithium Battery Storage Rack (Mounted below inverter)
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(2.0, -0.4, -1.0);

    const batteryBoxGeo = new THREE.BoxGeometry(1.1, 0.6, 0.38);
    const batteryBoxMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.3,
    });
    const batteryBox = new THREE.Mesh(batteryBoxGeo, batteryBoxMat);
    batteryBox.castShadow = true;
    batteryGroup.add(batteryBox);

    // Battery State-of-Charge LED Bar
    for (let i = 0; i < 5; i++) {
      const ledBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.03, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      ledBar.position.set(-0.25 + i * 0.12, 0.12, 0.2);
      batteryGroup.add(ledBar);
      this.batteryLeds.push(ledBar);
    }

    const batteryHotspot: EquipmentHotspot = {
      id: "hotspot-solar-battery",
      name: "LiFePO4 Solar Energy Storage Rack (5.12 kWh)",
      category: "electrical",
      healthScore: 91,
      status: "good",
      faultDetails: "State of Charge 88%. Internal BMS cell voltage deviation: < 12mV (Excellent health).",
      recommendedService: "BMS Calibration & High-Amp Lug Torque Tightening",
      estimatedCost: 1200,
    };
    this.clickables.push({ mesh: batteryGroup, hotspot: batteryHotspot });
    this.group.add(batteryGroup);

    // 6. Rotary DC Isolator Switch (Between solar array and inverter)
    const isolatorGroup = new THREE.Group();
    isolatorGroup.position.set(1.0, 0.6, -1.0);

    const isoBoxGeo = new THREE.BoxGeometry(0.35, 0.45, 0.18);
    const isoBoxMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const isoBox = new THREE.Mesh(isoBoxGeo, isoBoxMat);
    isolatorGroup.add(isoBox);

    // Red Rotary Safety Switch
    this.isolatorLever = new THREE.Group();
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    knob.rotation.x = Math.PI / 2;
    this.isolatorLever.add(knob);
    this.isolatorLever.position.set(0, 0, 0.1);
    isolatorGroup.add(this.isolatorLever);

    const isolatorHotspot: EquipmentHotspot = {
      id: "hotspot-solar-isolator",
      name: "1000V DC String Surge & Disconnect Isolator",
      category: "electrical",
      healthScore: 82,
      status: "good",
      faultDetails: "MC4 connector terminal contact resistance nominal. Arcing shield intact.",
      recommendedService: "SPD Type II Replacement & Thermal Scan",
      estimatedCost: 750,
    };
    this.clickables.push({ mesh: isolatorGroup, hotspot: isolatorHotspot, actionId: "toggle-isolator" });
    this.group.add(isolatorGroup);

    // 7. Energy Particle Flow System (Amber and Green energy streams)
    this.setupEnergyParticles();

    // 8. Water Jet Wash Spray Particles (Triggered on cleaning)
    this.setupWashSprayParticles();
  }

  private setupEnergyParticles() {
    const pCount = 90;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      // Curve between solar panels and inverter
      const t = Math.random();
      positions[i * 3] = -1.2 + t * 3.0;
      positions[i * 3 + 1] = 0.0 + Math.sin(t * Math.PI) * 0.4;
      positions[i * 3 + 2] = 0.2 - t * 1.0;

      // Warm solar amber
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.75 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.1;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.energyParticles = new THREE.Points(geo, mat);
    this.group.add(this.energyParticles);

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        if (!this.telemetry.isIsolatorConnected) {
          mat.opacity = 0.08;
          return;
        }
        mat.opacity = this.telemetry.isCleaned ? 0.95 : 0.6;
        const pos = geo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          pos[i * 3] += delta * 1.5;
          if (pos[i * 3] > 2.0) {
            pos[i * 3] = -1.6 + Math.random() * 0.2;
          }
        }
        geo.attributes.position.needsUpdate = true;
      },
    });
  }

  private setupWashSprayParticles() {
    const sprayCount = 140;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(sprayCount * 3);

    for (let i = 0; i < sprayCount; i++) {
      positions[i * 3] = -2.0 + Math.random() * 2.2;
      positions[i * 3 + 1] = 0.8 + Math.random() * 0.8;
      positions[i * 3 + 2] = -0.4 + Math.random() * 1.4;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.washSprayParticles = new THREE.Points(geo, mat);
    this.group.add(this.washSprayParticles);

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        if (this.washSprayActive) {
          this.washSprayTimer += delta;
          mat.opacity = 0.85;

          const pos = geo.attributes.position.array as Float32Array;
          for (let i = 0; i < sprayCount; i++) {
            pos[i * 3 + 1] -= delta * 3.5;
            if (pos[i * 3 + 1] < -0.3) {
              pos[i * 3 + 1] = 0.9 + Math.random() * 0.5;
            }
          }
          geo.attributes.position.needsUpdate = true;

          // Gradually fade out dust layer
          const fadeProgress = Math.min(this.washSprayTimer / 2.0, 1.0);
          this.dustLayers.forEach((dust) => {
            (dust.material as THREE.MeshStandardMaterial).opacity = 0.55 * (1.0 - fadeProgress);
          });

          if (this.washSprayTimer >= 2.5) {
            this.washSprayActive = false;
            this.telemetry.isCleaned = true;
            this.telemetry.panelEfficiency = 98;
            this.telemetry.solarGenerationKw = 4.4;
            mat.opacity = 0;
          }
        }
      },
    });
  }

  public cleanPanels(): { message: string; efficiency: number } {
    this.washSprayActive = true;
    this.washSprayTimer = 0;
    return {
      message: "Jet foam wash initiated! Restoring PV absorption to 98%.",
      efficiency: 98,
    };
  }

  public toggleIsolator(): boolean {
    this.telemetry.isIsolatorConnected = !this.telemetry.isIsolatorConnected;
    if (this.isolatorLever) {
      this.isolatorLever.rotation.z = this.telemetry.isIsolatorConnected ? 0 : Math.PI / 2;
    }
    return this.telemetry.isIsolatorConnected;
  }

  public update(delta: number, elapsed: number) {
    this.animatedObjects.forEach((obj) => obj.update(delta, elapsed));

    // Pulse LCD backlighting
    if (this.inverterLcdMesh) {
      const mat = this.inverterLcdMesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + Math.sin(elapsed * 3) * 0.15;
    }
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
