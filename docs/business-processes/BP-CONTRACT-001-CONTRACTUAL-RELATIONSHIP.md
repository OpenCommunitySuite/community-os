# BP-CONTRACT-001 — Признание, изменение и прекращение договорного отношения с сообществом

**Статус:** Draft  
**Контекст:** отношения субъекта с сообществом / документы / финансы / объекты и инженерная инфраструктура  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет признание, изменение и прекращение исторически значимого договорного отношения между конкретным Community и определённым Subject.

Процесс нужен для сценариев, в которых само устойчивое отношение имеет предметный смысл, не сводимый к одному документу, платежу, обязательству, расходу или операции.

Типовые примеры:

- поставка электроэнергии;
- поставка воды;
- вывоз отходов;
- подрядные работы;
- банковское обслуживание;
- предоставление интернет-услуги Community;
- использование внешним Subject инфраструктуры Community за плату;
- аренда помещения или иной инфраструктуры;
- другие устойчивые договорные отношения Community с внешним Subject.

## 2. Основные различия

Сохраняются следующие различия:

```text
Subject
≠ Contractual Relationship
≠ Contract Document
≠ Financial Obligation
≠ Accrual
≠ Payment
≠ Expense
≠ Use / Lease relation to Object
≠ External Integration Party
```

Дополнительно:

- Supplier ≠ Subject type;
- contractual role ≠ Access Role;
- contract number ≠ Contractual Relationship identity;
- document signing date ≠ effective start relationship;
- relationship termination ≠ cancellation of outstanding obligations;
- correction of wrong data ≠ real relationship change;
- amendment/extension ≠ automatically new relationship;
- new file/revision ≠ automatically new relationship;
- bank transaction party data ≠ established Subject;
- one-time financial operation ≠ automatically Contractual Relationship.

## 3. Границы процесса

Процесс начинается, когда существует предметная потребность признать или изменить устойчивое договорное отношение Community с определимым Subject.

Процесс заканчивается, когда:

- отношение признано, изменено, продлено, прекращено либо признано новым отдельным отношением;
- существенная историческая семантика сохранена;
- связанные документы, основания и context-specific links установлены только в допустимом объёме;
- никакие финансовые, ресурсные, объектные или access-факты не созданы автоматически только из факта Contractual Relationship.

Настоящий BP не является:

- универсальным contract management workflow;
- системой юридического документооборота;
- бухгалтерским учётом договоров;
- CRM контрагентов;
- реестром всех договоров между любыми Subjects;
- универсальной моделью закупок;
- универсальным workflow согласования договора.

## 4. Что входит и не входит

### 4.1. Входит

Процесс определяет:

- признание нового Contractual Relationship;
- identity отношения;
- связь с Community и Subject;
- contextual roles;
- предмет отношения;
- известное основание;
- номер/дату/период, если применимо;
- связь с Contract Documents;
- существенное изменение отношения;
- продление;
- прекращение;
- correction ошибочных сведений;
- отличие modification от нового отношения;
- историческую объяснимость;
- последствия для связанных контекстов на уровне границ ответственности.

### 4.2. Не входит

Процесс не создаёт самостоятельно:

- Financial Obligation;
- Accrual;
- Payment;
- Bank Transaction;
- Expense;
- Personal Account;
- Ownership;
- Use;
- инженерный элемент;
- User Account;
- Subject Identity Anchor;
- Access Grant;
- Voting Right;
- Membership;
- Domain Power;
- бухгалтерскую проводку;
- складскую/ТМЦ сущность;
- универсальный юридический статус документа.

## 5. Рабочее понятие Contractual Relationship

**Contractual Relationship** — самостоятельное исторически значимое отношение между конкретным Community и определённым Subject, возникшее на договорном или ином согласованном основании и описывающее предметно значимую область их взаимодействия.

Contractual Relationship вводится только тогда, когда само договорное отношение имеет самостоятельный предметный смысл для Community OS и не исчерпывается уже существующим специализированным отношением.

Определение синхронизировано с DOMAIN_MODEL, TERMINOLOGY и ADR-002; настоящий BP остаётся процессным источником детальной семантики.

## 5.1. Граница со специализированными отношениями

Наличие договора, соглашения или Contract Document само по себе не означает, что требуется отдельный Contractual Relationship.

