# BP-FIN-002 — Исправление ошибочного признания платежа

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет исправление ранее признанного `Payment`, если ошибка относится к самому факту признания платежа либо к его существенной предметной интерпретации.

Процесс сохраняет различия:

```text
Payment Recognition Correction
≠ Bank Transaction correction
≠ Payment Allocation / Reallocation
≠ Refund
≠ Financial Obligation correction
≠ Accrual recalculation
≠ universal Financial Correction
```

Цель процесса — получить корректное текущее финансовое состояние без silent rewrite исторически значимого признания Payment и без искусственного движения денежных средств.

## 2. Проблема

После признания Payment может выясниться, что:

- реальное движение денежных средств было, но Community OS неверно определила существенную характеристику Payment;
- движение существовало, но вообще не должно было быть признано Payment;
- один признанный Payment в действительности соответствует нескольким реальным Payments;
- несколько признанных Payments в действительности соответствуют одному реальному Payment;
- один и тот же реальный Payment был признан более одного раза;
- исправление source-факта или source-классификации изменяет основания ранее выполненного Payment recognition.

Простое редактирование существующего Payment уничтожило бы историю первоначального признания и нарушило бы ADR-004/006.

Создание Refund для исправления ошибочного recognition также неверно, потому что Refund является новым реальным движением денежных средств.

## 3. Основная граница

Настоящий BP применяется только тогда, когда исправляется сам признанный Payment.

Если Payment остаётся корректным, а ошибка относится только к распределению его суммы, применяется:

- `BP-FIN-ALLOCATION-001` — для ещё не подтверждённого либо впервые устанавливаемого Allocation;
- `BP-FIN-001` — для изменения уже подтверждённого Payment Allocation.

Если неверны исходные банковские сведения или Bank Transaction, сначала применяется owning process банковского источника / `BP-FIN-BANK-001`.

Если деньги реально должны быть возвращены другой стороне, применяется отдельный Refund process (`BP-FIN-003`), а не настоящий BP.

## 4. Что является частью Payment

Согласно ADR-006 для признанного Payment должны быть определимы:

- направление;
- сумма;
- денежная единица;
- предметно значимые сведения о сторонах;
- время реального движения;
- происхождение;
- основание признания.

Ошибка в одной из этих характеристик может относиться к Payment Recognition Correction, если после исправления речь продолжает идти о том же реальном движении денежных средств.

Personal Account, Financial Obligation и Payment Allocation не являются частью identity Payment сами по себе.

Поэтому ошибочный Personal Account или неверное обязательство при корректном Payment не превращаются автоматически в Payment Recognition Correction.

## 5. Источник ошибки и порядок действий

Следует различать:

### 5.1. Source верен, interpretation неверна

Например, Bank Transaction корректна, но Community OS:

- признала не того payer Subject;
- ошибочно определила direction;
- признала own-account transfer как Payment;
- создала дублирующий Payment.

В этом случае source-факт не изменяется; исправляется Payment recognition и связанные финансовые последствия.

### 5.2. Source сам был исправлен

Например, банк прислал corrected transaction information.

Сначала сохраняется и обрабатывается source correction согласно `BP-FIN-BANK-001`.

Если source correction влияет на ранее признанный Payment, затем применяется настоящий BP.

### 5.3. Ошибка в небанковском source

Для наличного или иного Payment сначала применяется соответствующий owning process источника, если ошибка относится именно к исходному кассовому/внешнему факту.

Настоящий BP не становится универсальным механизмом исправления любых source-данных.

## 6. Модель identity Payment

Identity Payment принадлежит финансовому контексту и относится к признанному предметному факту Payment. Она не определяется количеством Bank Transactions, строк выписки, кассовых документов или иных source representations.

В частности:

```text
source representation identity/cardinality
≠ Payment identity/cardinality
```

Это сохраняет принятую в `BP-FIN-BANK-001` возможность:

- one Bank Transaction → multiple Payments;
- multiple Bank Transactions → one Payment;
- Bank Transaction → no Payment.

Исправление recognition не означает автоматически создание нового Payment.

Используются три базовые модели.

### 6.1. Тот же предметный Payment, исправляется интерпретация

