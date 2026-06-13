import type {
  MotorControllerType,
  MotorPoleCount,
  SensorType,
} from "@/lib/types";

export const MOTOR_CONTROLLER_TYPES: MotorControllerType[] = [
  "BLDC Indoor",
  "BLDC Outdoor",
  "PSC Motor",
  "Universal Motor",
  "Direct Drive",
  "Stepper Motor",
  "PMSM",
  "Other",
];

export const MOTOR_POLE_COUNTS: MotorPoleCount[] = [
  2, 4, 6, 8, 10, 12, 14, 16, "Other",
];

export const SENSOR_TYPES: SensorType[] = [
  "Hall Sensor (3-wire)",
  "Sensorless (Back-EMF)",
  "Encoder (Optical)",
  "Encoder (Magnetic)",
  "Resolver",
  "Other",
];

export function isValidHsnCode(value: string): boolean {
  return /^\d{8}$/.test(value.trim());
}

export function normalizeHsnCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatMotorPoles(poles: MotorPoleCount): string {
  return poles === "Other" ? "Other" : String(poles);
}

export function formatProductSpecs(
  voltage: number,
  wattage: number,
  poles: MotorPoleCount
): string {
  return `${voltage} V · ${wattage} W · ${formatMotorPoles(poles)} poles`;
}
