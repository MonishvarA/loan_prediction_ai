import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { loadLoanDataset, LoanRow } from "@/lib/ml/loan-preprocess";

export default function DatasetPreview() {
  const [rows, setRows] = useState<LoanRow[]>([]);

  useEffect(() => {
    loadLoanDataset().then(ds => setRows(ds.rows.slice(0, 50))).catch(console.error);
  }, []);

  const headers = rows.length ? Object.keys(rows[0]!) : [];

  return (
    <Card id="dataset">
      <CardHeader>
        <CardTitle>Dataset Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b">
                  {headers.map(h => (
                    <td key={h} className="px-3 py-2">{String((r as any)[h])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <p className="mt-3 text-xs text-muted-foreground">Source: Analytics Vidhya Loan Prediction (publicly available). Data loaded locally.</p>
      </CardContent>
    </Card>
  );
}
