# BP-CASH-002 — Выдача наличных / исходящий наличный платёж

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику физической выдачи наличных из Community-side control и признания соответствующего исходящего `Cash Payment`, не смешивая физическую выдачу, Payment, Payment Allocation, Expense, кассовый документ и внутреннее перемещение наличных.

Ключевая модель:

```text
cash physically prepared / handed out
→ Cash Disbursement
→ authority / recipient / financial-meaning validation
→ 0..N recognized outgoing Cash Payments
→ Initial Payment Allocation where applicable
→ cash document as evidence/formalization where applicable
```

`Cash Disbursement` в настоящем Draft — кандидат на identity-bearing cash-channel source/process referent physical release наличных из Community custody/control **во внешнюю сторону потенциального financial outflow**. Независимый review должен проверить его необходимость и границы по аналогии, но не механическому копированию, с `Cash Acceptance`.

Внутреннее перемещение между Community-side custodians не является Cash Disbursement настоящего BP и остаётся в границе REF-FIN-016.

## 2. Основная граница

```text
Cash Disbursement
≠ outgoing Cash Payment
≠ Payment Allocation
≠ Expense
≠ cash document
≠ internal custody transfer
≠ cash withdrawal from Community bank account
≠ accounting entry
```

Факт, что наличные физически покинули Community-side control, ещё не определяет автоматически финансовый смысл движения.

## 3. Scope

BP-CASH-002 покрывает physical cash disbursement, который может стать основанием для признания исходящего Cash Payment от Community внешней стороне.

Типовые сценарии:

- погашение Financial Obligation Community перед поставщиком наличными;
- наличный Refund участнику/плательщику;
- предварительная оплата наличными до окончательного Expense или Obligation recognition, если applicable semantics это допускает;
- выплата исполнителю/сотруднику по уже установленному Financial Obligation;
- выдача наличных представителю получателя;
- partial/multiple obligation Allocation одного outgoing Payment;
- physical disbursement при временно неразрешённом recipient/payment meaning;
- offline/manual cash payout;
- later correction Payment recognition;
- связь с расходным кассовым документом.

Не входят:

- внутреннее перемещение Community cash между custodians;
- снятие наличных с собственного банковского счёта Community;
- полная accountable-advance / подотчётная семантика;
- recognition Expense;
- payroll calculation;
- кассовый ledger/Cashbox/CashBalance.

## 4. Исходящий Cash Payment — обычный Payment

Согласно ADR-006 исходящий Cash Payment является обычным Payment с direction=`outgoing` и method=`cash`.

```text
Outgoing Cash Payment is a Payment
```

К нему применяются общие свойства Payment:

- amount/currency;
- materially meaningful parties;
- movement time;
- recognition basis;
- provenance;
- payment purpose where applicable;
- relationship to Financial Obligation/Allocation.

Cash method не создаёт отдельную модель Financial Obligation или Expense.

## 5. Cash Disbursement как channel-side referent

Для Draft вводится рабочее понятие:

**Cash Disbursement (выдача наличных)** — historically significant cash-channel source/process fact/referent, фиксирующий physical release определённой суммы наличных в определённой currency из Community custody/control к external-side physical receiver в рамках одного coherent disbursement scope, когда Community custody/control над этой суммой предметно прекращено независимо от того, удалось ли уже признать outgoing Payment.

Cash Disbursement:

- имеет собственную identity независимо от Payment и cash document;
- может существовать до Payment recognition;
- может завершиться без Payment recognition, если financial-party semantics не подтверждена;
- может служить source/evidence для одного или нескольких outgoing Cash Payments;
- не является Expense;
- не является Payment Allocation;
- не является Cashbox/CashBalance;
- не определяет Payment identity/cardinality автоматически;
- сам по себе не доказывает, что physical receiver является financial recipient.

Граница классификации:

1. если evidence подтверждает, что cash вышел из Community custody/control к external-side receiver, Cash Disbursement существует даже если financial recipient/purpose ещё unresolved;
2. если receiver принимает cash как Community-side custodian/agent и Community custody/control предметно сохраняется, это internal custody movement REF-FIN-016, а не Cash Disbursement;
3. если невозможно пока определить, прекратился ли Community custody/control, source handoff должен оставаться **явно unresolved** в границе REF-FIN-016; Cash Disbursement и Payment не создаются до достаточного resolution.

