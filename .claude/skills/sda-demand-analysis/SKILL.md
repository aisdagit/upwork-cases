---
name: sda-demand-analysis
description: Глибокий bottom-up аналіз попиту для заданих ніш/сегментів — дані з explicit джерелами/припущеннями на кожному твердженні, сегмент-специфічний bottom-up funnel, In-house vs external, Realistically Addressable Pool, buying triggers, why-external/why-us, SAM (Pool × contract) на 0/12/24/36 міс, Revenue-target reverse-check, revenue-сценарії з sensitivity note, Verdict+Confidence. Для SDA — української ІТ-аутсорс компанії ~40-50 людей, відділ MARS. Документ фокусується на даних, не на переконливих висновках. Викликати коли просять "проаналізуй попит на нішу X", "чи варто заходити в сегмент Y", "demand analysis для...", або потрібно розрахувати, скільки клієнтів/яка penetration потрібна для revenue-цілі.
---

# Аналіз попиту: [назва ніші/сегмента(ів)]

**Важливо:** цей документ фокусується на даних, не на переконливих висновках. Стратегічні висновки й пріоритизацію користувач формує окремо на основі цих даних; завдання документа — дати для цього надійний, прозорий і повністю простежуваний до джерел матеріал.

**Головний принцип дослідження:** мета — не відповісти "ринок коштуватиме $X млрд.", а відповісти в такому дусі: "є приблизно X-Y компаній, які можуть купувати саме такий тип external service сьогодні; через 24 місяці їх може бути Z. При середньому контракті $N це створює serviceable market приблизно $A-B, і для досягнення $[revenue target] потрібно отримати C% цього pool." Саме такий рівень конкретики потрібен для рішення про запуск нового напрямку — а не абстрактний TAM індустрії.

## Контекст компанії (дефолт, уточнити якщо інше)
Українська ІТ-аутсорс компанія, ~40-50 співробітників (senior software engineers, QA/automation, DevOps/cloud, AI/Data). Входить у нову нішу як зовнішній вендор. Відділ MARS — замовник. Якщо в межах сегмента є кілька чітко відмінних під-ліній сервісу — рахувати SAM і timing окремо для кожної.

## Крок 0. Перевірка сегментації — ОБОВ'ЯЗКОВО перед початком дослідження
Перевірити для кожної пари заданих сегментів: чи є вони самостійними ринками з відмінними (а) buyer types, (б) buying triggers, (в) budgets/procurement path, (г) competitive set? Якщо сегмент суттєво перекривається з іншим — явно зазначити це на початку документа (Segment validity note), описати характер перекриття і рекомендувати об'єднання/уточнення меж. Не підтримувати штучну сегментацію лише тому, що вона так задана користувачем. Типові кандидати на перекриття (приклад для Development): Custom Software Development vs Product Development; Enterprise Apps vs Business Process Automation; Cloud/Platform Engineering vs частина Modernization.

## Правила дослідження

**Джерела:** Пріоритезувати 2025-2026, але старіші використовувати, якщо вони найкращий доступний доказ для історичної динаміки, contract benchmarks, buyer behavior чи структурних характеристик. Пріоритет первинним джерелам (офіційні звіти, investor materials, surveys, customer cases, job postings, funding data, procurement-документи). Тріангулювати через кілька типів evidence (adoption-статистика, кількість relevant companies, vendor revenues, customer examples, опитування, розкриті бюджети). Якщо джерела суперечать — не обирати зручнішу цифру, показати обидва результати і range.

**Точність і прозорість даних:** кожна цифра/твердження в основному тексті повинні мати inline-позначку [Спостережено]/[Обчислено]/[Припущення] і посилання на джерело — без винятків, одразу біля тексту. Якщо доказу немає — писати explicit "джерело не знайдено", а не вигадувати evidence. Не створювати false precision — діапазон замість точної цифри.

**TAM/CAGR** — другорядний контекстний індикатор, показати один раз на сегмент, не апріорі "ненадійний" (якщо джерела узгоджені — зафіксувати це як факт), не повторювати далі в тексті.

**Що рахувати:** кількість потенційних компаній-покупців і наскільки ринок реально доступний зовнішнім providers, а не лише TAM у $. Враховувати in-house команди й альтернативи (open source, self-serve SaaS, DIY) як конкурентів/субститутів.

## Bottom-up funnel — сегмент-специфічний, не шаблонний
Не форсувати фіксований 5-кроковий шаблон. Побудувати власний, дрібногранульований ланцюжок переходів, специфічний саме для механіки купівлі цього сегмента. Орієнтир (приклад для Agent Evaluation, адаптувати логіку під сегмент): всі relevant компанії → використовують/розробляють → agent у pilot/production → agent виконує важливі/складні tasks → мають проблему reliability/evaluation → не закривають її повністю in-house → готові використовувати external vendor → мають бюджет → відповідають ICP → реально доступні нам. Для кожного переходу — evidence або explicit [Припущення]; крок "не закриває in-house" відділити від кроку "готовий платити зовні" — це різні речі.

