# Сводная матрица кандидатов из внешних референсов

**Статус:** Working / рабочий документ анализа  
**Область:** OSBBX, «Мій Дім Online» (МДО), DAH Online  
**Актуально относительно:** нормативной модели после BP-RECON-001; DOMAIN_MODEL 0.23, TERMINOLOGY 0.20  
**Назначение:** единая точка учёта кандидатов, выявленных во внешних референсах, их текущего состояния в Community OS и последовательности дальнейшей проработки.

> Этот документ не является источником продуктовых требований и не заменяет DOMAIN_MODEL, TERMINOLOGY или ADR. Наличие функции у референса не означает, что она должна быть реализована в Community OS.

## 1. Правило работы с референсами

Для каждого кандидата применяется один и тот же путь:

```text
наблюдение во внешней системе
→ реальная потребность
→ бизнес-сценарии и исключения
→ проверка действующей предметной модели
→ бизнес-процесс
→ изменение DOMAIN_MODEL / TERMINOLOGY при необходимости
→ ADR только при наличии архитектурного решения
→ техническое задание
→ реализация
```

Не используется путь:

```text
«функция есть у референса»
→ «добавить такую же функцию в Community OS»
```

Референс помогает обнаружить реальные процессы и исключительные случаи, но не определяет внутреннюю модель Community OS.

## 2. Статусы

| Статус | Смысл |
|---|---|
| **Закрыт решением** | Вопрос уже предметно/архитектурно решён; повторное исследование без нового сценария не требуется |
| **Частично закрыт** | Базовая модель или архитектурная граница уже определена, но отсутствует конкретный бизнес-процесс, политика или интеграционный контракт |
| **Следующий** | Кандидат включён в ближайшую обязательную последовательность анализа |
| **Backlog** | Кандидат признан полезным, но не блокирует ближайшую последовательность |
| **Отложен** | Сознательно не входит в ближайший этап; требуется дополнительный сценарий, правовой анализ или зрелость других частей системы |
| **Не вводить отдельно** | Наблюдение референса учтено, но отдельная фундаментальная сущность/контекст для него отвергнуты |
| **Не переносить автоматически** | Сценарий затрагивает privacy/legal или иную специальную политику и не становится продуктовой функцией без отдельной потребности и анализа |

## 3. Сводная матрица

