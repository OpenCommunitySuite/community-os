# Claude Independent Review — Stage 3 Contractual Relationship — Part A of 2

**Project:** Community OS  
**Review target:** Stage 3 analysis + BP-CONTRACT-001  
**Status:** Draft; nothing in this package is accepted merely because it is written here.

## Role

Ты — независимый предметно-архитектурный рецензент. Не соглашайся автоматически с предложенной моделью.

Используй Part A вместе с Part B. Part B содержит действующую нормативную базу и выдержки из референсов.

Главный вопрос: действительно ли Community OS нужен самостоятельный `Contractual Relationship`, или предложенная модель создаёт лишнюю абстракцию/дублирование существующих Subject↔Community relations, Basis, Document или Financial Obligation.

## Review checklist

Проверь как минимум:

1. Не создаём ли мы лишнюю универсальную сущность вместо специализированных отношений.
2. Правильно ли `Contractual Relationship` помещён в контекст «Отношения субъекта с сообществом».
3. Не нужно ли считать договор самостоятельным Document-only concept вместо отношения.
4. Не смешаны ли relationship, Basis, Contract Document и Financial Obligation.
5. Обоснована ли stable identity relationship.
6. Корректен ли baseline `1 Community ↔ 1 Subject`; не является ли он слишком узким или, наоборот, преждевременно сложным.
7. Не требуется ли universal Party/Counterparty для того, чтобы Community не являлся Subject.
8. Не создают ли relation kind + contextual roles скрытую universal PartyRole system.
9. Сохранено ли ownership `Supplier` финансовым контекстом.
10. Не противоречит ли draft действующей широкой терминологии Supplier, где Contractor сейчас приведён как пример.
11. Корректно ли один relationship может быть basis для obligations в обоих направлениях.
12. Корректно ли прекращение relationship не отменяет outstanding obligations/payments/history.
13. Не создаёт ли relationship автоматический Use/Engineering relation.
14. Достаточно ли границы для ISP scenario: provider платит Community за использование опор.
15. Достаточно ли границы Bank Subject ≠ External Integration Party ≠ bank transaction counterparty data.
16. Корректно ли private Subject↔Subject lease вынесен за границы Contractual Relationship with Community.
17. Не создаём ли лишний relationship для каждой разовой покупки/payment/invoice.
18. Правильно ли change vs correction vs extension vs new relationship.
19. Нужен ли universal Contract Version или draft правильно его не вводит.
20. Достаточна ли историческая семантика number/date/effective period.
21. Не нужен ли новый ADR; если нужен — какая именно архитектурная граница не покрыта текущими ADR.
22. Есть ли существенный сценарий первого СТ/ОСББ, который draft не покрывает.
23. Не создаёт ли UI «Контрагенты» необходимость domain Counterparty entity.
24. Можно ли после исправлений использовать BP как основу для нормативной синхронизации DOMAIN_MODEL / TERMINOLOGY / ADR-002.

## Output format

Сначала одно заключение:

- **Blocking contradictions found**
- **No blocking contradictions, significant issues found**
- **No blocking contradictions; only local improvements**

Затем таблица:

| Severity | Section | Normative source | Finding | Why it matters | Recommended change |
|---|---|---|---|---|---|

Severity:
- BLOCKER
- MAJOR
- MINOR

Не выставляй баллы.

Отдельно:

### A. Is Contractual Relationship justified?
Ответь прямо: самостоятельное понятие оправдано / не оправдано / оправдано после изменения границ. Объясни.

### B. Counterparty
Нужна ли фундаментальная domain entity Counterparty?

### C. Context ownership
Какой existing context должен владеть Contractual Relationship, если понятие оправдано?

### D. Supplier
Проверь отсутствие скрытого переноса Supplier из financial context.

### E. ISP poles scenario
Разбери сценарий Subject-провайдера, который платит Community за использование инфраструктуры.

### F. Need for ADR
Нужен ли новый ADR или достаточно точечной синхронизации ADR-002 + DOMAIN_MODEL + TERMINOLOGY?

### G. Must fix before normative sync
Только BLOCKER/MAJOR.

### H. Final
Можно ли после указанных исправлений переходить к нормативной синхронизации?

---

# SOURCE A1 — Stage 3 analysis

# Stage 3 — Анализ внешней стороны, роли и договорного отношения

**Статус:** Working / исследование, не нормативный документ  
**Этап:** 3 из REFERENCE_CANDIDATE_MATRIX  
**Кандидат:** REF-SUBJ-001  
**Область:** субъекты / отношения субъекта с сообществом / финансы / документы / ресурсы / операции

> Документ фиксирует результаты предметно-архитектурного исследования. Он не изменяет DOMAIN_MODEL, TERMINOLOGY или ADR до отдельного принятия решения.

## 1. Цель

Определить, достаточно ли текущей модели `Subject + Supplier + Supplier Contract` для отношений Community с внешними физическими и юридическими лицами, либо требуется более общая предметная модель, не создающая бухгалтерскую сущность `Counterparty`.

Исследование должно ответить на вопросы:

- что является устойчивой идентичностью внешней стороны;
- является ли «поставщик» типом Subject или ролью в конкретном отношении;
- нужен ли самостоятельный исторически значимый объект договорного отношения;
- чем договорное отношение отличается от документа договора;
- как договорное отношение связано с финансовыми обязательствами, платежами, расходами, ресурсными и операционными фактами;
- где должна находиться предметная ответственность за это отношение;
- какие сценарии первого внедрения должны поддерживаться без специальных обходных сущностей.

## 2. Нормативная база

Исследование опирается на:

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-002 — архитектурные контексты и границы;
- ADR-003 — конфигурация сообщества и исторически значимые настройки;
- ADR-004 — история, предметный аудит и воспроизводимость;
- ADR-005 — правила, версии правил и воспроизводимость;
- ADR-006 — финансовые обязательства, начисления и расчёты;
- ADR-009 — документы, публикации, обращения и коммуникации;
- ADR-010 — идентичность, полномочия и доступ;
- ADR-011 — интеграции и внешняя информация;
- `docs/references/OSBBX_REFERENCE_ANALYSIS.md`;
- `docs/references/MIYDIMONLINE_REFERENCE_ANALYSIS.md`;
- `docs/references/REFERENCE_CANDIDATE_MATRIX.md`.

Референсы являются источниками наблюдений, а не требований.

## 3. Наблюдения из референсов

OSBBX использует понятие «контрагент» в ряде операций и показывает внешние стороны шире, чем только поставщиков. В reference-анализе уже зафиксирован вопрос:

```text
Субъект → роль во взаимоотношении → договор/операция
```

и отдельно отмечено, что добавлять параллельную фундаментальную сущность `Контрагент` без проверки общей модели не следует.

«Мій Дім Online» показывает договоры организации с юридическими лицами, период действия, номер и связь с начислениями. Reference-анализ отдельно отмечает обратный относительно Supplier сценарий, когда организация сама оказывает услугу юридическому лицу.

Эти наблюдения подтверждают потребность в общей модели внешнего договорного отношения, но не определяют её внутреннюю структуру.

## 4. Исходные факты текущей модели

### 4.1. Community не является Subject

Community является самостоятельной организационной единицей предметной модели.

Subject является участником предметных отношений и в текущей модели может быть физическим или юридическим лицом.

Следовательно, типичный договор Community с юридическим лицом нельзя корректно свести к универсальному `Subject ↔ Subject` без изменения фундаментального смысла Community.

