"use client";

import * as React from "react";
import type { TooltipProps } from "recharts";
import type {
  Payload as RechartsPayload,
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

type PayloadItem = RechartsPayload<ValueType, NameType> & {
  payload?: Record<string, unknown>;
};

// utilitário para classes
function joinClass(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

type ChartTooltipContentProps = TooltipProps<ValueType, NameType> & {
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelClassName?: string;
  payload?: Array<PayloadItem> | undefined;
  label?: string | number;
  name?: string | number;
};

export default function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  name,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const hasPayload = Array.isArray(payload) && payload.length > 0;

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !hasPayload) return null;

    const first = payload![0] as PayloadItem;
    const key = (labelKey ||
      first?.dataKey ||
      first?.name ||
      "value") as string;

    let titleValue: React.ReactNode | null = null;

    if (!labelKey && typeof label === "string") {
      titleValue = label;
    } else {
      const candidate =
        first?.payload?.[key] ??
        (typeof first === "object" && key in first
          ? (first as Record<string, unknown>)[key]
          : null);

      titleValue = candidate as React.ReactNode;
    }

    if (labelFormatter) {
      try {
        return (
          <div className={joinClass("font-medium", labelClassName)}>
            {labelFormatter(titleValue, payload)}
          </div>
        );
      } catch {
        return (
          <div className={joinClass("font-medium", labelClassName)}>
            {String(titleValue)}
          </div>
        );
      }
    }

    if (!titleValue) return null;
    return (
      <div className={joinClass("font-medium", labelClassName)}>
        {titleValue}
      </div>
    );
  }, [
    hideLabel,
    hasPayload,
    payload,
    label,
    labelFormatter,
    labelClassName,
    labelKey,
  ]);

  if (!active || !hasPayload) return null;
  return (
    <div
      className={joinClass(
        "rounded-md border bg-white px-3 py-2 text-sm shadow-md",
        className
      )}
    >
      {tooltipLabel}

      <div className="mt-1 flex flex-col gap-1">
        {payload!.map((rawItem, index) => {
          const item = rawItem as PayloadItem;

          // ✔ sem any — acesso seguro
          const resolvedName =
            (nameKey &&
              (item.payload?.[nameKey] ??
                (typeof item === "object" && item !== null && nameKey in item
                  ? (item as Record<string, unknown>)[nameKey]
                  : undefined))) ??
            item.name ??
            item.dataKey ??
            name ??
            index;

          const value = item.value;

          // ✔ sem any — acesso seguro ao fill
          const color =
            item.color ??
            (typeof item.payload === "object" &&
            item.payload &&
            "fill" in item.payload
              ? item.payload.fill
              : undefined);

          const indicatorNode = !hideIndicator ? (
            <span
              style={{
                display: "inline-block",
                width: indicator === "dot" ? 10 : 24,
                height: indicator === "dot" ? 10 : 4,
                borderRadius: indicator === "dot" ? 9999 : 2,
                background: color,
                border:
                  indicator === "dashed"
                    ? "1px dashed rgba(0,0,0,0.2)"
                    : undefined,
                marginRight: 8,
              }}
            />
          ) : null;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {indicatorNode}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div style={{ color: "rgba(0,0,0,0.7)" }}>
                  {resolvedName as React.ReactNode}
                </div>

                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 600,
                  }}
                >
                  {formatter
                    ? formatter(
                        value ?? "",
                        resolvedName,
                        item,
                        index,
                        payload!
                      )
                    : typeof value === "number"
                    ? value.toLocaleString()
                    : value !== undefined
                    ? String(value)
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
