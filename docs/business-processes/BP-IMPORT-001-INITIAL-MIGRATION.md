# BP-IMPORT-001 — Первоначальная миграция объектов, субъектов, отношений и лицевых счетов

**Статус:** Draft  
**Контекст:** Объекты и отношения / субъекты / финансовые отношения / интеграции  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий документ определяет первоначальную миграцию базовых предметных данных конкретного сообщества в Community OS.

Процесс предназначен прежде всего для первого внедрения в садовом товариществе и должен позволить перенести данные из существующей системы или подготовленного набора данных без создания отдельной упрощённой предметной модели «для импорта».

BP-IMPORT-001 охватывает:

- объекты собственности;
- площадь объектов;
- субъектов;
- отношения собственности;
- отношения пользования, если их смысл достаточно определён источником;
- лицевые счета;
- явные связи лицевых счетов с объектами;
- внешние идентификаторы и сопоставления, необходимые для безопасного повторного импорта;
- staging, validation, mapping, preview, recognition, partial success, provenance и протокол результата.

Процесс не определяет физическую структуру таблиц, формат CSV/XLSX, UI мастера импорта, API, алгоритм fuzzy matching, конкретную схему хранения staging, idempotency key или транзакционную реализацию.

## 2. Основные различия

Для процесса сохраняются следующие различия:

- строка файла ≠ предметная сущность;
- внешнее представление ≠ полученная информация ≠ признанный предметный факт;
- source value ≠ normalized value ≠ mapped value ≠ migration correction;
- matching / identification ≠ domain recognition;
- Object identity ≠ Object designation ≠ external Object ID;
- Personal Account identity ≠ Personal Account number ≠ Object designation ≠ external Personal Account ID;
- Subject ≠ строка ПІБ;
- Ownership ≠ supporting document;
- Ownership ≠ Use;
- import time ≠ effective start of Ownership;
- unknown ≠ 0 ≠ 100% ≠ import date;
- Migration provenance ≠ domain history;
- Retry ≠ Re-import ≠ Re-recognition;
- Redelivery ≠ Duplicate ≠ External correction ≠ Replacement ≠ New information;
- source correction ≠ correction признанного domain fact;
- preview ≠ recognition;
- migration protocol ≠ current source of truth.

Наличие или совпадение одного из перечисленных представлений не создаёт остальные автоматически.

## 3. Границы процесса

Процесс начинается, когда для конкретного Community определён источник первоначальной миграции и получен конкретный source snapshot, предназначенный для обработки.

Процесс заканчивается, когда:

- подтверждённая область миграции обработана;
- признанные результаты зафиксированы соответствующими предметными контекстами;
- непризнанные, конфликтные и требующие решения элементы явно известны;
- сформирован объяснимый итоговый протокол;
- повторная обработка уже признанных результатов не должна создавать дубликаты.

Наличие unresolved, conflict или rejected элементов само по себе не означает, что вся миграция должна считаться неуспешной. Допустимость запуска Community при наличии таких элементов определяется отдельной go-live policy и не является предметом настоящего BP.

## 4. Что входит и не входит в BP-IMPORT-001

### 4.1. Входит

В базовую первоначальную миграцию входят:

1. Property Object и его предметное обозначение;
2. Object Area, если значение доступно;
3. Subject;
4. Ownership;
5. Use, если источник достаточно однозначно подтверждает именно это отношение;
6. Personal Account;
7. связь Personal Account↔Object или Personal Account↔Objects;
8. source-scoped external identifiers и установленные internal↔external mappings;
9. сведения, необходимые для provenance и безопасного re-import.

### 4.2. Не входит

Настоящий BP не мигрирует как предметные факты:

- начальные финансовые балансы;
- исторические начисления;
- Financial Obligations;
- Payments;
- Bank Transactions;
- Debt и Overpayment как исходные первичные факты;
- Meter;
- Meter Installation;
- Accounting Point;
- Meter Reading;
- Consumption;
- ресурсную историю;
- User Account;
- Subject Identity Anchor;
- Access Grant;
- Voting Right.

Эти данные требуют отдельных процессов и своей предметной семантики.

Наличие соответствующих колонок в одном входном файле не меняет границы BP. Один XLSX-файл может содержать данные нескольких предметных процессов без превращения их в одну доменную транзакцию.

## 5. Связанные понятия

Процесс использует уже принятые понятия:

