const peq: Uint32Array = new Uint32Array(0x10000);
const myers_32 = (a: string, b: string): number => {
  const n: number = a.length;
  const m: number = b.length;
  const lst: number = 1 << (n - 1);
  let pv: number = -1;
  let mv: number = 0;
  let sc: number = n;
  let i: number = n;
  while (i--) {
    (peq[a.charCodeAt(i) as number] as number) |= 1 << i;
  }
  for (i = 0; i < m; i++) {
    let eq: number = peq[b.charCodeAt(i) as number] as number;
    const xv: number = eq | mv;
    eq |= ((eq & pv) + pv) ^ pv;
    mv |= ~(eq | pv);
    pv &= eq;
    if (mv & lst) {
      sc++;
    }
    if (pv & lst) {
      sc--;
    }
    mv = (mv << 1) | 1;
    pv = (pv << 1) | ~(xv | mv);
    mv &= xv;
  }
  i = n;
  while (i--) {
    (peq[a.charCodeAt(i) as number] as number) = 0;
  }
  return sc;
};

const myers_x = (b: string, a: string): number => {
  const n: number = a.length;
  const m: number = b.length;
  const mhc: number[] = [];
  const phc: number[] = [];
  const hsize: number = Math.ceil(n / 32);
  const vsize: number = Math.ceil(m / 32);
  for (let i: number = 0; i < hsize; i++) {
    phc[i] = -1;
    mhc[i] = 0;
  }
  let j: number = 0;
  for (; j < vsize - 1; j++) {
    let mv: number = 0;
    let pv: number = -1;
    const start: number = j * 32;
    const vlen: number = Math.min(32, m) + start;
    for (let k: number = start; k < vlen; k++) {
      (peq[b.charCodeAt(k) as number] as number) |= 1 << k;
    }
    for (let i: number = 0; i < n; i++) {
      const eq: number = peq[a.charCodeAt(i) as number] as number;
      const pb: number = ((phc[(i / 32) | 0] as number) >>> i) & 1;
      const mb: number = ((mhc[(i / 32) | 0] as number) >>> i) & 1;
      const xv: number = eq | mv;
      const xh: number = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
      let ph: number = mv | ~(xh | pv);
      let mh: number = pv & xh;
      if ((ph >>> 31) ^ pb) {
        (phc[(i / 32) | 0] as number) ^= 1 << i;
      }
      if ((mh >>> 31) ^ mb) {
        (mhc[(i / 32) | 0] as number) ^= 1 << i;
      }
      ph = (ph << 1) | pb;
      mh = (mh << 1) | mb;
      pv = mh | ~(xv | ph);
      mv = ph & xv;
    }
    for (let k: number = start; k < vlen; k++) {
      (peq[b.charCodeAt(k) as number] as number) = 0;
    }
  }
  let mv: number = 0;
  let pv: number = -1;
  const start: number = j * 32;
  const vlen: number = Math.min(32, m - start) + start;
  for (let k: number = start; k < vlen; k++) {
    (peq[b.charCodeAt(k) as number] as number) |= 1 << k;
  }
  let score: number = m;
  for (let i: number = 0; i < n; i++) {
    const eq: number = peq[a.charCodeAt(i) as number] as number;
    const pb: number = ((phc[(i / 32) | 0] as number) >>> i) & 1;
    const mb: number = ((mhc[(i / 32) | 0] as number) >>> i) & 1;
    const xv: number = eq | mv;
    const xh: number = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
    let ph: number = mv | ~(xh | pv);
    let mh: number = pv & xh;
    score += (ph >>> (m - 1)) & 1;
    score -= (mh >>> (m - 1)) & 1;
    if ((ph >>> 31) ^ pb) {
      (phc[(i / 32) | 0] as number) ^= 1 << i;
    }
    if ((mh >>> 31) ^ mb) {
      (mhc[(i / 32) | 0] as number) ^= 1 << i;
    }
    ph = (ph << 1) | pb;
    mh = (mh << 1) | mb;
    pv = mh | ~(xv | ph);
    mv = ph & xv;
  }
  for (let k: number = start; k < vlen; k++) {
    (peq[b.charCodeAt(k) as number] as number) = 0;
  }
  return score;
};

const distance = (a: string, b: string): number => {
  if (a.length < b.length) {
    const tmp = b;
    b = a;
    a = tmp;
  }
  if (b.length === 0) {
    return a.length;
  }
  if (a.length <= 32) {
    return myers_32(a, b);
  }
  return myers_x(a, b);
};

const closest = (str: string, arr: readonly string[]): string => {
  let min_distance = Infinity;
  let min_index = 0;
  for (let i: number = 0; i < arr.length; i++) {
    const dist: number = distance(str, arr[i] as string);
    if (dist < min_distance) {
      min_distance = dist;
      min_index = i;
    }
  }
  return arr[min_index] as string;
};

export { closest, distance };