Если evidence подтверждает, что после исправления речь по-прежнему идёт о том же предметном факте Payment, его identity сохраняется независимо от того, одним или несколькими source representations он подтверждается:

```text
same domain Payment
+ corrected interpretation
→ preserve Payment identity
```

Примеры:

- исправлена сторона Payment;
- исправлен direction при сохранении identity предметного Payment;
- уточнены сумма/валюта/время после подтверждённой source correction, но предметная identity Payment сохраняется;
- исправлено основание recognition без замены одного предметного Payment другим.

Payment identity сохраняется только при достаточном основании continuity; совпадение одного external ID, одной Bank Transaction, суммы или времени само по себе не является универсальным критерием.

Первоначально признанные значения и последующее исправление остаются исторически объяснимыми.

### 6.2. Реального Payment не было

Если выясняется, что признанное движение не является Payment:

```text
recognized Payment
→ recognition invalidated
→ no effective Payment
```

Payment не удаляется физически и не превращается в другой факт.

Его первоначальное recognition и последующее invalidation сохраняются как история ошибочного признания.

Примеры:

- own-account transfer ошибочно признан Payment;
- техническое дублирование породило лишний Payment;
- bank movement был ошибочно интерпретирован как движение между сторонами финансового отношения.

### 6.3. Неверная кардинальность предметных Payments

Если один признанный Payment фактически объединяет несколько самостоятельных предметных Payments:

```text
old recognized Payment
→ recognition invalidated

replacement Payment A → recognition by applicable owning process
replacement Payment B → recognition by applicable owning process
...
```

Новые Payment identities возникают в соответствующем recognition process, а не создаются настоящим BP как универсальным channel-independent recognition workflow.

Для банковского источника применяется граница recognition, установленная `BP-FIN-BANK-001`; для наличного или иного канала — соответствующий специализированный процесс.

Если несколько признанных Payments фактически относятся к одному предметному Payment:

- ошибочные recognitions не сливаются посредством silent rewrite;
- определяется, существует ли одна уже признанная identity, которая достоверно соответствует предметному Payment;
- если да, она может быть сохранена, а дублирующие recognitions invalidated;
- если ни одна существующая identity не может предметно считаться корректным представлением Payment, ошибочные recognitions invalidated, а replacement Payment признаётся применимым owning process с новой identity.

Нельзя произвольно выбрать одну старую identity только ради технического удобства.

## 7. Invalidation recognition

Invalidation означает:

- первоначальное recognition сохраняется в истории;
- Payment больше не имеет действующего финансового эффекта как признанный Payment;
- source evidence не удаляется;
- зависимые финансовые результаты должны быть проверены;
- Refund не создаётся автоматически.

Invalidation не означает, что реальное банковское или иное source movement исчезло.

Например:

```text
Bank Transaction remains
Payment recognition becomes ineffective
```

## 8. Correction того же Payment

При сохранении Payment identity исправление должно позволять определить:

- первоначально признанные существенные характеристики;
- основание первоначального recognition;
- что именно признано ошибочным;
- правильные характеристики;
- основание correction;
- момент correction;
- authority;
- применимые source evidence и их версии/состояния.

Исторический Payment не редактируется так, чтобы первоначальная ошибка стала невидимой.

## 9. Исправление payer / стороны Payment

Фактический payer не обязан совпадать с обязанной стороной Financial Obligation.

Поэтому исправление payer Subject не означает автоматическую отмену Payment Allocation.

Пример:

```text
Bank movement = 1500
initial Payment recognition:
  payer = Owner

correction:
  payer = Owner's son

Allocation:
  1500 → Owner's obligation
```

Если после correction существует достаточное основание для cross-subject Allocation, Allocation может остаться эффективным.

Если основания больше нет, Allocation должен быть изменён соответствующим owning process.

## 10. Personal Account boundary

Personal Account является контекстом взаиморасчётов, но не обязательной identity-характеристикой Payment.

Если:

- payer определён правильно;
- movement определён правильно;
- Payment существует правильно;
- ошибочно выбран только Personal Account или target obligation,

то это, как правило, проблема matching/allocation, а не Payment Recognition Correction.

