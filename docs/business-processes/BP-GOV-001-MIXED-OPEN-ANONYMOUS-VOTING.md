# BP-GOV-001 — Открытое и анонимное голосование со смешанными каналами

**Статус:** Принятая предметная основа этапа 11Б; выводы независимых рецензий учтены; вариант А принят; нормативные документы согласованы  
**Контекст:** Управление и коллективные процедуры  
**Связанные контексты:** Субъекты; Полномочия и представительство; Документы и формализация; Доступ; Интеграции  
**Связанные решения:** ADR-001, ADR-004, ADR-005, ADR-008, ADR-009, ADR-010, ADR-011

Связанные материалы:

- STAGE-11B-PILOT-REMOTE-VOTING-REQUIREMENT.md;
- STAGE-11B-MIXED-PAPER-ELECTRONIC-VOTING-STRESS-TEST.md;
- STAGE-11B-ANONYMOUS-VOTING-RIGHT-EXERCISE-STRESS-TEST.md;
- STAGE-11B-PILOT-MEMBERSHIP-PLOT-VOTING-STRESS-TEST.md;
- PILOT_ST_EXPRESS_MEETING_2026-10-24_REFERENCE_ANALYSIS.md.

---

## 1. Назначение

Настоящий бизнес-процесс определяет предметный смысл формального голосования, в котором одно голосование может принимать признанные волеизъявления несколькими допустимыми **способами участия, подачи и оформления**.

Например, процедура может сочетать:

- очное и дистанционное участие;
- бумажную и электронную формализацию;
- ручной ввод признанного волеизъявления, первоначально оформленного на бумаге;
- использование внешней электронной службы.

Эти признаки не образуют единой универсальной классификации каналов. Для каждого факта сохраняются сведения об источнике, способе подачи и оформления в соответствии с применимым правилом.

BP поддерживает два основных режима прозрачности выбора:

- **Открытое голосование** — связь между конкретным правом голоса и выбранной позицией может сохраняться и объясняться исторически;
- **Анонимное голосование** — Community OS не должна хранить данные, позволяющие восстановить связь между конкретным субъектом или правом голоса и выбранной позицией, когда выбор обрабатывает сама система.

**Каждое конкретное голосование использует один объявленный режим прозрачности выбора.** Смешанное голосование в настоящем документе означает сочетание допустимых способов подачи внутри одного режима, а не объединение открытого и анонимного голосования в одной процедуре.

Главная модель:

~~~text
одно голосование
→ одно применимое правило голосования и исходный снимок прав
→ несколько разрешённых способов участия и подачи волеизъявлений
→ признанные предметные входные данные
→ один расчёт
→ один установленный результат
~~~

Способ подачи сам по себе не создаёт отдельного голосования.

---

## 2. Нормативная основа

Настоящий бизнес-процесс развивает принятые архитектурные решения (ADR).

ADR-001 сохраняет различия:

~~~text
Субъект
≠ Учётная запись пользователя
≠ Собственность
≠ Членство
≠ Право участия
≠ Право голоса
≠ Реализатор права голоса
≠ Представительство
≠ Голос
~~~

ADR-008 сохраняет различия:

~~~text
Вопрос управления
≠ Голосование
≠ Голос
≠ Расчёт
≠ Установленный результат
≠ Управленческое решение
~~~

ADR-009 сохраняет document-scoped Signing:

~~~text
Подписание
→ Редакция документа / представление документа
~~~

Настоящий бизнес-процесс не распространяет подписание документов автоматически на произвольные действия, не связанные с документами.

ADR-010/011 сохраняют границу между технической идентификацией, provider result, User Account и domain admissibility.

---

## 3. Что входит

BP определяет:

- режим открытого или анонимного голосования;
- допустимые способы подачи в рамках одного голосования;
- участие очное и дистанционное;
- бумажные и электронные волеизъявления;
- использование права голоса;
- реализацию права голоса там, где она необходима как самостоятельный факт;
- отдельный голос при открытом голосовании;
- анонимный подсчёт вне системы;
- результат подсчёта вне системы;
- конфликт попыток использования одного права голоса;
- бумажный бюллетень как документ либо его представление;
- электронный бюллетень, оформленный подписанным документом;
- завершение периода приёма волеизъявлений;
- входные сведения для расчёта;
- границы исправления, пересмотра и повторного подсчёта;
- процедуру с сочетанием электронной подачи и подачи вне системы;
- проверочные сценарии первого внедрения.

---

## 4. Что не входит

BP не определяет:

- структуру базы данных PostgreSQL;
- программные интерфейсы (API) и пользовательский интерфейс;
- конкретный криптографический протокол анонимного электронного голосования;
- конкретную службу проверки КЕП или Дія.Підпис;
- юридическую допустимость конкретной процедуры без применимых правовых требований и правил управления;
- физическую процедуру тайного бумажного голосования;
- изготовление урн и бюллетеней;
- физический подсчёт комиссии;
- универсальную формулу кворума;
- универсальное правило разрешения конфликтов между бумажными и электронными волеизъявлениями;
- универсальный срок хранения бумажных оригиналов;
- автоматическое ограничение права голоса из-за задолженности.

