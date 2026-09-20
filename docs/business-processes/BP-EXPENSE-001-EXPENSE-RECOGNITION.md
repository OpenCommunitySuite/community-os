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

Expense может быть признан до Payment/Obligation только когда существует достаточно конкретный expense case: определимы purpose/activity, amount/currency, scope и sufficient basis, а применимая предметная семантика уже признаёт это конкретное использование либо конкретное intended use средств Community.

Generic плановая потребность, предварительное обсуждение, estimate или Budget/Management Decision без признанного concrete intended-use case Expense не создают автоматически.

## 4. Expense identity

Expense имеет самостоятельную domain identity.

Граница one Expense vs several Expenses определяется continuity одного coherent financial-management use case: предметной целью/деятельностью, basis, materially significant scope и исторической объяснимостью результата.

Ни один отдельный критерий — supplier, document, Payment, Obligation либо Budget Item — не является универсальным identity key.

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

Такая связь объясняет, какая часть monetary claim имеет соответствующий expense meaning; она не является Payment Allocation и не создаёт/исполняет Financial Obligation.

### 8.1. Monetary scope Expense ↔ Obligation

Если связь Expense↔Financial Obligation используется как additive monetary attribution, должны соблюдаться ограничения против двойного учёта:

```text
sum(expense-attributed scopes of one Obligation)
≤ Obligation amount

sum(obligation-attributed scopes explaining one Expense)
≤ Expense amount
```

Равенство не обязательно: Financial Obligation может включать non-Expense monetary meaning, а Expense может иметь basis, не представленный Financial Obligation.

Эти ограничения не являются Payment Allocation и не определяют очередность исполнения Obligation.

## 9. Expense ↔ Payment

Outgoing Payment не создаёт Expense автоматически.

Допустимы:

- Expense before Payment;
- Payment before Expense;
- Expense without Payment yet;
- Payment without Expense;
- one Expense associated with several Payments;
- one Payment associated with several Expenses.

Связь Payment↔Expense является contextual/reconciliation relation и **не означает, что Payment исполняет Expense**. Исполнение денежных требований моделируется через Financial Obligation и Payment Allocation where applicable.

Если direct Payment↔Expense relation имеет monetary scope, этот scope должен быть исторически объясним и не может использоваться как второй Payment Allocation.

Если Payment уже связан с Financial Obligation, Expense обычно может объясняться через obligation-scope; direct Payment↔Expense relation не является universal mandatory.

### 9.1. Monetary scope direct Expense ↔ Payment relation

Direct Expense↔Payment relation не вводит второй механизм исполнения обязательств.

Если такая relation всё же несёт attributable amount для traceability/reconciliation, то при additive mutually exclusive attribution:

```text
sum(expense-attributed scopes of one Payment)
≤ Payment amount

sum(payment-attributed scopes explaining one Expense)
≤ Expense amount
```

Эта связь не должна одновременно изображать ту же monetary portion как независимый второй Payment Allocation. Если settlement уже объясняется через Financial Obligation + Payment Allocation, direct Expense↔Payment relation должна оставаться согласованной с этой семантикой и не создавать двойного финансового эффекта.

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

Expense может быть признан до фактического использования/Payment, если sufficient basis и applicable authority/policy уже устанавливают конкретное предметно признанное intended use средств с определимыми purpose/activity, scope и amount/currency.

Само наличие Management Decision, Contractual Relationship, договора, заказа, estimate или Budget reservation недостаточно: применимая financial-management semantics должна **явно** считать этот конкретный committed/intended-use case уже возникшим Expense.

Proposal, estimate, Budget reservation либо намерение, ещё не получившее такого предметного признания, Expense не являются.

Пример:

```text
competent decision / contract
+ applicable policy recognizes this concrete committed use as Expense
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

### 15.1. Calculated Imbalance / Operational Loss ≠ Expense automatically

Расчётный небаланс и признанная эксплуатационная потеря принадлежат resource-domain semantics и не становятся Expense автоматически.

Если applicable financial-management semantics устанавливает, что Community принимает на себя определённую денежную стоимость такого resource loss, отдельный Expense может быть признан на sufficient valuation/basis.

```text
resource imbalance / operational loss
≠ Expense automatically

