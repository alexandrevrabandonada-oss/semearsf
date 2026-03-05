import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type MeasurementsChartPoint = {
  ts: string;
  pm25: number | null;
  pm10: number | null;
};

type MeasurementsChartProps = {
  data: MeasurementsChartPoint[];
  showPM25: boolean;
  showPM10: boolean;
};

export function MeasurementsChart({ data, showPM25, showPM10 }: MeasurementsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="ts" tick={{ fontSize: 12 }} stroke="#6b7280" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          label={{ value: "µg/m³", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            fontSize: "12px"
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
        {showPM25 ? (
          <Line
            type="monotone"
            dataKey="pm25"
            stroke="#10b981"
            strokeWidth={2}
            name="PM2.5 (µg/m³)"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ) : null}
        {showPM10 ? (
          <Line
            type="monotone"
            dataKey="pm10"
            stroke="#f59e0b"
            strokeWidth={2}
            name="PM10 (µg/m³)"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );
}