### 4.2. Supplier уже является Subject

Supplier определяется как Subject, предоставляющий Community ресурс, услугу или иное обеспечение.

Следовательно, Supplier не требует второй идентичности внешней стороны.

### 4.3. Финансовое обязательство не является моделью договора

ADR-006 допускает обязательства:

- перед Community;
- самого Community перед поставщиками и другими сторонами.

При этом ADR-006 прямо не вводит универсальную модель любых двусторонних договорных отношений.

### 4.4. Документ не является договорным отношением

ADR-009 закрепляет:

```text
Document
≠ domain fact
≠ basis
≠ financial obligation
```

Следовательно, PDF/скан договора, его Revision или Representation не могут быть устойчивой идентичностью самого договорного отношения.

## 5. Проверочный сценарий: интернет-провайдер использует инфраструктуру Community

Пусть интернет-провайдер размещает кабели на опорах Community и платит за их использование.

Минимальная предметная картина:

```text
Subject: ISP
Community
    ↓
Contractual Relationship
    ↓
основание использования инфраструктуры
    ↓
Financial Obligation: ISP → Community
    ↓
Payment
    ↓
Bank Transaction / Cash movement where applicable
```

Если Community OS предметно учитывает конкретные опоры или иной участок инженерной инфраструктуры, договорное отношение может быть основанием соответствующего использования. Но договорное отношение не становится инженерной топологией или объектом инфраструктуры.

Если конкретные опоры не моделируются поштучно, допустим предмет договора вида «использование 35 опор» без обязательного создания 35 универсальных Asset/TMC entities.

## 6. Ключевой вывод из сценария провайдера

Финансовое направление не является свойством Subject или самого договорного отношения.

Обычный Supplier-сценарий:

```text
Community → obligation → Supplier
```

Сценарий аренды/использования инфраструктуры:

```text
Provider Subject → obligation → Community
```

Один и тот же Subject теоретически может одновременно:

- платить Community за использование инфраструктуры;
- оказывать Community интернет-услуги;
- участвовать в другом договорном отношении.

Поэтому нельзя вводить глобальный тип:

```text
Subject.type = Supplier
```

или считать `Supplier` универсальной внешней стороной.

## 7. Предлагаемый кандидат: Contractual Relationship

### 7.1. Рабочее определение

**Договорное отношение с сообществом (Contractual Relationship)** — самостоятельное исторически значимое отношение между конкретным Community и определённым Subject, возникшее на договорном или ином согласованном основании и описывающее предметно значимую область их взаимодействия.

Это определение пока является предложением исследования, а не нормативным термином.

### 7.2. Предлагаемое архитектурное владение

Кандидат естественно относится к существующему контексту ADR-002:

**«Отношения субъекта с сообществом»**.

Новый верхнеуровневый bounded context «Договоры» не требуется.

Контекст документов владеет документами договора.

Финансовый контекст владеет финансовыми обязательствами, начислениями, платежами, расходами и другими финансовыми фактами.

Ресурсный/инженерный и объектный контексты владеют соответствующими предметами использования, подключения и эксплуатации.

## 8. Минимальная семантика Contractual Relationship

### 8.1. Stable identity

Contractual Relationship должен иметь устойчивую предметную идентичность.

Идентичность отношения не равна:

- Subject identity;
- Community identity;
- номеру договора;
- имени файла;
- Document identity;
- банковскому назначению платежа;
- внешнему идентификатору интеграции.

Один Subject может иметь несколько одновременных Contractual Relationships с одним Community.

### 8.2. Участники

Минимальный текущий кандидат связывает:

- одно Community;
- один определённый Subject.

Неизвестная внешняя сторона не заменяется фиктивным `Unknown Counterparty`.

Многосторонний юридический договор с несколькими внешними Subjects является отдельным открытым вопросом. Настоящий этап не должен изображать его несколькими независимыми отношениями без проверки реального сценария.

### 8.3. Контекстные роли сторон

В рамках отношения могут быть предметно значимы роли сторон, например:

- supplier / customer;
- contractor / customer;
- lessor / lessee;
- infrastructure provider / infrastructure user;
- service provider / service recipient;
- bank / banking customer;
- иные применимые роли.

Роль:

- не является типом Subject;
- не является Access Role;
- не является Domain Power;
- не создаёт User Account;
- не образует пока универсальную сущность `PartyRole`;
- имеет смысл только в контексте конкретного отношения или процесса.

Одно отношение может содержать несколько предметно значимых ролей, если это следует из фактического соглашения.

### 8.4. Основание

Contractual Relationship имеет определимое основание в объёме, известном Community OS.

Основанием может быть, например:

- заключённый договор;
- присоединение к публичной оферте;
- иное предметно допустимое соглашение.

Основание не тождественно документу.

Отсутствие загруженного файла договора не уничтожает отношение, если само отношение и достаточные сведения о нём предметно признаны.

### 8.5. Предмет отношения

Предмет отношения должен быть определим в достаточной для связанных процессов степени.

Примеры:

- поставка электроэнергии;
- поставка воды;
- вывоз отходов;
- ремонтные работы;
- банковское обслуживание;
- предоставление интернет-услуги;
- использование опор для размещения кабеля;
- аренда помещения или иной инфраструктуры.

Не вводится универсальная сущность `ContractItem` или `ContractAsset`.

Если предмет относится к Object, Engineering System, инфраструктурному элементу или другому существующему предмету Community OS, используется явная связь с соответствующим контекстом, а не копия этого предмета внутри Contractual Relationship.

### 8.6. Временная семантика

Для Contractual Relationship предметно значим период действия, когда он известен и применим.

Следует различать, где это важно:

- момент заключения/возникновения соглашения;
- effective start;
- effective end;
- момент фиксации в Community OS;
- дату подписания конкретного Document/Revision;
- дату изменения условий.

Техническая дата создания записи не является датой начала договорного отношения.

Применимый интервал исторического отношения использует общую семантику `[start, end)`, если это соответствует нормативной модели исторических отношений.

### 8.7. Номер и внешние обозначения

Номер договора может быть известной характеристикой или ссылочным реквизитом отношения.

Он:

- не является внутренней identity;
- не обязан существовать;
- не обязан быть глобально уникальным;
- не создаёт Contractual Relationship автоматически;
- не доказывает identity отношения при совпадении номера в разных контекстах.

Правило уникальности номера, если требуется конкретным Community или видом отношений, относится к локальной policy.

### 8.8. Связанные документы

Contractual Relationship может существовать без Document.

С ним могут быть связаны:

- основной договор;
- приложения;
- дополнительные соглашения;
- акты;
- счета;
- иные документы.

Сохраняется различие:

```text
Contractual Relationship
≠ Contract Document
≠ Document Revision
≠ Document Representation
```

Документ может оформлять, подтверждать, изменять или быть основанием отношения согласно своей локальной семантике.

### 8.9. Условия договора

Предметно значимые условия могут использоваться связанными контекстами, но настоящий кандидат не вводит универсальную EAV/JSON-модель `Contract Terms`.

Например:

- ставка за одну опору;
- цена ресурса;
- периодичность оплаты;
- объём услуги;
- условия индексации;
- разрешённая область использования инфраструктуры

могут требовать специализированной финансовой, ресурсной, объектной или операционной семантики.

Если условие использовано в исторически значимом расчёте или действии, изменение текущего условия не должно молча переписывать использованный исторический контекст.

### 8.10. Изменения и прекращение

