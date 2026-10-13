"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Snowflake,
  Zap,
  Droplets,
  MapPin,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Sun,
  Sunset,
  Moon,
  Home,
  X,
  Flame,
  CloudRain,
  Camera,
  SunMedium,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  ExperienceSceneMode,
  TimeOfDayMode,
  SelectedEntityData,
} from "../Experience3D";
import { CityDispatchTelemetry } from "../scenes/CityDispatchScene";
import { EquipmentHotspot } from "../scenes/ACDiagnosticScene";
import { SolarTelemetryData } from "../scenes/SolarInverterScene";
import { CCTVTelemetryData } from "../scenes/CCTVCameraScene";
import { soundFx } from "../audio/soundFx";

interface HUDOverlayProps {
  sceneMode: ExperienceSceneMode;
  onChangeSceneMode: (mode: ExperienceSceneMode) => void;
  timeOfDay: TimeOfDayMode;
  onChangeTimeOfDay: (time: TimeOfDayMode) => void;
  explodeProgress: number;
  onChangeExplodeProgress: (progress: number) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedEntity: SelectedEntityData | null;
  onCloseInspector: () => void;
  onTriggerFaultSimulation: () => void;
  onOpenBookingModal: (prefill: {
    category: string;
    title: string;
    estimatedCost: number;
    faultDetails: string;
  }) => void;

  // New Enhancements
  isThermalMode?: boolean;
  onToggleThermalMode?: () => void;
  isMonsoonRain?: boolean;
  onToggleMonsoonRain?: () => void;
  onCleanPanels?: () => void;
  onCctvPan?: (delta: number) => void;
  onCctvTilt?: (delta: number) => void;
  electricalLoad?: { totalAmps: number; totalWatts: number; activeCircuits: number };
  solarTelemetry?: SolarTelemetryData;
  cctvTelemetry?: CCTVTelemetryData;
}