Unresolved handoff не может быть молча отброшен, скрыт либо автоматически переклассифицирован по истечении времени. Если позднее установлено, что исходный handoff фактически был external release, Cash Disbursement фиксируется с сохранением исходного physical event time и отдельного later classification/recording time.

```text
cash prepared
≠ Cash Disbursement
≠ outgoing Cash Payment
```

Cash Disbursement возникает только после фактического release наличных из Community-side control. Подготовленные, пересчитанные или оформленные к выдаче деньги, которые фактически не были переданы, Cash Disbursement не создают.

### 5.1. Cash Disbursement completion

**Cash Disbursement completion** — предметная граница, после которой конкретный coherent physical release считается завершённым, а его фактическая сумма, currency, physical receiver и event time достаточно определены для исторического source fact.

Completion:

- не является Payment recognition;
- не является cash-document issuance/signature;
- не является Expense recognition;
- не требует универсального lifecycle/status machine;
- может быть зафиксирован позднее по достаточному offline/manual evidence.

До completion дополнительные купюры/суммы либо немедленный отказ/возврат могут оставаться частью того же coherent Disbursement scope.

После completion последующая отдельная physical release создаёт новый Cash Disbursement source fact.

Универсальный timeout или технический UI-event не определяет completion автоматически; applicable cash process должен позволять объяснить, почему физический scope считался завершённым.

## 6. Community как payer

В типовом outgoing Payment:

- payer — Community;
- recipient — другая сторона financial relation.

Acting cashier/disburser не становится payer из собственных средств только потому, что физически передал наличные.

```text
cashier / physical disburser
≠ Community payer identity
```

## 7. Physical receiver ≠ Payment recipient автоматически

Наличные может физически получить:

- сам entitled Subject;
- представитель поставщика;
- уполномоченный представитель владельца;
- courier/agent;
- сотрудник/председатель для дальнейшего использования;
- иной acting person.

Поэтому:

```text
physical receiver
≠ Payment recipient automatically
≠ entitled party automatically
```

Если различие materially significant, оно сохраняется в provenance.

## 8. Authority

Физическая выдача наличных и recognition outgoing Payment являются финансово значимыми действиями, но authority для них может различаться.

Должно быть объяснимо, где применимо:

- кто authorised cash disbursement;
- кто physically released cash;
- на каком основании;
- кто подтвердил Payment recognition;
- кто определил recipient / Financial Obligation / purpose;
- кто оформил cash document.

Technical access role не создаёт финансовое полномочие.

Если наличные фактически выданы без достаточного authority:

- physical Cash Disbursement не стирается из истории;
- outgoing Payment не признаётся автоматически;
- authority/admissibility требует resolution;
- later valid confirmation/ratification authority может дать недостающее основание для первичного Payment recognition со ссылкой на исходный Cash Disbursement;
- actual Cash Disbursement time при этом не изменяется и не переписывается;
- authority-resolution time и Payment recognition time имеют самостоятельный смысл и могут совпасть, но не обязаны;
- если Payment уже ошибочно признан и later authority failure делает recognition неверным, применяется BP-FIN-002.

## 9. Prepared amount ≠ Cash Disbursement amount ≠ Payment amount

Следует различать:

- requested/authorized payout amount;
- cash physically prepared;
- amount actually handed over;
- immediate amount returned/refused before disbursement completion;
- Cash Disbursement amount;
- recognized outgoing Payment amount(s);
- unresolved portion of Cash Disbursement, для которой outgoing Payment recognition ещё не завершено.

Для одного currency-specific Cash Disbursement:

```text
Cash Disbursement amount
= physically released amount - immediate return before completion
```

если applicable physical scope действительно завершён как одна выдача.

Universal `1 Cash Disbursement = 1 Payment` не вводится.

Для одного Cash Disbursement:

```text
sum(recognized outgoing Payments linked to Cash Disbursement)
≤ Cash Disbursement amount
```

Если вся сумма Disbursement полностью разрешена именно как outgoing Payments:

```text
sum(recognized outgoing Payments)
= Cash Disbursement amount
```

Если часть physical release имеет иной допустимый смысл либо остаётся unresolved, она должна быть отдельно explainable и не становится Expense, Payment Allocation или write-off автоматически.

## 10. Immediate refusal / return before completion

