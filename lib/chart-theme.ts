export const CHART_PRIMARY = "#00AEEF";
export const CHART_AXIS_COLOR = "#6B9AA8";
export const CHART_LABEL_COLOR = "#1B3F4B";
export const CHART_GRID_CLASS = "stroke-border/30";
export const CHART_BAR_RADIUS: [number, number, number, number] = [6, 6, 0, 0];
export const CHART_BAR_RADIUS_HORIZONTAL: [number, number, number, number] = [
  0, 6, 6, 0,
];
export const CHART_DESKTOP_HEIGHT = 340;
export const CHART_MOBILE_BAR_HEIGHT = 36;
export const CHART_DESKTOP_MARGIN = { top: 20, right: 12, left: 4, bottom: 20 };
export const CHART_MOBILE_MARGIN = { top: 4, right: 28, left: 4, bottom: 4 };

export function formatChartCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return String(value);
}

export function chartPercentOfTotal(value: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