Если ошибочный Personal Account был лишь следствием неверно признанной стороны Payment, исправляется Payment, после чего зависимый matching/Allocation проходит revalidation.

## 11. Исправление amount / currency / direction / time

Исправление этих характеристик может сохранять Payment identity только если evidence подтверждает continuity того же предметного Payment.

Source correction может при этом сохранить либо изменить identity исходной Bank Transaction согласно `BP-FIN-BANK-001`; это само по себе не определяет Payment identity.

Тогда:

```text
same domain Payment
→ same Payment identity
→ corrected recognized characteristics
```

Если изменение показывает, что первоначальная Payment identity объединяла несколько самостоятельных Payments либо представляла другой предметный Payment, применяется модель §6.3.

Изменение суммы/валюты/direction/time требует revalidation зависимых финансовых результатов.

## 12. Duplicate Payment recognition

Если один реальный Payment признан дважды:

```text
real Payment X
→ Payment A
→ Payment B (duplicate)
```

две identities не объединяются молча.

При достаточном основании:

- identity, действительно соответствующая реальному Payment, сохраняется;
- duplicate recognition invalidated;
- зависимые результаты duplicate Payment revalidated/corrected;
- история обоих recognitions сохраняется.

Дата+сумма либо иное эвристическое совпадение не являются универсальным основанием считать Payments дубликатами.

## 13. Correction и Payment Allocation

Correction Payment не вызывает универсальный cascade delete/rewrite зависимых Allocation.

Каждый зависимый Allocation должен получить объяснимый disposition.

Возможны:

1. **Allocation остаётся эффективным без изменения** — например, исправлена сторона Payment, но cross-subject basis остаётся достаточным.
2. **Allocation требует Reallocation** — Payment остаётся корректным, но после correction его подтверждённое распределение должно измениться; применяется `BP-FIN-001`.
3. **Allocation теряет возможность иметь effective effect из-за invalidation Payment** — если самого Payment больше нет как эффективного признанного факта, зависимый Allocation не может продолжать использовать его сумму. История Allocation сохраняется; изменение его effective state является зависимым последствием Payment correction, а не Reallocation несуществующих средств.
4. **Requires Decision** — если автоматическое решение о зависимом результате недостаточно обосновано.

Настоящий BP не превращает эту координацию в универсальную Correction entity или универсальный cascade engine.

## 14. Correction и Initial Allocation

Если Payment identity сохраняется и после correction остаётся нераспределённая доступная сумма, её первое последующее распределение выполняется согласно `BP-FIN-ALLOCATION-001`.

Correction Payment не считается Initial Allocation.

## 15. Correction и Advance

Если Advance основан на Payment, correction требует revalidation его основания и доступной суммы.

Возможны:

- Advance остаётся корректным;
- его размер/назначение требует специализированного изменения;
- при invalidation Payment соответствующий Advance не может сохранять effective financial effect без иного самостоятельного основания.

История первоначального Advance не удаляется.

```text
Advance
≠ Payment Correction
```

## 16. Correction и Overpayment

Overpayment не является Payment Allocation и не является автоматическим результатом Payment correction.

Payment correction может изменить effective financial state так, что ранее признанное состояние Overpayment:

- сохранится;
- изменится;
- перестанет быть применимым;
- либо новое состояние Overpayment станет определимо согласно owning financial semantics.

Настоящий BP не вводит универсальный алгоритм перерасчёта Overpayment.

## 17. Correction и Financial Obligation

Payment correction:

- не создаёт Financial Obligation автоматически;
- не изменяет identity или основание Financial Obligation;
- может изменить состояние исполнения обязательства.

Например, если invalidated Payment ранее полностью исполнял Obligation, то после устранения его effective financial use Obligation может снова стать полностью или частично непогашенным.

Это изменение состояния исполнения не является созданием нового обязательства.

## 18. Correction и Debt

Debt является определимым состоянием непогашенной части обязательств.

Если Payment correction изменяет effective fulfillment, текущее Debt может измениться.

Историческое представление должно позволять объяснить:

- что задолженность считалась погашенной на основании первоначального recognition;
- когда и почему recognition Payment было исправлено;
- какое effective state возникло после correction.

