# Travel Bot ✈️

Este proyecto es un **worker automático** que busca vuelos baratos desde EZE (Buenos Aires, Ezeiza) a múltiples destinos en Europa y te avisa por Telegram si encuentra alguno a $250 USD o menos.

## ¿Qué hace?
- Consulta todos los meses desde el actual hasta dentro de un año para los siguientes destinos: BCN, FCO, LGW, MAD, MXP, ORY, AMS, ARN, ATH, BER, HAM, MUC, NUE, BHX, EDI, LHR, MAN, CDG, BRU, ZRH, CPH, KEF, PRG, VIE.
- Si encuentra un vuelo a $250 USD o menos, envía una alerta a un grupo/canal de Telegram.
- Si ocurre algún error con las requests a la API, también lo notifica por Telegram.
- El chequeo se repite automáticamente cada 6 horas.

## Configuración
1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/julianestruch/travel-bot.git
   cd travel-bot
   ```
2. **Instala las dependencias:**
   ```bash
   npm install
   ```
3. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   TELEGRAM_BOT_TOKEN=TU_TOKEN_DE_BOT
   TELEGRAM_CHAT_ID=TU_CHAT_ID
   ```
   (Reemplaza los valores por los de tu bot y grupo/canal de Telegram)

## Ejecución local
```bash
node "Scrapeo vuelos/request.js"
```
Déjalo corriendo, el worker se ejecutará cada 6 horas automáticamente.

## Despliegue en Railway u otro servicio
- Asegúrate de que el comando de inicio sea:
  ```json
  "start": "node Scrapeo vuelos/request.js"
  ```
- Sube tus variables de entorno en la configuración del servicio.
- No necesitas exponer ningún puerto ni usar HTTP.

## ¿Cómo funciona la alerta?
- Si se encuentra un vuelo a $250 USD o menos, recibirás un mensaje en Telegram con el destino, fecha y precio.
- Si ocurre algún error con las requests a la API, también recibirás una alerta con el detalle del error.

---

¡Listo! Así nunca te perderás un vuelo barato 😎✈️ 