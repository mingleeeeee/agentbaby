"use client";
import { ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";
import styles from "./Image.module.scss";
import clsx from "clsx";

type ImgProps = ComponentPropsWithoutRef<"img">;

type BaseProps = Pick<ImgProps, "style" | "loading" | "onLoad"> & {
  alt: string;
  src: string;
  className?: string;
  style?: CSSProperties;
};

type PropsWithDimensions = BaseProps & {
  width: string;
  height: string;
  fill?: false;
};

type PropsWithFill = BaseProps & {
  fill: true;
  width?: never;
  height?: never;
};

type Props = PropsWithDimensions | PropsWithFill;

export const Image = forwardRef<HTMLImageElement, Props>((props, ref) => {
  const { fill, src, alt, style, className, ...rest } = props;
  const combinedStyle = {
    ...style,
    ...(fill ? {} : { width: props.width, height: props.height }),
  };
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      className={clsx(className, fill && styles.fillImage)}
      loading="lazy"
      style={combinedStyle}
    />
  );
});
Image.displayName = "Image";
