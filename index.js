const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

    // Ссылка на скин с твоего сайта
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

app.listen(port, () => {
    console.log(`Auth server running on port ${port}`);
});