export function HUDOverlay({
  sceneMode,
  onChangeSceneMode,
  timeOfDay,
  onChangeTimeOfDay,
  explodeProgress,
  onChangeExplodeProgress,
  autoRotate,
  onToggleAutoRotate,
  selectedEntity,
  onCloseInspector,
  onTriggerFaultSimulation,
  onOpenBookingModal,
  isThermalMode = false,
  onToggleThermalMode,
  isMonsoonRain = false,
  onToggleMonsoonRain,
  onCleanPanels,
  onCctvPan,
  onCctvTilt,
  electricalLoad = { totalAmps: 18.2, totalWatts: 4186, activeCircuits: 4 },
  solarTelemetry,
  cctvTelemetry,
}: HUDOverlayProps) {
  const [soundOn, setSoundOn] = useState(soundFx.isEnabled());

  const handleToggleSound = () => {
    const next = soundFx.toggleSound();
    setSoundOn(next);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* 1. TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Brand & Home */}
        <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-2xl text-white">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 hover:opacity-80 transition"
            title="Return to Home"
          >
            <div className="h-8 w-8 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-inner">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
                ServiceSaathi
              </span>
              <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider block">
                3D Interactive Studio
              </span>
            </div>
          </Link>
          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition hidden sm:flex items-center gap-1"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Main Site</span>
          </Link>
        </div>

        {/* Mode Selector Tabs (6 Trade Verticals) */}
        <div className="flex items-center p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeSceneMode("city");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              sceneMode === "city"
                ? "bg-teal-600 text-white shadow-md shadow-teal-900/50"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeSceneMode("ac");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              sceneMode === "ac"
                ? "bg-teal-600 text-white shadow-md shadow-teal-900/50"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Snowflake className="h-3.5 w-3.5 text-cyan-400" />
            <span>HVAC / AC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeSceneMode("electrical");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              sceneMode === "electrical"
                ? "bg-amber-600 text-white shadow-md shadow-amber-900/50"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>Electrical</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeSceneMode("plumbing");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              sceneMode === "plumbing"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/50"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Droplets className="h-3.5 w-3.5 text-sky-300" />
            <span>Plumbing</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeSceneMode("solar");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              sceneMode === "solar"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-900/50"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <SunMedium className="h-3.5 w-3.5 text-amber-400" />
            <span>Solar PV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeSceneMode("cctv");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              sceneMode === "cctv"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-emerald-300" />
            <span>CCTV Security</span>
          </button>
        </div>

        {/* Lighting & Utility Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
          {/* Day / Sunset / Night buttons */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeTimeOfDay("day");
            }}
            title="Daylight mode"
            className={`p-1.5 rounded-xl transition ${
              timeOfDay === "day"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sun className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeTimeOfDay("sunset");
            }}
            title="Golden Hour / Sunset"
            className={`p-1.5 rounded-xl transition ${
              timeOfDay === "sunset"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sunset className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeTimeOfDay("night");
            }}
            title="Night Emergency Dispatch"
            className={`p-1.5 rounded-xl transition ${
              timeOfDay === "night"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Moon className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Auto Rotate */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggleAutoRotate();
            }}
            title={autoRotate ? "Pause orbit rotation" : "Enable smooth orbit rotation"}
            className={`p-1.5 rounded-xl transition ${
              autoRotate
                ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Compass className={`h-4 w-4 ${autoRotate ? "animate-spin" : ""}`} />
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundOn ? "Mute interactive audio" : "Enable interactive audio"}
            className={`p-1.5 rounded-xl transition ${
              soundOn
                ? "text-teal-400 hover:bg-slate-800"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE AREA (Left Controls & Right Inspector Drawer) */}
      <div className="flex justify-between items-start my-auto w-full pointer-events-none gap-4">
        {/* Left Interactive Tool Palette */}
        <div className="flex flex-col gap-2.5 pointer-events-auto max-w-[280px]">
          {/* AC DIAGNOSTIC CONTROLS */}
          {sceneMode === "ac" && (
            <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-teal-400">
                  <Sliders className="h-3.5 w-3.5" />
                  Exploded Assembly
                </span>
                <span className="text-slate-400">{Math.round(explodeProgress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={explodeProgress}
                onChange={(e) => {
                  onChangeExplodeProgress(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Assembled</span>
                <span>Exploded</span>
              </div>

              {/* Thermal FLIR Toggle */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playThermal();
                  onToggleThermalMode?.();
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs shadow-md transition ${
                  isThermalMode
                    ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-red-900/50"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                <Flame className={`h-4 w-4 ${isThermalMode ? "animate-pulse" : "text-amber-400"}`} />
                <span>{isThermalMode ? "FLIR Thermal: ACTIVE" : "FLIR Thermal Heatmap"}</span>
              </button>
            </div>
          )}

          {/* CITY DISPATCH CONTROLS */}
          {sceneMode === "city" && (
            <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white space-y-2.5">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                Atmospheric Simulation
              </span>
              <p className="text-xs text-slate-300">
                Simulate monsoonal rainfall on vehicle dispatch routes and technician transit.
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSwitch();
                  onToggleMonsoonRain?.();
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs shadow-md transition ${
                  isMonsoonRain
                    ? "bg-blue-600 text-white shadow-blue-900/50"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                <CloudRain className={`h-4 w-4 ${isMonsoonRain ? "animate-bounce" : "text-sky-400"}`} />
                <span>{isMonsoonRain ? "Monsoon Storm: ON" : "Simulate Monsoon Rain"}</span>
              </button>
            </div>
          )}

          {/* ELECTRICAL BOARD CONTROLS */}
          {sceneMode === "electrical" && (
            <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl text-white space-y-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Live Distribution Panel Load
              </span>
              <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Draw</span>
                  <span className="text-sm font-black text-amber-400">{electricalLoad.totalAmps} A</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Active Power</span>
                  <span className="text-sm font-black text-emerald-400">{electricalLoad.totalWatts} W</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playTrip();
                  onTriggerFaultSimulation();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition"
              >
                <AlertTriangle className="h-4 w-4" />
                Simulate 26A Overload Trip
              </button>
            </div>
          )}

          {/* SOLAR PV CONTROLS */}
          {sceneMode === "solar" && (
            <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/30 shadow-2xl text-white space-y-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Solar Array Telemetry
              </span>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-800/80 p-2 rounded-xl text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block">PV Output</span>
                  <span className="text-xs font-black text-amber-400">
                    {solarTelemetry ? solarTelemetry.solarGenerationKw : 3.4} kW
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Efficiency</span>
                  <span className="text-xs font-black text-emerald-400">
                    {solarTelemetry ? solarTelemetry.panelEfficiency : 76}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Battery</span>
                  <span className="text-xs font-black text-cyan-400">
                    {solarTelemetry ? solarTelemetry.batterySocPercent : 88}%
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playWaterJet();
                  onCleanPanels?.();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition"
              >
                <Droplets className="h-4 w-4 text-cyan-300" />
                Wash & Jet-Clean Panels
              </button>
            </div>
          )}

          {/* CCTV SECURITY CONTROLS */}
          {sceneMode === "cctv" && (
            <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  PTZ Camera Gimbal
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  4K 60FPS
                </span>
              </div>
              {/* D-Pad Controller */}
              <div className="flex flex-col items-center gap-1 my-1">
                <button
                  type="button"
                  onClick={() => onCctvTilt?.(10)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Tilt Up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onCctvPan?.(-15)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    title="Pan Left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="h-6 w-6 rounded-full border-2 border-emerald-500/50 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onCctvPan?.(15)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    title="Pan Right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onCctvTilt?.(-10)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Tilt Down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Interactive Help Hint */}
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl hidden sm:block">
            <span className="text-teal-400 font-bold">💡 Tip:</span> Click on components, pins, or switches to inspect diagnostics and book instant technician dispatch.
          </div>
        </div>

        {/* Right Inspector Drawer (When Entity Selected) */}
        {selectedEntity && (
          <div className="pointer-events-auto w-full sm:w-[360px] bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/90 shadow-2xl text-white p-5 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  {selectedEntity.type === "telemetry" ? "Live Dispatch Telemetry" : "Component Diagnostic"}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1 leading-snug">
                  {selectedEntity.type === "telemetry"
                    ? (selectedEntity.data as CityDispatchTelemetry).title
                    : (selectedEntity.data as EquipmentHotspot).name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onCloseInspector();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content for Telemetry */}
            {selectedEntity.type === "telemetry" && (
              (() => {
                const tel = selectedEntity.data as CityDispatchTelemetry;
                return (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                      <span>{tel.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Assigned Tech</span>
                        <span className="font-bold text-white text-[11px]">{tel.technicianName || "Auto-Assigning"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Est. Arrival</span>
                        <span className="font-bold text-teal-400 text-[11px] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tel.etaMinutes ? `${tel.etaMinutes} minutes` : "In Dispatch"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                        Reported Issue
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {tel.faultSummary}
                      </p>
                    </div>

                    <div className="bg-teal-950/40 p-3 rounded-xl border border-teal-800/50">
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">
                        Recommended Solution
                      </span>
                      <p className="text-slate-200 text-[11px] font-medium">
                        {tel.suggestedAction}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Inspection / Base Rate</span>
                        <span className="text-lg font-black text-white">₹{tel.estimatedPrice}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playSuccess();
                          onOpenBookingModal({
                            category: tel.category,
                            title: tel.title,
                            estimatedCost: tel.estimatedPrice,
                            faultDetails: tel.faultSummary,
                          });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 transition"
                      >
                        <span>Book Service</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Content for Equipment Hotspot */}
            {selectedEntity.type === "hotspot" && (
              (() => {
                const hot = selectedEntity.data as EquipmentHotspot;
                return (
                  <div className="space-y-3 text-xs">
                    {/* Health meter */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Health Index
                        </span>
                        <span
                          className={`text-xs font-black ${
                            hot.healthScore < 50
                              ? "text-red-400"
                              : hot.healthScore < 80
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {hot.healthScore}% - {hot.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            hot.healthScore < 50
                              ? "bg-red-500"
                              : hot.healthScore < 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${hot.healthScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                        Diagnostic Finding
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {hot.faultDetails}
                      </p>
                    </div>

                    <div className="bg-teal-950/40 p-3 rounded-xl border border-teal-800/50">
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">
                        Recommended Procedure
                      </span>
                      <p className="text-slate-200 text-[11px] font-medium">
                        {hot.recommendedService}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Estimated Replacement / Service</span>
                        <span className="text-lg font-black text-white">₹{hot.estimatedCost}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playSuccess();
                          onOpenBookingModal({
                            category: hot.category,
                            title: hot.name,
                            estimatedCost: hot.estimatedCost,
                            faultDetails: hot.faultDetails,
                          });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 transition"
                      >
                        <span>Dispatch Tech</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM TELEMETRY TICKER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white text-xs">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-300">Live Dispatches:</span>
            <span className="font-extrabold text-white">14 Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            <span className="font-bold text-slate-300">Pincodes Covered:</span>
            <span className="font-extrabold text-white">42 Locations</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-bold text-slate-300">Avg Dispatch ETA:</span>
            <span className="font-extrabold text-teal-400">18 Minutes</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px]">
            <span>System Status:</span>
            <span className="text-emerald-400 font-semibold">99.98% Uptime</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">Camera: Orbit / Zoom / Pan</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
            Three.js WebGL
          </span>
        </div>
      </div>
    </div>
  );
}
