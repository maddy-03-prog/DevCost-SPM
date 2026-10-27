import { type ReactNode, useState } from 'react'
import { Info, X } from 'lucide-react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon?: ReactNode }) {
  return <Card className="stat-card"><div className="stat-head"><span>{label}</span>{icon && <span className="stat-icon">{icon}</span>}</div><strong>{value}</strong>{detail && <small>{detail}</small>}</Card>
}

export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return <span className="tooltip-wrap"><button type="button" className="icon-button info-button" aria-label="More information" aria-expanded={open} onClick={() => setOpen(!open)}><Info size={15} /></button>{open && <span role="tooltip" className="tooltip-content">{text}</span>}</span>
}

type FieldProps = { label: string; unit?: string; info?: string; error?: string; children?: ReactNode }
export function Field({ label, unit, info, error, children }: FieldProps) {
  return <label className="field"><span className="field-label">{label}{unit && <span className="field-unit">{unit}</span>}{info && <Tooltip text={info} />}</span>{children}{error && <span className="field-error" role="alert">{error}</span>}</label>
}

export function NumberInput({ label, value, onChange, unit, info, min = 0, step = 1 }: { label: string; value: number; onChange: (value: number) => void; unit?: string; info?: string; min?: number; step?: number }) {
  return <Field label={label} unit={unit} info={info}><input type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>
}

export function Slider({ label, value, onChange, min, max, unit, info }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; unit?: string; info?: string }) {
  return <Field label={label} unit={`${value}${unit ? ` ${unit}` : ''}`} info={info}><input className="range-input" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>
}

export function Select({ label, value, options, onChange, info }: { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (value: string) => void; info?: string }) {
  return <Field label={label} info={info}><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return <div className="tabs" role="tablist">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={active === tab} className={active === tab ? 'active' : ''} onClick={() => onChange(tab)}>{tab}</button>)}</div>
}

export function Modal({ title, children, onClose, actions }: { title: string; children: ReactNode; onClose: () => void; actions?: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></header><div>{children}</div>{actions && <footer>{actions}</footer>}</section></div>
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="toast" role="status">{message}<button className="icon-button" aria-label="Dismiss notification" onClick={onClose}><X size={16} /></button></div>
}

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="table-scroll"><table><thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
}

export function ChartCard({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return <Card className="chart-card"><div className="section-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</Card>
}
