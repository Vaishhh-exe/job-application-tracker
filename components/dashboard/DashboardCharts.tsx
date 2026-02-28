import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from 'next-themes';

const STATUS_COLORS: Record<string, string> = {
  applied: '#3B82F6', // blue
  interview: '#FBBF24', // amber
  offer: '#10B981', // emerald
  rejected: '#EF4444', // red
  ghosted: '#8B5CF6', // violet
};

export function DashboardCharts({ monthlyTrend, statusDistribution }: {
  monthlyTrend: { month: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Filter out statuses with 0 count for cleaner pie chart
  const filteredStatusDistribution = statusDistribution.filter((item) => item.count > 0);

  const tooltipStyle = {
    backgroundColor: isDark ? '#1F2937' : '#ffffff',
    border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
    borderRadius: '8px',
    color: isDark ? '#fff' : '#1f2937'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Line Chart: Monthly Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow dark:shadow-lg border dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Applications per Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={monthlyTrend}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="month" 
              stroke="#888"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              allowDecimals={false} 
              stroke="#888"
              style={{ fontSize: '12px' }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Status Distribution */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow dark:shadow-lg border dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Status Distribution</h3>
        {filteredStatusDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={filteredStatusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {filteredStatusDistribution.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status] || '#888'} />
                ))}
              </Pie>
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                itemStyle={{ color: isDark ? '#fff' : '#1f2937' }}
                formatter={(value) => `${value} application${value !== 1 ? 's' : ''}`}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No application data available
          </div>
        )}
      </div>
    </div>
  );
}