---

## 5. Основные понятия

### 5.1. Открытое голосование

При открытом голосовании допустима связь:

~~~text
Право голоса
→ Голос
→ Выбранная позиция
~~~

допустима и исторически объяснима.

### 5.2. Анонимное голосование

При анонимном голосовании факт использования права может быть связан с конкретным лицом, но содержание выбора не должно связываться с конкретным правом голоса.

~~~text
Право голоса
→ Реализация права голоса

анонимный выбор
→ входные сведения / результат анонимного подсчёта

Реализация права голоса
X
Выбранная позиция
~~~

### 5.3. Реализация права голоса

Самостоятельный исторически значимый факт в области управления, фиксирующий, что согласно применимому правилу голосования конкретное право голоса признано **реализованным (использованным) для целей процедуры** допустимым реализатором без обязательного сохранения выбранной позиции.

Реализация права голоса сама по себе не доказывает автоматически:

- выбранную позицию;
- признание поданного голоса действительным;
- физический подсчёт;
- участие в смысле применимого правила;
- влияние на кворум;
- влияние на итог подсчёта.

Эти последствия определяет версия правила голосования, действовавшая в соответствующий момент.

Для каждого признанного факта реализации права голоса должно быть исторически объяснимо:

- какое событие или подтверждающее сведение послужило основанием признания;
- какая версия правила голосования считала это основание достаточным;
- какие последствия для процедуры правило связывает с данной реализацией права.

Основание признания является сведением о происхождении предметного факта, а не новой универсальной классификацией сущностей.

~~~text
Реализация права голоса
≠ Голос
≠ Выбранная позиция
≠ Право участия
~~~

### 5.4. Результат подсчёта вне системы

Самостоятельный исторически значимый факт в области управления, отражающий признанный итог внешнего физического подсчёта анонимных бумажных бюллетеней в определённой области подсчёта.

~~~text
Документ с протоколом бумажного подсчёта
≠ Результат подсчёта вне системы
≠ Расчёт
≠ Установленный результат
~~~

---

## 6. Присутствие, участие, получение бюллетеня и голос

Запрещено универсально отождествлять:

~~~text
физическое присутствие
=
участие
=
получение бюллетеня
=
реализация права голоса
=
голос
~~~

Пилотный кейс 24.10.2026:

~~~text
около 60 человек присутствуют физически
→ выдача бюллетеней
→ некоторые голосуют, другие — нет
→ правление позднее разносит бюллетени остальным садоводам
→ в протоколе указано 181 участник
→ по конкретному вопросу признано 139 позиций
~~~

Разница между величинами не классифицируется автоматически.

### 6.1. Участие

Настоящий бизнес-процесс не вводит участие как новую фундаментальную сущность с собственной идентичностью.

Если участие имеет значение для процедуры, оно определяется применимым правилом голосования как процедурный факт или показатель на основании явно перечисленных допустимых сведений, например:

- подтверждения присутствия;
- сведений о получении бюллетеня и соответствующих подтверждений;
- реализации права голоса;
- признанного голоса;
- иных фактов, предусмотренных правилом.

Следовательно:

~~~text
participation
≠ physical presence automatically
≠ Voting Right Exercise automatically
≠ Vote automatically
~~~

Новая самостоятельная Participation identity должна вводиться только если будущий процесс докажет независимый lifecycle/correction semantics.

---

## 7. Voting Rule

Применимая версия Voting Rule должна определять, где существенно:

- Participation Right;
- Voting Right;
- basis и weight;
- implementer;
- Representation;
- режим Open / Anonymous;
- момент фиксации режима до opening/acceptance submissions;
- способы участия, подачи и формализации;
- recognition basis/effects Voting Right Exercise where applicable;
- participation semantics/inputs where applicable;
- conflict classes, resolution basis и procedural outcome;
- relevant reference time для change/conflict;
- period/deadline;
- presence semantics;
- participation semantics;
- quorum;
- повторную/изменённую подачу;
- conflict между каналами;
- invalid/rejected semantics;
- Calculation;
- Established Result;
- required evidence;
- required signature/formalization;
- correction/review/recount.

---

## 8. Rights snapshot

До приёма формальных волеизъявлений формируется snapshot по ADR-001.

Он должен позволять восстановить:

- Voting Rights;
- basis;
- weights;
- implementers;
- использованные значения;
- применимую версию правила.

Поздние изменения Ownership/Membership/User Account не переписывают snapshot молча.

---

## 9. Channel не является видом Vote

~~~text
Vote identity
≠ paper/electronic channel
≠ submission transport
≠ data-entry operation
~~~

Для Open Voting:

~~~text
paper signed ballot
→ recognized Vote

electronic signed ballot/document
→ recognized Vote
~~~

