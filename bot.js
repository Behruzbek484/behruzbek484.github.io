/**
 * Behruzbek Bekturdiyev — Rasmiy Telegram Murojaat & O'yinlar Boti
 */

require("dotenv").config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";

const API_BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

// Foydalanuvchilar holati (state)
const userSessions = new Map();

// Viktorina savollari bazasi
const QUIZ_QUESTIONS = [
  {
    q: "JavaScript tilida o'zgarmas o'zgaruvchi qaysi kalit so'z bilan e'lon qilinadi?",
    options: ["var", "let", "const", "def"],
    correct: 2,
  },
  {
    q: "CSS da elementni sahifaning markaziga keltirish uchun qaysi texnologiya eng qulay?",
    options: [
      "float: left",
      "display: flex (justify/align)",
      "position: absolute faqat",
      "margin-left: 200px",
    ],
    correct: 1,
  },
  {
    q: "Python tilida ro'yxatga yangi element qo'shish metodi qaysi?",
    options: ["push()", "add()", "append()", "insert_last()"],
    correct: 2,
  },
  {
    q: "HTML5 da veb-sahifaning asosiy sarlavhasi qaysi teg bilan belgilanadi?",
    options: ["<title>", "<header>", "<h1>", "<heading>"],
    correct: 2,
  },
  {
    q: "Behruzbek qaysi chet el universitetiga kirishni o'z oldiga maqsad qilgan?",
    options: ["Harvard", "TU Munich (Germaniya)", "Oxford", "MIT"],
    correct: 1,
  },
  {
    q: "Dasturlashda 'API' so'zining kengaytmasi nima?",
    options: [
      "Application Programming Interface",
      "Advanced Program Integration",
      "Automated Protocol Internet",
      "Apple Process Interface",
    ],
    correct: 0,
  },
  {
    q: "Python-da Telegram botlar yaratish uchun eng mashhur asinxron kutubxona qaysi?",
    options: ["Django", "aiogram", "Pandas", "PyGame"],
    correct: 1,
  },
];

// Telegram API ga so'rov yuboruvchi asosiy yordamchi
async function callTelegram(method, data = {}) {
  if (!API_BASE) {
    throw new Error("TELEGRAM_BOT_TOKEN .env faylida sozlanmagan.");
  }

  let res;
  try {
    const requestTimeoutMs = method === 'getUpdates'
      ? ((data.timeout || 25) + 10) * 1000
      : 15000;

    res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (err) {
    throw new Error(`Telegram API (${method}) tarmoq xatosi: ${err.message}`);
  }

  let result;
  try {
    result = await res.json();
  } catch {
    throw new Error(
      `Telegram API (${method}) noto'g'ri javob qaytardi (HTTP ${res.status}).`,
    );
  }

  if (!res.ok || !result.ok) {
    // Agar xabar o'zgarmagan bo'lsa (foydalanuvchi bir xil tugmani 2 marta bossa), xato deb hisoblamaymiz
    if ((result.description || "").toLowerCase().includes("message is not modified")) {
      return { ok: true, result: true };
    }

    // Agar HTML formati xato bersa, parse_mode siz oddiy matn sifatida qayta jo'natamiz
    if (
      data.parse_mode &&
      (result.description || "").toLowerCase().includes("can't parse entities")
    ) {
      const fallbackData = { ...data };
      delete fallbackData.parse_mode;
      return callTelegram(method, fallbackData);
    }
    throw new Error(
      `Telegram API (${method}) xatolik (HTTP ${res.status}): ${result.description || res.statusText}`,
    );
  }

  return result;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
      })[character],
  );
}

