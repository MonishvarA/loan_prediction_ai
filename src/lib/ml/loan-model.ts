import * as tf from "@tensorflow/tfjs";
import { Dataset, fitPreprocessor, buildXY, Preprocessor } from "./loan-preprocess";

export type TrainedModel = {
  pp: Preprocessor;
  model: tf.LayersModel;
  inputSize: number;
};

export async function trainLoanModel(dataset: Dataset, onEpoch?: (epoch: number, logs: tf.Logs) => void) {
  const rows = dataset.rows;
  const pp = fitPreprocessor(rows);
  const { X, y } = buildXY(rows, pp);

  // Split
  const n = X.length;
  const idx = tf.util.createShuffledIndices(n);
  const split = Math.floor(n * 0.8);
  const trainIdx = Array.from(idx.slice(0, split));
  const valIdx = Array.from(idx.slice(split));

  const Xtrain = trainIdx.map(i => X[i]);
  const ytrain = trainIdx.map(i => y[i]);
  const Xval = valIdx.map(i => X[i]);
  const yval = valIdx.map(i => y[i]);

  const xTrain = tf.tensor2d(Xtrain);
  const yTrain = tf.tensor2d(ytrain, [ytrain.length, 1]);
  const xVal = tf.tensor2d(Xval);
  const yVal = tf.tensor2d(yval, [yval.length, 1]);

  const inputSize = X[0].length;
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, activation: "relu", inputShape: [inputSize], kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }) }));
  model.add(tf.layers.dropout({ rate: 0.1 }));
  model.add(tf.layers.dense({ units: 32, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }) }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({ optimizer: tf.train.adam(0.01), loss: "binaryCrossentropy", metrics: ["accuracy"] });

  let bestValAcc = 0;
  let patience = 7;
  let wait = 0;

  await model.fit(xTrain, yTrain, {
    epochs: 50,
    batchSize: 32,
    validationData: [xVal, yVal],
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        onEpoch?.(epoch, logs || {});
        const valAcc = (logs?.val_acc as number) ?? (logs?.val_accuracy as number) ?? 0;
        if (valAcc > bestValAcc + 1e-4) { bestValAcc = valAcc; wait = 0; }
        else if (++wait >= patience) { (model as any).stopTraining = true; }
        await tf.nextFrame();
      }
    }
  });

  // Evaluate
  const evalRes = model.evaluate(xVal, yVal, { batchSize: 64 }) as tf.Scalar[] | tf.Scalar;
  let valLoss = 0, valAcc = 0;
  if (Array.isArray(evalRes)) {
    valLoss = (await evalRes[0].data())[0];
    valAcc = (await evalRes[1].data())[0];
  }

  xTrain.dispose(); yTrain.dispose(); xVal.dispose(); yVal.dispose();

  // Persist
  try {
    await model.save("indexeddb://loan-approval-model-v1");
    localStorage.setItem("loan-approval-pp", JSON.stringify(pp));
  } catch {}

  return { model, pp, inputSize, metrics: { valLoss, valAcc } };
}

export async function loadSavedModel(): Promise<TrainedModel | null> {
  try {
    const model = await tf.loadLayersModel("indexeddb://loan-approval-model-v1");
    const ppRaw = localStorage.getItem("loan-approval-pp");
    if (!ppRaw) return null;
    const pp = JSON.parse(ppRaw) as Preprocessor;
    const inputSize = (model.inputs[0].shape?.[1] as number) ?? 0;
    return { model, pp, inputSize };
  } catch {
    return null;
  }
}

export async function predictProba(m: TrainedModel, features: number[]): Promise<number> {
  const x = tf.tensor2d([features]);
  const y = m.model.predict(x) as tf.Tensor;
  const p = (await y.data())[0];
  x.dispose(); y.dispose();
  return p;
}
