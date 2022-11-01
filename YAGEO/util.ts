const siPrefixes = {
  y: -24,
  z: -21,
  a: -18,
  f: -15,
  p: -12,
  n: -9,
  u: -6,
  m: -3,
  k: 3,
  K: 3,

  M: 6,
  G: 9,
  T: 12,
  P: 15,
};

export function parseSI(input: string, suffix: string) {
  // remove the suffix if it exists
  if (input.endsWith(suffix)) {
    input = input.slice(0, -suffix.length);
  }

  input = input.replace(suffix, ".");
  let mult = 0;
  for (const prefix in siPrefixes) {
    if (input.indexOf(prefix) !== -1) {
      mult = siPrefixes[prefix];
      // strip it from the end, otherwise replace with a dot
      if (input.endsWith(prefix)) {
        input = input.slice(0, -prefix.length);
      } else {
        input = input.replace(prefix, ".");
      }
      input = input.replace(prefix, "");
      break;
    }
  }
  return parseFloat(input) * Math.pow(10, mult);
}

export function removeFromObject<T>(obj: T, ...key: (keyof T)[]) {
  const ret = { ...obj };
  for (const k of key) {
    delete ret[k];
  }
  return ret;
}