- Community;
- Subject;
- Property Object;
- Object Area;
- Ownership;
- Use;
- Personal Account;
- Financial Obligation;
- external representation;
- external identifier;
- mapping;
- validation;
- domain recognition;
- provenance;
- correction;
- правило и его версия;
- использованное значение;
- историческая прослеживаемость.

В рамках BP дополнительно используются рабочие понятия:

**Source** — определимый источник миграционных данных: legacy-система, конкретный набор данных, migration package или иная область происхождения. Имя файла само по себе не обязано быть устойчивой идентичностью Source.

**Source Snapshot** — конкретное полученное внешнее представление или версия набора данных, использованная в одной обработке.

**Staging** — промежуточное состояние полученной и интерпретируемой миграционной информации до предметного recognition.

**Migration Policy** — применимый к конкретной миграции набор правил интерпретации, допустимости, dependency и confirmation. Это рабочее понятие BP, а не универсальная самостоятельная сущность платформы.

**Migration Item Result** — результат обработки отдельного предметно значимого кандидата или зависимой группы кандидатов. Он не является универсальной доменной сущностью.

Эти рабочие понятия не создают отдельный Import bounded context и не становятся владельцами признанных предметных фактов.

## 6. Участники

В процессе могут участвовать:

**Инициатор миграции** — участник, начавший первоначальную миграцию конкретного Community.

**Оператор миграции** — участник, выполняющий mapping, identity resolution и ручное разрешение неоднозначностей в пределах своих полномочий.

**Подтверждающий участник** — участник, чьё действие разрешает применение reviewed migration plan, если явное подтверждение требуется.

**Предметный контекст-владелец** — контекст Community OS, который выполняет окончательное recognition принадлежащего ему факта.

Технический исполнитель, parser или worker не становится Subject и не является предметным основанием существования Ownership, Subject или другого факта.

Конкретная authorization policy операторов и подтверждающих участников определяется отдельно.

## 7. Source и Source Snapshot

Для миграции должен быть определим источник данных.

Source не обязан совпадать с:

- внешней юридической стороной;
- Integration Partner;
- файлом;
- именем файла;
- пользователем, загрузившим файл.

Например, source может означать legacy OSBBX конкретного сообщества, а отдельные выгрузки из него — разные Source Snapshots.

Для исторически значимых результатов должно быть возможно установить, какой Source Snapshot использовался при recognition.

Source Snapshot не становится domain owner признанных данных.

## 8. Общая последовательность

Общая семантическая последовательность первоначальной миграции:

```text
Source
→ Source Snapshot
→ parsing / normalization
→ staging
→ identification / matching
→ mapping
→ validation
→ preview
→ confirmation
→ authoritative revalidation
→ domain recognition
→ item results
→ migration protocol
```

Получение файла, его parsing или помещение сведений в staging не изменяет domain state.

## 9. Staging

Staging содержит полученные и интерпретируемые сведения до recognition.

Staging candidate:

- не является Object;
- не является Subject;
- не является Ownership;
- не является Personal Account;
- не является Object Area.

Staging может быть пересобран, отброшен или заменён новым Source Snapshot без domain correction, пока признанные предметные факты ещё не возникли.

Удаление staging после recognition не означает удаление признанных предметных фактов.

## 10. Parsing, normalization, mapping и correction

Процесс различает четыре вида преобразования.

### 10.1. Parsing / normalization

Техническая интерпретация значения без изменения заявленного предметного смысла, например:

- чтение даты;
- нормализация пробелов;
- нормализация представления номера;
- однозначное преобразование единицы измерения при сохранении исходного значения.

### 10.2. Mapping

Интерпретация source-понятия в понятие Community OS, например:

```text
source relation label
→ Ownership
```

Mapping не создаёт domain fact.

### 10.3. Matching / identification decision

Решение, относится ли внешний кандидат к существующей внутренней идентичности либо является основанием для recognition новой.

### 10.4. Migration correction

Явное исправление ошибочного source value в пределах миграционного процесса.

Исходное значение не переписывается молча. Где correction исторически значима, сохраняются как минимум исходное значение, исправленное значение и достаточное основание/атрибуция.

Для значительных исправлений предпочтительным путём может быть новый исправленный Source Snapshot.

## 11. Общие правила identification

Перед созданием новой domain identity процесс должен установить, не относится ли входная информация к уже существующей identity.

Matching является отдельным этапом и не означает recognition.

Возможные результаты identification:

- однозначное сопоставление;
- достаточно сведений для создания новой identity;
- несколько допустимых кандидатов;
- недостаточно сведений;
- конфликт;
- rejection.

Универсальная система весов, confidence score или правило вида «совпало три поля — это тот же Subject» настоящим BP не вводится.

## 12. Идентификация и миграция Property Object

### 12.1. Identity и designation

Внутренняя identity Object не равна designation, external identifier или текущему Owner.

Обозначение участка `25` не является его внутренним ID.

Обозначение может быть строковым. В частности, первое внедрение содержит буквенно-цифровые обозначения участков.

### 12.2. Первый импорт

В пустом Community уникальное designation вместе с типом Object и применимой migration policy может быть достаточным для создания нового Object.

### 12.3. Re-import и populated Community

В существующем Community совпавшее designation означает необходимость проверки существующего Object, а не автоматическое создание нового.

Установленный external mapping должен использоваться прежде повторной эвристической идентификации, если нет оснований считать mapping ошибочным.

### 12.4. Неизвестный собственник

Object может быть признан без известного текущего Owner.

Не создаётся фиктивный Subject «Неизвестный собственник».

## 13. Object Area

Площадь импортируется независимо от Ownership.

Для recognition площади должны быть определимы:

- Object;
- area kind;
- значение;
- единица измерения;
- provenance;
- период применимости, если он известен и предметно значим.

Неизвестная площадь не заменяется нулём.

Migration timestamp не является датой начала действия площади.

Реальное изменение площади и correction ошибочного значения различаются.

Если source предоставляет площадь в одной единице, а процесс использует нормализованную единицу, исходное значение и единица остаются объяснимы.

Object Area может быть успешно признана даже при unresolved Subject/Ownership, если Object идентифицирован и остальные требования выполнены.

## 14. Идентификация Subject

Subject matching является более строгим, чем Object matching.

ФИО, телефон, email, адрес, произвольный legacy-код или внешний идентификатор сами по себе не являются универсально достаточным основанием для автоматического merge.

Для Subject различаются как минимум:

1. надёжно установлен существующий Subject;
2. достаточно сведений для recognition нового Subject;
3. существует несколько кандидатов и требуется resolution;
4. реальное лицо не установлено достаточно — Subject не создаётся;
5. сведения конфликтуют;
6. кандидат rejected.

Сильный ранее установленный mapping из доверенного migration source может повторно использоваться.

Одинаковое ФИО в нескольких строках может формировать candidate grouping, но не доказывает одну identity.

Если внутри файла обнаружены потенциальные дубликаты, они выводятся для resolution, а не объединяются молча.

## 15. Legacy owner presentation

Источник может хранить владельца не как нормализованный Subject, а как legacy owner presentation.

Такое поле может содержать:

- текущее ФИО;
- ФИО предыдущего владельца;
- прежнюю фамилию;
- дополнительное текстовое пояснение;
- приблизительное время смены;
- иной legacy-текст.

Наличие скобок или нескольких имён само по себе не задаёт универсальную семантику.

Source-specific parser может предложить интерпретацию:

- current owner candidate;
- previous owner candidate;
- possible transition period;
- other note.

Предложенная интерпретация остаётся staging information до confirmation/recognition.

Если текущий Owner определим достаточно надёжно, текущий Ownership может быть признан независимо от полноты исторической реконструкции.

Исторический Ownership признаётся только в той мере, в которой source и migration decisions дают достаточные сведения. Неизвестная точная дата не заменяется первым числом известного месяца или import date.

## 16. Ownership

### 16.1. Текущий Owner без даты начала

Если источник достаточно подтверждает текущего Owner, но не содержит дату начала:

- Ownership может быть признан;
- effective start остаётся unknown;
- import time не используется как начало Ownership.

### 16.2. Share

Если source подтверждает Ownership, но не содержит долю, share остаётся unknown.

Unknown share не заменяется 100%.

### 16.3. Co-ownership

Несколько source elements могут привести к:

```text
1 Object
+ несколько Subjects
+ несколько Ownership relations
```

Известные доли могут проверяться на согласованность, но неполнота источника не означает автоматически, что сумма известных и неизвестных долей должна составлять 100%.

Явно противоречивые известные доли одного сопоставимого набора, например 70% + 50%, являются conflict.

### 16.4. Historical Ownership

Надёжные исторические периоды могут быть признаны.

Отсутствие исторических владельцев в source не доказывает отсутствия исторического Ownership.

Реальная передача собственности и correction ошибочного владельца различаются.