| ID | Кандидат / потребность | Источники | Текущее состояние Community OS | Статус | Следующее действие |
|---|---|---|---|---|---|
| REF-FIN-001 | Банковская транзакция отдельно от платежа | OSBBX, МДО | `Bank Transaction ≠ Payment`; зафиксирован `BP-FIN-BANK-001` с recognition/classification, multi-account, duplicate/redelivery, source correction, own-account transfer и связью с Payment без universal 1:1 | **Закрыт решением** | Не возвращаться к фундаментальной границе без нового сценария; конкретные bank integrations описывать semantic contracts |
| REF-FIN-002 | Несколько банковских счетов сообщества | OSBBX, МДО | Поддержано DOMAIN_MODEL и ADR-006 | **Закрыт решением** | Не требуется отдельного доменного исследования; детали — в локальных банковских интеграциях |
| REF-FIN-003 | Перераспределение платежа | OSBBX | Зафиксирован `BP-FIN-001`; синхронизированы DOMAIN_MODEL и TERMINOLOGY | **Закрыт решением** | Не возвращаться к модели без нового сценария |
| REF-FIN-015 | Первичное распределение признанного платежа | OSBBX, пилотный СТ | Зафиксирован `BP-FIN-ALLOCATION-001`: Payment recognition отделён от Initial Allocation и Reallocation; Allocation Proposal не является Payment Allocation; поддержаны partial allocation, Unallocated Remainder, Advance, incoming/outgoing Payment, confirmation scope, revalidation и provenance без универсального порядка распределения | **Закрыт решением** | Конкретные Allocation Rules пилотного СТ определять как локальную policy/configuration; не вводить глобальный порядок распределения |
| REF-FIN-016 | Внутреннее перемещение, ответственное хранение, unresolved cash handoff и reconciliation наличных | пилотный СТ, BP-CASH-001, BP-CASH-002 | Internal transfer Community cash между custodians ≠ external Payment/Cash Disbursement; если неясно, прекратился ли Community custody/control, handoff остаётся явно unresolved и не классифицируется как внешний outflow по умолчанию; universal Cashbox/CashBalance не требуется | **Backlog** | Спроектировать custody/internal cash movement и reconciliation только при конкретной потребности: accountable custody, инвентаризация остатка, bank↔cash reconciliation, unresolved handoff resolution; подотчётная финансовая семантика вынесена отдельно в REF-FIN-017 |
| REF-FIN-017 | Подотчётные средства / accountable funds | пилотный СТ, BP-CASH-002 | Выдача наличных сотруднику/председателю может быть либо internal custody/agency, либо самостоятельным финансовым отношением; факт handoff не создаёт автоматически Payment этому лицу, Expense, Advance или Financial Obligation; предметная природа отдельного accountable settlement ещё не определена | **Backlog** | Отдельно исследовать реальные сценарии: цель выдачи, обязанность отчёта/возврата, ownership/custody средств, возникновение claim/debt, subsequent third-party payments; не отождествлять с existing `Advance` без анализа |
| REF-FIN-004 | Ошибочное признание платежа | OSBBX, пилотный СТ | Зафиксирован `BP-FIN-002`: Payment Recognition Correction отделён от Bank Transaction correction, Allocation/Reallocation и Refund; определены Payment identity continuity, recognition invalidation, duplicate/wrong-cardinality, dependent disposition, replacement recognition через owning process и provenance без universal Correction/Payment Status | **Закрыт решением** | Не возвращаться к фундаментальной модели без нового сценария; channel/source-specific recognition и dependent corrections оставлять owning processes |
| REF-FIN-005 | Возврат платежа | OSBBX, пилотный СТ | Зафиксирован `BP-FIN-003`: refund basis → обычное Financial Obligation to return → новый Payment → Initial Payment Allocation; Refund отделён от Payment correction, Reallocation, Bank Reversal и set-off; отдельные Refund Entity/Status/Ledger/Reservation не вводятся | **Закрыт решением** | Конкретные channel/source recognition, obligation changes и settlement без money movement оставлять owning processes; не вводить universal Refund workflow/entity |
| REF-FIN-006 | Разовое/внецикловое начисление, отмена, исправление и перерасчёт | OSBBX | `BP-FIN-004` определяет initial one-off/out-of-cycle Accrual; `BP-FIN-005` определяет post-confirmation correction/recalculation/cancellation, obligation continuity/replacement, ordered change provenance, already-paid consequences, excess applied amount, Overpayment/Advance/Refund/Reallocation boundaries и group recalculation без universal Correction/Storno | **Закрыт решением** | Не возвращаться к фундаментальной модели Accrual changes без нового сценария; penalty-specific recalculation и regular accrual workflow прорабатывать отдельно при появлении соответствующего этапа |
| REF-FIN-007 | Универсальная финансовая Correction / сторно | OSBBX | Универсальная `Correction` сознательно не вводится; используются специализированные действия | **Не вводить отдельно** | Конкретные ошибки моделировать соответствующими бизнес-процессами |
| REF-FIN-008 | «Поступление сообщества» как отдельная фундаментальная сущность | OSBBX | Отдельная универсальная `Community Receipt` не требуется; движение денег и его предметный смысл разделены | **Не вводить отдельно** | Возвращаться только при появлении сценария, который не покрывается Payment и существующими финансовыми отношениями |
| REF-FIN-009 | Наличные приходные/расходные операции | OSBBX | Зафиксированы `BP-CASH-001` и `BP-CASH-002`: Cash Acceptance/Cash Disbursement отделены от Payment, Allocation, cash document, custody, bank deposit/withdrawal и Expense; определены amount/completion, parties/authority, offline/idempotency и non-1:1 cash source↔Payment cardinality (`source → 0..N Payments`, `Payment → 1..N sources` only on sufficient owning-domain basis) без universal Cashbox/CashBalance/CashOperation; automatic source merge запрещён, attributable source amounts/provenance обязательны | **Закрыт решением** | Не возвращаться к фундаментальной модели cash-channel без нового сценария; custody/internal movement вести через REF-FIN-016, подотчётные средства — REF-FIN-017 |
| REF-FIN-010 | Распределение расхода между статьями сметы | OSBBX, пилотный СТ | Зафиксирован `BP-EXPENSE-001`: Expense имеет собственную identity/amount scope; Expense↔Obligation/Payment отделены от Payment Allocation; введена специализированная Expense Budget Distribution без новой fundamental entity; Expense Financing отделено от Budget/Payment/reservation; off-budget/recoverability/resource-supplier boundaries и пилотная electricity policy описаны | **Закрыт решением** | Не возвращаться к фундаментальной модели Expense/Budget Distribution без нового сценария; конкретные Budget/Funding policies задавать локально |
| REF-FIN-011 | Источник финансирования, направление использования и фактическое покрытие расхода | OSBBX, МДО | Понятия разделены и синхронизированы в DOMAIN_MODEL/TERMINOLOGY/ADR-006 | **Закрыт решением** | Конкретные правила — только в соответствующих BP |
| REF-FIN-012 | Рекомендованный платёж ≠ начисление | МДО | Payment Intent и добровольное авансирование существуют, но отдельная семантика «рекомендованного платежа» не принята | **Backlog** | Проверить реальные сценарии пилотного СТ; не вводить понятие только из-за наличия в МДО |
| REF-FIN-013 | Возвратный резервный/обеспечительный взнос | МДО | Может пересекаться с авансом, обязательством и источником финансирования, но юридическая/предметная природа не определена | **Отложен** | Вернуться только с конкретным бизнес-сценарием и правовым анализом |
| REF-FIN-014 | Ресурсный небаланс ≠ финансовый кассовый разрыв | МДО, OSBBX | Ресурсный, финансовый, обязательственный и контур финансирования разделены | **Закрыт решением** | Проверять соблюдение границы в будущих BP |
| REF-ACCESS-001 | Запрос на привязку пользователя к субъекту/объекту/лицевому счёту | OSBBX, МДО, DAH | Зафиксирован `BP-ACCESS-001`; DOMAIN_MODEL и TERMINOLOGY синхронизированы с процессом; базовая архитектура ADR-010/012/015 сохранена | **Закрыт решением** | Конкретные owner-access/delegation policies первого СТ определить на этапе продуктовой конфигурации; новый фундаментальный access-анализ не требуется без нового сценария |
| REF-IMP-001 | Первоначальный импорт объектов, субъектов, отношений и лицевых счетов | OSBBX, МДО | Зафиксирован `BP-IMPORT-001`; процесс охватывает Objects/Object Area, Subjects, Ownership/Use, Personal Accounts, external IDs, staging/preview, validation/mapping, partial success, provenance, retry/re-import/correction; проверен на реальном OSBBX-export пилотного СТ | **Закрыт решением** | Не возвращаться к фундаментальной модели импорта без нового сценария; финансовую и ресурсную миграцию проектировать отдельными процессами |
| REF-IMP-002 | Первоначальная миграция финансовых фактов и исходного финансового состояния | OSBBX, МДО | ADR-011 допускает миграцию исторических платежей и иных значимых данных; ADR-006 запрещает превращать баланс в первичный источник финансовой истины | **Backlog** | После финансовых BP определить отдельную миграционную семантику финансовых фактов и, если неизбежно, обоснованного исходного состояния |
| REF-AUD-002 | Прослеживаемость финансовых исправлений и корректирующих действий | OSBBX | ADR-004/006 требуют provenance и запрета silent rewrite; BP-FIN-001 уже применяет это правило | **Закрыт решением** | Не вводить универсальный Audit/Correction Context; проверять достаточную прослеживаемость в каждом финансовом BP |
| REF-SUBJ-001 | Универсальная внешняя сторона: субъект → роль → договор → операция/обязательство | OSBBX, МДО | Зафиксирован `BP-CONTRACT-001`: внешняя сторона остаётся Subject; Contractual Relationship имеет собственную identity в контексте Subject↔Community; Counterparty/PartyRole не вводятся; Supplier остаётся финансовой семантикой Subject; Document/Obligation/Payment/Expense/Use отделены | **Закрыт решением** | Не возвращаться к универсальному Counterparty без нового сценария; multi-party agreements и специализированные договорные случаи исследовать только при реальной потребности |
| REF-BANK-001 | Импорт/признание/классификация банковских сведений | OSBBX, МДО | Зафиксирован `BP-FIN-BANK-001`: external representation → validation/mapping → Bank Transaction recognition → classification/matching → специализированные финансовые результаты; vendor-specific API semantics не входят в доменную модель | **Закрыт решением** | Конкретные API/XLSX/webhook contracts проектировать отдельно; Payment correction/Refund/Expense остаются специализированными BP |
| REF-METER-001 | Замена прибора учёта | OSBBX, пилотный СТ | Зафиксирован `BP-METER-001`: replacement сохраняет Accounting Point при неизменной измерительной границе; old/new Meter Installations разделены по effective intervals; boundary Reading optional; gap/overlap, коэффициенты, late recording, duplicate/correction, relocation и topology boundary описаны без `Meter Replacement` entity | **Закрыт решением** | Не возвращаться к фундаментальной модели replacement без нового сценария; общий Reading recognition и эксплуатационные ресурсные процессы вести в Stage 7 |
| REF-METER-002 | Автоматическое получение/импорт показаний | МДО, OSBBX, пилотный СТ | Зафиксирован `BP-READING-002`: batch/API/synchronization/streaming используют одну integration boundary и передают values в `BP-READING-001`; historical device/channel/unit mapping, partial success, redelivery/duplicate, correction/re-import/re-recognition, outage/backlog и unknown-device semantics разделены без отдельной Imported/Telemetry Reading entity | **Закрыт решением** | Конкретные MQTT/Modbus/Home Assistant/АСКОЕ/API/CSV contracts проектировать отдельно; следующий ресурсный процесс — контрольное снятие и затем Control Reconciliation |
| REF-METER-003 | Контрольное снятие и сверка связанных точек учёта | OSBBX, МДО, пилотный СТ | `BP-READING-003` определяет Control Observation; `BP-RECON-001` определяет Control Reconciliation как historical process/result с scope/topology/window/completeness, participating/missing/excluded/substitute inputs, nested scopes, correction/recalculation и Calculated Imbalance where possible; Operational Loss остаётся отдельным recognition process | **Закрыт решением** | Не возвращаться к control observation/reconciliation без нового сценария; следующий Stage 7 процесс — Operational Loss recognition |
| REF-OPS-001 | Обращение → операционная заявка / Work Order | DAH, частично МДО | ADR-009 определяет Appeal и прямо не делает его универсальным workflow; самостоятельная семантика операционной работы не определена | **Следующий** | `BP-OPS-001`: отделить обращение от работы, результата, исполнителя, инфраструктурного объекта и затрат |
| REF-DOC-001 | Подписание предметно значимого документа | DAH | ADR-009 уже определяет Signing как действие над конкретной Revision/Representation и отличает его от approval/registration/publication | **Частично закрыт** | Исследовать электронное доказательство подписания, внешние подписи и правовые требования; не пересматривать базовую семантику без причины |
| REF-DOC-002 | Публикация документа/отчёта | МДО, DAH | ADR-009 определяет Publication, Audience и историчность публикаций | **Закрыт решением** | Конкретные публикационные BP вводить по продуктовой необходимости |
| REF-TRANS-001 | Финансовая прозрачность для собственников и контрольных органов | DAH | Финансовые факты и публикационная семантика существуют; конкретный состав раскрываемой информации, аудитория и правила раскрытия не определены | **Backlog** | Сначала определить предметные требования к раскрытию, аудиториям, спорным данным и provenance; затем отобразить их на Read Model / Projection |
| REF-GOV-001 | Неформальный опрос ≠ формальное голосование | МДО, DAH | ADR-008 полно описывает формальные управленческие процедуры/голосования, но отдельная семантика неформального survey не принята | **Backlog** | Исследовать после базовых пользовательских процессов; определить принадлежность коммуникациям или управлению |
| REF-GOV-002 | Электронное участие в собрании и доказательство волеизъявления | DAH, МДО | Канал подачи не меняет природу голоса; управление и подписание разделены; техническое/правовое доказательство удалённого участия не определено | **Отложен** | После исследования электронной подписи описать специализированный процесс удалённого участия |
| REF-INT-001 | Экспорт канонических операций в BAS/BAF с устойчивыми идентификаторами | МДО | ADR-006/011 фиксируют границу внешней бухгалтерии и semantic contract; конкретный контракт отсутствует | **Backlog** | Проектировать отдельный integration semantic contract, не копируя модель BAS/BAF |
| REF-INT-002 | API-first режим Community OS поверх внешней учётной системы | DAH | Архитектурно совместим с ADR-011; не является требованием первого внедрения | **Отложен** | Вернуться после стабилизации пилота и основных интеграционных контрактов |
| REF-UX-001 | Один пользователь в нескольких сообществах | DAH | Предметная и platform-архитектура допускают multi-community identity/context | **Частично закрыт** | Зафиксировать безопасный active-community UX на этапе проектирования интерфейса |
| REF-AUD-001 | Контрольный доступ ревизора/контрольного органа | OSBBX, DAH | ADR-010 не требует специальной фундаментальной роли; BP-ACCESS-001 подтверждает общую модель grants, scopes и независимых предметных оснований | **Частично закрыт** | Конкретные Rights, Scope и policy ревизора определить при появлении продуктового сценария; отдельная фундаментальная роль не требуется |
| REF-PROP-001 | Склад, ТМЦ и основные средства | OSBBX | Community OS не является системой складского/регламентированного учёта; инженерное оборудование может существовать в своей предметной роли независимо | **Закрыт решением** | Не вводить складской bounded context без новой собственной предметной потребности |
| REF-DOC-003 | Генерируемые счета, квитанции, отчёты как источник финансовой истины | OSBBX | ADR-009 и ADR-006 разделяют документ и финансовый факт | **Не вводить отдельно** | Документ считать представлением/оформлением соответствующих фактов |
| REF-PRIV-001 | Публичный список должников / поиск людей по внешним признакам | DAH | Автоматическая публичность не следует из финансовых фактов; аудитория и доступ требуют собственных правил | **Не переносить автоматически** | Только отдельный privacy/legal сценарий при реальной потребности |

