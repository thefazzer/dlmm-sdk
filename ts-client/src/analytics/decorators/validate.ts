

export function validateInput() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (args.some(arg => arg === null || arg === undefined)) {
        throw new Error(`Invalid input for ${propertyKey}`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}