import { combineReducers } from "redux";
import { homeReducer, HomeState } from "../home";

export interface AppState {
  home: HomeState;
}

export const initialState = {};

export const createRootReducer = () =>
  combineReducers({
    home: homeReducer
  });