## 4. Что уже можно считать закрытым по результатам трёх референсов

Повторного фундаментального исследования сейчас не требуют:

1. различие банковской транзакции и платежа;
2. несколько банковских счетов сообщества;
3. первичное распределение и перераспределение платежа как отдельные процессы при общей семантике Payment Allocation;
4. отказ от универсальной финансовой `Correction`;
5. отказ от отдельной фундаментальной `Community Receipt`;
6. различие источника финансирования, направления использования и финансирования расхода;
7. граница Community OS и регламентированного учёта BAS/BAF;
8. отсутствие собственного складского/бухгалтерского контура ТМЦ и основных средств;
9. различие ресурсного небаланса и финансового состояния;
10. базовая предметная семантика документа, редакции, подписания и публикации;
11. базовая семантика Subject / User Account / Domain Power / Access Right;
12. базовая интеграционная цепочка external representation → validation/mapping → domain recognition;
13. первоначальная миграция Objects/Object Area, Subjects, Ownership/Use и Personal Accounts с preview, partial success, provenance и безопасным re-import.

Новые сценарии могут конкретизировать эти решения, но не должны молча возвращать уже отвергнутые смешения.

## 5. Чёткий план дальнейшей работы

Ниже задаётся **последовательность предметного анализа**, а не план программной реализации. К следующему пункту можно переходить после фиксации результата предыдущего в нормативной документации либо после явного решения, что изменений не требуется.

