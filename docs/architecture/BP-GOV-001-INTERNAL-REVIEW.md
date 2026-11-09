# BP-GOV-001 — Internal architectural review

**Статус:** Round 1 internal review / findings before independent review  
**Объект:** `BP-GOV-001-MIXED-OPEN-ANONYMOUS-VOTING.md`  
**Контекст:** Управление и коллективные процедуры  
**Проверено против:** ADR-001, ADR-004, ADR-005, ADR-008, ADR-009, ADR-010, ADR-011, Stage 11B stress-tests и pilot reference 24.10.2026

---

## 1. Общий вывод

Draft в целом совместим с принятой архитектурой Community OS.

Сильные стороны:

- channel не превращён в новый тип Vote/Voting;
- Open и Anonymous разделены;
- одна Voting использует один режим прозрачности выбора;
- physical presence, participation, ballot receipt, Vote и Voting Right Exercise различены;
- Ballot Document, Signing и Vote не смешаны;
- Result of Offline Count отделён от protocol Document, Calculation и Established Result;
- смешанная paper/electronic процедура укладывается в существующий Voting/Rule/Snapshot;
- pilot specifics не объявлены универсальными автоматически;
- новые bounded contexts не требуются.

До нормативной синхронизации остаётся один блокирующий design gap и несколько point-fix findings.

---

## 2. BLOCKER-1 — native online Anonymous Voting не имеет определённого choice-side referent

### Наблюдение

Draft корректно вводит:

~~~text
Voting Right
→ Voting Right Exercise
~~~

и запрещает:

~~~text
Voting Right / Subject
→ Position
~~~

Но для native online Anonymous Voting одновременно утверждается:

~~~text
anonymous choice
→ anonymous counting input/result
~~~

без определения, что именно является исторически значимым source/input со стороны choice.

Existing `Vote` использовать нельзя:

~~~text
Vote
→ concrete Voting Right
→ Position
~~~

что противоречит anonymous invariant.

### Почему это BLOCKER

Пока Community OS сама принимает anonymous online choice, необходимо объяснить:

- какой предметный факт/referent существует после принятия choice;
- имеет ли он identity;
- как он участвует в correction/redelivery/idempotency;
- как он входит в Calculation;
- как доказывается, что choice не был потерян/дублирован;
- как при этом исключается recoverable Voting Right→Position linkage.

Без этого normative sync ADR-001/ADR-008 будет неполной.

### Варианты

**A. Отложить native online Anonymous Voting из первой нормативной версии BP.**

BP фиксирует invariant и future design task, а first-pilot Anonymous поддерживает offline physical counting; first-pilot remote electronic mode — Open signed ballot.

Плюсы:

- не вводится преждевременная сущность;
- Stage 11B можно нормативно завершить для практически обязательного пилотного сценария;
- cryptographic/identity-separation design остаётся отдельной задачей.

Минус: native online Anonymous Voting не входит в первый нормативный scope.

**B. Проектировать отдельный anonymous choice-side concept сейчас.**

Кандидаты нельзя выбирать по удобству хранения. Нужен отдельный stress-test identity/lifecycle/correction/counting boundary.

### Рекомендация internal review

Предпочтителен **вариант A**, если пользователь не требует native online Anonymous Voting уже в первой версии пилота.

---

## 3. MAJOR-1 — ballot issuance не равен Voting Right Exercise автоматически

### Наблюдение

Draft одновременно содержит:

~~~text
ballot receipt ≠ Voting Right Exercise
~~~

и:

~~~text
certified ballot issuance register
→ recognition
→ Voting Right Exercise
~~~

Это противоречие.

### Решение

Уточнить:

~~~text
issuance / receipt evidence
→ may justify Voting Right Exercise
only if applicable Voting Rule defines this event
as sufficient realization/consumption of the right
~~~

Для anonymous offline это особенно важно: после выдачи unlinkable paper ballot система может уже не иметь возможности доказать, был ли он физически опущен в урну.

Следовательно, Voting Rule должен определить **момент реализации/расходования права** для конкретной anonymous procedure.

---

## 4. MAJOR-2 — Result of Offline Count должен быть question-local через Voting

ADR-001/008 определяют:

~~~text
Question
→ 0..N Voting
~~~

и каждый Voting Right относится к конкретной Voting/Question.

Поэтому Result of Offline Count безопаснее определить как относящийся к **одной Voting**, а значит — к одному Question.

Много-вопросный физический protocol Document может подтверждать:

~~~text
one protocol Document
→ Result of Offline Count for Voting Q1
→ Result of Offline Count for Voting Q2
→ Result of Offline Count for Voting Q3
~~~

Не требуется multi-question Result of Offline Count container.

Это сохраняет:

- question-local recalculation;
- correction/recount одного вопроса;
- ясный Calculation input set;
- отсутствие cross-Voting aggregate identity.

---