После recognition это не два разных типа Vote.

---

## 10. Open online Voting

Типовой процесс:

~~~text
Voting Right
→ identified implementer
→ admissibility check
→ Position
→ required formalization/signing
→ recognition
→ Vote
~~~

Если procedure требует electronic Signing:

~~~text
electronic ballot Document
→ Revision/Representation
→ Signing
→ validation / Subject mapping / admissibility
→ recognized Vote
~~~

Signing не является Vote.

---

## 11. Open offline Voting

Типовой процесс:

~~~text
Voting Right
→ paper ballot
→ handwritten signature where required
→ receipt
→ validation/admissibility
→ operator entry
→ recognized Vote
~~~

Data-entry operator ≠ voter ≠ Voting Right implementer.

К Vote могут быть связаны scan/photo, Document/Representation и provenance physical original.

---

## 12. Один identifiable/signed Open ballot может содержать несколько Votes

~~~text
one paper Document
→ one handwritten Signing
→ Vote Q1
→ Vote Q2
→ ...
→ Vote QN
~~~

Правило 1 ballot file = 1 Vote не вводится.

Один multi-question ballot может охватывать несколько Questions и, следовательно, несколько Voting identities.

Для каждого recognized Vote должно быть исторически объяснимо:

- какой Document Revision/Representation был источником;
- какой локально адресуемый semantic item/field выражал Position именно этого Vote;
- какой Signing покрывал соответствующую Revision/Representation;
- как Position была распознана/введена.

Для любого Vote, происходящего из multi-item Document, эта mapping provenance является обязательной, а не optional evidence.

Отдельная universal Ballot Item entity этим не вводится.

Для Anonymous Voting действует дополнительная граница:

> identifiable/signed Document, связанный с Subject, не может содержать Position по Anonymous Voting.

Иначе:

~~~text
Signing → Subject
Document item → Position
~~~

восстанавливает запрещённую Subject/Voting Right→Position связь.

Следовательно, identifiable/signed multi-question ballot может объединять только совместимые Open Votings. Anonymous Position требует отдельного неидентифицируемого носителя/procedure.

---

## 13. Anonymous offline Voting

Community OS не владеет физической процедурой обеспечения тайны.

Она принимает два разных класса фактов.

### 13.1. Right-use evidence

~~~text
certified ballot issuance / receipt evidence
→ validation under applicable Voting Rule
→ Voting Right Exercise only if the rule explicitly declares
  that event as the right-consumption moment
~~~

Mere issuance/receipt **не является Voting Right Exercise автоматически**.

Для anonymous offline procedure Voting Rule должен явно определить, какой event считается реализацией/расходованием права.

Если rule не объявляет issuance/receipt consumption moment, такой факт остаётся evidence only и не создаёт Exercise.

Если после выдачи unlinkable paper ballot система объективно не может установить, был ли он впоследствии опущен в урну, rule может сознательно выбрать допустимую выдачу как consumption moment для защиты от двойного использования.

Такой Exercise не доказывает Position и не доказывает физический подсчёт ballot.

Reissue spoiled/lost ballot также определяется explicit Voting Rule и не возвращает право молча.

### 13.2. Choice count

~~~text
commission counts anonymous ballots
→ Result of Offline Count
~~~

Community OS не создаёт Subject-linked Votes из анонимных бумажных бюллетеней.

---

## 14. Result of Offline Count — identity и scope

Каждый Result of Offline Count относится к **одной Voting**, а следовательно — к одному Governance Question.

Для каждого признанного результата должны быть определимы, где применимо:

- Voting;
- Governance Question;
- declared count scope;
- source commission/location/area;
- counting units/semantics according to Voting Rule;
- counts by Position;
- total counted quantity/weight where applicable;
- invalid/other indicators;
- counting time/period;
- recognition time;
- data-entry Subject/User;
- source protocol/document;
- evidence;
- rule/version;
- correction/replacement relation.

Одна Voting может иметь 0..N Results of Offline Count, если physical count разделён на независимые scopes.

Один multi-question counting protocol Document может быть source/evidence для нескольких отдельных Results of Offline Count — по одному или нескольким results для каждой соответствующей Voting. Multi-question Result of Offline Count container не вводится.

Result of Offline Count сам по себе не утверждает автоматически:

- participation;
- quorum;
- right use;
- полноту issued ballots;
- Established Result.

Это position-count input.

Нельзя универсально предполагать:

~~~text
one ballot = one unit of result weight
~~~

Counting units/weights определяет Voting Rule. Для weighted anonymous Voting rule должна сохранять counting semantics без восстановления Subject/Voting Right→Position linkage.

Если одна Calculation использует несколько count scopes, должно быть объяснимо, как исключено double counting и какая effective result/version использована для каждого scope. Полнота покрытия определяется applicable rule, но gaps/overlaps не могут быть неявными.

---

## 15. Correction / replacement Result of Offline Count

Ошибочный результат не переписывается молча.

