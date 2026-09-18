# Claude Independent Review Package — BP-IMPORT-001

**Project:** Community OS  
**Repository:** OpenCommunitySuite/community-os  
**Normative baseline:** `main` at commit `a08ff5ef86333f0804e5730de8b74a67ef0b3dea`  
**Review target:** `docs/business-processes/BP-IMPORT-001-INITIAL-MIGRATION.md`

## 1. Твоя роль

Ты — независимый архитектурный и предметный рецензент. Ты не являешься автором решения и не должен автоматически соглашаться с текстом.

Используй **только содержимое этого review package**. Не утверждай, что видишь GitHub, PR, историю коммитов или другие файлы, если они не включены сюда.

Главная задача — найти реальные противоречия, скрытые смешения понятий, пропущенные существенные сценарии и чрезмерные абстракции. Не перепроектируй Community OS с нуля и не предлагай новую сущность только потому, что её удобно реализовать.

## 2. Контекст проекта

Community OS — универсальная Open Source платформа для управления сообществами собственников: СТ, ОСББ, ЖСК, кооперативами и другими объединениями. Первое внедрение — садовое товарищество.

Ключевые ограничения:
- реальный предметный процесс важнее удобства реализации;
- Ownership, Use, User Access, financial relations и Domain Power — разные отношения;
- первое внедрение: Plot → Personal Account;
- для СТ: 1 участок = 1 голос;
- Bank Transaction ≠ Payment;
- Consumption ≠ Accrual ≠ Supplier Obligation ≠ Community Expense;
- инженерная топология отделена от собственности и лицевых счетов;
- Community OS не копирует BAS/BAF и не является системой регламентированного бухгалтерского учёта;
- external representation / imported row не является domain fact;
- принятые ADR и DOMAIN_MODEL имеют приоритет над удобством конкретного импорта.

## 3. Что нужно проверить

Проведи review полного BP-IMPORT-001 и проверь как минимум следующие вопросы:

1. Не превращается ли BP в запрещённый универсальный Import Workflow.
2. Не появляется ли скрытая отдельная «импортная предметная модель», конкурирующая с owning domain contexts.
3. Сохраняется ли различие matching/identification и domain recognition.
4. Корректно ли обработаны unknown / missing values без подмены 0, 100%, import date и фиктивными сущностями.
5. Не создаёт ли импорт Ownership автоматически User Account, Subject Identity Anchor, Access Grant или Voting Right.
6. Совместимы ли Object/Object Area/Ownership/Use с DOMAIN_MODEL и временной семантикой.
7. Не смешиваются ли Personal Account, Owner, Object и external identifiers.
8. Достаточно ли квалифицирован external ID и безопасен ли re-import.
9. Не нарушает ли partial success предметные зависимости и domain consistency.
10. Достаточно ли различены Preview, Confirmation, Authoritative Revalidation и Recognition.
11. Совместимы ли Retry/Re-import/Re-recognition с ADR-011 и ADR-016.
12. Не превращается ли provenance в универсальный Audit/History Context или обязательное бессрочное хранение чувствительных source artifacts.
13. Правильно ли correction source/matching отделена от correction уже признанных domain facts.
14. Не превращён ли OSBBX-specific acceptance scenario в универсальные правила Community OS.
15. Есть ли внутренние противоречия между разделами BP и его 58 инвариантами.
16. Есть ли существенный сценарий первого внедрения, который BP обязан определить до технического ТЗ, но сейчас не определяет.
17. Есть ли что-либо, что требует нового ADR, а авторы ошибочно оставили на уровне BP.
18. Есть ли что-либо, наоборот, чрезмерно усложнённое и преждевременное.

## 4. Формат ответа

Сначала дай краткое заключение одной из форм:

- **Blocking contradictions found**
- **No blocking contradictions, significant issues found**
- **No blocking contradictions; only local improvements**

Затем таблицу:

| Severity | BP section | Normative source | Finding | Why it matters | Recommended change |
|---|---|---|---|---|---|

Severity используй только:
- **BLOCKER** — противоречит принятой предметной/архитектурной модели или делает BP непригодным;
- **MAJOR** — существенная неоднозначность/пробел до технического ТЗ;
- **MINOR** — локальная формулировка или улучшение объяснимости.

Для каждого замечания:
- укажи конкретный раздел BP;
- укажи конкретный нормативный раздел из этого package;
- разделяй факт противоречия и своё предложение;
- если package недостаточен для вывода, прямо напиши `INSUFFICIENT CONTEXT`, а не додумывай.

После таблицы отдельно ответь:

### A. Что в BP сделано особенно правильно
Назови 3–7 решений, которые действительно защищают архитектуру от типичных ошибок миграции.

### B. Что обязательно исправить до технического ТЗ
Только BLOCKER/MAJOR.

### C. Нужен ли новый ADR
Ответ `да/нет` и почему. Не предлагай ADR только для реализации CSV/XLSX, staging schema, UI, fuzzy matching, idempotency key или transaction boundary.

### D. Проверка OSBBX acceptance scenario
Отдельно проверь, не протекли ли source-specific особенности OSBBX в универсальную модель.

### E. Итог
Можно ли использовать BP-IMPORT-001 как рабочую предметную основу для последующей технической спецификации после учёта замечаний?

Не выставляй баллы и не переписывай весь документ.

---

# SOURCE 1 — Полный BP-IMPORT-001

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

Требование provenance не означает обязательного бессрочного хранения полного исходного файла или всех чувствительных персональных данных. Состав сохраняемых исходных значений, представлений и ссылок должен быть достаточен для требуемой объяснимости конкретного migration result и одновременно подчиняться применимым правилам доступа, защиты и retention.

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
- 8 owner presentations содержат явную временную пометку о периоде/моменте изменения;
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


---

# SOURCE 2 — DOMAIN_MODEL: релевантные нормативные разделы

## 4. Субъект, лицо и пользователь системы

**Субъект** — универсальный участник предметных отношений. В текущей модели субъектом может быть лицо: физическое или юридическое. Иные типы субъектов могут быть добавлены позднее.

Субъект может быть представлен неполными идентификационными сведениями, если имеющихся сведений достаточно для признания конкретного реального лица отдельным субъектом предметных отношений. Неполнота сведений не означает существования условного или фиктивного субъекта. Если известно только наличие неустановленного лица, например неизвестного собственника объекта, субъект не создаётся.

Последующее дополнение или уточнение сведений о том же субъекте само по себе не создаёт нового субъекта. Совпадение отдельных имён, контактных данных, внешних идентификаторов или иных признаков само по себе не является достаточным основанием для автоматического объединения субъектов.

Субъект не становится автоматически собственником, членом сообщества, сотрудником, плательщиком, должником, пользователем системы, участником процедуры или носителем права голоса. Это разные отношения и контексты.

**Пользовательская учётная запись** — средство технического взаимодействия субъекта с Community OS. Субъект может существовать без учётной записи и иметь несколько учётных записей.

Количество учётных записей не создаёт дополнительных предметных прав, прав участия, прав голоса или голосов. Создание, блокировка или прекращение учётной записи сами по себе не изменяют собственность, членство, должность, предметное полномочие, представительство, право голоса и другие предметные отношения субъекта.

Учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет эту связь и после такого использования не перепривязывается другому субъекту. Для другого субъекта используется другая учётная запись. Ошибочная связь исправляется отдельной исторически прослеживаемой корректировкой, которая не меняет атрибуцию уже совершённых значимых действий.

Для устойчивой platform identity и multi-community attribution может использоваться минимальный **Subject Identity Anchor**. Он не является полным профилем субъекта или глобальным каталогом всех субъектов и не создаётся автоматически из импорта либо совпадения контактных данных. Community-specific сведения о субъекте и его предметные отношения принадлежат соответствующему сообществу. Community Subject может существовать без пользовательской учётной записи и без Anchor; связь с Anchor не создаёт cross-community visibility или распространение предметных отношений.

---

## 5. Объекты и отношения субъекта к объекту

**Объект** — элемент предметной модели, который может быть предметом права, отношения, учёта или иного процесса, определённого правилами Community OS. Объект не является обязательным предком всех понятий модели.

**Объект собственности** — специализация объекта, представляющая единицу собственности: участок, квартиру, дом, гараж, машино-место, помещение или иной применимый объект.

Объект собственности имеет устойчивую предметную идентичность, не зависящую от его текущего обозначения, собственника или действующих отношений с субъектами. Смена собственника не создаёт новый объект.

Объект собственности имеет применимый тип и может иметь предметное обозначение в рамках сообщества. Обозначение не является идентичностью объекта и может изменяться без изменения самого объекта. Для действующих объектов обозначение уникально в пределах сочетания сообщества и типа объекта. Внешние и исторические идентификаторы не заменяют внутреннюю идентичность объекта.

Объект собственности может существовать без установленного в Community OS действующего собственника. Такое состояние означает отсутствие достаточных сведений о действующем праве в системе и само по себе не характеризует юридический статус объекта.

**Площадь объекта (Object Area)** — исторически значимая измеряемая характеристика объекта собственности, выражающая площадь определённого вида в установленной единице измерения.

Для одного объекта могут быть применимы несколько видов площади, если это имеет предметный смысл: например, площадь земельного участка, общая площадь помещения, жилая площадь или иной явно определённый вид площади. Вид площади является частью её предметной семантики и не выводится только из типа объекта.

Для площади должны быть определимы, где применимо, объект, вид площади, числовое значение, единица измерения, период применимости, происхождение и основание признания. Неизвестная площадь не заменяется нулём или предполагаемым значением.

Реальное изменение площади и исправление ошибочных сведений о площади являются различными ситуациями и сохраняют требуемую историческую прослеживаемость.

Площадь объекта не является финансовым фактом, тарифом, начислением или правилом. Она может использоваться как исторически значимое входное значение в финансовых, управленческих и других предметных процессах. Если площадь использована при исторически значимом расчёте, должно быть возможно определить фактически использованное значение, его единицу измерения и предметную применимость в контексте этого расчёта.

Прекращение использования или учёта объекта, ошибочное создание объекта и изменение отношений субъектов с существующим объектом являются различными ситуациями. Разделение, объединение и иные преобразования объектов требуют собственной предметной семантики и настоящим документом детально не определяются.

**Отношение субъекта к объекту** — концептуальная общность исторических отношений субъекта и объекта. К ней относятся право собственности, право пользования, аренда и другие поддерживаемые отношения. Это не означает единую техническую сущность или одинаковый набор атрибутов.

**Право собственности** — самостоятельный предметно значимый вид отношения субъекта к объекту собственности. Оно связывает установленного субъекта с объектом собственности и содержит исторически значимые сведения об отношении в объёме, известном и применимом к конкретному случаю.

Для права собственности могут быть значимы доля, период действия, основание возникновения или изменения и документ-основание. Неизвестность отдельных сведений не отменяет существование признанного отношения собственности, если имеющихся сведений достаточно для его предметного признания.

Доля собственности может быть известна или неизвестна. Неизвестная доля не заменяется предполагаемым значением. Неприменимость доли в конкретном предметном процессе также не тождественна неизвестной доле.

Начало периода действия права может быть неизвестно. Технический момент создания записи, импорта или начала эксплуатации Community OS не считается датой возникновения права без соответствующего предметного основания.

Документ-основание не является обязательным условием существования зарегистрированного отношения собственности. Следует различать само право, известное основание, подтверждающий документ, полноту или подтверждённость сведений и их происхождение.

Реальная смена собственника и исправление ошибочных сведений различаются. При смене собственника завершается применимое прежнее отношение и возникает новое. Исправление ошибки сохраняет требуемую историческую прослеживаемость и не должно изображаться фиктивной передачей собственности.

Объект может иметь несколько прав собственности, включая долевые. Право собственности не является правом голоса, но может быть основанием его формирования, определения веса или назначения реализатора, если это предписано правилом.

Пользование является отношением субъекта к объекту, а не отдельным универсальным типом объекта. Не вводится общий обязательный тип «объект пользования».

---

## 8. Основания, сведения и документ

