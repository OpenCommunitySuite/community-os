# Stage 11B — Pilot requirement: дистанционное участие и подписанное электронное голосование

**Статус:** Accepted product requirement / architecture not yet finalized  
**Связанный этап:** Stage 11B — Remote Participation and Electronic Voting  
**Первое внедрение:** пилотное садовое товарищество (СТ)

## 1. Бизнес-проблема

Пилотное СТ испытывает устойчивую практическую проблему с проведением общих собраний и участием собственников в принятии важных решений.

Существенные причины:

- часть владельцев участков физически отсутствует;
- часть владельцев находится за пределами Украины;
- военное положение, перемещение людей и иные обстоятельства затрудняют очное присутствие;
- критически важные решения по уставу/применимому праву должны приниматься коллективно;
- очный формат не должен быть единственным техническим способом реализовать допустимое право участия/голоса, если legal profile допускает дистанционную форму.

## 2. Принятое продуктовое требование

Community OS должна поддерживать для первого пилота СТ дистанционное участие и электронное волеизъявление с проверяемым подтверждением подписанта.

Целевой пользовательский смысл:

```text
eligible owner / right implementer
→ receives agenda/materials
→ identifies/signs remotely
→ submits a signed expression of will / Vote
→ Community OS validates evidence and domain admissibility
→ Vote is counted according to applicable Voting Rule
→ evidence remains verifiable later
```

Поддержка КЕП и provider mechanisms вроде Дія.Підпис является обязательным направлением для такого сценария.

## 3. Ключевая правовая граница

Законодательство Украины придаёт КЕП такую же юридическую силу, как собственноручной подписи.

Однако из этого **не следует автоматически**, что:

```text
valid КЕП
→ any remote meeting procedure is legally valid
→ any signed payload is automatically a valid Vote
```

Электронная подпись отвечает за подпись/идентификацию/целостность соответствующих electronic data в установленном законом объёме.

Право участия, Voting Right, quorum, presence, procedure form и условия зачёта Vote определяются отдельно applicable governance/legal profile.

## 4. Обязательная profile-driven модель

Community OS не должна hard-code один универсальный способ дистанционного собрания.

Legal/governance profile конкретного Community должен позволять определить:

- кто имеет Participation Right;
- кто имеет Voting Right;
- кто реализует конкретное право;
- допустимо ли представительство;
- что считается присутствием;
- как определяется quorum/правомочность;
- допускается ли remote synchronous participation;
- допускается ли signed asynchronous ballot / written survey;
- допускается ли mixed procedure;
- какой signature class необходим;
- какой electronic document/ballot требуется;
- какие сроки подачи волеизъявления;
- что происходит при повторной/изменённой подаче;
- как формируется и устанавливается результат;
- какое документальное оформление требуется.

## 5. Режимы, которые архитектура должна уметь поддержать

Не как универсально обязательные одновременно, а как configurable procedure modes:

```text
A. очное участие;
B. удалённое синхронное участие;
C. подписанное асинхронное волеизъявление / ballot;
D. смешанная процедура A+B;
E. смешанная процедура A+B+C where legally allowed.
```

## 6. Электронная подпись не создаёт право голоса

Сохраняются существующие инварианты Community OS:

```text
КЕП / Дія.Підпис
≠ Participation Right
≠ Voting Right
≠ Vote

Signing
≠ Vote

valid cryptographic signature
≠ sufficient domain admissibility
```

Подпись подтверждает конкретные electronic data/действие в рамках применимой signing policy, но не создаёт ownership/member status/representation/voting entitlement.

## 7. Vote и signed document остаются разными фактами

В зависимости от legal profile дистанционный Vote может требовать подписанного electronic ballot/survey sheet.

Тогда:

```text
Vote
↔ Document / Revision / Representation
↔ Signing
```

Но:

```text
Vote ≠ Document ≠ Signing
```

Если конкретный profile допускает electronic Vote без самостоятельного Document, Community OS не должна создавать фиктивный документ только ради переиспользования Signing model.

## 8. Пилотное правило «1 участок = 1 голос»

В проекте для первого внедрения ранее принято правило:

```text
1 участок = 1 голос
```

Оно сохраняётся как текущая domain configuration **до проверки legal profile пилотного СТ**.

Если применимое право для фактической организационно-правовой формы СТ содержит императивное правило, несовместимое с `1 участок = 1 голос`, это является открытым legal/domain conflict, а не технической настройкой.

Например, для кооператива Закон Украины «Про кооперацію» базово закрепляет:

```text
1 член кооператива = 1 голос
```

и право голоса не может быть передано другому лицу.

Поэтому перед legally significant запуском Stage 11B необходимо установить организационно-правовую форму пилотного СТ и проверить, совпадает ли множество «участок» с юридическим носителем права голоса.

## 9. Минимальные evidence requirements

Для подписанного дистанционного волеизъявления должны быть исторически объяснимы, где применимо:

- Governance Procedure / Question / Voting;
- конкретное Voting Right;
- right implementer / acting Subject;
- representation basis if applicable;
- Vote position;
- exact signed electronic payload or Document Representation;
- signature/provider evidence;
- validation result;
- signature class required vs actually validated;
- submission/effective time;
- applicable Voting Rule version;
- link to counting/result calculation.

Точный технический формат определяется после Stage 11A.

## 10. Международный/зарубежный участник

Нахождение владельца участка за пределами Украины не должно само по себе исключать его из дистанционного сценария.

Архитектура должна позволять использовать допустимый remote signing mechanism и evidence provider, если он принимается applicable policy и может быть validated.

Конкретные правила признания иностранного/европейского electronic signature относятся к signing/legal profile, а не к Voting identity.

## 11. Что остаётся открытым до Stage 11B design

Нужно отдельно решить:

- является ли remote signed Vote частью собрания или отдельным письменным/заочным опросом для конкретного profile;
- synchronous vs asynchronous deadlines;
- quorum/presence semantics;
- может ли signed ballot быть изменён/отозван;
- какая подача считается effective при нескольких submissions;
- когда фиксируется snapshot прав;
- требуется ли отдельный electronic voting sheet Document;
- какие signatures допустимы;
- как подтверждается representation;
- что должно войти в протокол;
- какие current-law требования применимы именно к пилотному СТ.

## 12. Решение по этапам

```text
Stage 11A
→ electronic Document Signing semantics
→ evidence / validation / recognition

Stage 11B
→ remote participation
→ electronic Vote semantics
→ link to Signing where required
→ pilot ST legal/governance profile
```

Stage 11B является обязательным для первого пилота и не считается «будущей опцией».