recognized Community financial burden for that loss
→ Expense where justified
```

Распределение resource loss между собственниками, начисление компенсации и Expense сообщества являются разными процессами и не выводятся друг из друга автоматически.

### 15.2. Supplier-calculated transformation-loss component

В расчётах с поставщиком может использоваться расчётная добавка к измеренному объёму ресурса, например количество кВт·ч, которое поставщик определяет как потери при трансформации высокого напряжения в низкое по применимому коэффициенту/формуле.

Такой компонент следует отличать от собственных ресурсных фактов Community OS:

```text
supplier-calculated transformation-loss quantity
≠ Meter Reading
≠ measured Consumption automatically
≠ Calculated Imbalance
≠ Operational Loss automatically
```

Он является supplier-side settlement input/basis, если именно так используется в договорных/расчётных отношениях с поставщиком. Если этот компонент влияет на Supplier Obligation, должны быть исторически объяснимы, насколько доступны из источника:

- исходный измеренный объём;
- применённый поставщиком коэффициент/формула либо иной basis;
- расчётная добавка в единицах ресурса;
- период;
- денежная оценка/тарифные условия;
- source/provenance расчёта.

Community OS не обязана признавать supplier-calculated quantity фактической Operational Loss только потому, что поставщик включил её в расчёт.

При этом денежная стоимость такого компонента может иметь самостоятельный Expense meaning, если Community фактически несёт её как стоимость эксплуатации/потерь общей инфраструктуры. Последующее распределение или компенсация этой стоимости собственниками через Accrual/Financial Obligation не отменяет Expense автоматически.

## 16. Pilot ST — electricity expense policy

Для пилотного СТ принимается локальная financial-management policy:

1. индивидуальное измеренное потребление участков, которое Community оплачивает поставщику и затем возмещает через расчёты с собственниками, **не признаётся Community Expense только по факту Supplier Obligation/Payment**;
2. электроэнергия насосной и другие собственные/common uses Community имеют Expense meaning;
3. добавленный поставщиком расчётный компонент трансформационных потерь имеет самостоятельный Expense meaning как стоимость эксплуатации общей электросетевой инфраструктуры, **если соответствующая денежная сумма фактически включена в Supplier Obligation Community**;
4. возможное последующее начисление собственникам компенсации такого расхода является отдельным Accrual/Financial Obligation process и не отменяет исходный Expense.

Расчёт поставщика при этом не становится ресурсной истиной Community OS.

Упрощённая схема:

```text
measured supplier-settlement quantity
+ supplier-calculated transformation-loss quantity
→ Supplier settlement quantity
→ Supplier Obligation

Supplier Obligation scopes:
  individual measured consumption
  pump/common Community consumption
  supplier-calculated transformation-loss component
```

Для Expense:

```text
individual measured consumption scope
→ no Community Expense automatically

pump/common-use monetary scope
→ Community Expense

supplier-calculated transformation-loss monetary scope
→ Community Expense of common electrical infrastructure
```

Это означает, что сумма Supplier Obligation и сумма Community Expenses за тот же период могут различаться.

Пример без фиксации конкретных тарифов:

```text
Supplier Obligation:
  7 000 → individually recoverable electricity
  3 000 → pump/common use
  X     → supplier-calculated transformation-loss component

Community Expense:
  3 000 → pump/common use
  X     → transformation-loss settlement cost

No Community Expense:
  7 000 → individual measured consumption merely because Community settles Supplier
