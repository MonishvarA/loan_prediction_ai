import Papa from "papaparse";

export type LoanRow = {
  Loan_ID?: string;
  Gender?: string;
  Married?: string;
  Dependents?: string;
  Education?: string;
  Self_Employed?: string;
  ApplicantIncome?: string | number;
  CoapplicantIncome?: string | number;
  LoanAmount?: string | number;
  Loan_Amount_Term?: string | number;
  Credit_History?: string | number;
  Property_Area?: string;
  Loan_Status?: string; // Y/N
};

export type Dataset = { rows: LoanRow[] };

export async function loadLoanDataset(path = "/data/loan_prediction.csv"): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<LoanRow>(path, {
      header: true,
      dynamicTyping: true,
      download: true,
      complete: (results) => {
        const rows = (results.data || []).filter(r => Object.keys(r).length > 0);
        resolve({ rows });
      },
      error: (err) => reject(err),
    });
  });
}

export type Preprocessor = {
  numericMeans: Record<string, number>;
  numericStd: Record<string, number>;
  categories: Record<string, string[]>; // for one-hot order
  featureOrder: string[]; // final feature names in order
};

const NUMERIC_COLS = [
  "ApplicantIncome",
  "CoapplicantIncome",
  "LoanAmount",
  "Loan_Amount_Term",
  "Credit_History",
] as const;

const CATEGORICAL_COLS = [
  "Gender",
  "Married",
  "Dependents",
  "Education",
  "Self_Employed",
  "Property_Area",
] as const;

export type FeatureVector = number[];

export function fitPreprocessor(rows: LoanRow[]): Preprocessor {
  // Clean rows: remove those with missing critical fields
  const clean = rows.filter(r => r.Loan_Status && r.Credit_History !== undefined && r.LoanAmount !== undefined);

  // collect categories
  const categories: Record<string, string[]> = {};
  for (const col of CATEGORICAL_COLS) {
    const set = new Set<string>();
    for (const r of clean) {
      const v = String((r as any)[col] ?? "").trim();
      if (v) set.add(v);
    }
    categories[col] = Array.from(set.values()).sort();
  }

  // numeric stats
  const numericMeans: Record<string, number> = {};
  const numericStd: Record<string, number> = {};
  for (const col of NUMERIC_COLS) {
    const vals = clean
      .map(r => Number((r as any)[col]))
      .filter(v => Number.isFinite(v));
    const mean = vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
    const std = Math.sqrt(
      vals.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(vals.length, 1)
    ) || 1;
    numericMeans[col] = mean;
    numericStd[col] = std;
  }

  // build feature order: numeric -> one-hots
  const featureOrder: string[] = [];
  for (const col of NUMERIC_COLS) featureOrder.push(col);
  for (const col of CATEGORICAL_COLS) {
    for (const cat of categories[col]) featureOrder.push(`${col}__${cat}`);
  }

  return { numericMeans, numericStd, categories, featureOrder };
}

export function rowToFeatures(row: LoanRow, pp: Preprocessor): FeatureVector {
  const vec: number[] = [];
  // numeric
  for (const col of NUMERIC_COLS) {
    const raw = Number((row as any)[col]);
    const v = Number.isFinite(raw) ? raw : pp.numericMeans[col];
    const z = (v - pp.numericMeans[col]) / pp.numericStd[col];
    vec.push(z);
  }
  // categorical one-hot
  for (const col of CATEGORICAL_COLS) {
    const categories = pp.categories[col];
    const v = String((row as any)[col] ?? "").trim();
    for (const cat of categories) vec.push(v === cat ? 1 : 0);
  }
  return vec;
}

export function buildXY(rows: LoanRow[], pp: Preprocessor) {
  const X: number[][] = [];
  const y: number[] = [];
  for (const r of rows) {
    if (!r.Loan_Status) continue;
    X.push(rowToFeatures(r, pp));
    y.push(r.Loan_Status === "Y" ? 1 : 0);
  }
  return { X, y };
}
