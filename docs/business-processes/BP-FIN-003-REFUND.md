# BP-FIN-003 — Возврат денежных средств (Refund)

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет возврат денежных средств, когда существует предметно достаточное основание вернуть средства, происхождение которых прослеживается к одному или нескольким ранее реально состоявшимся движениям денежных средств.

Refund не требует универсальной связи 1:1 с конкретным original Payment: основанием может быть агрегированное финансовое состояние, например Overpayment, исторически возникшее из нескольких Payments и последующих изменений. Однако произвольное новое обязательство выплатить средства, не имеющее такого возвратного происхождения, не является Refund только потому, что исполняется Payment.

Ключевая модель:

```text
refund basis
→ Financial Obligation to return
→ new Payment
→ Initial Payment Allocation to return obligation
```

Возврат не вводится как отдельная фундаментальная финансовая сущность.

Фактическое исполнение возврата является новым `Payment`, имеющим собственные identity, direction, amount/currency, parties, time, provenance и recognition basis.

## 2. Основная граница

```text
Refund
≠ Payment Recognition Correction
≠ Reallocation
≠ Cancellation
≠ Bank Reversal
≠ Expense
≠ Income
≠ source correction
```

Возврат не изменяет и не удаляет первоначальный Payment.

Если исходный Payment был ошибочно признан и предметно не существовал, применяется `BP-FIN-002`, а Refund не создаётся.

Если исходный Payment существовал реально, но деньги должны быть возвращены, первоначальный Payment остаётся исторически корректным фактом, а возврат выполняется новым Payment.

## 3. Refund не является отдельной фундаментальной сущностью

Настоящий BP использует уже существующие предметные понятия:

- Payment;
- Financial Obligation;
- Payment Allocation;
- Unallocated Remainder;
- Overpayment;
- Advance;
- Subject;
- Personal Account как контекст взаиморасчётов;
- Bank Transaction и иные source evidence;
- authority/provenance/rule semantics.

Термин `Refund` описывает специализированный бизнес-процесс и финансовый смысл нового движения денежных средств.

Не вводятся универсальные:

- Refund Entity;
- Refund Status;
- Refund Transaction;
- Refund Ledger;
- Refund Reservation;
- универсальная Correction.

## 4. Что является основанием возврата

Возврат допускается только при наличии предметно достаточного основания.

`Refund basis` в настоящем BP — не отдельная fundamental entity. Это предметное основание Financial Obligation to return и соответствующего решения о возврате, которое должно быть объяснимо через существующие факты, отношения, решения, правила и provenance.

Основанием могут быть, например:

- признанное состояние Overpayment;
- возврат полностью или частично неиспользованного Advance;
- часть Unallocated Remainder, по которой принято допустимое решение о возврате;
- правомерное уменьшение/отмена обязательства или начисления, после которого возникли возвращаемые средства;
- реальный Payment, перечисленный не той стороне, если Payment сам по себе был реальным и должен быть возвращён;
- договорное основание;
- решение уполномоченного органа/лица в пределах применимой предметной политики;
- иное допустимое финансовое основание.

Наличие первоначального Payment само по себе не означает наличие права на Refund.

## 5. Refund request ≠ refund basis

Запрос плательщика, пользователя или иной стороны на возврат сам по себе:

```text
refund request
≠ refundable amount
≠ Financial Obligation to return
≠ Refund Payment
```

Запрос может быть входом процесса, но должен быть проверен относительно применимых финансовых фактов, правил и полномочий.

Настоящий BP не вводит фундаментальную сущность `Refund Request`. Если продукту понадобится самостоятельный жизненный цикл обращений на возврат, он может быть описан специализированным процессом коммуникаций/обращений без изменения финансовой природы Refund.

## 6. Refundable amount

**Refundable amount** в настоящем BP — вычисляемая процессная величина, а не новая domain entity или самостоятельное сохраняемое финансовое состояние.

Она определяется из:

- применимого refund basis;
- текущего effective financial state;
- суммы, уже признанной обязанностью к возврату;
- уже фактически возвращённых сумм;
- иных допустимых распоряжений соответствующей частью средств.

Универсальная формула для всех refund basis не вводится.

Следует различать:

```text
refundable amount
≠ outstanding amount of Financial Obligation to return
```

`Refundable amount` отвечает на вопрос, какую сумму текущий refund basis допускает превратить в обязанность возврата.

После признания Financial Obligation to return исполнение контролируется уже его собственной непогашенной суммой согласно ordinary obligation semantics. Изменение refundable source state не переписывает return obligation молча; при необходимости obligation изменяется отдельным прослеживаемым процессом.

Для одного и того же основания нельзя одновременно использовать одну и ту же сумму как:

- доступную для Initial Allocation;
- действующий Advance;
- действующую Overpayment в возвращаемой части;
- доступную к новому Refund;
- уже исполненную Refund Payment.

## 7. Возникновение Financial Obligation to return