```

Если Community затем начисляет собственникам компенсацию `X` или его части:

```text
Community Expense X
≠ owner Accrual X
≠ owner Financial Obligation X
```

Эти факты могут быть экономически связаны, но не поглощают друг друга.

Owner accruals/individual consumption, supplier-calculated settlement quantity, Operational Loss, Calculated Imbalance, Supplier Obligation, Payment и Community Expense остаются различными facts.

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

Но Budget Distribution не может использоваться для искусственного объединения нескольких independent expense cases в одну Expense identity. Сначала определяется Expense identity по реальному use case, затем выполняется budget classification.

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

Expense Financing — существующая предметная связь **уже признанного конкретного Expense** с одним или несколькими Funding Sources, отражающая его фактическое финансово-управленческое покрытие.

Допускается:

```text
one Funding Source → many Expenses
one Expense → many Funding Sources
```

Expense Financing:

- ≠ Payment Allocation;
- ≠ исполнение Financial Obligation;
- ≠ связь с конкретным исходящим Payment автоматически;
- может быть признано до либо после Payment, если sufficient financing basis уже существует;
- не существует как actual Expense Financing без Expense, хотя proposal/planned source может существовать в Budget semantics.

## 27. Expense Financing amount

Если Expense покрывается несколькими Funding Sources, financing relation должен иметь определимый amount/currency.

Для current effective additive Financing:

```text
sum(Expense Financing amounts) ≤ Expense amount
```

Одна и та же часть Expense не должна double-count как фактическое покрытие несколькими Funding Sources. Полностью покрытый Expense может иметь equality.

Если будущая аналитическая классификация Funding Sources допускает overlapping labels, она не должна изображаться как несколько additive Expense Financing amounts для одной и той же monetary portion.

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

## 32. Expense relation to Payment without recognized Obligation

В некоторых immediate purchase/settlement сценариях Community OS может не иметь отдельно признанного Financial Obligation, даже если реальное взаимодействие сторон включало денежное требование, возникшее и исполненное практически одновременно.

Если outgoing Payment и sufficient evidence прямо подтверждают concrete Expense, Expense может быть связан с Payment без искусственного создания отдельного persistent Obligation только ради технической трассировки.

Это:

- не означает, что Payment является Expense;
- не утверждает отсутствие реального юридического/предметного обязательства;
- не превращает Expense↔Payment relation в Payment Allocation или fulfillment mechanism.

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

## 39. Expense recognition authority and substantive admissibility

Следует различать:

- authority признать/зафиксировать Expense в Community OS;
- authority/competence принять решение о соответствующем использовании средств;
- факт того, что использование средств реально произошло;
- оценку допустимости/нарушения Budget, policy, contract or governance constraints.

Manual Expense recognition требует attributable domain authority.

Authority на:

- признание Expense;
- underlying spending/use decision;
- Budget Distribution;
- Expense Financing;
- correction/reclassification

может различаться according to policy.

**Off-budget ≠ unauthorized.** Реальный допустимый Expense может оказаться вне/сверх Budget и должен быть представим с nonconformance/variance.

Но unauthorized, disputed, missing or misappropriated money movement **не превращается в Expense автоматически только ради reconciliation**. Его financial meaning остаётся unresolved либо определяется специализированным process.

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

Confirmed Expense Budget Distribution и Expense Financing относятся к recognized Expense; предложения по классификации/финансированию до Expense recognition остаются proposal/planning semantics.

Universal atomic requirement across all three не вводится.

Failure/unresolved classification of Budget Item or Funding Source не должен автоматически блокировать recognition уже sufficiently established Expense, если applicable policy явно не делает такую classification обязательным предметным prerequisite.

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

Для пилотного СТ Supplier Obligation может включать как измеренные объёмы, так и добавленный поставщиком расчётный объём трансформационных потерь.

Например:

```text
Supplier Obligation:
  7 000 → individually recoverable electricity
  3 000 → pump/common use
  X     → supplier-calculated transformation-loss component
```

Valid Expense result under pilot policy:

```text
Community Expense:
  3 000 → pump/common use
  X     → transformation-loss settlement cost

Expense Budget Distribution:
  3 000 → pump/common Budget Item where applicable
  X     → electrical infrastructure / transformation-loss Budget Item where applicable

Expense Financing:
  determined independently according to applicable Funding Source policy
