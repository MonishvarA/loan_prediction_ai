import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadSavedModel, predictProba, trainLoanModel } from "@/lib/ml/loan-model";
import { LoanRow, rowToFeatures, Preprocessor, loadLoanDataset } from "@/lib/ml/loan-preprocess";
import { toast } from "@/hooks/use-toast";

export default function LoanPredictForm() {
  const [pp, setPp] = useState<Preprocessor | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [prob, setProb] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [training, setTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);

  const [form, setForm] = useState<LoanRow>({
    Gender: "Male",
    Married: "Yes",
    Dependents: "0",
    Education: "Graduate",
    Self_Employed: "No",
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 150,
    Loan_Amount_Term: 360,
    Credit_History: 1,
    Property_Area: "Urban",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSavedModel();
      if (cancelled) return;
      if (saved) {
        setModelReady(true);
        setPp(saved.pp);
        return;
      }
      try {
        setTraining(true);
        const ds = await loadLoanDataset();
        await trainLoanModel(ds, (epoch) => {
          const total = 50;
          setTrainProgress(Math.min(100, Math.round(((epoch + 1) / total) * 100)));
        });
        if (cancelled) return;
        const m2 = await loadSavedModel();
        if (m2) {
          setModelReady(true);
          setPp(m2.pp);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setTraining(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const onPredict = async () => {
    setLoading(true);
    try {
      const m = await loadSavedModel();
      if (!m) {
        toast({ title: "Preparing model", description: "Please wait while the model finishes training..." });
        setLoading(false);
        return;
      }
      const fv = rowToFeatures(form, m.pp);
      const p = await predictProba(m, fv);
      setProb(p);
    } catch (e) {
      console.error(e);
      toast({ title: "Prediction failed", description: String(e), variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof LoanRow, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const approved = prob !== null ? prob >= 0.5 : null;

  return (
    <Card id="predict">
      <CardHeader>
        <CardTitle>Predict Approval</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Gender</Label>
            <Select value={String(form.Gender)} onValueChange={(v) => set("Gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Married</Label>
            <Select value={String(form.Married)} onValueChange={(v) => set("Married", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Dependents</Label>
            <Select value={String(form.Dependents)} onValueChange={(v) => set("Dependents", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3+">3+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Education</Label>
            <Select value={String(form.Education)} onValueChange={(v) => set("Education", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Graduate">Graduate</SelectItem>
                <SelectItem value="Not Graduate">Not Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Self Employed</Label>
            <Select value={String(form.Self_Employed)} onValueChange={(v) => set("Self_Employed", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Applicant Income</Label>
            <Input type="number" value={Number(form.ApplicantIncome)} onChange={(e) => set("ApplicantIncome", Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Coapplicant Income</Label>
            <Input type="number" value={Number(form.CoapplicantIncome)} onChange={(e) => set("CoapplicantIncome", Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Loan Amount (in thousands)</Label>
            <Input type="number" value={Number(form.LoanAmount)} onChange={(e) => set("LoanAmount", Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Loan Term (months)</Label>
            <Input type="number" value={Number(form.Loan_Amount_Term)} onChange={(e) => set("Loan_Amount_Term", Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Credit History</Label>
            <Select value={String(form.Credit_History)} onValueChange={(v) => set("Credit_History", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="0">0</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Property Area</Label>
            <Select value={String(form.Property_Area)} onValueChange={(v) => set("Property_Area", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Urban">Urban</SelectItem>
                <SelectItem value="Semiurban">Semiurban</SelectItem>
                <SelectItem value="Rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <Button onClick={onPredict} disabled={loading || !modelReady || training}>{loading ? "Predicting..." : "Predict"}</Button>
          {(!modelReady || training) && <span className="text-sm text-muted-foreground">Preparing model… training on first visit ({trainProgress}%).</span>}
          {prob !== null && (
            <span className="text-sm">Approval probability: {(prob * 100).toFixed(1)}% — {approved ? "Likely Approved" : "Likely Rejected"}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
