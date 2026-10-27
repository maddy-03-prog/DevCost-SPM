import { Link } from 'react-router-dom'
import { ArrowRight, BadgeDollarSign, BrainCircuit, Clock3, Code2, FileCode2, Gauge, Layers3, Users } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, Card, StatCard } from '../components/ui'
import { calculateBasicCocomo } from '../lib/estimation/cocomo'
import { formatCurrency } from '../lib/estimation/format'
import { useNumberFormatter } from '../hooks/useNumberFormatter'
import { useProjectStore } from '../store/useProjectStore'

const methods = [
  { title: 'LOC-based', icon: Code2, detail: 'Estimate from source-code size and delivery productivity.', pros: 'Quick when code size is known', cons: 'Language and team dependent', tone: 'purple' },
  { title: 'Function Points', icon: Layers3, detail: 'Size functionality independently of implementation language.', pros: 'Useful early in requirements', cons: 'Needs consistent counting', tone: 'blue' },
  { title: 'COCOMO', icon: Gauge, detail: 'Relate software size to effort, schedule, and staffing.', pros: 'Repeatable empirical model', cons: 'Sensitive to size and drivers', tone: 'green' },
  { title: 'Expert / analogy', icon: BrainCircuit, detail: 'Use expert judgment and lessons from similar projects.', pros: 'Captures local context', cons: 'Can inherit estimation bias', tone: 'orange' },
]
const coneData = [
  { phase: 'Concept', low: 0.6, high: 2.0 }, { phase: 'Requirements', low: 0.75, high: 1.5 },
  { phase: 'Design', low: 0.85, high: 1.25 }, { phase: 'Build', low: 0.93, high: 1.1 },
  { phase: 'Release', low: 0.98, high: 1.03 },
]

export default function Overview() {
  const project = useProjectStore((state) => state.project)
  const currency = useProjectStore((state) => state.settings.currency)
  const loadDemoProject = useProjectStore((state) => state.loadDemoProject)
  const formatNumber = useNumberFormatter()
  const summary = calculateBasicCocomo(project.kloc, project.mode)
  const projectCost = summary.effort * project.salary
  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow"><Gauge size={14} /> ESTIMATION OVERVIEW</span><h1>Good estimates start with clarity.</h1><p>Make the trade-offs between scope, time, cost, and risk visible before delivery begins.</p></div><div className="overview-actions"><button className="secondary-button" onClick={loadDemoProject}>Load food delivery demo</button><Link className="primary-button" to="/effort">Start estimating <ArrowRight size={16} /></Link></div></div>
    <section className="overview-hero"><div className="hero-message"><span className="hero-chip">SOFTWARE PROJECT MANAGEMENT</span><h2>Make the Iron Triangle<br /><span>work for your project.</span></h2><p>Every software project balances scope, schedule, and cost. DevCost helps you turn assumptions into an estimate you can explain, compare, and refine.</p><div className="triangle-wrap" aria-label="Iron Triangle: scope, schedule, and cost are interdependent"><div className="triangle-shape" /><span className="triangle-label top">SCOPE</span><span className="triangle-label left">COST</span><span className="triangle-label right">TIME</span><span className="triangle-center">QUALITY</span></div></div><div className="hero-side"><div className="hero-metric"><span className="metric-icon"><Clock3 size={17} /></span><span>Current baseline</span><strong>{formatNumber(summary.effort)} <small>person-months</small></strong></div><div className="hero-rule" /><div className="hero-metric"><span className="metric-icon"><Users size={17} /></span><span>Indicative team</span><strong>{formatNumber(summary.people)} <small>people</small></strong></div><div className="hero-note">Start with a baseline, then test the assumptions that matter most.</div></div></section>
    <section className="summary-stats">
      <StatCard label="Estimated effort" value={`${formatNumber(summary.effort)} PM`} detail={`Basic COCOMO · ${project.kloc} KLOC`} icon={<Gauge size={16} />} />
      <StatCard label="Estimated duration" value={`${formatNumber(summary.duration)} mo`} detail={`At about ${project.teamSize} people`} icon={<Clock3 size={16} />} />
      <StatCard label="Indicative team size" value={`${formatNumber(summary.people)} people`} detail="COCOMO nominal staffing" icon={<Users size={16} />} />
      <StatCard label="Baseline labor cost" value={formatCurrency(projectCost, currency)} detail="Effort × average monthly salary" icon={<BadgeDollarSign size={16} />} />
    </section>
    <section className="section-block"><div className="section-title-row"><div><span className="eyebrow">CHOOSE YOUR APPROACH</span><h2>Estimation techniques</h2></div><Link to="/comparison" className="text-link">Compare methods <ArrowRight size={14} /></Link></div><div className="method-grid">{methods.map(({ title, icon: Icon, detail, pros, cons, tone }) => <Card className="method-card" key={title}><span className={`feature-icon ${tone}`}><Icon size={18} /></span><h3>{title}</h3><p>{detail}</p><div className="method-notes"><span className="pro">+ {pros}</span><span className="con">− {cons}</span></div></Card>)}</div></section>
    <section className="overview-bottom"><ChartCard title="Cone of uncertainty" description="Typical estimation range narrows as requirements and design become clearer."><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={coneData} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}><defs><linearGradient id="coneHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8478ef" stopOpacity={0.28} /><stop offset="95%" stopColor="#8478ef" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#ececf3" /><XAxis dataKey="phase" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#85869a' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#85869a' }} tickFormatter={(value: number) => `${value}×`} /><Tooltip formatter={(value) => [`${Number(value).toFixed(2)}×`, 'Range']} /><Area dataKey="high" type="monotone" stroke="#766be2" fill="url(#coneHigh)" strokeWidth={2} /><Area dataKey="low" type="monotone" stroke="#a49cf4" fill="white" strokeWidth={1.5} /></AreaChart></ResponsiveContainer></div><div className="chart-alt">At concept stage, estimates may range from 0.6× to 2.0× the baseline; by release, the range is about 0.98× to 1.03×.</div></ChartCard><Card className="quick-start"><span className="eyebrow">QUICK START</span><h2>Go to a module</h2><div className="quick-links"><Link to="/effort"><FileCode2 size={17} /><span><b>Effort calculator</b><small>Estimate from size or productivity</small></span><ArrowRight size={15} /></Link><Link to="/cocomo"><Gauge size={17} /><span><b>COCOMO calculator</b><small>Explore schedule and drivers</small></span><ArrowRight size={15} /></Link><Link to="/budget"><BadgeDollarSign size={17} /><span><b>Budget planner</b><small>Build a cost baseline</small></span><ArrowRight size={15} /></Link></div></Card></section>
  </main>
}
