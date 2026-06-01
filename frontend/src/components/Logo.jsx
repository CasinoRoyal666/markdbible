import React from "react";
import logoSvg from "../assets/logo.svg";

const Logo = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "4rem",
    md: "6.5rem",
    lg: "10rem",
    xl: "15rem",
  };

  const dimension = sizes[size] || sizes.md;

  return (
    <img
      src={logoSvg}
      alt="MarkDBible"
      className={`logo-container ${className}`}
      style={{
        height: dimension,
        width: "auto",
        display: "block",
      }}
    />
  );
};

export default Logo;
