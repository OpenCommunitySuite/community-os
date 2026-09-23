# Stage 11B — Stress-test: анонимность выбора и факт реализации права голоса

**Статус:** Working analysis / proposal for Stage 11B  
**Контекст:** Управление и коллективные процедуры  
**Связанные решения:** ADR-001, ADR-004, ADR-005, ADR-008, ADR-010, ADR-011  
**Связанные материалы:** `STAGE-11B-MIXED-PAPER-ELECTRONIC-VOTING-STRESS-TEST.md`

## 1. Зачем нужен отдельный stress-test

Для открытого голосования Community OS может хранить:

~~~text
Voting Right
→ Vote
→ Position
~~~

и потому система одновременно знает:

- кто реализовал право;
- когда это произошло;
- каким способом;
- какой выбор сделан.

Для Anonymous Voting это недопустимо:

~~~text
Voting Right / Subject
↔ Position
~~~

не должна сохраняться как восстанавливаемая связь.

Но Community OS всё равно должна уметь доказать и проверить:

- что конкретное Voting Right существовало;
- что оно было реализовано;
- что один и тот же Voting Right не был использован одновременно online и offline дважды;
- кто был фактическим реализатором права, если это необходимо;
- когда и через какой канал право было реализовано;
- на каком основании участие признано допустимым;
- какой документ/evidence подтверждает offline participation;
- как исправить ошибочно отмеченную реализацию.

Поэтому возникает предметный вопрос:

> достаточно ли состояния самого Voting Right либо нужен отдельный исторически значимый факт «Реализация права голоса»?

## 2. Почему Vote не подходит

ADR-001 определяет Vote как:

> факт выражения позиции по конкретному праву голоса.

Следовательно:

~~~text
Vote
→ Voting Right
→ Position
~~~

Если сохранять такую связь для Anonymous Voting, анонимность выбора исчезает.

Удалять или разрывать связь после подачи также нельзя считать безопасным domain solution:

- историческое действие становится трудно объяснить;
- correction/reconciliation становятся непрозрачными;
- можно случайно сохранить linkage в audit/history/read models;
- предметная identity Vote по ADR-001 изначально предполагает конкретное Voting Right.

Вывод:

> существующий Vote не следует использовать как «обезличенный контейнер» anonymous choice.

## 3. Почему одного состояния Voting Right недостаточно

Можно было бы добавить к Voting Right состояние вроде:

~~~text
available
used
~~~

Но этого недостаточно для реальной mixed procedure.

Нужно исторически различать, например:

~~~text
right marked as exercised offline
→ later discovered wrong person / wrong register row
→ correction
→ right becomes available again

right exercised online
→ external provider outcome initially unknown
→ later recognized

right appears both in online participation
and certified offline issuance register
→ conflict review
~~~

Простое текущее поле `used=true` не объясняет:

- кто и когда зафиксировал реализацию;
- какой был канал;
- кто был реализатором;
- какое evidence использовано;
- почему запись была исправлена;
- что именно существовало до correction.

Это противоречило бы ADR-004, если текущий state заменяет значимую историю.

## 4. Кандидат: «Реализация права голоса»

Предлагается самостоятельный исторически значимый факт:

**Реализация права голоса (Voting Right Exercise)** — признанный факт того, что конкретное Voting Right было использовано допустимым реализатором в рамках конкретного Voting, без обязательного хранения позиции выбора.

Базовая модель:

~~~text
Voting Right
→ Voting Right Exercise

Voting Right Exercise
≠ Vote
≠ Position
~~~

Для Anonymous Voting:

~~~text
Subject / Voting Right
→ Voting Right Exercise

                     X

anonymous choice / counting contribution
→ channel count result
~~~

`X` означает, что Community OS не должна сохранять восстанавливаемую связь между конкретной реализацией права и anonymous Position.

## 5. Identity

Каждая признанная реализация права имеет собственную historical identity.

Identity не должна выводиться только из:

- User Account;
- Subject;
- Voting Right;
- timestamp;
- channel;
- строки offline register.

Причина — ошибочная запись, повторная доставка или исправление могут относиться к одной historical realization либо создавать новую попытку/признание согласно applicable rule.

## 6. Минимальная семантика

Для recognized Voting Right Exercise должно быть исторически определимо, где применимо:

- Voting;
- Voting Right;
- фактический реализатор;
- основание допустимости/представительства;
- канал: online/offline или иной допустимый;
- момент реализации/получения;
- момент recognition в Community OS;
- acting Subject/User, который внёс offline record;
- source/evidence;
- применимая версия правила;
- correction/replacement history.

Position/choice в этот перечень **не входит** для Anonymous Voting.

## 7. Open Voting

Для Open Voting отдельный Voting Right Exercise не обязан создаваться как дублирующая запись для каждого Vote.

Recognized Vote уже показывает:

~~~text
Voting Right
→ realized by Vote
→ Position
~~~

Поэтому возможна модель:

- Open Voting: Vote является достаточным предметным доказательством реализации права;
- Anonymous Voting: используется отдельный Voting Right Exercise без связи с Position.

Это не делает Voting Right Exercise «типом Vote».

## 8. Anonymous offline Voting

Для anonymous offline части:

~~~text
certified issuance/participation register
→ operator recognition
→ 0..N Voting Right Exercises

separately:

commission counts anonymous ballots
→ Result of Offline Count
~~~

Связь:

~~~text
Voting Right Exercises
↔ participation/count/quorum inputs where applicable

Result of Offline Count
↔ choice totals
~~~

Но запрещена связь:

~~~text
Voting Right Exercise #123
→ particular anonymous ballot/Position
~~~

## 9. Anonymous online Voting

Для native online Anonymous Voting Community OS должна иметь возможность:

~~~text
Voting Right
→ prove eligibility
→ recognize right exercise
→ prevent second exercise

separately:

anonymous submission
→ anonymous counting input/result
~~~

Технический способ разрыва identity/choice linkage — одноразовый credential, blind signature, cryptographic mix, external anonymous-voting provider либо иной механизм — **не определяется настоящим stress-test**.

Domain requirement только такой:

> recognition факта реализации права не должно создавать восстанавливаемую Subject/Voting Right → Position связь.

## 10. Mixed anonymous Voting и защита от двойного участия

Именно отдельный Voting Right Exercise позволяет проверить mixed online/offline participation без раскрытия выбора.

Пример:

~~~text
VR-15
→ online exercise already recognized

offline issuance register
→ also contains VR-15
~~~

Community OS может выявить conflict:

~~~text
same Voting Right
→ two claimed exercises
→ conflict/review
~~~

не зная, какой choice был сделан online или на бумаге.

Applicable Voting Rule должна определить последствия:

- reject later exercise;
- require manual review;
- recognize one source as authoritative;
- исправить ошибочную запись;
- иной legal/profile-specific outcome.

Universal «последний всегда побеждает» не вводится.

## 11. Представитель

Если Voting Right реализовано представителем:

~~~text
Voting Right owner/basis
≠ actual exercising Subject
~~~

Voting Right Exercise может исторически хранить:

- actual exercising Subject;
- Representation/Domain Power basis;
- applicable time;
- source/evidence.

При Anonymous Voting это не раскрывает Position: сохраняется только факт, кто допустимо реализовал право.

## 12. Несколько Voting Rights одного Subject

Один Subject может реализовать несколько Voting Rights.

Например:

~~~text
Subject A
→ VR-15 → Exercise E15
→ VR-27 → Exercise E27
→ VR-83 → Exercise E83
~~~

Для Anonymous Voting эти факты показывают количество использованных прав, но не содержат choices.

## 13. Correction

Ошибочно recognized exercise не удаляется молча.

Пример:

~~~text
E17:
VR-27 marked exercised offline

later:
register row mapped to wrong Voting Right

→ explicit correction/review
→ E17 remains historical
→ effective realization state corrected
~~~

Не вводится universal `Voting Right Exercise Correction` entity автоматически; достаточно ADR-004-compatible correction semantics, пока отдельный lifecycle correction не доказан.

## 14. Rejected participation evidence

Если строка реестра/online eligibility evidence не подтверждает допустимую реализацию права:

~~~text
received evidence
≠ Voting Right Exercise
~~~

Rejected/unrecognized evidence может сохраняться с provenance по ADR-011, если это предметно значимо.

## 15. Quorum / participation

Voting Right Exercise может быть входом расчёта кворума **только если applicable rule так определяет**.

Нельзя универсально считать:

~~~text
number of exercises
= quorum
~~~

ADR-008 сохраняется: quorum может определяться по другому составу/уровню/правилу.

## 16. Result of Offline Count

