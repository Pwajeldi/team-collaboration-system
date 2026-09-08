import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import "../../styles/taskActivityChart.css"
import type { TaskActivityDto } from "../../types/types";

const formatDay = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(undefined, { weekday: "short" });

type TaskActivityChartProps = {
    data: TaskActivityDto[]
}

const TaskActivityChart = ({data}: TaskActivityChartProps) => {

    return (
        <div className="task-activity-card">
            <p className="task-activity-title">Task Activity — Last 7 Days</p>
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data ?? []} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDay}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        labelFormatter={(value) =>
                            new Date(value as string).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        }
                        contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                        type="monotone"
                        dataKey="created"
                        name="Created"
                        stroke="#6264a7"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="completed"
                        name="Completed"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="due"
                        name="Due"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TaskActivityChart;