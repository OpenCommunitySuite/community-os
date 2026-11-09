# BP-GOV-001 — Independent review (Claude)

**Режим:** предметно-архитектурный, без проектирования кода/БД/API/UI.
**Объект:** Draft BP-GOV-001 + внутренний review (раздел 10 пакета) как позиция автора, не как источник истины.
**Ограничение проверки:** ADR-001/004/005/008/009/010/011 мне доступны только в пересказе пакета (разделы 2–3, 51). Соответствие ADR проверено относительно этого пересказа; прямое сверение с текстами ADR остаётся за адъюдикацией.

---

## 1. Executive conclusion

Draft в целом сильный и внутренне дисциплинированный: различия presence / participation / receipt / exercise / Vote, Document ≠ Vote, Signing ≠ Vote, канал не становится типом Vote — выдержаны последовательно. Две новые сущности (Voting Right Exercise, Result of Offline Count) в принципе обоснованы. Концептуальный редизайн не нужен.

Главный вывод по BLOCKER: **native online Anonymous действительно блокирует приём BP в нынешнем тексте, но блокер снимается сокращением scope (вариант A), а не новой сущностью.** Более того, есть предметный довод, почему per-choice сущность, скорее всего, вообще не нужна (см. B-1). Вариант B сейчас не оправдан.

Главные точечные проблемы, которые внутренний review не поймал:

1. У *participation* нет предметного носителя (181 vs 139 из пилота), а Exercise при определении «признано расходованным» перегружается (выдача ≈ расходование ≈ участие ≈ использование).
2. В Anonymous-режиме коррекция Exercise **необратима** по отношению к выбору: Open-логика «исправили Vote — исправили вклад» здесь не работает.
3. Multi-question подписанный ballot может молча протащить Subject→Position для Anonymous Voting, если вопросы разной прозрачности окажутся в одном Document.
4. Есть скрытые каналы утечки анонимности (серийные номера бюллетеней в issuance evidence, малые count scopes, пересечение временных окон scope с временем Exercise, сканы бюллетеней как evidence).
5. Result of Offline Count неявно предполагает «один бюллетень = одна единица веса» — это пилотное допущение (1 участок = 1 голос), не универсальное.

### Краткие ответы на 20 вопросов review

| # | Ответ |
|---|---|
| 1 | **Да**, один declared mode на Voting — верный инвариант. Нужны: иммутабельность режима после открытия приёма и явный запрет агрегации Open+Anonymous Votings одного Question в один Established Result (m-1). |
| 2 | **Да**, Exercise обоснован как отдельный факт: у него своя identity, история, коррекция, правило-зависимые эффекты, и его нельзя выразить через Vote без Position. |
| 3 | **Условно безопасно.** Определение «признано реализованным/расходованным по rule» не смешивает выдачу и участие *формально*, но название и определение создают соблазн читать Exercise как «проголосовал». Нужно развести базис признания (provenance) и эффекты (M-2). |
| 4 | **Да**, Result of Offline Count обоснован: внешний агрегат без Subject-linkage, нужна identity, replacement, provenance в Calculation. Его нельзя свести ни к Document, ни к Calculation. |
| 5 | **Да**, граница «Voting/Question/count scope» верна. Дополнить: декларация scope и непересечение scopes (m-3). |
| 6 | **Да**, один protocol Document → несколько question-local results корректно. Контейнер не нужен. |
| 7 | **Да**, ADR-001 «Vote = Position по Voting Right» сохранён и не злоупотребляется: анонимный ввод Vote-ом не называется. Но именно это создаёт «дыру» B-1, а не недостаток модели. |
| 8 | **BLOCKER для текста как написан**, не BLOCKER для normative sync после сокращения scope. |
| 9 | **Да, отложить.** Новая сущность сейчас — преждевременная абстракция. |
| 10 | Если не откладывать: нужен *предметный* довод, которого сейчас нет. Единственный реальный кандидат — агрегатный tally-referent (не per-choice), см. B-1. |
| 11 | **Да**, document-backed signed e-ballot корректно переиспользует Stage 11A; fake Document не создаётся. Ограничение: только для Open (M-5). |
| 12 | **Да**, documentless signed Vote безопасно отложить. |
| 13 | **Да, в основном.** Правила — в Voting Rule/profile, но словарь (change vs conflict), reference time и «один effective» должны быть закреплены в BP (m-4). |
| 14 | **Недостаточно** для participation: у неё нет носителя (M-2). Остальные различены хорошо. |
| 15 | Да, найдено: unit-weight в Offline Count (M-6); Anonymous фактически = offline-only без явного объявления (M-1); pilot-сценарии внутри тела BP (NOTE). |
| 16 | Внутренне согласовано, кроме необратимости коррекции Exercise в Anonymous (M-3). Сверка с ADR-004/008 — по пересказу. |
| 17 | Over-model: нет. Лишнее — повторение ADR-принципов (§22–24) и pilot-сценарии в теле BP (NOTE). |
| 18 | Under-model: participation (M-2); декларация count scope (m-3). Ballot issuance как сущность — **не** нужен. |
| 19 | Да, есть скрытые утечки (M-4). |
| 20 | См. раздел 8. |

