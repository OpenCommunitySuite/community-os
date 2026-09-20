# BP-CASH-001 — Приём наличного платежа

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику приёма наличных денежных средств внешней стороной в пользу Community и признания соответствующего `Payment`.

Ключевая модель:

```text
external party tenders cash
→ physical receipt into Community-side control
→ Cash Acceptance
→ authority / party / financial-meaning validation
→ 0..N recognized Cash Payments
→ Initial Payment Allocation where applicable
→ receipt/cash document as evidence/formalization where applicable
```

**Cash Acceptance** в настоящем BP — identity-bearing channel-side referent исторически значимого физического приёма наличных. Он не является Payment и сам по себе не утверждает, что Community уже стало финансовой стороной соответствующего движения.

Процесс не вводит универсальную бухгалтерскую модель кассы, склад денежных средств, регламентированный кассовый учёт или бухгалтерскую проводку.

## 2. Основная граница

```text
Cash Acceptance
≠ Cash Payment
≠ cash receipt document
≠ cashier action
≠ cash storage location
≠ cash balance account
≠ Expense
≠ Accrual
≠ Payment Allocation
≠ later bank deposit
```

Наличный способ является способом Payment, а не отдельной фундаментальной финансовой сущностью.

## 3. Scope первого процесса

BP-CASH-001 покрывает входящий наличный Payment внешней стороны в пользу Community.

Типовые сценарии первого внедрения СТ:

- собственник оплачивает членский взнос;
- собственник оплачивает электроэнергию;
- собственник оплачивает воду;
- один Subject оплачивает обязательство другого Subject на достаточном основании;
- наличные принимаются до окончательного Allocation;
- часть принятой суммы получает смысл Advance;
- кассир оформляет квитанцию/приходный кассовый документ;
- позже агрегированные наличные вносятся на банковский счёт Community.

Исходящий наличный Payment Community другой стороне относится к будущему `BP-CASH-002`.

## 4. Наличный Payment является обычным Payment

Согласно ADR-006 наличный Payment является полноценным предметным Payment Community OS.

```text
Cash Payment is a Payment
```

К нему применяются общие свойства Payment: direction, amount/currency, materially meaningful parties, payment time, payment method, purpose where applicable, provenance и recognition basis.

Способ `cash` не меняет identity Financial Obligation и не создаёт специальный тип долга.

## 5. Cash Acceptance как channel-side referent

**Cash Acceptance** — исторически значимый channel-side факт/referent того, что определённая сумма наличных в определённой валюте была физически принята в Community-side control конкретным действующим лицом в рамках одного coherent acceptance scope.

Cash Acceptance:

- имеет собственную identity независимо от Payment и cash document;
- сохраняет accepted amount/currency, предметное время, acting acceptor и необходимый provenance;
- может существовать до recognition Payment;
- может завершиться без признанного Payment, если финансовая интерпретация не подтверждена;
- может быть основанием/evidence для recognition одного или нескольких Cash Payments;
- не определяет Payment identity/cardinality автоматически;
- не означает автоматически переход права на деньги, существование obligation, Allocation, income или Expense.

```text
cash physically presented
≠ Cash Acceptance
≠ Cash Payment
```

Cash Acceptance возникает после того, как наличные фактически удержаны в Community-side control в рамках завершённого physical acceptance scope; деньги, предъявленные и полностью возвращённые до этого момента, Cash Acceptance не создают.

Если наличные приняты только во временную custody/хранение, Cash Acceptance как source fact может существовать, но его предметная интерпретация не создаёт Payment автоматически.

Настоящий BP не вводит универсальный lifecycle/status machine Cash Acceptance. Recognition outcome, authority resolution, custody interpretation и связи с Payments являются отдельной process semantics/history.

## 6. Стороны Payment

В типовом входящем сценарии payer — сторона, от которой предметно поступают средства, recipient — Community.

Физический tenderer может не совпадать с obligated Subject и с Subject, чьё обязательство будет погашено.

```text
physical tenderer
≠ obligated Subject
≠ payer automatically
```

Если различие materially significant, оно сохраняется в provenance.

## 7. Кассир / принимающее лицо

Лицо, физически принимающее наличные от имени Community:

