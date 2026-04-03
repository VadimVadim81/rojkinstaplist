// Файл: api/bot.js
import admin from 'firebase-admin';

// Инициализация прав администратора Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: "https://rojkins-taplist-default-rtdb.europe-west1.firebasedatabase.app/"
    });
}

const db = admin.database();

export default async function handler(req, res) {
    // Слушаем callback_query (это нажатие на кнопку под сообщением)
    if (req.method === 'POST' && req.body.callback_query) {
        const callbackQuery = req.body.callback_query;
        const data = callbackQuery.data; // Тут будет "approve_dev_12345"
        const messageId = callbackQuery.message.message_id;
        const chatId = callbackQuery.message.chat.id;

        // Если это кнопка "Разрешить"
        if (data.startsWith('approve_')) {
            const deviceId = data.replace('approve_', '');

            // 1. Записываем в Firebase, что устройству разрешен доступ (навсегда)
            await db.ref(`approved_devices/${deviceId}`).set(true);

            // 2. Меняем сообщение в Telegram, чтобы было видно, что мы уже разрешили
            const token = process.env.TELEGRAM_BOT_TOKEN;
            await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: `✅ Доступ для ${deviceId} успешно разрешен! Экран разблокирован.`,
                })
            });
        }
    }
    
    res.status(200).send('OK');
}
