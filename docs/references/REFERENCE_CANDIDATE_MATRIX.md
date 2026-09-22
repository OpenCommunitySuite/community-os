# Сводная матрица кандидатов из внешних референсов

**Статус:** Working / рабочий документ анализа  
**Область:** OSBBX, «Мій Дім Online» (МДО), DAH Online  
**Актуально относительно:** нормативной модели после BP-TRANS-001; DOMAIN_MODEL 0.26, TERMINOLOGY 0.23  
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
| REF-METER-003 | Контрольное снятие и сверка связанных точек учёта | OSBBX, МДО, пилотный СТ | `BP-READING-003` определяет Control Observation; `BP-RECON-001` — Control Reconciliation/Calculated Imbalance; `BP-LOSS-001` завершает resource chain отдельным Operational Loss recognition без автоматического приравнивания imbalance/supplier loss/owner debt | **Закрыт решением** | Не возвращаться к resource reconciliation/loss recognition без нового сценария; loss allocation анализировать отдельно только при конкретной policy |
| REF-OPS-001 | Обращение → операционная работа / Work Order | DAH, частично МДО, пилотный СТ | Зафиксирован `BP-OPS-001`; `Operational Work` имеет самостоятельную identity, Appeal↔Work поддерживает many-to-many, Work может существовать без Appeal; Work Assignment/Work Result, completion vs acceptance, reopen/follow-up, volunteer/contractor execution, target/evidence/materials и finance/resource/document boundaries определены; ADR-002 расширен 11-м context `Community Operations` после independent multi-review | **Закрыт решением** | Не возвращаться к fundamental Work ownership без нового сценария; конкретные operational policies, priority/SLA/status projections и implementation design определять отдельно |
| REF-DOC-001 | Подписание предметно значимого документа | DAH | ADR-009 уже определяет Signing как действие над конкретной Revision/Representation и отличает его от approval/registration/publication | **Частично закрыт** | Исследовать электронное доказательство подписания, внешние подписи и правовые требования; не пересматривать базовую семантику без причины |
| REF-DOC-002 | Публикация документа/отчёта | МДО, DAH | ADR-009 определяет Publication, Audience и историчность публикаций | **Закрыт решением** | Конкретные публикационные BP вводить по продуктовой необходимости |
| REF-TRANS-001 | Финансовая прозрачность для участников, органов управления/контроля и публичного раскрытия | DAH, пилотный СТ/ОСББ/ЖСК | Зафиксирован `BP-TRANS-001`: personal/community/governance/oversight/public scopes разделены; dynamic view = Read Model/Projection, formal historical disclosure = Document/Revision/Representation/Publication; universal Disclosure entity/rule не вводятся; locally owned rules ADR-005, explicit temporal/additivity semantics, debtor/privacy, bank movement/classification, sub-community scope, resident/tenant, target accumulation и pass-through boundaries определены | **Закрыт решением** | Конкретные disclosure policies, privacy/legal rules, viewer scopes и report metrics задавать локально; не создавать второй financial source of truth |
| REF-GOV-001 | Неформальный опрос ≠ формальное голосование | МДО, DAH | Draft `BP-SURVEY-001` прошёл independent multi-review Claude/Gemini/DeepSeek без BLOCKER; point fixes применены; Survey и Survey Response имеют самостоятельную identity в Communications; Survey Item имеет stable local identity + historical definition/applicability; Survey ≠ Voting, Response ≠ Vote; admissibility provenance, anonymity/multiplicity, correction, external recognition и fixed/reproducible Governance summary уточнены; proposed sync ADR-002/DOMAIN_MODEL/TERMINOLOGY подготовлена в PR #71 | **В работе (Round 1 consolidated / PR #71)** | Владелец проекта принимает/отклоняет модель; при принятии — final consistency check и merge PR #71. Full Round 2 не требуется без новой identity/ownership/model semantics |
| REF-GOV-002 | Электронное участие в собрании и доказательство волеизъявления | DAH, МДО | Канал подачи не меняет природу голоса; управление и подписание разделены; техническое/правовое доказательство удалённого участия не определено | **Отложен** | После исследования электронной подписи описать специализированный процесс удалённого участия |
| REF-INT-001 | Экспорт канонических операций в BAS/BAF с устойчивыми идентификаторами | МДО | ADR-006/011 фиксируют границу внешней бухгалтерии и semantic contract; конкретный контракт отсутствует | **Backlog** | Проектировать отдельный integration semantic contract, не копируя модель BAS/BAF |
| REF-INT-002 | API-first режим Community OS поверх внешней учётной системы | DAH | Архитектурно совместим с ADR-011; не является требованием первого внедрения | **Отложен** | Вернуться после стабилизации пилота и основных интеграционных контрактов |
| REF-UX-001 | Один пользователь в нескольких сообществах | DAH | Предметная и platform-архитектура допускают multi-community identity/context | **Частично закрыт** | Зафиксировать безопасный active-community UX на этапе проектирования интерфейса |
| REF-AUD-001 | Контрольный доступ ревизора/контрольного органа | OSBBX, DAH | ADR-010 не требует специальной фундаментальной роли; BP-ACCESS-001 подтверждает общую модель grants, scopes и независимых предметных оснований | **Частично закрыт** | Конкретные Rights, Scope и policy ревизора определить при появлении продуктового сценария; отдельная фундаментальная роль не требуется |
| REF-PROP-001 | Склад, ТМЦ и основные средства | OSBBX | Community OS не является системой складского/регламентированного учёта; инженерное оборудование может существовать в своей предметной роли независимо | **Закрыт решением** | Не вводить складской bounded context без новой собственной предметной потребности |
| REF-DOC-003 | Генерируемые счета, квитанции, отчёты как источник финансовой истины | OSBBX | ADR-009 и ADR-006 разделяют документ и финансовый факт | **Не вводить отдельно** | Документ считать представлением/оформлением соответствующих фактов |
| REF-DOC-004 | Формирование, печать и выдача кассового документа / ПКО | пилотный СТ, BP-CASH-001, реальная форма КО-1 | Принят и merged PR #59 `BP-DOC-CASH-001`: Document/Revision/Representation отделены от cash/Payment facts; для пилота один ПКО = один Document, ордер + квитанция = composite Representation с addressable semantic roles/segments; быстрый сценарий Reading → obligations → cash → Allocation → print и downstream BAF/BAS не передаёт domain ownership внешней бухгалтерии | **Закрыт решением** | Не возвращаться к fundamental Receipt/Document Part/Cash Operation без нового сценария; current-law требования Украины прорабатывать отдельно в REF-DOC-005 |
| REF-DOC-005 | Правовые и фискальные требования к кассовому документу украинского пилота | пилотный СТ | Архитектурная модель документа и BP-DOC-CASH-001 приняты; Community OS receipt/ПКО не считается автоматически фискальным/RRO/PRRO документом; обязательность формы, реквизитов, подписей, регистрации и кассовой дисциплины ещё требует актуальной проверки | **Backlog** | Провести отдельный current-law legal/formalization analysis для Украины; не смешивать его с предметной моделью BAF/BAS |
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

