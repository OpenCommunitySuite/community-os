# BP-FIN-ALLOCATION-001 — Первичное распределение платежа

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет, как Community OS устанавливает первоначальный финансовый смысл уже признанного `Payment`, связывая всю сумму платежа или её часть с существующими `Financial Obligation` либо иными допустимыми финансовыми назначениями.

Процесс является независимым от способа платежа. Он одинаково применим к банковскому, наличному и иному допустимому Payment после того, как сам Payment уже признан соответствующим процессом.

Ключевая последовательность:

```text
Payment recognition
→ determination of allocation basis
→ allocation proposal where applicable
→ confirmation / automatic recognition
→ Payment Allocation
```

При этом:

```text
Payment
≠ Payment Allocation
≠ Allocation Proposal
≠ Financial Obligation
≠ Bank Transaction
≠ Payment Intent
```

## 2. Проблема

ADR-006 и нормативная предметная модель уже определяют `Payment Allocation` как самостоятельное исторически значимое действие или отношение. Существующий `BP-FIN-001-PAYMENT-REALLOCATION` описывает только изменение уже подтверждённого распределения.

До настоящего BP отсутствовал отдельный процесс первоначального распределения признанного Payment.

Если не разделять первичное распределение и перераспределение, возникает риск:

- считать редактирование ещё не подтверждённого предложения финансовой корректировкой;
- смешивать Payment recognition и Payment Allocation;
- переносить банковскую логику распределения в наличные платежи;
- делать назначение платежа или Payment Intent фактическим Allocation автоматически;
- считать любой остаток переплатой или авансом;
- вводить глобальный порядок погашения обязательств ради удобства реализации.

## 3. Границы процесса

Процесс начинается, когда:

1. существует корректно признанный `Payment`;
2. его доступная для распределения сумма определима;
3. требуется установить первоначальное финансовое назначение всей суммы или её части.

Процесс заканчивается одним из объяснимых результатов:

- Payment полностью распределён;
- Payment частично распределён, а часть остаётся `Unallocated Remainder`;
- Payment остаётся полностью нераспределённым;
- применимое финансовое назначение установлено как аванс или иной допустимый финансовый смысл;
- требуется решение уполномоченного участника;
- распределение не может быть подтверждено из-за конфликта или изменившихся оснований.

Настоящий BP не изменяет identity исходного Payment.

## 4. Что входит

В процесс входят:

- определение доступной для распределения суммы Payment;
- определение применимых Financial Obligations;
- использование Personal Account как контекста взаиморасчётов, где это применимо;
- использование Payment Intent как возможного input;
- использование назначения платежа как возможного input;
- использование сохранённого назначения аванса;
- применение локальных правил распределения и их версий;
- формирование предложения распределения;
- ручное изменение предложения до подтверждения;
- автоматическое подтверждение при достаточном основании;
- ручное подтверждение;
- частичное распределение;
- распределение одного Payment между несколькими обязательствами;
- распределение на обязательство, сторона которого не совпадает с фактическим плательщиком, при достаточном основании;
- сохранение нераспределённого остатка;
- provenance и authority;
- revalidation перед подтверждением, если значимые входы изменились.

## 5. Что не входит

Настоящий BP не определяет:

- recognition самого Payment;
- recognition Bank Transaction;
- приём наличности;
- кассовый документ;
- исправление ошибочного recognition Payment;
- возврат Payment;
- перераспределение уже подтверждённого Allocation;
- начисление;
- создание или исправление Financial Obligation;
- создание Personal Account;
- создание Subject;
- алгоритм fuzzy matching;
- конкретный UI;
- бухгалтерские проводки;
- BAS/BAF mapping;
- универсальный порядок oldest-first, penalty-first или иной глобальный порядок погашения;
- универсальный workflow согласования;
- мультивалютную конвертацию.

Изменение уже подтверждённого распределения относится к `BP-FIN-001-PAYMENT-REALLOCATION`.

## 6. Предусловие: признанный Payment

Первичное распределение возможно только для существующего признанного Payment.

Payment должен сохранять собственную identity независимо от распределения.

