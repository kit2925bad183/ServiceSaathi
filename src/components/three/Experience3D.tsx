"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CityDispatchScene, CityDispatchTelemetry } from "./scenes/CityDispatchScene";
import { ACDiagnosticScene, EquipmentHotspot } from "./scenes/ACDiagnosticScene";
import { ElectricalBoardScene } from "./scenes/ElectricalBoardScene";
import { PumpManifoldScene } from "./scenes/PumpManifoldScene";
import { SolarInverterScene, SolarTelemetryData } from "./scenes/SolarInverterScene";
import { CCTVCameraScene, CCTVTelemetryData } from "./scenes/CCTVCameraScene";
import { soundFx } from "./audio/soundFx";

export type ExperienceSceneMode = "city" | "ac" | "electrical" | "plumbing" | "solar" | "cctv";
export type TimeOfDayMode = "day" | "sunset" | "night";

export interface SelectedEntityData {
  type: "telemetry" | "hotspot";
  data: CityDispatchTelemetry | EquipmentHotspot;
}

interface Experience3DProps {
  sceneMode: ExperienceSceneMode;
  timeOfDay: TimeOfDayMode;
  explodeProgress: number; // 0 to 1 for AC
  autoRotate: boolean;
  onSelectEntity: (entity: SelectedEntityData | null) => void;
  onSimulateFaultTriggered?: (info: { mcbId: number; message: string }) => void;
  triggerFaultSignal?: number;

  // Enhancements
  isThermalMode?: boolean;
  isMonsoonRain?: boolean;
  cleanPanelsSignal?: number;
  cctvPanDelta?: number;
  cctvTiltDelta?: number;
  onElectricalLoadChange?: (load: { totalAmps: number; totalWatts: number; activeCircuits: number }) => void;
  onSolarTelemetryChange?: (data: SolarTelemetryData) => void;
  onCctvTelemetryChange?: (data: CCTVTelemetryData) => void;
}

