declare module 'memoizee' {
  interface MemoizeeOptions {
    maxAge?: number;
    max?: number;
    promise?: boolean;
    normalizer?: (args: any[]) => string;
    primitive?: boolean;
    length?: number;
    resolvers?: Array<(arg: any) => any>;
    dispose?: (value: any) => void;
    async?: boolean;
    preFetch?: number | boolean;
    cache?: Map<any, any>;
  }

  interface Memoized<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>;
    delete: (...args: Parameters<T>) => void;
    clear: () => void;
  }

  function memoizee<T extends (...args: any[]) => any>(
    fn: T,
    options?: MemoizeeOptions
  ): Memoized<T>;

  export = memoizee;
}