Из двух имён без достаточного контекста нельзя автоматически выводить порядок перехода Ownership.

### 16.5. Supporting document

Ownership не равен supporting document.

Отсутствие документа не обязано блокировать migration recognition, если применимая policy признаёт источник и имеющиеся сведения достаточными.

## 17. Use

Use является независимым Subject↔Object relation.

Use не создаёт автоматически:

- Ownership;
- Membership;
- Voting Right;
- Representation;
- Access Grant.

Неоднозначные source labels вроде «проживает», «арендатор?» или свободный комментарий не преобразуются автоматически в Use или Lease.

Один Subject может одновременно иметь Ownership и Use только если оба отношения являются реально признанными фактами. Use не создаётся дублирующе только потому, что Owner фактически пользуется объектом.

## 18. Personal Account

### 18.1. Identity

Internal Personal Account identity, Personal Account number, Object designation и external identifier являются разными понятиями.

### 18.2. Number

Номер Personal Account исторически уникален в пределах Community согласно действующей предметной модели.

Закрытый номер не становится автоматически свободным для нового PA.

### 18.3. Связь с Object

Personal Account относится к Object или группе Objects, а не к текущему Owner.

Legacy row вида:

```text
Owner X / Object 25 / PA 0025
```

не создаёт отношение `PA → Owner X`.

### 18.4. Кардинальности

Один Owner может быть связан через разные Objects с несколькими Personal Accounts.

Универсальная модель не фиксирует `1 Object = 1 PA`.

Один PA может относиться к нескольким Objects, если это соответствует предметной семантике.

Первый профиль СТ может иметь более строгую migration policy `1 plot → 1 active PA`, но это не становится универсальным инвариантом платформы.

### 18.5. Lifecycle

Смена Owner сама по себе не закрывает и не создаёт PA.

Source status «inactive» или аналогичное значение не считается закрытием PA без определённого source mapping.

Re-import не открывает и не закрывает PA молча.

### 18.6. Financial data

Создание или matching Personal Account не импортирует:

- balance;
- debt;
- overpayment;
- obligation;
- payment history.

Если source содержит balance, он остаётся внешней информацией до отдельного финансового migration process.

## 19. External identifiers

External identifier квалифицируется областью source/integration и видом сущности.

Минимальный смысл:

```text
External Source
+ entity kind
+ external identifier
→ candidate internal identity
```

При необходимости Community scope является частью контекста сопоставления.

Одинаковое строковое значение external ID у разных entity kinds или разных sources не означает одну identity.

Один internal Object, Subject или Personal Account может иметь несколько external identifiers.

После успешного recognition установленный internal↔external mapping должен сохраняться и использоваться при re-import.

Один устойчивый external key не должен молча сопоставляться двум внутренним identities.

Если source повторно использует свои keys в разных временных/предметных контекстах, source semantic contract должен задавать необходимую квалификацию.

Номер строки XLSX и случайный порядковый номер могут использоваться как provenance locator, но не считаются устойчивым external identity без отдельного основания.

Изменение external ID не изменяет автоматически domain identity.

## 20. Validation

Validation выполняется на нескольких смысловых уровнях:

1. representation validation;
2. parsing / normalization validation;
3. mapping validation;
4. identity validation;
5. dependency validation;
6. domain validation;
7. batch consistency validation.

Файл может быть синтаксически корректен, но содержать предметно конфликтующий кандидат.

Missing value не является ошибкой, если предметная модель допускает unknown.

Процесс не должен заставлять оператора выдумывать:

- 100% share;
- import date как начало Ownership;
- нулевую площадь;
- фиктивный документ;
- фиктивного Subject.

## 21. Классы проблем preview

В пределах migration preview полезно различать:

**Blocking** — конкретный результат нельзя признать в текущем виде.

**Requires decision** — recognition зависит от явного resolution.

**Information / Warning** — сведения неполны или требуют внимания, но recognition допустим.

Эти классы являются семантикой процесса и не обязаны быть универсальным enum платформы.

Migration policy может усиливать отдельный warning до blocking condition.

## 22. Preview

Preview является планом предполагаемых domain consequences и не изменяет domain state.

Preview должен показывать результаты по предметным кандидатам, а не только статус source rows.

Одна source row может одновременно дать:

- Object: create/reuse;
- Object Area: create/no change;
- Subject: create/match/ambiguous;
- Ownership: create/conflict;
- Personal Account: create/reuse;
- PA↔Object link: create/no change.

Статус «row OK» недостаточен для объяснения такого результата.