// Lokal aqlli javoblar bazasi (Gemini ulanmagan yoki sekin bo'lganda ishlatiladi)
function getLocalBotAnswer(prompt) {
  const msg = (prompt || "").toLowerCase().trim();

  if (
    /(salom|assalom|qales|qalaysiz|qale|privet|hello|hi|hey|xayrli)/i.test(msg)
  ) {
    return `Assalomu alaykum! 😊 Men <b>Behruzbekning AI yordamchisiman</b>.\n\nSizga qanday yordam bera olaman?\n• <b>Loyihalar</b> haqida bilmoqchimisiz?\n• <b>Dasturlash</b> bo'yicha savolingiz bormi?\n• Yoki Behruzbek bilan <b>bog'lanish</b> kerakmi?`;
  }

  if (
    /(kim|haqida|biografiya|tanish|yosh|qayerdan|sinf|maktab|who|about)/i.test(
      msg,
    )
  ) {
    return `👨‍💻 <b>Behruzbek Bekturdiyev</b> — 15 yoshli iqtidorli va g'ayratli yosh dasturchi!\n\n• <b>Yashash joyi:</b> Xorazm viloyati, Yangariq tumani\n• <b>O'qish joyi:</b> Najot Ta'lim (Urganch) va 9-sinf o'quvchisi\n• <b>Texnologiyalari:</b> HTML, CSS, JavaScript, Python (aiogram, Flask), SQLite\n• <b>Maqsadi:</b> Germaniyadagi <b>TU Munich</b> universitetida o'qish va jahon darajasidagi dasturchi bo'lish! 🎯`;
  }

  if (
    /(loyiha|loyihalari|portfoli|proyekt|project|qilgan|ishlar|doppicoin|whirl|onlineshop)/i.test(
      msg,
    )
  ) {
    return `🚀 <b>Behruzbek yaratgan asosiy loyihalar:</b>\n\n1. <b>Whirl SaaS</b> — Figma dizaynidan pikselgacha aniq ko'chirilgan responsive landing sahifa.\n2. <b>OnlineShopMIX</b> — Admin panelli va savatchali zamonaviy onlayn do'kon.\n3. <b>Doppicoin Telegram Bot</b> — Python/aiogram va Flask Web Mini App orqali yaratilgan click-to-earn o'yin boti.\n4. <b>Ultimate Car Tuning Studio</b> — Interaktiv avtomobil sozlash o'yini.\n5. <b>Referral Bot</b> — Do'stlarni taklif qilib ball yig'ish boti.\n\nBatafsil: <a href="https://behruzbek484.github.io">behruzbek484.github.io</a>`;
  }

  if (
    /(til|texnologiya|skill|ko'nikma|qobiliyat|biladi|stack|javascript|python|html|css|react)/i.test(
      msg,
    )
  ) {
    return `🛠️ <b>Behruzbekning texnologik steki:</b>\n\n• <b>Frontend:</b> HTML5, CSS3, JavaScript (ES6+, DOM, Fetch API)\n• <b>Backend & Botlar:</b> Python (aiogram, Flask, Telegram Mini Apps)\n• <b>Ma'lumotlar bazasi:</b> SQLite\n• <b>Dizayn & Asboblar:</b> Figma, Git, GitHub, VS Code\n• <b>Hozir o'rganmoqda:</b> React va kuchli algoritmlar!`;
  }

  if (
    /(maqsad|reja|universitet|tu munich|germaniya|kelajak|goal|future)/i.test(
      msg,
    )
  ) {
    return `🎯 <b>Behruzbekning kelajakdagi maqsadlari:</b>\n\n1. <b>TU Munich</b> — Germaniyaning top 50 universitetiga kirish!\n2. <b>React & Mobile</b> — Mobil va murakkab veb-ilovalarni chuqur o'rganish.\n3. <b>Xalqaro olimpiadalar</b> — IT musobaqalarida yuqori natijalar.\n4. <b>Xalqaro freelance loyihalar</b>da ishlash.`;
  }

  if (
    /(aloqa|bog'lan|kontakt|email|telegram|yozmoqchiman|ish|buyurtma|hamkorlik|contact|hire)/i.test(
      msg,
    )
  ) {
    return `📬 <b>Behruzbek bilan bog'lanish:</b>\n\n• <b>Telegram:</b> @bekturdiyefv\n• <b>Email:</b> behruzbekbekturdiyev011@gmail.com\n• <b>Instagram:</b> @bekturdiyefv\n• <b>LinkedIn:</b> Behruzbek Bekturdiyev\n\nYoki shunchaki '✍️ Behruzbekka murojaat yuborish' tugmasini bosing!`;
  }

  if (/(dasturlash|kod|yordam|maslahat|js|python|html|css)/i.test(msg)) {
    return `💻 <b>Dasturlash bo'yicha maslahat:</b>\n\nDasturlashni o'rganishda eng muhimi — har kuni amaliyot qilish va loyihalar yasash! Behruzbek veb-saytlar va Telegram botlar yaratish bo'yicha hamkorlikka ochiq.\n\nSavolingizni aniqroq yozing yoki to'g'ridan-to'g'ri @bekturdiyefv ga murojaat qiling!`;
  }

  return `Savolingiz uchun rahmat! 😊\n\nMen Behruzbek Bekturdiyevning botiman. Quyidagi tugmalar orqali o'zingizga kerakli bo'limni tanlashingiz yoki to'g'ridan-to'g'ri Behruzbekka xabar qoldirishingiz mumkin!`;
}

