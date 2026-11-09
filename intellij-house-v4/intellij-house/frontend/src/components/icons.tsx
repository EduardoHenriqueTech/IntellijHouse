import type { ReactNode, SVGProps } from "react";

function Svg({ children, strokeWidth = 1.5, ...resto }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true" {...resto}>
      {children}
    </svg>
  );
}

export const IconDashboard = () => (
  <Svg><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="11" width="7" height="10" rx="2" /><rect x="3" y="14" width="8" height="7" rx="2" /></Svg>
);
export const IconDevices = () => (
  <Svg><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M9 7h6M9 17h6" /></Svg>
);
export const IconAssistant = () => (
  <Svg><rect x="3" y="7" width="18" height="13" rx="4" /><path d="M12 3v4M8 13h.01M16 13h.01M9 17h6" /></Svg>
);
export const IconRooms = () => (
  <Svg><path d="M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16M3 21h18M9 21v-6h6v6M8 8h.01M16 8h.01" /></Svg>
);
export const IconActivity = () => (
  <Svg><path d="M4 19V5m0 14h17M7 15l4-4 3 2 6-7" /></Svg>
);
export const IconRoutine = () => (
  <Svg><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const IconAdmin = () => (
  <Svg><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></Svg>
);
export const IconRefresh = () => (
  <Svg strokeWidth={1.6}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" /></Svg>
);