Изменение условий, продление, прекращение, расторжение, замена стороны, исправление ошибочных сведений и заключение нового договора являются потенциально разными ситуациями.

Настоящий этап не вводит универсальный lifecycle enum договора.

Должно сохраняться различие:

```text
real relationship change
≠ correction of erroneous data
≠ new contractual relationship
```

Критерии определяются фактической предметной семантикой и применимым процессом.

## 9. Что Contractual Relationship НЕ создаёт автоматически

Сам факт отношения не создаёт автоматически:

- Financial Obligation;
- Accrual;
- Payment;
- Expense;
- Bank Transaction;
- Personal Account;
- Ownership;
- Use;
- Access Grant;
- User Account;
- Voting Right;
- Membership;
- Domain Power;
- Document.

Связанные контексты используют отношение как основание только согласно своим правилам.

## 10. Финансовая связь

Один Contractual Relationship может быть основанием:

- нуля, одного или многих Financial Obligations;
- обязательств Community перед Subject;
- обязательств Subject перед Community;
- обязательств в обоих направлениях в разные моменты, если это следует из соглашения;
- начислений или иных финансовых расчётов согласно отдельному процессу;
- расходов Community, если соответствующий финансовый смысл признан отдельно.

Отношение само не имеет постоянного направления «приход/расход».

Payment исполняет финансовое отношение согласно финансовой семантике и не доказывает наличие Contractual Relationship сам по себе.

## 11. Сценарий ISP: расчёт за использование опор

Допустимый предметный сценарий:

```text
Contractual Relationship:
    Community ↔ ISP
    subject matter: использование инфраструктуры
    scope: 35 опор
    applicable pricing rule: X грн / опора / месяц
            ↓
financial calculation / accrual according to financial process
            ↓
Financial Obligation:
    obliged party = ISP
    entitled party = Community
            ↓
Payment
            ↓
Bank Transaction ↔ Payment classification
```

При этом:

```text
35 опор ≠ Financial Obligation
rate ≠ Financial Obligation
Contractual Relationship ≠ Financial Obligation
Payment ≠ Contractual Relationship
Bank Transaction ≠ Payment
```

## 12. Использование инфраструктуры

Договорное основание и фактическое использование инфраструктуры являются разными предметными фактами.

Если использование конкретного Object или инженерного элемента имеет самостоятельный предметный смысл, соответствующий owning context должен хранить такое отношение/состояние.

```text
Contractual Relationship
        ↓ может быть основанием
Subject uses Object / infrastructure scope
```

Contractual Relationship не должен копировать инженерную топологию.

Не требуется моделировать физическую опору как ТМЦ/основное средство только потому, что она фигурирует в договоре. Инженерный элемент появляется в Community OS только если он нужен собственной предметной модели эксплуатации/учёта.

## 13. Supplier и граница финансового контекста

Рабочий вывод исследования:

**Supplier остаётся Subject без отдельной identity, но его специализированная семантика остаётся во владении финансового контекста согласно ADR-002/ADR-006.**

Contractual Relationship не получает ownership понятия Supplier.

Договорное отношение может быть одним из оснований или контекстов, на котором финансовый процесс использует/признаёт Subject как Supplier, но:

- не каждое Contractual Relationship делает Subject поставщиком;
- Supplier не является типом Subject;
- Supplier не является универсальной внешней стороной;
- Contractual Relationship не должен дублировать отдельный financial Supplier record как вторую identity.

На этапе нормативной синхронизации следует уточнить формулировку Supplier так, чтобы одновременно сохранить финансовое владение понятия и явно исключить трактовку Supplier как отдельного типа/identity Subject.

## 14. Contractor, Lessor, Lessee, Bank и другие роли

Не предлагается создавать универсальный справочник или сущность всех ролей.

Роль определяется конкретным отношением/процессом.

Примеры:

- Contractor — Subject, выполняющий работы;
- Lessor — сторона соответствующего отношения аренды;
- Lessee — сторона соответствующего отношения аренды;
- Bank — юридическое лицо как Subject, когда оно участвует в предметном отношении;
- Payer/Recipient — роли конкретного финансового факта, которые не обязаны быть договорными ролями.

Один и тот же Subject может иметь разные роли одновременно.

## 15. Банк как проверка границ

Следует различать:

```text
Bank legal entity as Subject
≠ bank as contractual service provider
≠ External Integration Party of banking API
≠ counterparty data inside bank transaction
```

Полученная банковская информация о внешней стороне не создаёт Subject или Contractual Relationship автоматически.

Эта граница является обязательной предпосылкой будущего `BP-FIN-BANK-001`.

## 16. Частная аренда между Subjects

Если собственник участка передал участок пользователю/арендатору, а Community не является стороной договора:

```text
Owner Subject
Tenant Subject
Property Object
```

основным предметным фактом Community OS является соответствующее Subject↔Object отношение, например Use/Lease, если оно признано.

Документ частного договора может быть основанием или подтверждением этого отношения.

Такой случай не должен автоматически создавать Contractual Relationship with Community.

Настоящий этап не вводит универсальный реестр всех договоров между любыми Subjects.

## 17. Разовая покупка и случайный платёж

Не каждое взаимодействие с внешним Subject требует Contractual Relationship.

Разовая покупка, единичный чек, входящий перевод или исходящий Payment сами по себе не доказывают устойчивого договорного отношения.

Contractual Relationship предметно оправдан, если само отношение имеет значимую идентичность, условия, период, предмет или последствия, которые необходимо отличать от отдельных операций.

Формальный одноразовый подряд или иной юридически значимый договор может быть Contractual Relationship даже при одной финансовой операции, если отношение само по себе предметно значимо.

## 18. UI «Контрагенты»

UI может предоставлять список «Контрагенты» как Read Model / Projection над Subjects, имеющими релевантные отношения или финансовые факты с Community.

Это не требует фундаментальной сущности `Counterparty`.

```text
Counterparties UI
= projection of Subjects + relevant relationships
≠ source-of-truth Counterparty entity
```

Такой подход сохраняет практичный интерфейс без дублирования Subject identity.

## 19. Предлагаемые инварианты кандидата

1. Counterparty не вводится как параллельная identity рядом с Subject.
2. Contractual Relationship имеет собственную identity и не равен Subject.
3. Community не преобразуется в Subject только ради договора.
4. Subject может иметь несколько Contractual Relationships с одним Community.
5. Contract number не является identity Contractual Relationship.
6. Contractual Relationship может существовать без загруженного Document.
7. Contractual Relationship ≠ Contract Document.
8. Contractual Relationship ≠ Financial Obligation.
9. Contractual Relationship ≠ Payment.
10. Contractual Relationship ≠ Expense.
11. Contractual Relationship ≠ Use/Lease relation к Object.
12. Contractual role ≠ Subject type.
13. Contractual role ≠ Access Role.
14. Supplier является Subject в предметной роли, а не отдельной identity.
15. Финансовое направление не является постоянным свойством Contractual Relationship.
16. Один Contractual Relationship может быть основанием нескольких Financial Obligations.
17. Финансовые обязательства по одному отношению могут иметь разные направления, если это следует из предметного соглашения.
18. Bank Subject ≠ External Integration Party.
19. Bank transaction party data не создаёт Subject или Contractual Relationship автоматически.
20. Связанные документы не становятся договорным отношением автоматически.
21. Изменение текущих условий не переписывает исторически использованные значения и результаты.
22. Разовая финансовая операция не создаёт Contractual Relationship автоматически.
23. Частный договор между Subjects без участия Community не становится Contractual Relationship with Community автоматически.
24. Универсальные PartyRole, ContractItem, ContractAsset и Counterparty не вводятся на этом этапе.