```

The 7 000 individual-consumption scope does not become Community Expense merely because Community has Supplier Obligation or Payment for it.

The `X` component is Expense because the pilot treats the supplier-imposed transformation-loss settlement cost as a cost of common electrical infrastructure borne by Community. This does **not** mean that supplier-calculated kWh are automatically recognized as actual Operational Loss in the resource context.

If all or part of `X` is later recovered from owners, corresponding owner Accruals/Financial Obligations remain separate from Expense.

## 47. Pilot ST — one Expense across several Budget Items

Concrete integrated pump-station repair Expense = 30 000 under one project/basis.

Budget classification may identify components:

```text
20 000 → electrical works
7 000  → water/plumbing works
3 000  → common installation/maintenance works
```

One Expense identity may remain only if these components form one coherent management use case under the owning semantics; Budget Distribution carries the budget split.

If they are truly independent purposes/activities with separate expense meaning, separate Expenses are recognized. Budget structure, source document and Payment cardinality do not decide this.

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

### 49.15. Pilot electricity: individual consumption, pump and supplier-calculated transformation loss
Supplier settlement includes:

```text
7 000 → individually recoverable measured consumption
3 000 → pump/common Community use
X     → supplier-calculated transformation-loss component
```

Pilot policy recognizes Expense for `3 000 + X`, while `7 000` does not become Community Expense merely from Supplier Obligation/Payment.

The `X` quantity is not accepted automatically as actual Operational Loss; it remains a supplier settlement component on its own provenance/basis.

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
Owning semantics requires separate Expenses when independent activities have independent expense meaning; Budget Distribution cannot merge them merely for document/Payment convenience.

### 49.25. Off-budget but authorized Expense
Competent basis establishes emergency repair 15 000 not present in current Budget. Expense is recognized 15 000 with off-budget/nonconformance visibility; Budget is not silently changed.

### 49.26. Unauthorized cash outflow
Cash Disbursement/Payment 5 000 occurred without valid spending basis and is under dispute. Do not create Expense 5 000 merely to reconcile the outflow; financial meaning remains unresolved/specialized until sufficient basis exists.

### 49.27. Concrete intended use vs generic plan
Budget contains 300 000 annual repair plan: no Expense yet. Later competent decision/contract fixes a specific pump-station repair use 30 000 on sufficient basis. Prospective Expense may be recognized before Payment only if applicable financial-management semantics explicitly recognizes this concrete committed use as Expense.

### 49.28. Loan principal and interest
Community repays 20 000 principal and 1 000 interest/fee.

Principal repayment is Payment/Obligation settlement and does not become Expense automatically. Interest/fee may have Expense meaning on sufficient basis.

### 49.29. Purchase of durable equipment
Community purchases a pump for 40 000.

Community OS may recognize a 40 000 financial-management Expense if applicable semantics treats the acquisition as use of Community funds for the relevant purpose. Whether external regulated accounting records the pump as inventory/fixed asset and depreciates it is outside BP-EXPENSE-001 and does not redefine the Community OS Expense automatically.

### 49.30. Resource loss financially borne by Community
Resource context recognizes an operational electricity loss valued at 2 000.

Loss fact alone creates no Expense. If applicable financial policy establishes that Community bears this 2 000 cost, a separate Expense may be recognized; if the amount is charged onward to owners, the resulting accruals/obligations remain separate facts.

### 49.31. Supplier-calculated transformation loss without resource recognition
Supplier uses common-meter readings plus its own coefficient/formula and adds `L` kWh to settlement as transformation loss.

Community OS has not independently recognized `L` as Operational Loss.

Valid result:

```text
supplier-calculated L kWh
→ supplier settlement basis
→ monetary scope of Supplier Obligation
→ Community Expense under pilot policy when borne by Community