Для предметно значимой информации различаются:

- **основание** — почему факт или отношение имеют предметную силу;
- **источник данных** — откуда получены сведения;
- **действие фиксации** — кто или что зафиксировало сведения в Community OS;
- **подтверждающие сведения** — информация, на которой факт может быть установлен или проверен;
- **документ** — предметно распознаваемый информационный объект со стабильной идентичностью, относящийся к деятельности сообщества и признаваемый документом согласно семантике его вида и применимым правилам.

Эти понятия могут совпадать в конкретной ситуации, но не тождественны. Основание не равно документу. Документ может оформлять или подтверждать основание, удостоверять факт либо быть основанием, если это следует из конкретной ситуации.

Не вводятся обязательные универсальные понятия «доказательство», «предметный факт» или «предметное утверждение». Конкретные отношения сохраняют собственную семантику.

---

## 9. Время, история и конфликтующие сведения

Для исторических отношений используется интервал действия **[start, end)**: начало включительно, конец исключительно; отсутствие конца означает продолжающееся отношение. Эта семантика применяется только там, где имеет предметный смысл. Для отдельных исторических отношений начало периода может быть неизвестно; неизвестность начала не должна заменяться технической датой фиксации или иным предполагаемым значением.

Различаются время действия — когда отношение или состояние имеет предметную силу — и время фиксации — когда информация появилась в Community OS. Момент предметного события может быть отдельной характеристикой, если применимо.

Для исторически значимых изменений должна быть восстановима картина до изменения, содержание изменения, момент изменения и состояние после него. Технический способ хранения не определяется.

Содержание сведений отделяется от оценки их достоверности или применимости. Система может хранить конфликтующие сведения, не признавая их одновременно действительными. Следует различать наличие сведений, признание их применимыми и использование в конкретном действии или расчёте.

Ядро не задаёт глобальную иерархию доверия к источникам. Приоритет источников, требования к подтверждению и разрешение конфликтов определяются правилами соответствующего процесса и должны быть предметно объяснимы.

---

## 10. Лицевые счета и финансовые отношения

**Финансовое обязательство** — базовая единица взаиморасчётов: предметно определённое требование одной стороны финансового отношения к другой исполнить денежное требование на установленном основании. Для обязательства определимы обязанная и управомоченная стороны, сумма и денежная единица, основание и срок исполнения, если он применим. Поддерживаются как обязательства перед сообществом, так и обязательства сообщества перед поставщиками и другими сторонами. Плательщик не обязан совпадать с обязанной стороной, а получатель движения средств не изменяет стороны обязательства автоматически. Это не вводит универсальную модель договоров.

**Лицевой счёт** — финансовый контекст и группировка взаиморасчётов, связанных с объектом или группой объектов. Он не тождествен субъекту, собственнику или пользователю, не создаёт обязательство сам по себе. Баланс лицевого счёта является определимым представлением состояния и не заменяет обязательства, платежи и распределения как первичные источники финансового смысла.

Лицевой счёт имеет собственную устойчивую идентичность и предметный номер. Внутренняя идентичность лицевого счёта, его номер и обозначение связанного объекта собственности являются различными понятиями, даже если их значения совпадают.

Номер лицевого счёта исторически уникален в пределах сообщества: закрытие счёта не делает его номер автоматически доступным для повторного использования.

Связь лицевого счёта с объектом или объектами является явной. На уровне универсальной модели объект собственности не обязан иметь лицевой счёт. Необходимость счёта и применимые ограничения определяются конфигурацией сообщества и финансовыми процессами.

Лицевой счёт относится к финансовому контексту объекта или группы объектов, а не к конкретному собственнику. Смена собственника сама по себе не закрывает лицевой счёт, не требует создания нового и не переносит автоматически финансовые обязательства прежнего собственника на нового. Возможный переход обязательств требует отдельного предметного основания и не выводится из смены собственника автоматически.

Технический доступ к лицевому счёту не означает автоматически право видеть всю его историческую финансовую информацию. Допустимую видимость конкретных финансовых фактов определяет финансовый контекст с учётом сторон обязательств, периода отношений субъектов с объектом, плательщиков, персональных данных и применимых правил раскрытия. Смена собственника не передаёт новому собственнику пользовательскую учётную запись или Access Grant прежнего собственника.

Лицевой счёт имеет собственный жизненный цикл. Закрытие счёта является самостоятельным предметно значимым действием и не означает удаления счёта, его связей или финансовой истории.

**Начисление** — предметно значимое действие определения суммы или изменения финансового результата на основании применимых правил, оснований, входных данных и использованных значений. Оно может создать обязательство, изменить его финансовые последствия, участвовать в формировании нескольких обязательств или иметь иной допустимый результат. Универсальная связь «одно начисление — одно обязательство» не вводится; обязательство может возникнуть и из другого основания.

**Банковский счёт сообщества** — банковский счёт, используемый сообществом для движения денежных средств и являющийся контекстом банковских транзакций. Он не тождествен лицевому счёту, финансовому обязательству или источнику финансирования. Сообщество может использовать несколько банковских счетов. Перевод денежных средств между собственными банковскими счетами сообщества сам по себе не создаёт поступление от внешней стороны, расход сообщества или исполнение финансового обязательства.

**Банковская транзакция** — признанная финансовым контекстом запись о движении денежных средств по банковскому счёту сообщества, установленная на основании банковских сведений и сохраняющая собственную идентичность независимо от её последующей предметной классификации. Для банковской транзакции сохраняются существенные сведения, предоставленные банковским источником, включая направление движения, сумму и денежную единицу, предметное время банковской операции, применимые внешние идентификаторы, сведения о другой стороне и назначение платежа, если они предоставлены.

Банковская транзакция не тождественна платежу собственника, платежу поставщику, поступлению сообщества, расходу сообщества, распределению платежа или бухгалтерской операции. Она может существовать до установления её предметного назначения и оставаться неклассифицированной, если имеющихся сведений недостаточно. Неизвестность назначения или стороны не требует создания фиктивного субъекта, лицевого счёта, обязательства или иной предметной сущности.

Связь банковской транзакции с платежами и иными предметными финансовыми операциями является явной и не предполагается универсально отношением `1:1`. Одна банковская транзакция может подтверждать или агрегировать несколько предметных финансовых операций, а одна предметная финансовая операция может быть связана с несколькими банковскими транзакциями, если это следует из фактического способа движения средств.

Назначение платежа, сведения о плательщике или получателе, идентификаторы и другие сведения банковской транзакции являются входными данными для классификации и сопоставления, но сами по себе не определяют лицевой счёт, обязательство, статью начисления, расход, поставщика или распределение платежа.

Изменение предметной классификации, сопоставления или связанных финансовых операций не изменяет исходное содержание банковской транзакции. Ошибочное сопоставление банковской транзакции с субъектом, платежом, обязательством или иным финансовым назначением исправляется как отдельное исторически прослеживаемое изменение соответствующей предметной связи или операции. Исправление банковских сведений самим банком отличается от исправления их интерпретации Community OS.

**Платёж** — признанный финансовым контекстом факт движения денежных средств между сторонами финансового отношения. Входящий и исходящий платежи определяют направление относительно сообщества; банковский, наличный и иные способы платежа характеризуют форму движения и не меняют модель обязательства. Платёж не тождествен обязательству, начислению, распределению, банковской транзакции, кассовому документу или назначению платежа. Стороны платежа не обязаны совпадать со сторонами обязательства. Лицо, физически принимающее или фиксирующее наличные, не становится автоматически получателем платежа; полномочия такого лица относятся к этапу B.

Банковская транзакция может быть основанием или подтверждением признания платежа, но наличие банковской транзакции само по себе не создаёт платёж и не определяет его предметные стороны или назначение.

**Платёжное намерение** — существующее до платежа описание предполагаемой суммы и распределения. Оно может содержать сведения для QR-кода или платёжной ссылки и устойчивый идентификатор сопоставления, а после признания платежа — использоваться для сопоставления и распределения. Платёжное намерение не является платежом, а предполагаемое распределение не является фактическим; формат QR, интеграционный интерфейс и алгоритм сопоставления здесь не определяются.

**Распределение платежа** — самостоятельное исторически значимое действие или отношение, связывающее сумму платежа с обязательствами либо иными допустимыми финансовыми назначениями. Один платёж может распределяться на несколько обязательств, а одно обязательство — погашаться несколькими платежами. Платёж может быть распределён полностью, частично или не распределён. Назначение платежа может быть входом, основанием или ограничением выбора, но не является распределением; глобальный порядок распределения не вводится.

Подтверждённое распределение не редактируется и не удаляется. Изменение его финансового эффекта выполняется отдельным исторически прослеживаемым перераспределением с сохранением исходного распределения. Перераспределение может затрагивать только необходимую часть суммы, не изменяет исходный платёж и не перестраивает автоматически последующие распределения. Взаимозависимые изменения могут образовывать одно составное предметное действие, если оно имеет общее основание и применяется атомарно при сохранении прослеживаемости составляющих.

**Нераспределённый остаток платежа** ещё не получил окончательного финансового назначения. **Переплата** — признанное финансовое состояние, при котором ранее применённая к исполнению сумма в текущем эффективном состоянии финансовых отношений оказывается избыточной согласно применимой предметной семантике. Само арифметическое превышение суммы платежа над текущими обязательствами или задолженностью не образует переплату автоматически. **Аванс** — признанные средства с назначением для будущих обязательств, которые могут уже существовать либо ещё не возникнуть. Эти понятия не тождественны; аванс не требует искусственного создания обязательства, а его существенное назначение сохраняется.

**Задолженность** — определимое состояние непогашенной части обязательств, а не самостоятельное первоначальное требование. **Просрочка** относится к непогашенной части после наступления срока исполнения; задолженность и просрочка не тождественны.

**Тариф** — исторически значимое условие стоимости или размера финансового результата. Он может быть использованным значением, составной моделью стоимости либо специализированным финансовым правилом. Тариф не является универсально правилом, версией правила или конфигурационным значением и не тождествен полному правилу начисления. Если тариф является правилом, применяется ADR-005. Внешний тариф поставщика и внутренний тариф сообщества не становятся автоматически одним тарифом; их зависимость должна быть предметно определена.

**Пеня** — результат применения соответствующего правила к просроченному обязательству или его части. Она не возникает автоматически из любой задолженности; ставка, база, периоды и округление определяются локальной семантикой.

В финансовом времени различаются, когда это существенно, период и момент начисления, возникновение обязательства, срок исполнения, просрочка, период пени, движение средств, получение сведений, признание банковской транзакции, признание и распределение платежа. Предметный момент исполнения не обязан совпадать с техническим временем обработки. Изменение срока и иных исторически значимых результатов не переписывает прошлое молча.

Исправление исходных данных, перерасчёт, финансовая корректировка, отмена, перераспределение, возврат и пересмотр различаются. Исправление исходного факта не изменяет автоматически уже возникшие финансовые последствия. Перерасчёт является новым применением правил к исторически определённому контексту; возврат — новым фактом движения денег. Универсальная Correction не вводится.

**Статья начисления** классифицирует назначение начисления и не обязана совпадать со статьёй бухгалтерского учёта.

---

## 14. Интеграционные границы

**Внешняя сторона интеграции** должна быть минимально определима в рамках конкретного взаимодействия для происхождения сведений, внешних идентификаторов и семантических контрактов. Она не является субъектом, пользовательской учётной записью, bounded context или универсальной предметной сущностью внешней системы и не получает владение предметной семантикой Community OS.

**Внешний идентификатор** — квалифицированное значение в области конкретной интеграции. Он не является глобальной идентичностью внутреннего объекта и сам её не определяет. Связь внутреннего объекта с внешним идентификатором может быть исторически значима; один объект может иметь разные идентификаторы в разных интеграциях и сообществах. Изменение внешнего идентификатора прибора не меняет идентичность прибора или точки учёта.

```text
Внешняя информация ≠ Полученная внешняя информация ≠ Признанный предметный факт
```

