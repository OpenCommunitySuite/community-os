# BP-FIN-004 — Разовое и внецикловое начисление

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет первичное разовое или внецикловое начисление в пользу Community, когда финансовый результат должен быть установлен вне обычного регулярного расчётного цикла.

Ключевая модель:

```text
subject/business basis
+ applicable rule or explicit used value
+ resolved target scope
→ Accrual
→ Financial Obligation(s), where applicable
```

Разовый или внецикловый характер является способом инициирования и временной характеристикой процесса, а не отдельным фундаментальным типом `Accrual`.

## 2. Основная граница

```text
One-off / Out-of-cycle Accrual
≠ Accrual Correction
≠ Recalculation
≠ Cancellation
≠ negative accrual / storno
≠ Payment
≠ Payment Intent
≠ Expense
≠ Supplier Obligation automatically
```

Настоящий BP создаёт первичный исторически значимый Accrual там, где такого результата ещё не существовало.

Если ранее уже существовал Accrual и требуется изменить его сумму, основание, значимые входы или финансовые последствия, применяется будущий `BP-FIN-005`.

## 3. Что означает one-off / out-of-cycle

**Разовое начисление** — Accrual, инициируемый по отдельному предметному основанию и не предполагающий сам по себе периодического повторения.

**Внецикловое начисление** — Accrual, выполняемый вне обычного автоматического/регулярного момента расчёта, но при этом он может использовать то же правило, тариф или периодическую семантику, что и обычный расчёт.

```text
one-off / out-of-cycle
≠ separate Accrual entity
≠ correction
≠ exception to obligation semantics
```

Примеры:

- разовый целевой взнос;
- дополнительный взнос по отдельному решению;
- начисление конкретному лицевому счёту на произвольную предметно допустимую дату;
- начисление выбранной группе участков/лицевых счетов;
- внеочередное начисление по ресурсу при достаточных входных данных;
- первое позднее признание пропущенного начисления, если исторического Accrual ранее не существовало.

## 4. Scope первого процесса

Настоящий BP специализирует начисления, результатом которых является либо может стать Financial Obligation стороны перед Community.

Это соответствует первому внедрению СТ:

- членские взносы;
- целевые взносы;
- электроэнергия;
- вода;
- допустимая компенсационная составляющая;
- иные разовые требования к участнику/собственнику/иной обязанной стороне на установленном основании.

Общая сущность `Accrual` при этом не становится входящей-only сущностью.

Обязательства Community перед поставщиками и другими сторонами остаются частью общей финансовой модели, но не являются предметом настоящего BP только ради формальной симметрии.

## 5. Предусловия

Процесс начинается, когда:

1. существует предметно достаточное основание определить новый финансовый результат;
2. определимы либо могут быть разрешены стороны будущего Financial Obligation;
3. определимы правила, использованные значения или явная сумма согласно основанию;
4. определима денежная единица;
5. определим применимый target scope;
6. существует предметное полномочие выполнить/подтвердить начисление.

Process может завершиться:

- подтверждённым Accrual и одним/несколькими Financial Obligations;
- подтверждённым Accrual с иным допустимым финансовым результатом, если это следует из применимой семантики;
- результатом zero/no obligation where applicable;
- Requires Decision;
- отказом в подтверждении из-за недостаточного основания, неразрешённой стороны, конфликтующих данных или изменившихся входов.

## 6. Основание начисления

Accrual требует предметного основания.

Основанием могут быть, например:

- решение общего собрания;
- решение иного компетентного органа;
- правило Community;
- действующее членское/финансовое отношение;
- договорное основание;
- признанное потребление ресурса;
- применимое правило компенсации/распределения;
- иной предметно допустимый факт или решение.

Само действие пользователя:

```text
operator entered amount
≠ accrual basis
```

Техническая возможность создать начисление не является основанием финансового требования.

## 7. Accrual ≠ Financial Obligation

Сохраняется нормативное различие:

```text
Accrual
≠ Financial Obligation
```

Accrual является исторически значимым действием определения суммы/финансового результата.

Financial Obligation является предметно определённым требованием одной стороны к другой.

Accrual может:

- создать одно Financial Obligation;
- участвовать в создании нескольких Financial Obligations;
- не создавать obligation при нулевом либо ином допустимом результате;
- иметь другой допустимый финансовый результат согласно специализированной семантике.