// Gemini AI bilan savol-javob
async function askGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const systemPrompt = `Sen Behruzbek Bekturdiyevning Telegram botidagi sun'iy intellektsan.
Behruzbek haqida:
- 15 yoshli dasturchi, Xorazm Yangariq tumanidan
- Najot Ta'lim va 9-sinf o'quvchisi
- Frontend (HTML/CSS/JS) va Python (aiogram, Flask) biladi
- TU Munich talabasi bo'lish niyatida
- Portfolio: https://behruzbek484.github.io
- Telegram: @bekturdiyefv

Qoidalar:
- O'zbek tilida, do'stona, qiziqarli va qisqa javob ber.
- Telegram HTML formatiga mos formatla (<b>qalin</b>, <code>kod</code>, ro'yxatlar).
- Har qanday umumiy va dasturlash savollariga to'liq javob bera olasan.`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nFoydalanuvchi savoli: ${prompt}` },
          ],
        },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    return null;
  }
}

// Bosh menyu tugmalari
function getMainKeyboard() {
  return {
    keyboard: [
      [{ text: "✍️ Behruzbekka murojaat yuborish" }],
      [{ text: "🎮 O'yinlar olami" }, { text: "🤖 AI Yordamchi" }],
      [{ text: "👨‍💻 Behruzbek haqida" }, { text: "🚀 Loyihalar" }],
      [{ text: "🌐 Portfolio Sayti" }, { text: "📞 Aloqa" }],
    ],
    resize_keyboard: true,
    persistent: true,
  };
}

// O'yinlar menyusi inline tugmalari
function getGamesInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🎯 Sonni top o'yini", callback_data: "game_guess" },
        { text: "🪨✂️📄 Tosh-Qaychi-Qog'oz", callback_data: "game_rps" },
      ],
      [
        { text: "🧠 IT Viktorina (Quiz)", callback_data: "game_quiz" },
        { text: "🎲 Omadli Zar tashlash", callback_data: "game_dice" },
      ],
      [{ text: "🔙 Asosiy menyuga", callback_data: "menu_main" }],
    ],
  };
}

// Start komandasi
async function handleStart(chatId, user) {
  userSessions.set(chatId, { state: "idle" });

  const text =
    `Salom, <b>${escapeHtml(user.first_name || "do'stim")}</b>! 👋\n\n` +
    `Men <b>Behruzbek Bekturdiyev</b>ning rasmiy ko'p funksiyali Telegram botiman!\n\n` +
    `Bu yerda siz:\n` +
    `• ✍️ <b>Behruzbekka to'g'ridan-to'g'ri murojaat</b> yuborishingiz\n` +
    `• 🎮 Qiziqarli <b>o'yinlar</b> o'ynab bilimingizni sinashingiz\n` +
    `• 🤖 <b>Gemini AI</b> bilan istalgan mavzuda suhbatlashishingiz\n` +
    `• 👨‍💻 Behruzbekning <b>loyihalari va portfoliosi</b> bilan tanishishingiz mumkin!\n\n` +
    `Quyidagi menyudan kerakli bo'limni tanlang: 👇`;

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: getMainKeyboard(),
  });
}

