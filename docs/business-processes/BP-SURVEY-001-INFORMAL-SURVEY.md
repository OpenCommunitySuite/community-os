# BP-SURVEY-001 — Неформальный опрос / Informal Survey

**Статус:** Draft / Round 1 consolidated / point fixes applied / proposed normative synchronization performed  
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

Создание, публикация или иное предметно значимое действие с Survey требует собственной subject-matter admissibility в Communications context согласно ADR-010. Она может опираться на Domain Power, отношения Subject↔Community, representation, применимые правила или другое достаточное основание и не следует автоматически из technical access.

Response admissibility также принадлежит Communications context. Использование ownership/membership/use и других первичных фактов как входов не делает survey admissibility разновидностью Governance `Право участия` или `Право голоса`.

Принятие модели Survey потребует минимальной нормативной синхронизации ADR-002, DOMAIN_MODEL и TERMINOLOGY: добавить Survey/Survey Response и локальную роль Survey Item в существующий контекст «Коммуникации и обращения», не создавая новый bounded context и не меняя ownership Governance.

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
- acting Subject / инициатором;
- технической User Account, через которую выполнено действие;
- Governance Question;
- Announcement;
- URL/Telegram message id;
- набором текущих ответов.

Атрибуция инициирования/создания Survey и использованная User Account могут быть исторически значимы согласно ADR-004/010, но они не определяют identity Survey.

Повторное проведение похожего или идентичного по тексту опроса является новым Survey, если это новый предметный акт сбора мнений.

## 7. Survey Item

**Survey Item** — локально адресуемый элемент конкретного Survey, по которому ожидается ответ или иное structured input.

Survey Item имеет **стабильную локальную identity внутри Survey**.

Это необходимо, чтобы:

- связать конкретное значение ответа с конкретным item;
- сохранить смысл ранее принятых Responses при изменении порядка отображения;
- отличить удаление/замену item от изменения текста;
- объяснить historical response content.

Stable local identity сама по себе недостаточна для исторической объяснимости. Для принятого Survey Response должно быть восстановимо response-relevant значение соответствующего Item в применимом историческом контексте: формулировка, допустимые варианты/validation и применимость в объёме, необходимом для объяснения ответа и aggregation.

Это не вводит обязательную fundamental `Survey Item Revision` или `Survey Definition Version`. Достаточна локальная история/provenance определения и применимости Item согласно ADR-004/005.

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

Response unit не является скрытым Subject и не создаёт отдельного правоносителя. Связь Response с response unit может при этом косвенно позволять идентифицировать связанного Subject; обещаемый уровень anonymity/privacy поэтому должен быть определён отдельно и не выводится только из отсутствия прямой ссылки Response→Subject.

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

Для accepted Survey Response, где это предметно существенно, должен быть исторически определим достаточный контекст принятого admissibility decision:

- применимая survey policy/rule и её использованная версия, если правила версионируются;
- response unit;
- использованные отношения/основания;
- использованные значения изменяемых входов;
- effective/response time, если он влияет на применимость;
- решение о multiplicity;
- recognition/provenance, достаточные для объяснения принятия Response.

Ссылка только на текущее состояние ownership/membership либо только на идентификатор правила недостаточна, если admissibility зависела от исторически изменяемых значений.