### Этап 1. BP-ACCESS-001 — предоставление, изменение и прекращение доступа пользователя

**Состояние:** завершён; результат зафиксирован в [`BP-ACCESS-001-USER-ACCESS.md`](../business-processes/BP-ACCESS-001-USER-ACCESS.md), DOMAIN_MODEL и TERMINOLOGY.  
**Источники:** OSBBX + МДО + DAH.  
**Почему первый:** один и тот же пробел независимо выявлен тремя референсами; процесс нужен личному кабинету и должен быть определён до массового onboarding.

Нужно разобрать:

- самостоятельную регистрацию пользователя;
- приглашение существующего пользователя;
- запрос пользователя на связь с уже существующим Subject;
- подтверждение или отказ;
- доступ собственника, совладельца, пользователя, арендатора, представителя и плательщика без смешения этих отношений;
- область доступа: Community / Object / Personal Account / Accounting Point и другие допустимые области;
- несколько пользователей одного объекта/лицевого счёта;
- один пользователь и несколько объектов/сообществ;
- отзыв доступа без прекращения собственности/пользования;
- ошибка связи Account↔Subject;
- изменение собственника;
- конфликт и спорное основание;
- аудит основания и действующего лица.

**Результат:** нормативный BP принят как рабочая предметная основа; выполнены точечные изменения DOMAIN_MODEL/TERMINOLOGY. Новый ADR не требуется: процесс совместим с ADR-003/004/005/010/011/012/015.

