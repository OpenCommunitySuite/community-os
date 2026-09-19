# BP-FIN-BANK-001 — Банковские сведения → Bank Transaction → предметная классификация

**Статус:** Draft  
**Контекст:** финансовые отношения / интеграции  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет, как Community OS:

1. получает внешние банковские сведения;
2. устанавливает, к какому банковскому счёту Community они относятся;
3. проверяет и распознаёт отдельное движение денежных средств;
4. признаёт самостоятельную `Bank Transaction`;
5. выполняет её предметную классификацию;
6. при наличии достаточных оснований передаёт результат специализированным финансовым процессам для признания `Payment`, internal transfer или иных предметных последствий;
7. сохраняет исходный банковский факт независимо от последующей классификации.

Процесс является vendor-neutral и не зависит от ПриватБанка, monobank, iPay, Portmone, BAS/BAF либо конкретного формата XLSX/API.

## 2. Основные различия

```text
external bank representation
≠ Bank Transaction
≠ Payment
≠ Payment Allocation
≠ Financial Obligation
≠ Expense
≠ Community Receipt
≠ accounting entry
```

Дополнительно:

```text
bank counterparty data
≠ Subject
bank purpose text
≠ Personal Account
bank purpose text
≠ Payment Allocation
transaction classification
≠ source bank data correction
classification correction
≠ Bank Transaction correction
own-account transfer
≠ external income
own-account transfer
≠ Expense
```

## 3. Границы процесса

Процесс начинается, когда Community OS получает либо получает возможность обработать банковские сведения о движении средств по предполагаемому банковскому счёту Community.

Процесс заканчивается, когда каждый обработанный банковский элемент получил объяснимый результат:

- признан новой Bank Transaction;
- сопоставлен с уже признанной Bank Transaction как redelivery/duplicate representation;
- признан corrected/replacement/new external information согласно semantic contract;
- отклонён как непригодный для recognition;
- оставлен unresolved;
- либо завершился техническим outcome, который не изображается предметным rejection.

После recognition Bank Transaction может:

- оставаться Unclassified;
- быть классифицирована;
- быть связана с одним или несколькими специализированными финансовыми результатами;
- быть переклассифицирована без изменения исходного содержания Bank Transaction.

## 4. Что входит

В BP входят:

- банковский источник;
- External Integration Party и source identity в смысле ADR-011;
- банковский счёт Community как scope;
- external representation;
- validation;
- duplicate/redelivery recognition;
- recognition Bank Transaction;
- provenance;
- исходные банковские сведения, существенные для Bank Transaction;
- unknown counterparty;
- manual/automatic classification;
- classification confidence/decision semantics без universal scoring;
- связь с Subject при достаточном основании;
- связь с Contractual Relationship как возможным контекстом;
- связь с Personal Account как возможным результатом matching, но не как свойство банковского текста;
- incoming/outgoing direction;
- own-account transfer;
- связь Bank Transaction ↔ Payment без universal 1:1;
- исправление нашей классификации;
- corrected external bank information;
- re-processing;
- Unknown Outcome и reconciliation на технической границе.

## 5. Что не входит

BP не определяет:

- API конкретного банка;
- формат XLSX/CSV/JSON;
- OAuth/token storage;
- polling/webhook implementation;
- бухгалтерскую проводку;
- BAS/BAF mapping;
- universal Expense workflow;
- universal Payment correction;
- Refund process;
- Payment Allocation rules;
- начисление;
- создание Financial Obligation;
- создание Contractual Relationship;
- создание Subject по банковским реквизитам без отдельного identity resolution;
- создание Personal Account;
- регистрацию нового банковского счёта Community как побочный эффект импорта;
- reconciled accounting balance;
- universal bank statement entity.

## 6. Предпосылка: банковский счёт Community

Bank Transaction принадлежит определённому банковскому счёту Community.

Сообщество может иметь несколько банковских счетов.

Получение сведений по неизвестному банковскому счёту не создаёт Community Bank Account автоматически.

