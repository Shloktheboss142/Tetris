import { filter, fromEvent, interval, map } from "rxjs";
import { Constants, Key } from "./types";

export { fromKey, key$, left$, right$, down$, rotate$, restart$, tick$}

const key$ = fromEvent<KeyboardEvent>(document, "keypress"),
  fromKey = (keyCode: Key, action: string) =>
    key$.pipe(
      filter(({ code }) => code === keyCode),
      map((_) => action)
    ),
  left$ = fromKey("KeyA", "left"),
  right$ = fromKey("KeyD", "right"),
  down$ = fromKey("KeyS", "down"),
  rotate$ = fromKey("KeyW", "rotate"),
  restart$ = fromKey("Space", "restart"),
  tick$ = interval(Constants.TICK_RATE_MS);