Отсутствие Allocation не означает, что Payment не существует.

Payment может быть:

- входящим;
- исходящим;
- банковским;
- наличным;
- иным допустимым способом.

Направление и способ Payment не определяют правила Allocation автоматически. Настоящий BP применим как к исполнению обязательств перед Community, так и к исполнению обязательств самого Community перед другими сторонами, если соответствующая финансовая семантика допускает Allocation.

## 7. Доступная сумма

Для процесса должна быть определима сумма Payment, ещё доступная для первоначального распределения.

Доступная сумма является вычисляемой величиной, а не самостоятельной сохраняемой предметной identity или новым финансовым состоянием. Она определяется из суммы Payment и уже существующего текущего effective financial use соответствующих частей Payment. Исторически сохранённые Allocation, финансовый эффект которых позднее был изменён Reallocation, не вычитаются повторно только потому, что продолжают существовать в истории.

Совокупный текущий effective financial use одного Payment не может превышать сумму Payment.

Если часть Payment уже получила подтверждённое первоначальное распределение и сохраняет действующий финансовый эффект, процесс может распределять только оставшуюся доступную часть без изменения уже подтверждённых Allocation.

Если требуется изменить уже подтверждённую часть, применяется Reallocation.

## 8. Allocation Proposal

**Allocation Proposal** в настоящем BP — процессное представление предполагаемого распределения до его предметного подтверждения.

Оно может быть сформировано:

- автоматически по применимому правилу;
- из Payment Intent;
- на основании назначения Payment;
- на основании существующих обязательств;
- вручную уполномоченным участником;
- как комбинация указанных источников.

Allocation Proposal:

- не является Payment Allocation;
- не изменяет Financial Obligation;
- не погашает задолженность;
- не создаёт аванс или переплату;
- может быть изменено или отброшено до подтверждения.

Настоящий BP не вводит фундаментальную domain entity `Allocation Proposal`.

## 9. Основания распределения

Для определения первоначального Allocation могут использоваться, где применимо:

- установленные стороны Payment;
- Personal Account;
- существующие Financial Obligations;
- Payment Intent;
- назначение Payment;
- структурированный reference;
- ранее признанное назначение аванса;
- Contractual Relationship как контекст;
- локальное правило распределения;
- явное решение уполномоченного участника;
- иное допустимое предметное основание.

Ни один отдельный signal не является универсальным достаточным основанием для любого Allocation.

Порядок перечисления возможных оснований не задаёт их приоритет, силу или обязательную последовательность применения. Их композиция и приоритет определяются применимой предметной семантикой и правилами.

## 10. Назначение платежа

Назначение Payment является предметно значимой информацией.

Оно может:

- указывать на предполагаемый Personal Account;
- указывать на вид обязательства;
- ограничивать допустимые варианты Allocation;
- быть основанием для ручного решения;
- использоваться правилом автоматического распределения.

Назначение Payment:

```text
purpose text
≠ Payment Allocation
```

Community OS не обязана универсально следовать тексту назначения, если применимая предметная политика устанавливает иной допустимый порядок.

## 11. Payment Intent

Payment Intent может содержать предполагаемую сумму и предполагаемое распределение.

Совпавший Payment Intent может быть сильным основанием для Allocation, но:

```text
Payment Intent expected allocation
≠ actual Payment Allocation
```

Если фактическая сумма, стороны или иные существенные характеристики Payment отличаются от Intent, предполагаемое распределение не подтверждается молча.

## 12. Financial Obligations

Allocation может связывать сумму Payment с одним или несколькими существующими Financial Obligations.

Одно обязательство может исполняться несколькими Payments.

Один Payment может исполнять несколько обязательств.

Настоящий BP не создаёт Financial Obligation только ради распределения Payment.

Если подходящего обязательства не существует, соответствующая сумма может:

- остаться нераспределённой;
- получить иной допустимый финансовый смысл согласно отдельному основанию;
- быть признана авансом, если для этого существуют достаточные условия.

## 13. Локальный порядок распределения

Community OS не устанавливает универсальный порядок Allocation.