Если source account не может быть надёжно сопоставлен с существующим банковским счётом Community:

- Bank Transaction не признаётся;
- данные остаются unresolved/rejected according to source/process semantics;
- фиктивный банковский счёт не создаётся.

Жизненный цикл регистрации/закрытия банковского счёта Community может быть определён отдельным процессом при продуктовой необходимости.

## 7. Источник и External Integration Party

Следует различать:

- Bank as legal Subject;
- Bank as party of Contractual Relationship for banking services;
- External Integration Party;
- конкретный external source/account connection;
- bank counterparty data внутри операции.

Эти идентичности не объединяются автоматически.

Один Bank Subject может обслуживать несколько счетов Community и несколько technical connections.

External Integration Party не становится Subject автоматически.

## 8. Каналы получения

Банковские сведения могут поступать:

- API;
- webhook;
- загруженной выпиской;
- XLSX/CSV/другим файлом;
- ручным вводом банковских сведений при допустимой policy;
- через внешний финансовый/интеграционный сервис.

Канал не меняет предметную семантику Bank Transaction.

## 9. External representation

Полученная строка, запись API, webhook payload или иная банковская запись является external representation.

Она не является Bank Transaction Community OS до recognition.

```text
External Representation
→ validation / mapping / duplicate recognition
→ domain recognition
→ Bank Transaction
```

Исходное представление и normalized/mapped values различаются согласно ADR-011.

## 10. Source snapshot / delivery

Для batch/file ingestion должен быть определим конкретный source snapshot/delivery.

Для API/webhook ingestion должна быть определима поставка/получение, достаточная для provenance и duplicate recognition.

Название файла или время HTTP-запроса не являются Bank Transaction identity.

## 11. Минимальная банковская семантика кандидата

Для recognition Bank Transaction должны быть достаточно определимы, где предоставляет источник:

- Community Bank Account;
- направление движения относительно этого счёта;
- сумма;
- денежная единица;
- предметное банковское время;
- внешний transaction/reference identifier;
- сведения о другой стороне;
- назначение/описание;
- source provenance.

Конкретный mandatory field set определяется semantic contract источника.

Отсутствие необязательных данных не заменяется выдуманными значениями.

## 12. Денежная сумма и направление

Сумма и денежная единица сохраняют банковский смысл source.

Направление определяется относительно конкретного Community Bank Account:

- incoming;
- outgoing.

Знак source amount сам по себе не становится универсальным правилом направления для всех банковских форматов.

Normalization направления принадлежит mapping/semantic contract.

## 13. Время

Следует различать, где доступны:

- effective/value/booking bank time;
- source event time;
- recording/ingestion time Community OS.

Technical ingestion time не заменяет банковское предметное время.

Если источник предоставляет несколько банковских времён, их смысл определяется source contract; BP не выбирает одно универсальное «transaction date».

## 14. External transaction identity

Если источник предоставляет устойчивый external transaction ID с известной областью уникальности, он используется согласно semantic contract.

External ID всегда квалифицирован как минимум source scope и применимой областью банковского счёта/connection, если источник не гарантирует более широкую уникальность.

External ID не становится внутренней identity Bank Transaction.

## 15. Duplicate / redelivery

Повторная доставка одной external operation не создаёт новую Bank Transaction.

Duplicate recognition не строится универсально только по:

- дате;
- сумме;
- назначению;
- имени контрагента;
- сочетанию «дата + сумма».

При отсутствии доверенного external ID используются source-specific matching/duplicate rules.

Совпадение банковских реквизитов является signal, а не универсальным доказательством duplicate.

## 16. New information / correction / replacement

Следует различать:

- redelivery same external information;
- duplicate representation;
- corrected external information;
- replacement;
- genuinely new bank information.

Semantic contract источника определяет, как различаются эти случаи.

Полученная новая версия банковских сведений не перезаписывает молча исторически использованное исходное представление.

## 17. Validation до recognition

Validation может включать:

- source/schema validity;
- account mapping;
- amount/currency validity;
- direction normalization;
- time semantics;
- duplicate/redelivery check;
- external identifier validity;
- source-specific consistency.

