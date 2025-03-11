"use client";
import React, { FC, ReactNode } from "react";
import { Color, Gradient } from "@shared-components/colors";

type Props = {
  width?: string;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  fetching?: boolean;
  type?: "submit" | "reset";
  className?: string;
  borderRadius?: string;
  backgroundColor?: Color | Gradient;
  padding?: string;
  loaderColor?: Color;
  border?: string;
  height?: string;
  disabledColor?: Color;
  boxShadow?: string;
};

export const Button: FC<Props> = ({
  children,
  fetching,
  onClick,
  width,
  disabled,
  backgroundColor,
  borderRadius,
  border,
  padding,
  height,
  disabledColor,
  boxShadow,
  ...props
}) => {
  const mainStyle = {
    width: width ?? "fit-content",
    boxShadow: boxShadow ?? "none",
    "--padding": padding ?? "12px 16px",
    background:
      disabled && disabledColor
        ? `var(${disabledColor})`
        : backgroundColor?.startsWith("--color-")
        ? `var(${backgroundColor})`
        : backgroundColor ?? `var(--color-Primary)`,
    "--border-radius": borderRadius ?? "0px",
    "--border": border && border,
    "--height": height ?? "fit-content",
  };

  return (
    <button
      onClick={() => {
        if (fetching || !onClick) return;
        onClick();
      }}
      disabled={disabled}
      style={mainStyle}
      {...props}
    >
      {fetching ? <>loading...</> : <>{children}</>}
    </button>
  );
};