- не становится получателем Payment;
- не становится payer;
- действует в пределах предметного полномочия;
- может быть бухгалтером, кассиром, председателем или иным уполномоченным Subject/User.

```text
cashier / acceptor ≠ Payment recipient
```

Community остаётся получателем входящего Payment.

## 8. Authority

Физический приём наличных и последующее признание Payment являются предметно значимыми действиями, но их authority semantics различаются.

Для Cash Acceptance должны сохраняться acting person и достаточные сведения о его полномочии/основании действовать от имени Community либо о том, что authority ещё не разрешена.

Если наличные фактически приняты лицом без подтверждённого надлежащего полномочия:

- сам physical Cash Acceptance не исчезает из истории;
- Payment от имени Community не признаётся автоматически;
- authority/admissibility требует отдельного resolution;
- последующее правомерное подтверждение/ratification может стать основанием Payment recognition;
- если Payment уже был ошибочно признан и позднее отсутствие authority делает recognition неверным, применяется BP-FIN-002.

Technical access role не создаёт финансовое полномочие.

## 9. Tendered amount ≠ Cash Acceptance amount ≠ Payment amount

Следует различать:

- сумму, предъявленную для расчёта/пересчёта;
- сумму немедленно возвращённой сдачи;
- сумму Cash Acceptance — фактически удержанную в Community-side control после immediate change;
- сумму/суммы recognized Payment;
- часть Cash Acceptance, для которой Payment recognition ещё unresolved либо не допускается.

Для одного currency-specific Cash Acceptance:

```text
Cash Acceptance amount
= tendered amount - immediate returned change
```

если всё, что не возвращено немедленно, действительно вошло в этот coherent acceptance scope.

Universal `1 Cash Acceptance = 1 Payment` не вводится.

Поэтому:

```text
sum(recognized Payments linked to Cash Acceptance)
≤ Cash Acceptance amount
```

а когда финансовая интерпретация всей суммы Cash Acceptance полностью разрешена именно как входящие Payments:

```text
sum(recognized Payments)
= Cash Acceptance amount
```

Если часть суммы получила другой правомерный смысл, например custody-only, равенство с Payments не требуется; эта часть должна быть отдельно объяснима в process disposition/provenance.

Cash Acceptance amount, для которого Payment ещё не recognized, не является Unallocated Remainder: нераспределённый остаток существует только внутри уже признанного Payment.

## 10. Сдача

Если плательщик передал 1000 грн для оплаты 870 грн, а 130 грн немедленно возвращены как сдача в рамках того же акта приёма:

```text
tendered 1000
returned immediately 130
accepted by Community 870
→ Cash Payment = 870
```

Это не Payment 1000, не Refund 130 и не outgoing Cash Payment 130. Immediate change является частью определения фактически принятой суммы.

## 11. Advance вместо сдачи

Если плательщик передал 1000 грн, Community приняло все 1000 грн, а 130 грн должны остаться на будущую электроэнергию:

```text
Cash Payment = 1000
870 → Allocation to current obligation
130 → possible Advance according to applicable semantics
```

Отсутствие сдачи не создаёт Advance автоматически.

## 12. Cash Payment ≠ Payment Allocation

Признание Cash Payment не означает его Allocation.

```text
Cash Payment recognition
→ BP-FIN-ALLOCATION-001
```

Recognition и Allocation могут координироваться одним пользовательским interaction, но остаются разными domain actions/results.

## 13. Cash Acceptance ↔ Payment cardinality

Один Cash Payment может исполнять несколько obligations. Разбиение одного признанного движения по назначениям не создаёт несколько Payments автоматически.

Один Cash Acceptance может привести к:

- 0 recognized Payments;
- 1 recognized Payment;
- N recognized Payments, если достаточные evidence/domain semantics подтверждают несколько самостоятельных money movements.

Например, один представитель может одновременно передать документированно отдельные суммы нескольких плательщиков.

При этом один **Cash Payment** относится к одному признанному cash money movement и имеет один Cash Acceptance как cash-channel source referent. Несколько уже завершённых самостоятельных Cash Acceptances не объединяются молча в один Payment.

