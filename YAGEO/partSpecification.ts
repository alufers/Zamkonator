import * as kicadObjects from "./kicadObjects";
import { parseSI } from "./util";
export enum PartType {
  Resistor = "resistor",
  Capacitor = "capacitor",
  CapacitorElectrolytic = "capacitor_electrolytic",
}

export interface PartSpecification {
  originalSymbols?: Array<kicadObjects.KicadSymbol>;
  type?: PartType;
  value?: number;
  /**
   * The required tolerance in percent
   */
  tolerance?: number;

  voltage?: number;
  package?: string;
  power?: number;
}

export function symbolToPartSpecification(
  symbol: kicadObjects.KicadSymbol
): PartSpecification {
  const spec: PartSpecification = {};
  spec.originalSymbols = [symbol];
  const libId = symbol.getLibId();
  if (libId === "Device:R") {
    spec.type = PartType.Resistor;
  } else if (libId === "Device:C") {
    spec.type = PartType.Capacitor;
  } else if (libId === "Device:C_Polarized") {
    spec.type = PartType.CapacitorElectrolytic;
  }
  const segments = symbol.getProperties()["Value"].split(" ");
  for (let seg of segments) {
    if (seg.endsWith("%")) {
      spec.tolerance = parseFloat(seg.slice(0, -1));
    } else if (seg.endsWith("V")) {
      spec.voltage = parseSI(seg, "V");
    } else if (seg.endsWith("W")) {
      spec.power = parseSI(seg, "W");
    } else {
      spec.value = parseSI(seg, spec.type === PartType.Resistor ? "R" : "F");
    }
  }
  return spec;
}

export function combineSamePartSpecifications(
  specs: Array<PartSpecification>
): Array<PartSpecification> {
  const result: Array<PartSpecification> = [];
  const sameKeys = [
    "type",
    "value",
    "tolerance",
    "voltage",
    "package",
    "power",
  ];
  for (let spec of specs) {
    const existing = result.find((s) => {
      for (let key of sameKeys) {
        if (s[key] !== spec[key]) {
          return false;
        }
      }
      return true;
    });
    if (existing) {
      existing.originalSymbols.push(...spec.originalSymbols);
    } else {
      result.push(spec);
    }
  }
  return result;
}