После установления достаточного refund basis Community OS признаёт либо создаёт применимое `Financial Obligation` на возврат.

Например:

```text
Community owes Owner 1000 UAH
amount = 1000 UAH
basis = confirmed Overpayment
```

или зеркально:

```text
Supplier owes Community 1000 UAH
basis = return of unused prepayment
```

Financial Obligation to return:

- имеет обязанную и управомоченную стороны;
- имеет сумму и денежную единицу;
- имеет основание;
- может иметь срок исполнения;
- не является Payment;
- не является Refund Payment;
- не является исходным Payment.

Создание return obligation не требует нового фундаментального типа Financial Obligation.

Непогашенная часть Financial Obligation to return участвует в обычной семантике Debt как непогашенная часть обязательства. Отдельный `Refund Debt` не вводится.

## 8. Предметный commitment возвращаемой суммы

Само существование любого Financial Obligation to return не «потребляет» произвольный Payment и не создаёт автоматическую связь с любыми средствами Community.

Если return obligation явно основан на конкретной части ранее признанного Payment, Unallocated Remainder, Advance, Overpayment либо иного определимого source financial state, подтверждение обязанности вернуть эту часть изменяет её текущий финансовый смысл.

Для такого случая **committed refundable amount** — вычисляемая процессная величина: часть source financial amount, которая уже поддерживает действующее Financial Obligation to return и поэтому не может одновременно использоваться несовместимым образом.

`Committed refundable amount`:

- не является новой domain entity;
- не является Payment Allocation;
- не является отдельным Refund Status;
- не является техническим резервированием денег на банковском счёте;
- не блокирует конкретные физические денежные единицы;
- существует только в связи с определимым refund basis и действующим return obligation.

После подтверждения такого return obligation соответствующая source-сумма не может одновременно считаться свободной для Initial Allocation, действующим Advance/Overpayment в той же части либо иного несовместимого финансового использования.

Если return obligation не имеет связи с конкретной source financial amount/state, никакой произвольный старый Payment не объявляется committed. Если при этом obligation вообще не имеет возвратного происхождения из ранее перемещённых средств, оно находится вне scope Refund и является иным Financial Obligation.

Committed refundable amount учитывается при последующем определении refundable amount из §6: уже committed часть того же source financial amount/state не может повторно считаться доступной для создания ещё одного несовместимого return obligation.

Если основание впоследствии правомерно изменено либо obligation отменено/изменено специализированным процессом, доступность source amount определяется заново с сохранением истории.

## 9. Refund Payment

Фактический возврат средств является новым Payment.

Recognition самого движения как Payment выполняется применимым owning channel/source process. Настоящий BP не вводит универсальный channel-independent Payment Recognition workflow.

Например:

- банковское движение проходит границу recognition согласно `BP-FIN-BANK-001`;
- наличное движение — согласно применимому cash/payment process;
- иной канал — согласно собственному recognition process.

Для признанного Refund Payment применяются обычные правила Payment:

- direction;
- amount and currency;
- parties;
- time;
- method/channel;
- provenance;
- recognition basis.

Refund Payment не наследует identity исходного Payment.

```text
Original Payment #P1
≠ Refund Payment #P2
```

Связь #P2 с исходным финансовым состоянием объясняется через refund basis и Financial Obligation to return.

## 10. Payment Allocation возврата

После recognition Refund Payment его сумма исполняет Financial Obligation to return через обычную семантику `Payment Allocation`.

Первичное Allocation Refund Payment выполняется согласно `BP-FIN-ALLOCATION-001`. Настоящий BP определяет refund basis/context, но не создаёт параллельный механизм Initial Allocation.

Например:

```text
Refund Obligation = 1000

Refund Payment = 400
Allocation → Refund Obligation 400
Remaining Obligation = 600
```

Отдельный фундаментальный `Refund Allocation` не вводится.

Если Payment признан корректно, но его подтверждённое распределение по return obligations позднее оказалось неверным, применяется `BP-FIN-001`.

Payment Allocation Refund Payment не переписывает refund basis и не заменяет сам Financial Obligation to return.

## 11. Кардинальность

Не вводится универсальная модель:

```text
1 original Payment = 1 Refund = 1 Refund Payment
```

Допустимы:

- один исходный Payment → несколько refund obligations/Payments во времени;
- несколько исходных Payments → одно признанное refundable state;
- один refund obligation → несколько Refund Payments;
- один Refund Payment → несколько return obligations, если это допускает применимая финансовая семантика;
- refund basis без однозначной ссылки на один исходный Payment, например агрегированное Overpayment state.

История должна позволять объяснить происхождение возвращаемой суммы без искусственного создания 1:1 связей.

## 12. Partial Refund

Частичный возврат является нормальным сценарием.

```text
Refund Obligation = 1000

R1 = 400
R2 = 300
Remaining = 300
```

