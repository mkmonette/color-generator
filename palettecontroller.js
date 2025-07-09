const chroma = require('chroma-js');
const Palette = require('./palettemodel');

function sanitizeName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return null;
  if (!/^[\w\s-]+$/.test(trimmed)) return null;
  return trimmed;
}

function validateHexColor(c) {
  return typeof c === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c.trim());
}

async function generatePalette(req, res) {
  try {
    const { baseColor, scheme = 'analogous' } = req.body;
    let { count } = req.body;
    if (!baseColor) {
      return res.status(400).json({ error: 'baseColor is required' });
    }
    count = parseInt(count, 10);
    if (isNaN(count) || count < 1 || count > 20) {
      return res.status(400).json({ error: 'count must be an integer between 1 and 20' });
    }
    let color;
    try {
      color = chroma(baseColor);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid baseColor format' });
    }
    let colors = [];
    switch (scheme.toLowerCase()) {
      case 'monochromatic':
      case 'monochrome':
        colors = chroma
          .scale([color.darken(2), color, color.brighten(2)])
          .mode('lab')
          .colors(count);
        break;
      case 'complementary':
        colors = [baseColor, color.set('hsl.h', '+180').hex()];
        if (count > 2) {
          colors = chroma.scale(colors).mode('lab').colors(count);
        }
        break;
      case 'triadic':
        colors = [
          baseColor,
          color.set('hsl.h', '+120').hex(),
          color.set('hsl.h', '+240').hex()
        ];
        if (count > 3) {
          colors = chroma.scale(colors).mode('lab').colors(count);
        }
        break;
      case 'tetradic':
      case 'rectangle':
        const t1 = color.set('hsl.h', '+60').hex();
        const t2 = color.set('hsl.h', '+180').hex();
        const t3 = color.set('hsl.h', '+240').hex();
        colors = [baseColor, t1, t2, t3];
        if (count > 4) {
          colors = chroma.scale(colors).mode('lab').colors(count);
        }
        break;
      case 'analogous':
      default:
        colors = chroma
          .scale([
            color.set('hsl.h', '-30').hex(),
            baseColor,
            color.set('hsl.h', '+30').hex()
          ])
          .mode('lab')
          .colors(count);
        break;
    }
    return res.json({ palette: colors });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate palette', details: err.message });
  }
}

async function savePalette(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const rawName = req.body.name || 'Untitled Palette';
    const name = sanitizeName(rawName);
    if (!name) {
      return res.status(400).json({ error: 'Invalid palette name' });
    }
    const colors = req.body.colors;
    if (!Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ error: 'colors array is required' });
    }
    const allValid = colors.every(c => validateHexColor(c));
    if (!allValid) {
      return res.status(400).json({ error: 'colors must be valid hex strings' });
    }
    const newPalette = new Palette({
      name,
      colors,
      user: userId,
      createdAt: new Date()
    });
    const saved = await newPalette.save();
    const response = {
      id: saved._id,
      name: saved.name,
      colors: saved.colors,
      createdAt: saved.createdAt
    };
    return res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save palette', details: err.message });
  }
}

async function getPalettes(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { user: userId };
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;
    const totalCount = await Palette.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const docs = await Palette.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('_id name colors createdAt');
    const palettes = docs.map(doc => ({
      id: doc._id,
      name: doc.name,
      colors: doc.colors,
      createdAt: doc.createdAt
    }));
    return res.json({
      palettes,
      meta: { totalCount, totalPages, page, limit }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch palettes', details: err.message });
  }
}

async function deletePaletteController(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const palette = await Palette.findById(id);
    if (!palette) {
      return res.status(404).json({ error: 'Palette not found' });
    }
    if (palette.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await palette.deleteOne();
    return res.json({ message: 'Palette deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete palette', details: err.message });
  }
}

module.exports = {
  generatePalette,
  savePalette,
  getPalettes,
  deletePaletteController
};