import "../assets/main.scss";
import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { routerMiddleware, ConnectedRouter } from "connected-react-router";
import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import immutableValidator from "redux-immutable-state-invariant";
import {
  createRootReducer,
  initialState,
  classActionMiddleware,
  Header
} from "./core";
import { homeEpics, HomePage } from "./home";

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
        routerMiddleware(history),
        epicMiddleware,
        classActionMiddleware,
        logger
      ]
    : [routerMiddleware(history), epicMiddleware, classActionMiddleware];
const store = createStore(
  createRootReducer(history),
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);
epicMiddleware.run(rootEpic);

// VIEW
const NotFound = () => <h2> 404 - NOT FOUND :( </h2>;

const App = () => {
  return (
    <div>
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/*" component={NotFound} />
      </Switch>
    </div>
  );
};

const Root = ({ store }: { store: any }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Router>
        <Route path="/" component={App} />
      </Router>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<Root store={store} />, document.getElementById("root"));
