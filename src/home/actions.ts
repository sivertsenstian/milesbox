import { Action } from "redux";
import { ISuccessAction, IFailureAction } from "../core";
import { IBox, IMeasurement } from "./interfaces";

export enum HomeActionType {
  REQUEST_HEALTHCHECK = "[Home] Request Healthcheck",
  REQUEST_HEALTHCHECK_SUCCESS = "[Home][Success] Request Healthcheck",
  REQUEST_HEALTHCHECK_FAILURE = "[Home][Failure] Request Healthcheck",
  REQUEST_DATA = "[Home] Request Data",
  REQUEST_DATA_SUCCESS = "[Home][Success] Request Data",
  REQUEST_DATA_FAILURE = "[Home][Failure] Request Data",
  REQUEST_BOXES = "[Home] Request Boxes",
  REQUEST_BOXES_SUCCESS = "[Home][Success] Request Boxes",
  REQUEST_BOXES_FAILURE = "[Home][Failure] Request Boxes",
  REQUEST_SENSORS = "[Home] Request Sensors",
  REQUEST_SENSORS_SUCCESS = "[Home][Success] Request Sensors",
  REQUEST_SENSORS_FAILURE = "[Home][Failure] Request Sensors"
}

export class HomeRequestData implements Action {
  readonly type = HomeActionType.REQUEST_DATA;
  constructor(public boxId: number, public sensor: number) {}
}

export class HomeRequestDataSuccess implements Action, ISuccessAction {
  readonly type = HomeActionType.REQUEST_DATA_SUCCESS;
  readonly success = true;
  constructor(
    public payload: { boxId: number; sensor: number; data: IMeasurement[] }
  ) {}
}

export class HomeRequestDataFailure implements Action, IFailureAction {
  readonly type = HomeActionType.REQUEST_DATA_FAILURE;
  readonly failure = true;
  constructor(public payload: any) {}
}

export class HomeRequestBoxes implements Action {
  readonly type = HomeActionType.REQUEST_BOXES;
  constructor() {}
}

export class HomeRequestBoxesSuccess implements Action, ISuccessAction {
  readonly type = HomeActionType.REQUEST_BOXES_SUCCESS;
  readonly success = true;
  constructor(public payload: IBox[]) {}
}

export class HomeRequestBoxesFailure implements Action, IFailureAction {
  readonly type = HomeActionType.REQUEST_BOXES_FAILURE;
  readonly failure = true;
  constructor(public payload: any) {}
}

export class HomeRequestSensors implements Action {
  readonly type = HomeActionType.REQUEST_SENSORS;
  constructor(public boxId: number, public sensor: number) {}
}

export class HomeRequestSensorsSuccess implements Action, ISuccessAction {
  readonly type = HomeActionType.REQUEST_SENSORS_SUCCESS;
  readonly success = true;
  constructor(public payload: { boxId: number; sensor: number; value: any }) {}
}

export class HomeRequestSensorsFailure implements Action, IFailureAction {
  readonly type = HomeActionType.REQUEST_SENSORS_FAILURE;
  readonly failure = true;
  constructor(public payload: any) {}
}

export class HomeRequestHealthCheck implements Action {
  readonly type = HomeActionType.REQUEST_HEALTHCHECK;
  constructor() {}
}

export class HomeRequestHealthCheckSuccess implements Action, ISuccessAction {
  readonly type = HomeActionType.REQUEST_HEALTHCHECK_SUCCESS;
  readonly success = true;
  constructor() {}
}

export class HomeRequestHealthCheckFailure implements Action, IFailureAction {
  readonly type = HomeActionType.REQUEST_HEALTHCHECK_FAILURE;
  readonly failure = true;
  constructor(public payload: any) {}
}

export type HomeActions =
  | HomeRequestData
  | HomeRequestDataSuccess
  | HomeRequestDataFailure
  | HomeRequestBoxes
  | HomeRequestBoxesSuccess
  | HomeRequestBoxesFailure
  | HomeRequestSensors
  | HomeRequestSensorsSuccess
  | HomeRequestSensorsFailure
  | HomeRequestHealthCheck
  | HomeRequestHealthCheckSuccess
  | HomeRequestHealthCheckFailure;