## 5. MAJOR-3 — «канал» сейчас смешивает разные измерения

В начале Draft перечислены:

- очно;
- дистанционно;
- электронно;
- на бумаге.

Это не одна таксономическая ось:

~~~text
in-person / remote
→ participation/delivery mode

paper / electronic
→ carrier/formalization mode
~~~

Например, paper ballot может быть вручён очно или дистанционно; electronic action может быть выполнен во время очного собрания.

### Решение

Не вводить universal Channel taxonomy.

Использовать более широкое:

> способы участия, подачи и формализации

а конкретный source/channel/formalization сохранять как process provenance согласно applicable rule.

---

## 6. MAJOR-4 — effective Voting Right Exercise нужно отделить от исторических claims/records

Draft допускает conflict:

~~~text
same Voting Right
→ online exercise
→ offline claim
~~~

При этом ADR-001 сохраняет:

- один actual implementer для права;
- не более одного одновременно действующего Vote.

Для Exercise необходимо аналогичное уточнение:

- historical claims/recognitions/corrections могут быть множественными;
- это не означает несколько одновременно effective realizations;
- applicable rule/review определяет effective realization;
- ошибочный historical Exercise не удаляется молча.

Отдельную universal Claim entity вводить пока не требуется.

---

## 7. MAJOR-5 — multi-question signed ballot требует явной mapping semantics

Один Document может содержать позиции по нескольким Questions/Votings.

~~~text
one signed Document Revision
→ Vote V1 / Question Q1
→ Vote V2 / Question Q2
→ Vote V3 / Question Q3
~~~

Для каждого recognized Vote должно быть исторически объяснимо:

- какой Document Revision/Representation был источником;
- какой semantic item/field выражал Position именно этого Vote;
- какой Signing покрывал соответствующую Revision/Representation;
- как Position была распознана/введена.

Новая Ballot Item entity не требуется автоматически; достаточно local addressability / mapping provenance, если lifecycle не требует самостоятельной identity.

---

## 8. MAJOR-6 — one visibility mode per Voting выглядит обоснованно

Draft добавил:

> одна Voting использует один declared choice-visibility mode.

Internal review считает это корректным направлением.

Если одному Governance Question нужны разные режимы прозрачности:

~~~text
Open Voting
≠ Anonymous Voting
~~~

это должны быть отдельные Voting identities согласно applicable rule.

Иначе «частично открытая/частично анонимная» одна Voting разрушает единообразную privacy semantics результата.

Finding предлагается оставить как accepted BP invariant после independent review.

---

## 9. MINOR-1 — deadline и recognition

Draft правильно различает:

~~~text
submitted
received
provider accepted
recognized
~~~

Следует дополнительно подчеркнуть, что late recognition ранее полученного action не делает action late автоматически. Предметный момент определяется applicable rule/source evidence.

Это point fix, redesign не нужен.

---

## 10. MINOR-2 — open offline aggregate

Stage 11B stress-test допускает aggregate open offline count как дополнительную сверку/evidence.

BP может явно указать:

> open aggregate count does not replace individual recognized Votes unless a specific procedure intentionally uses aggregate-only semantics, which would require separate review.

Для пилота individual open Votes остаются source-of-truth.

---

## 11. Fundamental entity check после internal review

### Voting Right Exercise

Identity остаётся обоснованной.

Но definition должна быть уточнена:

> признанный исторический факт того, что согласно applicable Voting Rule конкретное Voting Right считается реализованным/расходованным для целей процедуры, без обязательного хранения Position.

Это **не означает автоматически**, что:

- valid Position была подана;
- ballot был физически подсчитан;
- Exercise входит в quorum;
- Exercise входит в choice count.

### Result of Offline Count

Identity остаётся обоснованной.

Рекомендуемая граница:

~~~text
one Result of Offline Count
→ one Voting
→ one Question
→ one count scope
~~~

Один protocol Document может evidence 0..N таких results.

### Новая anonymous online choice entity

Internal review **не рекомендует вводить её без отдельного stress-test**.

---

## 12. Итог Round 1

| Finding | Severity | Результат |
|---|---|---|
| Native online Anonymous choice-side referent undefined | BLOCKER | open design decision |
| Ballot issuance ≠ Exercise automatically | MAJOR | point fix |
| Offline Count result should be one-Voting/question-local | MAJOR | point fix |
| Channel taxonomy mixes dimensions | MAJOR | point fix |
| Exercise effective/history semantics | MAJOR | point fix |
| Multi-question signed ballot mapping | MAJOR | point fix |
| One visibility mode per Voting | MAJOR | support / independent review |
| Deadline vs recognition wording | MINOR | point fix |
| Open aggregate reconciliation wording | MINOR | point fix |

После point fixes Draft пригоден для independent multi-review.

Normative sync ADR-001 / ADR-008 / DOMAIN_MODEL / TERMINOLOGY до adjudication BLOCKER-1 не выполнять.
