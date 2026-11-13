---
name: "sda-service-page-copy"
description: "Тексти сервісної сторінки сайту SDA під шаблон сайту — з нуля для нової послуги або переробка чернетки/старих текстів. Використовувати, коли просять «оформи послугу під сайт», «зроби сторінку сервісу», «підгони тексти під шаблон», «нова послуга на сайт»."
---

# Тексти сервісної сторінки сайту SDA

Скіл готує повний комплект текстів для однієї сервісної сторінки sda.company. Результат — готовий до передачі файл: копірайт англійською для сайту, нотатки для дизайнера й розробника українською. Файл має читатися як остаточний документ, тому в ньому немає версій, змін, «було/стало» чи службових вступів.

**Файл передають зовнішнім підрядникам (дизайнер, розробник).** Тому в ньому немає внутрішньої кухні: жодних нотаток про те, що якусь цифру вигадано чи її треба підтвердити, звідки взято факт («з таблиці», «з чернетки»), позначок ⚠️, `[уточнити]`, альтернативних варіантів «якщо не підтвердиться — замінити на…». Лишаємо тільки нотатки, корисні підряднику: що показати на візуалі, акцентні слова, куди веде кнопка чи лінк, що перевірити по ширині, що ROI-калькулятор — віджет. Усі відкриті питання й сумніви пишемо користувачу в чат, а не у файл.

## Два режими

**A. Переробка.** Користувач дає наявні тексти (чернетка маркетологині, старі тексти, документ з кількома сервісами). Беремо зміст і факти звідти, але приводимо все до шаблону нижче: кількість елементів, довжина, тон. Прибираємо дублі, внутрішні нотатки («Option A / B», «recommend confirming with…»), розмиті формулювання. Нічого фактичного (ціни, терміни, лід-магніт, гарантії) не вигадуємо: якщо в джерелі цього немає, беремо з контекстних файлів і правил цін нижче, а якщо немає й там, формулюємо без конкретики, а питання ставимо користувачу в чаті.

**B. З нуля.** Користувач каже «нова послуга X» і, можливо, кілька фактів. Спершу збираємо контекст з файлів (розділ нижче). Якщо після цього не вистачає ключового — для кого послуга, що входить, — ставимо одне коротке питання. Якщо користувач не відповідає, пишемо найкращий варіант без конкретики, якої немає, і перелічуємо відкриті питання в чаті.

Якщо в одному документі кілька сервісів, а користувач назвав один, працюємо тільки з ним.

Категорії сервісів на сайті включають Team Extension (Dedicated Team, Forward Deployed Engineer, UX/UI Design): там продаємо senior-людей погодинно або за фіксований скоуп.

## Контекст, який треба прочитати перед написанням

Папка на комп'ютері користувача: `Контекст SDA` (у device_bash: `$HOME/mnt/Контекст SDA`). Якщо папка не підключена, попросити підключити.

- `Загальна таблиця сервісів MARS.csv` — опис, ICP, сигнали, що включає, артефакти по кожному сервісу. Ціни — за правилами цін у цьому скілі (вони мають пріоритет).
- `Таблиця лідмагнітів MARS.csv` — лід-магніти: що клієнт отримує, формат, термін.
- `SDA_service_page_template.docx` — логіка шаблону сервісної сторінки (проблема → рішення → докази → CTA) і приклад тону.
- `SDA_site_structure.docx` — позиціонування сайту, сегменти клієнтів, меседж «AI-accelerated, human-verified».
- **Таблиця кейсів, які зараз є на сайті** — експорт Notion «Оновлення презентацій» (колонка «Матеріали» → рядок «кейс на сайті: …»). Його копія (станом на 28.10.2026) — у розділі «Кейси на сайті» в кінці скіла. Якщо користувач дає новішу таблицю, вона має пріоритет.
- `База знань про компанію/Projects SDA …_all.csv` — таблиця кейсів з деталями (Hook, «З чим прийшов клієнт», Involvement, Key Services Provided).
- `База знань про компанію/All Cases NEW 1p (2).pdf` (і `5p`) — слайди кейсів. PDF складається з картинок: рендерити сторінки (`pdftoppm -r 60`), склеювати в аркуші (`montage`, 6 на аркуш) і читати заголовки очима. Великий PDF стейджити в контейнер через device_stage_files. Для відомих кейсів заголовки вже є нижче.

