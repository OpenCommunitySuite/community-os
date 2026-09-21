# Independent multi-review package — PR #71 / BP-SURVEY-001

**Repository:** OpenCommunitySuite/community-os  
**PR:** #71 — `docs: draft informal survey business process`  
**Base:** `main@87b25256b91901b8d29e0dc47c7498d042495427`  
**Draft source head before packaging:** `2b3887aa6e57c4e055ea4155ccce4af0d5d5980c`  
**Stage:** 10 — неформальный опрос  
**Review mode:** независимый предметно-архитектурный stress-review. Не проектировать код, БД, API или UI и не подменять отдельный legal/privacy analysis конкретной юрисдикции.

---

## 1. Задание независимому рецензенту

Проведи независимый stress-review Draft `BP-SURVEY-001 — Неформальный опрос / Informal Survey` в контексте приложенных нормативных выдержек Community OS и результатов предварительного Stage 10 stress-test.

Цель review — проверить корректность предметных границ, identity, ownership, исторической семантики и отсутствие преждевременных сущностей. Не оценивай удобство реализации и не предлагай техническую модель ради упрощения кода.

Особенно проверь:

1. действительно ли `Survey` требует самостоятельной stable identity, а не является specialization `Announcement`, `Appeal`, `Notification`, `Management Procedure` или `Voting`;
2. корректно ли считать owner Survey semantics контекст «Коммуникации и обращения», при том что Survey может быть input/basis для Governance;
3. действительно ли `Survey Response` требует самостоятельной stable identity и не должен моделироваться как простое отношение `Subject → Survey`;
4. достаточно ли `Survey Item` как stable locally addressable part of Survey без отдельной fundamental top-level entity;
5. не скрывает ли `response unit` новую сущность `Survey Participant`, `Survey Right` или иной самостоятельный правоноситель;
6. достаточно ли различены:
   - intended audience;
   - response eligibility/admissibility;
   - technical access;
   - acting User Account;
   - acting Subject;
   - response unit;
   - actual respondent;
7. корректно ли правило, что `1 участок = 1 голос` не задаёт автоматически multiplicity Survey;
8. достаточно ли ADR-004/005 для history/rule semantics Survey/Response;
9. не нужен ли `Survey Definition Version` уже сейчас, либо baseline «material change after accepted Responses → replacement Survey» действительно достаточен;
10. корректна ли модель modification/withdrawal одной Survey Response identity;
11. выдерживает ли модель anonymous/private-identity/pseudonymous scenarios без fake Subject и без преждевременной `Anonymous Token` domain entity;
12. достаточно ли ADR-011 для Telegram/external form/mobile/external-channel recognition, duplicate и redelivery;
13. достаточно ли Read Model / Projection для aggregation и действительно ли universal `Survey Result` не нужен;
14. не появляется ли скрытый аналог Voting Calculation / Established Result;
15. корректна ли граница:
    ```text
    Survey Response ≠ Vote
    survey aggregation ≠ Established Result ≠ Management Decision
    ```
16. нет ли реального ST/OSBB/ZhSK scenario, который требует фундаментальную сущность, сознательно не введённую Draft;
17. какие вопросы являются предметной архитектурой, а какие нужно оставить отдельному privacy/legal analysis.

Если предлагаешь новую fundamental entity, обязательно обоснуй её собственной устойчивой identity, историей и правилами. Не вводи её только ради удобства хранения, UI или API.

---

## 2. Формат ответа

Верни review **одним Markdown-файлом**, пригодным для скачивания и последующей передачи ChatGPT для консолидации multi-review.

Для каждого замечания используй структуру:

- **Severity:** BLOCKER / MAJOR / MINOR / OBSERVATION
- **Раздел Draft**
- **Проблема**
- **Почему это проблема**
- **Предлагаемое минимальное исправление**
- **Нужно ли менять DOMAIN_MODEL / TERMINOLOGY / ADR / связанный BP**

Отдельно в конце ответь:

1. Нужна ли fundamental entity `Survey`?
2. Нужна ли fundamental entity `Survey Response`?
3. Достаточна ли local identity `Survey Item`?
4. Нужна ли fundamental entity `Survey Participant` / `Survey Right` / `Survey Eligibility Snapshot`?
5. Нужна ли уже сейчас `Survey Definition Version`, или replacement Survey достаточен?
6. Достаточна ли модель одной Response identity с modification/withdrawal history?
7. Корректна ли ownership Survey в Communications, а не Governance?
8. Достаточна ли Projection для aggregation или нужен Survey Result?
9. Есть ли конфликт с ADR-001/008 Voting semantics?
10. Есть ли конфликт с ADR-009/010/011/013?
11. Какие вопросы следует оставить privacy/legal analysis?
12. Итог: **point fixes sufficient** или **conceptual redesign required**, с аргументами.

Не ограничивайся подтверждением Draft. Ищи пограничные случаи, скрытые смешения контекстов и сущности, которые Draft мог либо преждевременно ввести, либо ошибочно не ввести.

---

## 3. Предварительный Stage 10 stress-test — рабочие выводы, не нормативное решение

До Draft были проверены, в частности, следующие сценарии:

- простой выбор даты;
- много-вопросная анкета;
- один Response от участка при нескольких совладельцах/User Accounts;
- несколько независимых Responses одного Subject;
- modification ранее принятого Response;
- withdrawal;
- anonymous Survey;
- смена собственника после Response;
- materially significant edit Survey после появления Responses;
- Telegram redelivery;
- переход от Survey к отдельному formal Voting;
- free-text Survey;
- PDF/document summary Survey.

Рабочий результат stress-test:

```text
Survey                  — candidate independent identity-bearing concept
Survey Response         — candidate independent historical fact
Survey Item             — stable local identity within Survey
item answer             — part of Survey Response

Survey Result           — no universal fundamental entity yet
Survey Right            — no
Survey Participant      — no
Survey Eligibility Snapshot — no
Survey Version          — no, baseline replacement Survey after material post-response change
```

Особенно важные рабочие границы:

```text
Survey ≠ Voting
Survey Item ≠ Governance Question
Survey Response ≠ Vote

response unit ≠ Subject ≠ User Account

Survey audience
≠ response eligibility
≠ technical access
≠ actual respondent

survey aggregation
≠ Established Result
≠ Management Decision
```

Эти положения Draft должны быть проверены, а не приняты рецензентом как аксиома.

---

## 4. Уже принятые ограничения проекта

Не пересматривай их без обнаруженного прямого противоречия:

- собственность, пользование, пользовательский доступ, финансовые отношения и полномочия — разные отношения;
- Subject ≠ User Account;
- предметная допустимость действия ≠ technical authorization/access;
- bounded contexts владеют собственными фактами и не получают ownership чужих фактов из-за использования;
- история/правила/provenance являются сквозными ответственностями, но не универсальными владельцами всех сущностей;
- Governance Question ≠ Voting ≠ Vote ≠ Calculation ≠ Established Result ≠ Management Decision;
- вопрос может существовать без Voting;
- формальное Voting использует собственную rule/snapshot/right/vote semantics;
- Communications и Governance — разные bounded contexts;
- Announcement / Notification / Appeal / Document — самостоятельные понятия и не образуют universal Communication entity;
- внешняя информация ≠ received information ≠ recognized domain fact;
- Projection / Read Model ≠ source of truth;
- фундаментальная сущность вводится только при устойчивой предметной identity/history/rules, а не ради удобства реализации.

---

## 5. Draft под review — полный текст

# BP-SURVEY-001 — Неформальный опрос / Informal Survey

**Статус:** Draft / Stage 10 stress-test completed  
**Контекст:** Коммуникации и обращения  
**Связанные контексты:** Управление и коллективные процедуры; Субъекты; Объекты и отношения с ними; Полномочия и представительство; Документы и формализация; сквозные Access/Rules/History  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий BP определяет предметную семантику **неформального опроса (Survey)** как структурированного механизма сбора мнений, предпочтений или иной обратной связи от определимой аудитории Community.

Survey нужен для сценариев, где Community хочет получить структурированные ответы, но не проводит формальное голосование и не устанавливает юридически или управленчески значимый результат средствами Voting.

Примеры:

- предварительный сбор мнений;
- выбор удобной даты;
- определение интереса к проекту;
- консультация с жителями;
- сбор предпочтений по нескольким вариантам;
- много-вопросная анкета;
- подготовка вопроса к последующей управленческой процедуре.

Базовая модель:

```text
Survey
→ 1..N Survey Items
→ 0..N Survey Responses
→ derived aggregation / summary where applicable
```

Ключевая граница:

```text
Survey
≠ Voting

Survey Response
≠ Vote

survey aggregation
≠ Voting Calculation
≠ Established Result
≠ Management Decision
```

Survey может быть связан с Governance Question или Management Procedure, но не превращается в них автоматически.

## 2. Нормативная основа

BP развивает уже принятые решения:

- ADR-002 — «Коммуникации и обращения» и «Управление и коллективные процедуры» являются разными bounded contexts;
- ADR-004 — исторически значимые факты и изменения не переписываются молча;
- ADR-005 — применимые правила имеют локальную предметную ownership, версии и исторически объяснимое применение;
- ADR-008 — Governance Question, Voting, Vote, расчёт, Established Result и Management Decision различаются;
- ADR-009 — коммуникации, обращения, уведомления, новости и объявления не образуют универсальную Communication entity и не смешиваются с Documents;
- ADR-010 — Subject, User Account, Domain Power, Access Right, технический доступ и предметная допустимость действия различаются;
- ADR-011 — внешняя информация, received information, mapping/validation/recognition, duplicate/redelivery/correction различаются;
- ADR-013 — Read Model / Projection является derived representation с declared producer/owner и не является source of truth.

Референсы МДО и DAH независимо показывают практическое различие между неформальными опросами и формальными голосованиями. Они подтверждают потребность, но не являются источником нормативной модели Community OS.

## 3. Предметная принадлежность

Канонический owner Survey semantics — контекст **«Коммуникации и обращения»**.

Survey является структурированным информационным взаимодействием Community с участниками или иной допустимой аудиторией.

Survey может:

- существовать вне Governance;
- использоваться как консультационный вход Governance;
- быть связан с Announcement/Notification;
- быть опубликован/предоставлен через разные пользовательские каналы;
- использовать внешние каналы доставки/приёма ответов.

При этом:

```text
Survey
≠ Management Procedure
≠ Governance Question
≠ Voting
```

Управленческий контекст может использовать Survey или derived summary как basis/input, не получая ownership Survey Response.

## 4. Что входит

BP охватывает:

- identity Survey;
- purpose/topic;
- intended audience;
- response/admissibility scope;
- response period;
- Survey Items;
- варианты/структуру допустимого ответа;
- identity Survey Response;
- acting Subject/User provenance where applicable;
- response unit where applicable;
- anonymous/pseudonymous/identified modes;
- правила кратности ответа;
- modification/withdrawal where applicable;
- material change Survey definition;
- replacement Survey;
- external-channel recognition;
- duplicate/redelivery semantics;
- aggregation/read model;
- связь с Governance;
- связь с Documents/Communications;
- history/provenance.

## 5. Что не входит

BP не определяет:

- формальное голосование;
- Voting Right;
- snapshot voting rights;
- quorum;
- Vote;
- Voting Calculation;
- Established Result;
- Management Decision;
- юридическую силу конкретного опроса;
- обязательный legal/privacy режим;
- конкретный UI-конструктор анкет;
- конкретный Telegram bot protocol;
- email/SMS transport;
- конкретную DB/API schema;
- универсальную статистическую/аналитическую платформу;
- универсальную Survey Result entity;
- универсальный workflow/state machine;
- универсальный тип каждого возможного Survey Item.

## 6. Survey

**Survey** — identity-bearing коммуникационный referent структурированного запроса мнений/ответов, относящийся к конкретной Community и имеющий определимый purpose.

Survey имеет собственную stable identity.

Его identity не определяется:

- заголовком;
- текстом первого вопроса;
- датой публикации;
- User Account создателя;
- Governance Question;
- Announcement;
- URL/Telegram message id;
- набором текущих ответов.

Повторное проведение похожего или идентичного по тексту опроса является новым Survey, если это новый предметный акт сбора мнений.

## 7. Survey Item

**Survey Item** — локально адресуемый элемент конкретного Survey, по которому ожидается ответ или иное structured input.

Survey Item имеет **стабильную локальную identity внутри Survey**.

Это необходимо, чтобы:

- связать конкретное значение ответа с конкретным item;
- сохранить смысл ранее принятых Responses при изменении порядка отображения;
- отличить удаление/замену item от изменения текста;
- объяснить historical response content.

Сохраняется граница:

```text
Survey Item
≠ Governance Question
```

Survey Item не является самостоятельной fundamental entity верхнего уровня Community OS.

Его identity подчинена Survey.

## 8. Типы ответов

Конкретный Survey Item может допускать, где применимо:

- single choice;
- multiple choice;
- free text;
- numeric value;
- scale/rating;
- ranking;
- другой локально определённый structured answer.

Настоящий BP не вводит закрытый universal enum типов ответа и не определяет UI widgets.

Допустимый формат и validation принадлежат semantics конкретного Survey/Item.

## 9. Survey Response

**Survey Response** — самостоятельный исторически различимый факт принятого ответа в рамках конкретного Survey.

Survey Response имеет собственную stable identity.

Он может содержать ответы на один или несколько Survey Items.

```text
Survey Response R123
├─ Item I1 → value
├─ Item I2 → value
└─ Item I3 → value
```

Отдельное значение одного Item не получает самостоятельную fundamental identity автоматически.

## 10. Survey Response не является отношением Subject → Survey

Survey Response не определяется как простое отношение:

```text
Subject + Survey
```

Потому что Survey может допускать:

- несколько Responses одного Subject;
- один Response от response unit, не совпадающего с Subject;
- anonymous Response;
- Response, где actor известен, но не должен раскрываться;
- Response, поступивший через внешний канал и признанный позднее.

Следовательно:

```text
Survey Response identity
≠ Subject identity
≠ User Account identity
≠ response unit identity
```

## 11. Acting User / Acting Subject / response unit

Следует различать:

- техническую User Account, через которую выполнено действие;
- фактически действовавший Subject, где он определим;
- основание допустимости действия;
- response unit — предметную единицу, относительно которой ограничивается кратность ответа, если это предусмотрено policy.

Пример:

```text
User Account
→ acting Subject
→ admissibility basis
→ response unit = Property Object
→ Survey Response
```

Response unit может быть, где это предметно оправдано:

- Subject;
- Property Object;
- Personal Account;
- Community membership/relationship referent;
- другой already-modeled scope.

Новый universal `Survey Participant` или `Survey Respondent Unit` entity не вводится.

## 12. Audience ≠ eligibility ≠ technical access

Сохраняются различия:

```text
intended audience
≠ eligibility to respond
≠ technical access
≠ actual respondent
```

Например, Survey может быть предназначен всем жителям, но response policy допускает один ответ от Property Object.

Технический доступ к интерфейсу Survey не создаёт предметную допустимость Response автоматически.

## 13. Response admissibility

Принятие Survey Response может зависеть от локально определённой policy.

Она может учитывать, где применимо:

- отношение Subject ↔ Community;
- отношение Subject ↔ Property Object;
- ownership/use/residence;
- membership;
- Domain Power/Representation;
- response unit;
- период допуска;
- число уже принятых Responses;
- иные предметные основания.