Если cashier prepared 1000, но recipient принимает только 870 и 130 немедленно остаются/возвращаются Community до завершения disbursement:

```text
prepared 1000
released/accepted by receiver 870
immediate return 130
Cash Disbursement = 870
```

Это не outgoing Payment 1000 + incoming Refund 130.

Immediate return до завершения Cash Disbursement является частью определения фактически выданной суммы.

Если Payment уже recognized, later return средств — отдельное входящее движение и требует applicable incoming/refund/correction semantics; оно не называется immediate change задним числом.

## 11. Recognition outgoing Cash Payment

Cash Disbursement сам по себе не создаёт Payment.

Outgoing Cash Payment признаётся, когда sufficiently determinable:

- Community as payer;
- financial recipient;
- amount/currency;
- time;
- recognition basis;
- applicable authority;
- cash-channel source Cash Disbursement.

Если materially meaningful party information недостаточно, Payment recognition остаётся unresolved.

## 12. Cash Disbursement ↔ Payment cardinality

Один Cash Disbursement может привести к:

- 0 Payments;
- 1 Payment;
- N Payments, если physical receiver действует за несколько independently identifiable financial recipients и evidence подтверждает отдельные money movements.

Один outgoing Cash Payment относится к одному Cash Disbursement source.

Несколько завершённых самостоятельных Cash Disbursements не объединяются молча в один Payment.

```text
one Cash Disbursement → 0..N Payments
one outgoing Cash Payment → one Cash Disbursement source
```

Если в одном непрерывном disbursement interaction cashier сначала передал 800, затем до completion добавил 200, это может быть один Cash Disbursement 1000. Если первый disbursement уже завершён, later cash release — новый Cash Disbursement.

## 13. Payment Allocation

Recognition outgoing Cash Payment не означает исполнения конкретного Financial Obligation автоматически.

```text
Cash Disbursement
→ recognized outgoing Cash Payment
→ BP-FIN-ALLOCATION-001
```

Initial Allocation применяется только к recognized Payment.

Cash Disbursement amount без Payment recognition не является Payment Allocation, fulfillment или Expense.

## 14. Один outgoing Payment может исполнять несколько obligations

Если один supplier/recipient получает 5000, Payment может быть allocated, например:

```text
3000 → Obligation A
2000 → Obligation B
```

если это один реальный outgoing money movement и applicable Allocation semantics позволяет такую связь.

Это один Payment с несколькими Allocations, а не два Payments только из-за двух obligations.

## 15. Physical receiver ≠ entitled party

Physical receiver может отличаться от entitled party obligation и от financial recipient Payment; такое различие допустимо только на достаточном основании.

Примеры:

- представитель поставщика получает деньги за Supplier;
- представитель Owner получает Refund;
- иной authorized representative.

Физическое получение денег не переписывает стороны Financial Obligation автоматически.

## 16. Unknown / unresolved recipient

Если Cash Disbursement состоялся, но financial recipient недостаточно определён:

- Cash Disbursement сохраняет identity/history;
- fake Subject не создаётся;
- cashier/physical receiver не подставляется как financial recipient автоматически;
- Payment recognition не подтверждается до sufficient party evidence;
- сумма не является Expense автоматически;
- case остаётся unresolved/Requires Decision.

Late recognition Payment ссылается на original Cash Disbursement и не создаёт новое physical cash movement.

## 17. Cash document

Расходный кассовый ордер, квитанция о получении, ведомость, receipt или иной cash payout document может:

- оформить Cash Disbursement;
- подтвердить physical receiver;
- оформить Payment;
- содержать purpose/basis;
- быть mandatory according to local legal/policy semantics.

Но:

```text
cash payout document
≠ Cash Disbursement
≠ outgoing Cash Payment
≠ Expense
```

Document identity не определяет Cash Disbursement или Payment identity автоматически.

Если applicable legal/policy semantics не делает документ обязательным предусловием Cash Disbursement либо Payment recognition, отсутствие или задержка оформления документа не стирает уже состоявшийся Cash Disbursement и не отменяет уже правомерно признанный Payment. Если документ является обязательным предусловием согласно применимой policy/law, recognition допускается только после выполнения этого условия.

## 18. Prepared document without payout

Если расходный документ создан/напечатан, но cash физически не выдан:

```text
document exists
Cash Disbursement = none
Payment = none
```

