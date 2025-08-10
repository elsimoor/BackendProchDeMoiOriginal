declare module "written-number" {
  interface Options { lang?: string; noAnd?: boolean }
  function writtenNumber(value: number, opts?: Options): string;
  export = writtenNumber;
}