Настоящий BP не вводит `Survey Right`.

```text
survey admissibility
≠ Voting Right
```

Отсутствие Survey Right как сущности не означает отсутствия проверяемых правил admissibility.

## 14. Правила кратности

Нельзя универсально предполагать:

```text
1 Subject = 1 Survey Response
```

или:

```text
1 Property Object = 1 Survey Response
```

Конкретный Survey может допускать, например:

- один Response на Subject;
- один Response на Property Object;
- один Response на Personal Account;
- несколько Responses одного Subject;
- anonymous Responses без identity-based multiplicity;
- другой locally defined constraint.

Кратность должна быть исторически объяснима в объёме, необходимом для проверки принятого Response.

## 15. Правило «1 участок = 1 голос» не применяется автоматически

Для пилотного СТ правило формального Voting:

```text
1 участок = 1 голос
```

не означает автоматически:

```text
1 участок = 1 Survey Response
```

Survey response policy задаётся отдельно.

Это предотвращает перенос Governance semantics в Communications только из-за похожего UI.

## 16. Анонимность и идентификация

Термин «анонимный опрос» должен быть предметно уточнён.

Следует различать как минимум:

```text
author hidden from ordinary viewers
≠ author known to Community but access-restricted
≠ author intentionally not linked / not knowable by Community OS
```

Survey Response может иметь stable identity даже если Subject identity отсутствует или намеренно не связывается.

```text
Survey Response
≠ identifiable Subject required
```

Если policy требует одновременно anonymity и ограничение «один ответ на response unit», способ доказательства admissibility может использовать специальный технический механизм, но настоящий BP не вводит универсальную domain entity Anonymous Token.

## 17. Response period

Survey может определять период, в течение которого новые Responses допустимы.

Следует различать:

- intended start/end;
- effective admissibility according to applicable rule;
- actual response time;
- recording time where they differ.

Позднее изменение текущих часов/настроек не должно ретроспективно менять допустимость уже признанных Responses.

## 18. Materially significant Survey definition

До первого accepted Survey Response изменяемый draft Survey может корректироваться согласно локальной policy.

После появления первого accepted Survey Response нельзя молча менять response-relevant semantics, если это изменило бы смысл уже данных ответов.

К materially significant могут относиться:

- wording Survey Item;
- варианты выбора;
- обязательность item;
- interpretation/validation;
- response admissibility;
- multiplicity;
- response unit semantics;
- anonymity/identification semantics;
- период, если изменение влияет на допустимость;
- другие сведения, влияющие на смысл Response.

```text
accepted Response exists
+ material Survey definition change
→ no silent rewrite
```

## 19. Почему сейчас не вводится Survey Version

Настоящий BP не вводит fundamental `Survey Version` / `Survey Definition Version`.

Для первого применения используется более простой default:

```text
material error/change after Responses exist
→ close/cancel current Survey where applicable
→ create replacement Survey
→ preserve relation/reason
```

Если будущий реальный процесс потребует продолжать тот же Survey после materially significant definition changes и сопоставлять Responses между версиями, необходимость versioned Survey Definition должна быть исследована отдельно.

## 20. Замена Survey

Replacement Survey является новым Survey с новой identity.

Связь с предыдущим Survey должна быть объяснима там, где замена вызвана:

- ошибкой;
- materially changed wording;
- materially changed options;
- materially changed eligibility;
- materially changed purpose;
- иной значимой причиной.

Предыдущие Responses не переносятся автоматически в новый Survey.

## 21. Modification Survey Response

Если policy допускает изменение ранее принятого Response:

```text
response modification
≠ new Survey Response automatically
```

Одна response identity может сохранять исторически значимые изменения.

Если ранее принятое значение было materially significant, оно не переписывается молча согласно ADR-004.

Конкретная policy определяет:

- можно ли менять Response;
- до какого момента;
- какие Items можно менять;
- сохраняется ли предыдущее значение;
- какое значение является effective для current aggregation.

## 22. Withdrawal

Survey Response может быть отозван, если это допускает policy.

```text
withdraw Response
≠ delete historical fact automatically
```

Отзыв должен сохранять достаточную historical explainability, если Response уже был предметно значим.

Policy определяет, учитывается ли withdrawn Response в текущей aggregation и как отражается его история.

## 23. New submission ≠ modification automatically

Если Survey допускает несколько Responses одного Subject/response unit, новая submission может стать новым Survey Response.

Если Survey допускает только изменение существующего Response, новая technical submission может означать modification текущего Response.

Решение принадлежит survey policy.

Совпадение:

```text
same Subject + same values + same date
```

не является universal identity/deduplication key.

## 24. External channel

Survey может принимать ответы через:

- Community OS UI;
- mobile application;
- Telegram;
- external form/service;
- другой integrated channel.

Внешний callback/message/row не является Survey Response автоматически.

```text
external information
→ received information
→ mapping
→ validation
→ admissibility check
→ domain recognition
→ Survey Response
```

Применяется ADR-011.

## 25. Duplicate / redelivery

Повторная техническая доставка одной внешней submission не создаёт новый Survey Response автоматически.

Но совпадение answer values также не доказывает duplicate, потому что конкретный Survey может допускать несколько Responses.

Duplicate/redelivery semantics должны опираться на конкретный integration semantic contract и survey policy.

## 26. Aggregation

Survey Responses могут использоваться для derived aggregation:

- counts;
- percentages;
- distribution;
- ranking;
- averages where semantically valid;
- text grouping/classification;
- другой defined summary.

Aggregation является производным представлением.

```text
Survey Responses
→ Read Model / Projection
→ counts / percentages / summary
```

Согласно ADR-013 конкретная projection должна иметь declared producer/owner, Community scope, visibility semantics и freshness expectation.

## 27. Survey Result как fundamental entity не вводится

Настоящий BP не вводит universal `Survey Result`.

Причины:

- многие Surveys не имеют единственного «результата»;
- free-text Survey может вообще не иметь meaningful numeric aggregation;
- разные aggregation могут одновременно быть валидными представлениями одних Responses;
- current aggregation может изменяться до закрытия Survey;
- итоговые показатели являются derived view, если отдельно не формализованы.

Если требуется исторически фиксированный отчёт/итог опроса:

```text
Survey + Responses
→ defined aggregation
→ Document / Revision / Representation
```

Такой Document не становится source of truth Survey Responses.

## 28. Survey и Governance

Survey может быть связан с:

- Governance Question;
- Management Procedure;
- preparation of proposal;
- agenda preparation;
- consultation before decision.

Пример:

```text
Survey
→ survey summary
→ basis/input for Governance Question
→ Voting
→ Established Result
→ Management Decision
```

Каждый переход является самостоятельным предметным действием или использованием результата.

## 29. Survey Response никогда не становится Vote автоматически

Даже если формулировки и варианты совпадают:

```text
Survey Response = "Да"
≠
Vote = "За"
```

Для последующего Voting формируются собственные:

- Voting identity;
- applicable Voting Rule version;
- snapshot;
- Voting Rights;
- Votes;
- calculations;
- Established Result where applicable.

Survey не может использовать Responses как Votes без отдельного explicitly defined Governance process, и настоящий BP такого преобразования не вводит.

## 30. Survey aggregation не является Established Result

Например:

```text
108 из 173 Responses выбрали вариант A
```

не означает:

```text
Established Result = "вариант A принят"
```

и не означает:

```text
Management Decision
```

Даже если Governance использует Survey summary как basis, управленческий смысл возникает только в owning Governance context.

## 31. Ownership change

Если Subject дал Response на основании ownership/use/membership, а затем соответствующее отношение изменилось:

- ранее признанный Response не исчезает;
- admissibility должна оцениваться согласно historical semantics применимого момента/policy;
- новый owner/user не получает автоматически identity старого Response;
- право нового Subject дать собственный Response определяется survey policy.

Текущее состояние ownership не переписывает прошлую admissibility.

## 32. Multiple users одного Subject или response unit

Несколько User Accounts одного Subject не создают автоматически несколько допустимых Responses.

Несколько Subjects, связанных с одним response unit, также не создают автоматически несколько Responses, если policy ограничивает response unit одним Response.

Техническая идентичность account используется для attribution/security, но не определяет multiplicity.

## 33. Несколько объектов одного Subject

Если один Subject связан с несколькими Property Objects и Survey policy задаёт «один Response от каждого Property Object», один Subject может законно сформировать несколько Responses с разными response units.

Это не является duplicate.

## 34. Public/open Survey

Survey может быть доступен широкой аудитории, если applicable policy это допускает.

Public access не означает автоматически:

- anonymous Response;
- unlimited multiplicity;
- отсутствие validation;
- юридическую публичность personal information;
- отсутствие privacy constraints.

Публичность отображения Survey и допустимость Response различаются.

## 35. Связь с Announcement / Notification

Survey может быть доведён до аудитории через Announcement или Notification.

```text
Survey
≠ Announcement
≠ Notification
```

Announcement/Notification могут ссылаться на Survey.

Notification delivery/read state не определяет, дал ли Subject Survey Response.

## 36. Связь с Appeal / discussion

Survey Response не является Appeal автоматически.

Free-text answer внутри Survey остаётся частью Survey Response, если процесс не определяет отдельное создание Appeal.

Discussion/commentary вокруг Survey также не создаёт Appeal или Governance proposal автоматически.

## 37. Связь с Documents

Survey сам по себе не является Document автоматически.

Формальный отчёт по Survey, архивная фиксация summary или иной materially significant output может быть Document according to ADR-009.

```text
Survey
≠ Document

Survey Response
≠ Document

survey report
→ Document where document semantics are explicitly intended
```

## 38. Связь с access/privacy

Survey eligibility и visibility не должны выводиться только из Access Role.

Сохраняется ADR-010:

```text
technical permission
≠ subject-matter admissibility
```

Privacy/anonymity policy может ограничивать:

- видимость identity respondent;
- видимость raw Responses;
- видимость free-text content;
- доступ к aggregation;
- audit/provenance exposure.

Конкретные legal/privacy requirements конкретной юрисдикции настоящий BP не устанавливает.

## 39. Проверочные сценарии

### 39.1. Простой выбор даты

Survey:

- «Когда удобнее субботник?»
- Saturday / Sunday.

Один Subject даёт один Response.

Ни Voting Rights, ни quorum, ни Established Result не создаются.

### 39.2. Multi-item questionnaire

Survey содержит 10 Items.

Одна submission создаёт один Survey Response с 10 item values.

Не создаются 10 самостоятельных Responses.

### 39.3. Один Response от участка

Два совладельца имеют три User Accounts, но policy задаёт один Response per Property Object.

После принятия Response для участка новая submission относительно того же response unit обрабатывается согласно policy: rejected, modification либо иной locally defined outcome.

Новые Voting Rights не создаются.

### 39.4. Несколько Responses одного Subject

Survey explicitly допускает до трёх независимых submissions.

Каждая accepted submission может стать отдельным Survey Response.

### 39.5. Modification

Subject отвечает «Saturday», затем допустимо меняет на «Sunday».

По policy сохраняется одна Survey Response identity с historical change.

### 39.6. Анонимный Survey

Survey допускает Response без persistent Subject link.

Response сохраняет собственную identity.

Анонимность не превращает его в технически недоказуемый факт автоматически; уровень provenance зависит от policy.

### 39.7. Ownership changed

Owner A дал Response по Property Object.

Позже owner B получает ownership.

Response A остаётся историческим фактом; B не наследует его identity. Возможность B дать новый Response определяется policy.

### 39.8. Material edit after responses

После 80 accepted Responses организатор пытается изменить варианты ответа так, что смысл старых values меняется.

Silent rewrite запрещён.

Default — replacement Survey.

### 39.9. Telegram redelivery

Один Telegram callback доставлен дважды.

Вторая delivery не создаёт второй Survey Response автоматически.

### 39.10. Survey → formal Voting

74% Survey Responses поддержали проект.

Позднее создаётся Governance Question и Voting.

Survey Responses не становятся Votes, 74% не становятся Established Result.

### 39.11. Free-text Survey

Survey собирает предложения жителей.

Aggregation может быть qualitative/read-model classification либо отсутствовать.

Отдельный Survey Result не требуется.

### 39.12. Printer/document/reporting

Правление формирует PDF summary Survey для заседания.

PDF/Document не становится Survey и не меняет Responses.

## 40. Инварианты

1. Survey имеет собственную stable identity.
2. Survey принадлежит Communications, а не Governance автоматически.
3. Survey ≠ Management Procedure ≠ Governance Question ≠ Voting.
4. Survey Item ≠ Governance Question.
5. Survey Item имеет stable local identity within Survey.
6. Survey Response имеет собственную stable identity.
7. Survey Response ≠ Vote.
8. Survey Response identity ≠ Subject identity ≠ User Account identity.
9. Survey audience ≠ response eligibility ≠ technical access ≠ actual respondent.
10. Survey eligibility ≠ Voting Right.
11. Response unit ≠ Subject ≠ User Account автоматически.
12. Rule `1 участок = 1 голос` не означает `1 участок = 1 Survey Response`.
13. Multiple User Accounts не создают дополнительные Responses автоматически.
14. Ownership/use/membership change не переписывает historical Response.
15. Anonymous Response не требует fake Subject.
16. Anonymous/pseudonymous/private-identity modes не считаются одним смыслом.
17. External callback/message ≠ Survey Response.
18. Redelivery ≠ new Survey Response automatically.
19. Same Subject + same answers ≠ universal duplicate key.
20. Response modification ≠ new Survey Response automatically.
21. Withdrawal ≠ historical deletion automatically.
22. Material Survey definition used by accepted Responses is not silently rewritten.
23. Replacement Survey has new identity.
24. Previous Responses are not automatically migrated to replacement Survey.
25. Survey Response values are tied to stable local Survey Item identities.
26. Survey aggregation is derived, not source of truth.
27. Survey aggregation ≠ Established Result.
28. Survey aggregation ≠ Management Decision.
29. Survey Response never becomes Vote automatically.
30. Survey does not create Voting Rights, quorum or voting snapshot.
31. Survey Result is not introduced as universal fundamental entity.
32. Survey Right is not introduced.
33. Survey Participant is not introduced.
34. Survey Eligibility Snapshot is not introduced.
35. Survey Version is not introduced at this stage.
36. Answer/item-value is not introduced as a separate fundamental entity.
37. Survey report/document ≠ Survey/Response source of truth.
38. Announcement/Notification ≠ Survey.
39. Survey Response ≠ Appeal automatically.
40. Technical access does not create domain admissibility.

## 41. Нормативные последствия Draft

Предварительный архитектурный вывод Stage 10:

- требуется самостоятельное понятие `Survey`;
- требуется самостоятельное понятие `Survey Response`;
- `Survey Item` требуется как stable locally addressable part of Survey, но не как fundamental top-level entity;
- universal `Survey Result` не требуется;
- universal `Survey Right` не требуется;
- universal `Survey Participant` не требуется;
- universal `Survey Eligibility Snapshot` не требуется;
- `Survey Version` пока не требуется;
- Survey owner — Communications & Appeals;
- Governance использует Survey/summary как basis/input через explicit relation;
- Voting semantics ADR-001/008 не переиспользуются механически для Survey.

Эти выводы являются Draft до independent review/принятия.

## 42. Вопросы для review

Независимый review должен проверить:

