# Профілі, які моніторимо

Скіл лише читає профілі (публічно) і дає рекомендації; зміни на Upwork вносять вручну. Щоб додати людину — скопіювати блок і заповнити. `profile_key` — ключ, що починається з `~` (з посилання виду `upwork.com/freelancers/~01...`). Посилання з ніком (`/freelancers/oleksandrs159`) MCP не приймає — ключ треба взяти зі сторінки профілю або попросити в людини.

Папка історії (знімки ринку й минулі звіти):
`/Users/unicornio/Documents/агенти/Контекст SDA/Upwork монітор/`

Акаунти Upwork MCP:
- агенція SDA — `org_uid 1244594598505185280` (FL_AGENCY)
- особистий акаунт для пошуку вакансій — `org_uid 1257205092955422721` (TALENT)

---

## 1. Агенція SDA
- Тип: agency
- Як читати: `get_agency get_profile`, `get_agency list_projects` від акаунта агенції
- Ніша: кастомні веб-платформи, SaaS і MVP від $5k; «перейняти / довести до запуску» чужий продукт чи AI-прототип; AI-функції; автоматизація бізнес-процесів; Atlas ERP
- Позиціонування: «Your technology partner from first idea to business automation», 4 сегменти клієнта (ідея; стартап після AI-прототипу; проблемний підрядник; готовий бізнес з ручними процесами)
- Запити для вакансій: базова вибірка (див. method.md)
- Примітки: повне оновлення профілю підготовлено 11.11.2026 (Claude Doc «Upwork-профіль агенції SDA: оновлення»). Цифри для текстів: 150+ проєктів, 20+ країн, з 2019, AWS Select Tier Services Partner.

## 2. Саша Харченко — CTO
- Тип: freelancer
- profile_key: `~017b6540ddf96a0800`
- Посилання: https://www.upwork.com/freelancers/~017b6540ddf96a0800/
- Ніша (цільова): Full-Stack Developer | SaaS & AI — SaaS і MVP, кастомні платформи, take over / launch AI-built apps, AI-функції, платежі. Стек: Next.js, React, Node.js / NestJS, Python / FastAPI, PostgreSQL, Supabase, Stripe, AWS, OpenAI / Claude API.
- Запити для вакансій: `title` = "full stack", "Next.js", "SaaS", "MVP"; `query` = "take over existing app", "Lovable Supabase production"
- Примітки: станом на 11.11.2026 профіль ще IoT («IoT Engineer | AWS IoT | MQTT…»); 11.11 підготовлено новий профіль Full-Stack & AI (Claude Doc «Upwork-профіль … Full-Stack & AI Engineer»), Саша вносить його найближчим часом. Поки профіль не оновлено — у звіті перевіряти, чи нові тексти внесено, і не пропонувати IoT-правки. Кейси для портфоліо — з того ж документа (16 реальних кейсів SDA).

## 3. Саша Шубін — CEO, засновник SDA
- Тип: freelancer
- Посилання: https://www.upwork.com/freelancers/oleksandrs159
- Стан на 11.11.2026: «Senior Full-Stack Developer | SaaS & FinTech | Next.js, Node.js»; 100% JSS, Top Rated Plus, $200K+, 59 jobs, 3,319 год; каталог: Discovery $900 / $2,500 / $6,000, WordPress-сайт $2,700, консультація $100
- profile_key: немає (`~`-ключ зі сторінки не береться: у HTML видно ключ того, хто залогінений). Як читати: відкрити публічне посилання в браузері і взяти текст сторінки (get_page_text). Акаунт Саші до MCP не підключаємо.
- Ніша: Senior Full-Stack / AI Developer, засновник SDA; MVP для фаундерів «за тижні»
- Запити для вакансій: `title` = "full stack", "MVP", "CTO"; `query` = "fractional CTO", "technical co-founder"
- Примітки (аудит MARS, 6.08.2026): сильний соціальний доказ (Top Rated Plus, 100% JSS, $200K+, 120+ проєктів, 20+ країн), хороша структура; головна проблема — «роблю все» (React/Next/Node/Python/Django/.NET/Laravel/Shopify/WordPress/RoR/AI/mobile) і keyword stuffing у заголовку; портфоліо без цифр результату; суперечність «особистий фрилансер vs CEO з командою». Правка №1 — звузити до однієї спеціалізації.

---

## Шаблон для нової людини
- Тип: freelancer
- profile_key: `~...`
- Посилання:
- Ніша (цільова):
- Запити для вакансій:
- Примітки:
