// import fetch from "node-fetch";
import { PartSpecification, PartType } from "./partSpecification.js";
import { parseSI } from "./util.js";
import * as fs from "fs/promises";
import { ProductsSearchResponse } from "./lcscSchema.js";

export const lcscCategories = {
  [PartType.Resistor]: 439,
  [PartType.Capacitor]: 313,
  [PartType.CapacitorElectrolytic]: 418,
};

export interface ParamDef {
  name: string;
  id?: string;
}

export interface ParamDefWithValue extends ParamDef {
  parsedValue: number;
}

export interface CategoryParamsResp {
  Manufacturer: ParamDef[];
  Package: ParamDef[];
  paramNameValueMap: { [key: string]: ParamDef[] };
}

export class LCSCClient {
  BASE_URL = "https://wwwapi.lcsc.com";
  EPSILON = 1e-21;

  requestCache: { [key: string]: any } = undefined;

  getCategoryParams(category: number): Promise<CategoryParamsResp> {
    return this.makeRequest("/v1/products/param", {
      brandIdList: [],
      catalogIdList: [category],
      isStock: false,
      isEnvironment: false,
      isHot: false,
      isDiscount: false,
      encapValueList: [],
      paramNameValueMap: {},
    });
  }

  getNormalizedCategoryParams(
    category: number
  ): Promise<{ [key: string]: ParamDef[] }> {
    return this.getCategoryParams(category).then((resp) => {
      return {
        ...resp.paramNameValueMap,
        Manufacturer: resp.Manufacturer,
        Package: resp.Package,
      } as any;
    });
  }

  async getCategoryParamsWithValues(
    category: number
  ): Promise<{ [key: string]: ParamDefWithValue[] }> {
    const params = await this.getNormalizedCategoryParams(category);
    function parseAndAddValue(
      key: string,
      suffix: string,
      removeChars: string = ""
    ) {
      if (params[key]) {
        params[key] = params[key].map((p) => ({
          ...p,
          parsedValue: parseSI(p.name.replace(removeChars, ""), suffix),
        }));
      }
    }

    parseAndAddValue("Resistance", "Ω");
    parseAndAddValue("Tolerance", "%", "±");
    parseAndAddValue("Power(Watts)", "W");
    parseAndAddValue("Capacitance", "F");
    parseAndAddValue("Voltage Rated", "V");
    parseAndAddValue("Rated Voltage", "V");
    return params as any;
  }

  async buildFiltersMapForPartSpecification(spec: PartSpecification) {
    const filtersMap: { [key: string]: string[] } = {};
    const params = await this.getCategoryParamsWithValues(
      lcscCategories[spec.type]
    );
    const findClosestParam = (paramKey: string, value: number) => {
      let f: string[] = [];
      for (let param of params[paramKey]) {
        if (param.parsedValue == null || isNaN(param.parsedValue)) {
          continue;
        }
        const diff = Math.abs(param.parsedValue - value);
        if (diff < this.EPSILON) {
          f.push(param.name);
        }
      }
      filtersMap[paramKey] = f;
    };

    if (spec.tolerance) {
      findClosestParam("Tolerance", spec.tolerance);
    }
    if (spec.type === PartType.Resistor) {
      if (spec.value) {
        findClosestParam("Resistance", spec.value);
      }

      if (spec.power) {
        findClosestParam("Power(Watts)", spec.power);
      }
    }
    if (
      spec.type === PartType.Capacitor ||
      spec.type === PartType.CapacitorElectrolytic
    ) {
      if (spec.value) {
        findClosestParam("Capacitance", spec.value);
      }
    }
    if (spec.type === PartType.Capacitor) {
      if (spec.voltage) {
        findClosestParam("Voltage Rated", spec.voltage);
      }
    }
    if (spec.type === PartType.CapacitorElectrolytic) {
      if (spec.voltage) {
        findClosestParam("Rated Voltage", spec.voltage);
      }
    }

    return filtersMap;
  }

  async searchParts(
    category: number,
    filtersMap: any,
    packages: string[] = []
  ): Promise<ProductsSearchResponse> {
    return this.makeRequest<ProductsSearchResponse>("/v1/products/list", {
      currentPage: 1,
      pageSize: 25,
      catalogIdList: [category],
      paramNameValueMap: filtersMap,
      brandIdList: [],
      isStock: true,
      isEnvironment: false,
      isHot: false,
      isDiscount: false,
      encapValueList: packages,
      sortField: "price",
      sortType: "asc",
    });
  }

  private async makeRequest<T>(path: string, data: any): Promise<T> {
    if (!this.requestCache) {
      try {
        const c = await fs.readFile("requestCache.json", "utf-8");
        this.requestCache = JSON.parse(c);
      } catch (e) {
        this.requestCache = {};
      }
    }

    const url = this.BASE_URL + path;
    const cacheKey = JSON.stringify(data) + url;
    if (this.requestCache[cacheKey]) {
      return this.requestCache[cacheKey];
    }
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        "LCSC request failed: " +
          response.statusText +
          " " +
          response.status +
          "\n" +
          (await response.text())
      );
    }
    let j = (await response.json()) as T;
    this.requestCache[cacheKey] = j;
    await fs.writeFile("requestCache.json", JSON.stringify(this.requestCache));
    return j;
  }
}