1. действительно ли `Survey` требует stable identity, а не является specialization Announcement/Appeal;
2. действительно ли `Survey Response` требует собственной identity;
3. достаточно ли local identity Survey Item;
4. не требуется ли versioned Survey Definition после первого Response;
5. корректна ли модель replacement Survey вместо in-place material versioning для первого пилота;
6. достаточно ли response unit semantics без `Survey Participant`;
7. не вводится ли скрытый Survey Right под видом admissibility;
8. достаточно ли ADR-004/005 для history/rule semantics;
9. достаточно ли ADR-011 для Telegram/external-channel recognition;
10. достаточно ли Read Model/Projection для survey aggregation;
11. нет ли скрытого смешения Survey с Governance;
12. нужна ли отдельная formal Survey Result entity в каком-либо реальном ST/OSBB/ZhSK scenario;
13. какие scenarios требуют legal/privacy analysis отдельно.

## 43. Что намеренно остаётся открытым

До review/следующих этапов не фиксируются:

- конкретный status lifecycle Survey;
- конкретный закрытый набор Item types;
- конкретная model Survey Definition Version;
- exact anonymity/privacy implementation;
- exact duplicate keys;
- exact modification/withdrawal window;
- exact ST response policies;
- legal effect Survey в конкретной юрисдикции;
- retention/deletion/anonymization requirements;
- UI questionnaire builder;
- analytics implementation;
- Telegram/API transport.

## 44. Связанные документы

- ADR-001;
- ADR-002;
- ADR-004;
- ADR-005;
- ADR-008;
- ADR-009;
- ADR-010;
- ADR-011;
- ADR-013;
- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- `docs/references/MIYDIMONLINE_REFERENCE_ANALYSIS.md`;
- `docs/references/DAH_REFERENCE_ANALYSIS.md`;
- `docs/references/REFERENCE_CANDIDATE_MATRIX.md`.

## 45. Следующий шаг

1. провести independent multi-review Draft;
2. adjudicate reviewer findings against current normative source of truth;
3. при подтверждении модели синхронизировать DOMAIN_MODEL / TERMINOLOGY / ADR-002 только в минимально необходимом объёме;
4. обновить REF-GOV-001;
5. решить, нужен ли второй review round;
6. только после архитектурного принятия переходить к техническому проектированию/реализации.


---

## 6. ADR-002 — ownership bounded contexts (релевантные выдержки)

### 6.8. Управление и коллективные процедуры

**Ответственность.** Деятельность органов управления и коллективные процедуры рассмотрения вопросов и принятия решений.

**Ключевые понятия.** Орган управления в аспекте его деятельности, собрание, вопрос, право участия, голосование, версия правила голосования, право голоса, реализатор права голоса, снимок прав, голос, история голоса, корректирующая операция, эффективный состав прав, расчёт результата, расчётный результат, установление результата, установленный результат, пересмотр результата, решение по вопросу.

**Граница ответственности.** Вопрос, голосование, результат и решение по вопросу — разные понятия, но не отдельные верхнеуровневые контексты. Орган управления не получает второго независимого владельца: данный контекст отвечает только за его деятельность — рассмотрение вопросов, проведение процедур и принятие решений. Историческое участие конкретного субъекта в органе управления принадлежит контексту «Отношения субъекта с сообществом». Контекст не определяет собственность, членство или представительство; он может использовать их как основания согласно применимым правилам.

**Зависимости.** Использует сообщество, отношения субъекта с сообществом, полномочия и представительство, отношения с объектами, конфигурацию, правила и историю.

**Предоставляемые результаты.** Предметные результаты коллективных процедур, включая установленные результаты и решения по вопросам.

### 6.9. Документы и формализация

**Ответственность.** Документы, их применимые версии, публикация и связи с предметными объектами других контекстов.

**Ключевые понятия.** Документ, публичный документ.

**Граница ответственности.** Документ не тождествен предметному факту, праву, обязательству, результату или решению и не становится владельцем такого факта только потому, что оформляет, подтверждает, формализует или удостоверяет его. В конкретной предметной ситуации документ может быть связан с подтверждающими сведениями, оформлять или подтверждать их, а также быть основанием либо подтверждать основание. При этом документный контекст не становится владельцем всех подтверждающих сведений системы, а общее понятие «Основание» ему не принадлежит. Основание, подтверждающие сведения, документ, источник данных и действие фиксации — разные понятия.

**Зависимости.** Использует ссылки на предметные объекты, факты и решения соответствующих контекстов; применяет общие принципы происхождения и истории.

**Предоставляемые результаты.** Документы, их применимые версии, публикации и связи с предметными объектами.

### 6.10. Коммуникации и обращения

**Ответственность.** Предметное информационное взаимодействие сообщества с участниками.

**Ключевые понятия.** Обращение, новость, объявление, уведомление.

**Граница ответственности.** Личный кабинет может быть пользовательским каналом взаимодействия, но не становится самостоятельным предметным понятием или архитектурной границей только из-за пользовательского интерфейса. Предметная необходимость уведомить отличается от технической доставки сообщения. Контекст не определяет субъект, документ, решение или право доступа.

**Зависимости.** Использует субъектов, системную идентичность и доступ, документы, а также результаты других контекстов, когда они являются предметом обращения или уведомления.

**Предоставляемые результаты.** Обращения, информационные материалы и предметные основания информационного взаимодействия.

---

## 7. ADR-008 — Governance / Voting boundaries (релевантные выдержки)

### 3. Собрания и способы проведения

**Собрание** — возможная часть управленческой процедуры, в рамках которой происходит совместное рассмотрение вопросов и, если применимо, голосование или принятие решений.

Собрание не тождественно всей управленческой процедуре. Процедура может:

- включать одно собрание;
- включать несколько мероприятий или периодов проведения;
- иметь перерыв, перенос или продолжение;
- использовать очную, заочную, электронную или смешанную форму;
- не иметь физического собрания.

Мероприятия и периоды проведения должны быть предметно различимы там, где их различие влияет на участие, сроки, применимые правила, результаты или решения. Универсальная техническая модель сессий не вводится.

### 4. Вопросы и их исторический состав

**Вопрос** — самостоятельный предмет рассмотрения там, где управленческая процедура выделяет вопросы. Вопрос не является обязательным универсальным узлом любой процедуры и не тождествен голосованию, расчёту, установленному результату или решению.

Для процедуры, в которой выделяются вопросы, должен быть исторически определим их состав. Где это существенно, также определимы:

- порядок рассмотрения;
- формулировка и её редакция;
- включение и исключение;
- снятие;
- разделение или объединение;
- период или момент применимости редакции.

Исторически значимая формулировка вопроса или состав вопросов не переписываются молча. Изменение фиксируется в соответствии с предметной семантикой процедуры.

### 5. Повестка

**Повестка** может быть самостоятельным предметным представлением состава и порядка вопросов там, где она предусмотрена конкретной процедурой. Обязательная универсальная сущность повестки не вводится.

Отсутствие самостоятельной повестки не отменяет требования сохранять исторически определимый состав и существенные редакции вопросов.

### 6. Вопрос и голосования

Сохраняется модель ADR-001:

```text
Вопрос → 0..N голосований
```

Вопрос может не требовать голосования, иметь одно голосование либо несколько связанных голосований. Каждое голосование имеет самостоятельную предметную идентичность и собственный контекст, включающий, где применимо:

- применимую версию правила;
- исходный снимок прав;
- права голоса;
- голоса;
- расчёты;
- действия установления результата;
- установленные результаты.

Повторное голосование является новым голосованием, а не новой версией или изменением предыдущего. Оно может использовать другую версию правила и имеет собственный исходный снимок прав. Предыдущее голосование не переписывается; сохраняется предметно значимая связь с ним и с причиной повторения.

### 7. Возможности участия

Предметно различаются возможности:

- присутствовать;
- участвовать в обсуждении;
- вносить предложение;
- голосовать;
- подписывать;
- устанавливать или подтверждать результат;
- совершать иные допустимые действия.

Эти возможности не объединяются автоматически в универсальный пакет прав. Универсальные сущности участия или участника процедуры не вводятся. Самостоятельное предметное право требуется только там, где оно необходимо соответствующему процессу. Право голоса сохраняется как специализированное самостоятельное понятие ADR-001.

Допустимость конкретного действия может следовать из правила, полномочия, состава органа, представительства или другого предметного основания. Предметная допустимость действия не тождественна технической авторизации или доступу пользователя.

### 8. Кворум

**Кворум** — предусмотренное применимым правилом условие достаточности состава или участия для определённой области процедуры.

У кворума нет универсального уровня, формулы или знаменателя. Применимая версия правила определяет:

- требуется ли кворум;
- к какой области он относится;
- какие исторические данные используются;
- каким способом рассчитываются значимые показатели и определяется наличие или отсутствие кворума;
- требуется ли отдельное предметное установление наличия или отсутствия кворума.

Расчёт показателей кворума и установленный вывод о его наличии или отсутствии различаются там, где процедура предусматривает отдельное установление. Применимое правило также может позволять определить наличие или отсутствие кворума непосредственно, без отдельного акта установления.

Кворум может относиться к процедуре, собранию, вопросу, конкретному голосованию или другой предусмотренной правилом области. Он также может не требоваться. Нельзя универсально считать его по субъектам, объектам, числу прав, весам, присутствующим или проголосовавшим.

Исходный снимок прав конкретного голосования не является автоматически источником любого кворума. Для кворума процедуры, собрания или вопроса используется исторически определимый набор данных, предусмотренный соответствующим правилом. Универсальная структура результата кворума не вводится.

### 9. Временная семантика голосования

Для конкретного голосования исторически определимы, где применимо:

- момент или период, когда подача голосов допустима;
- окончание допустимости подачи;
- время подачи голоса;
- изменения или отзыв голоса;
- значение голоса, действовавшее в соответствующий момент;
- голоса, использованные конкретным расчётом.

Это требование не вводит универсальную последовательность состояний голосования. Специализированная процедура может предусматривать дополнительные фазы.

Бумажный, очный, электронный или иной допустимый канал подачи не меняет предметную природу голоса и не образует самостоятельный универсальный вид голоса.

### 10. Голос и позиция

**Голос** выражает допустимую по применимой версии правила позицию реализатора конкретного права голоса.

Позиция может выражать один или несколько выборов, выбор одного или нескольких кандидатов, ранжирование либо другой предметно определённый способ ответа. Универсальный тип голосования и универсальная техническая структура позиции не вводятся. Допустимость позиции определяется применимой версией правила.

«Воздержался» является позицией только тогда, когда такой вариант предусмотрен применимым правилом. Неучастие означает отсутствие действительного голоса. Воздержание и неучастие не тождественны.

### 11. Версия правила и снимок прав

Каждое конкретное голосование использует одну применимую версию правила. Одна версия может использоваться несколькими голосованиями. Разные голосования одного вопроса могут использовать разные версии.

Каждое голосование после формирования имеет один исходный снимок прав согласно ADR-001. Снимок фиксирует исторически определимый состав прав, их основания, использованные значения, веса и другие предусмотренные правилом параметры. Он не переписывается молча.

Представительство не помещается автоматически в снимок как неизменяемая принадлежность права для всех процедур. Оно остаётся самостоятельным историческим отношением. Его применимость к конкретному действию определяется для соответствующего момента и правила, если процедура не требует иной предметной фиксации.

### 12. Расчёт и установление результата

**Расчёт результата** — исторически определимое применение соответствующей версии правила к предусмотренным ею данным. Расчёт должен позволять определить использованные права, веса, голоса, существенные исключения и иные входы, необходимые для объяснимости результата.

Расчётный результат не становится установленным автоматически. **Установление результата** — отдельное предметно значимое действие, которым результат признаётся для соответствующей процедуры на определимом расчётном и ином допустимом основании.

Один расчёт может не привести к установленному результату. Основание установления может включать один или несколько расчётов и другие предусмотренные процедурой факты. Расчёт и установленный результат не тождественны.

### 13. Управленческое решение

**Управленческое решение** — самостоятельный предметный факт определённого управленческого содержания, относимый к компетентному органу и возникший на допустимом для соответствующей процедуры основании.

Решение не тождественно расчёту, установленному результату или документу. Установленный результат может не привести к решению.

Решение может возникнуть:

1. отдельным предметным действием компетентного органа;
2. как заранее предусмотренное предметное следствие установленного результата согласно применимому правилу.

Во втором случае установленный результат не становится решением. Решение остаётся отдельным фактом, а основание его возникновения должно быть предметно определимо. Дополнительный ручной акт не требуется, если применимое правило уже устанавливает непосредственное возникновение решения из установленного результата.

### 14. Решение без голосования

Управленческое решение по своей природе не требует голосования. Оно может возникнуть вследствие голосования общего собрания или коллегиального органа, быть принято единолично компетентным органом либо возникнуть другим предметно допустимым способом.

Для решения исторически определимы, где применимо:

- компетентный орган;
- субъект, фактически действовавший от имени органа или в его составе;
- основание и компетенция;
- связанная процедура;
- содержание;
- момент принятия и применимость;
- связь с голосованием и установленным результатом;
- связь с документом, если решение документировалось.

Решение приписывается компетентному органу. Физическое или юридическое лицо, действующее как председатель, член органа или иной исполнитель, не тождественно органу. Должность может считаться единоличным органом только как явно определённая локальная специализация.

Не каждое управленческое действие является решением. Решение, поручение, уведомление, согласование, назначение и фиксация факта не объединяются автоматически в универсальную сущность управленческого действия.

### 15. Временная семантика решения

Для решения различаются там, где это предметно значимо:


---

## 8. ADR-004 — History / silent rewrite / temporal semantics / attribution

### 3. Изменения, исправления и запрет silent rewrite

Исторически значимое прошлое Community OS не должно изменяться молча.

Если ранее зафиксированный предметный факт, состояние, отношение, действие или результат исправляется, отменяется, признаётся недействительным, переоценивается либо изменяются его последствия, должна сохраняться прослеживаемость исходного исторически значимого состояния и последующего изменения в объёме, требуемом предметной семантикой.

Следует различать, когда применимо:

- обычное изменение состояния;
- исправление ошибочных сведений;
- позднюю фиксацию сведений о прошлом;
- изменение оценки сведений;
- корректировку;
- перерасчёт;
- пересмотр результата;
- изменение последствий решения.

Это не закрытый универсальный перечень типов операций и не единый жизненный цикл всех предметных данных. Конкретная процедура принадлежит предметному контексту.

Специальная «Корректирующая операция» ADR-001 для снимка прав и голосования не становится универсальным механизмом исправления данных Community OS. Более строгие гарантии неизменяемости исходного снимка сохраняются специальными правилами модели голосования.

### 4. Предметная объяснимость и воспроизводимость

#### Explainability

Community OS должна обеспечивать предметную объяснимость исторически значимых результатов. Должно быть возможно определить, на основании каких исторически значимых фактов, сведений, правил, значений, действий и иных существенных оснований был получен результат — в объёме, требуемом его предметной семантикой.

Этот перечень не образует обязательного набора характеристик каждого действия или результата.

#### Domain reproducibility

Если предметный результат является расчётным или иным образом предметно проверяемым, архитектура должна позволять предметно воспроизвести или независимо проверить его на основании исторически определённых входных данных, применимых правил, использованных значений и иных существенных оснований.

Предметная воспроизводимость не требуется для любого факта только потому, что он исторический. Например, право собственности не требуется «пересчитывать», однако его историческое состояние и основания должны быть объяснимы в требуемом предметной семантикой объёме.

