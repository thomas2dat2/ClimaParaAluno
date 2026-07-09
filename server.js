const http = require('http');
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
};

async function buscarClima(cidade) {
    const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&name=" + encodeURIComponent(cidade);
    const geoResp = await fetch(geoUrl);
    const geoData = await geoResp.json();

    if (!geoData.results || geoData.results.length === 0) {
        return { erro: "Cidade não encontrada" };
    }
    const local = geoData.results[0];
    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current_weather=true`;
    const climaResp = await fetch(climaUrl);
    const climaData = await climaResp.json();

    if (!climaData.current_weather) {
        return { erro: "Dados de clima indisponíveis" };
    }

    return {
        cidade: local.name,
        pais: local.country || "",
        temperatura: climaData.current_weather.temperature,
        vento: climaData.current_weather.windspeed,
        codigo: climaData.current_weather.weathercode,
    };
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/clima") {
        const cidade = url.searchParams.get("cidade");
        if (!cidade) {
            res.writeHead(400, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({ erro: "Parâmetro 'cidade' é obrigatório" }));
        }
        try {
            const dados = await buscarClima(cidade);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(dados));
        }catch(e) {
            res.writeHead(500,{ "Content-Type": "application/json; charset=utf-8"});
            res.end(JSON.stringify({erro: "Erro ao buscar dados do clima"}));
        }
    }
    let arquivo = url.pathname === "/" ? "/index.html" : url.pathname;
    const caminho = path.join(PUBLIC_DIR, arquivo);
    const ext = path.extname(caminho);
    fs.readFile(caminho, (err, conteudo) => {
        if (err) {
            res.writeHead(404, { "Content-Type": MIME[ext] || "text/plain; charset=utf-8" });
            return res.end("arquivo não encontrado");
        }
        res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain; charset=utf-8" });
        res.end(conteudo);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