## Шаблон сторінки (порядок блоків як на сайті)

Копірайт пишемо англійською. Нотатки для дизайнера (візуал, що перевірити) пишемо курсивом українською всередині блоку.

### 1. Hero
- **H1** — один варіант, про біль або бажаний результат клієнта, а не назва послуги. Питання або коротке твердження, до ~10 слів. Окремо вказати 2–3 акцентні слова для жовтого виділення.
- **Description** — одне речення, ~20 слів.
- **CTA 1 (primary)** — зазвичай «Book a Discovery Call».
- **CTA 2 (secondary)** — легший крок: веде на лід-магніт або на кейси.
- Будь-яка кнопка на сторінці — до 4 слів / ~25 символів («Book Free Scoping Call» — ок, «Start With a Product Definition Sprint» — задовго).

### 2. Problems We Solve
- Рівно **5 пунктів**, кожен 4–8 слів, мовою клієнта.
- **Banner**: «If any of this sounds familiar, that's exactly the kind of problem we solve.» Можна адаптувати під послугу.

### 3. How We Solve It
- Рівно **5 пунктів** (на сайті це акордеон з вертикальними табами).
- Назва КАПСОМ, 2–3 слова, до ~22 символів; найдовшу позначити для перевірки дизайнером.
- Опис — 1 речення, ~20–25 слів, схема «що робимо → що це дає клієнту».
- *Візуал:* одна нотатка українською, що показати на картинці.

### 4. What You Get
- Рівно **7 карток** (у дизайні сайту 7 місць).
- Назва КАПСОМ, до 3 слів. Опис до ~12 слів.
- Результат для бізнесу, а не технічна фіча. Без дублів між картками.

### 5. Key Business Results
- Рівно **3 колонки**. У кожній: **велике число** («6–10 WKS», «100%», «0», «$5M», «2x»), а не текстова фраза. Далі підпис КАПСОМ (4–7 слів) і опис в 1–2 речення.
- Числа — з реальних даних (кейси, правила цін, те, що дав користувач). Довге число позначаємо для перевірки ширини колонки (на сайті найдовше — «5 HRS»).

### 6. Take a Look at What We've Built (кейси)
- **3 кейси в блоці — тільки ті, що зараз є на сайті і мають посилання** (розділ «Кейси на сайті»). Fake (внутрішні проєкти) — теж можна, якщо вони є на сайті.
- Кожен кейс: **назва проєкту → точний заголовок слайда з PDF** + одне речення, чому підходить. Під кожним — рядок **«Посилання:»** з URL сторінки кейсу для розробника.
- У кінці документа — **Додаток: усі кейси, що підходять під послугу**: усі релевантні кейси, зокрема ті, яких ще немає на сайті (розділ «Інші кейси без сторінки на сайті»). Групи: «Найсильніші», «Добре підходять», «Запасні». Колонки: Назва | Назва в PDF | Чому підходить | Посилання. Якщо сторінки на сайті немає — «—», без пояснень.
- Про NDA не попереджаємо. Дрібні неузгодженості між таблицею й слайдом (рік, тривалість тощо) не критичні — приміток про них не пишемо.
- Якщо кейс по суті не показує те, що ми про нього стверджуємо, або назва слайда суперечить позиціонуванню (наприклад, «MVP»), кажемо про це користувачу в чаті, а не у файлі.

### 7. Lead Magnet
- **Eyebrow** КАПСОМ, **Headline** — питання про невизначеність клієнта (з акцентними словами), **Body** — 1 речення, **Checklist** — рівно **4 пункти** по 3–6 слів, **CTA button** — до 4 слів, **Microcopy** біля кнопки знімає тиск.
- **Усі лід-магніти безкоштовні.** Платних пропозицій (sprint за $900, сесія за $100, аудит за $500) у цьому блоці не буває. Обираємо один із типів:
  1. **Безкоштовна консультація** — 30 хв зі спеціалістом (Free Consultation / Free Scoping Call).
  2. **Безкоштовний аудит** — AI Code Audit, UX review, Health Check, перевірка інфраструктури тощо.
  3. **ROI-калькулятор** — для автоматизації, інтеграцій, AI-агентів, скорочення SaaS-стеку. Це віджет: текстовий блок усе одно заповнюємо, плюс нотатка про віджет.
  4. **Безкоштовне міні-discovery** (BA-аналіз) — коротка версія Product Definition Sprint з акцентом на аналіз: скоуп, пріоритети, ризики, орієнтовна оцінка.
  Для AI Product Development — AI Opportunity Snapshot (безкоштовний, готується за 48 годин).