Если предмет отношений уже принадлежит более специализированной модели и она полностью сохраняет необходимую семантику, именно специализированное отношение остаётся предметным источником истины.

Примеры:

- трудовой договор может быть основанием/документом **Служебного / трудового отношения** и не требует второго параллельного Contractual Relationship только из-за формы договора;
- договор аренды участка между Owner и Tenant, где Community не является стороной, относится к Subject↔Object Use/Lease semantics;
- представительство, оформленное документом, остаётся Representation, а не Contractual Relationship;
- Membership не превращается в Contractual Relationship из-за наличия заявления, соглашения или документа.

Гражданско-правовой договор (ГПХ) сам по себе не определяет owning relation.

Если ГПХ является юридической/организационной формой уже признанного **Служебного / трудового отношения** конкретного исполнителя с Community и специализированная модель сохраняет необходимую семантику, отдельный Contractual Relationship не создаётся.

Если же ГПХ оформляет самостоятельное внешнее подрядное/исполнительское отношение Community с Subject, которое не является Служебным / трудовым отношением и имеет собственную identity, предмет, период или последствия, Contractual Relationship допустим.

Физическое или юридическое лицо, название документа и сама форма ГПХ не являются универсальным критерием выбора owning relation.

Поставка, банковское обслуживание, использование инфраструктуры и другие отношения Community с внешним Subject могут использовать Contractual Relationship по тому же предметному критерию.

Сохраняется принцип:

```text
presence of contract/agreement
≠ automatic Contractual Relationship
```

Это правило не вводит универсальную иерархию типов отношений; ownership семантики определяется существующими предметными контекстами.

## 6. Архитектурное владение

Contractual Relationship относится к существующему контексту **«Отношения субъекта с сообществом»**.

Выбор этого owning context является предметным, а не техническим:

- ядро Contractual Relationship — историческое отношение конкретного Subject с конкретным Community;
- отношение может существовать без Financial Obligation, Payment или Expense;
- финансовое направление не является свойством relationship и может быть `Community → Subject`, `Subject → Community`, двусторонним либо отсутствовать в конкретный период;
- Finance использует Contractual Relationship как возможное основание/контекст своих фактов, но не должен владеть identity отношения только потому, что из него могут возникать денежные последствия.

Следовательно, перенос Contractual Relationship в финансовый контекст смешал бы само отношение с одним из возможных видов его последствий.

При нормативной синхронизации ADR-002 §6.4 должен быть уточнён явно: Contractual Relationship добавляется в ключевые понятия исторических отношений Subject↔Community, а ADR-002 §6.6 сохраняет ownership Supplier, Financial Obligation, Payment, Expense и других финансовых фактов.

Это не создаёт новый bounded context «Contracts».

Другие контексты сохраняют ownership собственных понятий:

- Documents — Document, Revision, Representation, Signing, Registration;
- Finance — Obligation, Accrual, Payment, Expense, Bank Transaction;
- Objects — Object и Subject↔Object relations;
- Resource/Engineering — инженерная структура, точки учёта, ресурсные факты;
- Access — User Account, Access Grant и technical access;
- Integrations — external representations и recognition semantics.

## 7. Участники процесса

В процессе могут участвовать:

**Инициатор** — участник, сообщивший или зафиксировавший необходимость признать/изменить отношение.

**Уполномоченный участник** — Subject, имеющий предметное полномочие признать, изменить или прекратить отношение от имени Community согласно применимой policy.

Recognition может быть автоматизировано только при явно применимом правиле и достаточных признанных основаниях. Автоматизированный механизм не становится Subject и не заменяет требуемое полномочие там, где действие должно быть совершено человеком или от имени Community.

**Внешний Subject** — установленный Subject, являющийся стороной отношения с Community.

**Контексты-владельцы связанных фактов** — финансовый, документный, объектный, инженерный и другие контексты, использующие Contractual Relationship как возможное основание.

Технический администратор не получает предметное полномочие управлять Contractual Relationship только из факта системной роли.

## 8. Канал получения сведений и общая последовательность

### 8.1. Канал получения

Сведения об отношении могут быть получены:

- вручную уполномоченным участником;
- из Contract Document;
- из migration source;
- из внешней системы;
- из другого предметного процесса.

