# BP-CASH-001 — Приём наличного платежа

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику приёма наличных денежных средств внешней стороной в пользу Community и признания соответствующего `Payment`.

Ключевая модель:

```text
external party tenders cash
+ authorized Community-side acceptance
+ determinable amount/currency/parties/time
→ recognized Cash Payment
→ Initial Payment Allocation where applicable
→ receipt/cash document as evidence/formalization where applicable
```

Процесс не вводит универсальную бухгалтерскую модель кассы, склад денежных средств, регламентированный кассовый учёт или бухгалтерскую проводку.

## 2. Основная граница

```text
Cash Payment
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

## 5. Физическая передача и признание Payment

Физическая передача наличных является существенным evidence/fact, но признанный Payment возникает только когда финансовый контекст имеет достаточное основание признать реальное движение денег между сторонами.

```text
cash physically presented
≠ cash actually accepted as Community funds
≠ recognized Payment automatically
```

Для Cash Payment наличные должны быть приняты от внешней стороны **в финансовом смысле как средства Community**, а не только физически оказаться у уполномоченного лица.

Деньги могут быть предъявлены, пересчитаны и возвращены до завершения acceptance. Они также могут быть переданы Community только во временную custody/хранение либо быть уже принадлежащими Community; такие случаи не становятся Payment только из-за физической передачи.

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

Приём наличных является финансово значимым действием. Должно быть определимо полномочие, где применимо, на физический приём наличных, подтверждение recognition Cash Payment, идентификацию payer и оформление требуемого документа.

Technical access role не создаёт финансовое полномочие.

## 9. Tendered amount ≠ accepted amount

Следует различать сумму, предъявленную для расчёта/пересчёта, сумму фактически принятую Community, сумму немедленно возвращённой сдачи и сумму recognized Payment.

В типовом сценарии recognized Cash Payment равен accepted cash amount.

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

## 13. Payment cardinality

Один Cash Payment может исполнять несколько obligations. Разбиение одной принятой суммы по назначениям не создаёт несколько Payments автоматически.

Но и один physical cash handover/acceptance не задаёт universal identity/cardinality Payment.

Например, один представитель может одновременно передать документированно отдельные суммы нескольких плательщиков. Если evidence подтверждает несколько самостоятельных financial movements, один physical acceptance scope может привести к recognition нескольких Cash Payments.

И наоборот, один payer может передать одну сумму и распределить её между несколькими obligations — это может оставаться одним Payment.

```text
physical acceptance cardinality
≠ Payment cardinality
```

Cash Payment может быть полностью или частично нераспределён.

## 14. Payer ≠ obligated Subject

Cash Payment может быть принят от Subject A для obligation Subject B, если cross-subject Allocation имеет достаточное основание.

Cash acceptance само по себе не даёт права погасить obligation другого Subject.

## 15. Unknown payer

Если деньги физически приняты как средства Community, но предметно значимые сведения о payer/сторонах пока недостаточно определены:

- fake Subject не создаётся;
- current User/кассир не подставляется как payer;
- уже состоявшееся физическое acceptance и его evidence сохраняются;
- **Payment recognition не подтверждается**, пока требования ADR-006 к определимости materially meaningful parties не выполнены;
- case остаётся unresolved/Requires Decision либо разрешается позднее на достаточном основании.

Позднее recognition такого real cash movement не является новым физическим движением денег; actual acceptance time и recognition/recording time различаются.

Universal anonymous-cash policy не вводится.

## 16. Personal Account и Payment Intent

Personal Account является context/matching input, но не payer и не Payment.

Payment Intent может содержать предполагаемую сумму и Allocation, но после фактического приёма:

```text
Payment Intent ≠ Cash Payment ≠ actual Allocation
```

Расхождение суммы/сторон требует revalidation.

## 17. Cash receipt document

Квитанция, приходный кассовый ордер или иной cash receipt document может подтверждать и оформлять Payment, содержать сумму, стороны и назначение, а также быть обязательным согласно local policy/law.

Но:

```text
cash document ≠ Payment
```

Document identity не определяет Payment identity автоматически.

## 18. Документ и Payment могут иметь разное время

Payment не перестаёт существовать только потому, что принтер/PDF/storage временно недоступен, если sufficient evidence реального movement уже существует.

Если local legal/policy semantics требует документ до recognition, это дополнительное ограничение конкретной конфигурации, а не universal rule Community OS.

Предварительно созданный документ без фактического acceptance денег не создаёт Payment.

## 19. Ошибка документа ≠ ошибка Payment

Если документ ошибочен, а Payment признан корректно, document correction не является Payment correction.

Если Payment recognition itself wrong, применяется `BP-FIN-002`.

## 20. Временная семантика

Следует различать, где materially significant:

- tendering time;
- physical acceptance time;
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

## 26. Передача наличных внутри Community и custody

Передача уже принадлежащих Community наличных от кассира председателю или между хранителями не является новым Payment между Community и внешней стороной.

Также физическая передача внешних денег только для временного хранения/перевозки/иного custody-сценария не является Payment автоматически, если Community не становится финансовой стороной движения средств в смысле ADR-006.

Такие действия могут потребовать отдельной custody/internal cash movement semantics, но не входят в BP-CASH-001.

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

Reconciliation между Cash Payments, cash documents, custody/internal movements where modeled и bank deposits может быть operationally necessary.

Но:

```text
reconciliation ≠ Payment recognition ≠ Allocation ≠ Expense
```

Детальная cash reconciliation semantics не определяется настоящим BP.

## 32. Idempotency / duplicate

Повторная техническая обработка одного confirmed cash acceptance не создаёт второй Payment.

Совпадение payer + amount + date не доказывает duplicate автоматически.

Если один real Cash Payment recognized twice, исправление относится к BP-FIN-002.

## 33. Draft / preparation

До physical acceptance system может иметь draft с expected payer, amount, obligations, purpose, Allocation Proposal и document draft.

Draft ≠ Payment и может быть изменён/отброшен до acceptance.

Universal `Cash Receipt Draft` entity не вводится.

## 34. Failure after physical acceptance before system recording

Возможен сценарий:

1. cash physically accepted authorized Community actor;
2. network/system unavailable;
3. Payment not yet recorded.

После восстановления later recording не является новым movement. Actual payment time и recording time различаются, duplicate должен быть предотвращён, evidence/provenance сохраняется.

Это late recording existing Payment, а не новый Payment.

## 35. Offline/manual receipt

Если Community допускает manual/offline acceptance, бумажный документ может быть evidence, а later system entry фиксирует реальный historical Payment.

Document number не является universal Payment identity.

## 36. Payment before Obligation

Cash Payment может быть принят до возникновения конкретного Financial Obligation, если applicable semantics это допускает.

Сумма может остаться Unallocated или получить meaning Advance при sufficient basis. Fake future obligation не создаётся.

## 37. Provenance

Для recognized Cash Payment должны быть explainable, где применимо:

- Payment identity/referent;
- direction;
- accepted amount/currency;
- actual acceptance/payment time and recording time;
- payer and recipient;
- physical tenderer if materially distinct;
- acting cashier/acceptor;
- authority;
- tendered amount and immediate returned change;
- purpose/Payment Intent inputs;
- PA/Object context;
- related cash documents;
- offline/manual evidence;
- retry/correction links;
- subsequent Initial Allocation;
- later bank-deposit reconciliation links where available.

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

### 40.10. Unknown payer
No fake Subject/cashier payer; Requires Decision according to applicable semantics.

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

### 40.23. Cash accepted for temporary custody only

External party hands 5000 to an authorized Community actor solely for temporary safekeeping/transport, without Community receiving it as a party to a financial Payment.

Physical custody does not create Cash Payment automatically.

### 40.24. Unknown payer resolved later

Cash 1000 is physically accepted as Community funds, but payer cannot yet be sufficiently identified.

Payment recognition remains unresolved.

Later sufficient evidence identifies Payer A.

Recognition records the real historical movement with actual acceptance time and later recognition/recording time; it does not invent a second movement.

## 41. Инварианты

1. Cash Payment is a Payment.
2. Cash method does not create a separate obligation model.
3. Cash Payment ≠ cash document.
4. Cash Payment ≠ cashier action.
5. Cash Payment ≠ cash storage location/balance.
6. Cash Payment ≠ bank deposit.
7. Cash Payment ≠ Payment Allocation.
8. Cash Payment ≠ Expense.
9. Cashier/acceptor ≠ Payment recipient.
10. Physical tenderer ≠ payer automatically.
11. Personal Account ≠ payer.
12. Tendered amount ≠ accepted amount.
13. Immediate returned change is not Refund.
14. Immediate returned change is not outgoing Payment.
15. Recognized Cash Payment normally equals accepted cash amount.
16. Payment may exist without Allocation.
17. One Cash Payment may allocate to multiple obligations.
18. Cash method does not impose one Payment per PA.
19. Cross-subject/cross-account Allocation requires sufficient basis.
20. Cash document does not define Payment identity automatically.
21. Prepared receipt without acceptance does not create Payment.
22. Document correction ≠ Payment correction.
23. Physical acceptance and recording time may differ.
24. Late recording real Payment ≠ new Payment.
25. Technical retry ≠ second Payment.
26. Same payer/date/amount does not prove duplicate.
27. Payment correction belongs to BP-FIN-002.
28. Allocation correction belongs to BP-FIN-001.
29. Refund requires separate semantics.
30. Cash deposit to Community bank does not recreate underlying Payments.
31. Physical bank depositor ≠ payer aggregated cash.
32. Cash deposit does not create new income automatically.
33. Internal custody/transfer Community cash ≠ external Payment.
34. Universal Cashbox/CashBalance/CashOperation entity is not introduced.
35. Fake Subject is not created for unknown payer.
36. Fake Obligation is not created to consume cash.
37. Payment Intent/purpose ≠ actual Allocation.
38. Authority ≠ technical access.
39. Cash reconciliation ≠ Payment recognition.
40. Offline document number ≠ universal Payment identity.
41. Cash Payment may precede Financial Obligation where applicable semantics permits it.
42. Physical cash acceptance cardinality does not determine Payment cardinality.
43. Cash physically held in custody ≠ Payment automatically.
44. If materially meaningful Payment parties are not sufficiently determinable, Payment recognition is not confirmed.
45. Late recognition of already accepted cash ≠ a second physical movement.

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

Предварительно новый ADR и новая fundamental entity не требуются.

После review проверить необходимость точечной синхронизации по:

- Cash Payment recognition as channel-specific Payment recognition;
- accepted amount vs tendered/immediate change;
- cashier/physical tenderer vs Payment parties;
- cash document vs Payment;
- late/offline recording;
- cash-to-bank deposit boundary;
- whether any minimal cash custody concept is required now.

Universal Cashbox/CashOperation/CashBalance не следует вводить без независимой real process need.

## 45. Открытые вопросы для review

Перед принятием Draft независимо проверить:

1. достаточно ли BP-CASH-001 как channel-specific Payment Recognition process без universal Payment Recognition BP;
2. корректна ли модель tendered / accepted / immediate change;
3. нужна ли отдельная domain identity cash acceptance action или Payment + provenance достаточно;
4. достаточно ли различия payer / physical tenderer / cashier / obligated Subject;
5. можно ли recognize Payment при temporarily unknown payer;
6. является ли cash receipt document optional domain-wise или в пилотном СТ должен быть mandatory policy;
7. нужно ли сейчас вводить minimal cash custody/location concept для объяснения cash между acceptance и bank deposit;
8. достаточно ли bank-deposit boundary из BP-FIN-BANK-001;
9. нужен ли separate internal cash movement BP before BP-CASH-002;
10. достаточна ли late/offline recording model;
11. нужен ли mirror note в BP-FIN-ALLOCATION-001;
12. нужен ли mirror note в BP-FIN-BANK-001;
13. достаточно ли scope incoming external cash only;
14. можно ли после BP-CASH-001 считать inbound half REF-FIN-009 закрытой, оставив outgoing cash до BP-CASH-002.

## 46. Следующий шаг

1. internal review against ADR-003/004/006/010/011, DOMAIN_MODEL, TERMINOLOGY and neighboring finance BP;
2. pilot-ST scenario check;
3. independent Claude review;
4. point fixes;
5. normative synchronization;
6. continue with BP-CASH-002.