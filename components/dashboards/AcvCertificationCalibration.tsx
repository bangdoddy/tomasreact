import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, Award } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AcvCertificationCalibration() {
  const certificationStatusData = [
    { name: 'Valid', value: 35, color: '#22c55e' },
    { name: 'Expiring Soon', value: 8, color: '#f59e0b' },
    { name: 'Expired', value: 5, color: '#ef4444' },
    { name: 'Pending', value: 3, color: '#94a3b8' },
  ];

  const facilityData = [
    { facility: 'CAL-A', valid: 12, expiring: 2, expired: 1 },
    { facility: 'CAL-B', valid: 10, expiring: 2, expired: 2 },
    { facility: 'CAL-C', valid: 8, expiring: 3, expired: 1 },
    { facility: 'CAL-D', valid: 5, expiring: 1, expired: 1 },
  ];

  const facilityScoreData = [
    { facility: 'CAL-A', valid: 12, expiring: 2, expired: 1, pending: 1, total: 16 },
    { facility: 'CAL-B', valid: 10, expiring: 2, expired: 2, pending: 1, total: 15 },
    { facility: 'CAL-C', valid: 8, expiring: 3, expired: 1, pending: 0, total: 12 },
    { facility: 'CAL-D', valid: 5, expiring: 1, expired: 1, pending: 1, total: 8 },
  ];

  const monthlyTrendData = [
    { month: 'Jul', valid: 33, expired: 4 },
    { month: 'Aug', valid: 34, expired: 4 },
    { month: 'Sep', valid: 32, expired: 5 },
    { month: 'Oct', valid: 36, expired: 3 },
    { month: 'Nov', valid: 35, expired: 5 },
    { month: 'Dec', valid: 37, expired: 4 },
    { month: 'Jan', valid: 35, expired: 5 },
  ];

  const certificationTypesData = [
    { type: 'ISO 9001', count: 15 },
    { type: 'Calibration', count: 12 },
    { type: 'Safety', count: 10 },
    { type: 'Environmental', count: 8 },
    { type: 'Quality', count: 6 },
  ];

  const certificationAgencyData = [
    { agency: 'Agency A', count: 18 },
    { agency: 'Agency B', count: 14 },
    { agency: 'Agency C', count: 11 },
    { agency: 'Agency D', count: 8 },
  ];

  const COLORS = ['#003366', '#009999', '#0088cc', '#00b4d8', '#48cae4'];
  const totalCertifications = certificationStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-2 pb-2">
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-lg p-3 text-white shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base text-white">ACV Certification & Calibration Facility Dashboard</h2>
              <p className="text-xs text-white/80">Facility certification and calibration status tracking</p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <Award className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Total Certifications</p>
            <p className="text-lg text-white">{totalCertifications}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Valid</p>
            <p className="text-lg text-white">35</p>
            <p className="text-xs text-white/60">68.6%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Expiring Soon</p>
            <p className="text-lg text-white">8</p>
            <p className="text-xs text-white/60">15.7%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Expired</p>
            <p className="text-lg text-white">5</p>
            <p className="text-xs text-white/60">9.8%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded p-2">
            <p className="text-xs text-white/70 mb-0.5">Pending</p>
            <p className="text-lg text-white">3</p>
            <p className="text-xs text-white/60">5.9%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Certification Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <RechartsPie>
                <Pie
                  data={certificationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {certificationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Monthly Certification Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Line type="monotone" dataKey="valid" stroke="#003366" strokeWidth={2} name="Valid" dot={false} />
                <Line type="monotone" dataKey="expired" stroke="#009999" strokeWidth={2} name="Expired" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Certification Types</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={certificationTypesData} layout="horizontal">
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

      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Certification by Facility</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="facility" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="valid" fill="#22c55e" name="Valid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expiring" fill="#f59e0b" name="Expiring" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expired" fill="#ef4444" name="Expired" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Facility Certification Scores</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={facilityScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="facility" tick={{ fontSize: 10 }} height={20} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="valid" fill="#22c55e" name="Valid" stackId="a" />
                <Bar dataKey="expiring" fill="#f59e0b" name="Expiring" stackId="a" />
                <Bar dataKey="expired" fill="#ef4444" name="Expired" stackId="a" />
                <Bar dataKey="pending" fill="#94a3b8" name="Pending" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Certification Agency</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={certificationAgencyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} height={20} />
                <YAxis dataKey="agency" type="category" width={60} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#009999" radius={[0, 4, 4, 0]}>
                  {certificationAgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs">Facility Certification Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-1.5 text-xs">Facility</th>
                  <th className="text-center p-1.5 text-xs">Valid</th>
                  <th className="text-center p-1.5 text-xs">Expiring Soon</th>
                  <th className="text-center p-1.5 text-xs">Expired</th>
                  <th className="text-center p-1.5 text-xs">Pending</th>
                  <th className="text-center p-1.5 text-xs">Total</th>
                  <th className="text-center p-1.5 text-xs">% Valid</th>
                </tr>
              </thead>
              <tbody>
                {facilityScoreData.map((fac, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-[#003366] text-white flex items-center justify-center text-xs">
                          {fac.facility.substring(0, 2)}
                        </div>
                        <span className="text-xs">{fac.facility}</span>
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        {fac.valid}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {fac.expiring}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                        {fac.expired}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {fac.pending}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-xs">{fac.total}</td>
                    <td className="p-1.5 text-center">
                      <span className="text-xs text-green-700">
                        {((fac.valid / fac.total) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="p-1.5 text-xs">Total</td>
                  <td className="p-1.5 text-center text-green-700 text-xs">
                    {facilityScoreData.reduce((sum, fac) => sum + fac.valid, 0)}
                  </td>
                  <td className="p-1.5 text-center text-orange-700 text-xs">
                    {facilityScoreData.reduce((sum, fac) => sum + fac.expiring, 0)}
                  </td>
                  <td className="p-1.5 text-center text-red-700 text-xs">
                    {facilityScoreData.reduce((sum, fac) => sum + fac.expired, 0)}
                  </td>
                  <td className="p-1.5 text-center text-gray-700 text-xs">
                    {facilityScoreData.reduce((sum, fac) => sum + fac.pending, 0)}
                  </td>
                  <td className="p-1.5 text-center text-xs">
                    {facilityScoreData.reduce((sum, fac) => sum + fac.total, 0)}
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