Внешнее представление проходит получение, проверку и контекстное сопоставление, после чего владеющий bounded context признаёт или отклоняет предметный факт и определяет последствия. Получение и сопоставление сами по себе не создают предметный факт; сопоставление не становится автоматически универсальной сущностью или правилом.

Для исторически значимого результата сохраняются достаточные сведения о происхождении и объяснимости: источник, применимый внешний идентификатор, значимые времена и версия семантического контракта или сопоставления, если она могла повлиять на интерпретацию. Это не создаёт глобальную историю интеграций или обязательную универсальную запись.

```text
Повторная доставка ≠ Дубликат ≠ Внешнее исправление ≠ Замена ≠ Новая информация
```

Повторное получение не создаёт новый предметный факт автоматически, а исправление внешнего источника не переписывает молча уже признанный исторически значимый факт. Критерии различия и предметные последствия принадлежат конкретному интеграционному процессу и владеющему bounded context.

Первоначальная миграция, ручной массовый импорт, регулярная синхронизация и операционная интеграция различаются. Строка CSV/XLS или иной элемент входа не является предметным фактом. Составной импорт может иметь результаты отдельных элементов; допустимость частичного успеха либо атомарность определяет конкретный процесс. Повторный запуск должен отличать уже признанные элементы от исправленных, не требуя универсального процесса импорта.

Экспорт не тождествен документу, публикации или доставке. Его историческая значимость определяется bounded context и семантическим контрактом конкретной интеграции. Доставка уведомления сохраняет различия между созданием, отправкой, принятием провайдером, доставкой, получением, прочтением и юридически значимым уведомлением; универсальные сущности доставки не вводятся.

Источник сведений, авторитетный источник конкретных сведений, основание признания, владелец предметного факта и производный результат не тождественны. Авторитет определяется контекстом и областью; глобальная иерархия источников истины и правило «последнее значение побеждает» не вводятся.

Интеграционные границы сохраняют предметные различия: банковская операция не является автоматически банковской транзакцией Community OS, а банковская транзакция не является автоматически платежом, распределением, начислением или финансовым обязательством; бухгалтерский документ внешней системы не является финансовым обязательством Community OS; телеметрический образец не является показанием или потреблением; внешний файл не становится документом; внешние сведения о голосовании не создают голосование, установленный результат или управленческое решение; аутентификация внешним поставщиком идентичности не создаёт субъекта, предметное полномочие или предметную допустимость.

---

## 20. Профиль первого внедрения — СНТ

Первый профиль Community OS — СНТ. Его специализации не являются универсальными правилами.

- объектом собственности для голосования является земельный участок;
- правило «1 участок = 1 голос» создаёт одно право голоса на участок;
- совместная собственность не создаёт дополнительных голосов;
- один из совладельцев может быть назначен реализатором согласно применимому правилу;
- такое назначение не означает представительство остальных совладельцев;
- задолженность сама по себе не ограничивает право голоса;
- варианты ответа могут включать «за», «против» и «воздержался».

Профиль также использует участки, лицевые счета, учёт электроэнергии и воды, инженерные ветви, общие и промежуточные приборы, анализ небалансов и сметное финансирование общих расходов. Для участка, участвующего в финансовом учёте первого профиля, конфигурация предусматривает основной лицевой счёт; это специализация профиля, а не универсальная обязательность лицевого счёта для любого объекта собственности Community OS.

---

## 21. Инварианты и расширяемость

Существенные различия модели:

- субъект ≠ пользователь системы;
- Subject Identity Anchor ≠ субъект, полный профиль субъекта и пользовательская учётная запись;
- сообщество ≠ Tenant, Customer/Billing Account, Subscription и Community Placement;
- пользовательская учётная запись ≠ предметное полномочие, роль доступа и право доступа;
- предметное полномочие ≠ представительство, роль доступа, право доступа и право голоса;
- орган управления ≠ субъект, пользовательская учётная запись, должность и предметное полномочие;
- компетенция органа ≠ предметное полномочие конкретного субъекта;
- автоматизированный механизм ≠ субъект;
- объект собственности ≠ лицевой счёт и инженерная система;
- право собственности ≠ право голоса;
- членство ≠ собственность и право голоса;
- сотрудник ≠ роль доступа;
- право участия ≠ право голоса;
- реализатор ≠ представитель;
- право голоса ≠ голос;
- снимок прав ≠ корректирующая операция;
- расчётный результат ≠ установленный результат;
- установленный результат ≠ решение по вопросу;
- документ ≠ оформляемый им факт или решение;
- документ ≠ редакция документа ≠ представление документа ≠ файл;
- документ ≠ публикация; публикация ≠ аудитория ≠ техническая доставка ≠ технический доступ;
- обращение ≠ документ; уведомление ≠ отправка ≠ доставка ≠ получение ≠ прочтение ≠ юридически значимое уведомление;
- ресурс ≠ инженерная система;
- объект собственности ≠ место потребления ≠ точка учёта ≠ прибор ≠ лицевой счёт;
- точка учёта ≠ прибор; показание ≠ потребление;
- потребление ≠ результат контрольной сверки, расчётный небаланс или эксплуатационная потеря;
- расчётный небаланс ≠ эксплуатационная потеря;
- внешнее или телеметрическое значение ≠ признанное показание;
- потребление ≠ начисление; начисление ≠ платёж;
- финансовое обязательство ≠ начисление, задолженность, расход или платёж;
- задолженность ≠ просрочка;
- банковский счёт сообщества ≠ лицевой счёт;
- банковская транзакция ≠ платёж и распределение;
- платёж ≠ распределение; платёжное намерение ≠ платёж;
- нераспределённый остаток ≠ переплата ≠ аванс;
- смета ≠ фактическое исполнение; источник финансирования ≠ направление использования средств;
- источник финансирования ≠ статья начисления, платёж, банковская транзакция и финансирование расхода;
- направление использования средств ≠ финансирование расхода; целевое направление само по себе ≠ техническое резервирование средств.

Модель должна позволять добавлять типы субъектов, объектов, сообществ, ресурсов, инженерных элементов, начислений, документов, правил и аналитики без изменения фундаментальных понятий. Специализация сообщества не должна требовать отдельной программной системы.

---

---

# SOURCE 3 — TERMINOLOGY: релевантные определения

# 4. Объект собственности

**Объект собственности** — единица собственности в конкретном сообществе, с которой могут быть связаны права собственности, лицевые счета, инженерные подключения, приборы учёта и другие понятия предметной области.

Объект собственности имеет устойчивую предметную идентичность, не зависящую от текущего собственника или обозначения. Смена собственника не создаёт новый объект собственности.

Тип и предметное обозначение объекта являются его характеристиками, а не его идентичностью. Для действующих объектов обозначение уникально в пределах сочетания сообщества и типа объекта. Изменение обозначения не меняет идентичность объекта.

Объект собственности может существовать в Community OS без установленного действующего собственника. Такое состояние означает отсутствие достаточных сведений о действующем праве в системе и само по себе не характеризует юридический статус объекта.

В зависимости от типа сообщества объектом собственности может быть:

- земельный участок;
- квартира;
- жилой дом;
- гараж;
- машино-место;
- коммерческое помещение;
- другой объект собственности.

Для садового товарищества основным объектом собственности является земельный участок.

Пользование является отношением субъекта к объекту, а не видом объекта собственности. Объект собственности не следует смешивать с прибором учёта, лицевым счётом или другим объектом учёта.

---

---

# 4.1. Площадь объекта

**Площадь объекта (Object Area)** — исторически значимая измеряемая характеристика объекта собственности определённого вида, имеющая числовое значение и единицу измерения.

Для одного объекта могут существовать несколько видов площади, если это имеет предметный смысл. Например, для земельного участка может использоваться площадь земельного участка, а для помещения — общая, жилая или другая явно определённая площадь. Вид площади является частью её предметной семантики.

Неизвестная площадь не считается нулевой и не заменяется предполагаемым значением. Реальное изменение площади и исправление ошибочного значения различаются и должны сохранять требуемую историческую прослеживаемость.

Площадь может использоваться как входное и фактически использованное значение в правилах и расчётах, но сама по себе не является правилом, тарифом, начислением или иным финансовым результатом. Если площадь влияет на исторически значимый результат, должно быть возможно определить фактически использованное значение и его единицу измерения.

---

---

# 5. Собственник

**Собственник** — субъект, имеющий действующее право собственности на один или несколько объектов собственности.

Один собственник может владеть несколькими объектами.

Один объект собственности может иметь нескольких собственников.

Собственник и пользователь системы являются различными понятиями.

---

---

# 6. Пользователь системы

**Пользователь системы / Пользовательская учётная запись (User Account)** — средство технического взаимодействия субъекта с Community OS, а не самостоятельный носитель предметных прав. Субъект может существовать без пользовательской учётной записи.

Один субъект может иметь несколько пользовательских учётных записей. Несколько учётных записей одного субъекта не создают дополнительных предметных прав, прав участия, прав голоса или голосов. Создание, блокировка или прекращение учётной записи сами по себе не изменяют предметные отношения субъекта.

Учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет эту связь и после такого использования не перепривязывается другому субъекту. Для другого субъекта используется другая пользовательская учётная запись. Ошибочная связь исправляется отдельной исторически прослеживаемой корректировкой, не меняющей атрибуцию уже совершённых значимых действий.

Субъект, взаимодействующий с системой посредством пользователя, может быть, например:

- собственником;
- членом органа управления;
- бухгалтером;
- кассиром;
- администратором;
- сотрудником;
- другим лицом, которому предоставлен доступ.

---

---

# 7. Лицевой счёт

**Лицевой счёт** — финансовый контекст и группировка взаиморасчётов, связанных с объектом собственности или группой объектов собственности.

Лицевой счёт имеет собственную устойчивую идентичность и предметный номер. Номер лицевого счёта не тождествен обозначению объекта собственности, даже если их значения совпадают.

Номер лицевого счёта исторически уникален в пределах сообщества. Закрытие лицевого счёта не делает его номер автоматически доступным для повторного использования.

Связь лицевого счёта с объектом или объектами собственности является явной. На уровне универсальной модели объект собственности не обязан иметь лицевой счёт; необходимость счёта определяется конфигурацией сообщества и применимыми финансовыми процессами.

Лицевой счёт относится к финансовому контексту объекта или группы объектов, а не к конкретному собственнику. Смена собственника сама по себе не закрывает лицевой счёт, не требует создания нового и не переносит автоматически финансовые обязательства прежнего собственника на нового.

Лицевой счёт имеет собственный жизненный цикл. Закрытие счёта является самостоятельным предметно значимым действием и не означает удаления его идентичности, связей или финансовой истории.

Лицевой счёт не тождествен субъекту, собственнику или пользователю системы.

Технический доступ к лицевому счёту не означает автоматически право видеть всю его историческую финансовую информацию. Допустимая видимость конкретных финансовых фактов определяется финансовым контекстом и применимыми правилами раскрытия.

Само существование лицевого счёта не создаёт финансовое обязательство. Его баланс является определимым представлением состояния и не заменяет обязательства, платежи и распределения как первичные источники финансового смысла.

Лицевой счёт должен позволять определить:

- объект или объекты собственности, к которым он относится;
- начисления;
- платежи;
- задолженность;
- переплату;
- связанные правила расчёта.

Один собственник может иметь несколько лицевых счетов.

---

---

# 69. Субъект

**Субъект** — физическое лицо, юридическое лицо или иной поддерживаемый носитель прав, обязанностей и полномочий.

Субъект может иметь неполные идентификационные сведения, если имеющихся сведений достаточно для признания конкретного реального лица отдельным субъектом предметных отношений. Неустановленное лицо не представляется фиктивным субъектом: если известно только наличие неизвестного собственника или иного неустановленного лица, отдельный Subject не создаётся.

Последующее дополнение или уточнение сведений о том же субъекте само по себе не создаёт нового субъекта. Совпадение отдельных имён, контактных данных, внешних идентификаторов или иных признаков не является достаточным основанием для автоматического объединения субъектов.