Получение сведений не означает recognition отношения.

```text
received information
≠ recognized Contractual Relationship
```

Для external/imported data применяются ADR-011 и соответствующие migration/integration semantics.

### 8.2. Recognition нового отношения

Общая семантическая последовательность:

```text
полученные сведения / инициирование
→ Subject identification
→ Contractual Relationship identity resolution
→ validation subject matter / basis / time / roles where applicable
→ authority / applicable rule check
→ recognition
→ explicit context-specific links
```

Recognition не создаёт автоматически финансовые, документные, ресурсные, объектные или access-факты.

### 8.3. Изменение существующего отношения

Общая последовательность:

```text
existing Contractual Relationship
→ новые сведения / действие
→ classification:
     correction
     real modification
     extension
     termination
     new relationship instead
→ authority / rule check
→ history-preserving domain change
→ context-specific consequences handled by owning contexts
```

Классификация изменения является предметным решением. Она не определяется автоматически техническим CRUD-действием, новым файлом или последним полученным значением.

## 9. Идентификация Subject

До recognition отношения должен быть установлен Subject.

Совпадение:

- названия организации;
- ФИО;
- ЕДРПОУ/РНОКПП;
- банковских реквизитов;
- телефона/email;
- внешнего идентификатора

само по себе не является универсальным правилом automatic merge.

Если реальная сторона не установлена достаточно:

- Contractual Relationship не создаётся;
- не создаётся фиктивный `Unknown Counterparty`;
- сведения остаются unresolved в соответствующем процессе/источнике.

## 10. Identity Contractual Relationship

Contractual Relationship имеет собственную устойчивую identity.

Identity не определяется только:

- парой Community + Subject;
- видом отношения;
- номером договора;
- датой договора;
- названием документа;
- банковским назначением;
- внешним ID.

Один Subject может иметь несколько Contractual Relationships с одним Community одновременно или последовательно.

Contractual Relationship всегда принадлежит конкретному Community. Наличие отношения этого Subject в одном Community не создаёт такое же отношение в другом Community автоматически.

Совпадение Subject и contract number является matching signal, но не универсальным доказательством одной identity.

## 11. Базовая кардинальность сторон

Для текущего BP один Contractual Relationship связывает:

```text
1 Community ↔ 1 Subject
```

Community не превращается в Subject ради унификации сторон.

Настоящий BP не вводит универсальный `Party`.

Реальные многосторонние agreements с несколькими внешними Subjects требуют отдельного исследования. Они не должны искусственно раскладываться на независимые Contractual Relationships, если такое разбиение меняет предметный смысл.

## 12. Relation kind

Contractual Relationship может иметь применимый вид/классификацию, если это нужно предметному процессу.

Например:

- resource supply;
- service;
- works/contracting;
- infrastructure use;
- lease;
- banking service;
- other configured kind.

Ядро не задаёт закрытый enum.

Следует различать:

```text
configured/allowed relation kind
≠ concrete Contractual Relationship
```

Конфигурация Community может определять допустимые виды отношений и относящиеся к ним политики согласно ADR-003, но она не создаёт конкретное отношение.

Relation kind не является identity и не заменяет предмет отношения.

Следует различать:

- **relation kind** — классификацию отношения для применимости configuration/policy;
- **subject matter** — предметное описание того, что регулирует конкретный relationship.

Они могут иметь внешне похожие названия, например `infrastructure use`, но это не делает их одним значением или одним предметным понятием.

Изменение перечня допустимых видов не переписывает исторически признанные relationships автоматически.

## 13. Contextual roles

В рамках отношения могут быть определимы роли Community и Subject.

Примеры:

- supplier / customer;
- contractor / customer;
- lessor / lessee;
- infrastructure provider / infrastructure user;
- service provider / service recipient;
- bank / banking customer.

Роль:

- существует только в контексте отношения;
- не является типом Subject;
- не является Access Role;
- не является Domain Power;
- не создаёт технический доступ;
- не становится универсальной `PartyRole` entity.

Одно отношение может иметь несколько ролей, если это соответствует фактической семантике соглашения.

## 14. Supplier и финансовый контекст

Supplier остаётся установленным Subject, используемым финансовым контекстом в специализированной семантике отношений с поставщиком согласно ADR-002/ADR-006.

