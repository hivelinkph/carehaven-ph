"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { HealthRecord } from "@/lib/types";

interface HealthChartProps {
  records: HealthRecord[];
  vitalKey: string;
}

const CHART_COLORS: Record<string, string> = {
  blood_pressure_systolic: "#e53e3e",
  heart_rate: "#d97757",
  blood_sugar_level: "#2DD1AC",
  temperature: "#6a9bcc",
  oxygen_saturation: "#788c5d",
  weight: "#b0aea5",
  hemoglobin: "#2D3748",
  white_blood_cell_count: "#d97757",
  platelet_count: "#6a9bcc",
};

export default function HealthChart({ records, vitalKey }: HealthChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getField = (r: HealthRecord, key: string): unknown => (r as any)[key];

  const chartData = [...records]
    .reverse()
    .filter((r) => getField(r, vitalKey) != null)
    .map((r) => ({
      date: r.record_date,
      value: getField(r, vitalKey) as number,
      ...(vitalKey === "blood_pressure_systolic" && {
        diastolic: r.blood_pressure_diastolic,
      }),
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
        No data available for this vital
      </div>
    );
  }

  const color = CHART_COLORS[vitalKey] || "#2DD1AC";

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#b0aea5", fontFamily: "var(--font-ui)" }}
            tickLine={false}
            axisLine={{ stroke: "#e8e6dc" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#b0aea5", fontFamily: "var(--font-ui)" }}
            tickLine={false}
            axisLine={{ stroke: "#e8e6dc" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e8e6dc",
              borderRadius: "12px",
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 4, strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
          />
          {vitalKey === "blood_pressure_systolic" && (
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#6a9bcc"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#6a9bcc", r: 3, strokeWidth: 2, stroke: "white" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