Preview должен позволять агрегировать:

- create;
- match/reuse;
- no change;
- ambiguous/unresolved;
- conflict;
- rejected.

Для initial migration первого СТ preview является обязательным этапом процесса.

## 23. Bulk decisions

Однозначные результаты могут подтверждаться массово.

```text
bulk confirm
≠ bulk guess
```

Неоднозначные Subject matches не должны подтверждаться одной кнопкой без явного resolution или заранее определённого допустимого правила.

Source-specific mapping rule может применяться массово, например конкретная source category → определённый domain relation.

Identity decision конкретного человека обычно не является массовым mapping rule.

## 24. Confirmation

Confirmation разрешает исполнение reviewed migration plan.

Confirmation не является предметным основанием Ownership или существования Subject.

Должно быть возможно определить участника, подтвердившего migration plan, либо иной допустимый bootstrap/onboarding mechanism, если применимо.

Технический администратор не получает предметного полномочия подтверждать доменные факты только из факта системной роли.

## 25. Authoritative revalidation и recognition

Между preview и execution domain state может измениться.

Перед recognition выполняется authoritative revalidation.

Если значимое условие preview больше не выполняется, corresponding result не применяется молча.

Безопасный переход `Create → No Change` допустим, если можно однозначно установить, что эквивалентный результат уже признан.

Недопустимо автоматически превращать `Create → Match похожий Object/Subject` только потому, что в Community появился новый похожий кандидат.

Recognition выполняется owning domain context и подчиняется обычным domain invariants.

Import не является privileged CRUD channel, способным обходить предметные правила.

## 26. Partial success и dependencies

Batch и source row не являются универсальными atomic units.

Partial success допускается на уровне независимых предметных результатов при сохранении domain consistency.

Примеры зависимостей:

- Ownership требует recognized Object и recognized Subject;
- Object Area требует recognized Object;
- PA↔Object link требует recognized Object и recognized PA.

Failure или conflict Ownership не обязан блокировать Object, Object Area или PA.

Одновременно partial success не означает «создавать всё, что технически возможно». Migration policy может объединять зависимые кандидаты в recognition group, если создание изолированного результата не имеет предметного смысла.

Recognition group является рабочим понятием процесса, а не фундаментальной domain entity.

## 27. Результаты item processing

Для отдельного migration item различаются как минимум:

- Created;
- Matched / Reused;
- No Change;
- Unresolved;
- Conflict;
- Rejected.

Technical Failed / Not Processed относится к выполнению процесса и не является domain rejection.

Created, Reused и No Change являются различными успешными результатами.

Conflict означает наличие противоречащих сведений или состояния.

Unresolved означает отсутствие достаточного решения или данных.

Rejected означает, что candidate не признан допустимым для recognition в представленном виде.

## 28. Provenance

Для исторически значимого migration result должны быть определимы, где применимо:

- Source;
- Source Snapshot;
- locator исходного элемента;
- полученное source value или представление;
- normalized value;
- mapping/semantic contract version;
- matching decision;
- migration correction;
- validation result;
- recognition result;
- автоматический или ручной характер processing;
- actor и основание ручного значимого решения;
- связь с последующим correction/re-recognition;
- созданная или использованная domain identity.

Не требуется помещать все сведения в единую универсальную Migration Record.

## 29. Migration protocol

После выполнения формируется предметно полезный итоговый протокол.

Протокол должен позволять определить:

- какой Source Snapshot обработан;
- сколько domain candidates создано, reused и не изменено;
- какие элементы остались unresolved;
- какие имеют conflict;
- какие rejected;
- какие не были обработаны из-за technical failure;
- какие фактические результаты отличаются от preview и почему.

Протокол должен давать детализацию до значимого migration item.

Migration protocol объясняет прошлый migration result, но не является текущим source of truth для Objects, Subjects, Ownership или PA.

## 30. Retry

Retry повторяет техническое исполнение того же migration intent после сбоя.

При Retry сохраняется intended recognition и не должно возникать непреднамеренных duplicate effects.

Технические Operation/Attempt, Unknown Outcome, reconciliation и durable execution регулируются ADR-016.

Technical failure не переводит необработанные элементы в Rejected.

## 31. Re-import и Re-recognition

Re-import является новой обработкой внешних данных и отличается от Retry.

Re-import может использовать:

- тот же Source Snapshot;
- новый Source Snapshot;
- новую mapping version;
- новые matching decisions;
- изменившийся domain state.