// Murojaat rejimini boshlash
async function handleFeedbackStart(chatId) {
  userSessions.set(chatId, { state: "waiting_feedback" });

  const text =
    `✍️ <b>Behruzbekka xabar yoki taklif qoldirish:</b>\n\n` +
    `Xabaringizni yozib yuboring (taklif, loyiha buyurtmasi, savol yoki tilak).\n` +
    `Siz yuborgan xabar <b>to'g'ridan-to'g'ri Behruzbekning shaxsiy Telegramiga</b> yetib boradi va u sizga tez orada javob qaytaradi! 😊\n\n` +
    `<i>Bekor qilish uchun /cancel deb yozing yoki boshqa tugmani bosing.</i>`;

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [[{ text: "❌ Bekor qilish" }]],
      resize_keyboard: true,
    },
  });
}

// Xabarni Behruzbekka yetkazish
async function handleFeedbackMessage(chatId, user, messageText) {
  userSessions.set(chatId, { state: "idle" });

  const username = user.username ? `@${user.username}` : "Username yo'q";
  const fullName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";

  // 1. Admin (Behruzbek) ga yuborish
  const adminMsg =
    `🔔 YANGI MUROJAAT KELDI!\n\n` +
    `👤 Kimdan: ${fullName} (${username})\n` +
    `🆔 User ID: ${chatId}\n` +
    `🕐 Vaqt: ${new Date().toLocaleString("uz-UZ")}\n\n` +
    `💬 Xabar matni:\n${messageText}\n\n` +
    `Ushbu xabarga Reply (Javob berish) orqali javob yozishingiz mumkin.`;

  await callTelegram("sendMessage", {
    chat_id: ADMIN_CHAT_ID,
    text: adminMsg,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `↩️ ${fullName.slice(0, 40)}ga javob yozish`,
            callback_data: `reply_to_${chatId}`,
          },
        ],
      ],
    },
  });

  // 2. Foydalanuvchiga tasdiq
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: `✅ <b>Rahmat! Xabaringiz Behruzbekka yetkazildi!</b>\n\nTez orada u siz bilan bog'lanadi yoki bot orqali javob qaytaradi.`,
    parse_mode: "HTML",
    reply_markup: getMainKeyboard(),
  });
}

// Adminning javobini foydalanuvchiga yetkazish
async function handleAdminReply(adminChatId, replyToChatId, replyText) {
  await callTelegram("sendMessage", {
    chat_id: replyToChatId,
    text: `📩 Behruzbek Bekturdiyevdan javob:\n\n${replyText}\n\nYana savolingiz bo'lsa, 'Murojaat yuborish' tugmasini bosing!`,
    reply_markup: getMainKeyboard(),
  });

  await callTelegram("sendMessage", {
    chat_id: adminChatId,
    text: `✅ Javobingiz foydalanuvchiga (ID: ${replyToChatId}) muvaffaqiyatli yetkazildi!`,
  });
}

// O'YINLAR
// 1. Sonni top o'yini
function startGuessGame(chatId) {
  const secret = Math.floor(Math.random() * 100) + 1;
  userSessions.set(chatId, {
    state: "playing_guess",
    secret,
    attempts: 0,
  });

  return {
    text:
      `🎯 <b>"Sonni top" o'yini boshlandi!</b>\n\n` +
      `Men <b>1 dan 100 gacha</b> bo'lgan bir sirli son o'yladim.\n` +
      `Topishga harakat qiling! Har safar son yozsangiz, men "Kattaroq" yoki "Kichikroq" deb yordam beraman.\n\n` +
      `O'yindan chiqish uchun /cancel deb yozing.\nQani, birinchi soningizni yozing:`,
    reply_markup: {
      keyboard: [[{ text: "❌ O'yinni tugatish" }]],
      resize_keyboard: true,
    },
  };
}

function processGuess(chatId, numStr) {
  const session = userSessions.get(chatId);
  const num = parseInt(numStr.trim(), 10);

  if (isNaN(num)) {
    return { text: "Iltimos, faqat butun son yozing (masalan, 50):" };
  }

  session.attempts++;

  if (num === session.secret) {
    userSessions.set(chatId, { state: "idle" });
    return {
      text:
        `🎉 <b>TABRIKLAYMIZ! Siz g'alaba qozondingiz!</b> 🏆\n\n` +
        `Siz o'ylangan <b>${session.secret}</b> sonini <b>${session.attempts}</b> ta urinishda topdingiz!\n\n` +
        `Ajoyib natija! Yana o'ynashni xohlaysizmi?`,
      reply_markup: getMainKeyboard(),
    };
  } else if (num < session.secret) {
    return {
      text: `⬆️ <b>Kattaroq son ayting!</b> (Sizning kiritganingiz: ${num}, Urinish: ${session.attempts})`,
    };
  } else {
    return {
      text: `⬇️ <b>Kichikroq son ayting!</b> (Sizning kiritganingiz: ${num}, Urinish: ${session.attempts})`,
    };
  }
}

// 2. Tosh-Qaychi-Qog'oz o'yini
function getRPSKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🪨 Tosh", callback_data: "rps_rock" },
        { text: "✂️ Qaychi", callback_data: "rps_scissors" },
        { text: "📄 Qog'oz", callback_data: "rps_paper" },
      ],
      [{ text: "🔙 O'yinlar menyusiga", callback_data: "menu_games" }],
    ],
  };
}

function playRPS(userChoice) {
  const choices = ["rock", "scissors", "paper"];
  const botChoice = choices[Math.floor(Math.random() * choices.length)];

  const names = {
    rock: "🪨 Tosh",
    scissors: "✂️ Qaychi",
    paper: "📄 Qog'oz",
  };

  let outcome = "";
  if (userChoice === botChoice) {
    outcome = "🤝 <b>Durrang!</b> Ikkalamiz ham bir xil tanladik!";
  } else if (
    (userChoice === "rock" && botChoice === "scissors") ||
    (userChoice === "scissors" && botChoice === "paper") ||
    (userChoice === "paper" && botChoice === "rock")
  ) {
    outcome = "🎉 <b>TABRIKLAYMAN, SIZ G'ALABA QOZONDINGIZ!</b> 🥳";
  } else {
    outcome = "🤖 <b>Bu safar bot yutdi!</b> Keyingi safar omadingiz keladi!";
  }

  return (
    `<b>Tosh - Qaychi - Qog'oz</b> 🎮\n\n` +
    `Sizning tanlovingiz: <b>${names[userChoice]}</b>\n` +
    `Botning tanlovi: <b>${names[botChoice]}</b>\n\n` +
    `${outcome}\n\nYana bir bor sinab ko'rasizmi?`
  );
}

// 3. IT Viktorina
function getQuizQuestion(chatId, qIndex = 0) {
  const q = QUIZ_QUESTIONS[qIndex % QUIZ_QUESTIONS.length];
  userSessions.set(chatId, {
    state: "playing_quiz",
    qIndex: qIndex % QUIZ_QUESTIONS.length,
    score: userSessions.get(chatId)?.score || 0,
  });

  const buttons = q.options.map((opt, i) => [
    {
      text: `${String.fromCharCode(65 + i)}) ${opt}`,
      callback_data: `quiz_ans_${i}`,
    },
  ]);
  buttons.push([
    { text: "❌ Viktorinani yakunlash", callback_data: "menu_games" },
  ]);

  return {
    text:
      `🧠 <b>IT Viktorina</b> — Savol №${(qIndex % QUIZ_QUESTIONS.length) + 1}/${QUIZ_QUESTIONS.length}:\n\n` +
      `<b>${q.q}</b>`,
    reply_markup: { inline_keyboard: buttons },
  };
}