Факт частичного Refund не изменяет identity первоначального Payment и не требует его дробления.

## 13. Overpayment → Refund

Overpayment может быть основанием возврата, если применимая семантика/решение устанавливает обязанность вернуть всю либо часть переплаты.

Например:

```text
Overpayment = 300
Refund Obligation = 300
Refund Payment = 300
```

После признания refund obligation возвращаемая часть Overpayment не может одновременно оставаться доступной для иного несовместимого использования.

После фактического исполнения return obligation effective Overpayment уменьшается/прекращается согласно owning financial semantics.

Возврат не создаёт Overpayment и не является самой Overpayment.

## 14. Advance → Refund

Advance не возвращается автоматически только потому, что будущего обязательства пока нет.

При достаточном основании может быть признано:

```text
Advance = 500
Refund Obligation = 200
Remaining effective Advance = 300
```

Возвращаемая часть перестаёт иметь финансовый смысл действующего Advance с момента, когда предметно подтверждена обязанность вернуть её.

Фактическое движение 200 оформляется новым Refund Payment.

## 15. Unallocated Remainder → Refund

Unallocated Remainder не является автоматически refundable amount.

При достаточном основании и уполномоченном решении его часть может получить финансовый смысл возврата.

Например:

```text
Original Payment = 1000
Unallocated Remainder = 1000

recognized Refund Obligation = 600
remaining amount available for Initial Allocation = 400
```

После признания Refund Obligation сумма 600 больше не считается Unallocated Remainder, доступным для Initial Allocation.

Это изменение финансового смысла не является Reallocation, поскольку подтверждённого Allocation этой части ещё не существовало.

## 16. Уже распределённый Payment

Refund не является способом откатить подтверждённое Payment Allocation.

Если:

```text
Original Payment = 1000
Allocation → Membership Obligation = 1000
```

и исходное obligation остаётся действительным и исполненным, сам факт желания вернуть деньги не отменяет исполнение.

До возврата должно существовать самостоятельное предметное основание, например:

- исходное obligation правомерно отменено/уменьшено;
- выполнен применимый перерасчёт;
- возникло Overpayment;
- принято и допустимо отдельное решение, создающее новое return obligation без отмены исходного obligation;
- иное предметно допустимое основание.

Refund не переписывает историческое Allocation молча.

## 17. Refund не обязан переоткрывать исходное обязательство

Refund не переписывает и не переоткрывает исходное Financial Obligation автоматически.

Допускается, что обязательство, которое когда-либо было исполнено исходным Payment, остаётся действительным и fulfilled, а Refund возникает по иному возвратному основанию, прослеживаемо связанному с ранее перемещёнными средствами.

Например:

```text
Original Membership Obligation = fulfilled
+
recognized Overpayment from other historical Payments/recalculation = 500
+
Financial Obligation to return = 500
+
new Refund Payment = 500
```

Исходное Membership Obligation остаётся fulfilled.

Отдельное новое обязательство Community выплатить 500, не имеющее refund basis и возвратного происхождения из ранее перемещённых средств, не становится Refund только из-за того, что его исполнение является Payment.

## 18. Стороны Refund Payment и return obligation

Фактические стороны Refund Payment не обязаны универсально совпадать со сторонами return obligation, так же как Payment и Obligation в общей финансовой модели являются самостоятельными фактами.

Возможны, например:

- фактический recipient отличается от управомоченной стороны return obligation;
- фактический payer действует за обязанную сторону по допустимому основанию.

Однако любое такое cross-subject исполнение требует достаточного предметного основания.

Например, возврат может быть перечислен:

- уполномоченному представителю;
- наследнику после установления применимого основания;
- иному Subject при наличии допустимого распоряжения/основания.

Совпадение фамилии, банковского счёта, номера участка или текста назначения само по себе не является достаточным универсальным основанием.

Cross-subject basis сохраняется в provenance.

Personal Account может использоваться как контекст взаиморасчётов для owner refund, но Refund, return obligation и Refund Payment не тождественны Personal Account и не требуют его существования во всех сценариях, например при supplier refund.

## 19. Refund channel

Канал/способ возврата не обязан совпадать с каналом исходного Payment.

Допустим, если local policy это разрешает:

```text
original Payment = cash
Refund Payment = bank
```

или наоборот.

Глобальное правило «возвращать только тем же способом/на тот же счёт» не вводится.

Конкретная Community или legal/payment policy может устанавливать более строгие ограничения.

## 20. Direction neutrality

Refund не определяется как исключительно исходящий Payment Community.

Основной сценарий собственника:

```text
Owner → Community      original Payment
Community → Owner      Refund Payment
```

Зеркальный сценарий поставщика:

```text
Community → Supplier   prepayment
Supplier → Community   Refund Payment
```

В обоих случаях Refund Payment является обычным Payment с соответствующим direction относительно Community.

## 21. Refund ≠ Expense / отдельное новое поступление