Каждый значимый re-import/re-recognition должен быть исторически отличим от первоначальной обработки.

Ранее установленный mapping является сильным historical context, но не неизменяемой истиной навсегда.

Повторная обработка успешно признанных элементов не должна создавать duplicate domain identities/facts.

## 32. Corrections

### 32.1. Source correction

Исправление external/source information не переписывает признанный domain fact автоматически.

### 32.2. Matching correction

Исправление:

```text
external candidate
→ wrong Subject/Object
```

не выполняет silent cascade rewrite уже признанных Ownership, PA links или иных domain facts.

### 32.3. Domain correction

Если external correction выявляет ошибку уже признанного domain fact, дальнейшее исправление принадлежит owning domain context.

Реальная смена состояния и correction ошибки различаются.

Re-import не является скрытым механизмом передачи Ownership, reopening PA или массового переписывания истории.

## 33. Завершение первоначальной миграции

Initial migration может считаться обработанной, когда:

- согласованная область Source Snapshot пройдена;
- все successful recognition results зафиксированы;
- unresolved/conflict/rejected элементы известны;
- протокол сформирован;
- безопасное продолжение по оставшимся элементам возможно.

Initial migration не обязана достигать `0 unresolved` для самого факта завершения обработки.

Решение о допустимости go-live при оставшихся проблемах принимается отдельной policy.

После go-live исходный legacy source не становится автоматически master system.

Регулярное повторное приведение Community OS к legacy-Excel является Regular Synchronization и не входит в BP-IMPORT-001.

## 34. Отмена и rollback

До domain recognition staging и preview могут быть отменены или пересобраны.

После recognition универсальная операция `Undo Migration` не вводится.

Признанные domain facts могли уже получить новые связи и последствия. Их исправление или прекращение выполняется соответствующими предметными процессами.

Удаление migration batch или protocol не должно каскадно удалять признанные domain facts.

## 35. Проверочный сценарий первого внедрения: OSBBX → Community OS

### 35.1. Назначение сценария

Экспорт списка владельцев пилотного СТ из OSBBX используется как обязательный acceptance scenario настоящего BP.

Source-specific особенности OSBBX являются проверкой процесса, но не становятся универсальными правилами Community OS.

Персональные данные текущего экспорта не включаются в публичную проектную документацию.

### 35.2. Характеристики текущего Source Snapshot

Проверенный XLSX содержит лист `Власники` с 338 source rows.

В текущем snapshot:

- 338 заполненных Personal Account numbers;
- 338 заполненных owner presentations;
- 338 заполненных plot designations;
- 338 заполненных plot areas;
- 338 уникальных plot designations;
- 338 уникальных Personal Account numbers;
- суммарная представленная площадь — 1449,41 сотки;
- 6 plot designations имеют буквенный суффикс;
- 25 строк содержат телефон;
- 11 строк содержат свободный комментарий;
- email, РНОКПП, паспортные данные, место регистрации, группа, приватизация, категория участка и дополнительные площади в текущем snapshot не заполнены;
- поле зарегистрированных лиц заполнено значением 1 во всех 338 строках;
- 103 owner presentations содержат скобки;
- 9 owner presentations содержат явную временную пометку о периоде/моменте изменения;
- часть owner presentations может содержать ФИО предыдущего владельца.

Пустота перечисленных полей характеризует только текущее состояние заполнения OSBBX и не означает, что importer может игнорировать их в будущих полностью заполненных exports.

### 35.3. Object migration

Все 338 plot designations должны быть допустимы как строковые designations.

Source-specific validation должна поддерживать буквенно-цифровые значения.

При пустом Community текущий snapshot ожидаемо формирует 338 Object candidates.

### 35.4. Object Area migration

Все 338 значений площади должны формировать самостоятельные Object Area candidates.

Единица площади определяется source semantic contract; текущее представление OSBBX для данного набора соответствует соткам.

Контрольная сумма 1449,41 используется как acceptance consistency check текущего snapshot, а не как domain invariant.

Object Area recognition не зависит от успешного Subject matching, если Object признан.

### 35.5. Personal Account migration

В текущем snapshot каждому plot designation соответствует уникальный PA number.

Наблюдаемое source-specific правило:

```text
plot numeric part
→ zero-padded to 4 digits
+ same alphabetic suffix where present
```

выполняется для 338/338 записей.

Это правило используется как consistency check OSBBX source и не становится правилом формирования PA number в Community OS.

### 35.6. Subject и Ownership

