# Правила меседжингу SDA

Зведено з: дослідження аутрічу в застосунках конференцій (вересень 2026), дослідження LinkedIn-аутрічу (30.09.2026), аналізу кампанії конкурента EVNE на Bits & Pretzels 2026, правил «SDA — ICP & Tier Rules» v2. Метрика успіху — **кваліфіковані дзвінки**, а не відповіді чи прийняті запити.

---

## 1. Хто ми (для рядка «хто ми»)

SDA — українська компанія з розробки ПЗ та AI, ~50 людей. Будуємо й доводимо до продакшну продукти, AI-функції та автоматизацію; модернізуємо legacy і «Lovable/v0-прототипи»; даємо команди (dedicated teams) і FD Engineers — виділеного senior-інженера в команді клієнта, який доводить AI-автоматизацію до продакшну в їхніх ERP/CRM. Власний продукт — Atlas ERP.

Як формулювати рядок «хто ми» в повідомленні — залежить від сценарію (для застосунку конференції див. `scenarios/A_app_preconf.md`).

**Безкоштовні вхідні точки** (для 2-го–3-го дотику, не для першого): аудит коду / дизайну; Post-AI аудит (прототип з Lovable/v0 — що лишити, що переписати); ROI-калькулятор автоматизації; аналіз ідеї та ринку.

Що підходить якому ICP:
| ICP | Про що говорити | Вхідна точка |
|---|---|---|
| DEV-2, команда | швидше випускати / закрити найм без розширення штату | — |
| DEV-2, AI до продакшну | AI-фіча чи пілот, що не доходить до продакшну | FD Engineers |
| DEV-2, техборг | продукт гальмує, зібраний швидко, проблемний підрядник | аудит коду / Post-AI аудит |
| DEV-3 | enterprise-вимоги: SSO, RBAC, audit logs, security review | — |
| IOT-6 | застосунок / платформа / дані навколо пристрою (не прошивка) | — |
| MOD-5 | AI / cloud / ERP-проєкт, який власна IT не встигає довести | FD Engineers |
| AUT-4 | ручні процеси, не пов'язані інструменти | ROI-калькулятор |
| DEV-1 (виняток) | MVP без технічного співзасновника | аналіз ідеї |

## 2. Кути (гіпотези) — обирати ОДИН на ліда

Нумерація як у базі знань («Процес роботи зі списками конференцій»).

| Код | Кут | Коли обирати | Як звучить |
|---|---|---|---|
| **H1** | Тригер + гіпотеза | Є підтверджений сильний сигнал з датою (раунд ≤12 міс, відкриті ролі, AI-проєкт, вихід на ринок) | Факт → чесне припущення, що з нього випливає для них → питання |
| **H1-obs** *(тест)* | Спостереження про продукт | Детальний pitch, але свіжого сигналу немає | Не комплімент, а думка про суть / складність їхнього продукту → питання |
| **H1-own** | Їхні власні слова | Людина сама написала про потребу (pitch: «looking for…», «we need…») | Посилання на сказане ними → як ми можемо бути корисні → питання |
| **H2** | Релевантний кейс | Є кейс SDA з тієї ж галузі / задачі (лише якщо кейс реально існує і користувач його дав) | Коротко що зробили для схожої компанії → питання |
| **H3** | Кваліфікаційне питання | Tier 2 без сильного сигналу; група B (без опису) | Одним рядком хто ми → одне питання, відповідь на яке кваліфікує (in-house чи зовнішні команди? що зараз гальмує?) |
| **H4** | Інвестор | Лише для Investor і лише за взаємної користі | Вихід на портфель / потреба самого фонду; без слотів CEO |

Правило вибору: сильний підтверджений сигнал > власні слова людини > спостереження про продукт > кваліфікаційне питання. **Не змішувати два кути в одному повідомленні.**

## 3. Канали і формати → сценарії

Формат, довжина, заклик до дії, чесні формулювання і фолов-апи залежать від сценарію. Вони описані в `references/scenarios/`:

| Код | Сценарій | Статус |
|---|---|---|
| **A** | Застосунок конференції, до або під час події (ми там будемо) — перше повідомлення + слот | чернетка, тестуємо гіпотези |
| **B** | LinkedIn після конференції, **контакту не було** | **узгоджено** (текст і дотики) |
| **C** | LinkedIn після конференції, **писали в застосунку, зустрічі не було** | чернетка |
| **D** | Після зустрічі на конференції (фолов-ап сейла) | заготовка |
| **E** | Холодний LinkedIn без конференції | заготовка |

## 4. Обов'язкові правила

1. **Факти — лише з картки ліда.** Нічого не вигадувати: ні раунду, ні ролей, ні кейсів, ні клієнтів. Якщо в картці «невідомо» — не згадувати.
2. **Сигнал з датою:** згадувати лише підтверджене (є URL у картці). Раунд старший за 12 місяців — не «congrats on your recent round».
3. **Одним рядком хто ми** — прямо, без «we're a leading/top/trusted…».
4. **Гарантію** («70%, якщо зірвемо дедлайн», fixed price) — **не в першому дотику**. Лише на дзвінку або у фолов-апі, якщо доречно.
5. **Жодних шаблонних компліментів і штампів**: «instantly caught my attention», «really impressed by», «I came across your profile», «exactly the kind of…», «real value in», «I hope this finds you well», «quick question», «would love to pick your brain», «!!», «:))», «synergies», «game-changer», «revolutionize».
6. **Без пітчу послуг списком.** Максимум одна послуга, що випливає з кута.
7. **Одне питання** на повідомлення, на яке можна відповісти одним реченням.
8. **Ім'я** — так, як у профілі; компанія — точна назва. Звертання на ім'я (Hi Malthe).
9. **Мова** — англійська (за замовчуванням). Німецька для DACH-корпоратів — лише якщо користувач просить.
10. **Не згадувати** конкурентів (EVNE тощо), джерело даних (застосунок / таблиця / переписки інших), Tier, бал, «our research shows».
11. **Не писати**: Tier 3, Дубль (окрім обраного DM), Partner / Partner? (це партнершіп), Investor без взаємної користі, тим, хто відповів «in-house / не зараз» до дати повернення.
12. Тон — людина пише людині: прості речення, без маркетингової лексики, без надмірного ентузіазму.
13. **Без довгого тире (—) і середнього тире (–) у текстах повідомлень** — вони роблять текст схожим на згенерований ШІ. Замість тире — крапка, кома або двокрапка. Також уникати: крапки з комою, «not just X, but Y», трьох прикметників поспіль, риторичних «Here's the thing».
14. **Не повторювати одне ключове слово** (roadmap, AI, scale…) двічі в сусідніх реченнях.

## 5. Як виглядає добре і погано

**Погано (шаблон, підстановка хука):**
> Hi {name}, I noticed {company} {hook}. That's impressive! At SDA we help companies like yours build software faster. Would you be open to a quick call?

**Погано (EVNE-стиль із фальшивою присутністю і гарантією):**
> …We also recently changed how we deliver: if we miss the deadline, you pay only 70%. Would be great to meet at Bits. *(а потім — «family situation», скасування)*

**Добре — нотатка до конекту (H1, нас не було на події):**
> Hi Malthe, saw CareLog in the Bits & Pretzels lineup. AI notes for clinical consultations is a hard thing to get right. Would be glad to connect.

**Добре — перший меседж (H1, Tier 1):**
> Thanks for connecting, Malthe. I'm with SDA, we build healthtech and AI products alongside in-house teams. After the KRING investment, what's the bigger constraint for CareLog right now: engineering capacity, or getting the AI part reliable in real consultations?

**Добре — перший меседж (H3, група без сигналу):**
> Thanks for connecting, Birgit. I'm with SDA, we build mobile and AI products for early-stage teams. Curious where heyDabie is right now: are you building with your own developers or still looking for a tech partner?

