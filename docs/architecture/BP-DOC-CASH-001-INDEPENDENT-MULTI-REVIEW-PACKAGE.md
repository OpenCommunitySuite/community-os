# Independent multi-review package — PR #59 / BP-DOC-CASH-001

**Repository:** OpenCommunitySuite/community-os  
**PR:** #59 — `docs: define cash document formalization process`  
**Base:** current `main` = `5325ce00181487f1c0db3b0bac0e902cb46c86da`  
**Review mode:** предметно-архитектурный review. Не проектировать код, БД, API, UI и не подменять отдельный legal analysis Украины.

---

## 1. Задание независимому рецензенту

Проведи независимый stress-review Draft `BP-DOC-CASH-001` в контексте приложенных нормативных выдержек Community OS и реального сценария пилотного СТ.

Цель review — проверить не «удобство реализации», а корректность предметных границ, отсутствие скрытых новых сущностей и соответствие Documentation First.

Особенно проверь:

1. оправдан ли самостоятельный BP формализации кассового документа;
2. корректна ли рабочая модель пилота: **один ПКО = один Document**, а ордер + квитанция = **composite Document Representation**;
3. не скрывает ли composite Representation необходимость самостоятельной identity его частей;
4. корректно ли различены:
   - Cash Acceptance;
   - Payment;
   - Payment Allocation;
   - Advance;
   - Document;
   - Revision;
   - Representation;
   - печать/выдача;
5. не превращает ли быстрый кассовый workflow в скрытую universal `Cash Operation`, `Visit`, `Transaction` или другую агрегирующую сущность;
6. совместим ли сценарий «передали больше суммы долга, сдача не возвращена, остаток по явному указанию плательщика остаётся авансом на будущую электроэнергию/воду/взносы» с текущими BP-CASH-001 и BP-FIN-ALLOCATION-001;
7. достаточно ли ADR-009 для provenance версии регламентированной формы/шаблона;
8. корректно ли различены выдача квитанционной части и хранение ордерной части;
9. корректна ли граница Community OS → BAF/BAS:
   - ПКО создаётся/нумеруется/печатается в Community OS;
   - BAF/BAS получает downstream accounting representation;
   - внешний BAF/BAS record id не становится Document identity/registration number;
   - бухгалтерские поля внешней формы не создают доменные сущности Community OS;
10. что следует оставить document-kind policy, а что оправданно закрепить в этом BP;
11. какие вопросы нельзя закрывать до отдельного REF-DOC-005 legal/formalization analysis законодательства Украины.

Не предлагай копировать модель BAS/BAF в Community OS. Не считай внешний бухгалтерский объект источником предметной истины Community OS.

---

## 2. Формат ответа

Верни результат **в одном Markdown-файле**.

Для каждого замечания используй:

- **Severity:** BLOCKER / MAJOR / MINOR / OBSERVATION
- **Раздел Draft**
- **Проблема**
- **Почему это проблема**
- **Предлагаемое минимальное исправление**
- **Нужно ли менять DOMAIN_MODEL / TERMINOLOGY / ADR / связанный BP**

Отдельно дай ответы:

- Нужна ли самостоятельная fundamental entity `Cash Document`?
- Нужна ли самостоятельная fundamental entity `Document Part` для ордера/квитанции?
- Нужна ли самостоятельная `Cash Visit/Session/Operation` для быстрого кассового взаимодействия?
- Достаточна ли модель Document → Revision → composite Representation?
- Есть ли конфликт с Cash Acceptance / Payment / Initial Allocation / Advance semantics?
- Есть ли конфликт с integration semantics ADR-011?
- Какие вопросы должны остаться открытыми до REF-DOC-005?
- Итог: **point fixes sufficient** или **conceptual redesign required**, с аргументами.

Не оценивай качество текста как редактуру ради редактуры. MINOR отмечай только если исправление реально повышает точность модели.

---

## 3. Подтверждённый pilot-ST scenario

Это предметный вход от пилотного СТ, а не универсальное правило для всех Community.

- Сейчас ПКО выписывается во внешней системе BAF.
- Используется форма КО-1 из двух физических частей:
  - ордер остаётся у бухгалтера/кассира;
  - квитанция выдаётся плательщику.
- Целевое направление: ПКО вести и быстро печатать непосредственно в Community OS, а необходимые сведения затем выгружать в BAF.
- Типичный interaction:
  1. владелец приходит к кассиру/бухгалтеру;
  2. сообщает показания счётчиков;
  3. кассир вводит их в Community OS;
  4. система после применимых resource/financial процессов показывает актуальную задолженность;
  5. кассир озвучивает её;
  6. получает наличные;
  7. фиксируются Cash Acceptance / Payment / Allocation;
  8. при превышении суммы долга владелец может отказаться от сдачи и явно указать назначение остатка как будущего аванса, например на электроэнергию, воду или членские взносы;
  9. Community OS формирует и печатает ПКО/КО-1;
  10. квитанция отдаётся владельцу, ордер остаётся у Community;
  11. сведения позднее передаются в BAF по отдельному integration contract.
- Детали legacy display-name контрагента в BAF не являются архитектурным требованием Community OS и не должны становиться центром модели.
- Внешний внутренний номер записи BAF и печатный регистрационный номер ПКО являются разными идентификаторами.

---

## 4. Уже принятые ограничения проекта

Не пересматривай их без обнаруженного прямого противоречия:

- собственность, пользование, доступ, финансовые отношения и полномочия — разные отношения;
- Community OS не является системой регламентированного бухгалтерского/налогового/складского учёта;
- банковская транзакция ≠ Payment;
- Cash Acceptance ≠ Payment;
- Payment ≠ Payment Allocation;
- Expense ≠ Payment ≠ Financial Obligation;
- Document ≠ предметный факт;
- Document ≠ Revision ≠ Representation ≠ File;
- внешняя бухгалтерская система не владеет предметной моделью Community OS;
- external identifier не заменяет internal identity;
- один пользовательский workflow может координировать несколько bounded contexts, не объединяя их ownership;
- фундаментальная сущность вводится только при собственной устойчивой identity/истории/правилах, а не ради удобства реализации.

---

## 5. Draft под review — полный текст

# BP-DOC-CASH-001 — Формирование и выдача кассового документа

**Статус:** Draft  
**Контекст:** Документы и формализация  
**Связанные контексты:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику формирования, оформления и выдачи документа, связанного с приёмом или выдачей наличных денежных средств.

Для первого внедрения СТ практическая цель — не абстрактная генерация PDF, а быстрая документная часть реального кассового взаимодействия: кассир/бухгалтер получает актуальный финансовый контекст после применимых ресурсных и финансовых действий, принимает наличные, фиксирует их допустимое финансовое назначение и немедленно формирует/печатает кассовый документ. Это может быть единым пользовательским взаимодействием, но не объединяет Reading, Consumption, Accrual, Financial Obligation, Cash Acceptance, Payment, Payment Allocation и Document в один предметный факт.

Application-level Process Coordinator может координировать такое взаимодействие через опубликованные контракты участвующих контекстов. Настоящий BP владеет только document/formalization semantics и не присваивает себе resource/finance ownership.

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

Термин **Cash Document** в настоящем BP используется как контекстное обозначение Document, который оформляет/подтверждает cash-channel facts согласно document-kind policy, а не как новый фундаментальный тип или отдельную identity-модель.

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

## 12.1. Составное Representation и форма КО-1

Document Representation может быть составным, если конкретный document kind выражается одной печатной/электронной формой с несколькими предметно различимыми частями.

Для пилотного СТ рабочая модель типовой формы КО-1:

```text
Cash Document (ПКО)
→ historically significant Revision
→ composite KO-1 Representation
   ├─ ордер — остаётся у Community / кассира / бухгалтера
   └─ квитанция — выдаётся плательщику
```

Такое разделение частей Representation не вводит автоматически отдельные фундаментальные сущности `Document Part`, `Receipt` или второй Document.

Сохраняется граница:

```text
physical sheet / PDF
≠ Document cardinality
≠ Revision cardinality
```

Физический носитель может содержать несколько частей одного Representation, а в других document kinds — при достаточной предметной причине — несколько самостоятельных документов. Граница определяется document-kind semantics, а не количеством страниц, областей печати или линией отрыва.

Для КО-1 первого внедрения используется рабочее решение «один ПКО = один Document, ордер + квитанция = составное Representation». Если отдельный legal/formalization analysis установит иную обязательную юридическую семантику, она должна быть отражена явно, а не выводиться из layout формы.

Части составного Representation могут иметь разные правила обращения: хранения, подписания, выдачи, повторной печати и маркировки. Различие этих правил не превращает их автоматически в самостоятельные документы.

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

Повторная печать того же исторически значимого содержания обычно использует тот же Document, ту же Revision и то же предметное Representation, если повторно воспроизводится та же форма без предметно значимых изменений.

```text
reprint same Revision
≠ new Payment
≠ new Cash Acceptance/Disbursement
≠ new Document automatically
≠ new Revision automatically
```

Если applicable policy требует пометки `Копія`, `Дублікат`, `Повторна видача` или иной специальной формы, это может быть отдельным Representation той же Revision либо иным document action согласно виду документа.

Физический экземпляр, полученный повторным нажатием Print для того же Representation, не получает самостоятельную универсальную domain identity. Если document-kind policy считает факт повторной выдачи/экземпляр предметно значимым, соответствующая выдача должна быть прослеживаема отдельно без создания нового Payment или cash source fact.

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

## 16.1. Версия шаблона и регламентированной формы

Для historically significant Representation должно быть объяснимо, по какому document template / form version оно было сформировано, если версия формы предметно или юридически значима.

Следует различать:

```text
cosmetic rendering change
≠ semantic/regulatory form change
```

Изменение шрифта, переноса строки или технического layout не создаёт новую Revision автоматически. Но изменение состава обязательных реквизитов, структуры регулируемой формы, нормативно значимой маркировки либо иной semantic form requirement не должно молча переоформлять исторически выданное Representation как будто оно всегда выглядело по новой форме.

Для пилотной КО-1 version/provenance применимой формы должен быть восстановим в достаточном объёме. Это не требует копирования нормативного документа в Domain Model и не делает template самостоятельным financial fact.

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

## 18.1. Реквизиты внешней бухгалтерской формы

Наличие поля в кассовой или бухгалтерской форме не создаёт автоматически одноимённую фундаментальную сущность Community OS.

Например, внешняя форма может содержать:

- бухгалтерский счёт/субсчёт;
- код аналитического счёта;
- код целевого назначения;
- внешний «контрагент»;
- внешнее «основание/договор»;
- другой реквизит, требуемый конкретной бухгалтерской системой или формой.

Сохраняется граница:

```text
external/accounting field
≠ Community OS domain concept automatically
```

Такие значения могут формироваться из собственных предметных фактов Community OS, document-kind configuration, integration mapping либо другого достаточного источника и фиксироваться в historically significant Revision/Representation с необходимым provenance.

Community OS не должна создавать фиктивный Contractual Relationship, Subject, Budget Item, accounting account или иной предметный объект только потому, что внешний формат BAF/BAS ожидает соответствующее поле.

Внешняя display-строка, включая наименование «контрагента», может быть сохранена как исторически использованное содержание Representation или integration payload, но сама по себе не определяет payer, physical tenderer, owner, previous owner или Subject identity.

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

## 21.1. Производные финансовые сведения в документе

Документ может показывать производные сведения, например:

- задолженность до/после платежа;
- текущий баланс Personal Account;
- сумму remaining obligation;
- иной расчетный итог.

Такие сведения являются содержанием конкретной Revision/Representation на определённый момент и не становятся новым источником финансовой истины.

Если historically significant Revision включает derived financial value, должны быть объяснимы, где применимо:

- значение;
- момент/период, относительно которого оно вычислено;
- исходные financial facts/rules либо достаточный provenance расчёта.

Позднее изменение текущего баланса/задолженности не переписывает ранее выданную Revision.

```text
value printed on receipt
≠ current balance forever
≠ primary financial fact
```

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

- момент присвоения номера — draft, finalization или registration;
- серию;
- формат номера;
- область уникальности;
- дату регистрации;
- правила пропусков/аннулированных номеров;
- правила повторного использования номера;
- separate numbering for incoming/outgoing docs.

Не вводится universal требование «без разрывов» либо universal reuse-policy. Если номер уже стал historically significant через registration/issuance, его дальнейшая судьба должна быть объяснима и он не переиспользуется молча.

В интеграционном сценарии необходимо также различать внутренние идентификаторы внешних систем:

```text
Community OS Document identity
≠ document registration/printed number
≠ external source-system record identifier
≠ exported file name
```

Например, внутренний номер объекта ПКО в BAF не становится регистрационным номером ПКО Community OS и не определяет его identity. После экспорта Community OS может сохранять внешний reference/id как integration provenance для идемпотентности, сверки и последующих исправлений.

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

Для кассовой квитанции первое фактическое предоставление получателю historically significant Revision/Representation считается предметно значимым использованием: выданное содержание не переписывается молча.

Где это предметно значимо, должны быть объяснимы:

- кому предназначено Representation;
- кто выдал;
- когда;
- каким способом;
- было ли это первое или повторное предоставление, если policy различает их.

Настоящий BP не вводит universal Document Delivery state machine. Непосредственная выдача печатного экземпляра в рамках кассового interaction описывается настоящим BP только в необходимом объёме; техническая/удалённая доставка электронного Representation относится к коммуникационным/integration semantics.

Для составного Representation выдача одной части не означает выдачу всех частей. В пилотной КО-1 квитанционная часть может быть передана плательщику, тогда как ордерная часть остаётся у Community. Этот operational disposition должен быть объясним согласно document-kind policy без создания второго Payment или Cash Acceptance.

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

## 34. Основной сценарий пилотного СТ — показания, задолженность, наличные и ПКО

Основной operational scenario первого внедрения должен поддерживать быстрое обслуживание владельца у кассира/бухгалтера.

Пример последовательности:

1. кассир выбирает применимый участок / Personal Account и получает текущий финансовый контекст;
2. владелец сообщает новые показания электроэнергии и/или воды;
3. значения проходят `BP-READING-001`; только recognized Reading участвует в последующих ресурсных процессах;
4. применимые процессы Consumption / calculation / Accrual / Financial Obligation формируют или актуализируют финансовое состояние согласно своим правилам;
5. кассир видит текущую задолженность и её объяснимую расшифровку и озвучивает сумму владельцу;
6. владелец сообщает, какие обязательства/направления он намерен оплатить, если это отличается от допустимого default allocation;
7. владелец передаёт наличные;
8. немедленно возвращённая сдача учитывается при определении Cash Acceptance amount согласно `BP-CASH-001`;
9. фактически удержанная Community сумма образует Cash Acceptance и при достаточном основании — recognized Cash Payment(s);
10. `BP-FIN-ALLOCATION-001` фиксирует фактическое распределение Payment по обязательствам/допустимому финансовому смыслу;
11. если владелец передал сумму выше оплачиваемых текущих обязательств и сдача не возвращается, остаток не становится Advance автоматически: владелец/применимое правило должны установить допустимое назначение, например будущая электроэнергия, вода или членские взносы;
12. после фиксации применимых financial facts создаётся/финализируется Cash Document D1 вида приходного кассового документа;
13. Revision R1 фиксирует исторически значимое содержание документа;
14. формируется составное Representation применимой формы КО-1: ордерная часть для Community и квитанционная часть для плательщика;
15. кассир печатает форму; квитанция выдаётся плательщику, ордер остаётся у Community;
16. сбой принтера после фиксации Cash Acceptance/Payment не отменяет финансовые факты и допускает повторную печать согласно policy;
17. данные документа и связанных канонических операций могут позднее передаваться в BAF по отдельному integration semantic contract; успех или сбой этого экспорта не определяет существование ПКО, Cash Acceptance или Payment.

Для пользователя эти действия могут быть представлены одним быстрым interaction, например «принять показания и оплату», но координация не стирает границы bounded contexts и identity участвующих фактов.

### 34.1. Округление суммы вверх и аванс вместо сдачи

Если после расчёта текущие обязательства составляют 980,67 грн, владелец передаёт 1000 грн и явно просит не выдавать 19,33 грн сдачи, а оставить их для будущей электроэнергии:

```text
tendered amount = 1000,00
immediate returned change = 0
Cash Acceptance amount = 1000,00
recognized Payment = 1000,00

980,67 → applicable current obligations
 19,33 → Advance with established purpose: future electricity
```

Это не «оплата 980,67 + техническая сдача 19,33». Community фактически удержало 1000 грн.

Если владелец не определил допустимое назначение остатка и applicable rule также его не определяет, отсутствие сдачи само по себе не создаёт Advance. Остаток должен получить иной допустимый и объяснимый financial disposition либо не приниматься в таком виде.

Термин «аванс на статью» не используется нормативно, чтобы не смешивать назначение аванса со `Budget Item` (статьёй сметы).

### 34.2. Пользовательское взаимодействие ≠ единый предметный факт

Быстрый кассовый экран может координировать несколько действий:

```text
Reading recognition
→ applicable resource/financial calculation
→ current obligations view
→ Cash Acceptance
→ Payment recognition
→ Initial Payment Allocation
→ Cash Document finalization
→ print / issue
```

Но никакой UI workflow не превращает эту цепочку в одну универсальную `Cash Operation`, `Transaction` или `Visit` entity автоматически.

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

### 35.19. Registration number reserved, cash event does not occur

Document draft receives/reserves number according to local policy, but payer leaves without paying.

No Cash Acceptance/Payment is created.

Whether the number remains reserved, becomes cancelled/void or can be reused belongs to registration/document-kind policy. Historically significant registration/issuance is not silently erased.

### 35.20. Receipt shows balance after payment

Revision R1 prints:

```text
Payment = 1000
Debt after payment = 250
```

Later another Accrual changes current Debt to 700.

R1 remains historical with printed value 250 and its calculation time/provenance; it is not silently rerendered as 700.

### 35.21. Recipient refuses signature after taking cash

Cash Disbursement/Payment already occurred, but physical receiver refuses to sign the outgoing cash document.

Financial facts are not erased or rewritten automatically.

Signing/formalization outcome remains separate and requires applicable document/authority resolution.

### 35.22. Same Representation printed twice

Same finalized Revision and same rendering are sent to printer twice because first paper copy was damaged.

This is not automatically a new Document, Revision or Representation and never creates a second Payment/cash source fact.

### 35.23. Показания введены, владелец передумал платить

Recognized Reading и последующие допустимые resource/financial results сохраняются согласно своим owning processes.

Если наличные не переданы/не приняты:

```text
no Cash Acceptance
no Payment
no finalized cash document merely because debt was calculated
```

Предварительный preview/draft ПКО не является доказательством оплаты.

### 35.24. Точная оплата всей озвученной задолженности

Владелец передаёт ровно сумму выбранных обязательств, сдача отсутствует.

Cash Acceptance/Payment фиксируют фактически принятую сумму; Allocation соответствует подтверждённому financial meaning. ПКО отражает фактическое состояние на момент historically significant Revision.

### 35.25. Частичная оплата

Владелец оплачивает только часть задолженности или только отдельные обязательства.

Неоплаченная задолженность не исчезает. Document может показывать только фактически подтверждённые Payment/Allocation сведения согласно document policy.

### 35.26. Плательщик меняет назначение остатка до подтверждения

До historically significant financial confirmation владелец может изменить намерение, например выбрать Advance на воду вместо электроэнергии, если это допустимо applicable financial policy.

Изменяемое намерение не является уже состоявшимся Payment Allocation.

### 35.27. Больше текущей задолженности: сдача возвращена

Владелец передал сумму больше выбранных обязательств, но разница немедленно возвращена.

Согласно BP-CASH-001 immediate returned change уменьшает Cash Acceptance amount и не является Refund/outgoing Payment.

### 35.28. Больше текущей задолженности: остаток оставлен как Advance

Владелец явно указывает допустимое назначение не возвращённого остатка, например будущая электроэнергия.

Cash Acceptance/Payment включают всю фактически удержанную сумму; текущие obligations и Advance остаются различными financial meanings.

### 35.29. ПКО сформирован и оплата зафиксирована, принтер недоступен

Cash Acceptance, Payment и Allocation сохраняются.

Document/Revision сохраняются согласно document policy; printable Representation может быть напечатан позднее. Повторная печать не создаёт второй Payment или ПКО автоматически.

### 35.30. КО-1 напечатана как единый лист

Один finalized Cash Document имеет составное KO-1 Representation: ордер + квитанция.

После печати квитанционная часть выдаётся плательщику, ордерная часть остаётся у Community. Факт разделения физического листа не создаёт новый Document.

### 35.31. Экспорт в BAF после выдачи ПКО завершился ошибкой

ПКО уже сформирован/выдан, Cash Acceptance/Payment существуют.

```text
BAF export failed
≠ Cash Acceptance cancelled
≠ Payment cancelled
≠ Document invalidated automatically
```

Integration flow должен допускать безопасный retry/reconciliation без дублирования внешнего бухгалтерского объекта.

### 35.32. Внешний BAF ID отличается от номера ПКО

Community OS передаёт ПКО с регистрационным номером, а BAF создаёт собственный внутренний record/object id.

Оба значения сохраняются раздельно вместе с integration provenance. Внешний id не заменяет Document identity и не меняет напечатанный номер.

### 35.33. Внешняя display-строка контрагента не совпадает с предметной моделью Community OS

BAF может использовать собственный display name/legacy representation.

Community OS может передать/сохранить требуемое внешнее представление, но не выводит из него автоматически payer/owner/Subject semantics и не перестраивает собственную history of ownership по строке внешней системы.

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
28. Reprinting the same rendering does not create a new Document Representation automatically.
29. First issuance of a finalized receipt Representation is historically significant use unless applicable document semantics explicitly establish otherwise.
30. Derived balance/debt printed in a Revision is historical document content, not a live financial truth.
31. Community OS Cash Document ≠ fiscal/RRO/PRRO receipt automatically.
32. Numbering gaps/reuse/cancellation are document-kind registration semantics, not universal finance rules.
33. Composite Representation parts do not become separate Documents automatically.
34. Issuing one part of a composite Representation does not imply issuing all parts.
35. Physical sheet/PDF/file boundaries do not define Document cardinality.
36. Community OS Document identity ≠ registration number ≠ external BAF/BAS record id ≠ file name.
37. External/accounting form fields do not create corresponding Community OS domain concepts automatically.
38. Export to BAF/BAS ≠ Cash Acceptance/Payment/Document creation or validity.
39. BAF/BAS export failure does not cancel already valid Community OS financial/document facts.
40. Historically significant regulated/form template provenance must remain explainable where materially required.
41. One fast user interaction may coordinate Reading/finance/document actions without merging their identities or bounded-context ownership.

## 36.1. Фискальный документ / РРО-ПРРО boundary

Документ, сформированный Community OS по настоящему BP, **не является автоматически фискальным чеком, расчётным документом РРО/ПРРО либо доказательством выполнения всех требований кассовой дисциплины конкретной юрисдикции**.

```text
Community OS Cash Document
≠ fiscal receipt automatically
≠ RRO/PRRO document automatically
```

Если для конкретного community/операции законодательство требует фискализации, специальной формы, регистрации, внешнего устройства/сервиса или дополнительного документа, это определяется отдельной legal/formalization policy и integration contract.

Настоящий BP не должен создавать ложное ощущение юридического соответствия только потому, что квитанция успешно распечатана.

## 36.2. Граница Community OS → BAF/BAS

Для пилотного направления целевым является сценарий, в котором ПКО ведётся и печатается в Community OS, а необходимые данные затем передаются во внешнюю бухгалтерскую систему.

```text
Community OS source/domain facts
→ Community OS Cash Document / KO-1 Representation
→ optional accounting export
→ BAF/BAS external accounting object
```

Сохраняются границы:

```text
Document formalization
≠ accounting export

Community OS financial fact
≠ BAF/BAS accounting representation
```

Community OS остаётся владельцем своих Cash Acceptance, Payment, Payment Allocation, Advance, Financial Obligation и Document semantics. BAF/BAS может получить бухгалтерское представление этих данных и создать собственный объект с собственным external id.

Конкретный mapping контрагента, договора/аналитики, бухгалтерских счетов, субсчетов, кодов и иных BAF/BAS реквизитов относится к отдельному integration semantic contract (REF-INT-001), а не к фундаментальной модели настоящего BP.

Экспорт должен в перспективе поддерживать sufficient provenance, idempotent retry и reconciliation. Настоящий BP фиксирует только границу и не проектирует протокол интеграции.

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
- UI layout/конкретный экран кассира;
- конкретный BAF/BAS transport/API/file format;
- mapping Community OS → бухгалтерские счета/субсчета/аналитику BAF/BAS;
- правила создания/обновления/пометки удаления внешнего объекта BAF/BAS;
- reconciliation protocol и конкретную очередь повторной выгрузки.

## 38. Связанные документы

- ADR-004;
- ADR-005;
- ADR-006;
- ADR-009;
- ADR-010;
- ADR-011;
- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- `BP-CASH-001-CASH-PAYMENT-RECEIPT.md`;
- `BP-CASH-002-CASH-PAYMENT-DISBURSEMENT.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-READING-001-READING-RECOGNITION.md`;
- REFERENCE_CANDIDATE_MATRIX.

## 39. Нормативные последствия

Internal review вывод:

- отдельный BP оправдан как cross-context formalization process; одной document-kind policy недостаточно для описания связи financial/source facts с Document/Revision/Representation/issuance/correction;
- новый ADR не требуется;
- новая fundamental Document/Receipt entity не требуется;
- `Cash Document` остаётся контекстным обозначением Document, отдельный фундаментальный термин в TERMINOLOGY предварительно не требуется;
- DOMAIN_MODEL/TERMINOLOGY фундаментально менять не требуется;
- ADR-009 уже содержит Document/Revision/Representation/Signing/Registration;
- ADR-006 и cash BP уже отделяют документ от financial/source facts;
- составная форма КО-1 не требует новой fundamental `Document Part`/Receipt entity: для пилота достаточно composite Representation semantics;
- один быстрый кассовый interaction может координироваться application-level Process Coordinator без введения universal Cash Operation/Visit entity;
- Community OS может быть системой, где ПКО создаётся/нумеруется/печатается, а BAF/BAS получает downstream accounting representation; это не меняет границу внешней бухгалтерии;
- external BAF/BAS record id должен храниться как integration provenance/reference и не смешиваться с Document identity/registration number;
- mapping бухгалтерских реквизитов BAF/BAS остаётся отдельным integration contract REF-INT-001.

После review проверить:

- нужен ли отдельный термин `Cash Document` или достаточно document-kind semantics;
- нужен ли mirror-note в BP-CASH-001/002;
- нужен ли отдельный candidate для legal/fiscal cash-document requirements;
- нужно ли нормативно закреплять reprint/duplicate semantics вне настоящего BP.

## 40. Фокус следующего review

После pilot-ST stress review основная архитектурная модель считается следующей рабочей гипотезой для независимого review:

1. отдельный BP оправдан как cross-context document formalization process;
2. `Cash Document` остаётся specialization/contextual shorthand for Document, а не новой fundamental entity;
3. для пилотной КО-1 используется один Document с composite Representation «ордер + квитанция»;
4. квитанционная часть может выдаваться плательщику независимо от retention ордерной части;
5. first actual issuance finalized content является historically significant use;
6. reprint same finalized content не создаёт автоматически новый Document/Revision/Payment;
7. regulated template/form version требует sufficient provenance там, где она предметно значима;
8. external BAF/BAS fields и IDs остаются integration/accounting representation, а не доменной моделью Community OS;
9. ПКО может создаваться/нумероваться/печататься в Community OS и экспортироваться в BAF/BAS позднее;
10. один быстрый кассовый interaction может координировать Reading → finance → document actions без слияния bounded contexts.

Независимому review требуется прежде всего проверить:

- не создаёт ли composite Representation скрытую необходимость самостоятельной identity частей;
- достаточно ли ADR-009 для template/form provenance;
- корректно ли проведена граница document issuance vs physical part handoff;
- нет ли конфликтов с BP-CASH-001/BP-FIN-ALLOCATION-001 при exact payment/change/Advance scenarios;
- не превратился ли «быстрый кассовый сценарий» в скрытую universal transaction entity;
- достаточно ли отделён BAF/BAS accounting export от Document/Payment semantics;
- какие положения должны остаться на уровне document-kind policy, а какие оправданно закреплены в BP;
- какие вопросы нельзя закрывать до REF-DOC-005 legal/formalization analysis для Украины.

## 41. Следующий шаг

1. сверить обновлённый Draft с актуальным `main` и связанными BP/ADR;
2. зафиксировать pilot-ST stress review на реальном сценарии КО-1;
3. подготовить независимый multi-review package для Claude, DeepSeek и Gemini;
4. консолидировать замечания и внести только обоснованные point fixes;
5. синхронизировать REFERENCE_CANDIDATE_MATRIX и необходимые mirror-notes;
6. после принятия BP отдельно выполнить REF-DOC-005 — актуальный legal/formalization analysis украинских требований к ПКО/РКО, кассовой дисциплине и RRO/PRRO boundary;
7. интеграционный контракт Community OS → BAF/BAS проектировать отдельно в REF-INT-001;
8. после завершения PR #59 вернуться к Stage 10: stress-review необходимости самостоятельных Survey и Survey Response до создания BP-SURVEY-001.


---

## 6. Нормативный контекст — ADR-009

# ADR-009. Архитектура документов, публикаций, обращений и коммуникаций

**Статус:** Accepted / Принято
**Дата:** 2026-09-06
**Область:** документы, формализация, публикации, обращения и предметные коммуникации Community OS

## Контекст

Community OS должна поддерживать документы и коммуникации садовых товариществ, ОСББ, ЖСК, коттеджных посёлков, гаражных и парковочных кооперативов и других сообществ. В этих сообществах используются уставы, протоколы, решения, договоры, заявления, акты, счета, отчёты, уведомления, новости, объявления и другие материалы. Их назначение, правила изменения, оформления, публикации, регистрации и юридические последствия различаются.

ADR-002 уже выделяет два самостоятельных предметных контекста:

- **Документы и формализация**;
- **Коммуникации и обращения**.

Настоящий ADR развивает семантику этих контекстов и их взаимодействия, но не объединяет их в один bounded context и не определяет их техническое отображение на приложения, сервисы, схемы данных или единицы развёртывания.

ADR-001 и ADR-008 отделяют документ от права, голосования, установленного результата и управленческого решения. ADR-003–ADR-005 задают границы конфигурации, правил, истории, происхождения и исправлений. ADR-006 и ADR-007 отделяют документ от финансовых и ресурсных фактов. Эти различия сохраняются.

## Проблема

Текущая документация признаёт документ, публичный документ, обращение, новость, объявление и уведомление, но не задаёт достаточной общей семантики их идентичности, редакций, представлений, публикаций и исторически значимых действий.

Без такой семантики возникают опасные упрощения:

- документ отождествляется с файлом или единственным представлением;
- новая редакция молча заменяет исторически значимое содержание;
- опубликованность превращается в универсальное состояние документа;
- публикация смешивается с техническим доступом или доставкой;
- документ принимается за оформленное им решение, обязательство, платёж или ресурсный факт;
- подпись, утверждение, публикация и регистрация считаются одним действием;
- обращение сводится к сообщению пользователя системы или универсальному workflow обработки;
- уведомление считается отправленным, доставленным, прочитанным или юридически состоявшимся уже при его формировании;
- новость и объявление принудительно становятся документами;
- документы и коммуникации объединяются универсальными сущностями сообщения, события, адресата или контента.

Такие допущения не подходят одновременно для разных видов документов, коммуникаций, сообществ и локальных юридических моделей.

## Границы решения

ADR определяет:

- минимальную предметную семантику документа;
- стабильную идентичность документа, его редакции и отношения между документами;
- различия документа, редакции, представления и файла;
- историческую семантику изменений, исправлений, замены и отзыва;
- предметную семантику подписания и регистрации;
- публикацию документа и открытую семантику аудитории;
- общую семантическую рамку коммуникаций без универсальной сущности коммуникации;
- обращения, уведомления, новости и объявления;
- различия формирования уведомления, отправки, доставки, получения, прочтения и юридически значимого уведомления;
- контекстные роли вложения и направления документа;
- владение семантикой между двумя контекстами ADR-002;
- границы с субъектами, полномочиями, управлением, финансами и ресурсным учётом;
- применимые требования истории, происхождения, конфигурации и правил.

ADR не определяет универсальный жизненный цикл документов или коммуникаций, технический доступ, способы доставки, форматы файлов и подписей, хранение, API, структуру данных или требования конкретной юрисдикции.

## Решение

### 1. Два самостоятельных предметных контекста

Сохраняются принятые ADR-002 контексты **«Документы и формализация»** и **«Коммуникации и обращения»**.

Контекст документов владеет предметной семантикой:

- документов и их стабильной идентичности;
- редакций документов;
- представлений документов;
- отношений между документами;
- публикаций документов;
- подписания и регистрации документов;
- документных связей с предметами других контекстов.

Контекст коммуникаций владеет предметной семантикой:

- обращений;
- уведомлений;
- новостей и объявлений;
- адресной и аудиторной направленности коммуникационных материалов;
- предметно значимых результатов коммуникации, если они предусмотрены соответствующим процессом.

Один предметный процесс может использовать понятия обоих контекстов. Например, обращение может иметь приложенный документ, уведомление может ссылаться на финансовое обязательство, а новость может сопровождаться опубликованной редакцией документа. Такие связи не объединяют контексты и не передают владение понятиями.

Настоящий ADR не вводит отдельный общий контекст документов и коммуникаций. Совместное рассмотрение двух контекстов в одном ADR не означает их технического или предметного слияния.

### 2. Документ

**Документ** — предметно распознаваемый информационный объект со стабильной идентичностью, относящийся к деятельности сообщества и признаваемый документом согласно семантике его вида и применимым правилам.

Документ может оформлять, фиксировать, представлять или подтверждать предметное содержание, факт, основание, результат либо решение, а в предусмотренных случаях сам быть основанием. Из этого не следует, что документ становится тем предметом, который он оформляет или подтверждает.

Сохраняются различия:

```text
Документ
≠ предметный факт
≠ основание
≠ источник данных
≠ подтверждающие сведения
≠ действие фиксации
```

Не вводится универсальная сущность `Document Fact`, общий предок всех предметных фактов или универсальная связь документа с абстрактным `Domain Fact`. Отношения документа с предметами других контекстов имеют локальную семантику: оформляет, подтверждает, фиксирует, представляет, служит источником, является основанием либо выражает другое предметно определённое отношение.

### 3. Идентичность документа и редакция

Документ имеет стабильную предметную идентичность, позволяющую отличить его от редакций, представлений и связанных документов.

**Редакция документа** — исторически определимое состояние содержания конкретного документа, выделенное как редакция согласно семантике вида документа и применимым правилам.

Не устанавливается универсальный критерий, когда изменение означает:

- изменение изменяемого черновика без новой редакции;
- новую редакцию того же документа;
- исправление редакции;
- новый документ, заменяющий предыдущий;
- отзыв, отмену или прекращение применимости;
- другое предметно значимое изменение.

Этот выбор определяется видом документа и применимыми правилами. При этом должны сохраняться стабильная идентичность документа, идентичность существенной редакции и предметно значимые отношения между документами или редакциями там, где они необходимы для объяснения истории.

Документы могут быть связаны, например, отношениями замены, дополнения, отмены, исправления или иной локально определённой связи. Этот открытый перечень не является универсальной иерархией типов отношений.

### 4. Черновик и исторически значимое содержание

Черновое содержание может изменяться в пределах, допускаемых видом документа и применимыми правилами. Наличие черновика не вводит обязательный универсальный статус или общий жизненный цикл всех документов.

Если редакция использована в предметно значимом действии, например подписана, утверждена, зарегистрирована, опубликована, отправлена, получена либо послужила основанием другого факта, её исторически значимое содержание не переписывается молча.

Последующее изменение должно сохранять различимость исходной редакции, характера изменения и новой редакции или нового документа в объёме, требуемом предметной семантикой. Это не требует неизменяемости любого чернового символа, универсального архива всех промежуточных состояний или event sourcing.

### 5. Документ, представление и файл

**Представление документа** — предметно различимая форма, в которой конкретная редакция документа выражена, предъявлена или подготовлена для использования.

Сохраняется инвариант:

```text
Документ ≠ Редакция документа ≠ Представление документа ≠ Файл
```

Документ может существовать без файла и иметь от нуля до нескольких представлений. Представление может быть текстовым, структурированным, визуальным, печатным или иным образом предметно определённым. Эти примеры не образуют закрытой классификации.

Представление не обязано быть файлом. Файл является возможным техническим или переносимым носителем представления и не определяет предметную идентичность документа автоматически. Один файл не объявляется универсально равным одному документу, одной редакции или одному представлению.

Отдельная обязательная универсальная сущность содержания документа не вводится. Семантическое содержание должно быть отличимо от представления там, где это необходимо, но способ его предметного структурирования определяется видом документа.

### 6. Отношения документа с другими предметами

Документ может иметь несколько предметно типизированных связей с объектами, отношениями, действиями, результатами и решениями других контекстов. Конкретный контекст сохраняет владение собственным предметом.

В частности:

- протокол может оформлять сведения о собрании, голосовании, установленном результате или решении;
- заявление может быть документом, связанным с обращением;
- документ поставщика может быть источником, подтверждением или основанием финансового процесса;
- акт или отчёт может относиться к инженерной системе, точке учёта или ресурсному процессу;
- документ может относиться к субъекту, объекту собственности, органу управления или управленческой процедуре.

Наличие связи не создаёт универсального автоматического последствия. Документ поставщика не создаёт финансовое обязательство только из-за своего существования, а протокол не создаёт и не заменяет управленческое решение без предусмотренного предметного основания.

### 7. Роли в создании и обращении документа

В отношении документа могут быть предметно значимы разные роли и действия, включая:

- инициатора;
- автора содержания;
- составителя;
- издателя;
- утверждающего;
- подписанта;
- регистратора;
- отправителя.

Эти роли не образуют обязательный универсальный набор, не обязаны присутствовать у каждого документа и не обязаны принадлежать одному субъекту.

Следует различать орган управления, субъект, должность и полномочие. Документ может относиться к действию органа. Если действие по своей предметной семантике совершается субъектом, должны быть определимы фактически действовавший субъект и, где применимо, основание его действия. Компетенция органа не заменяет полномочие субъекта действовать от имени органа или в его составе.

Автоматическое выполнение технической или предметно допустимой операции не превращает автоматизированный механизм в субъект и не подменяет требуемую предметной семантикой атрибуцию субъекта. Универсальный тип автоматизированного действующего лица не вводится.

Предметная допустимость действий и семантика прав доступа относятся к Stage B; техническая реализация и enforcement соответствующих решений относятся к Stage K. Настоящий ADR фиксирует только необходимость сохранять предметно значимую атрибуцию и основание там, где это требуется семантикой действия.

### 8. Подписание

**Подписание документа** — исторически значимое действие над конкретной редакцией документа или её определённым представлением с определимым подписантом и, где применимо, основанием действия от собственного или чужого имени.

Подписание не тождественно утверждению, регистрации или публикации:

```text
Подписание ≠ Утверждение ≠ Регистрация ≠ Публикация
```

Одну редакцию могут подписывать несколько субъектов, если это предусмотрено видом документа и применимыми правилами. Подписание одним субъектом не создаёт автоматически подписание другим субъектом или органом управления.

Новая редакция не наследует автоматически подписание предыдущей редакции. Изменение представления после подписания не сохраняет автоматически применимость прежнего подписания; последствия определяются предметной семантикой вида подписания и документа.

Если субъект подписывает от имени органа или другого субъекта, должны быть определимы действовавший субъект, представляемый субъект или орган, основание и применимость полномочия к действию в требуемом объёме. Настоящий ADR не определяет конкретную модель полномочий.

Подписание в предметном смысле не требует выбора КЭП, PKI, сертификатов, криптографии или технического формата электронной подписи.

### 9. Утверждение

**Утверждение документа** — предметно значимое признание конкретной редакции утверждённой в пределах применимой процедуры и правил, если вид документа предусматривает такое действие.

Утверждение не является обязательным для каждого документа и не создаёт универсальный статусный переход. Оно не тождественно управленческому решению: решение может служить основанием утверждения документа либо непосредственно определять его предметный эффект, но документ и решение сохраняют самостоятельность.

### 10. Регистрация и нумерация

**Регистрация документа** — допустимое исторически значимое действие признания документа или его редакции зарегистрированными в определённом предметном контексте, если это предусмотрено видом документа и применимыми правилами.

Регистрация не обязательна для каждого документа. Настоящий ADR не вводит универсальный реестр, обязательную запись реестра, общую систему серий или сквозную нумерацию Community OS.

Сохраняются различия:

```text
Идентичность документа ≠ Регистрационный номер ≠ Запись реестра
```

Регистрационный номер, входящий, исходящий или внутренний номер, дата регистрации, серия и правила уникальности являются локальными характеристиками соответствующего вида регистрации. Они не определяют идентичность документа автоматически.

### 11. Входящий, исходящий и внутренний документ

Характеристики «входящий», «исходящий» и «внутренний» являются контекстными ролями или классификациями документа относительно конкретной коммуникации, регистрации, сообщества или участника.

Они не являются обязательными универсальными подтипами документа. Один документ может иметь разные роли в разных предметных контекстах. Локальная модель может закреплять такие классификации и их последствия в применимых правилах.

### 12. Публикация документа

**Публикация документа** — отдельный исторически значимый предметный факт предоставления конкретной редакции документа или её определённого представления определимой аудитории согласно применимым правилам.

Публикация не является основной универсальной стадией или состоянием документа. Характеристика «опубликован» может быть производным представлением либо локальным состоянием, если это требуется конкретным процессом.

Сохраняются различия:

```text
Документ ≠ Редакция документа ≠ Публикация документа
Публикация ≠ Аудитория ≠ Техническая доставка ≠ Технический доступ
```

Аудитория характеризует предметную направленность публикации, но не является самой публикацией.

Один документ может иметь несколько публикаций для разных редакций, представлений, аудиторий или моментов. Повторная публикация является новым исторически значимым фактом, если её самостоятельность существенна для процесса.

Отзыв, прекращение или замена публикации не стирает факт предыдущей публикации. Публикация новой редакции не изменяет автоматически историю публикации предыдущей.

Публикация управленческого решения, протокола или финансового документа не передаёт документному контексту владение решением либо финансовым фактом.

### 13. Аудитория и предметная доступность

**Аудитория** используется как открытая предметная семантика того, кому предназначены документ, публикация или коммуникационный материал. Из этого не следует обязательная универсальная сущность аудитории или закрытый перечень её видов.

Аудитория может быть выражена конкретным субъектом, группой субъектов либо предметно определимым условием или отношением, если это допускают применимые правила. Например, аудитория может определяться отношением с сообществом, объектом или органом управления, но эти примеры не образуют универсальный enum.

Следует различать:

```text
Предназначенная аудитория
≠ право доступа
≠ технически предоставленный доступ
≠ фактический получатель доставки
≠ фактический читатель
```

Предметная публичность означает предназначенность неопределённому кругу либо другой открыто определённой аудитории согласно семантике конкретной публикации. Она не должна определяться только отсутствием авторизации или размещением в определённой части пользовательского интерфейса.

Семантика прав доступа, authorization, пользовательских ролей и permissions относится к Stage B. Техническая реализация, хранение и enforcement этих решений относятся к Stage K. Публикация и предназначенность аудитории сами по себе не предоставляют технический доступ.

### 14. Общая семантическая рамка коммуникаций

Для предметных коммуникаций могут быть значимы:

- инициатор;
- адресат или аудитория;
- содержание;
- предмет коммуникации;
- существенные моменты и периоды;
- основание;
- связанные документы и предметы других контекстов;
- исторически значимые действия и результаты.

Этот перечень не является обязательным набором характеристик любой коммуникации. Он не вводит универсальную сущность `Communication`, `Message`, общий workflow или общий жизненный цикл.

Обращение, уведомление, новость, объявление и другие локальные виды коммуникационных материалов сохраняют собственную идентичность и правила. Общая семантика нужна для согласования различий, но не создаёт общего агрегата или владельца всего информационного взаимодействия.

### 15. Обращение

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом.

Инициатор обращения не обязан быть пользователем системы. Субъект и пользовательская учётная запись не тождественны. Если инициатор является субъектом, его идентичность принадлежит контексту субъектов; способ технической аутентификации и действия от чужого имени относятся к Stage B.

Обращение может выражать заявление, запрос, жалобу, сообщение о неисправности, запрос документа, просьбу о перерасчёте или другой предметно определённый вид. Этот перечень открыт и не создаёт универсальную классификацию обращений.

Сохраняются различия:

```text
Обращение ≠ Документ ≠ Сообщение ≠ Заявка технической поддержки ≠ Управленческая процедура
```

Обращение может иметь связанный документ, а заявление может одновременно иметь документную форму. Это не делает обращение и документ одним понятием.

Обращение также не является операционной работой. Оно может быть одним из оснований Operational Work, но:

```text
Appeal ≠ Operational Work
one Appeal → 0..N Operational Works
one Operational Work → 0..N Appeals
```

Operational Work может существовать без Appeal; завершение Work не закрывает Appeal автоматически. Фактическое выполнение, назначения и Work Result принадлежат контексту «Операционная деятельность», а коммуникационный контекст отдельно определяет рассмотрение, ответ и завершение Appeal по применимым правилам.

Не вводится универсальный жизненный цикл обращения. Принятие, рассмотрение, запрос уточнения, подготовка ответа, перенаправление, завершение или иные действия применяются только там, где они предусмотрены видом обращения и правилами процесса.

### 16. Ответ и иные связанные коммуникации

Ответ может быть самостоятельным коммуникационным материалом, связанным с обращением, если соответствующий процесс предполагает ответ. Не каждое обращение обязано иметь ответ.

Последующие обращения, ответы и уведомления могут сохранять предметно значимые связи друг с другом без введения универсальной цепочки сообщений или обязательной сущности диалога.

### 17. Уведомление

**Уведомление** — самостоятельное предметное понятие коммуникационного контекста с определимым содержанием и адресатом или аудиторией, предназначенное сообщить предметно значимую информацию.

Уведомление может ссылаться на решение, обязательство, задолженность, платёж, документ, ресурсный факт, управленческую процедуру или иной предмет. Оно не становится этим предметом и не изменяет его автоматически.

Формирование уведомления отличается от:

- отправки;
- попытки доставки;
- успешной технической доставки;
- предметно признанного получения;
- прочтения;
- подтверждения;
- юридически значимого уведомления.

Эти понятия не образуют обязательную универсальную последовательность:

```text
Уведомление сформировано
≠ отправлено
≠ доставлено
≠ получено
≠ прочитано
≠ юридически уведомлено
```

Конкретный процесс может использовать только часть этих различий. Юридически значимый эффект определяется применимыми локальными правилами и не следует автоматически из технического статуса доставки.

Предметное уведомление существует независимо от конкретного канала доставки. Несколько попыток или каналов не создают автоматически несколько уведомлений, но локальная семантика может предусматривать отдельные уведомления для разных адресатов или предметов.

### 18. Отправка, доставка, получение и прочтение

Если это существенно для предметного процесса, должны быть различимы:

- решение или обязанность отправить материал;
- предметное действие отправки;
- техническая попытка доставки;
- результат технической доставки;
- предметное признание получения;
- факт прочтения или подтверждения.

Техническая попытка доставки и её результат принадлежат интеграционной или инфраструктурной функции. Коммуникационный контекст может использовать полученные сведения и признавать предметно значимый результат согласно применимым правилам, не присваивая технический протокол.

Отсутствие доставки по одному каналу не отменяет автоматически уведомление или доставку по другому каналу. Приоритет каналов, повторные попытки, адреса доставки и внешние подтверждения относятся к Stage J и Stage K.