Contractual Relationship не получает ownership понятия Supplier и не создаёт отдельную Supplier identity.

Договорное отношение может быть одним из оснований или контекстов финансовых отношений с Supplier, но:

- не каждое Contractual Relationship делает Subject поставщиком;
- Supplier не является типом Subject;
- Supplier не является универсальной внешней стороной;
- один Subject может одновременно участвовать в другом Contractual Relationship в иной роли.

Действующая TERMINOLOGY использует Supplier широко и приводит Contractor как один из примеров. Настоящий BP не отменяет это молча. Точная граница Supplier/Contractor подлежит нормативному уточнению без переноса ownership Supplier из финансового контекста.

## 15. Основание отношения

Для recognition должен быть определим предметно достаточный Basis.

Возможные примеры:

- заключённый договор;
- принятое предложение / публичная оферта;
- иное признанное соглашение.

Basis не тождествен Document.

Contractual Relationship может быть признан без загруженного файла договора, если имеются достаточные сведения о реальном отношении и основание признания.

## 16. Предмет отношения

Предмет отношения должен быть определим в объёме, достаточном для его отличия и связанных процессов.

Примеры:

- поставка электроэнергии;
- вывоз отходов;
- ремонт;
- банковское обслуживание;
- интернет-услуга;
- использование опор;
- аренда помещения.

Предмет отношения не превращается в универсальный `ContractItem`, `ContractAsset` или `ContractTarget`.

## 17. Связь с Object / Engineering scope

Если отношение касается Object, Engineering System или иного предмета другого контекста, используется явная context-specific связь.

Contractual Relationship не копирует identity и состояние такого предмета.

Например:

```text
Contractual Relationship
→ basis for infrastructure use
→ Engineering/Object context owns actual use relation/state
```

Если договор говорит «использование 35 опор», это не обязывает Community OS создавать 35 Asset/TMC entities.

То же правило применяется к аренде помещения или другого Object Community: Contractual Relationship может быть договорным основанием, а фактическое Subject↔Object Use/Lease relation, если оно предметно ведётся, принадлежит объектному контексту. Contractual Relationship не заменяет такое отношение.

## 18. Contract reference number

Номер договора:

- может быть известен;
- может отсутствовать;
- не является internal identity;
- не обязан быть глобально уникальным;
- не доказывает identity при совпадении;
- не создаёт relationship автоматически.

Локальная policy может задавать дополнительные ограничения номера.

## 19. Временная семантика

Для Contractual Relationship различаются, где применимо:

- agreement/conclusion date;
- effective start;
- effective end;
- recording/recognition time;
- date of a Document/Revision;
- date of material change.

Техническая дата создания записи не заменяет effective start.

Исторический период отношения использует `[start, end)`, когда такая семантика применима.

Unknown start не заменяется assumed date.

Отсутствие end означает продолжающееся отношение, если контекст не утверждает иное.

## 20. Contract Document

Contractual Relationship может существовать без Document.

Если Document существует:

```text
Contractual Relationship
≠ Document
≠ Revision
≠ Representation
```

Document может:

- оформлять отношение;
- подтверждать его;
- быть основанием;
- изменять условия;
- фиксировать прекращение;
- относиться к нему другим предметно определённым способом.

Сам факт наличия документа не создаёт relationship автоматически.

## 21. Main contract, annex и amendment

С одним Contractual Relationship могут быть связаны несколько Documents.

Например:

- основной договор;
- приложение;
- дополнительное соглашение;
- акт;
- счёт;
- иные документы.

Наличие нового Document не означает автоматически новое Contractual Relationship.

Document context сохраняет identity и history собственных документов; Relationship context сохраняет identity отношения.

## 22. Условия отношения

Настоящий BP не вводит универсальный bag/EAV/JSON `Contract Terms`.

Предметно значимые условия принадлежат соответствующей семантике.

Например:

- цена ресурса;
- ставка за опору;
- периодичность оплаты;
- формула индексации;
- объём работ;
- scope использования инфраструктуры.

Если условие используется в исторически значимом расчёте или действии, должна быть объяснима фактически применённая версия/значение согласно ADR-004/005 и owning context.

## 23. Recognition нового отношения

Новое Contractual Relationship может быть recognized, если:

1. определено Community;
2. установлен Subject;
3. достаточно определим предмет отношения;
4. имеется достаточный Basis;
5. relation identity не совпала надёжно с уже существующим отношением;
6. уполномоченный процесс/участник либо явно применимое правило допустили recognition.

Номер договора и Contract Document не являются обязательными сами по себе.

## 24. Повторное обнаружение существующего отношения

Если поступили сведения о возможном существующем Contractual Relationship:

- сначала выполняется identity resolution;
- existing relationship может быть reused;
- совпадение номера/Subject/вида не достаточно для blind merge;
- новое отношение не создаётся для каждого нового файла или платежа.

Если идентичность неоднозначна, результат остаётся unresolved до resolution.

## 25. Существенное изменение условий

Если фактически продолжается то же отношение, существенное изменение условий не создаёт новую identity автоматически.

Изменение должно оставаться исторически объяснимым.

Примеры:

- изменение ставки;
- изменение периода;
- изменение объёма;
- изменение scope;
- изменение роли стороны в рамках того же соглашения;
- добавление/изменение приложения.

Конкретная модель версии условия принадлежит owning context; universal Contract Version не вводится настоящим BP.

## 26. Продление

Продление того же соглашения может сохранять Contractual Relationship identity.

При этом:

- прежний effective period не переписывается молча;
- основание продления и применимый момент должны быть объяснимы;
- новый Document/Amendment может быть связан с отношением;
- финансовые правила и другие context-specific terms изменяются отдельно.

Новый номер или новый документ сами по себе не определяют, является ли это продлением или новым отношением.

## 27. Новое отношение вместо продолжения

Создаётся новый Contractual Relationship, если фактически возникло новое самостоятельное отношение, а не изменение существующего.

Признаками могут быть:

- новый самостоятельный договор;
- прекращение прежнего и возникновение нового;
- существенно иная договорная основа;
- фактическое отсутствие continuity.

Универсальное правило по номеру, дате или имени файла не вводится.

Если различие неоднозначно, решение требует предметного resolution.

## 28. Прекращение

Прекращение Contractual Relationship:

- завершает его будущую предметную применимость согласно effective end;
- не удаляет историю;
- не отменяет автоматически Financial Obligations;
- не возвращает Payments;
- не удаляет Expenses;
- не прекращает автоматически Ownership/Use;
- не отзывает Access Grant;
- не изменяет исторические Documents;
- не отменяет уже выполненные предметные действия.

Связанные contexts отдельно определяют последствия прекращения основания.

## 29. Outstanding obligations после прекращения

Если к моменту прекращения существуют неисполненные Financial Obligations, они не исчезают автоматически.

Например:

```text
Contractual Relationship ended
≠ outstanding Obligation cancelled
```

Исполнение, изменение, отмена или спорность обязательства принадлежат финансовому процессу.

## 30. Correction

Correction ошибочных сведений отличается от реального изменения отношения.

Примеры correction:

- ошибочный номер;
- ошибочная дата;
- ошибочно выбранный Subject;
- неверно указанный relation kind.

Correction:

- не изображается фиктивным termination + new relation, если реального изменения не было;
- сохраняет достаточную историческую прослеживаемость;
- не выполняет silent cascade rewrite связанных domain facts.

Если неверный Subject уже использован как основание финансового или иного признанного факта, owning context определяет требуемые последствия отдельно.

## 31. Реальная замена стороны

Реальная юридически значимая замена Subject и correction ошибочной Subject linkage — разные события.

Настоящий BP не вводит универсальную семантику:

- правопреемства;
- уступки;
- перевода договора;
- слияния юридических лиц;
- иных способов замены стороны.

До появления конкретного сценария Subject не заменяется молча.

## 32. Финансовые обязательства

Contractual Relationship как признанное историческое отношение может быть Basis для нуля, одного или многих Financial Obligations. Его собственное Basis и основания производных финансовых фактов остаются различимыми.

Направление не фиксируется на уровне relationship:

```text
Community → Subject
Subject → Community
```

оба варианта допустимы.

В сложном соглашении возможны обязательства в обоих направлениях.

Contractual Relationship не создаёт Obligation автоматически.

## 33. Accrual и расчётные условия

Contractual Relationship может предоставлять Basis и применимые условия для расчёта.

Но:

```text
contract rate
≠ Accrual
≠ Financial Obligation
```

Например ставка за одну опору и количество используемых опор могут быть inputs финансового процесса.

Финансовый context определяет, создаётся ли Accrual, Obligation или другой финансовый result.

## 34. Payment

Payment не создаёт Contractual Relationship автоматически.

Payment может исполнять Obligation, основанный на Contractual Relationship.

Фактический Payer может отличаться от obliged party согласно ADR-006.

Закрытие relationship не переписывает Payment history.

## 35. Bank Transaction

Bank Transaction не доказывает наличие Contractual Relationship.

Bank counterparty data является input для matching/classification.

Неизвестная сторона Bank Transaction не требует:

- fake Subject;
- fake Contractual Relationship;
- fake Personal Account.

Это является обязательной границей для будущего BP-FIN-BANK-001.

## 36. Expense

Contractual Relationship и Expense различаются.

Contractor agreement может быть основанием:

```text
Contractual Relationship
→ Financial Obligation
→ Expense
→ Payment
```

но конкретный порядок и связи принадлежат финансовому процессу.

Исходящий Payment не создаёт Expense автоматически.

## 37. ISP использует опоры Community

Проверочный сценарий:

```text
Community
↕ Contractual Relationship
ISP Subject

subject matter: infrastructure use
roles:
  Community = infrastructure provider / lessor
  ISP = infrastructure user / lessee

pricing input: 35 poles × rate per pole
        ↓
financial process
        ↓
Financial Obligation:
  obliged = ISP
  entitled = Community
        ↓
Payment
```

Contractual Relationship не становится:

- списком основных средств;
- инженерной топологией;
- Accrual;
- Obligation;
- Payment.

## 38. ISP одновременно оказывает услугу Community

Если тот же ISP предоставляет интернет для офиса Community, возможны:

1. отдельный Contractual Relationship;
2. одно фактическое сложное соглашение с несколькими предметами/ролями.

Система не объединяет отношения только потому, что Subject один и тот же.

Если фактически один договор содержит взаимные обязательства, relationship может быть основанием обязательств в разных направлениях.

## 39. Supplier resource scenario

Поставщик электроэнергии:

```text
Community ↔ Supplier Subject
→ Contractual Relationship
→ resource/price conditions as applicable
→ Community Obligation
→ Payment
```

Resource consumption остаётся ресурсным фактом.

Supplier invoice/document сам по себе не создаёт Obligation без соответствующего financial recognition.

## 40. Contractor scenario

Подрядчик:

```text
Community ↔ Contractor Subject
→ Contractual Relationship
→ work scope
→ Operational Work / result where applicable
→ Financial Obligation
→ Expense
→ Payment
```

Contractual Relationship не становится Work Order.

Work result и акт/Document также не являются relationship.

## 41. Bank scenario

Следует различать:

```text
Bank as legal Subject
≠ Bank as contractual service provider
≠ External Integration Party
≠ bank-transaction counterparty data
```

Community может иметь Contractual Relationship с Bank Subject по банковскому обслуживанию.

Интеграционный API/statement source не становится стороной этого отношения автоматически.

## 42. Частная аренда между Subjects

Если Owner сдаёт участок Tenant, а Community не является стороной:

```text
Owner Subject
Tenant Subject
Property Object
```

основной факт Community OS относится к Subject↔Object relation, например Use/Lease.

Частный договор может быть Basis/Document этого отношения.

Contractual Relationship with Community не создаётся автоматически.

## 43. Разовая операция без устойчивого отношения

Разовая покупка, чек, invoice, Payment или Bank Transaction не создают Contractual Relationship автоматически.

Relationship оправдан, если само соглашение/отношение имеет отдельную предметную identity, условия, период, предмет или последствия.

Одноразовый формальный подряд может быть Contractual Relationship, если сам договор является предметно значимым отношением, даже при одной финансовой операции.

## 44. Access и User Account

Contractual Relationship не создаёт автоматически:

- User Account;
- Subject Identity Anchor;
- Access Grant;
- Access Role;
- Domain Power.

Если представитель внешнего Subject получает кабинет или иной technical access, используется BP-ACCESS-001 и применимая access policy.

Договорная роль не является ролью доступа.

## 45. Полномочия

Recognition, изменение и прекращение Contractual Relationship являются предметно значимыми действиями.

