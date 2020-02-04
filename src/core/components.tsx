import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "./";

interface IconProps {
  name: string;
  color: string;
  size: number;
}
export const Icon = (props: IconProps) => {
  return (
    <span style={{ fontSize: `${props.size}em`, marginRight: "5px" }}>
      <span
        className={`icon ion-ios-${props.name} text-${props.color}`}
        aria-hidden="true"
      ></span>
    </span>
  );
};
Icon.defaultProps = {
  color: "dark",
  size: 1
};

export const Header = (props: { alive: boolean }) => {
  const server = useSelector((state: AppState) => state.home.server);
  return (
    <header className="p-navigation">
      <div className="p-navigation__row">
        <div className="p-navigation__banner">
          <div className="p-navigation__logo">
            <a
              className="p-navigation__link u-vertically-center"
              href={server}
              target="_blank"
            >
              <i
                style={{ marginRight: "5px" }}
                className={props.alive ? "p-icon--success" : "p-icon--error"}
              />
              Online
            </a>
          </div>
        </div>
        <ul className="p-navigation__links" role="menu">
          <li className="p-navigation__link is-selected" role="menuitem">
            <a href="/">Boxes</a>
          </li>
        </ul>
      </div>
    </header>
  );
};