Document correction ≠ Payment correction.

## 19. Payment ≠ Expense

Исходящий Cash Payment не создаёт Expense автоматически.

```text
outgoing Cash Payment
≠ Expense
```

Возможны случаи:

- Payment погашает ранее признанный Expense/Obligation;
- Payment является предоплатой до Expense;
- Payment исполняет Refund obligation, который не является Expense;
- Payment переводит средства в иной допустимый financial relation;
- physical handover, первоначально рассматривавшийся как candidate outgoing flow, разрешается как custody/internal movement; тогда он не является Cash Disbursement настоящего BP и не создаёт Payment.

Expense recognition принадлежит отдельному BP-EXPENSE-001.

## 20. Payment ≠ Financial Obligation

Outgoing Payment может исполнять существующее Financial Obligation, но Payment не создаёт obligation автоматически.

Если obligation отсутствует, Payment может существовать до obligation только если applicable financial semantics это допускает.

Fake obligation не создаётся для объяснения Cash Disbursement.

## 21. Supplier payment

Типовой supplier-сценарий:

```text
Financial Obligation Community → Supplier = 3000
Cash Disbursement = 3000
Cash Payment Community → Supplier = 3000
Payment Allocation = 3000 to Obligation
```

Expense может быть признан раньше, одновременно или позже согласно BP-EXPENSE-001; сам Cash Payment не определяет момент Expense.

## 22. Refund paid in cash

Если BP-FIN-003 установил Financial Obligation to return:

```text
refund obligation
→ Cash Disbursement
→ outgoing Cash Payment
→ Initial Payment Allocation to return obligation
```

Original incoming Payment остаётся historical fact.

Cash payout method не меняет Refund semantics.

## 23. Prepayment / outgoing Payment before Expense

Community может выполнить cash prepayment поставщику до recognition Expense либо до окончательного Financial Obligation, если applicable process это допускает.

```text
Cash Payment
≠ Expense automatically
≠ fake Obligation
```

Subsequent Expense/Obligation recognition связывается отдельным process.

## 24. Employee / contractor payout

Cash payment сотруднику/исполнителю может исполнять Financial Obligation по вознаграждению, если такое obligation уже определено применимым процессом.

BP-CASH-002 не рассчитывает:

- salary;
- taxes;
- ЕСВ/ПДФО/военный сбор;
- договорное вознаграждение;
- payroll.

Он только признаёт реальное cash movement и его связь с уже определённым financial meaning.

## 25. Подотчёт / accountable cash — отдельная граница

Выдача наличных сотруднику/председателю «под отчёт» не классифицируется настоящим BP автоматически как Expense или обычный Payment recipient scenario.

Нужно различать:

1. лицо получает деньги как самостоятельная сторона financial relation;
2. лицо получает Community-owned cash как custodian/agent для дальнейшей оплаты третьим лицам;
3. возникает специализированный accountable-advance financial relation;
4. cash transfer является внутренним перемещением Community funds.

```text
cash handed to employee/chairman
≠ Expense automatically
≠ Payment to that person automatically
```

Если лицо получает Community-owned cash только как custodian/agent для дальнейшей оплаты третьим лицам и Community control предметно сохраняется, это internal custody movement и **не Cash Disbursement BP-CASH-002**.

Если отдельная финансовая семантика устанавливает самостоятельный advance/claim между Community и этим Subject, последующая физическая выдача может быть Cash Disbursement и outgoing Payment, но такая accountable-advance semantics должна быть определена отдельно и не выводится из факта выдачи.

Полная accountable/custody semantics относится к REF-FIN-016 либо отдельному будущему процессу.

## 26. Internal custody transfer

Передача наличных между Community-side custodians:

- cashier → chairman;
- chairman → another cashier;
- safe → authorized custodian

не является outgoing Payment внешней стороне.

Такой transfer принадлежит future custody/internal cash movement semantics.

## 27. Cash withdrawal from Community bank account

Снятие наличных с собственного банковского счёта Community:

```text
Community bank funds
→ cash under Community control
```

само по себе не является Cash Disbursement настоящего BP, outgoing Payment другому Subject или Expense.

Bank Transaction withdrawal и последующий Cash Disbursement внешней стороне — разные facts.

Physical person, который снял cash в банке, не становится Payment recipient только из-за withdrawal.

