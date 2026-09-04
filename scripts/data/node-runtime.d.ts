declare module 'node:crypto' {
  export const createHash: any;
}

declare module 'node:test' {
  const test: any;
  export default test;
}

declare module 'node:assert/strict' {
  const assert: any;
  export default assert;
}

declare module 'node:fs/promises' {
  export const readFile: any;
}

declare const process: any;
