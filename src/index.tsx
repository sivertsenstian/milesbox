import "../assets/main.scss";
import { createBrowserHistory } from "history";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import immutableValidator from "redux-immutable-state-invariant";
import {
  createRootReducer,
  initialState,
  classActionMiddleware,
  Header,
  AppState
} from "./core";
import {
  homeEpics,
  HomePage,
  HomeRequestBoxes,
  HomeRequestHealthCheck
} from "./home";

// Routing
export const history = createBrowserHistory();

// Effects
const epicMiddleware = createEpicMiddleware();
const rootEpic = combineEpics(homeEpics);

// Store
const logger = createLogger({
  collapsed: (_getState, action) => !action.failure,
  level: (action: any) => {
    if (action.success) {
      return "info";
    }
    if (action.failure) {
      return "error";
    }
    return "log";
  }
});

const middleware =
  process.env.NODE_ENV === "development"
    ? [
        immutableValidator({
          ignore: []
        }),
        epicMiddleware,
        classActionMiddleware,
        logger
      ]
    : [epicMiddleware, classActionMiddleware];
const store = createStore(
  createRootReducer(history),
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);
epicMiddleware.run(rootEpic);

// VIEW
const NotFound = () => <h2> 404 - NOT FOUND :( </h2>;
const App = () => {
  const dispatch = useDispatch(),
    alive = useSelector((state: AppState) => state.home.alive);

  useEffect(() => {
    // Health check
    dispatch(new HomeRequestHealthCheck());
    setInterval(() => dispatch(new HomeRequestHealthCheck()), 5000);
  }, []);
  useEffect(() => {
    // Fetch available boxes
    dispatch(new HomeRequestBoxes());
  }, [alive]);

  return (
    <div>
      <Header alive={alive} />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/*" component={NotFound} />
      </Switch>
    </div>
  );
};

const Root = ({ store }: { store: any }) => (
  <Provider store={store}>
    <Router>
      <Route path="/" component={App} />
    </Router>
  </Provider>
);

ReactDOM.render(<Root store={store} />, document.getElementById("root"));
