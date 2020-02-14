import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "./";

interface IconProps {
  name: string;
  color: string;
  size: string;
}
export const Icon = (props: IconProps) => {
  return (
    <span className={`icon ${props.size}`}>
      <span
        className={`fas fa-${props.name} has-text-${props.color}`}
        aria-hidden="true"
      ></span>
    </span>
  );
};
Icon.defaultProps = {
  color: "dark",
  size: ""
};

export const Header = (props: { alive: boolean }) => {
  const server = useSelector((state: AppState) => state.home.server);
  return (
    <nav className="navbar" role="navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href={server} target="_blank">
          <Icon
            name="cloud"
            color={props.alive ? "success" : "danger"}
            size="is-large fa-lg"
          />
          <span
            className={props.alive ? "has-text-success" : "has-text-danger"}
          >
            {props.alive ? "Online" : "Offline"}
          </span>
        </a>
        <div className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item" href="/">
              Boxes
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
