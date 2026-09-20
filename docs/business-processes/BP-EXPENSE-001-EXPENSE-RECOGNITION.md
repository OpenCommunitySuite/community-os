# BP-EXPENSE-001 — Регистрация и классификация расхода сообщества

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет, когда Community OS признаёт предметный `Expense` сообщества и как этот Expense связывается со сметой, Financial Obligations, Payments, направлениями использования и источниками финансирования.

Ключевая модель:

```text
sufficient concrete expense basis
→ Expense recognition
→ optional links to Financial Obligation / Payment
→ Expense Budget Distribution where applicable
→ Expense Financing where applicable
```

При этом:

```text
Expense
≠ Financial Obligation
≠ Payment
≠ Payment Allocation
≠ Budget / Budget Item
≠ Funding Source
≠ Expense Financing
≠ bank/cash movement
≠ accounting entry
```

## 2. Основной смысл Expense

Согласно ADR-006 Expense — финансово-управленческий смысл использования или предполагаемого использования средств для конкретной цели либо деятельности Community.

Expense описывает **зачем и в каком объёме** Community использует либо предметно намерено использовать средства в конкретном expense case.

Expense не является:

- бухгалтерским/налоговым расходом;
- исходящим Payment;
- Financial Obligation;
- документом поставщика;
- Budget Item;
- просто фактом уменьшения банковского/наличного остатка.

## 3. Concrete expense case ≠ Budget plan

Budget представляет утверждённый план на период.

Само наличие:

- Budget;
- Budget Item;
- плановой суммы;
- общего решения «ремонтировать электросеть»

не создаёт Expense автоматически.

Expense может быть признан до Payment/Obligation только когда существует достаточно конкретный expense case: определимы purpose/activity, amount/currency и sufficient basis.

Generic плановая потребность без конкретного expense case остаётся Budget/Management Decision semantics.

## 4. Expense identity

Expense имеет самостоятельную domain identity.

Identity Expense не определяется автоматически:

- номером supplier invoice/act;
- Payment identity;
- Bank Transaction;
- Cash Disbursement;
- Financial Obligation;
- Budget Item;
- Funding Source;
- accounting entry.

Один source document может быть основанием нескольких Expenses, а один Expense может опираться на несколько документов/фактов.

## 5. Minimum recognition semantics

Для recognized Expense должны быть достаточно определимы, где применимо:

- Community;
- amount/currency;
- purpose/activity;
- basis;
- materially significant period/event time;
- recognition time;
- provenance;
- authority;
- related Subject/Supplier/Contractual Relationship, если это существенно.

Не каждый Expense обязан иметь Supplier, Financial Obligation, Payment, Budget Item или Funding Source в момент recognition.

## 6. Expense basis

Основанием/входом Expense могут быть, согласно конкретному process:

- supplier invoice/act/document;
- Contractual Relationship;
- Financial Obligation;
- Management Decision;
- Community Consumption / resource facts;
- completed work/service fact;
- payroll/remuneration result, рассчитанный owning process;
- bank service fact;
- иной достаточный предметный факт.

Ни один из этих источников не создаёт Expense автоматически.

## 7. Supplier document ≠ Expense

Supplier invoice, act, receipt или иной документ может:

- быть evidence;
- описывать состав/стоимость;
- быть basis Financial Obligation;
- быть basis Expense.

Но:

```text
Supplier Document
≠ Financial Obligation
≠ Expense
≠ Payment
```

Один документ может содержать позиции с разным финансово-управленческим смыслом.

## 8. Expense ↔ Financial Obligation

Expense и Financial Obligation самостоятельны.

Допустимы сценарии:

- Expense exists, Obligation not yet established;
- Obligation exists, Expense not yet recognized;
- Expense and Obligation recognized together;
- one Expense relates to multiple Obligations;
- one Obligation contains amounts related to multiple Expenses or non-Expense financial meanings.

Universal `1 Expense = 1 Financial Obligation` не вводится.

Если важна только часть Financial Obligation, связь Expense↔Obligation должна сохранять amount/currency или другой sufficient scope, а не считать весь Obligation расходом автоматически.

## 9. Expense ↔ Payment

Outgoing Payment не создаёт Expense автоматически.

Допустимы:

- Expense before Payment;
- Payment before Expense;
- Expense without Payment yet;
- Payment without Expense;
- one Expense paid by multiple Payments;
- one Payment connected with several Expenses.

Связь Payment↔Expense не является Payment Allocation и не переписывает Payment.