#### Technical reproducibility

Предметная воспроизводимость не требует сохранения или повторного исполнения исторической версии программного кода, базы данных, операционной системы, инфраструктуры или другого технического окружения. Способ технического достижения предметной воспроизводимости определяется позднее.

### 5. Конфликтующие сведения

Community OS допускает существование конфликтующих предметно значимых сведений. Конфликт не обязан устраняться перезаписью или удалением ранее зафиксированных сведений.

Конкретная модель конфликтующих сведений и разрешения конфликтов принадлежит соответствующему предметному контексту. Сквозно различаются:

1. наличие сведения;
2. признание его применимым или достоверным;
3. использование сведения в конкретном предметном действии или результате.

Эти понятия не тождественны. Если выбор между конфликтующими либо по-разному оценёнными сведениями существенен для действия или результата, должно быть возможно определить, какие сведения фактически использовались и, когда этого требует предметная семантика, на каком основании они были признаны применимыми.

Последующее изменение оценки сведений не переписывает молча историю ранее совершённых действий, которые на них основывались.

Настоящий ADR не вводит универсальные Assertion, Evidence или Conflict Resolution entity.

### 6. Временная семантика

Когда это применимо к предметной семантике, различаются:

- время предметной применимости / effective time;
- время фиксации / recording time;
- момент предметного события;
- момент состояния;
- момент формирования.

Не каждое понятие обязано иметь все эти времена. Настоящий ADR не вводит обязательную универсальную bitemporal-модель.

Для исторических отношений сохраняется принятый принцип периода действия `[start, end)`, где он уже применим. Он не распространяется автоматически на любые факты, действия, результаты и настройки.

Технический timestamp записи в базе данных не является автоматически recording time в предметном смысле.

### 7. Атрибуция предметно значимых действий

Атрибуция является условной: для конкретного действия могут быть предметно значимы, в зависимости от его семантики:

- что произошло и к какому предметному контексту относится действие;
- время;
- фактически действующий субъект;
- субъект, от имени которого совершено действие;
- пользовательская идентичность;
- полномочие;
- основание;
- источник данных;
- действие фиксации;
- применимая версия правила;
- использованные значения;
- автоматический характер действия.

Не каждое действие обязано иметь все перечисленные характеристики. Настоящий ADR не создаёт универсальные Action, Audit DTO или entity.

### 8. Автоматические действия

Система, сервис, фоновый процесс, интеграционный работник и иной технический механизм не становятся субъектами предметной модели только потому, что выполнили автоматическое действие.

Автоматическое предметно значимое действие может не иметь человеческого действующего субъекта. Если это существенно для предметной семантики, должно сохраняться достаточное происхождение результата: инициирующее предметное действие, применимое правило, использованные значения, применимая конфигурация, источник, время и автоматический характер действия.

Техническая service identity не становится предметным субъектом автоматически.

### 9. Внешние источники и происхождение

Сохраняется различие:

```text
внешний источник
≠ основание предметного факта
≠ действие фиксации
≠ действующий субъект
```

Например, банк как источник сведений о платеже не является автоматически основанием финансового обязательства. Импорт банковской операции не тождествен ручному сопоставлению платежа с обязательством.


---

## 9. ADR-005 — Rules, versions, applicability and reproducibility

### 1. Общая семантика и классификация правил

Community OS использует подход «общий семантический контракт и локальные виды правил».

**Правило** — формализованный набор условий, определяющий применимое предметное поведение, результат или порядок выполнения определённого процесса. Общий архитектурный минимум относится к идентичности, версиям, применимости, историческому контексту и воспроизводимости применения. Содержание, типы и владение правилами остаются локальными для соответствующих предметных контекстов.

Универсальный объект Rule, единый Rule Context и централизованный владелец всех правил не вводятся.

Допускается открытая классификация правил по характеру поведения, включая:

- вычисление;
- допуск;
- ограничение;
- выбор;
- определение веса;
- агрегацию;
- распределение;
- процедурный порядок;
- иные предметно необходимые виды.

Эта классификация не является закрытой универсальной иерархией или обязательным перечислением. Одно предметное правило может сочетать несколько видов поведения, если это следует из его семантики.

Сохраняется различие:

```text
правило
≠ конфигурация
≠ предметный факт
≠ программный код
```

Конфигурация может определять допустимость или применимость правила. Правило определяет предметное поведение. Предметный факт является входом, основанием, действием или результатом соответствующего процесса. Программный код может реализовывать правило, но не является самим предметным правилом автоматически.

### 2. Идентичность, владение и жизненный цикл

Правило имеет устойчивую предметную идентичность, объединяющую его редакции во времени. В предметных процессах используются конкретные версии правила.

Правило и его версии принадлежат предметному контексту, владеющему их предметным смыслом, применимостью и локальными инвариантами. Сквозная ответственность правил устанавливает общие гарантии, но не становится централизованным владельцем.

До публикации или иного предметного принятия допускается изменяемая редакция — черновик. После публикации или иного предметного принятия версия становится неизменяемой. Изменение её содержания создаёт новую версию того же правила, а не изменяет существующую версию.

Минимально различаются:

- черновик;
- принятая или опубликованная версия.

Прекращённая, заменённая и другие предметно значимые характеристики версии могут использоваться соответствующим контекстом, но не образуют обязательный универсальный жизненный цикл всех правил.

Прекращение применимости или замена версии не изменяет её историческое содержание и не устраняет её роль в объяснении прошлых действий и результатов.

### 3. Применимость и временной выбор версии

Применимая версия определяется предметно установленной политикой соответствующего вида процесса или операции. Единого универсального алгоритма выбора версии для всей Community OS не вводится.

Политика может предусматривать:

- явную фиксацию версии;
- выбор по времени применимости;
- выбор по расчётному периоду;
- выбор по состоянию исходных данных;
- выбор по моменту начала процедуры;
- выбор по специально установленному моменту фиксации;
- другие предметно значимые основания.

Момент определения применимости задаётся семантикой конкретного процесса. Нельзя автоматически считать применимой текущую, последнюю или наиболее новую версию.

Если выбор версии влияет на исторически значимое действие или результат, фактически использованная версия должна быть зафиксирована либо однозначно определима из сохранённого исторического контекста.

Если процесс заранее зафиксировал версию, появление новой версии само по себе не меняет правило уже начатого процесса, если предметная семантика явно не предусматривает иного.

Конфигурация сообщества может участвовать в выборе правила или версии, но не является обязательным универсальным механизмом выбора. Текущая конфигурация не заменяет исторически определённую применимость.

### 4. Конфликты, приоритеты и композиция

Глобальная иерархия приоритетов правил не вводится. Если потенциально применимы несколько правил, ситуация разрешается согласно предметной семантике соответствующего контекста.

Локальная политика может определять:

- взаимную исключительность;
- приоритет;
- совместное применение;
- порядок применения;
- выбор по дополнительным предметным условиям.

Наличие нескольких потенциально применимых правил само по себе не означает конфликт. Конфликт существует, когда совместное применение несовместимо либо не позволяет однозначно определить требуемое предметное поведение.

При композиции порядок должен быть предметно определён, если его изменение способно изменить результат. Случайный или скрытый технический порядок исполнения не должен определять предметный результат.

Если выбор, приоритет или порядок влияет на исторически значимый результат, должны быть определимы фактически использованные версии, существенный порядок и предметные основания выбора в необходимом для объяснимости и воспроизводимости объёме.

Межконтекстная зависимость или композиция должна быть явно определена предметной архитектурой процесса. Конкретные схемы приоритетов и композиции остаются ответственностью соответствующих предметных областей.

### 5. Исторический контекст применения правила

Для исторически значимого применения правила должен сохраняться либо быть однозначно восстанавливаем контекст, достаточный для объяснения результата и, когда требуется предметной семантикой, его независимой проверки или воспроизведения.

Контекст может включать:

- фактически использованную версию или версии;
- существенные входные данные;
- фактически использованные значения;
- существенные основания выбора и применимости;
- существенные промежуточные показатели или результаты.

Конкретный состав определяется семантикой вида правила и процесса. Универсального обязательного набора полей для всех правил не вводится. Не требуется полный снимок всех доступных данных, конфигурации и состояния Community OS.

Ссылка только на версию правила недостаточна, если результат зависел также от изменяемых входов, настроек, оснований или других использованных значений. Сохранение только результата также недостаточно там, где требуется объяснимость или воспроизводимость.

Следует различать доступное, эффективное и фактически использованное значение. Для исторического объяснения существенно фактически использованное значение. Оно не тождественно текущему настроенному или эффективному значению.

Не требуется дублировать сведения, уже надёжно сохранённые как исторически определимые предметные факты в контексте-владельце. Допустима однозначная историческая ссылка, если она не превращается в ссылку на изменяемое текущее состояние.

Настоящий ADR не определяет технический способ хранения исторического контекста.

### 6. Изменение, ретроспективная применимость и последствия

Новая версия правила сама по себе не изменяет ранее выполненные действия, результаты и фактически использованные версии.

Ретроспективная применимость допускается, если это разрешено предметной семантикой соответствующего контекста. Следует различать:

- ретроспективную применимость;
- признание отношения версии к прошлому периоду;
- повторный расчёт;
- исправление;
- пересмотр результата;
- изменение последствий ранее совершённого действия.

Это не одна универсальная операция, и эти действия не следуют друг из друга автоматически. Ретроспективная применимость не означает автоматического перерасчёта или замены исторического результата.

Если прошлый результат требуется пересчитать, исправить, пересмотреть или изменить его последствия, это оформляется отдельным предметно значимым и прослеживаемым действием соответствующего контекста.

При этом в объёме, требуемом предметной семантикой, должны оставаться определимыми:

- первоначально использованная версия;
- первоначальный результат и существенный исторический контекст;
- основание последующего действия;
- версия и значения последующего действия;
- новый результат или изменение последствий.

Поздняя фиксация правила или сведений о нём сама по себе не означает, что исторический процесс фактически использовал это правило.

Универсальная Correction, Recalculation или подобная операция для всей Community OS не вводится. Специальные корректирующие операции и процедуры соответствующих контекстов сохраняют собственную предметную семантику.

### 7. Предметная воспроизводимость и граница реализации

Воспроизводимость применения правила означает возможность на основании сохранённого исторического контекста объяснить и, когда этого требует предметная семантика, независимо проверить получение исторического результата.

Для расчётных и иных детерминированно проверяемых результатов должны быть определимы:

- предметная логика использованной версии;
- существенные входы;
- фактически использованные значения и основания;
- существенные этапы вычисления или преобразования, если без них результат невозможно независимо проверить;
- результат.

Воспроизводимость не означает обязательный повторный запуск той же программной реализации. Исторический результат может проверяться другой реализацией или иным предметно корректным способом при сохранении эквивалентной предметной семантики.

Для недетерминированных по природе предметных решений может требоваться не повторное получение идентичного решения, а достаточная объяснимость: какие правила, основания, сведения и значения использовались и какое предметно значимое действие было совершено.

Требования к воспроизводимости зависят от характера правила и результата. Не требуется сохранять старую версию приложения, бинарные файлы, фреймворк, библиотеки, операционную систему, контейнер, виртуальную машину, физическое состояние СУБД или иное техническое окружение, если они сами не являются предметно значимыми данными.

---

## 10. ADR-009 — Communications semantics and boundaries

### 14. Общая семантическая рамка коммуникаций

Для предметных коммуникаций могут быть значимы:

- инициатор;
- адресат или аудитория;
- содержание;
- предмет коммуникации;
- существенные моменты и периоды;
- основание;
- связанные документы и предметы других контекстов;
- исторически значимые действия и результаты.

Этот перечень не является обязательным набором характеристик любой коммуникации. Он не вводит универсальную сущность `Communication`, `Message`, общий workflow или общий жизненный цикл.

Обращение, уведомление, новость, объявление и другие локальные виды коммуникационных материалов сохраняют собственную идентичность и правила. Общая семантика нужна для согласования различий, но не создаёт общего агрегата или владельца всего информационного взаимодействия.

### 15. Обращение

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом.

Инициатор обращения не обязан быть пользователем системы. Субъект и пользовательская учётная запись не тождественны. Если инициатор является субъектом, его идентичность принадлежит контексту субъектов; способ технической аутентификации и действия от чужого имени относятся к Stage B.

Обращение может выражать заявление, запрос, жалобу, сообщение о неисправности, запрос документа, просьбу о перерасчёте или другой предметно определённый вид. Этот перечень открыт и не создаёт универсальную классификацию обращений.

Сохраняются различия:

```text
Обращение ≠ Документ ≠ Сообщение ≠ Заявка технической поддержки ≠ Управленческая процедура
```

Обращение может иметь связанный документ, а заявление может одновременно иметь документную форму. Это не делает обращение и документ одним понятием.

Обращение также не является операционной работой. Оно может быть одним из оснований Operational Work, но:

```text
Appeal ≠ Operational Work
one Appeal → 0..N Operational Works
one Operational Work → 0..N Appeals
```

Operational Work может существовать без Appeal; завершение Work не закрывает Appeal автоматически. Фактическое выполнение, назначения и Work Result принадлежат контексту «Операционная деятельность», а коммуникационный контекст отдельно определяет рассмотрение, ответ и завершение Appeal по применимым правилам.

Не вводится универсальный жизненный цикл обращения. Принятие, рассмотрение, запрос уточнения, подготовка ответа, перенаправление, завершение или иные действия применяются только там, где они предусмотрены видом обращения и правилами процесса.

### 16. Ответ и иные связанные коммуникации

Ответ может быть самостоятельным коммуникационным материалом, связанным с обращением, если соответствующий процесс предполагает ответ. Не каждое обращение обязано иметь ответ.

Последующие обращения, ответы и уведомления могут сохранять предметно значимые связи друг с другом без введения универсальной цепочки сообщений или обязательной сущности диалога.

### 17. Уведомление

**Уведомление** — самостоятельное предметное понятие коммуникационного контекста с определимым содержанием и адресатом или аудиторией, предназначенное сообщить предметно значимую информацию.

Уведомление может ссылаться на решение, обязательство, задолженность, платёж, документ, ресурсный факт, управленческую процедуру или иной предмет. Оно не становится этим предметом и не изменяет его автоматически.

Формирование уведомления отличается от:

- отправки;
- попытки доставки;
- успешной технической доставки;
- предметно признанного получения;
- прочтения;
- подтверждения;
- юридически значимого уведомления.

Эти понятия не образуют обязательную универсальную последовательность:

```text
Уведомление сформировано
≠ отправлено
≠ доставлено
≠ получено
≠ прочитано
≠ юридически уведомлено
```

Конкретный процесс может использовать только часть этих различий. Юридически значимый эффект определяется применимыми локальными правилами и не следует автоматически из технического статуса доставки.

Предметное уведомление существует независимо от конкретного канала доставки. Несколько попыток или каналов не создают автоматически несколько уведомлений, но локальная семантика может предусматривать отдельные уведомления для разных адресатов или предметов.

### 18. Отправка, доставка, получение и прочтение

Если это существенно для предметного процесса, должны быть различимы:

- решение или обязанность отправить материал;
- предметное действие отправки;
- техническая попытка доставки;
- результат технической доставки;
- предметное признание получения;
- факт прочтения или подтверждения.

