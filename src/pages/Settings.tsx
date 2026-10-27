import { useState } from 'react'
import { Check, Palette, Settings2, SlidersHorizontal, Trash2 } from 'lucide-react'
import { Card, Field, Modal, Select } from '../components/ui'
import { useProjectStore } from '../store/useProjectStore'

const accents = [
  { name: 'Indigo', value: '#6258e8' }, { name: 'Violet', value: '#8759d8' },
  { name: 'Blue', value: '#397dd1' }, { name: 'Teal', value: '#218d88' },
  { name: 'Rose', value: '#cb567b' }, { name: 'Amber', value: '#b67624' },
]

export default function Settings() {
  const project = useProjectStore((state) => state.project)
  const settings = useProjectStore((state) => state.settings)
  const updateSettings = useProjectStore((state) => state.updateSettings)
  const updateProject = useProjectStore((state) => state.updateProject)
  const resetAll = useProjectStore((state) => state.resetAll)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const confirmReset = () => {
    resetAll()
    setResetOpen(false)
    setResetMessage('Project and display settings have been reset.')
  }
  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow"><Settings2 size={14} /> PERSONALIZE WORKSPACE</span><h1>Settings</h1><p>Choose how DevCost looks, formats estimates, and saves your project locally.</p></div></div>
    <div className="settings-layout"><div className="settings-main">
      <Card><div className="settings-title"><span className="settings-icon purple"><Palette size={17} /></span><div><h2>Appearance</h2><p>Theme and accent choices are saved in this browser.</p></div></div><div className="setting-section"><Field label="Theme" unit="display"><div className="theme-choice" role="group" aria-label="Color theme">{(['light', 'dark', 'system'] as const).map((theme) => <button key={theme} type="button" className={`theme-option ${settings.theme === theme ? 'selected' : ''}`} aria-pressed={settings.theme === theme} onClick={() => updateSettings({ theme })}><span className={`theme-swatch ${theme}`} />{theme[0]?.toUpperCase()}{theme.slice(1)}{settings.theme === theme && <Check size={14} />}</button>)}</div></Field><Field label="Accent color" unit="6 presets + custom"><div className="accent-options">{accents.map((accent) => <button key={accent.value} className={`accent-option ${settings.accent === accent.value ? 'active' : ''}`} aria-label={`${accent.name} accent`} aria-pressed={settings.accent === accent.value} title={accent.name} style={{ backgroundColor: accent.value }} onClick={() => updateSettings({ accent: accent.value })}>{settings.accent === accent.value && <Check size={15} />}</button>)}<label className="custom-color" title="Choose a custom accent"><input type="color" aria-label="Custom accent color" value={settings.accent} onChange={(event) => updateSettings({ accent: event.target.value })} /><span>Custom</span></label></div></Field></div></Card>
      <Card><div className="settings-title"><span className="settings-icon blue"><SlidersHorizontal size={17} /></span><div><h2>Regional preferences</h2><p>Adjust number grouping, currency, and information density.</p></div></div><div className="preference-grid"><Select label="Number format" value={settings.numberFormat} options={[{ value: 'Indian', label: 'Indian (12,34,567)' }, { value: 'International', label: 'International (1,234,567)' }]} onChange={(value) => updateSettings({ numberFormat: value as typeof settings.numberFormat })} info="Controls thousands grouping in numeric estimates throughout the app." /><Select label="Currency" value={settings.currency} options={['INR', 'USD', 'EUR', 'GBP'].map((value) => ({ value, label: value }))} onChange={(currency) => updateSettings({ currency: currency as typeof settings.currency })} info="Display currency used in the budget and scenario estimates." /><Select label="Interface density" value={settings.density} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} onChange={(density) => updateSettings({ density: density as typeof settings.density })} info="Compact density reduces spacing in cards and data tables." /></div></Card>
      <Card><div className="settings-title"><span className="settings-icon green"><Settings2 size={17} /></span><div><h2>Project details</h2><p>Project name and description appear in reports and the workspace bar.</p></div></div><div className="project-fields"><Field label="Project name" unit="required"><input maxLength={70} value={project.name} onChange={(event) => updateProject({ name: event.target.value })} /></Field><Field label="Description"><textarea rows={3} value={project.description} onChange={(event) => updateProject({ description: event.target.value })} /></Field></div></Card>
      <Card className="danger-card"><div className="settings-title"><span className="settings-icon danger"><Trash2 size={17} /></span><div><h2>Reset all data</h2><p>Clear the current project, saved scenarios, and display preferences.</p></div></div><button className="danger-button" onClick={() => setResetOpen(true)}><Trash2 size={14} /> Reset all data</button>{resetMessage && <span className="reset-message" role="status">{resetMessage}</span>}</Card>
    </div><aside className="settings-aside"><Card><span className="eyebrow">LOCAL-FIRST STORAGE</span><h2>Your data stays yours.</h2><p>Project inputs, scenarios, and preferences are saved in this browser's local storage. No account or backend is required.</p><div className="privacy-badge"><span /> Stored on this device</div></Card><Card><span className="eyebrow">ACCESSIBILITY</span><h2>Comfortable for everyone.</h2><p>Use your keyboard to navigate controls, choose a high-contrast accent, and use print styles for document-friendly reports.</p></Card></aside></div>
    {resetOpen && <Modal title="Reset all DevCost data?" onClose={() => setResetOpen(false)} actions={<><button className="secondary-button" onClick={() => setResetOpen(false)}>Cancel</button><button className="danger-button" onClick={confirmReset}>Reset data</button></>}><p className="modal-copy">This resets the project inputs, saved scenarios, and preferences in this browser. This action cannot be undone.</p></Modal>}
  </main>
}
