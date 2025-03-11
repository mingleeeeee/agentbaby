import { ValueOf } from "type-fest";

export type Color =
  | "--color-Primary"
  | "--color-White"
  | "--color-Black"
  | "--color-Black2"
  | "--color-Error"
  | "--color-Transparent"
  | "--color-Border"
  | "--color-Border2"
  | "--color-Orange"
  | "--color-TextGray"
  | "--color-TextDarkGray"
  | "--color-TextDarkGray2"
  | "--color-TextGreen"
  | "--color-TextGreen2"
  | "--color-Grey900"
  | "--color-Grey700"
  | "--color-Grey600"
  | "--color-Grey500"
  | "--color-Grey400"
  | "--color-Grey300"
  | "--color-Grey200"
  | "--color-Grey100"
  | "--color-Grey000"
  | "--color-Background"
  | "--color-Secondary"
  | "--color-ButtonWhiteText"
  | "--color-ButtonBackground"
  | "--color-ButtonGreen"
  | "--color-ButtonBlue"
  | "--color-ButtonPink"
  | "--color-SoftRed";

export const Gradients = {
  Primary:
    "linear-gradient(to right, rgba(52, 232, 158, 0.3), rgba(239, 247, 215, 1))",
  Tertiary: "linear-gradient(to bottom, #B5B7B4, #7B8AC9)",
  Pink: "linear-gradient(to right, #E7692C, #EC8AEF)",
};
export type Gradient = ValueOf<typeof Gradients>;
