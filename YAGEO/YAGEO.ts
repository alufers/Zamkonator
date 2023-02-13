import * as fs from "fs/promises";
import * as kicadObjects from "./kicadObjects.js";
import {
  combineSamePartSpecifications,
  PartSpecification,
  symbolToPartSpecification,
} from "./partSpecification.js";
import { parseSI, removeFromObject } from "./util.js";
import * as lcsc from "./lcsc.js";
import * as docopt from "docopt";

// const parse = require("s-expression");

import parse from "s-expression";

const argv = docopt.docopt(
  `Usage: yageo [options] <input-schematic>

Finds resistors, capacitors and electrolytic capacitors in the given KiCad schematic and tries to find suitable parts on LCSC.

Options:
  -p --preffered-package <package>  Comma separated list of packags for parts (e.g. 0603)
  -c --count <count>               How many boards you want to manufacture [default: 1]
`,
  {
    version: "0.0.1",
  }
);

(async () => {
  const inputFile = argv["<input-schematic>"];

  const loader: kicadObjects.KicadLoader = {
    async load(path: string): Promise<kicadObjects.KicadSchematic> {
      console.log("Loading", path);
      const input = await fs.readFile(path, "utf8");

      const parsed = parse(input);
      const obj = kicadObjects.KicadObject.fromSex(parsed);
      if (!(obj instanceof kicadObjects.KicadSchematic)) {
        throw new Error("Not a schematic, but a " + obj.kind);
      }
      return obj;
    },
  };
  const obj = (await loader.load(inputFile)) as kicadObjects.KicadSchematic;
  const allSheets = await obj.loadSubsheets(loader, inputFile);
  allSheets.unshift(obj);

  const allSymbols = allSheets
    .flatMap((sheet) => sheet.childrenOfKind(kicadObjects.KicadSymbol))
    .filter((symbol) => !symbol.getProperties()["Reference"].startsWith("#"));
  console.log("Found", allSymbols.length, "elements (excluding power symbols)");
  console.log("Statistics:");

  const stats = Object.entries(
    allSymbols
      .map((s) => s.getProperties()["Reference"][0])
      .reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: (acc[cur] || 0) + 1,
        }),
        {}
      )
  )
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([name, count]) => {
      const withFootprintCount = allSymbols
        .filter((s) => s.getProperties()["Reference"][0] === name)
        .filter((s) => s.getProperties()["Footprint"] !== "").length;
      return {
        name: name,
        count: count,
        withFootprint: withFootprintCount,
        completeProcent:
          ((withFootprintCount / (count as any)) * 100).toFixed(2) + "%",
      };
    });
  console.table(stats);

  const capacitorsAndResistors = allSymbols.filter((s) =>
    s.getProperties()["Reference"].match(/^[CR][0-9]+$/)
  );
  // sort by value
  capacitorsAndResistors.sort((a, b) =>
    a.getProperties()["Value"] > b.getProperties()["Value"] ? 1 : -1
  );

  let specs = combineSamePartSpecifications(
    capacitorsAndResistors.map((sym) => symbolToPartSpecification(sym))
  );

  for (let spec of specs) {
    if (isNaN(spec.value)) {
      console.log(
        "[WARN] No value for",
        spec.originalSymbols[0].getProperties()["Reference"]
      );
      // delete it from the list
      specs = specs.filter((s) => s !== spec);
    }
  }

  let prefferedPackages = [];
  if (argv["--preffered-package"]) {
    prefferedPackages = argv["--preffered-package"]
      .split(",")
      .map((p) => p.trim());
  }

  const lcscClient = new lcsc.LCSCClient();
  let specsWithFoundParts: any[] = [];
  for (let s of specs) {
    const filtersMap = await lcscClient.buildFiltersMapForPartSpecification(s);
    const parts = await lcscClient.searchParts(
      lcsc.lcscCategories[s.type],
      filtersMap,
      prefferedPackages
    );
    console.log(parts);
    let foundPart = {};
    let firstPart = (parts?.productList && parts?.productList[0]) || null;
    if (firstPart) {
      let amountNeeded =
        s.originalSymbols.length * parseInt(argv["--count"] || "1");
      if (amountNeeded < firstPart.minBuyNumber) {
        amountNeeded = firstPart.minBuyNumber;
      }

      amountNeeded =
        Math.ceil(amountNeeded / firstPart.split) * firstPart.split;

      const ladderElement = firstPart.productPriceList.find(
        (pl) => pl.ladder >= amountNeeded
      );
      const totalPrice = parseFloat(
        (ladderElement?.usdPrice * amountNeeded).toFixed(2)
      );
      foundPart = {
        descr: firstPart?.productIntroEn,
        productCode: firstPart.productCode,
        PKG: firstPart.encapStandard,
        amountNeeded,
        totalPrice,
      };
    }
    specsWithFoundParts.push({
      ...s,
      ...foundPart,
      count: s.originalSymbols.length,
      refs: s.originalSymbols
        .map((s) => s.getProperties()["Reference"])
        .join(", "),
      // lcscFilters: JSON.stringify(filtersMap),
    });
    console.log(specsWithFoundParts.length, "/", specs.length);

    // add the part to the schematic

    s.originalSymbols.forEach((sym) => {
      const properties = sym.getProperties();
      if (foundPart["productCode"]) {
        properties["LCSC"] = foundPart["productCode"];
      }
      if (foundPart["descr"]) {
        properties["LCSC_Descr"] = foundPart["descr"];
      }
      if (foundPart["PKG"]) {
        properties["LCSC_Package"] = foundPart["PKG"];
      }
    });
  }
  console.table(
    specsWithFoundParts.map((o) =>
      removeFromObject(o, "originalSymbols", "type", "value")
    )
  );
})();