В частности, не являются глобальными правилами:

- oldest first;
- newest first;
- electricity first;
- water first;
- membership fee first;
- penalty first;
- proportional distribution;
- exact-match-first.

Конкретное Community может иметь применимое правило или policy.

Если порядок является исторически значимым правилом, должны быть определимы его версия и применимость согласно ADR-005.

Изменение правила не переписывает ранее подтверждённые Allocation.

## 14. Automatic Allocation

Автоматическое первоначальное распределение допускается, когда:

1. Payment корректно признан;
2. применимое правило однозначно;
3. значимые входы определены;
4. authority/policy допускает automatic decision;
5. результат объясним.

Automatic Allocation должно позволять установить:

- применённое правило и его версию;
- использованные значимые входы;
- распределённые суммы;
- целевые обязательства или иные назначения;
- нераспределённый остаток;
- основание автоматического подтверждения.

Если автоматическое решение недостаточно надёжно, формируется Proposal/Requires Decision либо Payment остаётся без Allocation.

## 15. Manual Allocation

Уполномоченный участник может сформировать или изменить Allocation Proposal вручную.

До подтверждения изменение Proposal не является Reallocation.

Ручное решение должно сохранять достаточную provenance-информацию, когда это требуется значимостью действия.

Техническое право доступа не является предметным полномочием.

## 16. Confirmation

Подтверждение превращает допустимое предложение распределения в исторически значимый Payment Allocation.

Одно подтверждение может относиться:

- к одному независимому Allocation;
- к согласованному набору взаимозависимых Allocation одного Payment, если они образуют единое предметное решение по общему основанию, правилу, Payment Intent или ручному решению.

Confirmation scope является семантикой процесса и не вводит новую фундаментальную domain entity.

Перед подтверждением весь соответствующий scope должен пройти revalidation.

Если взаимозависимый набор больше не валиден целиком из-за изменения обязательства, правила, Payment Intent либо иного значимого основания, такой набор не подтверждается частично «как есть». Он должен быть пересчитан, сформирован заново либо переведён в Requires Decision.

Предметно независимые Allocation могут подтверждаться отдельно и не обязаны блокировать друг друга только из-за того, что относятся к одному Payment.

Для взаимозависимого confirmation scope применяется предметная атомарность: результат не должен оставлять такой набор частично подтверждённым.

После подтверждения:

- соответствующая сумма Payment считается распределённой;
- целевые Financial Obligations либо иные допустимые финансовые назначения получают соответствующий финансовый эффект согласно их owning semantics;
- подтверждённый Allocation не редактируется молча.

Если позже требуется изменить подтверждённый результат, применяется `BP-FIN-001-PAYMENT-REALLOCATION`.

## 17. Частичное распределение

Payment может быть распределён частично.

Пример:

```text
Payment = 1500

Allocation:
  Electricity obligation → 800
  Water obligation       → 400

Unallocated remainder    → 300
```

Не существует требования распределить всю сумму любой ценой.

Фиктивное обязательство не создаётся ради нулевого остатка.

## 18. Нераспределённый остаток

Unallocated Remainder — часть признанного Payment, которая ещё не получила окончательного финансового назначения.

Он не является автоматически:

- переплатой;
- авансом;
- доходом;
- членским взносом;
- исполнением ближайшего обязательства.

Нераспределённый остаток может быть распределён позднее без изменения identity Payment.

Такое последующее первое распределение ранее нераспределённой части остаётся Initial Allocation, пока не изменяет уже подтверждённый Allocation.

## 19. Аванс

Часть Payment может получить смысл Advance при наличии достаточного предметного основания.

При этом:

```text
Advance
≠ Payment Allocation
```

Payment Allocation может связать доступную часть Payment с допустимым финансовым назначением «аванс» в смысле ADR-006 §11 («иные допустимые финансовые назначения») и тем самым участвовать в признании соответствующего финансового смысла, но не превращается в сам Advance как отдельное состояние/назначение средств.

Advance может относиться к:

- определённому виду будущих обязательств;
- определённому Personal Account;
- иной допустимой области назначения.