Субъект не является автоматически собственником, членом сообщества, пользователем системы, плательщиком или должником. Эти статусы и отношения определяются в соответствующих контекстах.

Субъект может существовать без пользовательской учётной записи, в том числе участвовать во внешнем взаимодействии или обращении. Заявленная внешняя идентичность, источник сведений, техническая интеграция и установленный субъект не тождественны; внешний идентификатор сам по себе не создаёт субъекта.

---

---

# 70. Объект

**Объект** — элемент предметной модели, который может быть предметом права, отношения, учёта или иного процесса, определённого правилами Community OS.

Объект собственности является частным случаем объекта. Объект не следует смешивать с субъектом, пользователем системы или правом голоса.

---

---

# 71. Право собственности

**Право собственности** — самостоятельное исторически значимое отношение установленного субъекта к объекту собственности.

Для права собственности могут быть значимы доля, период действия, основание возникновения или изменения и документ-основание в объёме, известном и применимом к конкретному случаю. Неизвестность отдельных сведений не отменяет существование признанного отношения собственности, если имеющихся сведений достаточно для его предметного признания.

Доля может быть известна или неизвестна; неизвестная доля не заменяется предполагаемым значением. Неприменимость доли в конкретном предметном процессе также не тождественна неизвестной доле.

Дата начала права может быть неизвестна. Техническая дата создания записи, импорта или начала эксплуатации Community OS не считается датой возникновения права без соответствующего предметного основания.

Документ-основание не является обязательным условием существования зарегистрированного отношения собственности. Следует различать само право, известное основание, подтверждающий документ, полноту или подтверждённость сведений и их происхождение.

Реальная смена собственника и исправление ошибочных сведений о собственности являются различными предметными действиями. Смена собственника завершает применимое прежнее отношение и создаёт новое; исправление ошибки сохраняет требуемую историческую прослеживаемость и не изображается фиктивной передачей собственности.

Право собственности не является правом голоса. Оно может быть основанием формирования права участия или права голоса, определения веса либо назначения реализатора только в соответствии с применимыми правилами.

---

---

# 85. Отношение субъекта к объекту

**Отношение субъекта к объекту** — концептуальная общность исторических отношений субъекта и объекта. К ней относятся право собственности, право пользования, аренда и другие применимые отношения.

Эта общность не означает единый обязательный набор характеристик для всех таких отношений.

---

---

# 86. Право пользования

**Право пользования** — предметно значимое отношение субъекта к объекту, определяющее допустимость его использования в установленном контексте и периоде.

Право пользования не тождественно праву собственности и не создаёт автоматически право участия или право голоса.

---

---

# 92. Основание

**Основание** — то, почему факт, отношение, право или иной предметный результат имеют предметную силу.

Основание не тождественно источнику данных, подтверждающим сведениям, документу или действию фиксации.

---

---

# 93. Источник данных

**Источник данных** — то, откуда получены сведения, используемые в предметном процессе.

Источник данных не определяет автоматически предметную силу сведений или их применимость.

---

---

# 96. Временная семантика исторических отношений

Для исторических отношений применяется интервал действия **[start, end)**: начало включительно, конец исключительно, отсутствие конца означает продолжающееся отношение. Для отдельных исторических отношений начало периода может быть неизвестно; неизвестность начала не заменяется технической датой фиксации или иным предполагаемым значением.

Различаются время действия — когда отношение или состояние имеет предметную силу, время фиксации — когда сведения появились в Community OS, и момент предметного события, если он применим.

---

---

# 124. Subject Identity Anchor

**Subject Identity Anchor** — опциональный минимальный стабильный platform identity anchor, необходимый для устойчивой multi-community attribution.

Он не является Subject, полным профилем лица или глобальным каталогом всех Subjects, не создаётся автоматически для каждого импортированного Subject и не предоставляет cross-community visibility. Community Subject может существовать без Anchor и без пользовательской учётной записи; Community-specific Subject records остаются у соответствующей Community.

---

---

# SOURCE 4 — ADR-004: история, аудит, provenance

### 1. Владение предметной историей и сквозная ответственность

Предметный аудит Community OS не моделируется как единая универсальная сущность или централизованный журнал предметных изменений.

Исторические факты, действия и результаты принадлежат предметным контекстам, владеющим их смыслом. Сквозная ответственность истории, предметного аудита и происхождения устанавливает следующий минимальный принцип:

> Предметно значимое действие или результат должны иметь объяснимое происхождение в объёме, необходимом для их предметной семантики.

Конкретный состав атрибуции, происхождения и истории определяет соответствующий предметный контекст.

Сквозные требования не означают:

- универсальную Audit Record;
- единый History или Audit Context;
- единый централизованный журнал;
- обязательный одинаковый набор атрибутов для всех действий;
- отдельного владельца всех исторических фактов.

«Предметный аудит» в настоящем ADR обозначает свойство объяснимости предметно значимых действий и результатов, а не самостоятельную сущность предметной модели.

---

### 2. Требуемая историческая гарантия

Для каждого исторически значимого вида предметной информации соответствующий предметный контекст определяет необходимую историческую гарантию:

1. возможность установить состояние на момент времени;
2. возможность проследить значимые изменения;
3. обе возможности.

Различаются вопросы:

```text
Какое состояние существовало на момент T?
≠
Какие значимые изменения привели к этому состоянию?
```

Наличие одной гарантии не означает автоматически наличия или достаточности другой. Не вводится универсальное требование сохранять полную последовательность изменений всех предметных данных.

Например, право собственности, членство и полномочие могут требовать исторического состояния и значимых изменений отношений. Расчётный результат может требовать объяснения входных данных, правила и расчёта. Конкретная гарантия определяется семантикой вида информации, а не единым механизмом её технической реализации.

---

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

---

### 4. Предметная объяснимость и воспроизводимость

#### Explainability

Community OS должна обеспечивать предметную объяснимость исторически значимых результатов. Должно быть возможно определить, на основании каких исторически значимых фактов, сведений, правил, значений, действий и иных существенных оснований был получен результат — в объёме, требуемом его предметной семантикой.

Этот перечень не образует обязательного набора характеристик каждого действия или результата.

#### Domain reproducibility

Если предметный результат является расчётным или иным образом предметно проверяемым, архитектура должна позволять предметно воспроизвести или независимо проверить его на основании исторически определённых входных данных, применимых правил, использованных значений и иных существенных оснований.

Предметная воспроизводимость не требуется для любого факта только потому, что он исторический. Например, право собственности не требуется «пересчитывать», однако его историческое состояние и основания должны быть объяснимы в требуемом предметной семантикой объёме.

#### Technical reproducibility

Предметная воспроизводимость не требует сохранения или повторного исполнения исторической версии программного кода, базы данных, операционной системы, инфраструктуры или другого технического окружения. Способ технического достижения предметной воспроизводимости определяется позднее.

---

### 5. Конфликтующие сведения

Community OS допускает существование конфликтующих предметно значимых сведений. Конфликт не обязан устраняться перезаписью или удалением ранее зафиксированных сведений.

Конкретная модель конфликтующих сведений и разрешения конфликтов принадлежит соответствующему предметному контексту. Сквозно различаются:

1. наличие сведения;
2. признание его применимым или достоверным;
3. использование сведения в конкретном предметном действии или результате.

Эти понятия не тождественны. Если выбор между конфликтующими либо по-разному оценёнными сведениями существенен для действия или результата, должно быть возможно определить, какие сведения фактически использовались и, когда этого требует предметная семантика, на каком основании они были признаны применимыми.

Последующее изменение оценки сведений не переписывает молча историю ранее совершённых действий, которые на них основывались.

Настоящий ADR не вводит универсальные Assertion, Evidence или Conflict Resolution entity.

---

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

---

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

---

### 8. Автоматические действия

Система, сервис, фоновый процесс, интеграционный работник и иной технический механизм не становятся субъектами предметной модели только потому, что выполнили автоматическое действие.

Автоматическое предметно значимое действие может не иметь человеческого действующего субъекта. Если это существенно для предметной семантики, должно сохраняться достаточное происхождение результата: инициирующее предметное действие, применимое правило, использованные значения, применимая конфигурация, источник, время и автоматический характер действия.

Техническая service identity не становится предметным субъектом автоматически.

---

### 9. Внешние источники и происхождение

Сохраняется различие:

```text
внешний источник
≠ основание предметного факта
≠ действие фиксации
≠ действующий субъект
```

Например, банк как источник сведений о платеже не является автоматически основанием финансового обязательства. Импорт банковской операции не тождествен ручному сопоставлению платежа с обязательством.

Источники, основания, документы, подтверждающие сведения и действия фиксации сохраняют самостоятельную предметную семантику. Происхождение не становится отдельным владельцем предметных фактов.

---

## Инварианты

1. Исторические предметные факты, действия и результаты принадлежат контекстам, владеющим их смыслом.
2. Сквозная ответственность истории, предметного аудита и происхождения не является отдельным владельцем всех исторических данных.
3. Предметно значимое действие или результат имеет объяснимое происхождение в объёме, требуемом его предметной семантикой.
4. Для исторически значимого вида информации определяется требуемая гарантия состояния на момент, значимых изменений либо обеих гарантий.
5. Исторически значимое прошлое не переписывается молча; значимые изменения, исправления, переоценки и изменения последствий остаются прослеживаемыми в требуемом предметной семантикой объёме.
6. Специальная корректирующая операция модели голосования не является универсальным механизмом исправления.
7. Расчётный или иной предметно проверяемый результат допускает предметную воспроизводимость в необходимом объёме.
8. Предметная воспроизводимость не требует сохранения старого исполняемого кода или технического окружения.
9. Наличие сведения, признание его применимости и использование в действии или результате различаются.
10. Последующая оценка сведения не переписывает молча историю ранее совершённого действия.
11. Временные измерения применяются, когда этого требует предметная семантика, и не образуют обязательную универсальную bitemporal-модель.
12. Автоматический механизм не становится субъектом предметной модели автоматически.
13. Внешний источник, предметное основание, действие фиксации и действующий субъект не тождественны.
14. Технический журнал не является автоматически источником предметной истины.

---

# SOURCE 5 — ADR-005: правила, версии и историческая применимость

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

---

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

---

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

---

## Архитектурные инварианты

1. Общий семантический контракт правил не создаёт универсальный объект Rule, единый Rule Context или централизованного владельца всех правил.
2. Содержание, типы, применимость и локальные инварианты правила принадлежат контексту, владеющему его предметным смыслом.
3. Правило, конфигурация, предметный факт и программный код не тождественны.
4. Правило имеет устойчивую предметную идентичность; предметный процесс использует конкретную версию правила.
5. Принятая или опубликованная версия неизменяема. Изменение содержания создаёт новую версию.
6. Прекращение применимости или замена версии не изменяет её историческое содержание.
7. Текущая, последняя или наиболее новая версия не считается применимой автоматически.
8. Фактически использованная версия исторически значимого процесса фиксируется либо однозначно определяется из сохранённого контекста.
9. Глобальная иерархия приоритетов правил не вводится; конфликты и композиция разрешаются предметной политикой соответствующего контекста.
10. Скрытый технический порядок исполнения не определяет предметный результат.
11. Исторически значимое применение сохраняет достаточный контекст версии, существенных входов, использованных значений и оснований.
12. Универсальный полный снимок Community OS и универсальный набор полей применения правила не требуются.
13. Новая или ретроспективно применимая версия не переписывает прошлое и не вызывает автоматический перерасчёт.
14. Перерасчёт, исправление, пересмотр и изменение последствий являются отдельными предметно значимыми действиями там, где они предусмотрены.
15. Предметная воспроизводимость не требует повторного исполнения исторической программной реализации или сохранения технического окружения.

---

# SOURCE 6 — ADR-006: финансовые границы и Personal Account

### 3. Финансовое обязательство

**Финансовое обязательство** — базовая единица взаиморасчётов: предметно определённое требование одной стороны финансового отношения к другой исполнить денежное требование на установленном основании.

Финансовое обязательство не тождественно лицевому счёту, начислению, задолженности, платежу, расходу или бухгалтерской проводке.