**Состояние:** завершён в текущем Draft Stage 7 chain.

Зафиксированы специализированные процессы:

1. **BP-READING-001 — приём и признание показания**;
2. **BP-READING-002 — automatic Reading import/recognition**;
3. **BP-READING-003 — Control Observation / контрольное снятие**;
4. **BP-RECON-001 — Control Reconciliation + Calculated Imbalance where applicable**;
5. **BP-LOSS-001 — Operational Loss recognition**.

Ключевые границы Stage 7:

- observed/reported/received value ≠ Reading;
- Reading ≠ Consumption;
- Control Observation ≠ Control Reconciliation;
- Control Reconciliation ≠ Calculated Imbalance;
- Calculated Imbalance ≠ Operational Loss;
- supplier-calculated transformation-loss quantity ≠ Operational Loss automatically;
- Operational Loss may exist without Calculated Imbalance;
- recognized loss may remain temporarily unquantified;
- Consumption / unauthorized consumption / theft suspicion / Meter error / topology error / missing data ≠ Operational Loss automatically;
- Operational Loss ≠ Expense / owner Accrual / Financial Obligation;
- loss allocation and financial consequences remain separate follow-on processes and do not block closure of the resource fact chain.

**Результат:** resource operational chain from received value through recognized Reading, control/reconciliation, Calculated Imbalance and separately recognized Operational Loss is defined without a universal Meter Workflow.

**Следующий основной этап:** Stage 8 — `BP-OPS-001`. Return to loss allocation only when a concrete pilot/business rule requires it.

### Этап 8. BP-OPS-001 — от обращения к операционной работе

**Состояние:** завершён.

Зафиксировано:

- самостоятельный `Operational Work` referent;
- новый 11-й top-level context `Операционная деятельность (Community Operations)`;
- `Appeal ≠ Operational Work`, many-to-many linkage и Work without Appeal;
- `Work Assignment` как historical Subject↔Work contextual-role relation;
- Employee / contractor / community-member-volunteer execution без смешения отношений;
- `Work Result` как самостоятельный historical outcome;
- Completion Assertion ≠ Acceptance;
- Work Result ≠ Document / Expense / Financial Obligation / resource fact;
- typed/contextual target relation без передачи ownership;
- emergency Work без обязательного prior Management Decision under applicable authority;
- materials usage as evidence without inventory/TMC accounting;
- reopen vs linked new Work with preserved result/acceptance history;
- current state as optional projection rather than universal status machine;
- independent multi-review Round 1 completed; second round not required for accepted option A.

**Результат:** `REF-OPS-001` закрыт решением; Stage 8 нормативно синхронизирован.

**Следующий основной этап:** Stage 9 — финансовая прозрачность и раскрытие финансовой информации.

### Этап 9. Финансовая прозрачность и раскрытие финансовой информации

**Состояние:** завершён.

Зафиксирован `BP-TRANS-001 — Финансовая прозрачность и раскрытие финансовой информации`.

Принято:

- Financial disclosure/transparency не является новым financial fact или source of truth;
- universal Financial Disclosure entity и universal Disclosure Rule не вводятся;
- disclosure semantics используют composition locally owned rules/versions по ADR-005;
- dynamic view = Read Model / Projection с declared producer/owner, scope, visibility, freshness и explicit temporal semantics;
- formal historically fixed disclosure = Document / Revision / Representation / Publication;
- personal, Community participant, governance/management, oversight/revision и public scopes различаются;
- resident/tenant, owner/member и public viewer не приравниваются автоматически;
- current Personal Account/object state отделён от person-identifiable history прежнего owner;
- identifiable debtor visibility требует explicit applicable rule/basis;
- sub-Community scope используется только если уже существует в owning domain;
- bank movement и classified Payment/Expense analytics имеют разные semantics; unclassified Bank Transactions остаются representable;
- aggregation обязана объявлять additivity/non-additivity semantics;
- Funding Source/target accumulation не становится reserve/blocked funds автоматически;
- owner resource payments, Community Expense и supplier settlement не сливаются в universal transit flow;
- disputed/corrected facts, historical reconstruction и old formal Publications сохраняют distinct semantics;
- Independent Multi-Review Round 1 завершён; BLOCKER не найдено; полный Round 2 не требуется.

**Результат:** `REF-TRANS-001` закрыт решением; Stage 9 нормативно синхронизирован.

**Следующий основной этап:** Stage 10 — неформальный опрос.

### Этап 10. Неформальный опрос

**Состояние:** Round 1 consolidated; point fixes applied; proposed normative synchronization подготовлена в Draft PR #71. Решение владельца проекта о принятии/merge ещё не зафиксировано.

**Источники:** МДО + DAH.

Independent multi-review Claude/Gemini/DeepSeek подтвердил рабочую модель без BLOCKER и без conceptual redesign:

- Survey является самостоятельным identity-bearing понятием контекста «Коммуникации и обращения»;
- Survey Response является самостоятельным исторически различимым фактом;
- Survey Item имеет stable local identity within Survey и historical response-relevant definition/applicability, но не объявляется fundamental top-level entity;
- accepted Response сохраняет historically explainable admissibility/multiplicity provenance без Survey Eligibility Snapshot;
- response unit, acting Subject/User и technical access различаются;
- anonymous/private/pseudonymous modes различаются; полностью unlinked anonymous Survey не получает identity/unit multiplicity guarantee автоматически;
- respondent modification/withdrawal отличаются от correction erroneous recognition;
- Survey audience ≠ response eligibility ≠ technical access;
- Survey ≠ Voting, Survey Response ≠ Vote;
- survey aggregation остаётся derived Projection; fixed/reproducible summary требуется для significant Governance use;
- universal Survey Result / Survey Right / Survey Participant / Survey Eligibility Snapshot / Survey Version не вводятся;
- materially significant definition changes не silent-rewrite Responses; local history не требует universal Survey Version, а material changes baseline ведут к explicit replacement Survey;
- external submissions используют ADR-011 recognition/rejection/duplicate/redelivery semantics.

