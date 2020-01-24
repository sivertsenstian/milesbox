import { Observable, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, withLatestFrom, mergeMap, map } from "rxjs/operators";
import { combineEpics, ofType } from "redux-observable";
import {
  HomeActionType,
  HomeRequestDataSuccess,
  HomeRequestDataFailure,
  HomeRequestData,
  mappers
} from "./";
import { AppState } from "../core";

const homeEchoEpic$ = (action$: Observable<any>, store$: Observable<any>) => {
  return action$.pipe(
    ofType(HomeActionType.REQUEST_DATA),
    withLatestFrom(store$),
    mergeMap(([action, store]: [HomeRequestData, AppState]) => {
      const { boxId, sensor } = action;
      return ajax
        .getJSON(`${store.home.server}/boxes/${boxId}/sensors/${sensor}`)
        .pipe(
          map(
            (response: any) =>
              new HomeRequestDataSuccess({
                ...response,
                data: response.data.map(mappers.measurement.from)
              })
          )
        )
        .pipe(catchError(err => of(new HomeRequestDataFailure(err))));
    })
  );
};

export const homeEpics = combineEpics(homeEchoEpic$);
