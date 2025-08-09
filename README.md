# Loan Approval Prediction System

## 📌 Project Overview
This project is a web-based **Loan Approval Prediction System** that leverages **Machine Learning** to determine whether a loan application should be approved or not, based on applicant details such as income, credit history, and other financial parameters.

The application features:
- A **React + TypeScript** frontend with **Tailwind CSS** for styling.
- A **Machine Learning** model integrated directly into the web app for real-time predictions.
- CSV dataset preview and interactive training functionality.

## 🛠️ Tech Stack
**Frontend:**
- React + TypeScript
- Tailwind CSS
- ShadCN UI Components

**Machine Learning:**
- TensorFlow.js for in-browser model training and prediction
- Preprocessing scripts in TypeScript

**Dataset:**
- `loan_prediction.csv` (contains sample loan application data)

## 📂 Project Structure
```
loan_approval_ai-main/
│── public/                # Static assets
│── src/                   # Source code
│   ├── components/         # UI components
│   ├── lib/ml/             # ML model & preprocessing scripts
│   ├── pages/              # App pages
│── package.json            # Dependencies
│── tailwind.config.ts      # Tailwind CSS config
│── README.md               # Project documentation
```

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone <repo-url>
cd loan_approval_ai-main
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Start the Development Server
```bash
npm run dev
```

### 4️⃣ Open in Browser
Navigate to `http://localhost:5173` to view the app.

## 📊 How It Works
1. User inputs loan applicant details.
2. The ML model preprocesses the inputs.
3. A prediction is generated (Approved / Not Approved).
4. Results are displayed instantly.

## 📦 Dataset
The dataset used for model training is located at:
```
public/data/loan_prediction.csv
```

## 📜 License
This project is licensed under the MIT License.
