const express = require('express');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
const chokidar = require('chokidar');
const { tiktokdl, instagramdl } = require('@bochilteam/scraper');

// Path ke file keys
const keysPath = path.join(__dirname, 'keys.json');

// Fungsi untuk memuat keys
let keys = require(keysPath);

// Fungsi untuk mereload keys
const reloadKeys = () => {
  delete require.cache[require.resolve(keysPath)];
  keys = require(keysPath);
  console.log('Keys have been reloaded');
};

// Fungsi untuk mendapatkan waktu reset berikutnya
const getNextResetTime = () => {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(24, 0, 0, 0); // Set ke tengah malam hari berikutnya
  return nextReset;
};

module.exports = (client) => {
  const app = express();

  // Middleware
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'views')));
  app.use(express.json());

  // Middleware untuk memeriksa kunci API dan batas
  app.use('/tiktok', (req, res, next) => {
    const key = req.query.key;
    if (!key) {
      return res.status(403).json({ error: 'Invalid key' });
    }

    let keyType = null;
    if (keys.normalKeys[key]) {
      keyType = 'normalKeys';
    } else if (keys.premiumKeys[key]) {
      keyType = 'premiumKeys';
    }

    if (!keyType) {
      return res.status(403).json({ error: 'Invalid key' });
    }

    const keyData = keys[keyType][key];
    if (keyData.usage >= keyData.limit) {
      const nextReset = getNextResetTime();
      const timeRemaining = nextReset.getTime() - new Date().getTime();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      return res.status(429).json({
        error: 'Limit exceeded',
        message: `Limit exceeded. Reset in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
      });
    }

    keyData.usage += 1;
    fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

    next();
  });

  // Middleware untuk memeriksa kunci API dan batas
  app.use('/ig', (req, res, next) => {
    const key = req.query.key;
    if (!key) {
      return res.status(403).json({ error: 'Invalid key' });
    }

    let keyType = null;
    if (keys.normalKeys[key]) {
      keyType = 'normalKeys';
    } else if (keys.premiumKeys[key]) {
      keyType = 'premiumKeys';
    }

    if (!keyType) {
      return res.status(403).json({ error: 'Invalid key' });
    }

    const keyData = keys[keyType][key];
    if (keyData.usage >= keyData.limit) {
      const nextReset = getNextResetTime();
      const timeRemaining = nextReset.getTime() - new Date().getTime();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      return res.status(429).json({
        error: 'Limit exceeded',
        message: `Limit exceeded. Reset in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
      });
    }

    keyData.usage += 1;
    fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

    next();
  });

  // Define routes
  app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
  });

  app.get('/tiktok', async (req, res) => {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const data = await tiktokdl(url);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch TikTok video' });
    }
  });

  // Define routes
  app.get('/ig', async (req, res) => {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const data = await instagramdl(url);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instagram url' });
    }
  });

  // Fungsi untuk reset limit
  const resetLimits = () => {
    for (let key in keys.normalKeys) {
      keys.normalKeys[key].usage = 0;
    }
    for (let key in keys.premiumKeys) {
      keys.premiumKeys[key].usage = 0;
    }
    fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
    console.log('Limits have been reset');
  };

  // Jadwalkan reset limit pada tengah malam
  schedule.scheduleJob('0 0 * * *', resetLimits);

  // Memantau perubahan pada keys.json
  chokidar.watch(keysPath).on('change', () => {
    console.log('Detected changes in keys.json');
    reloadKeys();
  });

  // Mulai server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
  });
};
