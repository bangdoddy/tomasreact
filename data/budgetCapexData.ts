export interface BudgetCapexItem {
  id: string;
  toolsId: string;
  toolsCategory: string;
  toolsDescription: string;
  year: string;
  statusCapex: string;
  cost: number;
  brand: string;
  size: string;
  pn: string;
  klasifikasiTool: string;
  requirement: number;
  existing: number;
  deviasi: number;
  totalCost: number;
  remarks: string;
  finalBudget: 'Yes' | 'No';
  status?: 'Approved' | 'Pending' | 'Review';
  createdAt?: Date;
}

export const initialBudgetCapexData: BudgetCapexItem[] = [
  {
    id: '1',
    toolsId: 'CDMSA',
    toolsCategory: 'COMMON TOOL',
    toolsDescription: 'AIR PLASMA CUTTER 45 AMPERE',
    year: '2025',
    statusCapex: 'CAPEX',
    cost: 9000000,
    brand: '',
    size: '',
    pn: 'STD',
    klasifikasiTool: 'STD',
    requirement: 1,
    existing: 0,
    deviasi: 1,
    totalCost: 9000000,
    remarks: 'Rp9 Milyar alat dan tool plasma cutter',
    finalBudget: 'Yes',
    status: 'Approved',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    toolsId: 'FIB30V',
    toolsCategory: 'DRILLING TOOL',
    toolsDescription: 'DRILLING MACHINE, 30 MM',
    year: '2025',
    statusCapex: 'CAPEX',
    cost: 9000000,
    brand: '',
    size: '',
    pn: 'STD',
    klasifikasiTool: 'STD',
    requirement: 1,
    existing: 0,
    deviasi: 0,
    totalCost: 0,
    remarks: '',
    finalBudget: 'No',
    status: 'Pending',
    createdAt: new Date('2025-01-18'),
  },
  {
    id: '3',
    toolsId: 'CH36IN',
    toolsCategory: 'COMMON TOOL',
    toolsDescription: 'WHEEL CHOCK 48 INCH',
    year: '2025',
    statusCapex: 'CAPEX',
    cost: 9000000,
    brand: '',
    size: '',
    pn: 'STD',
    klasifikasiTool: 'STD',
    requirement: 1,
    existing: 0,
    deviasi: 0,
    totalCost: 0,
    remarks: '',
    finalBudget: 'No',
    status: 'Review',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: '4',
    toolsId: 'FIB30V',
    toolsCategory: 'LIFTING TOOL',
    toolsDescription: 'PORTABLE QUALITY METER',
    year: '2025',
    statusCapex: 'CAPEX',
    cost: 34000000,
    brand: '',
    size: '',
    pn: 'STD',
    klasifikasiTool: 'STD',
    requirement: 1,
    existing: 0,
    deviasi: 0,
    totalCost: 34000000,
    remarks: '',
    finalBudget: 'Yes',
    status: 'Approved',
    createdAt: new Date('2025-01-20'),
  },
  {
    id: '5',
    toolsId: 'LV100Ton',
    toolsCategory: 'LIFTING TOOL',
    toolsDescription: 'HYDRAULIC JACK, 80 TON',
    year: '2025',
    statusCapex: 'CAPEX',
    cost: 50000000,
    brand: 'ENERPAC',
    size: '80 TON',
    pn: 'JCK 80T',
    klasifikasiTool: '',
    requirement: 1,
    existing: 1,
    deviasi: 0,
    totalCost: 50000000,
    remarks: 'Penambahan alat-se',
    finalBudget: 'Yes',
    status: 'Approved',
    createdAt: new Date('2025-01-12'),
  },
  {
    id: '6',
    toolsId: '',
    toolsCategory: 'ADDITIONAL TOOL',
    toolsDescription: 'QANTTAS',
    year: '2025',
    statusCapex: 'CAPEX',
    cost: 9000000,
    brand: 'Additional',
    size: '',
    pn: '',
    klasifikasiTool: '',
    requirement: 2,
    existing: 2,
    deviasi: 0,
    totalCost: 0,
    remarks: 'Mitra ditambah 1tool Ganting Mitra ditambah tool (Kunci Raihat)',
    finalBudget: 'No',
    status: 'Review',
    createdAt: new Date('2025-01-08'),
  },
];

// Helper function to get budget categories from data
export const getBudgetCategories = (items: BudgetCapexItem[]) => {
  const categoryMap: { [key: string]: { allocated: number; total: number } } = {};

  items.forEach((item) => {
    const category = item.toolsCategory;
    if (!categoryMap[category]) {
      categoryMap[category] = { allocated: 0, total: 0 };
    }
    categoryMap[category].allocated += item.totalCost;
    // Calculate total as allocated + some buffer (you can adjust this logic)
    categoryMap[category].total += item.cost * item.requirement;
  });

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  
  return Object.entries(categoryMap).map(([category, data], index) => ({
    category,
    allocated: data.allocated,
    total: data.total || data.allocated * 1.2, // If total is 0, add 20% buffer
    color: colors[index % colors.length],
  }));
};

// Helper function to get recent requests
export const getRecentRequests = (items: BudgetCapexItem[], limit: number = 4) => {
  return items
    .filter((item) => item.status && item.totalCost > 0)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit)
    .map((item) => ({
      item: item.toolsDescription,
      amount: item.totalCost,
      status: item.status || 'Review',
    }));
};