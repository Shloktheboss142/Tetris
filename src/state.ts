import { Viewport, Constants, Block, BlockOptions, State } from "./types";
import {rng, removeDuplicates, createNewBlock } from "./util";
import { placeObstacles } from "./view";

export { initialState, moveBlock, gameTick, rotateBlock, restart, newUpdates };
export type { State };

/**
 * The initial state of the game.
 */
const initialState: State = {
  gameEnd: false,
  currentBlock: createNewBlock(rng.nextInt(0, BlockOptions.length - 1)),
  nextBlock: createNewBlock(rng.nextInt(0, BlockOptions.length - 1)),
  score: 0,
  level: 1,
  highScore: 0,
  existingBlocks: [],
};

/**
 * Function to check for new updates to the game, only called from main.ts
 * @param s The current state of the game
 * @returns The new score, high score, level and existing blocks
 */
const newUpdates = (s: State): [number, number, number, SVGElement[]] => {
  const newExistingBlocks: SVGElement[] = [];
  const [newScore, newHighScore, newLevel] = clearRows(s);
  if (s.level !== newLevel) {
    placeObstacles(newLevel).map((element) => {
      newExistingBlocks.push(element);
    });
  }
  return [newScore, newHighScore, newLevel, newExistingBlocks];
}; 

/**
 * Function to check if the block can move in the x-axis
 * @param s The current state of the game
 * @param direction The direction to move the block in the x-axis (1 for right, -1 for left)
 * @returns True if the block can move in the x-axis, false otherwise
 */
const xAxisMovement = (s: State, direction: number): boolean => {
  return s.currentBlock.every((eachBlock) => {
    const newXPos = Number(eachBlock.getAttribute("x")) + direction * Block.WIDTH;
    return (
      newXPos + Block.WIDTH <= Viewport.CANVAS_WIDTH &&
      newXPos >= 0 &&
      xAxisMovementAux(s, newXPos, eachBlock)
    );
  });
};

/**
 * Helper function for xAxisMovement which makes the code more readable
 * @param s The current state of the game
 * @param newXPos The new x position of the block
 * @param eachBlock The block to check if it can move in the x-axis
 * @returns True if the block can move in the x-axis, false otherwise
 */
const xAxisMovementAux = (s: State, newXPos: number, eachBlock: SVGElement): boolean => {
  return !s.existingBlocks.some((block) => {
    return (
      newXPos === Number(block.getAttribute("x")) &&
      Number(block.getAttribute("y")) === Number(eachBlock.getAttribute("y"))
    );
  });
};

/**
 * Function to check if the block can move in the y-axis
 * @param s The current state of the game
 * @returns True if the block can move in the y-axis, false otherwise
 */
const yAxisMovement = (s: State): boolean => {
  return s.currentBlock.every((eachBlock) => {
    const newYPos = Number(eachBlock.getAttribute("y")) + Block.HEIGHT;
    return newYPos >= 0 && newYPos + Block.HEIGHT <= Viewport.CANVAS_HEIGHT;
  });
}

/**
 * Function to check if the block is colliding with another block
 * @param s The current state of the game
 * @returns  True if the block is colliding with another block, false otherwise
 */
const collisionCheck = (s: State): boolean => {
  return s.currentBlock.some((block) => {
    return collisionCheckAux(s, Number(block.getAttribute("x")), Number(block.getAttribute("y")));
  });
}

/**
 * Helper function for collisionCheck which makes the code more readable
 * @param s The current state of the game
 * @param newXPos The new x position of the block
 * @param newYPos The new y position of the block
 * @returns True if the block is colliding with another block, false otherwise
 */
const collisionCheckAux = (s: State, newXPos: number, newYPos: number): boolean => {
  return s.existingBlocks.some((otherBlock) => {
     return Number(otherBlock.getAttribute("x")) == newXPos && Number(otherBlock.getAttribute("y")) == newYPos + Block.HEIGHT;
  });
}

/**
 * Function to clear rows if they are full
 * Also updates the score, high score and level accordingly
 * @param s The current state of the game
 * @returns The new score, high score and level
 */
const clearRows = (s: State): [number, number, number] => {
  const score: number[] = [s.score];
  const highScore: number[] = [s.highScore];
  const rowsWithBlocks: number[] = [];

  // Get all the rows with blocks
  s.existingBlocks.map((block) => {
    const yPos = Number(block.getAttribute("y"));
    rowsWithBlocks.push(yPos);
  });
  const uniqueRows = removeDuplicates(rowsWithBlocks);
  uniqueRows.sort((a, b) => a - b);

  // Clear the rows with blocks
  uniqueRows.map((eachRow) => {
    const rowBlocks = s.existingBlocks.filter((element) => {
      return Number(element.getAttribute("y")) === eachRow;
    });
    if (rowBlocks.length === Constants.GRID_WIDTH) {

      // Update the score, high score and level
      score.push(score[score.length - 1] + 100);
      if (score[score.length - 1] > highScore[highScore.length - 1]) {
        highScore.push(score[score.length - 1]);
      }

      // Remove the row and move the blocks above down
      rowBlocks.map((block) => {
        block.remove();
        s.existingBlocks.splice(s.existingBlocks.indexOf(block), 1);
      });

      // Move the blocks above down
      s.existingBlocks.map((block) => {
        if (Number(block.getAttribute("y")) < eachRow) {
          block.setAttribute(
            "y",
            `${Number(block.getAttribute("y")) + Block.HEIGHT}`
          );
        }
      });
    }
  });

  // Update the level, score and high score
  const newScore = score[score.length - 1];
  const newHighScore = highScore[highScore.length - 1];
  const newLevel = Math.floor(newScore / 300 + 1);

  return [newScore, newHighScore, newLevel];
};

