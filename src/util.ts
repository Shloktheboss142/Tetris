import { Block, BlockOptions } from "./types";
import { svg } from "./view";

export { RNG, rng, removeDuplicates, createSvgElement, createNewBlock};

/**
 * Random Number Generator class
 * Source: FIT2102 Tutorial 4
 */
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

/**
 * Helper function to remove duplicates from an array
 * @param originalRow The array to remove duplicates from
 * @returns The input array with no duplicates
 */
const removeDuplicates = (originalRow: number[]): number[] => {
  return originalRow.filter((value, index) => {
    return originalRow.indexOf(value) === index;
  });
};

/**
 * Function to create a new SVG element
 * @param namespace The namespace of the SVG element
 * @param name The name of the SVG element
 * @param props The properties of the SVG element
 * @returns The new SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).map(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

/**
 * Function to create a new block based on the block number
 * @param blockNumber The block number of the block to create from the BlockOptions array
 * @returns The new block as an array of SVG elements
 */
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