### Этап 2. BP-IMPORT-001 — миграция объектов, субъектов, отношений и лицевых счетов

**Состояние:** завершён; результат зафиксирован в [`BP-IMPORT-001-INITIAL-MIGRATION.md`](../business-processes/BP-IMPORT-001-INITIAL-MIGRATION.md). Object Area ранее синхронизирована в DOMAIN_MODEL и TERMINOLOGY; дополнительных нормативных изменений по итогам review не потребовалось.  
**Зависимость:** решения Этапа 1 исключают автоматическое создание User Account, Subject Identity Anchor, Access Grant или Voting Right из импортированного Ownership.

Этот процесс намеренно **не является универсальным Import Workflow**. Он описывает конкретную первоначальную миграцию базовых предметных данных пилотного сообщества. Миграция финансовых фактов, показаний и иной контекстно сложной истории проектируется отдельно вместе с соответствующими предметными процессами.

Нужно определить:

- импорт объектов собственности;
- субъектов;
- собственности и пользования;
- лицевых счетов;
- внешних идентификаторов;
- staging/preview;
- validation и mapping;
- создание нового Subject против сопоставления с существующим;
- неизвестные и неполные сведения;
- конфликты;
- partial success;
- повторную обработку исправленных строк;
- provenance;
- протокол результата импорта.

Необходимо отдельно зафиксировать, что:

- импортированная собственность не создаёт пользовательскую учётную запись или право доступа;
- строка CSV/XLS не является предметным фактом;
- финансовый «начальный баланс» не признаётся источником истины без отдельной миграционной семантики;
- приборы, показания и финансовая история не включаются в этот BP только ради удобства одной загрузки.

**Результат:** `BP-IMPORT-001` принят как рабочая предметная основа без проектирования CSV/XLS-формата, таблиц и UI; зафиксированы отдельные backlog-направления финансовой и ресурсной миграции. Новый ADR не потребовался.

### Этап 3. Внешняя сторона, роль и договор