Универсальная кардинальность `1 Accrual = 1 Financial Obligation` не вводится.

## 8. Стороны Financial Obligation

Для создаваемого Financial Obligation должны быть определимы:

- обязанная сторона;
- управомоченная сторона;
- amount/currency;
- basis;
- due date, если он применим.

В настоящем BP управомоченной стороной обычно является Community.

Обязанная сторона не выводится автоматически из:

- Personal Account;
- номера участка;
- Object;
- текущего пользователя;
- плательщика предыдущего Payment;
- владельца на момент технического запуска процесса.

Ответственная сторона определяется применимым предметным основанием и исторически значимым состоянием отношений.

## 9. Personal Account

Personal Account является контекстом и группировкой взаиморасчётов.

```text
Personal Account
≠ debtor Subject
≠ Financial Obligation
≠ Accrual
```

Для первого внедрения СТ модель `Plot → Personal Account` может использоваться для target selection и отображения начисления.

Но наличие Personal Account само по себе не создаёт обязанности собственника, пользователя, арендатора или иного Subject.

Обязанная сторона должна быть определена отдельно согласно applicable rule/basis.

## 10. Object / Plot как target

Object, Plot либо другой объект собственности может участвовать в определении target scope и расчётного основания.

Например:

```text
all active plots
× fixed contribution 500
```

не означает:

```text
Plot becomes debtor
```

Объект может быть основанием выбора и расчёта, но Financial Obligation имеет предметные стороны.

Для участка с несколькими собственниками ответственность за финансовое обязательство не выводится автоматически из правила голосования `1 участок = 1 голос`.

## 11. Target Scope

One-off Accrual может относиться:

- к одному Subject;
- к одному Personal Account;
- к одному Object;
- к явно выбранному набору;
- к группе, определяемой критериями;
- к результату специализированного расчётного процесса.

Target scope является семантикой процесса и не вводит новую fundamental entity.

Для исторически значимого группового начисления должны быть объяснимы:

- критерии отбора;
- момент/период применимости критериев;
- фактически разрешённый набор target cases;
- исключённые/неразрешённые cases и причины, если это существенно;
- для каждого target case — как определена обязанная сторона.

## 12. Resolved target set

Если target scope определяется динамическим критерием, например:

- все действующие участки;
- все члены Community;
- все участки улицы;
- все Personal Accounts с определённым свойством,

исторический Accrual не должен зависеть от того, как эта группа выглядит сегодня.

Перед подтверждением должен быть разрешён фактический набор target cases, использованный для результата.

Изменение собственности, членства, группировки, улицы, Personal Account или иного критерия позднее не переписывает confirmed Accrual.

```text
selection rule
+ historical context
→ resolved target set
```

Resolved target set является частью process provenance, а не обязательной новой domain entity.

## 13. Group Accrual ≠ joint obligation

Массовое начисление по общему решению не означает, что возникает одно общее Financial Obligation на всю группу.

Например:

```text
100 plots × 500 UAH
```

обычно означает набор объяснимых обязательств соответствующих сторон, а не одно обязательство «группы участков» на 50 000.

Совместное/солидарное обязательство допускается только если существует отдельное предметное основание, а не как следствие batch processing.

## 14. Accrual Proposal / Preview

До подтверждения система может формировать расчётное предложение/preview:

- targets;
- стороны;
- суммы;
- статьи;
- rules/versions;
- due dates;
- warnings/errors;
- aggregate totals.

Такой preview:

```text
Accrual Proposal
≠ confirmed Accrual
≠ Financial Obligation
```

Он не имеет финансового эффекта и может быть изменён/пересчитан до подтверждения.

Настоящий BP не вводит фундаментальную entity `Accrual Proposal`.

## 15. Способы определения суммы

One-off Accrual может использовать, где это предметно допустимо:

- фиксированную сумму;
- ставку на один Object/Plot;
- площадь;
- количество;
- признанное потребление;
- тариф;
- составное правило;
- распределённую величину;
- явно установленную сумму решения;
- комбинацию входных данных.

Способ вычисления не определяет identity Accrual автоматически.

## 16. Explicit fixed amount

Разовый Accrual не обязан иметь `Tariff`, если предметное основание непосредственно устанавливает сумму.

Например:

```text
General Meeting Decision:
target contribution = 1000 UAH per eligible plot
```

