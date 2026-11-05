

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.static(__dirname, {
  extensions: ['html'],
  maxAge: '1h'
}));




const BEHRUZBEK_PROFILE = {
  name: "Behruzbek Bekturdiyev",
  age: 15,
  role: "Yosh dasturchi (Frontend & Python Backend)",
  location: "Xorazm viloyati, Yangariq tumani, O'zbekiston",
  education: "Najot Ta'lim (Urganch filiali), 9-sinf o'quvchisi",
  laptop: "Acer Aspire A515-57",
  interests: ["Kod yozish", "Kompyuter o'yinlari", "Futbol", "Gitara", "Musiqa"],
  skills: [
    "HTML5 & Semantic Web",
    "CSS3, Responsive Design, Flexbox, Grid, Animatsiyalar",
    "JavaScript (Vanilla JS, DOM, ES6+, APIlar)",
    "Python (aiogram, Flask, Mini Apps)",
    "Ma'lumotlar bazasi: SQLite",
    "Figma dizaynlarini pikselgacha HTML/CSS ga o'girish",
    "Git & GitHub (behruzbek484.github.io)"
  ],
  projects: [
    {
      name: "Whirl — SaaS Landing Page",
      tech: "HTML, CSS, Figma",
      description: "Figma dizaynidan pikselgacha aniq HTML/CSS ga o'girilgan, to'liq moslashuvchan (responsive) zamonaviy landing sahifa."
    },
    {
      name: "OnlineShopMIX",
      tech: "HTML, CSS, JavaScript",
      description: "Admin panelli, savatchali dark-tema onlayn do'kon veb-sayti. GitHub Pages da joylashtirilgan."
    },
    {
      name: "Doppicoin — Telegram Bot",
      tech: "Python, aiogram, Flask",
      description: "Click-to-earn Telegram bot va Flask Web Mini App. HMAC-SHA256 orqali xavfsiz autentifikatsiya bilan ta'minlangan."
    },
    {
      name: "Ultimate Car Tuning Studio",
      tech: "JavaScript, HTML5 Canvas/DOM",
      description: "Brauzerda ishlaydigan mashina sozlash va tyuning qilish interaktiv o'yini."
    },
    {
      name: "Portfolio Creator",
      tech: "HTML, CSS",
      description: "Figma asosida yaratilgan toza tipografiya va layoutga ega landing sahifa."
    },
    {
      name: "Referral Bot",
      tech: "Python, aiogram, SQLite",
      description: "Do'stlarni taklif qilib ball to'plash va ularni chiqarib olish tizimiga ega Telegram bot."
    }
  ],
  goals: [
    "JavaScript va React texnologiyalarini chuqur o'zlashtirish",
    "Python va algoritmik fikrlashni kuchaytirish, backendda rivojlanish",
    "Flutter yoki React Native orqali birinchi mobil ilovani chiqarish",
    "Germaniyadagi TU Munich (Technische Universität München) top 50 universitetiga kirish",
    "Xalqaro dasturlash olimpiadalarida g'olib bo'lish",
    "Freelance faoliyatini boshlab xalqaro mijozlar bilan ishlash"
  ],
  contacts: {
    email: "behruzbekbekturdiyev011@gmail.com",
    telegram: "@bekturdiyefv (https://t.me/bekturdiyefv)",
    instagram: "@bekturdiyefv (https://www.instagram.com/bekturdiyefv)",
    linkedin: "Behruzbek Bekturdiyev (https://www.linkedin.com/in/behruzbek-bekturdiyev-a94838348)",
    x: "@Bekturdiyev_011 (https://x.com/Bekturdiyev_011)",
    facebook: "@bekturdiyefv (https://www.facebook.com/bekturdiyefv)",
    studyPlace: "Najot Ta'lim, Urganch",
    location: "Yangariq tumani, Xorazm"
  }
};


