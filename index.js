const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Системный эндпоинт метаданных для authlib-injector
app.get('/api/yggdrasil', (req, res) => {
    res.json({
        meta: {
            serverName: "Gruppas RP",
            implementationName: "gruppas-auth",
            implementationVersion: "1.0.0"
        },
        skinDomains: ["accountgruppas.gt.tc", "onrender.com"]
    });
});

// Отдача текстуры скина клиенту игры по нику/UUID
app.get('/api/yggdrasil/sessionserver/session/minecraft/profile/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const username = req.query.name || "Player";

    const skinUrl = `http://accountgruppas.gt.tc/skins/${username}.png`;

    const textureData = {
        timestamp: Date.now(),
        profileId: uuid,
        profileName: username,
        textures: {
            SKIN: {
                url: skinUrl
            }
        }
    };

    const base64Textures = Buffer.from(JSON.stringify(textureData)).toString('base64');

    res.json({
        id: uuid,
        name: username,
        properties: [
            {
                name: "textures",
                value: base64Textures
            }
        ]
    });
});

// Настоящая проверка логина и пароля
app.post('/auth', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: "error", message: "Заполните логин и пароль" });
    }

    try {
        // Запрос к auth.php со стороны Render (серверные запросы не блокируются браузерным фильтром)
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await fetch('http://accountgruppas.gt.tc/api/auth.php', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = await response.json();
        return res.json(data);
    } catch (err) {
        // Если база сайта вернула ошибку парсинга или недоступна
        console.error("Auth proxy error:", err);
        return res.status(401).json({ status: "error", message: "Неверный логин или пароль" });
    }
});

app.listen(port, () => {
    console.log(`Auth server running on port ${port}`);
});
