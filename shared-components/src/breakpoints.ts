export const Breakpoints = {
  phone: "(max-width: 576px)",
  mobile: "(max-width: 810px)",
  notMobile: "(min-width: 810px)",
  tablet: "(min-width: 810px) and (max-width: 1200px)",
  desktop: "(min-width: 1200px)",
  mobileTablet: "(max-width: 1200px)",
} as const;

export type Breakpoint = keyof typeof Breakpoints;
