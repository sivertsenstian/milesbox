import { Action } from "redux";
import { ISuccessAction, IFailureAction } from "../core";

export enum HomeActionType {
  SET_NAME = "[Home] Set name",
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

export class HomeSetName implements Action {
  readonly type = HomeActionType.SET_NAME;
  constructor(public payload: string) {}
}

export class HomeRequesData implements Action {
  readonly type = HomeActionType.REQUEST_DATA;
  constructor(public boxId: number, public sensor: number) {}
}

export class HomeRequestDataSuccess implements Action, ISuccessAction {
  readonly type = HomeActionType.REQUEST_DATA_SUCCESS;
  readonly success = true;
  constructor(public payload: { boxId: number; sensor: number; data: any }) {}
}

export class HomeRequestDataFailure implements Action, IFailureAction {
  readonly type = HomeActionType.REQUEST_DATA_FAILURE;
  readonly failure = true;
  constructor(public payload: any) {}
}

export class HomeRequesBoxes implements Action {
  readonly type = HomeActionType.REQUEST_BOXES;
  constructor(public boxId: number, public sensor: number) {}
}

export class HomeRequestBoxesSuccess implements Action, ISuccessAction {
  readonly type = HomeActionType.REQUEST_BOXES_SUCCESS;
  readonly success = true;
  constructor(public payload: { boxId: number; sensor: number; value: any }) {}
}

export class HomeRequestBoxesFailure implements Action, IFailureAction {
  readonly type = HomeActionType.REQUEST_BOXES_FAILURE;
  readonly failure = true;
  constructor(public payload: any) {}
}

export class HomeRequesSensors implements Action {
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

export type HomeActions =
  | HomeSetName
  | HomeRequesData
  | HomeRequestDataSuccess
  | HomeRequestDataFailure
  | HomeRequesBoxes
  | HomeRequestBoxesSuccess
  | HomeRequestBoxesFailure
  | HomeRequesSensors
  | HomeRequestSensorsSuccess
  | HomeRequestSensorsFailure;
