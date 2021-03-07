import debug, { Debugger } from "debug";

export function createDebug(name: string): Debugger {
  return debug(`javelin:${name}`);
}