Proposed normative sync в PR #71 минимально обновляет ADR-002, DOMAIN_MODEL и TERMINOLOGY без нового bounded context и без изменения Voting model.

**Следующий шаг:** решение владельца проекта по модели; при принятии — final consistency check и merge PR #71. Полный Round 2 не требуется, если не появляется новая identity/ownership/model semantics.

### Этап 11. Электронное подписание и удалённое участие

**Состояние:** Stage 11A Round 1 consolidated; point fixes applied; proposed normative synchronization выполнена в Draft PR #73. Решение владельца проекта о принятии/merge Stage 11A ещё не зафиксировано.

Подэтап 11A — электронное подписание документа — исследуется без преждевременного обобщения ADR-009 за пределы Document context.

Current-law/reference анализ Украины зафиксирован в `UKRAINE_ELECTRONIC_SIGNING_LEGAL_ANALYSIS.md`.

Independent multi-review Claude/Gemini/DeepSeek подтвердил:

- existing ADR-009 `Signing` достаточен для **document-signing scope**;
- отдельные fundamental `Electronic Signing`, `Signing Evidence`, `Signature Validation` не требуются;
- conceptual redesign Stage 11A не нужен;
- semantic target и exact cryptographic target должны быть различены;
- technical file/artifact не становится Document Representation автоматически;
- signer/certificate/provider identity, Subject, User Account, Domain Power и Representation различаются;
- cryptographic validity ≠ domain admissibility;
- applicable signing rule/policy version и material validation/trust context должны быть historically determinable;
- revalidation ≠ new Signing и не переписывает initial validation context;
- external provider/session state может существовать для integration/runtime correlation/reconciliation, но не является Signing;
- correction ошибочно recognized Signing требует explicit historical correction semantics без universal state machine/entity;
- signing completeness может быть derived Read Model / Projection;
- ADR rewrite не требуется.

Один Claude finding был severity BLOCKER из-за внутреннего противоречия Draft: ADR-009 Signing является document-scoped, а Draft называл модель универсально reusable для documentless Vote. Contradiction устранён point fix:

```text
Stage 11A Signing
→ only Document Revision / Representation

documentless signed Governance action
→ open Stage 11B design question
```

Stage 11B должен отдельно решить, требует ли такой action normative generalization Signing target либо Governance-owned action/evidence concept. Fake Document для переиспользования Signing запрещён.

В Draft branch выполнена минимальная normative sync:

- DOMAIN_MODEL — electronic Signing semantics, exact cryptographic target/evidence/provenance/revalidation, multiple Signings и signing-completeness Projection;
- TERMINOLOGY — расширен термин `Подписание документа`;
- DOMAIN_MODEL / TERMINOLOGY — уточнено Membership: несколько historical application/admission/basis records одного Subject не создают автоматически несколько simultaneous Memberships или Voting Rights;
- новые fundamental Membership Admission / Membership Slot / Membership Unit не вводятся.

**Обязательное продуктовое требование Stage 11B для первого пилота СТ:** Community OS должна поддерживать дистанционное участие и юридически пригодное signed electronic expression/Vote для отсутствующих владельцев/допустимых реализаторов права, включая находящихся за границей.

После анализа устава СТ «ЕКСПРЕС» и уточнения фактической практики сохраняется pilot finding:

- сообщённая практика трактует отдельное заявление по каждому участку как «множественное членство» и фактически использует `1 участок = 1 голос`;
- Community OS не создаёт copies of Subject/User Account и не считает несколько заявлений автоматическим доказательством нескольких legally independent Membership;
- ADR-001 уже допускает `one Subject → multiple Voting Rights`;
- фактический pilot rule следует выражать через applicable versioned Voting Rule и qualifying Membership/Plot bases;
- legal validity `1 участок = 1 голос` vs `1 член = 1 голос` остаётся focused legal-profile question;
- Voting Rule/legal profile определяет member-based/object-based/mixed semantics; архитектура не скрывает legal conflict.

**Следующий шаг:** final consistency/readiness check Stage 11A и решение владельца проекта о принятии/merge PR #73. Full Round 2 не требуется, если не появляется generalized non-document Signing, новая fundamental evidence/validation/correction entity, новая Membership identity semantics или изменение Governance ownership.

После принятия Stage 11A начинается Stage 11B — отдельный BP remote participation / electronic voting с profile-driven quorum/presence, Voting Rule, signed ballot/document semantics и обязательным разрешением documentless signed-action boundary.

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