### 19. Новость и объявление

**Новость** и **объявление** являются самостоятельными коммуникационными материалами сообщества. Они не являются обязательными специализациями документа и не тождественны публикации.

Сохраняются различия:

```text
Новость / Объявление ≠ Документ ≠ Публикация документа
```

Новость или объявление могут иметь явную связь с документом, редакцией, представлением или публикацией документа. Если коммуникационный материал сам признаётся документом согласно семантике его вида, его документная идентичность должна быть явной и не следует автоматически из факта размещения для аудитории.

Предоставление новости или объявления аудитории определяется локальной коммуникационной семантикой. Оно не обязано создавать публикацию документа, если документ отсутствует.

### 20. Вложение и приложение

**Вложение** или **приложение** обозначает контекстную роль либо предметно значимое отношение, связывающее обращение или иной коммуникационный материал с документом, редакцией документа или представлением документа.

Сохраняются различия:

```text
Вложение ≠ Документ ≠ Редакция документа ≠ Представление документа ≠ Файл
```

Самостоятельная универсальная идентичность вложения не вводится. Если приложенный материал является документом, его идентичность принадлежит документному контексту. Если это только представление, его связь определяется соответствующим документом и коммуникацией.

### 21. Временная семантика

В зависимости от вида документа или коммуникации могут быть предметно значимы разные моменты и периоды:

- создание документа;
- дата документа;
- изменение черновика;
- возникновение редакции;
- утверждение;
- подписание;
- регистрация;
- публикация и отзыв публикации;
- отправка;
- доставка;
- получение;
- прочтение или подтверждение;
- вступление в силу;
- период применимости;
- прекращение, отзыв, отмена или замена.

Не каждое понятие обязано иметь все эти характеристики. Одинаково названные моменты могут иметь разную семантику у разных видов документов и коммуникаций. Настоящий ADR не вводит универсальный набор временных отметок, обязательную bitemporal-модель или единую дату документа.

### 22. Исправления и историческая сохранность

Следует различать, где применимо:

- изменение черновика;
- новую редакцию;
- исправление ошибочного содержания;
- новый документ, заменяющий прежний;
- отзыв или отмену документа;
- отзыв публикации;
- исправление адресата или аудитории;
- повторную отправку;
- исправление ошибочного уведомления;
- изменение оценки или последствий ранее переданной информации.

Эти действия не следуют друг из друга автоматически и не образуют универсальную операцию исправления. Исправление документа не исправляет автоматически предметный факт другого контекста. Исправление предметного факта не переписывает автоматически связанный документ.

Исторически значимые редакции, публикации, подписания, регистрации, обращения и уведомления не переписываются молча. Последующие изменения сохраняют прослеживаемую связь с исходным состоянием в объёме, требуемом предметной семантикой.

Настоящий ADR не требует универсального неизменяемого архива файлов, полного сохранения всех промежуточных черновиков, event sourcing или глобального журнала событий.

### 23. Происхождение и объяснимость

Для исторически значимого документа или коммуникационного результата должны быть определимы, где применимо:

- идентичность документа и использованная редакция;
- существенное содержание;
- использованное представление;
- происхождение и источник сведений;
- предметное основание;
- инициатор и фактически действовавший субъект;
- действие от имени другого субъекта или органа;
- применимая версия правила;
- аудитория или адресат;
- подписание, утверждение, регистрация или публикация;
- связанные предметы других контекстов;
- последующие исправления, замены, отзывы и изменения последствий.

Конкретный состав определяется видом документа или коммуникации. Этот перечень не образует универсальную запись аудита, сущность происхождения или обязательный snapshot всей системы.

### 24. Конфигурация и правила

Конфигурация может определять допустимые виды документов и коммуникационных материалов, локальные классификации, доступные способы оформления, аудитории, политики публикации и другие специализации. Она не заменяет документ, редакцию, публикацию, обращение, уведомление или иной исторический факт.

Правила могут определять:

- критерий новой редакции или нового документа;
- допустимость и последствия утверждения, подписания, регистрации, публикации, исправления, замены или отзыва;
- формирование аудитории;
- применимые действия над обращением;
- предметный эффект отправки, получения или юридически значимого уведомления;
- иные локально значимые условия.

Правила и их версии соответствуют ADR-005. Не вводятся универсальный документный Rule, отдельный Document Configuration Context или единый механизм исполнения правил.

## Границы предметных контекстов

### Документы и управление

Документ может оформлять, фиксировать, представлять или подтверждать управленческую процедуру, собрание, вопрос, голосование, установленный результат или управленческое решение.

Сохраняется инвариант:

```text
Документ ≠ Управленческое решение
```

Управленческое решение принадлежит контексту управления. Протокол, выписка или опубликованная редакция документа не заменяют решение и не изменяют его автоматически. Решение может быть основанием создания, утверждения или публикации документа согласно применимой процедуре.

### Документы и финансы

Документ может относиться к начислению, обязательству, платежу, задолженности, расходу или другому финансовому предмету, быть источником сведений, подтверждением либо допустимым основанием.

Сохраняются различия:

```text
Документ ≠ Начисление ≠ Финансовое обязательство ≠ Платёж
```

Документ поставщика, счёт, акт, квитанция, кассовый или банковский документ не создают и не изменяют финансовый факт автоматически. Финансовые последствия определяет финансовый контекст согласно собственным правилам.

Dynamic financial Read Model / Projection не является Document или Publication автоматически. Если требуется historically fixed official financial disclosure, используется обычная цепочка Document / Revision / Representation / Publication; при этом document context не получает ownership исходных financial facts.

Если новый financial report исправляет, заменяет или отзывает ранее опубликованный report, связь с соответствующей Revision/Publication должна быть исторически прослеживаемой в объёме, требуемом процессом.

### Документы и ресурсный учёт

Документ может относиться к ресурсу, инженерной системе, месту потребления, точке учёта, прибору, установке прибора, показанию, потреблению, контрольной сверке, расчётному небалансу или эксплуатационной потере.

Сохраняются различия:

```text
Документ ≠ Показание ≠ Потребление ≠ Расчётный небаланс ≠ Эксплуатационная потеря
```

Документ не создаёт и не изменяет ресурсный факт автоматически. Ресурсный контекст может использовать документ как источник, подтверждение или основание в пределах собственной семантики.

### Документы и коммуникации

Коммуникационный материал может иметь документную форму или ссылаться на документ, его редакцию, представление либо публикацию. Документный контекст владеет документной идентичностью и публикацией документа; коммуникационный контекст владеет обращением, уведомлением, новостью, объявлением и их предметной направленностью.

Обращение или уведомление не становится документом автоматически. Документ не становится обращением, уведомлением, новостью или объявлением только из-за использования в коммуникации.

### Коммуникации и субъекты

Контекст субъектов владеет идентичностью субъектов. Коммуникационный контекст использует субъектов как инициаторов, адресатов, получателей или иных участников предметно определённого отношения, но не присваивает их идентичность.

Пользовательская учётная запись не тождественна субъекту. Наличие учётной записи не создаёт автоматически предметную возможность инициировать, получить, прочитать или подтвердить коммуникацию.

### Коммуникации, полномочия и органы управления

Семантика полномочий и представительства принадлежит соответствующему контексту. Контекст коммуникаций определяет применимость этих отношений к конкретному обращению, уведомлению, ответу или иному действию, не создавая собственную модель полномочий.

Орган управления не тождествен субъекту. Коммуникация может быть адресована органу или исходить от него, однако фактически действовавший субъект и основание действия должны быть определимы там, где это предметно существенно.

### Публикация, аудитория и доступ

Документный контекст владеет фактом публикации документа и её предназначенной аудиторией. Аудитория характеризует предметную направленность публикации, но не является самой публикацией. Контекст коммуникаций может использовать публикацию и описывать направленность коммуникационного материала.

Предметная аудитория и публичность не определяют право доступа автоматически. Семантика прав доступа, authorization, пользовательских ролей и permissions относится к Stage B; их техническая реализация, хранение и enforcement относятся к Stage K.

Для dynamic Read Model используется собственная visibility/authorization semantics согласно ADR-013. Technical viewer scope dynamic projection не становится `Audience` автоматически. Если доступ к financial projection включает ссылку/метаданные Document, projection может раскрывать только те document metadata, которые допустимы соответствующим public/read contract и предметной доступностью документа; доступ к Revision/Representation проверяется document context независимо.

### Уведомление и доставка

Контекст коммуникаций владеет уведомлением и предметным признанием значимых результатов коммуникации. Интеграционная или инфраструктурная функция владеет техническими попытками и протоколами доставки.

Сведения о технической доставке могут быть источником для предметного признания получения или юридически значимого уведомления, но не создают такой факт автоматически.

## Архитектурные инварианты

1. Контексты «Документы и формализация» и «Коммуникации и обращения» самостоятельны и не объединяются настоящим ADR.
2. Документ имеет стабильную предметную идентичность.
3. Критерий новой редакции того же документа или нового документа определяется видом документа и применимыми правилами.
4. Документ, редакция документа, представление документа и файл не тождественны.
5. Документ может существовать без файла и иметь от нуля до нескольких представлений.
6. Универсальная сущность содержания документа не вводится.
7. Исторически значимое содержание не переписывается молча.
8. Публикация документа является отдельным исторически значимым фактом, связанным с конкретной редакцией или представлением и определимой аудиторией.
9. Опубликованность не является обязательным универсальным состоянием документа.
10. Отзыв публикации не стирает факт предыдущей публикации.
11. Публикация, аудитория, право доступа, технический доступ, доставка и фактический читатель не тождественны.
12. Универсальная сущность аудитории и закрытый перечень аудиторий не вводятся.
13. Обращение не требует пользовательской учётной записи и не имеет обязательного универсального жизненного цикла.
14. Обращение, документ, сообщение, заявка технической поддержки и управленческая процедура не тождественны.
15. Уведомление является самостоятельным предметным понятием и не тождественно отправке, доставке, получению, прочтению или юридически значимому уведомлению.
16. Общая семантика коммуникаций не создаёт универсальную сущность Communication или Message.
17. Новость и объявление не являются автоматически документами или публикациями документов.
18. Подписание, утверждение, регистрация и публикация различаются.
19. Новая редакция не наследует автоматически подписание предыдущей редакции.
20. Регистрация и нумерация не обязательны для каждого документа; универсальный реестр не вводится.
21. Входящий, исходящий и внутренний документ являются контекстными ролями или локальными классификациями, а не универсальными подтипами.
22. Вложение является контекстной ролью или отношением и не получает обязательную универсальную идентичность.
23. Документ не тождествен предмету другого контекста, который он оформляет, подтверждает, представляет или с которым связан.
24. Управленческое решение не тождественно документу.
25. Финансовое обязательство, начисление и платёж не тождественны документу.
26. Показание, потребление, расчётный небаланс и эксплуатационная потеря не тождественны документу.
27. История и происхождение принадлежат соответствующим предметным понятиям и не образуют отдельный универсальный контекст.
28. Техническая доставка не создаёт автоматически предметное получение или юридически значимое уведомление.
29. Настоящий ADR не вводит универсальный Workflow, State Machine, Event или общий агрегат документов и коммуникаций.

## Последствия решения

### Положительные последствия

- документная идентичность отделена от редакций, представлений и файлов;
- разные виды документов могут выбирать собственную семантику редакции или замены;
- публикации и подписания сохраняют историческую связь с конкретной редакцией или представлением;
- обращения не зависят от наличия пользовательской учётной записи;
- уведомление отделено от технической доставки и юридического эффекта;
- новости и объявления сохраняют самостоятельную коммуникационную семантику;
- документы могут участвовать в процессах управления, финансов и ресурсного учёта без присвоения их фактов;
- поддерживаются разные виды сообществ и локальные юридические модели;
- история остаётся объяснимой без обязательного event sourcing или глобального аудита.

### Цена решения

- виды документов должны явно определять критерии редакции, замены, исправления и применимости;
- локальные процессы должны определять последствия подписания, утверждения, регистрации и публикации;
- аудитории и адресаты нельзя свести к одному закрытому перечню;
- предметное признание доставки или юридически значимого уведомления требует отдельных применимых правил;
- связи документов с другими контекстами должны иметь явную локальную семантику;
- техническая реализация не может использовать файл или статус доставки как единственный источник предметной истины.

## Сознательно не вводимые универсальные сущности

Настоящий ADR не вводит:

- универсальный `Document Fact`;
- универсальную сущность содержания документа;
- общий предок всех предметных фактов;
- универсальную сущность коммуникации или сообщения;
- универсальную сущность вложения;
- универсальную сущность аудитории, получателя или действующего лица;
- универсальный реестр документов;
- универсальное событие документа или публикации;
- универсальный жизненный цикл, Workflow, State Machine или набор состояний;
- универсальную сущность исправления;
- глобальный контекст истории, аудита или происхождения;
- универсальную сущность доказательства, утверждения или основания.

Описательные слова «содержание», «сообщение», «аудитория», «получатель», «действие» и «событие» не означают автоматического введения одноимённых нормативных сущностей.

## Намеренно отложенные решения

### Stage B

- authentication и authorization;
- права доступа, роли пользователей, ACL и permissions;
- конкретная модель проверки полномочий;
- определение того, кто вправе создавать, подписывать, утверждать, регистрировать, публиковать, отправлять, получать, читать, исправлять или отзывать и на каком предметном основании;
- действие от имени другого субъекта или органа и применимость соответствующего полномочия.

### Stage J

- email, Telegram, SMS, push и другие каналы;
- интеграции с внешними системами документооборота;
- BAS document exchange;
- внешние идентификаторы;
- импорт, экспорт и mapping;
- протоколы и контракты доставки;
- webhook и provider API;
- форматы обмена и внешние подтверждения;
- конкретные форматы электронной подписи.

### Stage K

- базы данных, таблицы, поля, индексы и схемы;
- API, REST, GraphQL, DTO и JSON;
- файловое и объектное хранение;
- MIME-типы и бинарные форматы;
- очереди, retry, event bus и кэш;
- search engine и OCR;
- UI, frontend и backend;
- сервисы и микросервисы;
- технические журналы и audit log;
- техническая реализация, хранение и enforcement решений о доступе и authorization;
- event sourcing;
- криптография и проверка сертификатов;
- deployment;
- конкретная реализация versioning и хранения истории.

### Локальные и юридические специализации

- обязательные реквизиты документов;
- юридические виды документов и протоколов;
- критерии новой редакции или нового документа для конкретного вида;
- конкретные статусы и процессы документов или обращений;
- правила регистрации, нумерации, серий и журналов;
- сроки хранения и публикации;
- юридический эффект публикации, доставки, получения или прочтения;
- обязательные аудитории и способы уведомления;
- КЭП, Дія.Підпис, PKI, сертификаты и криптографические требования;
- бухгалтерские первичные документы;
- правила обращений граждан;
- требования конкретной страны к электронным документам, архивам и персональным данным.

Эти специализации могут определяться конфигурацией, применимыми правилами, профилем сообщества или отдельным юридическим решением, но не являются универсальными инвариантами Community OS.

## Связь с ADR-001–ADR-008

### ADR-001

Документы могут быть основаниями или подтверждениями прав и представительства, но не становятся правами, полномочиями, голосами или результатами голосования. Публикация результата регулируется применимыми правилами и не изменяет историю голосования.

### ADR-002

Сохраняются два самостоятельных контекста: «Документы и формализация» и «Коммуникации и обращения». Настоящий ADR развивает их предметную семантику и связи, не определяя технические границы реализации.

### ADR-003

Конфигурация определяет допустимые специализации и политики, но не заменяет документы, редакции, публикации, обращения, уведомления или историю их применения.

### ADR-004

Исторически значимое прошлое не переписывается молча. История и происхождение принадлежат соответствующим предметным понятиям; универсальные History, Audit, Evidence или Correction не вводятся.

### ADR-005

Применимые правила имеют исторически определимые версии. Критерии редакции, публикации, регистрации, доставки и иных предметных последствий принадлежат локальной семантике соответствующих процессов.

### ADR-006

Документ может быть источником, подтверждением или основанием финансового процесса, но не является начислением, обязательством, платежом, задолженностью или расходом и не создаёт их автоматически.