~~~text
C1 original
→ error/recount
→ C2 replacement
→ explicit historical relation
~~~

Calculation должен позволять определить, какая версия использована.

Отдельная universal Offline Count Correction entity пока не вводится.

---

## 16. Native online Anonymous Voting — Future Design Task

**Решение Stage 11B after independent multi-review: Option A.**

Native online Anonymous Voting **исключается из первой нормативной версии и первого пилота**.

Первая версия Anonymous Voting поддерживает:

~~~text
physical/offline anonymous procedure
→ rule-defined Voting Right Exercise
→ physical anonymous count
→ Result of Offline Count
→ Calculation
~~~

Community OS не принимает native anonymous online choice в first-pilot scope.

При этом сохраняется future invariant:

> если Community OS в будущем сама принимает anonymous online choice, штатные данные системы не должны позволять восстановить Subject/Voting Right → Position.

Existing Vote для этого использовать нельзя, поскольку Vote по ADR-001 связан с конкретным Voting Right.

Скрытие Position только в UI при сохранении Subject/Voting Right→Position в source-of-truth **не является Anonymous Voting**.

### 16.1. Trigger future design

Отдельный design/stress-test требуется, когда конкретный профиль требует:

- native remote Anonymous Voting;
- verifiable anonymous online counting;
- external anonymous-voting provider с domain-recognized result;
- иной concrete process, требующий online anonymous choice-side semantics.

Будущий stress-test должен отдельно проверить:

- identity/non-identity choice-side referent;
- idempotency/redelivery;
- correction/rejection;
- counting provenance;
- verifiability;
- privacy/non-linkage;
- aggregate-vs-individual boundary.

Настоящий BP не предрешает, будет ли future referent individual или aggregate.

---

## 17. Voting Right Exercise — минимальная семантика

Для recognized Exercise должны быть исторически определимы, где применимо:

- Voting;
- Voting Right;
- actual implementer;
- Representation/Domain Power basis;
- channel;
- exercise/receipt time;
- recognition time;
- acting recorder;
- evidence/source;
- recognition basis;
- rule/version;
- rule-defined procedural effects;
- correction/review history.

Position для Anonymous Voting отсутствует.

Historical claims/recognitions/corrections могут быть множественными, но это не означает несколько одновременно effective realizations одного Voting Right.

Applicable rule/review должна позволять определить:

- какой Exercise effective для соответствующего reference time;
- какой record был superseded/corrected;
- какой claim был rejected/conflicting;
- кто считался actual implementer.

Для одного Voting Right в одной Voting в соответствующий reference time не может существовать более одной effective realization.

Historical claims/recognitions/corrections могут быть множественными, но rule/review должна определить единственное effective use либо явно unresolved conflict.

Отдельная universal Voting Right Exercise Claim entity пока не вводится.

---

## 18. Open Voting и Voting Right Exercise

Для Open Voting отдельный Exercise не обязателен как дублирование каждого Vote.

Recognized Vote уже может подтверждать реализацию права.

Voting Right Exercise нужен там, где требуется отдельная семантика использования права без Position либо процедурный факт right-use/participation не совпадает с recognized Vote.

Пример:

~~~text
paper ballot received
→ rule considers right consumed
→ one Question left blank/invalid
~~~

В таком Open scenario Exercise допустим, но не создаётся как обязательный дубль каждого Vote.

---

## 19. Mixed Voting

Mixed Voting означает использование нескольких каналов **при одном режиме прозрачности выбора**.

### 19.1. Mixed-channel Open Voting

~~~text
one Open Voting
→ open online Votes
→ open paper Votes
→ one Calculation
~~~

### 19.2. Anonymous Voting первой нормативной версии

В first normative / first-pilot scope Anonymous Voting является offline/physical по choice-side:

~~~text
one Anonymous Voting
→ Voting Right Exercises where applicable
→ one or more Results of Offline Count
→ one Calculation
~~~

Native online Anonymous choice input отсутствует согласно section 16.

Одна Voting не смешивает Open и Anonymous choice semantics.

Если один Governance Question требует different visibility semantics, используются distinct Voting identities. Настоящий BP не допускает объединять Open и Anonymous Votings в один общий Calculation/Established Result как обход one-mode invariant; отдельный cross-Voting process потребовал бы самостоятельного review.

Mixed mode не создаёт отдельную paper/electronic Voting только из-за способа подачи/формализации.

---

## 20. Double-use / channel conflict

Conflict означает incompatible claims/actions, которые applicable Voting Rule не считает разрешённым supersession/change.

Community OS фиксирует conflict без необходимости раскрывать Position.

Второй несовместимый claim не обязан немедленно становиться вторым effective Voting Right Exercise; он может оставаться received/conflicting evidence до rule-driven resolution.

Voting Rule должна явно определять:

- conflict class;
- resolution basis;
- relevant reference time;
- procedural outcome;
- effect on effective realization/Calculation.

Platform-wide closed enum outcomes не вводится.

Universal latest-wins rule не вводится.

