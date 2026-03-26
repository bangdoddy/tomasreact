import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DollarSign, TrendingUp, Package, Calendar, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useMemo } from 'react';
import BudgetingCapex from './budgeting/BudgetingCapex';
import { initialBudgetCapexData, getBudgetCategories } from '../data/budgetCapexData';

export default function Capex() {
  const [showBudgeting, setShowBudgeting] = useState(false);

  // Calculate dynamic data from budgeting items
  const budgetCategories = useMemo(() => getBudgetCategories(initialBudgetCapexData), []);
  
  const totalBudget = useMemo(() => 
    initialBudgetCapexData.reduce((sum, item) => sum + (item.cost * item.requirement), 0),
    []
  );
  
  const allocated = useMemo(() => 
    initialBudgetCapexData.reduce((sum, item) => sum + item.totalCost, 0),
    []
  );
  
  const remaining = totalBudget - allocated;
  const utilization = totalBudget > 0 ? Math.round((allocated / totalBudget) * 100) : 0;

  const formatIDR = (amount: number) => {
    if (amount >= 1000000000) {
      return `IDR ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `IDR ${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (showBudgeting) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setShowBudgeting(false)}
          className="mb-4"
        >
          ← Back to Overview
        </Button>
        <BudgetingCapex />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl mb-1">Capital Expenditure (Capex)</h2>
              <p className="text-white/80">Long-term investment and asset acquisition budget</p>
            </div>
          </div>
          <Button
            onClick={() => setShowBudgeting(true)}
            className="bg-white text-[#003366] hover:bg-white/90"
          >
            <FileText className="h-4 w-4 mr-2" />
            Budgeting CAPEX
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                <p className="text-2xl text-[#003366]">{formatIDR(totalBudget)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Allocated</p>
                <p className="text-2xl text-green-600">{formatIDR(allocated)}</p>
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
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-2xl text-[#009999]">{formatIDR(remaining)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilization</p>
                <p className="text-2xl text-orange-600">{utilization}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Categories */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Capex allocation by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.category}</span>
                      <span className="text-gray-600">
                        {formatIDR(item.allocated)} / {formatIDR(item.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${item.color}`}
                        style={{ width: `${(item.allocated / item.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}