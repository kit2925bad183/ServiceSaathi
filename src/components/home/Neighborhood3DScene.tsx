"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Wrench, Zap, Droplets, Sparkles, AlertCircle } from "lucide-react";

export type ServiceCategoryKey = "ac" | "electrical" | "plumbing" | "cleaning";

interface NeighborhoodSceneProps {
  selectedCategory: ServiceCategoryKey;
  onSelectCategory?: (category: ServiceCategoryKey) => void;
}

export function Neighborhood3DScene({
  selectedCategory,
  onSelectCategory,
}: NeighborhoodSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [canvasInView, setCanvasInView] = useState<boolean>(true);

  // References to highlightable meshes
  const categoryTargetsRef = useRef<{
    ac?: THREE.Group;
    electrical?: THREE.Group;
    plumbing?: THREE.Group;
    cleaning?: THREE.Group;
  }>({});

  const activeCategoryRef = useRef<ServiceCategoryKey>(selectedCategory);
  activeCategoryRef.current = selectedCategory;

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Intersection observer to pause rendering when offscreen
    if (!mountRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setCanvasInView(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(mountRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability safely
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

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // soft slate white

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(14, 16, 20);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
    } catch {
      setWebGlSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    setIsLoaded(true);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    dirLight.position.set(15, 25, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    // Accent fill light
    const fillLight = new THREE.PointLight(0x0284c7, 0.8, 30);
    fillLight.position.set(-10, 8, -8);
    scene.add(fillLight);

    // 3. Stylised Ground Platform (Isometric Island)
    const islandGeo = new THREE.CylinderGeometry(13, 13.5, 1.2, 32);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
      metalness: 0.1,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -0.6;
    island.receiveShadow = true;
    scene.add(island);

    // Grass patch overlay
    const grassGeo = new THREE.CylinderGeometry(12.6, 12.6, 0.1, 32);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = 0.05;
    grass.receiveShadow = true;
    scene.add(grass);

    // Roads (Intersecting Cross roads)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const roadHGeo = new THREE.BoxGeometry(22, 0.05, 2.4);
    const roadH = new THREE.Mesh(roadHGeo, roadMat);
    roadH.position.set(0, 0.1, 0);
    roadH.receiveShadow = true;
    scene.add(roadH);

    const roadVGeo = new THREE.BoxGeometry(2.4, 0.05, 22);
    const roadV = new THREE.Mesh(roadVGeo, roadMat);
    roadV.position.set(0, 0.1, 0);
    roadV.receiveShadow = true;
    scene.add(roadV);

    // Road markings
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = -8; i <= 8; i += 3) {
      if (Math.abs(i) < 2) continue;
      const dashH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.2), dashMat);
      dashH.position.set(i, 0.12, 0);
      scene.add(dashH);

      const dashV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.2), dashMat);
      dashV.position.set(0, 0.12, i);
      scene.add(dashV);
    }

    // Helper: Create a building
    const createBuilding = (
      w: number,
      h: number,
      d: number,
      x: number,
      z: number,
      baseColor: number,
      roofColor: number,
      name: string
    ): THREE.Group => {
      const group = new THREE.Group();
      group.name = name;

      // Body
      const bodyGeo = new THREE.BoxGeometry(w, h, d);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.4,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = h / 2 + 0.1;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Roof
      const roofGeo = new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3);
      const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.3,
        metalness: 0.2,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = h + 0.25;
      roof.castShadow = true;
      group.add(roof);

      // Windows
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3,
        roughness: 0.2,
      });
      const winGeo = new THREE.BoxGeometry(0.45, 0.55, 0.05);

      const rows = Math.max(1, Math.floor(h / 1.2));
      for (let r = 0; r < rows; r++) {
        const yPos = 0.8 + r * 1.1;
        // Front windows
        const winF1 = new THREE.Mesh(winGeo, winMat);
        winF1.position.set(-w / 4, yPos, d / 2 + 0.03);
        group.add(winF1);

        const winF2 = new THREE.Mesh(winGeo, winMat);
        winF2.position.set(w / 4, yPos, d / 2 + 0.03);
        group.add(winF2);
      }

      // Door
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const doorGeo = new THREE.BoxGeometry(0.7, 1.0, 0.06);
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 0.6, d / 2 + 0.03);
      group.add(door);

      group.position.set(x, 0, z);
      return group;
    };

    // Helper: Create Service Beacon / Marker Pin
    const createServiceMarker = (colorHex: number, label: string) => {
      const marker = new THREE.Group();
      marker.name = `marker-${label}`;

      // Floating diamond / sphere
      const sphereGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 0;
      marker.add(sphere);

      // Pulse ring underneath
      const ringGeo = new THREE.RingGeometry(0.55, 0.75, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.3;
      marker.add(ring);

      return marker;
    };

    // 1. AC & HVAC Service Location (Residential Apartments - Top Left)
    const homeApartment = createBuilding(3.4, 4.2, 3.0, -5.5, -5.0, 0xffffff, 0x0d9488, "b-ac");
    const markerAC = createServiceMarker(0x0d9488, "ac");
    markerAC.position.set(0, 5.4, 0);
    homeApartment.add(markerAC);
    scene.add(homeApartment);
    categoryTargetsRef.current.ac = homeApartment;

    // AC outdoor compressor unit on apartment wall
    const acCompressorGeo = new THREE.BoxGeometry(0.8, 0.6, 0.4);
    const acCompressorMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const acCompressor = new THREE.Mesh(acCompressorGeo, acCompressorMat);
    acCompressor.position.set(1.9, 2.8, 0);
    homeApartment.add(acCompressor);

    // 2. Electrical Services Location (Commercial Office Tower - Top Right)
    const officeTower = createBuilding(3.2, 6.0, 3.2, 5.5, -5.0, 0xf1f5f9, 0xeab308, "b-electrical");
    const markerElec = createServiceMarker(0xeab308, "electrical");
    markerElec.position.set(0, 7.2, 0);
    officeTower.add(markerElec);
    scene.add(officeTower);
    categoryTargetsRef.current.electrical = officeTower;

    // Transformer / distribution pillar beside office
    const transGeo = new THREE.BoxGeometry(0.7, 1.2, 0.7);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const trans = new THREE.Mesh(transGeo, transMat);
    trans.position.set(2.4, 0.7, 1.5);
    officeTower.add(trans);

    // 3. Plumbing Services Location (Villa with water tank - Bottom Left)
    const villa = createBuilding(3.8, 2.8, 3.2, -5.5, 5.0, 0xffffff, 0x0284c7, "b-plumbing");
    const markerPlumb = createServiceMarker(0x0284c7, "plumbing");
    markerPlumb.position.set(0, 4.0, 0);
    villa.add(markerPlumb);
    // Overhead water tank on roof
    const tankGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.8, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(1.1, 3.4, 0);
    villa.add(tank);
    scene.add(villa);
    categoryTargetsRef.current.plumbing = villa;

    // 4. Cleaning Services Location (Service Workshop & Retail Hub - Bottom Right)
    const workshop = createBuilding(4.2, 3.2, 3.4, 5.5, 5.0, 0xf8fafc, 0x10b981, "b-cleaning");
    const markerClean = createServiceMarker(0x10b981, "cleaning");
    markerClean.position.set(0, 4.4, 0);
    workshop.add(markerClean);
    scene.add(workshop);
    categoryTargetsRef.current.cleaning = workshop;

    // Foliage / Decorative Trees
    const treeTrunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const treeFoliageGeo = new THREE.SphereGeometry(0.65, 12, 12);
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 });

    const treePositions = [
      [-2.0, -4.5],
      [-8.5, -1.0],
      [2.2, -7.5],
      [-8.2, 3.0],
      [8.5, 1.5],
      [2.0, 7.5],
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 0.4;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage.position.y = 1.0;
      foliage.castShadow = true;
      tree.add(foliage);

      tree.position.set(tx, 0, tz);
      scene.add(tree);
    });

    // 5. Technician Field Van / Traveling Worker
    const vanGroup = new THREE.Group();
    vanGroup.name = "technician-van";

    // Van body
    const vanBodyGeo = new THREE.BoxGeometry(1.4, 0.7, 0.75);
    const vanBodyMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.3, metalness: 0.2 });
    const vanBody = new THREE.Mesh(vanBodyGeo, vanBodyMat);
    vanBody.position.y = 0.45;
    vanBody.castShadow = true;
    vanGroup.add(vanBody);

    // Van cabin / windshield
    const vanCabGeo = new THREE.BoxGeometry(0.6, 0.45, 0.72);
    const vanCabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const vanCab = new THREE.Mesh(vanCabGeo, vanCabMat);
    vanCab.position.set(0.35, 0.7, 0);
    vanGroup.add(vanCab);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
    const wheelPositions = [
      [0.45, 0.18, 0.4],
      [-0.45, 0.18, 0.4],
      [0.45, 0.18, -0.4],
      [-0.45, 0.18, -0.4],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      vanGroup.add(wheel);
    });

    // Roof rack with service ladder
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
    const ladderBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.05), ladderMat);
    ladderBar1.position.set(0, 0.95, 0.15);
    vanGroup.add(ladderBar1);
    const ladderBar2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.05), ladderMat);
    ladderBar2.position.set(0, 0.95, -0.15);
    vanGroup.add(ladderBar2);

    scene.add(vanGroup);

    // Pointer Interaction (Subtle camera orbit based on cursor)
    let targetRotY = 0;
    let targetRotX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.18;
      targetRotX = y * 0.10;
    };
    container.addEventListener("mousemove", handleMouseMove);

    // Animation variables
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let vanProgress = 0;

    // Closed loop waypoint path for van (along roads)
    const waypoints = [
      new THREE.Vector3(0, 0.15, -7.5),
      new THREE.Vector3(0, 0.15, 0),
      new THREE.Vector3(-7.5, 0.15, 0),
      new THREE.Vector3(0, 0.15, 0),
      new THREE.Vector3(0, 0.15, 7.5),
      new THREE.Vector3(0, 0.15, 0),
      new THREE.Vector3(7.5, 0.15, 0),
      new THREE.Vector3(0, 0.15, 0),
    ];

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // If document hidden or offscreen, skip rendering to save battery
      if (document.hidden || !canvasInView) {
        return;
      }

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Gentle camera responsiveness
      if (!prefersReducedMotion) {
        camera.position.x += ((14 + Math.sin(targetRotY) * 5) - camera.position.x) * 0.05;
        camera.position.y += ((16 + targetRotX * 3) - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      // Animate Van along route
      if (!prefersReducedMotion) {
        vanProgress = (vanProgress + delta * 0.15) % 1.0;
        const totalPoints = waypoints.length;
        const segment = vanProgress * totalPoints;
        const index = Math.floor(segment);
        const subProgress = segment - index;
        const p1 = waypoints[index % totalPoints];
        const p2 = waypoints[(index + 1) % totalPoints];

        vanGroup.position.lerpVectors(p1, p2, subProgress);

        // Orient van towards movement direction
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        if (dir.lengthSq() > 0.001) {
          const targetAngle = Math.atan2(-dir.z, dir.x);
          vanGroup.rotation.y = THREE.MathUtils.lerp(vanGroup.rotation.y, targetAngle, 0.1);
        }
      }

      // Highlight active building based on selected category
      const activeCat = activeCategoryRef.current;
      const targets = categoryTargetsRef.current;

      const keys: ServiceCategoryKey[] = ["ac", "electrical", "plumbing", "cleaning"];
      keys.forEach((k) => {
        const group = targets[k];
        if (!group) return;
        const isSelected = k === activeCat;

        // Subtle bobbing animation on marker
        const marker = group.getObjectByName(`marker-${k}`);
        if (marker) {
          const sphere = marker.children[0];
          const ring = marker.children[1];
          if (sphere) {
            sphere.position.y = Math.sin(elapsedTime * 2.5) * 0.25;
            sphere.scale.setScalar(isSelected ? 1.3 : 1.0);
          }
          if (ring) {
            ring.scale.setScalar(isSelected ? 1.4 + Math.sin(elapsedTime * 3) * 0.15 : 1.0);
          }
        }

        // Slight elevation of selected building
        const targetY = isSelected ? 0.35 : 0;
        group.position.y += (targetY - group.position.y) * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup resources cleanly
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);

      // Traverse and dispose geometries and materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webGlSupported, prefersReducedMotion, canvasInView]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-50 border border-navy-200/90 shadow-lg min-h-[440px] flex items-center justify-center">
      {/* 3D Canvas Container */}
      {webGlSupported ? (
        <div
          ref={mountRef}
          className="w-full h-[440px] touch-none cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D service neighbourhood simulation"
          role="img"
        />
      ) : (
        /* Lightweight Fallback for unsupported devices or WebGL disabled */
        <div className="p-8 text-center max-w-md">
          <div className="mx-auto h-12 w-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-3">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="text-base font-black text-navy-950">
            Local Service Dispatch Map
          </h3>
          <p className="mt-2 text-xs text-navy-600">
            Visual preview of unified technician routing across AC repairs, electrical installations, plumbing, and facility cleaning.
          </p>
        </div>
      )}

      {/* Floating Interactive Category Selector Overlay */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectCategory?.("ac")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
            selectedCategory === "ac"
              ? "bg-teal-700 text-white border-teal-800 ring-2 ring-teal-400"
              : "bg-white/95 backdrop-blur-sm text-navy-800 border-navy-200 hover:bg-navy-50"
          }`}
          aria-pressed={selectedCategory === "ac"}
        >
          <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span>AC & HVAC</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory?.("electrical")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
            selectedCategory === "electrical"
              ? "bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300"
              : "bg-white/95 backdrop-blur-sm text-navy-800 border-navy-200 hover:bg-navy-50"
          }`}
          aria-pressed={selectedCategory === "electrical"}
        >
          <Zap className="h-3 w-3 text-amber-500" />
          <span>Electrical & Wiring</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory?.("plumbing")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
            selectedCategory === "plumbing"
              ? "bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300"
              : "bg-white/95 backdrop-blur-sm text-navy-800 border-navy-200 hover:bg-navy-50"
          }`}
          aria-pressed={selectedCategory === "plumbing"}
        >
          <Droplets className="h-3 w-3 text-sky-500" />
          <span>Plumbing</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory?.("cleaning")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
            selectedCategory === "cleaning"
              ? "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300"
              : "bg-white/95 backdrop-blur-sm text-navy-800 border-navy-200 hover:bg-navy-50"
          }`}
          aria-pressed={selectedCategory === "cleaning"}
        >
          <Sparkles className="h-3 w-3 text-emerald-500" />
          <span>Deep Cleaning</span>
        </button>
      </div>

      {/* Illustrative Simulation Disclaimer Badge */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-navy-200/80 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-navy-600 shadow-sm pointer-events-none">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Illustrative simulation: Live neighbourhood dispatch routing</span>
      </div>
    </div>
  );
}
