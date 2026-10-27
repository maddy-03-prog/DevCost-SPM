import { useState, type CSSProperties } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Activity, ArrowUpRight, BarChart3, Calculator, CircleDollarSign, FileText, Gauge, Layers3, Menu, Moon, Settings2, Sparkles, Sun, X } from 'lucide-react'
import { useProjectStore } from './store/useProjectStore'
import Overview from './pages/Overview'
import EffortCalculator from './pages/EffortCalculator'
import CocomoCalculator from './pages/CocomoCalculator'
import BudgetPlanner from './pages/BudgetPlanner'
import MethodComparison from './pages/MethodComparison'
import WhatIfSimulator from './pages/WhatIfSimulator'

const navigation = [
  { label: 'Overview', path: '/', icon: Gauge },
  { label: 'Effort calculator', path: '/effort', icon: Calculator },
  { label: 'COCOMO', path: '/cocomo', icon: Activity },
  { label: 'Budget planner', path: '/budget', icon: CircleDollarSign },
  { label: 'Method comparison', path: '/comparison', icon: BarChart3 },
  { label: 'What-if simulator', path: '/what-if', icon: Layers3 },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings2 },
]

function Workspace() {
  const project = useProjectStore((state) => state.project)
  const settings = useProjectStore((state) => state.settings)
  const updateSettings = useProjectStore((state) => state.updateSettings)
  const resetProject = useProjectStore((state) => state.resetProject)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const currentPage = navigation.find(({ path }) => path === location.pathname)?.label ?? 'Overview'
  const toggleTheme = () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  return <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`} data-density={settings.density} data-theme={settings.theme} style={{ '--accent': settings.accent } as CSSProperties}>
    {menuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={20} /></div><span>devcost</span><span className="brand-badge">BETA</span><button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Sparkles size={16} /></span><strong>Estimation tip</strong><p>Start with a clear scope, then compare more than one method.</p></div><div className="profile"><div className="avatar">D</div><div><strong>DevCost workspace</strong><small>Personal project</small></div></div></div>
    </aside>
    <div className="main-column"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{currentPage}</strong></div><div className="topbar-actions"><div className="project-name"><span className="project-dot" />{project.name}</div><button className="icon-button" aria-label="Toggle light and dark theme" title="Toggle theme" onClick={toggleTheme}>{settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button><button className="icon-button" aria-label="Reset project" title="Reset project" onClick={resetProject}><span className="reset-symbol">↻</span></button><button className="secondary-button top-export" onClick={() => window.print()}><FileText size={16} /> Export / Print</button><button className="avatar top-avatar" aria-label="Workspace profile">D</button></div></header>
      <Routes><Route path="/" element={<Overview />} /><Route path="/effort" element={<EffortCalculator />} /><Route path="/cocomo" element={<CocomoCalculator />} /><Route path="/budget" element={<BudgetPlanner />} /><Route path="/comparison" element={<MethodComparison />} /><Route path="/what-if" element={<WhatIfSimulator />} /><Route path="*" element={<main className="page-content"><div className="empty-state"><span className="feature-icon purple"><ArrowUpRight size={20} /></span><h1>{currentPage} is up next</h1><p>This module is being prepared. Your saved project data is already available here.</p></div></main>} /></Routes>
    </div>
  </div>
}

export default function App() {
  return <BrowserRouter><Workspace /></BrowserRouter>
}
