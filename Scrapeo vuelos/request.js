require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const destinos = [
    'BCN', 'FCO', 'LGW', 'MAD', 'MXP', 'ORY', 'AMS', 'ARN', 'ATH', 'BER', 'HAM', 'MUC', 'NUE',
    'BHX', 'EDI', 'LHR', 'MAN', 'CDG', 'BRU', 'ZRH', 'CPH', 'KEF', 'PRG', 'VIE'
];

const origen = 'EZE';
const currency = 'USD';
const precioLimite = 250;

// Generar todos los meses desde el actual hasta dentro de un año
const hoy = new Date();
const meses = [];
for (let i = 0; i < 12; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
    meses.push({
        mes: String(fecha.getMonth() + 1).padStart(2, '0'),
        anio: String(fecha.getFullYear())
    });
}

async function avisarTelegram(mensaje) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: mensaje
    };
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (e) {
        console.error('Error enviando mensaje a Telegram:', e);
    }
}

async function consultarDestinos() {
    const resultados = [];
    for (const destino of destinos) {
        let masBarato = null;
        let error = false;
        for (const { mes, anio } of meses) {
            const url = `https://www.flylevel.com/nwe/flights/api/calendar/?triptype=RT&origin=${origen}&destination=${destino}&month=${mes}&year=${anio}&currencyCode=${currency}`;
            try {
                const respuesta = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                        'Accept': 'application/json',
                        'Referer': 'https://www.flylevel.com/'
                    }
                });
                const datos = await respuesta.json();
                if (datos && datos.data && Array.isArray(datos.data.dayPrices) && datos.data.dayPrices.length > 0) {
                    // Filtrar solo los días con precio válido
                    const diasConPrecio = datos.data.dayPrices.filter(d => d.price !== null && d.price !== undefined);
                    if (diasConPrecio.length > 0) {
                        const masBaratoMes = diasConPrecio.reduce((min, d) => d.price < min.price ? d : min, diasConPrecio[0]);
                        if (!masBarato || masBaratoMes.price < masBarato.price) {
                            masBarato = { destino, ...masBaratoMes };
                        }
                    }
                }
            } catch (e) {
                error = true;
            }
        }
        if (error && !masBarato) {
            resultados.push({ destino, error: true });
        } else if (!masBarato) {
            resultados.push({ destino, sinPrecio: true });
        } else {
            resultados.push(masBarato);
        }
    }

    // Filtrar y avisar solo si hay alguno <= 250 USD
    const baratos = resultados.filter(r => r.price !== undefined && r.price <= precioLimite);
    if (baratos.length > 0) {
        let mensaje = '✈️ ¡Vuelos baratos encontrados!\n';
        baratos.forEach(r => {
            mensaje += `\n${r.destino}: ${r.date} - $${r.price} USD`;
        });
        await avisarTelegram(mensaje);
        console.log(mensaje);
    } else {
        console.log('No se encontraron vuelos por $250 USD o menos en este chequeo.');
    }
}

consultarDestinos();

// Ejecutar cada 6 horas
setInterval(consultarDestinos, 6 * 60 * 60 * 1000); 