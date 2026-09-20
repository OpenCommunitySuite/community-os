# BP-DOC-CASH-001 — Формирование и выдача кассового документа

**Статус:** Draft  
**Контекст:** Документы и формализация  
**Связанные контексты:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику формирования, оформления и выдачи документа, связанного с приёмом или выдачей наличных денежных средств.

Основной практический сценарий первого внедрения СТ:

```text
Cash Acceptance
+ recognized Cash Payment where available
+ applicable document policy
→ Cash Document
→ Document Revision
→ printable/PDF Document Representation
→ issue/hand representation to recipient where applicable
```

Для исходящей наличной операции аналогично:

```text
Cash Disbursement
+ recognized outgoing Cash Payment where available
+ applicable document policy
→ Cash Document
→ Document Revision
→ printable/PDF Document Representation
```

Настоящий BP не превращает документ в финансовый факт и не определяет технический способ рендеринга или печати.

## 2. Основная граница

```text
Cash Document
≠ Cash Acceptance
≠ Cash Disbursement
≠ Payment
≠ Payment Allocation
≠ Expense
≠ Financial Obligation
≠ print job
≠ PDF file
```

Документ относится к контексту **«Документы и формализация»** и может оформлять, подтверждать или представлять факты финансового контекста, не становясь ими.

## 3. Используемая документная модель

BP использует уже принятую ADR-009 модель:

```text
Document
≠ Document Revision
≠ Document Representation
≠ File
```

Новая фундаментальная сущность `Receipt`, `CashReceipt`, `PrintedReceipt` или `CashDocumentFile` не вводится.

Кассовая квитанция, приходный/расходный кассовый документ или иной локально допустимый документ являются **видами/специализациями Document**, определяемыми applicable document policy.

## 4. Вид кассового документа

Конфигурация/правила сообщества могут определять поддерживаемые виды кассовых документов, например:

- квитанция о приёме наличных;
- приходный кассовый документ;
- документ о выдаче наличных;
- расходный кассовый документ;
- подтверждение получения наличных;
- другой документ, предусмотренный локальной policy/law.

Этот перечень не является универсальной юридической классификацией.

Тип документа может определять:

- обязательность документа;
- момент его формирования;
- обязательные реквизиты;
- необходимость регистрации/номера;
- подписание;
- допустимые языки;
- правила исправления/замены;
- правила оригинала/копии/дубликата;
- способ и факт выдачи получателю.

## 5. Связь с Cash Acceptance

Документ входящего наличного процесса может иметь предметную связь с одним или несколькими Cash Acceptance source facts.

Связь может означать, например:

- оформляет физический приём наличных;
- подтверждает сумму/валюту Cash Acceptance;
- содержит сведения о physical tenderer/acting cashier;
- относится к последующему Payment recognition.

Документ не создаёт Cash Acceptance и не определяет его identity.

```text
receipt printed
≠ Cash Acceptance occurred
```

Если квитанция подготовлена заранее, но деньги фактически не приняты, подготовленный документ не создаёт Cash Acceptance или Payment.

## 6. Связь с Cash Disbursement

Документ исходящего наличного процесса может оформлять или подтверждать один или несколько Cash Disbursement source facts.

Предварительно созданный расходный документ не создаёт Cash Disbursement.

Если cash физически не выдан:

```text
prepared cash document
≠ Cash Disbursement
≠ outgoing Payment
```

## 7. Связь с Payment

Cash Document может быть связан с recognized Payment(s), но:

```text
Cash Document ≠ Payment
```

Document identity, registration number, file name, barcode или print number не определяют Payment identity.

Payment correction не переписывает документ автоматически.

Document correction не исправляет Payment автоматически.

## 8. Связь с Payment Allocation

Документ может отображать назначение платежа, Personal Account, obligation или фактически подтверждённые Payment Allocations, если это предусмотрено видом документа.

Но:

```text
document line / purpose
≠ Payment Allocation
```