### ADR-007

Документ может относиться к ресурсному или инженерному процессу, но не становится показанием, потреблением, контрольной сверкой, расчётным небалансом, эксплуатационной потерей или другим ресурсным фактом.

### ADR-008

Документ может оформлять, фиксировать, представлять или подтверждать управленческую процедуру, голосование, установленный результат или решение, но не тождествен им. Орган управления, субъект, должность и полномочие сохраняют самостоятельность при создании, подписании, утверждении и публикации документа.


---

## 7. Нормативный контекст — ADR-011, интеграции

### 7.1. External identity / external id

### 1. Идентичность внешней стороны

Для конкретной интеграции должна быть определима внешняя сторона взаимодействия в объёме, необходимом для external identifiers, contracts, provenance и исторической объяснимости.

Это минимальная интеграционная идентичность, а не универсальная предметная сущность `External System`.

Внешняя сторона:

- не является субъектом;
- не является bounded context;
- не получает предметную семантику Community OS;
- не становится владельцем импортируемого предметного факта;
- имеет конкретные свойства только в локальной семантике интеграции.

Автоматизированная интеграция также не становится субъектом или фиктивным пользователем системы.

### 2. Внешний идентификатор

**Внешний идентификатор** — квалифицированное значение или отношение в области конкретной интеграции.

Его смысл может определяться сочетанием:

- области интеграции;
- внешней стороны или namespace;
- вида внешнего объекта, если он значим;
- значения идентификатора.

Внешний идентификатор не является глобальным идентификатором объекта Community OS и сам по себе не определяет внутреннюю идентичность.

Один внутренний объект может иметь разные внешние идентификаторы в разных интеграциях. Связь internal—external может быть исторически значимой. Ошибочное сопоставление исправляется прослеживаемо и не переписывает прошлую интерпретацию молча.

Изменение external device ID не изменяет автоматически идентичность прибора или точки учёта. Глобальный реестр внешних идентификаторов и обязательная standalone entity не вводятся.

### 7.2. Export / semantic contract / failure / reconciliation

### 10. Export

Не каждый export является исторически значимым. Его значимость определяется предметным контекстом, integration semantic contract и требованиями конкретного процесса.

Сохраняются различия:

```text
Export
≠ Publication
≠ Delivery
≠ Document
≠ Document Representation, если это прямо не установлено предметной семантикой
```

Export может быть эфемерной проекцией, исторически значимой передачей, представлением или внешним взаимодействием, требующим acknowledgement.

Универсальный `Export Document` не вводится.

### 11. Delivery

Stage J определяет минимальный semantic contract доставки без обязательных универсальных сущностей доставки.

Где применимо, могут быть определимы:

- попытка доставки;
- предназначенный канал или endpoint;
- передаваемый предмет или представление;
- внешний delivery identifier;
- время попытки;
- acknowledgement provider;
- известный результат;
- неизвестный результат.

Сохраняется различие:

```text
Notification created
≠ Sent
≠ Provider accepted
≠ Delivered
≠ Received
≠ Read
≠ Legally notified
```

Повторная попытка доставки не создаёт автоматически новое уведомление. `Delivery Attempt`, `Delivery Outcome`, Delivery Workflow и Delivery State Machine не являются обязательными универсальными сущностями.

Retry workers, очереди и техническое исполнение доставки относятся к Stage K.

### 12. Integration semantic contract

Сохраняется различие:

```text
Domain contract
≠ Integration semantic contract
≠ External protocol/API contract
≠ Transport/schema
```

Общий architectural semantic contract задаёт границы, но не требует универсальной сущности `Integration Contract`.

Конкретный contract принадлежит конкретной интеграции и может определять, где применимо:

- смысл обмениваемой информации;
- внешнюю сторону;
- семантику идентификаторов;
- mapping;
- validation и recognition;
- duplicate, redelivery и correction semantics;
- acknowledgement и ожидаемый outcome;
- provenance;
- authoritative side и ownership;
- reconciliation semantics.

### 13. Версии contract и mapping

Версия semantic contract или mapping должна быть исторически определима, если её изменение могло изменить validation, recognition, interpretation или предметный результат.

При этом:

```text
API version ≠ Semantic mapping version
Schema version ≠ автоматически предметно значимая версия
Mapping ≠ автоматически универсальное Rule
```

Если mapping имеет семантику правила, применяются требования ADR-005 в соответствующем локальном контексте. Техническое хранение версий относится к Stage K.

### 14. Failure, rejection и unknown outcome

Там, где это применимо, различаются:

```text
Not attempted
≠ Failed
≠ Rejected
≠ Unknown
≠ Confirmed
```

Это семантические различия, а не обязательные состояния универсальной Integration State Machine.

`Unknown outcome` не является failure. Если после внешнего запроса неизвестно, выполнила ли внешняя сторона действие:

- результат остаётся unknown;
- повтор не считается автоматически новой предметной операцией;
- повтор может создать внешний duplicate;
- последующая reconciliation должна установить фактический результат, когда это возможно.

Недоступность внешней системы не изменяет молча уже признанные предметные факты. Timeout, retry strategy, circuit breaker и техническое хранение состояния относятся к Stage K.

### 15. Reconciliation

Reconciliation в Stage J обозначает context-specific сопоставление известных состояний и сведений для установления результата внешнего взаимодействия или разрешения расхождения.

Она не является универсальным workflow, state machine или предметной сущностью. Конкретный контекст определяет сравниваемые сведения, допустимые источники, правила признания и последствия.

### 16. Authority и source of truth

Глобальная иерархия источников истины не вводится.

Сохраняются различия:

```text
Источник информации
≠ Подтверждающие сведения
≠ Authoritative source для конкретной информации
≠ Основание recognition
≠ Владелец предметного факта
≠ Производный результат
```

Authority определяется предметным контекстом, видом информации, конкретным integration semantic contract и применимыми правилами.

Например:

- банк может быть authoritative относительно собственного сообщения о банковской операции, но это сообщение не является автоматически банковской транзакцией Community OS, Payment или Allocation;
- BAS может быть authoritative относительно собственного бухгалтерского документа, но не Financial Obligation Community OS;
- источник телеметрии сообщает сведения об измерении, но ресурсный контекст признаёт Reading;
- IdP аутентифицирует техническую идентичность, но не создаёт Subject, ownership или Domain Power;
- Community OS может быть authoritative для начисления, экспортируемого в BAS.

Эти примеры не образуют закрытый перечень или жёстко заданную универсальную иерархию.

### 17. Двусторонняя синхронизация и конфликты

Более новое значение не получает приоритет только потому, что оно новее. Универсальный last-write-wins запрещён.

При расхождении должны быть определимы, где применимо:

- какие сведения сравниваются;
- относятся ли они к одному предметному понятию;
- authoritative side;
- исходное время источника;
- время получения;
- применённые версии mapping;
- является ли различие correction, delay, conflict или допустимым расхождением представлений;
- кто или какое правило разрешает расхождение;
- что сохраняется исторически.

Разрешение принадлежит соответствующему предметному контексту или конкретной интеграции. Универсальная сущность `Conflict` не вводится.

### 7.3. Документы и формализация

### Документы и формализация

Внешний файл не становится документом автоматически. External signature verification или сведения внешней системы подписи не тождественны предметному Signing. External storage location не является Document identity.

Technical delivery не является Publication.

---

## 8. Нормативный контекст — BP-CASH-001

### 8.1. Основная cash boundary

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику приёма наличных денежных средств внешней стороной в пользу Community и признания соответствующего `Payment`.

Ключевая модель:

```text
external party tenders cash
→ physical receipt into Community-side control
→ Cash Acceptance
→ authority / party / financial-meaning validation
→ 0..N recognized Cash Payments
→ Initial Payment Allocation where applicable
→ receipt/cash document as evidence/formalization where applicable
```

**Cash Acceptance** в настоящем BP — identity-bearing channel-side referent исторически значимого физического приёма наличных. Он не является Payment и сам по себе не утверждает, что Community уже стало финансовой стороной соответствующего движения.

Процесс не вводит универсальную бухгалтерскую модель кассы, склад денежных средств, регламентированный кассовый учёт или бухгалтерскую проводку.

## 2. Основная граница

```text
Cash Acceptance
≠ Cash Payment
≠ cash receipt document
≠ cashier action
≠ cash storage location
≠ cash balance account
≠ Expense
≠ Accrual
≠ Payment Allocation
≠ later bank deposit
```

Наличный способ является способом Payment, а не отдельной фундаментальной финансовой сущностью.

## 3. Scope первого процесса

BP-CASH-001 покрывает входящий наличный Payment внешней стороны в пользу Community.

Типовые сценарии первого внедрения СТ:

- собственник оплачивает членский взнос;
- собственник оплачивает электроэнергию;
- собственник оплачивает воду;
- один Subject оплачивает обязательство другого Subject на достаточном основании;
- наличные принимаются до окончательного Allocation;
- часть принятой суммы получает смысл Advance;
- кассир оформляет квитанцию/приходный кассовый документ;
- позже агрегированные наличные вносятся на банковский счёт Community.

Исходящий наличный Payment Community другой стороне относится к будущему `BP-CASH-002`.

## 4. Наличный Payment является обычным Payment

Согласно ADR-006 наличный Payment является полноценным предметным Payment Community OS.

```text
Cash Payment is a Payment
```

К нему применяются общие свойства Payment: direction, amount/currency, materially meaningful parties, payment time, payment method, purpose where applicable, provenance и recognition basis.

Способ `cash` не меняет identity Financial Obligation и не создаёт специальный тип долга.

## 5. Cash Acceptance как channel-side referent

**Cash Acceptance** — исторически значимый channel-side факт/referent того, что определённая сумма наличных в определённой валюте была физически принята в Community-side control конкретным действующим лицом в рамках одного coherent acceptance scope.

Cash Acceptance:

- имеет собственную identity независимо от Payment и cash document;
- сохраняет accepted amount/currency, предметное время, acting acceptor и необходимый provenance;
- может существовать до recognition Payment;
- может завершиться без признанного Payment, если финансовая интерпретация не подтверждена;
- может быть основанием/evidence для recognition одного или нескольких Cash Payments;
- не определяет Payment identity/cardinality автоматически;
- не означает автоматически переход права на деньги, существование obligation, Allocation, income или Expense.

```text
cash physically presented
≠ Cash Acceptance
≠ Cash Payment
```

Cash Acceptance возникает после того, как наличные фактически удержаны в Community-side control в рамках завершённого physical acceptance scope; деньги, предъявленные и полностью возвращённые до этого момента, Cash Acceptance не создают.

Если наличные приняты только во временную custody/хранение, Cash Acceptance как source fact может существовать, но его предметная интерпретация не создаёт Payment автоматически.

Настоящий BP не вводит универсальный lifecycle/status machine Cash Acceptance. Recognition outcome, authority resolution, custody interpretation и связи с Payments являются отдельной process semantics/history.

## 6. Стороны Payment

В типовом входящем сценарии payer — сторона, от которой предметно поступают средства, recipient — Community.

Физический tenderer может не совпадать с obligated Subject и с Subject, чьё обязательство будет погашено.

```text
physical tenderer
≠ obligated Subject
≠ payer automatically
```

Если различие materially significant, оно сохраняется в provenance.

## 7. Кассир / принимающее лицо

Лицо, физически принимающее наличные от имени Community:

- не становится получателем Payment;
- не становится payer;
- действует в пределах предметного полномочия;
- может быть бухгалтером, кассиром, председателем или иным уполномоченным Subject/User.

```text
cashier / acceptor ≠ Payment recipient
```

Community остаётся получателем входящего Payment.

## 8. Authority

Физический приём наличных и последующее признание Payment являются предметно значимыми действиями, но их authority semantics различаются.

Для Cash Acceptance должны сохраняться acting person и достаточные сведения о его полномочии/основании действовать от имени Community либо о том, что authority ещё не разрешена.

Если наличные фактически приняты лицом без подтверждённого надлежащего полномочия:

- сам physical Cash Acceptance не исчезает из истории;
- Payment от имени Community не признаётся автоматически;
- authority/admissibility требует отдельного resolution;
- последующее правомерное подтверждение/ratification может стать основанием Payment recognition;
- если Payment уже был ошибочно признан и позднее отсутствие authority делает recognition неверным, применяется BP-FIN-002.

Technical access role не создаёт финансовое полномочие.

### 8.2. Tendered amount / change / Advance / Allocation

## 9. Tendered amount ≠ Cash Acceptance amount ≠ Payment amount

Следует различать:

- сумму, предъявленную для расчёта/пересчёта;
- сумму немедленно возвращённой сдачи;
- сумму Cash Acceptance — фактически удержанную в Community-side control после immediate change;
- сумму/суммы recognized Payment;
- часть Cash Acceptance, для которой Payment recognition ещё unresolved либо не допускается.

Для одного currency-specific Cash Acceptance:

```text
Cash Acceptance amount
= tendered amount - immediate returned change
```

если всё, что не возвращено немедленно, действительно вошло в этот coherent acceptance scope.

Universal `1 Cash Acceptance = 1 Payment` не вводится.

Поэтому:

```text
sum(recognized Payments linked to Cash Acceptance)
≤ Cash Acceptance amount
```

а когда финансовая интерпретация всей суммы Cash Acceptance полностью разрешена именно как входящие Payments:

```text
sum(recognized Payments)
= Cash Acceptance amount
```

Если часть суммы получила другой правомерный смысл, например custody-only, равенство с Payments не требуется; эта часть должна быть отдельно объяснима в process disposition/provenance.

Cash Acceptance amount, для которого Payment ещё не recognized, не является Unallocated Remainder: нераспределённый остаток существует только внутри уже признанного Payment.

## 10. Сдача

Если плательщик передал 1000 грн для оплаты 870 грн, а 130 грн немедленно возвращены как сдача в рамках того же акта приёма:

```text
tendered 1000
returned immediately 130
accepted by Community 870
→ Cash Payment = 870
```

Это не Payment 1000, не Refund 130 и не outgoing Cash Payment 130. Immediate change является частью определения суммы Cash Acceptance до его завершения.

Если Cash Acceptance уже завершён, а часть наличных возвращается позже до Payment recognition, такой возврат уже не является immediate change: он относится к resolution/custody/correction Cash Acceptance. Если Payment уже признан, последующий возврат использует outgoing Payment / Refund semantics where applicable.

## 11. Advance вместо сдачи

Если плательщик передал 1000 грн, Community приняло все 1000 грн, а 130 грн должны остаться на будущую электроэнергию:

```text
Cash Payment = 1000
870 → Allocation to current obligation
130 → possible Advance according to applicable semantics
```

Отсутствие сдачи не создаёт Advance автоматически.

## 12. Cash Payment ≠ Payment Allocation

Признание Cash Payment не означает его Allocation.

```text
Cash Payment recognition
→ BP-FIN-ALLOCATION-001
```

Recognition и Allocation могут координироваться одним пользовательским interaction, но остаются разными domain actions/results.

## 13. Cash Acceptance ↔ Payment cardinality

Разбиение одного recognized Payment по obligations не определяет количество Payments автоматически. Аналогично и Cash Acceptance source cardinality не определяет Payment cardinality.

Допустимы:

- one Cash Acceptance → zero recognized Payments;
- one Cash Acceptance → one Payment;
- one Cash Acceptance → multiple Payments, если evidence подтверждает несколько самостоятельных financial movements;
- multiple Cash Acceptances → one Payment, если owning-domain evidence подтверждает continuity одного предметного Payment.

Например, один представитель может одним Cash Acceptance передать документированно отдельные суммы нескольких плательщиков — это может дать несколько Payments.

Обратный случай также не запрещён универсально: несколько завершённых Cash Acceptances могут поддерживать один Payment, но только если существует отдельное достаточное предметное основание считать их частями одного Payment.

```text
Cash Acceptance cardinality
≠ Payment cardinality

one Cash Acceptance
→ 0..N Cash Payments

one Cash Payment
→ 1..N Cash Acceptance sources where justified
```

Отдельные Cash Acceptances **не объединяются автоматически** в один Payment из-за совпадения payer, date, amount, purpose, Personal Account или obligation.