## 20. Проверочные сценарии

### 20.1. Поставщик электроэнергии

```text
Community ↔ Energy Supplier Subject
→ Contractual Relationship
→ resource/price terms as applicable
→ Community Financial Obligation
→ Payment
```

### 20.2. ТБО

```text
Community ↔ Waste Service Subject
→ Contractual Relationship
→ service period / applicable conditions
→ Community Financial Obligation
→ Payment
```

### 20.3. Подрядчик ремонта

```text
Community ↔ Contractor Subject
→ Contractual Relationship
→ work subject/scope
→ Operational Work / acceptance evidence where applicable
→ Financial Obligation
→ Expense
→ Payment
```

Порядок возникновения этих фактов определяется конкретным процессом и не выводится из схемы автоматически.

### 20.4. Интернет-провайдер арендует/использует опоры

```text
Community ↔ ISP Subject
→ Contractual Relationship
→ infrastructure-use basis
→ ISP Financial Obligation to Community
→ Payment
```

### 20.5. Тот же ISP оказывает интернет-услугу Community

Может существовать:

- второе отдельное Contractual Relationship;
- либо одно более сложное соглашение, если фактически один договор регулирует оба предмета.

Система не объединяет отношения только по совпадению Subject.

### 20.6. Банк

```text
Community ↔ Bank Subject
→ Contractual Relationship for banking service

Bank API / statement source
→ External Integration Party
```

Это разные отношения.

### 20.7. Частная аренда участка

```text
Owner Subject ↔ Property Object ↔ Tenant Subject
```

Community не является стороной договора.

Не создаётся Contractual Relationship with Community только из-за наличия Use/Lease.

### 20.8. Неизвестный отправитель банковского перевода

Bank Transaction может существовать до установления Subject.

Фиктивный Subject и Contractual Relationship не создаются.

## 21. Решения по открытым вопросам минимальной модели

Ниже фиксируются рабочие решения исследования. Они ещё не являются нормативными изменениями DOMAIN_MODEL / TERMINOLOGY / ADR.

### 21.1. Кардинальность внешних Subjects

Базовая модель Stage 3 остаётся бинарной:

```text
1 Community ↔ 1 Subject
```

в рамках одного Contractual Relationship.

Это соответствует существующему архитектурному контексту «Отношения субъекта с сообществом» и не требует преждевременного универсального `Party` / `AgreementParty`.

Многосторонний договор с несколькими внешними Subjects сознательно не моделируется фиктивным набором независимых отношений, если такое разбиение искажает его смысл. Поддержка настоящих multi-party agreements откладывается до реального сценария.

### 21.2. Relation kind и contextual roles

Relation kind и роли сторон являются разными характеристиками.

- **relation kind** классифицирует отношение как целое, если такая классификация нужна;
- **contextual role** описывает роль стороны в конкретном отношении.

Пример:

```text
kind: infrastructure use
Community role: infrastructure provider / lessor
Subject role: infrastructure user / lessee
```

Ядро не вводит закрытый enum видов договорных отношений. Допустимые виды могут определяться конфигурацией Community или специализированным процессом.

Не вводится универсальная entity `PartyRole`.

### 21.3. Identity при изменении условий

Стабильная identity Contractual Relationship сохраняется, если фактически продолжается то же отношение, а изменение является:

- дополнительным соглашением;
- продлением;
- изменением тарифа/ставки;
- изменением предметно значимого условия;
- иной модификацией того же соглашения.

Новое Contractual Relationship требуется, когда фактически возникло новое самостоятельное соглашение/отношение.

Номер договора, новый файл или новая редакция документа сами по себе не определяют эту границу.

Исправление ошибочно записанных сведений также не создаёт новое отношение.

Замена Subject не выполняется молчаливым редактированием стороны. Правопреемство, уступка/перевод или иная юридически значимая замена стороны требуют собственной предметной интерпретации; до появления сценария они не унифицируются одним правилом.

### 21.4. Номер, дата и период

Для Contractual Relationship должны быть явно различимы, где применимо:

- subject/reference number;
- дата заключения или возникновения соглашения;
- effective start;
- effective end;
- recording/recognition time.

Ни одно из этих значений не является внутренней identity.

Номер и дата заключения не обязательны для любого Contractual Relationship. Effective start/end могут быть неизвестны в допустимых случаях согласно общей исторической семантике.

### 21.5. Связь с Object / Engineering scope

Универсальный `ContractAsset`, `ContractTarget` или полиморфный «предмет договора» как суперсущность не вводится.

Contractual Relationship может:

- иметь достаточное предметное описание;
- иметь явные context-specific links к существующим Objects/Engineering concepts;
- быть основанием специализированного отношения использования;
- предоставлять context-specific input для финансового расчёта.

Если в договоре сказано «35 опор», это не требует создания 35 Asset entities.

Если конкретные опоры нужны инженерной/эксплуатационной модели, их identity и связи принадлежат соответствующему owning context.

### 21.6. Supplier

Supplier сохраняется как полезный нормативный термин финансового контекста.

Его следует уточнить как специализированную финансовую семантику/роль установленного Subject, а не отдельный тип или identity Subject.

Contractual Relationship может быть основанием или контекстом для финансовых отношений с Supplier, но не получает ownership понятия Supplier.

Не каждый внешний Subject является Supplier. Contractor, Lessor, Lessee, Bank, Payer и Recipient не сводятся автоматически к Supplier.

### 21.7. Нужен отдельный Business Process

Да.

До нормативного добавления Contractual Relationship требуется отдельный бизнес-процесс, описывающий как минимум:

- recognition нового отношения;
- создание отношения без Contract Document;
- связь с Subject;
- исправление ошибочной стороны;
- изменение существенных условий;
- продление;
- прекращение;
- отличие correction от реального изменения;
- отличие изменения существующего отношения от нового отношения;
- связь документов с отношением;
- последствия для зависимых будущих процессов без автоматического cascade rewrite.

Рабочий кандидат:

`BP-CONTRACT-001 — Признание, изменение и прекращение договорного отношения с сообществом`.

### 21.8. ADR-002

Новый верхнеуровневый контекст не требуется.

Существующее определение контекста «Отношения субъекта с сообществом» уже открыто допускает другие отношения помимо Membership / Employment / Management Body Participation.

После принятия BP следует рассмотреть точечную синхронизацию ADR-002: добавить Contractual Relationship в ключевые понятия контекста, если это улучшает явность архитектурной карты. Новый отдельный ADR только ради Contractual Relationship предварительно не требуется.

## 22. Предварительный архитектурный вывод

На текущем этапе наиболее согласованным направлением является:

```text
Subject
    ↓
Contractual Relationship with Community
    ↓
context-specific roles + basis + subject matter + time
    ↓
explicit links to owning contexts
    ├── Documents
    ├── Financial Obligations / Payments / Expenses
    ├── Object / Use where applicable
    ├── Resource / Engineering facts where applicable
    └── Operational Work where applicable
```

При этом не вводятся:

- Counterparty entity;
- universal Party supertype;
- universal PartyRole entity;
- universal ContractItem/ContractAsset;
- universal Contract workflow;
- автоматическое создание финансовых или иных фактов из самого договора.

Новый верхнеуровневый bounded context пока не требуется.