Debt не исправляется отдельной фиктивной операцией только ради согласования баланса.

## 19. Correction и Refund

```text
Payment Recognition Correction
≠ Refund
```

Если реальный Payment действительно состоялся, но деньги следует вернуть:

- Payment остаётся корректным историческим фактом;
- создаётся отдельный Refund согласно `BP-FIN-003`.

Пример:

собственник действительно перечислил 1000 грн не тому сообществу либо ошибочно перечислил лишнюю сумму. Реальное движение было, поэтому Payment не invalidated только потому, что Community должна вернуть средства.

## 20. Correction и Bank Transaction

```text
Bank Transaction
≠ Payment
```

Payment correction не переписывает source content Bank Transaction.

Если:

```text
Bank Transaction → Payment
```

и позже Payment recognition invalidated, Bank Transaction продолжает существовать как банковский факт.

Если исходная Bank Transaction была исправлена банком, сначала применяется source correction semantics `BP-FIN-BANK-001`, а затем настоящий BP — только если Payment recognition стало некорректным.

## 21. Correction own-account transfer

Типовой сценарий:

```text
Bank Transaction
→ ошибочно recognized incoming Payment 10 000
```

Позже установлено, что это перевод между собственными Community Bank Accounts.

Результат:

- Bank Transactions сохраняются;
- own-account transfer classification сохраняет собственную банковскую семантику;
- Payment recognition invalidated;
- income/Expense/Obligation не создаются;
- Refund не создаётся;
- зависимые Allocation/Advance revalidated.

## 22. Ошибка только Allocation

Если Payment:

- существовал;
- имеет корректные стороны;
- имеет корректное направление;
- имеет корректную сумму/валюту/время;
- корректно признан как Payment,

а неверно только:

- выбрано обязательство;
- выбрана статья/назначение распределения;
- выбран Personal Account как allocation context;
- распределены неверные суммы,

настоящий BP не применяется как основной механизм исправления.

Используется `BP-FIN-001`.

## 23. Ошибочный Payment Intent matching

Payment Intent является input recognition/matching и не является Payment.

Если Payment признан корректно, но Intent ошибочно использован только для Allocation — применяется allocation/reallocation process.

Если неверный Intent привёл к неверному recognition самого Payment либо его стороны, применяется настоящий BP.

Intent не переписывается автоматически из-за correction Payment.

## 24. Зависимые финансовые факты

До подтверждения correction должна быть определима совокупность известных исторически значимых зависимых результатов, на которые correction может materially affect.

Это может включать:

- Payment Allocation;
- Advance;
- Overpayment state;
- состояние исполнения Financial Obligation;
- Debt;
- Expense linkage;
- Financing linkage;
- иные специализированные финансовые результаты.

Не требуется универсальный Dependency entity или полный глобальный dependency graph.

Owning contexts/processes сохраняют ответственность за собственную семантику.

## 25. Dependent disposition

Для каждого materially affected dependent result должно быть определимо одно из состояний:

- remains valid;
- requires specialized correction/reallocation/recalculation;
- loses effective basis because corrected Payment is invalidated;
- requires decision;
- not affected.

Такой disposition является процессной семантикой настоящего BP и не вводит универсальную domain entity `Dependent Disposition`.

## 26. Correction scope

Одно correction decision может относиться к одному Payment либо к согласованному набору recognitions, если они выражают одну ошибку recognition, например duplicate recognition или ошибочную cardinality.

Взаимозависимый correction scope должен быть предметно целостным.

Correction scope определяет, какие существующие recognitions исправляются совместно. Он не превращает настоящий BP в универсальный механизм recognition replacement Payments.

Если correction выявляет необходимость replacement Payment(s):

- старое ошибочное recognition может быть invalidated согласно настоящему BP;
- необходимость replacement recognition и его связь с correction должны быть объяснимы;
- replacement Payment(s) признаются применимым owning recognition process;
- состояние неизвестного или ещё не завершённого replacement recognition не маскируется сохранением заведомо ошибочного Payment как будто он корректен.

