# Behruzbek Bekturdiyev — Portfolio & AI Yordamchi

> 15 yoshli iqtidorli dasturchi Behruzbek Bekturdiyevning zamonaviy portfolio veb-sayti va sun'iy intellekt (AI) yordamchisi.

![Portfolio Preview](./img/B.png)

---

## 🌟 Yangi qo'shilgan imkoniyatlar va tuzatilgan xatolar

### 1. 🤖 Sun'iy Intellekt (AI Yordamchi)
- Saytga zamonaviy suzuvchi (floating) **AI Yordamchi widget**i qo'shildi.
- Saytga tashrif buyuruvchilar Behruzbekning loyihalari, ko'nikmalari, maqsadlari va aloqa ma'lumotlari haqida sun'iy intellekt bilan o'zbek, rus yoki ingliz tillarida suhbatlashishlari mumkin.
- **Tezkor savollar (quick chips):** Bir marta bosish orqali tezkor savol berish imkoniyati.
- **Ovozli kiritish (Voice-to-text):** Web Speech API orqali mikrofon yordamida ovozli savol berish.
- **Ikki tomonlama ishlash (Dual-mode):**
  - Backend server ishlayotgan paytda `/api/chat` orqali ishlaydi (Gemini API kaliti qo'shilsa to'g'ridan-to'g'ri Google Gemini AI orqali javob beradi).
  - Agar server yoqilmagan bo'lsa yoki sayt **GitHub Pages**da ochilsa, AI yordamchi to'xtab qolmaydi — brauzerning o'zidagi mahalliy aqlli bilimlar bazasidan foydalanib bir zumda javob qaytaradi!

### 2. ⚡ Backend Server & 🤖 Telegram Bot
- `server.js` yaratildi:
  - `GET /api/status`: Tizim holati va AI provider ma'lumotlari.
  - `POST /api/chat`: AI suhbat APIsi (Gemini API va lokal NLP mexanizmi bilan).
  - `POST /api/contact`: Sayt orqali to'g'ridan-to'g'ri xabar yuborish APIsi (Behruzbekning Telegramiga bir zumda yetkaziladi).
  - Statik fayllarni xizmat ko'rsatish (`index.html`, `style.css`, `script.js`, `img/`).
- `bot.js` — Ko'p funksiyali Telegram Bot (`@Behruzbek_murojat_bot`):
  - 🎮 **O'yinlar:**
    - 🎯 **Sonni top:** 1 dan 100 gacha bo'lgan sonni topish o'yini.
    - 🪨✂️📄 **Tosh, Qaychi, Qog'oz:** Inline tugmalar bilan botga qarshi o'ynash.
    - 🧠 **IT Viktorina:** Dasturlash bo'yicha qiziqarli testlar va ball hisoblash.
    - 🎲 **Omadli Zar:** Tasodifiy omad sinovi.
  - ✍️ **Murojaat yuborish:** Foydalanuvchilar bot orqali xabar yozganda to'g'ridan-to'g'ri Behruzbekning Telegramiga yetib boradi va Behruzbek o'sha xabarga Reply bosib javob yoza oladi.
  - 🤖 **Gemini AI:** Bot ichida ham sun'iy intellekt bilan erkin muloqot qilish.

### 3. 🎨 Dizayn va UI/UX xatolarini tuzatish
- **Mavzu (Dark/Light mode) xotirasi:** Oldin sahifa yangilanganda mavzu tanlovi o'chib ketardi. Endi `localStorage` orqali saqlanadi va brauzer sozlamalariga moslashadi.
- **Kontrast va o'qilish:** Tugmalardagi qoramtir yozuvlar yuqori kontrastli oq rangga o'zgartirildi va WCAG standartlariga moslashtirildi.
- **Yorug' mavzu (Light theme) uyg'unligi:** Navbar rangi fonga moslashtirildi.
- **Kursor xatoligi:** Sichqoncha bosilganda (mousedown) animatsiya o'chib ketish xatosi tuzatildi. Kursor ekrandan chiqqanda silliq yashirilishi ta'minlandi.
- **Mobil moslashuvchanlik:** Mobil ekranlarda menyu, o'yinlar va AI chat to'liq moslashuvchan holatga keltirildi.
- **Xavfsizlik:** Barcha tashqi havolalarga `rel="noopener noreferrer"` atributi qo'shildi.
- **O'yinlar:** Bug Squash va Xotira o'yinidagi chegaradan chiqish va tez bosishdagi nosozliklar bartaraf etildi.

---

## 🚀 Loyihani ishga tushirish

### 1. Talablar
- [Node.js](https://nodejs.org/) (v18 yoki undan yuqori)

### 2. Paketlarni o'rnatish
```bash
npm install
```

### 3. Serverni ishga tushirish
```bash
npm start
```
Yoki o'zgarishlarni avtomatik kuzatish uchun (development mode):
```bash
npm run dev
```

Brauzeringizda oching:
👉 **http://localhost:3000**

---

### Telegram botni ishga tushirish
1. `.env` faylida `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` qiymatlarini kiriting.
2. `npm start` serverni va sozlangan botni birga ishga tushiradi. Botni alohida ishga tushirish uchun:
   ```bash
   npm run bot
   ```
3. Bot bilan Telegram chatini ochib `/start` yuboring; murojaatlarni qabul qiladigan admin akkaunti ham botga `/start` yuborgan bo'lishi kerak.

Bir bot uchun polling rejimini faqat bitta jarayonda ishlating (`npm start` va `npm run bot` ni bir vaqtda bajarmang). Avtomatik bot ishga tushishini o'chirish uchun `.env` fayliga `START_BOT=false` qo'shing. Telegram bot tokeni va Gemini API kaliti avval kod ichida bo'lganligi sababli, ikkalasini ham yangilab, yangi qiymatlarni faqat `.env` fayliga kiriting.

## 🔑 Gemini AI kalitini ulash (ixtiyoriy)

Agar AI yordamchini Google Gemini API bilan to'liq bog'lamoqchi bo'lsangiz:
1. [Google AI Studio](https://aistudio.google.com/app/apikey) saytidan bepul API kalit oling.
2. Loyiha papkasidagi `.env` faylini oching:
```env
PORT=3000
GEMINI_API_KEY=sizning_gemini_api_kalitingiz
```
3. Serverni qayta ishga tushiring (`npm start`).

*(Agar kalit kiritilmasa, AI yordamchi o'zining ichki aqlli bilimlar bazasidan foydalanib mukammal javob berishda davom etadi).*

---

## 📁 Loyiha tuzilishi

```
behruzbek484.github.io/
├── index.html        # Asosiy HTML tuzilishi va AI widget
├── style.css         # Zamonaviy dizayn, neon effektlar, responsive CSS
├── script.js         # Frontend logikasi, animatsiyalar va AI mijoz
├── server.js         # Node.js Express backend (AI & Contact API)
├── package.json      # Loyiha konfiguratsiyasi va kutubxonalar
├── .env.example      # Muhit o'zgaruvchilari namunasi
├── .gitignore        # Git kuzatmasligi kerak bo'lgan fayllar
└── img/              # Rasm va logotiplar (B.png)
```

---

## 👤 Muallif

**Behruzbek Bekturdiyev**
- Telegram: [@bekturdiyefv](https://t.me/bekturdiyefv)
- Email: [behruzbekbekturdiyev011@gmail.com](mailto:behruzbekbekturdiyev011@gmail.com)
- GitHub: [behruzbek484](https://github.com/behruzbek484)