**Состояние:** завершён; результат зафиксирован в [`BP-CONTRACT-001-CONTRACTUAL-RELATIONSHIP.md`](../business-processes/BP-CONTRACT-001-CONTRACTUAL-RELATIONSHIP.md), DOMAIN_MODEL, TERMINOLOGY и ADR-002.

**Источники:** OSBBX + МДО.  
**Тип работы:** предметно-архитектурное исследование + бизнес-процесс.

Зафиксирована модель:

```text
Subject
→ Contractual Relationship with Community
→ contextual role / basis / subject matter / time
→ явные связи с owning contexts
    ├── Documents
    ├── Financial Obligations / Payments / Expenses
    ├── Object / Use
    ├── Resource / Engineering
    └── иные специализированные факты
```

Ключевые решения:

- внешняя сторона остаётся `Subject`; отдельная identity `Counterparty` не вводится;
- Community не превращается в Subject ради универсальной модели сторон;
- Contractual Relationship принадлежит контексту «Отношения субъекта с сообществом»;
- Supplier остаётся специализированной семантикой финансового контекста;
- Contractual Relationship ≠ Contract Document ≠ Financial Obligation ≠ Payment ≠ Expense ≠ Use;
- наличие договора не создаёт Contractual Relationship, если предмет полностью принадлежит специализированному отношению;
- ГПХ сам по себе не определяет owning relation;
- relation kind ≠ subject matter;
- ISP, оплачивающий использование опор Community, подтверждает необходимость обратного финансового направления без превращения внешней стороны в Supplier;
- multi-party agreements, universal PartyRole, ContractItem/ContractAsset и universal contract workflow отложены до реального сценария.

**Результат:** `REF-SUBJ-001` закрыт решением. Новый bounded context и новый ADR не потребовались; ADR-002 синхронизирован точечно.

### Этап 4. BP-FIN-BANK-001 — банковские сведения → Bank Transaction → предметная классификация

**Состояние:** завершён; результат зафиксирован в `BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md`.

**Зависимость:** ADR-006/011 дают архитектурную основу; принятая модель Этапа 3 определяет Subject / Contractual Relationship и границы внешней стороны для корректной банковской классификации.

Зафиксировано:

- external bank representation ≠ Bank Transaction;
- Bank Transaction ≠ Payment ≠ Payment Allocation ≠ Expense ≠ Financial Obligation;
- Bank Transaction может существовать без Subject, Personal Account и Payment;
- bank counterparty data и purpose text являются matching inputs, а не предметными фактами;
- несколько Community Bank Accounts поддерживаются;
- unknown bank account не создаётся автоматически;
- duplicate/redelivery и corrected external information различаются;
- classification correction ≠ external source correction;
- own-account transfer не создаёт внешний доход, Expense или Payment;
- Bank Transaction↔Payment не имеет universal 1:1 cardinality;
- bank-originated Payment recognition может координироваться банковским BP без введения universal Payment Recognition workflow;
- предложенное распределение ≠ Payment Allocation; Initial Allocation принадлежит `BP-FIN-ALLOCATION-001`;
- aggregate cash deposit не создаёт повторные cash Payments и не делает физического вносителя плательщиком;
- vendor-specific API/XLSX/webhook semantics остаются за пределами доменной модели.

**Результат:** `REF-BANK-001` и `REF-FIN-001` закрыты решением. Новый ADR и новые фундаментальные сущности не потребовались; DOMAIN_MODEL/TERMINOLOGY не требуют дополнительной синхронизации по итогам BP.

### Этап 5. Финансовые исключения и операционные финансовые процессы

Выполнять последовательно:

1. **BP-FIN-ALLOCATION-001 — первичное распределение признанного платежа** — завершён; channel-independent Initial Allocation отделён от Payment recognition и Reallocation;
2. **BP-FIN-002 — исправление ошибочного признания платежа** — завершён; Payment identity correction/invalidation отделены от Reallocation, Refund и source correction;
3. **BP-FIN-003 — возврат платежа** — завершён; Refund моделируется новым Payment, исполняющим ordinary Financial Obligation to return на прослеживаемом refund basis;
4. **BP-FIN-004 — разовое/внецикловое начисление** — завершён; one-off/out-of-cycle закреплены как process/timing semantics ordinary initial Accrual без universal Batch/Snapshot/Storno;
5. **BP-FIN-005 — отмена/перерасчёт начисления и последствия для уже выполненных платежей** — завершён; correction/recalculation/cancellation отделены от Storno, Payment correction, Reallocation и Refund; covered already-paid consequences and obligation continuity/replacement;
6. **BP-CASH-001 — приём наличного платежа без смешения Cash Acceptance, Payment, кассового документа и bank deposit** — завершён; channel-side Cash Acceptance получил собственный referent/identity, incoming Cash Payment recognition и cash→bank boundary определены без universal Cashbox/CashBalance;
7. **BP-CASH-002 — выдача наличных / исходящий наличный платёж без автоматического создания расхода сообщества** — завершён; Cash Disbursement отделён от outgoing Payment, Expense, cash document, own-bank withdrawal и internal custody, определены completion/cardinality/authority/offline boundaries;
8. **BP-EXPENSE-001 — регистрация расхода и его связь со сметой, обязательствами, платежами и источниками финансирования** — завершён; Expense получил самостоятельную identity/amount semantics, Expense Budget Distribution отделён от Payment Allocation, Expense Financing — от Funding Source/Payment/reservation, а supplier/resource/recoverability boundaries проверены на пилотном СТ.