Если payer в одном непрерывном cashier interaction до завершения Cash Acceptance сначала передал 800, а затем сразу добавил 200, это может оставаться одним coherent Cash Acceptance 1000. Если первый Cash Acceptance уже завершён, последующая отдельная передача является новым Cash Acceptance и при financial recognition — отдельным Payment.

```text
Cash Acceptance cardinality
≠ Payment cardinality

one Cash Payment
→ one Cash Acceptance source

one Cash Acceptance
→ 0..N Cash Payments
```

Cash Payment может быть полностью или частично нераспределён.

## 14. Payer ≠ obligated Subject

Cash Payment может быть принят от Subject A для obligation Subject B, если cross-subject Allocation имеет достаточное основание.

Cash acceptance само по себе не даёт права погасить obligation другого Subject.

## 15. Unknown payer / unresolved Payment recognition

Если Cash Acceptance существует, но предметно значимые сведения о payer/сторонах пока недостаточно определены:

- Cash Acceptance сохраняет собственную identity/history;
- fake Subject не создаётся;
- current User/кассир не подставляется как payer;
- **Payment recognition не подтверждается**, пока требования ADR-006 к определимости materially meaningful parties не выполнены;
- соответствующая сумма остаётся unresolved на уровне Payment recognition;
- она не является Unallocated Remainder, потому что Payment ещё не существует;
- case разрешается позднее на sufficient basis либо получает иной правомерный disposition.

Позднее recognition такого real cash movement ссылается на исходный Cash Acceptance, сохраняет actual acceptance time и отдельно recording/recognition time; второго физического движения денег не создаётся.

Долгоживущее unresolved состояние должно оставаться видимым для reconciliation/decision и не исчезает только по timeout. Universal anonymous-cash policy и universal automatic write-off не вводятся.

## 16. Personal Account и Payment Intent

Personal Account является context/matching input, но не payer и не Payment.

Payment Intent может содержать предполагаемую сумму и Allocation, но после фактического приёма:

```text
Payment Intent ≠ Cash Payment ≠ actual Allocation
```

Расхождение суммы/сторон требует revalidation.

## 17. Cash receipt document

Квитанция, приходный кассовый ордер или иной cash receipt document может подтверждать/оформлять Cash Acceptance, Payment либо оба факта, содержать сумму, стороны и назначение, а также быть обязательным согласно local policy/law.

Но:

```text
cash document
≠ Cash Acceptance
≠ Payment
```

Document identity не определяет Cash Acceptance или Payment identity автоматически.

Universal `1 cash document = 1 Payment` и `1 cash document = 1 Cash Acceptance` cardinality не вводятся на уровне доменной модели. Конкретная legal/operational policy может требовать отдельный документ на каждого payer/Payment, но это ограничение formalization, а не способ определить domain identity.

## 18. Документ, Cash Acceptance и Payment могут иметь разное время

Недоступность принтера/PDF/storage сама по себе не отменяет уже состоявшийся Cash Acceptance и не препятствует Payment recognition, если applicable domain/legal policy не требует документ как обязательное условие recognition и sufficient evidence движения уже существует.

Если local legal/policy semantics требует документ до recognition, это дополнительное ограничение конкретной конфигурации, а не universal rule Community OS.

Предварительно созданный документ без фактического Cash Acceptance не создаёт ни Cash Acceptance, ни Payment.

## 19. Ошибка документа ≠ ошибка Payment

Если документ ошибочен, а Payment признан корректно, document correction не является Payment correction.

Если Payment recognition itself wrong, применяется `BP-FIN-002`.

## 20. Временная семантика

Следует различать, где materially significant:

- tendering time;
- Cash Acceptance completion time;
- authority/financial-interpretation resolution time, если оно отличается;
- Payment recognition/recording time;
- cash document issuance time;
- Allocation time;
- later bank deposit time.

Technical timestamp не подменяет предметное время.

## 21. Currency и accepted cash

Accepted amount должен иметь определимую currency. Настоящий BP не выполняет currency conversion.

Непринимаемая currency может быть возвращена до acceptance без создания Payment.

Если часть cash не принимается как действительное платёжное средство до завершения acceptance, она не входит в accepted amount.

## 22. Ошибка после confirmation

Если confirmed Cash Payment имеет materially wrong amount/currency/parties или ошибочную cardinality, применяется `BP-FIN-002`.