Не требуется универсальная all-or-nothing техническая транзакция между correction и всеми внешними/канальными recognition processes.

Настоящий BP не предписывает техническую транзакцию или locking mechanism.

## 27. Revalidation before confirmation

Перед подтверждением correction должны быть повторно проверены:

- source evidence;
- identity реального движения;
- текущая effective interpretation Payment;
- correction basis;
- authority;
- materially affected dependent facts;
- текущий effective financial use суммы.

Если значимые входы изменились, correction не подтверждается на устаревшем основании.

## 28. Authority

Correction признанного Payment является предметно значимым финансовым действием.

Для manual correction должно быть определимо применимое предметное полномочие согласно ADR-010.

Техническая роль доступа сама по себе не создаёт полномочие исправлять Payment.

Automatic correction допускается только если:

- applicable policy явно разрешает её;
- evidence однозначно;
- correction объяснима;
- dependent consequences могут быть безопасно определены.

Иначе используется Requires Decision.

## 29. Provenance

Для подтверждённой correction должны быть объяснимы, где применимо:

- Payment identity/identities;
- source evidence;
- исходное recognition;
- исходные значимые значения;
- corrected values либо факт invalidation;
- correction basis;
- причина сохранения либо замены Payment identity;
- причина cardinality change;
- actor/authority или automatic policy;
- момент correction;
- затронутые зависимые результаты;
- disposition каждого materially affected dependent result;
- новые Payment identities, если они возникли;
- связь с source correction, если она была;
- версия применимых правил, если correction вычислялась по правилу.

Provenance не требует универсальной Audit entity.

## 30. Временная семантика

Следует различать:

- фактическое время реального движения денежных средств;
- время первоначального Payment recognition;
- время получения corrected evidence;
- время correction decision;
- effective financial consequences correction.

Correction не изменяет молча факт того, что первоначальное recognition существовало в прошлом.

Если corrected interpretation относится к тому же историческому движению, фактическое время движения сохраняет собственный смысл.

Настоящий BP не вводит универсальное правило бухгалтерского backdating либо закрытия финансовых периодов.

## 31. Idempotency / repeated correction

Повторная доставка одного и того же correction command/evidence не должна создавать несколько эквивалентных исторически значимых corrections.

Если recognition уже invalidated по тому же основанию, повторное действие:

- не создаёт ещё одну invalidation только ради технического retry;
- либо фиксируется как техническая повторная обработка без нового предметного результата.

Если появляется новое основание или новые evidence, это может требовать нового предметного решения.

## 32. Основной сценарий: исправление стороны Payment

1. Payment признан.
2. Позже выявлено, что payer Subject определён неверно.
3. Source movement остаётся тем же.
4. Payment identity сохраняется.
5. Corrected payer фиксируется прослеживаемо.
6. Зависимые Allocation проходят revalidation.
7. Allocation, имеющий достаточный cross-subject basis, может остаться effective.
8. Требующие изменения Allocation передаются в `BP-FIN-001`.
9. Финансовая история сохраняет первоначальное recognition и correction.

## 33. Проверочные сценарии

### 33.1. Неверный payer, Allocation остаётся корректным

Bank Transaction = 1500 грн.

Первоначально:

```text
Payment #P1
payer = Owner
Allocation → Owner obligation 1500
```

Позже установлено:

```text
actual payer = Owner's son
```

Payment #P1 сохраняет identity.

Если существует достаточное основание оплаты обязательства Owner третьим лицом, Allocation остаётся effective.

### 33.2. Неверный payer, Allocation требует изменения

После correction payer выясняется, что исходное Allocation основывалось только на ошибочном предположении о стороне Payment.

Payment identity сохраняется, но Allocation больше не имеет достаточного основания.

Подтверждённое Allocation изменяется через `BP-FIN-001`.

### 33.3. Own-account transfer ошибочно признан Payment

```text
Bank Transaction 10 000
→ Payment #P2
```

После сопоставления второй стороны перевода установлено, что это own-account transfer.

```text
Payment #P2 recognition → invalidated
Bank Transaction remains
Refund → none
```

### 33.4. Duplicate recognition

Один bank movement породил:

```text
Payment #P3 = 1000
Payment #P4 = 1000
```