**Добре — MOD-5 (H1, CIO):**
> Thanks for connecting, Patrick. I'm with SDA. We embed senior engineers into IT teams to get AI automation into production inside existing ERP and CRM. Saw Balluff is rolling out BalluffGPT and Copilot company-wide. Which processes are next after the chat use case?

Ці приклади — ілюстрація рівня, **не шаблон**: у партії не має бути двох повідомлень з однаковою будовою першого речення.

## 6. Повні приклади ланцюжків — сценарій B (LinkedIn, post-conf, контакту не було, SDA не була на події)
Три різні ліди, три різні кути. Зверніть увагу: перші речення мають різну будову, кожен фолов-ап несе нову цінність.
### Louis Schmidlin · Qorelo
*Кут: H1 — seed €3 млн (06.2026) + відкриті ролі + дедлайн SAP ECC 2027*

- **Нотатка до конекту:** Hi Louis, saw Qorelo in the Bits & Pretzels lineup. AI agents for S/4HANA migrations right before the 2027 ECC cut-off is very good timing. Glad to connect.
- **Перший меседж:** Thanks for connecting, Louis. I'm with SDA, we build AI products and add senior engineers to startup teams when the roadmap outruns hiring. With the June seed and the roles open on Ashby, I'd guess the ECC rush is arriving faster than you can hire. Where is it tighter right now: the agent platform itself, or the integration work for each new customer's SAP landscape?
- **Фолов-апи:**
  - FU1 (+4–5 дн): One pattern with agentic products sold to SAP customers: enterprise asks (SSO, audit trails, data residency) show up in the second or third deal, earlier than planned. If that's already on Qorelo's list, happy to compare notes on how we'd scope it.
  - FU2 (+10–14 дн): I'll leave it here, Louis. If extra engineering hands become useful before the 2027 crunch, I'm easy to find.

### Patrick Wild · Balluff
*Кут: H1 — GenAI-програма: BalluffGPT і Copilot у масштабі компанії, CIO в AI Task Force*

- **Нотатка до конекту:** Hi Patrick, saw Balluff in the Bits & Pretzels lineup and read about the GenAI rollout with BalluffGPT. Would be glad to connect.
- **Перший меседж:** Thanks for connecting, Patrick. I'm with SDA. We embed senior engineers into in-house IT teams to get AI automation running inside existing ERP and CRM systems, not only in a chat window. With BalluffGPT and Copilot already live across the company, which process would you most like AI to take over next?
- **Фолов-апи:**
  - FU1 (+4–5 дн): For context on how this works on our side: one senior engineer joins your team on a monthly basis, and the first change usually reaches production in about two weeks. It fits best when a pilot works in a demo but stalls before it touches SAP or the shop floor.
  - FU2 (+10–14 дн): I won't keep filling your inbox, Patrick. If a use case gets stuck between pilot and production, I'm glad to talk it through.

### Jona Doda · Bliss Therapy
*Кут: H3 — кваліфікаційне питання (Tier 2: angel $270K, 03.2026 — малий раунд) з прив'язкою до продукту*

- **Нотатка до конекту:** Hi Jona, saw Bliss Therapy in the Bits & Pretzels lineup. Mental health AI that adapts to culture, not just language, is a thoughtful angle. Glad to connect.
- **Перший меседж:** Thanks for connecting, Jona. With 70+ therapists already on Bliss, I imagine the hard part is less the model and more keeping clinicians in the loop as usage grows. I'm with SDA, we build healthtech and AI products with early-stage teams. How is product development covered today: your own developers, or an external team?
- **Фолов-апи:**
  - FU1 (+4–5 дн): If the first version of Bliss was built fast to get to 5,000 users, our free code health check shows what will hold at ten times that and what is worth rewriting first. No strings attached, happy to run it if useful.
  - FU2 (+10–14 дн): I'll stop here, Jona. Good luck with the next stage of Bliss, and if a tech partner becomes relevant, feel free to reach out.

