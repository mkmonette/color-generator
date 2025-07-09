const isValidHex = (hex: string) =>
  /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex)

const ColorOverrides: FC<ColorOverridesProps> = ({ colors, onColorChange }) => {
  const [localColors, setLocalColors] = useState<Record<string, string>>(colors)

  useEffect(() => {
    setLocalColors(colors)
  }, [colors])

  const handleHexChange = (key: string, hex: string) => {
    setLocalColors(prev => ({ ...prev, [key]: hex }))
    if (isValidHex(hex)) {
      onColorChange(key, hex)
    }
  }

  const handleColorInputChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    handleHexChange(key, e.target.value)
  }

  const handleTextInputBlur = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (!isValidHex(value)) {
      setLocalColors(prev => ({ ...prev, [key]: colors[key] }))
    }
  }

  return (
    <div className="color-overrides">
      {Object.entries(localColors).map(([key, value]) => (
        <div key={key} className="color-field">
          <label htmlFor={`color-${key}`} className="color-label">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <input
            id={`color-${key}`}
            type="color"
            className="color-picker"
            value={isValidHex(value) ? value : '#ffffff'}
            onChange={handleColorInputChange(key)}
          />
          <input
            type="text"
            className={`color-hex-input ${isValidHex(value) ? '' : 'invalid'}`}
            value={value}
            onChange={handleColorInputChange(key)}
            onBlur={handleTextInputBlur(key)}
            maxLength={7}
            placeholder="#ffffff"
          />
        </div>
      ))}
    </div>
  )
}

export default ColorOverrides