**Realistically Addressable Pool — точне визначення (головне число документа):** компанії, які одночасно: 1) мають потребу; 2) реально купують externally; 3) мають доступний і цікавий contract size; 4) не мають бар'єрів, що виключають вендора цього профілю; 5) реально охоплені sales-командою протягом 12-24 міс. Число з ранніх, ширших кроків funnel не є Pool і не повинно видаватись за нього.

## In-house vs external — окреме дослідження (критична змінна)
Дослідити explicit: що роблять in-house зараз; що вже віддають зовнішнім vendors; які задачі найчастіше залишають всередині і чому; що конкретно змушує звернутись до external provider; чи є докази реального виділеного бюджету на external services. Якщо точної статистики немає — побудувати Conservative/Base/Aggressive сценарії частки external-adoption з explicit припущеннями.

**Buying triggers:** конкретні події, що змушують ICP купувати саме зараз (приклад для Legacy Modernization: EOL technology, cloud migration, acquisition, cost reduction, shortage of legacy engineers, security/compliance, AI modernization initiative). Розділити на budget-creating vs interest-only. Визначити, на якій стадії adoption (prototype→pilot→production→business-critical) типово виникає willingness to pay.

## Ability to win
Хто реально бореться за ЦЕЙ ICP (3-6 гравців з джерелом). Прецеденти вендора порівнянного профілю, що зайшов на цей ринок — або explicit "прецеденту не знайдено". Sales difficulty, trust barrier, procurement, compliance, sales cycle — з джерелами.

**Why external / why us:** чому buyer віддає роботу зовнішньому вендору, а не hiring internally/SaaS-open-source/incumbent? Які vendor-selection advantages релевантні (expertise, speed, cost, geography/timezone, specialization, integration, flexibility) — з доказом. Якщо переконливої причини не знайдено — explicit "compelling reason not found".

## Розмір і тайминг ринку — SAM, не лише TAM
Timing-таблиця 0/12/24/36 міс з колонками: стадія adoption, типові покупці, основна потреба, addressable accounts (діапазон), кожна клітинка з позначкою.

**SAM:** Realistically Addressable Pool (кількість на горизонті) × typical contract size — порахувати для зараз/+12/+24/+36, окремо для кожної під-лінії сервісу, якщо є.

**Contract size** — ієрархія джерел: 1) disclosed contracts/procurement; 2) customer/vendor cases; 3) published rates; 4) industry benchmarks; 5) derived estimate. Якщо anchor немає на жодному рівні — "reliable contract-size evidence not found", використати широкий діапазон [Припущення].

## Revenue-target reverse-check
Для orientировочних цілей доходу ($1M/$3M/$5M за замовчуванням, уточнити реальні цілі): Клієнтів потрібно = target/contract; Необхідна penetration = клієнтів/Pool. Подавати як факт, без оцінки "чи достатньо це".

## Scenario model — з sensitivity
Conservative/Base/Aggressive для Pool/SAM/revenue, варіюючи adoption rate, production-penetration, частку з реальною потребою, external-vendor adoption rate, average contract value. Explicit вказати 2-3 припущення, що найбільше змінюють результат.

## Структура фінального документа
0. Segment validity note.
1. Сигнальна таблиця: Сегмент | Realistically Addressable Pool (сьогодні) | Verdict (GO/NO-GO/CONDITIONAL-GO) | Confidence (High/Medium/Low), без розгорнутого обґрунтування.

Для кожного сегмента: 1) Market direction (2-4 речення з посиланнями, TAM один раз); 2) Bottom-up funnel → Pool з in-house-vs-external і buying triggers; 3) Ability to win з why external/why us; 4) SAM на 0/12/24/36; 5) Expected economics з sensitivity note; 6) Revenue-target reverse-check; 7) Verdict + Confidence + одне речення про найвпливовіші дані.

Зведена таблиця (декілька сегментів): Сегмент | TAM (контекст) | External-service SAM (зараз) | Addressable accounts зараз/+24м | Typical contract | Market timing | Confidence.

Data summary — стисле відновлення відповідей фактами: скільки покупців сьогодні; скільки через 12/24/36м; яка частка ринку доступна зовнішнім vendors; скільки клієнтів/penetration для revenue targets; де нові дані збігаються/розходяться з раніше зафіксованими оцінками користувача (якщо є).

Додаток: повна таблиця TAM/CAGR по джерелах; повний список конкурентів з funding; розгорнуті прогнозні таблиці; повний список джерел з URL.

## Верифікація перед видачею результату
Крок 0 виконано; кожна цифра має inline-позначку і джерело; funnel сегмент-специфічний з розділеними кроками in-house/external; Pool розраховано за всіма 5 критеріями; In-house vs external окремо від buying triggers з Conservative/Base/Aggressive де немає статистики; визначено стадію willingness-to-pay; SAM порахований explicit на 4 горизонтах; revenue-target reverse-check без оцінного висновку; sensitivity note на 2-3 припущення; why external/why us заповнено або explicit "not found"; TAM не повторюється; contract-size evidence за ієрархією з чесним "not found"; Confidence відповідає реальному співвідношенню даних; текст сфокусований на даних, а не на переконливих висновках.
