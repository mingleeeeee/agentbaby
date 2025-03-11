import { CSSProperties, FC, ReactNode } from "react";
import { clsx } from "clsx";
import { Color, Gradient } from "./colors";

type ComponentProps = {
  kind?: TextKinds;
  children: ReactNode;
  lineClamp?: number;
  color?: Color;
  style?: CSSProperties;
  align?: "center" | "right" | "left";
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "div" | "p" | "span";
  isItalic?: boolean;
  gradient?: Gradient;
  outlined?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export type TextKinds =
  | "HeadlineXL"
  | "HeadlineL"
  | "HeadlineM"
  | "HeadlineS"
  | "HeadlineXS"
  | "BodyXL"
  | "BodyL"
  | "BodyM"
  | "BodyS"
  | "BodyXS"
  | "BodyXXS"
  | "BodyXL_Light"
  | "BodyL_Light"
  | "BodyM_Light"
  | "BodyS_Light"
  | "BodyXS_Light"
  | "BodyXXS_Light"
  | "BodyXL_Comica"
  | "BodyL_Comica"
  | "BodyM_Comica"
  | "BodyS_Comica"
  | "BodyXS_Comica"
  | "BodyXXS_Comica";

export const Texts: FC<ComponentProps> = ({
  kind = "BodyXS_Comica",
  color,
  lineClamp,
  children,
  style,
  align,
  className,
  as = "p",
  isItalic = false,
  gradient,
  outlined = false,
  ...props
}) => {
  const C = as;
  return (
    <C
      className={clsx(
        "texts",
        kind,
        lineClamp && "lineCramp",
        align && `align-${align}`,
        className,
        gradient && "gradient-text",
        outlined && "outlined-text",
      )}
      style={
        {
          ...style,
          color: color && `var(${color})`,
          WebkitLineClamp: lineClamp,
          fontStyle: isItalic ? "italic" : "normal",
          paddingRight: isItalic ? "7px" : "0px",
          backgroundImage: gradient || "none",
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </C>
  );
};