Техническая попытка доставки и её результат принадлежат интеграционной или инфраструктурной функции. Коммуникационный контекст может использовать полученные сведения и признавать предметно значимый результат согласно применимым правилам, не присваивая технический протокол.

Отсутствие доставки по одному каналу не отменяет автоматически уведомление или доставку по другому каналу. Приоритет каналов, повторные попытки, адреса доставки и внешние подтверждения относятся к Stage J и Stage K.

### 19. Новость и объявление

**Новость** и **объявление** являются самостоятельными коммуникационными материалами сообщества. Они не являются обязательными специализациями документа и не тождественны публикации.

Сохраняются различия:

```text
Новость / Объявление ≠ Документ ≠ Публикация документа
```

Новость или объявление могут иметь явную связь с документом, редакцией, представлением или публикацией документа. Если коммуникационный материал сам признаётся документом согласно семантике его вида, его документная идентичность должна быть явной и не следует автоматически из факта размещения для аудитории.

Предоставление новости или объявления аудитории определяется локальной коммуникационной семантикой. Оно не обязано создавать публикацию документа, если документ отсутствует.

### 20. Вложение и приложение

**Вложение** или **приложение** обозначает контекстную роль либо предметно значимое отношение, связывающее обращение или иной коммуникационный материал с документом, редакцией документа или представлением документа.

Сохраняются различия:

```text
Вложение ≠ Документ ≠ Редакция документа ≠ Представление документа ≠ Файл
```

Самостоятельная универсальная идентичность вложения не вводится. Если приложенный материал является документом, его идентичность принадлежит документному контексту. Если это только представление, его связь определяется соответствующим документом и коммуникацией.

### 21. Временная семантика

В зависимости от вида документа или коммуникации могут быть предметно значимы разные моменты и периоды:

- создание документа;
- дата документа;
- изменение черновика;
- возникновение редакции;
- утверждение;
- подписание;
- регистрация;
- публикация и отзыв публикации;
- отправка;
- доставка;
- получение;
- прочтение или подтверждение;
- вступление в силу;
- период применимости;
- прекращение, отзыв, отмена или замена.

Не каждое понятие обязано иметь все эти характеристики. Одинаково названные моменты могут иметь разную семантику у разных видов документов и коммуникаций. Настоящий ADR не вводит универсальный набор временных отметок, обязательную bitemporal-модель или единую дату документа.

### 22. Исправления и историческая сохранность

Следует различать, где применимо:

- изменение черновика;
- новую редакцию;
- исправление ошибочного содержания;
- новый документ, заменяющий прежний;
- отзыв или отмену документа;
- отзыв публикации;
- исправление адресата или аудитории;
- повторную отправку;
- исправление ошибочного уведомления;
- изменение оценки или последствий ранее переданной информации.

Эти действия не следуют друг из друга автоматически и не образуют универсальную операцию исправления. Исправление документа не исправляет автоматически предметный факт другого контекста. Исправление предметного факта не переписывает автоматически связанный документ.

Исторически значимые редакции, публикации, подписания, регистрации, обращения и уведомления не переписываются молча. Последующие изменения сохраняют прослеживаемую связь с исходным состоянием в объёме, требуемом предметной семантикой.

Настоящий ADR не требует универсального неизменяемого архива файлов, полного сохранения всех промежуточных черновиков, event sourcing или глобального журнала событий.

### 23. Происхождение и объяснимость

Для исторически значимого документа или коммуникационного результата должны быть определимы, где применимо:

- идентичность документа и использованная редакция;
- существенное содержание;
- использованное представление;
- происхождение и источник сведений;
- предметное основание;
- инициатор и фактически действовавший субъект;
- действие от имени другого субъекта или органа;
- применимая версия правила;
- аудитория или адресат;
- подписание, утверждение, регистрация или публикация;
- связанные предметы других контекстов;
- последующие исправления, замены, отзывы и изменения последствий.

Конкретный состав определяется видом документа или коммуникации. Этот перечень не образует универсальную запись аудита, сущность происхождения или обязательный snapshot всей системы.

### 24. Конфигурация и правила

### Дополнительные межконтекстные границы ADR-009

### Документы и коммуникации

Коммуникационный материал может иметь документную форму или ссылаться на документ, его редакцию, представление либо публикацию. Документный контекст владеет документной идентичностью и публикацией документа; коммуникационный контекст владеет обращением, уведомлением, новостью, объявлением и их предметной направленностью.

Обращение или уведомление не становится документом автоматически. Документ не становится обращением, уведомлением, новостью или объявлением только из-за использования в коммуникации.

### Коммуникации и субъекты

Контекст субъектов владеет идентичностью субъектов. Коммуникационный контекст использует субъектов как инициаторов, адресатов, получателей или иных участников предметно определённого отношения, но не присваивает их идентичность.

Пользовательская учётная запись не тождественна субъекту. Наличие учётной записи не создаёт автоматически предметную возможность инициировать, получить, прочитать или подтвердить коммуникацию.

### Коммуникации, полномочия и органы управления

Семантика полномочий и представительства принадлежит соответствующему контексту. Контекст коммуникаций определяет применимость этих отношений к конкретному обращению, уведомлению, ответу или иному действию, не создавая собственную модель полномочий.

Орган управления не тождествен субъекту. Коммуникация может быть адресована органу или исходить от него, однако фактически действовавший субъект и основание действия должны быть определимы там, где это предметно существенно.

### Публикация, аудитория и доступ

Документный контекст владеет фактом публикации документа и её предназначенной аудиторией. Аудитория характеризует предметную направленность публикации, но не является самой публикацией. Контекст коммуникаций может использовать публикацию и описывать направленность коммуникационного материала.

Предметная аудитория и публичность не определяют право доступа автоматически. Семантика прав доступа, authorization, пользовательских ролей и permissions относится к Stage B; их техническая реализация, хранение и enforcement относятся к Stage K.

Для dynamic Read Model используется собственная visibility/authorization semantics согласно ADR-013. Technical viewer scope dynamic projection не становится `Audience` автоматически. Если доступ к financial projection включает ссылку/метаданные Document, projection может раскрывать только те document metadata, которые допустимы соответствующим public/read contract и предметной доступностью документа; доступ к Revision/Representation проверяется document context независимо.

### Уведомление и доставка

Контекст коммуникаций владеет уведомлением и предметным признанием значимых результатов коммуникации. Интеграционная или инфраструктурная функция владеет техническими попытками и протоколами доставки.

Сведения о технической доставке могут быть источником для предметного признания получения или юридически значимого уведомления, но не создают такой факт автоматически.

## Архитектурные инварианты

---

## 11. ADR-010 — Subject/User/admissibility/access/attribution

### Subject и User Account

### 1. Субъект и пользовательская учётная запись

**Субъект** — участник предметных отношений согласно принятой модели Community OS.

**Пользовательская учётная запись** — технически используемое средство взаимодействия субъекта с Community OS. Она не является самостоятельным носителем предметных прав.

Сохраняется инвариант:

```text
Субъект ≠ Пользовательская учётная запись
```

Один субъект может иметь несколько пользовательских учётных записей. Несколько учётных записей одного субъекта не создают дополнительных:

- прав собственности;
- членств;
- должностей;
- предметных полномочий;
- представительств;
- прав участия;
- прав голоса;
- голосов;
- иных предметных отношений или результатов.

Создание, блокировка, деактивация или прекращение учётной записи сами по себе не создают, не изменяют и не прекращают предметные отношения субъекта. Наличие субъекта не означает наличия учётной записи.

### 2. Связь пользовательской учётной записи с субъектом

Пользовательская учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет связь с этим субъектом. После такого использования она не перепривязывается другому субъекту. Для другого субъекта используется другая пользовательская учётная запись. Это сохраняет историческую атрибуцию действий, выполненных через учётную запись.

Ошибочная первоначальная связь исправляется отдельной исторически прослеживаемой корректировкой. Такая корректировка:

- сохраняет ошибочную исходную связь и факт её исправления в необходимом для объяснимости объёме;
- не переписывает молча историю;
- не меняет атрибуцию уже совершённых предметно значимых действий;
- не делает нового субъекта действующим субъектом прошлых действий;
- не требует универсальной сущности идентичности или глобальной модели исправлений.

Конкретная процедура проверки и исправления связи определяется последующими решениями и применимыми правилами.

### 3. Техническая идентичность и аутентификация

### Domain Power / действие / representation

### 4. Предметное полномочие и основание действия

**Предметное полномочие** (`Domain Power`) — предметно определимая допустимость субъекта действовать в некоторой области на применимом основании. Оно имеет собственную локальную семантику и не является универсальной заменой всех условий конкретного действия.

Предметное полномочие может следовать из представительства, должности, участия в органе управления, служебного отношения, назначения, решения или иного допустимого основания. Из этого не следует единая универсальная иерархия полномочий.

Конкретный предметный контекст может требовать сочетание:

- предметного полномочия;
- представительства;
- собственности;
- членства;
- должности;
- участия в органе управления;
- компетенции органа;
- права участия или права голоса;
- применимой версии правила;
- состояния предмета;
- других допустимых оснований и условий.

Наличие одного предметного полномочия не означает автоматически соблюдения остальных условий.

### 5. Представительство и другие основания

**Представительство** остаётся самостоятельным историческим отношением и одним из возможных оснований предметного полномочия действовать от имени другого субъекта.

Сохраняются различия:

```text
Представительство
≠ Предметное полномочие
≠ Должность
≠ Участие в органе управления
≠ Компетенция органа
≠ Роль доступа
≠ Право доступа
≠ Право голоса
```

Представительство не передаёт автоматически собственность, членство, должность, право участия или право голоса, не создаёт нового права голоса и не изменяет его вес.

Конфликт нескольких представительств, полномочий или действий разрешается применимыми правилами соответствующего предметного контекста. Универсальный приоритет по времени создания, сроку, виду документа или техническому порядку действий не устанавливается.

### 6. Действие от собственного и чужого имени

«Действие от имени» не является одной универсальной предметной связью.

Там, где применимо, раздельно определяются:

- фактически действующий субъект;
- субъект, от имени которого совершается действие;
- сообщество, к которому относится действие;
- орган управления, к деятельности которого относится действие;
- должность;
- участие в органе управления;
- компетенция органа;
- представительство;
- предметное полномочие;
- основание;
- область применимости;
- момент применимости.

Действие субъекта от собственного имени не требует фиктивной связи представительства самого себя.

### Significant action и admissibility/access

### 8. Минимальный семантический контракт значимого действия

Stage B определяет минимальный общий семантический контракт атрибуции предметно значимых действий, но не вводит универсальную сущность `Action Context` или общий тип `Action`.

Для конкретного значимого действия должны быть исторически определимы, где применимо:

- фактически действующий субъект;
- использованная пользовательская учётная запись;
- использованная техническая идентичность;
- представляемый субъект;
- сообщество;
- орган управления;
- должность или участие в органе;
- основание;
- предметное полномочие;
- представительство;
- компетенция органа;
- область применимости;
- момент действия;
- автоматический характер выполнения;
- применимые правила и иные необходимые предметные обстоятельства.

Не все элементы обязательны для каждого действия. Конкретное действие и необходимый состав атрибуции принадлежат bounded context, владеющему его предметной семантикой.

Общий контракт не становится владельцем действий, их результатов или истории. Он не требует общей таблицы, объекта передачи данных, агрегата, события или журнала.

### 9. Предметная допустимость, техническая авторизация и доступ

**Предметная допустимость действия** — результат применения семантики контекста-владельца к конкретному действию, предмету, субъектам, основаниям, правилам и состоянию.

**Техническая авторизация** — проверка того, может ли технически идентифицированное взаимодействие выполнить конкретную операцию с учётом необходимых решений и сведений.

**Технический доступ** — технически обеспеченная возможность использовать данные или функции в пределах применимой авторизации.

Сохраняются различия:

```text
Предметная допустимость
≠ Предметное полномочие
≠ Техническая авторизация
≠ Право доступа
≠ Технический доступ
```

Community OS использует общий семантический контракт авторизации. Он может координировать:

- установленную техническую идентичность;
- связь учётной записи с субъектом;
- обязательные проверки предметного контекста;
- применимые права и роли доступа;
- предметное полномочие;
- представительство;
- отношения субъекта;
- состояние предмета;
- применимую версию правила;
- область применимости;
- другие необходимые источники решений.

Контракт авторизации не владеет предметными правилами. Предметная допустимость конкретного действия определяется bounded context, владеющим действием.

Нельзя установить универсальный порядок `role wins`, `power wins`, `access wins`, `ownership wins` или аналогичный. Роль доступа, право доступа, предметное полномочие или собственность по отдельности не являются универсальным источником разрешения.

Если обязательная предметная проверка дала отрицательный результат, техническая авторизация не разрешает выполнение только на основании технического доступа. Наличие предметного полномочия также не означает, что конкретная учётная запись технически допущена выполнить операцию.

Настоящий ADR не определяет механизм исполнения контракта авторизации.

### 10. Роль доступа и право доступа

### Историческая explainability

### 13. Историческая объяснимость

Для предметно значимого действия должен сохраняться достаточный исторический контекст, позволяющий объяснить, где применимо:

- кто фактически действовал;
- через какую учётную запись или техническую идентичность;
- от чьего имени;
- к какому сообществу или органу управления относилось действие;
- какое основание использовалось;
- какая область применимости использовалась;
- были ли полномочие и представительство применимы в момент действия;
- какие исторически значимые правила и сведения использовались;
- было ли действие автоматическим.

Прекращение, отзыв или исправление основания не переписывает молча прежнее действие. Исправление исторических сведений сохраняет различимость исходных сведений, изменения и его основания в объёме, необходимом для объяснимости.

Универсальный обязательный `Authorization Decision` не вводится. Если контекст-владелец или применимое правило считает результат авторизации исторически значимым, он может фиксироваться отдельно в локальной семантике.

Это не создаёт глобальный журнал авторизации, общий Audit Context, обязательный Audit Event, универсальный снимок всех правил или event sourcing.

### 14. Автоматизированные действия

### Communications boundary + invariants start

### Коммуникации и обращения

Обращение может существовать без аутентифицированной пользовательской учётной записи. Уведомление может формироваться автоматически.

Техническая доставка не доказывает идентичность отправителя, не создаёт предметное полномочие и не означает автоматически получение, прочтение или юридически значимое уведомление.

### Конфигурация и правила

Конфигурация может влиять на применимую политику доступа, но не является правом доступа или предметным полномочием.

Правило не является результатом авторизации. Если версия правила существенна для исторически значимой проверки или действия, фактически использованная версия должна быть исторически определима согласно ADR-005.

## Архитектурные инварианты

1. Субъект и пользовательская учётная запись не тождественны.
2. Пользовательская учётная запись не владеет предметными правами.
3. Несколько учётных записей одного субъекта не создают дополнительных предметных прав.
4. Создание, блокировка или прекращение учётной записи не изменяют предметные отношения субъекта автоматически.
5. Учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет эту связь и не перепривязывается другому субъекту.
6. Корректировка ошибочной связи учётной записи не меняет атрибуцию прошлых действий.
7. Аутентификация, связь Account—Subject, предметное полномочие, предметная допустимость, техническая авторизация, право доступа и техническая возможность выполнить операцию различаются.
8. Предметное полномочие, роль доступа и право доступа не тождественны.
9. Роль доступа группирует права доступа и не создаёт предметные отношения.
10. Представительство является самостоятельным историческим отношением и не тождественно полномочию.
11. Представительство, должность, участие в органе, компетенция, роль доступа, право доступа и право голоса различаются.
12. Орган управления, сообщество и субъект не объединяются универсальным Principal.
13. Компетенция органа и полномочие конкретного субъекта являются разными проверками.
14. Общий семантический контракт атрибуции не создаёт универсальную сущность Action Context или Action.
15. Конкретное действие и его предметная допустимость принадлежат контексту-владельцу.

