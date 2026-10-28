declare module "webscape-wanderer" {
  export function startWebscapeWanderer(tagName?: string): void;
  export function dataFromGraph(graph: {
    nodes: { id: string }[];
    links: { source: string; target: string; [key: string]: unknown }[];
  }): { nodes: unknown[]; links: unknown[] };
}
