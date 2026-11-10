const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('Escanea el código QR con tu whatsapp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡Angy está lista para usar y conectada!');
});

client.on('group_join', async (notification) => {
    try {
        const chat = await notification.getChat();
        const contact = await notification.getContact();

        if (chat && chat.isGroup) {
            console.log(`[NUEVO MIEMBRO] ${contact.pushname || contact.number} se unió a ${chat.name}`);
            
            await chat.sendMessage(
                `¡Bienvenid@ @${contact.id.user} a **${chat.name}**! 🎉 Me da mucho gusto saludarte. Soy Angy, tu bot asistente. Escribe '!menu' para ver lo que puedo hacer por ti. 🤖✨`,
                {
                    mentions: [contact]
                }
            );
        }
    } catch (error) {
    }
});

client.on('message_create', async (message) => {
    if (!message || !message.body) return;

    try {
        const chat = await message.getChat();

        if (chat && chat.isGroup) {
            const texto = message.body.toLowerCase();
            console.log(`[GRUPO: ${chat.name}] -> ${message.body}`);

            if (texto === '!ping') {
                await message.reply('¡Pong 🏓! Angy está activa y en línea.');
            }

            if (texto.includes('hola angy')) {
                await message.reply(`¡Hola! Qué gusto saludarte por aquí en ${chat.name}. 👍👍 ¿En qué te puedo ayudar hoy?`);
            }

            if (texto === '!menu') {
                await message.reply(
                    `🤖 **Menú de Comandos de Angy** 🤖\n\n` +
                    `📌 \`!ping\` - Comprueba si el bot responde.\n` +
                    `📌 \`hola angy\` - Te saluda amablemente.\n` +
                    `📌 \`!info\` - Muestra detalles del grupo.\n` +
                    `📌 \`!creador\` - Muestra quién programó este bot.`
                );
            }

            if (texto === '!info') {
                await message.reply(
                    `📊 **Información del Grupo**\n` +
                    `- Nombre: ${chat.name}\n` +
                    `- Participantes: ${chat.participants.length} miembros\n` +
                    `- Creado por: ${chat.owner ? chat.owner.user : 'Desconocido'}`
                );
            }

            if (texto === '!creador') {
                await message.reply('Fui desarrollada con mucho esfuerzo usando Node.js, WhatsApp-Web.js y un toque de ingeniería 💻⚡.');
            }
        }
    } catch (error) {
    }
});

client.initialize();