// Файл: api/approve.js
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
    // Ждем обычный переход по ссылке (GET-запрос)
    if (req.method !== 'GET') return res.status(405).end();

    // Достаем ID устройства из ссылки (например, из ?deviceId=dev_12345)
    const { deviceId } = req.query;

    if (!deviceId) {
        return res.status(400).send('Ошибка: ID устройства не указан.');
    }

    try {
        // 1. Записываем в Firebase, что устройству разрешен доступ
        await db.ref(`approved_devices/${deviceId}`).set(true);

        // 2. Отвечаем красивой страничкой прямо в браузер твоего телефона
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Доступ разрешен</title>
                <style>
                    body {
                        display: flex; flex-direction: column; justify-content: center; align-items: center;
                        height: 100vh; margin: 0; background-color: #1a1a1a; color: white; font-family: sans-serif; text-align: center;
                    }
                    h1 { color: #4ade80; margin-bottom: 10px; }
                    p { color: #aaa; }
                </style>
            </head>
            <body>
                <div>
                    <h1>✅ Доступ разрешен!</h1>
                    <p>Устройство <b>${deviceId}</b> разблокировано.</p>
                    <br>
                    <p>Эту вкладку можно закрыть.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Ошибка Firebase:", error);
        res.status(500).send('Произошла ошибка при выдаче доступа. Проверьте логи Vercel.');
    }
}