---

## 12. ADR-011 — external-channel recognition / duplicate / redelivery

### Received information, recognition and provenance

### 3. Полученная внешняя информация

Сохраняется различие:

```text
Внешняя информация
≠ Полученная внешняя информация
≠ Признанный предметный факт
```

Общая семантическая последовательность имеет вид:

```text
Внешнее представление
→ полученная внешняя информация
→ validation / mapping
→ domain recognition или rejection
→ предметные последствия
```

Получение не означает признание. Domain recognition принадлежит bounded context, владеющему соответствующей предметной семантикой.

Если rejected или unrecognized information исторически значима, сохраняются достаточные сведения о её содержании, происхождении и результате обработки. Из этого не следуют универсальные `Integration Receipt`, `Imported Fact`, `External Fact`, `Message` или `Event`.

### 4. Mapping, validation и domain recognition

**Mapping** обозначает интерпретацию или сопоставление внешнего представления с интеграционными и предметными понятиями конкретного процесса. Это не обязательная универсальная сущность.

Validation внешнего представления, validation интеграционного смысла и предметная допустимость признания могут различаться.

Mapping не создаёт предметный факт автоматически. Предметный контекст определяет:

- достаточно ли сведений для recognition;
- какой предметный факт, отношение или результат может возникнуть;
- требуется ли действующий субъект или предметное основание;
- какие последствия имеет rejection;
- какие дальнейшие действия допустимы.

Признанный предметный факт сохраняет идентичность и историю своего контекста и не становится импортированной универсальной сущностью.

### 5. Provenance и историческая объяснимость

Для исторически значимого интеграционного действия или результата должны быть определимы, где применимо:

- внешняя сторона или источник;
- внешний идентификатор;
- исходное внешнее время, если известно;
- момент получения;
- полученное значение или представление;
- применимая версия semantic contract;
- применимая версия mapping;
- результат validation и recognition;
- связь с correction, cancellation или replacement;
- автоматический характер обработки;
- фактически действующий субъект и основание, если предметная операция требует субъекта.

Не все сведения обязательны для любой интеграции. Перечень не образует универсальную запись, Integration Event, bitemporal model или History/Audit Context.

Предметная объяснимость не требует сохранения старых runtime, adapter binaries или технического окружения.

### 6. Duplicate и redelivery

Повторное получение внешних сведений не должно автоматически создавать новый предметный факт. Одновременно совпадение значений само по себе не доказывает duplicate.

Сохраняются различия:

```text
Redelivery
≠ Duplicate
≠ External correction
≠ Replacement
≠ New information
```

Критерии идентичности и deduplication определяются конкретным integration semantic contract и соответствующим предметным процессом. Они могут учитывать внешний идентификатор, версию, sequence, время, содержание и другие значимые признаки.

Настоящий ADR не определяет idempotency key, hash, database constraint или inbox implementation.

### 7. Corrections и re-recognition

Сохраняются различия:

```text
Redelivery
≠ External correction
≠ Cancellation
≠ Replacement
≠ Re-import
≠ Re-recognition
```

Если внешняя информация уже привела к признанному предметному факту, последующее исправление внешнего источника не переписывает этот факт молча.

Исходная внешняя информация и её provenance сохраняются, если они исторически значимы. Контекст-владелец решает, требуется ли correction, recalculation, cancellation, replacement, новый предметный факт либо отсутствие предметного изменения.


### Integration contract / versions / unknown outcome / reconciliation

### 12. Integration semantic contract

Сохраняется различие:

```text
Domain contract
≠ Integration semantic contract
≠ External protocol/API contract
≠ Transport/schema
```

Общий architectural semantic contract задаёт границы, но не требует универсальной сущности `Integration Contract`.

Конкретный contract принадлежит конкретной интеграции и может определять, где применимо:

- смысл обмениваемой информации;
- внешнюю сторону;
- семантику идентификаторов;
- mapping;
- validation и recognition;
- duplicate, redelivery и correction semantics;
- acknowledgement и ожидаемый outcome;
- provenance;
- authoritative side и ownership;
- reconciliation semantics.

### 13. Версии contract и mapping

Версия semantic contract или mapping должна быть исторически определима, если её изменение могло изменить validation, recognition, interpretation или предметный результат.

При этом:

```text
API version ≠ Semantic mapping version
Schema version ≠ автоматически предметно значимая версия
Mapping ≠ автоматически универсальное Rule
```

Если mapping имеет семантику правила, применяются требования ADR-005 в соответствующем локальном контексте. Техническое хранение версий относится к Stage K.

### 14. Failure, rejection и unknown outcome

Там, где это применимо, различаются:

```text
Not attempted
≠ Failed
≠ Rejected
≠ Unknown
≠ Confirmed
```

Это семантические различия, а не обязательные состояния универсальной Integration State Machine.

`Unknown outcome` не является failure. Если после внешнего запроса неизвестно, выполнила ли внешняя сторона действие:

- результат остаётся unknown;
- повтор не считается автоматически новой предметной операцией;
- повтор может создать внешний duplicate;
- последующая reconciliation должна установить фактический результат, когда это возможно.

Недоступность внешней системы не изменяет молча уже признанные предметные факты. Timeout, retry strategy, circuit breaker и техническое хранение состояния относятся к Stage K.

### 15. Reconciliation

Reconciliation в Stage J обозначает context-specific сопоставление известных состояний и сведений для установления результата внешнего взаимодействия или разрешения расхождения.

Она не является универсальным workflow, state machine или предметной сущностью. Конкретный контекст определяет сравниваемые сведения, допустимые источники, правила признания и последствия.

### 16. Authority и source of truth

### Communications and Governance boundaries

### Документы и формализация

Внешний файл не становится документом автоматически. External signature verification или сведения внешней системы подписи не тождественны предметному Signing. External storage location не является Document identity.

Technical delivery не является Publication.

### Коммуникации и обращения

Notification остаётся понятием контекста коммуникаций. Информация provider или канала о доставке относится к интеграционной границе и не меняет автоматически предметное уведомление.

Telegram, email и SMS не являются универсальными предметными понятиями Community OS.

### Управление

Внешние сведения о голосовании или протоколе не создают автоматически Voting, Established Result или Governance Decision. Контекст управления сохраняет ownership этих понятий и их recognition.

### Идентичность, полномочия и доступ

---

## 13. ADR-013 — Read Model / Projection and process coordinator

Для dashboards, reports, search, complex read-heavy queries и BFF composition допускаются explicitly published read models/projections.

Каждая projection:

- derived и не является source of truth;
- имеет declared producer/owner;
- имеет определимый Community/tenant scope;
- имеет visibility/authorization semantics;
- имеет declared freshness/consistency expectation;
- является read-only для consumers;
- не используется для command-side mutation domain state;
- rebuildable там, где это допускают source facts и semantics.

Stale projection не может grant Access Right, Power или domain admissibility и не может подтверждать irreversible operation, когда требуется current authoritative state.

BFF, Public API, reports и search используют projection только в пределах её declared semantics. Physical storage, rebuild strategy, indexes и isolation projection относятся к ADR-014; freshness monitoring — к ADR-017.

### 13. Process-specific coordinators

Для действительно complex multi-step process допустим specialized application-level process coordinator.

Coordinator:

- принадлежит конкретному named use case/process;
- не является universal Workflow Engine или universal State Machine;
- не владеет domain facts участвующих modules;
- использует public application contracts и published events;
- хранит только необходимый orchestration progress/context;
- является persistent/resumable для long-running process;
- допускает retry, recovery и idempotent steps, где они требуются;

---

## 14. DOMAIN_MODEL — Communications + Governance + Rules

### Документы, публикации, обращения и коммуникации

## 13. Документы, публикации, обращения и коммуникации

Контексты **«Документы и формализация»** и **«Коммуникации и обращения»** самостоятельны. Связь документа с коммуникационным материалом не объединяет контексты и не передаёт владение их понятиями.

**Документ** имеет стабильную предметную идентичность. **Редакция документа** является исторически определимым состоянием содержания конкретного документа, а **представление документа** — предметно различимой формой выражения конкретной редакции. Документ может существовать без файла и иметь от нуля до нескольких представлений; представление не обязано быть файлом.

```text
Документ ≠ Редакция документа ≠ Представление документа ≠ Файл
```

Вид документа и применимые правила определяют, означает ли изменение правку черновика, новую редакцию того же документа, исправление, замену, отзыв или новый документ. Исторически значимое содержание не переписывается молча. Универсальная сущность содержания документа и общий жизненный цикл документов не вводятся.

**Публикация документа** — отдельный исторически значимый факт, связанный с конкретной редакцией или представлением и определимой аудиторией. Аудитория задаёт открытую предметную направленность публикации или коммуникационного материала и не является закрытым перечнем, правом доступа либо техническим списком аккаунтов.

```text
Документ ≠ Редакция документа ≠ Публикация документа
Публикация ≠ Аудитория ≠ Техническая доставка ≠ Технический доступ
```

**Подписание**, **утверждение**, **регистрация** и **публикация** являются разными предметными действиями. Подписание относится к конкретной редакции или представлению; новая редакция не наследует его автоматически. Регистрация не обязательна для каждого документа и не вводит универсальный реестр или систему нумерации.

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом. Инициатор не обязан быть пользователем системы; универсальный жизненный цикл обращения не вводится.

Обращение не тождественно документу, сообщению, заявке технической поддержки или управленческой процедуре.

**Уведомление** — самостоятельное предметное коммуникационное понятие с определимым содержанием и адресатом или аудиторией. Формирование уведомления не означает его отправку, доставку, получение, прочтение или юридически значимое уведомление. Несколько технических попыток или каналов доставки не создают автоматически несколько уведомлений.

**Новость** и **объявление** являются самостоятельными коммуникационными материалами, а не обязательными видами документа или публикации. Они могут иметь явные связи с документом, редакцией, представлением или публикацией.

**Вложение / приложение** — контекстная роль или предметно значимое отношение коммуникационного материала с документом, редакцией либо представлением. Универсальная идентичность вложения не вводится.

Если действие по своей предметной семантике совершает субъект, должны быть определимы фактически действовавший субъект и, где применимо, основание его действия. Автоматизированный механизм не становится субъектом и не подменяет требуемую атрибуцию.

Документ может оформлять, подтверждать, фиксировать, представлять или быть основанием предмета другого контекста, но не становится этим предметом автоматически. В частности:

- документ не тождествен управленческому решению;
- документ не тождествен финансовому обязательству, начислению, платежу или распределению;
- документ не тождествен показанию, потреблению, результату контрольной сверки, расчётному небалансу или эксплуатационной потере.

Право доступа и технический доступ, доставка и фактическое прочтение, а также публикация и аудитория сохраняют самостоятельную семантику. Сквозная семантика идентичности, полномочий и доступа определена ADR-010; семантические границы интеграций определены ADR-011, а техническая реализация и enforcement относятся к этапу K.


### Управление, процедуры и собрания

## 15. Управление, процедуры и собрания

**Управленческая процедура** — минимальная предметная рамка, которая может связывать инициирование, подготовку, рассмотрение, собрания или иные способы проведения, вопросы, голосования, расчёты, установление результатов, решения и пересмотр там, где это применимо. Она не является универсальным процессом исполнения, обязательной машиной состояний или владельцем всех управленческих фактов; разные виды процедур могут иметь различную предметную структуру.

**Орган управления** — относимый к сообществу орган с предметно определённой компетенцией. Орган управления не тождествен субъекту, пользователю, должности или полномочию. Компетенция органа определяет предметную область, в которой орган вправе действовать, тогда как полномочие конкретного субъекта действовать от имени органа или в его составе является отдельным историческим отношением.

**Собрание** — возможная, но не обязательная часть управленческой процедуры. Процедура может включать одно или несколько мероприятий или периодов проведения, проходить очно, заочно, в смешанной форме либо без физического собрания.

**Вопрос** — самостоятельный предмет рассмотрения там, где управленческая процедура выделяет вопросы. Он не обязан принадлежать физическому собранию и не является обязательным узлом любой процедуры. Вопрос, голосование, расчёт результата, установленный результат и управленческое решение — разные понятия.

Вопрос может не требовать голосования либо иметь одно или несколько связанных голосований. **Голосование** имеет самостоятельную предметную идентичность; каждое конкретное голосование использует одну применимую версию правила и после формирования имеет один исходный снимок прав, где он применим. Разные голосования одного вопроса могут использовать разные версии правил и снимки прав. Повторное голосование является новым, исторически связанным голосованием, а не новой версией или переписыванием предыдущего.

**Повестка** может быть самостоятельным представлением исторически определимого состава и порядка вопросов, если это предусмотрено конкретной процедурой, но не является обязательной универсальной сущностью.

**Кворум** — предусмотренное применимым правилом условие достаточности состава или участия для определённой области процедуры. Правило определяет необходимость, область, исходные данные и способ определения кворума; снимок прав конкретного голосования не является универсальным источником любого кворума. Универсальная модель результата кворума не вводится.

## 16. Право участия

**Право участия** — право субъекта участвовать в определённом контексте участия в объёме, установленном применимыми правилами.

Контекст может относиться к сообществу, собранию, вопросу или иной процедуре; единый обязательный уровень не устанавливается. Право участия имеет субъект, контекст, основание или основания, состояние и определяемый правилами объём участия.

Право участия не является автоматически правом присутствовать, получать материалы, участвовать в обсуждении, подавать голос или правом голоса. Не вводится универсальный реализатор права участия. Фактическое действие определяется общей моделью полномочий и предметно значимых действий.

Право участия и право голоса самостоятельны. Ни одно из них не объявляется универсально обязательным условием другого; их связь задаёт правило конкретной процедуры.

Возможности присутствовать, участвовать в обсуждении, вносить предложение, голосовать, подписывать или устанавливать результат и иные процессно допустимые возможности различаются. Они не образуют обязательного универсального участника или единого пакета прав.

## 17. Правила и версии правил

**Правило** — предметный набор условий, определяющий применимое поведение, результат или порядок выполнения процесса. Правило имеет устойчивую предметную идентичность, объединяющую его редакции во времени, и принадлежит контексту, владеющему его предметным смыслом.

**Версия правила** — конкретная редакция правила. До предметного принятия или публикации редакция может оставаться изменяемым черновиком. Принятая или опубликованная версия неизменяема; изменение её содержания создаёт новую версию того же правила.

Правила и версии правил являются сквозной архитектурной ответственностью, но не образуют универсального централизованного владельца. Содержание и локальная модель правил принадлежат соответствующим предметным контекстам. Не вводится обязательный универсальный Rule-объект, одинаковый для всех контекстов.

Сохраняются различия:

```text
правило
≠ конфигурация
≠ предметный факт
≠ программный код
```

Конфигурация может участвовать в определении допустимости или применимости правила, но не заменяет правило. Предметный факт может быть основанием, входом, действием или результатом процесса. Программный код может реализовывать предметную логику версии, но не является самим предметным правилом автоматически.

