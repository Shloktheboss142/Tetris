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
import { merge } from "rxjs";
import { scan } from "rxjs/operators";
import { State } from "./types";
import {
  initialState,
  moveBlock,
  rotateBlock,
  restart,
  gameTick,
  newUpdates,
} from "./state";
import { gameover, render, show, hide } from "./view";
import { left$, right$, down$, rotate$, restart$, tick$ } from "./observable";

/**
 * The main function that contains the main game loop.
 */
export const main = () => {
  // Main observable that combines all the other observables
  const source$ = merge(tick$, left$, right$, down$, rotate$, restart$).pipe(
    scan((s: State, action: string | number) => {
      // Getting the new score, high score, level and existing blocks
      const [newScore, newHighScore, newLevel, newExistingBlocks] =
        newUpdates(s);
      const oldExistingBlocks = s.existingBlocks;

      // Switch statement to check which action is triggered
      switch (action) {
        case "right":
          return {
            ...moveBlock(s, 1),
            score: newScore,
            highScore: newHighScore,
            level: newLevel,
            existingBlocks: oldExistingBlocks.concat(newExistingBlocks),
          };
        case "left":
          return {
            ...moveBlock(s, -1),
            score: newScore,
            highScore: newHighScore,
            level: newLevel,
            existingBlocks: oldExistingBlocks.concat(newExistingBlocks),
          };
        case "down":
          return {
            ...moveBlock(s, 0),
            score: newScore,
            highScore: newHighScore,
            level: newLevel,
            existingBlocks: oldExistingBlocks.concat(newExistingBlocks),
          };
        case "rotate":
          return {
            ...rotateBlock(s),
            score: newScore,
            highScore: newHighScore,
            level: newLevel,
            existingBlocks: oldExistingBlocks.concat(newExistingBlocks),
          };
        case "restart":
          if (s.gameEnd) {
            return restart(s);
          } else {
            return s;
          }
        default:
          // If no action is triggered, the game will continue or end depending on the gameEnd state
          if (!s.gameEnd) {
            return {
              ...gameTick(s),
              score: newScore,
              highScore: newHighScore,
              level: newLevel,
              existingBlocks: oldExistingBlocks.concat(newExistingBlocks),
            };
          } else {
            return s;
          }
      }
    }, initialState)
  );

  // Subscribe to the source observable
  source$.subscribe((s: State) => {
    render(s);
    if (s.gameEnd) {
      show(gameover);
    } else {
      hide(gameover);
    }
  });
};

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
