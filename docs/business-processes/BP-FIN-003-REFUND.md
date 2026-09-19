# BP-FIN-003 — Возврат денежных средств (Refund)

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет возврат денежных средств, когда реальное движение денежных средств ранее состоялось и существует предметно достаточное основание вернуть всю сумму либо её часть другой стороне.

Ключевая модель:

```text
refund basis
→ Financial Obligation to return
→ new Payment
→ Payment Allocation to return obligation
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
basis = recognized refundable amount
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

## 8. Предметный commitment возвращаемой суммы

Если refund obligation основан на конкретной части ранее признанных средств, подтверждение обязанности вернуть эту часть изменяет её текущий финансовый смысл.

После подтверждения refund obligation соответствующая сумма не может одновременно считаться свободной для иного Initial Allocation или иного несовместимого финансового использования.

Это:

- не техническое резервирование денег на банковском счёте;
- не блокировка физических денежных средств;
- не новый `Reserve`;
- не отдельная fundamental entity.

Это предметное следствие признанного Financial Obligation to return и его refund basis.

Если основание впоследствии правомерно изменено либо obligation отменено/изменено специализированным процессом, доступность суммы определяется заново с сохранением истории.

## 9. Refund Payment

Фактический возврат средств является новым Payment.

Для него применяются обычные правила Payment:

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

Например:

```text
Refund Obligation = 1000