---

## 21. Повторная/изменённая подача Open Vote

Change/revote — later action, которое applicable rule считает допустимым supersession/replacement предыдущего action.

Если rule разрешает change/revote:

~~~text
Vote V1
→ later change
→ V1 remains historical
→ effective Vote determined by rule
~~~

Paper/electronic conflict/change semantics должны быть explicit.

Applicable rule определяет relevant reference time: submitted, received, recognized либо другой domain time, подтверждаемый evidence.

---

## 22. Representation

~~~text
Voting Right basis/owner
≠ actual implementer
~~~

Система хранит sufficient Representation basis, scope, applicability time и source/evidence.

Representation не создаёт новое Voting Right.

---

## 23. Несколько Voting Rights одного Subject

Один Subject может реализовать несколько Voting Rights, если это допускает snapshot/rule.

Это не требует копирования Subject/User Account.

---

## 24. Pilot rule 1 участок = 1 голос

**Pilot-only working profile rule; not a universal Community OS invariant. Legal/profile validity remains open.**

Рабочее требование первого внедрения:

~~~text
1 Plot
→ 1 Voting Right
~~~

Applicable Membership/Plot basis определяются Voting Rule и legal/governance profile.

Несколько membership applications/bases не создают автоматически несколько simultaneous Memberships или Voting Rights.

Юридическая валидность конкретной схемы остаётся profile/legal question.

---

## 25. Ballot Document

Ballot может быть Document/Revision/Representation.

~~~text
Ballot Document
≠ Vote
~~~

Один Document может поддерживать несколько Votes.

---

## 26. Electronic signed ballot — first-pilot rule

Для первого пилота принята document-scoped модель дистанционного Open Vote:

~~~text
electronic ballot Document
→ Revision/Representation
→ electronic Signing
→ validation / Subject mapping / authority/admissibility
→ one or more recognized Votes
~~~

Это не требует обобщать ADR-009 Signing.

Эта document-backed signed model относится к **Open Voting**.

Identifiable/signed Document не используется для хранения Position Anonymous Voting.

### 26.1. Direct documentless signed Vote

Direct signed non-document Vote остаётся отдельной архитектурной возможностью, но не считается автоматически поддержанной.

До отдельного решения:

- fake Document не создаётся;
- Signing target не обобщается молча;
- pilot может использовать document-backed signed ballot.

Direct documentless signed Vote остаётся deferred архитектурной возможностью и не входит в first-pilot normative scope.

---

## 27. Closing / deadline

Voting Rule определяет:

- opening time;
- closing deadline;
- late submission;
- offline receipt deadline;
- unknown external outcome handling;
- optional reconciliation/grace period.

Окончание очной части собрания не означает автоматически закрытие Voting.

---

## 28. Submitted / received / recognized

Различаются:

~~~text
submitted
received
provider accepted
recognized
~~~

Если действие получено до deadline, но recognized позднее, outcome определяет applicable rule.

Late recognition ранее своевременно received action не делает само action late автоматически. Предметно значимый момент определяется applicable rule и source evidence.

Technical delay не должен молча менять предметное время действия.

У multi-question Document один receipt event может подтверждать submissions по нескольким Voting, но admissibility/deadline проверяется по applicable rule каждой Voting отдельно.

---

## 29. Unknown external outcome

~~~text
request sent
→ timeout
→ external state unknown
~~~

Retry не создаёт новый Vote автоматически.

Применяются ADR-011 reconciliation/idempotency semantics.

---

## 30. Completion of collection

Перед Calculation должно быть объяснимо:

- period closed;
- pending external outcomes resolved/excluded;
- offline results recognized;
- conflicts resolved/excluded;
- corrections applied.

Это не означает, что каждый Voting Right обязан иметь Vote.

---

## 31. Calculation

### 31.1. Open Voting

~~~text
recognized effective individual Votes
→ Calculation
~~~

При mixed-channel Open Voting сюда могут входить признанные Votes из paper и electronic channels.

### 31.2. Anonymous Voting первой нормативной версии

~~~text
Results of Offline Count
+
Voting Right Exercises / participation metrics where rule requires
→ Calculation
~~~

Native online anonymous input отсутствует в first-pilot scope.

Result of Offline Count является position-count input, а Exercise/participation facts используются только там, где Voting Rule явно задаёт их effect.

Open individual Votes и Anonymous count inputs не смешиваются внутри одной Voting.

Calculation сохраняет provenance input identities/versions и effective result/version per count scope.

---

## 32. Quorum

Quorum не выводится универсально из:

- physical presence;
- Voting Rights;
- Voting Right Exercises;
- Votes;
- ballots;
- User Accounts.

Формулу задаёт applicable Voting Rule.

Если rule использует participation как вход кворума/процедуры, participation вычисляется только из явно определённых rule inputs. Ни Vote, ни Exercise, ни presence не считаются participation по умолчанию.

---

## 33. Воздержался ≠ отсутствие Vote