// Callback so'rovlarni boshqarish
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const messageId = cq.message.message_id;
  const data = cq.data;

  // Tugmani bosganda yuklanish belgisini to'xtatish
  await callTelegram("answerCallbackQuery", { callback_query_id: cq.id });

  if (data === "menu_main") {
    await callTelegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: "Asosiy menyudasiz. Kerakli tugmani tanlang:",
      reply_markup: { inline_keyboard: [] },
    });
    return;
  }

  if (data === "menu_games") {
    await callTelegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: "🎮 <b>O'yinlar bo'limi:</b>\nO'zingizga yoqqan o'yinni tanlang:",
      parse_mode: "HTML",
      reply_markup: getGamesInlineKeyboard(),
    });
    return;
  }

  if (data === "game_guess") {
    const game = startGuessGame(chatId);
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: game.text,
      parse_mode: "HTML",
      reply_markup: game.reply_markup,
    });
    return;
  }

  if (data === "game_rps") {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: "🪨✂️📄 <b>Tosh, Qaychi, Qog'oz</b> o'yini!\nTanlovingizni qiling:",
      parse_mode: "HTML",
      reply_markup: getRPSKeyboard(),
    });
    return;
  }

  if (data.startsWith("rps_")) {
    const choice = data.replace("rps_", "");
    const resultText = playRPS(choice);
    await callTelegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: resultText,
      parse_mode: "HTML",
      reply_markup: getRPSKeyboard(),
    });
    return;
  }

  if (data === "game_quiz") {
    userSessions.set(chatId, { score: 0 });
    const quiz = getQuizQuestion(chatId, 0);
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: quiz.text,
      parse_mode: "HTML",
      reply_markup: quiz.reply_markup,
    });
    return;
  }

  if (data.startsWith("quiz_ans_")) {
    const selected = parseInt(data.replace("quiz_ans_", ""), 10);
    const session = userSessions.get(chatId) || { qIndex: 0, score: 0 };
    const currentQ = QUIZ_QUESTIONS[session.qIndex];

    let resultMsg = "";
    if (selected === currentQ.correct) {
      session.score = (session.score || 0) + 1;
      resultMsg = `✅ <b>To'g'ri javob!</b> Ball: ${session.score}`;
    } else {
      resultMsg = `❌ <b>Noto'g'ri!</b> To'g'ri javob: <i>${currentQ.options[currentQ.correct]}</i>`;
    }

    const nextIndex = session.qIndex + 1;
    if (nextIndex < QUIZ_QUESTIONS.length) {
      userSessions.set(chatId, { ...session, qIndex: nextIndex });
      const nextQuiz = getQuizQuestion(chatId, nextIndex);
      await callTelegram("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: `${resultMsg}\n\n${nextQuiz.text}`,
        parse_mode: "HTML",
        reply_markup: nextQuiz.reply_markup,
      });
    } else {
      await callTelegram("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: `${resultMsg}\n\n🏆 <b>Viktorina yakunlandi!</b>\nSizning umumiy natijangiz: <b>${session.score} / ${QUIZ_QUESTIONS.length}</b> ta to'g'ri javob!\n${session.score >= 5 ? "Ajoyib natija! Siz haqiqiy dasturchisiz! 🔥" : "Yaxshi urinish, yana o'qib-o'rganing! 💪"}`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Qayta o'ynash", callback_data: "game_quiz" }],
            [{ text: "🎮 Boshqa o'yinlar", callback_data: "menu_games" }],
          ],
        },
      });
      userSessions.set(chatId, { state: "idle" });
    }
    return;
  }

  if (data === "game_dice") {
    await callTelegram("sendDice", { chat_id: chatId, emoji: "🎲" });
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: "🎲 Omad sinovi! 6 tushdimi? Qani, yana bir bor o'yinlar menyusidan tanlang:",
      reply_markup: getGamesInlineKeyboard(),
    });
    return;
  }

  if (data.startsWith("reply_to_")) {
    const targetUserId = data.replace("reply_to_", "");
    userSessions.set(chatId, { state: "admin_replying", targetUserId });
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: `✍️ Foydalanuvchi (ID: <code>${targetUserId}</code>) uchun javob xabaringizni yozing:`,
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [[{ text: "❌ Bekor qilish" }]],
        resize_keyboard: true,
      },
    });
    return;
  }
}