### 8. Why Us
- Формат як на сайті: заголовок секції + **6 плиток** (велике число, підпис, 1 коротке речення, текст лінка).
- Базові факти з сайту: **2019** founded; **150+** projects delivered; **98%** client satisfaction; **96%** senior engineers; **3** in-house products; **100%** AI-assisted development. Також: AWS Partner Select Tier, рейтинг 5.0 на Clutch та Upwork.
- Адаптуємо під сервіс: заголовок — про цей сервіс, 2–3 плитки замінюємо на релевантні факти (з кейсів або правдоподібні — вигадувати дозволено). У файлі не позначаємо, які цифри вигадані; перелічуємо їх користувачу в чаті. Нотатка для розробника, куди веде лінк плитки, — ок.

### 9. How We Work
- Рівно **5 кроків** («01 DISCOVER» … «05 LAUNCH», назви під послугу, КАПСОМ, 1 слово), під кожним один рядок до ~10 слів.

### 10. Final CTA
«Без змін» + нотатка, що на сайті цей блок стоїть перед FAQ.

### 11. FAQ
- 6–9 питань без дублів. Обов'язково: ціна, терміни, хто володіє кодом/IP (work-for-hire, код і IP належать клієнту — для всіх послуг), з чого почати, що після завершення. Плюс 2–4 питання під головне заперечення ICP. Відповідь — 2–4 речення.

## Правила цін

У FAQ, Results і всьому тексті ціни лише такі (рейтів людей на сайті не називаємо):
- розробка продукту: **$5,000–25,000**;
- ERP, автоматизації, інтеграції, скорочення SaaS-стеку, сапорт: невеликий скоуп **від $2,000**, повна система **$30,000–80,000** залежно від складності й обсягу;
- окремі senior-розробники, дизайнери, команди (Team Extension): погодинно або за фіксований скоуп, без рейтів;
- решта: обсягова робота **від $5,000**, невелика **від $2,000**.

## Як має звучати текст

- **Про клієнта, а не про нас.** Заголовки — про його біль чи результат.
- **Конкретно.** Цифри, терміни, назви інструментів замість «high-quality», «innovative», «seamless», «cutting-edge», «leverage», «robust».
- **Коротко.** Ліміти довжини — жорсткі.
- **Схема «X, so Y»**, не більше одного контрасту «…, not …» на блок.
- **Позиціонування SDA:** AI-native розробка, де AI дає швидкість, а senior-інженери відповідають за архітектуру і якість («AI-accelerated, human-verified»). Продаємо якісний продукт і партнерство, а не швидкий прототип; не будуємо сторінку навколо «від ідеї до MVP», якщо користувач прямо не попросив.
- **Чесно.** Не обіцяти того, чого немає в джерелах (виняток — Why Us, де вигадувати дозволено, але це не позначаємо у файлі).
- **Американська англійська**, sentence case, крім того, що на сайті капсом.

## Перевірка перед здачею

- [ ] Кількості: 5 problems, 5 how-we-solve, 7 what-you-get, 3 results (у кожному число), 4 пункти чеклісту, 6 плиток Why Us, 5 кроків How We Work.
- [ ] H1 один. Є CTA 2, eyebrow і microcopy. Усі кнопки до 4 слів. Лід-магніт безкоштовний.
- [ ] Ціни відповідають правилам; рейтів людей немає.
- [ ] 3 кейси в блоці — з сайту, з посиланнями; у додатку всі релевантні кейси з колонкою «Посилання» («—», якщо сторінки немає).
- [ ] FAQ без дублів, є ціна/терміни/IP.
- [ ] Жодних «v2», «оновлено», «було/стало», вступних нотаток, «Option A/B», `[уточнити]`, ⚠️, нотаток «вигадано / підтвердити / взято з…», приміток про NDA — файл іде підрядникам.

