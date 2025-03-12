import { FC, ReactNode } from "react";
import { Texts } from "@shared-components/Texts";
import styles from "./Modal.module.scss";
import { Icon } from "../icons/Icons";
import clsx from "clsx";
import { Color } from "@shared-components/colors";

type Props = {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  fullPage: boolean;
  backgroundColor?: Color;
  scrollbarThumbColor?: Color;
  scrollbarTrackColor?: Color;
  showCloseButton?: boolean;
};

export const Modal: FC<Props> = ({
  onClose,
  children,
  title,
  fullPage,
  backgroundColor = "--color-White",
  scrollbarThumbColor = "--color-Primary",
  scrollbarTrackColor = "--color-Border",
  showCloseButton = true,
}) => {
  const mainStyle = {
    background: `var(${backgroundColor})`,
  };

  const childrenStyle = {
    "--scrollbar-thumb": `var(${scrollbarThumbColor})`,
    "--scrollbar-track": `var(${scrollbarTrackColor})`,
  } as React.CSSProperties;

  return (
    <div className={styles.modal}>
      <div
        className={clsx(styles.modalContent, fullPage && styles.fullPage)}
        style={mainStyle}
      >
        <div className={styles.modalHeader}>
          {title && (
            <Texts
              kind="BodyL_Comica"
              color="--color-Black"
              style={{ flex: 1 }}
            >
              {title}
            </Texts>
          )}{" "}
          {showCloseButton && (
            <div onClick={() => onClose()} style={{ cursor: "pointer" }}>
              <Icon icon="close" size="s" color="--color-Black" />
            </div>
          )}
        </div>
        <div className={styles.modalChildren} style={childrenStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};