---

## 2. BLOCKER findings

### B-1 — Native online Anonymous: choice-side referent отсутствует

- **Severity:** BLOCKER (для текста в нынешнем виде).
- **Exact issue:** §16/§19.2/§31.2/§45 предполагают, что Community OS принимает anonymous online choice и включает его в Calculation, но предметный факт choice-side не определён. Vote использовать нельзя (Vote → Voting Right → Position).
- **Why it matters:** нормативная синхронизация ADR-001/008 закрепила бы концепт с висящей ссылкой.
- **Conflict with accepted principle:** прямого конфликта нет; есть неполнота. Использование Vote «для анонимного» нарушило бы ADR-001.
- **Анализ, почему per-choice сущность, вероятно, не нужна.** Требования к hypothetical choice-side referent из пакета:
  - *identity/correction*: в анонимном режиме отдельный выбор нельзя исправить — для исправления надо знать, чей он. Единственный осмысленный correction-unit — агрегат (tally), а не отдельный выбор.
  - *duplicate/idempotency/double-use*: это защита **на стороне права** (Exercise), а не на стороне выбора.
  - *evidence «не потерян/не удвоен»*: это verifiability counting-механизма (криптографический или организационный), то есть evidence к tally, а не identity-bearing domain fact.
  - *no recoverable link*: чем меньше у отдельного выбора domain-identity и истории, тем лучше для invariant; сущность с жизненным циклом per-choice — это вектор утечки.

  Следовательно, если native online Anonymous вернётся, наиболее вероятный референт — **признанный агрегатный результат подсчёта в scope** (той же формы, что Result of Offline Count), а не per-choice сущность. Это гипотеза для будущего stress-test, не решение сейчас.
- **Recommended correction:** принять **вариант A**: native online Anonymous исключается из первой нормативной версии и пилота. Сохранить §16 как **negative invariant + future design task** (с триггерами пересмотра: требования verifiable voting, remote anonymous в профиле). Вариант B не начинать.
- **Requires conceptual redesign:** нет. Только удаление/перенос текста (см. M-1).

---

## 3. MAJOR findings

### M-1 — После отложения в тексте остаются зависимости от online Anonymous и нет защиты от «обходов»

- **Severity:** MAJOR.
- **Exact issue:** §16, §19.2, §31.2, scenario C (§45) и scenario D (§46) опираются на online Exercise/anonymous inputs. Scenario D (VR27 online E1 → paper register E2) после отложения невозможен для Anonymous; для Open он описан через Exercise, хотя для Open естественнее конфликт Vote↔Vote. Нигде не сказано, что Anonymous Voting в пилоте — offline-only, а удалённые участники Anonymous-голосования могут участвовать только через физическую бумажную процедуру.
- **Why it matters:** остаточный текст позволит «реализовать анонимность» обходом: скрыть Position в UI, но хранить в Vote; использовать Open Vote с «маскированным показом». Это нарушает invariant 19, а «UI-hidden ≠ anonymous» нигде не зафиксировано.
- **Conflict with accepted principle:** нет, но инвариант 19 остаётся без явной защиты от слабых реализаций.
- **Recommended correction:** (a) убрать §19.2, anonymous-часть §31.2, scenario C, переписать scenario D для допустимых случаев (Open Vote conflict; anonymous offline double claim, например владелец и представитель оба получили бюллетень); (b) явно записать: в первой версии Anonymous = offline Exercise + Result of Offline Count; (c) добавить правило: скрытие Position на уровне отображения при сохранении Subject/VR→Position **не** является Anonymous Voting.
- **Requires conceptual redesign:** нет.