## Формат і здача

- Файл `.md` з назвою `<Назва сервісу> — тексти для сайту.md` (без «/» у назві файлу). Структура: `# <Назва сервісу> — тексти під шаблон сайту`, далі `## 1. Hero` … `## 11. FAQ`, розділювачі `---`, у кінці `## Додаток: усі кейси, що підходять під <сервіс>`.
- Надіслати файл користувачу. Якщо попросять покласти в папку — `Контекст SDA/Claude outputs/`.
- У чаті — коротко: що зроблено, які 3 кейси в блоці, який лід-магніт, і всі відкриті питання та вигадані факти (вони живуть тільки в чаті, не у файлі).

## Кейси на сайті (станом на 28.10.2026)

З цього списку беремо 3 кейси для блоку (вони мусять мати сторінку на сайті). У додатку можна використовувати й кейси без сторінки — див. наступний розділ.

| Проєкт | Заголовок слайда (PDF) | Посилання |
|---|---|---|
| Samata Health | 10X Performance Boost for Mental Health Platform | https://sda.company/cases/category/mental-health/mental-health-platform-samata-health |
| Rise | Scaled AI Job Platform to 3M+ Users | https://sda.company/cases/category/other/talent-community-rise |
| Wildcast | Built Podcast Ad Marketplace With Advanced Integrations | https://sda.company/cases/category/other/podcast-ad-platform-wildcast |
| ETFInsider | Transformed Legacy Trading System into Scalable Web Platform | https://sda.company/cases/category/fintech/stock-market-forecasting-platform |
| Five | Built Expert Marketplace That Secured $5M Investment | https://sda.company/cases/category/other/platform-for-experts-five/ |
| Kyle app | Turned Unstable App into 3X Faster Product | https://sda.company/cases/category/other/music-app-kyle |
| YourFlexExec | Built Executive Marketplace MVP From Scratch | https://sda.company/cases/category/other/executive-talent-marketplace |
| Mintarius | Built Centralized Data Platform for Precious Metals Industry | https://sda.company/cases/category/manufacturing/precious-metals-data-platform/ |
| Intelza | Supported AI Voice Bot Platform for Automated Customer Communication | https://sda.company/cases/category/ai/intelza-ai-voice-bot/ |
| HeyBodhi | Accelerated AI Educator Platform MVP for Pilot Launch | https://sda.company/cases/category/ai/heybodhi-ai-educator-platform/ |
| MeatMap | Built Marketplace & Directory MVP From Scratch | https://madeby.sda.company/project-mmc |
| Shmoodie | Expanded Mental Health App with AI Communication Features | https://sda.company/cases/category/mental-health/mental-health-application/ |
| Rewarded App | Built Scalable Loyalty & Rewards Platform for Customer Retention | https://sda.company/cases/category/food-and-beverage/customer-loyalty-program-platform/ |
| Datascoop.ai | Modernized AI Analytics Platform with Advanced Data Visualization | https://sda.company/cases/category/ai/datascoop-ai-analytics-platform/ |
| Facilities | Built AI-Powered Market Intelligence Platform for Senior Care Providers | https://sda.company/cases/category/healthcare/senior-care-management-platform/ |
| Аіроджект (aviation) | Accelerated Aviation Marketplace Launch for 150+ Industry Companies | https://sda.company/cases/category/other/social-marketplace-for-aircraft-engines/ |
| The Hourglass Society | Built Personalized Fitness Platform With No-Code Development | https://sda.company/cases/category/wellness-and-fitness/fitness-app-for-body-shaping/ |
| Firstcomtrading (FCT) | Built Inventory Automation System for Multi-Channel eCommerce | https://sda.company/cases/category/manufacturing/platform-for-inventory-automation/ |
| GS low | Built Data Intelligence Platform for Corruption Analysis | https://sda.company/cases/category/other/corruption-observatory-platform/ |
| Dashcam Dashboard (Nexar) | Designed AI Dashcam Analytics Platform for Fleet Safety | https://sda.company/cases/category/automotive/dashcam-analytics-dashboard/ |
| Spread App | Rebuilt Hockey Fan Engagement App for 260K+ Users | https://sda.company/cases/category/sport/sport-club-app-spread/ |
| InPlay | Built NFT Sports Content Monetization Platform | https://sda.company/cases/category/sport/monetizing-content-app-inplay/ |
| Opencare | Built Animal Care Operations SaaS Platform From Scratch | https://sda.company/cases/category/healthcare/animals-healthcare-platform/ |
| LivUnity | Built Fitness Coaching Marketplace MVP | https://sda.company/cases/category/wellness-and-fitness/fitness-app-livunity/ |
| Crypto (Krypt) | Designed Cryptocurrency Platform For All | https://sda.company/cases/category/fintech/crypto-platform-krypt/ |
| AREA | Designed ERP Platform for Event Operations Management | https://sda.company/cases/category/other/planning-for-events-area/ |
| Dream English | Built Interactive PTE Learning Platform From Scratch | https://sda.company/cases/category/edtech/educational-platform-dream-english/ |
| Poker (Check-Raise) | Built Poker Tournament Marketplace From Scratch | https://sda.company/cases/category/other/poker-platform-check-raise/ |
| MedApp | Built Healthcare Operations MVP From Scratch | https://sda.company/cases/category/healthcare/medical-application-medapp/ |
| Nubod | Built Fitness & Nutrition Platform with 6 Third-Party Integrations | https://sda.company/cases/category/wellness-and-fitness/fitness-app-nubod/ |
| HirerPro | Built ICT Recruitment Marketplace From Scratch | https://sda.company/cases/category/hr-and-recruitment/ict-recruitment-marketplace/ |
| Bakesy | Improved Stability of Bakery SaaS Platform | https://sda.company/cases/category/other/bakery-saas-platform/ |