Арифметическое превышение Payment над текущей задолженностью не создаёт Advance автоматически.

Для Advance должно быть определимо его существенное назначение.

## 20. Переплата

```text
Overpayment
≠ Payment Allocation
```

Overpayment не является целевым назначением Initial Allocation как таковым.

Согласно ADR-006 и нормативной предметной модели Overpayment — признанное финансовое состояние, при котором ранее применённая к исполнению сумма в текущем effective state финансовых отношений оказывается избыточной.

Поэтому простое превышение суммы Payment над текущими обязательствами само по себе не создаёт Overpayment.

Например:

```text
Payment = 2000
Current obligations = 1700
Arithmetic remainder = 300
```

Первичное распределение может дать:

```text
1700 → Payment Allocation
300  → Unallocated Remainder
```

либо, при достаточном отдельном основании:

```text
1700 → Payment Allocation
300  → Advance
```

Но из первоначального арифметического остатка автоматически не следует:

```text
300 → Overpayment
```

Overpayment может возникнуть позднее как следствие изменения effective financial state, например если ранее исполненное обязательство после правомерного перерасчёта уменьшилось. Такое состояние не создаётся настоящим BP как специальный target первоначального Allocation.

## 21. Плательщик и обязанная сторона

Фактический Payer Payment не обязан совпадать с обязанной стороной Financial Obligation.

Допустим сценарий, когда один Subject оплачивает обязательство другого Subject.

Такое cross-subject Allocation требует достаточного основания.

Совпадение:

- суммы;
- имени;
- номера участка;
- похожего текста назначения

не является универсально достаточным доказательством права распределить Payment на обязательство другого Subject.

## 22. Personal Account

Personal Account может использоваться как контекст взаиморасчётов и ограничивать набор допустимых Financial Obligations.

Однако:

```text
Payment
≠ Personal Account
Payment Allocation
≠ Personal Account
```

Один Payment не обязан универсально распределяться только внутри одного Personal Account, если предметно допустимый сценарий и основание требуют иного.

Cross-account Allocation должен быть явно обоснован.

## 23. Изменение состояния до подтверждения

Allocation Proposal может быть сформировано на основании текущего состояния обязательств.

Если до подтверждения изменились значимые входы, например:

- Financial Obligation;
- его остаток;
- срок;
- отмена;
- другой подтверждённый Allocation;
- применимое правило;
- Personal Account matching;

перед подтверждением должна выполняться revalidation.

Community OS не должна подтверждать устаревшее Proposal как будто исходные основания не изменились.

Revalidation применяется к соответствующему confirmation scope. Если изменившийся вход затрагивает взаимозависимый набор Allocation, решение должно быть повторно определено для всего набора, а не только для одного элемента, если предметная семантика общего основания требует целостности.

Настоящий BP не предписывает конкретный механизм optimistic locking или технической конкуренции.

## 24. Concurrent Allocation

Два параллельных процесса не должны подтвердить Allocation так, чтобы совокупная распределённая сумма превысила доступную сумму Payment либо допустимый объём исполнения обязательства согласно его семантике.

Технический механизм обеспечения этого инварианта настоящим BP не определяется.

## 25. Ошибка до подтверждения

Если оператор ошибся при редактировании Allocation Proposal, но Proposal ещё не подтверждено:

- финансового исторического Allocation ещё нет;
- исправление Proposal не является Reallocation;
- отдельная финансовая Correction не требуется.

## 26. Ошибка после подтверждения

Если уже подтверждённый Payment Allocation оказался неверным либо требует изменения:

```text
confirmed Payment Allocation
→ BP-FIN-001 Payment Reallocation
```

Исходный Allocation сохраняется исторически.

## 27. Ошибка recognition Payment

Если проблема относится не к Allocation, а к самому признанному Payment, его сторонам либо факту движения средств, настоящий BP не применяется как механизм исправления.

Это относится к будущему `BP-FIN-002 — исправление ошибочного признания платежа`.

## 28. Payment correction / Refund boundary

Refund не является Allocation.