Исходящий Refund Payment не создаёт Expense автоматически.

Входящий Refund Payment от поставщика не создаёт автоматически отдельный предметный смысл нового дохода/поступления только потому, что деньги пришли в Community.

```text
Refund Payment
≠ Expense
```

Expense, Financing, Funding Source и иные финансово-управленческие смыслы изменяются только согласно их owning semantics.

Например, возврат поставщиком неиспользованной предоплаты может потребовать revalidation Expense/Financing, но не требует введения отдельной фундаментальной сущности `Income` или `Community Receipt`.

## 22. Funding Source / Financing

Refund не переписывает происхождение средств молча.

Если исходные средства имели определимый Funding Source или участвовали в Expense Financing, возврат может изменить effective financing state согласно применимому процессу.

Настоящий BP:

- сохраняет provenance;
- инициирует revalidation materially affected financing relations;
- не создаёт универсальный алгоритм возврата средств «в источник финансирования»;
- не трактует Funding Source как технический денежный резерв.

## 23. Bank Transaction и Refund

```text
Bank Transaction
≠ Refund
```

Банковская операция обратного направления, reversal, chargeback или correction сама по себе не является Refund.

Сначала применяются `BP-FIN-BANK-001` и соответствующая source semantics.

Только после domain recognition нового движения как Payment и установления refund basis оно может исполнять Financial Obligation to return.

## 24. Chargeback / forced reversal

Принудительный банковский возврат/chargeback может привести к реальному обратному движению средств без предварительного решения Community.

Такой source event:

- не переписывает исходный Payment;
- не признаётся Refund автоматически только по банковскому признаку;
- сначала проходит bank/source recognition;
- затем финансовый контекст определяет его предметный смысл и последствия.

Legal dispute/fraud/chargeback lifecycle настоящим BP не определяется.

## 25. Bank commission

Банковская комиссия не смешивается с Refund amount автоматически.

Например:

```text
Refund Obligation = 1000
Recipient receives Payment = 1000
Bank commission = 20
```

Комиссия может быть отдельным Payment/Expense согласно применимой семантике.

Если фактически получателю перечислено 980 при return obligation 1000, obligation не считается автоматически исполненным полностью только потому, что ещё 20 удержал банк.

Иное возможно только при отдельном допустимом основании, изменяющем обязательство или правила исполнения.

## 26. Refundable amount и currency

Financial Obligation to return имеет определимую денежную единицу.

Настоящий BP не вводит:

- multi-currency refund conversion;
- exchange rate;
- момент курса;
- implicit conversion.

Если возврат должен происходить в другой денежной единице, необходима отдельная применимая финансовая семантика.

## 27. Refund и Payment Recognition Correction

Если исходный Payment реально состоялся:

```text
real Payment
+ duty to return
→ Refund process
```

Если Payment был ошибочно признан и предметно не существовал:

```text
wrong recognition
→ BP-FIN-002
→ no Refund merely to erase the mistake
```

Если Refund Payment сам был ошибочно признан, его correction выполняется через `BP-FIN-002`.

## 28. Refund, Reallocation и зачёт

Refund не является Reallocation.

Refund также не является зачётом, переносом остатка или иным способом изменения взаиморасчётов без нового движения денежных средств.

```text
set-off / internal credit transfer without money movement
≠ Refund
```

Если refundable amount вместо выплаты используется для исполнения другого допустимого obligation или иного финансового назначения без обратного движения денег, применяется соответствующий Allocation/Reallocation/settlement process, но не настоящий BP.

Reallocation изменяет финансовый эффект подтверждённого Allocation существующего Payment.

Refund создаёт новое реальное движение средств.

Если Refund Payment уже признан, но ошибочно распределён между несколькими return obligations, его Allocation может быть исправлен через `BP-FIN-001`.

## 29. Refund и отмена/перерасчёт obligation

Отмена, уменьшение или перерасчёт исходного obligation может создать финансовое состояние, из которого впоследствии возникает refund basis.

Но:

```text
obligation correction/recalculation
≠ Refund
```

Refund начинается только после того, как предметно установлена обязанность вернуть определимую сумму.

Настоящий BP не определяет сам процесс перерасчёта/отмены исходного начисления или obligation.

## 30. Изменение refund basis до исполнения

Между признанием return obligation и фактическим Refund Payment refund basis может измениться.

Перед исполнением должны быть revalidated:

- существование return obligation;
- outstanding amount;
- стороны;
- currency;
- authority;
- значимые ограничения;
- materially affected source financial state.

Если obligation правомерно изменено/отменено, Refund Payment не выполняется по устаревшему основанию.

История первоначального refund decision/obligation сохраняется согласно owning semantics.

## 31. Concurrent Refund / double refund

Community OS не должна допускать двойное использование одного refundable amount.

Например:

```text
Refundable amount = 1000

Process A prepares return 700
Process B prepares return 600
```

совокупный confirmed financial effect не может стать 1300.