OSBBX owner presentation не считается нормализованным именем одного Subject.

В частности, оно может включать текущего и предыдущего Owner либо другую legacy-информацию.

Parser может предложить current/previous owner candidates, но final Subject matching и historical Ownership зависят от validation/resolution.

Совпадающие ФИО в нескольких строках формируют candidate grouping и не объединяются автоматически.

Текущий Owner может быть признан без полной реконструкции предыдущих владельцев.

Если доступна только приблизительная временная пометка, процесс не придумывает более точную effective date.

### 35.7. Неиспользуемые как domain facts source fields

`Зареєстровані особи = 1` не создаёт автоматически Subject, Use, Residence, Membership или Access Grant.

Свободный `Коментар` может участвовать в provenance/resolution, но не создаёт автоматически Ownership, Use, Debt или иной domain fact.

Незаполненные сегодня identification fields должны поддерживаться source adapter в будущей миграции, если к моменту перехода они будут заполнены.

### 35.8. Финансовая информация

Административный UI OSBBX может показывать balance, но проверенный XLSX владельцев не содержит balance column.

Даже если финансовая информация будет получена из другого export/API, она не признаётся BP-IMPORT-001 как Financial Obligation, Debt, Payment или Overpayment.

Финансовое исходное состояние мигрируется отдельным процессом.

### 35.9. Лист Meter data

Лист `Лічильники` текущего файла не входит в BP-IMPORT-001.

Наличие Meter-related rows в том же workbook не превращает их в часть базовой миграции.

Meter, Accounting Point, readings и resource history должны обрабатываться отдельным ресурсным migration process.

### 35.10. Первый запуск

Для новой Community acceptance scenario должен допускать независимый результат:

```text
Objects
Object Areas
Personal Accounts
PA↔Object links
Subjects
Ownership
```

при котором conflicts в Subject/Ownership не блокируют корректно независимые Object/Area/PA results.

### 35.11. Повторный запуск

Повторная обработка идентичного Source Snapshot после successful migration должна:

- не создавать новые Objects для уже mapped Objects;
- не создавать новые PA для уже mapped PA;
- не создавать повторные Object Areas без предметного изменения;
- reuse ранее подтверждённые Subject mappings, если нет основания их пересматривать;
- возвращать Matched/Reused/No Change там, где domain state эквивалентен.

### 35.12. Новый snapshot со сменой владельца

Если новый OSBBX export показывает другого owner presentation для существующего Object, это не является командой автоматического Ownership transfer.

Процесс должен рассмотреть как минимум варианты:

- реальная смена Owner;
- correction ранее ошибочного source;
- stale source;
- ошибочный matching;
- иной конфликт.

До resolution существующее Ownership не переписывается молча.

## 36. Инварианты процесса

1. Source row не является domain entity или domain fact.
2. CSV/XLSX format не определяет предметную модель.
3. Staging не является domain state.
4. Preview не изменяет domain state.
5. Source value, normalized value, mapping и correction различаются.
6. Source information не переписывается молча.
7. Object identity не равна designation.
8. External ID не равен internal identity.
9. External ID квалифицируется source и entity kind.
10. Established external mapping повторно используется, если не признан ошибочным.
11. Re-import не должен заново угадывать identity без основания, если mapping уже установлен.
12. Subject не создаётся для неизвестного неустановленного лица.
13. ФИО, телефон или email сами по себе не являются универсально достаточным основанием для automatic Subject merge.
14. Несколько source rows могут относиться к одному Object или Subject.
15. Одна source row может привести к нескольким независимым domain results.
16. Potential duplicate внутри source не объединяется молча.
17. Import time не является effective start Ownership.
18. Unknown Ownership start остаётся unknown.
19. Unknown share не заменяется 100%.
20. Отсутствие historical data не означает отсутствие historical relationships.
21. Реальная смена Owner и correction различаются.
22. Source не используется для вывода последовательности Owners без достаточных сведений.
23. Ownership может быть признан без известного supporting document, если policy/source дают достаточное основание.
24. Use не равен Ownership.
25. Неоднозначный relation label не преобразуется в ближайший известный relation автоматически.
26. Re-import conflict существующего Ownership не выполняет automatic transfer.
27. Object Area принадлежит Object, а не Owner или PA.
28. Unknown Object Area не заменяется нулём.
29. Реальное изменение Object Area и correction различаются.
30. Personal Account относится к Object/Objects, а не к current Owner.
31. Internal PA identity не равна PA number.
32. PA number не равен Object designation, даже при одинаковом отображаемом значении.
33. Один Owner может быть связан с несколькими PA.
34. Universal model не фиксирует `1 Object = 1 PA`.
35. Closed PA number не переиспользуется автоматически.
36. Re-import не открывает и не закрывает PA молча.
37. Import PA не импортирует financial balance.
38. Imported Ownership не создаёт User Account, Subject Identity Anchor, Access Grant или Voting Right.
39. Unknown допустимое значение не считается validation error.
40. Batch и source row не являются универсальными atomic units.
41. Partial success допускается только при сохранении dependency и domain consistency.
42. Bulk confirmation однозначных результатов не означает bulk guessing неоднозначных identities.
43. Confirmation migration plan не является предметным основанием каждого признанного relationship.
44. Authoritative revalidation выполняется перед recognition.
45. Существенное расхождение с preview не применяется молча.
46. Recognition выполняется обычными domain semantics и не обходит invariants.
47. Created, Reused и No Change различаются.
48. Conflict, Unresolved и Rejected различаются.
49. Technical failure не является domain rejection.
50. Migration provenance не заменяет domain history.
51. Retry не равен Re-import.
52. Re-recognition с новой mapping version исторически отличим от initial recognition.
53. Source correction не переписывает recognized domain fact автоматически.
54. Matching correction не выполняет automatic cascade rewrite domain facts.
55. Migration protocol не является текущим source of truth.
56. Legacy source после go-live не становится автоматически master system.
57. Universal Undo Migration после domain recognition не вводится.
58. Повторная обработка successful elements не должна создавать duplicates.