// Boshqa matnli xabarlarni qayta ishlash
async function handleTextMessage(msg) {
  const chatId = msg.chat.id;
  const user = msg.from;
  const text = (msg.text || "").trim();
  const session = userSessions.get(chatId) || { state: "idle" };

  // Bekor qilish
  if (
    text === "/cancel" ||
    text === "❌ Bekor qilish" ||
    text === "❌ O'yinni tugatish"
  ) {
    userSessions.set(chatId, { state: "idle" });
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: "Amaliyot bekor qilindi. Asosiy menyudasiz:",
      reply_markup: getMainKeyboard(),
    });
    return;
  }

  // Admin reply holati
  if (
    session.state === "admin_replying" &&
    String(chatId) === String(ADMIN_CHAT_ID)
  ) {
    userSessions.set(chatId, { state: "idle" });
    await handleAdminReply(chatId, session.targetUserId, text);
    return;
  }

  // Agar admin to'g'ridan-to'g'ri forward yoki reply qilgan bo'lsa
  if (String(chatId) === String(ADMIN_CHAT_ID) && msg.reply_to_message) {
    const repliedText = msg.reply_to_message.text || "";
    const match =
      repliedText.match(/User ID:\s*(\d+)/i) ||
      repliedText.match(/ID:\s*<code>(\d+)<\/code>/i);
    if (match && match[1]) {
      await handleAdminReply(chatId, match[1], text);
      return;
    }
  }

  // Murojaat kutilayotgan holat
  if (session.state === "waiting_feedback") {
    await handleFeedbackMessage(chatId, user, text);
    return;
  }

  // Sonni top o'yini o'ynalayotgan bo'lsa
  if (session.state === "playing_guess") {
    const res = processGuess(chatId, text);
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: res.text,
      parse_mode: "HTML",
      reply_markup: res.reply_markup || undefined,
    });
    return;
  }

  // Komandalar
  if (text === "/start") {
    await handleStart(chatId, user);
    return;
  }

  // Menyu tugmalari
  if (text === "✍️ Behruzbekka murojaat yuborish") {
    await handleFeedbackStart(chatId);
    return;
  }

  if (text === "🎮 O'yinlar olami") {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text:
        `🎮 <b>Xush kelibsiz o'yinlar maydoniga!</b>\n\n` +
        `Quyidagi o'yinlardan birini tanlang va o'zingizni sinab ko'ring: 👇`,
      parse_mode: "HTML",
      reply_markup: getGamesInlineKeyboard(),
    });
    return;
  }

  if (text === "👨‍💻 Behruzbek haqida") {
    const info =
      `👨‍💻 <b>Behruzbek Bekturdiyev haqida:</b>\n\n` +
      `• <b>Yoshi:</b> 15 yosh (9-sinf o'quvchisi)\n` +
      `• <b>Yashash joyi:</b> Xorazm viloyati, Yangariq tumani\n` +
      `• <b>O'qish joyi:</b> Najot Ta'lim (Urganch filiali)\n` +
      `• <b>Qiziqishlari:</b> Dasturlash, kompyuter o'yinlari, futbol, gitara, musiqa, AI\n` +
      `• <b>Texnologiyalari:</b> HTML5, CSS3, JavaScript, Python (aiogram, Flask), SQLite, Git\n` +
      `• <b>Maqsadi:</b> Germaniyadagi <b>TU Munich</b> universitetida o'qish va professional darajadagi xalqaro dasturchi bo'lish! 🎯`;

    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: info,
      parse_mode: "HTML",
      reply_markup: getMainKeyboard(),
    });
    return;
  }

  if (text === "🚀 Loyihalar") {
    const projects =
      `🚀 <b>Behruzbek yaratgan asosiy loyihalar:</b>\n\n` +
      `1. <b>Whirl SaaS</b> — Figma dizaynidan pikselgacha aniq ko'chirilgan responsive landing sahifa.\n` +
      `2. <b>OnlineShopMIX</b> — Dark-tema onlayn do'kon veb-sayti (savatcha va admin panelli).\n` +
      `3. <b>Doppicoin Telegram Bot</b> — Python/aiogram va Flask Web Mini App asosidagi click-to-earn boti.\n` +
      `4. <b>Ultimate Car Tuning Studio</b> — Mashina sozlash va tyuning qilish interaktiv brauzer o'yini.\n` +
      `5. <b>Referral Bot</b> — Do'stlarni taklif qilib ball to'plash tizimi.\n\n` +
      `Barcha loyihalarni ko'rish: <a href="https://behruzbek484.github.io/#loyihalar">behruzbek484.github.io</a>`;

    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: projects,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      reply_markup: getMainKeyboard(),
    });
    return;
  }

  if (text === "🌐 Portfolio Sayti") {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text:
        `🌐 Behruzbek Bekturdiyevning rasmiy portfoliosi:\n\n` +
        `👉 <a href="https://behruzbek484.github.io">https://behruzbek484.github.io</a>\n\n` +
        `Saytda interaktiv o'yinlar, loyihalar va shaxsiy AI yordamchi o'rnatilgan!`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Saytni ochish", url: "https://behruzbek484.github.io" }],
        ],
      },
    });
    return;
  }

  if (text === "📞 Aloqa") {
    const contacts =
      `📬 <b>Behruzbek bilan bog'lanish:</b>\n\n` +
      `• <b>Telegram:</b> @bekturdiyefv\n` +
      `• <b>Email:</b> behruzbekbekturdiyev011@gmail.com\n` +
      `• <b>Instagram:</b> @bekturdiyefv\n` +
      `• <b>LinkedIn:</b> Behruzbek Bekturdiyev\n` +
      `• <b>GitHub:</b> github.com/Behruzbek484\n\n` +
      `Yoki ushbu bot orqali '✍️ Murojaat yuborish' tugmasini bosing!`;

    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: contacts,
      parse_mode: "HTML",
      reply_markup: getMainKeyboard(),
    });
    return;
  }

  if (text === "🤖 AI Yordamchi") {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text:
        `🤖 <b>Gemini AI yordamchi faollashtirildi!</b>\n\n` +
        `Menga istalgan savolingizni bering (masalan: <i>"Dasturlashni qanday boshlasam bo'ladi?"</i>, <i>"Python bilan nima qilsa bo'ladi?"</i> yoki Behruzbek haqida so'rang).\n\n` +
        `Savolingizni yozing: 👇`,
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [[{ text: "❌ Bekor qilish" }]],
        resize_keyboard: true,
      },
    });
    userSessions.set(chatId, { state: "waiting_ai" });
    return;
  }

  // Foydalanuvchi erkin savol yozsa yoki AI bo'limida bo'lsa
  await callTelegram("sendChatAction", { chat_id: chatId, action: "typing" });
  let aiAnswer = await askGemini(text);

  if (!aiAnswer) {
    aiAnswer = getLocalBotAnswer(text);
  }

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: aiAnswer,
    parse_mode: "HTML",
    reply_markup: getMainKeyboard(),
  });
}
// Long Polling sikli

