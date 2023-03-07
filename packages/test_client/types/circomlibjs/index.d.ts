declare module "circomlibjs" {
  export function buildPoseidon(): Promise<any>;

  export function poseidon(inputs: any): any;

  export function poseidon_slow(inputs: any): any;
}