Если Payment корректен, но Allocation неверен, применяется `BP-FIN-001`.

Cash channel не меняет эти границы.

## 23. Refund

Если реальный Cash Payment состоялся, а позже средства нужно вернуть:

```text
Cash Payment remains historical
→ Refund basis
→ BP-FIN-003
→ new outgoing Payment
```

Immediate change до завершения acceptance не является Refund.

## 24. Cash Payment ≠ Expense / income entity

Входящий Cash Payment не является Expense и не создаёт Supplier Obligation, Budget Item или Funding Source автоматически.

Настоящий BP не вводит universal entity `Cash Income` или `Community Receipt`.

## 25. Место хранения и cash balance

BP-CASH-001 не вводит фундаментальную сущность `Cashbox`/`Касса` только потому, что наличные нужно физически хранить.

Также не вводится универсальный stored `Cash Balance` как primary truth.

Operational need знать место хранения, custodian и передачу денег может позже потребовать отдельной custody/internal cash movement semantics.

## 26. Custody / internal movement boundary

Передача уже принадлежащих Community наличных от кассира председателю или между хранителями не является новым Payment между Community и внешней стороной.

Cash Acceptance как physical source fact также не означает автоматически, что вся принятая сумма стала Community funds в финансовом смысле. Если наличные приняты только для временного хранения/перевозки/иной custody-цели:

- Cash Acceptance может сохранять факт физического получения;
- Payment не признаётся без financial-party semantics ADR-006;
- custody-only interpretation должна быть attributable/traceable;
- последующий возврат custody-средств без Payment не является Refund.

Если при приёме неясно, является ли сумма Community Payment funds или custody-only, interpretation остаётся unresolved до предметного решения.

Полная custody/internal cash movement semantics относится к отдельному будущему процессу.

## 27. Внесение наличных на банковский счёт

После ранее признанных Cash Payments Community может внести агрегированные наличные на собственный банковский счёт.

```text
cash already belongs to Community
→ bank deposit
→ Bank Transaction
```

Это не новый Payment от кассира/председателя, не повтор underlying Payments, не новый income и не Expense.

Bank Transaction может быть связана с cash-side facts для reconciliation/provenance согласно BP-FIN-BANK-001.

## 28. Физический вноситель в банк

Subject, физически внёсший Community cash в банк, не становится payer aggregated amount.

Его identity может быть operationally significant как acting person/provenance.

## 29. Aggregate deposit cardinality

Несколько Cash Payments могут соответствовать одному bank deposit; один Cash Payment может быть внесён в банк несколькими частями.

Universal 1:1 Cash Payment ↔ Bank Transaction не вводится.

Если decomposition агрегированного bank deposit недостаточно доказана, mapping не выдумывается.

## 30. Частичное внесение наличности

Если recognized Cash Payments = 20 000 грн, а bank deposit = 15 000 грн, underlying Payments не меняются. Оставшиеся 5 000 требуют custody/reconciliation explanation where applicable, но не становятся Unallocated Payment или fake Bank Transaction.

## 31. Cash reconciliation

Reconciliation между Cash Acceptance referents, recognized Cash Payments, cash documents, custody/internal movements where modeled и bank deposits может быть operationally necessary.

Но:

```text
reconciliation ≠ Payment recognition ≠ Allocation ≠ Expense
```

Детальная cash reconciliation semantics не определяется настоящим BP.

## 32. Idempotency / duplicate

Повторная техническая обработка одного и того же Cash Acceptance referent не создаёт новый Cash Acceptance или второй Payment автоматически.

Cash Acceptance identity/provenance является одним из оснований безопасного late/offline retry, но совпадение payer + amount + date само по себе не доказывает duplicate.

Если один real Cash Payment recognized twice from the same or duplicated acceptance evidence, исправление Payment относится к BP-FIN-002; duplicate/correction Cash Acceptance source fact сохраняется и разрешается в cash-channel process history.

## 33. Draft / preparation

До physical acceptance system может иметь draft с expected payer, amount, obligations, purpose, Allocation Proposal и document draft.

Draft ≠ Payment и может быть изменён/отброшен до acceptance.

Universal `Cash Receipt Draft` entity не вводится.

## 34. Failure after Cash Acceptance before Payment recording