## 23. Следующий шаг исследования

Минимальная модель достаточна для перехода к бизнес-процессу.

Следующий документ:

`BP-CONTRACT-001 — Признание, изменение и прекращение договорного отношения с сообществом`.

В BP необходимо проверить предложенную модель на сценариях:

1. поставщик электроэнергии;
2. ТБО;
3. подрядчик;
4. ISP, оплачивающий использование опор;
5. тот же ISP как поставщик услуги самому Community;
6. банковское обслуживание;
7. частная аренда участка, где Community не является стороной;
8. разовая операция без устойчивого договорного отношения;
9. договорное отношение без загруженного Contract Document;
10. прекращение отношения при наличии неисполненных Financial Obligations.

Нормативная синхронизация DOMAIN_MODEL / TERMINOLOGY / ADR-002 выполняется только после принятия BP.


---

# SOURCE A2 — Full BP-CONTRACT-001

# BP-CONTRACT-001 — Признание, изменение и прекращение договорного отношения с сообществом

**Статус:** Draft  
**Контекст:** отношения субъекта с сообществом / документы / финансы / объекты и инженерная инфраструктура  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет признание, изменение и прекращение исторически значимого договорного отношения между конкретным Community и определённым Subject.

Процесс нужен для сценариев, в которых само устойчивое отношение имеет предметный смысл, не сводимый к одному документу, платежу, обязательству, расходу или операции.

Типовые примеры:

- поставка электроэнергии;
- поставка воды;
- вывоз отходов;
- подрядные работы;
- банковское обслуживание;
- предоставление интернет-услуги Community;
- использование внешним Subject инфраструктуры Community за плату;
- аренда помещения или иной инфраструктуры;
- другие устойчивые договорные отношения Community с внешним Subject.

## 2. Основные различия

Сохраняются следующие различия:

```text
Subject
≠ Contractual Relationship
≠ Contract Document
≠ Financial Obligation
≠ Accrual
≠ Payment
≠ Expense
≠ Use / Lease relation to Object
≠ External Integration Party
```

Дополнительно:

- Supplier ≠ Subject type;
- contractual role ≠ Access Role;
- contract number ≠ Contractual Relationship identity;
- document signing date ≠ effective start relationship;
- relationship termination ≠ cancellation of outstanding obligations;
- correction of wrong data ≠ real relationship change;
- amendment/extension ≠ automatically new relationship;
- new file/revision ≠ automatically new relationship;
- bank transaction party data ≠ established Subject;
- one-time financial operation ≠ automatically Contractual Relationship.

## 3. Границы процесса

Процесс начинается, когда существует предметная потребность признать или изменить устойчивое договорное отношение Community с определимым Subject.

Процесс заканчивается, когда:

- отношение признано, изменено, продлено, прекращено либо признано новым отдельным отношением;
- существенная историческая семантика сохранена;
- связанные документы, основания и context-specific links установлены только в допустимом объёме;
- никакие финансовые, ресурсные, объектные или access-факты не созданы автоматически только из факта Contractual Relationship.

Настоящий BP не является:

- универсальным contract management workflow;
- системой юридического документооборота;
- бухгалтерским учётом договоров;
- CRM контрагентов;
- реестром всех договоров между любыми Subjects;
- универсальной моделью закупок;
- универсальным workflow согласования договора.

## 4. Что входит и не входит

### 4.1. Входит

Процесс определяет:

- признание нового Contractual Relationship;
- identity отношения;
- связь с Community и Subject;
- contextual roles;
- предмет отношения;
- известное основание;
- номер/дату/период, если применимо;
- связь с Contract Documents;
- существенное изменение отношения;
- продление;
- прекращение;
- correction ошибочных сведений;
- отличие modification от нового отношения;
- историческую объяснимость;
- последствия для связанных контекстов на уровне границ ответственности.

### 4.2. Не входит

Процесс не создаёт самостоятельно:

- Financial Obligation;
- Accrual;
- Payment;
- Bank Transaction;
- Expense;
- Personal Account;
- Ownership;
- Use;
- инженерный элемент;
- User Account;
- Subject Identity Anchor;
- Access Grant;
- Voting Right;
- Membership;
- Domain Power;
- бухгалтерскую проводку;
- складскую/ТМЦ сущность;
- универсальный юридический статус документа.

## 5. Рабочее понятие Contractual Relationship

**Contractual Relationship** — самостоятельное исторически значимое отношение между конкретным Community и определённым Subject, возникшее на договорном или ином согласованном основании и описывающее предметно значимую область их взаимодействия.

До нормативной синхронизации это определение является рабочим термином BP.

## 6. Архитектурное владение

Contractual Relationship относится к существующему контексту **«Отношения субъекта с сообществом»**.

Это не создаёт новый bounded context «Contracts».

Другие контексты сохраняют ownership собственных понятий:

- Documents — Document, Revision, Representation, Signing, Registration;
- Finance — Obligation, Accrual, Payment, Expense, Bank Transaction;
- Objects — Object и Subject↔Object relations;
- Resource/Engineering — инженерная структура, точки учёта, ресурсные факты;
- Access — User Account, Access Grant и technical access;
- Integrations — external representations и recognition semantics.

## 7. Участники процесса

В процессе могут участвовать:

**Инициатор** — участник, сообщивший или зафиксировавший необходимость признать/изменить отношение.

**Уполномоченный участник** — Subject, имеющий предметное полномочие признать, изменить или прекратить отношение от имени Community согласно применимой policy.

Recognition может быть автоматизировано только при явно применимом правиле и достаточных признанных основаниях. Автоматизированный механизм не становится Subject и не заменяет требуемое полномочие там, где действие должно быть совершено человеком или от имени Community.

**Внешний Subject** — установленный Subject, являющийся стороной отношения с Community.

**Контексты-владельцы связанных фактов** — финансовый, документный, объектный, инженерный и другие контексты, использующие Contractual Relationship как возможное основание.

Технический администратор не получает предметное полномочие управлять Contractual Relationship только из факта системной роли.

## 8. Канал получения сведений и общая последовательность

### 8.1. Канал получения

Сведения об отношении могут быть получены:

- вручную уполномоченным участником;
- из Contract Document;
- из migration source;
- из внешней системы;
- из другого предметного процесса.

Получение сведений не означает recognition отношения.

```text
received information
≠ recognized Contractual Relationship
```

Для external/imported data применяются ADR-011 и соответствующие migration/integration semantics.

### 8.2. Recognition нового отношения

Общая семантическая последовательность:

```text
полученные сведения / инициирование
→ Subject identification
→ Contractual Relationship identity resolution
→ validation subject matter / basis / time / roles where applicable
→ authority / applicable rule check
→ recognition
→ explicit context-specific links
```

Recognition не создаёт автоматически финансовые, документные, ресурсные, объектные или access-факты.

### 8.3. Изменение существующего отношения

Общая последовательность:

```text
existing Contractual Relationship
→ новые сведения / действие
→ classification:
     correction
     real modification
     extension
     termination
     new relationship instead
→ authority / rule check
→ history-preserving domain change
→ context-specific consequences handled by owning contexts
```

Классификация изменения является предметным решением. Она не определяется автоматически техническим CRUD-действием, новым файлом или последним полученным значением.

## 9. Идентификация Subject

До recognition отношения должен быть установлен Subject.

Совпадение:

- названия организации;
- ФИО;
- ЕДРПОУ/РНОКПП;
- банковских реквизитов;
- телефона/email;
- внешнего идентификатора

