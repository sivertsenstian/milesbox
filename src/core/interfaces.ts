import { Action } from "redux";
export interface IFailureAction extends Action {
  readonly failure: boolean;
}

export interface ISuccessAction extends Action {
  readonly success: boolean;
}