Возможен сценарий:

1. Cash Acceptance фактически состоялся;
2. network/system unavailable before Payment recognition/recording is completed;
3. Payment ещё не зафиксирован в системе.

После восстановления:

- восстанавливается/фиксируется identity исходного Cash Acceptance на sufficient evidence;
- retry не создаёт второй Cash Acceptance;
- Payment recognition ссылается на этот Cash Acceptance;
- actual acceptance time и recognition/recording time различаются;
- второго физического movement не создаётся.

Если до сбоя Payment уже был предметно признан, later persistence/recovery не создаёт новый Payment.

## 35. Offline/manual receipt

Если Community допускает manual/offline acceptance, бумажный документ или иное достаточное evidence может позволить позднее зафиксировать historical Cash Acceptance и затем recognized Payment(s).

Document number не является universal Cash Acceptance или Payment identity.

Если один offline document покрывает несколько independent money movements, Payment cardinality определяется предметной семантикой, а не номером документа.

## 36. Payment before Obligation

Cash Payment может быть принят до возникновения конкретного Financial Obligation, если applicable semantics это допускает.

Сумма может остаться Unallocated или получить meaning Advance при sufficient basis. Fake future obligation не создаётся.

## 37. Provenance

### 37.1. Cash Acceptance provenance

Для Cash Acceptance должны быть explainable, где применимо:

- Cash Acceptance identity/referent;
- accepted amount/currency;
- tendered amount and immediate returned change;
- Cash Acceptance completion time and later recording time;
- physical tenderer / declared origin information;
- acting cashier/acceptor;
- authority evidence or unresolved authority;
- financial/custody interpretation and its basis;
- related cash document(s);
- offline/manual evidence;
- retry/duplicate/correction links;
- later bank-deposit/custody reconciliation links where available.

### 37.2. Cash Payment provenance

Для recognized Cash Payment дополнительно должны быть explainable:

- Payment identity/referent;
- link to exactly one Cash Acceptance source;
- direction;
- recognized amount/currency;
- payer and recipient;
- Payment recognition time/basis;
- purpose/Payment Intent inputs;
- PA/Object context;
- subsequent Initial Allocation;
- correction/replacement links.

Один Cash Acceptance может быть linked to 0..N Payments. Payment provenance не поглощает Cash Acceptance provenance.

Provenance не требует universal CashOperation/Audit entity.

## 38. Authority and automation

Manual cash acceptance requires attributable domain authority.

Automation may assist calculation, document generation, matching, Allocation Proposal and duplicate warning, but physical acceptance and recognition remain explainable.

## 39. Основной сценарий пилотного СТ

1. Owner A имеет electricity Obligation 870 грн.
2. Owner A передаёт кассиру 1000 грн.
3. Cashier counts and accepts all 1000.
4. Cash Payment 1000 Owner A → Community recognized.
5. Owner requests 870 to current electricity and remaining 130 for future electricity.
6. BP-FIN-ALLOCATION-001 creates/coordinates 870 Allocation and possible Advance semantics for 130.
7. Cash receipt document is issued.
8. Later Community deposits this cash together with other cash receipts into bank.
9. Bank Transaction does not recreate Owner A Payment.

## 40. Проверочные сценарии

### 40.1. Exact amount
Obligation 870; accepted 870; Cash Payment 870.

### 40.2. Tendered 1000, immediate change 130
Accepted 870; Payment 870; no Refund and no outgoing Payment.

### 40.3. Tendered 1000, all accepted
Payment 1000; 130 does not become Advance/Overpayment automatically.

### 40.4. One Payment, two obligations
Payment 1500; 1000 membership + 500 electricity via two Allocations.

### 40.5. Third party physically brings cash
Physical tenderer, payer and obligated Subject are resolved separately according to evidence.

### 40.6. Chairman acts as cashier
Chairman accepts for Community and does not become recipient.

### 40.7. Receipt printed but no cash received
No Payment.

### 40.8. Printer fails after cash accepted
Payment remains real; document may be produced later according to policy.

### 40.9. Network fails after physical acceptance
Later recording preserves actual payment time and avoids duplicate.

