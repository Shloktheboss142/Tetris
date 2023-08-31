/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { Observable, fromEvent, interval, merge, zip } from "rxjs";
import { map, filter, scan, tap, switchMap, takeUntil, take } from "rxjs/operators";
import { Viewport, Constants, Block, Obstacles, Tetriminos, Key, State} from "./types";
import { RNG, createSvgElement, createNewBlock} from "./util";

/** Constants */


/** User input */

/** Utility functions */

const rng = new RNG(63987543); // Seed with an initial value

// Generate a pseudorandom integer between 1 and 6 (inclusive)





// const 

/** State processing */







const initialState: State = {
  gameEnd: false,
  currentBlock: createNewBlock(rng.nextInt(0, Tetriminos.length - 1)),
  nextBlock: createNewBlock(rng.nextInt(0, Tetriminos.length - 1)),
  score: 0,
  level: 1,
  highScore: 0,
  rotation: 0,
  existingBlocks: [] as SVGElement[],
};

const checkGameEnd = (s: State) => {
  return s.currentBlock.some(element => {
    const y = Number(element.getAttribute('y'));
    return y === 0;
  });
}

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */

/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */

  // const s.existingBlocks: SVGElement[] = [];

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key, movement: string) =>
      key$.pipe(filter(({ code }) => code === keyCode), map(_ => movement));

    const left$ = fromKey("KeyA", 'left');
    const right$ = fromKey("KeyD", 'right');
    const down$ = fromKey("KeyS", 'down');
    const rotate$ = fromKey("KeyW", 'rotate');
    const restart$ = fromKey("Space", 'restart');


  /** Observables */

  function canMoveHorizontally(currentBlock: SVGElement[], xOffset: number, existingBlocks: SVGElement[]): boolean {
    return currentBlock.every(element => {
      const newX = Number(element.getAttribute('x')) + xOffset;
      return newX >= 0 && newX + Block.WIDTH <= Viewport.CANVAS_WIDTH && !existingBlocks.some(block => {
        const existingX = Number(block.getAttribute('x'));
        const existingY = Number(block.getAttribute('y'));
        return newX === existingX && existingY === Number(element.getAttribute('y'));
      });
    });
  }

  function canMoveVertically(currentBlock: SVGElement[], yOffset: number): boolean {
    return currentBlock.every(element => {
      const newY = Number(element.getAttribute('y')) + yOffset;
      return newY >= 0 && newY + Block.HEIGHT <= Viewport.CANVAS_HEIGHT;
    });
  }

  function checkCollision(currentBlock: SVGElement[], existingBlocks: SVGElement[]): boolean {
    return currentBlock.some(element => {
      const newX = Number(element.getAttribute('x'));
      const newY = Number(element.getAttribute('y'));
      return existingBlocks.some(block => {
        const existingX = Number(block.getAttribute('x'));
        const existingY = Number(block.getAttribute('y'));
        return newX === existingX && newY + Block.HEIGHT === existingY;
      });
    });
  }

  function removeFilledRows(s: State) {
    const score: number[] = [s.score];
    const highScore: number[] = [s.highScore];
    const rows: number[] = [];
    const level: number = s.level;
    s.existingBlocks.map(element => {
      const y = Number(element.getAttribute('y'));
      if (!rows.includes(y)) {
        rows.push(y);
      }
    });
    rows.sort((a, b) => a - b);
    rows.map(row => {
      const rowBlocks = s.existingBlocks.filter(element => {
        const y = Number(element.getAttribute('y'));
        return y === row;
      });
      if (rowBlocks.length === Constants.GRID_WIDTH) {
        score.push(score[score.length - 1] + 100)
        if (score[score.length - 1] > highScore[highScore.length - 1]) {
          highScore.push(score[score.length - 1]);
        }
        rowBlocks.map(element => {
          element.remove();
          s.existingBlocks.splice(s.existingBlocks.indexOf(element), 1); // Remove from the s.existingBlocks array
        });
        s.existingBlocks.map(element => {
          const y = Number(element.getAttribute('y'));
          if (y < row) {
            const newY = y + Block.HEIGHT;
            element.setAttribute('y', `${newY}`);
          }
        });
      }
    });
    const newScore = score[score.length - 1];
    const newHighScore = highScore[highScore.length - 1];
    const newLevel = Math.floor((newScore / 300) + 1);
    return [newScore, newHighScore, newLevel];
  }

  const move = (s: State, movement: number) => {
    const newBlock = s.currentBlock;

    if ((movement === 1 || movement === -1) && canMoveHorizontally(s.currentBlock, movement * Block.WIDTH, s.existingBlocks) && !checkCollision(s.currentBlock, s.existingBlocks)) {
      const newBlock = s.currentBlock.map(element => {
        const x = Number(element.getAttribute("x")) + movement * Block.WIDTH;
        element.setAttribute("x", `${x}`);
        return element;
      });
    } else if (movement === 0 && canMoveVertically(s.currentBlock, Block.HEIGHT) && !checkCollision(s.currentBlock, s.existingBlocks)) {
      const newBlock = s.currentBlock.map(element => {
        const y = Number(element.getAttribute("y")) + Block.HEIGHT;
        element.setAttribute("y", `${y}`);
        return element;
      });
    } else {
      const newBlock = s.currentBlock;
    }
  
    return { ...s, currentBlock: newBlock};
  };

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);

  const restart = (s: State) => {
    s.currentBlock.map(element => {
      element.remove();
    }
    );
    s.nextBlock.map(element => {
      element.remove();
    }
    );
    s.existingBlocks.map(element => {
      element.remove();
    });
    const oldState = s;
    const newCurrentBlock = createNewBlock(rng.nextInt(0, Tetriminos.length - 1));
    const newNextBlock = createNewBlock(rng.nextInt(0, Tetriminos.length - 1));
    const newState = {...initialState, currentBlock: newCurrentBlock,highScore: oldState.highScore, existingBlocks: [] as SVGElement[], score: 0, level: 1, nextBlock: newNextBlock};
    return newState;
  }

  const tick = (s: State) => {
    if (canMoveVertically(s.currentBlock, Block.HEIGHT) && !checkCollision(s.currentBlock, s.existingBlocks)) {
      const newBlock = s.currentBlock.map(element => {
        const y = Number(element.getAttribute("y")) + Block.HEIGHT;
        element.setAttribute("y", `${y}`);
        return element;
      }, []);
      return { ...s, currentBlock: newBlock, gameEnd: checkGameEnd(s)};
    } 
    else {
      s.existingBlocks.push(...s.currentBlock);
      const newCurrentBlock = s.nextBlock
      const newNextBlock = createNewBlock(rng.nextInt(0, Tetriminos.length - 1));
      return { ...s, currentBlock: newCurrentBlock, nextBlock: newNextBlock, gameEnd: checkGameEnd(s)};
    }
  }

  const rotate = (s: State) => {
    const currentBlock = s.currentBlock;
    const centerX = currentBlock[2].getAttribute("x");
    const centerY = currentBlock[2].getAttribute("y");
  
    const newBlockPositions = currentBlock.map(element => {
      const relativeX = Number(element.getAttribute("x")) - Number(centerX);
      const relativeY = Number(element.getAttribute("y")) - Number(centerY);
      const newX = Number(centerX) + relativeY;
      const newY = Number(centerY) - relativeX;
      return { newX, newY };
    });
  
    const validRotation = newBlockPositions.every(({ newX, newY }) => {
      return (
        newX >= 0 &&
        newX + Block.WIDTH <= Viewport.CANVAS_WIDTH &&
        newY >= 0 &&
        newY + Block.HEIGHT <= Viewport.CANVAS_HEIGHT &&
        !s.existingBlocks.some(block => {
          const existingX = Number(block.getAttribute("x"));
          const existingY = Number(block.getAttribute("y"));
          return newX === existingX && newY === existingY;
        })
      );
    });
  
    if (validRotation) {
      const newBlock = currentBlock.map((element, index) => {
        element.setAttribute("x", `${newBlockPositions[index].newX}`);
        element.setAttribute("y", `${newBlockPositions[index].newY}`);
        return element;
      });
  
      return { ...s, currentBlock: newBlock };
    }
  
    return s;
  };

  const placeObstacles = (s: State, level: number) => {
    const addedObstacles: SVGElement[] = []
    console.log(((level - 1) % (Obstacles.length)));
    Obstacles[((level - 1) % (Obstacles.length))].map(element => {
      const cube = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${Block.WIDTH * element.x}`,
        y: `${Block.HEIGHT * element.y}`,
        style: `fill: gray`,
      });
      svg.appendChild(cube);
      addedObstacles.push(cube);
    });
    return addedObstacles;
  }

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    scoreText.innerHTML = `${s.score}`;
    highScoreText.innerHTML = `${s.highScore}`;
    levelText.innerHTML = `${s.level}`;
    s.currentBlock.map(element => {
      svg.appendChild(element);
    }
    );
    s.nextBlock.map(element => {
      preview.appendChild(element);
    });
  };

  render(initialState);

  const source$ = merge(tick$, left$, right$, down$, rotate$, restart$)
    .pipe(scan((s: State, action: string | number) => {
      const newExistingBlocks: SVGElement[] = [];
      const [newScore, newHighScore, newLevel] = removeFilledRows(s)
      if (s.level !== newLevel) {
        placeObstacles(s, newLevel).map(element => {
          newExistingBlocks.push(element);
        } 
        );
      }

      const oldExistingBlocks = s.existingBlocks;

      // console.log(s.existingBlocks);
      
      switch (action) {
        case('right'):
          return {...move(s, 1), score: newScore, highScore: newHighScore, level: newLevel, existingBlocks: oldExistingBlocks.concat(newExistingBlocks)}
        case('left'):
          return {...move(s, -1), score: newScore, highScore: newHighScore, level: newLevel, existingBlocks: oldExistingBlocks.concat(newExistingBlocks)}
        case('down'):
          return {...move(s, 0), score: newScore, highScore: newHighScore, level: newLevel, existingBlocks: oldExistingBlocks.concat(newExistingBlocks)}
        case('rotate'):
          return {...rotate(s), score: newScore, highScore: newHighScore, level: newLevel, existingBlocks: oldExistingBlocks.concat(newExistingBlocks)}
        case('restart'):
          if (s.gameEnd) {
            return restart(s);
          }
        default:
          if (!s.gameEnd) {
            return {...tick(s), score: newScore, highScore: newHighScore, level: newLevel, existingBlocks: oldExistingBlocks.concat(newExistingBlocks)}
          } else {
            return s;
          }
      }
      
      }, initialState),
      tap(s => render(s)
      )).subscribe(async (s: State) => {

      if (s.gameEnd) {
        show(gameover);
      } else {
        hide(gameover);
      }
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
