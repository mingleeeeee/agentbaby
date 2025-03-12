import { CSSProperties, FC, useState } from "react";
import { Color } from "@shared-components/colors";
import { iconSize, IconSize } from "@shared-components/atom/icons/iconSize";
import {
  MdClose,
  MdLanguage,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowDown,
  MdOutlineSwapVert,
} from "react-icons/md";
import { FaCheck, FaXTwitter, FaDiscord } from "react-icons/fa6";
import { BiSolidError } from "react-icons/bi";
import { LuRefreshCcw } from "react-icons/lu";
import { IoSearchOutline, IoBookOutline } from "react-icons/io5";
import {
  FaEthereum,
  FaTelegramPlane,
  FaYoutube,
  FaExclamation,
} from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import { RiGlobalFill } from "react-icons/ri";
import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { HiMiniSparkles } from "react-icons/hi2";
import { IoCopyOutline, IoImageOutline } from "react-icons/io5";
import { FaFireFlameCurved } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { CgWebsite } from "react-icons/cg";
import { CiWallet } from "react-icons/ci";

const index = {
  plant: PiPlantFill,
  fire: FaFireFlameCurved,
  copy: IoCopyOutline,
  hamburger: RxHamburgerMenu,
  language: MdLanguage,
  close: MdClose,
  success: FaCheck,
  error: BiSolidError,
  website: CgWebsite,
  twitter: FaXTwitter,
  youtube: FaYoutube,
  telegram: FaTelegramPlane,
  discord: FaDiscord,
  refresh: LuRefreshCcw,
  arrowUp: TiArrowSortedUp,
  arrowDown: TiArrowSortedDown,
  doubleArrowLeft: MdOutlineKeyboardDoubleArrowLeft,
  arrowLeft: MdOutlineKeyboardArrowLeft,
  doubleArrowRight: MdOutlineKeyboardDoubleArrowRight,
  arrowRight: MdOutlineKeyboardArrowRight,
  search: IoSearchOutline,
  doubleArrowDown: MdKeyboardDoubleArrowDown,
  eth: FaEthereum,
  global: RiGlobalFill,
  squareArrowOutUpRight: LuSquareArrowOutUpRight,
  sparkles: HiMiniSparkles,
  bookOutline: IoBookOutline,
  swap: MdOutlineSwapVert,
  upload: IoImageOutline,
  wallet: CiWallet,
  exclamation: FaExclamation,
};

export type IconName = keyof typeof index | "none";
type Props = {
  icon: IconName;
  size: IconSize;
  color?: Color;
  className?: string;
  style?: CSSProperties;
  hoverColor?: Color;
} & React.HTMLAttributes<SVGElement>;

export const Icon: FC<Props> = ({
  icon,
  size,
  color,
  className,
  style,
  hoverColor,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  if (icon == "none") {
    return null;
  }
  const Icon = index[icon];
  return (
    <Icon
      size={iconSize[size]}
      className={className}
      style={{
        ...style,
        color: color
          ? isHovered && hoverColor
            ? `var(${hoverColor})`
            : `var(${color})`
          : "fff",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  );
};