## 28. Bank withdrawal followed by external payout

Сценарий:

1. chairman withdraws 5000 from Community bank;
2. bank withdrawal is recognized according to BP-FIN-BANK-001;
3. cash remains Community funds;
4. later 3000 are handed to Supplier;
5. Cash Disbursement 3000 occurs;
6. outgoing Cash Payment 3000 may be recognized;
7. remaining 2000 stay outside Payment semantics until further custody/disbursement.

Не допускается считать bank withdrawal Payment Supplier 5000.

## 29. Physical receiver refuses part before completion

Если receiver не принимает часть prepared cash до completion:

- refused amount не входит в Cash Disbursement;
- Payment на неё не создаётся.

## 30. Recipient returns money after recognized Payment

Если outgoing Payment уже состоялся и recipient позднее возвращает часть/всю сумму:

- original outgoing Payment не уменьшается silently;
- return является новым incoming money movement;
- его meaning определяется applicable incoming Payment/refund/reversal/correction semantics;
- Cash Disbursement history сохраняется.

## 31. Wrong Payment recognition

Если после confirmation установлено, что:

- cash movement не было;
- amount/currency materially wrong;
- financial recipient materially wrong;
- one Payment incorrectly split/merged;

применяется BP-FIN-002.

Cash Disbursement source history не переписывается молча.

## 32. Wrong Payment Allocation

Если Payment real/correct, но obligation/purpose Allocation wrong:

- unconfirmed proposal может быть corrected before confirmation;
- confirmed Allocation changes through BP-FIN-001.

## 33. Wrong Expense classification

Если Payment real/correct, но Expense interpretation wrong:

- Payment и Cash Disbursement остаются;
- Expense correction belongs to Expense-owning process;
- Payment не переписывается ради Expense.

## 34. Duplicate / idempotency

Повторная technical обработка одного Cash Disbursement не создаёт второй Cash Disbursement или Payment автоматически.

Совпадение receiver + amount + date не доказывает duplicate.

Если один real outgoing Payment recognized twice, исправление относится к BP-FIN-002.

## 35. Offline / network failure

Возможен сценарий:

1. cash physically disbursed;
2. Cash Disbursement real;
3. system unavailable before Payment recording;
4. later system entry restores/records original disbursement and recognizes Payment without inventing new movement.

Actual disbursement time и recording time различаются.

## 36. Cash Disbursement before Payment recognition

Cash Disbursement может состояться, но Payment recognition остаться unresolved из-за:

- unknown financial recipient;
- authority uncertainty;
- insufficient basis;
- ambiguous source/payment cardinality;
- unresolved financial purpose при уже установленном external-side physical release.

Такой Cash Disbursement должен оставаться visible/reconcilable и не превращается автоматически в Expense, Payment or loss.

Long-lived unresolved Cash Disbursement требует последующего специализированного resolution по authority/party/purpose/correction semantics. Настоящий BP не вводит universal write-off/dispute process, но запрещает автоматическое превращение unresolved amount в Expense, loss или иной финансовый результат только по timeout.

Если unresolved-вопрос состоит в том, вышли ли деньги вообще из Community custody/control либо receiver остаётся Community-side custodian/agent, classification как Cash Disbursement ещё не подтверждена; source handoff остаётся явно unresolved в REF-FIN-016 custody/internal-movement boundary до resolution. Поздняя reclassification сохраняет original physical handoff time и separate classification/recording time.

## 37. Provenance

### 37.1. Cash Disbursement provenance

Для Cash Disbursement должны быть объяснимы, где применимо:

- Cash Disbursement identity;
- amount/currency;
- prepared/requested amount where materially significant;
- immediate returned/refused amount;
- actual completion time;
- later recording time;
- physical receiver;
- acting cashier/disburser;
- authority evidence/unresolved authority;
- declared financial purpose;
- related cash document(s);
- offline/manual evidence;
- retry/duplicate/correction links;
- later custody/reconciliation links where available.

### 37.2. Outgoing Cash Payment provenance

Для recognized Payment дополнительно:

- Payment identity;
- link to exactly one Cash Disbursement source;
- payer=Community;
- financial recipient;
- amount/currency;
- Payment recognition time/basis;
- related Financial Obligation(s);
- Payment Allocation(s);
- Refund/Expense/contractual context where applicable;
- correction/replacement links.