Інші сторінки кейсів на сайті без слайда в PDF (використовувати лише якщо дуже релевантні): health-platform-for-rapid-diagnostics, fitness-nutrition-platform, website-for-psychotherapy-center, venue-booking-management (усі на sda.company/cases/category/…).

## Інші кейси без сторінки на сайті (тільки для додатка, посилання «—»)

| Проєкт | Заголовок слайда (PDF) | Суть |
|---|---|---|
| Shareholder (BWI) | Modernized and Stabilized Legacy Financial Analytics Platform | технічний discovery, виправлення критичних багів, стабілізація legacy |
| Agroplace | Built High-Performance Data Platform From Scratch | 20+ джерел даних, складна обробка, архітектура з нуля |
| HomeCare | Created Automated Reporting for Multi-Location Home Care | дашборд замість таблиць, WellSky + QuickBooks, KPI-звітність |
| Clay | Built AI-Powered Longevity Healthcare Platform From Concept | HIPAA, multi-source health data, команда з 10 людей з нуля |
| Ping Point | From AI-Assisted MVP to Multiplatform SportsTech Ecosystem | аудит AI-згенерованого MVP, web/mobile/smartwatch/tablet |
| Unomundi | AI-Powered Mobile Learning Platform for Children | discovery, архітектура, iOS/Android, безпечні AI-функції |
| Haute Societe | Built Premium Event & Social Platform From Scratch | web + mobile + адмінка, real-time messaging |
| Qoka | Stabilized Web3 Marketplace Platform for Launch Readiness | аудит, QA і CI/CD, підготовка до запуску |
| ForgeFlow (внутрішній) | Legacy ERP Modernized into a Real-Time Cloud Platform | міграція on-prem ERP у хмару без зупинки, API до MES, −90% часу на звіти |
| PartLink (внутрішній) | B2B Portal Built From Idea to Live Marketplace in 4 Months | B2B-маркетплейс за 4 місяці, 25+ дилерів, −70% часу на замовлення |
| VisionLine (внутрішній) | AI Visual Inspection Cuts Manual QA Time by 80% | computer vision на лінії, інтеграція з MES, −80% часу інспекції |
| TransactIQ, RouteMargin, PortfolioPulse, CarrierPulse (внутрішні) | — (є 5-сторінкові презентації) | BI & Data Integration, AI/ML-дашборди для fintech, логістики, property management |