import { Observable, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, withLatestFrom, mergeMap, map } from "rxjs/operators";
import { combineEpics, ofType } from "redux-observable";
import {
  HomeActionType,
  HomeRequestDataSuccess,
  HomeRequestDataFailure,
  HomeRequesData
} from "./";
import { AppState } from "../core";

const homeEchoEpic$ = (action$: Observable<any>, store$: Observable<any>) => {
  return action$.pipe(
    ofType(HomeActionType.REQUEST_DATA),
    withLatestFrom(store$),
    mergeMap(([action, store]: [HomeRequesData, AppState]) => {
      const { boxId, sensor } = action;
      return ajax
        .getJSON(`${store.home.server}/boxes/${boxId}/sensors/${sensor}`)
        .pipe(map(data => new HomeRequestDataSuccess(data as any)))
        .pipe(catchError(err => of(new HomeRequestDataFailure(err))));
    })
  );
};

export const homeEpics = combineEpics(homeEchoEpic$);