Если несколько Cash Acceptances поддерживают один Payment:

- merge/continuity basis должен быть explainable;
- attributable amount каждого source fact в Payment должен быть explainable;
- сумма attributed contributions одного Cash Acceptance во все Payments не превышает Cash Acceptance amount;
- для Payment, полностью состоящего из cash-source facts, сумма attributed source contributions объясняет Payment amount.

В пределах одного незавершённого coherent acceptance interaction дополнительные суммы могут оставаться одним Cash Acceptance. После completion следующая физическая передача является новым Cash Acceptance source fact, но это само по себе ещё не предрешает Payment cardinality.

Cash Payment может быть полностью или частично нераспределён.

## 14. Payer ≠ obligated Subject

Cash Payment может быть принят от Subject A для obligation Subject B, если cross-subject Allocation имеет достаточное основание.

Cash acceptance само по себе не даёт права погасить obligation другого Subject.

## 15. Unknown payer / unresolved Payment recognition

Если Cash Acceptance существует, но предметно значимые сведения о payer/сторонах пока недостаточно определены:

- Cash Acceptance сохраняет собственную identity/history;
- fake Subject не создаётся;
- current User/кассир не подставляется как payer;
- **Payment recognition не подтверждается**, пока требования ADR-006 к определимости materially meaningful parties не выполнены;
- соответствующая сумма остаётся unresolved на уровне Payment recognition;
- она не является Unallocated Remainder, потому что Payment ещё не существует;
- case разрешается позднее на sufficient basis либо получает иной правомерный disposition.

Позднее recognition такого real cash movement ссылается на исходный Cash Acceptance, сохраняет actual acceptance time и отдельно recording/recognition time; второго физического движения денег не создаётся.

Долгоживущее unresolved состояние должно оставаться видимым для reconciliation/decision и не исчезает только по timeout. Universal anonymous-cash policy и universal automatic write-off не вводятся.

## 16. Personal Account и Payment Intent

Personal Account является context/matching input, но не payer и не Payment.

Payment Intent может содержать предполагаемую сумму и Allocation, но после фактического приёма:

```text
Payment Intent ≠ Cash Payment ≠ actual Allocation
```

Расхождение суммы/сторон требует revalidation.

### 8.3. Cash document boundary / time

## 17. Cash receipt document

Квитанция, приходный кассовый ордер или иной cash receipt document может подтверждать/оформлять Cash Acceptance, Payment либо оба факта, содержать сумму, стороны и назначение, а также быть обязательным согласно local policy/law.

Но:

```text
cash document
≠ Cash Acceptance
≠ Payment
```

Document identity не определяет Cash Acceptance или Payment identity автоматически.

Universal `1 cash document = 1 Payment` и `1 cash document = 1 Cash Acceptance` cardinality не вводятся на уровне доменной модели. Конкретная legal/operational policy может требовать отдельный документ на каждого payer/Payment, но это ограничение formalization, а не способ определить domain identity.

## 18. Документ, Cash Acceptance и Payment могут иметь разное время

Недоступность принтера/PDF/storage сама по себе не отменяет уже состоявшийся Cash Acceptance и не препятствует Payment recognition, если applicable domain/legal policy не требует документ как обязательное условие recognition и sufficient evidence движения уже существует.

Если local legal/policy semantics требует документ до recognition, это дополнительное ограничение конкретной конфигурации, а не universal rule Community OS.

Предварительно созданный документ без фактического Cash Acceptance не создаёт ни Cash Acceptance, ни Payment.

## 19. Ошибка документа ≠ ошибка Payment

Если документ ошибочен, а Payment признан корректно, document correction не является Payment correction.

Если Payment recognition itself wrong, применяется `BP-FIN-002`.

## 20. Временная семантика

Следует различать, где materially significant:

- tendering time;
- Cash Acceptance completion time;
- authority/financial-interpretation resolution time, если оно отличается;
- Payment recognition/recording time;
- cash document issuance time;
- Allocation time;
- later bank deposit time.

Technical timestamp не подменяет предметное время.

### 8.4. Pilot and invariants

## 39. Основной сценарий пилотного СТ

1. Owner A имеет electricity Obligation 870 грн.
2. Owner A передаёт кассиру 1000 грн.
3. Cashier counts and physically accepts all 1000; Cash Acceptance CA1 = 1000 UAH is established.
4. Authority/party evidence is sufficient; Cash Payment P1 = 1000 UAH Owner A → Community is recognized from CA1.
5. Owner requests 870 to current electricity and remaining 130 for future electricity.
6. BP-FIN-ALLOCATION-001 creates/coordinates 870 Allocation and possible Advance semantics for 130.
7. Cash receipt document is issued and linked as formalization/evidence without defining CA1/P1 identity.
8. Later Community deposits this cash together with other cash receipts into bank.
9. Bank Transaction may reconcile with Cash Acceptance/Payment facts but does not recreate Owner A Payment.

## 40. Проверочные сценарии

### 40.1. Exact amount
Obligation 870; accepted 870; Cash Payment 870.

### 40.2. Tendered 1000, immediate change 130
Accepted 870; Payment 870; no Refund and no outgoing Payment.

### 40.3. Tendered 1000, all accepted
Payment 1000; 130 does not become Advance/Overpayment automatically.

### 40.4. One Payment, two obligations
Payment 1500; 1000 membership + 500 electricity via two Allocations.

### 40.5. Third party physically brings cash
Physical tenderer, payer and obligated Subject are resolved separately according to evidence.

### 40.6. Chairman acts as cashier
Chairman accepts for Community and does not become recipient.

### 40.7. Receipt printed but no cash received
No Payment.

### 40.8. Printer fails after cash accepted
Payment remains real; document may be produced later according to policy.

### 40.9. Network fails after physical acceptance
Later recording preserves actual payment time and avoids duplicate.

### 40.10. Unknown payer remains unresolved
Cash Acceptance exists; no fake Subject/cashier payer is created; Payment recognition remains unresolved and visible for decision/reconciliation. See also §40.24 for later resolution.

### 40.11. Wrong amount after confirmation
Actually accepted 900, recorded 1000 → BP-FIN-002.

### 40.12. Wrong Allocation
Cash Payment correct, Allocation wrong → BP-FIN-001.

### 40.13. Cash deposited by chairman
Underlying Cash Payments total 15 000; bank deposit 15 000 → no new Payment from chairman.

### 40.14. Aggregate deposit cannot be decomposed
Bank Transaction exists; no invented mapping to Cash Payments.

### 40.15. Recognized cash 20 000, bank deposit 15 000
Payments unchanged; remaining 5 000 belongs to future custody/reconciliation semantics.

### 40.16. Duplicate offline entry
Same real Payment entered twice → BP-FIN-002 duplicate recognition correction.

### 40.17. Cash before obligation
Payment may remain Unallocated or become Advance on sufficient basis; no fake obligation.

### 40.18. One Cash Payment across two PAs
Allowed only with sufficient cross-account basis; cash method does not prohibit it.

### 40.19. Cash accepted, no Allocation yet
Payment exists independently of Allocation.

### 40.20. Later cash Refund
Original Payment remains; outgoing cash movement belongs to BP-CASH-002 + BP-FIN-003 semantics.

### 40.21. One physical handover contains several payers

Authorized representative delivers:

```text
500 from Payer A
700 from Payer B
800 from Payer C
```

and sufficient evidence preserves the independent origin of each amount.

Physical acceptance may be one cashier interaction, but financial context may recognize three Cash Payments. The interaction is not forced into one Payment 2000.

### 40.22. One payer pays several obligations

Payer A tenders 2000 from own funds.

```text
1200 → own membership obligation
800  → another allowed obligation
```

Where allocation basis is sufficient, this may remain one Cash Payment 2000 with multiple Allocations.

### 40.23. Cash Acceptance for temporary custody only

External party hands 5000 to a Community-side actor solely for temporary safekeeping/transport, without Community becoming a party to a financial Payment.

Cash Acceptance records the physical receipt/source fact; custody-only interpretation is attributable; no Cash Payment is recognized.

### 40.24. Unknown payer resolved later

Cash 1000 is physically accepted as Community funds, but payer cannot yet be sufficiently identified.

Payment recognition remains unresolved.

Later sufficient evidence identifies Payer A.

Recognition links Payment to the existing Cash Acceptance, preserves actual acceptance time and later recognition/recording time, and does not invent a second movement.

### 40.25. Separate Cash Acceptances do not merge automatically

Payer A gives 500 and cashier finalizes Cash Acceptance CA1.

Later Payer A separately gives another 500 and cashier finalizes CA2.

```text
CA1 ≠ CA2
```

Это два самостоятельных source facts. Совпадение payer/date/purpose/obligation само по себе не позволяет превратить их в один Payment 1000.

Если applicable owning-domain evidence отдельно подтверждает, что CA1 и CA2 являются частями одного предметного Payment, один Payment 1000 допустим при explainable continuity basis и attributable contributions 500 + 500. В отсутствие такого основания они признаются как отдельные Payments либо остаются unresolved согласно применимой семантике.

### 40.26. Additional cash before one acceptance is finalized

Payer tenders 800, cashier counts it, and before final acceptance is completed payer immediately adds 200.

Applicable process treats this as one continuous acceptance interaction:

```text
Cash Acceptance = 1000
→ one Payment 1000 where party semantics are unambiguous
```

No universal clock threshold defines the boundary; the coherent acceptance scope must remain explainable.

### 40.27. Mixed currency with immediate return

Payer tenders 1000 UAH + 20 EUR.

Community accepts UAH but does not accept EUR; 20 EUR is immediately returned before the acceptance scope is completed.

```text
Cash Acceptance = 1000 UAH
Payment = 1000 UAH
20 EUR → no Cash Acceptance / no Payment
```

No implicit currency conversion occurs.

### 40.28. Unauthorized actor receives cash

A person without established cash-receipt authority physically accepts 1000 from Payer A while purporting to act for Community.

Cash Acceptance/source fact is preserved.

Payment is not automatically recognized until authority/admissibility is resolved.

If Community later validly ratifies the acceptance, Payment may be recognized from the existing Cash Acceptance. If an already recognized Payment is found invalid because of authority failure, BP-FIN-002 applies.

### 40.29. Partial resolution of one Cash Acceptance

One representative tenders 2000 with evidence:

```text
500 from Payer A
700 from Payer B
800 origin unresolved
```

Cash Acceptance = 2000.

Payments A=500 and B=700 may be recognized.

Remaining 800 stays unresolved at Payment recognition level; it is not Unallocated Remainder of A or B.

### 40.30. Custody cash returned without Payment

Cash Acceptance 5000 is classified as custody-only.

Later the same custody funds are returned to the external owner without ever becoming a Payment involving Community.

The return is not Refund of a Community Payment.

### 40.31. Long-lived unresolved Cash Acceptance

Cash Acceptance 1000 remains without sufficient payer evidence for an extended period.

It remains visible for decision/reconciliation and is not auto-converted into income, Payment, Advance, Unallocated Remainder or write-off solely because time passed.

## 41. Инварианты

1. Cash Acceptance is an identity-bearing cash-channel source/process referent.
2. Cash Acceptance ≠ Cash Payment.
3. Cash Acceptance ≠ cash document.
4. Cash Acceptance ≠ Cashbox/CashBalance/CashOperation.
5. Cash Payment is a Payment.
6. Cash method does not create a separate obligation model.
7. Cash Payment ≠ cash document.
8. Cash Payment ≠ cashier action.
9. Cash Payment ≠ cash storage location/balance.
10. Cash Payment ≠ bank deposit.
11. Cash Payment ≠ Payment Allocation.
12. Cash Payment ≠ Expense.
13. Cashier/acceptor ≠ Payment recipient.
14. Physical tenderer ≠ payer automatically.
15. Personal Account ≠ payer.
16. Tendered amount ≠ Cash Acceptance amount.
17. Immediate returned change before Cash Acceptance completion is not Refund.
18. Immediate returned change before Cash Acceptance completion is not outgoing Payment.
19. Sum of recognized Payments linked to one Cash Acceptance cannot exceed Cash Acceptance amount.
20. If the whole Cash Acceptance is resolved specifically as Payments, the sum of linked Payment amounts equals Cash Acceptance amount.
21. Any Cash Acceptance amount not recognized as Payment must remain separately explainable as unresolved/custody/other permitted disposition.
22. Cash Acceptance amount without Payment recognition ≠ Unallocated Remainder.
23. Payment may exist without Allocation.
24. One Cash Payment may allocate to multiple obligations.
25. Cash method does not impose one Payment per PA.
26. Cross-subject/cross-account Allocation requires sufficient basis.
27. Cash document defines neither Cash Acceptance nor Payment identity automatically.
28. Prepared receipt without Cash Acceptance does not create Cash Acceptance or Payment.
29. Document correction ≠ Payment correction.
30. Cash Acceptance completion time and recording time may differ.
31. Late recording of Cash Acceptance / Payment ≠ new physical movement.
32. Technical retry of same Cash Acceptance ≠ new Cash Acceptance or second Payment automatically.
33. Same payer/date/amount does not prove duplicate.
34. Payment correction belongs to BP-FIN-002.
35. Allocation correction belongs to BP-FIN-001.
36. Refund requires separate semantics.
37. Cash deposit to Community bank does not recreate underlying Payments.
38. Physical bank depositor ≠ payer aggregated cash.
39. Cash deposit does not create new income automatically.
40. Internal custody/transfer Community cash ≠ external Payment.
41. Universal Cashbox/CashBalance/CashOperation entity is not introduced.
42. Fake Subject is not created for unknown payer.
43. Fake Obligation is not created to consume cash.
44. Payment Intent/purpose ≠ actual Allocation.
45. Authority ≠ technical access.
46. Cash reconciliation ≠ Payment recognition.
47. Offline document number ≠ universal Cash Acceptance or Payment identity.
48. Cash Payment may precede Financial Obligation where applicable semantics permits it.
49. Cash Acceptance cardinality does not determine Payment cardinality.
50. Custody-only Cash Acceptance ≠ Payment automatically.
51. If materially meaningful Payment parties are not sufficiently determinable, Payment recognition is not confirmed.
52. Late Payment recognition from existing Cash Acceptance ≠ a second physical movement.
53. One Cash Payment may be supported by 1..N Cash Acceptance sources on sufficient owning-domain basis; source cardinality does not define Payment identity.
54. One Cash Acceptance may support 0..N Payments.
55. Separate Cash Acceptances never merge into one Payment automatically; many-source linkage requires explainable continuity basis and attributable source amounts.
56. Cash Acceptance may exist without Payment recognition.
57. Lack of authority does not erase physical Cash Acceptance but blocks automatic Payment recognition.
58. Long-lived unresolved Cash Acceptance remains visible and is not auto-reclassified by timeout.

---

## 9. Нормативный контекст — Initial Payment Allocation

### 9.1. Proposal / intent / automatic-manual boundary

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

### 9.2. Remainder / Advance / Overpayment

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

Overpayment может возникнуть позднее как следствие изменения effective financial state, например если ранее исполненное обязательство после правомерного перерасчёта уменьшилось. При этом уменьшение obligation сначала может породить process-derived `excess applied amount`; такой excess не является Overpayment автоматически, пока applicable semantics не признаёт соответствующий financial state. Такое состояние не создаётся настоящим BP как специальный target первоначального Allocation.

### 9.3. Relevant scenarios and invariants

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
45. Excess applied amount from BP-FIN-005 is not available for new Initial Allocation while current effective financial use still accounts for it.
46. Excess applied amount ≠ automatic Overpayment.
47. Cash Acceptance ≠ Payment and is not a source for Initial Allocation directly.
48. Cash Disbursement ≠ Payment and is not a source for Initial Allocation directly.
49. Accepted-but-unrecognized Cash Acceptance amount ≠ Unallocated Remainder and cannot be allocated before Payment recognition.
50. Cash Disbursement amount without recognized outgoing Payment cannot be allocated or treated as fulfillment.
51. If one Cash Acceptance or Cash Disbursement supports several Payments, each Payment has its own Allocation scope and available amount.
52. If one Payment is supported by several cash source referents, Allocation still operates on that Payment identity/available amount; source cardinality does not create multiple Allocation scopes.

