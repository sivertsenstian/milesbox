import { Middleware } from "redux";

// Enables support for dispatching ACTIONS as class objects (e.g. dispatch(new action())
export const classActionMiddleware: Middleware = () => next => action => {
  if (action instanceof Object) {
    return next({ ...action });
  }
  throw new Error("action not instance of 'Object'");
};
