# BP-GOV-001 — Independent Multi-Review Consolidation

**Статус:** Adjudication completed / point fixes approved  
**Этап:** Stage 11B  
**Объект:** BP-GOV-001

## 1. Общий итог

Три независимых review сходятся по ключевым выводам:

- conceptual redesign не требуется;
- Voting Right Exercise обоснован как identity-bearing Governance fact;
- Result of Offline Count обоснован как identity-bearing Governance fact;
- отдельные fundamental Channel, Ballot и Signed Action не нужны;
- document-backed signed electronic ballot корректно переиспользует Stage 11A для Open Voting;
- native online Anonymous Voting не имеет определённой choice-side domain semantics;
- безопасное решение первой нормативной версии — Option A: отложить native online Anonymous Voting;
- после point fixes BP можно нормативно синхронизировать без нового bounded context.

**Adjudication decision: Option A принят. Native online Anonymous Voting исключается из first normative / first-pilot scope Stage 11B и становится Future Design Task.**

Первая нормативная версия поддерживает:

~~~text
Open Voting:
- paper
- in-person / remote where rule permits
- document-backed signed electronic ballot
- mixed paper/electronic formalization

Anonymous Voting:
- physical/offline anonymous procedure
- Voting Right Exercise for rule-defined right consumption
- Result of Offline Count
~~~

Native online anonymous choice intake в первой версии не поддерживается.

## 2. BLOCKER

Existing Vote нельзя использовать для native online Anonymous:

~~~text
Vote
→ Voting Right
→ Position
~~~

Это нарушило бы anonymous non-linkage invariant.

Новая per-choice entity сейчас не вводится, потому что её identity/lifecycle не доказаны процессом. Duplicate/double-use относятся прежде всего к right-use side; correction отдельного anonymous choice часто невозможен без разрушения anonymity; verifiability может принадлежать aggregate/tally evidence.

Future Design Task открывается, когда профиль реально требует remote Anonymous Voting, verifiable anonymous online counting либо external anonymous-voting provider with domain-recognized result.

## 3. Voting Right Exercise

Exercise остаётся самостоятельным identity-bearing Governance fact.

Уточнённый смысл:

> согласно historically applicable Voting Rule конкретное Voting Right признано реализованным/расходованным для целей процедуры.

Exercise сам по себе не утверждает автоматически:

- Position;
- valid cast;
- physical counting;
- participation;
- quorum effect;
- counting effect.

Domain provenance должна позволять определить recognition basis, применимую Voting Rule version и procedural effects, которые rule придаёт Exercise.

Issuance/receipt создаёт Exercise только если Voting Rule version явно объявляет такой event моментом consumption/right-use. Иначе это evidence only.

Exercise допустим и в Open Voting, если right-use/participation имеет самостоятельный procedural meaning, не совпадающий с recognized Vote. Exercise не создаётся как обязательный дубль каждого Open Vote.

Participation пока не становится новой fundamental entity. Это rule-derived procedural fact/metric, формируемый из явно определённых inputs: presence evidence, received ballot/evidence, Exercise, Vote и других rule-defined facts.

## 4. Result of Offline Count

Принята граница:

~~~text
one Result of Offline Count
→ one Voting
→ one Question
→ one declared count scope
~~~

Один protocol Document может evidence несколько question-local Results.

Result of Offline Count не утверждает автоматически participation, quorum, right use, полноту issued ballots либо Established Result. Это position-count input.

Нельзя универсально предполагать one ballot = one unit of result weight. Count semantics/units определяет Voting Rule. Weighted anonymous voting допустим только при counting semantics, не восстанавливающей Subject/Voting Right→Position linkage.

Для каждого Result должна быть объяснима scope declaration. Calculation должен избегать double counting между одновременно используемыми scopes и определять effective result/version per scope. Полнота покрытия определяется applicable rule, а не универсальной формулой.

## 5. Anonymous privacy

Anonymous invariant применяется не только к прямой связи, но и к корреляции разрешённых данных.

Community OS не должна позволять штатно восстановить Subject/Voting Right→Position через:

- shared ballot identifiers между issuance evidence и counted ballot;
- слишком малый count scope;
- точную временную/пространственную корреляцию Exercise и count scope;
- промежуточные counts в малом anonymity set;
- scans/photos individual anonymous ballots, позволяющие handwriting/marking correlation;
- correction/replacement metadata, раскрывающие individual participant.

