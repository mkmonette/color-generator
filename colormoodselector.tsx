const MOODS: { value: Mood; label: string; icon: JSX.Element }[] = [
  { value: 'warm', label: 'Warm', icon: <span>?</span> },
  { value: 'cool', label: 'Cool', icon: <span>??</span> },
  { value: 'neutral', label: 'Neutral', icon: <span>??</span> },
  { value: 'vibrant', label: 'Vibrant', icon: <span>?</span> },
  { value: 'pastel', label: 'Pastel', icon: <span>?</span> },
  { value: 'monochrome', label: 'Monochrome', icon: <span>??</span> },
]

const ColorMoodSelector: FC<ColorMoodSelectorProps> = ({
  selectedMood,
  onMoodChange,
  className = '',
}) => {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const handleChange = useCallback(
    (mood: Mood) => {
      if (mood !== selectedMood) {
        onMoodChange(mood)
      }
    },
    [onMoodChange, selectedMood],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const { key } = event
      let newIndex: number | null = null
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        newIndex = (index + 1) % MOODS.length
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        newIndex = (index - 1 + MOODS.length) % MOODS.length
      } else if (key === 'Home') {
        newIndex = 0
      } else if (key === 'End') {
        newIndex = MOODS.length - 1
      } else {
        return
      }
      event.preventDefault()
      const newMood = MOODS[newIndex].value
      handleChange(newMood)
      const ref = itemRefs.current[newIndex]
      if (ref) {
        ref.focus()
      }
    },
    [handleChange],
  )

  return (
    <div
      className={`color-mood-selector ${className}`}
      role="radiogroup"
      aria-label="Select color mood"
    >
      {MOODS.map(({ value, label, icon }, index) => {
        const isSelected = value === selectedMood
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={`color-mood-selector__item ${
              isSelected ? 'selected' : ''
            }`}
            onClick={() => handleChange(value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
          >
            <span className="color-mood-selector__icon">{icon}</span>
            <span className="color-mood-selector__label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(ColorMoodSelector)