const express = require('express');
const path = require('path');

const app = express();

// ====== НАСТРОЙКИ ======
const PORT = process.env.PORT || 3000;

const TOKEN = 'Oc4HpBGVFZCjsaVF42JCpQ8SBswVYPuhP96TrZUp3bXOBU0O';
const BASE_URL = `https://api7.multigo.ru/3/rpc/terminal/${TOKEN}`;

// Раздаём статику (папка public)
app.use(express.static(path.join(__dirname, 'public')));

// ====== API ======
app.get('/api/regions', async (req, res) => {
  try {
    const resp = await fetch(`${BASE_URL}/get/avg/by/regions`);

    if (!resp.ok) {
      console.error("MultiGO HTTP error:", resp.status, resp.statusText);
      return res.status(502).json({
        error: "Ошибка MultiGO",
        status: resp.status
      });
    }

    const json = await resp.json();

    const list = (json.data && Array.isArray(json.data.list)) ? json.data.list : [];
    const merged = list.flatMap(x => x);

    res.json(merged);
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