Если Payment уже связан с Financial Obligation, Expense может объясняться через obligation-scope; direct Payment↔Expense relation не является universal mandatory.

## 10. Payment without Expense

Примеры Payment, которые не становятся Expense автоматически:

- Refund Payment;
- own-account transfer;
- supplier prepayment before expense recognition;
- возврат/settlement, не имеющий expense meaning;
- иной outgoing Payment с другим финансовым смыслом.

Fake Expense не создаётся для объяснения движения денег.

## 11. Expense without Payment

Expense может существовать до фактической оплаты.

Например:

- Community признало конкретный ремонтный Expense на основании выполненных работ;
- Supplier Obligation ещё не paid;
- Payment будет позднее.

Отсутствие Payment не делает Expense «планом» автоматически, если concrete use already recognized.

## 12. Prospective concrete Expense

Expense может быть признан до фактического использования/Payment, если sufficient basis устанавливает конкретное предполагаемое использование средств и amount/currency.

Пример:

```text
competent decision / contract
→ concrete repair Expense 30 000
→ Supplier/Obligation/Payment may follow later
```

Но Budget plan 300 000 на «ремонт» без concrete expense case не создаёт десять или один Expense автоматически.

Настоящий BP не вводит universal Expense lifecycle/status machine `planned/actual/paid`.

## 13. Expense amount and currency

Expense имеет определимую monetary amount/currency.

Если source содержит только estimate/range, которого недостаточно для предметно определённого Expense amount, recognition остаётся proposal/unresolved до applicable process decision.

Subsequent materially significant amount correction не выполняется silent edit; применяется отдельная traceable correction/review semantics.

## 14. Expense time semantics

Следует различать, где materially significant:

- basis/service/consumption period;
- expense effective/use time;
- Expense recognition time;
- Financial Obligation inception/recognition time;
- Payment time;
- Budget period;
- Expense Budget Distribution time;
- Expense Financing recognition time.

Technical record timestamp не заменяет предметное время.

## 15. Community Consumption as expense basis

Community Consumption является resource-domain fact и не является Expense автоматически.

Например:

```text
pump electricity consumption
→ valuation / supplier or applicable financial basis
→ Community Expense where justified
```

Resource context owns Consumption; finance context owns Expense.

Correction Consumption не переписывает Expense silently; owning financial process решает recalculation/correction consequences.

## 16. Pilot ST — pump electricity

В пилотном СТ электроэнергия насосной оплачивается из членских средств и является Community use.

Проверочный сценарий:

```text
Supplier Obligation total = 10 000
individual-consumption-related part = 7 000
pump/common Community part = 3 000
```

Нельзя автоматически создать Expense 10 000 только потому, что Community должно Supplier 10 000 либо оплатило 10 000.

Если sufficient basis подтверждает Community-use portion 3 000:

```text
Expense = 3 000
related Obligation scope = 3 000 of 10 000
Budget Item = pump/common needs where applicable
Funding Source = membership contributions where applicable
```

Owner accruals/individual consumption, Supplier Obligation, Payment and Community Expense остаются разными facts.

## 17. One source document → several Expenses

Supplier act 30 000 может включать:

```text
20 000 electrical repair
7 000 water repair
3 000 general maintenance
```

Если это три самостоятельных expense cases, могут быть recognized три Expenses.

Document count/cardinality не определяет Expense cardinality.

## 18. One Expense → several Budget Items

Если один coherent Expense по предметному смыслу относится к нескольким Budget Items, он не обязан искусственно split только ради сметной классификации.

Допускается Expense Budget Distribution:

```text
Expense 30 000
→ Budget Item A: 20 000
→ Budget Item B: 7 000
→ Budget Item C: 3 000
```

Этот mechanism не является Payment Allocation.

## 19. Expense Budget Distribution

**Expense Budget Distribution** в настоящем BP — historically significant classification relation/action, связывающий amount Expense с одним или несколькими Budget Items.

Он:

- не является Payment Allocation;
- не меняет Expense identity;
- не создаёт Budget;
- не создаёт Funding Source;
- может быть partial/unresolved;
- может выполняться одновременно с Expense recognition или позднее.

Новый fundamental entity универсального типа `ExpenseAllocation` не вводится; конкретная representation определяется позднее.

## 20. Budget distribution amount constraints

Для текущего effective Expense Budget Distribution:

```text
sum(amounts distributed to mutually exclusive Budget Items)
≤ Expense amount
```

Если весь Expense полностью классифицирован по таким Budget Items:

```text
sum(distribution amounts) = Expense amount
```

Если Budget Items в конкретной модели не являются mutually exclusive monetary buckets, такая модель должна иметь отдельную явную semantics и не использовать этот additive distribution rule молча.

## 21. Expense without Budget Item

Expense может быть recognized:

- без Budget Item;
- вне утверждённой сметы;
- сверх plan amount;
- при temporarily unresolved classification.

Отсутствие Budget Item или превышение сметы не делает реальный Expense несуществующим.

System must allow representation of variance/nonconformance for analysis/audit rather than hide actual Expense by rejecting recognition.

## 22. Budget overrun

Если Budget Item planned amount = 20 000, а valid actual Expense = 25 000:

```text
Expense = 25 000
Budget plan remains 20 000
variance = 5 000
```

Budget не переписывается автоматически вслед за Expense.

Сам факт overrun не создаёт новый Funding Source и не изменяет authority retroactively.

## 23. Current Budget ≠ historical Expense classification

Изменение текущей сметы или Budget Item не переписывает historical Expense/Distribution silently.

Если Budget structure/version materially affects interpretation, historical applicable Budget/Budget Item referent должен оставаться определимым according to ADR-004/005.

Настоящий BP не вводит universal Budget Version entity, если она не требуется существующей budget semantics.

## 24. Expense Budget Distribution correction

Unconfirmed distribution proposal может быть исправлен до confirmation.

Confirmed Expense Budget Distribution не редактируется silently. Изменение классификации выполняется traceably with old/new distribution and basis.

Это не Expense amount correction автоматически.

## 25. Funding Source

Funding Source описывает **происхождение средств Community**.

Он не является:

- Bank Account;
- Payment method;
- Payment;
- Budget Item;
- Use Direction;
- Expense;
- technical reserve.

Нахождение денег на конкретном банковском счёте не доказывает Funding Source.

Internal transfer between own accounts не меняет source origin автоматически.

## 26. Expense Financing

Expense Financing — существующая предметная связь конкретного Expense с одним или несколькими Funding Sources, отражающая его фактическое финансово-управленческое покрытие.

Допускается:

```text
one Funding Source → many Expenses
one Expense → many Funding Sources
```

Expense Financing ≠ Payment Allocation.

## 27. Expense Financing amount

Если Expense покрывается несколькими Funding Sources, financing relation должен иметь определимый amount/currency.

Для current effective Financing:

```text
sum(Expense Financing amounts) ≤ Expense amount
```

Полностью покрытый Expense может иметь equality.

Partially financed/unresolved Expense остаётся valid Expense; отсутствие Funding Source не создаёт fake source.

## 28. Funding Source plan ≠ actual Expense Financing

Budget может предусматривать, что Budget Item финансируется из membership contributions.

Это не создаёт Expense Financing каждого будущего Expense автоматически.

Actual Expense Financing признаётся по applicable basis/policy для конкретного Expense.

И наоборот, actual financing может выявить отклонение от plan; факт не скрывается только потому, что использование нарушает ожидаемое направление.

## 29. Funding Source ≠ reservation

Expense Financing не является техническим lock/reservation конкретных денег на банковском счёте.

Признание Financing:

- не блокирует cash/bank balance технически;
- не создаёт отдельный «кошелёк»;
- не гарантирует наличие ликвидности;
- не превращает Funding Source в Bank Account.

Applicable organizational restrictions may be evaluated separately.

## 30. Use Direction

Use Direction — предметная цель/область использования средств и не тождествен Budget Item или Funding Source.

Expense может иметь applicable Use Direction independently of Budget Distribution and Expense Financing.

Budget Item не определяет Use Direction автоматически unless explicit applicable mapping/rule exists.

## 31. Payment source ≠ Funding Source automatically

Incoming Payment происхождение может быть evidence Funding Source, но:

```text
incoming Payment
≠ Funding Source
≠ Expense Financing
```

One Funding Source may aggregate origin across many Payments or other available funds according to applicable semantics.

Specific payment-to-expense traceability is not required universally by Funding Source model.

## 32. Expense relation to Payment without Obligation

В некоторых immediate purchase/settlement сценариях отдельный long-lived Financial Obligation может не иметь самостоятельной ценности в Community OS.

Если outgoing Payment и sufficient evidence прямо подтверждают concrete Expense, Expense may relate to Payment without forcing fake persistent Obligation.

Это не означает, что Payment itself is Expense.

## 33. Prepayment

