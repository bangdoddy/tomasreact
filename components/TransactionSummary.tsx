import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart3, PieChart, TrendingUp, Wrench } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function TransactionSummary() {
  // Tool population data by status and jobsite
  const toolPopulationData = [
    { name: 'Good', value: 55000, color: '#22c55e' },
    { name: 'R1', value: 11000, color: '#f59e0b' },
    { name: 'R2', value: 5500, color: '#f97316' },
    { name: 'TA', value: 4000, color: '#ef4444' },
  ];

  // Tool population by location
  const locationData = [
    { location: 'SERA', good: 120, damaged: 22, missing: 8 },
    { location: 'HAJU', good: 110, damaged: 20, missing: 7 },
    { location: 'CHPP', good: 100, damaged: 18, missing: 7 },
    { location: 'TTPN', good: 220, damaged: 45, missing: 15 },
  ];

  // Tool population by workshop
  const workshopData = [
    { workshop: 'WS1', good: 145, r1: 28, r2: 15, ta: 12, total: 200 },
    { workshop: 'WS2', good: 132, r1: 22, r2: 12, ta: 9, total: 175 },
    { workshop: 'WS3', good: 98, r1: 18, r2: 10, ta: 8, total: 134 },
    { workshop: 'TYRE', good: 75, r1: 17, r2: 8, ta: 6, total: 106 },
  ];

  // Tool usage statistics (rental frequency)
  const toolUsageData = [
    { month: 'Jul', rentals: 145, returns: 140 },
    { month: 'Aug', rentals: 168, returns: 165 },
    { month: 'Sep', rentals: 182, returns: 180 },
    { month: 'Oct', rentals: 195, returns: 188 },
    { month: 'Nov', rentals: 210, returns: 205 },
    { month: 'Dec', rentals: 225, returns: 220 },
    { month: 'Jan', rentals: 198, returns: 190 },
  ];

  // Frequently used tool types (monthly)
  const frequentToolTypes = [
    { type: 'Power Tools', count: 485, percentage: 35 },
    { type: 'Hand Tools', count: 380, percentage: 28 },
    { type: 'Lifting Equipment', count: 245, percentage: 18 },
    { type: 'Measuring Tools', count: 165, percentage: 12 },
    { type: 'Safety Equipment', count: 95, percentage: 7 },
  ];

  const COLORS = ['#003366', '#009999', '#0088cc', '#00b4d8', '#48cae4'];

  const totalTools = toolPopulationData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl mb-1">Transaction Summary Dashboard</h1>
                <p className="text-white/80">Real-time tools inventory and usage analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tools</p>
                  <p className="text-3xl text-[#003366]">{totalTools.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Good</p>
                  <p className="text-3xl text-green-600">55,000</p>
                  <p className="text-xs text-gray-500 mt-1">72.8%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">R1</p>
                  <p className="text-3xl text-orange-600">11,000</p>
                  <p className="text-xs text-gray-500 mt-1">14.6%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">R2</p>
                  <p className="text-3xl text-orange-500">5,500</p>
                  <p className="text-xs text-gray-500 mt-1">7.3%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">TA</p>
                  <p className="text-3xl text-red-600">4,000</p>
                  <p className="text-xs text-gray-500 mt-1">5.3%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tool Population Pie Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Tool Population by Status</CardTitle>
              <CardDescription>Distribution of tools by condition status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={toolPopulationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {toolPopulationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {toolPopulationData.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <p className="text-lg" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tool Population by Location */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Tool Population by Location on Jobsite</CardTitle>
              <CardDescription>Tools breakdown across different locations on jobsites</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="good" fill="#22c55e" name="Good" />
                  <Bar dataKey="damaged" fill="#f59e0b" name="R1" />
                  <Bar dataKey="missing" fill="#ef4444" name="TA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tool Usage Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Tool Usage Statistics</CardTitle>
              <CardDescription>Monthly rental and return trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={toolUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rentals" stroke="#003366" strokeWidth={2} name="Rentals" />
                  <Line type="monotone" dataKey="returns" stroke="#009999" strokeWidth={2} name="Returns" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Frequently Used Tool Types */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Frequently Used Tool Types</CardTitle>
              <CardDescription>Most rented tool categories this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequentToolTypes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#009999">
                    {frequentToolTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tool Population by Workshop - NEW FEATURE */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tool Population by Workshop</CardTitle>
            <CardDescription>Distribution of tools across workshops (WS1, WS2, WS3, TYRE)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workshopData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workshop" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="good" fill="#22c55e" name="Good" stackId="a" />
                  <Bar dataKey="r1" fill="#f59e0b" name="R1" stackId="a" />
                  <Bar dataKey="r2" fill="#f97316" name="R2" stackId="a" />
                  <Bar dataKey="ta" fill="#ef4444" name="TA" stackId="a" />
                </BarChart>
              </ResponsiveContainer>

              {/* Workshop Statistics Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="text-left p-3 text-sm text-gray-700">Workshop</th>
                      <th className="text-center p-3 text-sm text-gray-700">Good</th>
                      <th className="text-center p-3 text-sm text-gray-700">R1</th>
                      <th className="text-center p-3 text-sm text-gray-700">R2</th>
                      <th className="text-center p-3 text-sm text-gray-700">TA</th>
                      <th className="text-center p-3 text-sm text-gray-700">Total Tools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshopData.map((ws, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center text-xs">
                              {ws.workshop}
                            </div>
                            <span className="text-sm">{ws.workshop}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                            {ws.good}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                            {ws.r1}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                            {ws.r2}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                            {ws.ta}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm">{ws.total}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td className="p-3 text-sm">Total</td>
                      <td className="p-3 text-center text-sm text-green-700">
                        {workshopData.reduce((sum, ws) => sum + ws.good, 0)}
                      </td>
                      <td className="p-3 text-center text-sm text-orange-700">
                        {workshopData.reduce((sum, ws) => sum + ws.r1, 0)}
                      </td>
                      <td className="p-3 text-center text-sm text-red-700">
                        {workshopData.reduce((sum, ws) => sum + ws.r2, 0)}
                      </td>
                      <td className="p-3 text-center text-sm text-red-700">
                        {workshopData.reduce((sum, ws) => sum + ws.ta, 0)}
                      </td>
                      <td className="p-3 text-center text-sm">
                        {workshopData.reduce((sum, ws) => sum + ws.total, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tool Types Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tool Type Usage Details</CardTitle>
            <CardDescription>Comprehensive breakdown of tool usage by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm text-gray-600">Tool Type</th>
                    <th className="text-right p-3 text-sm text-gray-600">Usage Count</th>
                    <th className="text-right p-3 text-sm text-gray-600">Percentage</th>
                    <th className="text-left p-3 text-sm text-gray-600">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {frequentToolTypes.map((tool, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{tool.type}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm">{tool.count}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-[#009999]"
                              style={{ width: `${tool.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{tool.percentage}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                          <TrendingUp className="h-3 w-3" />
                          +12%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>© 2025 Smart Tomas - Tools Management System</p>
          <p className="mt-1">Real-time data from Master Tools, Rental & Return Transactions</p>
        </div>
      </div>
    </div>
  );
}