Такой исторический контекст является provenance принятой Response и **не вводит** отдельную fundamental entity `Survey Eligibility Snapshot`.

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
≠ pseudonymous / unlinkable-for-viewers binding
≠ author intentionally not linked / not knowable by Community OS
```

Survey Response может иметь stable identity даже если Subject identity отсутствует или намеренно не связывается.

```text
Survey Response
≠ identifiable Subject required
```

Anonymous/private/pseudonymous modes являются declared survey policy semantics. Они не создают fake Subject и не вводят universal `Anonymous Token` как domain entity.

Анонимность относительно Subject **не означает автоматически** отсутствие response unit. Если policy требует ограничение кратности по response unit, предметно значимая связь с response unit может сохраняться без прямой связи Response→Subject. При этом такая связь может допускать косвенную re-identification; уровень обещаемой anonymity/privacy должен описываться честно и отдельно.

Если Survey является полностью анонимным в том смысле, что Community OS не сохраняет ни Subject binding, ни response-unit/pseudonymous binding, Community OS не может на domain-уровне гарантировать identity/unit-based multiplicity. Такая гарантия либо отсутствует, либо опирается на отдельно определённый trusted technical/integration mechanism. Сам технический token/device fingerprint/cookie не становится domain identity автоматически.

Attribution requirements ADR-010 применяются в том объёме, который требует предметная семантика конкретного Survey; отсутствие требуемой идентификации не должно компенсироваться вымышленным Subject.

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

После появления первого accepted Survey Response нельзя молча менять response-relevant semantics, если это изменило бы смысл, допустимость или сопоставимость уже данных ответов.

К materially significant могут относиться:

- wording Survey Item, если меняется смысл;
- варианты выбора;
- обязательность item;
- interpretation/validation;
- response admissibility;
- multiplicity;
- response unit semantics;
- anonymity/identification semantics;
- период, если изменение влияет на допустимость или interpretation;
- добавление/удаление Item, если это меняет semantics/comparability;
- разделение/объединение Item;
- другие сведения, влияющие на смысл Response.

Материальность определяется **эффектом изменения**, а не названием поля или типом операции.

Не каждое редактирование после первого Response требует replacement Survey. Например, исправление опечатки без изменения смысла, изменение presentation-only сведений или иное non-material изменение может выполняться in-place, если исторически значимое прежнее представление не переписывается молча там, где оно требуется для explainability.

Изменение response period также не является автоматически ни material, ни non-material. Продление/сокращение может выполняться in-place только если applicable survey policy допускает такое изменение и его история/применимость остаются объяснимыми; изменение, меняющее уже возникшую допустимость или интерпретацию Responses, требует более строгой семантики.

Prospective добавление нового независимого optional Item после Responses может быть допустимо без replacement только если policy явно это допускает, Item получает исторически определимую применимость, а aggregation различает «Item ещё не применялся» и «респондент не ответил». В противном случае structural change считается material.

```text
accepted Response exists
+ material Survey definition change
→ no silent rewrite
```

## 19. Почему сейчас не вводится Survey Version

Настоящий BP не вводит fundamental `Survey Version` / `Survey Definition Version`.

Для первого применения используется baseline:

```text
material response-relevant change after Responses exist
→ close/cancel current Survey where applicable
→ create replacement Survey
→ preserve explicit relation/reason
```

При этом локальная история определения Survey/Item, их применимости и non-material changes сохраняется в объёме, необходимом ADR-004/005. Такая историчность сама по себе не требует отдельной universal version entity.

Если будущий реальный процесс потребует продолжать один и тот же Survey через materially different definition states и сопоставлять Responses между ними как Responses одного Survey, необходимость versioned Survey Definition должна быть исследована отдельно.

## 20. Замена Survey

Replacement Survey является новым Survey с новой identity.

Связь replacement фиксируется **только тогда**, когда новый Survey предметно заменяет предыдущий по определимой причине. Новый самостоятельный Survey с похожей темой, формулировкой или вариантами не считается replacement автоматически.

Связь с предыдущим Survey должна быть объяснима там, где замена вызвана:

- ошибкой;
- materially changed wording;
- materially changed options;
- materially changed eligibility;
- materially changed purpose;
- иной значимой причиной.

Предыдущие Responses не переносятся автоматически в новый Survey.

Replacement relation не переписывает и не отменяет историческую identity предыдущего Survey/Responses.

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

## 22.1. Correction ошибочно признанной Survey Response

Respondent-initiated modification/withdrawal следует отличать от исправления ошибочного domain recognition.

Если Survey Response была признана ошибочно — например, из-за ошибочного mapping/validation, неверно применённой multiplicity/admissibility policy или другого установленного дефекта recognition — применимый Communications process может признать такую Response недействительной/исправленной согласно локальной correction semantics.

```text
respondent withdrawal
≠ respondent modification
≠ correction of erroneous recognition
```

Correction:

- не переписывает исходный historical fact молча;
- сохраняет причину, момент и атрибуцию исправления;
- не создаёт новую fundamental `Survey Correction` entity автоматически;
- определяет последствия для current aggregation согласно applicable survey policy.

Если внешняя submission была **ошибочно отклонена до domain recognition**, Survey Response ещё не существует. Последующая переоценка/re-recognition такой received information выполняется согласно ADR-011 и applicable survey recognition semantics; это не correction уже существующей Response.

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

External submission, не прошедшая validation/admissibility/domain recognition, **не создаёт Survey Response**. Если отказ/rejection исторически значим, его provenance сохраняется в объёме, требуемом ADR-011 и применимой privacy policy, без введения новой universal domain entity.

Применяется ADR-011.

## 25. Duplicate / redelivery

Повторная техническая доставка одной внешней submission не создаёт новый Survey Response автоматически.

Но совпадение answer values также не доказывает duplicate, потому что конкретный Survey может допускать несколько Responses.

Конкретный integration semantic contract определяет, какие внешние identifiers/content/version semantics позволяют признать сообщение duplicate/redelivery. Само совпадение external id или текста не является universal rule Community OS.

Изменённая external information также не становится modification Survey Response автоматически. После mapping/validation/re-recognition applicable survey policy определяет, является ли она:

- modification существующей Response;
- новой submission/новой Response;
- correction/re-recognition;
- rejected information.

Duplicate/redelivery semantics должны опираться на конкретный integration semantic contract и survey policy.

## 26. Aggregation

Survey Responses могут использоваться для derived aggregation:

- counts;
- percentages;
- distribution;
- ranking;
- averages where semantically valid;
- text grouping/classification;
- parameterized/weighted analytics where explicitly defined and semantically justified;
- другой defined summary.

Aggregation является производным представлением.

```text
Survey Responses
→ Read Model / Projection
→ counts / percentages / summary
```

Согласно ADR-013 конкретная projection должна иметь declared producer/owner, Community scope, visibility semantics и freshness/consistency expectation.

Пока Survey открыт либо допускает modification/withdrawal/correction Responses, current aggregation должна быть явно трактована как **изменяемый срез as-of/freshness**, а не как Established Result или неизменяемый итог.

Если aggregation использует площади, доли или иные weights/parameters, они:

- не создают `Survey Right` или `Voting Right`;
- не превращают Survey в Voting;
- должны иметь объявленную aggregation semantics;
- при исторически значимом использовании должны позволять определить применимую rule/parameter semantics и использованные значения согласно ADR-004/005.

Weighted/parameterized aggregation является аналитикой Responses, а не скрытым голосованием.

## 27. Survey Result как fundamental entity не вводится

Настоящий BP не вводит universal `Survey Result`.

Причины:

- многие Surveys не имеют единственного «результата»;
- free-text Survey может вообще не иметь meaningful numeric aggregation;
- разные aggregation могут одновременно быть валидными представлениями одних Responses;
- current aggregation может изменяться до закрытия Survey;
- закрытие Survey само по себе не создаёт отдельный Established/Survey Result;
- итоговые показатели являются derived view, если отдельно не формализованы.

Если требуется исторически фиксированный официальный/формализованный отчёт:

```text
Survey + Responses
→ defined reproducible aggregation context
→ Document / Revision / Representation where document semantics are intended
```

Не каждое исторически воспроизводимое summary обязано становиться Document; однако его параметры/as-of/source semantics должны быть определимы, если summary используется как significant basis.

Такой Document/summary не становится source of truth Survey Responses.

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

Если survey summary используется как предметно значимый basis/input Governance, ссылка должна вести на **фиксированное либо исторически воспроизводимое aggregation context/representation** с определимыми source facts, параметрами и as-of semantics. Mutable live projection сама по себе не является достаточным историческим основанием значимого Governance action.

Document может фиксировать такую representation по ADR-009, но не становится source of truth Survey Responses.

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
- возможность нового Subject дать собственный Response и влияние такого Response на current aggregation определяются survey policy.

Если multiplicity задана через response unit (например, один Response на Property Object), policy должна заранее и объяснимо определить последствия изменения связанного ownership/use/membership в активном Survey.

Допустимые предметные варианты могут включать, например:

- ранее accepted Response продолжает занимать response unit до окончания Survey;
- новый eligible Response допускается и становится effective contribution для current aggregation, при сохранении старого Response как historical fact;
- иной явно определённый способ, если multiplicity semantics основана не на статическом unit limit.

Настоящий BP не вводит universal статус вроде `superseded_by_transfer` и не объявляет один вариант обязательным для всех Surveys.

Текущее состояние ownership не переписывает прошлую admissibility, а смена отношения не должна молча менять historical Response или его исходное основание.

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

Полностью публичный и полностью анонимный Survey без Subject/response-unit/pseudonymous binding не может на domain-уровне гарантировать identity/unit-based multiplicity. Если такая кратность требуется, необходима явно определённая binding/admissibility semantics либо trusted external/technical mechanism; device fingerprint/IP/cookie не становятся предметной identity автоматически.

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

Структурная причина различия: Survey задаёт item-level структуру и собственную response/multiplicity/admissibility policy для сбора множества ответов, тогда как Appeal по ADR-009 является направленным предметным обращением от определимого инициатора к адресату и не владеет survey item/multiplicity semantics.

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

Признание конкретного survey report документом и его Document/Revision/Representation semantics принадлежат контексту «Документы и формализация», а не определяются настоящим BP автоматически.

Если Document фиксирует aggregation/as-of snapshot для протокола или другого значимого использования, последующие modification/withdrawal/correction Responses не переписывают историческое содержание уже созданной Revision молча. Document остаётся representation/formalization, а не source of truth Responses.

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

Анонимность не превращает его в технически недоказуемый факт автоматически; уровень provenance и допустимая multiplicity зависят от declared policy/binding semantics.

### 39.7. Ownership changed

Owner A дал Response по Property Object.

Позже owner B получает ownership.

Response A остаётся историческим фактом; B не наследует его identity. Возможность B дать новый Response и его влияние на current aggregation заранее определяет survey policy; прошлый Response не переписывается.

### 39.8. Material edit after responses

После 80 accepted Responses организатор пытается изменить варианты ответа так, что смысл старых values меняется.

Silent rewrite запрещён.

Default — replacement Survey.

### 39.9. Telegram redelivery

Один Telegram callback доставлен дважды.

Вторая delivery не создаёт второй Survey Response автоматически. Конкретный integration semantic contract определяет duplicate/redelivery recognition.

### 39.10. Survey → formal Voting

74% Survey Responses поддержали проект.

Позднее создаётся Governance Question и Voting.

Survey Responses не становятся Votes, 74% не становятся Established Result.

Если summary используется как Governance basis, применяется fixed/reproducible aggregation context, а не mutable live projection.

### 39.11. Free-text Survey

Survey собирает предложения жителей.

Aggregation может быть qualitative/read-model classification либо отсутствовать.

Отдельный Survey Result не требуется.

### 39.12. Printer/document/reporting

Правление формирует PDF summary Survey для заседания.

PDF/Document не становится Survey и не меняет Responses.

Document фиксирует исторически определённое представление/as-of согласно ADR-009.

### 39.13. Добавление Item в открытый Survey

После части accepted Responses организатор хочет добавить новый Item.

Если новый Item materially меняет смысл/comparability анкеты, default — replacement Survey.

Prospective independent optional Item может быть добавлен in-place только если policy это допускает, Item имеет исторически определимую применимость и aggregation отличает «не применялся» от «не ответил».

### 39.14. Correction ошибочно признанной Response

Из-за ошибки mapping/admissibility была признана лишняя Response.

Authorized correction не изображается как withdrawal respondent и не стирает Response молча; сохраняются причина/атрибуция, а current aggregation учитывает correction согласно policy.

### 39.15. Public + fully anonymous Survey

Survey открыт всем и не хранит Subject/response-unit/pseudonymous binding.

Domain не может гарантировать «один Response на человека/объект». Неограниченная multiplicity принимается как semantics либо используется отдельно определённый trusted mechanism без превращения технического surrogate в domain identity.

### 39.16. Weighted analytical aggregation

Survey остаётся неформальным, но Community хочет показать распределение мнений также по площади объектов.

Projection может вычислить parameterized/weighted analytics по явно определённой semantics и historically explainable source values.

Это не создаёт Voting Right, Survey Right или Established Result.

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
41. Accepted Survey Response имеет historically explainable admissibility context where applicable; отдельный Survey Eligibility Snapshot для этого не требуется.
42. Response-relevant Survey Item definition/applicability used by accepted Response исторически объяснима; stable local identity не заменяет эту гарантию.
43. Respondent withdrawal/modification ≠ correction erroneous recognition.
44. Rejected/unrecognized external submission не создаёт Survey Response.
45. Полностью anonymous Response без Subject/response-unit/pseudonymous binding не получает domain-guaranteed identity/unit multiplicity автоматически.
46. Significant Governance use of survey summary опирается на fixed/historically reproducible aggregation context, а не на mutable live projection.
47. Replacement relation не выводится из похожести двух Surveys и существует только при explicit предметной замене.
48. Weighted/parameterized survey aggregation ≠ Voting weight ≠ Survey/Voting Right.

## 41. Нормативные последствия Draft

Independent multi-review Round 1 (Claude + Gemini + DeepSeek) не выявил BLOCKER и не потребовал conceptual redesign. Все три review независимо подтвердили базовую модель `Survey → Survey Item → Survey Response`, ownership в Communications и отказ от преждевременных `Survey Right`, `Survey Participant`, `Survey Eligibility Snapshot`, universal `Survey Result` и universal `Survey Version`.

После adjudication point fixes рабочий архитектурный вывод Stage 10:

- требуется самостоятельное понятие `Survey`;
- требуется самостоятельное понятие `Survey Response`;
- `Survey Item` требуется как stable locally addressable part of Survey, но не как fundamental top-level entity;
- response-relevant historical Item definition/applicability должна быть объяснима без обязательной Survey Definition Version;
- accepted Response сохраняет достаточный historical admissibility provenance без отдельного Survey Eligibility Snapshot;
- respondent modification/withdrawal и correction erroneous recognition различаются;
- universal `Survey Result` не требуется;
- universal `Survey Right` не требуется;
- universal `Survey Participant` не требуется;
- universal `Survey Eligibility Snapshot` не требуется;
- `Survey Version` пока не требуется;
- Survey owner — Communications & Appeals;
- Governance использует только explicit fixed/reproducible Survey summary as basis/input там, где нужна историческая значимость;
- Voting semantics ADR-001/008 не переиспользуются механически для Survey;
- anonymous/private/pseudonymous modes требуют explicit policy semantics и не создают fake Subject/Anonymous Token;
- external channels используют ADR-011 recognition/rejection/duplicate/redelivery semantics.

Следующая нормативная синхронизация должна минимально добавить Survey/Survey Response/Survey Item semantics в ADR-002, DOMAIN_MODEL и TERMINOLOGY без изменения границы bounded contexts.

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

1. independent multi-review Round 1 — завершён;
2. reviewer findings adjudicated; point fixes applied;
3. proposed normative synchronization DOMAIN_MODEL / TERMINOLOGY / ADR-002 — выполнена в Draft PR #71;
4. REF-GOV-001 и Stage 10 status — обновлены;
5. multi-review consolidation — зафиксирована;
6. полный Round 2 не требуется, поскольку synchronization не вводит новую identity/ownership/model semantics;
7. следующий шаг — final consistency/readiness check и решение владельца проекта о принятии/merge PR #71;
8. после принятия Stage 10 переходить к следующему Documentation First этапу, не начиная реализацию без отдельного технического проектирования.