const SYSTEM_PROMPT = `Siz Behruzbek Bekturdiyevning portfolio veb-saytidagi aqlli AI yordamchisisiz.
Vazifangiz — Behruzbek haqida, uning loyihalari, qobiliyatlari, maqsadlari va aloqa ma'lumotlari haqida tashrif buyuruvchilarga muloyim, do'stona, qisqa va aniq javob berish.
Shuningdek dasturlash bo'yicha ham umumiy savollarga yaxshi javob bera olasiz.

Behruzbek haqida ma'lumotlar:
- Ismi: ${BEHRUZBEK_PROFILE.name}
- Yoshi: ${BEHRUZBEK_PROFILE.age} yoshda, 9-sinf o'quvchisi
- Yashash joyi: ${BEHRUZBEK_PROFILE.location}
- O'qish joyi: ${BEHRUZBEK_PROFILE.education}
- Ko'nikmalari: ${BEHRUZBEK_PROFILE.skills.join(', ')}
- Loyihalari: ${BEHRUZBEK_PROFILE.projects.map(p => p.name + ' (' + p.tech + '): ' + p.description).join('; ')}
- Maqsadlari: ${BEHRUZBEK_PROFILE.goals.join('; ')}
- Noutbuki: ${BEHRUZBEK_PROFILE.laptop}
- Qiziqishlari: ${BEHRUZBEK_PROFILE.interests.join(', ')}
- Aloqa: Telegram: ${BEHRUZBEK_PROFILE.contacts.telegram}, Email: ${BEHRUZBEK_PROFILE.contacts.email}, Instagram: ${BEHRUZBEK_PROFILE.contacts.instagram}, LinkedIn: ${BEHRUZBEK_PROFILE.contacts.linkedin}

Javob berish qoidalari:
1. Foydalanuvchi qaysi tilda yozsa (o'zbek, rus yoki ingliz), o'sha tilda javob bering.
2. Javoblarni chiroyli formatda bering (muhim so'zlarni qalin **so'z**, ro'yxat, emoji bilan).
3. Samimiy va qiziqarli ohangda javob bering.
4. Agar Behruzbek bilan ishlash yoki buyurtma berish haqida so'rashsa, Telegram (@bekturdiyefv) yoki Email orqali bog'lanishni tavsiya qiling.`;




