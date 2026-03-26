import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart3, PieChart, TrendingUp, Wrench } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth, AuthUsers } from "../service/AuthContext"; 
import { API } from '../config'; 

interface ToolReport {
  Kode: string;
  Keterangan: string;
  Total: number;
  Good: number;
  R1: number;
  R2: number;
  TA: number;
  GoodRates: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}
 
interface RentReturnData {
  Periode: string;
  PeriodeName: string;
  PeriodeReport: string;
  Total: number;
  Returned: number;
  Rented: number;
  Overdue: number;
  ReturnRates: number;
}

interface RentedByType {
  TypeId: string;
  TypeName: string;
  Total: number;
  PersenType: number;
}
 
export default function Dashboard() {
  const { currentUser } = useAuth();  
  const [toolReport, setToolReport] = useState<ToolReport[]>([]);
  const [toolResume, setToolResume] = useState<ToolReport | null>(null);
  const [toolChartReport, setToolChartReport] = useState<ChartData[]>([]);
  const [reportRentData, setReportRentData] = useState<RentReturnData[]>([]);
  const [rentedByType, setRentedByType] = useState<RentedByType[]>([]);
  const [toolByWorkGroup, setToolByWorkGroup] = useState<ToolReport[]>([]);

  function GetFirstChar(text: string) {
    if (!text) return "";
    else {
      return text.split(" ").map(w => w[0]).join("") 
    }
  }

  function CallPersen(tipe: string) {
    var value = 0.0;
    if (!toolResume) return value;

    if (tipe == "Good") value = toolResume.Good;
    else if (tipe == "R1") value = toolResume.R1;
    else if (tipe == "R2") value = toolResume.R2;
    else if (tipe == "TA") value = toolResume.TA;
    else if (tipe == "Total") value = toolResume.Total;

    const result = value * 100 / toolResume.Total;
    return result.toFixed(1);
  }

  function CallData(tipe: string) {
    var value = 0.0;
    if (!toolResume) return value;

    if (tipe == "Good") value = toolResume.Good;
    else if (tipe == "R1") value = toolResume.R1;
    else if (tipe == "R2") value = toolResume.R2;
    else if (tipe == "TA") value = toolResume.TA;
    else if (tipe == "Total") value = toolResume.Total;
     
    return value.toLocaleString();
  }

  function sumToolReport(rows: ToolReport[]): ToolReport {
    return rows.reduce<ToolReport>(
      (acc, curr) => {
        acc.Total += curr.Total || 0;
        acc.Good += curr.Good || 0;
        acc.R1 += curr.R1 || 0;
        acc.R2 += curr.R2 || 0;
        acc.TA += curr.TA || 0;
        return acc;
      },
      { Kode:"", Keterangan:"", Total: 0, Good: 0, R1: 0, R2: 0, TA: 0, GoodRates:0 }
    );
  }
    
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
    
  // Frequently used tool types (monthly) 
  const frequentToolTypes = [
    { type: 'Power Tools', count: 485, percentage: 35 },
    { type: 'Hand Tools', count: 380, percentage: 28 },
    { type: 'Lifting Equipment', count: 245, percentage: 18 },
    { type: 'Measuring Tools', count: 165, percentage: 12 },
    { type: 'Safety Equipment', count: 95, percentage: 7 },
  ];

  const COLORS = ['#003366', '#009999', '#0088cc', '#00b4d8', '#48cae4'];

  const reportRentSortedDesc = useMemo(() => {
    return [...reportRentData].sort((a, b) => {
      const pa = Number(a.Periode);
      const pb = Number(b.Periode);
      return pa - pb;
    });
  }, [reportRentData]);

  //const totalTools =  toolPopulationData.reduce((sum, item) => sum + item.value, 0);

  const ReloadMasterTools = () => {
    const params = new URLSearchParams({
      action: "REPORT",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.REGISTERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolReport[]) => { 
        setToolReport(json);
        const resume = sumToolReport(json)
        setToolResume(resume);
        setToolChartReport(  [
          { name: 'Good', value: resume.Good, color: '#22c55e' },
          { name: 'R1', value: resume.R1, color: '#f59e0b' },
          { name: 'R2', value: resume.R2, color: '#f97316' },
          { name: 'TA', value: resume.TA, color: '#ef4444' },
        ])
      })
      .catch((error) => console.error("Error:", error));
  };
   
  const ReloadToolByWorkgroup = () => {
    const params = new URLSearchParams({
      action: "DASHBOARDWORKSHOP",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.REGISTERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolReport[]) => {

        const updated: ToolReport[] = json.map(it => ({
          ...it,
          Kode: GetFirstChar(it.Keterangan),
        }));

        setToolByWorkGroup(updated); 
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadRentReport = () => {
    const params = new URLSearchParams({
      act: "REPORT",
      jobsite: currentUser.Jobsite,
      qty: "7"
    });
    fetch(API.RENTTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: RentReturnData[]) => { 
        setReportRentData(json);
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadRentReportByType = () => {
    const params = new URLSearchParams({
      act: "DASHBOARDTYPE",
      jobsite: currentUser.Jobsite, 
    });
    fetch(API.RENTTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: RentedByType[]) => {
        setRentedByType(json);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    setToolChartReport([
      { name: 'Good', value: 0, color: '#22c55e' },
      { name: 'R1', value: 0, color: '#f59e0b' },
      { name: 'R2', value: 0, color: '#f97316' },
      { name: 'TA', value: 0, color: '#ef4444' },
    ]);
    ReloadMasterTools();
    ReloadRentReport();
    ReloadRentReportByType();
    ReloadToolByWorkgroup();
    console.log("Reload Users")
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl text-white mb-1">Transaction Summary Dashboard</h2>
              <p className="text-white/80">Real-time tools inventory and usage analytics</p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
            <Wrench className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tools</p>
                <p className="text-3xl text-[#003366]">{CallData("Total")}</p>
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
                <p className="text-3xl text-green-600">{CallData("Good")}</p>
                <p className="text-xs text-gray-500 mt-1">{CallPersen("Good")} %</p>
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
                <p className="text-3xl text-orange-600">{CallData("R1")}</p>
                <p className="text-xs text-gray-500 mt-1">{CallPersen("R1")}%</p>
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
                <p className="text-3xl text-orange-500">{CallData("R2")}</p>
                <p className="text-xs text-gray-500 mt-1">{CallPersen("R2")}%</p>
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
                <p className="text-3xl text-red-600">{CallData("TA")}</p>
                <p className="text-xs text-gray-500 mt-1">{CallPersen("TA")}%</p>
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
                  data={toolChartReport}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {toolChartReport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              {toolChartReport.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <p className="text-lg" style={{ color: item.color }}>{item.value.toLocaleString()}</p>
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
              <LineChart data={reportRentSortedDesc}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="PeriodeReport" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Total" stroke="#003366" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="Returned" stroke="#009999" strokeWidth={2} name="Returned" />
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
              <BarChart data={rentedByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="TypeName" type="category" width={130} />
                <Tooltip />
                <Bar dataKey="Total" fill="#009999">
                  {rentedByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tool Population by Workshop */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Tool Population by Workshop</CardTitle>
          <CardDescription>Distribution of tools across workshops</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={toolByWorkGroup}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Kode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Good" fill="#22c55e" name="Good" stackId="a" />
                <Bar dataKey="R1" fill="#f59e0b" name="R1" stackId="a" />
                <Bar dataKey="R2" fill="#f97316" name="R2" stackId="a" />
                <Bar dataKey="TA" fill="#ef4444" name="TA" stackId="a" />
              </BarChart>
            </ResponsiveContainer>

            {/* Workshop Statistics Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left p-3 text-gray-700">Workshop</th>
                    <th className="text-center p-3 text-gray-700">Good</th>
                    <th className="text-center p-3 text-gray-700">R1</th>
                    <th className="text-center p-3 text-gray-700">R2</th>
                    <th className="text-center p-3 text-gray-700">TA</th>
                    <th className="text-center p-3 text-gray-700">Total Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {toolByWorkGroup.map((ws, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center">
                            {GetFirstChar(ws.Keterangan)}
                          </div>
                          <span>{ws.Keterangan}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-700">
                          {ws.Good}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                          {ws.R1}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-700">
                          {ws.R2}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-700">
                          {ws.TA}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span>{ws.Total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="p-3">Total</td>
                    <td className="p-3 text-center text-green-700">
                      {toolByWorkGroup.reduce((sum, ws) => sum + ws.Good, 0)}
                    </td>
                    <td className="p-3 text-center text-orange-700">
                      {toolByWorkGroup.reduce((sum, ws) => sum + ws.R1, 0)}
                    </td>
                    <td className="p-3 text-center text-red-700">
                      {toolByWorkGroup.reduce((sum, ws) => sum + ws.R2, 0)}
                    </td>
                    <td className="p-3 text-center text-red-700">
                      {toolByWorkGroup.reduce((sum, ws) => sum + ws.TA, 0)}
                    </td>
                    <td className="p-3 text-center">
                      {toolByWorkGroup.reduce((sum, ws) => sum + ws.Total, 0)}
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
                  <th className="text-left p-3 text-gray-600">Tool Type</th>
                  <th className="text-right p-3 text-gray-600">Usage Count</th>
                  <th className="text-right p-3 text-gray-600">Percentage</th>
                  <th className="text-left p-3 text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {rentedByType.map((tool, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{tool.TypeName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">{tool.Total}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#009999]"
                            style={{ width: `${tool.PersenType}%` }}
                          />
                        </div>
                        <span className="text-gray-600">{tool.PersenType}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700">
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
    </div>
  );
}