В таком случае 1000 UAH является исторически использованным значением согласно основанию.

```text
fixed amount
≠ automatically Tariff
```

Оператор не может подменить предметное основание произвольным вводом суммы.

## 17. Tariff / Rule / Used Value

Если Accrual использует rule/tariff:

- должна быть определима применимая версия либо фактически использованное значение;
- должны быть определимы significant inputs;
- позднее изменение rule/tariff не переписывает historical Accrual;
- latest/current version не применяется к прошлому автоматически.

Если тариф сам является versioned rule, применяются ADR-005 semantics.

External supplier tariff не становится internal Community tariff автоматически.

## 18. Accrual Article

Accrual Article классифицирует назначение начисления.

```text
Accrual Article
≠ accrual basis
≠ rule
≠ tariff
≠ Financial Obligation
```

Выбор статьи `Electricity`, `Water`, `Membership Fee` или `Target Contribution` сам по себе не создаёт право начислить сумму.

После confirmation изменение historically significant classification не выполняется silent edit; специализированное исправление относится к BP-FIN-005 либо другому owning process.

## 19. Resource data boundary

Показание, Consumption, Resource Imbalance или Loss не являются Accrual автоматически.

```text
resource fact
→ possible input/basis
→ financial rule
→ Accrual
```

Настоящий BP может использовать уже признанные ресурсные результаты как inputs, но:

- не признаёт показания;
- не рассчитывает инженерный небаланс;
- не признаёт эксплуатационную потерю;
- не превращает любой небаланс в обязанность собственника.

## 20. Пеня

Пеня имеет собственную специализированную семантику согласно ADR-006.

Если applicable penalty rule приводит к первичному внецикловому предъявлению суммы, настоящий BP может координировать создание Accrual/Obligation только после определения результата специализированным penalty rule.

Настоящий BP не задаёт:

- ставку;
- базу;
- периоды;
- rounding;
- ограничения;
- влияние partial payments.

Ручное произвольное начисление «пени» без применимого правила недопустимо.

## 21. Amount и Currency

Для финансового результата должна быть определима денежная сумма и денежная единица.

Настоящий BP не определяет multi-currency conversion.

Если rule/decision даёт сумму в одной валюте, а obligation должно возникнуть в другой, требуется отдельная применимая финансовая семантика; implicit conversion запрещена.

## 22. Zero result

Расчёт может дать 0.

```text
calculation result = 0
```

не требует искусственно создавать Financial Obligation amount 0 только ради записи в истории.

Если сам факт применения rule к target исторически значим, может сохраняться объяснимый result/no-obligation outcome согласно process provenance.

Zero result не считается Cancellation и не исправляет другие Accrual.

## 23. Negative amount

Настоящий BP не использует negative Accrual как универсальный способ уменьшить, отменить или сторнировать ранее созданный финансовый результат.

```text
negative accrual used to reverse old accrual
→ outside BP-FIN-004
→ BP-FIN-005 / specialized process
```

Если отдельная предметная модель когда-либо требует самостоятельного отрицательного финансового результата, это должно быть рассмотрено на собственном основании, а не вводиться как обход correction/recalculation semantics.

## 24. Period

One-off Accrual может:

- иметь Accrual Period;
- не иметь периода, если семантика основания не требует его;
- относиться к прошлому, текущему или будущему периоду только если это допускает basis/rule.

Accrual Period не тождествен:

- calculation time;
- confirmation time;
- obligation inception;
- due date;
- rule applicability period;
- tariff applicability period.

## 25. Arbitrary date ≠ arbitrary history

Возможность выполнить Accrual на произвольную дату не означает право произвольно backdate финансовую историю.

Следует различать:

- business-effective date/basis;
- accrual period;
- calculation moment;
- confirmation/recording moment;
- obligation inception;
- due date.

Technical timestamp не подменяет предметное время.

## 26. Late initial recognition

Если Financial Obligation предметно должно было возникнуть ранее, но Accrual в Community OS вообще не был зафиксирован, поздняя первая фиксация может оставаться Initial Accrual.

Например:

```text
rule applicable in August
scheduler/import failed
no historical Accrual exists
first correct recognition in September
→ late initial Accrual
```

При этом сохраняются:

- фактический момент поздней фиксации;
- исторический basis;
- applicable historical rule/tariff;
- intended/effective period or obligation inception where determinable;
- reason for late recognition, if materially significant.