let offset = 0;
let isPolling = true;

async function startPolling() {
  if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN .env faylida sozlanmagan.");
  }
  if (!ADMIN_CHAT_ID) {
    throw new Error("TELEGRAM_CHAT_ID .env faylida sozlanmagan.");
  }

  const botInfo = await callTelegram("getMe");
  console.log(`🤖 Telegram Bot ishga tushdi: @${botInfo.result.username}`);
  console.log(`👨‍💻 Admin Chat ID: ${7225516678}`);

  while (isPolling) {
    try {
      const res = await callTelegram("getUpdates", {
        offset,
        timeout: 10,
        allowed_updates: ["message", "callback_query"],
      });

      if (res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          offset = update.update_id + 1;

          if (update.message) {
            handleTextMessage(update.message).catch((e) =>
              console.error("Msg handle error:", e),
            );
          } else if (update.callback_query) {
            handleCallbackQuery(update.callback_query).catch((e) =>
              console.error("CQ handle error:", e),
            );
          }
        }
      } else {
        // Agar xatolik bo'lsa, ozgina kutamiz
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error("Polling xatosi:", err.message);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

// Agar to'g'ridan-to'g'ri chaqirilsa
if (require.main === module) {
  startPolling().catch((error) => {
    console.error("Telegram bot ishga tushmadi:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { startPolling };
