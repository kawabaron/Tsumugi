type WeakRefLike<T extends object> = {
  deref(): T | undefined;
};

if (typeof globalThis.WeakRef === "undefined") {
  class WeakRefPolyfill<T extends object> implements WeakRefLike<T> {
    private value: T | undefined;

    constructor(value: T) {
      this.value = value;
    }

    deref() {
      return this.value;
    }
  }

  Object.defineProperty(globalThis, "WeakRef", {
    configurable: true,
    value: WeakRefPolyfill,
    writable: true,
  });
}