~~~text
explicit abstain
≠ no Vote
≠ missing ballot
≠ invalid ballot
≠ unresolved participation
~~~

Разница между participants и recognized Positions не заполняется автоматически значением Воздержался.

---

## 34. Established Result

~~~text
Calculation
→ result establishment action
→ Established Result
~~~

Calculation не становится Established Result автоматически.

---

## 35. Management Decision

~~~text
Established Result
≠ Management Decision
~~~

Решение сохраняет собственную identity/lifecycle.

---

## 36. Recount / review

Anonymous offline:

~~~text
physical recount
→ replacement Result of Offline Count
→ new Calculation
→ possible Result Review
~~~

Correction individual Vote/evidence не переписывает Established Result автоматически.

Для Anonymous Voting correction Voting Right Exercise **не** означает correction anonymous choice/count автоматически.

После физического смешения anonymous ballot конкретный choice нельзя удалить из count без восстановления запрещённой linkage.

Если после counting обнаружен ошибочный Exercise/right-use, последствия определяет applicable rule на уровне Result Review, recount where physically meaningful, materiality/impact analysis, procedure invalidation/repetition либо другого explicit governance remedy.

Для Open offline Voting aggregate paper count может храниться как дополнительное evidence/reconciliation input where useful, но для текущего пилотного сценария он не заменяет individual recognized Votes. Aggregate-only Open semantics потребовали бы отдельного review.

---

## 37. Evidence

Evidence может включать:

- paper ballot scan/photo;
- electronic ballot Representation;
- Signing artifact/result;
- provider validation;
- issuance register;
- commission protocol;
- attendance/register document;
- Representation basis;
- other supporting documents.

Evidence не заменяет domain fact автоматически.

---

## 38. Physical originals

Community OS может хранить digital copy, location/reference, custody/provenance metadata и receipt/transfer fact where needed.

Digital copy не объявляется автоматической заменой physical original.

---

## 39. Privacy

Open/Anonymous distinction распространяется на:

- source-of-truth relations;
- projections;
- exports;
- audit surfaces;
- analytics;
- operational logs where linkage can be reconstructed.

Anonymous mode нарушен, если Subject→Position link восстанавливается из штатных данных системы.

Это относится не только к прямым relations, но и к корреляции разрешённых metadata.

Где применимо, Voting Rule/profile должна предотвращать восстановление linkage через:

- общий ballot serial/identifier в issuance evidence и counted ballot;
- слишком малый count scope/anonymity set;
- точную временную/пространственную корреляцию Exercise и count scope;
- промежуточную публикацию counts в малом anonymity set;
- scans/photos individual anonymous ballots, если handwriting/marking позволяет корреляцию;
- correction/replacement metadata, раскрывающие individual participant.

Individual anonymous ballot scan/photo не является штатным count evidence, если он создаёт риск deanonymization. Предпочтительным evidence является protocol/counting document без Subject→Position linkage.

Community OS не владеет физической тайной внешней процедуры, но не должна ухудшать её своими данными.

---

## 40. Access

~~~text
Access Right
≠ Participation Right
≠ Voting Right
≠ admissibility of Vote
~~~

ADR-010 сохраняется.

---

## 41. External submission recognition

~~~text
received information
→ validation
→ mapping
→ domain admissibility
→ recognition/rejection
~~~

Received ballot/result не становится Vote/Exercise/Offline Count автоматически.

---

## 42. Correction boundaries

Различаются:

- correction received information;
- correction Voting Right;
- correction Voting Right Exercise;
- correction Vote recognition;
- replacement Result of Offline Count;
- recalculation;
- review Established Result;
- change Management Decision.

Ни одно действие не переписывает соседние факты автоматически.

---

## 43. Pilot scenario A — очное + последующий paper collection

~~~text
meeting/discussion
→ ballots to present participants
→ some submit Votes
→ board later delivers ballots to absent gardeners
→ paper collection continues
→ deadline
→ recognition
→ Calculation
→ Established Result
~~~

Одна Voting сохраняется на протяжении всей процедуры.

---

## 44. Pilot scenario B — open paper + signed electronic

~~~text
VR1 → paper signed ballot → Vote
VR2 → electronic signed ballot Document → Vote
VR3 → electronic signed ballot Document → Vote
→ one Calculation
~~~

---

## 45. Pilot scenario C — anonymous offline

~~~text
Voting Right Exercises where rule defines right consumption
+
physical anonymous ballots
→ external physical count
→ Result of Offline Count
→ Calculation
~~~

Native online Anonymous Voting не входит в first-pilot scope.

Exercise→Position link запрещён.

---

## 46. Pilot scenario D — same right conflict

Open example:

~~~text
VR27 → paper Vote V1

later:
electronic submission claims same VR27
→ change or conflict according to Voting Rule
~~~

Anonymous offline example:

~~~text
VR27 → issuance/receipt evidence E1

later:
another incompatible issuance/receipt claim for VR27
→ conflict
→ rule-driven review
~~~

