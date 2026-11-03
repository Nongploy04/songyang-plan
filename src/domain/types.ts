export interface BudgetByYear {
  [year: number]: number | null | undefined;
  2561?: number | null;
  2562?: number | null;
  2563?: number | null;
  2564?: number | null;
  2565?: number | null;
  2566?: number | null;
  2567?: number | null;
  2568?: number | null;
  2569?: number | null;
  2570?: number | null;
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
  documentId: string | null;
  villageNo: number | null;
  strategyNo: number | null;
  fiscalYear: number | null;
  workCategory: string | null;
}

export function getProjectFiscalYears(project: Pick<LocalPlanProject, 'documentId' | 'budgets'>): number[] {
  if (project.documentId.includes('2561_2565')) {
    return [2561, 2562, 2563, 2564, 2565];
  }
  if (project.documentId.includes('2566_2570')) {
    return [2566, 2567, 2568, 2569, 2570];
  }
  return [2571, 2572, 2573, 2574, 2575];
}