Late initial recognition не переписывает system history так, будто техническая фиксация произошла в прошлом.

Если historical Accrual уже существовал и теперь пересчитывается — это BP-FIN-005.

## 27. Due Date

Due Date относится к Financial Obligation и не выводится автоматически из даты Accrual.

Он может определяться:

- rule;
- decision;
- contract;
- category-specific policy;
- other sufficient basis.

Если due date предметно неприменим, универсальное фиктивное значение не создаётся.

Изменение due date уже существующего obligation после confirmation является отдельным historically significant change и не выполняется silent edit.

## 28. Regular cycle overlap

One-off/out-of-cycle Accrual не подавляет и не заменяет regular Accrual автоматически.

Возможны разные случаи:

- one-off дополняет regular charge;
- one-off заменяет ещё не созданный scheduled charge по explicit policy;
- missed scheduled charge фиксируется late initial;
- one-off относится к другому basis/article;
- два результата являются ошибочным duplicate.

Никакое из этих отношений не выводится только из совпадения:

- Personal Account;
- period;
- article;
- amount;
- date.

Если one-off должен suppress/replace planned regular run, это должно следовать из применимой process/rule semantics.

## 29. Duplicate / idempotency

Повторный technical retry одного и того же one-off decision/input не должен создавать повторное Financial Obligation.

Но совпадение:

```text
same date + amount + article + Personal Account
```

не доказывает duplicate автоматически.

Для исторически значимого решения должны быть определимы sufficient identity/provenance criteria согласно process semantics.

Следует различать:

- retry/redelivery;
- second legitimate one-off Accrual;
- duplicate confirmed Accrual;
- late initial Accrual;
- recalculation/correction.

Confirmed duplicate исправляется BP-FIN-005, а не физическим удалением.

## 30. Existing Payment / Advance / Unallocated Remainder

Создание нового Financial Obligation не переписывает существующие Payments автоматически.

```text
new Accrual / new Obligation
≠ automatic Payment Allocation
```

Если ранее существуют:

- Advance;
- Unallocated Remainder;
- Overpayment;
- Payment Intent;
- иной available financial amount,

новый obligation может изменить возможность их последующего применения, но не связывает их с obligation сам по себе.

Фактическое применение средств выполняется соответствующим Payment Allocation/Reallocation/Advance process согласно применимой семантике.

## 31. Debt / Overdue

После подтверждения Financial Obligation его непогашенная часть участвует в обычной семантике Debt.

```text
Accrual
→ Financial Obligation
→ unpaid part
→ Debt
```

Overdue возникает только после applicable due date.

Accrual не создаёт отдельную сущность Debt и не требует ручного обновления «баланса» как источника истины.

## 32. Overpayment

Новое Financial Obligation само по себе не должно молча «поглотить» historical Overpayment без применимого финансового процесса.

Если существующая Overpayment может быть применена к новому obligation, это выполняется согласно owning semantics с сохранением provenance.

Создание Accrual не является Refund, Reallocation или Payment Allocation.

## 33. Expense / Budget / Funding

Начисление стороне в пользу Community не является автоматически:

- Expense Community;
- Supplier Obligation;
- Budget Item;
- Funding Source;
- Expense Financing.

Целевой взнос может иметь связь со сметой, направлением использования или иным управленческим контекстом, но эта связь должна быть предметно определена.

```text
Accrual Article
≠ Budget Item automatically
```

## 34. Payment Intent / recommended payment

Payment Intent может описывать предполагаемую будущую сумму/назначение, но:

```text
Payment Intent
≠ Accrual
≠ Financial Obligation
```

Рекомендуемая сумма к добровольной оплате не становится обязательным начислением только из-за отображения пользователю либо создания QR/payment link.

Если Community намерено создать обязательное требование, должен существовать accrual/obligation basis.

## 35. Preparation and confirmation

До confirmation подготовленные значения могут быть исправлены без BP-FIN-005, поскольку historically significant Accrual ещё не возник.

Перед confirmation revalidate, where applicable:

- basis;
- applicable rule/version;
- used tariff/value;
- target criteria;
- resolved target set;
- liable parties;
- amount/currency;
- period;
- due date;
- source inputs;
- authority.

Если significant inputs изменились, нельзя подтверждать stale proposal.

## 36. Confirmation scope для группы