Payment provenance не поглощает Cash Disbursement provenance.

## 38. Temporal semantics

Следует различать:

- authorization/request time;
- cash preparation time;
- Cash Disbursement completion time;
- authority/admissibility resolution or ratification time, if materially distinct;
- custody-vs-external classification time, if resolved later;
- Payment recognition/recording time;
- cash document issuance/signature time;
- Allocation time;
- Expense recognition time;
- bank withdrawal/deposit time;
- later return time.

## 39. Confirmation scope

Для одного Cash Disbursement должно быть coherent determination как минимум:

- actual disbursed amount/currency;
- physical receiver;
- acting disburser;
- immediate returned/refused amount;
- time;
- authority/provenance.

Payment recognition может происходить в том же user interaction, но не сливается с Cash Disbursement.

Allocation/Expense могут иметь отдельные confirmation scopes.

## 40. Основной сценарий пилотного СТ

1. Community имеет Financial Obligation 3000 грн перед подрядчиком за ремонт электросети.
2. Уполномоченный cashier получает решение/основание на выплату.
3. Представитель подрядчика физически получает 3000 грн.
4. Cash Disbursement CD1 = 3000 UAH фиксирует physical release.
5. Evidence подтверждает financial recipient = Contractor.
6. Outgoing Cash Payment P1 = 3000 UAH Community → Contractor recognized from CD1.
7. BP-FIN-ALLOCATION-001 распределяет P1 на Financial Obligation 3000.
8. Расходный кассовый документ оформляет/подтверждает выдачу, но не определяет CD1/P1 identity.
9. Expense проекта ремонта существует/признаётся согласно BP-EXPENSE-001 отдельно от Payment.

## 41. Проверочные сценарии

### 41.1. Exact supplier payout
Obligation 3000; Cash Disbursement 3000; Payment 3000; Allocation 3000.

### 41.2. Prepared 3000, receiver accepts 2500
500 remains/returns before completion. Cash Disbursement 2500; no Payment 500.

### 41.3. One Payment, two obligations
Cash Payment 5000 to same recipient; 3000 → Obligation A, 2000 → Obligation B.

### 41.4. One physical receiver represents two recipients
Cash Disbursement 2000 with sufficient evidence: 1200 for Recipient A, 800 for Recipient B. May recognize two Payments, not one cross-party Payment.

### 41.5. Unknown financial recipient
Cash Disbursement exists; Payment unresolved; no fake Subject/Expense.

### 41.6. Supplier representative
Physical receiver differs from Supplier; sufficient representation basis allows Payment to Supplier.

### 41.7. Unauthorized cashier disburses cash
Cash Disbursement preserved; Payment not auto-recognized until authority resolved.

### 41.8. RKO printed but cash not handed over
No Cash Disbursement; no Payment.

### 41.9. Printer fails after payout
Cash Disbursement/Payment remain real; document may be formalized later according to policy.

### 41.10. Network failure after payout
Later recording links to original Cash Disbursement; no duplicate movement.

### 41.11. Wrong amount recognized
Actually disbursed 900; Payment recorded 1000 → BP-FIN-002.

### 41.12. Wrong Allocation
Payment correct; wrong obligation → BP-FIN-001.

### 41.13. Expense classification wrong
Payment correct; Expense corrected separately.

### 41.14. Cash Refund to owner
BP-FIN-003 return obligation → Cash Disbursement → outgoing Payment → Allocation to return obligation.

### 41.15. Supplier prepayment before Expense
Cash Payment may exist; Expense not auto-created.

### 41.16. Cash withdrawal from bank
Chairman withdraws 5000 from Community bank; no outgoing Payment to chairman; no Expense.

### 41.17. Withdrawal then supplier payout
Withdrawal 5000 internal; later Cash Disbursement/Payment 3000 to Supplier; remaining 2000 stays Community cash.

### 41.18. Cash handed to chairman for internal custody
No outgoing Payment automatically; REF-FIN-016 boundary.

### 41.19. Cash handed to employee under unclear 'под отчёт' semantics
Do not auto-create Expense or Payment recipient; Requires Decision / specialized accountable semantics.

### 41.20. Employee remuneration payout
Existing Financial Obligation 4000 to Employee; Cash Disbursement 4000; Payment 4000; payroll calculation out of scope.

