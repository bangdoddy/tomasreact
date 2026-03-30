import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, Wrench } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AcvInspectionWorkshop() {
  // Workshop inspection data by status
  const inspectionStatusData = [
    { name: 'Passed', value: 28, color: '#22c55e' },
    { name: 'Conditional', value: 7, color: '#f59e0b' },
    { name: 'Failed', value: 3, color: '#ef4444' },
    { name: 'Pending', value: 2, color: '#94a3b8' },
  ];

  // Inspection by workshop
  const workshopData = [
    { workshop: 'WS-A', passed: 8, conditional: 2, failed: 1 },
    { workshop: 'WS-B', passed: 7, conditional: 1, failed: 0 },
    { workshop: 'WS-C', passed: 6, conditional: 2, failed: 1 },
    { workshop: 'WS-D', passed: 7, conditional: 2, failed: 1 },
  ];

  // Workshop inspection scores
  const workshopScoreData = [
    { workshop: 'WS-A', passed: 8, conditional: 2, failed: 1, pending: 0, total: 11 },
    { workshop: 'WS-B', passed: 7, conditional: 1, failed: 0, pending: 1, total: 9 },
    { workshop: 'WS-C', passed: 6, conditional: 2, failed: 1, pending: 0, total: 9 },
    { workshop: 'WS-D', passed: 7, conditional: 2, failed: 1, pending: 1, total: 11 },
  ];

  // Monthly inspection trend
  const monthlyTrendData = [
    { month: 'Jul', passed: 25, failed: 3 },
    { month: 'Aug', passed: 27, failed: 2 },
    { month: 'Sep', passed: 26, failed: 3 },
    { month: 'Oct', passed: 29, failed: 2 },
    { month: 'Nov', passed: 28, failed: 1 },
    { month: 'Dec', passed: 30, failed: 2 },
    { month: 'Jan', passed: 28, failed: 3 },
  ];

  // Inspection areas
  const inspectionAreasData = [
    { area: 'Equipment', score: 92 },
    { area: 'Safety', score: 88 },
    { area: 'Cleanliness', score: 85 },
    { area: 'Organization', score: 90 },
    { area: 'Compliance', score: 87 },
  ];

  // Inspector performance
  const inspectorData = [
    { inspector: 'John S.', count: 12 },
    { inspector: 'Jane D.', count: 10 },
    { inspector: 'Mike J.', count: 9 },
    { inspector: 'Sarah W.', count: 7 },
  ];

  const COLORS = ['#003366', '#009999', '#0088cc', '#00b4d8', '#48cae4'];

  const totalInspections = inspectionStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-2 pb-2">
      {/* Compact Header with Metrics */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-lg p-3 text-white shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base text-white">ACV Inspection Workshop Dashboard</h2>
              <p className="text-xs text-white/80">Workshop inspection status and performance metrics</p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <Wrench className="h-4 w-4 text-white" />
          </div>
        </div>
        
        {/* Inline Key Metrics */}
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Total Inspections</p>
            <p className="text-lg text-white">{totalInspections}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Passed</p>
            <p className="text-lg text-white">28</p>
            <p className="text-xs text-white/60">70%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Conditional</p>
            <p className="text-lg text-white">7</p>
            <p className="text-xs text-white/60">17.5%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Failed</p>
            <p className="text-lg text-white">3</p>
            <p className="text-xs text-white/60">7.5%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Pending</p>
            <p className="text-lg text-white">2</p>
            <p className="text-xs text-white/60">5%</p>
          </div>
        </div>
      </div>

      {/* Row 1 - 3 Charts */}
      <div className="grid grid-cols-3 gap-2">
        {/* Inspection Status Pie Chart */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Inspection Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <RechartsPie>
                <Pie
                  data={inspectionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inspectionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Monthly Inspection Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Line type="monotone" dataKey="passed" stroke="#003366" strokeWidth={2} name="Passed" dot={false} />
                <Line type="monotone" dataKey="failed" stroke="#009999" strokeWidth={2} name="Failed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inspection Areas - Horizontal Bar */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Inspection Areas Score</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={inspectionAreasData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="area" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#003366" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - 3 Charts */}
      <div className="grid grid-cols-3 gap-2">
        {/* Inspection by Workshop */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Inspection by Workshop</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={workshopData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="workshop" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="passed" fill="#22c55e" name="Passed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conditional" fill="#f59e0b" name="Conditional" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workshop Inspection Scores */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Workshop Inspection Scores</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={workshopScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="workshop" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="passed" fill="#22c55e" name="Passed" stackId="a" />
                <Bar dataKey="conditional" fill="#f59e0b" name="Conditional" stackId="a" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" stackId="a" />
                <Bar dataKey="pending" fill="#94a3b8" name="Pending" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inspector Performance - Horizontal Bar */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Inspector Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={inspectorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="inspector" type="category" width={60} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#009999" radius={[0, 4, 4, 0]}>
                  {inspectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Workshop Summary Table (Very Compact) */}
      <Card className="border-0 shadow">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs">Workshop Inspection Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-1.5 text-xs">Workshop</th>
                  <th className="text-center p-1.5 text-xs">Passed</th>
                  <th className="text-center p-1.5 text-xs">Conditional</th>
                  <th className="text-center p-1.5 text-xs">Failed</th>
                  <th className="text-center p-1.5 text-xs">Pending</th>
                  <th className="text-center p-1.5 text-xs">Total</th>
                  <th className="text-center p-1.5 text-xs">% Passed</th>
                </tr>
              </thead>
              <tbody>
                {workshopScoreData.map((ws, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-[#003366] text-white flex items-center justify-center text-xs">
                          {ws.workshop.substring(0, 2)}
                        </div>
                        <span className="text-xs">{ws.workshop}</span>
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        {ws.passed}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {ws.conditional}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                        {ws.failed}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {ws.pending}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-xs">{ws.total}</td>
                    <td className="p-1.5 text-center">
                      <span className="text-xs text-green-700">
                        {((ws.passed / ws.total) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="p-1.5 text-xs">Total</td>
                  <td className="p-1.5 text-center text-green-700 text-xs">
                    {workshopScoreData.reduce((sum, ws) => sum + ws.passed, 0)}
                  </td>
                  <td className="p-1.5 text-center text-orange-700 text-xs">
                    {workshopScoreData.reduce((sum, ws) => sum + ws.conditional, 0)}
                  </td>
                  <td className="p-1.5 text-center text-red-700 text-xs">
                    {workshopScoreData.reduce((sum, ws) => sum + ws.failed, 0)}
                  </td>
                  <td className="p-1.5 text-center text-gray-700 text-xs">
                    {workshopScoreData.reduce((sum, ws) => sum + ws.pending, 0)}
                  </td>
                  <td className="p-1.5 text-center text-xs">
                    {workshopScoreData.reduce((sum, ws) => sum + ws.total, 0)}
                  </td>
                  <td className="p-1.5 text-center text-xs">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
