import type { CSSProperties } from "react";

export function getStageColumnStyle(color: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 14%, white)`,
    borderColor: `color-mix(in srgb, ${color} 38%, white)`,
  };
}
