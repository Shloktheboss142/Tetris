import { Viewport, Constants, Block, Obstacles, Tetriminos, Key, State} from "./types";
export { RNG, createSvgElement, createNewBlock}

class RNG {
    private static m = 0x80000000; // 2**31
    private static a = 2875461234;
    private static c = 465665;
  
    private seed: number;
  
    constructor(seed: number) {
      this.seed = seed;
    }
  
    private next(): number {
      this.seed = (RNG.a * this.seed + RNG.c) % RNG.m;
      return this.seed;
    }
  
    public nextInt(min: number, max: number): number {
      const range = max - min + 1;
      return min + (this.next() % range);
    }
  }

  const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {}
  ) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).map(([k, v]) => elem.setAttribute(k, v));
    return elem;
  };

  function createNewBlock(blockNumber: number = 0): SVGElement[] {
    const block = Tetriminos[blockNumber];
    const hehe: SVGElement[] = [];
    const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
      HTMLElement;
    block.blocks.map(element => {
      const cube = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${Block.WIDTH * element.x + 60}`,
        y: `${Block.HEIGHT * element.y}`,
        style: `fill: ${block.color}`,
      });
      hehe.push(cube);
    })
    return hehe;
  }