### 40.10. Unknown payer remains unresolved
Cash Acceptance exists; no fake Subject/cashier payer is created; Payment recognition remains unresolved and visible for decision/reconciliation. See also §40.24 for later resolution.

### 40.11. Wrong amount after confirmation
Actually accepted 900, recorded 1000 → BP-FIN-002.

### 40.12. Wrong Allocation
Cash Payment correct, Allocation wrong → BP-FIN-001.

### 40.13. Cash deposited by chairman
Underlying Cash Payments total 15 000; bank deposit 15 000 → no new Payment from chairman.

### 40.14. Aggregate deposit cannot be decomposed
Bank Transaction exists; no invented mapping to Cash Payments.

### 40.15. Recognized cash 20 000, bank deposit 15 000
Payments unchanged; remaining 5 000 belongs to future custody/reconciliation semantics.

### 40.16. Duplicate offline entry
Same real Payment entered twice → BP-FIN-002 duplicate recognition correction.

### 40.17. Cash before obligation
Payment may remain Unallocated or become Advance on sufficient basis; no fake obligation.

### 40.18. One Cash Payment across two PAs
Allowed only with sufficient cross-account basis; cash method does not prohibit it.

### 40.19. Cash accepted, no Allocation yet
Payment exists independently of Allocation.

### 40.20. Later cash Refund
Original Payment remains; outgoing cash movement belongs to BP-CASH-002 + BP-FIN-003 semantics.

### 40.21. One physical handover contains several payers

Authorized representative delivers:

```text
500 from Payer A
700 from Payer B
800 from Payer C
```

and sufficient evidence preserves the independent origin of each amount.

Physical acceptance may be one cashier interaction, but financial context may recognize three Cash Payments. The interaction is not forced into one Payment 2000.

### 40.22. One payer pays several obligations

Payer A tenders 2000 from own funds.

```text
1200 → own membership obligation
800  → another allowed obligation
```

Where allocation basis is sufficient, this may remain one Cash Payment 2000 with multiple Allocations.

### 40.23. Cash Acceptance for temporary custody only

External party hands 5000 to a Community-side actor solely for temporary safekeeping/transport, without Community becoming a party to a financial Payment.

Cash Acceptance records the physical receipt/source fact; custody-only interpretation is attributable; no Cash Payment is recognized.

### 40.24. Unknown payer resolved later

Cash 1000 is physically accepted as Community funds, but payer cannot yet be sufficiently identified.

Payment recognition remains unresolved.

Later sufficient evidence identifies Payer A.

Recognition links Payment to the existing Cash Acceptance, preserves actual acceptance time and later recognition/recording time, and does not invent a second movement.

### 40.25. Several independent Cash Acceptances must not merge into one Payment

Payer A gives 500 and cashier finalizes Cash Acceptance CA1.

Later Payer A separately gives another 500 and cashier finalizes CA2.

```text
CA1 ≠ CA2
→ two physical money movements
→ not one Cash Payment 1000
```

If recognized, each acceptance produces its own Payment identity.

### 40.26. Additional cash before one acceptance is finalized

Payer tenders 800, cashier counts it, and before final acceptance is completed payer immediately adds 200.

Applicable process treats this as one continuous acceptance interaction:

```text
Cash Acceptance = 1000
→ one Payment 1000 where party semantics are unambiguous
```

No universal clock threshold defines the boundary; the coherent acceptance scope must remain explainable.

### 40.27. Mixed currency with immediate return

Payer tenders 1000 UAH + 20 EUR.

Community accepts UAH but does not accept EUR; 20 EUR is immediately returned before the acceptance scope is completed.

```text
Cash Acceptance = 1000 UAH
Payment = 1000 UAH
20 EUR → no Cash Acceptance / no Payment
```

No implicit currency conversion occurs.

### 40.28. Unauthorized actor receives cash

A person without established cash-receipt authority physically accepts 1000 from Payer A while purporting to act for Community.

Cash Acceptance/source fact is preserved.

Payment is not automatically recognized until authority/admissibility is resolved.

If Community later validly ratifies the acceptance, Payment may be recognized from the existing Cash Acceptance. If an already recognized Payment is found invalid because of authority failure, BP-FIN-002 applies.

### 40.29. Partial resolution of one Cash Acceptance

One representative tenders 2000 with evidence:

```text
500 from Payer A
700 from Payer B
800 origin unresolved
```

Cash Acceptance = 2000.

Payments A=500 and B=700 may be recognized.

Remaining 800 stays unresolved at Payment recognition level; it is not Unallocated Remainder of A or B.

### 40.30. Custody cash returned without Payment

Cash Acceptance 5000 is classified as custody-only.

Later the same custody funds are returned to the external owner without ever becoming a Payment involving Community.

The return is not Refund of a Community Payment.

### 40.31. Long-lived unresolved Cash Acceptance

Cash Acceptance 1000 remains without sufficient payer evidence for an extended period.

It remains visible for decision/reconciliation and is not auto-converted into income, Payment, Advance, Unallocated Remainder or write-off solely because time passed.

## 41. Инварианты

1. Cash Acceptance is an identity-bearing cash-channel source/process referent.
2. Cash Acceptance ≠ Cash Payment.
3. Cash Acceptance ≠ cash document.
4. Cash Acceptance ≠ Cashbox/CashBalance/CashOperation.
5. Cash Payment is a Payment.
6. Cash method does not create a separate obligation model.
7. Cash Payment ≠ cash document.
8. Cash Payment ≠ cashier action.
9. Cash Payment ≠ cash storage location/balance.
10. Cash Payment ≠ bank deposit.
11. Cash Payment ≠ Payment Allocation.
12. Cash Payment ≠ Expense.
13. Cashier/acceptor ≠ Payment recipient.
14. Physical tenderer ≠ payer automatically.
15. Personal Account ≠ payer.
16. Tendered amount ≠ accepted amount.
17. Immediate returned change is not Refund.
18. Immediate returned change is not outgoing Payment.
19. Sum of recognized Payments linked to one physical acceptance cannot exceed accepted cash amount.
20. When recognition of an acceptance is fully resolved, linked Payment amounts must explain the accepted cash amount according to applicable semantics.
21. Accepted-but-not-yet-recognized cash ≠ Unallocated Remainder.
22. Payment may exist without Allocation.
23. One Cash Payment may allocate to multiple obligations.
24. Cash method does not impose one Payment per PA.
25. Cross-subject/cross-account Allocation requires sufficient basis.
26. Cash document does not define Payment identity automatically.
27. Prepared receipt without acceptance does not create Payment.
28. Document correction ≠ Payment correction.
29. Physical acceptance and recording time may differ.
30. Late recording real Payment ≠ new Payment.
31. Technical retry ≠ second Payment.
32. Same payer/date/amount does not prove duplicate.
33. Payment correction belongs to BP-FIN-002.
34. Allocation correction belongs to BP-FIN-001.
35. Refund requires separate semantics.
36. Cash deposit to Community bank does not recreate underlying Payments.
37. Physical bank depositor ≠ payer aggregated cash.
38. Cash deposit does not create new income automatically.
39. Internal custody/transfer Community cash ≠ external Payment.
40. Universal Cashbox/CashBalance/CashOperation entity is not introduced.
41. Fake Subject is not created for unknown payer.
42. Fake Obligation is not created to consume cash.
43. Payment Intent/purpose ≠ actual Allocation.
44. Authority ≠ technical access.
45. Cash reconciliation ≠ Payment recognition.
46. Offline document number ≠ universal Payment identity.
47. Cash Payment may precede Financial Obligation where applicable semantics permits it.
48. Physical cash acceptance cardinality does not determine Payment cardinality.
49. Cash physically held in custody ≠ Payment automatically.
50. If materially meaningful Payment parties are not sufficiently determinable, Payment recognition is not confirmed.
51. Late recognition of already accepted cash ≠ a second physical movement.
52. One Cash Payment refers to one Cash Acceptance source; separate finalized Cash Acceptances are not silently merged into one Payment.
53. One Cash Acceptance may support 0..N Payments.
54. Cash Acceptance may exist without Payment recognition.
55. Custody-only Cash Acceptance does not create Payment automatically.
56. Lack of authority does not erase physical Cash Acceptance but blocks automatic Payment recognition.
57. Long-lived unresolved Cash Acceptance remains visible and is not auto-reclassified by timeout.

## 42. Что намеренно не решается