Если Allocation ещё не подтверждён, документ не должен представлять proposal как уже состоявшийся financial fact.

Если документ исторически отразил подтверждённый Allocation, а позднее выполняется Reallocation, старое содержание документа не переписывается молча. Дальнейшее document action определяется policy вида документа: новая Revision, исправляющий/заменяющий Document либо отсутствие изменения документа.

## 9. Документ может оформлять Cash Acceptance до Payment recognition

Cash Acceptance может существовать до recognized Payment, например при temporarily unresolved payer.

Следовательно, применимая document policy может допускать документ, который подтверждает **факт приёма наличных**, не утверждая ещё не установленный Payment meaning.

Такой документ:

- не создаёт fake payer;
- не создаёт fake Personal Account;
- не создаёт fake Obligation;
- не превращает unresolved cash в Payment;
- должен явно отражать только фактически установленные сведения.

Если конкретный document kind допускается только после Payment recognition, это ограничение задаётся его policy.

## 10. Черновик документа

До предметной фиксации допускается draft/preparation:

- предварительное заполнение payer/tenderer;
- сумма;
- Personal Account;
- назначение;
- предполагаемые obligations/Allocations;
- шаблон документа.

Draft не является доказательством cash movement.

```text
Document Draft
≠ Cash Acceptance
≠ Cash Disbursement
≠ Payment
```

Черновое содержание может изменяться в пределах ADR-009 и policy вида документа.

## 11. Формирование исторически значимой Revision

Когда кассовый документ используется как предметно значимое оформление/подтверждение — например выдан плательщику, подписан, зарегистрирован либо иным образом зафиксирован как действующий документ, — его существенное содержание не переписывается молча.

Revision должна позволять восстановить содержание, использованное в таком действии.

Последующее изменение financial facts не превращает старую Revision в текущую автоматически.

## 12. Представление документа

Document Representation является формой конкретной Revision.

Для кассового документа возможны, где применимо:

- печатная форма;
- PDF;
- визуальное представление для предварительного просмотра;
- структурированное электронное представление;
- иное локально определённое представление.

```text
Document
≠ Revision
≠ Representation
≠ File
```

PDF-файл является возможным носителем Representation, а не самим Document.

## 13. Печать

**Печать** — получение физического экземпляра применимого Document Representation.

Печать сама по себе:

- не создаёт новый Cash Acceptance;
- не создаёт Cash Disbursement;
- не создаёт Payment;
- не создаёт Payment Allocation;
- не создаёт новую Document Revision автоматически;
- не создаёт новый Document автоматически.

Повтор технической команды печати не должен изменять финансовые факты.

## 14. Повторная печать

Повторная печать того же исторически значимого содержания обычно использует тот же Document и ту же Revision.

```text
reprint same Revision
≠ new Payment
≠ new Cash Acceptance/Disbursement
≠ new Document automatically
≠ new Revision automatically
```

Если applicable policy требует пометки `Копія`, `Дублікат`, `Повторна видача` или иной специальной формы, это может быть отдельным Representation той же Revision либо иным document action согласно виду документа.

Универсальная модель «оригинал/копия/дубликат» не вводится.

## 15. Неудачная печать

Ошибка принтера, отсутствие бумаги, сбой генерации PDF или недоступность storage:

- не отменяют Cash Acceptance/Cash Disbursement;
- не отменяют уже recognized Payment;
- не создают второй Payment при повторной попытке;
- не означают автоматически, что Document не существует.

Если local legal/policy semantics делает получение/выдачу документа обязательным предусловием определённого domain recognition, соответствующий процесс должен учитывать это отдельно.

Технический print failure не переписывает реальные финансовые факты.

## 16. Формирование PDF

Формирование PDF является подготовкой/созданием Document Representation или его технического носителя согласно applicable implementation.

```text
PDF generated
≠ Document created automatically
≠ Payment recognized
```

Повторное формирование идентичного PDF не создаёт автоматически новую Revision.

Изменение layout/font/page break без изменения предметно значимого содержания не требует новой Revision автоматически; критерий определяется document-kind policy.

## 17. Язык Representation

Одна Revision может иметь несколько языковых Representation, если это допускает document kind/policy и они выражают одно и то же исторически значимое содержание.

Для Community OS:

- основной язык UI — украинский;
- русский может использоваться как дополнительный;
- архитектура должна позволять другие языки.

Но язык конкретного юридически/официально значимого кассового документа определяется applicable policy/law, а не языком UI автоматически.

```text
UI language
≠ document legal language automatically
```

## 18. Реквизиты

Конкретный набор обязательных реквизитов определяется видом документа и applicable policy/law.

Для пилотного СТ **кандидатами** для printable cash receipt являются, где применимо:

- наименование Community;
- вид документа;
- номер/серия, если документ регистрируется;
- document date/time where applicable;
- сумма и currency;
- сумма прописью как Representation concern, если требуется;
- physical tenderer / payer / financial recipient — только в той роли, которая действительно установлена;
- Personal Account / участок / объект как context where applicable;
- назначение;
- related Cash Acceptance/Disbursement;
- related Payment(s), если уже recognized;
- related Allocation/Obligation information, если policy требует и факты уже подтверждены;
- acting cashier/acceptor/disburser;
- основания полномочия where applicable;
- место для подписи/подписания, если требуется;
- иные обязательные реквизиты конкретного вида документа.

Этот перечень не является юридически достаточной формой для всех юрисдикций.

## 19. Payer, tenderer, recipient и acting person

Кассовый документ не должен смешивать роли.

Возможны различия:

```text
physical tenderer
≠ payer
≠ obligated Subject
≠ acting cashier

physical receiver
≠ financial recipient
≠ entitled party
≠ acting disburser
```

Document policy определяет, какие роли требуется отображать.

Неизвестная/неподтверждённая роль не заполняется фиктивным Subject ради печатной формы.

## 20. Personal Account / участок

Номер участка или Personal Account может отображаться в документе как context, если это предметно применимо.

Но:

```text
Personal Account
≠ payer
≠ owner
≠ Payment
```

Документ не должен выводить стороны Payment только из номера PA/участка.

## 21. Назначение платежа

Назначение может отображаться в документе как исторически зафиксированное содержание/контекст.

Но purpose:

- не создаёт obligation;
- не является Allocation;
- не изменяет financial fact автоматически.

Если документ показывает распределение, оно должно соответствовать фактически подтверждённому состоянию на момент Document Revision, а не proposal.

## 22. Нумерация и регистрация

Вид кассового документа может требовать регистрации и/или номера.

Сохраняется ADR-009:

```text
Document identity
≠ registration number
≠ registry record
```

Community OS не вводит универсальную сквозную нумерацию всех документов.

Policy конкретного document kind может определять:

- серию;
- формат номера;
- область уникальности;
- дату регистрации;
- правила повторного использования номера;
- separate numbering for incoming/outgoing docs.

## 23. Подписание

Document kind/policy может требовать подписание:

- кассиром;
- иным уполномоченным субъектом;
- physical tenderer/receiver;
- несколькими субъектами.

Подписание относится к конкретной Revision/Representation и не является Payment recognition.

```text
Signing
≠ Payment
≠ Cash Acceptance/Disbursement
≠ Registration
```

BP не выбирает КЭП/PKI/графическую подпись/рукописную подпись.

## 24. Выдача документа получателю

Формирование документа, печать Representation и фактическая выдача получателю являются различными действиями.

```text
Document created
≠ Representation generated
≠ printed
≠ handed to recipient
```

Где это предметно значимо, должны быть объяснимы:

- кому предназначено Representation;
- кто выдал;
- когда;
- каким способом;
- было ли это первое или повторное предоставление, если policy различает их.

Настоящий BP не вводит universal Document Delivery state machine.

## 25. Электронное предоставление

Тот же Document/Revision может быть предоставлен как электронное Representation, если это допускается policy.

Например:

- PDF в личном кабинете;
- файл/ссылка через допустимый канал;
- иной электронный способ.

Факт электронной доставки/получения не предполагается автоматически только потому, что PDF сгенерирован.

Детальная transport/delivery semantics относится к коммуникационным/integration процессам.

## 26. Один Document ↔ несколько financial/source facts

Не вводится universal `1 Cash Document = 1 Cash Acceptance/Disbursement/Payment`.

Document kind/policy может позволять документу оформлять:

- один Cash Acceptance;
- несколько Cash Acceptance;
- один Payment;
- несколько Payments;
- Cash Acceptance + связанные Payments;
- Cash Disbursement + связанные Payments;
- иной допустимый набор фактов.

Обратная cardinality также не задаётся universally: один source/payment fact может иметь несколько связанных документов разного назначения.

Конкретная cardinality должна соответствовать реальному document purpose и applicable policy.

## 27. Technical retry / idempotency

Повтор технического запроса на формирование или печать того же document intent не должен создавать duplicate Document автоматически.

Совпадение:

```text
same payer + amount + date
```

не является универсальным identity key документа.

Дедупликация должна опираться на Document identity / document-process provenance и semantics конкретного вида документа.

## 28. Ошибка до выдачи/фиксации

Если ошибка обнаружена в изменяемом draft до historically significant use:

- draft может быть исправлен согласно document-kind policy;
- финансовые факты не изменяются из-за редактирования draft.

Новая Revision не требуется автоматически для каждого исправленного символа черновика.

## 29. Ошибка после исторически значимого использования

Если ошибочная Revision уже:

- выдана получателю;
- подписана;
- зарегистрирована;
- использована как значимое подтверждение;
- либо иным образом стала historically significant,

она не переписывается молча.

Applicable document policy определяет:

- новую Revision того же Document;
- исправляющий Document;
- replacement Document;
- отзыв/отмену;
- иную локальную document semantics.

Это не исправляет Financial Payment автоматически.

## 30. Financial fact corrected after document issuance

Если позднее исправляется Payment, Cash Acceptance, Cash Disbursement или Allocation:

- исходный Document/Revision остаётся исторически объяснимым;
- document correction/replacement не выполняется автоматически только потому, что финансовый факт изменился;
- applicable document kind/policy определяет необходимость нового/исправленного документа.

Если документ больше не соответствует effective financial state, UI/read model может показывать это как историческое несоответствие только на основании определённой document/financial semantics; универсальный `stale document` status не вводится.

## 31. Document corrected, financial fact remains correct

Если ошибка только в документе:

```text
Document correction
≠ Payment correction
≠ Cash source correction
```

Исправляется document layer.

## 32. Документ сформирован до cash event

Допускается draft/prepared document, если это требует operational workflow.

Но до фактического source event:

```text
prepared receipt/RKO
≠ Cash Acceptance/Disbursement
≠ Payment
```

После cash event draft может быть finalized/updated/replaced согласно document policy.

## 33. Offline/manual cash document

При offline/manual cash process бумажный документ может существовать до записи в Community OS.

Later recording может:

- recognize/import the Document;
- связать его с historical Cash Acceptance/Disbursement;
- связать с recognized Payment(s);
- сохранить original document date/number/content where reliable.

Document number не становится Payment identity или Cash source identity.

Duplicate import/re-entry не должен создавать duplicate Document автоматически.

## 34. Основной сценарий пилотного СТ — приём наличных