Принятое ранее решение сохраняется:

**Результат подсчёта офлайн-части** — самостоятельный исторически значимый Governance fact.

Он отличается от Voting Right Exercise:

~~~text
Voting Right Exercise
→ кто/какое право участвовало

Result of Offline Count
→ сколько anonymous ballots дали каждую Position
~~~

И отличается от общего Calculation:

~~~text
Result of Offline Count
≠ Calculation
≠ Established Result
~~~

## 17. Почему не достаточно «Participation»

Существующее `Participation Right` ADR-001 — это **право**, а не исторический факт его фактической реализации.

ADR-008 также сознательно не вводит universal «участника процедуры».

Поэтому использовать `Participation Right` вместо Voting Right Exercise означало бы смешать:

~~~text
entitlement
≠ actual exercise
~~~

## 18. Fundamental entity check

Для Anonymous Voting самостоятельная identity факта реализации права **обоснована**.

Причины:

1. факт существует независимо от Position;
2. нужен для double-use/conflict detection;
3. имеет собственное время и channel provenance;
4. имеет actor/representation/admissibility semantics;
5. может быть исправлен независимо от anonymous count result;
6. используется как доказательство участия;
7. может быть входом quorum/participation calculation according to rule;
8. не может быть корректно выражен существующим Vote без разрушения anonymous boundary.

Поэтому рабочий вывод:

> `Voting Right Exercise` следует рассматривать как новый identity-bearing Governance concept Stage 11B.

Это **не новый bounded context**.

## 19. Нормативные последствия

Если вывод будет принят, Stage 11B BP должен предложить минимальную sync:

### ADR-001

Уточнить, что:

- Voting Right может иметь 0..N historical exercise records where procedure requires separate realization tracking;
- Vote остаётся position-bearing fact and не используется как anonymous participation placeholder;
- один effective exercise per Voting Right / conflict semantics определяются applicable rule.

### ADR-008

Уточнить, что:

- anonymous procedure может разделять right exercise и anonymous choice/counting contribution;
- Calculation может использовать Voting Right Exercises для participation/quorum where applicable и count results для positions;
- mixed channel conflict разрешается без раскрытия choice.

### DOMAIN_MODEL / TERMINOLOGY

Добавить `Реализация права голоса` только после review/adjudication Stage 11B.

## 20. Проверочные сценарии

### 20.1. Open online

~~~text
VR1 → Vote V1("За")
~~~

Отдельный Exercise не требуется как обязательная дублирующая запись.

### 20.2. Anonymous online

~~~text
VR1 → Exercise E1

anonymous choice
→ no VR1 link
~~~

### 20.3. Anonymous offline

~~~text
VR1 → Exercise E1
VR2 → Exercise E2
VR3 → Exercise E3

commission result:
За 2
Против 1
→ Result of Offline Count C1
~~~

Связь E1/E2/E3 с конкретными Position отсутствует.

### 20.4. Same right online + offline

~~~text
VR1 → E-online
VR1 → claimed E-offline
→ conflict
~~~

Position disclosure не требуется для обнаружения конфликта.

### 20.5. Representative

~~~text
VR1
→ Exercise by Subject B
→ Representation basis R
~~~

Owner/right basis и exercising Subject различаются.

### 20.6. Wrong register mapping

~~~text
register row mapped to VR2
→ E2 recognized
→ error found
→ explicit correction
~~~

Historical record не удаляется silently.

## 21. Итог

Существующая модель `Voting Right → Vote → Position` достаточна для Open Voting, но **недостаточна для Anonymous Voting**, если Community OS должна одновременно:

- знать, что право реализовано;
- предотвращать double use в mixed online/offline mode;
- сохранять доказательство участия;
- не хранить связь права/Subject с Position.

Поэтому следующий Draft BP Stage 11B должен использовать два независимых понятия:

~~~text
Voting Right Exercise
→ fact of participation/right use

Vote / anonymous counting contribution
→ choice semantics
~~~

Для anonymous offline channel choice-level source остаётся внешним, а Community OS принимает самостоятельный `Result of Offline Count`.

## 22. Вопрос для принятия

Принять ли `Voting Right Exercise / Реализация права голоса` как самостоятельный identity-bearing Governance concept Stage 11B?

Если да, после принятия можно переходить к Draft `BP-GOV-001 — Mixed Open/Anonymous Voting` и нормативной sync proposal.
