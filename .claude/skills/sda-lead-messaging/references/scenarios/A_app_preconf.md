# Сценарій A — Застосунок конференції, до або під час події (ми там будемо)

**Статус: чернетка, оновлено 06.10.2026** (позиціонування «хто ми», кінцівки, стиль). Тут тестуємо гіпотези першого повідомлення (зокрема H2 — релевантний кейс). Доточується після перших результатів.

**Коли:** застосунок відкрився (~T−14), ліди пройшли етапи 1–3; SDA буде на події; мета — прийнята зустріч.
**Канал:** Brella / b2match / Grip / Swapcard — повідомлення **разом із запитом на зустріч**. Слот застосунок додає сам.

## Чим застосунок відрізняється від LinkedIn

Людина за кілька секунд вирішує, чи віддати нам один із 10–20 слотів на конференції. Тому повідомлення має відповісти на одне питання: **«чому мені варто витратити слот саме на них»**. Це не знайомство (як нотатка до конекту в LinkedIn) і не розмова (як перший меседж після конекту), а коротка пропозиція зустрічі з причиною.

## Будова першого повідомлення

1. **Їхня ситуація** — сигнал / їхні слова / спостереження (кут, див. нижче), з конкретикою (сума або місяць раунду, 1–2 конкретні ролі, а не «hiring across AI, data, platform and software»).
2. **Наслідок для них** — чесна гіпотеза болю одним реченням («with AI, data and platform roles all open at once, I'd guess hiring is now competing with the roadmap»).
3. **Хто ми — від їхньої ситуації** (таблиця нижче), одним реченням.
4. **Кінцівка — що людина отримає від зустрічі** (банк нижче). **Не питання «Worth 15 min?» / «Can we meet?»**: запит на зустріч уже йде разом із повідомленням.

- **Довжина:** 300–450 символів.
- **Дату й час у тексті не повторювати** (вони вже в запиті).
- **Гарантію** (70% / fixed price) — не в першому повідомленні.
- **Слоти CEO** — клієнтам (Tier 1 першими), не інвесторам і не партнерам.

## Рядок «хто ми» — від ситуації ліда

**Не починати з походження** («Ukrainian / Eastern European / offshore / nearshore team») і не з загальної спеціалізації («focused on AI and integrations», «full-cycle software development»): це одразу кладе нас у купу «ще один аутсорс». Походження не приховуємо (видно з профілю), але й не ставимо першим.

| Ситуація ліда | «Хто ми» одним рядком (приклад рівня, не шаблон) |
|---|---|
| Раунд + найм (DEV-2, команда) | We add senior AI and data engineers to product teams so new features don't have to wait for new hires |
| AI-фіча / пілот не в продакшні | We get AI features from pilot into production alongside the in-house team |
| Продукт гальмує / швидко зібраний v1 | We help teams turn a fast-built v1 into something that holds under real users |
| B2B SaaS → enterprise (DEV-3) | We build the enterprise pieces (SSO, roles, audit logs) so deals don't stall in security review |
| Hardware + застосунок (IOT-6) | We build the app and data platform around devices like yours |
| Корпорат, CIO (MOD-5) | We embed engineers into IT teams to get AI automation running inside existing ERP and CRM |
| Операційний бізнес (AUT-4) | We automate the manual work between the tools your team already uses |
| Ранній фаундер з грошима, без CTO | We build first versions with founders who don't have a technical co-founder yet |

Якщо в SDA ухвалене розділення на напрями / бренди групи — «хто ми» відповідає напряму, під який підходить лід (коли користувач дасть опис напрямів — додати сюди).

## Банк кінцівок (чергувати; у партії не повторювати одну й ту саму)

| Група | Варіанти | Коли |
|---|---|---|
| **Конкретна користь від зустрічі** | Happy to share how other teams cover AI and data roles while they're still hiring. · Could be useful to walk through which parts of the roadmap an external team can pick up without slowing yours down. · Happy to compare notes on which roles make sense to cover externally and which don't. | Tier 1 із сильним сигналом |
| **Обмін досвідом, без продажу** | Would be good to hear how you're planning to scale the team this year. · Curious how you're thinking about the build vs hire balance right now. | Tier 2 / слабший сигнал |
| **Коротко, без тиску** | Sent a meeting request, happy to move it if another time works better. · If it's useful, 15 minutes should be enough to see whether there's a fit. · No pitch deck, just a quick chat about how you're scaling the team. | Можна додати окремим реченням після будь-якої іншої кінцівки |

⚠️ «Glad to share what we've seen work when teams…» — лише якщо сейл справді має що розповісти (реальний досвід / кейс). Кінцівки адаптувати під ліда (scale the team / ship the AI part / get through security review…), а не копіювати дослівно.

## Кути (записати код у «Кут»)
- **H1** — тригер + гіпотеза (сигнал з етапу 3);
- **H2** — релевантний кейс SDA: «we recently <зробили що> for a <тип компанії>» — **лише з реального кейсу**, який дав користувач / є в `references/` (вигадувати заборонено);
- **H1-own** — їхні слова з pitch;
- **H1-obs** *(тест)* — спостереження про суть їхнього продукту;
- **H3** — кваліфікаційне питання (Tier 2).

## Стиль
- **Без довгого (—) і середнього (–) тире**: замість них крапка, кома або двокрапка (тире робить текст схожим на згенерований).
- Не повторювати одне ключове слово (roadmap, AI, scale…) у сусідніх реченнях.
- Прості речення, без «excited», «impressive», «game-changer».

## Після першого повідомлення: фолов-ап, потім заміна слота

| Крок | Коли | Що робимо |
|---|---|---|
| **Фолов-ап** (один) | Через 3–4 дні без відповіді, не пізніше T−3 | 1–3 речення: нова деталь або простіший формат зустрічі; можна запропонувати інший час (тут конкретний час доречний — це новий запит). Не «just following up» |
| **Скасування і заміна слота** | Якщо після фолов-апу відповіді немає (≈ T−2) | Скасувати запит з коротким людським повідомленням (не лише автоматичне «I'm not able to meet») і віддати слот наступному ліду зі списку (Tier 1, потім Tier 2) |

**Третього повідомлення в застосунку немає.** Далі — сценарій C (LinkedIn після конференції), якщо лід цікавий.

Приклади:
> Hi Christian, one more thought: teams moving into clinical pilots often hit integration work with hospital systems sooner than planned. If the slot I sent doesn't suit, happy to pick another time or just say hi between sessions.

> Hi Asim, I'll free up this slot so it doesn't block your schedule. If you'd like to chat during the event, just send me a time.

У JSON фолов-ап — у полі `"Фолов-апи"` як `FU1 (+3–4 дн): …` і `Скасування слота (≈T−2): …`.

## Чого не робити
- Не писати «meet at <conf>», якщо поїздка під питанням. Якщо скасували поїздку — чесно: «plans changed and we won't make it this time. Would a 20-min call next week work instead?» (без вигаданих причин).
- Не дублювати однакове повідомлення двом людям з однієї компанії.

## Приклад: від чернетки лідгена до фінального (H1, DEV-2)

**Було:**
> Hi John, saw Agaton raised earlier this year and is hiring across AI, data, platform and software engineering. That's usually when hiring starts competing with the roadmap. I'm with SDA, a Ukrainian software team focused on AI and integrations. Worth 15 min at the conference?

Що не так: «earlier this year» і чотири напрями — розмито; «Ukrainian software team focused on AI and integrations» — походження і загальна спеціалізація замість їхньої користі; «Worth 15 min?» дублює запит на зустріч.

**Стало:**
> Hi John, congrats on the round. With AI, data and platform roles all open at once, I'd guess hiring is now competing with the roadmap. We add senior AI and data engineers to product teams so new features don't have to wait for new hires. Happy to compare notes on which roles make sense to cover externally and which don't.

(Якщо в картці є сума / місяць раунду або конкретні ролі — додати їх замість загального «congrats on the round».)

## Приклади від команди (рівень, не шаблон)

> Hi Christian, congrats on the round!
>
> As Moonlight moves diagnostic AI closer to clinical adoption, I imagine the focus is now on making it reliable and ready for real-world use. We help AI and healthtech teams build that software layer around the AI, from integrations and infrastructure to product features.
>
> Glad to compare notes on what usually becomes the bottleneck at this stage.

> Hi Asim, congrats on the recent round and the OpenBox launch.
>
> As OpenBox grows and adds more integrations, I'd guess there's a lot competing for the core team's attention. We take on integrations and enterprise product work so internal teams can stay focused on the core AI platform.
>
> Could be useful to compare how you're handling that at this stage.

Будова: подія → наслідок для них («I imagine / I'd guess») → хто ми від їхньої ситуації → що людина отримає від розмови. Три абзаци. У партії не починати кожне повідомлення з «congrats on the round» — чергувати подію (запуск, роль, ринок, їхні слова з профілю).
