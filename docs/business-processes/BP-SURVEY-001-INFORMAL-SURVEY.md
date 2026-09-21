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