Не более одной effective realization учитывается для одного Voting Right в одной Voting на соответствующий reference time.

---

## 47. Pilot scenario E — multi-question Open ballot

~~~text
one identifiable/signed ballot
→ Open Vote Q1
→ Open Vote Q2
→ Open Vote Q3
~~~

Пустая позиция по одному Question не invalidates остальные автоматически, если rule не требует обратного.

Anonymous Position не включается в такой identifiable/signed Document.

---

## 48. Pilot scenario F — representative

~~~text
Voting Right VR15
→ implementer Subject B
→ Representation basis
→ Vote / Exercise
~~~

Representation не меняет identity/weight VR15.

---

## 49. Outcomes

### 49.1. Accepted open Vote

Voting Right + admissible Position + required formalization → recognized Vote.

### 49.2. Recognized anonymous exercise

Voting Right used without retained Position linkage → Voting Right Exercise.

### 49.3. Recognized offline count

External physical count + sufficient source/evidence → Result of Offline Count.

### 49.4. Rejected submission

Validation/admissibility failed; recognized domain fact не создаётся.

### 49.5. Conflict requiring review

Несовместимые claims/effective uses требуют rule-driven resolution.

### 49.6. Incomplete inputs at close

Calculation может быть blocked/limited/proceed только по explicit rule. Missing input не выдумывается.

---

## 50. Provenance

For all recognized facts должно быть определимо в объёме, требуемом applicable process/rule:

- Voting;
- Question;
- mode;
- Voting Rule/version;
- snapshot;
- Voting Rights;
- channel/formalization;
- submit/receive/recognition times;
- implementer;
- Representation/authority basis;
- Vote identity;
- Voting Right Exercise identity;
- Result of Offline Count identity/version;
- ballot/protocol Documents;
- for multi-item Document: per-Vote source item/local address and mapping;
- Signing identities;
- provider correlation;
- rejection/conflict reason;
- Calculation input set;
- correction/review links.

---

## 51. Инварианты

1. Voting ≠ channel.
2. Open Voting ≠ Anonymous Voting.
3. One Voting has one declared choice-visibility mode; mixed channels do not mix Open and Anonymous semantics.
4. Voting Right ≠ Vote.
5. Voting Right Exercise ≠ Vote.
6. Voting Right Exercise ≠ Position.
7. Participation Right ≠ Voting Right Exercise.
8. Ballot Document ≠ Vote.
9. Signing ≠ Vote.
10. Data-entry operator ≠ voter/implementer.
11. Physical presence ≠ participation automatically.
12. Participation ≠ Vote automatically.
13. Ballot receipt ≠ Vote automatically.
14. Explicit abstain ≠ no Vote.
15. One ballot may contain several Votes.
16. Mixed channels do not create multiple Voting identities.
17. One Voting Right has no more than one effective realization in one Voting at a reference time; historical claims/records may be multiple.
18. Conflict outcome is rule-driven.
19. Anonymous mode must not retain recoverable Subject/Voting Right→Position linkage.
20. Anonymous offline paper choices are not reconstructed as Subject-linked Votes.
21. Result of Offline Count has own identity.
22. Result of Offline Count ≠ protocol Document.
23. Result of Offline Count ≠ Calculation.
24. Calculation ≠ Established Result.
25. Established Result ≠ Management Decision.
26. External received data ≠ recognized domain fact automatically.
27. Cryptographic validity ≠ domain admissibility.
28. User Account/access ≠ Voting Right.
29. Representation does not create a new Voting Right.
30. Registry changes do not silently rewrite snapshot.
31. Corrections do not silently rewrite historical facts.
32. Ballot issuance/receipt ≠ Voting Right Exercise automatically.
33. One Result of Offline Count belongs to one Voting/Question.
34. One protocol Document may evidence several question-local Results of Offline Count.
35. Multiple historical Exercise records/claims do not imply multiple simultaneously effective realizations.
36. Participation mode and carrier/formalization mode are not one universal Channel taxonomy.
37. Native online Anonymous Voting is outside first normative / first-pilot scope.
38. UI-hidden Position with retained Subject/Voting Right→Position linkage is not Anonymous Voting.
39. Issuance/receipt creates Exercise only when applicable Voting Rule explicitly declares it a right-consumption event.
40. Voting Right Exercise does not automatically assert participation, quorum, valid cast or counting effect.
41. Result of Offline Count does not automatically assert participation, quorum, right use or Established Result.
42. One Result of Offline Count belongs to one declared count scope; Calculation must avoid implicit double counting across scopes.
43. Counting units/weights are defined by Voting Rule; one ballot is not universally one unit of result weight.
44. Identifiable/signed Document cannot contain Position for Anonymous Voting.
45. Multi-item Document-origin Vote requires per-Vote source-item mapping provenance.
46. Choice-visibility mode is fixed before acceptance of submissions and is not silently changed afterward.
47. Different Open/Anonymous Votings are not aggregated into one Calculation/Established Result by this BP.
48. Timely received action recognized later is not late automatically.
49. Anonymous privacy includes correlation risks across identifiers, timing, scope, evidence and correction metadata.
50. Aggregate Open count does not replace individual Open Votes in first-pilot semantics.
51. Correction Exercise in Anonymous Voting does not identify/correct a particular anonymous Position automatically.

