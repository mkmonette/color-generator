function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace('#', '').trim()
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  let c = cleaned
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('')
  }
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }
  return { h, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0,
    g = 0,
    b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v: number) => {
    const hex = Math.round((v + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function mapColors(layout: Layout): MappedColors {
  const { colors, mode = 'light', scheme = 'monochromatic', mood = 'neutral' } = layout
  const result: MappedColors = {}
  Object.entries(colors).forEach(([name, hex]) => {
    let { h, s, l } = hexToHsl(hex)
    if (mood === 'warm') h = (h + 10) % 360
    if (mood === 'cool') h = (h + 350) % 360
    if (mode === 'dark') l = clamp(l - 10, 0, 100)
    else l = clamp(l + 5, 0, 100)
    const base = hslToHex(h, s, l)
    result[name] = base

    let h1 = h,
      l1 = l,
      h2 = h,
      l2 = l

    switch (scheme) {
      case 'monochromatic':
        l1 = clamp(l + 20, 0, 100)
        l2 = clamp(l - 20, 0, 100)
        break
      case 'analogous':
        h1 = (h + 30) % 360
        h2 = (h + 330) % 360
        break
      case 'complementary':
        h1 = (h + 180) % 360
        l2 = clamp(l + 15, 0, 100)
        break
      case 'triadic':
        h1 = (h + 120) % 360
        h2 = (h + 240) % 360
        break
    }

    const variant1 = hslToHex(h1, s, clamp(l1, 0, 100))
    const variant2 = hslToHex(h2, s, clamp(l2, 0, 100))
    result[`${name}Variant1`] = variant1
    result[`${name}Variant2`] = variant2
  })
  return result
}

export const ColorMapping: React.FC<ColorMappingProps> = ({ layout }) => {
  const mapped = useMemo(() => mapColors(layout), [layout])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {Object.entries(mapped).map(([key, color]) => (
        <div
          key={key}
          style={{
            backgroundColor: color,
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            minWidth: '100px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{key}</div>
          <div>{color}</div>
        </div>
      ))}
    </div>
  )
}