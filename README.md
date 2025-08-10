  # YourSmile GraphQL API 
      
A Node.js‑based GraphQL service that powers the **YourSmile** application.     
It ships with a ready‑to‑use development setup and supports both  **Yarn**   and **npm** workflows.    
  
---                   
              
## 🚀 Quick Start       
 
```bash   
# clone the repository
git clone https://github.com/elsimoor/backendursmile.git
cd backendursmile
```

### 1. Install dependencies

Using **Yarn** (recommended):
```bash
yarn install
```

Or with **npm**:
```bash
npm install        # shorthand: npm i
```

### 2. Create your environment file

```bash
cp .env.example .env     # then edit the new .env file as needed
```

> **Note:**  Ensure that the required variables (e.g. `PORT`, `MONGODB_URI`, `JWT_SECRET`) are set before starting the server.

### 3. Start the development server

With **Yarn**:
```bash
yarn dev
```

With **npm**:
```bash
npm run dev
```

The API is now live at **http://localhost:4000**.

### 4. Open the GraphQL Playground

Navigate to:

```
http://localhost:4000/yourSmile
```

This interactive IDE lets you compose queries, inspect the schema, and execute mutations in real‑time.

---


## 📜 Available Scripts

| Script            | Yarn              | npm                 | Description                           |
|-------------------|-------------------|---------------------|---------------------------------------|
| **dev**           | `yarn dev`        | `npm run dev`       | Launches the app with hot‑reload      |
| **build**         | `yarn build`      | `npm run build`     | Compiles TypeScript ⇢ JavaScript     |
| **start**         | `yarn start`      | `npm start`         | Runs the compiled code in production  |

---

## 🛠️ Tech Stack

- **Node.js** 20+
- **GraphQL** (Apollo Server / Express)
- **TypeScript** 
- **MongoDB** (default persistence layer)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