### M-2 — У participation нет предметного носителя; Exercise перегружен

- **Severity:** MAJOR.
- **Exact issue:** §6/§32 корректно запрещают отождествлять presence/participation/receipt/exercise/Vote. Но в пилоте протокол оперирует «participants = 181» при «139 recognized positions». Для Open: где живёт participation, если оно ≠ Vote (например, подписанный бюллетень получен, но по данному вопросу позиция пуста/невалидна)? Для Anonymous: Exercise «признано расходованным» по правилу может означать выдачу бюллетеня — то есть не участие и не голос; но название «Реализация права голоса» читается как «проголосовал».
- **Why it matters:** quorum/participation-метрики по пилоту окажутся без источника, а правило, определяющее Exercise как момент выдачи, фактически смешает issuance, participation и exercise под одним именем — то, что BP декларирует не делать.
- **Conflict with accepted principle:** нет формального; фактическое размывание разделения из §6 и инварианта 32 через терминологию.
- **Recommended correction:**
  1. Определить, что Exercise фиксирует **только** rule-defined «расходование права в Voting» и сам по себе не утверждает ни cast, ни participation, ни подсчёт (это уже есть) — и добавить обязательный **basis признания** (issuance / receipt / cast / иное по rule) как provenance-атрибут, не как отдельную сущность.
  2. Решить Q54.10: Exercise **допустим в Open Voting**, когда rule определяет participation/расходование, не совпадающее с recognized Vote (подписанный бюллетень, пустая/невалидная позиция по вопросу); не дублировать Exercise на каждый Vote.
  3. Либо явно записать, что participation — **производная rule-метрика** над Votes/Exercises/received ballots без собственной identity (это тоже допустимо, но должно быть сказано).
  4. Рассмотреть до sync альтернативное имя («расходование права голоса») или явное предупреждение в TERMINOLOGY.
- **Requires conceptual redesign:** нет.

### M-3 — Коррекция Exercise в Anonymous необратима по отношению к выбору

- **Severity:** MAJOR.
- **Exact issue:** §42 говорит, что коррекция одного факта не переписывает соседние автоматически. Для Open это достаточно: исправил/отклонил Vote — вклад удалён. Для Anonymous после опускания бюллетеня выбор неотделим от Exercise: если Exercise признан ошибочно (участник не имел права), удалить его вклад из count нельзя; если Exercise «возвращён» (испорченный/утерянный бюллетень), возврат права открывает риск двойного вклада.
- **Why it matters:** BP обещает «correction/review boundaries», но не говорит, что в Anonymous эти границы асимметричны; без этого правило/профиль может обещать невозможное («исключить голос нелегитимного участника»).
- **Conflict with accepted principle:** нет; следствие инварианта 19 + инварианта 31.
- **Recommended correction:** явно зафиксировать: в Anonymous Voting коррекция Exercise **не влечёт и не подразумевает** коррекцию Result of Offline Count; последствия обнаружения ошибочного Exercise после подсчёта допустимы только на уровне Result Review/рекаунта по правилу (например, анализ влияния на итог, а не удаление выбора); повторная выдача/возврат права — отдельная rule-семантика с явным риском double-use.
- **Requires conceptual redesign:** нет.

### M-4 — Скрытые утечки анонимности в самой модели

- **Severity:** MAJOR.
- **Exact issue:** §39 перечисляет поверхности (projections, exports, audit, logs), но не называет конкретные каналы корреляции, возникающие из самой предметной модели:
  1. **Идентификаторы бюллетеня** (серийный номер/штрих-код/штамп) в issuance register (evidence для Exercise, §13.1/§37) и на посчитанных бюллетенях/сканах (evidence для count, §14) → прямое восстановление Subject→Position.
  2. **Малые count scopes:** 0..N Results на «независимые scopes» (§14); при малом scope (улица, комиссия на несколько участков) и особенно при единогласии результат раскрывает выбор.
  3. **Пересечение scope и Exercise-метаданных:** если scope задан временем/местом (ящик за день 3), а Exercise несёт channel/receipt time/место (§17), множество кандидатов сужается до пересечения.
  4. **Промежуточные результаты:** при многодневном сборе (пилот A) публикация/запись промежуточных count + таймстемпы Exercise раскрывают «последнего проголосовавшего».
  5. **Сканы/фото бюллетеней** как evidence анонимного count (почерк, пометки).