1. Owner A передаёт кассиру 1000 грн.
2. BP-CASH-001 фиксирует Cash Acceptance CA1.
3. Payment P1 = 1000 грн признаётся на достаточном основании.
4. BP-FIN-ALLOCATION-001 распределяет 870 грн на electricity obligation; 130 грн получают допустимый financial meaning согласно applicable semantics.
5. Document context создаёт Cash Document D1 вида `Квитанція про прийняття готівки`.
6. Revision R1 фиксирует существенное содержание документа на этот момент.
7. Формируется printable/PDF Representation.
8. Representation печатается и выдаётся плательщику.
9. Ошибка принтера при первой попытке не создаёт P2/CA2/D2.
10. Повторная печать той же Revision не создаёт новый Payment или новый Document.

## 35. Проверочные сценарии

### 35.1. Receipt prepared before cash, payer does not pay

Draft exists.

No Cash Acceptance, no Payment.

Draft is not proof of payment.

### 35.2. Cash accepted, printer fails

Cash Acceptance/Payment remain valid according to cash semantics.

Document/Representation can be completed/reprinted according policy.

No duplicate financial facts.

### 35.3. Reprint same receipt

Same Document + same historically significant Revision.

New Document/Payment not created automatically.

### 35.4. PDF and paper

One Revision may have PDF and print Representations.

They do not become separate financial facts.

### 35.5. Ukrainian and Russian Representation

Same semantic Revision may have UA/RU Representations if document policy allows them and legal requirements are satisfied.

UI language alone does not determine document language.

### 35.6. Wrong payer in document, Payment correct

Document correction only.

Payment remains.

### 35.7. Wrong Payment, document reflects original recognition

Payment correction through BP-FIN-002.

Document remains historical; policy decides whether corrected/replacement document is required.

### 35.8. Reallocation after receipt issued

Original receipt does not silently rewrite Allocation lines.

Document policy decides if corrected/replacement Revision is needed.

### 35.9. Receipt number duplicated by technical retry

Technical retry must not create a second Document/registration silently.

Requires resolution according registration/document policy.

### 35.10. Cash Acceptance with unresolved payer

Policy may permit a receipt confirming physical cash receipt without asserting a fake payer/Payment.

If the document kind legally requires identified payer, final document waits until requirement is satisfied.

### 35.11. One Acceptance supports several Payments

Document policy may create one aggregate receipt or several documents according to its purpose/legal requirements.

Source↔Payment cardinality does not force document cardinality.

### 35.12. Several Acceptances support one Payment

A receipt can only combine them if document kind/policy explicitly allows and the relationship is explainable.

No automatic document merge.

### 35.13. RKO printed, cash not disbursed

Prepared outgoing document exists/draft.

No Cash Disbursement and no outgoing Payment.

### 35.14. Outgoing payout completed, document missing temporarily

Cash Disbursement/Payment remain real unless applicable policy makes document a recognition prerequisite.

Document formalization remains pending.

### 35.15. Recipient refuses to sign after taking cash

Cash source/payment facts are not silently erased.

Document/signing outcome remains separate and may require decision under applicable policy.

### 35.16. Manual paper receipt later entered into system

Original document content/number/date are preserved where reliable.

No duplicate Payment/source fact is created merely by recording the document.

### 35.17. Same Document re-rendered after template layout change

If semantic content of the historically significant Revision is unchanged, new rendering need not create new Revision automatically.

Applicable document representation policy decides whether it is a new Representation.

### 35.18. Copy/duplicate marking

Policy requires a reissued copy to display `Дублікат`.

This may be a new Representation of same Revision rather than a new financial/document fact; specific document-kind policy decides.

## 36. Инварианты