### 41.21. Recipient returns cash later
Original outgoing Payment remains; later incoming movement handled separately.

### 41.22. Duplicate offline entry
Same real payout entered twice → Payment correction/idempotency rules.

### 41.23. One Cash Disbursement partially resolved
CD=2000; 1200 recognized Payment to A; 800 financial meaning unresolved. 800 is not Expense/Payment automatically.

### 41.24. Long-lived unresolved disbursement
Cash has left Community custody/control to an external-side receiver but recipient/purpose cannot be sufficiently resolved. Cash Disbursement remains visible for reconciliation/decision; no automatic write-off or Expense.

### 41.25. Separate Cash Disbursements are not one Payment
Cashier completes CD1 = 500 to Recipient A. Later another separate CD2 = 500 occurs. They are separate physical money movements and are not silently merged into one Payment 1000.

### 41.26. Additional cash before one Disbursement completes
Cashier hands 800 and, before the same coherent disbursement is completed, adds 200. This may remain one Cash Disbursement 1000 and one Payment 1000 where recipient semantics are unambiguous.

### 41.27. Partial resolution of one Disbursement
CD = 2000. Evidence supports Payment 1200 to Recipient A; remaining 800 recipient/purpose unresolved. 800 remains unresolved at outgoing Payment recognition level and is not Expense or Allocation automatically.

### 41.28. Internal custodian handoff then supplier payout
Cashier gives 5000 to chairman solely as Community custodian: REF-FIN-016 internal movement, no Cash Disbursement/Payment to chairman. Chairman later hands 3000 to Supplier: Cash Disbursement 3000 → outgoing Payment 3000. Remaining 2000 remain Community cash.

### 41.29. Accountable financial advance explicitly recognized
Applicable future accountable process establishes a genuine financial advance relation Community → Employee for 2000. Physical payout may then be Cash Disbursement 2000 and outgoing Payment 2000 under that relation. Expense is still not created automatically.

### 41.30. Prepared payout exceeds actual physical release
Authorized payout 3000; cashier physically releases only 2500 and retains 500 before completion. Cash Disbursement = 2500; recognized Payments cannot exceed 2500.

## 42. Инварианты

1. Cash Disbursement is a candidate identity-bearing cash-channel source/process referent for external-side physical cash release.
2. Cash Disbursement ≠ outgoing Cash Payment.
3. Cash Disbursement ≠ Expense.
4. Cash Disbursement ≠ cash document.
5. Cash Disbursement ≠ Cashbox/CashBalance.
6. Internal Community custody transfer ≠ Cash Disbursement of BP-CASH-002.
7. Cash withdrawal from Community bank ≠ Cash Disbursement of BP-CASH-002.
8. Outgoing Cash Payment is a Payment.
9. Cash method does not alter Financial Obligation semantics.
10. Outgoing Payment ≠ Expense.
11. Outgoing Payment ≠ Payment Allocation.
12. Cashier/disburser ≠ payer identity; payer is Community.
13. Physical receiver ≠ financial recipient automatically.
14. Physical receiver ≠ entitled party automatically.
15. Prepared cash ≠ Cash Disbursement.
16. Cash Disbursement amount ≠ requested/authorized amount automatically.
17. Immediate return/refusal before completion is not a later incoming Payment.
18. Cash Disbursement alone does not create Payment.
19. Sum of recognized outgoing Payments linked to one Cash Disbursement cannot exceed Cash Disbursement amount.
20. If the whole Cash Disbursement is resolved specifically as outgoing Payments, linked Payment amounts equal Cash Disbursement amount.
21. Any remaining Disbursement amount must stay separately explainable and is not automatic Expense/write-off.
22. One Cash Disbursement may support 0..N Payments.
23. One outgoing Cash Payment refers to one Cash Disbursement source.
24. Separate finalized Cash Disbursements are not silently merged into one Payment.
25. Cash Disbursement amount without Payment recognition ≠ Expense.
26. Cash Disbursement amount without Payment recognition ≠ Payment Allocation.
27. Unknown recipient does not create fake Subject.
28. Lack of authority does not erase physical Cash Disbursement but blocks automatic Payment recognition.
29. Cash document does not define Cash Disbursement/Payment identity automatically.
30. Document without physical payout does not create Cash Disbursement or Payment.
31. Payment correction belongs to BP-FIN-002.
32. Allocation correction belongs to BP-FIN-001.
33. Expense correction belongs to Expense-owning process.
34. Cash Refund payout uses BP-FIN-003 + cash-channel recognition.
35. Cash withdrawal from Community bank ≠ outgoing Payment.
36. Cash withdrawal from Community bank ≠ Expense.
37. Employee/chairman receipt of cash ≠ Payment to that person automatically.
38. Accountable/custody semantics must determine whether employee/chairman receipt is internal movement or genuine financial Payment.
39. Prepayment may precede Expense/Obligation only where applicable semantics permits.
40. Fake Expense/Obligation is not created to explain physical disbursement.
41. Retry/late recording does not create duplicate Cash Disbursement or Payment automatically.
42. Same receiver/amount/date does not prove duplicate.
43. Long-lived unresolved Cash Disbursement remains visible; no automatic write-off/Expense.
44. Cash reconciliation ≠ Payment recognition.
45. Universal Cashbox/CashBalance/CashOperation is not introduced by this BP.

