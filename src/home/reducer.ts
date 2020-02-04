import dotp from "dot-prop-immutable-chain";
import { HomeActions, HomeActionType, IMeasurement, IBox } from "./";

export interface HomeState {
  server: string;
  alive: boolean;
  boxes: any[];
  sensors: any[];
  data: {
    [key: number]: {
      [key: number]: {
        trend: IMeasurement[];
        latest: IMeasurement;
      };
    };
  };
}

export const initialState: HomeState = {
  server:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/api"
      : "https://rest.sivertsen.tech",
  alive: false,
  boxes: [],
  sensors: [],
  data: {}
};

export const homeReducer = (state = initialState, action: HomeActions) => {
  switch (action.type) {
    case HomeActionType.REQUEST_BOXES_SUCCESS: {
      return dotp(state)
        .set("boxes", action.payload)
        .value();
    }
    case HomeActionType.REQUEST_DATA_TREND_SUCCESS: {
      const { boxId, sensor, data } = action.payload;
      return dotp(state)
        .set(`data.${boxId}.${sensor}.trend`, data)
        .value();
    }
    case HomeActionType.REQUEST_DATA_LATEST_SUCCESS: {
      const { boxId, sensor, data } = action.payload;
      return dotp(state)
        .set(`data.${boxId}.${sensor}.latest`, data)
        .value();
    }
    case HomeActionType.REQUEST_HEALTHCHECK_SUCCESS: {
      return dotp(state)
        .set("alive", true)
        .value();
    }
    case HomeActionType.REQUEST_HEALTHCHECK_FAILURE: {
      return dotp(state)
        .set("alive", false)
        .value();
    }
    default:
      return state;
  }
};