Group one-off Accrual может состоять из target cases, объединённых общим basis/rule.

Не вводится универсальное правило «одна ошибка target блокирует всю группу» или «всегда подтверждать валидный subset».

Следует различать:

1. **interdependent scope** — предметное решение требует согласованного полного набора targets/results;
2. **independent target cases** — каждый result может быть подтверждён отдельно согласно policy.

Если общий decision/rule требует начислить всем resolved eligible targets, тихо пропустить invalid target нельзя.

Допустимые варианты:

- resolve missing data and revalidate;
- Requires Decision;
- explicit change of scope on sufficient basis;
- independent partial confirmation only if process semantics actually allow it.

Confirmation scope является process semantics, а не новой domain entity.

## 37. Missing liable party

Если target выбран, но обязанная сторона не может быть предметно определена:

- fake `Unknown Debtor` не создаётся;
- current user/owner/payment payer не подставляется эвристически;
- Financial Obligation не подтверждается на недостоверной стороне;
- case остаётся unresolved/Requires Decision либо исключается только на explicit valid basis.

Это особенно важно при:

- смене собственника;
- нескольких собственниках;
- спорном членстве;
- аренде/пользовании;
- historical accrual for past period.

## 38. Ownership/member changes

Для определения обязанной стороны используется historical context, относящийся к accrual basis/period according to applicable rule.

Текущий собственник не наследует автоматически obligation предыдущего собственника.

Смена собственника после confirmed Accrual не переписывает debtor Subject.

Если applicable rule связывает обязанность с членством, ownership не заменяет membership автоматически.

## 39. Authority

One-off Accrual является финансово значимым действием.

Domain authority требуется, где применимо, чтобы:

- инициировать/подтвердить разовый Accrual;
- определить/изменить target scope;
- подтвердить explicit fixed amount;
- применить discretionary rule/value;
- подтвердить due date;
- исключить target из группы;
- выполнить late initial recognition.

Technical role/access right само по себе не создаёт полномочие.

Automatic confirmation допускается только по explicit policy, sufficiently determined inputs и explainable result.

Иначе используется Requires Decision.

## 40. Provenance

Для confirmed Accrual должны быть объяснимы, где применимо:

- accrual basis;
- initiating decision/fact;
- target selection criteria;
- resolved target set;
- liable parties and how they were resolved;
- Personal Account/Object context;
- article;
- period;
- calculation/confirmation time;
- obligation inception;
- due date;
- amount/currency;
- rule and version;
- tariff/used values;
- source resource/other inputs;
- authority/automatic policy;
- created Financial Obligations;
- zero/no-obligation results when material;
- reason for late initial recognition;
- relation to regular cycle where applicable.

Provenance не требует universal Audit entity или universal Accrual Batch entity.

## 41. Concurrent changes

Перед confirmation Accrual должен учитывать current applicable state:

- owner/member relation may have changed;
- target group may have changed;
- rule/tariff may have changed;
- another one-off Accrual may already be confirmed;
- regular run may have completed;
- source data may have been corrected.

Предметный инвариант:

```text
confirmation must not rely on stale materially significant inputs
```

Technical locking mechanism настоящим BP не задаётся.

## 42. Ошибка до confirmation

До исторически значимого confirmation:

- proposal may be edited;
- target scope may be recalculated;
- amount may be recomputed;
- warnings may be resolved;
- operation may be abandoned.

Это не Correction/Recalculation confirmed Accrual.

## 43. Ошибка после confirmation

После confirmation Accrual не редактируется/удаляется молча.

Если требуется:

- отменить;
- исправить;
- изменить сумму;
- применить новый rule/tariff к уже существующему результату;
- пересчитать;
- исправить target/liable party;
- исправить article/period where historically significant;
- изменить последствия для уже оплаченных obligations,

используется `BP-FIN-005` либо специализированный owning process.

## 44. Основной сценарий: разовый целевой взнос

1. Competent body принимает допустимое решение о целевом взносе.
2. Decision задаёт 1000 UAH на каждый eligible Plot.
3. Rule определяет eligibility и liable party.
4. System resolves target set на applicable historical context.
5. Для каждого target case определяются debtor Subject и Personal Account context.
6. Формируется preview.
7. Перед confirmation revalidate basis, targets, parties, amount and authority.
8. Confirmed Accrual создаёт соответствующие Financial Obligations.
9. Obligations имеют due date согласно decision/rule, если applicable.
10. Subsequent Payments/Advances не применяются автоматически.
11. Historical target set и used values сохраняются.