---

## 10. Нормативный контекст — Reading boundary

## 1. Назначение

Настоящий бизнес-процесс определяет, как наблюдаемое, сообщённое, импортированное или иным образом полученное количественное значение может стать предметно признанным Reading Community OS.

Ключевая модель:

~~~text
observed / reported / received value
→ identification / mapping
→ validation
→ applicable authority / recognition rule
→ recognized Reading
   OR unresolved / rejected value
→ later Consumption / reconciliation processes where applicable
~~~

Главная граница:

~~~text
received value
≠ Reading
≠ Consumption
≠ Accrual
≠ Financial Obligation
~~~

BP не предполагает, что любое число от Meter, пользователя, файла или телеметрии автоматически становится Reading.

## 2. Нормативная основа

BP развивает уже принятые решения ADR-007, ADR-010 и ADR-011:

- Reading — предметно признанное значение;
- observed/received value и Reading различаются;
- external/telemetry value требует validation/mapping/domain recognition;
- automated source не является Subject;
- technical access ≠ предметное полномочие;
- Reading ≠ Consumption;
- correction source data ≠ recalculation derived result;
- Meter replacement сохраняет installation context и не переносит Reading между Meter.

Новый универсальный Measurement Event не вводится.

## 3. Что входит в процесс

BP охватывает:

- ручное наблюдение;
- сообщение значения пользователем/собственником/уполномоченным лицом;
- контрольное снятие как источник входного значения;
- значение поставщика;
- значение из файла/import flow;
- значение из API/телеметрии после integration mapping;
- идентификацию Accounting Point / Meter / Meter Installation;
- measurement semantics / channel where materially relevant;
- measurement time и temporal precision;
- unit;
- validation;
- recognition/rejection/unresolved outcome;
- authority / recognition rule;
- duplicate / redelivery;
- conflicting values;
- late/out-of-order value;
- correction recognized Reading;
- provenance;
- quality limitations where applicable.

## 4. Что не входит

BP не определяет:

- transport/API/MQTT/Modbus/АСКОЕ;
- batch-import UX;
- Meter replacement;
- универсальную формулу Consumption;
- Calculated Imbalance;
- Control Reconciliation;
- Operational Loss recognition;
- финансовое начисление;
- тарификацию;
- Payment/Obligation;
- универсальный confidence score;
- универсальный lifecycle/state machine Reading;
- universal Measurement Event;
- universal Meter Register entity;
- структуру БД/API/UI.

Автоматический импорт показаний будет отдельным process поверх настоящего recognition BP.

## 5. Reading как признанный предметный факт

Reading — не строка формы, не сообщение и не telemetry sample.

Для признанного Reading должна существовать достаточная предметная семантика, позволяющая понять:

- что измерено;
- к какой Accounting Point относится значение;
- к какому Meter / Meter Installation относится значение, если измерение выполняется конкретным Meter;
- value;
- unit либо иная достаточная measurement semantics;
- measurement time / applicable temporal precision;
- provenance;
- basis/recognition rule where materially relevant.

Это не означает один универсальный обязательный набор полей для всех ресурсов и Meter.

## 6. Reading identity

Recognized Reading имеет собственную исторически различимую предметную identity.

Её нельзя определять только как:

~~~text
Accounting Point + date + numeric value
~~~

или:

~~~text
Meter serial + value
~~~

Совпадающие значения могут относиться к разным measurement facts, channels, времени или источникам.

Одновременно повторная доставка сведений об одном и том же факте не должна создавать новый Reading автоматически.

Reading identity и duplicate resolution определяются sufficient provenance и предметным смыслом конкретного measurement fact; universal hash/idempotency key не вводится.

## 7. Received value не является новой universal entity

BP может работать со значением, которое:

- увидел человек;
- сообщил пользователь;
- передал поставщик;
- прислал внешний сервис;
- передал Meter/шлюз;
- содержит документ;
- содержит CSV/XLS;
- получено при обходе.

Не требуется вводить универсальные Reading Candidate, Measurement Submission, Meter Message или Imported Reading Row.

Конкретный intake/integration process может хранить технические сведения о получении, но предметная модель признаёт Reading только после соответствующей проверки.

## 8. Accounting Point

Reading относится к Accounting Point как устойчивой предметной границе учёта.

Meter replacement не меняет Accounting Point автоматически.

Если входное значение содержит только Meter serial/device ID, этого недостаточно для автоматического вывода Accounting Point без надёжного mapping к historically applicable Meter Installation.

## 9. Meter и Meter Installation

Для meter-based Reading должна быть достаточно определима Meter Installation, к которой относится measurement time.

~~~text
Reading measurement time
→ applicable Meter Installation
→ Accounting Point
~~~

Нельзя привязывать historical Reading к текущему Meter только потому, что значение введено сегодня.

Late Reading может относиться к уже завершённой Meter Installation.

## 10. Reading без конкретного Meter

Не вся предметная measurement semantics обязана фундаментально требовать Meter identity.

Если применимый процесс допускает признанное значение непосредственно относительно Accounting Point или другого достаточного измерительного основания без конкретного Meter, Reading может быть признан без фиктивного Meter.

Однако для обычного meter-based сценария пилотного СТ Meter Installation должна быть определима.

## 11. Значение на границе замены Meter

Boundary Reading, признанный в BP-METER-001, использует ту же семантику Reading.

Значение в момент снятия/установки относится к old или new Meter Installation согласно фактическому measurement context.

Old final Reading не переносится в new Meter.

## 12. Measurement semantics / channel

Некоторые Meter дают несколько materially distinct values:

- day/night;
- import/export;
- phases;
- registers;
- другие channels.

Reading должен иметь достаточный context, чтобы значение можно было интерпретировать.

Настоящий BP не создаёт универсальную Meter Register entity.

Если channel semantics предметно значима, она сохраняется в достаточной форме конкретного resource/meter process.

## 13. Unit

Одного числа недостаточно.

Reading должен иметь определимую unit либо иную достаточную measurement semantics.

Число 12540 без понимания, например, kWh, m³ или применимого scaled register недостаточно для recognition.

Unit Reading не обязана совпадать с unit будущего Consumption.

## 14. Raw register value и conversion

Reading может представлять raw register value либо уже интерпретированное значение, если applicable semantics это допускает.

Если для понимания Reading нужен coefficient/scaling/conversion, должно быть объяснимо:

- относится ли коэффициент к Meter;
- Meter Installation;
- Rule;
- external representation.

Нельзя молча применять текущий coefficient к historical Reading.

Raw и converted representation не обязаны быть двумя самостоятельными Readings, если это две формы одного признанного measurement fact.

## 15. Measurement time

Reading имеет предметно значимое measurement time либо достаточную temporal precision.

~~~text
measurement time
≠ reported time
≠ received time
≠ recognition time
≠ record time
~~~

Если известна только дата, нельзя изобретать точное время.

## 16. Applicable period ≠ measurement time

Иногда значение сообщается как показание за месяц либо относится к контрольному окну.

Period/context может быть важен, но не заменяет measurement time автоматически.

Если точный момент неизвестен, сохраняется реальная temporal precision/semantics, а не искусственный timestamp.

## 17. Manual observation

Уполномоченное лицо может непосредственно снять значение Meter.

~~~text
physical observation
→ validation/context
→ recognition
→ Reading
~~~

Факт наблюдения человеком не гарантирует корректность автоматически; Meter identity, installation, unit/time и authority могут требовать проверки.

## 18. Owner/user reported value

Собственник, пользователь или иное лицо может сообщить значение.

~~~text
reported value
≠ Reading automatically
~~~

Должны различаться:

- Subject, которым/от имени которого сообщено значение;
- User Account, через который выполнено действие;
- technical access;
- предметное основание/полномочие сообщить данные;
- recognition rule.

Ownership само по себе не обязано давать любое resource authority; Access Grant не создаёт его автоматически.

## 19. Unknown/unverified reporter

Если значение получено, но reporter не может быть надёжно установлен, это не обязательно означает, что физически значение неверно.

Однако система не должна подменять неизвестного reporter фиктивным Subject.

Recognition зависит от applicable rule и достаточности других evidence.

## 20. Supplier-provided value

Поставщик может сообщить meter value либо supplier-side settlement value.

Эти понятия нельзя смешивать.

~~~text
supplier-provided meter value
→ may become Reading after recognition

supplier-calculated settlement quantity
≠ Reading automatically
~~~

Например, расчётная добавка трансформационных потерь поставщика из BP-EXPENSE-001 не является Meter Reading только потому, что выражена в kWh.

## 21. Imported value

CSV/XLS/API row не является Reading.

~~~text
external representation
→ mapping
→ validation
→ domain recognition
→ Reading where accepted
~~~

Ошибочная строка не должна создавать fictitious Reading ради успешного завершения batch.

## 22. Telemetry value

Telemetry sample:

~~~text
≠ Reading automatically
≠ Consumption
~~~

Автоматическое recognition допустимо, если applicable rule/semantic contract позволяет надёжно выполнить identification, mapping, validation и recognition.

Это не делает automated system Subject.

## 23. Validation layers

Следует различать:

1. representation/format validation;
2. mapping/identity validation;
3. resource/measurement semantic validation;
4. subject-matter recognition/admissibility.

Например, числовое значение может быть технически валидным JSON, но относиться к неизвестному external device ID.

Или Meter может быть известен, но measurement time попадать вне его Meter Installation interval.

## 24. Recognition rule

Recognition может быть:

- явным действием уполномоченного Subject;
- автоматическим по applicable rule;
- результатом специализированного process.

Ни UI action, ни import, ни telemetry receipt сами по себе не являются recognition rule.

Если rule/version materially влияет на acceptance, она должна быть исторически определима согласно ADR-005.

## 25. Accepted Reading

При successful recognition возникает Reading с собственной domain identity и sufficient provenance.

Recognition Reading:

- не создаёт Consumption автоматически;
- не выбирает tariff;
- не создаёт Accrual;
- не создаёт Financial Obligation.

Downstream processes используют Reading как input.

## 26. Rejected value

Полученное/сообщённое значение может быть rejected.

Причины могут включать:

- невозможно определить Accounting Point;
- невозможно определить Meter Installation в meter-based case;
- несовместимая unit;
- measurement time вне допустимого context;
- недостаточное authority/basis;
- invalid/out-of-domain value;
- конфликт, который нельзя разрешить автоматически.

Rejected value не становится Reading.

Исторически значимый rejection может сохранять достаточный provenance; universal Rejection entity не вводится.

## 27. Unresolved value

Иногда данных недостаточно для recognition или окончательного rejection.

Например:

- известен Meter serial, но ambiguous mapping;
- неясно measurement time;
- два источника сообщают разные values;
- временно отсутствует подтверждение authority.

Такое значение может оставаться unresolved в owning intake/integration process.

Unresolved value ≠ Reading.

BP не вводит универсальный статусный workflow для всех каналов.

## 28. Value lower than previous Reading

Новое числовое значение меньше предыдущего не означает автоматически ошибку.

Возможные причины:

- Meter replacement;
- register rollover/wrap;
- reset;
- другой channel;
- correction prior Reading;
- ошибочный value.

~~~text
new value < previous value
≠ invalid automatically
≠ negative Consumption automatically
~~~

Recognition требует applicable context.

## 29. Value equal to previous Reading

Одинаковое значение может означать:

- отсутствие изменения;
- повторное наблюдение;
- duplicate;
- отдельный Reading в другой момент;
- problem/stuck Meter.

Равенство чисел не доказывает duplicate.

## 30. Large jump / anomaly

Аномальный скачок может быть основанием:

- warning;
- дополнительной проверки;
- unresolved outcome;
- rejection по explicit rule;
- recognition с quality limitation where applicable.

Аномальность не должна автоматически переписывать прошлое или создавать Operational Loss.

## 31. Future-dated / implausible time

Если measurement time противоречит допустимому предметному времени, значение не признаётся молча.

Technical clock skew, timezone/mapping issue или ошибочный ввод могут требовать resolution/correction.

BP не вводит universal tolerance window.

## 32. Late Reading

Reading может быть признан спустя значительное время после measurement time.

~~~text
measurement time < recognition time
~~~

Late recognition не переносит Reading на дату ввода.

Reading может относиться к historical Meter Installation.

## 33. Out-of-order Reading

Более поздно полученное значение может иметь более ранний measurement time, чем уже существующие Readings.

~~~text
receipt order
≠ measurement-time order
~~~

История не должна предполагать, что последний введённый Reading является самым поздним по предметному времени.

## 34. Current Reading projection

Текущее/последнее показание является projection/read model, а не отдельным source-of-truth фактом.

Какой Reading считается current/latest зависит от:

- measurement semantics;
- measurement time;
- channel;
- correction state/relations;
- applicable projection rule.

Record creation order сам по себе недостаточен.

## 35. Duplicate / redelivery

Повторная доставка одного external/report event не создаёт новый Reading автоматически.

Но совпадение value/date/Meter/reporter не является достаточным универсальным доказательством duplicate.

Используются provenance и semantic identity исходной информации/measurement fact.

## 36. Несколько источников сообщают одинаковое значение

Owner report и telemetry могут сообщить одинаковое число.

В зависимости от evidence они могут:

- подтверждать один measurement fact;
- представлять два самостоятельных observations;
- один быть redelivery/duplicate другого;
- иметь разные measurement times.

BP не вводит automatic merge solely by numeric equality.

## 37. Conflicting values

Для одной Accounting Point/Meter Installation и близкого measurement context могут быть получены разные values.

~~~text
reported 12540
control observation 12570
~~~

Нельзя автоматически выбрать последнее или большее.

Applicable process/rule должен определить:

- можно ли признать одно;
- остаются ли оба evidence;
- требуется ли correction;
- требуется ли control/reconciliation process.

Conflicting received values не обязаны становиться двумя одновременно effective Readings одного measurement fact.

## 38. Несколько признанных Readings в один день

Универсальная уникальность one Reading per Accounting Point per day не вводится.

Допустимы:

- разные measurement times;
- разные channels;
- контрольное и обычное observation;
- начало/конец installation;
- другие materially distinct contexts.

Конкретные ограничения определяет resource/process semantics.

## 39. Correction recognized Reading

Если признанное Reading позднее признано ошибочным, оно не переписывается/удаляется молча.

Сохраняются:

- original Reading;
- correction basis;
- corrected/replacement recognized value where applicable;
- correction/recognition time;
- provenance;
- downstream recalculation links where materially important.

Универсальная Correction entity не вводится.

## 40. Correction ≠ new observation

Исправление typo/неверной интерпретации старого fact и новое физическое измерение — разные semantics.

~~~text
correction of Reading
≠ later new Reading
~~~

Не следует изображать correction как новое измерение сейчас.

## 41. Source correction

Если внешний provider/integration исправляет ранее переданную информацию:

~~~text
external correction
≠ Reading correction automatically
~~~

Resource context заново оценивает domain impact согласно ADR-011.

Ранее признанное Reading не переписывается молча.

## 42. Reading correction and Consumption

Correction Reading может потребовать перерасчёт Consumption.

Но:

~~~text
Reading correction
≠ automatic silent Consumption rewrite
~~~

Consumption owning process создаёт отдельный traceable recalculation/result where required.

## 43. Reading correction and finance

Даже если corrected Consumption меняет начисление:

~~~text
Reading correction
→ resource recalculation
→ financial recalculation/correction
~~~

Каждый шаг принадлежит своему owning context/process.

Reading correction не изменяет Accrual/Financial Obligation напрямую.

## 44. Reading without Consumption

Reading может существовать без немедленного Consumption.

Например:

- контрольное промежуточное Reading;
- boundary Reading при замене;
- диагностика;
- Reading внутри периода;
- значение общего Meter.

Не любой Reading автоматически порождает Consumption.

## 45. Consumption without direct pair of Readings

Согласно ADR-007 Consumption может быть установлен по Reading, calculation, estimate, norm, substitute data или иному sufficient basis.

Поэтому:

~~~text
Consumption
≠ mandatory difference of exactly two Readings
~~~

Настоящий BP не определяет Consumption formula.

## 46. Pilot ST — owner submits electricity Reading