function generateLocalReply(userMessage) {
  const msg = (userMessage || '').toLowerCase().trim();

  
  if (/(salom|assalom|qalesiz|qalaysiz|privet|hello|hi|hey|xayrli)/i.test(msg)) {
    return {
      reply: `Assalomu alaykum! 😊 Men **Behruzbekning AI yordamchisiman**.\n\nSizga Behruzbek haqida nimalar qiziq?\n• Uning **loyihalari**\n• **Ko'nikma va texnologiyalari**\n• **Kelajakdagi maqsadlari**\n• Yoki **bog'lanish yo'llari** haqida so'rashingiz mumkin!`,
      suggestions: ["Behruzbek haqida", "Loyihalari", "Ko'nikmalari", "Bog'lanish"]
    };
  }

  
  if (/(kim|haqida|biografiya|tanish|yosh|qayerdan|sinf|maktab|o'zi|who|about)/i.test(msg)) {
    return {
      reply: `**Behruzbek Bekturdiyev** — 15 yoshli iqtidorli va g'ayratli yosh dasturchi! 💻\n\n• **Yashash joyi:** Xorazm viloyati, Yangariq tumani\n• **O'qish joyi:** Najot Ta'lim (Urganch) va 9-sinf\n• **Qiziqishlari:** Frontend (HTML, CSS, JS), Python botlar, o'yinlar va gitara\n• **Ish quroli:** Acer Aspire A515-57\n\nU hozirdanoq bir nechta jiddiy loyihalarni muvaffaqiyatli yakunlagan!`,
      suggestions: ["Qanday loyihalari bor?", "Qaysi tillarni biladi?", "Maqsadlari nima?"]
    };
  }

  
  if (/(loyiha|loyihalari|portfoli|proyekt|project|qilgan|ishlar|doppicoin|whirl|onlineshop)/i.test(msg)) {
    return {
      reply: `Behruzbek yaratgan asosiy loyihalar: 🚀\n\n1. **Whirl SaaS** — Figma dizaynidan pikselgacha aniq ko'chirilgan to'liq responsive landing sahifa (HTML, CSS).\n2. **OnlineShopMIX** — Admin panelli va savatchali zamonaviy dark-tema onlayn do'kon (HTML, CSS, JS).\n3. **Doppicoin Telegram Bot** — Click-to-earn mexanikasiga ega Telegram bot va Flask Web Mini App (HMAC-SHA256 xavfsizlik bilan).\n4. **Ultimate Car Tuning Studio** — Brauzerda ishlaydigan interaktiv avtomobil tyuning o'yini (Vanilla JS).\n5. **Referral Bot** — Do'stlarni taklif qilish va ball yig'ish tizimi (Python, aiogram, SQLite).\n\nQaysi loyiha haqida batafsilroq bilmoqchisiz?`,
      suggestions: ["Doppicoin boti", "OnlineShopMIX", "Bog'lanish"]
    };
  }

  
  if (/(til|texnologiya|skill|ko'nikma|qobiliyat|biladi|stack|javascript|python|html|css|react)/i.test(msg)) {
    return {
      reply: `Behruzbekning texnologik steki: 🛠️\n\n• **Frontend:** HTML5, CSS3 (Flexbox, Grid, Animatsiyalar), JavaScript (ES6+, DOM, Fetch API)\n• **Backend & Botlar:** Python (aiogram, Flask, Mini App APIlar)\n• **Ma'lumotlar bazasi:** SQLite\n• **Dizayn & Asboblar:** Figma, Git, GitHub Pages, VS Code\n• **Hozir o'rganmoqda:** React va chuqurlashtirilgan algoritmlar!`,
      suggestions: ["Loyihalarni ko'rish", "Kelajak rejalari", "Aloqaga chiqish"]
    };
  }

  
  if (/(maqsad|reja|universitet|tu munich|germaniya|kelajak|goal|future)/i.test(msg)) {
    return {
      reply: `Behruzbekning kelajakdagi katta maqsadlari: 🎯\n\n1. **TU Munich** — Germaniyaning dunyo top 50 taligiga kiruvchi nufuzli Texnika Universitetida o'qish!\n2. **React & Mobil dasturlash** — React, Flutter/React Native orqali kuchli ilovalar yaratish.\n3. **Olimpiadalar** — Xalqaro dasturlash musobaqalarida faxrli o'rinlarni egallash.\n4. **Freelance & Startaplar** — Xalqaro miqyosda haqiqiy loyihalarni amalga oshirish.`,
      suggestions: ["Aloqa ma'lumotlari", "Kim o'zi Behruzbek?"]
    };
  }

  
  if (/(aloqa|bog'lan|kontakt|email|telegram|yozmoqchiman|ish|buyurtma|hamkorlik|contact|hire)/i.test(msg)) {
    return {
      reply: `Behruzbek bilan quyidagi kanallar orqali tezda bog'lanishingiz mumkin: 📬\n\n• **Telegram:** [@bekturdiyefv](https://t.me/bekturdiyefv)\n• **Email:** [behruzbekbekturdiyev011@gmail.com](mailto:behruzbekbekturdiyev011@gmail.com)\n• **Instagram:** [@bekturdiyefv](https://www.instagram.com/bekturdiyefv)\n• **LinkedIn:** [Behruzbek Bekturdiyev](https://www.linkedin.com/in/behruzbek-bekturdiyev-a94838348)\n\nShuningdek, saytning pastki qismidagi **Bog'lanish formasi** orqali ham xabar qoldirishingiz mumkin!`,
      suggestions: ["Loyihalar haqida", "Telegram orqali yozish"]
    };
  }

  
  if (/(sertifikat|diplom|yutuq|certificate|it park)/i.test(msg)) {
    return {
      reply: `Behruzbek 2025-yilda **Technology Village · IT Park Xorazm** tomonidan taqdim etilgan 3 oylik "Kompyuter Savodxonligi" rasmiy sertifikatiga ega (№ 12122). Hozirda Najot Ta'limda dasturlash kurslarida o'qishni davom ettirmoqda.`,
      suggestions: ["Ko'nikmalari", "Loyihalari"]
    };
  }

  
  if (/(dasturlash|kod|yordam|maslahat|js|python|html)/i.test(msg)) {
    return {
      reply: `Dasturlash bo'yicha ajoyib savol! 👨‍💻\n\nBehruzbek asosan Frontend (HTML, CSS, JavaScript) va Python yo'nalishlarida tajribaga ega. Agar sizga biror veb-sayt yasash, dizaynni kodga o'girish yoki Telegram bot yaratish kerak bo'lsa, Behruzbek sizga yordam bera oladi!\n\nSavolingizni aniqroq yozing yoki to'g'ridan-to'g'ri Behruzbek bilan Telegram orqali bog'laning: @bekturdiyefv.`,
      suggestions: ["Behruzbek bilan bog'lanish", "Loyihalarni ko'rish"]
    };
  }

  
  return {
    reply: `Savolingiz uchun rahmat! Men Behruzbek Bekturdiyevning portfolio yordamchisiman.\n\nBehruzbek haqida nimalarni bilishni xohlaysiz? Quyidagi mavzulardan birini tanlashingiz yoki o'z savolingizni berishingiz mumkin:`,
    suggestions: [
      "Behruzbek kim?",
      "Qanday loyihalari bor?",
      "Qaysi dasturlash tillarini biladi?",
      "Behruzbek bilan bog'lanish"
    ]
  };
}




async function callGeminiAPI(userMessage, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: "model",
        parts: [{ text: "Tushundim! Men Behruzbek Bekturdiyevning portfolio AI yordamchisiman. Tashrif buyuruvchilarga muloyim, aniq va qiziqarli yordam berishga tayyorman." }]
      }
    ];

    
    if (Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        if (h && h.role && h.text) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.warn('Gemini API returned status:', response.status);
      return null;
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (replyText) {
      return {
        reply: replyText.trim(),
        provider: "gemini",
        suggestions: ["Boshqa savol berish", "Loyihalari", "Bog'lanish"]
      };
    }
    return null;
  } catch (err) {
    console.warn('Gemini API call failed, using built-in engine:', err.message);
    return null;
  }
}






app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    project: 'Behruzbek Bekturdiyev Portfolio',
    uptime: Math.floor(process.uptime()),
    aiProvider: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'local-nlp-engine',
    timestamp: new Date().toISOString()
  });
});