Refund Payment = 400
Allocation → Refund Obligation 400
Remaining Obligation = 600
```

Отдельный фундаментальный `Refund Allocation` не вводится.

Если Payment признан корректно, но его подтверждённое распределение по return obligations позднее оказалось неверным, применяется `BP-FIN-001`.

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

## 17. Возврат при сохраняющемся исходном обязательстве

Допускается сценарий, в котором первоначальное обязательство остаётся действительным и исполненным, но Community по отдельному предметному основанию принимает новое обязательство вернуть средства.

Например, отдельное допустимое решение Community предусматривает выплату 500 собственнику независимо от того, что первоначальный членский взнос был корректно уплачен.

Тогда:

```text
Original Obligation remains fulfilled
+
new Financial Obligation to return = 500
+
new Refund Payment
```

Refund не обязан семантически «откатывать» исходное обязательство.

## 18. Refund recipient и сторона obligation

Фактический получатель Refund Payment не обязан универсально совпадать с управомоченной стороной return obligation, так же как стороны Payment и Obligation в общей модели могут различаться.

Однако cross-subject refund требует достаточного предметного основания.

Например, возврат может быть перечислен:

- уполномоченному представителю;
- наследнику после установления применимого основания;
- иному Subject при наличии допустимого распоряжения/основания.

Совпадение фамилии, банковского счёта, номера участка или текста назначения само по себе не является достаточным универсальным основанием.

Cross-subject basis сохраняется в provenance.

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

## 21. Refund ≠ Expense / Income

Исходящий Refund Payment не создаёт Expense автоматически.

Входящий Refund Payment от поставщика не создаёт Income автоматически.

```text
Refund Payment
≠ Expense
≠ Income
```

Expense, Financing, Funding Source и иные финансово-управленческие смыслы изменяются только согласно их owning semantics.

Например, возврат поставщиком неиспользованной предоплаты может потребовать revalidation Expense/Financing, но не превращается автоматически в новый доход Community.

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

## 28. Refund и Reallocation

Refund не является Reallocation.

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
8. Payment Allocation связывает 1000 с return obligation.
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

## 38. Инварианты

1. Refund is a business process/financial meaning, not a new fundamental entity.
2. Refund creates or uses a Financial Obligation to return.
3. Actual Refund is a new Payment.
4. Original Payment remains historically unchanged.
5. Refund ≠ Payment Recognition Correction.
6. Refund ≠ Reallocation.
7. Refund ≠ Cancellation.
8. Refund ≠ Bank Reversal.
9. Refund Payment ≠ Expense automatically.
10. Refund Payment ≠ Income automatically.
11. Refund request ≠ refund basis.
12. Refund request ≠ refundable amount.
13. Original Payment alone does not create right to Refund.
14. Refundable amount is a derived process value, not a new entity.
15. Confirmed return obligation prevents incompatible reuse of the same source amount.
16. Such prevention is domain financial semantics, not technical reservation.
17. Return obligation uses ordinary Financial Obligation semantics.
18. Refund execution uses ordinary Payment semantics.
19. Refund fulfillment uses ordinary Payment Allocation semantics.
20. No universal 1:1 cardinality exists between original Payment and Refund Payment.
21. Partial Refund is valid.
22. One return obligation may be fulfilled by multiple Payments.
23. One Refund Payment may fulfill multiple return obligations where applicable.
24. Cross-subject refund recipient requires explicit sufficient basis.
25. Refund channel need not equal original payment channel.
26. Refund direction is not always outgoing relative to Community.
27. Overpayment may be refund basis but does not automatically require Refund.
28. Advance may be refund basis but does not automatically require Refund.
29. Unallocated Remainder may become refund basis only through applicable decision/policy.
30. Amount committed to return is no longer available for incompatible Initial Allocation.
31. Refund does not silently undo an existing confirmed Allocation.
32. Refund does not automatically reopen or cancel original Financial Obligation.
33. Bank reversal/chargeback does not automatically define Refund.
34. Bank commission is not automatically part of Refund Payment amount.
35. Currency conversion is outside this BP.
36. Refund Payment correction uses BP-FIN-002.
37. Refund Payment reallocation uses BP-FIN-001.
38. Source obligation recalculation/cancellation is separate from Refund.
39. Revalidation precedes execution where significant refund basis/state may have changed.
40. Double Refund of the same refundable amount is forbidden.
41. Technical retry ≠ new Refund Payment.
42. Manual refund decisions require attributable domain authority.
43. Automatic refund decisions require explicit policy and sufficient evidence.
44. Provenance must explain refund basis, obligation, Payment and materially affected dependent financial state.
45. No universal Refund Status, Refund Ledger, Refund Reservation or Correction is introduced.

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

Предварительно новый ADR и новая фундаментальная сущность не требуются.

После review следует проверить необходимость точечной синхронизации DOMAIN_MODEL/TERMINOLOGY:

- уточнить Refund как новый Payment, исполняющий Financial Obligation to return;
- зафиксировать отсутствие фундаментальной Refund entity;
- при необходимости уточнить влияние confirmed return obligation на доступность исходной суммы для Initial Allocation.

ADR-006 уже содержит базовый инвариант:

```text
Refund = separate money movement
Refund ≠ modification of original Payment
```

и предварительно не требует нового архитектурного решения.

## 42. Открытые вопросы для review

Перед принятием Draft следует независимо проверить:

1. достаточно ли моделировать Refund без отдельной fundamental entity;
2. всегда ли Refund должен проходить через Financial Obligation to return, включая немедленный refund;
3. корректно ли считать confirmed return obligation достаточным предметным основанием исключить соответствующую сумму из доступного Initial Allocation без отдельного Reservation;
4. достаточно ли provenance-связи с source financial state без универсальной Original Payment ↔ Refund relation entity;
5. корректна ли direction-neutral модель для supplier refund;
6. не смешивается ли refund basis с Financial Obligation basis;
7. достаточно ли границы Refund vs Payment correction / Reallocation / Bank Reversal;
8. правильно ли моделируются Overpayment / Advance / Unallocated Remainder при признании return obligation;
9. достаточно ли обычного Payment Allocation для исполнения return obligation;
10. нужна ли зеркальная корректировка BP-FIN-ALLOCATION-001 по доступности суммы, committed to Refund;
11. не требуется ли минимальное уточнение ADR-006 или достаточно DOMAIN_MODEL/TERMINOLOGY;
12. нужны ли дополнительные правила для refund recipient ≠ beneficiary return obligation.

## 43. Следующий шаг

1. внутренний review против ADR-004/005/006/010/011, DOMAIN_MODEL, TERMINOLOGY, BP-FIN-BANK-001, BP-FIN-ALLOCATION-001, BP-FIN-001 и BP-FIN-002;
2. проверка сценариев пилотного СТ и supplier refund;
3. независимый review Claude;
4. point fixes;
5. нормативная синхронизация и закрытие REF-FIN-005;
6. переход к BP-FIN-004 — разовое/внецикловое начисление.
