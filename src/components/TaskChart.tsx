"use client";

import { useTaskStore } from "@/store/taskStore";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const COLORS = {
  "todo": "#f43f5e",        // rose-500
  "in-progress": "#f59e0b", // amber-500
  "done": "#10b981",        // emerald-500
};

export default function TaskChart() {
  const { tasks, loadingTasks } = useTaskStore();

  if (loadingTasks) {
    return <div className="h-64 flex items-center justify-center text-slate-500">Loading chart...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
        No data to display
      </div>
    );
  }

  // Aggregate data
  const dataMap = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: "To Do", value: dataMap["todo"] || 0, fill: COLORS["todo"] },
    { name: "In Progress", value: dataMap["in-progress"] || 0, fill: COLORS["in-progress"] },
    { name: "Done", value: dataMap["done"] || 0, fill: COLORS["done"] },
  ].filter(item => item.value > 0);

  return (
    <div className="h-72 w-full">
      <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Tasks by Status</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, "Tasks"]} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
