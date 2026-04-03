// Файл: api/request-access.js

export default async function handler(req, res) {
    // Ждем только POST-запросы
    if (req.method !== 'POST') return res.status(405).end();
    
    const { deviceId, name } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.ADMIN_CHAT_ID;

    // Формируем текст сообщения
    const text = `🚨 *Новый запрос доступа к экрану!*\n\nИмя: ${name}\nID устройства: \`${deviceId}\``;
    
    // Формируем клавиатуру с кнопкой "Разрешить"
    const keyboard = {
        inline_keyboard: [[
            { text: '✅ Разрешить доступ', callback_data: `approve_${deviceId}` }
        ]]
    };

    // Отправляем сообщение через API Телеграма
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        })
    });
    
    res.status(200).json({ success: true });
}