- **Why it matters:** инвариант 19 формулируется как «не восстанавливается из штатных данных»; перечисленное — штатные данные.
- **Conflict with accepted principle:** потенциальное нарушение invariant 19/20 при «корректном» следовании остальному тексту BP.
- **Recommended correction:** добавить в §39 как предметные ограничения: (a) issuance evidence и counted ballots не должны содержать общий идентификатор; (b) Voting Rule задаёт минимальную гранулярность count scope (anonymity set) и запрет на публикацию результата в scope ниже порога; (c) Exercise и Result не коррелируются по scope/времени тоньше порога; (d) сканы/фото отдельных анонимных бюллетеней не являются штатным evidence count (допустим scan протокола).
- **Requires conceptual redesign:** нет.

### M-5 — Multi-question ballot может нарушить Anonymous: смешение Votings разной прозрачности в одном подписанном Document

- **Severity:** MAJOR.
- **Exact issue:** §12/§47 разрешают один подписанный ballot для нескольких Questions/Votings. Но если среди них есть Anonymous Voting (например, выборы правления — тайно, смета — открыто), подписанный Document с Position по анонимному вопросу создаёт прямой Subject→Position (Document ↔ Signing ↔ Subject). Для Open mode сценарий корректен, для Anonymous — нет.
- **Why it matters:** разные вопросы одного собрания часто имеют разную прозрачность; ошибка вероятна именно в пилоте.
- **Conflict with accepted principle:** нарушает инвариант 19/20 через «легальный» механизм из §12.
- **Recommended correction:** подписанный (и идентифицируемый) ballot Document **не может нести Position по Anonymous Voting**; для Anonymous используется отдельный неидентифицируемый носитель; multi-question ballot допустим в пределах Votings одного Open-режима. Подтвердить, что §26 (document-backed signed e-ballot) применим только к Open.
- **Requires conceptual redesign:** нет.

### M-6 — Result of Offline Count: неявное допущение «один бюллетень = одна единица веса»

- **Severity:** MAJOR.
- **Exact issue:** §14 перечисляет «counts by Position; invalid/other indicators». Для пилота (1 участок = 1 голос) этого достаточно. Для универсальной модели (ОСМД/ЖСК с весом по площади/паю) анонимный count не может применить вес: бюллетени несвязываемы с Voting Right.
- **Why it matters:** пилотное допущение становится скрытым универсальным; будущие профили столкнутся с невозможностью взвешенного анонимного подсчёта без повторного пересмотра ядра.
- **Conflict with accepted principle:** принцип 13 (не копировать pilot-specific rules в универсальную модель).
- **Recommended correction:** добавить в содержание Result: «единицы подсчёта определяются Voting Rule (число бюллетеней либо weight-denominated категории бюллетеней)» и отметить компромисс: weight-категории сужают anonymity set (связь с M-4). Без выбора механизма.
- **Requires conceptual redesign:** нет.

---

## 4. MINOR findings

### m-1 — Режим прозрачности: иммутабельность и кросс-Voting следствие

- **Severity:** MINOR.
- **Exact issue:** (a) не сказано, что declared mode фиксируется до приёма волеизъявлений и не меняется; (b) фраза §19.2 «по тем же Questions другая прозрачность → отдельная Voting» допускает параллельные Open- и Anonymous-Votings по одному Question для частей электората, что в итоге потребует агрегировать две Calculation в один Established Result и ломает §1 («one Voting → one Calculation → one Established Result»).
- **Why it matters:** обход инварианта «один режим» через кросс-Voting агрегацию.
- **Conflict:** нет; следствие.
- **Correction:** зафиксировать иммутабельность режима после открытия; указать, что отношение нескольких Votings одного Question (последовательные раунды vs разделение электората) определяет ADR-008/rule, и что BP не допускает объединения Calculation разных Votings и режимов в один результат.
- **Redesign:** нет.

### m-2 — Инвариант 17: «несовместимое эффективное использование»

- **Severity:** MINOR.
- **Exact issue:** не определено, что для одного Voting Right в одной Voting effective realization — не более одного из {effective Vote, effective Exercise}; не описано совместное существование Exercise и Vote в Open (§18).
- **Why it matters:** двойной учёт реализации.
- **Conflict:** нет (развитие ADR-001 «не более одного Vote»).
- **Correction:** переформулировать инвариант 17 через «не более одной effective realization на VR в Voting».
- **Redesign:** нет.