---

## 52. Fundamental entity check

### 52.1. Voting Right Exercise

Accepted as new identity-bearing Governance concept for Stage 11B.

### 52.2. Result of Offline Count

Accepted as new identity-bearing Governance concept for Stage 11B.

### 52.3. No new channel entities

Paper Vote / Electronic Vote / Hybrid Vote fundamental entities не вводятся.

### 52.4. No universal Ballot entity yet

Ballot использует Document semantics; separate fundamental Ballot entity не вводится.

### 52.5. No generalized Signed Action yet

Stage 11A document-scoped Signing не обобщается автоматически.

---

## 53. Normative synchronization after adjudication

Independent multi-review consolidated; Option A accepted; point fixes applied.

Разрешена минимальная normative sync.

### ADR-001

Добавить:

- Voting Right Exercise как distinct from Vote;
- Exercise without Position;
- rule-defined recognition basis/effects;
- no more than one effective realization per Voting Right in one Voting at reference time;
- one declared choice-visibility mode per Voting.

### ADR-008

Добавить:

- Result of Offline Count как самостоятельный question-local Calculation input;
- Calculation may use recognized non-Vote inputs where rule explicitly permits;
- anonymous offline separates right-use facts from position-counting facts;
- correction Exercise does not identify/correct a particular anonymous Position;
- native online Anonymous outside first normative scope.

### DOMAIN_MODEL

Добавить:

- Voting Right Exercise;
- Result of Offline Count;
- negative boundaries;
- count-scope semantics;
- multi-item Document→Vote mapping provenance;
- anonymous privacy correlation constraint;
- one-mode invariant;
- first normative Anonymous scope = offline/physical choice-side.

### TERMINOLOGY

Добавить канонические RU/EN terms и negative definitions.

Новый bounded context не требуется.

---

## 54. Remaining profile / future-design questions

После adjudication закрыто:

- native online Anonymous исключён из first-pilot scope;
- новый anonymous choice-side concept сейчас не вводится;
- Voting Right Exercise допустим в Open Voting where rule needs separate right-use semantics;
- one Result of Offline Count относится к one Voting/Question;
- document-backed signed electronic ballot используется только для Open Voting.

Остаются profile-specific вопросы первого пилота:

1. Exact paper/electronic change/conflict rules.
2. Exact legal/profile definition presence/quorum.
3. Exact legal/profile status 1 Plot = 1 Vote.
4. Physical-original retention/receipt rules.
5. Exact consumption moment для anonymous paper procedure: issuance/receipt/other.
6. Reissue spoiled/lost anonymous ballot semantics.
7. Minimum anonymity/count-scope constraints.

Future Design Task:

8. Native online Anonymous Voting choice/counting semantics.
9. Direct documentless signed Vote boundary if future process requires it.

---

## 55. Independent review result

Independent multi-review completed. Consolidation: BP-GOV-001-INDEPENDENT-MULTI-REVIEW-CONSOLIDATION.md.

Review confirmed or tested:

- contradiction with ADR-001/008/009;
- Subject→Position leakage in Anonymous mode;
- duplicate Vote/Exercise semantics;
- conflict resolution boundaries;
- Document/Signing ownership;
- mixed paper/electronic flow;
- multi-question ballot;
- quorum/presence separation;
- correction/recount/history;
- justification of new fundamental entities;
- pilot specifics promoted to universal rules accidentally.

---

## 56. Итог Stage 11B

Independent multi-review завершён.

Adjudication:

~~~text
Option A accepted
→ native online Anonymous deferred
→ point fixes applied
→ no conceptual redesign
→ no additional fundamental entities
→ approved for minimal normative sync
~~~

Stage 11B first normative scope поддерживает:

- Open Voting с paper/electronic/remote formalization where rule permits;
- document-backed signed electronic Open ballot;
- Anonymous offline/physical choice procedure;
- Voting Right Exercise;
- Result of Offline Count;
- mixed Open channels;
- correction/review/privacy boundaries.

Normative synchronization ADR-001 / ADR-008 / DOMAIN_MODEL / TERMINOLOGY и final consistency check завершены.

BP-GOV-001 принят как текущая предметная основа Stage 11B.

Перед реализацией first-pilot voting остаются profile/legal decisions, не меняющие принятую universal model:

- exact presence/quorum semantics;
- legal/profile validation правила `1 Plot = 1 Vote`;
- paper/electronic change/conflict policy;
- anonymous paper consumption moment и reissue policy;
- minimum anonymity/count-scope constraints;
- physical-original retention rules.

Codex implementation task формируется после фиксации необходимых pilot profile rules.
