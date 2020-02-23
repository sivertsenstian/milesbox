import _get from "lodash/get";
import _isNil from "lodash/isNil";
import dotp from "dot-prop-immutable-chain";
import { HomeActions, HomeActionType, IMeasurement } from "./";

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
        period: number;
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
      const { boxId, sensor, data } = action.payload,
        current = _get(state, `data.${boxId}.${sensor}.period`);

      return dotp(state)
        .set(`data.${boxId}.${sensor}.trend`, data)
        .set(
          `data.${boxId}.${sensor}.period`,
          _isNil(current) ? 10080 : current
        )
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
    case HomeActionType.SET_TREND_PERIOD: {
      const { payload: minutes, box, sensor } = action;
      return dotp(state)
        .set(`data.${box}.${sensor}.period`, minutes)
        .value();
    }
    default:
      return state;
  }
};