Evidence подтверждает один реальный Payment.

#P3 однозначно соответствует исходному recognition; #P4 является duplicate.

#P3 сохраняется, #P4 invalidated. Дублирующие зависимые финансовые эффекты #P4 revalidated/corrected.

### 33.5. Один Payment ошибочно объединяет несколько предметных Payments

Community OS признала:

```text
Payment #P5 = 3000
```

Позже evidence показывает, что предметно должны существовать три самостоятельных Payments по 1000.

```text
#P5 → invalidated

applicable recognition process:
  → new Payment #P6 = 1000
  → new Payment #P7 = 1000
  → new Payment #P8 = 1000
```

#P5 не переиспользуется как identity одного из replacement Payments без отдельного предметного основания. `BP-FIN-002` не создаёт #P6–#P8 самостоятельно, если их recognition принадлежит специализированному channel/source process.

### 33.6. Несколько recognitions относятся к одному Payment

Система признала #P9 и #P10, но evidence показывает один реальный Payment.

Если #P9 однозначно является корректным representation реального Payment, #P9 сохраняется, #P10 invalidated.

Если ни одна identity не может быть признана корректной без произвольного выбора, обе invalidated, а новый Payment #P11 признаётся применимым owning recognition process.

### 33.7. Source correction меняет amount

Bank Transaction первоначально содержала 1200, затем банк прислал достоверную correction: 1020, при этом external movement identity сохранилась.

Сначала обрабатывается Bank Transaction correction.

Если Payment соответствует тому же движению:

```text
same Payment identity
amount 1200 → corrected recognized amount 1020
```

Зависимые Allocation/Advance revalidated относительно новой доступной суммы.

### 33.8. Ошибочный Personal Account, Payment корректен

Payment payer, amount, direction и movement корректны.

Ошибка только в том, что 1000 грн распределили на Personal Account участка №10 вместо №11.

Это не Payment Recognition Correction.

Если Allocation уже подтверждён — применяется `BP-FIN-001`.

### 33.9. Реальный Payment требуется вернуть

Owner действительно перечислил Community 2000 грн, но затем установлено, что средства должны быть возвращены.

Payment остаётся valid.

```text
Payment correction → none
Refund process → required
```

### 33.10. Invalidation Payment с зависимым Allocation

Payment #P12 = 1000 был распределён на Water Obligation 1000 и полностью его исполнил.

Позже Payment #P12 invalidated как ошибочное recognition.

Allocation не удаляется из истории, но не может сохранять effective use несуществующего Payment.

Water Obligation снова имеет непогашенную часть 1000, если отсутствует иной действующий способ исполнения.

### 33.11. Invalidation Payment с Advance

Payment #P13 = 500 признан как Advance на будущую электроэнергию.

Позже установлено, что Payment #P13 был duplicate recognition.

Duplicate Payment invalidated; Advance revalidated и не может сохранять effective basis исключительно на invalidated Payment.

### 33.12. Automatic correction запрещена policy

Evidence однозначно показывает duplicate recognition, но local policy требует подтверждения уполномоченным участником для Payment correction.

System может сформировать correction proposal, но не подтверждает correction автоматически.

### 33.13. Correction во время параллельного Allocation

Payment #P14 проходит correction, одновременно другой процесс пытается подтвердить Initial Allocation.

Перед подтверждением оба процесса должны учитывать актуальный effective state Payment.

Нельзя получить состояние, в котором invalidated Payment одновременно получает новый effective Allocation.

Технический механизм concurrency настоящим BP не задаётся.

## 34. Инварианты

