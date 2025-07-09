const colorSchemes: Array<{ value: ColorScheme; label: string }> = [
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'monochrome-dark', label: 'Monochrome Dark' },
  { value: 'monochrome-light', label: 'Monochrome Light' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'complement', label: 'Complement' },
  { value: 'triad', label: 'Triad' },
  { value: 'tetrad', label: 'Tetrad' },
]

const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  selectedScheme,
  onSchemeChange,
  disabled = false,
  id: propId,
  className = '',
}) => {
  const generatedId = useId()
  const selectId = propId ?? `color-scheme-select-${generatedId}`

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSchemeChange(e.target.value as ColorScheme)
  }

  return (
    <div className={`color-scheme-selector ${className}`}>
      <label htmlFor={selectId} className="color-scheme-selector__label">
        Color Scheme
      </label>
      <select
        id={selectId}
        className="color-scheme-selector__select"
        value={selectedScheme}
        onChange={handleChange}
        disabled={disabled}
      >
        {colorSchemes.map((scheme) => (
          <option key={scheme.value} value={scheme.value}>
            {scheme.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ColorSchemeSelector