/**
 * Function to move the block in the specified direction
 * @param s The current state of the game
 * @param direction The direction to move the block (1 for right, -1 for left, 0 for down)
 * @returns The new state of the game after moving the block
 */
const moveBlock = (s: State, direction: number): State => {
  const currentBlock = s.currentBlock;

  if (
    (direction === 1 || direction === -1) &&
    xAxisMovement(s, direction) &&
    !collisionCheck(s)
  ) {
    const currentBlock = s.currentBlock.map((block) => {
      const newXPos = Number(block.getAttribute("x")) + direction * Block.WIDTH;
      block.setAttribute("x", `${newXPos}`);
      return block;
    });
  } else if (direction === 0 && yAxisMovement(s) && !collisionCheck(s)) {
    const currentBlock = moveBlockDown(s);
  } else {
    const currentBlock = s.currentBlock;
  }

  return { ...s, currentBlock: currentBlock };
};

/**
 * Function to move the block down by one block every tick
 * @param s The current state of the game
 * @returns The new state of the game after moving the block down
 */
const gameTick = (s: State): State => {
  if (yAxisMovement(s) && !collisionCheck(s)) {
    const currentBlock = moveBlockDown(s);
    return { ...s, currentBlock: currentBlock, gameEnd: checkGameEnd(s) };
  } else {
    s.existingBlocks.push(...s.currentBlock);
    const newCurrentBlock = s.nextBlock;
    const newNextBlock = createNewBlock(
      rng.nextInt(0, BlockOptions.length - 1)
    );
    return {
      ...s,
      currentBlock: newCurrentBlock,
      nextBlock: newNextBlock,
      gameEnd: checkGameEnd(s),
    };
  }
};

/**
 * Helper function for gameTick which changes the y attribute of the block and makes the code more readable
 * @param s The current state of the game
 * @returns The new state of the game after moving the block down
 */
const moveBlockDown = (s: State): SVGElement[] => {
  return s.currentBlock.map((block) => {
    const newYPos = Number(block.getAttribute("y")) + Block.HEIGHT;
    block.setAttribute("y", `${newYPos}`);
    return block;
  });
}

/**
 * Function to rotate the block
 * @param s The current state of the game
 * @returns The new state of the game after rotating the block
 */
const rotateBlock = (s: State): State => {
  const currentBlock = s.currentBlock;

  // Get the center of the block to rotate around
  const centerXPos = Number(currentBlock[2].getAttribute("x"));
  const centerYPos = Number(currentBlock[2].getAttribute("y"));

  // Get the new positions of the block after rotation
  const newBlockPositions = currentBlock.map((block) => {
    const newXPos = centerXPos + (Number(block.getAttribute("y")) - centerYPos);
    const newYPos = centerYPos - (Number(block.getAttribute("x")) - centerXPos);
    return { newXPos, newYPos };
  });

  // Check if the block can be rotated and rotate it if it can
  if (validRotation(s, newBlockPositions)) {
    const newBlock = currentBlock.map((element, index) => {
      element.setAttribute("x", `${newBlockPositions[index].newXPos}`);
      element.setAttribute("y", `${newBlockPositions[index].newYPos}`);
      return element;
    });

    return { ...s, currentBlock: newBlock };
  }

  return s;
};

/**
 * Function to check if the block can be rotated or wether there is a collision with another block or the wall
 * @param s The current state of the game
 * @param newBlockPositions The new positions of the block after rotation
 * @returns True if the block can be rotated, false otherwise
 */
const validRotation = (s: State, newBlockPositions: { newXPos: number; newYPos: number }[]): boolean => {
  return newBlockPositions.every(({ newXPos, newYPos }) => {
    return (
      newXPos >= 0 &&
      newXPos + Block.WIDTH <= Viewport.CANVAS_WIDTH &&
      newYPos >= 0 &&
      newYPos + Block.HEIGHT <= Viewport.CANVAS_HEIGHT &&
      !s.existingBlocks.some((block) => {
        const existingX = Number(block.getAttribute("x"));
        const existingY = Number(block.getAttribute("y"));
        return newXPos === existingX && newYPos === existingY;
      })
    );
  });
};

/**
 * Function to restart the game after the game ends and the player presses the restart button
 * @param s The current state of the game
 * @returns The initial state of the game with the high score from the previous game
 */
const restart = (s: State): State => {
  s.currentBlock.map((element) => {
    element.remove();
  });
  s.nextBlock.map((element) => {
    element.remove();
  });
  s.existingBlocks.map((element) => {
    element.remove();
  });
  const oldState = s;
  const newCurrentBlock = createNewBlock(rng.nextInt(0, BlockOptions.length - 1));
  const newNextBlock = createNewBlock(rng.nextInt(0, BlockOptions.length - 1));
  const newState = {
    ...initialState,
    currentBlock: newCurrentBlock,
    nextBlock: newNextBlock,
    score: 0,
    level: 1,
    highScore: oldState.highScore,
    existingBlocks: [] as SVGElement[],
  };

  return newState;
};

/**
 * Function to check if the game has ended
 * @param s The current state of the game
 * @returns True if the game has ended, false otherwise
 */
const checkGameEnd = (s: State): boolean => {
  return s.currentBlock.some(block => {
    return Number(block.getAttribute("y")) === 0;
  });
};