1. Payment Recognition Correction ≠ Payment Allocation.
2. Payment Recognition Correction ≠ Reallocation.
3. Payment Recognition Correction ≠ Refund.
4. Payment Recognition Correction ≠ Bank Transaction correction.
5. Payment Recognition Correction ≠ universal Financial Correction.
6. Source correction precedes Payment correction where the source fact itself is wrong.
7. Same domain Payment with corrected interpretation preserves Payment identity where evidence supports continuity; source identity/cardinality does not define Payment identity/cardinality.
8. Recognition of a non-existent Payment is invalidated, not silently deleted.
9. Wrong cardinality may require invalidating old identity and recognition of replacement Payment identities by the applicable owning recognition process.
10. Duplicate Payment identities are not silently merged.
11. Identity is not preserved merely for implementation convenience.
12. Original recognition remains historically explainable.
13. Invalidation does not erase source movement.
14. Invalidation does not create Refund.
15. A real Payment that must be returned remains a Payment; Refund is a separate movement.
16. Incorrect Personal Account alone does not necessarily mean incorrect Payment recognition.
17. Actual payer may differ from obligated party.
18. Correcting payer does not automatically invalidate Payment Allocation.
19. Dependent Allocation must be revalidated after materially significant Payment correction.
20. Confirmed Allocation that must change while Payment remains valid uses BP-FIN-001.
21. Allocation cannot retain effective use of a Payment whose recognition is invalidated.
22. Payment correction does not create or rewrite Financial Obligation.
23. Payment correction may change effective fulfillment and therefore Debt.
24. Advance based on corrected Payment must be revalidated.
25. Overpayment is not an automatic result of Payment correction.
26. No universal cascade rewrite is introduced.
27. No universal dependency entity is introduced.
28. Correction scope must be internally consistent.
29. Revalidation precedes confirmation when significant inputs may have changed.
30. Manual correction requires attributable domain authority.
31. Automatic correction requires explicit policy and sufficiently reliable evidence.
32. Correction provenance explains why identity was preserved, invalidated or replaced.
33. Correction time ≠ original movement time.
34. Historical recognition is not silently backdated away.
35. Technical retry ≠ new domain correction.

## 35. Что намеренно не решается

Настоящий BP не определяет:

- Refund workflow;
- bank API/source correction mechanics beyond boundary with BP-FIN-BANK-001;
- cash document correction workflow;
- universal Payment Recognition workflow for all channels;
- universal Financial Correction entity;
- universal dependency graph;
- accounting reversals/storno;
- BAS/BAF postings;
- tax/accounting period closing;
- multi-currency conversion;
- chargeback/dispute;
- fraud investigation;
- legal dispute resolution;
- technical database transaction/locking mechanism.

## 36. Связанные документы

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
- REFERENCE_CANDIDATE_MATRIX.

## 37. Нормативные последствия

Предварительно новый ADR и новая фундаментальная сущность не требуются.

Настоящий BP использует уже существующие:

- Payment;
- Bank Transaction;
- Payment Allocation;
- Financial Obligation;
- Advance;
- Overpayment;
- Debt;
- provenance/authority/history semantics.

Специализированное исправление Payment recognition является бизнес-процессом финансового контекста и не вводит универсальную сущность `Correction`.

После review необходимо проверить, требуется ли только точечная синхронизация DOMAIN_MODEL/TERMINOLOGY по identity/invalidation semantics Payment.

## 38. Открытые вопросы для review

Перед принятием Draft следует независимо проверить:

1. достаточно ли правила continuity «same domain Payment → preserve identity» без привязки identity к source cardinality;
2. достаточно ли process-level invalidation semantics без отдельного фундаментального Payment Status;
3. корректна ли граница между dependent consequence of invalidated Payment и Reallocation;
4. достаточно ли границы, при которой replacement Payment recognition остаётся в owning channel/source process и не превращает BP-FIN-002 в universal recognition workflow;
5. нужен ли отдельный специализированный термин для correction action либо название BP достаточно без новой сущности;
6. достаточно ли provenance/disposition для зависимых Advance/Overpayment/Expense links без universal dependency model;
7. не требуется ли дополнительная нормативная синхронизация ADR-006 для duplicate/wrong-cardinality Payment recognition.

## 39. Следующий шаг

1. внутренний review против ADR-004/005/006/010/011, DOMAIN_MODEL, TERMINOLOGY, BP-FIN-001, BP-FIN-ALLOCATION-001 и BP-FIN-BANK-001;
2. проверка на реальных сценариях пилотного СТ;
3. независимый review Claude;
4. point fixes;
5. нормативная синхронизация и закрытие REF-FIN-004;
6. переход к BP-FIN-003 — Refund.
