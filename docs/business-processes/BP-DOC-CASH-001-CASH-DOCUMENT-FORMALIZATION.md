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
