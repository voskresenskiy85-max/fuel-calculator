const express = require('express');
const path = require('path');
const cors = require('cors');

// Обёртка над node-fetch для CommonJS
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

// Твой токен MultiGO
const TOKEN = 'Oc4HpBGVFZCjsaVF42JCpQ8SBswVYPuhP96TrZUp3bXOBU0O';
const BASE_URL = `https://api7.multigo.ru/3/rpc/terminal/${TOKEN}`;

// Раздаём статику (index.html) из папки public
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Прокси к MultiGO: делаем POST с пустым телом {}
app.get('/api/regions', async (req, res) => {
  try {
    const resp = await fetch(`${BASE_URL}/get/avg/by/regions`);

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('MultiGO HTTP error:', resp.status, txt);
      return res
        .status(500)
        .json({ error: 'Bad response from MultiGO', status: resp.status });
    }

    const json = await resp.json();

    if (json.err && json.err !== 0) {
      console.error('MultiGO API err code:', json.err);
      return res
        .status(500)
        .json({ error: 'MultiGO API error', err: json.err });
    }

    const list =
      json.data && Array.isArray(json.data.list) ? json.data.list : [];
    const rows = list.flatMap(block => block || []);

    res.json(rows);
  } catch (e) {
    console.error('API error:', e);
    res.status(500).json({ error: 'Server error', details: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
