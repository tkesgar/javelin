import baseAcall from "acall";

export function handleError(error: Error): void {
  alert("Error: " + error.message);
  console.error(error);
}

export function acall(
  value: unknown,
  errorHandler = handleError
): Promise<unknown> {
  return baseAcall(value, errorHandler);
}

export function generateHash(): string {
  const timeStr = Date.now();
  const randomStr16 = Array.from(crypto.getRandomValues(new Uint32Array(2)))
    .map((val) => val.toString(16).padStart(8, "0"))
    .join("");

  return (timeStr + randomStr16).slice(0, 16);
}

export function range(start: number, stop: number, step = 1): number[] {
  const arr: number[] = [];

  for (let i = start; i <= stop; i += step) {
    arr.push(i);
  }

  return arr;
}
