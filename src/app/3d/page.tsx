"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  ExperienceSceneMode,
  TimeOfDayMode,
  SelectedEntityData,
} from "@/components/three/Experience3D";
import { SolarTelemetryData } from "@/components/three/scenes/SolarInverterScene";
import { CCTVTelemetryData } from "@/components/three/scenes/CCTVCameraScene";
import { HUDOverlay } from "@/components/three/ui/HUDOverlay";
import { BookingModal3D } from "@/components/three/ui/BookingModal3D";
import { Wrench, AlertTriangle } from "lucide-react";

// Dynamically load the WebGL Three.js canvas on the client side only
const Experience3D = dynamic(
  () =>
    import("@/components/three/Experience3D").then((mod) => mod.Experience3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative mb-5">
          <div className="h-16 w-16 rounded-3xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 animate-pulse">
            <Wrench className="h-8 w-8 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-teal-400 animate-ping" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Loading ServiceSaathi 3D Experience
        </h2>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          Initializing WebGL shaders, procedural geometry, lighting rigs, and simulated technician telemetry...
        </p>
      </div>
    ),
  }
);

function ThreeStudioContent() {
  const searchParams = useSearchParams();
  const initialScene = (searchParams.get("scene") as ExperienceSceneMode) || "city";

  const [sceneMode, setSceneMode] = useState<ExperienceSceneMode>(
    ["city", "ac", "electrical", "plumbing", "solar", "cctv"].includes(initialScene)
      ? initialScene
      : "city"
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayMode>("day");
  const [explodeProgress, setExplodeProgress] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntityData | null>(null);

  // Enhancements State
  const [isThermalMode, setIsThermalMode] = useState<boolean>(false);
  const [isMonsoonRain, setIsMonsoonRain] = useState<boolean>(false);
  const [cleanPanelsSignal, setCleanPanelsSignal] = useState<number>(0);
  const [cctvPanDelta, setCctvPanDelta] = useState<number>(0);
  const [cctvTiltDelta, setCctvTiltDelta] = useState<number>(0);
  const [electricalLoad, setElectricalLoad] = useState({
    totalAmps: 18.2,
    totalWatts: 4186,
    activeCircuits: 4,
  });
  const [solarTelemetry, setSolarTelemetry] = useState<SolarTelemetryData>({
    solarGenerationKw: 3.4,
    batterySocPercent: 88,
    gridExportKw: 2.1,
    panelEfficiency: 76,
    isCleaned: false,
    isIsolatorConnected: true,
  });
  const [cctvTelemetry, setCctvTelemetry] = useState<CCTVTelemetryData>({
    panAngle: 15,
    tiltAngle: -25,
    zoomLevel: 1.0,
    irNightMode: false,
    bitrateKbps: 6144,
    fps: 30,
    motionDetected: false,
  });

  // Electrical breaker trip simulation signal & toast notification
  const [triggerFaultSignal, setTriggerFaultSignal] = useState<number>(0);
  const [faultAlert, setFaultAlert] = useState<string | null>(null);

  // Direct Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{
    category: string;
    title: string;
    estimatedCost: number;
    faultDetails: string;
  } | null>(null);

  useEffect(() => {
    const sceneParam = searchParams.get("scene") as ExperienceSceneMode;
    if (sceneParam && ["city", "ac", "electrical", "plumbing", "solar", "cctv"].includes(sceneParam)) {
      setSceneMode(sceneParam);
    }
  }, [searchParams]);

  const handleTriggerFaultSimulation = () => {
    setTriggerFaultSignal((prev) => prev + 1);
  };

  const handleSimulateFaultResult = (result: { mcbId: number; message: string }) => {
    setFaultAlert(result.message);
    setTimeout(() => {
      setFaultAlert(null);
    }, 6000);
  };

  const handleOpenBookingModal = (prefill: {
    category: string;
    title: string;
    estimatedCost: number;
    faultDetails: string;
  }) => {
    setBookingPrefill(prefill);
    setIsBookingOpen(true);
  };

  const handleCctvPan = (delta: number) => {
    setCctvPanDelta(delta);
    setTimeout(() => setCctvPanDelta(0), 50);
  };

  const handleCctvTilt = (delta: number) => {
    setCctvTiltDelta(delta);
    setTimeout(() => setCctvTiltDelta(0), 50);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Three.js Interactive Canvas Container */}
      <div className="absolute inset-0 z-0">
        <Experience3D
          sceneMode={sceneMode}
          timeOfDay={timeOfDay}
          explodeProgress={explodeProgress}
          autoRotate={autoRotate}
          onSelectEntity={setSelectedEntity}
          triggerFaultSignal={triggerFaultSignal}
          onSimulateFaultTriggered={handleSimulateFaultResult}
          isThermalMode={isThermalMode}
          isMonsoonRain={isMonsoonRain}
          cleanPanelsSignal={cleanPanelsSignal}
          cctvPanDelta={cctvPanDelta}
          cctvTiltDelta={cctvTiltDelta}
          onElectricalLoadChange={setElectricalLoad}
          onSolarTelemetryChange={setSolarTelemetry}
          onCctvTelemetryChange={setCctvTelemetry}
        />
      </div>

      {/* Floating HUD Layer (Top Navigation, Inspector Panel, Lighting Buttons) */}
      <HUDOverlay
        sceneMode={sceneMode}
        onChangeSceneMode={(mode) => {
          setSceneMode(mode);
          setExplodeProgress(0); // Reset explode on scene switch
          setIsThermalMode(false);
        }}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        explodeProgress={explodeProgress}
        onChangeExplodeProgress={setExplodeProgress}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        selectedEntity={selectedEntity}
        onCloseInspector={() => setSelectedEntity(null)}
        onTriggerFaultSimulation={handleTriggerFaultSimulation}
        onOpenBookingModal={handleOpenBookingModal}
        isThermalMode={isThermalMode}
        onToggleThermalMode={() => setIsThermalMode((prev) => !prev)}
        isMonsoonRain={isMonsoonRain}
        onToggleMonsoonRain={() => setIsMonsoonRain((prev) => !prev)}
        onCleanPanels={() => setCleanPanelsSignal((prev) => prev + 1)}
        onCctvPan={handleCctvPan}
        onCctvTilt={handleCctvTilt}
        electricalLoad={electricalLoad}
        solarTelemetry={solarTelemetry}
        cctvTelemetry={cctvTelemetry}
      />

      {/* Overload Alert Banner */}
      {faultAlert && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90%] bg-red-950/90 border border-red-500/80 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-8 w-8 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-red-300 block">SIMULATED FAULT DETECTED</span>
            <span className="text-slate-200">{faultAlert}</span>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal3D
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        prefill={bookingPrefill}
      />
    </main>
  );
}

export default function ThreeExperiencePage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-slate-950 flex items-center justify-center text-teal-400">
          Loading 3D Studio...
        </div>
      }
    >
      <ThreeStudioContent />
    </Suspense>
  );
}