Должны быть определимы, где применимо:

- фактически действующий Subject;
- представленная сторона/Community;
- основание полномочия;
- момент действия;
- source/provenance;
- автоматический характер, если применим.

Техническая возможность редактирования не заменяет предметное полномочие.

Конкретные community policies полномочий определяются отдельно.

## 46. История и provenance

Для исторически значимого Contractual Relationship должны быть объяснимы, где применимо:

- Community;
- Subject;
- identity relationship;
- relation kind;
- contextual roles;
- Basis;
- subject matter;
- effective period;
- известные reference attributes;
- существенные изменения;
- termination;
- corrections;
- связанные Documents;
- source/provenance;
- actor/authority значимых ручных действий.

Не требуется universal Contract Audit Record.

## 47. Конфликтующие сведения

Система может получить конфликтующие сведения:

- разные даты;
- разные номера;
- разные Subjects;
- разные версии предмета;
- разные сведения о прекращении.

Конфликтующие сведения не признаются одновременно применимыми автоматически.

Приоритет источника и resolution определяются соответствующей policy/process.

Last-write-wins не является предметным правилом.

## 48. Ошибочный duplicate

Если два Contractual Relationships позже признаны ошибочным дублированием, нельзя молча удалить один и перепривязать все связанные факты.

Correction identity требует:

- установления правильной identity;
- сохранения истории ошибки;
- review зависимых domain facts;
- context-owned corrections там, где они нужны.

Универсальный cascade merge не вводится.

## 49. UI «Контрагенты»

UI может показывать список «Контрагенты» как Read Model / Projection:

```text
Subjects
+ Contractual Relationships
+ relevant financial/operational relations
→ Counterparties UI
```

Это не создаёт source-of-truth `Counterparty` entity.

## 50. Проверочные исходы процесса

Для значимого действия различаются как минимум:

- New Relationship Recognized;
- Existing Relationship Confirmed / Reused;
- Relationship Changed;
- Relationship Extended;
- Relationship Ended;
- Data Corrected;
- New Relationship Required Instead of Change;
- Unresolved Identity;
- Conflict;
- Rejected / Not Recognized.

Техническая ошибка выполнения не является предметным Rejected.

Настоящий BP не требует одного universal status enum.

## 51. Инварианты процесса

1. Community не является Subject только ради договорной модели.
2. Counterparty не вводится как параллельная identity рядом с Subject.
3. Contractual Relationship имеет собственную identity.
4. Contractual Relationship связывает одно Community и один установленный Subject в текущем baseline.
5. Multi-party agreement не раскладывается искусственно без отдельного решения.
6. Subject + Community не определяют relationship identity автоматически.
7. Contract number не является relationship identity.
8. Document не является relationship.
9. Contractual Relationship может существовать без Contract Document.
10. Новый Document не создаёт новый relationship автоматически.
11. Новая Revision не создаёт relationship автоматически.
12. Supplier является специализированной семантикой установленного Subject во владении финансового контекста, а не Subject type или отдельной identity.
13. Contractual role не является Access Role.
14. Relation kind не является identity.
15. Допустимый relation kind как конфигурация не является конкретным Contractual Relationship и не создаёт его.
16. Subject matter не моделируется universal ContractItem/ContractAsset.
17. Contractual Relationship не копирует Object/Engineering identity.
18. Полученная информация не является recognized relationship.
19. Unknown external party не заменяется fake Subject.
20. Payment не создаёт relationship автоматически.
21. Bank Transaction не создаёт relationship автоматически.
22. Invoice/receipt не создают relationship автоматически.
23. Contractual Relationship не создаёт Financial Obligation автоматически.
24. Contractual Relationship не создаёт Accrual автоматически.
25. Contractual Relationship не создаёт Expense автоматически.
26. Contractual Relationship не создаёт Use/Ownership автоматически.
27. Contractual Relationship не создаёт User Account/Access Grant/Voting Right.
28. Relationship не имеет постоянного финансового направления.
29. Один relationship может быть Basis для многих Obligations.
30. Obligation может существовать после termination relationship.
31. Termination relationship не отменяет historical Payment/Expense/Document.
32. Real change и correction различаются.
33. Amendment/extension и new relationship различаются.
34. Number/date/file сами по себе не определяют amendment vs new relationship.
35. Subject replacement не выполняется silent edit.
36. Correction identity не выполняет universal cascade rewrite.
37. Used historical conditions не переписываются текущими условиями молча.
38. Bank Subject, External Integration Party и bank counterparty data различаются.
39. Private Subject↔Subject agreement без Community не создаёт Contractual Relationship with Community.
40. One-off operation не требует relationship автоматически.
41. Наличие договора/соглашения не создаёт Contractual Relationship, если предмет полностью принадлежит существующему специализированному отношению.
42. Трудовой договор не дублирует Служебное / трудовое отношение автоматически.
43. ГПХ не определяет owning relation автоматически: он может быть формой Служебного / трудового отношения либо основанием самостоятельного Contractual Relationship согласно предметному смыслу.
44. Relation kind и subject matter являются различными понятиями, даже если их текстовые значения совпадают.
45. Contractual Relationship для аренды Object Community не заменяет Subject↔Object Use/Lease relation, если такое отношение предметно ведётся.
46. Technical admin role не создаёт domain authority.
47. Conflict не разрешается last-write-wins.
48. UI Counterparty не требует domain Counterparty entity.
49. Contractual Relationship принадлежит одному Community и не становится global cross-community relation.
50. Automatic recognition допустим только по явному правилу и не создаёт фиктивного system Subject.
51. Contractual Relationship может быть Basis производного факта, не становясь этим фактом и не скрывая собственное Basis отношения.
52. Новый файл, последнее полученное значение или CRUD update не определяют автоматически тип предметного изменения relationship.
53. Изменение текущей конфигурации допустимых relation kinds не переписывает исторически признанные relationships автоматически.

