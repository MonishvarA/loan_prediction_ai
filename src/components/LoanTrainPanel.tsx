import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { loadLoanDataset } from "@/lib/ml/loan-preprocess";
import { trainLoanModel, loadSavedModel } from "@/lib/ml/loan-model";
import { toast } from "@/hooks/use-toast";

export default function LoanTrainPanel() {
  const [status, setStatus] = useState<string>("Idle");
  const [progress, setProgress] = useState<number>(0);
  const [valAcc, setValAcc] = useState<number | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // try to load saved model
    loadSavedModel().then(m => setReady(!!m));
  }, []);

  const onTrain = async () => {
    try {
      setStatus("Loading dataset...");
      const ds = await loadLoanDataset();
      setStatus("Training model...");
      let lastEpoch = 0;
      const res = await trainLoanModel(ds, (epoch, logs) => {
        lastEpoch = epoch + 1;
        const total = 50; // planned epochs
        setProgress(Math.min(100, Math.round(((epoch + 1) / total) * 100)));
        setStatus(`Training epoch ${epoch + 1} / ${total}`);
        const acc = (logs.val_acc as number) ?? (logs.val_accuracy as number);
        if (acc) setValAcc(acc);
      });
      setStatus(`Done. Trained for ${lastEpoch} epochs.`);
      setReady(true);
      toast({ title: "Training complete", description: `Validation accuracy: ${(res.metrics.valAcc * 100).toFixed(1)}%` });
    } catch (e) {
      console.error(e);
      setStatus("Error during training");
      toast({ title: "Training failed", description: String(e), variant: "destructive" as any });
    }
  };

  return (
    <Card id="train">
      <CardHeader>
        <CardTitle>Train Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">We train a small neural model locally using the public Loan Prediction dataset. Your data stays in your browser.</p>
        <div className="flex items-center gap-3">
          <Button onClick={onTrain}>Start Training</Button>
          {ready && <span className="text-sm text-muted-foreground">A saved model is available.</span>}
        </div>
        <Progress value={progress} className="w-full" />
        <div className="text-sm">
          <div>Status: {status}</div>
          {valAcc !== null && (
            <div>Current Val Accuracy: {(valAcc * 100).toFixed(1)}%</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
