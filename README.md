# 🚀 DevCost — Software Development Cost Estimator

<p align="center">
  <img src="https://img.shields.io/badge/Project-DevCost-6366F1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Domain-Software%20Project%20Management-0F766E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Live-16A34A?style=for-the-badge" />
</p>

<p align="center">
  **Estimate smarter. Plan better. Build efficiently.**
</p>

<p align="center">
  A software project cost estimation platform designed to calculate development effort, predict project duration, plan budgets, compare estimation methods, and visualize project analytics.
</p>

<p align="center">
  🌐 **Live Website:** https://devcost-spm.netlify.app/
  <br/>
  💻 **GitHub Repository:** https://github.com/maddy-03-prog/DevCost-SPM
</p>

---

## 📌 About the Project

**DevCost** is a web-based Software Development Cost Estimator developed as part of Software Project Management (SPM).

Estimating the cost and effort of a software project is an important part of project planning. DevCost simplifies this process by providing calculation tools, estimation models, budget planning, scenario analysis, and visual reports in one platform.

The platform helps users understand how project size, complexity, team experience, development time, and resource costs influence the overall project estimate.

## ✨ Key Features

- 📊 **Interactive Dashboard** – View project estimation summaries and key metrics.
- ⚙️ **Effort Calculator** – Estimate development effort in person-months.
- 🧮 **COCOMO Calculator** – Calculate effort, development time, and average staffing using the COCOMO model.
- 💰 **Budget Planner** – Estimate project expenses, including team and other project costs.
- ⚖️ **Method Comparison** – Compare different software estimation approaches.
- 🔬 **What-if Simulator** – Explore how changing project parameters affects estimates.
- 📈 **Reports & Analytics** – Visualize results through charts, graphs, and tables.
- 🌙 **Dark Mode** – Switch between light and dark interfaces.
- 📁 **Project Management** – Organize and review estimation data.

## 🧩 Project Modules

| Module | Purpose |
|---|---|
| Dashboard | Project overview and estimation summary |
| Effort Calculator | Person-month effort estimation |
| COCOMO Calculator | Effort, time, and staffing prediction |
| Budget Planner | Project budget and expense estimation |
| Method Comparison | Compare estimation techniques |
| What-if Simulator | Analyze alternative project scenarios |
| Reports & Export | Review and export estimation results |
| Settings | Customize application preferences |

## 🧮 COCOMO Estimation Model

DevCost includes the **Constructive Cost Model (COCOMO)** for estimating software development effort.

The Basic COCOMO equations are:

**1. Development Effort**

\[
E = a \times (KLOC)^b
\]

**2. Development Time**

\[
T = c \times (E)^d
\]

**3. Average Team Size**

\[
P = \frac{E}{T}
\]

Where:

- `E` = Development effort in person-months
- `T` = Development time in months
- `P` = Average number of developers
- `KLOC` = Thousands of Lines of Code
- `a, b, c, d` = Model coefficients

The Basic COCOMO model supports three project categories:

- Organic
- Semi-Detached
- Embedded

## 📊 Analytics & Visualization

DevCost uses visual analytics to make estimation results easier to understand.

Visualizations can help users examine:

- Estimated development effort
- Project duration
- Team size distribution
- Budget breakdown
- Estimation method comparison
- Scenario-based changes

## 🛠️ Technology Stack

The project uses a modern web development approach.

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Build Tool:** Vite
- **Deployment:** Netlify
- **Version Control:** Git and GitHub

*Update this list if your final implementation uses different libraries.*

## 🚀 Getting Started

Follow these steps to run DevCost locally.

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/maddy-03-prog/DevCost-SPM.git
```

### 2. Navigate to the Project

```bash
cd DevCost-SPM
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 5. Create a Production Build

```bash
npm run build
```

## 🌐 Live Deployment

Experience DevCost here:

**https://devcost-spm.netlify.app/**

The application is deployed using Netlify.

## 👥 Contributors

This project is developed collaboratively.

| Contributor | Role |
|---|---|
| Madhan Kumar | Project development and implementation |
| Project Collaborator | Collaborative development and implementation |

## 🎯 Project Objectives

- Simplify software development cost estimation.
- Understand and apply software estimation models.
- Predict project effort and development duration.
- Support project budget planning.
- Compare estimation techniques.
- Understand the impact of changing project parameters.
- Present estimation results through visual analytics.

## 🔮 Future Enhancements

- AI-assisted project estimation.
- Historical project data analysis.
- More estimation models.
- Advanced team productivity analysis.
- Enhanced PDF and Excel reporting.
- Cloud-based project storage and collaboration.

## 📚 Academic Context

**Subject:** Software Project Management  
**Project:** DevCost — Software Development Cost Estimator

Developed as an academic project to demonstrate software effort estimation, cost planning, project analysis, and visualization concepts.

---

<p align="center">
  **DevCost — Estimate Smarter. Develop Better.**
</p>

<p align="center">
  ⭐ If you find this project interesting, consider giving the repository a star!
</p>
