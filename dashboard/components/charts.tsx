"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CountDatum } from "@/lib/aggregate";
import { Emotion, EMOTION_COLORS } from "@/lib/types";

function tip() {
  return {
    background: "rgba(20,20,28,0.95)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "#f4f4f6",
    fontSize: 12,
  };
}

export function EmotionBar({ data }: { data: CountDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={108}
          tick={{ fill: "#cfcfe0", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tip()}
          cursor={{ fill: "#ffffff0a" }}
          formatter={(v: number, _n, p: any) => [`${v} tweets (${p.payload.pct}%)`, "Count"]}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
          {data.map((d) => (
            <Cell key={d.key} fill={EMOTION_COLORS[d.key as Emotion] || "#818cf8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EmotionDonut({ data }: { data: CountDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip
          contentStyle={tip()}
          formatter={(v: number, _n, p: any) => [`${v} (${p.payload.pct}%)`, p.payload.label]}
        />
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={66} outerRadius={108} paddingAngle={2} stroke="#07070b">
          {data.map((d) => (
            <Cell key={d.key} fill={EMOTION_COLORS[d.key as Emotion] || "#818cf8"} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ClickableBar({
  data,
  selected,
  onSelect,
  colorOf,
}: {
  data: CountDatum[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  colorOf?: (key: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          tick={{ fill: "#cfcfe0", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tip()}
          cursor={{ fill: "#ffffff0a" }}
          formatter={(v: number, _n, p: any) => [`${v} tweets (${p.payload.pct}%)`, "Count"]}
        />
        <Bar
          dataKey="count"
          radius={[0, 8, 8, 0]}
          barSize={26}
          cursor="pointer"
          onClick={(d: any) => onSelect(selected === d.key ? null : d.key)}
        >
          {data.map((d) => (
            <Cell
              key={d.key}
              fill={colorOf ? colorOf(d.key) : "#a855f7"}
              fillOpacity={selected && selected !== d.key ? 0.3 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
