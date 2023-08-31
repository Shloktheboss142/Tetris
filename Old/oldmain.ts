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

import { Observable, Subscription, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan, startWith, reduce } from "rxjs/operators";
import { Viewport, Constants, Block, Key, Event, State } from "./types";
import { Action, initialState } from "./types";
import { Move, Rotate, Drop, Tick, reduceState } from "./state";
import { render, updateView } from "./view";
import { RNG } from "./utils";

/** Constants */

/** Utility functions */

/** State processing */



/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

/** Rendering (side effects) */



/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key, object: Action) =>
    key$.pipe(filter(({ code }) => code === keyCode), map(_ => object));

  const left$ = fromKey("KeyA", new Move(-1));
  const right$ = fromKey("KeyD", new Move(1));
  const down$ = fromKey("KeyS", new Move(0));
  const rotateClockwise$ = fromKey("KeyQ", new Rotate(90));
  const rotateCounterClockwise$ = fromKey("KeyE", new Rotate(-90));
  const drop$ = fromKey("Space", new Drop);

  /** Observables */

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS).pipe(map(elapsed => new Tick(elapsed)));

  const action$:Observable<Action> = merge(left$, right$, down$, rotateClockwise$, rotateCounterClockwise$, drop$, tick$);
  const state$:Observable<State> = action$.pipe(scan(reduceState, initialState));
  const subscription: Subscription = state$.subscribe(updateView(() => subscription.unsubscribe()));

  // Create a block
  tetris();
  
}

function tetris() {
  const block = render(initialState);
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