## 45. Проверочные сценарии

### 45.1. Один Personal Account, фиксированная сумма

Допустимое решение:

```text
Personal Account context = PA-10
liable Subject = Owner A
fixed amount = 750 UAH
article = Target Contribution
```

Accrual создаёт Financial Obligation Owner A → Community 750.

PA-10 является контекстом, не debtor identity.

### 45.2. Разовое начисление всем eligible plots

Decision:

```text
500 UAH per eligible plot
```

Resolved target set на момент применения содержит 320 plots.

Для каждого case определяется liable Subject.

Если 318 cases valid, а у 2 невозможно определить liable party, system не создаёт fake debtor и не может тихо считать их начисленными. Дальнейший outcome зависит от confirmation scope/policy.

### 45.3. Несколько собственников одного участка

Plot входит в target scope.

Ownership = Owner A 50% + Owner B 50%.

Rule не определяет финансовую ответственность.

Правило голосования `1 plot = 1 vote` не используется как финансовое правило.

```text
liable party unresolved
→ Requires Decision
```

### 45.4. Площадь как input

Decision устанавливает:

```text
10 UAH × historical eligible area
```

Для Plot исторически applicable area = 600 m².

```text
Accrual = 6000 UAH
```

Позднее изменение площади не переписывает confirmed Accrual.

### 45.5. Resource-based out-of-cycle Accrual

Признанное Consumption = 120 kWh.

Applicable internal price = 5 UAH/kWh.

```text
Consumption
+ financial rule
→ Accrual 600 UAH
→ Obligation
```

Consumption остаётся resource fact и не становится Accrual.

### 45.6. Explicit amount without Tariff

General Meeting Decision прямо устанавливает:

```text
target contribution = 1500 UAH per eligible plot
```

Не создаётся искусственный Tariff только ради реализации.

1500 UAH сохраняется как used value/basis context.

### 45.7. Historical missed Accrual

August regular rule должен был создать 300 UAH obligation, но scheduler failed, и Accrual вообще не существовал.

В September найден пропуск.

Используются historical August rule/version and inputs.

```text
first recognition in September
effective August context
→ late initial Accrual
```

System не притворяется, что техническое confirmation произошло в August.

### 45.8. Existing historical Accrual already exists

August Accrual = 300 уже подтверждён.

В September оператор считает, что должно быть 350.

Создание нового `one-off +50` только ради исправления запрещено как универсальный shortcut.

```text
existing Accrual correction/recalculation
→ BP-FIN-005
```

### 45.9. Duplicate technical retry

One-off Decision D-100 уже подтверждён.

Повторный technical command с тем же предметным identity/provenance не создаёт второй Accrual.

Но другое legitimate decision на ту же сумму/дату может быть отдельным Accrual.

### 45.10. One-off и regular charge в одном периоде

Regular membership Accrual = 500.

Separate target contribution Decision = 1000.

Совпадение period/PA не делает 1000 duplicate и не отменяет 500.

### 45.11. One-off intended to replace scheduled charge

Policy прямо устанавливает, что special out-of-cycle calculation replaces 아직 not-created scheduled charge for September.

Out-of-cycle Accrual может быть confirmed.

Scheduled process должен учитывать explicit suppression/replacement semantics; duplicate suppression не выводится из суммы/статьи эвристически.

### 45.12. Zero result

Rule применяется к target, но result = 0.

No zero-amount Financial Obligation создаётся только ради технической записи.

Если факт расчёта важен, provenance может сохранить zero/no-obligation outcome.

### 45.13. Negative correction attempt

Operator пытается создать one-off Accrual = -500 для отмены ошибочного historical Accrual +500.

```text
reject as BP-FIN-004 correction shortcut
→ BP-FIN-005
```

### 45.14. Current owner differs from historical liable party

Accrual относится к historical period, когда Owner A был liable party.

Сегодня Plot принадлежит Owner B.

Если applicable rule не переносит obligation:

```text
debtor = Owner A
not Owner B
```

Technical current ownership не переписывает historical liability.

### 45.15. Existing Advance

Owner имеет Advance 1000 на future electricity.

Создаётся electricity Obligation 700.

Сам Accrual не создаёт автоматически Payment Allocation.