Owner/user сообщает:

~~~text
AP-Plot-42
Meter M2
Reading 12540 kWh
measurement date 25 Sep
~~~

System validates applicable permission, AP/Meter Installation mapping, unit, measurement time, value semantics и duplicate/conflict conditions.

После recognition возникает Reading.

Accrual за электроэнергию не возникает самим этим действием.

## 47. Pilot ST — owner has two Accounting Points

Один участок может иметь основной ввод и отдельную Accounting Point другого места потребления.

~~~text
AP-A Reading = 400
AP-B Reading = 80
~~~

Readings сохраняются раздельно.

Consumption/financial aggregation принадлежит downstream rules.

## 48. Pilot ST — general/street Meter

Reading общего/группового/промежуточного Meter признаётся для соответствующей Accounting Point.

Его роль не делает Reading отдельным типом и не создаёт Calculated Imbalance автоматически.

Control Reconciliation — отдельный process.

## 49. Pilot ST — water Reading

Для water Meter применяется та же recognition model.

Resource-specific unit/precision/rollover semantics могут отличаться, но не требуют отдельной fundamental Reading entity.

## 50. Pilot ST — two-zone Meter

Пользователь сообщает day/night values.

Если оба channels materially distinct, каждый value должен сохранять достаточную channel semantics.

Их нельзя складывать или переставлять местами на intake без applicable rule.

Financial tariff usage остаётся downstream policy.

## 51. Pilot ST — late old-Meter Reading after replacement

После Meter replacement сегодня поступает Reading, реально снятый вчера со старого Meter.

Если measurement time попадает в old Meter Installation и evidence достаточен:

~~~text
late receipt today
→ Reading of old installation yesterday
~~~

Нельзя привязывать его к new Meter только потому, что new Meter сейчас current.

## 52. Pilot ST — owner reports wrong Meter

User случайно выбирает AP-B, но photo/evidence/value относится к AP-A.

До resolution значение не должно создавать Reading для AP-B.

Correction mapping/intake ≠ Reading correction, если Reading ещё не был признан.

## 53. Pilot ST — control reading differs from owner report

Owner reports 12540; technician control observation близко по времени says 12570.

Ни последнее, ни control value не побеждает универсально.

Applicable control process/rules определяют recognition/correction consequences.

## 54. Pilot ST — telemetry and manual value

Telemetry gives 10012 at 12:00; manual observation gives 10012 at 12:05.

Numeric equality alone does not prove duplicate.

Они могут быть independent observations with different measurement times.

## 55. Pilot ST — supplier settlement quantity

Supplier invoice содержит measured settlement volume плюс transformation-loss coefficient.

Calculated supplier volume:

~~~text
≠ Reading
~~~

если соответствующий компонент не является фактическим recognized meter value с достаточным context.

## 56. Pilot ST — lower value after replacement

Old Meter last Reading 18452.

New Meter initial 17, later 120.

~~~text
120 < 18452
~~~

не означает negative Consumption, потому что values принадлежат разным Meter Installations.

## 57. Pilot ST — date known, exact time unknown

Owner states Meter was read on 25 Sep, exact time unknown.

Reading может использовать date-level temporal precision, если этого достаточно applicable process.

System не изобретает 00:00 или 12:00 как factual measurement time.

## 58. Pilot ST — incorrect Reading already used financially

Recognized Reading 12540 был использован для Consumption и Accrual.

Позже sufficient evidence устанавливает correct Reading 12450.

~~~text
original Reading preserved
→ Reading correction
→ Consumption recalculation where required
→ Accrual recalculation/correction where required
~~~

No silent update cascade.

## 58.1. Pilot ST — photo timestamp differs from declared reading time

Owner submits a meter photo taken at 18:42 but manually declares measurement time 18:00.

Photo metadata, declared time and received time are different evidence. Community OS must not silently replace one with another. Applicable recognition rules decide which temporal fact is sufficiently supported.

## 58.2. Pilot ST — decimal precision / display semantics

Water or electricity meter may expose decimals or scaled digits.

~~~text
displayed digits
≠ universally assumed engineering unit/precision
~~~

Recognition preserves applicable unit/scale semantics; truncation or rounding belongs to explicit resource/rule semantics, not implicit UI formatting.

## 58.3. Pilot ST — estimated value supplied instead of physical observation

Supplier/operator provides an estimated or substitute value for a period without a physical meter observation.

Such value does not become Reading merely because it resembles a reading. It may remain substitute/calculated input for Consumption or settlement under the owning process.

## 58.4. Pilot ST — value during an unmetered gap

Accounting Point has no active Meter Installation between replacement intervals. A meter-based value reported for that gap cannot be mapped to a fictitious Meter Installation.

If another legitimate measurement basis exists, it may be recognized under its own semantics; otherwise input stays rejected/unresolved.

## 59. Outcomes

### 59.1. Recognized

Value sufficiently identified, validated and recognized → Reading exists.

### 59.2. Rejected

Value cannot/should not be recognized under applicable semantics → no Reading.

### 59.3. Unresolved

Recognition cannot yet be determined → no Reading until resolution.

### 59.4. Duplicate / redelivery

Input refers to already processed same underlying information/measurement fact → no additional Reading unless subject-matter semantics indicates distinct observation.

### 59.5. Correction

Existing recognized Reading is historically corrected/replaced/qualified on sufficient basis; original Reading remains explainable.

## 60. Provenance

For recognized Reading, where materially relevant, should be determinable:

- Reading identity;
- Resource;
- Accounting Point;
- Meter;
- Meter Installation;
- measurement semantics/channel;
- value;
- unit;
- raw vs interpreted representation where meaningful;
- measurement time / temporal precision;
- reported/transmitted/received time where meaningful;
- source;
- reporting Subject where applicable;
- acting User Account/access context where applicable;
- recognition Subject or automatic rule/process;
- basis/Rule Version where applicable;
- integration source/external identifier where applicable;
- evidence/document/photo where applicable;
- duplicate/conflict/correction relationships;
- known quality limitations.

Это список предметной объяснимости, а не universal DB schema.

## 61. Инварианты

1. Received/observed value ≠ Reading.
2. Reading ≠ Consumption.
3. Reading ≠ Accrual.
4. Reading ≠ Financial Obligation.
5. Telemetry sample ≠ Reading automatically.
6. CSV/XLS/API row ≠ Reading automatically.
7. Supplier settlement quantity ≠ Reading automatically.
8. Reading recognition belongs to resource context.
9. Automated system ≠ Subject.
10. User Account ≠ reporting Subject automatically.
11. Technical access ≠ предметное authority automatically.
12. Ownership ≠ universal Reading-submission authority.
13. Reading must have sufficient measurement semantics, not only numeric value.
14. Reading measurement time ≠ received/record/recognition time.
15. Limited temporal precision must not be replaced by fictitious precision.
16. Historical meter-based Reading maps to historically applicable Meter Installation.
17. Current Meter must not capture late historical Reading automatically.
18. Meter replacement does not transfer Reading history to new Meter.
19. Old final Reading ≠ new initial Reading.
20. Multi-channel values require sufficient channel semantics.
21. Unit must be sufficiently determinable.
22. Current coefficient must not be applied retroactively automatically.
23. Value lower than previous ≠ invalid automatically.
24. Value lower than previous ≠ negative Consumption automatically.
25. Equal numeric value ≠ duplicate automatically.
26. Large jump ≠ Operational Loss automatically.
27. Latest recorded Reading ≠ latest measurement-time Reading automatically.
28. Current Reading is projection, not separate source-of-truth entity.
29. Duplicate/redelivery does not create Reading automatically.
30. Same Meter/date/value ≠ universal duplicate proof.
31. Conflicting values are not resolved by latest/largest universal rule.
32. Universal one-Reading-per-day constraint is not introduced.
33. Rejected/unresolved input ≠ Reading.
34. Correction does not silently rewrite original Reading.
35. Reading correction ≠ new observation.
36. External source correction ≠ Reading correction automatically.
37. Reading correction ≠ silent Consumption rewrite.
38. Reading correction ≠ direct financial correction.
39. Reading may exist without Consumption.
40. Consumption may exist without exactly two Readings.
41. General/group/control role does not create separate Reading type.
42. Reading recognition does not create Calculated Imbalance automatically.
43. Reading recognition does not create Operational Loss automatically.
44. Reading recognition does not create Accrual automatically.
45. Numeric equality across telemetry/manual sources does not prove same measurement fact.
46. Supplier-calculated transformation-loss quantity ≠ Reading.
47. Fake Subject must not be created for unknown reporter.
48. Recognition rules/versions remain explainable where materially significant.
49. Reading need not universally require Meter identity if applicable measurement semantics is not meter-based.
50. Raw and converted representation do not automatically create two Reading identities.
51. Photo/document metadata ≠ measurement time automatically.
52. Display precision/format ≠ resource precision automatically.
53. Estimated/substitute value ≠ Reading automatically.
54. Meter-based value during a gap must not create fictitious Meter Installation.

## 62. Решения internal review

1. **Reading имеет собственную предметную identity.** Tuple Accounting Point/time/channel/value недостаточен как универсальная identity: совпадение tuple не доказывает один и тот же measurement fact, а correction/history должны оставаться различимыми.
2. **Universal Reading Candidate / Submission entity не нужна.** Received/observed values принадлежат intake/integration semantics соответствующего канала до domain recognition.
3. **Meter Installation не обязательна для любого возможного Reading фундаментально.** Она обязательна для обычного meter-based Reading, но модель допускает иной sufficiently defined measurement basis относительно Accounting Point без фиктивного Meter.
4. **Reading только на Accounting Point без Meter допустим лишь при explicit applicable non-meter measurement semantics.** Для пилотных счётчиков Meter Installation должна быть определима.
5. **Universal one Reading per Accounting Point per day constraint не вводится.** Возможны разные times/channels/observations.
6. **Lower-than-previous value не блокирует recognition автоматически.** Replacement, rollover, reset, channel semantics и correction требуют контекста.
7. **Duplicate отделяется от повторного observation через provenance/semantic identity.** Numeric equality/date equality недостаточны.
8. **Owner-reported value может признаваться автоматически**, если applicable authority/access/rule и validation это позволяют. Сам факт ownership/reporting такого права не создаёт.
9. **Control Reading не получает universal higher priority.** Приоритет/коррекция определяются control process/rule и evidence.
10. **Telemetry Reading может признаваться без Subject**, если automatic recognition разрешено rule/semantic contract. Automated system остаётся не-Subject; provenance source сохраняется отдельно.
11. **Universal quality/confidence score не вводится.** Конкретный process может хранить quality flags/limitations, если они имеют предметный смысл.
12. **Unresolved/conflicting values остаются вне Reading до resolution**, если нельзя признать самостоятельные measurement facts. Universal conflict state machine не вводится.
13. **Отдельная Correction entity не нужна.** Reading correction исторически связывает original и corrected/effective recognition на sufficient basis.
14. **Reading correction не меняет Consumption автоматически.** Resource recalculation — отдельное owning action/result.
15. **Consumption correction не меняет Accrual автоматически.** Financial recalculation/correction принадлежит financial context.
16. **Raw и converted representations не образуют два Reading автоматически.** Если это две формы одного measurement fact, identity одна; если они выражают materially different measurement semantics, решение принимает конкретный process.
17. **Universal Meter Register entity для day/night сейчас не нужна.** Достаточна explicit channel/measurement semantics в Reading/process context.
18. **Неизвестное точное время хранится с реально доступной temporal precision.** Нельзя придумывать HH:MM.
19. **Reporter identity не обязательна для Reading универсально.** Для manual report она может быть существенно важна; для telemetry/document/provider source provenance может быть достаточным без создания fake Subject.
20. **Pilot-ST scenarios достаточны для стабилизации базовой recognition model.** Дополнительно проверены photo/time conflict, display precision, substitute estimate и meter-gap value.

Блокирующих предметных вопросов по базовому Reading recognition после internal review не осталось.

## 63. Нормативная синхронизация

Новый ADR и новые fundamental entities не требуются.

В текущей Draft-ветке выполнена точечная синхронизация:

- ADR-007 — Reading identity, recognition outcomes, historical Meter Installation mapping, duplicate/conflict/correction boundaries, late/out-of-order semantics и telemetry/provider boundary;
- DOMAIN_MODEL → 0.20 — Reading закреплён как самостоятельный recognized fact с identity, temporal/provenance semantics и correction boundary;
- TERMINOLOGY → 0.18 — термин Reading уточнён для manual/import/telemetry/provider scenarios;
- REFERENCE_CANDIDATE_MATRIX — Stage 7 переведён в состояние «выполняется», BP-READING-001 зафиксирован как foundation, REF-METER-002 остаётся следующим.

Новые universal Reading Candidate, Measurement Submission, Measurement Event, Meter Register, Rejection или Correction entities не введены.

ADR-010 и ADR-011 не требуют изменения: existing authority/access и external-information recognition semantics уже покрывают manual/automatic Reading recognition.

## 64. Текущее состояние и следующий шаг

BP прошёл:

- internal review against ADR-004/005/007/010/011;
- pilot-ST scenario check по electricity/water, individual/group/two-zone Meter, replacement boundary, late Reading, conflicting owner/control values, telemetry/manual duplication, supplier settlement quantity, temporal precision и correction;
- нормативную синхронизацию ADR-007 / DOMAIN_MODEL / TERMINOLOGY / REFERENCE_CANDIDATE_MATRIX.

Блокирующих предметных вопросов по базовому Reading recognition не осталось.

Следующий процесс Stage 7 после принятия/merge BP-READING-001:

**REF-METER-002 — automatic Reading import/recognition**.

Он должен использовать BP-READING-001 как единую domain recognition model и добавить только integration semantics: external source/device mapping, delivery/redelivery, batch/stream behavior, unknown outcome, conflict and re-recognition where needed.

После automatic import последовательность Stage 7 продолжается: control reading → Control Reconciliation → Calculated Imbalance → Operational Loss recognition.

Дополнительный внешний review BP-READING-001 сейчас не инициируется: Draft не вводит новой фундаментальной сущности и не меняет уже принятую границу resource/finance/integration contexts.

---

## 11. REFERENCE_CANDIDATE_MATRIX excerpt

| REF-DOC-003 | Генерируемые счета, квитанции, отчёты как источник финансовой истины | OSBBX | ADR-009 и ADR-006 разделяют документ и финансовый факт | **Не вводить отдельно** | Документ считать представлением/оформлением соответствующих фактов |
| REF-DOC-004 | Формирование, печать и выдача кассового документа / ПКО | пилотный СТ, BP-CASH-001, реальная форма КО-1 | PR #59 `BP-DOC-CASH-001`: Document/Revision/Representation отделены от cash/Payment facts; для пилота проверяется один ПКО как Document с composite Representation «ордер + квитанция», быстрый сценарий Reading → obligations → cash → Allocation → print и downstream export в BAF/BAS без передачи ему domain ownership | **В работе (PR #59)** | Завершить independent multi-review, point fixes и normative sync; не вводить отдельные Receipt/Document Part/Cash Operation без доказанной необходимости |
| REF-DOC-005 | Правовые и фискальные требования к кассовому документу украинского пилота | пилотный СТ | Архитектурная модель документа отделена от финансовых фактов; Community OS receipt/ПКО не считается автоматически фискальным/RRO/PRRO документом; обязательность формы, реквизитов, подписей, регистрации и кассовой дисциплины ещё требует актуальной проверки | **Backlog после REF-DOC-004** | После принятия BP-DOC-CASH-001 провести отдельный current-law legal/formalization analysis для Украины; не смешивать его с предметной моделью BAF/BAS |

---

## 12. Review discipline

Если Draft формулирует proposal, не трактуй его как уже принятое нормативное решение.

Если обнаружено противоречие:
1. укажи точный conflicting source/section;
2. различи semantic conflict и просто недостаточную формулировку;
3. предложи минимальное исправление;
4. не вводи новую fundamental entity, если проблему можно решить relation/policy/provenance/process semantics.

Если правовой вопрос зависит от актуального законодательства Украины, отметь его как вход в **REF-DOC-005**, а не делай неподтверждённый юридический вывод.