1. Cash Document is a Document under ADR-009, not a financial fact.
2. Cash Document ≠ Cash Acceptance ≠ Cash Disbursement ≠ Payment.
3. Cash Document ≠ Payment Allocation ≠ Expense ≠ Financial Obligation.
4. Document identity ≠ registration number ≠ file name ≠ print number.
5. Document ≠ Revision ≠ Representation ≠ File.
6. Prepared/draft document does not create cash movement or Payment.
7. Cash source/Payment may exist without printable Representation if applicable policy allows it.
8. Print failure does not create or cancel Payment automatically.
9. Reprint does not create new Payment/Cash source/Document/Revision automatically.
10. PDF generation does not create Payment.
11. Document purpose text ≠ Payment Allocation.
12. Document correction ≠ Payment correction.
13. Payment correction ≠ document correction automatically.
14. Historically used Revision is not silently overwritten.
15. Print/PDF language ≠ UI language automatically.
16. Registration number does not define Document identity.
17. Cash source/payment cardinality does not define document cardinality automatically.
18. Technical retry does not create duplicate Document automatically.
19. Unknown financial role is not replaced with fake Subject for printing.
20. Personal Account/plot does not define payer automatically.
21. Signing ≠ Payment recognition.
22. Registration ≠ Payment recognition.
23. Printing ≠ document issuance/delivery automatically.
24. Electronic Representation generation ≠ delivery automatically.
25. Original/copy/duplicate semantics are document-kind-specific, not universal.
26. Document policy may impose stronger legal/formalization prerequisites without changing financial identities.
27. No universal cash-document lifecycle/state machine is introduced.

## 37. Что намеренно не решается

Настоящий BP не определяет:

- конкретную юридически утверждённую форму кассового документа;
- обязательность ПКО/РКО в конкретной юрисдикции;
- РРО/ПРРО/фискальный чек;
- налоговую/бухгалтерскую кассовую дисциплину;
- КЭП/PKI;
- конкретный шаблонизатор;
- PDF library;
- printer protocol/driver;
- paper size;
- fonts;
- barcode/QR format;
- storage implementation;
- document delivery transport;
- universal original/copy/duplicate rules;
- universal document numbering;
- UI.

## 38. Связанные документы

- ADR-004;
- ADR-005;
- ADR-006;
- ADR-009;
- ADR-010;
- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- `BP-CASH-001-CASH-PAYMENT-RECEIPT.md`;
- `BP-CASH-002-CASH-PAYMENT-DISBURSEMENT.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- REFERENCE_CANDIDATE_MATRIX.

## 39. Нормативные последствия

Предварительный вывод Draft:

- новый ADR не требуется;
- новая fundamental Document/Receipt entity не требуется;
- DOMAIN_MODEL/TERMINOLOGY фундаментально менять не требуется;
- ADR-009 уже содержит Document/Revision/Representation/Signing/Registration;
- ADR-006 и cash BP уже отделяют документ от financial/source facts.

После review проверить:

- нужен ли отдельный термин `Cash Document` или достаточно document-kind semantics;
- нужен ли mirror-note в BP-CASH-001/002;
- нужен ли отдельный candidate для legal/fiscal cash-document requirements;
- нужно ли нормативно закреплять reprint/duplicate semantics вне настоящего BP.

## 40. Открытые вопросы для review

1. является ли отдельный BP оправданным либо достаточно document-kind policy;
2. должен ли Cash Document иметь отдельный термин либо это только specialization Document;
3. допустим ли документ Cash Acceptance до Payment recognition;
4. какая cardinality Cash Document ↔ cash source ↔ Payment допустима;
5. когда document draft становится historically significant Revision;
6. является ли первое предоставление плательщику historically significant use;
7. reprint: same Representation или new Representation;
8. когда нужен `Дублікат`/copy marking;
9. какие сведения должны snapshot-иться в Revision;
10. как document reacts to later Payment/Allocation correction;
11. может ли one Revision иметь UA/RU Representations;
12. должен ли document registration number быть обязательным для пилотного СТ;
13. что делать с offline/manual receipt;
14. какие legal requirements следует исследовать отдельно для Украины;
15. нужен ли separate delivery/issuance process либо достаточно границы ADR-009.

## 41. Следующий шаг

1. internal review against ADR-009 / ADR-006 / cash BP;
2. pilot-ST review;
3. independent review if architecture remains non-trivial;
4. point fixes;
5. normative/matrix synchronization;
6. legal/formalization requirements for Ukrainian pilot as separate task;
7. continue to BP-EXPENSE-001.
