// A helper class to optionally run console.time/console.timeEnd
// taken from https://github.com/personaelabs/spartan-ecdsa/blob/main/packages/lib/src/helpers/profiler.ts
export class Profiler {
  private enabled: boolean;

  constructor(options: { enabled?: boolean }) {
    this.enabled = options.enabled || false;
  }

  time(label: string) {
    this.enabled && console.time(label);
  }

  timeEnd(label: string) {
    this.enabled && console.timeEnd(label);
  }
}
