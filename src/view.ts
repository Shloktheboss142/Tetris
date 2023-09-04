import { State } from "./state";
import { Block, Obstacles, Viewport } from "./types";
import { createSvgElement } from "./util";

export { render, svg, gameover, container, show, hide, placeObstacles};

// Initialise the SVG canvas and preview
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement & HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement & HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement & HTMLElement;
const container = document.querySelector("#main") as HTMLElement;

// Set the height and width of the SVG canvas and preview
svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

/**
 * Function to render the SVG elements on the canvas
 * @param s The current state of the game
 */
const render = (s: State): void => {
  scoreText.innerHTML = `${s.score}`;
  highScoreText.innerHTML = `${s.highScore}`;
  levelText.innerHTML = `${s.level}`;
  s.currentBlock.map((block) => {
    svg.appendChild(block);
  });
  s.nextBlock.map((block) => {
    preview.appendChild(block);
  });
};

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 * GIVEN
 */
const show = (elem: SVGGraphicsElement): void => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 * GIVEN
 */
const hide = (elem: SVGGraphicsElement): void => {
  elem.setAttribute("visibility", "hidden");
}

/**
 * Function to place the obstacles on the canvas based on the level
 * @param level The current level of the game to determine the obstacles to place
 * @returns An array of SVG elements that are the obstacles
 */
const placeObstacles = (level: number): SVGElement[] => {
  const addedObstacles: SVGElement[] = [];

  // Choose the obstacles based on the level
  Obstacles[(level - 1) % Obstacles.length].map((block) => {
    const newBlock = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * block.x}`,
      y: `${Block.HEIGHT * block.y}`,
      style: `fill: white`,
    });
    svg.appendChild(newBlock);
    addedObstacles.push(newBlock);
  });
  return addedObstacles;
};