Возврат средств создаёт самостоятельный факт движения денежных средств согласно отдельному финансовому процессу.

Изменение Allocation не создаёт Refund автоматически.

## 29. Authority

Предметно значимыми действиями являются, где применимо:

- ручное формирование Allocation;
- подтверждение Allocation;
- разрешение cross-subject/cross-account Allocation;
- автоматическое подтверждение по policy;
- признание назначения остатка как Advance или иного специализированного результата.

Для таких действий должна быть определима применимая authority согласно ADR-010.

## 30. Provenance

Для подтверждённого Payment Allocation должны быть объяснимы, где применимо:

- Payment;
- распределённая сумма;
- целевое Financial Obligation или иное финансовое назначение;
- Personal Account/context;
- все использованные источники Allocation Proposal и их значимая комбинация, где применимо;
- использованный Payment Intent;
- существенное назначение Payment;
- основание cross-subject и/или cross-account Allocation, где применимо;
- применённое правило и версия;
- значимые входы;
- manual actor/authority;
- момент подтверждения;
- нераспределённый остаток после действия.

Provenance не требует универсальной Audit entity.

## 31. Проверочные сценарии

### 31.1. Точное совпадение с одним обязательством

Payment = 1000. Существует одно применимое Financial Obligation на 1000.

При достаточном основании:

```text
Payment 1000
→ Allocation 1000 to Obligation
```

### 31.2. Один Payment на несколько обязательств

Payment = 1500.

Применимое правило/решение определяет:

```text
Electricity → 900
Water       → 400
Membership  → 200
```

Создаётся один Payment и несколько Allocation, а не три Payments.

### 31.3. Частичное погашение

Payment = 600, Obligation = 1000.

Допустимо:

```text
Allocation = 600
Remaining obligation = 400
```

### 31.4. Payment превышает текущие обязательства

Payment = 2000, текущие применимые обязательства = 1700.

1700 могут быть распределены. Остальные 300 не становятся Overpayment/Advance автоматически.

### 31.5. Payment Intent совпал

Payment Intent предполагает 600 на электроэнергию и 400 на воду. Фактический Payment = 1000 и надёжно сопоставлен с Intent.

Применимая policy может автоматически подтвердить соответствующие Allocation.

### 31.6. Payment Intent не совпал по сумме

Intent = 1000, Payment = 900.

Предполагаемое распределение Intent не становится фактическим молча. Требуется применимое правило пересчёта либо решение.

### 31.7. Платёж третьего лица

Сын оплачивает обязательство родителя.

Payer Subject ≠ debtor Subject.

Allocation допустим только при достаточном основании; плательщик не заменяет обязанную сторону Financial Obligation.

### 31.8. Неоднозначный Personal Account

Payment признан, но надёжный Personal Account не установлен.

Payment может остаться без Allocation/Requires Decision; fake Personal Account не создаётся.

### 31.9. Автоматическое предложение перед ручным подтверждением

Правило формирует Proposal:

```text
Electricity 1000
Water 500
```

Оператор до подтверждения меняет его:

```text
Electricity 700
Water 800
```

Это остаётся Initial Allocation, а не Reallocation.

### 31.10. Обязательство изменилось до подтверждения

Proposal создан на основе задолженности 500 по воде. До подтверждения другой финансовый процесс изменил применимый остаток.

Proposal должен быть revalidated; устаревший вариант не подтверждается молча.

### 31.11. Полностью нераспределённый Payment

Payment признан корректно, но отсутствует достаточное основание для Allocation.

Payment сохраняется полностью, его сумма образует Unallocated Remainder в применимом смысле, но не превращается в fake Obligation.

### 31.12. Аванс на будущую электроэнергию

Плательщик передаёт средства с допустимым и подтверждённым назначением на будущие обязательства за электроэнергию.

Сумма может получить смысл Advance согласно применимой policy без искусственного создания будущего Financial Obligation.

### 31.13. Исходящий Payment по обязательству Community

Community перечисляет 55 000 грн поставщику электроэнергии. Payment признан как исходящий, существует применимое Financial Obligation Community перед Supplier на 70 000 грн.