Настоящий BP задаёт предметный инвариант, но не предписывает database locking или иной технический concurrency mechanism.

## 32. Partial execution и повторное исполнение

Повторная техническая доставка команды/банковского ответа не должна создавать второй Refund Payment либо второе исполнение того же obligation без нового реального движения.

Следует различать:

```text
technical retry
≠ second Payment
≠ second Allocation
≠ new Refund decision
```

Если реально произошло второе движение денежных средств, оно признаётся отдельным Payment.

## 33. Authority

Установление обязанности вернуть средства и фактическое подтверждение финансово значимых действий требуют применимого предметного полномочия согласно ADR-010 и local policy.

Техническая роль доступа сама по себе не создаёт права:

- признать сумму refundable;
- создать/подтвердить return obligation;
- выбрать другого recipient;
- изменить refund basis;
- изменить или отменить уже признанное Financial Obligation to return;
- подтвердить Refund Payment Allocation.

Automatic refund decision допускается только при явно применимой policy, достаточном evidence и объяснимом результате.

Иначе используется Requires Decision.

## 34. Provenance

Для Refund должны быть объяснимы, где применимо:

- refund basis;
- источник/происхождение возвращаемой суммы;
- исходный Payment/Payments, если такая связь предметно определима;
- Overpayment/Advance/Unallocated Remainder либо иной source financial state;
- основание и момент признания return obligation;
- стороны obligation;
- refundable amount;
- outstanding amount;
- authority или automatic policy;
- Refund Payment identity;
- source evidence Refund Payment;
- Payment Allocation на return obligation;
- cross-subject recipient basis, если применимо;
- versioned rules/policies, если они влияли на решение;
- materially affected Expense/Financing/Funding relations;
- последующие correction/reallocation, если они были.

Provenance не требует универсальной Refund entity или Audit entity.

## 35. Временная семантика

Следует различать:

- время исходного Payment;
- время возникновения source financial state;
- время refund request, если он был;
- время установления refund basis;
- время возникновения/признания Financial Obligation to return;
- срок return obligation;
- время фактического Refund Payment;
- время recognition Refund Payment;
- время Payment Allocation;
- время последующих изменений.

Создание return obligation не backdate-ит Refund Payment к дате исходного платежа.

Фактическое движение средств остаётся новым историческим событием.

## 36. Основной сценарий: возврат собственнику

1. Owner ранее реально перечислил Community 1000.
2. Payment корректно признан.
3. Возникает допустимый refund basis на 1000.
4. Community признаёт Financial Obligation to return 1000 Owner.
5. Возвращаемая сумма больше не доступна для несовместимого финансового использования.
6. Community фактически перечисляет Owner 1000.
7. Движение признаётся новым outgoing Payment.
8. Initial Payment Allocation связывает 1000 с return obligation.
9. Return obligation становится исполненным.
10. Original Payment сохраняется без изменения.
11. История позволяет объяснить обе стороны движения и refund basis.

## 37. Проверочные сценарии

### 37.1. Запрос без основания

Owner корректно уплатил 1000 членского взноса и просит вернуть деньги.

Исходное obligation остаётся действительным и исполненным. Другого refund basis нет.

```text
refund request = 1000
refund basis = none
→ no return obligation
→ no Refund Payment
```

### 37.2. Overpayment полностью возвращается

```text
Overpayment = 300
→ Return Obligation = 300
→ Refund Payment = 300
→ Allocation to Return Obligation = 300
```

Overpayment effective state уменьшается/закрывается по owning semantics.

### 37.3. Partial Advance Refund

```text
Advance = 500
Return Obligation = 200
remaining Advance = 300

Refund Payment #R1 = 200
Allocation → Return Obligation = 200
```

### 37.4. Unallocated Remainder частично возвращается

```text
Original Payment = 1000
Unallocated Remainder = 1000

Return Obligation = 600
remaining amount available for Initial Allocation = 400
```

После фактического Refund 600 исходный Payment остаётся историческим, а 400 могут быть распределены позднее.

### 37.5. Partial Refund несколькими Payments

```text
Return Obligation = 1000

Refund Payment #R2 = 400
Refund Payment #R3 = 600
```

Оба Payment имеют собственные identities и Allocations на одно obligation.

### 37.6. Возврат при действующем исходном obligation

Original Membership Obligation = 1000 остаётся корректно исполненным.

Отдельное допустимое решение создаёт новое Return Obligation = 500.

Refund 500 не reopening исходный Membership Obligation автоматически.

### 37.7. Cross-subject recipient

Return Obligation создан в пользу Owner.

По допустимому подтверждённому основанию Refund Payment перечисляется Representative.

Payment recipient ≠ beneficiary obligation, но Allocation может исполнить return obligation при сохранённом cross-subject basis.

### 37.8. Другой канал возврата

```text
Original Payment = cash
Return Obligation = 700
Refund Payment = bank
```

