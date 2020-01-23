import React from "react";

// Available icons: https://fontawesome.com/icons?d=listing&s=solid&m=free
interface IconProps {
  name: string;
  color: string;
  size: number;
}
export const Icon = (props: IconProps) => {
  return (
    <span style={{ fontSize: `${props.size}em` }}>
      <span
        className={`fas fa-${props.name} text-${props.color}`}
        aria-hidden="true"
      ></span>
    </span>
  );
};
Icon.defaultProps = {
  color: "dark",
  size: 1
};

export const Header = () => {
  return (
    <header className="p-navigation">
      <div className="navigation__row">
        <ul className="p-navigation__links" role="menu">
          <li className="p-navigation__link is-selected" role="menuitem">
            <a href="#">Home</a>
          </li>
        </ul>
      </div>
    </header>
  );
};