Допустимо:

```text
Outgoing Payment = 55 000
Allocation to Supplier Obligation = 55 000
Remaining Obligation = 15 000
```

Сам факт исходящего Payment не создаёт Expense или Obligation и не меняет правила их owning processes.

### 31.14. Confirmation scope и частичный провал revalidation

Payment = 1500. Одно применимое правило сформировало взаимозависимый Proposal:

```text
Electricity → 900
Water       → 400
Membership  → 200
```

До подтверждения обязательство по воде изменилось так, что Proposal больше не валиден как единый результат правила.

Система не подтверждает автоматически только 900 и 200, сохраняя старое решение для оставшихся элементов. Весь взаимозависимый confirmation scope пересчитывается либо переходит в Requires Decision.

Если же два Allocation были сформированы как предметно независимые решения с отдельными основаниями, они могут иметь отдельные confirmation scopes.

### 31.15. Конкурентное подтверждение

Payment = 1000, вся сумма ещё доступна.

Два параллельных процесса подготовили:

```text
Proposal A → 700
Proposal B → 600
```

После подтверждения одного результата второй должен пройти revalidation. Совокупный effective financial use не может стать 1300.

Настоящий BP не определяет технический locking-механизм.

### 31.16. Cross-account Allocation одного Subject

Один собственник имеет два Personal Accounts, например для двух участков.

Payment признан от этого Subject, но распределение части суммы на обязательство другого его Personal Account допускается только при достаточном предметном основании. Сам факт совпадения Subject не делает cross-account Allocation автоматическим.

### 31.17. Полный Advance flow

Payment = 1000. Плательщик явно и допустимо указал назначение на будущую электроэнергию, а applicable policy позволяет признать Advance.

```text
Payment
→ Proposal: 1000 to допустимое финансовое назначение Advance
→ confirmation
→ Payment Allocation
→ recognized Advance state/purpose according to owning financial semantics
```

Payment Allocation участвует в установлении финансового смысла, но `Advance ≠ Payment Allocation`.

### 31.18. Overpayment не является target Initial Allocation

Payment = 2000, текущие обязательства = 1700.

```text
1700 → Payment Allocation
300  → Unallocated Remainder
```

Позднее уже исполненное обязательство на 1700 после правомерного перерасчёта уменьшается до 1500. Возникший избыток 200 может получить состояние Overpayment согласно применимой семантике.

Это последующее состояние, а не первоначальный target Initial Allocation.

### 31.19. Automatic rule без права auto-confirmation

Применимое правило однозначно вычисляет:

```text
Electricity → 600
Water       → 400
```

Но действующая authority/policy разрешает только automatic proposal, а подтверждение требует уполномоченного участника.

Результат остаётся Proposal/Requires Decision; автоматический расчёт сам по себе не создаёт Payment Allocation.

## 32. Инварианты процесса