**Состояние Этапа 5:** завершён. Следующий предметный этап — Этап 6, `BP-METER-001`.

Каждый процесс должен сохранять различия Payment, Allocation, Obligation, Accrual, Refund, Expense и Bank Transaction и не вводить универсальную Correction или бухгалтерскую проводку как предметную основу.

### Этап 6. BP-METER-001 — замена прибора и непрерывность точки учёта

**Состояние:** завершён; результат зафиксирован в `BP-METER-001-METER-REPLACEMENT.md`, ADR-007, DOMAIN_MODEL и TERMINOLOGY.

**Источники:** OSBBX, подтверждается общей моделью МДО и практическими сценариями пилотного СТ.

Зафиксировано:

- `Accounting Point ≠ Meter ≠ Meter Installation ≠ Reading ≠ Consumption`;
- replacement сохраняет Accounting Point только при сохранении предметной измерительной границы;
- old Meter Installation заканчивается, new Meter Installation начинается по фактическим effective times;
- gap без Meter допустим и не заполняется fictitious installation;
- overlap не запрещён универсально, но требует реального parallel/control/compound meaning;
- final/initial boundary Reading не обязательны для existence replacement;
- новый Meter не наследует identity/history/register value старого;
- new initial Reading не обязан быть нулевым;
- units/coefficients интерпретируются по исторически применимой installation/rule semantics;
- same-Meter reinstallation ≠ Meter replacement, но может создавать новый installation interval;
- serial number / external device ID / seal ≠ universal Meter identity;
- late recording, duplicate/retry и corrections отделены от actual replacement time;
- installation correction → resource recalculation only through separate owning process;
- resource correction не переписывает финансовые последствия напрямую;
- новый `Meter Replacement`, `Meter Register` или universal Correction не введены.

**Результат:** `REF-METER-001` закрыт решением. Следующий этап — Stage 7 resource operational processes.

### Этап 7. Ресурсные эксплуатационные процессы

**Состояние:** выполняется.

Foundation процесса зафиксирован в `BP-READING-001 — Приём и признание показания`.

Принято:

- observed/reported/received value ≠ Reading;
- Reading имеет собственную исторически различимую identity;
- meter-based historical Reading связывается с applicable Meter Installation по measurement time;
- late/out-of-order values не привязываются к current Meter по record time;
- universal one-Reading-per-day rule не вводится;
- duplicate/conflict не решаются только по value/date;
- owner/manual/control/telemetry/provider values используют одну domain recognition model;
- automatic recognition допускается по rule/semantic contract без превращения automated mechanism в Subject;
- rejected/unresolved input ≠ Reading;
- Reading correction ≠ new observation ≠ Consumption recalculation ≠ financial correction;
- Reading сам по себе не создаёт Consumption, Calculated Imbalance, Operational Loss или Accrual.

Следующая последовательность Stage 7:

1. **BP-READING-001 — приём и признание показания** — завершён;
2. **BP-READING-002 — automatic Reading import/recognition** — завершён; REF-METER-002 закрыт;
3. **BP-READING-003 — Control Observation / контрольное снятие** — завершён;
4. **BP-RECON-001 — Control Reconciliation** — завершён в текущем Draft; REF-METER-003 закрывается;
5. **Operational Loss recognition** — следующий;
6. loss allocation / financial consequences only after separate owning-process analysis.

**Результат:** набор специализированных BP, а не универсальный Meter Workflow.

### Этап 8. BP-OPS-001 — от обращения к операционной работе

**Источники:** прежде всего DAH.

Нужно отделить:

```text
Appeal
≠ Operational Work / Work Order
≠ Assignment
≠ Expense
≠ Document
≠ Management Decision
```

Проверить:

- может ли обращение породить операционную работу;
- может ли работа возникнуть без обращения;
- объект/инфраструктура, к которой относится работа;
- инициатор, ответственный и исполнитель;
- внутренний сотрудник и внешний подрядчик;
- факт выполнения и результат;
- связанные материалы/акты;
- расходы и обязательства как отдельные финансовые факты;
- повторное открытие/новая работа после результата.

