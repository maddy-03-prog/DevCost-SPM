import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { Activity, ArrowUpRight, BarChart3, Calculator, CircleDollarSign, FileText, Gauge, Layers3, Menu, Settings2, Sparkles } from 'lucide-react'
import { useProjectStore } from './store/useProjectStore'

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

function FoundationPage() {
  const project = useProjectStore((state) => state.project)
  return <main className="page-content"><div className="welcome-panel"><div className="welcome-copy"><span className="eyebrow"><Sparkles size={14} /> YOUR ESTIMATION WORKSPACE</span><h1>Build software estimates<br /><span>with confidence.</span></h1><p>Bring scope, schedule, effort, and budget into focus with practical estimation methods built for your project.</p><button className="primary-button">Explore your estimates <ArrowUpRight size={17} /></button></div><div className="welcome-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-center"><Activity size={40} /></div><div className="art-tag tag-top">Effort <b>91 PM</b></div><div className="art-tag tag-bottom">Confidence <b>High</b></div></div></div><section className="foundation-grid"><article className="card"><span className="feature-icon purple"><Calculator size={19} /></span><h2>One shared project</h2><p>Inputs stay connected across estimation methods and are saved automatically in this browser.</p></article><article className="card"><span className="feature-icon blue"><BarChart3 size={19} /></span><h2>Methods that explain</h2><p>Compare effort and delivery signals with transparent formulas and clear assumptions.</p></article><article className="card"><span className="feature-icon green"><CircleDollarSign size={19} /></span><h2>Plan with context</h2><p>Turn project effort into a realistic schedule, team shape, and budget view.</p></article></section><div className="notice"><div><strong>{project.name}</strong><span>Your project data is ready to estimate.</span></div><span className="status-dot">Saved locally</span></div></main>
}

export default function App() {
  const project = useProjectStore((state) => state.project)
  const settings = useProjectStore((state) => state.settings)
  const resetProject = useProjectStore((state) => state.resetProject)
  return <BrowserRouter><div className="app-shell" data-density={settings.density} data-theme={settings.theme} style={{ '--accent': settings.accent } as React.CSSProperties}><aside className="sidebar"><div className="brand"><div className="brand-mark"><Activity size={20} /></div><span>devcost</span><span className="brand-badge">BETA</span></div><div className="sidebar-label">WORKSPACE</div><nav aria-label="Main navigation">{navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Overview' && <span className="nav-indicator" />}</NavLink>)}</nav><div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Sparkles size={16} /></span><strong>Estimation tip</strong><p>Start with a clear scope, then compare more than one method.</p></div><div className="profile"><div className="avatar">D</div><div><strong>DevCost workspace</strong><small>Personal project</small></div></div></div></aside><div className="main-column"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation menu"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>Overview</strong></div><div className="topbar-actions"><div className="project-name"><span className="project-dot" />{project.name}</div><button className="icon-button" aria-label="Reset project" title="Reset project" onClick={resetProject}><span className="reset-symbol">↻</span></button><button className="secondary-button top-export"><FileText size={16} /> Export</button><button className="avatar top-avatar" aria-label="Workspace profile">D</button></div></header><Routes>{navigation.map(({ path }) => <Route key={path} path={path} element={<FoundationPage />} />)}</Routes></div></div></BrowserRouter>
}