Допускаются как обязательства перед сообществом, так и обязательства самого сообщества перед поставщиками и другими сторонами. Конкретный жизненный цикл и состояния обязательства определяются локальной семантикой соответствующего финансового процесса; универсальный жизненный цикл не вводится.

---

### 4. Лицевой счёт

**Лицевой счёт** является финансовым контекстом и группировкой взаиморасчётов. Само существование лицевого счёта не создаёт финансовое обязательство.

Баланс лицевого счёта может быть определимым представлением финансового состояния, но не заменяет первичные предметные обязательства, платежи и распределения и не является самостоятельным источником финансовой истины.

---

### 5. Начисление и обязательство

**Начисление** — предметно значимое действие определения суммы или изменения финансового результата на основании применимых правил, оснований, входных данных и использованных значений.

Начисление может:

- создать финансовое обязательство;
- изменить финансовые последствия существующего обязательства, если это допускает процесс;
- участвовать в формировании нескольких обязательств;
- иметь иной допустимый финансовый результат.

Начисление и обязательство являются самостоятельными связанными понятиями. Не вводится универсальная кардинальность «одно начисление — одно обязательство». Обязательство может возникнуть из начисления или иного допустимого предметного основания.

Документ сам по себе не является обязательством. Исторически значимое начисление сохраняет достаточный контекст для объяснимости и предметной воспроизводимости согласно ADR-004 и ADR-005. Позднее изменение тарифа, правила, показаний, конфигурации или других входов не переписывает историческое начисление молча.

---

### 12. Нераспределённый остаток, переплата и аванс

**Нераспределённый остаток платежа** — часть признанного платежа, которая ещё не получила окончательного распределения. Он не является автоматически переплатой или авансом.

**Переплата** — признанное финансовое состояние средств в пользу определённой стороны взаиморасчётов сверх применимых обязательств согласно предметной семантике.

**Аванс** — признанные средства с предметно установленным назначением для полного или частичного исполнения будущих обязательств. Назначение аванса может быть ограничено определённым видом будущих обязательств; универсальная закрытая классификация назначений не вводится.

Будущее обязательство на момент получения средств может уже существовать, но ещё не подлежать исполнению, либо ещё не существовать. В первом случае платёж может быть досрочным исполнением. Во втором случае аванс не требует искусственного создания будущего обязательства. После возникновения обязательства аванс может быть распределён на него согласно применимым правилам и сохранённому назначению.

---

### 14. Задолженность и просрочка

**Задолженность** — определимое состояние непогашенной части финансовых обязательств. Она не является независимым первоначальным требованием.

**Просрочка** относится к непогашенной части обязательства после наступления применимого срока исполнения. До наступления срока задолженность сама по себе не является просроченной.

---

### 18. Изменения финансовых результатов

Исторически значимые финансовые результаты не изменяются посредством silent rewrite. Различаются:

- исправление исходных данных;
- перерасчёт;
- финансовая корректировка;
- отмена;
- перераспределение;
- возврат;
- пересмотр.

Исправление исходных данных или исходного предметного факта не тождественно изменению уже возникших финансовых последствий. Когда предметная семантика требует изменить такие последствия, это выполняется отдельным прослеживаемым действием.

**Перерасчёт** — новое применение соответствующих правил к исторически определённому контексту. Первоначальный расчёт сохраняется.

**Финансовая корректировка** — более общее прослеживаемое изменение финансовых последствий на установленном основании; она не обязана быть перерасчётом. Универсальная Correction не вводится.

Отмена сохраняет историю отменённого результата. Сторнирование не является универсальным механизмом Community OS. Возврат является самостоятельным фактом движения денежных средств, а не изменением первоначального платежа. Перераспределение изменяет распределение, но не исходный факт платежа. Пересмотр является процедурой повторной оценки и сам по себе не обязан изменять финансовое состояние.

Изменение исходного обязательства не переписывает автоматически исторически рассчитанную пеню. Если финансовые последствия должны измениться, это выполняется отдельным прослеживаемым действием с достаточным основанием и историческим контекстом.

Если ошибочное начисление уже оплачено, а затем правомерно уменьшено, исходный платёж остаётся историческим фактом и не переписывается и не уменьшается автоматически. Возникший избыток средств получает дальнейший финансовый смысл согласно применимой семантике, например как переплата, аванс, возврат или иное допустимое состояние; ни один из этих вариантов не является универсально обязательным.

---

### 24. Граница с регламентированным бухгалтерским учётом

Community OS в границах настоящего ADR не является системой регламентированного бухгалтерского или налогового учёта. Финансовые факты Community OS не определяются через бухгалтерские проводки.

План счетов, дебет и кредит, бухгалтерские и налоговые регистры, обязательная отчётность и правила бухгалтерского либо налогового признания не вводятся как основа предметной финансовой модели.

Community OS не является системой складского учёта или бухгалтерского учёта имущества, товарно-материальных ценностей и основных средств. Их жизненный цикл в бухгалтерском смысле находится за границей предметной ответственности Community OS и может вестись во внешней учётной системе.

Физический объект может независимо существовать в Community OS в собственной предметной роли, например как элемент инженерной инфраструктуры. Такая предметная роль не превращает его автоматически в бухгалтерский объект имущества, товарно-материальных ценностей или основных средств Community OS.

Community OS не выполняет регламентированный расчёт заработной платы, налогов, обязательных удержаний и начислений и не формирует регламентированную зарплатную отчётность.

Community OS может сохранять возникающие в её предметных процессах основания и исходные данные для вознаграждений или выплат и экспортировать их во внешнюю учётную систему. Передаётся ли готовая предметно определённая сумма либо сведения о часах, работах или иных основаниях, определяется конкретным бизнес-процессом и integration semantic contract; универсальное правило не вводится.

Настоящее решение не вводит новые bounded contexts «Склад/ТМЦ», «Зарплата» или «Бухгалтерия».

---

### 26. Историчность, provenance и воспроизводимость

Исторически значимые финансовые факты, действия и результаты сохраняют достаточный контекст для объяснимости, provenance и предметной воспроизводимости согласно ADR-004 и ADR-005.

В зависимости от семантики процесса должны быть определимы применённые версии правил, тарифные условия, существенные входы, использованные значения, основания, стороны, суммы, денежные единицы, время, распределения и последующие изменения.

Предметная воспроизводимость не требует сохранения или повторного запуска старого программного кода, базы данных, операционной системы или инфраструктуры. Универсальный event sourcing и глобальный Audit или History Context не вводятся.

---

### 27. Полномочия

Настоящий ADR не определяет права кассира, бухгалтера, председателя, администратора или других пользователей системы.

Полномочия на признание платежа, создание или подтверждение начисления, распределение и перераспределение, корректировку, перерасчёт, возврат и иные финансово значимые действия должны быть согласованы с будущими решениями этапа B «Идентичность, полномочия и доступ».

Субъект и пользователь системы не отождествляются. Модель действующего лица, полномочий и технического доступа уточняется решениями этапа B. Отсутствие завершённого этапа B не изменяет предметную семантику финансовых действий настоящего ADR.

---

## Архитектурные инварианты

1. Финансовое обязательство является базовой единицей взаиморасчётов, но не универсальной моделью любых договорных отношений.
2. Финансовое обязательство не тождественно лицевому счёту, начислению, задолженности, платежу, расходу или бухгалтерской проводке.
3. Начисление и обязательство самостоятельны; универсальная кардинальность между ними не вводится.
4. Задолженность является состоянием непогашенной части обязательств; задолженность и просрочка не тождественны.
5. Плательщик не обязан совпадать с обязанной стороной, а фактический получатель средств не изменяет стороны обязательства автоматически.
6. Каждая исторически значимая денежная сумма имеет определимую денежную единицу.
7. Банковский счёт сообщества не тождествен лицевому счёту, финансовому обязательству или источнику финансирования.
8. Внешняя банковская операция или сообщение не являются автоматически банковской транзакцией Community OS.
9. Перевод между собственными банковскими счетами сообщества не создаёт новый источник финансирования и сохраняет происхождение перемещаемых средств.
10. Банковская транзакция не тождественна платежу, распределению, источнику финансирования, расходу или бухгалтерской операции.
11. Связь банковской транзакции с платежами и иными предметными финансовыми операциями не имеет универсальной кардинальности `1:1`.
12. Платёж не тождествен внешней операции, документу, обязательству, начислению или распределению.
13. Направление платежа и способ платежа не тождественны; наличный платёж является полноценным предметным платежом.
14. Платёжное намерение не является платежом; предполагаемое распределение не является фактическим распределением.
15. Один платёж может иметь несколько распределений, а одно обязательство может погашаться несколькими платежами.
16. Нераспределённый остаток, переплата и аванс не тождественны.
17. Аванс не требует существования будущего обязательства и не создаёт его автоматически.
18. Баланс лицевого счёта является определимым представлением, а не первичным источником финансовой истины.
19. Тариф не является универсально Rule, Rule Version или конфигурационным значением и не тождествен полному правилу начисления.
20. Внешний и внутренний тарифы не становятся одним тарифом и не наследуют изменения автоматически.
21. Расход, обязательство и платёж не тождественны.
22. Смета не тождественна фактическому исполнению; источник финансирования, направление использования средств и финансирование расхода являются различными понятиями; целевое направление само по себе не означает технического резервирования или блокировки средств.
23. Документ не тождествен финансовому факту.
24. Ресурсные факты не изменяются финансовым контекстом ради финансового результата.
25. Исторически значимые финансовые результаты не переписываются молча.
26. Перерасчёт, корректировка, отмена, перераспределение, возврат и пересмотр являются различными действиями там, где они предусмотрены предметной семантикой.
27. Универсальные FinancialOperation и Correction не вводятся.
28. Глобальные финансовые Rule, Rule Context, Audit Context и History Context не вводятся.
29. Бухгалтерская модель и внешняя бухгалтерская система не являются основой предметной истины финансового контура Community OS.

---

# SOURCE 7 — ADR-010: Subject / User Account / access

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

---

### 2. Связь пользовательской учётной записи с субъектом

Пользовательская учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет связь с этим субъектом. После такого использования она не перепривязывается другому субъекту. Для другого субъекта используется другая пользовательская учётная запись. Это сохраняет историческую атрибуцию действий, выполненных через учётную запись.

Ошибочная первоначальная связь исправляется отдельной исторически прослеживаемой корректировкой. Такая корректировка:

- сохраняет ошибочную исходную связь и факт её исправления в необходимом для объяснимости объёме;
- не переписывает молча историю;
- не меняет атрибуцию уже совершённых предметно значимых действий;
- не делает нового субъекта действующим субъектом прошлых действий;
- не требует универсальной сущности идентичности или глобальной модели исправлений.

Конкретная процедура проверки и исправления связи определяется последующими решениями и применимыми правилами.

---

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

---

### 10. Роль доступа и право доступа

**Роль доступа** (`Access Role`) — понятие слоя технического доступа, используемое для группировки прав доступа.

**Право доступа** (`Access Right`) — предметно определимая для слоя доступа возможность использовать данные или функцию в некоторой области применимости. Оно не является предметным полномочием совершить действие.

Сохраняются различия:

```text
Роль доступа ≠ Право доступа ≠ Предметное полномочие
```

Роль доступа не является:

- должностью;
- профессией или служебным отношением;
- собственностью;
- членством;
- представительством;
- правом участия;
- правом голоса;
- участием в органе управления.

Роль доступа сама по себе не создаёт предметных прав или отношений. Предметное отношение может участвовать в правилах предоставления или прекращения технического доступа, но отношение и роль доступа остаются различными.

«Председатель», «бухгалтер», «кассир», «собственник» и «член сообщества» не становятся универсальными ролями доступа автоматически. Эти термины сохраняют собственную предметную семантику.

---

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

---

### 14. Автоматизированные действия

Система, сервис, интеграция, планировщик или другой автоматизированный механизм не становятся субъектом из-за выполнения операции.