app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Xabar matni kiritilmadi (message is required)" });
    }

    
    const geminiResult = await callGeminiAPI(message, history);
    if (geminiResult) {
      return res.json({
        success: true,
        reply: geminiResult.reply,
        suggestions: geminiResult.suggestions,
        provider: 'gemini'
      });
    }

    
    const localResult = generateLocalReply(message);
    return res.json({
      success: true,
      reply: localResult.reply,
      suggestions: localResult.suggestions,
      provider: 'local-intelligence'
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: "Kechirasiz, xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
      details: error.message
    });
  }
});


app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Iltimos, ism, email va xabar maydonlarini to'ldiring!"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Yaroqsiz email manzili kiritildi!"
      });
    }

    const newContactMessage = {
      id: Date.now().toString(),
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 120),
      subject: String(subject || 'Portfolio orqali xabar').trim().slice(0, 150),
      message: String(message).trim().slice(0, 2000),
      date: new Date().toISOString()
    };

    // Save to local messages log file
    const logPath = path.join(__dirname, 'messages.json');
    let messages = [];
    try {
      if (fs.existsSync(logPath)) {
        messages = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }
    } catch {
      messages = [];
    }
    messages.push(newContactMessage);
    fs.writeFileSync(logPath, JSON.stringify(messages, null, 2), 'utf8');

    console.log(`[Yangi xabar] Kimdan: ${newContactMessage.name} (${newContactMessage.email}) - Mavzu: ${newContactMessage.subject}`);

    // Send Telegram Notification to Behruzbek
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChatId) {
      try {
        const text = `🔔 <b>Portfolio saytingizdan yangi xabar!</b>\n\n` +
          `👤 <b>Kimdan:</b> ${newContactMessage.name}\n` +
          `📧 <b>Email:</b> ${newContactMessage.email}\n` +
          `📝 <b>Mavzu:</b> ${newContactMessage.subject}\n` +
          `💬 <b>Xabar:</b>\n${newContactMessage.message}\n\n` +
          `⏰ <i>${new Date().toLocaleString('uz-UZ')}</i>`;

        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChatId,
            text,
            parse_mode: 'HTML'
          }),
          signal: AbortSignal.timeout(5000)
        });
      } catch (tgErr) {
        console.warn('Telegram botga yuborishda xatolik:', tgErr.message);
      }
    }

    return res.json({
      success: true,
      message: "Rahmat! Xabaringiz muvaffaqiyatli qabul qilindi. Behruzbek tez orada siz bilan bog'lanadi."
    });

  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({
      success: false,
      error: "Serverda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring."
    });
  }
});


app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Behruzbek Portfolio & AI Server ishga tushdi!`);
    console.log(`🌐 Sayt manzili: http://localhost:${PORT}`);
    console.log(`🤖 AI Yordamchi: ${process.env.GEMINI_API_KEY ? 'Gemini API ulangan' : 'Smart Local NLP Engine faol'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;