само по себе не является универсальным правилом automatic merge.

Если реальная сторона не установлена достаточно:

- Contractual Relationship не создаётся;
- не создаётся фиктивный `Unknown Counterparty`;
- сведения остаются unresolved в соответствующем процессе/источнике.

## 10. Identity Contractual Relationship

Contractual Relationship имеет собственную устойчивую identity.

Identity не определяется только:

- парой Community + Subject;
- видом отношения;
- номером договора;
- датой договора;
- названием документа;
- банковским назначением;
- внешним ID.

Один Subject может иметь несколько Contractual Relationships с одним Community одновременно или последовательно.

Contractual Relationship всегда принадлежит конкретному Community. Наличие отношения этого Subject в одном Community не создаёт такое же отношение в другом Community автоматически.

Совпадение Subject и contract number является matching signal, но не универсальным доказательством одной identity.

## 11. Базовая кардинальность сторон

Для текущего BP один Contractual Relationship связывает:

```text
1 Community ↔ 1 Subject
```

Community не превращается в Subject ради унификации сторон.

Настоящий BP не вводит универсальный `Party`.

Реальные многосторонние agreements с несколькими внешними Subjects требуют отдельного исследования. Они не должны искусственно раскладываться на независимые Contractual Relationships, если такое разбиение меняет предметный смысл.

## 12. Relation kind

Contractual Relationship может иметь применимый вид/классификацию, если это нужно предметному процессу.

Например:

- resource supply;
- service;
- works/contracting;
- infrastructure use;
- lease;
- banking service;
- other configured kind.

Ядро не задаёт закрытый enum.

Relation kind не является identity и не заменяет предмет отношения.

## 13. Contextual roles

В рамках отношения могут быть определимы роли Community и Subject.

Примеры:

- supplier / customer;
- contractor / customer;
- lessor / lessee;
- infrastructure provider / infrastructure user;
- service provider / service recipient;
- bank / banking customer.

Роль:

- существует только в контексте отношения;
- не является типом Subject;
- не является Access Role;
- не является Domain Power;
- не создаёт технический доступ;
- не становится универсальной `PartyRole` entity.

Одно отношение может иметь несколько ролей, если это соответствует фактической семантике соглашения.

## 14. Supplier и финансовый контекст

Supplier остаётся установленным Subject, используемым финансовым контекстом в специализированной семантике отношений с поставщиком согласно ADR-002/ADR-006.

Contractual Relationship не получает ownership понятия Supplier и не создаёт отдельную Supplier identity.

Договорное отношение может быть одним из оснований или контекстов финансовых отношений с Supplier, но:

- не каждое Contractual Relationship делает Subject поставщиком;
- Supplier не является типом Subject;
- Supplier не является универсальной внешней стороной;
- один Subject может одновременно участвовать в другом Contractual Relationship в иной роли.

Действующая TERMINOLOGY использует Supplier широко и приводит Contractor как один из примеров. Настоящий BP не отменяет это молча. Точная граница Supplier/Contractor подлежит нормативному уточнению без переноса ownership Supplier из финансового контекста.

## 15. Основание отношения

Для recognition должен быть определим предметно достаточный Basis.

Возможные примеры:

- заключённый договор;
- принятое предложение / публичная оферта;
- иное признанное соглашение.

Basis не тождествен Document.

Contractual Relationship может быть признан без загруженного файла договора, если имеются достаточные сведения о реальном отношении и основание признания.

## 16. Предмет отношения

Предмет отношения должен быть определим в объёме, достаточном для его отличия и связанных процессов.

Примеры:

- поставка электроэнергии;
- вывоз отходов;
- ремонт;
- банковское обслуживание;
- интернет-услуга;
- использование опор;
- аренда помещения.

Предмет отношения не превращается в универсальный `ContractItem`, `ContractAsset` или `ContractTarget`.

## 17. Связь с Object / Engineering scope

Если отношение касается Object, Engineering System или иного предмета другого контекста, используется явная context-specific связь.

Contractual Relationship не копирует identity и состояние такого предмета.

Например:

```text
Contractual Relationship
→ basis for infrastructure use
→ Engineering/Object context owns actual use relation/state
```

Если договор говорит «использование 35 опор», это не обязывает Community OS создавать 35 Asset/TMC entities.

## 18. Contract reference number

Номер договора:

- может быть известен;
- может отсутствовать;
- не является internal identity;
- не обязан быть глобально уникальным;
- не доказывает identity при совпадении;
- не создаёт relationship автоматически.

Локальная policy может задавать дополнительные ограничения номера.

## 19. Временная семантика

Для Contractual Relationship различаются, где применимо:

- agreement/conclusion date;
- effective start;
- effective end;
- recording/recognition time;
- date of a Document/Revision;
- date of material change.

Техническая дата создания записи не заменяет effective start.

Исторический период отношения использует `[start, end)`, когда такая семантика применима.

Unknown start не заменяется assumed date.

Отсутствие end означает продолжающееся отношение, если контекст не утверждает иное.

## 20. Contract Document

Contractual Relationship может существовать без Document.

Если Document существует:

```text
Contractual Relationship
≠ Document
≠ Revision
≠ Representation
```

Document может:

- оформлять отношение;
- подтверждать его;
- быть основанием;
- изменять условия;
- фиксировать прекращение;
- относиться к нему другим предметно определённым способом.

Сам факт наличия документа не создаёт relationship автоматически.

## 21. Main contract, annex и amendment

С одним Contractual Relationship могут быть связаны несколько Documents.

Например:

- основной договор;
- приложение;
- дополнительное соглашение;
- акт;
- счёт;
- иные документы.

Наличие нового Document не означает автоматически новое Contractual Relationship.

Document context сохраняет identity и history собственных документов; Relationship context сохраняет identity отношения.

## 22. Условия отношения

Настоящий BP не вводит универсальный bag/EAV/JSON `Contract Terms`.

Предметно значимые условия принадлежат соответствующей семантике.

Например:

- цена ресурса;
- ставка за опору;
- периодичность оплаты;
- формула индексации;
- объём работ;
- scope использования инфраструктуры.

Если условие используется в исторически значимом расчёте или действии, должна быть объяснима фактически применённая версия/значение согласно ADR-004/005 и owning context.

## 23. Recognition нового отношения

Новое Contractual Relationship может быть recognized, если:

1. определено Community;
2. установлен Subject;
3. достаточно определим предмет отношения;
4. имеется достаточный Basis;
5. relation identity не совпала надёжно с уже существующим отношением;
6. уполномоченный процесс/участник либо явно применимое правило допустили recognition.

Номер договора и Contract Document не являются обязательными сами по себе.

## 24. Повторное обнаружение существующего отношения

Если поступили сведения о возможном существующем Contractual Relationship:

- сначала выполняется identity resolution;
- existing relationship может быть reused;
- совпадение номера/Subject/вида не достаточно для blind merge;
- новое отношение не создаётся для каждого нового файла или платежа.

Если идентичность неоднозначна, результат остаётся unresolved до resolution.

## 25. Существенное изменение условий

Если фактически продолжается то же отношение, существенное изменение условий не создаёт новую identity автоматически.

Изменение должно оставаться исторически объяснимым.

Примеры:

- изменение ставки;
- изменение периода;
- изменение объёма;
- изменение scope;
- изменение роли стороны в рамках того же соглашения;
- добавление/изменение приложения.

Конкретная модель версии условия принадлежит owning context; universal Contract Version не вводится настоящим BP.