Supplier prepayment может существовать до Expense.

Позднее recognized Expense не меняет original Payment.

Если prepayment later applies to Obligation/Expense context, соответствующие links/distributions establish separately.

Не создаётся backdated Expense только чтобы «объяснить» старый Payment.

## 34. Refund

Refund Payment не является Expense автоматически.

Financial Obligation to return и Refund Payment относятся к возврату средств, а не к use-purpose Community expense.

Если отдельный fee/cost возникает из refund process, только этот independent fact может иметь Expense meaning.

## 35. Own-account transfer and cash custody

Own-account bank transfer, cash deposit, cash withdrawal, internal custody transfer:

```text
≠ Expense
```

Они меняют форму/место Community funds, а не предметную цель их использования внешней стороной автоматически.

## 36. Bank fee

Bank Transaction fee/service charge может быть evidence для:

- Financial Obligation where applicable;
- Expense recognition;
- outgoing Payment.

Но Bank Transaction itself ≠ Expense.

Automatic recognition допустим только по applicable rule with sufficient evidence/authority.

## 37. Payroll / remuneration

Expense по вознаграждению сотруднику/исполнителю может быть recognized на основании результата owning payroll/remuneration process.

BP-EXPENSE-001 не рассчитывает salary/taxes/ЕСВ/ПДФО/военный сбор.

Payment to Employee ≠ Expense automatically.

## 38. Document / Contractual Relationship

Contractual Relationship может быть context/basis Expense.

Document может оформлять/подтверждать Expense.

Но:

```text
Contractual Relationship
≠ Expense
Document
≠ Expense
```

## 39. Expense recognition authority

Manual Expense recognition требует attributable domain authority.

Authority на:

- признание Expense;
- Budget Distribution;
- Expense Financing;
- correction/reclassification

может различаться according to policy.

Technical access role не создаёт financial authority.

## 40. Automatic recognition

Automatic Expense recognition допускается только если:

- applicable policy/rule explicitly permits it;
- basis/source semantics sufficient;
- amount/currency/purpose determinable;
- authority/automation provenance explainable.

Otherwise case remains proposal/unresolved/Requires Decision.

## 41. Idempotency / duplicate

Technical retry same recognition action/evidence не создаёт duplicate Expense.

Совпадение:

```text
same supplier + same amount + same date
```

не доказывает duplicate.

Expense identity/cardinality определяется concrete expense case and evidence, not source row/document number alone.

## 42. Confirmation scope

Expense recognition, Expense Budget Distribution и Expense Financing могут быть coordinated в одном user interaction, но создают разные domain results/relations.

Universal atomic requirement across all three не вводится.

Если конкретный policy делает Budget Distribution или Financing обязательным prerequisite Expense recognition, dependency должна быть explicit and revalidated before confirmation.

## 43. Wrong Expense recognition

Если confirmed Expense itself materially wrong:

- silent edit/delete prohibited;
- correction/replacement/cancellation must preserve history;
- Payment, Financial Obligation, Budget Distribution and Financing are revalidated separately;
- no universal cascade.

Настоящий BP не определяет полный `Expense Correction` workflow; при практической необходимости он проектируется отдельно.

## 44. Wrong Budget Distribution

Если Expense correct but Budget classification wrong:

- Expense remains;
- Budget Distribution changes traceably;
- Payment/Obligation не переписываются.

## 45. Wrong Expense Financing

Если Expense correct but Funding Source association wrong:

- Expense remains;
- Expense Financing changes traceably;
- Funding Source origin history preserved;
- bank/cash transactions не переписываются.

## 46. Pilot ST — mixed supplier obligation

Supplier invoice/obligation 10 000:

```text
7 000 → individually recoverable electricity
3 000 → pump/common use
```

Community pays Supplier 10 000.

Valid result may be:

```text
Financial Obligation = 10 000
Payment = 10 000
Community Expense = 3 000
Expense Budget Distribution: pump/common Budget Item = 3 000
Expense Financing: membership Funding Source = 3 000
```

No Expense 7 000 is created merely because Community temporarily settles Supplier for individually recoverable consumption.

## 47. Pilot ST — one Expense across several Budget Items

Concrete repair project Expense = 30 000.

Budget classification:

```text
20 000 → electrical network repair
7 000  → water network repair
3 000  → common maintenance
```

One Expense identity may remain if this is one coherent management expense case; Budget Distribution carries split amounts.

If the three purposes are truly independent expense cases, three Expenses may instead be recognized. Source document/payment cardinality does not decide this.