Настоящий ADR не вводит системного пользователя, автоматизированного субъекта, сервисного субъекта или универсального автоматизированного действующего лица.

Поддерживаются, в частности:

1. действие, инициированное субъектом через учётную запись и технически выполненное системой;
2. автоматическая операция, инициированная применимым правилом;
3. плановый расчёт без действующего субъекта;
4. поступление данных из интеграции;
5. автоматическое формирование уведомления;
6. техническая доставка уведомления;
7. автоматический пересчёт;
8. автоматическое выполнение операции, для которой предметная семантика требует атрибуции конкретного субъекта.

Если субъект предметно не требуется, происхождение автоматического действия фиксируется без фиктивного субъекта. Где применимо, должны быть определимы инициирующий факт или действие, правило и его версия, входные данные, источник, время, автоматический характер и результат.

Если предметная семантика требует действия субъекта, автоматизация не заменяет его атрибуцию. Фактически действующий субъект и основание должны оставаться определимыми.

---

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
16. Обязательный отрицательный результат предметной проверки не преодолевается одним техническим доступом.
17. Предметное полномочие не создаёт технический доступ автоматически.
18. Универсальный приоритет роли, полномочия, доступа, собственности или другого основания не устанавливается.
19. Области применимости определяются локальными предметными контекстами и не образуют закрытый универсальный перечень.
20. Роль доступа, право доступа, должность и полномочие не считаются глобальными между сообществами автоматически.
21. Последующее прекращение полномочия, представительства или доступа не отменяет автоматически исторически допустимое действие.
22. Универсальный обязательный результат авторизации не вводится.
23. Автоматизированный механизм не является субъектом.
24. Не каждое автоматическое действие требует действующего субъекта.
25. Автоматизация не заменяет атрибуцию субъекта там, где она требуется предметной семантикой.
26. Субъект может существовать и действовать без пользовательской учётной записи, если это допускает соответствующий процесс.
27. Техническая доставка не доказывает идентичность и не создаёт предметное полномочие.
28. История и происхождение принадлежат соответствующим предметным понятиям и не образуют глобальный Audit Context.

---

# SOURCE 8 — ADR-011: integration/import semantics

### 2. Внешний идентификатор

**Внешний идентификатор** — квалифицированное значение или отношение в области конкретной интеграции.

Его смысл может определяться сочетанием:

- области интеграции;
- внешней стороны или namespace;
- вида внешнего объекта, если он значим;
- значения идентификатора.

Внешний идентификатор не является глобальным идентификатором объекта Community OS и сам по себе не определяет внутреннюю идентичность.

Один внутренний объект может иметь разные внешние идентификаторы в разных интеграциях. Связь internal—external может быть исторически значимой. Ошибочное сопоставление исправляется прослеживаемо и не переписывает прошлую интерпретацию молча.

Изменение external device ID не изменяет автоматически идентичность прибора или точки учёта. Глобальный реестр внешних идентификаторов и обязательная standalone entity не вводятся.

---

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

---

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

---

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

---

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

---

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

Повторное recognition старых данных с новой версией mapping должно быть отличимо от первоначального recognition. Универсальный `Correction Event` не вводится.

---

### 8. Виды импорта и синхронизации

Различаются:

```text
Migration import
≠ Manual bulk import
≠ Regular synchronization
≠ Operational integration
```

Первоначальная миграция является архитектурно значимым сценарием Community OS. Она может включать объекты собственности, субъектов, отношения собственности и пользования, лицевые счета, исторические платежи, показания, приборы, связи с точками учёта и другие исторически значимые данные.

Строка входного файла не является предметным фактом. CSV и XLS являются входными представлениями или форматами, а не предметной моделью.

Импорт должен допускать на семантическом уровне:

- identification;
- validation;
- mapping;
- preview или dry-run, если это требуется процессом;
- recognition;
- отдельный результат элемента;
- partial success;
- provenance;
- correction;
- безопасный повторный запуск или re-import.

Эти возможности не образуют универсальный Import Workflow.

---

### 9. Batch import и partial success

Массовый импорт может иметь составной результат с независимыми результатами отдельных элементов.

Atomicity определяется конкретным процессом: один импорт может допускать partial success, другой — требовать all-or-nothing.

Повторная обработка исправленных элементов не должна автоматически создавать duplicates для уже успешно признанных элементов. Для каждого значимого результата должна быть объяснима связь с соответствующим входным элементом и попыткой обработки.

Настоящий ADR не определяет транзакции базы данных, UI предварительного просмотра, парсер или техническую структуру batch.

---

### 13. Версии contract и mapping

Версия semantic contract или mapping должна быть исторически определима, если её изменение могло изменить validation, recognition, interpretation или предметный результат.

При этом:

```text
API version ≠ Semantic mapping version
Schema version ≠ автоматически предметно значимая версия
Mapping ≠ автоматически универсальное Rule
```

Если mapping имеет семантику правила, применяются требования ADR-005 в соответствующем локальном контексте. Техническое хранение версий относится к Stage K.

---

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

---

### 15. Reconciliation

Reconciliation в Stage J обозначает context-specific сопоставление известных состояний и сведений для установления результата внешнего взаимодействия или разрешения расхождения.

Она не является универсальным workflow, state machine или предметной сущностью. Конкретный контекст определяет сравниваемые сведения, допустимые источники, правила признания и последствия.

---

### 16. Authority и source of truth

Глобальная иерархия источников истины не вводится.

Сохраняются различия:

```text
Источник информации
≠ Подтверждающие сведения
≠ Authoritative source для конкретной информации
≠ Основание recognition
≠ Владелец предметного факта
≠ Производный результат
```

Authority определяется предметным контекстом, видом информации, конкретным integration semantic contract и применимыми правилами.

Например:

- банк может быть authoritative относительно собственного сообщения о банковской операции, но это сообщение не является автоматически банковской транзакцией Community OS, Payment или Allocation;
- BAS может быть authoritative относительно собственного бухгалтерского документа, но не Financial Obligation Community OS;
- источник телеметрии сообщает сведения об измерении, но ресурсный контекст признаёт Reading;
- IdP аутентифицирует техническую идентичность, но не создаёт Subject, ownership или Domain Power;
- Community OS может быть authoritative для начисления, экспортируемого в BAS.

Эти примеры не образуют закрытый перечень или жёстко заданную универсальную иерархию.

---

### 17. Двусторонняя синхронизация и конфликты

Более новое значение не получает приоритет только потому, что оно новее. Универсальный last-write-wins запрещён.

При расхождении должны быть определимы, где применимо:

- какие сведения сравниваются;
- относятся ли они к одному предметному понятию;
- authoritative side;
- исходное время источника;
- время получения;
- применённые версии mapping;
- является ли различие correction, delay, conflict или допустимым расхождением представлений;
- кто или какое правило разрешает расхождение;
- что сохраняется исторически.

Разрешение принадлежит соответствующему предметному контексту или конкретной интеграции. Универсальная сущность `Conflict` не вводится.

---

### 19. Временная семантика

Где это значимо, различаются:

- время внешнего события или измерения;
- время формирования сведений внешней стороной;
- время передачи;
- время получения;
- время обработки;
- время recognition;
- время correction, re-import или re-recognition;
- время попытки доставки;
- время acknowledgement.

Не все моменты обязательны для каждой интеграции. Они не образуют универсальную bitemporal model. Время записи в базу данных не считается автоматически предметным или интеграционно значимым временем.

---

### 20. Multi-community scope

External identifiers, mappings, contracts, authority, credentials, scopes и integration relations не считаются автоматически глобальными между сообществами.

Область конкретной интеграции должна быть определима без глобальной иерархии scope. Один внешний источник может взаимодействовать с несколькими сообществами, но применимость идентификаторов, mappings и authority определяется отдельно.

Tenant tables и техническая изоляция относятся к Stage K.

---

## Архитектурные инварианты

1. Предметная семантика, интеграционная семантика, внешний контракт, транспорт и техническая реализация различаются.
2. Внешняя сторона интеграции не является субъектом или bounded context.
3. Внешний идентификатор не является глобальным идентификатором объекта Community OS.
4. Внешняя информация, полученная информация и признанный предметный факт различаются.
5. Recognition принадлежит bounded context — владельцу предметной семантики.
6. Mapping не создаёт предметный факт автоматически.
7. Повторное получение не создаёт новый предметный факт автоматически.
8. Совпадение значений само по себе не доказывает duplicate.
9. Redelivery, duplicate, correction, replacement и new information различаются.
10. Исторически значимая внешняя correction не переписывает признанный факт молча.
11. Migration, bulk import, synchronization и operational integration различаются.
12. Partial success и atomicity определяются конкретным import process.
13. Export, Publication, Delivery, Document и Document Representation различаются.
14. Не каждый export является исторически значимым.
15. Создание, отправка, принятие provider, доставка, получение, прочтение и юридическое уведомление различаются.
16. Повторная доставка не создаёт новое Notification автоматически.
17. Integration semantic contract не является универсальной предметной сущностью.
18. Значимая версия contract или mapping исторически определима, если влияет на результат.
19. API version и semantic mapping version различаются.
20. Unknown outcome не является failure.
21. Универсальная Integration State Machine не вводится.
22. Недоступность внешней системы не меняет признанные предметные факты молча.
23. Глобальная иерархия источников истины не вводится.
24. Более новое значение не имеет универсального приоритета.
25. Authentication внешнего источника не доказывает достоверность или recognition.
26. Интеграция, сервис или автоматический механизм не являются субъектами.
27. External identifiers, mappings, contracts и authority не глобальны между сообществами автоматически.
28. Предметная история интеграции не заменяется техническим журналом.
29. Внешняя банковская операция и полученная банковская информация не являются автоматически банковской транзакцией Community OS.
30. Признанная банковская транзакция принадлежит финансовому контексту и не является автоматически Payment или Allocation.

---

# SOURCE 9 — ADR-016: runtime retry/idempotency/reconciliation

## Терминология и ключевые различия

**Persistent Work** — durable technical work, obligation и state которой должны переживать потерю process. Один **Persistent Work Item** представляет одну stable **Persistent Work Operation**. В common runtime contract stable Persistent Work identity является stable Operation identity.

**Attempt** — отдельный execution episode одной Operation. Retry или допустимый Resume сохраняет Operation identity, но создаёт новую Attempt identity.

**Durable Delivery Record** представляет delivery/publication obligation. Он имеет отдельную delivery identity и не является автоматически Persistent Work Operation, semantic Event или domain fact.

Не смешиваются:

```text
Persistent Work Operation
≠ Attempt
≠ Durable Delivery Record
≠ semantic Domain/Application Event or Fact
≠ external request / external response
≠ received external information
≠ recognized domain fact
≠ Security Audit
≠ Operational Log
```

Также различаются:

```text
Known Success ≠ Known Failure ≠ Unknown Outcome
Retry ≠ New Intent
Redelivery ≠ Duplicate ≠ Correction ≠ Replacement ≠ New Information
Cancellation Requested ≠ Execution Stopped ≠ Compensation Performed
Quarantined ≠ Cancelled
Cancelled ≠ Compensated
Superseded ≠ silently deleted
```

Эти понятия образуют технический runtime contract, а не новый bounded context или universal domain model.

---

### 1. Persistent Work contract

Business-significant asynchronous obligation, которая должна пережить process termination/restart/deployment, фиксируется как Persistent Work или equivalent durable delivery obligation.

Минимальный общий technical contract позволяет определить:

- stable Operation identity;
- owning module, work type и contract version;
- Platform или trusted Community Scope;
- eligibility/scheduling и execution/outcome condition;
- Attempts;
- correlation и causation;
- failure/outcome classification;
- необходимые безопасные runtime references.

Точный состав physical record не определяется. Specialized payload/state/checkpoints, domain meaning/effects, recognition, correction и compensation принадлежат owning module/context. Общий runtime не получает ownership domain facts и не становится universal Workflow.

Persistent Work obligation не считается исполненной только потому, что work была claimed, external request отправлен или transport acknowledgement получен. Completion evidence определяется owning contract.

---

### 2. Persistent Work Operation и Attempt