export function Experience3D({
  sceneMode,
  timeOfDay,
  explodeProgress,
  autoRotate,
  onSelectEntity,
  onSimulateFaultTriggered,
  triggerFaultSignal,
  isThermalMode = false,
  isMonsoonRain = false,
  cleanPanelsSignal,
  cctvPanDelta = 0,
  cctvTiltDelta = 0,
  onElectricalLoadChange,
  onSolarTelemetryChange,
  onCctvTelemetryChange,
}: Experience3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Scene instances kept in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Lighting refs
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Active scene objects
  const citySceneRef = useRef<CityDispatchScene | null>(null);
  const acSceneRef = useRef<ACDiagnosticScene | null>(null);
  const elecSceneRef = useRef<ElectricalBoardScene | null>(null);
  const pumpSceneRef = useRef<PumpManifoldScene | null>(null);
  const solarSceneRef = useRef<SolarInverterScene | null>(null);
  const cctvSceneRef = useRef<CCTVCameraScene | null>(null);

  // Target camera positions for smooth transition
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(14, 16, 20));
  const controlsTargetLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Mouse / Raycaster
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Background stars for night mode
  const starParticlesRef = useRef<THREE.Points | null>(null);

  // Initialize WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Sleek slate

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    camera.position.set(14, 16, 20);
    cameraRef.current = camera;

    // 3. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setWebGlSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't clip below ground
    controls.minDistance = 2.5;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Night Star Particles
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 1] = 15 + Math.random() * 45;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);
    starParticlesRef.current = starParticles;

    // 6. Build All Specialized Scenes
    const city = new CityDispatchScene();
    citySceneRef.current = city;

    const ac = new ACDiagnosticScene();
    acSceneRef.current = ac;

    const elec = new ElectricalBoardScene();
    elecSceneRef.current = elec;

    const pump = new PumpManifoldScene();
    pumpSceneRef.current = pump;

    const solar = new SolarInverterScene();
    solarSceneRef.current = solar;

    const cctv = new CCTVCameraScene();
    cctvSceneRef.current = cctv;

    // 7. Click & Pointer Handling
    const handlePointerDown = (event: MouseEvent) => {
      if (event.button !== 0) return; // Left click only
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      if (sceneMode === "city" && citySceneRef.current) {
        const meshes = citySceneRef.current.clickables.map((c) => c.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = citySceneRef.current.clickables.find(
            (c) => c.mesh === hit || c.mesh.children.includes(hit) || hit.parent === c.mesh
          );
          if (found) {
            soundFx.playScan();
            onSelectEntity({ type: "telemetry", data: found.telemetry });
          }
        }
      } else if (sceneMode === "ac" && acSceneRef.current) {
        const meshes = acSceneRef.current.clickables.map((c) => c.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = acSceneRef.current.clickables.find(
            (c) => c.mesh === hit || c.mesh.children.includes(hit) || hit.parent === c.mesh
          );
          if (found) {
            soundFx.playScan();
            onSelectEntity({ type: "hotspot", data: found.hotspot });
          }
        }
      } else if (sceneMode === "electrical" && elecSceneRef.current) {
        const meshes = elecSceneRef.current.clickables.map((c) => c.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = elecSceneRef.current.clickables.find(
            (c) => c.mesh === hit || c.mesh.children.includes(hit) || hit.parent === c.mesh
          );
          if (found) {
            if (found.mcbId !== undefined) {
              const newState = elecSceneRef.current.toggleMcb(found.mcbId);
              soundFx.playSwitch(newState);
              if (onElectricalLoadChange) {
                onElectricalLoadChange(elecSceneRef.current.getCurrentLoad());
              }
            }
            if (found.hotspot) {
              soundFx.playScan();
              onSelectEntity({ type: "hotspot", data: found.hotspot });
            }
          }
        }
      } else if (sceneMode === "plumbing" && pumpSceneRef.current) {
        const meshes = pumpSceneRef.current.clickables.map((c) => c.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = pumpSceneRef.current.clickables.find(
            (c) => c.mesh === hit || c.mesh.children.includes(hit) || hit.parent === c.mesh
          );
          if (found) {
            if (found.valveId) {
              const isOpen = pumpSceneRef.current.toggleValve();
              soundFx.playSwitch(isOpen);
            }
            if (found.hotspot) {
              soundFx.playScan();
              onSelectEntity({ type: "hotspot", data: found.hotspot });
            }
          }
        }
      } else if (sceneMode === "solar" && solarSceneRef.current) {
        const meshes = solarSceneRef.current.clickables.map((c) => c.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = solarSceneRef.current.clickables.find(
            (c) => c.mesh === hit || c.mesh.children.includes(hit) || hit.parent === c.mesh
          );
          if (found) {
            if (found.actionId === "clean-panels") {
              solarSceneRef.current.cleanPanels();
              soundFx.playWaterJet();
            } else if (found.actionId === "toggle-isolator") {
              const connected = solarSceneRef.current.toggleIsolator();
              soundFx.playSwitch(connected);
            }
            if (found.hotspot) {
              soundFx.playScan();
              onSelectEntity({ type: "hotspot", data: found.hotspot });
            }
            if (onSolarTelemetryChange) {
              onSolarTelemetryChange(solarSceneRef.current.telemetry);
            }
          }
        }
      } else if (sceneMode === "cctv" && cctvSceneRef.current) {
        const meshes = cctvSceneRef.current.clickables.map((c) => c.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = cctvSceneRef.current.clickables.find(
            (c) => c.mesh === hit || c.mesh.children.includes(hit) || hit.parent === c.mesh
          );
          if (found) {
            soundFx.playScan();
            if (found.hotspot) {
              onSelectEntity({ type: "hotspot", data: found.hotspot });
            }
            if (onCctvTelemetryChange) {
              onCctvTelemetryChange(cctvSceneRef.current.telemetry);
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener("click", handlePointerDown);

    // 8. Animation Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation towards target
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(cameraTargetPos.current, 0.05);
        controlsRef.current.target.lerp(controlsTargetLook.current, 0.05);
        controlsRef.current.update();
      }

      // Update current scene
      if (citySceneRef.current && sceneMode === "city") {
        citySceneRef.current.update(delta, elapsed);
      } else if (acSceneRef.current && sceneMode === "ac") {
        acSceneRef.current.update(delta, elapsed);
      } else if (elecSceneRef.current && sceneMode === "electrical") {
        elecSceneRef.current.update(delta, elapsed);
      } else if (pumpSceneRef.current && sceneMode === "plumbing") {
        pumpSceneRef.current.update(delta, elapsed);
      } else if (solarSceneRef.current && sceneMode === "solar") {
        solarSceneRef.current.update(delta, elapsed);
      } else if (cctvSceneRef.current && sceneMode === "cctv") {
        cctvSceneRef.current.update(delta, elapsed);
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handlePointerDown);

      city.dispose();
      ac.dispose();
      elec.dispose();
      pump.dispose();
      solar.dispose();
      cctv.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Active Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove all sub-scenes first
    if (citySceneRef.current) scene.remove(citySceneRef.current.group);
    if (acSceneRef.current) scene.remove(acSceneRef.current.group);
    if (elecSceneRef.current) scene.remove(elecSceneRef.current.group);
    if (pumpSceneRef.current) scene.remove(pumpSceneRef.current.group);
    if (solarSceneRef.current) scene.remove(solarSceneRef.current.group);
    if (cctvSceneRef.current) scene.remove(cctvSceneRef.current.group);

    // Reset selection
    onSelectEntity(null);

    // Mount selected scene and adjust camera framing
    if (sceneMode === "city" && citySceneRef.current) {
      scene.add(citySceneRef.current.group);
      cameraTargetPos.current.set(16, 17, 21);
      controlsTargetLook.current.set(0, 0, 0);
    } else if (sceneMode === "ac" && acSceneRef.current) {
      scene.add(acSceneRef.current.group);
      cameraTargetPos.current.set(4.5, 3.2, 5.5);
      controlsTargetLook.current.set(0, 0.3, 0);
    } else if (sceneMode === "electrical" && elecSceneRef.current) {
      scene.add(elecSceneRef.current.group);
      cameraTargetPos.current.set(0, 0.4, 5.2);
      controlsTargetLook.current.set(0, 0.1, 0);
      if (onElectricalLoadChange) {
        onElectricalLoadChange(elecSceneRef.current.getCurrentLoad());
      }
    } else if (sceneMode === "plumbing" && pumpSceneRef.current) {
      scene.add(pumpSceneRef.current.group);
      cameraTargetPos.current.set(3.8, 2.5, 4.8);
      controlsTargetLook.current.set(0, 0.2, 0);
    } else if (sceneMode === "solar" && solarSceneRef.current) {
      scene.add(solarSceneRef.current.group);
      cameraTargetPos.current.set(5.2, 3.8, 5.8);
      controlsTargetLook.current.set(0, 0, -0.4);
      if (onSolarTelemetryChange) {
        onSolarTelemetryChange(solarSceneRef.current.telemetry);
      }
    } else if (sceneMode === "cctv" && cctvSceneRef.current) {
      scene.add(cctvSceneRef.current.group);
      cameraTargetPos.current.set(2.8, 1.8, 3.2);
      controlsTargetLook.current.set(0, 0.4, 0.2);
      if (onCctvTelemetryChange) {
        onCctvTelemetryChange(cctvSceneRef.current.telemetry);
      }
    }
  }, [sceneMode, onSelectEntity, onElectricalLoadChange, onSolarTelemetryChange, onCctvTelemetryChange]);

  // Sync Explode Slider for AC
  useEffect(() => {
    if (sceneMode === "ac" && acSceneRef.current) {
      acSceneRef.current.setExplode(explodeProgress);
    }
  }, [explodeProgress, sceneMode]);

  // Sync Thermal FLIR Vision for AC
  useEffect(() => {
    if (sceneMode === "ac" && acSceneRef.current) {
      acSceneRef.current.setThermalMode(isThermalMode);
    }
  }, [isThermalMode, sceneMode]);

  // Sync Monsoon Rain Weather for City
  useEffect(() => {
    if (sceneMode === "city" && citySceneRef.current) {
      citySceneRef.current.setMonsoonRain(isMonsoonRain);
    }
  }, [isMonsoonRain, sceneMode]);

  // Clean Solar Panels Trigger
  useEffect(() => {
    if (!cleanPanelsSignal) return;
    if (sceneMode === "solar" && solarSceneRef.current) {
      solarSceneRef.current.cleanPanels();
      soundFx.playWaterJet();
      if (onSolarTelemetryChange) {
        onSolarTelemetryChange(solarSceneRef.current.telemetry);
      }
    }
  }, [cleanPanelsSignal, sceneMode, onSolarTelemetryChange]);

  // CCTV Pan / Tilt Control
  useEffect(() => {
    if (cctvPanDelta !== 0 && cctvSceneRef.current) {
      cctvSceneRef.current.panBy(cctvPanDelta);
      soundFx.playServo();
      if (onCctvTelemetryChange) {
        onCctvTelemetryChange(cctvSceneRef.current.telemetry);
      }
    }
  }, [cctvPanDelta, onCctvTelemetryChange]);

  useEffect(() => {
    if (cctvTiltDelta !== 0 && cctvSceneRef.current) {
      cctvSceneRef.current.tiltBy(cctvTiltDelta);
      soundFx.playServo();
      if (onCctvTelemetryChange) {
        onCctvTelemetryChange(cctvSceneRef.current.telemetry);
      }
    }
  }, [cctvTiltDelta, onCctvTelemetryChange]);

  // Sync Controls AutoRotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  // Sync Lighting with TimeOfDay
  useEffect(() => {
    const scene = sceneRef.current;
    const amb = ambientLightRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;
    const stars = starParticlesRef.current;

    if (!scene || !amb || !dir || !hemi) return;

    if (timeOfDay === "day") {
      scene.background = new THREE.Color(0xf1f5f9); // Bright crisp slate
      amb.color.setHex(0xffffff);
      amb.intensity = 0.8;
      dir.color.setHex(0xfff7ed);
      dir.intensity = 1.35;
      dir.position.set(15, 25, 15);
      hemi.intensity = 0.6;
      if (stars) {
        (stars.material as THREE.PointsMaterial).opacity = 0;
      }
    } else if (timeOfDay === "sunset") {
      scene.background = new THREE.Color(0x312e81); // Warm indigo sky
      amb.color.setHex(0xfde047);
      amb.intensity = 0.6;
      dir.color.setHex(0xf97316); // Amber orange sunset light
      dir.intensity = 1.6;
      dir.position.set(25, 12, 10);
      hemi.intensity = 0.4;
      if (stars) {
        (stars.material as THREE.PointsMaterial).opacity = 0.3;
      }
    } else {
      // Night Emergency Mode
      scene.background = new THREE.Color(0x020617); // Deep obsidian
      amb.color.setHex(0x38bdf8);
      amb.intensity = 0.25;
      dir.color.setHex(0x60a5fa);
      dir.intensity = 0.35;
      dir.position.set(10, 15, 10);
      hemi.intensity = 0.2;
      if (stars) {
        (stars.material as THREE.PointsMaterial).opacity = 0.95;
      }
    }

    if (citySceneRef.current) {
      citySceneRef.current.setTimeOfDay(timeOfDay);
    }
  }, [timeOfDay]);

  // Trigger Electrical Overload Fault Simulation
  useEffect(() => {
    if (!triggerFaultSignal) return;
    if (sceneMode === "electrical" && elecSceneRef.current) {
      const result = elecSceneRef.current.triggerFaultSimulation();
      soundFx.playTrip();
      onSimulateFaultTriggered?.(result);
    }
  }, [triggerFaultSignal, sceneMode, onSimulateFaultTriggered]);

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden select-none">
      {webGlSupported ? (
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-white text-center">
          <p className="text-lg font-bold">WebGL is not supported or enabled on your device.</p>
          <p className="mt-2 text-sm text-slate-400">
            Please use a modern browser with hardware acceleration enabled.
          </p>
        </div>
      )}
    </div>
  );
}
