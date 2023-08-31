import { State } from "./state";
import { Block, Obstacles, Viewport } from "./types";
import { createSvgElement } from "./util";

export { render, svg, gameover, container, show, hide, placeObstacles};

const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement & HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement & HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement & HTMLElement;
const container = document.querySelector("#main") as HTMLElement;

svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

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

const show = (elem: SVGGraphicsElement): void => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

const hide = (elem: SVGGraphicsElement): void => {
  elem.setAttribute("visibility", "hidden");
}

const placeObstacles = (level: number): SVGElement[] => {
  const addedObstacles: SVGElement[] = [];
  Obstacles[(level - 1) % Obstacles.length].map((block) => {
    const newBlock = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * block.x}`,
      y: `${Block.HEIGHT * block.y}`,
      style: `fill: gray`,
    });
    svg.appendChild(newBlock);
    addedObstacles.push(newBlock);
  });
  return addedObstacles;
};