Operation identity стабильна на протяжении automatic retries и допустимых resumes. Каждая execution attempt имеет собственную identity и сохраняет outcome/failure evidence, достаточные для диагностики без secret material.

Resume сохраняет Operation identity только при одновременном сохранении:

- того же unresolved obligation;
- того же semantic intent;
- того же idempotency boundary.

Materially changed intent/significant input, Correction, Replacement или deliberate new Replay создают новую linked Operation identity. Они не маскируются под Retry старой Operation. Prior Attempts и исходная Operation не переписываются.

Claim/lease может ограничивать concurrent execution, но сам по себе не доказывает exactly-once effect: Worker может завершиться после commit и до acknowledgement.

---

### 4. Duplicate recognition / Inbox

Inbox не является universal mandatory component. Durable duplicate recognition обязательна там, где repeated inbound/durable delivery иначе способна создать unintended second effect и это нельзя безопасно установить из authoritative local state.

Допустимы Inbox, local uniqueness по qualified Operation/external identity, guarded state transition или другой semantically equivalent mechanism. Equal payload/hash сам по себе не доказывает duplicate.

Owning integration contract различает redelivery, duplicate, correction, replacement и new information. Повторно полученная external information не становится автоматически новым recognized domain fact и не теряется как duplicate без contract evidence.

---

### 5. At-least-once и idempotency

Durable delivery и Persistent Work предоставляют **at-least-once delivery/execution exposure**. После crash, timeout или lost acknowledgement та же Delivery или Operation может быть dispatched, claimed или attempted повторно.

Community OS не обещает system-wide:

- exactly-once execution;
- exactly-once delivery;
- exactly-once external effect.

Specific bounded effect может иметь effectively/exactly-once committed result только если его concrete local transactional или provider contract действительно обеспечивает это. Такая гарантия не становится свойством общего runtime.

Если повтор может создать unintended effect, owning contract определяет idempotency boundary и использует применимую комбинацию stable Operation identity, local uniqueness, guarded transition, provider idempotency, durable duplicate recognition или reconciliation. Idempotency key является qualified contract value, а не universal identity или payload hash.

---

### 6. Failure / outcome semantics

Архитектурно различаются, без требования одного universal enum/state machine:

- pending/eligible obligation;
- claimed/running Attempt;
- completed/succeeded Operation согласно owner-defined evidence;
- known transient failure;
- known permanent validation failure/rejection;
- authorization/admissibility/lifecycle denial;
- stale Placement Generation или incompatible contract/schema/application state;
- revoked credential/Secret;
- provider rate limit/unavailability;
- duplicate/redelivery;
- poison/malformed work;
- partial completion;
- Unknown Outcome;
- cancellation requested и execution stopped;
- superseded work;
- terminal/quarantined condition и manual intervention requirement.

Known transient failure может retry-иться согласно context policy и после revalidation. Permanent rejection, mandatory denial, incompatible work или poison input не retry-ятся бесконечно. Superseded work сохраняется traceably, а не удаляется молча.

Exact status enum, retry count, delay/backoff, circuit breaker, timeout и exception mapping принадлежат Implementation Baseline/context policy.

---

### 8. Unknown Outcome и reconciliation

Unknown Outcome означает, что external effect мог произойти, но доступных evidence недостаточно для Known Success или Known Failure. Он не является failure, success и не превращается автоматически в permanent failure после N retries.

Когда contract поддерживает, resolution следует использовать в порядке применимости:

```text
stable provider idempotency / correlation
→ provider status or query
→ later independent evidence and reconciliation
→ attributable manual resolution
```

Если provider не позволяет доказать outcome, а повтор способен создать duplicate material effect, blind retry запрещён. Operation остаётся unresolved/quarantined до безопасного resolution.

Bank mutation, notification provider, DNS/API mutation и object upload определяют собственные success evidence и reconciliation semantics. Notification send/provider acceptance не доказывает delivery/receipt/read/legal notification; object existence не доказывает recognized domain completion.

---

### 9. Causation, authority и execution revalidation

Operation может сохранять historically fixed acceptance/causation context:

- initiating Technical Identity/User Account;
- actual/represented Subject и basis только где они действительно применимы;
- original command/request и Operation identity;
- факт допустимого acceptance;
- rule/configuration/mapping/integration-contract versions, необходимые для historical determinability.

Captured acceptance/authorization является evidence/causation и не является credential, reusable delegation или evergreen authorization token. Captured human credentials не сохраняются и не используются.

Worker исполняет под собственной Workload Identity через те же Application/Domain boundaries, что synchronous entry. Перед execution или irreversible effect каждая Attempt re-resolves/revalidates declared current-sensitive gates, где применимо:

- Community lifecycle и Entitlement execution gate;
- current technical Access Rights;
- current domain Power/Representation/admissibility;
- current authoritative domain state;
- Placement и Placement Generation;
- integration enabled/configuration state;
- authorized Secret Reference/credential lifecycle;
- work-contract/schema/application compatibility.

Owning operation contract явно определяет authorization boundary. Already-final accepted durable command может технически продолжаться, если именно acceptance окончательно зафиксировал authority/intent. Delayed effect, для которого authority должна существовать непосредственно при effect, revalidates current authority.

Same Operation identity при Retry/Resume не bypass revalidation. Mandatory domain denial не может быть overridden Worker, retry, replay, support elevation, cancellation processing или другим technical runtime. Fake Subject/System User не создаётся.

---

### 16. History, audit, provenance и observability

Различаются:

1. Persistent Work/Process state — authoritative technical state obligation, eligibility, attempts, progress и resolution;
2. context-owned Integration Provenance — external identity/request/response/evidence/mapping/recognition;
3. Domain History — semantic facts, versions, corrections и attribution;
4. Security Audit — security-sensitive technical actions;
5. Operational logs, metrics, traces и alerts — diagnosis/health.

Для operator diagnosis доступны stable Operation/Attempt identities, owner/type/version, scope, eligibility, failure/outcome classification, safe diagnostics, correlation/causation, terminal/cancellation state и resolution linkage. Raw logs не являются durable work record, business fact или единственным evidence unresolved obligation.

Community administrators/users получают только purpose/scoped views по owning contracts, а не raw infrastructure log или unrestricted Security Audit.

---

## Архитектурные инварианты

1. Significant asynchronous obligation, которая должна пережить process loss, durable.
2. Один Persistent Work Item представляет одну stable Operation; Attempt и Delivery Record имеют отдельные identities.
3. Retry/Resume сохраняет Operation только внутри того же intent/obligation/idempotency boundary.
4. Correction, Replacement, New Intent и materially new Replay создают linked new Operation.
5. Worker использует те же Application/Domain boundaries и исполняет под Workload Identity, не Account/Subject.
6. Одна ACID transaction ограничена одной resolved Transactional Persistence Boundary.
7. Commit-coupled publication intent atomic с local state через outbox/equivalent; dispatch may repeat.
8. At-least-once delivery/execution exposure является baseline; universal exactly-once отсутствует.
9. Idempotency и duplicate recognition определены qualified effect/contract; universal Inbox отсутствует.
10. Redelivery, duplicate, correction, replacement и new information distinct.
11. External/received information и recognized domain fact distinct.
12. Known Success, Known Failure и Unknown Outcome distinct; Unknown не становится failure по retry count.
13. Blind retry Unknown Outcome, способный duplicate material effect, запрещён.
14. External effect не выполняется внутри open local domain transaction.
15. Persistent Work state, Domain History, Integration Provenance, Security Audit и Operational Log distinct.
16. Historically significant rule/configuration/mapping/contract version determinable.
17. Каждая Attempt применяет declared current-sensitive revalidation.
18. Mandatory domain denial не может быть overridden.
19. Lifecycle/Entitlement denial не уничтожает Power/history; suspended/archive блокирует normal effects по умолчанию.
20. Community Scope trusted explicitly; RLS является defense-in-depth, не authorization.
21. Current Placement/Generation resolved; stale Generation fenced.
22. Cross-Placement FK/SQL/ACID/2PC не предполагаются.
23. Significant multi-step processes используют specialized resumable coordinators; universal Workflow отсутствует.
24. Cross-store partial state detectable/recoverable.
25. Нет global/per-Community FIFO; ordering, exclusivity и concurrency distinct/scoped.
26. Fairness/backpressure не задают physical tenant topology или SLA.
27. Cancellation Requested, Execution Stopped и Compensation distinct; universal rollback отсутствует.
28. Secret material не входит в work/log/audit/history; privileged interventions authorized/attributed/audited.
29. Unsupported work version fail closed/quarantine без silent reinterpretation/loss.

---

# SOURCE 10 — BP-ACCESS-001: релевантные границы

## 2. Основные различия

Для процесса сохраняются следующие различия:

- User Account ≠ Subject;
- User Account ≠ Subject Identity Anchor;
- Account↔Subject linkage ≠ отношение Subject↔Object;
- предметное отношение ≠ Access Grant;
- Access Role ≠ Access Right;
- Access Right ≠ Domain Power;
- Representation ≠ Access Grant;
- Voting Right ≠ Access Grant.

Наличие одного из перечисленных фактов не создаёт остальные автоматически.

Ownership может быть основанием применения access policy, а применимая access policy может привести к Access Grant. При этом Ownership и Access Grant остаются различными фактами.

---

## 3. Границы процесса

Процесс начинается, когда возникает допустимое основание или намерение предоставить User Account доступ к определённым данным или функциям Community OS, и заканчивается одним из результатов:

- доступ предоставлен;
- доступ существенно изменён;
- использование доступа временно ограничено;
- доступ прекращён;
- запрос на доступ отклонён;
- решение отложено до получения необходимых сведений или завершения другого предметного процесса.

BP-ACCESS-001 не создаёт и не изменяет автоматически:

- Ownership;
- пользование или аренду;
- Membership;
- Employment / Service Relation;
- Representation;
- Domain Power;
- участие в органе управления;
- Voting Right;
- финансовое обязательство;
- Personal Account;
- Meter или Accounting Point.

Эти факты могут быть основаниями или входными данными процесса, но сохраняют собственную предметную семантику.

BP-ACCESS-001 относится к human-access через User Account. Workload Identity, Support Elevation, Break-glass, Integration Identity и иные технические identities регулируются ADR-015 и не входят в данный пользовательский процесс. Технический Community Admin, bootstrap/admin recovery и аналогичный административно-технический доступ ADR-015 также находятся вне BP-ACCESS-001 в той мере, в которой не выполняется предметное действие от определимого Community Subject; если предметная семантика требует Subject, техническая административная роль его не заменяет.

---

## 7. Identity resolution и связь Account с Subject

### 7.1. Общий принцип

BP-ACCESS-001 использует результат identity resolution, но не присваивает себе универсальную семантику установления личности.

Для обычного пользовательского доступа к предметно значимым функциям User Account должен быть связан с определимым Community Subject.

Subject Identity Anchor может использоваться как platform-level средство устойчивой идентичности и multi-community attribution, но не является обязательной промежуточной сущностью для каждого Subject.

### 7.2. Регистрация

Регистрация создаёт User Account.

Регистрация сама по себе не создаёт Subject, Ownership, Membership, Representation, Access Grant или Voting Right.

Подтверждённый телефон, email или иной authentication method подтверждает соответствующий технический фактор, но сам по себе не доказывает Ownership или другую предметную связь.

### 7.3. Заявленная идентичность

Пользователь может заявить, что он:

- конкретный существующий Subject;
- собственник;
- совладелец;
- пользователь или арендатор;
- представитель;
- сотрудник;
- иной участник отношений.

Заявление является входными сведениями процесса и не становится признанным предметным фактом автоматически.

### 7.4. Способы identity resolution

Допустимый identity resolution может использовать:

- Specific Invitation;
- ручную проверку уполномоченным участником;
- доверенный внешний способ идентификации;
- иной способ, определённый применимой identity policy.

Совпадение ФИО, телефона, email, внешнего идентификатора или иных отдельных признаков само по себе не является достаточным основанием для автоматической Account↔Subject linkage.