supplier-calculated L kWh
≠ Operational Loss automatically
≠ Calculated Imbalance
```

If Community later distributes/reimburses this cost through owner Accruals, those Accruals do not erase the Expense.

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
17. Expense↔Payment relation is not Payment Allocation and does not make Expense an executable claim.
18. Partial obligation scope may have Expense meaning without entire obligation becoming Expense.
19. Community Consumption ≠ Expense automatically.
20. Expense amount/currency must be sufficiently determinable for recognition.
21. Expense Budget Distribution ≠ Payment Allocation.
22. Expense Budget Distribution does not change Expense identity.
23. Distributed amount cannot exceed Expense amount under additive mutually-exclusive Budget Item semantics.
24. Expense may exist without Budget Item.
25. Budget overrun does not invalidate real Expense.
26. Current Budget changes do not rewrite historical Expense classification.
27. Funding Source ≠ Bank Account.
28. Funding Source ≠ Payment.
29. Funding Source ≠ Use Direction.
30. Expense Financing ≠ Funding Source.
31. Expense Financing ≠ Payment Allocation.
32. Expense Financing is not technical reservation.
33. Total current effective Expense Financing cannot exceed Expense amount.
34. Expense may be partially/unfinanced.
35. Planned Funding Source ≠ actual Expense Financing automatically.
36. Use Direction ≠ Budget Item/Funding Source.
37. Refund Payment ≠ Expense automatically.
38. Own-account transfer/cash custody ≠ Expense.
39. Prepayment ≠ Expense automatically.
40. Payroll Payment ≠ Expense automatically.
41. Document correction ≠ Expense correction automatically.
42. Wrong Budget Distribution does not rewrite Expense.
43. Wrong Financing relation does not rewrite Expense.
44. Confirmed Expense changes are traceable; no silent edit/delete.
45. Technical retry ≠ duplicate Expense.
46. Same supplier/amount/date ≠ duplicate proof.
47. Authority ≠ technical access.
48. Expense recognition / Budget Distribution / Financing are separate domain results even when coordinated in one interaction.
49. Actual off-budget/nonconforming Expense remains representable for audit; system does not hide it merely because Budget classification/limit is violated.
50. Off-budget Expense ≠ unauthorized outflow.
51. Unauthorized/disputed money movement does not create Expense automatically.
52. Budget Distribution cannot merge independent expense cases into one Expense identity.
53. Prospective Expense requires a concrete recognized intended-use case; generic Budget/proposal/estimate ≠ Expense.
54. Expense Financing requires a recognized Expense; pre-recognition source assignment is proposal/planning semantics.
55. Expense Financing does not settle an Obligation and does not prove a specific Payment funded the Expense.
56. Additive Expense Financing must not double-count the same monetary portion of Expense.
57. Additive Expense↔Obligation attribution must not exceed the relevant Obligation/Expense monetary scope.
58. Additive direct Expense↔Payment attribution must not double-count a Payment amount or create a second Payment Allocation effect.
59. Calculated Imbalance / Operational Loss ≠ Expense automatically.
60. Loan principal repayment ≠ Expense automatically.
61. External accounting treatment as inventory/fixed asset/depreciation does not define Community OS Expense automatically.
62. Supplier-calculated transformation-loss quantity ≠ Meter Reading / Calculated Imbalance / Operational Loss automatically.
63. Supplier-calculated transformation-loss monetary scope may be Community Expense without converting the supplier quantity into a resource-domain loss fact.
64. Recovery of an Expense from owners through Accrual/Financial Obligation does not cancel or merge the Expense automatically.

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
- OSBBX_REFERENCE_ANALYSIS;
- `docs/process/INDEPENDENT_MULTI_REVIEW.md`.

## 53. Предварительные нормативные последствия

По итогам internal review новый ADR и новая fundamental entity предварительно не требуются: Expense, Budget, Budget Item, Funding Source, Use Direction и Expense Financing уже присутствуют в нормативной модели.

Если BP будет принят, потребуется точечная нормативная синхронизация:

- ADR-006 — уточнить Expense identity/recognition boundary, Expense Budget Distribution и amount-scoped relations без превращения их в Payment Allocation;
- DOMAIN_MODEL — зафиксировать Expense identity, relation cardinality/amount-scope и Budget Distribution boundary;
- TERMINOLOGY — при необходимости зарегистрировать `Expense Budget Distribution` как специализированную relation/action, не как универсальную Financial Allocation;
- BP-FIN-BANK-001 / BP-CASH-002 — при необходимости добавить mirror-note, что outgoing movement не создаёт Expense автоматически и Expense relation не меняет Payment identity;
- REFERENCE_CANDIDATE_MATRIX — после принятия BP закрыть либо уточнить REF-FIN-010.

Отдельный Expense Correction BP сейчас не вводится: minimal no-silent-rewrite/correction boundary уже задан §43–45. Возвращаться к специализированному correction process следует только при самостоятельных практических сценариях.

## 54. Решения internal review

1. **Expense имеет обязательный amount/currency для recognition.** Generic qualitative intent без достаточно определимой monetary scope остаётся plan/proposal, а не recognized Expense.
2. **Prospective Expense допустим, но не выводится из Budget/Management Decision/Contract автоматически.** Нужна applicable financial-management semantics, явно признающая конкретный committed/intended-use case Expense.
3. **Expense identity не определяется source cardinality.** Рабочая граница — coherent financial-management use case: purpose/activity, basis, materially significant scope и историческая explainability.
4. **Amount-bearing Expense↔Financial Obligation relation нужна.** Она необходима для mixed obligations, где только часть денежного требования имеет Expense meaning.
5. **Direct Expense↔Payment relation остаётся optional.** Она нужна для traceability/reconciliation и immediate-settlement cases без отдельно признанного persistent Obligation, но не является вторым Payment Allocation.
6. **Pilot scenario 10 000 Obligation / 3 000 Community Expense корректен.** Supplier Obligation/Payment cardinality не определяет Expense amount.
7. **One Expense → multiple Budget Items допустим.** Budget classification не должна искусственно дробить coherent Expense.
8. **Expense Budget Distribution принимается как specialized relation/action, не новая fundamental entity.**
9. **Additive Budget Distribution:** сумма распределённых mutually exclusive portions не превышает Expense amount; при полном распределении равна ему.
10. **Overlapping analytical Budget Items не подчиняются additive rule молча.** Для такой модели нужна отдельная explicit semantics.
11. **Off-budget Expense должен быть представим.** Off-budget ≠ unauthorized; Budget variance/nonconformance не скрывает реальный Expense. При этом disputed/unauthorized money movement не становится Expense автоматически только ради reconciliation.
12. **Additive Expense Financing total ≤ Expense amount.** Double-count одного monetary portion запрещён.
13. **Expense Financing может быть признано до или после outgoing Payment**, потому что описывает financial-management coverage источником средств, а не исполнение Obligation/Payment.
14. **Funding Source не выводится автоматически** из incoming Payment, Personal Account, Budget Item, Bank Account или payment method.
15. **Use Direction boundary достаточна:** Use Direction ≠ Budget Item ≠ Funding Source ≠ Expense Financing; автоматическое mapping допускается только по explicit rule/policy.
16. **Отдельный Expense Correction BP сейчас не нужен.** Confirmed Expense не редактируется/удаляется silently; специализированный BP вводится только при самостоятельной практической потребности.
17. **Expense correction не запускает universal cascade.** Related Obligation, Payment relation, Budget Distribution и Expense Financing revalidate/dispose отдельно согласно owning semantics.
18. **Supplier / Contractual Relationship — optional context/basis Expense, не обязательная identity relation.** Expense может существовать без Supplier.
19. **REF-FIN-010 предметно покрывается этим BP.** Закрывать его следует после принятия BP и нормативной синхронизации.

### 54.1. Принятая локальная policy пилотного СТ

Для первого внедрения принимается вариант **A**:

- индивидуально возмещаемая часть измеренного потребления участков не получает Community Expense meaning только потому, что Community является стороной Supplier Obligation и выполняет Payment поставщику;
- собственное/common consumption Community, включая насосную, получает Expense meaning на достаточном основании;
- supplier-calculated transformation-loss component, добавляемый поставщиком к показаниям общих счётчиков по его коэффициенту/формуле, получает Expense meaning как стоимость общей электросетевой инфраструктуры, если его денежная стоимость включена в Supplier Obligation Community;
- этот supplier-calculated component не признаётся автоматически фактической Operational Loss или Calculated Imbalance Community OS;
- если Community затем компенсирует этот Expense через начисления собственникам, Accrual/Financial Obligation существуют отдельно и не отменяют Expense.

Таким образом, пилот различает:

```text
individual measured resource cost
≠ common-use Expense
≠ supplier-calculated transformation-loss settlement component
≠ resource-domain Operational Loss
≠ Calculated Imbalance
≠ owner loss-compensation Accrual
```

Универсальный BP не запрещает другим Community использовать иную policy для recoverable supplier cost, но автоматическое равенство `Supplier Obligation = Expense` не допускается.

## 55. Следующий шаг

1. выполнить финальную internal consistency check Draft против current ADR-003/004/005/006/008/010/011, DOMAIN_MODEL/TERMINOLOGY и neighboring finance BP;
2. отдельно проверить pilot-ST examples и локальный вопрос §54.1;
3. после стабилизации Draft сформировать frozen review package согласно `INDEPENDENT_MULTI_REVIEW.md`;
4. выполнить предусмотренный процессом independent review / multi-review **одним раундом по стабильному Draft**, не возвращаясь к уже закрытым cash-boundaries без нового сценария;
5. внести только принятые point fixes;
6. синхронизировать нормативные документы и закрыть/refine REF-FIN-010;
7. определить следующий Stage 5/6 priority.