## 37. Связанные документы

Нормативную основу процесса составляют:

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003 — конфигурация сообщества и исторически значимые настройки;
- ADR-004 — история, предметный аудит и воспроизводимость;
- ADR-005 — правила, версии и историческая применимость;
- ADR-006 — финансовые обязательства, начисления и расчёты;
- ADR-010 — идентичность субъектов и пользовательских учётных записей;
- ADR-011 — интеграционная семантика и внешние представления;
- ADR-012 — Community lifecycle и provisioning;
- ADR-016 — reliable background and integration runtime;
- `BP-ACCESS-001-USER-ACCESS.md`.

Reference-анализы OSBBX и других систем используются как источники наблюдений, но не являются источниками требований.

## 38. Нормативная синхронизация

На момент первого Draft основные правила BP совместимы с действующими DOMAIN_MODEL, TERMINOLOGY и ADR.

Уже выполненная синхронизация Object Area обеспечивает предметное место для миграции площади.

До принятия BP не требуется автоматически изменять DOMAIN_MODEL или TERMINOLOGY только ради рабочих терминов Source Snapshot, Migration Policy, Staging, Migration Item Result или Recognition Group.

После review BP следует отдельно определить, нужны ли точечные нормативные изменения терминологии внешних идентификаторов, миграционной provenance или иных понятий.

Новый ADR не требуется, если review не выявит архитектурного решения, выходящего за рамки действующих ADR-004/005/011/016.

## 39. Вопросы, не решаемые настоящим документом

BP-IMPORT-001 не определяет:

- конкретный XLSX/CSV template;
- обязательный список колонок;
- техническую staging schema;
- fuzzy matching algorithm;
- confidence score;
- idempotency key;
- transaction boundaries;
- UI мастера миграции;
- способ хранения исходного файла;
- retention policy исходных artifacts;
- privacy/access policy для паспортных данных и РНОКПП;
- точную authorization policy migration operator;
- регулярную синхронизацию с OSBBX;
- финансовую миграцию;
- meter/resource migration;
- migration документов;
- go-live readiness criteria;
- предметную модель преобразований Object при разделении/объединении;
- универсальную историю переименования Personal Account number.

## 40. Следующая детализация

После review настоящего Draft требуется:

1. пройти документ на противоречия с действующими ADR и BP-ACCESS-001;
2. определить минимальные точечные изменения DOMAIN_MODEL/TERMINOLOGY, если они действительно нужны;
3. обновить `REFERENCE_CANDIDATE_MATRIX.md` только после принятия BP как рабочей нормативной основы;
4. вынести финансовую миграцию начального состояния в отдельный backlog/process;
5. вынести Meter/Accounting Point/readings migration в отдельный resource migration process;
6. позднее сформировать техническое ТЗ для migration framework и OSBBX source adapter без изменения согласованной предметной семантики.