Voting Rule/profile задаёт достаточную privacy granularity/minimum anonymity constraints там, где это требуется.

## 6. Multi-question ballot

Для Open Voting допустимо:

~~~text
one identifiable/signed Document
→ several Open Votes
~~~

Для каждого Vote обязательна historical mapping provenance: source Revision/Representation, locally addressable item/field, recognition Position и covering Signing where applicable. Новая Ballot Item entity не вводится.

Identifiable/signed Document, связанный с Subject, не может содержать Position Anonymous Voting. Иначе Signing→Subject и Document item→Position восстанавливают запрещённую связь.

## 7. Correction asymmetry

В Anonymous Voting:

~~~text
correction Voting Right Exercise
≠ correction anonymous choice/count automatically
~~~

После физического смешения anonymous ballot невозможно удалить конкретный choice без разрушения anonymity.

Ошибочный Exercise после counting разрешается через rule-driven Result Review, recount where meaningful, materiality/impact analysis, procedure invalidation/repetition либо другое explicit governance remedy.

Reissue/spoiled/lost ballot — explicit rule semantics; право не возвращается молча.

## 8. Conflict и change

Change/revote — later action, которое applicable rule считает допустимым supersession/replacement.

Conflict — incompatible claims/actions, которые не образуют разрешённый supersession автоматически.

Applicable rule определяет relevant reference time: submitted, received, recognized либо другой domain time supported by evidence.

Предложение о platform-wide closed enum исходов conflict отклонено как преждевременная universal taxonomy. Вместо этого Voting Rule обязана явно определять conflict classes, resolution basis и historically explainable procedural outcome. Universal latest-wins не вводится.

## 9. Visibility mode

One Voting имеет ровно один declared choice-visibility mode: Open или Anonymous.

Mode определяется до opening/acceptance submissions и не меняется молча после начала процедуры.

Different visibility semantics require distinct Voting identities. Настоящий BP не разрешает объединять Open и Anonymous Votings в один общий Calculation/Established Result как обход one-mode invariant; такой cross-Voting process потребовал бы отдельного review.

## 10. Deadline и recognition

~~~text
timely received
+ later recognized
≠ late automatically
~~~

Applicable rule определяет предметно значимый reference time.

У multi-question Document один receipt event может evidence submissions по нескольким Voting, но admissibility/deadline проверяется по rule каждой Voting.

## 11. Open aggregate

Для first-pilot Open Voting source-of-truth — individual recognized Votes.

Aggregate Open count может быть reconciliation, control total или supporting evidence.

Aggregate-only Open procedure не вводится этим BP и потребует отдельного review.

## 12. Naming

Название Result of Offline Count сохраняется. First normative scope признаёт именно external/offline anonymous count; native online Anonymous deferred. Premature generalization до universal tally concept не доказана.

## 13. Pilot material

Pilot scenarios остаются non-normative examples / validation scenarios.

Rule 1 Plot = 1 Vote получает явную пометку: pilot-only working profile rule; not universal Community OS invariant; legal/profile validity remains open.

## 14. Normative sync

После внесения point fixes BLOCKER считается разрешённым scope decision.

Разрешена минимальная sync.

ADR-001:
- Voting Right Exercise ≠ Vote;
- Exercise without Position;
- one effective realization per Voting Right in one Voting at reference time;
- recognition basis/effects are rule-defined;
- one choice-visibility mode per Voting.

ADR-008:
- Result of Offline Count as standalone question-local Calculation input;
- Calculation may use non-Vote recognized inputs where rule permits;
- anonymous offline separates right-use facts from position-counting facts;
- correction Exercise does not identify/correct anonymous Position;
- native online Anonymous outside first normative scope.

DOMAIN_MODEL:
- Voting Right Exercise;
- Result of Offline Count;
- negative boundaries;
- multi-item Document→Vote mapping provenance;
- anonymous privacy correlation constraint;
- one-mode invariant.

TERMINOLOGY:
- canonical terms and negative definitions.

Новый bounded context не требуется.

## 15. Verdict

**ACCEPT AFTER POINT FIXES → APPROVED FOR NORMATIVE SYNC after fixes.**

Conceptual redesign не требуется.

Дополнительные fundamental entities не вводятся.

Native online Anonymous deferred as Future Design Task.
