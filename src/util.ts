import { Block, BlockOptions, State } from "./types";
import { svg } from "./view";

export { RNG, checkGameEnd, rng, removeDuplicates, createSvgElement, createNewBlock};

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

const rng = new RNG(63987543);

const checkGameEnd = (s: State): boolean => {
  return s.currentBlock.some(block => {
    const y = Number(block.getAttribute("y"));
    return y === 0;
  });
};

const removeDuplicates = (originalRow: number[]): number[] => {
  return originalRow.filter((value, index) => {
    return originalRow.indexOf(value) === index;
  });
};

const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).map(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

const createNewBlock = (blockNumber: number = 0): SVGElement[] => {
  const blockDetails = BlockOptions[blockNumber];
  const fullBlock: SVGElement[] = [];
    blockDetails.positions.map((block) => {
    const cube = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * block.x + 60}`,
      y: `${Block.HEIGHT * block.y}`,
      style: `fill: ${blockDetails.color}`,
    });
    fullBlock.push(cube);
  });
  return fullBlock;
}