### 7.5. Specific Invitation

Invitation, относящееся к заранее определённому Community Subject, вместе с аутентифицированным Account и применимой identity policy может быть достаточным основанием для установления допустимой linkage.

Само владение invitation link/token не доказывает Subject identity.

### 7.6. Generic Invitation

Если Invitation направлено человеку, который ещё не установлен как конкретный Community Subject, оно не создаёт автоматической связи с существующим Subject только по email, телефону или другому адресу доставки.

### 7.7. Subject отсутствует

Если для обычного human-access требуется Community Subject, но его ещё нет, процесс может инициировать отдельное допустимое признание нового реального Subject.

Access Grant не является основанием существования Subject.

Создание Subject ради технической выдачи доступа без признания конкретного реального участника не допускается.

### 7.8. Ошибочная linkage

Ошибочная Account↔Subject linkage исправляется отдельной исторически прослеживаемой процедурой согласно ADR-010/012/015.

Исправление linkage не переатрибутирует прошлые предметно значимые действия другому Subject.

---

## 16. Первичный доступ собственника

Типовой сценарий:

Registration / Login  
→ выбор Community  
→ Access Request или Specific Invitation  
→ identity resolution  
→ установлен Community Subject  
→ проверено признанное Ownership  
→ применена access policy Community  
→ созданы Access Grants.

BP-ACCESS-001 использует признанный предметный факт Ownership и не создаёт Ownership из заявления пользователя, загруженного документа, импортированной строки или иного непризнанного сведения.

Если пользователь заявляет себя новым собственником, а действующее Ownership в Community OS не подтверждает это основание, owner-based grant не создаётся до завершения соответствующего процесса признания или изменения Ownership.

---

## 17. Смена собственника

Смена собственника не передаёт User Account или Access Grant новому собственнику.

Следует различать:

- предметный момент изменения Ownership;
- момент, когда изменение было получено и признано Community OS;
- момент фактической переоценки и изменения технического доступа.

После признания изменения Ownership зависимые grants переоцениваются, а будущий technical access изменяется согласно policy.

Позднее признание изменения Ownership не переписывает молча историю доступа задним числом.

Новый собственник проходит собственный identity/access process.

Историческую допустимость конкретных действий, совершённых до технического прекращения доступа, определяет контекст — владелец соответствующего действия.

---

## 18. Personal Account и исторические финансовые данные

Personal Account относится к Object или группе Objects, а не к конкретному Owner.

Смена собственника сама по себе не создаёт новый Personal Account и не переносит финансовые обязательства прежнего собственника новому.

Access Grant в Scope Personal Account не означает автоматического права видеть всю историческую финансовую информацию всех субъектов, когда-либо связанных со счётом.

Финансовый контекст определяет допустимую видимость конкретных фактов с учётом:

- сторон обязательств;
- периода отношений субъекта с Object;
- плательщиков;
- исторического и текущего собственника;
- персональных данных;
- применимых правил раскрытия.

Наличие исторической задолженности, начисления или платежа в Personal Account само по себе не определяет обязанность нового собственника отвечать по нему и не предоставляет автоматическую видимость всех связанных данных.

---

## 37. Прослеживаемость

Для исторически значимого доступа должны быть определимы в совокупности исторического контекста, где применимо:

- grantee Account;
- связанный Community Subject;
- Community;
- Access Rights;
- Scope;
- существенное предметное основание;
- инициатор;
- уполномоченное основание выдачи или отзыва;
- применённая policy/rule и её исторически значимая версия, если требуется;
- субъект, принявший ручное решение, если применимо;
- автоматический характер исполнения, если применимо;
- начало и окончание применимости;
- существенные изменения;
- истечение, отзыв или прекращение;
- correction ошибочного grant;
- связанный Access Request или Invitation, если они существовали.

Эти сведения не обязаны храниться одной сущностью или одной таблицей.

Автоматизированный механизм не становится Subject только потому, что технически выполнил выдачу или отзыв.

---

## 38. Инварианты процесса

1. Регистрация User Account не создаёт Subject, Ownership или Access Grant.
2. Account↔Subject linkage, предметное отношение и Access Grant различаются.
3. Для обычного human-access к предметно значимым функциям Account должен быть связан с определимым Community Subject.
4. Access Grant не создаёт Ownership, Membership, Representation, Domain Power или Voting Right.
5. Предметное отношение само по себе не является Access Grant.
6. Автоматическое предоставление доступа допускается только по явной применимой policy.
7. Совпадение ФИО, телефона, email или другого отдельного признака само по себе не устанавливает identity linkage.
8. Access Request, Invitation, Access Decision и Access Grant различаются.
9. Access Request и Invitation не являются обязательными стадиями каждого grant.
10. Grant имеет определимые Rights и Scope.
11. Знание идентификатора не предоставляет доступ.
12. Доступ к Object не создаёт автоматически полного доступа ко всем связанным данным других контекстов.
13. Технический Access Right не заменяет предметную допустимость действия.
14. Делегирование означает инициирование нового самостоятельного grant, а не копирование существующего.
15. Наличие Access Right само по себе не даёт права его делегировать.
16. Один Account может иметь несколько независимых grants на разных основаниях.
17. Прекращение одного основания затрагивает только зависимый от него доступ.
18. Существенная смена основания является новым прослеживаемым access decision, а не silent rewrite.
19. Смена собственника не передаёт Account или grant новому собственнику.
20. Изменение предметного основания и изменение technical access могут иметь разные моменты времени.
21. Отзыв Invitation не отзывает уже созданный Access Grant.
22. Grant revocation, временное ограничение доступа и Account suspension различаются.
23. Ошибочно предоставленный эффективный доступ исправляется прослеживаемо и не исчезает из истории.
24. Исправление доступа не отменяет автоматически предметные факты других контекстов.
25. Предметный спор не разрешается изменением Access Rights.
26. Изменение access policy не переписывает историческое основание прежнего доступа и должно явно определять влияние на существующие grants.
27. Grants и access policies одного Community не распространяются автоматически на другое Community.

---

# SOURCE 11 — REFERENCE_CANDIDATE_MATRIX: состояние BP-IMPORT и следующий этап

| REF-FIN-011 | Источник финансирования, направление использования и фактическое покрытие расхода | OSBBX, МДО | Понятия разделены и синхронизированы в DOMAIN_MODEL/TERMINOLOGY/ADR-006 | **Закрыт решением** | Конкретные правила — только в соответствующих BP |
| REF-FIN-012 | Рекомендованный платёж ≠ начисление | МДО | Payment Intent и добровольное авансирование существуют, но отдельная семантика «рекомендованного платежа» не принята | **Backlog** | Проверить реальные сценарии пилотного СТ; не вводить понятие только из-за наличия в МДО |
| REF-FIN-013 | Возвратный резервный/обеспечительный взнос | МДО | Может пересекаться с авансом, обязательством и источником финансирования, но юридическая/предметная природа не определена | **Отложен** | Вернуться только с конкретным бизнес-сценарием и правовым анализом |
| REF-FIN-014 | Ресурсный небаланс ≠ финансовый кассовый разрыв | МДО, OSBBX | Ресурсный, финансовый, обязательственный и контур финансирования разделены | **Закрыт решением** | Проверять соблюдение границы в будущих BP |
| REF-ACCESS-001 | Запрос на привязку пользователя к субъекту/объекту/лицевому счёту | OSBBX, МДО, DAH | Зафиксирован `BP-ACCESS-001`; DOMAIN_MODEL и TERMINOLOGY синхронизированы с процессом; базовая архитектура ADR-010/012/015 сохранена | **Закрыт решением** | Конкретные owner-access/delegation policies первого СТ определить на этапе продуктовой конфигурации; новый фундаментальный access-анализ не требуется без нового сценария |
| REF-IMP-001 | Первоначальный импорт объектов, субъектов, отношений и лицевых счетов | OSBBX, МДО | Зафиксирован `BP-IMPORT-001`; процесс охватывает Objects/Object Area, Subjects, Ownership/Use, Personal Accounts, external IDs, staging/preview, validation/mapping, partial success, provenance, retry/re-import/correction; проверен на реальном OSBBX-export пилотного СТ | **Закрыт решением** | Не возвращаться к фундаментальной модели импорта без нового сценария; финансовую и ресурсную миграцию проектировать отдельными процессами |
| REF-IMP-002 | Первоначальная миграция финансовых фактов и исходного финансового состояния | OSBBX, МДО | ADR-011 допускает миграцию исторических платежей и иных значимых данных; ADR-006 запрещает превращать баланс в первичный источник финансовой истины | **Backlog** | После финансовых BP определить отдельную миграционную семантику финансовых фактов и, если неизбежно, обоснованного исходного состояния |
| REF-AUD-002 | Прослеживаемость финансовых исправлений и корректирующих действий | OSBBX | ADR-004/006 требуют provenance и запрета silent rewrite; BP-FIN-001 уже применяет это правило | **Закрыт решением** | Не вводить универсальный Audit/Correction Context; проверять достаточную прослеживаемость в каждом финансовом BP |
| REF-SUBJ-001 | Универсальная внешняя сторона: субъект → роль → договор → операция/обязательство | OSBBX, МДО | Supplier является Subject и имеет Supplier Contract; универсальная модель договорной роли внешней стороны не принята | **Следующий** | Архитектурно-предметное исследование до расширения DOMAIN_MODEL |
| REF-BANK-001 | Импорт/признание/классификация банковских сведений | OSBBX, МДО | Общая интеграционная семантика ADR-011 и Bank Transaction ADR-006 уже определены | **Следующий** | `BP-FIN-BANK-001`: конкретный банковский процесс без привязки домена к одному банку |
| REF-METER-001 | Замена прибора учёта | OSBBX | ADR-007 разделяет Meter, Accounting Point и Meter Installation; история не должна разрываться при замене | **Следующий** | `BP-METER-001`: снятие, конечное показание, новая установка, начальное показание, непрерывность точки учёта |
| REF-METER-002 | Автоматическое получение/импорт показаний | МДО, OSBBX | ADR-007/011: внешнее значение ≠ Reading; validation/mapping/recognition обязательны | **Следующий** | После базового BP показаний описать автоматический источник как интеграционный процесс |

...

- конфликт и спорное основание;
- аудит основания и действующего лица.

**Результат:** нормативный BP принят как рабочая предметная основа; выполнены точечные изменения DOMAIN_MODEL/TERMINOLOGY. Новый ADR не требуется: процесс совместим с ADR-003/004/005/010/011/012/015.

### Этап 2. BP-IMPORT-001 — миграция объектов, субъектов, отношений и лицевых счетов

**Состояние:** завершён; результат зафиксирован в [`BP-IMPORT-001-INITIAL-MIGRATION.md`](../business-processes/BP-IMPORT-001-INITIAL-MIGRATION.md). Object Area ранее синхронизирована в DOMAIN_MODEL и TERMINOLOGY; дополнительных нормативных изменений по итогам review не потребовалось.  
**Зависимость:** решения Этапа 1 исключают автоматическое создание User Account, Subject Identity Anchor, Access Grant или Voting Right из импортированного Ownership.

Этот процесс намеренно **не является универсальным Import Workflow**. Он описывает конкретную первоначальную миграцию базовых предметных данных пилотного сообщества. Миграция финансовых фактов, показаний и иной контекстно сложной истории проектируется отдельно вместе с соответствующими предметными процессами.

...

- финансовый «начальный баланс» не признаётся источником истины без отдельной миграционной семантики;
- приборы, показания и финансовая история не включаются в этот BP только ради удобства одной загрузки.

**Результат:** `BP-IMPORT-001` принят как рабочая предметная основа без проектирования CSV/XLS-формата, таблиц и UI; зафиксированы отдельные backlog-направления финансовой и ресурсной миграции. Новый ADR не потребовался.

### Этап 3. Внешняя сторона, роль и договор

**Состояние:** следующий этап.

**Источники:** OSBBX + МДО.  
**Тип работы:** предметно-архитектурное исследование перед бизнес-процессом.

---

# Конец review package