### m-3 — Count scope: декларация, непересечение, полнота

- **Severity:** MINOR.
- **Exact issue:** не сказано, кто и когда определяет scopes, что они не пересекаются и покрывают всё; не требуется «общее число посчитанных бюллетеней» (для сверки «посчитано ≤ расходовано»); не определено, какой из C1/C2 effective в каком scope.
- **Why it matters:** защита от потери/двойного счёта (аналог «evidence что choice не потерян» из B-1 для offline).
- **Conflict:** нет.
- **Correction:** добавить в содержание Result: total counted, scope declaration reference; в Calculation provenance — какая версия результата по каждому scope использована.
- **Redesign:** нет.

### m-4 — Словарь change vs conflict, reference time

- **Severity:** MINOR.
- **Exact issue:** §20 (conflict) и §21 (change) не разделены определениями; reference time для упорядочивания («submitted/received/recognized», §28) не названо.
- **Why it matters:** профили разойдутся в терминах; paper→electronic замена трактуется по-разному.
- **Conflict:** нет.
- **Correction:** зафиксировать в BP словарь: *change* — последующее действие того же implementer, допустимое правилом; *conflict* — претензии, не образующие supersession (разные implementers, неопределимый порядок, запрет правила). Правило указывает reference time. Конкретика остаётся в profile.
- **Redesign:** нет.

### m-5 — Имя «Result of Offline Count»

- **Severity:** MINOR.
- **Exact issue:** «Offline» вшивает канал в название концепта, хотя суть — «признанный агрегат внешнего подсчёта в scope». Если вернётся online Anonymous (гипотеза B-1), имя придётся менять в ADR/TERMINOLOGY.
- **Correction:** до sync сознательно выбрать имя; допустимо оставить, зафиксировав, что offline — текущий источник, а не определение. Обобщать **содержание** сейчас не нужно.
- **Redesign:** нет.

### m-6 — Повторная выдача (spoiled/lost) бюллетеня

- **Severity:** MINOR.
- **Exact issue:** если выдача = расходование (§13.1), потерянный/испорченный бюллетень лишает права; BP не упоминает reissue.
- **Correction:** одна строка: reissue определяется rule, связан с M-3 (риск double-use).
- **Redesign:** нет.

### NOTE-1 — Pilot-сценарии в теле BP

Сценарии A–F и §24 («1 участок = 1 голос») помечены как pilot, но лежат в теле BP. Рекомендуется вынести в appendix/pilot profile, чтобы не читались как universal-инварианты. Сами инварианты (§51) от pilot-допущений в целом чисты (кроме M-6).

### NOTE-2 — Ballot-level receipt vs Voting-level deadline

У одного multi-question ballot единый момент receipt, а дедлайны/правила у Votings могут различаться; решается rule, достаточно одной строки в §28.

---

## 5. Fundamental entity assessment

| Концепт | Вывод | Условие |
|---|---|---|
| **Voting Right Exercise** | Обоснован | Развести basis признания и эффекты; решить допустимость в Open (M-2); учесть необратимость (M-3). |
| **Result of Offline Count** | Обоснован | Объявить scope/units/total (m-3, M-6); осознанное имя (m-5). |
| Anonymous choice-side concept | **Не вводить** | Триггер пересмотра: профиль требует remote anonymous либо verifiable-voting артефакт. Вероятный референт — агрегатный (B-1). |
| Ballot entity | Не вводить | Пересмотр, если появится самостоятельный lifecycle ballot item (частичное признание, независимая коррекция). |
| Exercise Claim entity | Не вводить | Пересмотр, если жизненный цикл конфликтующих claims перестанет укладываться в received information + Exercise records. |
| Ballot issuance entity | Не вводить | Issuance register — evidence, не domain fact. |
| Generalized Signed Action | Не вводить | Согласен с отложением. |

**Over-model:** не обнаружен. **Under-model:** participation (M-2), декларация count scope (m-3).

---

## 6. Anonymous privacy assessment

