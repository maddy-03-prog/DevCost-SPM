import { useMemo, useRef, useState } from 'react'
import { Download, FileJson2, FileSpreadsheet, Printer, Upload } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, DataTable, StatCard, Toast } from '../components/ui'
import { formatCurrency } from '../lib/estimation/format'
import { calculateReportData } from '../lib/estimation/report'
import { buildCsv, createProjectSnapshot, parseProjectSnapshot } from '../lib/projectFile'
import { useNumberFormatter } from '../hooks/useNumberFormatter'
import { useProjectStore } from '../store/useProjectStore'

const palette = ['#7469e4', '#61a4dc', '#5bc39b', '#f0b467', '#e78391']

function downloadFile(filename: string, content: string | Blob, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function svgToPng(svgElement: SVGSVGElement): Promise<string> {
  const svg = svgElement.cloneNode(true) as SVGSVGElement
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const source = new XMLSerializer().serializeToString(svg)
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth * 2
        canvas.height = image.naturalHeight * 2
        const context = canvas.getContext('2d')
        if (!context) throw new Error('The browser could not create an image canvas.')
        context.scale(2, 2)
        context.drawImage(image, 0, 0)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('A report chart could not be rendered for PDF export.'))
    }
    image.src = url
  })
}

export default function Reports() {
  const project = useProjectStore((state) => state.project)
  const settings = useProjectStore((state) => state.settings)
  const scenarios = useProjectStore((state) => state.scenarios)
  const loadProjectData = useProjectStore((state) => state.loadProjectData)
  const formatNumber = useNumberFormatter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const report = useMemo(() => calculateReportData(project), [project])
  const methods = report.methods
  const comparisonRows = methods.map((item) => [item.method, `${formatNumber(item.effort)} PM`, `${formatNumber(item.duration)} months`, `${formatNumber(item.teamSize)} people`, formatCurrency(item.cost, settings.currency)])
  const phaseRows = report.phases.map((item) => [item.phase, `${item.percentage}%`, `${formatNumber(item.personMonths)} PM`])
  const chartComparison = methods.map((item) => ({ method: item.method, effort: item.effort }))
  const moduleRows = [
    ['Basic COCOMO', `${formatNumber(report.basic.effort)} PM`, `${formatNumber(report.basic.duration)} months`, `${formatNumber(report.basic.people)} people`],
    ['Intermediate COCOMO', `${formatNumber(report.intermediate.effort)} PM`, `${formatNumber(report.intermediate.duration)} months`, `${formatNumber(report.intermediate.people)} people`],
    ['Function Points', `${formatNumber(report.functionPoints.effort)} PM`, `${formatNumber(report.functionPoints.afp)} AFP`, `${formatNumber(report.functionPoints.ufp)} UFP`],
    ['LOC productivity', `${formatNumber(report.loc.personMonths)} PM`, `${formatNumber(report.loc.duration)} months`, `${formatNumber(report.loc.personHours)} hours`],
    ['Unit productivity', `${formatNumber(report.productivity.personMonths)} PM`, `${formatNumber(report.productivity.duration)} months`, `${formatNumber(report.productivity.personHours)} hours`],
    ['Three-Point PERT', `${formatNumber(report.pert.expected)} PM`, `SD ${formatNumber(report.pert.standardDeviation)} PM`, 'Expert range'],
  ]
  const exportCsv = () => {
    const rows = [
      ['DevCost report', project.name],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Module', 'Metric', 'Value', 'Unit'],
      ['COCOMO', 'Basic effort', String(report.basic.effort), 'person-months'],
      ['COCOMO', 'Basic duration', String(report.basic.duration), 'months'],
      ['COCOMO', 'Intermediate EAF', String(report.intermediate.eaf), 'multiplier'],
      ['Function Points', 'UFP', String(report.functionPoints.ufp), 'points'],
      ['Function Points', 'VAF', String(report.functionPoints.vaf), 'multiplier'],
      ['Function Points', 'AFP', String(report.functionPoints.afp), 'points'],
      ['LOC', 'Effort', String(report.loc.personMonths), 'person-months'],
      ['Productivity', 'Effort', String(report.productivity.personMonths), 'person-months'],
      ['PERT', 'Expected effort', String(report.pert.expected), 'person-months'],
      ['Budget', 'Total', String(report.budget.total), settings.currency],
      ['Budget', 'Monthly average', String(report.budget.monthly), `${settings.currency} / month`],
      [],
      ['Method', 'Effort (PM)', 'Duration (months)', 'Team size', `Labor cost (${settings.currency})`],
      ...methods.map((item) => [item.method, String(item.effort), String(item.duration), String(item.teamSize), String(item.cost)]),
      [],
      ['Phase', 'Allocation', 'Effort (PM)'],
      ...report.phases.map((item) => [item.phase, `${item.percentage}%`, String(item.personMonths)]),
      [],
      ['Assumptions', ...report.assumptions],
      ['Risks', ...report.risks],
    ]
    downloadFile('devcost-report.csv', buildCsv(rows), 'text/csv;charset=utf-8')
    setNotice('CSV report downloaded.')
    setError('')
  }
  const exportJson = () => {
    const snapshot = createProjectSnapshot(project, settings, scenarios)
    downloadFile('devcost-project.json', JSON.stringify(snapshot, null, 2), 'application/json')
    setNotice('Project JSON downloaded.')
    setError('')
  }
  const importJson = async (file?: File) => {
    if (!file) return
    try {
      const snapshot = parseProjectSnapshot(JSON.parse(await file.text()) as unknown)
      loadProjectData(snapshot.project, snapshot.settings, snapshot.scenarios)
      setNotice(`Loaded project "${snapshot.project.name}".`)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The selected project file could not be loaded.')
      setNotice('')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }
  const exportPdf = async () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('DevCost — Project Estimate', 14, 18)
      doc.setFontSize(10)
      doc.text(project.name, 14, 25)
      doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 31)
      autoTable(doc, {
        startY: 37,
        head: [['Module', 'Result', 'Details']],
        body: [
          ['Basic COCOMO', `${formatNumber(report.basic.effort)} PM`, `${formatNumber(report.basic.duration)} months · ${formatNumber(report.basic.people)} people`],
          ['Intermediate COCOMO', `${formatNumber(report.intermediate.effort)} PM`, `EAF ${formatNumber(report.intermediate.eaf, 3)}`],
          ['Function Points', `${formatNumber(report.functionPoints.afp)} AFP`, `${formatNumber(report.functionPoints.effort)} PM · ${formatNumber(report.functionPoints.ufp)} UFP`],
          ['Budget', formatCurrency(report.budget.total, settings.currency), `${formatCurrency(report.budget.monthly, settings.currency)} average / month`],
        ],
        styles: { fontSize: 8 },
      })
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Method comparison', 14, 17)
      autoTable(doc, { startY: 22, head: [['Method', 'Effort', 'Duration', 'Team', 'Labor cost']], body: methods.map((item) => [item.method, `${formatNumber(item.effort)} PM`, `${formatNumber(item.duration)} mo`, formatNumber(item.teamSize), formatCurrency(item.cost, settings.currency)]), styles: { fontSize: 7 } })
      doc.setFontSize(13)
      doc.text('Assumptions and risks', 14, 132)
      doc.setFontSize(8)
      report.assumptions.concat(report.risks).forEach((item, index) => doc.text(`- ${item}`, 15, 140 + index * 8, { maxWidth: 180 }))
      const chartElements = Array.from(document.querySelectorAll<HTMLElement>('.report-chart'))
      const images = await Promise.all(chartElements.map((element) => {
        const svg = element.querySelector('svg')
        if (!svg) throw new Error('A report chart is still loading. Wait for charts to render and try again.')
        return svgToPng(svg)
      }))
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Report charts', 14, 17)
      images.forEach((image, index) => {
        const position = index % 2
        if (index > 0 && position === 0) {
          doc.addPage()
          doc.setFontSize(14)
          doc.text('Report charts (continued)', 14, 17)
        }
        doc.addImage(image, 'PNG', 14, position === 0 ? 24 : 153, 182, 112)
      })
      doc.save('devcost-report.pdf')
      setNotice('PDF report downloaded with charts.')
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'PDF export failed. Please try again or use Print.')
      setNotice('')
    }
  }
  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow"><Download size={14} /> PROJECT DELIVERABLES</span><h1>Reports</h1><p>Review an executive summary and export a portable project estimate.</p></div><div className="report-actions"><button className="secondary-button" onClick={exportCsv}><FileSpreadsheet size={15} /> CSV</button><button className="secondary-button" onClick={exportJson}><FileJson2 size={15} /> Project JSON</button><button className="primary-button" onClick={exportPdf}><Download size={15} /> Export PDF</button></div></div>
    <div className="report-toolbar"><button className="secondary-button" onClick={() => window.print()}><Printer size={15} /> Print report</button><button className="secondary-button" onClick={() => fileInput.current?.click()}><Upload size={15} /> Load project JSON</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(event) => void importJson(event.target.files?.[0])} /><span>Generated {new Date().toLocaleDateString()} · Saved locally</span></div>
    {notice && <Toast message={notice} onClose={() => setNotice('')} />}{error && <div className="import-error" role="alert">{error}</div>}
    <Card className="executive-card"><div className="executive-heading"><div><span className="eyebrow">EXECUTIVE SUMMARY</span><h2>{project.name}</h2><p>{project.description}</p></div><span className="report-tag">SPM estimate</span></div><p className="executive-summary">For the current {project.kloc} KLOC {project.mode.toLowerCase()} baseline, Basic COCOMO estimates {formatNumber(report.basic.effort)} person-months over {formatNumber(report.basic.duration)} months. Across five methods, effort ranges from {formatNumber(report.comparison.min)} to {formatNumber(report.comparison.max)} person-months. The current budget baseline is {formatCurrency(report.budget.total, settings.currency)} including contingency and configured overhead.</p></Card>
    <section className="report-stats"><StatCard label="COCOMO effort" value={`${formatNumber(report.basic.effort)} PM`} detail={`${formatNumber(report.basic.duration)} months`} /><StatCard label="Intermediate EAF" value={formatNumber(report.intermediate.eaf, 3)} detail="15 cost-driver multipliers" /><StatCard label="Adjusted FP" value={`${formatNumber(report.functionPoints.afp)} AFP`} detail={`${formatNumber(report.functionPoints.effort)} person-months`} /><StatCard label="Total budget" value={formatCurrency(report.budget.total, settings.currency)} detail={`${formatCurrency(report.budget.monthly, settings.currency)} per month`} /></section>
    <section className="report-chart-grid"><Card className="chart-card report-chart"><div className="section-heading"><h2>Cost breakdown</h2><p>Estimated costs by budget category.</p></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report.costBreakdown.filter((entry) => entry.value > 0)} dataKey="value" nameKey="name" innerRadius="53%" outerRadius="77%" paddingAngle={3}>{report.costBreakdown.filter((entry) => entry.value > 0).map((item, index) => <Cell key={item.name} fill={palette[index % palette.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value), settings.currency)} /></PieChart></ResponsiveContainer></div><p className="chart-alt">{report.costBreakdown.map((item) => `${item.name}: ${formatCurrency(item.value, settings.currency)}`).join(' · ')}</p></Card><Card className="chart-card report-chart"><div className="section-heading"><h2>Effort by method</h2><p>Estimates in person-months across five techniques.</p></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartComparison} layout="vertical" margin={{ left: 20, right: 15 }}><CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="#ececf3" /><XAxis type="number" tickLine={false} axisLine={false} /><YAxis type="category" dataKey="method" width={115} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} /><Tooltip formatter={(value) => [`${formatNumber(Number(value))} PM`, 'Effort']} /><Bar dataKey="effort" fill="#766be2" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div><div className="chart-alt">Full comparison values are listed in the tables below.</div></Card><Card className="chart-card report-chart"><div className="section-heading"><h2>Staffing profile</h2><p>Rayleigh-style staffing profile over the Basic COCOMO duration.</p></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={report.staffing}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#ececf3" /><XAxis dataKey="month" tickFormatter={(value: number) => `${formatNumber(value, 0)} mo`} tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`${formatNumber(Number(value))} people`, 'Staffing']} /><Area dataKey="people" type="monotone" stroke="#61a4dc" fill="#61a4dc" fillOpacity={0.15} /></AreaChart></ResponsiveContainer></div><div className="chart-alt">The profile is a normalized planning shape, not a staffing commitment.</div></Card><Card className="chart-card report-chart"><div className="section-heading"><h2>Phase distribution</h2><p>Mode-specific phase allocation in person-months.</p></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.phases} layout="vertical" margin={{ left: 8, right: 15 }}><CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="#ececf3" /><XAxis type="number" tickLine={false} axisLine={false} /><YAxis type="category" dataKey="phase" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} /><Tooltip formatter={(value) => [`${formatNumber(Number(value))} PM`, 'Effort']} /><Bar dataKey="personMonths" fill="#5bbb96" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div><p className="chart-alt">Plans &amp; Requirements {report.phases[0]?.percentage}%, Design {report.phases[1]?.percentage}%, Coding {report.phases[2]?.percentage}%, Integration &amp; Test {report.phases[3]?.percentage}%.</p></Card></section>
    <Card className="report-table"><div className="section-title-row"><div><span className="eyebrow">MODULE OUTPUTS</span><h2>All module results</h2></div></div><DataTable headers={['Technique', 'Effort / primary result', 'Duration / secondary', 'Additional detail']} rows={moduleRows} /></Card>
    <Card className="report-table"><div className="section-title-row"><div><span className="eyebrow">ESTIMATE CROSS-CHECK</span><h2>Method comparison</h2></div></div><DataTable headers={['Method', 'Effort', 'Duration', 'Team size', 'Labor cost']} rows={comparisonRows} /><p className="chart-alt">{report.comparison.insight}</p></Card>
    <section className="report-tables-two"><Card className="report-table"><div className="section-title-row"><div><h2>Phase effort</h2></div></div><DataTable headers={['Phase', 'Share', 'Effort']} rows={phaseRows} /></Card><Card className="report-table"><div className="section-title-row"><div><h2>Budget detail</h2></div></div><DataTable headers={['Category', 'Estimated total']} rows={report.costBreakdown.map((item) => [item.name, formatCurrency(item.value, settings.currency)])} /><div className="detail-total"><span>Total</span><b>{formatCurrency(report.budget.total, settings.currency)}</b></div></Card></section>
    <section className="report-notes"><Card><div className="section-title-row"><div><span className="eyebrow">ASSUMPTIONS</span><h2>Model notes</h2></div></div><ul>{report.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></Card><Card><div className="section-title-row"><div><span className="eyebrow">RISKS</span><h2>Review before commitment</h2></div></div><ul>{report.risks.map((item) => <li key={item}>{item}</li>)}</ul></Card></section>
  </main>
}
