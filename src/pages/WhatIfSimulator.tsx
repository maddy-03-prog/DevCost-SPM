import { useMemo, useState } from 'react'
import { Activity, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, DataTable, Modal, NumberInput, Slider } from '../components/ui'
import { calculateDeltaPercent, calculateExperienceCurve, calculateScenarioMetrics, calculateSensitivity, calculateSizeCurve, applyScenarioRatings, ratingPosition, type ScenarioControls } from '../lib/estimation/whatIf'
import { formatCurrency, formatNumber } from '../lib/estimation/format'
import { useProjectStore } from '../store/useProjectStore'

const ratingLabels = ['Very low', 'Low', 'Nominal', 'High', 'Very high']
const complexityLabels = [...ratingLabels, 'Extra high']

export default function WhatIfSimulator() {
  const project = useProjectStore((state) => state.project)
  const settings = useProjectStore((state) => state.settings)
  const savedScenarios = useProjectStore((state) => state.scenarios)
  const saveScenario = useProjectStore((state) => state.saveScenario)
  const removeScenario = useProjectStore((state) => state.removeScenario)
  const [controls, setControls] = useState<ScenarioControls>({
    complexity: ratingPosition(project.drivers.CPLX, 'complexity'),
    experience: ratingPosition(project.drivers.ACAP),
    schedule: ratingPosition(project.drivers.SCED),
    tools: ratingPosition(project.drivers.TOOL),
  })
  const [kloc, setKloc] = useState(project.kloc)
  const [teamSize, setTeamSize] = useState(project.teamSize)
  const [salary, setSalary] = useState(project.salary)
  const [saveOpen, setSaveOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [error, setError] = useState('')
  const scenarioDrivers = applyScenarioRatings(project.drivers, controls)
  const baseline = useMemo(() => calculateScenarioMetrics(project.kloc, project.teamSize, project.salary, project.mode, project.drivers), [project.kloc, project.teamSize, project.salary, project.mode, project.drivers])
  const scenario = useMemo(() => calculateScenarioMetrics(kloc, teamSize, salary, project.mode, scenarioDrivers), [kloc, teamSize, salary, project.mode, scenarioDrivers])
  const sensitivity = calculateSensitivity(project.kloc, project.mode, project.drivers)
  const sizeCurve = calculateSizeCurve(kloc, project.mode, scenarioDrivers)
  const experienceCurve = calculateExperienceCurve(kloc, salary, project.mode, scenarioDrivers)
  const savedRows = savedScenarios.map((saved) => {
    const metrics = calculateScenarioMetrics(saved.kloc, saved.teamSize, saved.salary, project.mode, saved.drivers)
    return [saved.name, `${formatNumber(saved.kloc)} KLOC`, `${formatNumber(metrics.effort)} PM`, `${formatNumber(metrics.duration)} mo`, formatCurrency(metrics.cost, settings.currency), <button className="icon-button delete-row" aria-label={`Remove ${saved.name}`} onClick={() => removeScenario(saved.id)}><Trash2 size={14} /></button>]
  })
  const updateControl = (key: keyof ScenarioControls, value: number) => setControls((current) => ({ ...current, [key]: value }))
  const reset = () => {
    setKloc(project.kloc)
    setTeamSize(project.teamSize)
    setSalary(project.salary)
    setControls({
      complexity: ratingPosition(project.drivers.CPLX, 'complexity'),
      experience: ratingPosition(project.drivers.ACAP),
      schedule: ratingPosition(project.drivers.SCED),
      tools: ratingPosition(project.drivers.TOOL),
    })
  }
  const commitScenario = () => {
    const name = scenarioName.trim()
    if (!name) {
      setError('Enter a name for this scenario.')
      return
    }
    if (savedScenarios.length >= 4) {
      setError('You can save up to four scenarios. Remove one before saving another.')
      return
    }
    saveScenario({ id: crypto.randomUUID(), name, kloc, teamSize, salary, drivers: scenarioDrivers })
    setScenarioName('')
    setError('')
    setSaveOpen(false)
  }
  const delta = (label: string, before: number, after: number, currency = false) => {
    const percent = calculateDeltaPercent(before, after)
    const favorable = percent <= 0
    return <div className="delta-card" key={label}><span>{label}</span><b>{currency ? formatCurrency(before, settings.currency) : formatNumber(before)}<small>{currency ? '' : label === 'Duration' ? ' months' : ' PM'}</small></b><span className="delta-arrow">→</span><b>{currency ? formatCurrency(after, settings.currency) : formatNumber(after)}<small>{currency ? '' : label === 'Duration' ? ' months' : ' PM'}</small></b><em className={favorable ? 'delta-good' : 'delta-bad'}>{percent > 0 ? '+' : ''}{formatNumber(percent)}%</em></div>
  }
  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow"><Activity size={14} /> SCENARIO PLANNING</span><h1>What-if simulator</h1><p>Change project assumptions and see how effort, schedule, and budget respond.</p></div><button className="secondary-button" onClick={reset}><RotateCcw size={14} /> Reset to baseline</button></div>
    <div className="whatif-layout"><div className="whatif-controls"><Card><div className="section-title-row"><div><span className="eyebrow">SCENARIO INPUTS</span><h2>Adjust key drivers</h2><p>Scenario edits do not change the saved project baseline.</p></div></div><Slider label="Project size" value={kloc} min={1} max={200} step={1} unit="KLOC" info="Estimated software size in thousands of delivered lines." onChange={setKloc} /><Slider label="Product complexity (CPLX)" value={controls.complexity} min={1} max={6} unit={complexityLabels[controls.complexity - 1]} info="Higher complexity increases the Intermediate COCOMO effort adjustment." onChange={(value) => updateControl('complexity', value)} /><Slider label="Team experience (ACAP / AEXP / PCAP)" value={controls.experience} min={1} max={5} unit={ratingLabels[controls.experience - 1]} info="Maps analyst, application, and programmer experience to matching COCOMO ratings." onChange={(value) => updateControl('experience', value)} /><Slider label="Schedule pressure (SCED)" value={controls.schedule} min={1} max={5} unit={ratingLabels[controls.schedule - 1]} info="Changes the required schedule rating and its Intermediate COCOMO multiplier." onChange={(value) => updateControl('schedule', value)} /><Slider label="Tool support (TOOL)" value={controls.tools} min={1} max={5} unit={ratingLabels[controls.tools - 1]} info="Changes the software tool use rating and corresponding cost-driver multiplier." onChange={(value) => updateControl('tools', value)} /><div className="scenario-number-grid"><NumberInput label="Team size" value={teamSize} min={1} unit="people" info="FTE team size for the scenario time calculation." onChange={setTeamSize} /><NumberInput label="Average monthly salary" value={salary} min={0} step={1000} unit={settings.currency} info="Average monthly cost per person used to estimate scenario labor cost." onChange={setSalary} /></div><button className="primary-button save-scenario-button" onClick={() => setSaveOpen(true)} disabled={savedScenarios.length >= 4}><Save size={15} /> Save named scenario ({savedScenarios.length}/4)</button></Card></div>
    <div className="whatif-results"><Card><div className="section-title-row"><div><span className="eyebrow">BASELINE VS SCENARIO</span><h2>Impact summary</h2><p>Lower effort, duration, and cost are shown as favorable changes.</p></div></div><div className="delta-grid">{delta('Effort', baseline.effort, scenario.effort)}{delta('Duration', baseline.duration, scenario.duration)}{delta('Cost', baseline.cost, scenario.cost, true)}</div></Card><section className="whatif-charts"><Card className="chart-card"><div className="section-heading"><h2>Effort vs. size</h2><p>Intermediate COCOMO effort across the selected size range.</p></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={sizeCurve}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#ececf3" /><XAxis dataKey="x" tickFormatter={(value: number) => `${formatNumber(value)}K`} tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`${formatNumber(Number(value))} PM`, 'Effort']} labelFormatter={(value) => `${formatNumber(Number(value))} KLOC`} /><Area dataKey="y" type="monotone" stroke="#766be2" fill="#766be2" fillOpacity={0.14} /></AreaChart></ResponsiveContainer></div><p className="chart-alt">Size changes are evaluated with the current scenario drivers and mode.</p></Card><Card className="chart-card"><div className="section-heading"><h2>Cost vs. team experience</h2><p>Improved experience changes personnel multipliers and effort.</p></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><LineChart data={experienceCurve}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#ececf3" /><XAxis dataKey="x" tickFormatter={(value: number) => ratingLabels[value - 1] ?? ''} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} /><YAxis tickFormatter={(value: number) => `${formatNumber(value / 1000, 0)}k`} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [formatCurrency(Number(value), settings.currency), 'Labor cost']} /><Line dataKey="y" type="monotone" stroke="#53b690" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div><p className="chart-alt">Salary stays constant; experience ratings move together across ACAP, AEXP, and PCAP.</p></Card></section><Card className="chart-card sensitivity-card"><div className="section-heading"><h2>Effort sensitivity</h2><p>Percent change from baseline when one driver is set to a high-impact reference rating.</p></div><div className="sensitivity-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={sensitivity} layout="vertical" margin={{ left: 18, right: 24 }}><CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="#ececf3" /><XAxis type="number" tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="driver" width={143} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Effort change']} /><Bar dataKey="impact" radius={[0, 4, 4, 0]}>{sensitivity.map((item) => <Cell key={item.driver} fill={item.impact > 0 ? '#de7d83' : '#58b791'} />)}</Bar></BarChart></ResponsiveContainer></div><p className="chart-alt">Larger absolute bars indicate a more influential driver for the current project. Drivers are changed one at a time.</p></Card></div></div>
    <Card className="saved-scenarios"><div className="section-title-row"><div><span className="eyebrow">SCENARIO LIBRARY</span><h2>Saved scenarios</h2><p>Keep up to four named alternatives for review.</p></div><span className="scenario-count">{savedScenarios.length} / 4 saved</span></div>{savedRows.length ? <DataTable headers={['Scenario', 'Size', 'Effort', 'Duration', 'Cost', '']} rows={savedRows} /> : <div className="empty-inline"><Plus size={16} /><span>No saved scenarios yet. Save a scenario to compare it here.</span></div>}</Card>
    {saveOpen && <Modal title="Save this scenario" onClose={() => { setSaveOpen(false); setError('') }} actions={<><button className="secondary-button" onClick={() => setSaveOpen(false)}>Cancel</button><button className="primary-button" onClick={commitScenario}>Save scenario</button></>}><label className="field"><span className="field-label">Scenario name</span><input autoFocus value={scenarioName} maxLength={40} placeholder="e.g. Experienced team, longer schedule" onChange={(event) => { setScenarioName(event.target.value); setError('') }} />{error && <span className="field-error" role="alert">{error}</span>}</label></Modal>}
  </main>
}