Применение Advance выполняется owning financial process according to advance purpose/rule.

### 45.16. Unallocated Payment exists before Accrual

Unallocated Payment = 500.

Создаётся new Obligation = 500.

```text
new Obligation
≠ automatic allocation of existing Payment
```

Initial Payment Allocation требуется отдельно.

### 45.17. Recommended payment

UI показывает рекомендованную сумму 1000 и QR.

Если obligation/basis отсутствуют:

```text
Payment Intent / recommendation
≠ Accrual
```

### 45.18. Selected group by street

Decision = 800 UAH for plots belonging to infrastructure project on Street A.

Selection criteria historically resolve 42 plots.

Later street grouping changes.

Confirmed Accrual сохраняет resolved 42 target cases и не пересчитывается динамически.

### 45.19. Group scope with invalid target

Common decision requires charge to every eligible plot.

One target lacks determinable liable party.

System cannot silently confirm 99 of 100 and mark decision complete if process semantics require complete scope.

Requires Decision / explicit scope resolution.

### 45.20. Liability based on membership rather than ownership

Decision imposes contribution on Community members.

Plot Owner A is not Member; User B has access; Member C has applicable membership relation.

Debtor определяется membership rule, not ownership/access.

### 45.21. Due date differs from Accrual date

Accrual confirmation = 10 September.

Decision sets due date = 1 October.

```text
Accrual date ≠ due date
```

Debt exists after obligation inception; overdue only after applicable due date.

### 45.22. Penalty result

Specialized penalty rule calculates 120 UAH based on overdue obligation.

BP-FIN-004 may confirm resulting Accrual/Obligation if this is the first recognition of that penalty result.

Operator cannot manually type 120 as «penalty» without rule/basis.

### 45.23. One group action creates different amounts

Decision uses 10 UAH/m².

Plots have historical areas 400, 600, 800 m².

One group confirmation scope may produce obligations 4000, 6000, 8000 with common basis but target-specific inputs/results.

No universal one-amount-per-batch rule exists.

### 45.24. Rule changed after preview

Preview generated under Rule v3.

Before confirmation Rule v4 becomes applicable to the target period according to domain policy.

System revalidates applicable version.

It does not confirm stale v3 merely because preview already existed.

### 45.25. Rule changed today but v3 remains historically applicable

Preview for historical August uses v3.

v4 is current in September but policy says v3 remains applicable to August.

Revalidation preserves v3.

```text
current/latest rule
≠ automatically applicable historical rule
```

## 46. Инварианты

1. One-off/out-of-cycle is process initiation/timing semantics, not a new fundamental Accrual type.
2. BP-FIN-004 creates initial Accrual; it does not correct/recalculate/cancel an existing confirmed Accrual.
3. Negative Accrual is not a universal correction/storno mechanism.
4. Accrual ≠ Financial Obligation.
5. Accrual may create one or multiple Financial Obligations according to applicable semantics.
6. Personal Account ≠ debtor Subject.
7. Object/Plot ≠ debtor Subject.
8. Voting rule does not define financial liability automatically.
9. Liable party must be determined from applicable business basis/rule.
10. Fake Unknown Debtor is not created.
11. Group selection criteria and resolved target set remain historically explainable.
12. Later group/ownership/membership changes do not silently rewrite confirmed Accrual.
13. Group Accrual does not imply one joint group obligation.
14. Accrual Proposal/Preview ≠ confirmed Accrual.
15. Explicit fixed amount may be valid without artificial Tariff when basis directly defines it.
16. Operator-entered amount alone is not sufficient accrual basis.
17. Tariff ≠ full Accrual Rule.
18. Accrual Article ≠ basis/rule/tariff/obligation.
19. Resource fact ≠ Accrual.
20. Penalty requires specialized applicable rule; arbitrary manual penalty is not allowed.
21. Amount requires currency; implicit conversion is not defined.
22. Zero calculation does not require a fake zero Financial Obligation.
23. Period/date semantics remain distinct.
24. Arbitrary accrual date ≠ arbitrary backdating.
25. Late first recognition can remain Initial Accrual when no historical Accrual existed.
26. Existing historical Accrual requiring change belongs to BP-FIN-005.
27. Due Date ≠ Accrual date.
28. One-off Accrual does not replace/suppress regular Accrual without explicit semantics.
29. Equal date/amount/article/account does not prove duplicate.
30. Technical retry ≠ new Accrual.
31. New Accrual/Obligation does not automatically allocate existing Payment/Advance/Unallocated Remainder.
32. Accrual does not automatically create Expense, Supplier Obligation, Budget Item or Funding Source.
33. Payment Intent/recommended payment ≠ Accrual.
34. Confirmation requires revalidation of materially significant inputs.
35. Interdependent target scope is not silently partially confirmed.
36. Independent target cases may be confirmed separately only when applicable semantics allow it.
37. Technical access right ≠ domain authority.
38. Confirmed Accrual is not silently edited/deleted.
39. Correction/recalculation/cancellation after confirmation belongs to BP-FIN-005 or specialized owning process.
40. No universal Accrual Batch, Accrual Proposal, Correction or Storno entity is introduced.

