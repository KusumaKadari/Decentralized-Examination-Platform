# Decentralized Examination Platform

## Prerequisites
1.  **Ganache** (Blockchain):
    -   Must be running on **Port 9545** (or update `deploy_contract.py` and `views.py` to match your port, typically 7545).
2.  **IPFS Desktop**: Daemon must be running.
3.  **Python 3.x** & **Node.js**.

## Step-by-Step Run Guide

### Step 1: Deploy Smart Contract
The application needs the address of your local blockchain contract.
1.  Open a terminal in the project root.
2.  Run:
    ```bash
    python deploy_contract.py
    ```
3.  **CRITICAL**: Copy the `Contract Address` printed in the output.
4.  Open `QuestionApp/views.py`.
5.  Update **Line 31** with your new address:
    ```python
    deployed_contract_address = 'YOUR_NEW_ADDRESS_HERE'
    ```

### Step 2: Start Backend
In the same terminal:
```bash
python manage.py runserver
```

### Step 3: Start Frontend
Open a **new** terminal:
```bash
cd frontend
npm run dev
```

### Step 4: Access Application
Go to **http://localhost:5173**.