## 52. Нормативная синхронизация

По результатам принятия BP выполнена минимальная нормативная синхронизация.

### DOMAIN_MODEL

- Contractual Relationship добавлен в раздел «Отношения субъекта к сообществу»;
- Supplier уточнён как специализированная финансовая семантика установленного Subject без отдельной identity/type;
- слишком узкая модель Supplier Contract заменена общей границей Contractual Relationship с сохранением financial ownership Supplier;
- зафиксированы различия Contractual Relationship / Document / Obligation / Payment / Expense / Use.

### TERMINOLOGY

Добавлены/уточнены:

- Contractual Relationship;
- contextual contractual role;
- Supplier;
- Form of Relationship / ГПХ — юридическая форма сама по себе не определяет owning relation.

Не введены:

- Counterparty как новая identity;
- PartyRole как universal entity;
- ContractItem/ContractAsset;
- универсальный Contract status workflow.

### ADR-002

Contractual Relationship явно добавлен в ключевые понятия контекста «Отношения субъекта с сообществом». Финансовый контекст сохраняет ownership Supplier и производных финансовых фактов.

Новый отдельный ADR не требуется.

## 53. Связанные документы

- `docs/architecture/STAGE-3-CONTRACTUAL-RELATIONSHIP-ANALYSIS.md`;
- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-002;
- ADR-003;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-009;
- ADR-010;
- ADR-011;
- BP-ACCESS-001;
- BP-IMPORT-001;
- OSBBX reference analysis;
- Мій Дім Online reference analysis;
- REFERENCE_CANDIDATE_MATRIX.

## 54. Что намеренно не решается

Настоящий BP не определяет:

- multi-party agreements;
- договоры между любыми Subjects вне участия Community;
- procurement/tender workflow;
- согласование проекта договора;
- электронную подпись и юридическую силу e-signature;
- универсальную модель юридического правопреемства;
- техническую схему хранения;
- UI contract registry;
- нумератор договоров;
- OCR/extraction;
- шаблоны документов;
- бухгалтерские проводки;
- BAS/BAF mapping;
- exact permission matrix;
- implementation of versioning.

## 55. Следующий шаг

Предметный и независимый review завершены, нормативная синхронизация выполнена, `REF-SUBJ-001` закрыт решением.

Следующий процесс:

`BP-FIN-BANK-001 — банковские сведения → Bank Transaction → предметная классификация`.

Он должен использовать принятую модель Subject / Contractual Relationship для классификации внешних сторон, не создавая Subject или Contractual Relationship автоматически из банковской строки или реквизитов контрагента.
