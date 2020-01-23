import dotp from "dot-prop-immutable-chain";
import { HomeActions, HomeActionType } from "./";

export interface HomeState {
  server: string;
  boxes: any[];
  sensors: any[];
  data: { [key: string]: any };
}

export const initialState: HomeState = {
  server: "https://rest.sivertsen.tech",
  boxes: [],
  sensors: [],
  data: {}
};

export const homeReducer = (state = initialState, action: HomeActions) => {
  switch (action.type) {
    case HomeActionType.SET_NAME: {
      return { ...state, name: action.payload };
    }
    case HomeActionType.REQUEST_DATA_SUCCESS: {
      const { boxId, sensor, data } = action.payload;
      return dotp(state)
        .set(`data.${boxId}.${sensor}`, data)
        .value();
    }
    default:
      return state;
  }
};
