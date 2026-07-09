const form = document.getElementById('form');
const inputCidade = document.getElementById('cidade');
const resultado = document.getElementById('resultado');

const DESCRICOES = {
    "0": "Céu limpo",
    "1": "Poucas nuvens",
    "2": "Parcialmente nublado",
    "3": "Nublado",
    "45": "Neblina",
    "48": "Neblina com geada",
    "51": "Garoa leve",
    "61": "Chuva fraca",
    "63": "Chuva moderada",
    "65": "Chuva forte",
    "71": "Neve fraca",
    "80": "Pancadas de chuva",
    "95":"Tempestade",
};
from.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cidade = inputCidade.value.trim();
    if (!cidade) return;

    resultado.innerHTML = "<p>Carregando...</p>";

    try {
        const resp = await fetch("/api/clima?cidade=" + encodeURIComponent(cidade));
        const dados = await resp.json();

        if (dados.erro) {
            resultado.innerHTML = `<p class="erro">${dados.erro}</p>`;
            return;
        }
        const descricao = DESCRICOES[dados.codigo] || "Condição desconhecida";
        const temp = (typeof dados.temperatura === 'number') ? dados.temperatura.toFixed(1) : Number(dados.temperatura).toFixed(1);

        resultado.innerHTML = `
        <div class="local">${dados.cidade}, ${dados.pais}</div>
        <div class ="temp">${temp} °C</div>
        <div class="detalhe">${descricao}</div>
        <div class="detalhe">Vento: ${dados.vento || '—'} km/h</div>
        `;
    } catch (err){
        resultado.innerHTML = `<p class="erro">Não foi possível conectar ao servidor.</p>`;
    }
});