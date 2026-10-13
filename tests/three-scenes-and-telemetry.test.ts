import { describe, it, expect } from "vitest";
import { SolarInverterScene } from "@/components/three/scenes/SolarInverterScene";
import { CCTVCameraScene } from "@/components/three/scenes/CCTVCameraScene";
import { ElectricalBoardScene } from "@/components/three/scenes/ElectricalBoardScene";
import { ACDiagnosticScene } from "@/components/three/scenes/ACDiagnosticScene";
import { CityDispatchScene } from "@/components/three/scenes/CityDispatchScene";

describe("ServiceSaathi 3D Diagnostic Twins & Telemetry Suite", () => {
  it("SolarInverterScene initializes with 4 equipment hotspots and handles cleaning and isolation", () => {
    const solar = new SolarInverterScene();
    expect(solar.group).toBeDefined();
    expect(solar.clickables.length).toBeGreaterThanOrEqual(4);

    // Initial telemetry check
    expect(solar.telemetry.isCleaned).toBe(false);
    expect(solar.telemetry.panelEfficiency).toBe(76);
    expect(solar.telemetry.isIsolatorConnected).toBe(true);

    // Clean panels action
    const cleanResult = solar.cleanPanels();
    expect(cleanResult.efficiency).toBe(98);

    // Toggle isolator
    const connected = solar.toggleIsolator();
    expect(connected).toBe(false);
    expect(solar.telemetry.isIsolatorConnected).toBe(false);

    solar.dispose();
  });

  it("CCTVCameraScene handles PTZ pan/tilt bounds and IR night vision toggle", () => {
    const cctv = new CCTVCameraScene();
    expect(cctv.group).toBeDefined();

    const initialPan = cctv.telemetry.panAngle;
    cctv.panBy(30);
    expect(cctv.telemetry.panAngle).toBe(initialPan + 30);

    const initialTilt = cctv.telemetry.tiltAngle;
    cctv.tiltBy(10);
    expect(cctv.telemetry.tiltAngle).toBe(initialTilt + 10);

    // Clamps tilt to safe range
    cctv.tiltBy(200);
    expect(cctv.telemetry.tiltAngle).toBeLessThanOrEqual(25);

    // Toggle IR mode
    const nightMode = cctv.toggleIrNightMode();
    expect(nightMode).toBe(true);
    expect(cctv.telemetry.irNightMode).toBe(true);

    cctv.dispose();
  });

  it("ElectricalBoardScene calculates dynamic load and simulates 26A overload trip", () => {
    const elec = new ElectricalBoardScene();
    expect(elec.group).toBeDefined();

    const load1 = elec.getCurrentLoad();
    expect(load1.totalAmps).toBeGreaterThan(0);
    expect(load1.totalWatts).toBeGreaterThan(0);

    // Toggle circuit off reduces load
    elec.toggleMcb(1);
    const load2 = elec.getCurrentLoad();
    expect(load2.activeCircuits).toBe(load1.activeCircuits - 1);
    expect(load2.totalAmps).toBeLessThan(load1.totalAmps);

    // Trigger fault simulation
    const fault = elec.triggerFaultSimulation();
    expect(fault.mcbId).toBe(3);
    expect(fault.message).toContain("CRITICAL OVERLOAD TRIP");

    elec.dispose();
  });

  it("ACDiagnosticScene clamps explode progress and toggles FLIR thermal heatmap mode", () => {
    const ac = new ACDiagnosticScene();
    expect(ac.group).toBeDefined();

    ac.setExplode(0.5);
    expect(ac.getExplodeProgress()).toBe(0.5);

    // Clamps to 1
    ac.setExplode(2.5);
    expect(ac.getExplodeProgress()).toBe(1.0);

    // Clamps to 0
    ac.setExplode(-0.5);
    expect(ac.getExplodeProgress()).toBe(0);

    // Thermal mode
    expect(ac.getThermalMode()).toBe(false);
    const thermalActive = ac.toggleThermalMode();
    expect(thermalActive).toBe(true);
    expect(ac.getThermalMode()).toBe(true);

    ac.dispose();
  });

  it("CityDispatchScene manages Monsoon Rain weather and street lighting", () => {
    const city = new CityDispatchScene();
    expect(city.group).toBeDefined();

    expect(city.getMonsoonRain()).toBe(false);
    const rainActive = city.toggleMonsoonRain();
    expect(rainActive).toBe(true);
    expect(city.getMonsoonRain()).toBe(true);

    city.setTimeOfDay("night");
    city.setTimeOfDay("sunset");
    city.setTimeOfDay("day");

    city.dispose();
  });
});