## 26. Продление

Продление того же соглашения может сохранять Contractual Relationship identity.

При этом:

- прежний effective period не переписывается молча;
- основание продления и применимый момент должны быть объяснимы;
- новый Document/Amendment может быть связан с отношением;
- финансовые правила и другие context-specific terms изменяются отдельно.

Новый номер или новый документ сами по себе не определяют, является ли это продлением или новым отношением.

## 27. Новое отношение вместо продолжения

Создаётся новый Contractual Relationship, если фактически возникло новое самостоятельное отношение, а не изменение существующего.

Признаками могут быть:

- новый самостоятельный договор;
- прекращение прежнего и возникновение нового;
- существенно иная договорная основа;
- фактическое отсутствие continuity.

Универсальное правило по номеру, дате или имени файла не вводится.

Если различие неоднозначно, решение требует предметного resolution.

## 28. Прекращение

Прекращение Contractual Relationship:

- завершает его будущую предметную применимость согласно effective end;
- не удаляет историю;
- не отменяет автоматически Financial Obligations;
- не возвращает Payments;
- не удаляет Expenses;
- не прекращает автоматически Ownership/Use;
- не отзывает Access Grant;
- не изменяет исторические Documents;
- не отменяет уже выполненные предметные действия.

Связанные contexts отдельно определяют последствия прекращения основания.

## 29. Outstanding obligations после прекращения

Если к моменту прекращения существуют неисполненные Financial Obligations, они не исчезают автоматически.

Например:

```text
Contractual Relationship ended
≠ outstanding Obligation cancelled
```

Исполнение, изменение, отмена или спорность обязательства принадлежат финансовому процессу.

## 30. Correction

Correction ошибочных сведений отличается от реального изменения отношения.

Примеры correction:

- ошибочный номер;
- ошибочная дата;
- ошибочно выбранный Subject;
- неверно указанный relation kind.

Correction:

- не изображается фиктивным termination + new relation, если реального изменения не было;
- сохраняет достаточную историческую прослеживаемость;
- не выполняет silent cascade rewrite связанных domain facts.

Если неверный Subject уже использован как основание финансового или иного признанного факта, owning context определяет требуемые последствия отдельно.

## 31. Реальная замена стороны

Реальная юридически значимая замена Subject и correction ошибочной Subject linkage — разные события.

Настоящий BP не вводит универсальную семантику:

- правопреемства;
- уступки;
- перевода договора;
- слияния юридических лиц;
- иных способов замены стороны.

До появления конкретного сценария Subject не заменяется молча.

## 32. Финансовые обязательства

Contractual Relationship как признанное историческое отношение может быть Basis для нуля, одного или многих Financial Obligations. Его собственное Basis и основания производных финансовых фактов остаются различимыми.

Направление не фиксируется на уровне relationship:

```text
Community → Subject
Subject → Community
```

оба варианта допустимы.

В сложном соглашении возможны обязательства в обоих направлениях.

Contractual Relationship не создаёт Obligation автоматически.

## 33. Accrual и расчётные условия

Contractual Relationship может предоставлять Basis и применимые условия для расчёта.

Но:

```text
contract rate
≠ Accrual
≠ Financial Obligation
```

Например ставка за одну опору и количество используемых опор могут быть inputs финансового процесса.

Финансовый context определяет, создаётся ли Accrual, Obligation или другой финансовый result.

## 34. Payment

Payment не создаёт Contractual Relationship автоматически.

Payment может исполнять Obligation, основанный на Contractual Relationship.

Фактический Payer может отличаться от obliged party согласно ADR-006.

Закрытие relationship не переписывает Payment history.

## 35. Bank Transaction

Bank Transaction не доказывает наличие Contractual Relationship.

Bank counterparty data является input для matching/classification.

Неизвестная сторона Bank Transaction не требует:

- fake Subject;
- fake Contractual Relationship;
- fake Personal Account.

Это является обязательной границей для будущего BP-FIN-BANK-001.

## 36. Expense

Contractual Relationship и Expense различаются.

Contractor agreement может быть основанием:

```text
Contractual Relationship
→ Financial Obligation
→ Expense
→ Payment
```

но конкретный порядок и связи принадлежат финансовому процессу.

Исходящий Payment не создаёт Expense автоматически.

## 37. ISP использует опоры Community

Проверочный сценарий:

```text
Community
↕ Contractual Relationship
ISP Subject

subject matter: infrastructure use
roles:
  Community = infrastructure provider / lessor
  ISP = infrastructure user / lessee

pricing input: 35 poles × rate per pole
        ↓
financial process
        ↓
Financial Obligation:
  obliged = ISP
  entitled = Community
        ↓
Payment
```

Contractual Relationship не становится:

- списком основных средств;
- инженерной топологией;
- Accrual;
- Obligation;
- Payment.

## 38. ISP одновременно оказывает услугу Community

Если тот же ISP предоставляет интернет для офиса Community, возможны:

1. отдельный Contractual Relationship;
2. одно фактическое сложное соглашение с несколькими предметами/ролями.

Система не объединяет отношения только потому, что Subject один и тот же.

Если фактически один договор содержит взаимные обязательства, relationship может быть основанием обязательств в разных направлениях.

## 39. Supplier resource scenario

Поставщик электроэнергии:

```text
Community ↔ Supplier Subject
→ Contractual Relationship
→ resource/price conditions as applicable
→ Community Obligation
→ Payment
```

Resource consumption остаётся ресурсным фактом.

Supplier invoice/document сам по себе не создаёт Obligation без соответствующего financial recognition.

## 40. Contractor scenario

Подрядчик:

```text
Community ↔ Contractor Subject
→ Contractual Relationship
→ work scope
→ Operational Work / result where applicable
→ Financial Obligation
→ Expense
→ Payment
```

Contractual Relationship не становится Work Order.

Work result и акт/Document также не являются relationship.

## 41. Bank scenario

Следует различать:

```text
Bank as legal Subject
≠ Bank as contractual service provider
≠ External Integration Party
≠ bank-transaction counterparty data
```

Community может иметь Contractual Relationship с Bank Subject по банковскому обслуживанию.

Интеграционный API/statement source не становится стороной этого отношения автоматически.

## 42. Частная аренда между Subjects

Если Owner сдаёт участок Tenant, а Community не является стороной:

```text
Owner Subject
Tenant Subject
Property Object
```

основной факт Community OS относится к Subject↔Object relation, например Use/Lease.

Частный договор может быть Basis/Document этого отношения.

Contractual Relationship with Community не создаётся автоматически.

## 43. Разовая операция без устойчивого отношения

Разовая покупка, чек, invoice, Payment или Bank Transaction не создают Contractual Relationship автоматически.

Relationship оправдан, если само соглашение/отношение имеет отдельную предметную identity, условия, период, предмет или последствия.

Одноразовый формальный подряд может быть Contractual Relationship, если сам договор является предметно значимым отношением, даже при одной финансовой операции.

## 44. Access и User Account

Contractual Relationship не создаёт автоматически:

- User Account;
- Subject Identity Anchor;
- Access Grant;
- Access Role;
- Domain Power.

Если представитель внешнего Subject получает кабинет или иной technical access, используется BP-ACCESS-001 и применимая access policy.

Договорная роль не является ролью доступа.

## 45. Полномочия

Recognition, изменение и прекращение Contractual Relationship являются предметно значимыми действиями.

Должны быть определимы, где применимо:

- фактически действующий Subject;
- представленная сторона/Community;
- основание полномочия;
- момент действия;
- source/provenance;
- автоматический характер, если применим.

Техническая возможность редактирования не заменяет предметное полномочие.

Конкретные community policies полномочий определяются отдельно.

## 46. История и provenance

Для исторически значимого Contractual Relationship должны быть объяснимы, где применимо:

- Community;
- Subject;
- identity relationship;
- relation kind;
- contextual roles;
- Basis;
- subject matter;
- effective period;
- известные reference attributes;
- существенные изменения;
- termination;
- corrections;
- связанные Documents;
- source/provenance;
- actor/authority значимых ручных действий.

Не требуется universal Contract Audit Record.

## 47. Конфликтующие сведения

Система может получить конфликтующие сведения:

- разные даты;
- разные номера;
- разные Subjects;
- разные версии предмета;
- разные сведения о прекращении.

Конфликтующие сведения не признаются одновременно применимыми автоматически.

Приоритет источника и resolution определяются соответствующей policy/process.

Last-write-wins не является предметным правилом.

## 48. Ошибочный duplicate

Если два Contractual Relationships позже признаны ошибочным дублированием, нельзя молча удалить один и перепривязать все связанные факты.

Correction identity требует:

- установления правильной identity;
- сохранения истории ошибки;
- review зависимых domain facts;
- context-owned corrections там, где они нужны.

Универсальный cascade merge не вводится.

## 49. UI «Контрагенты»

UI может показывать список «Контрагенты» как Read Model / Projection:

```text
Subjects
+ Contractual Relationships
+ relevant financial/operational relations
→ Counterparties UI
```

Это не создаёт source-of-truth `Counterparty` entity.

## 50. Проверочные исходы процесса

Для значимого действия различаются как минимум:

- New Relationship Recognized;
- Existing Relationship Confirmed / Reused;
- Relationship Changed;
- Relationship Extended;
- Relationship Ended;
- Data Corrected;
- New Relationship Required Instead of Change;
- Unresolved Identity;
- Conflict;
- Rejected / Not Recognized.

Техническая ошибка выполнения не является предметным Rejected.

Настоящий BP не требует одного universal status enum.

## 51. Инварианты процесса

1. Community не является Subject только ради договорной модели.
2. Counterparty не вводится как параллельная identity рядом с Subject.
3. Contractual Relationship имеет собственную identity.
4. Contractual Relationship связывает одно Community и один установленный Subject в текущем baseline.
5. Multi-party agreement не раскладывается искусственно без отдельного решения.
6. Subject + Community не определяют relationship identity автоматически.
7. Contract number не является relationship identity.
8. Document не является relationship.
9. Contractual Relationship может существовать без Contract Document.
10. Новый Document не создаёт новый relationship автоматически.
11. Новая Revision не создаёт relationship автоматически.
12. Supplier является специализированной семантикой установленного Subject во владении финансового контекста, а не Subject type или отдельной identity.
13. Contractual role не является Access Role.
14. Relation kind не является identity.
15. Subject matter не моделируется universal ContractItem/ContractAsset.
16. Contractual Relationship не копирует Object/Engineering identity.
17. Полученная информация не является recognized relationship.
18. Unknown external party не заменяется fake Subject.
19. Payment не создаёт relationship автоматически.
20. Bank Transaction не создаёт relationship автоматически.
21. Invoice/receipt не создают relationship автоматически.
22. Contractual Relationship не создаёт Financial Obligation автоматически.
23. Contractual Relationship не создаёт Accrual автоматически.
24. Contractual Relationship не создаёт Expense автоматически.
25. Contractual Relationship не создаёт Use/Ownership автоматически.
26. Contractual Relationship не создаёт User Account/Access Grant/Voting Right.
27. Relationship не имеет постоянного финансового направления.
28. Один relationship может быть Basis для многих Obligations.
29. Obligation может существовать после termination relationship.
30. Termination relationship не отменяет historical Payment/Expense/Document.
31. Real change и correction различаются.
32. Amendment/extension и new relationship различаются.
33. Number/date/file сами по себе не определяют amendment vs new relationship.
34. Subject replacement не выполняется silent edit.
35. Correction identity не выполняет universal cascade rewrite.
36. Used historical conditions не переписываются текущими условиями молча.
37. Bank Subject, External Integration Party и bank counterparty data различаются.
38. Private Subject↔Subject agreement без Community не создаёт Contractual Relationship with Community.
39. One-off operation не требует relationship автоматически.
40. Technical admin role не создаёт domain authority.
41. Conflict не разрешается last-write-wins.
42. UI Counterparty не требует domain Counterparty entity.
43. Contractual Relationship принадлежит одному Community и не становится global cross-community relation.
44. Automatic recognition допустим только по явному правилу и не создаёт фиктивного system Subject.
45. Contractual Relationship может быть Basis производного факта, не становясь этим фактом и не скрывая собственное Basis отношения.
46. Новый файл, последнее полученное значение или CRUD update не определяют автоматически тип предметного изменения relationship.

## 52. Нормативная синхронизация после принятия BP

Если BP принимается, требуется рассмотреть:

### DOMAIN_MODEL

- добавить Contractual Relationship в раздел «Отношения субъекта к сообществу»;
- уточнить Supplier как специализированную финансовую семантику Subject без отдельной identity/type;
- заменить слишком узкую формулировку Supplier Contract общей моделью Contractual Relationship, сохранив financial ownership Supplier;
- зафиксировать границы Contractual Relationship / Document / Obligation / Payment / Expense;
- добавить ISP infrastructure-use validation scenario при необходимости.

### TERMINOLOGY

Добавить/уточнить:

- Contractual Relationship;
- contextual contractual role;
- Supplier;
- при необходимости relation kind.

Не вводить:

- Counterparty как новую identity;
- PartyRole как universal entity;
- ContractItem/ContractAsset;
- универсальный Contract status workflow.

### ADR-002

Рассмотреть точечное добавление Contractual Relationship в ключевые понятия контекста «Отношения субъекта с сообществом».

Новый отдельный ADR предварительно не требуется.

## 53. Связанные документы

- `docs/architecture/STAGE-3-CONTRACTUAL-RELATIONSHIP-ANALYSIS.md`;
- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-002;
- ADR-003;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-009;
- ADR-010;
- ADR-011;
- BP-ACCESS-001;
- BP-IMPORT-001;
- OSBBX reference analysis;
- Мій Дім Online reference analysis;
- REFERENCE_CANDIDATE_MATRIX.

## 54. Что намеренно не решается

Настоящий BP не определяет:

- multi-party agreements;
- договоры между любыми Subjects вне участия Community;
- procurement/tender workflow;
- согласование проекта договора;
- электронную подпись и юридическую силу e-signature;
- универсальную модель юридического правопреемства;
- техническую схему хранения;
- UI contract registry;
- нумератор договоров;
- OCR/extraction;
- шаблоны документов;
- бухгалтерские проводки;
- BAS/BAF mapping;
- exact permission matrix;
- implementation of versioning.

## 55. Следующий шаг

После предметного review BP:

1. проверить совместимость с DOMAIN_MODEL / TERMINOLOGY / ADR-002/004/005/006/009/010/011;
2. привлечь независимый review Claude;
3. согласовать оставшиеся вопросы;
4. выполнить минимальную нормативную синхронизацию;
5. закрыть REF-SUBJ-001;
6. перейти к BP-FIN-BANK-001.


---

# End Part A