Допустимо, если применимая policy не требует иного.

### 37.9. Supplier returns prepayment

```text
Community → Supplier prepayment = 5000
unused refundable amount = 1500
Supplier → Community Return Obligation = 1500
Supplier → Community incoming Refund Payment = 1500
```

Incoming Refund Payment не становится Income автоматически.

### 37.10. Bank reversal without refund semantics

Банк показывает reversal 1000.

Система сначала признаёт/классифицирует Bank Transaction.

Без установленного Financial Obligation/refund basis банковский reversal не становится Refund автоматически.

### 37.11. Bank commission

Return Obligation = 1000.

Community отправляет 1000 Owner; банк отдельно списывает commission 20.

```text
Refund Payment = 1000
Commission = separate financial fact
```

Return Obligation исполнено на 1000, а комиссия обрабатывается собственной семантикой.

### 37.12. Недоплата из-за комиссии

Return Obligation = 1000.

Получателю фактически признаётся Refund Payment 980, комиссия 20 не является Payment получателю.

```text
fulfilled = 980
remaining obligation = 20
```

если отсутствует отдельное основание считать иначе.

### 37.13. Double refund concurrency

Refundable amount = 1000.

Два процесса одновременно пытаются подтвердить return obligations/исполнение на 700 и 600.

Система обязана revalidate effective financial state и не допустить совокупного возврата 1300.

### 37.14. Refund basis изменился до Payment

Return Obligation = 800.

До выплаты применимый процесс правомерно уменьшил obligation до 500.

Refund Payment на 800 не подтверждается по устаревшему состоянию; current outstanding amount = 500.

### 37.15. Refund Payment ошибочно признан

Community реально вернула 1000, но Refund Payment признан с неверным recipient/amount.

Сам return obligation остаётся отдельным фактом.

Correction Refund Payment выполняется через `BP-FIN-002`, затем его Allocation revalidated.

### 37.16. Refund Payment Allocation ошибочен

Refund Payment = 1000 корректен, но ошибочно распределён на два return obligations.

Payment не исправляется.

Подтверждённое Allocation изменяется через `BP-FIN-001`.

### 37.17. Исходный Payment был ошибочным recognition

Payment #P1 был invalidated по `BP-FIN-002`, потому что предметного Payment не существовало.

Создавать Refund Payment «в обратную сторону» только для компенсации ошибочной записи запрещено.

### 37.18. Реально ошибочно перечисленные деньги

Owner действительно перечислил 1000 не тому Community.

Payment реален и корректно признан как фактическое движение.

После установления обязанности вернуть:

```text
Original Payment remains
Return Obligation = 1000
new Refund Payment = 1000
```

Это Refund, а не Payment invalidation.

### 37.19. Refund затрагивает Financing

Supplier возвращает 2000 ранее профинансированной предоплаты.

Refund Payment признаётся отдельно.

Связанный Expense Financing проходит revalidation; возвращённая сумма не становится автоматически новым Funding Source или Income.

### 37.20. Один Refund Payment исполняет два return obligations

При допустимой policy Community делает один outgoing Payment 1500:

```text
Return Obligation A = 1000
Return Obligation B = 500
Refund Payment = 1500

Allocation A = 1000
Allocation B = 500
```

Это остаётся одним Payment с двумя Allocations.

### 37.21. Немедленный Refund

Refund basis и реальное движение могут возникнуть практически одновременно.

Например, ошибочно полученный, но реальный Payment сразу обнаружен и Community немедленно возвращает 1000.

Предметно всё равно различаются:

```text
refund basis
→ Financial Obligation to return 1000
→ new Refund Payment 1000
→ Initial Allocation to return obligation
```

Return obligation может возникнуть и быть полностью исполнено в рамках одного короткого business interaction, но не исчезает как предметный факт только потому, что время между возникновением и исполнением минимально.

### 37.22. Refund без одного определимого original Payment

Personal Account имеет признанное Overpayment 900, сформированное исторически из нескольких Payments и последующих перерасчётов.

Применимая семантика устанавливает Return Obligation = 900.

Не требуется искусственно выбирать один original Payment.

Provenance должна объяснять origin financial state, а Refund Payment исполняет return obligation обычным Allocation.

### 37.23. Самостоятельная выплата без refund origin — не Refund

Community по отдельному допустимому решению обязана выплатить Owner 500, но obligation не связано с возвратом ранее перемещённых средств, Overpayment, Advance, Unallocated Remainder либо иным возвратным финансовым состоянием.

```text
new Financial Obligation = 500
refund basis = none
→ outside BP-FIN-003
```

Обязательство может быть исполнено обычным Payment, но не классифицируется как Refund. Никакой произвольный исторический Payment Owner не уменьшается и не объявляется committed refundable amount.

### 37.24. Refund Payment превышает outstanding return obligation

Return Obligation = 1000.

Реально признан outgoing Payment = 1100.

