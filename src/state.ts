import { Viewport, Constants, Block, BlockOptions, State } from "./types";
import { checkGameEnd, rng, removeDuplicates, createNewBlock } from "./util";
import { placeObstacles } from "./view";

export { initialState, moveBlock, gameTick, rotateBlock, restart, newUpdates };
export type { State };

const initialState: State = {
  gameEnd: false,
  currentBlock: createNewBlock(rng.nextInt(0, BlockOptions.length - 1)),
  nextBlock: createNewBlock(rng.nextInt(0, BlockOptions.length - 1)),
  score: 0,
  level: 1,
  highScore: 0,
  existingBlocks: [],
};

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

const xAxisMovementAux = (s: State, newXPos: number, eachBlock: SVGElement): boolean => {
  return !s.existingBlocks.some((block) => {
    return (
      newXPos === Number(block.getAttribute("x")) &&
      Number(block.getAttribute("y")) === Number(eachBlock.getAttribute("y"))
    );
  });
};

const yAxisMovement = (s: State): boolean => {
  return s.currentBlock.every((eachBlock) => {
    const newYPos = Number(eachBlock.getAttribute("y")) + Block.HEIGHT;
    return newYPos >= 0 && newYPos + Block.HEIGHT <= Viewport.CANVAS_HEIGHT;
  });
}

const collisionCheck = (s: State): boolean => {
  return s.currentBlock.some((block) => {
    return collisionCheckAux(s, Number(block.getAttribute("x")), Number(block.getAttribute("y")));
  });
}

const collisionCheckAux = (s: State, newX: number, newY: number): boolean => {
  return s.existingBlocks.some((otherBlock) => {
     return Number(otherBlock.getAttribute("x")) == newX && Number(otherBlock.getAttribute("y")) == newY + Block.HEIGHT;
  });
}

const clearRows = (s: State): [number, number, number] => {
  const score: number[] = [s.score];
  const highScore: number[] = [s.highScore];
  const rowsWithBlocks: number[] = [];
  s.existingBlocks.map((block) => {
    const yPos = Number(block.getAttribute("y"));
    rowsWithBlocks.push(yPos);
  });
  const uniqueRows = removeDuplicates(rowsWithBlocks);
  uniqueRows.sort((a, b) => a - b);
  return clearRowsAux(s, uniqueRows, score, highScore);
};

const clearRowsAux = (s: State, uniqueRows: number[], score: number[], highScore: number[]): [number, number, number] => {
  uniqueRows.map((eachRow) => {
    const rowBlocks = s.existingBlocks.filter((element) => {
      return Number(element.getAttribute("y")) === eachRow;
    });
    if (rowBlocks.length === Constants.GRID_WIDTH) {
      score.push(score[score.length - 1] + 100);
      if (score[score.length - 1] > highScore[highScore.length - 1]) {
        highScore.push(score[score.length - 1]);
      }
      rowBlocks.map((block) => {
        block.remove();
        s.existingBlocks.splice(s.existingBlocks.indexOf(block), 1);
      });
      s.existingBlocks.map((block) => {
        if (Number(block.getAttribute("y")) < eachRow) {
          const newYPos = Number(block.getAttribute("y")) + Block.HEIGHT;
          block.setAttribute("y", `${newYPos}`);
        }
      });
    }
  });

  const newScore = score[score.length - 1];
  const newHighScore = highScore[highScore.length - 1];
  const newLevel = Math.floor(newScore / 300 + 1);

  return [newScore, newHighScore, newLevel];
};

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

const moveBlockDown = (s: State): SVGElement[] => {
  return s.currentBlock.map((block) => {
    const newYPos = Number(block.getAttribute("y")) + Block.HEIGHT;
    block.setAttribute("y", `${newYPos}`);
    return block;
  });
}

const rotateBlock = (s: State): State => {
  const currentBlock = s.currentBlock;
  const centerXPos = Number(currentBlock[2].getAttribute("x"));
  const centerYPos = Number(currentBlock[2].getAttribute("y"));

  const newBlockPositions = currentBlock.map((block) => {
    const newXPos = centerXPos + (Number(block.getAttribute("y")) - centerYPos);
    const newYPos = centerYPos - (Number(block.getAttribute("x")) - centerXPos);
    return { newXPos, newYPos };
  });

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