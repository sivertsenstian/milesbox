import { Observable, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, withLatestFrom, mergeMap, map } from "rxjs/operators";
import { combineEpics, ofType } from "redux-observable";
import {
  HomeActionType,
  HomeRequestTrendDataSuccess,
  HomeRequestTrendDataFailure,
  HomeRequestTrendData,
  mappers
} from "./";
import { AppState } from "../core";
import {
  HomeRequestBoxes,
  HomeRequestBoxesSuccess,
  HomeRequestBoxesFailure,
  HomeRequestHealthCheck,
  HomeRequestHealthCheckSuccess,
  HomeRequestHealthCheckFailure,
  HomeRequestLatestData,
  HomeRequestLatestDataSuccess,
  HomeRequestLatestDataFailure
} from "./actions";

const requestHealthCheck$ = (
  action$: Observable<any>,
  store$: Observable<any>
) => {
  return action$.pipe(
    ofType(HomeActionType.REQUEST_HEALTHCHECK),
    withLatestFrom(store$),
    mergeMap(([, store]: [HomeRequestHealthCheck, AppState]) => {
      return ajax.getJSON(`${store.home.server}/health`).pipe(
        map(() => new HomeRequestHealthCheckSuccess()),
        catchError(err => of(new HomeRequestHealthCheckFailure(err)))
      );
    })
  );
};

const requestBoxes$ = (action$: Observable<any>, store$: Observable<any>) => {
  return action$.pipe(
    ofType(HomeActionType.REQUEST_BOXES),
    withLatestFrom(store$),
    mergeMap(([, store]: [HomeRequestBoxes, AppState]) => {
      return ajax.getJSON(`${store.home.server}/boxes/`).pipe(
        map(
          (response: any) =>
            new HomeRequestBoxesSuccess(response.map(mappers.box.from))
        ),
        catchError(err => of(new HomeRequestBoxesFailure(err)))
      );
    })
  );
};

const requestSensorTrend$ = (
  action$: Observable<any>,
  store$: Observable<any>
) => {
  return action$.pipe(
    ofType(HomeActionType.REQUEST_DATA_TREND),
    withLatestFrom(store$),
    mergeMap(([action, store]: [HomeRequestTrendData, AppState]) => {
      const { boxId, sensor } = action;
      return ajax
        .getJSON(`${store.home.server}/boxes/${boxId}/sensors/${sensor}`)
        .pipe(
          map(
            (response: any) =>
              new HomeRequestTrendDataSuccess({
                ...response,
                data: response.data.map(mappers.measurement.from)
              })
          ),
          catchError(err => of(new HomeRequestTrendDataFailure(err)))
        );
    })
  );
};

const requestSensorLatest$ = (
  action$: Observable<any>,
  store$: Observable<any>
) => {
  return action$.pipe(
    ofType(HomeActionType.REQUEST_DATA_LATEST),
    withLatestFrom(store$),
    mergeMap(([action, store]: [HomeRequestLatestData, AppState]) => {
      const { boxId, sensor } = action;
      return ajax
        .getJSON(`${store.home.server}/boxes/${boxId}/sensors/${sensor}/latest`)
        .pipe(
          map(
            (response: any) =>
              new HomeRequestLatestDataSuccess({
                ...response,
                data: mappers.measurement.from(response.data)
              })
          ),
          catchError(err => of(new HomeRequestLatestDataFailure(err)))
        );
    })
  );
};

export const homeEpics = combineEpics(
  requestSensorTrend$,
  requestSensorLatest$,
  requestBoxes$,
  requestHealthCheck$
);