## 43. Что намеренно не решается

- Expense recognition/classification;
- full accountable-advance / подотчёт model;
- custody/internal cash transfer workflow;
- universal Cashbox/CashBalance;
- cash inventory/denominations;
- cashier shifts;
- bank withdrawal custody workflow;
- payroll calculation;
- taxes and regulated payroll;
- procurement workflow;
- supplier invoice/act recognition;
- RRO/PRRO/fiscalization;
- regulated accounting cashbook;
- BAS/BAF cash mapping;
- accounting entries;
- UI/hardware;
- cash security/safe procedures.

## 44. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003;
- ADR-004;
- ADR-006;
- ADR-010;
- ADR-011;
- `BP-CASH-001-CASH-PAYMENT-RECEIPT.md`;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-003-REFUND.md`;
- `BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md`;
- REFERENCE_CANDIDATE_MATRIX;
- OSBBX_REFERENCE_ANALYSIS.

## 45. Предварительные нормативные последствия

Перед принятием Draft проверить:

- нужен ли `Cash Disbursement` как самостоятельный identity-bearing channel-side referent по аналогии с Cash Acceptance;
- нужна ли синхронизация ADR-006 / DOMAIN_MODEL / TERMINOLOGY;
- нужна ли mirror-note в BP-FIN-ALLOCATION-001;
- нужна ли mirror-note в BP-FIN-BANK-001 по cash withdrawal;
- достаточно ли REF-FIN-016 для custody/accountable boundaries;
- можно ли после BP-CASH-002 полностью закрыть REF-FIN-009.

Новый ADR и универсальная Cashbox/CashOperation entity предварительно не требуются.

## 46. Открытые вопросы для review

1. нужен ли Cash Disbursement referent как зеркальный, но самостоятельный counterpart Cash Acceptance;
2. достаточно ли определения physical release from Community-side control;
3. корректна ли cardinality one Cash Disbursement → 0..N Payments, one Payment → one Disbursement;
4. как определить boundary between coherent one disbursement and several disbursements;
5. может ли Cash Disbursement существовать без outgoing Payment;
6. достаточно ли unknown-recipient semantics;
7. как authority failure влияет на Payment recognition;
8. нужно ли различать physical receiver / financial recipient / entitled party / representative;
9. корректна ли immediate-return boundary;
10. достаточно ли separation Payment ≠ Expense;
11. корректно ли supplier prepayment before Expense/Obligation;
12. корректен ли Refund cash flow through BP-FIN-003 + BP-CASH-002;
13. как трактовать accountable cash / подотчёт без premature Expense/Payment semantics;
14. нужен ли отдельный Accountable Advance candidate/BP;
15. достаточно ли REF-FIN-016 for custody/internal movement;
16. cash withdrawal from Community bank: достаточно ли Bank Transaction + custody boundary;
17. нужна ли cash→bank/withdrawal reconciliation symmetry;
18. какие normative mirror notes нужны соседним BP;
19. можно ли после этого полностью закрыть REF-FIN-009.

## 47. Следующий шаг

1. internal review against ADR-006 and neighboring financial BP;
2. pilot-ST scenario check;
3. independent Claude review;
4. point fixes;
5. normative synchronization;
6. close/refine REF-FIN-009;
7. continue to BP-EXPENSE-001.