Validation не решает автоматически предметную классификацию Payment/Expense/Subject.

## 18. Recognition Bank Transaction

Bank Transaction признаётся как самостоятельный финансовый факт, если:

1. банковское движение достаточно определимо;
2. Community Bank Account установлен;
3. duplicate/redelivery semantics разрешены;
4. mandatory source contract requirements выполнены;
5. applicable recognition rule/authority допускает recognition.

После recognition Bank Transaction существует независимо от того, удалось ли определить:

- Subject;
- Personal Account;
- Contractual Relationship;
- Financial Obligation;
- Payment;
- Expense;
- Allocation.

## 19. Bank Transaction identity

Bank Transaction имеет собственную stable identity Community OS.

Identity не равна:

- source row number;
- external transaction ID;
- purpose text;
- counterparty account;
- Payment identity;
- accounting entry;
- source file line.

External identifiers и provenance используются для matching/reconciliation, но не заменяют internal identity.

## 20. Неизменяемое исходное содержание

Предметно признанное исходное содержание Bank Transaction должно оставаться объяснимым.

Последующая:

- классификация;
- Subject matching;
- Personal Account matching;
- создание Payment;
- изменение Allocation;
- исправление Expense

не переписывает исходные банковские сведения.

Техническая реализация versioning не определяется.

## 21. Unclassified Bank Transaction

Bank Transaction может законно оставаться Unclassified.

Unclassified не означает:

- ошибочную транзакцию;
- техническую ошибку;
- отсутствие денежных средств;
- отсутствие Subject в реальном мире;
- необходимость создать fake Subject;
- необходимость создать Personal Account.

Это нормальное предметное состояние, если данных недостаточно для следующего шага.

## 22. Classification

Classification определяет предметную интерпретацию Bank Transaction либо направление дальнейшей обработки.

Примеры возможной классификации:

- candidate incoming Payment;
- candidate outgoing Payment;
- own-account transfer;
- bank fee/service candidate;
- refund/reversal candidate;
- other incoming movement;
- other outgoing movement;
- remains Unclassified.

Этот перечень не является закрытым universal enum.

Classification не создаёт автоматически перечисленные domain facts.

## 23. Classification evidence

Для classification могут использоваться:

- transaction direction;
- amount/currency;
- bank counterparty data;
- purpose text;
- known Subject identifiers;
- Personal Account references;
- Payment Intent identifier;
- Contractual Relationship;
- existing obligations;
- known own bank accounts;
- source-specific structured fields;
- explicit manual decision;
- applicable rules.

Ни один отдельный signal не является универсальным правилом.

## 24. Automatic classification

Automatic classification допускается только по явно применимому правилу с достаточной надёжностью для конкретного класса решения.

BP не вводит universal score/threshold.

Automatic result должен оставаться объяснимым:

- какое правило применено;
- какие significant inputs использованы;
- какой результат признан;
- какая source/provenance information существенна.

Если rule не позволяет безопасное решение, Bank Transaction остаётся Unclassified/Requires Decision.

## 25. Manual classification

Уполномоченный пользователь может классифицировать Bank Transaction вручную согласно policy.

Manual classification:

- является предметно значимым действием;
- требует определимой authority;
- не изменяет source bank data;
- сохраняет reason/provenance, когда это требуется значимостью решения.

Technical admin permission не является domain authority.

## 26. Bank counterparty data → Subject

Банковские имя/название, IBAN, tax identifier или иные реквизиты являются matching inputs.

Они не создают Subject автоматически.

Возможные результаты:

- reliable match to existing Subject;
- unresolved candidate;
- no established Subject.

Создание нового Subject из банковских сведений требует отдельной применимой identity/domain policy и не является неявным side effect этого BP.

Fake `Unknown Counterparty` не создаётся.

## 27. Contractual Relationship

Установленный Subject может иметь Contractual Relationship with Community.

Contractual Relationship может усиливать/ограничивать classification, например показывать известное отношение:

- provider;
- contractor;
- lessee paying Community;
- bank service;
- infrastructure use.

Но наличие Contractual Relationship:

- не создаёт Payment;
- не доказывает конкретное назначение Bank Transaction;
- не заменяет Financial Obligation;
- не означает, что любая транзакция этого Subject относится к этому relationship.

## 28. Personal Account matching

Purpose text, structured reference, Payment Intent или другие данные могут использоваться для matching Personal Account.

Personal Account не выводится только из:

- ФИО;
- номера участка;
- суммы;
- текста, похожего на account number.

При надёжном source/domain rule Personal Account может быть определён.

Ошибочный matching Personal Account исправляется отдельно от Bank Transaction source data.

## 29. Payment Intent

Payment Intent может дать устойчивый correlation identifier и предполагаемое назначение.

Совпавший Payment Intent:

- является сильным matching input согласно применимой policy;
- не является Payment;
- не доказывает автоматически фактический Payer;
- не превращает предполагаемое Allocation в фактическое.

## 30. Recognition Payment

Bank Transaction может быть основанием или подтверждением признания Payment.

Payment recognition является отдельным предметным результатом финансового контекста.

Один пользовательский/автоматизированный процесс может координировать:

```text
Bank Transaction classification
→ Payment recognition
```

но semantic distinction сохраняется.

Если оснований недостаточно, Bank Transaction остаётся признанной без Payment.

## 31. Bank Transaction ↔ Payment cardinality

Не вводится universal `1 Bank Transaction = 1 Payment`.

Допустимы:

- one Bank Transaction → one Payment;
- one Bank Transaction → multiple Payments;
- multiple Bank Transactions → one Payment;
- Bank Transaction → no Payment.

Конкретный сценарий должен отражать фактическое движение и финансовую семантику.

## 32. Incoming owner/member payment

Типовой happy path:

```text
external bank representation
→ Bank Transaction
→ Subject/Personal Account matching where reliable
→ incoming Payment recognition
→ Payment Allocation in separate/related financial process
```

Payment Allocation не является частью банковского текста и не возникает автоматически из purpose text.

## 33. Incoming payment from external contractual party

Например ISP платит Community за использование опор:

```text
Bank Transaction
→ match Subject = ISP
→ Contractual Relationship as contextual evidence
→ applicable Financial Obligation
→ incoming Payment recognition
→ allocation/application to obligation according financial process
```

Провайдер не превращается в Supplier только потому, что совершил Payment Community.

## 34. Outgoing supplier/contractor payment

```text
Bank Transaction
→ match Subject where reliable
→ applicable Obligation/Contractual Relationship
→ outgoing Payment recognition
→ financial linkage
```

Исходящая Bank Transaction сама по себе не создаёт Expense или Obligation.

## 35. Bank fee

Списание комиссии банка является Bank Transaction.

Оно может быть основанием для:

- outgoing Payment;
- Financial Obligation;
- Expense

только согласно применимому финансовому процессу.

Наличие banking Contractual Relationship не создаёт эти факты автоматически.

## 36. Перевод между собственными счетами Community

При переводе между двумя банковскими счетами одного Community обычно существуют два банковских движения:

```text
Account A → outgoing Bank Transaction
Account B → incoming Bank Transaction
```

Они остаются двумя самостоятельными Bank Transactions, если так представлены банковскими источниками.

После надёжного сопоставления они могут быть явно связаны как соответствующие банковские стороны одного перевода между собственными счетами. Такая связь/интерпретация не требует самостоятельной универсальной domain entity `InternalTransfer`.

Такой перевод сам по себе не создаёт:

- внешний income;
- Expense;
- Supplier Payment;
- owner Payment;
- новый Source of Financing;
- Financial Obligation.

Если видна только одна сторона перевода, не создаётся синтетическая вторая Bank Transaction. Classification может оставаться provisional/unresolved до reconciliation.

Настоящий BP не вводит универсальную отдельную entity `InternalTransfer`; необходимость такой identity оценивается по последующим реальным процессам.

