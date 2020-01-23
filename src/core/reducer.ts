import { combineReducers } from "redux";
import { connectRouter, RouterState } from "connected-react-router";
import { homeReducer, HomeState } from "../home";

export interface AppState {
  router: RouterState<any>;
  home: HomeState;
}

export const initialState = {};

export const createRootReducer = (history: any) =>
  combineReducers({
    router: connectRouter(history),
    home: homeReducer
  });