## 48. Pilot ST — mixed funding

Expense 30 000 is funded:

```text
18 000 → membership contributions
12 000 → target contributions
```

Expense Financing records these amounts independently from Budget Distribution.

Payment may come from one bank account and does not prove one Funding Source.

## 49. Scenarios

### 49.1. Supplier invoice before Expense recognition
Invoice exists; no Expense until sufficient recognition basis.

### 49.2. Expense before Payment
Completed repair recognized Expense 10 000; unpaid Obligation; Payment later.

### 49.3. Supplier prepayment before Expense
Payment 10 000 exists; Expense later recognized 8 000; original Payment unchanged.

### 49.4. Payment with no Expense
Refund Payment or own-account movement does not create Expense.

### 49.5. Expense with no Budget Item
Valid Expense recognized; classification unresolved/off-budget; visible for audit.

### 49.6. Budget overrun
Budget 20 000; Expense 25 000; Expense preserved, variance 5 000.

### 49.7. One Expense → three Budget Items
30 000 split 20/7/3 by confirmed Expense Budget Distribution.

### 49.8. One document → three Expenses
Document contains three independently meaningful activities; three Expense identities.

### 49.9. One Obligation → Expense only for part
Obligation 10 000; Expense relation scope 3 000; no automatic Expense 10 000.

### 49.10. One Payment → several Expenses
Payment 30 000 to supplier covers several expense cases; Payment remains one movement.

### 49.11. One Expense → several Payments
Expense 30 000 paid 10 000 + 20 000; Expense identity unchanged.

### 49.12. Expense funded from two sources
Expense Financing 18 000 + 12 000 = Expense 30 000.

### 49.13. Partial financing
Expense 30 000; recognized Financing 18 000; remaining 12 000 not assigned yet; Expense remains valid.

### 49.14. Planned Funding Source differs from actual
Budget expected membership; actual authorized financing uses target funds; mismatch remains visible, not silently rewritten.

### 49.15. Pump electricity
Only Community-use portion recognized Expense; owner-related consumption portion remains separate financial/resource semantics.

### 49.16. Bank fee
Bank movement may support Expense recognition; Bank Transaction itself is not Expense.

### 49.17. Payroll result
External/owning payroll process provides valid remuneration amount; Expense recognized without Community OS calculating payroll.

### 49.18. Refund
Refund Payment exists; no Expense unless an independent fee/cost basis exists.

### 49.19. Cash withdrawal
Own-bank withdrawal to Community cash does not create Expense.

### 49.20. Wrong Budget Item
Expense correct; reclassify Budget Distribution traceably.

### 49.21. Wrong Funding Source
Expense correct; Financing relation corrected traceably.

### 49.22. Current budget changed later
Historical Expense/Distribution not silently moved to new current item.

### 49.23. Supplier document duplicated
Duplicate document delivery does not create duplicate Expense automatically.

### 49.24. Expense purpose spans two truly independent activities
Owning semantics may require two Expenses rather than one distributed Expense; Requires Decision based on business case, not document convenience.

## 50. Инварианты

1. Expense ≠ Financial Obligation.
2. Expense ≠ Payment.
3. Expense ≠ Payment Allocation.
4. Expense ≠ Budget Item.
5. Expense ≠ Funding Source.
6. Expense ≠ Expense Financing.
7. Expense ≠ Bank Transaction/Cash Disbursement.
8. Supplier Document ≠ Expense.
9. Budget plan ≠ Expense automatically.
10. Concrete Expense may precede Obligation/Payment where sufficient basis exists.
11. Payment may precede Expense.
12. Outgoing Payment does not create Expense automatically.
13. Financial Obligation does not create Expense automatically.
14. Expense identity is not defined by document/Payment/Obligation cardinality.
15. One Expense may relate to multiple Obligations/Payments.
16. One Obligation/Payment may relate to multiple Expenses.
17. Partial obligation scope may have Expense meaning without entire obligation becoming Expense.
18. Community Consumption ≠ Expense automatically.
19. Expense amount/currency must be sufficiently determinable for recognition.
20. Expense Budget Distribution ≠ Payment Allocation.
21. Expense Budget Distribution does not change Expense identity.
22. Distributed amount cannot exceed Expense amount under additive mutually-exclusive Budget Item semantics.
23. Expense may exist without Budget Item.
24. Budget overrun does not invalidate real Expense.
25. Current Budget changes do not rewrite historical Expense classification.
26. Funding Source ≠ Bank Account.
27. Funding Source ≠ Payment.
28. Funding Source ≠ Use Direction.
29. Expense Financing ≠ Funding Source.
30. Expense Financing ≠ Payment Allocation.
31. Expense Financing is not technical reservation.
32. Total current effective Expense Financing cannot exceed Expense amount.
33. Expense may be partially/unfinanced.
34. Planned Funding Source ≠ actual Expense Financing automatically.
35. Use Direction ≠ Budget Item/Funding Source.
36. Refund Payment ≠ Expense automatically.
37. Own-account transfer/cash custody ≠ Expense.
38. Prepayment ≠ Expense automatically.
39. Payroll Payment ≠ Expense automatically.
40. Document correction ≠ Expense correction automatically.
41. Wrong Budget Distribution does not rewrite Expense.
42. Wrong Financing relation does not rewrite Expense.
43. Confirmed Expense changes are traceable; no silent edit/delete.
44. Technical retry ≠ duplicate Expense.
45. Same supplier/amount/date ≠ duplicate proof.
46. Authority ≠ technical access.
47. Expense recognition / Budget Distribution / Financing are separate domain results even when coordinated in one interaction.
48. Actual off-budget/nonconforming Expense remains representable for audit; system does not hide it by rejecting the fact.