Сам факт Payment 1100 не увеличивает return obligation автоматически.

```text
Initial Allocation to Return Obligation = 1000
remaining Payment amount = 100
```

Оставшиеся 100 требуют отдельного допустимого финансового смысла/решения. Они не становятся новым Refund Obligation и не считаются Expense автоматически.

### 37.25. Зачёт вместо возврата

Owner имеет refundable amount 500 и одновременно новое Financial Obligation 500 перед Community.

Community и Owner по допустимой policy выполняют зачёт без обратного движения денег.

Это может изменить effective financial state, но:

```text
money movement = none
→ Refund Payment = none
→ BP-FIN-003 не является процессом фактического исполнения через Refund
```

Такой settlement должен принадлежать отдельной применимой семантике, а не маскироваться как Refund.

### 37.26. Return obligation уменьшено ниже уже исполненной суммы

Return Obligation = 1000.

Community уже реально выполнила Refund Payment 700 и Allocation 700.

Позже owning process правомерно уменьшает Return Obligation до 500.

```text
Refund Payment 700 remains historical real movement
new effective Return Obligation = 500
excess executed amount = 200 requires separate financial disposition
```

BP-FIN-003 не invalidates Refund Payment и не создаёт автоматически reverse Payment/Refund на 200. Дальнейший финансовый смысл определяется отдельным достаточным основанием и owning process.

### 37.27. Освобождение committed amount до исполнения

Source Unallocated Remainder = 1000.

Признано Return Obligation = 800, явно связанное с этой source amount.

```text
committed refundable amount = 800
available for other Initial Allocation = 200
```

До Refund Payment owning process правомерно уменьшает Return Obligation до 500.

После revalidation:

```text
committed refundable amount = 500
source amount released from commitment = 300
```

Эти 300 снова получают доступность/финансовый смысл согласно owning source semantics; история первоначального commitment сохраняется.

### 37.28. Конкурирующие refund basis на одну source amount

Одна и та же source financial amount = 1000 одновременно фигурирует в двух ещё не подтверждённых refund decisions:

```text
Candidate A = 700
Candidate B = 600
```

Оба решения не могут стать действующими совместно на 1300.

Перед confirmation revalidation должна учитывать уже confirmed committed refundable amount и не допускать совокупного несовместимого commitment сверх 1000.

## 38. Инварианты

1. Refund is a business process/financial meaning, not a new fundamental entity.
2. Refund requires return origin traceable to one or more prior real money movements or financial state derived from them.
3. An unrelated new payout obligation without refund origin is not Refund.
4. Refund creates or uses a Financial Obligation to return.
5. Actual Refund is a new Payment.
6. Original Payment remains historically unchanged.
7. Refund ≠ Payment Recognition Correction.
8. Refund ≠ Reallocation.
9. Refund ≠ Cancellation.
10. Refund ≠ Bank Reversal.
11. Refund Payment ≠ Expense automatically.
12. Incoming Refund Payment does not create a separate fundamental Income/Community Receipt automatically.
13. Refund request ≠ refund basis.
14. Refund request ≠ refundable amount.
15. Original Payment alone does not create right to Refund.
16. Refundable amount is a derived process value, not a new entity.
17. Return obligation prevents incompatible reuse only when its refund basis explicitly identifies the corresponding source financial amount/state.
18. Such prevention is domain financial semantics, not technical reservation.
19. A return obligation without a specific source-amount relation does not consume an arbitrary historical Payment.
20. Return obligation uses ordinary Financial Obligation semantics.
21. Refund execution uses ordinary Payment semantics and the applicable owning recognition process.
22. Refund fulfillment uses ordinary Payment Allocation semantics via BP-FIN-ALLOCATION-001.
23. No universal 1:1 cardinality exists between original Payment and Refund Payment.
24. Partial Refund is valid.
25. One return obligation may be fulfilled by multiple Payments.
26. One Refund Payment may fulfill multiple return obligations where applicable.
27. Refundable amount ≠ outstanding amount of return obligation.
28. Cross-subject payer/recipient differing from obligation sides requires explicit sufficient basis.
29. Personal Account is optional context, not Refund identity.
30. Refund channel need not equal original payment channel.
31. Refund direction is not always outgoing relative to Community.
32. Overpayment may be refund basis but does not automatically require Refund.
33. Advance may be refund basis but does not automatically require Refund.
34. Unallocated Remainder may become refund basis only through applicable decision/policy.
35. Amount committed to return is no longer available for incompatible Initial Allocation.
36. Refund does not silently undo an existing confirmed Allocation.
37. Refund does not automatically reopen or cancel original Financial Obligation.
38. Bank reversal/chargeback does not automatically define Refund.
39. Bank commission is not automatically part of Refund Payment amount.
40. Currency conversion is outside this BP.
41. Refund Payment correction uses BP-FIN-002.
42. Refund Payment reallocation uses BP-FIN-001.
43. Source obligation recalculation/cancellation is separate from Refund.
44. Revalidation precedes execution where significant refund basis/state may have changed.
45. Double Refund of the same refundable amount is forbidden.
46. Technical retry ≠ new Refund Payment.
47. Manual refund decisions require attributable domain authority.
48. Automatic refund decisions require explicit policy and sufficient evidence.
49. Provenance must explain refund basis, obligation, Payment and materially affected dependent financial state.
50. No universal Refund Status, Refund Ledger, Refund Reservation or Correction is introduced.

