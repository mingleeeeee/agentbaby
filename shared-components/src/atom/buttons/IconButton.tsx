import { FC } from "react";
import { Icon } from "@shared-components/atom/icons/Icons";
import { Texts, TextKinds } from "@shared-components/Texts";
import { Button } from "@shared-components/atom/buttons/Button";
import { Color } from "@shared-components/colors";
import styles from "./Button.module.scss";
import { IconName } from "@shared-components/atom/icons/Icons";
import { IconSize } from "../icons/iconSize";

type Props = {
  height?: string;
  backgroundColor?: Color;
  border?: string;
  fontKind?: TextKinds;
  onClick: () => void;
  fontColor?: Color;
  iconColor?: Color;
  title: string;
  disabled?: boolean;
  iconPosition: "left" | "right";
  iconName: IconName;
  iconSize?: IconSize;
  padding?: string;
  disabledColor?: Color;
  disabledFontColor?: Color;
  disabledIconColor?: Color;
};

export const IconButton: FC<Props> = ({
  onClick,
  height = "4rem",
  backgroundColor = "--color-Primary",
  border = "0rem solid var(----color-Transparent)",
  fontKind = "BodyXS_Light",
  fontColor = "--color-Primary",
  iconColor = "--color-Primary",
  title,
  disabled,
  iconPosition,
  iconName,
  iconSize = "s",
  padding = "0 2.4rem",
  disabledColor,
  disabledFontColor,
  disabledIconColor,
}) => {
  const iconElement = (
    <Icon
      icon={iconName}
      size={iconSize}
      color={disabled && disabledIconColor ? disabledIconColor : iconColor}
    />
  );

  return (
    <Button
      padding={padding}
      borderRadius="1.2rem"
      backgroundColor={backgroundColor}
      border={border}
      width="fit-content"
      height={height}
      className={styles.iconButton}
      onClick={onClick}
      disabled={disabled}
      disabledColor={disabledColor}
    >
      {" "}
      {iconPosition === "left" && iconElement}
      <Texts
        kind={fontKind}
        color={disabled && disabledFontColor ? disabledFontColor : fontColor}
      >
        {title}
      </Texts>
      {iconPosition === "right" && iconElement}
    </Button>
  );
};
