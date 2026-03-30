import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, Building2 } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function FacilityPopulation() {
  // Facility population data by status
  const facilityPopulationData = [
    { name: 'Operational', value: 45, color: '#22c55e' },
    { name: 'Maintenance', value: 8, color: '#f59e0b' },
    { name: 'Under Repair', value: 5, color: '#f97316' },
    { name: 'Offline', value: 2, color: '#ef4444' },
  ];

  // Facility population by location
  const locationData = [
    { location: '40AD', operational: 15, maintenance: 2, offline: 1 },
    { location: '40AC', operational: 12, maintenance: 3, offline: 0 },
    { location: '40AI', operational: 10, maintenance: 2, offline: 1 },
    { location: '40AB', operational: 8, maintenance: 1, offline: 0 },
  ];

  // Facility population by type
  const facilityTypeData = [
    { type: 'Workshop', operational: 12, maintenance: 2, repair: 1, offline: 1, total: 16 },
    { type: 'Washing Bay', operational: 10, maintenance: 2, repair: 1, offline: 0, total: 13 },
    { type: 'Pit Stop', operational: 15, maintenance: 3, repair: 2, offline: 1, total: 21 },
    { type: 'Calibration', operational: 8, maintenance: 1, repair: 1, offline: 0, total: 10 },
  ];

  // Facility usage statistics
  const facilityUsageData = [
    { month: 'Jul', utilization: 85, downtime: 15 },
    { month: 'Aug', utilization: 88, downtime: 12 },
    { month: 'Sep', utilization: 90, downtime: 10 },
    { month: 'Oct', utilization: 87, downtime: 13 },
    { month: 'Nov', utilization: 92, downtime: 8 },
    { month: 'Dec', utilization: 89, downtime: 11 },
    { month: 'Jan', utilization: 91, downtime: 9 },
  ];

  // Most utilized facilities
  const mostUtilizedFacilities = [
    { name: 'Workshop A', hours: 720 },
    { name: 'Pit Stop 1', hours: 680 },
    { name: 'Washing Bay 1', hours: 650 },
    { name: 'Calibration Lab', hours: 580 },
    { name: 'Workshop B', hours: 540 },
  ];

  // Maintenance cost by facility type
  const maintenanceCostData = [
    { type: 'Workshop', amount: 5.2 },
    { type: 'Washing Bay', amount: 3.8 },
    { type: 'Pit Stop', amount: 4.5 },
    { type: 'Calibration', amount: 2.9 },
    { type: 'Others', amount: 1.8 },
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
              <h2 className="text-base text-white">Facility Population Dashboard</h2>
              <p className="text-xs text-white/80">Real-time facility status and utilization analytics</p>
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
            <p className="text-lg text-white">{totalFacilities}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Operational</p>
            <p className="text-lg text-white">45</p>
            <p className="text-xs text-white/60">75%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Maintenance</p>
            <p className="text-lg text-white">8</p>
            <p className="text-xs text-white/60">13.3%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Under Repair</p>
            <p className="text-lg text-white">5</p>
            <p className="text-xs text-white/60">8.3%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Offline</p>
            <p className="text-lg text-white">2</p>
            <p className="text-xs text-white/60">3.3%</p>
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
            <CardTitle className="text-xs">Facility Utilization Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={facilityUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Line type="monotone" dataKey="utilization" stroke="#003366" strokeWidth={2} name="Utilization %" dot={false} />
                <Line type="monotone" dataKey="downtime" stroke="#009999" strokeWidth={2} name="Downtime %" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Utilized Facilities - Horizontal Bar */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Most Utilized Facilities</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={mostUtilizedFacilities.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#003366" radius={[0, 4, 4, 0]} />
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
                <Bar dataKey="operational" fill="#22c55e" name="Operational" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offline" fill="#ef4444" name="Offline" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facility Population by Type */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Facility Population by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={facilityTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="operational" fill="#22c55e" name="Operational" stackId="a" />
                <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" stackId="a" />
                <Bar dataKey="repair" fill="#f97316" name="Repair" stackId="a" />
                <Bar dataKey="offline" fill="#ef4444" name="Offline" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance Cost by Type - Horizontal Bar */}
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Maintenance Cost by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={maintenanceCostData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="type" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#009999" radius={[0, 4, 4, 0]}>
                  {maintenanceCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Facility Summary Table (Very Compact) */}
      <Card className="border-0 shadow">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs">Facility Type Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-1.5 text-xs">Facility Type</th>
                  <th className="text-center p-1.5 text-xs">Operational</th>
                  <th className="text-center p-1.5 text-xs">Maintenance</th>
                  <th className="text-center p-1.5 text-xs">Repair</th>
                  <th className="text-center p-1.5 text-xs">Offline</th>
                  <th className="text-center p-1.5 text-xs">Total</th>
                  <th className="text-center p-1.5 text-xs">% Operational</th>
                </tr>
              </thead>
              <tbody>
                {facilityTypeData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-[#003366] text-white flex items-center justify-center text-xs">
                          {item.type.substring(0, 2)}
                        </div>
                        <span className="text-xs">{item.type}</span>
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        {item.operational}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {item.maintenance}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {item.repair}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                        {item.offline}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-xs">{item.total}</td>
                    <td className="p-1.5 text-center">
                      <span className="text-xs text-green-700">
                        {((item.operational / item.total) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="p-1.5 text-xs">Total</td>
                  <td className="p-1.5 text-center text-green-700 text-xs">
                    {facilityTypeData.reduce((sum, item) => sum + item.operational, 0)}
                  </td>
                  <td className="p-1.5 text-center text-orange-700 text-xs">
                    {facilityTypeData.reduce((sum, item) => sum + item.maintenance, 0)}
                  </td>
                  <td className="p-1.5 text-center text-orange-700 text-xs">
                    {facilityTypeData.reduce((sum, item) => sum + item.repair, 0)}
                  </td>
                  <td className="p-1.5 text-center text-red-700 text-xs">
                    {facilityTypeData.reduce((sum, item) => sum + item.offline, 0)}
                  </td>
                  <td className="p-1.5 text-center text-xs">
                    {facilityTypeData.reduce((sum, item) => sum + item.total, 0)}
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