## 37. Other incoming movement

Входящая Bank Transaction может не быть платежом собственника.

Примеры:

- аренда/использование инфраструктуры;
- реклама;
- возврат ранее перечисленных средств;
- иное поступление.

Не вводится универсальная `Community Receipt` entity только для объединения всех входящих движений.

Предметный смысл определяется специализированным финансовым процессом.

## 38. Other outgoing movement

Исходящая Bank Transaction может не быть Payment конкретного известного Obligation либо Expense на момент recognition.

Она может оставаться Unclassified/Other Outgoing до последующего resolution.

Не создаётся fake Expense ради классификации банковского движения.

## 39. Ignored / non-actionable transaction

OSBBX показывает практическую потребность игнорировать банковские транзакции, не относящиеся к платежам собственников.

В Community OS «ignored» не означает удалить Bank Transaction или признать её несуществующей.

Допустим operational disposition вида:

- no further owner-payment processing;
- no current financial classification required;

при сохранении Bank Transaction и причины такого решения, если это значимо.

Настоящий BP не требует universal `Ignored` domain status.

## 40. Corrected external bank information

Если банк/источник исправил сведения о ранее доставленной операции:

```text
external correction
≠ classification correction
```

Процесс должен:

1. установить связь correction с исходной external information;
2. определить semantic contract correction/replacement;
3. revalidate исправленное банковское содержание;
4. передать решение финансовому owning context;
5. сохранить историю исходного и исправленного source information;
6. проверить зависимые domain interpretations.

Owning financial context определяет предметный результат: correction существующей Bank Transaction, replacement, новая Bank Transaction либо отсутствие изменения признанного факта. Настоящий BP не устанавливает универсальное правило сохранения или смены Bank Transaction identity при external correction.

External correction не переписывает молча исходную Bank Transaction, Payment, Expense или Allocation.

## 41. Correction classification

Если source Bank Transaction была верна, но Community OS ошибочно определила Subject/Personal Account/Payment interpretation:

- Bank Transaction source content не меняется;
- classification/matching correction выполняется отдельно;
- dependent Payments/Allocations/Expenses исправляются owning processes;
- universal cascade rewrite не выполняется.

## 42. Payment correction boundary

Ошибочно recognized Payment не исправляется скрытым редактированием Bank Transaction.

Это относится к будущему `BP-FIN-002 — исправление ошибочного признания платежа`.

Bank Transaction сохраняется как основание/provenance в исходном банковском смысле.

## 43. Refund / reversal boundary

Банковский возврат или reversal сначала является Bank Transaction/external information.

Его предметный смысл `Refund`, reversal previous payment, correction bank movement или другое определяется отдельной финансовой семантикой.

Настоящий BP не считает любое движение обратного направления Refund автоматически.

## 44. Multiple Community bank accounts

Каждая Bank Transaction относится к конкретному Community Bank Account.

Classification может учитывать назначение/роль конкретного банковского счёта, если такая исторически значимая configuration/policy существует.

Текущая роль счёта не переписывает прошлую классификацию.

Импорт/получение ведётся account-scoped, но одно delivery может технически содержать несколько счетов только если semantic contract позволяет надёжное разделение.

## 45. Bank account lifecycle boundary

Закрытие банковского счёта не удаляет его Bank Transactions.

Новое движение по историческому/закрытому счёту не должно автоматически отклоняться только по текущему статусу, если source/effective time указывает на период его применимости.

Настоящий BP не определяет полный lifecycle Bank Account; он требует исторически корректной account applicability.

## 46. Batch ingestion и partial success

При batch/file import:

- один bad item не обязан блокировать весь batch;
- dependency на неизвестный account может блокировать соответствующий item;
- successful Bank Transactions не откатываются только из-за unrelated bad rows;
- per-item result должен быть объяснимым.

Atomicity определяется предметными зависимостями, а не форматом файла.

## 47. Item outcomes

На уровне external item/process различаются как минимум:

- Recognized New Bank Transaction;
- Matched Existing / Redelivery;
- Corrected/Replacement External Information;
- Unresolved;
- Conflict;
- Rejected / Not Recognized;
- Technical Failed / Not Processed.

На уровне classification отдельно различаются:

- Classified;
- Unclassified;
- Requires Decision;
- Classification Corrected.

Эти перечни не требуют universal enum.

## 48. Retry и reprocessing

Technical Retry повторяет тот же unresolved operation/intent согласно ADR-016, если применимо.

Reprocessing external information после:

- corrected mapping;
- resolved account;
- corrected source data;
- changed classification rule

не должно создавать duplicate Bank Transaction.

Technical retry и domain reclassification различаются.

## 49. Unknown Outcome

Если technical execution завершилось с Unknown Outcome, прежде повторного side effect требуется reconciliation.

Unknown Outcome не становится:

- Unclassified;
- Rejected Bank Transaction;
- missing bank movement.

## 50. Authority

Предметно значимыми действиями являются, где применимо:

- recognition Bank Transaction;
- manual classification;
- Subject/Personal Account matching decision;
- Payment recognition;
- correction classification.

Должны быть определимы authority и actor согласно ADR-010.

Technical integration identity не становится human/domain Subject.

## 51. Provenance

Для признанной Bank Transaction должны быть объяснимы, где применимо:

- Community;
- Community Bank Account;
- External Integration Party/source;
- source delivery/snapshot;
- external transaction/reference IDs;
- source fields;
- normalized/mapped values;
- recognition result;
- applied semantic contract/mapping version where significant;
- later external correction;
- classification history;
- manual actor/authority for significant decisions;
- links to recognized domain results.

Provenance не требует indefinite retention full raw source if protection/retention policy requires otherwise, но retained context должен быть достаточен для explainability.

## 52. Security and privacy

Банковские сведения могут содержать персональные и финансовые данные.

Их доступ, retention, logging и export должны следовать применимым policies.

Bank counterparty data не публикуются только потому, что они существуют в Bank Transaction.

Настоящий BP не определяет privacy/legal policy.

## 53. Проверочные сценарии

### 53.1. Платёж собственника с точным Payment Intent

Ожидается:

- Bank Transaction recognized;
- Intent matched;
- Payment may be recognized;
- Allocation still separate domain result.

### 53.2. Платёж собственника без лицевого счёта в назначении

Bank Transaction recognized.

Если reliable Subject/PA matching отсутствует — остаётся Unclassified/Requires Decision; fake PA не создаётся.

### 53.3. ISP платит за опоры

Bank Transaction recognized → Subject matched → Contractual Relationship/context → incoming Payment.

ISP не становится Supplier автоматически.

### 53.4. Оплата поставщику ТБО

Outgoing Bank Transaction → Subject/Supplier context → Payment recognition where justified.

Expense/Obligation не создаются только из банковского факта.

### 53.5. Перевод между двумя собственными счетами

Две Bank Transactions могут быть linked/classified as own-account transfer; income/expense не создаются.

### 53.6. Дубликат строки выписки

Second external representation matches existing Bank Transaction; duplicate не создаётся.

### 53.7. Банк исправил назначение

External correction tracked; Bank Transaction interpretation revalidated; downstream domain facts не переписываются молча.

### 53.8. Бухгалтер ошибочно привязал PA

Bank Transaction source content remains; matching/classification corrected; dependent Payment Allocation corrected owning process.

### 53.9. Неизвестный отправитель

Bank Transaction recognized without Subject/PA if bank movement itself is valid.

### 53.10. Комиссия банка

Bank Transaction recognized; Payment/Expense only through applicable financial process.

## 54. Инварианты процесса