- Принцип «Exercise ✗ Position» и запрет реконструкции Subject-linked Votes из анонимных бюллетеней — корректны.
- Слабые места находятся не в декларации, а в **корреляциях между разрешёнными данными**: общие идентификаторы бюллетеня, малые scopes, временные/пространственные метаданные Exercise vs scope, промежуточные результаты, сканы отдельных бюллетеней (M-4).
- Структурная утечка: **подписанный multi-question ballot** с анонимным вопросом (M-5).
- Структурное ограничение: коррекция Exercise не может «достать» выбор (M-3) — это не утечка, но его надо знать, иначе профиль даст невыполнимые обещания.
- Результат при единогласии/малом N раскрывает выбор независимо от модели — нужен порог на уровне rule.
- Отложение native online Anonymous сокращает поверхность атаки: исчезают timing-корреляции между online-аутентификацией и принятием выбора. Это ещё один довод за вариант A.
- Оценка: после M-4/M-5 invariant 19 защищён достаточно для offline-only режима.

---

## 7. Pilot applicability assessment

После варианта A пилот покрывается: Open paper, Open signed e-ballot (document-backed), Anonymous paper с Exercise и Result of Offline Count, смешанные каналы внутри Open.

Что должен определить pilot profile (вне BP, до реализации):

- presence/quorum и состав «participants» (181 vs 139) — требует решения M-2;
- paper/electronic change/conflict (Q54.3–4);
- юридический статус «1 участок = 1 голос»;
- мгновение расходования права в Anonymous (выдача vs получение);
- reissue (m-6);
- как удалённые участники участвуют в Anonymous-голосованиях (только через бумажную процедуру);
- минимальные scopes и запрет промежуточной публикации (M-4).

Практическое замечание: практика «правление развозит бюллетени и собирает» в Anonymous-режиме создаёт физический риск тайны вне зоны Community OS (BP корректно это исключает, §4); профиль должен это явно признавать.

Document-backed signed e-ballot (Open) практически применим; documentless Vote откладывается без ущерба.

---

## 8. Normative sync assessment

**Синхронизировать можно после точечных правок (раздел 9):**

- **ADR-001:** добавить Voting Right Exercise как отдельный факт ≠ Vote; допустить Exercise без Position; «не более одной effective realization на Voting Right в Voting»; режим прозрачности фиксируется на Voting.
- **ADR-008:** Result of Offline Count как input Calculation; Calculation сохраняет provenance версий inputs; Anonymous-часть первой версии = Exercise + Result of Offline Count; один режим на Voting.
- **DOMAIN_MODEL / TERMINOLOGY:** оба концепта + границы с Vote/Calculation/Established Result; предупреждение о смысле «Exercise».

**Не синхронизировать:** native online Anonymous (§16 как design task), §19.2, anonymous-часть §31.2, scenario C, §26.1, pilot-сценарии как нормативные.

Новый bounded context не нужен.

---

## 9. Recommended point fixes

1. **(B-1)** Принять вариант A; §16 переписать как negative invariant + future design task с триггерами.
2. **(M-1)** Удалить §19.2, anonymous-часть §31.2, scenario C; переписать scenario D; записать «Anonymous первой версии = offline»; запрет «UI-hidden anonymity».
3. **(M-2)** Добавить basis признания Exercise; решить допустимость Exercise в Open; закрепить, что participation — либо rule-метрика, либо через Exercise; рассмотреть имя.
4. **(M-3)** Записать асимметрию коррекции Exercise vs Count в Anonymous.
5. **(M-4)** Расширить §39 конкретными корреляциями и правилом порога scope.
6. **(M-5)** Запретить Position по Anonymous Voting в подписанном/идентифицируемом Document.
7. **(M-6)** Единицы подсчёта в Result определяются rule.
8. **(m-1)** Иммутабельность режима; запрет агрегации Votings/режимов в один Established Result.
9. **(m-2)** Переформулировать инвариант 17.
10. **(m-3)** Декларация scope, total counted, версия результата по scope.
11. **(m-4)** Словарь change/conflict и reference time.
12. **(m-5, m-6, NOTE-1/2)** Имя, reissue, вынос pilot-сценариев в appendix, ballot-level vs Voting-level deadline.

---

## 10. Final verdict

**ACCEPT AFTER POINT FIXES**

Условия: native online Anonymous исключён из первой нормативной версии (вариант A), закрыты M-1…M-6; остальные пункты — до или во время sync. Концептуальный редизайн не требуется, новые сущности сверх двух принятых не вводятся.