## 47. Что намеренно не решается

Настоящий BP не определяет:

- regular scheduled accrual workflow;
- calculation scheduler;
- BP-FIN-005 correction/recalculation/cancellation;
- resource reading recognition;
- consumption calculation;
- imbalance/loss recognition;
- universal loss distribution formula;
- penalty formula;
- payment recognition;
- Payment Allocation/Reallocation algorithms;
- Advance application process;
- Refund;
- Expense/Supplier Obligation registration;
- Budget approval;
- Funding/Financing;
- tax/accounting postings;
- BAS/BAF document generation;
- multi-currency conversion;
- UI design;
- database transactions/locking;
- universal Accrual Batch entity.

## 48. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-010;
- ADR-011;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-003-REFUND.md`;
- REFERENCE_CANDIDATE_MATRIX;
- OSBBX_REFERENCE_ANALYSIS.

## 49. Нормативные последствия

Предварительно новый ADR и новая фундаментальная сущность не требуются.

Настоящий BP использует существующие:

- Accrual;
- Financial Obligation;
- Accrual Article;
- Tariff;
- Accrual Period;
- Due Date;
- Rule/version semantics;
- Personal Account;
- Subject/Object historical relations;
- authority/provenance semantics.

После independent review следует проверить необходимость точечной синхронизации:

- DOMAIN_MODEL/TERMINOLOGY — one-off/out-of-cycle как process semantics, а не отдельный Accrual type;
- Accrual provenance для group target selection/resolved target set;
- late initial recognition vs recalculation;
- возможно, REFERENCE_CANDIDATE_MATRIX разделить `REF-FIN-006` на initial one-off и subsequent change semantics либо закрывать кандидат только после BP-FIN-005.

ADR-006 уже содержит достаточную архитектурную основу и предварительно не требует изменения.

## 50. Открытые вопросы для review

Перед принятием Draft независимо проверить:

1. корректно ли ограничить BP-FIN-004 первичными incoming-to-Community accrual scenarios, не меняя general Accrual entity;
2. достаточно ли distinction one-off/out-of-cycle как process semantics without new type;
3. корректна ли модель dynamic group selection → resolved target set without Accrual Batch entity;
4. требуется ли per-target Accrual identity или достаточно process provenance + Financial Obligations;
5. корректна ли liability resolution через historical subject/object/member relations without binding debtor to Personal Account;
6. допустим ли explicit fixed amount without Tariff;
7. достаточно ли boundaries zero/negative result;
8. корректна ли late initial recognition when no historical Accrual exists;
9. достаточно ли distinction late initial vs recalculation;
10. нужно ли mirror note в regular accrual process, которого пока нет;
11. не должен ли creation of new obligation automatically apply compatible Advance/Overpayment under any existing invariant;
12. достаточна ли group confirmation-scope model for partial failures;
13. нужна ли отдельная нормативная фиксация idempotency/duplicate semantics Accrual;
14. не смешивается ли Accrual Article с Budget/Funding context;
15. достаточно ли BP-FIN-005 оставить все post-confirmation changes;
16. следует ли закрывать REF-FIN-006 сейчас частично или только после BP-FIN-005.

## 51. Следующий шаг

1. internal review against ADR-004/005/006/010/011, DOMAIN_MODEL, TERMINOLOGY and neighboring finance BP;
2. pilot-ST scenario check and OSBBX reference check;
3. independent Claude review;
4. point fixes;
5. normative synchronization;
6. BP-FIN-005 — cancellation/recalculation of Accrual and effects on already paid amounts.