Применимая версия определяется предметной политикой соответствующего процесса. Текущая, последняя или наиболее новая версия не считается применимой автоматически. Если процесс заранее зафиксировал версию, появление новой версии само по себе не меняет правило уже начатого процесса, если его предметная семантика явно не предусматривает иного.

Для одного процесса могут быть потенциально применимы несколько правил. Их взаимная исключительность, выбор, приоритет, совместное применение и существенный порядок композиции определяются предметной семантикой процесса. Случайный или скрытый технический порядок исполнения не должен определять предметный результат. Межконтекстная зависимость правил определяется явно там, где она имеет предметный смысл.

Для исторически значимого применения должны быть определимы фактически использованные версии, существенные входы, использованные значения, основания выбора и применимости, а также существенные промежуточные показатели, если они необходимы для объяснимости или предметной воспроизводимости результата. Универсальный полный снимок состояния Community OS и единый журнал применения правил не требуются. Допустимы однозначные исторические ссылки на сведения контекстов-владельцев, если они не ссылаются на изменяемое текущее состояние.

Ретроспективная применимость версии сама по себе не переписывает прошлые действия и результаты и не инициирует автоматический перерасчёт. Перерасчёт, исправление, пересмотр и изменение последствий являются самостоятельными прослеживаемыми предметными действиями соответствующих контекстов и не образуют универсальную операцию Community OS.

Предметная воспроизводимость применения означает возможность на основании исторически определённого контекста объяснить и, когда это требуется семантикой результата, независимо проверить его получение. Она не требует повторного запуска той же программной реализации или сохранения исторического технического окружения.

### Правило голосования и право голоса

**Правило голосования** определяет условия формирования прав голоса, основания, реализаторов, веса, варианты ответа, порядок учёта голосов, расчёта и установления результата. Связь права участия с правом голоса определяется применимыми правилами конкретной процедуры.

**Версия правила голосования** — специальная для голосования версия правила. Она сохраняет гарантии общей концепции версии и специальные инварианты ADR-001. Каждое конкретное голосование использует одну применимую версию; разные голосования одного или разных вопросов могут использовать разные версии. Если версия опирается на конфигурацию, она должна ссылаться на исторически определённое состояние её предметно значимых частей.

**Право голоса** существует в контексте конкретного вопроса и голосования. Оно имеет одно или несколько оснований, использованные значения, вес, состояние возможности реализации и реализатора при наличии.

Основание отвечает, почему право, вес или реализатор допустимы. Использованное значение — конкретные сведения, применённые к правилу: например, площадь, доля, статус или дата действия отношения. Основание и использованное значение не тождественны.

Вес может быть `0`, целым или дробным, если это допускает правило. Вес `0` не равен отсутствию права. Тип, точность, диапазон, округление, суммирование и возможная нормализация определяются правилом; ядро не задаёт универсальную сумму весов.

Кардинальность прав определяется правилом. Один субъект может иметь несколько самостоятельных прав голоса, которые не объединяются автоматически. Несколько собственников объекта также не создают автоматически несколько прав голоса.

**Реализатор права голоса** — специальное понятие модели голосования: субъект, фактически реализующий конкретное право. Одно право имеет не более одного одновременно фактического реализатора; один субъект может реализовывать любое число разных прав. Отсутствие реализатора не уничтожает право.

---

## 15. TERMINOLOGY — existing neighboring terms

### Governance / Document / Communications

# 34. Орган управления

**Орган управления** — относимый к сообществу орган с предметно определённой компетенцией.

Орган управления не тождествен субъекту, пользователю системы, должности или полномочию. Компетенция органа и полномочие конкретного субъекта действовать от имени органа или в его составе — разные понятия. Участие субъекта в органе управления является отдельным историческим отношением.

Примеры:

- председатель;
- правление;
- общее собрание;
- другие органы.

---

# 35. Собрание

**Собрание** — возможная, но не обязательная часть управленческой процедуры, представляющая предметно значимое мероприятие или период проведения.

Управленческая процедура может включать одно или несколько собраний либо проходить без физического собрания. Собрание может быть очным, заочным, электронным или смешанным в соответствии с применимыми правилами.

---

# 36. Голосование

**Голосование** — самостоятельный предметный контекст выражения допустимых позиций по конкретному вопросу на основе относящихся к нему прав голоса.

Голосование связано с правами голоса и их весами и использует одну применимую версию правила голосования. В зависимости от применимых правил оно также может быть связано с:

- правами участия;
- вариантами ответа;
- результатами.

---

# 37. Право голоса

**Право голоса** — самостоятельное понятие предметной модели: право выразить позицию по конкретному вопросу конкретного голосования с определённым весом.

Право голоса формируется в контексте конкретного голосования согласно применимой версии правила. Оно может иметь одно или несколько оснований, вес, реализатора при его наличии и состояние возможности реализации.

Право собственности, пользователь системы и право участия не являются правом голоса. Один субъект может быть реализатором нескольких разных прав голоса, но одно право голоса имеет не более одного фактического реализатора. Отсутствие реализатора не уничтожает право автоматически.

Вес права голоса может быть нулевым, целым или дробным. Допустимость веса, точность, диапазон, округление, суммирование и возможная нормализация определяются применимым правилом; универсальная сумма весов не устанавливается. Вес `0` не тождественен отсутствию права.

Правило «1 участок = 1 голос» является примером конфигурации конкретного сообщества, а не универсальным определением права голоса.

---

# 38. Правило голосования

**Правило голосования** — настраиваемое описание условий формирования прав голоса и параметров конкретного голосования: оснований, реализаторов, весов, вариантов ответа, порядка учёта голосов, кворума, расчёта, установления результата и других условий голосования.

Связь права участия и права голоса определяется применимыми правилами конкретной процедуры. Правило голосования не является универсальным источником формирования прав участия.

Правило голосования имеет версии. Конкретное голосование использует одну применимую версию правила; разные голосования, в том числе по одному вопросу, могут использовать разные версии. Изменение правила создаёт новую версию и не меняет ранее использованные версии.

---

# 39. Документ

**Документ** — предметно распознаваемый информационный объект со стабильной идентичностью, относящийся к деятельности сообщества и признаваемый документом согласно семантике его вида и применимым правилам.

Документ не тождествен факту или решению, которое он оформляет или подтверждает. Документ может оформлять, подтверждать или удостоверять основание, факт или решение, а в отдельных случаях сам быть основанием.

Документ может существовать без файла и иметь от нуля до нескольких представлений. Документ, его редакция, представление и файл не тождественны.

Примеры:

- устав;
- протокол собрания;
- решение правления;
- финансовый отчёт;
- отчёт ревизионной комиссии;
- договор;
- заявление.

---

# 40. Публичный документ

**Публичный документ** — документ, для которого применимая предметная семантика предусматривает публичность или публикацию открытой аудитории.

Публичность документа не определяется только отсутствием авторизации или местом в пользовательском интерфейсе и не создаёт техническое право доступа автоматически.

«Публичный документ» является контекстной характеристикой, а не обязательным универсальным подтипом или состоянием документа.

---

# 41. Личный кабинет

**Личный кабинет** — защищённая область системы, через которую пользователь получает доступ к данным и функциям, разрешённым его правами.

Для собственника личный кабинет может содержать:

- объекты собственности;
- лицевые счета;
- начисления;
- платежи;
- задолженность;
- показания приборов учёта;
- документы;
- уведомления;
- голосования;
- обращения.

---

# 42. Обращение

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом.

Инициатор не обязан быть пользователем системы. Обращение не тождественно документу, сообщению, заявке технической поддержки или управленческой процедуре и не имеет обязательного универсального жизненного цикла.

---

# 42.1. Редакция документа

**Редакция документа** — исторически определимое состояние содержания конкретного документа, выделенное как редакция согласно семантике вида документа и применимым правилам.

Не существует универсального критерия, когда изменение является новой редакцией того же документа, а когда исправлением, заменой, отзывом или новым документом. Исторически значимое содержание не переписывается молча.

---

# 42.2. Представление документа

**Представление документа** — предметно различимая форма, в которой конкретная редакция документа выражена, предъявлена или подготовлена для использования.

Представление не обязано быть файлом. Документ может существовать без файла и иметь от нуля до нескольких представлений. Универсальная сущность содержания документа не вводится.

---

# 42.3. Публикация документа

**Публикация документа** — отдельный исторически значимый предметный факт предоставления конкретной редакции документа или её определённого представления определимой аудитории согласно применимым правилам.

Публикация не является универсальным состоянием документа. Отзыв публикации не стирает факт предыдущей публикации. Документ, редакция документа, публикация, аудитория, техническая доставка и технический доступ не тождественны.

---

# 42.4. Аудитория

**Аудитория** — открытая предметная семантика того, кому предназначены документ, публикация или коммуникационный материал.

Аудитория может определяться субъектом, группой или предметным условием либо отношением. Она не является обязательной универсальной сущностью, закрытым перечнем, правом доступа, техническим доступом, доставкой или фактическим читателем.

---

# 42.5. Подписание документа

**Подписание документа** — исторически значимое действие над конкретной редакцией документа или её определённым представлением с определимым подписантом и, где применимо, основанием действия от собственного или чужого имени.

Подписание не тождественно утверждению, регистрации или публикации. Новая редакция не наследует автоматически подписание предыдущей.

---

# 42.6. Утверждение документа

**Утверждение документа** — предметно значимое признание конкретной редакции утверждённой в пределах применимой процедуры и правил, если вид документа предусматривает такое действие.

Утверждение не обязательно для каждого документа и не тождественно подписанию, регистрации, публикации или управленческому решению.

---

# 42.7. Регистрация документа

**Регистрация документа** — допустимое исторически значимое действие признания документа или его редакции зарегистрированными в определённом предметном контексте.

Регистрация не обязательна для каждого документа и не вводит универсальный реестр или систему нумерации. Идентичность документа, регистрационный номер и запись реестра не тождественны.

---

# 42.8. Уведомление

**Уведомление** — самостоятельное предметное понятие контекста коммуникаций с определимым содержанием и адресатом или аудиторией, предназначенное сообщить предметно значимую информацию.

Формирование уведомления не тождественно его отправке, доставке, получению, прочтению или юридически значимому уведомлению. Эти понятия не образуют обязательный универсальный жизненный цикл.

---

# 42.9. Новость и объявление

**Новость** и **объявление** — самостоятельные коммуникационные материалы сообщества, которые не являются автоматически документами или публикациями документов.

Они могут иметь явные связи с документом, редакцией, представлением или публикацией.

---

# 42.10. Вложение / приложение

**Вложение / приложение** — контекстная роль или предметно значимое отношение, связывающее обращение или иной коммуникационный материал с документом, редакцией документа или представлением документа.

Вложение не тождественно документу, редакции, представлению или файлу и не получает обязательную универсальную идентичность.

---

# 43. Модуль

### Subject/access distinctions

# 69. Субъект

**Субъект** — физическое лицо, юридическое лицо или иной поддерживаемый носитель прав, обязанностей и полномочий.

Субъект может иметь неполные идентификационные сведения, если имеющихся сведений достаточно для признания конкретного реального лица отдельным субъектом предметных отношений. Неустановленное лицо не представляется фиктивным субъектом: если известно только наличие неизвестного собственника или иного неустановленного лица, отдельный Subject не создаётся.

Последующее дополнение или уточнение сведений о том же субъекте само по себе не создаёт нового субъекта. Совпадение отдельных имён, контактных данных, внешних идентификаторов или иных признаков не является достаточным основанием для автоматического объединения субъектов.

Субъект не является автоматически собственником, членом сообщества, пользователем системы, плательщиком или должником. Эти статусы и отношения определяются в соответствующих контекстах.

Субъект может существовать без пользовательской учётной записи, в том числе участвовать во внешнем взаимодействии или обращении. Заявленная внешняя идентичность, источник сведений, техническая интеграция и установленный субъект не тождественны; внешний идентификатор сам по себе не создаёт субъекта.

---

# 69.1. Техническая идентичность

**Техническая идентичность (Technical Identity)** — идентичность, устанавливаемая технической аутентификацией и используемая системой при операции.

Она не тождественна субъекту, пользовательской учётной записи, предметному полномочию или праву доступа и не объединяется с ними универсальной сущностью Identity.

---

# 69.2. Аутентификация

**Аутентификация (Authentication)** — техническое установление идентичности, используемой системой при операции.

Успешная аутентификация сама по себе не доказывает связь учётной записи с субъектом, собственность, членство, должность, предметное полномочие, представительство, право голоса, предметную допустимость или право доступа.

---

# 69.3. Предметное полномочие

**Предметное полномочие (Domain Power)** — предметно определимая допустимость субъекта действовать в определённой области на применимом основании.

Оно не является универсальной заменой специальных условий предметного контекста и не тождественно представительству, должности, участию в органе управления, компетенции органа, роли доступа, праву доступа или праву голоса.

---

# 69.4. Предметная допустимость

**Предметная допустимость (Domain Admissibility)** — результат применения требований контекста — владельца семантики конкретного действия — к возможности совершить это действие в данных предметных обстоятельствах.

Она не тождественна аутентификации, предметному полномочию, технической авторизации, праву доступа или технической возможности вызвать операцию.

---

# 69.5. Техническая авторизация

**Техническая авторизация (Technical Authorization)** — проверка того, может ли технически идентифицированное взаимодействие выполнить конкретную операцию с учётом необходимых решений и сведений.

Техническая авторизация не владеет предметными правилами и не может преодолеть отрицательный результат обязательной предметной проверки только на основании технического доступа. Универсальная сущность результата авторизации не вводится.

---

# 69.6. Роль доступа

**Роль доступа (Access Role)** — техническая группировка прав доступа.

Роль доступа не является должностью, профессией или трудовым отношением, собственностью, членством, предметным полномочием, представительством, правом голоса или участием в органе управления и сама по себе не создаёт этих отношений.

---

# 69.7. Право доступа

**Право доступа (Access Right)** — возможность технического доступа к данным или функции в применимой области.

Право доступа не тождественно предметному полномочию, предметной допустимости или праву голоса и само по себе не создаёт их.

---

# 69.8. Технический доступ

**Технический доступ (Technical Access)** — техническая возможность использовать данные или функцию системы в результате применимой авторизации.

Технический доступ не доказывает предметную допустимость действия и не создаёт предметное полномочие.

---

# 69.9. Область применимости

**Область применимости (Scope)** — предметно определённая область, ограничивающая применимость полномочия, права доступа или иного основания.

Семантика области принадлежит соответствующему предметному контексту. Универсальный объект авторизации, универсальный идентификатор области и закрытый перечень видов области не вводятся.

---

# 69.10. Предоставление доступа

### Question/result/management procedure semantics

# 99. Вопрос

**Вопрос** — самостоятельный предмет рассмотрения там, где управленческая процедура выделяет вопросы.

Вопрос не является обязательным узлом любой управленческой процедуры и не обязан принадлежать физическому собранию. Он не тождествен голосованию, расчёту результата, установленному результату или решению по вопросу. Вопрос может иметь от нуля до нескольких самостоятельных голосований.

---

# 100. Расчёт результата

**Расчёт результата** — исторически определённое применение правила к эффективному составу прав и голосов.

Технический предварительный пересчёт сам по себе не является расчётом результата в предметном смысле.

---

# 101. Расчётный результат

**Расчётный результат** — результат применения правила к определённому составу прав и голосов.

---