**Результат:** решение, требуется ли самостоятельное предметное понятие Work Order, и соответствующий BP.

### Этап 9. Финансовая прозрачность и раскрытие финансовой информации

**Источник:** DAH.

Нужно определить:

- какие финансовые факты показываются собственнику;
- какие — ревизору/контрольному органу;
- какие — публичной аудитории;
- текущие и исторические представления;
- спорные/исправленные данные;
- provenance и момент актуальности;
- связь Projection с source-of-truth;
- отсутствие права изменять домен через read model.

**Результат:** предметные требования к раскрытию и публикации финансовой информации; их последующее отображение на Read Model / Projection не создаёт второго источника финансовой истины.

### Этап 10. Неформальный опрос

**Источники:** МДО + DAH.

Нужно определить, является ли survey:

- коммуникационным механизмом сбора мнений;
- управленческой процедурой без юридически значимого решения;
- локальной специализацией существующих понятий.

**Результат:** решение о необходимости отдельного понятия/BP. Не превращать любой опрос в Voting.

### Этап 11. Электронное подписание и удалённое участие

Сначала исследуется электронное подписание, при этом базовая предметная семантика ADR-009 не пересматривается без необходимости:

- что именно подписывается;
- какой Revision/Representation;
- кто подписант;
- от своего или чужого имени;
- основание полномочия;
- какой внешний результат является доказательством;
- как выполняются validation и recognition внешней подписи;
- что хранится для последующей проверяемости;
- актуальные правовые требования.

После этого отдельно описывается электронное/удалённое участие в управленческой процедуре и голосовании.

### Этап 12. Интеграция с BAS/BAF

Начинать после стабилизации соответствующих финансовых BP.

Нужно определить конкретный semantic contract:

- какие канонические факты экспортируются;
- stable export identity;
- mapping;
- повторная доставка;
- correction/replacement;
- acknowledgment;
- reconciliation;
- что возвращается из внешней системы и получает ли это предметный смысл Community OS.

Не копировать документы, справочники, план счетов или проводки BAS/BAF в предметную модель Community OS.

### Этап 13. Отложенные кандидаты

Возвращаться только при наличии конкретного сценария:

- рекомендованный платёж;
- возвратный резервный/обеспечительный взнос;
- API-first режим поверх внешней бухгалтерии;
- специальные privacy-sensitive сценарии;
- дополнительная продуктовая детализация multi-community UX.

## 6. Правило завершения каждой следующей задачи

Задача предметного анализа считается завершённой только когда:

1. описана реальная потребность, а не функция референса;
2. определены границы процесса и то, что в него не входит;
3. разобраны основной и существенные исключительные сценарии;
4. проверены действующие DOMAIN_MODEL, TERMINOLOGY и связанные ADR;
5. явно зафиксировано: существующей модели достаточно или требуется изменение;
6. если меняется архитектурное решение — создан/изменён ADR;
7. устранены противоречия между нормативными документами;
8. только после этого допускается формирование ТЗ для Codex.

## 7. Порядок приоритетов

Ближайшая последовательность:

```text
1. BP-ACCESS-001 — доступ пользователя — завершено
2. BP-IMPORT-001 — миграция объектов/субъектов/отношений/лицевых счетов — следующий этап
3. Внешняя сторона / роль / договор
4. BP-FIN-BANK-001 — банковские сведения и Bank Transaction — завершено
5. Initial Payment Allocation и последующие финансовые исключения
6. BP-METER-001 — замена прибора
7. Ресурсные эксплуатационные процессы
8. BP-OPS-001 — операционная работа
9. Финансовая прозрачность и раскрытие информации
10. Неформальный опрос
11. Электронное подписание и удалённое участие
12. BAS/BAF semantic contract
13. Отложенные кандидаты по мере появления реальной потребности
```

Изменение этого порядка допустимо, если появляется реальная блокирующая потребность первого внедрения. Такое изменение должно быть осознанным, а не следствием очередной функции, найденной в референсе.

## 8. Поддержание матрицы

После каждого принятого BP, изменения DOMAIN_MODEL/TERMINOLOGY или ADR:

1. обновить статус соответствующего кандидата;
2. указать документ, которым вопрос закрыт или конкретизирован;
3. не удалять закрытые кандидаты — сохранять историю принятых решений;
4. новые находки OSBBX/МДО/DAH сначала добавлять сюда как кандидаты;
5. не создавать параллельные списки backlog в референсах без отражения в этой матрице.

Исходные reference-анализы продолжают хранить факты и наблюдения конкретного внешнего продукта. Эта матрица хранит **текущий рабочий статус и план проработки найденных кандидатов**. Нормативным решение становится только в соответствующем DOMAIN_MODEL, TERMINOLOGY, ADR или принятом бизнес-процессе.