1. External bank representation ≠ Bank Transaction.
2. Bank Transaction ≠ Payment.
3. Bank Transaction ≠ Payment Allocation.
4. Bank Transaction ≠ Financial Obligation.
5. Bank Transaction ≠ Expense.
6. Bank Transaction ≠ accounting entry.
7. Bank Transaction belongs to a specific Community Bank Account.
8. Unknown bank account is not auto-created from transaction data.
9. External Integration Party ≠ Bank Subject.
10. Bank counterparty data ≠ Subject.
11. Purpose text ≠ Personal Account.
12. Purpose text ≠ Payment Allocation.
13. External ID ≠ Bank Transaction internal identity.
14. Duplicate recognition is source-semantic, not universal date+amount matching.
15. Redelivery does not create duplicate Bank Transaction.
16. Corrected external information ≠ classification correction.
17. Classification does not rewrite source bank content.
18. Bank Transaction may remain Unclassified.
19. Unclassified ≠ technical failure.
20. Unknown counterparty does not require fake Subject.
21. Unknown PA does not require fake Personal Account.
22. Contractual Relationship does not classify every transaction of its Subject automatically.
23. Matching Subject/PA requires applicable evidence/rule.
24. Payment Intent ≠ Payment.
25. Payment Intent expected allocation ≠ actual Payment Allocation.
26. Payment recognition is separate from Bank Transaction recognition.
27. No universal 1:1 Bank Transaction↔Payment cardinality.
28. Incoming Bank Transaction is not automatically owner/member Payment.
29. Outgoing Bank Transaction is not automatically Supplier Payment.
30. Outgoing Bank Transaction is not automatically Expense.
31. Bank fee movement does not create Expense/Obligation automatically.
32. Own-account transfer does not create external income.
33. Own-account transfer does not create Expense.
34. One leg of transfer does not create synthetic other Bank Transaction.
35. Other incoming movement does not require universal Community Receipt.
36. Ignored/no-action disposition does not delete Bank Transaction.
37. External correction preserves source history and does not assume same/new Bank Transaction identity universally.
38. Classification correction preserves Bank Transaction source content.
39. Payment correction belongs to owning financial process.
40. Reverse-direction movement is not automatically Refund.
41. Multiple Community bank accounts are supported.
42. Current bank-account configuration does not rewrite historical classification.
43. Closing bank account does not delete historical Bank Transactions.
44. Batch partial success follows dependencies, not file atomicity.
45. Technical Retry ≠ domain reclassification.
46. Unknown Outcome requires reconciliation before unsafe repeat.
47. Technical integration identity is not domain Subject.
48. Manual significant decisions require attributable authority.
49. Provenance must support explainability without universal Audit entity.
50. Bank/vendor-specific API semantics do not define domain model.

## 55. Нормативные последствия

Предварительно новый ADR и новые фундаментальные сущности не требуются.

ADR-006/011 уже определяют:

- Community Bank Account;
- Bank Transaction;
- Payment;
- integration recognition;
- duplicate/redelivery;
- correction/re-recognition;
- multi-community source scope.

После принятия BP следует:

- проверить, нужны ли точечные уточнения DOMAIN_MODEL/TERMINOLOGY;
- обновить REFERENCE_CANDIDATE_MATRIX;
- не переносить bank-specific fields в универсальную модель без предметного основания.

## 56. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-010;
- ADR-011;
- ADR-016;
- `BP-CONTRACT-001-CONTRACTUAL-RELATIONSHIP.md`;
- OSBBX reference analysis;
- Мій Дім Online reference analysis;
- REFERENCE_CANDIDATE_MATRIX.

## 57. Что намеренно не решается

- API конкретного банка;
- credential/token model;
- webhook/polling;
- statement file schema;
- universal fuzzy matching score;
- Payment correction;
- Refund;
- Payment Allocation rules;
- Expense recognition;
- Bank Account onboarding/lifecycle;
- bank reconciliation against accounting ledger;
- BAS/BAF mapping;
- chargeback/dispute semantics;
- multi-currency conversion;
- cash operations.

## 58. Следующий шаг

После предметного review:

1. независимое review Claude;
2. точечные исправления;
3. при необходимости минимальная нормативная синхронизация;
4. закрытие `REF-BANK-001`;
5. переход к `BP-FIN-002 — исправление ошибочного признания платежа`.
