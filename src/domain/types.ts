export interface BudgetByYear {
  2571?: number | null;
  2572?: number | null;
  2573?: number | null;
  2574?: number | null;
  2575?: number | null;
}

export interface LocalPlanProject {
  id: string;
  documentId: string;
  documentTitle: string;
  strategyNo: number;
  strategyName: string;
  seq: number;
  seqRaw: string;
  name: string;
  objective: string;
  target: string;
  budgets: BudgetByYear;
  totalBudget: number;
  expectedResult: string;
  agency: string;
  villages: number[];
  workCategory: 'road' | 'water' | 'electric' | 'drainage' | 'building' | 'agriculture' | 'social' | 'other';
  pdfPage: number;
  printedPage: number | string;
  updatedAt: string;
}

export interface FilterState {
  query: string;
  villageNo: number | null;
  strategyNo: number | null;
  fiscalYear: number | null;
  workCategory: string | null;
  useThaiNumerals: boolean;
}