# 102. Установленный результат

**Установленный результат** — исторически значимый результат, предметно зафиксированный для конкретной процедуры на определимом расчётном и ином допустимом основании.

Расчётный результат не становится установленным автоматически. Установленный результат не тождествен управленческому решению и может не привести к его возникновению.

---

# 103. Установление результата

**Установление результата** — предметно значимое действие, которым для процедуры фиксируется установленный результат на определимом расчётном и ином допустимом основании.

Оно отличается от расчёта результата и последующего пересмотра.

---

# 104. Пересмотр результата

**Пересмотр результата** — самостоятельное предметно значимое действие по пересмотру установленного результата в пределах применимых правил.

Он отличается от корректирующей операции и сам по себе не переписывает или отменяет решение по вопросу. Общая семантика пересмотра не требует универсальной самостоятельной сущности пересмотра.

---

# 105. Решение по вопросу

**Решение по вопросу** — частный случай управленческого решения, возникшего по вопросу на допустимом для соответствующей процедуры основании.

Оно не тождественно вопросу, голосованию, установленному результату или документу, которым оформлено.

---

# 106. Значение по умолчанию

**Значение по умолчанию** — значение, предлагаемое при отсутствии явно установленного значения, если предметная семантика соответствующего вида настройки вообще предусматривает значение по умолчанию.

Наличие значения по умолчанию не обязательно для каждой настройки. Оно не означает автоматически эффективного значения; его изменение не изменяет автоматически уже настроенное или ранее использованное значение.

---

# 107. Настроенное значение

**Настроенное значение** — значение настройки, явно установленное для конкретного сообщества или более узкой предметной области применимости.

Настроенное значение не тождественно эффективному или использованному значению.

---

# 108. Эффективное значение

**Эффективное значение** — значение настройки, применимое в соответствующей предметной области и временном контексте.

Эффективное значение не обязано совпадать с настроенным значением. Его применимость определяется предметной семантикой конкретного вида настройки и не предполагает универсального механизма разрешения или универсального языка областей применимости.

---

# 109. Версия правила

**Версия правила** — конкретная редакция правила.

До предметного принятия или публикации редакция может быть изменяемым черновиком. После предметного принятия или публикации версия неизменяема; изменение содержания означает создание новой версии того же правила. Прекращение применимости или замена версии не изменяет её историческое содержание и роль в объяснении прошлых действий и результатов.

Версия правила голосования является специальным термином голосования и сохраняет дополнительные инварианты ADR-001.

---

# 110. Применимость правила / версии правила

**Применимость правила / версии правила** — предметные условия, при которых правило или конкретная версия относится к процессу, операции, периоду или иному предметному случаю.

Применимость определяется семантикой соответствующего процесса и может учитывать время, расчётный период, состояние исходных данных, момент начала процедуры, явно зафиксированный выбор и другие предметно значимые основания. Текущая, последняя или наиболее новая версия не считается применимой автоматически.

Если потенциально применимы несколько правил, их выбор, приоритет или композиция определяются предметной политикой соответствующего контекста. Глобальная иерархия приоритетов правил не вводится.

---

# 111. Применение правила

**Применение правила** — использование конкретной версии правила в конкретном предметном процессе или операции.

Для исторически значимого применения фактически использованная версия и необходимый контекст должны быть исторически определимы. В зависимости от семантики процесса такой контекст может включать существенные входы, использованные значения, основания выбора и применимости, порядок композиции и существенные промежуточные показатели.

Новая или ретроспективно применимая версия не изменяет автоматически ранее совершённое применение, его результат или последствия.

---

# 112. Управленческая процедура

**Управленческая процедура** — минимальная предметная рамка, которая может связывать применимые управленческие действия, собрания или иные способы проведения, вопросы, голосования, установление результатов, решения и пересмотр.

Она не является универсальным процессом исполнения, обязательной машиной состояний или владельцем всех управленческих фактов. Разные виды процедур могут иметь различную предметную структуру.

---

# 113. Компетенция

**Компетенция** — предметно определённая область, в которой орган управления вправе действовать.

Компетенция органа не тождественна полномочию конкретного субъекта действовать от имени органа или в его составе.

---

# 114. Повестка

**Повестка** — самостоятельное представление состава и, где применимо, порядка вопросов управленческой процедуры.

Повестка существует только там, где её предусматривает конкретная процедура, и не является обязательной универсальной сущностью.

---

# 115. Кворум

**Кворум** — предусмотренное применимым правилом условие достаточности состава или участия для определённой области управленческой процедуры.

Правило определяет необходимость, область, исходные данные и способ определения кворума. Снимок прав конкретного голосования не является универсальным источником любого кворума; универсальная сущность результата кворума не вводится.

---

# 116. Позиция

**Позиция** — допустимый по применимой версии правила способ волеизъявления реализатора конкретного права голоса.

Позиция может выражать один или несколько выборов, выбор кандидата или кандидатов, ранжирование либо иной предметно определённый ответ. «Воздержался» является позицией только при наличии такого варианта; неучастие означает отсутствие действительного голоса.

---

# 117. Управленческое решение

**Управленческое решение** — самостоятельный предметный факт определённого управленческого содержания, относимый к компетентному органу и возникший на допустимом для соответствующей процедуры основании.

Решение может возникнуть через голосование, как предусмотренное правилом следствие установленного результата либо без голосования. Оно не тождественно расчёту, установленному результату или документу. Где это существенно, отдельно определимы принятие, вступление в силу, период действия, приостановление, прекращение, отмена и замена решения.

---

# 118. Повторное голосование

**Повторное голосование** — новое самостоятельное голосование, исторически связанное с предыдущим голосованием и причиной повторения, если она предметно значима.

Оно не является новой версией предыдущего голосования и не переписывает его. Повторное голосование использует собственную применимую версию правила и имеет собственный исходный снимок прав, где он применим.

---

# 119. Tenant

### Read Model / Projection

# 130. Read Model / Projection

**Read Model / Projection** — опубликованное derived read-side representation с определёнными producer/owner, scope, visibility и freshness semantics.

Read Model / Projection не является source of truth, частью Domain model или основанием для command-side mutation. Он остаётся отдельной архитектурной категорией и не сливается автоматически с Module Public Contracts или Shared Kernel.

---

# 131. Runtime Host и Workload Class

**Runtime Host** — composition/runtime entry point процесса, запускающий разрешённые application capabilities, но не владеющий domain semantics. **Web/API Host** обслуживает применимые интерактивные transport/API entry points, а **Worker Host** выполняет persistent/background work через те же Application и Domain boundaries без privileged bypass.

**Workload Class** — логическая техническая категория исполнения background work, позволяющая независимо назначать и масштабировать workloads. Она не является bounded context, Functional Module или владельцем данных.

---

# 132. Process Coordinator

---

## 16. Reference evidence — «Мій Дім Online»

### General meeting and informal survey distinction

## 21. Общие собрания

### Факты «Мій Дім Online»

Система позволяет:

- создать событие общего собрания;
- сформировать повестку;
- пригласить всех или часть совладельцев;
- уведомить через личный кабинет;
- отслеживать участие;
- автоматически подсчитывать голоса;
- отображать результаты;
- предоставлять материалы;
- подтверждать выбор через интегрированный Дія.Підпис.

Источник: `MDO-SRC-08`.

### Вывод для Community OS

Функционально это очень близко к нашему контексту коллективного управления, но модель Community OS должна оставаться более строгой:

**собрание → вопрос → правило права голоса → snapshot участников/прав → волеизъявление → результат → протокол.**

### Важный принцип

Дія.Підпис является **механизмом идентификации/подписания**, а не источником права голоса.

Право голоса определяется предметной моделью и правилами сообщества.

---

## 22. Онлайн-опрос ≠ юридически значимое голосование

### Факты внешней системы

В «Мій Дім Online» отдельно существуют:

- онлайн-опросы;
- общие собрания.

Источники: `MDO-SRC-08`, `MDO-SRC-13`.

### Очень полезный вывод для Community OS

Следует сохранять отдельные понятия:

**опрос / сбор мнений** и **формальная коллективная процедура / голосование**.

Опрос может не требовать:

- проверки права голоса;
- кворума;
- юридической фиксации;
- протокола;
- неизменяемого snapshot правил.

Это хороший кандидат для уточнения будущей терминологии управления.

---

### Candidate DM-MDO-04

### DM-MDO-03 — Рекомендованный платёж

Следует ли различать рекомендуемую сумму и обязательное начисление?

**Предварительная рекомендация:** да, если такой сценарий войдёт в scope.

### DM-MDO-04 — Опрос

Нужно ли выделить неформальный опрос отдельно от юридически значимого голосования?

**Предварительная рекомендация:** да.

### DM-MDO-05 — Договор и роль контрагента

Должен ли договор быть связан с универсальным субъектом и ролью, а не только с поставщиком?


---

## 17. Reference evidence — DAH Online

### Announcements / discussions / surveys / voting

## 7. Объявления, обсуждения, опросы и голосования как разные процессы

### Факты DAH

В тарифной модели DAH отдельно перечислены:

- объявления;
- обсуждения;
- опросы;
- голосования.

Источник: `DAH-SRC-04`.

### Полезный сигнал для Community OS

Не следует сводить все механизмы выявления мнения сообщества к юридически значимому голосованию.

Полезно различать как минимум:

```text
Объявление
Обсуждение
Опрос мнения
Формальное голосование
Установленный результат
Управленческое решение
```

Они могут быть связаны, но не тождественны друг другу.

### Кандидат

В Community OS стоит отдельно проработать понятие и бизнес-процесс **неформального опроса**.

Такой опрос может использоваться, например, для:

- предварительного сбора мнений;
- выбора удобной даты;
- определения интереса к проекту;
- консультации с жителями;
- подготовки вопроса к формальной управленческой процедуре.

Результат неформального опроса не должен автоматически становиться решением органа управления или результатом юридически значимого голосования.

**Категория:** кандидат на отдельный бизнес-процесс в коммуникационном / управленческом контексте.

---

### Candidate + “do not turn every survey into voting”

## 22. Новые или недостаточно проработанные кандидаты для Community OS

По итогам анализа DAH выделяются следующие кандидаты.

### 22.1. Запрос на привязку пользователя к субъекту/объекту

**Приоритет: высокий.**

Нужен отдельный бизнес-процесс, который не подменяет право собственности и предметные отношения механизмом авторизации.

### 22.2. Операционная заявка / Work Order

**Приоритет: высокий.**

Следует определить отличие от обращения, связь с инфраструктурой, исполнителями, затратами и результатом работы.

### 22.3. Неформальный опрос

**Приоритет: средний.**

Нужно отделить от юридически значимого голосования и управленческого решения.

### 22.4. Финансовая проекция для собственников и контрольных органов

**Приоритет: высокий.**

Следует определить правила раскрытия, аудиторию и связь с финансовыми фактами.

### 22.5. Подписание юридически/предметно значимых действий

**Приоритет: высокий, но после правового анализа.**

Требуется определить, что именно подписывается, кем, на каком основании, как проверяется подпись и как хранится доказательство.

### 22.6. Multi-community UX

**Приоритет: средний/высокий.**

Предметная архитектура уже допускает сценарий, но пользовательский контекст активного сообщества должен быть очевиден и безопасен.

### 22.7. API-first режим поверх внешней учётной системы

**Приоритет: стратегический / после первого внедрения.**

Особенно интересен для управляющих компаний и организаций, не готовых мигрировать бухгалтерию.

---

## 23. Что не следует переносить автоматически

### 23.1. Не отождествлять подтверждённого пользователя с собственником

Подтверждение доступа правлением не должно автоматически создавать или изменять право собственности.

### 23.2. Не делать роли интерфейса фундаментальными сущностями

«Правление», «бухгалтер», «ревизор», «житель» полезны для UX, но не заменяют субъектов, органы, должности, полномочия и права доступа.

### 23.3. Не превращать любой опрос в голосование

Неформальный сбор мнений не должен автоматически иметь юридические последствия.

### 23.4. Не считать электронную подпись источником права

КЭП может доказывать факт подписания, но право совершить действие определяется предметными правилами.

### 23.5. Не копировать публичность списка должников без правил раскрытия


---

## 18. REFERENCE_CANDIDATE_MATRIX — current Stage 10 state

### REF-GOV-001 row
| REF-GOV-001 | Неформальный опрос ≠ формальное голосование | МДО, DAH | Подготовлен Draft `BP-SURVEY-001`: Survey и Survey Response рассматриваются как самостоятельные понятия контекста «Коммуникации и обращения»; Survey Item имеет stable local identity; Survey ≠ Voting, Survey Response ≠ Vote; Survey Result/Right/Participant/Snapshot/Version не вводятся без дополнительного основания | **В работе (Draft Stage 10)** | Провести independent multi-review; проверить identity/ownership, response-unit/admissibility, anonymity/history, replacement-vs-versioning, external-channel recognition и границу с Governance; затем выполнить минимальную нормативную синхронизацию |
| REF-GOV-002 | Электронное участие в собрании и доказательство волеизъявления | DAH, МДО | Канал подачи не меняет природу голоса; управление и подписание разделены; техническое/правовое доказательство удалённого участия не определено | **Отложен** | После исследования электронной подписи описать специализированный процесс удалённого участия |
| REF-INT-001 | Экспорт канонических операций в BAS/BAF с устойчивыми идентификаторами | МДО | ADR-006/011 фиксируют границу внешней бухгалтерии и semantic contract; конкретный контракт отсутствует | **Backlog** | Проектировать отдельный integration semantic contract, не копируя модель BAS/BAF |

### Stage 10 block
### Этап 10. Неформальный опрос

**Состояние:** в работе; подготовлен Draft `BP-SURVEY-001 — Неформальный опрос / Informal Survey`.

**Источники:** МДО + DAH.

Stress-test текущей модели дал рабочее направление:

- Survey является самостоятельным identity-bearing понятием контекста «Коммуникации и обращения»;
- Survey Response является самостоятельным исторически различимым фактом;
- Survey Item имеет stable local identity within Survey, но не объявляется fundamental top-level entity;
- response unit, acting Subject/User и technical access различаются;
- Survey audience ≠ response eligibility ≠ technical access;
- Survey ≠ Voting, Survey Response ≠ Vote;
- Survey aggregation ≠ Established Result ≠ Management Decision;
- universal Survey Result / Survey Right / Survey Participant / Survey Eligibility Snapshot / Survey Version пока не вводятся;
- materially significant Survey definition не должна silent-rewrite уже принятые Responses; baseline Draft предпочитает replacement Survey вместо преждевременного universal versioning.

**Следующий шаг:** independent multi-review Draft, затем adjudication и минимальная нормативная синхронизация. До review эти положения не считаются окончательно принятыми.


---

## 19. Review discipline

При review:

- отличай реальный semantic conflict от недостаточно точной формулировки;
- не требуй новую сущность только потому, что её удобно хранить отдельно;
- не переносить Voting semantics в Survey без предметного основания;
- не переносить Survey semantics в Governance;
- не превращать технический токен, callback, form submission, URL, session или UI screen в domain identity;
- не считать текущую статистику самостоятельным historical Result без предметного основания;
- не решать privacy/legal requirements конкретной юрисдикции догадкой;
- при замечании указывай точный раздел Draft и, если есть конфликт, конкретный нормативный источник из этого пакета;
- предпочитай minimal point fix, если фундаментальная модель не требует изменения.