1. Payment ≠ Payment Allocation.
2. Payment Allocation ≠ Allocation Proposal.
3. Payment Intent expected allocation ≠ actual Payment Allocation.
4. Purpose text ≠ Payment Allocation.
5. Payment recognition precedes Initial Allocation.
6. Payment may exist without any Allocation.
7. Initial Allocation does not change Payment identity.
8. Confirmed Allocation is historically significant.
9. Editing an unconfirmed Proposal is not Reallocation.
10. Changing confirmed Allocation requires Reallocation.
11. No universal allocation priority is defined.
12. Automatic Allocation requires an applicable explainable rule/policy.
13. Rule changes do not rewrite historical Allocation.
14. One Payment may allocate to multiple Financial Obligations.
15. One Financial Obligation may be fulfilled by multiple Payments.
16. Newly confirmed Allocation within a confirmation scope cannot exceed the Payment amount available at confirmation time.
17. Total current effective financial use of a Payment cannot exceed the Payment amount.
18. Partial Allocation is valid.
19. Unallocated Remainder ≠ Advance.
20. Unallocated Remainder ≠ Overpayment.
21. Arithmetic excess ≠ automatic Overpayment.
22. Arithmetic excess ≠ automatic Advance.
23. No fake Financial Obligation is created to consume a remainder.
24. Payer Subject may differ from obligated Subject.
25. Cross-subject Allocation requires explicit sufficient basis.
26. Cross-account Allocation requires explicit sufficient basis.
27. Personal Account is context, not Payment Allocation.
28. Allocation Proposal must be revalidated when significant inputs change.
29. Concurrent processing must not over-allocate Payment.
30. Allocation correction does not rewrite the source Payment.
31. Refund ≠ Reallocation.
32. Allocation does not create Bank Transaction.
33. Allocation does not depend on payment channel.
34. Initial Allocation applies to both incoming and outgoing Payment where the financial semantics supports it.
35. Advance ≠ Payment Allocation.
36. Overpayment ≠ Payment Allocation and is not a target of Initial Allocation.
37. Available amount is a derived process value, not a new financial identity or state.
38. Enumeration order of allocation evidence does not define priority.
39. A mutually dependent confirmation scope is revalidated and confirmed atomically at the domain level.
40. Invalidating one required element of a mutually dependent scope prevents partial confirmation of the stale set.
41. Independent Allocations may have separate confirmation scopes.
42. Cross-subject/cross-account Allocation must preserve its explicit basis in provenance.
43. Manual financial decisions require attributable authority.
44. Provenance must explain confirmed Allocation without universal Audit entity.

## 33. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-010;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md` после его принятия;
- REFERENCE_CANDIDATE_MATRIX;
- OSBBX reference analysis.

## 34. Нормативные последствия

Предварительно новый ADR и новые фундаментальные сущности не требуются.

ADR-006, DOMAIN_MODEL и TERMINOLOGY уже определяют:

- Payment;
- Payment Intent;
- Payment Allocation;
- Unallocated Remainder;
- Advance;
- Overpayment;
- Reallocation;
- правило отсутствия глобального порядка распределения.

Настоящий BP операционализирует уже принятую семантику.

После review следует:

- проверить необходимость только точечной терминологической синхронизации;
- обновить REFERENCE_CANDIDATE_MATRIX, отделив принятую семантику Allocation от отсутствовавшего ранее конкретного Initial Allocation BP;
- определить место процесса в последовательности Этапа 5.

## 35. Решения внутреннего review

По результатам сверки с ADR-004/005/006/010, DOMAIN_MODEL, TERMINOLOGY и BP-FIN-001 зафиксировано:

1. Initial Allocation является direction-neutral и применяется как к incoming, так и к outgoing Payment; отдельный фундаментальный процесс только для входящих Payments не требуется.
2. Cross-Personal-Account Allocation не запрещается универсально, но требует достаточного предметного основания; специальные ограничения первого СТ относятся к локальной policy/configuration.
3. Конкретные автоматические приоритеты пилотного СТ не входят в нормативный BP. Они должны определяться только как применимые Allocation Rules/Policy после отдельного продуктового решения.
4. Advance остаётся отдельным финансовым смыслом: `Advance ≠ Payment Allocation`. Allocation может связать часть Payment с допустимым назначением аванса и участвовать в его recognition, но не сливает эти понятия.

Новый ADR или новая фундаментальная сущность по результатам review не требуются.

Независимый review Claude дополнительно выявил и после сверки с нормативными документами уточнил:

- confirmation scope и предметную атомарность взаимозависимого набора Allocation;
- обязательное provenance-основание cross-subject/cross-account Allocation;
- асимметрию Advance и Overpayment: Initial Allocation может участвовать в признании Advance, но Overpayment не является target первоначального Allocation;
- необходимость явно оставить available amount производным process value;
- дополнительные проверочные сценарии concurrency, cross-account, Advance и automatic proposal без auto-confirmation.

## 36. Следующий шаг

1. повторная внутренняя проверка Draft после point fixes;
2. определить необходимость минимальной нормативной синхронизации;
3. обновить REFERENCE_CANDIDATE_MATRIX, зафиксировав самостоятельный Initial Allocation BP;
4. после принятия определить место процесса в последовательности Этапа 5.
