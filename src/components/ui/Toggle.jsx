export default function Toggle({ checked, onChange, label }) {
    return (
        <div className="toggle-wrapper">
            <div
                className={`toggle ${checked ? 'active' : ''}`}
                onClick={() => onChange(!checked)}
                role="switch"
                aria-checked={checked}
            >
                <div className="toggle-knob"></div>
            </div>
            {label && <span style={{ fontSize: '0.875rem', color: checked ? 'var(--color-success)' : 'var(--color-gray-500)' }}>{label}</span>}
        </div>
    );
}
