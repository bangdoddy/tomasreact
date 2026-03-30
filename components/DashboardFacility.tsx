import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, Building2 } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardFacility() {
  // Facility population data by status and jobsite
  const facilityPopulationData = [
    { name: 'Good', value: 51300, color: '#22c55e' },
    { name: 'R1', value: 7300, color: '#f59e0b' },
    { name: 'R2', value: 1800, color: '#f97316' },
    { name: 'TA', value: 300, color: '#ef4444' },
  ];

  // Facility population by location
  const locationData = [
    { location: '40AD', good: 120, damaged: 22, missing: 8 },
    { location: '40AC', good: 110, damaged: 20, missing: 7 },
    { location: '40AI', good: 100, damaged: 18, missing: 7 },
    { location: '40AB', good: 220, damaged: 45, missing: 15 },
  ];

  // Facility population by workshop
  const workshopData = [
    { workshop: 'WS1', good: 145, r1: 28, r2: 15, ta: 12, total: 200 },
    { workshop: 'WS2', good: 132, r1: 22, r2: 12, ta: 9, total: 175 },
    { workshop: 'WS3', good: 98, r1: 18, r2: 10, ta: 8, total: 134 },
    { workshop: 'TYRE', good: 75, r1: 17, r2: 8, ta: 6, total: 106 },
  ];

  // Facility usage statistics (rental frequency)
  const facilityUsageData = [
    { month: 'Jul', rentals: 145, returns: 140 },
    { month: 'Aug', rentals: 168, returns: 165 },
    { month: 'Sep', rentals: 182, returns: 180 },
    { month: 'Oct', rentals: 195, returns: 188 },
    { month: 'Nov', rentals: 210, returns: 205 },
    { month: 'Dec', rentals: 225, returns: 220 },
    { month: 'Jan', rentals: 198, returns: 190 },
  ];

  // Frequently used facility types (monthly)
  const frequentFacilityTypes = [
    { type: 'Power Facilities', count: 485 },
    { type: 'Hand Facilities', count: 380 },
    { type: 'Lifting Equip', count: 245 },
    { type: 'Measuring', count: 165 },
    { type: 'Safety Equip', count: 95 },
  ];

  // Budget/Spending data
  const spendingData = [
    { department: 'Mining', amount: 3.4 },
    { department: 'Design', amount: 2.8 },
    { department: 'Hauling', amount: 2.5 },
    { department: 'Testing', amount: 1.8 },
    { department: 'Delivery', amount: 1.2 },
  ];

  const COLORS = ['#003366', '#009999', '#0088cc', '#00b4d8', '#48cae4'];

  const totalFacilities = facilityPopulationData.reduce((sum, item) => sum + item.value, 0);

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
              <h2 className="text-base text-white">Transaction Summary Dashboard</h2>
              <p className="text-xs text-white/80">Real-time facilities inventory and usage analytics</p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <Building2 className="h-4 w-4 text-white" />
          </div>
        </div>
        
        {/* Inline Key Metrics */}
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Total Facilities</p>
            <p className="text-lg text-white">{totalFacilities.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Good</p>
            <p className="text-lg text-white">51,300</p>
            <p className="text-xs text-white/60">85.1%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">R1</p>
            <p className="text-lg text-white">7,300</p>
            <p className="text-xs text-white/60">12.1%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">R2</p>
            <p className="text-lg text-white">1,800</p>
            <p className="text-xs text-white/60">3.0%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">TA</p>
            <p className="text-lg text-white">300</p>
            <p className="text-xs text-white/60">0.5%</p>
          </div>
        </div>
      </div>

      {/* Row 1 - 3 Charts */}
      <div className="grid grid-cols-3 gap-2">
        {/* Facility Population Pie Chart */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Facility Population by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <RechartsPie>
                <Pie
                  data={facilityPopulationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {facilityPopulationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facility Usage Line Chart */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Facility Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={facilityUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Line type="monotone" dataKey="rentals" stroke="#003366" strokeWidth={2} name="Rentals" dot={false} />
                <Line type="monotone" dataKey="returns" stroke="#009999" strokeWidth={2} name="Returns" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frequently Used Facilities - Horizontal Bar */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Average Days per Task</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={frequentFacilityTypes.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="type" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#003366" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - 3 Charts */}
      <div className="grid grid-cols-3 gap-2">
        {/* Facility Population by Location */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Facility Population by Location</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="location" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="good" fill="#22c55e" name="Good" radius={[4, 4, 0, 0]} />
                <Bar dataKey="damaged" fill="#f59e0b" name="R1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="missing" fill="#ef4444" name="TA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facility Population by Workshop */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Facility Population by Workshop</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={workshopData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="workshop" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="good" fill="#22c55e" name="Good" stackId="a" />
                <Bar dataKey="r1" fill="#f59e0b" name="R1" stackId="a" />
                <Bar dataKey="r2" fill="#f97316" name="R2" stackId="a" />
                <Bar dataKey="ta" fill="#ef4444" name="TA" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending by Department - Horizontal Bar */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Spend by Department</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={spendingData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="department" type="category" width={60} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#009999" radius={[0, 4, 4, 0]}>
                  {spendingData.map((entry, index) => (
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
          <CardTitle className="text-xs">Workshop Facilities Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-1.5 text-xs">Workshop</th>
                  <th className="text-center p-1.5 text-xs">Good</th>
                  <th className="text-center p-1.5 text-xs">R1</th>
                  <th className="text-center p-1.5 text-xs">R2</th>
                  <th className="text-center p-1.5 text-xs">TA</th>
                  <th className="text-center p-1.5 text-xs">Total</th>
                  <th className="text-center p-1.5 text-xs">% Good</th>
                </tr>
              </thead>
              <tbody>
                {workshopData.map((ws, index) => (
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
                        {ws.good}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {ws.r1}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {ws.r2}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                        {ws.ta}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-xs">{ws.total}</td>
                    <td className="p-1.5 text-center">
                      <span className="text-xs text-green-700">
                        {((ws.good / ws.total) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="p-1.5 text-xs">Total</td>
                  <td className="p-1.5 text-center text-green-700 text-xs">
                    {workshopData.reduce((sum, ws) => sum + ws.good, 0)}
                  </td>
                  <td className="p-1.5 text-center text-orange-700 text-xs">
                    {workshopData.reduce((sum, ws) => sum + ws.r1, 0)}
                  </td>
                  <td className="p-1.5 text-center text-orange-700 text-xs">
                    {workshopData.reduce((sum, ws) => sum + ws.r2, 0)}
                  </td>
                  <td className="p-1.5 text-center text-red-700 text-xs">
                    {workshopData.reduce((sum, ws) => sum + ws.ta, 0)}
                  </td>
                  <td className="p-1.5 text-center text-xs">
                    {workshopData.reduce((sum, ws) => sum + ws.total, 0)}
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