## 39. Что намеренно не решается

Настоящий BP не определяет:

- product/UI lifecycle refund requests;
- dispute/appeal workflow;
- fraud investigation;
- chargeback legal process;
- payment-system-specific reversal API;
- banking API mechanics;
- cash document workflow;
- obligation recalculation/cancellation mechanics;
- accounting storno/reversal;
- BAS/BAF postings;
- tax treatment;
- legal limitation periods;
- settlement/set-off/netting without money movement;
- multi-currency conversion/exchange rates;
- technical money reservation;
- database locking/transaction mechanism.

## 40. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-010;
- ADR-011;
- `BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md`;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- REFERENCE_CANDIDATE_MATRIX.

## 41. Нормативные последствия

Новый ADR и новая фундаментальная сущность не требуются.

По итогам внутреннего и независимого review выполнена точечная нормативная синхронизация:

- DOMAIN_MODEL 0.12 — Refund определён как специализированный финансовый процесс/смысл: ordinary Financial Obligation to return исполняется новым Payment; закреплены return origin и отсутствие universal 1:1 original Payment ↔ Refund;
- TERMINOLOGY 0.10 — уточнены Refund, контекстное Financial Obligation to return и процессные derived values refundable/committed refundable amount;
- BP-FIN-ALLOCATION-001 — current effective financial use зеркально учитывает committed refundable amount при явной связи return obligation с конкретной source financial amount/state;
- REFERENCE_CANDIDATE_MATRIX — REF-FIN-005 закрыт решением, следующим процессом определён BP-FIN-004.

`Refundable amount` и `committed refundable amount` не становятся фундаментальными сущностями или сохраняемыми универсальными состояниями.

ADR-006 содержательно изменять не потребовалось; его базовый инвариант сохраняется:

```text
Refund = separate money movement
Refund ≠ modification of original Payment
```

## 42. Решения review

Внутренний и независимый review зафиксировали:

1. Refund моделируется без отдельной fundamental entity: это специализированный процесс/смысл, фактическое исполнение которого является новым Payment.
2. Даже immediate Refund использует ordinary Financial Obligation to return; obligation может возникнуть и быть исполнено в одном коротком business interaction, но не исчезает как предметный факт.
3. `Committed refundable amount` является derived process value и частью `current effective financial use` только при явной связи действующего return obligation с конкретной source financial amount/state; отдельный Reservation/Reserve не вводится.
4. BP-FIN-ALLOCATION-001 зеркально учитывает такой commitment при вычислении available amount.
5. Refund требует возвратного происхождения, прослеживаемого к одному или нескольким prior real money movements либо финансовому состоянию, возникшему из них; произвольная новая выплата без refund origin находится вне BP-FIN-003.
6. Универсальная Original Payment ↔ Refund relation entity не требуется; provenance должна объяснять source financial state и связь, когда она предметно определима.
7. Direction-neutral модель принята: owner refund обычно outgoing, supplier refund может быть incoming.
8. `Refund basis` не является отдельной сущностью; это контекстная роль предметного основания Financial Obligation to return.
9. Overpayment / Advance / Unallocated Remainder сохраняют собственную семантику; recognition return obligation создаёт commitment возвращаемой части и исключает несовместимое использование, а фактическое исполнение Refund отражается owning semantics соответствующего состояния.
10. Ordinary Payment Allocation достаточно для исполнения return obligation; Initial Allocation выполняется BP-FIN-ALLOCATION-001, последующее изменение confirmed Allocation — BP-FIN-001.
11. Refund Payment recognition принадлежит applicable owning channel/source process; BP-FIN-003 не вводит universal Payment Recognition workflow.
12. Новый ADR, Refund Status/Ledger/Reservation и отдельный Refund Debt не требуются.
13. Cross-subject payer/recipient допускается только при достаточном основании с provenance; Personal Account остаётся optional context.
14. Set-off/netting без реального money movement не является Refund и остаётся вне scope настоящего BP.

## 43. Следующий шаг

После финальной сверки настоящего Draft и синхронизированных нормативных документов BP-FIN-003 может быть принят как рабочая предметная основа.

Следующий финансовый процесс — `BP-FIN-004 — разовое/внецикловое начисление`.

Зачёт/set-off/netting без реального движения денег остаётся вне scope настоящего BP и требует отдельного предметного рассмотрения, если появится практический сценарий пилота.
