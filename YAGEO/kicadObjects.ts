import * as path from "path";
import * as fs from "fs/promises";
export abstract class KicadObject {
  abstract kind?: string;
  abstract toSex(): Array<any>;
  static fromSex(sex: Array<any>): KicadObject {
    const kind = sex[0];
    if (typeof kind !== "string") {
      throw new Error("sex2kicad: kind is not a string, but a " + typeof kind);
    }

    switch (kind) {
      case "kicad_sch":
        return KicadSchematic.fromSex(sex);
      case "symbol":
        return KicadSymbol.fromSex(sex);
      case "property":
        return KicadProperty.fromSex(sex);
      case "sheet":
        return KicadSheet.fromSex(sex);
      case "lib_id":
        return KicadLibId.fromSex(sex);
      default:
        return UnknownKicadObject.fromSex(sex);
    }
  }
}

export class UnknownKicadObject extends KicadObject {
  public kind?: string;
  public sex?: Array<any>;
  toSex(): Array<any> {
    return this.sex;
  }
  static fromSex(sex: Array<any>): KicadObject {
    const obj = new UnknownKicadObject();
    obj.kind = sex[0];
    obj.sex = sex;
    return obj;
  }
}

export abstract class KicadObjectWithChildren extends KicadObject {
  public kind?: string;
  public children?: Array<KicadObject>;
  childrenOfKind<T extends KicadObject>(kind: { new (): T }): Array<T> {
    return this.children?.filter((child) => child instanceof kind) as Array<T>;
  }
  getProperties() {
    return Object.fromEntries(
      this.childrenOfKind(KicadProperty).map((child) => [
        child.name,
        child.value,
      ])
    );
  }
  applyProperties(props: Record<string, string>) {
    for (const [name, value] of Object.entries(props)) {
      const prop = this.childrenOfKind(KicadProperty).find(
        (child) => child.name === name
      ) as KicadProperty;
      if (prop) {
        prop.value = value;
      } else {
        this.children.push(new KicadProperty(name, value));
      }
    }
  }
}

export interface KicadLoader {
  load(path: string): Promise<KicadObject>;
}

export class KicadSchematic extends KicadObjectWithChildren {
  public kind = "schematic";
  public uuid?: string;
  public paper?: string;
  public version?: string;
  public generator?: string;
  toSex(): Array<any> {
    return [
      this.kind,
      ["uuid", this.uuid],
      ["paper", String(this.paper)],
      ["version", this.version],
      ["generator", this.generator],
      ...this.children.map((child) => child.toSex()),
    ];
  }
  static fromSex(sex: Array<any>): KicadObject {
    const obj = new KicadSchematic();
    obj.children = sex
      .slice(1)
      .filter((s: Array<any>) => {
        const kind = s[0] as string;
        switch (kind) {
          case "uuid":
          case "paper":
          case "version":
          case "generator":
            obj[kind] = s[1].toString();
            return false;
          default:
            return true;
        }
      })
      .map((s: Array<any>) => KicadObject.fromSex(s));
    return obj;
  }
  /**
   * Recurisively load all sub-sheets, and return them.
   */
  async loadSubsheets(
    loader: KicadLoader,
    myPath: string
  ): Promise<KicadSchematic[]> {
    const myDir = path.dirname(myPath);
    const out = [];
    for (const sheet of this.childrenOfKind(KicadSheet)) {
      const sheetFile = path.join(myDir, sheet.getProperties()["Sheet file"]);
      const sheetObj = await loader.load(sheetFile);
      if (!(sheetObj instanceof KicadSchematic)) {
        throw new Error("Not a schematic, but a " + sheetObj.kind);
      }
      out.push(sheetObj);
      out.push(...(await sheetObj.loadSubsheets(loader, sheetFile)));
    }
    return out;
  }

  async save(path: string) {
    
  }
}

export class KicadSymbol extends KicadObjectWithChildren {
  public kind = "symbol";
  toSex(): Array<any> {
    return [this.kind, ...this.children.map((child) => child.toSex())];
  }
  static fromSex(sex: Array<any>): KicadObject {
    const obj = new KicadSymbol();
    obj.children = sex.slice(1).map((s: Array<any>) => KicadObject.fromSex(s));
    return obj;
  }
  getLibId(): string {
    return this.childrenOfKind(KicadLibId)[0].value;
  }
}

export class KicadSheet extends KicadObjectWithChildren {
  public kind = "sheet";
  toSex(): Array<any> {
    return [this.kind, ...this.children.map((child) => child.toSex())];
  }
  static fromSex(sex: Array<any>): KicadObject {
    const obj = new KicadSheet();
    obj.children = sex.slice(1).map((s: Array<any>) => KicadObject.fromSex(s));
    return obj;
  }
}

export class KicadProperty extends KicadObjectWithChildren {
  public kind = "property";
  public name?: string;
  public value?: string;
  constructor(name?: string, value?: string) {
    super();
    this.name = name;
    this.value = value;
  }
  toSex(): Array<any> {
    return [
      this.kind,
      String(this.name),
      String(this.value),
      ...this.children.map((child) => child.toSex()),
    ];
  }
  static fromSex(sex: Array<any>): KicadObject {
    const obj = new KicadProperty(sex[1].toString(), sex[2].toString());
    obj.children = sex.slice(3).map((s: Array<any>) => KicadObject.fromSex(s));
    return obj;
  }
}

export class KicadLibId extends KicadObjectWithChildren {
  public kind = "lib_id";
  public value?: string;
  constructor(value?: string) {
    super();
    this.value = value;
  }
  toSex(): Array<any> {
    return [
      this.kind,
      String(this.value),
      ...this.children.map((child) => child.toSex()),
    ];
  }
  static fromSex(sex: Array<any>): KicadObject {
    const obj = new KicadLibId(sex[1].toString());
    obj.children = sex.slice(3).map((s: Array<any>) => KicadObject.fromSex(s));
    return obj;
  }
}