Настоящий BP не определяет:

- outgoing cash Payment / cash payout;
- universal Cashbox/Cash Register entity;
- cash custody/storage-location model;
- cash balance ledger;
- internal cash transfer process;
- cashier shift/open/close;
- cash inventory;
- safe/physical security;
- regulated accounting cashbook;
- tax/fiscal receipt requirements;
- RRO/PRRO/fiscalization;
- denomination accounting;
- counterfeit/legal incident workflow;
- bank deposit preparation workflow;
- detailed cash-to-bank reconciliation;
- cash withdrawal from bank;
- Expense recognition;
- payroll;
- BAS/BAF cash document mapping;
- accounting entries;
- UI/hardware terminals.

## 43. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003;
- ADR-004;
- ADR-006;
- ADR-010;
- ADR-011;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-003-REFUND.md`;
- `BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md`;
- REFERENCE_CANDIDATE_MATRIX;
- OSBBX_REFERENCE_ANALYSIS.

## 44. Нормативные последствия

Independent review подтвердил необходимость identity-bearing `Cash Acceptance` как channel-side source/process referent, но не как фундаментальной финансовой операции либо универсального cash lifecycle.

Требуется точечная синхронизация:

- ADR-006 — Cash Acceptance, его граница с Payment/document/custody и cardinality;
- DOMAIN_MODEL / TERMINOLOGY — definition, identity and 0..N Payment linkage;
- BP-FIN-ALLOCATION-001 — Initial Allocation работает только с recognized Payment, не с Cash Acceptance amount напрямую;
- BP-FIN-BANK-001 — cash-side reconciliation может связывать Bank Transaction с Cash Acceptance и recognized Cash Payments;
- REFERENCE_CANDIDATE_MATRIX — inbound часть REF-FIN-009 закрывается после принятия BP-CASH-001; custody/internal cash movement фиксируется отдельно в backlog.

Новый standalone ADR предварительно не требуется: аналогичный channel-side referent Bank Transaction уже определяется ADR-006.

Universal Cashbox/CashOperation/CashBalance и universal Cash Acceptance status machine не вводятся.

## 45. Решения independent review

1. BP-CASH-001 остаётся channel-specific Payment Recognition process; universal Payment Recognition BP не вводится.
2. Cash Acceptance вводится как identity-bearing channel-side source/process referent (вариант B review), не как Payment или фундаментальная FinancialOperation.
3. Universal Cash Acceptance lifecycle/status machine не вводится; authority, recognition, custody interpretation и disposition остаются traceable process semantics.
4. One Cash Acceptance may support 0..N Payments; one Cash Payment refers to one Cash Acceptance source; separate finalized Cash Acceptances не объединяются молча в один Payment.
5. Accepted/unresolved Cash Acceptance может существовать до Payment recognition; такая сумма не является Unallocated Remainder.
6. Payer / physical tenderer / cashier / obligated Subject различаются.
7. Unknown payer blocks Payment recognition until materially meaningful party information is sufficient; fake Subject не создаётся.
8. Cash document ≠ Cash Acceptance ≠ Payment; local legal/formalization policy может быть строже.
9. Unauthorized physical receipt сохраняется как Cash Acceptance source fact, но не создаёт Payment автоматически.
10. Immediate returned change before Cash Acceptance completion не является Refund/outgoing Payment; later return after Payment recognition uses outgoing/Refund semantics where applicable.
11. Temporary custody may have Cash Acceptance source fact but no Payment; full custody workflow remains separate.
12. Cash→bank deposit remains Bank Transaction and does not recreate underlying Payments.
13. Mirror notes required in BP-FIN-ALLOCATION-001 and BP-FIN-BANK-001.
14. New standalone ADR is not required; ADR-006 is the owning architectural document for the financial/channel boundary.
15. Inbound half REF-FIN-009 can close after normative synchronization; outgoing cash remains for BP-CASH-002, custody/internal movement remains a separate backlog problem.

## 46. Следующий шаг

1. internal review against ADR-003/004/006/010/011, DOMAIN_MODEL, TERMINOLOGY and neighboring finance BP;
2. pilot-ST scenario check;
3. independent Claude review;
4. point fixes;
5. normative synchronization;
6. continue with BP-CASH-002.