## 51. Что намеренно не решается

- accounting/tax expense recognition;
- bookkeeping entries;
- BAS/BAF postings;
- procurement workflow;
- purchase order;
- stock/TMC/fixed assets;
- payroll calculation;
- supplier invoice lifecycle;
- Budget approval/version workflow;
- universal Expense Correction workflow;
- cash/bank liquidity reservation;
- project accounting;
- cost centers;
- depreciation;
- VAT/tax treatment;
- multi-currency conversion;
- technical UI/API/DB schema.

## 52. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-008;
- ADR-010;
- ADR-011;
- `BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md`;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-003-REFUND.md`;
- `BP-CASH-001-CASH-PAYMENT-RECEIPT.md`;
- `BP-CASH-002-CASH-PAYMENT-DISBURSEMENT.md`;
- REFERENCE_CANDIDATE_MATRIX;
- OSBBX_REFERENCE_ANALYSIS.

## 53. Предварительные нормативные последствия

Предварительно новый ADR и новая fundamental entity не требуются: Expense, Budget, Budget Item, Funding Source, Use Direction и Expense Financing уже присутствуют в нормативной модели.

После review проверить:

- достаточно ли Expense identity/basis semantics;
- нужна ли normative фиксация Expense Budget Distribution;
- корректны ли additive amount constraints;
- нужна ли amount-bearing relation Expense↔Obligation/Payment;
- достаточно ли Expense Financing semantics;
- нужны ли mirror notes в payment/bank/cash BP;
- можно ли закрыть REF-FIN-010;
- нужен ли отдельный candidate/BP для Expense Correction.

## 54. Открытые вопросы для review

1. является ли Expense concrete use/intended-use case с обязательным amount/currency;
2. не дублирует ли prospective Expense Budget/Management Decision;
3. где проходит identity boundary one Expense vs several Expenses;
4. нужна ли explicit amount-bearing Expense↔Obligation relation;
5. нужна ли direct Expense↔Payment relation либо достаточно Obligation/Allocation context;
6. корректен ли pilot scenario 10 000 obligation / 3 000 Community Expense;
7. корректна ли one Expense→multiple Budget Items model;
8. нужен ли `Expense Budget Distribution` как process relation или это уже отдельная entity;
9. должны ли Budget Distribution amounts всегда sum to Expense amount when complete;
10. как трактовать Budget Items, если они аналитически перекрываются;
11. должен ли off-budget Expense всегда быть допустим;
12. корректно ли Expense Financing total ≤ Expense amount;
13. когда Expense Financing может возникнуть относительно Payment;
14. можно ли Funding Source выводить из incoming Payment/PA/Budget Item автоматически;
15. достаточно ли Use Direction boundary;
16. нужен ли separate Expense Correction BP;
17. какие downstream effects у Expense correction;
18. нужна ли direct link Supplier/Contractual Relationship;
19. какие части REF-FIN-010 можно закрыть после этого BP.

## 55. Следующий шаг

1. internal review against ADR-003/004/005/006/008/010/011 and neighboring finance BP;
2. pilot-ST scenario check;
3. independent Claude review;
4. point fixes;
5. normative synchronization and close/refine REF-FIN-010;
6. determine next Stage 5/6 priority.