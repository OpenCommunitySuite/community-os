# BP-METER-001 — Замена прибора учёта и непрерывность точки учёта

**Статус:** Draft  
**Контекст:** Ресурсный и инженерный учёт  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет предметную семантику замены физического прибора учёта без потери непрерывности `Accounting Point` и без слияния:

- точки учёта;
- физического прибора;
- установки прибора;
- показания;
- потребления;
- документа;
- финансового начисления.

Базовая модель:

```text
replacement basis / authority
→ identify persistent Accounting Point
→ end old Meter Installation at actual effective time
→ preserve/recognize old boundary Reading where available
→ establish new Meter identity where needed
→ start new Meter Installation at actual effective time
→ preserve/recognize new boundary Reading where available
→ downstream Consumption / reconciliation processes use both installation intervals
```

Ключевой принцип:

```text
Meter replacement
≠ Accounting Point replacement
```

Если предметная граница учёта сохраняется, идентичность `Accounting Point` продолжается через замену прибора.

## 2. Основная предметная граница

Согласно ADR-007:

```text
Accounting Point
≠ Meter
≠ Meter Installation
≠ Reading
≠ Consumption
```

Замена прибора обычно означает:

```text
same Accounting Point
old Meter Installation ends
new Meter Installation starts
```

Старый Meter сохраняет собственную identity и историю.

Новый Meter получает собственную identity и не наследует identity, историю, серийные признаки или register values старого Meter.

История `Accounting Point` при этом не разрывается.

## 3. Что входит в процесс

BP охватывает:

- основание замены;
- applicable authority / полномочие на замену или признание результата;
- определение сохраняющейся Accounting Point;
- определение старой Meter Installation;
- фактическое прекращение старой установки;
- новый Meter;
- фактическое начало новой Meter Installation;
- конечное граничное значение старого прибора, если оно доступно;
- начальное граничное значение нового прибора, если оно доступно;
- единицы, коэффициенты и installation-specific interpretation;
- временной разрыв между установками;
- расчётный период, пересекающий замену;
- позднюю/offline регистрацию;
- duplicate/retry;
- исправление ошибочно зарегистрированной замены;
- отсутствие конечного или начального показания;
- перемещение Meter между Accounting Points;
- границу с изменением самой Accounting Point / топологии.

## 4. Что не входит

Настоящий BP не определяет:

- общий процесс передачи и признания всех обычных Reading;
- автоматический импорт показаний;
- телеметрию / MQTT / Modbus / АСКОЕ;
- универсальный расчёт Consumption;
- Control Reconciliation;
- Calculated Imbalance;
- признание Operational Loss;
- начисления собственникам;
- финансовые перерасчёты;
- интерфейсы;
- таблицы БД;
- API;
- универсальную Meter lifecycle/state machine;
- складской учёт Meter;
- поверку, сертификацию или пломбирование как самостоятельные универсальные сущности.

Эти данные могут быть evidence/basis замены, если это важно в конкретном процессе.

## 5. Замена не требует новой fundamental entity

Для базовой модели не требуется фундаментальная сущность `Meter Replacement`.

Предметный результат процесса выражается прежде всего через:

- сохранённую Accounting Point;
- завершённую старую Meter Installation;
- начатую новую Meter Installation;
- связанные граничные Reading, где они признаны;
- basis, authority и provenance, объясняющие связь изменений.

Если для аудита нужно показать, что два изменения установок относятся к одной замене, эта связь должна быть исторически объяснима, но не требует универсальной самостоятельной entity.

## 6. Accounting Point сохраняется только при сохранении предметной границы

Замена Meter сохраняет Accounting Point, если сохраняется сама предметная точка/граница измерительного учёта.

Например:

```text
plot electricity input Accounting Point AP-17
Meter M-OLD removed
Meter M-NEW installed
→ AP-17 remains AP-17
```

Однако нельзя сохранять Accounting Point автоматически только потому, что операция названа «заменой счётчика».

Если одновременно существенно изменена измеряемая граница, область или инженерная функция, требуется отдельная оценка:

```text
physical meter change
+ measurement boundary materially changed
→ possible Accounting Point / topology change
≠ simple meter replacement automatically
```

Перенос прибора в другой шкаф при сохранении той же предметной границы сам по себе не обязан создавать новую Accounting Point.

## 7. Основание замены

Основанием могут быть, например:

- неисправность;
- окончание допустимого периода эксплуатации/поверки;
- требование поставщика;
- модернизация;
- повреждение;
- подозрение на некорректность;
- изменение технической схемы без изменения Accounting Point;
- плановая замена;
- иной допустимый basis.

Основание замены:

- не является Meter;
- не является Meter Installation;
- не является Reading;
- не создаёт новую установку автоматически.

Generic plan «заменить счётчик позже» не является фактом замены.

## 8. Authority

Физически заменить Meter и признать соответствующее изменение истории учёта могут быть вправе разные стороны в зависимости от сообщества, поставщика, договора и применимых правил.

BP использует applicable authority/basis, но не устанавливает универсальную роль:

```text
Chairman
Electrician
Owner
Supplier employee
Administrator
```

как глобально уполномоченную.

Техническое право изменить данные в системе ≠ предметное полномочие признать замену.

## 9. Определение старой установки

Перед завершением старой установки должны быть предметно определимы:

- Accounting Point;
- Meter;
- конкретная Meter Installation;
- applicable Resource / measurement semantics;
- effective end time с доступной предметной точностью;
- существенные installation characteristics.

Если текущая установка не может быть надёжно определена, процесс не должен «угадывать» старый Meter ради удобства.

Физическая замена может быть зафиксирована позднее, но неопределённость исходной установки должна оставаться видимой.

## 10. Определение нового Meter

Новый физический Meter имеет собственную domain identity.

Manufacturer/model/serial number/номер пломбы могут быть важными идентификационными признаками и evidence, но настоящий BP не определяет универсальный технический ключ идентичности.

Повторная регистрация сведений о том же физическом приборе не должна создавать второй Meter автоматически.

Серийный номер не является универсальным глобальным identity key сам по себе: его интерпретация может зависеть от производителя, типа прибора, источника и качества данных. External device ID также не определяет Meter identity согласно ADR-011.

Если Meter уже известен системе, новая Meter Installation использует существующую identity этого Meter.

## 11. Совместимость нового Meter с точкой учёта

Новый Meter должен иметь достаточную предметную совместимость с Accounting Point и измеряемым Resource.

Должны быть объяснимы, где применимо:

- что измеряется;
- единица или достаточная семантика величины;
- measurement channels/registers;
- installation-specific conversion;
- коэффициент трансформации;
- направление/режим измерения;
- иные характеристики, без которых показания нельзя корректно интерпретировать.

Настоящий BP не вводит универсальный каталог технических характеристик Meter.

## 12. Фактическое окончание старой Meter Installation

Old Meter Installation заканчивается в тот момент, когда старый Meter предметно перестаёт использоваться для измерения в данной Accounting Point.

```text
installation end time
≠ record creation time
≠ document signing time automatically
```

Если известна только дата, а не точное время, система не должна создавать ложную часовую/минутную точность.

Доступная точность времени должна сохраняться достаточно для дальнейшей интерпретации.

## 13. Фактическое начало новой Meter Installation

New Meter Installation начинается в момент, когда новый Meter предметно начинает использоваться в данной Accounting Point.

```text
installation start time
≠ data entry time
≠ invoice/document date automatically
```

Начало установки не выводится автоматически из факта предварительной регистрации Meter в системе.

Физический монтаж и effective start могут не совпадать: Meter может быть смонтирован, но ещё не введён в измерительное использование. В таком случае Meter Installation start относится к предметно действующему measurement relation, а не автоматически к моменту механического монтажа.

## 14. Непрерывная замена и временной разрыв

Типовой вариант:

```text
old installation end = T
new installation start = T
```

Но универсальная нулевая длительность разрыва не требуется.

Допустим реальный сценарий:

```text
old Meter removed at T1
Accounting Point temporarily without Meter
new Meter installed at T2
T2 > T1
```

Accounting Point при этом сохраняется.

Период без Meter не заполняется фиктивной установкой.

Если Consumption за этот интервал требуется определить, используется отдельная applicable resource rule / substitute-data semantics; настоящий BP не придумывает Consumption.

Даже если supply был физически отключён на весь gap, BP-METER-001 не выводит автоматически нулевой Consumption только из отсутствия Meter; факт отсутствия подачи/потребления должен иметь собственное достаточное основание.

## 15. Overlap и параллельное измерение

Настоящий BP не вводит универсальный запрет на существование нескольких Meter Installations в отношении одной Accounting Point, потому что реальная инженерная семантика может включать:

- параллельное контрольное измерение;
- временную проверочную схему;
- compound metering;
- переходный интервал.

Однако простая замена не должна молча изображать два Meter как единственную одновременно действующую установку одного и того же measurement scope.

Если реальный overlap существует, его смысл должен быть явно объясним и не маскироваться под обычную последовательную замену.

## 16. Конечное показание старого Meter

Конечное граничное значение старого Meter полезно для разделения расчётного периода на интервалы до и после замены.

Если значение признаётся предметным Reading, это обычный `Reading`, связанный с old Meter Installation.

```text
final Reading
≠ attribute of new Meter
≠ initial Reading of new Meter
```

Reading сохраняет собственные:

- value;
- unit/measurement semantics;
- measurement time;
- provenance;
- Meter Installation context;
- quality/limitations where applicable.

Значение, записанное техником, в акте или сообщении, не становится Reading автоматически без applicable recognition semantics.

## 17. Начальное показание нового Meter

Начальное граничное значение нового Meter, если признано, является обычным Reading новой Meter Installation.

Новый Meter:

- не обязан начинаться с нуля;
- не обязан начинаться со значения старого Meter;
- может иметь factory/non-zero value;
- может использовать другую допустимую measurement representation.

```text
old final reading value
≠ new initial reading value
```

Их числовая разница сама по себе не является Consumption или loss.

## 18. Отсутствующее конечное показание

Физическая замена может быть реальным фактом даже при отсутствии надёжного final Reading.

Например:

- Meter уничтожен;
- дисплей неисправен;
- прибор недоступен;
- значение не было снято;
- evidence противоречиво.

В таком случае:

```text
old Meter Installation may still end
final Reading = absent / unresolved
```

Нельзя создавать фиктивный final Reading только для закрытия процесса.

Возможное замещающее/оценочное значение относится к отдельной resource semantics и должно отличаться от наблюдаемого/признанного Reading.

## 19. Отсутствующее начальное показание

Аналогично, новая Meter Installation может реально начаться, даже если initial Reading отсутствует либо ещё не признано.

```text
new Meter Installation exists
initial Reading may be missing
```

Отсутствие boundary Reading является проблемой качества/полноты данных, но не отменяет реальный installation fact.

## 20. Measurement time ≠ capture time

Boundary value может быть физически прочитано:

- непосредственно в момент снятия/установки;
- спустя некоторое время;
- из документа;
- из памяти устройства;
- из внешнего источника.

Если значение относится к другому моменту, нельзя молча присваивать ему время замены.

Следует различать, где существенно:

- measurement time;
- installation end/start time;
- capture/report time;
- recognition time;
- record time.

## 21. Multi-register / multi-channel Meter

Двухзонный или иной многоканальный Meter может иметь несколько существенных измерительных значений.

При замене должны быть обработаны все materially relevant boundary values согласно applicable resource semantics.

Настоящий BP не вводит универсальную сущность `Meter Register` только ради этого процесса.

Если конкретный ресурсный процесс требует самостоятельного понятия register/channel, оно должно быть обосновано отдельно.

## 22. Единицы и коэффициенты

Old и new Meter Installations могут использовать разные:

- units;
- scaling;
- transformation coefficients;
- installation characteristics;
- applicable conversion rules.

Новые коэффициенты не применяются ретроактивно к старой установке.

```text
old installation readings
→ old applicable interpretation

new installation readings
→ new applicable interpretation
```

Если коэффициент относится к установке, изменение коэффициента в момент замены должно быть исторически определимо через соответствующие installation intervals.

## 23. Смена коэффициента ≠ замена Meter автоматически

Если физический Meter не менялся, но изменился коэффициент трансформации, измерительная схема или applicable rule, это не является Meter replacement автоматически.

Может потребоваться:

- завершение одной Meter Installation и начало другой для того же Meter, если изменились installation-specific характеристики;
- изменение rule/version;
- изменение topology;
- иной специализированный процесс.

Решение зависит от предметного смысла изменения.

## 24. Reset / rollover ≠ replacement

Сброс регистра, rollover/counter wrap, изменение отображаемого значения или корректировка Meter state сами по себе не означают, что Meter был заменён.

Они требуют resource-specific interpretation в Reading/Consumption process.

Нельзя создавать fictitious replacement только потому, что новое Reading меньше предыдущего.

## 25. Расчётный период, пересекающий замену

Замена может произойти внутри месяца или другого расчётного периода.

Например:

```text
period 01–31
old Meter Installation → 01–17
new Meter Installation → 17–31
```

Период не обязан искусственно делиться на два финансовых периода.

Resource Consumption process может определить общий Consumption за период, используя относящиеся к интервалам readings/coefficients/rules.

BP-METER-001 сохраняет достаточный installation context, но не задаёт универсальную формулу Consumption.

## 26. Непрерывность Consumption не означает непрерывность числового регистра

Непрерывность Accounting Point означает непрерывность предметной точки учёта, а не непрерывность register value между разными Meter.

```text
Accounting Point continuity
≠ continuous Meter identity
≠ continuous register number
```

Derived Consumption across replacement должен объясняться через отдельные installation intervals и applicable resource rules.

## 27. Финансовая граница

Meter replacement сам по себе:

```text
≠ Accrual
≠ Financial Obligation
≠ Payment
≠ Expense
```

Исправление Meter Installation или boundary Reading не изменяет финансовые результаты напрямую.

Если ранее созданное Consumption было использовано в Accrual/Financial Obligation, resource recalculation и финансовая correction/recalculation остаются отдельными действиями owning contexts.

## 28. Документ замены

Акт, заявка, фото, пломба, документ поставщика или иной документ может:

- быть basis;
- подтверждать Meter identity;
- подтверждать times;
- содержать boundary values;
- подтверждать authority;
- быть evidence.

Но:

```text
Replacement Document
≠ Meter Installation
≠ Reading
≠ Meter
```

Один документ может подтверждать несколько предметных фактов.

Номер пломбы, факт опломбирования или замена пломбы сами по себе не определяют Meter identity, Accounting Point identity или Meter Installation identity.

## 29. Ownership / custody Meter

Meter может принадлежать или находиться под ответственностью:

- Community;
- собственника;
- поставщика;
- оператора сети;
- другой стороны.

Ownership/custody Meter не определяет identity Accounting Point и не меняет фундаментальную семантику замены автоматически.

Если право собственности/ответственность существенно для процесса, оно сохраняется как отдельный applicable context/basis.

## 30. Meter relocation

Один и тот же физический Meter может последовательно использоваться в разных Accounting Points, если это допускает предметная ситуация.

```text
Meter M
Installation at AP-A ends
later Installation at AP-B starts
```

Это не означает перенос истории AP-A в AP-B.

Если AP-A одновременно получает новый Meter, для AP-A происходит replacement.

Для AP-B может происходить установка ранее использованного Meter.

Meter identity сохраняется между установками.

## 31. Removal without immediate replacement

Если старый Meter снят, но новый ещё не установлен:

```text
old Installation ends
Accounting Point remains
new Installation absent
```

Это реальное состояние, которое не должно откатываться только потому, что replacement не завершён в бытовом смысле.

Настоящий BP не требует universal status `replacement-in-progress`.

## 32. Installation into an empty Accounting Point

Если Accounting Point уже существовала без Meter и Meter установлен впервые либо после длительного периода без прибора, это начало Meter Installation.

Это не обязано считаться replacement, если отсутствует заменяемая installation.

Базовая семантика Meter Installation при этом та же.

## 33. Reinstallation of the same Meter

Снятие и последующая установка того же физического Meter не является заменой Meter в строгом смысле.

Но если исторически значимое отношение использования было реально прервано, могут существовать:

```text
Installation #1 of Meter M
gap / service interval
Installation #2 of Meter M
```

Если прерывание не меняло предметного отношения установки и не существенно для учёта, искусственно дробить installation history не следует.

## 34. Planned replacement ≠ actual replacement

План, заявка, согласование или назначенная дата будущей замены не создают Meter Installation changes автоматически.

```text
planned replacement
≠ old Installation ended
≠ new Installation started
```

Actual replacement facts признаются по фактическому installation/use basis.

Если план отменён или изменён, это не требует фиктивного resource correction, потому что предметные Meter Installation facts ещё не возникли.

## 35. Late / offline recording

Физическая замена может быть зарегистрирована позже.

```text
actual replacement time
≠ recognition/record time
```

Поздняя регистрация не создаёт новую физическую замену на дату ввода данных.

Все downstream calculations должны использовать предметно применимые времена, а не только technical created-at.

## 36. Duplicate / retry

Повторная техническая обработка одного и того же подтверждённого replacement fact не создаёт:

- второй Meter;
- вторую old Installation termination;
- вторую new Installation;
- дублирующие Reading.

Совпадение Meter serial/date/values само по себе не является универсальным доказательством duplicate.

Нужна предметная identity/provenance конкретного факта.

Универсальный idempotency key в настоящем BP не проектируется.

## 37. Ошибочно зарегистрированная замена

Если позднее установлено, что физической замены не было либо она была отражена неверно, история не удаляется молча.

Следует сохранить:

- исходную ошибочную фиксацию;
- основание исправления;
- correct Meter Installation history;
- связь с affected boundary readings;
- время correction/recognition.

Универсальная Correction entity не вводится.

## 38. Wrong Meter identity

Если при реальной замене выбран не тот Meter record, необходимо исправить связь installation с фактически использованным физическим Meter без переписывания истории молча.

Это не обязательно означает, что сама замена физически была ошибочной.

```text
real replacement
+ wrong recorded Meter identity
→ installation correction
≠ fictitious replacement
```

## 39. Wrong effective time

Если ошибочно указаны start/end times Meter Installation:

- исходная фиксация сохраняется в provenance;
- effective interval исправляется на sufficient basis;
- ранее рассчитанные Consumption не меняются молча;
- при необходимости запускается отдельный resource recalculation.

Technical record timestamp остаётся отличим от corrected effective time.

## 40. Wrong boundary Reading

Исправление final/initial Reading не является исправлением Meter Installation автоматически.

```text
Reading correction
≠ installation correction
```

Если corrected Reading влияет на Consumption, соответствующий resource recalculation выполняется отдельно.

## 41. Derived Consumption after correction

Изменение:

- boundary Reading;
- installation interval;
- coefficient;
- conversion rule;
- Meter identity

может сделать ранее рассчитанный Consumption требующим пересмотра.

Но:

```text
source correction
≠ automatic silent Consumption rewrite
```

Owning Consumption process должен выполнить отдельный traceable recalculation where required.

## 42. Financial consequences after resource correction

Даже если corrected Consumption должен изменить начисление собственнику:

```text
Meter/Reading correction
→ resource recalculation
→ financial correction/recalculation where applicable
```

Resource context не переписывает Accrual/Financial Obligation напрямую.

## 43. Новый Meter позднее признан непригодным

Если новый Meter был реально установлен и использовался, а позже признан неисправным/непригодным:

- факт Meter Installation не исчезает;
- установка заканчивается по реальному applicable time;
- может потребоваться следующая replacement;
- readings/Consumption за интервал оцениваются owning resource process according applicable evidence/rules.

Не следует удалять неудачную установку, будто её никогда не было.

## 44. Provenance замены

Для исторической объяснимости replacement должны быть определимы в необходимом объёме:

- Accounting Point;
- old Meter и old Meter Installation;
- old installation end time;
- new Meter и new Meter Installation;
- new installation start time;
- basis;
- acting/recognizing authority where applicable;
- old/new boundary values and их статус как recognized Reading либо только evidence;
- relevant units;
- relevant installation coefficients/characteristics;
- documents/evidence;
- gap/overlap semantics where applicable;
- actual event time vs record/recognition time;
- corrections/replacements of erroneous records;
- links to subsequent recalculation where materially significant.

Это не универсальная схема полей хранения.

## 44. Результаты процесса

Возможны разные предметные outcomes.

### 44.1. Completed replacement

```text
same Accounting Point
old Installation ended
new Installation started
boundary readings recognized where available
```

### 44.2. Replacement with missing final Reading

```text
old Installation ended
new Installation started
final Reading unavailable
data gap preserved
```

### 44.3. Replacement with missing initial Reading

```text
old Installation ended
new Installation started
initial Reading unavailable
data gap preserved
```

### 44.4. Removal with gap before new Meter

```text
old Installation ended
Accounting Point remains unmetered for interval
new Installation later starts
```

### 44.5. Requires Decision / insufficient basis

Если невозможно надёжно определить:

- affected Accounting Point;
- old/new Meter identity;
- effective interval;
- факт физической замены;

процесс не должен создавать fictitious history.

Неопределённость сохраняется до resolution.

## 45. Pilot ST — индивидуальный электросчётчик

Участок имеет устойчивую Accounting Point электроэнергии.

```text
AP-Plot-42
old Meter M1, Installation I1
replacement on 15th
new Meter M2, Installation I2
```

Valid result:

```text
AP-Plot-42 unchanged

I1:
  Meter = M1
  end = 15th
  final Reading where recognized

I2:
  Meter = M2
  start = 15th
  initial Reading where recognized
```

Monthly Consumption may later use both installation intervals.

Personal Account / owner identity не определяют Meter replacement identity.

## 46. Pilot ST — общий/уличный Meter

Замена общего или промежуточного Meter не должна создавать новую улицу, ветвь, Personal Account или новый набор подключённых объектов.

Если Accounting Point сохраняет ту же инженерную границу:

```text
same group Accounting Point
old Meter → new Meter
topology relation remains
```

Control Reconciliation после замены должна использовать исторически применимую Meter Installation для соответствующего времени.

## 47. Pilot ST — двухзонный электросчётчик

При замене двухзонного Meter materially relevant boundary values могут включать несколько тарифных/measurement channels.

Например:

```text
old Meter final:
  channel A = ...
  channel B = ...

new Meter initial:
  channel A = ...
  channel B = ...
```

BP требует сохранить достаточный context, но не вводит универсальную domain entity Meter Register.

Financial tariff zones и resource measurement channels не должны автоматически считаться одним понятием.

## 48. Pilot ST — water Meter

Для водомера применяется та же фундаментальная модель:

```text
Accounting Point persists
old water Meter Installation ends
new water Meter Installation starts
boundary Readings where available
```

Resource-specific differences в единицах, точности, rollover и replacement basis не создают другую фундаментальную модель.

## 49. Pilot ST — replacement with coefficient change

Если при замене общего электросчётчика одновременно меняется applicable transformation coefficient:

```text
old Installation:
  coefficient K1

new Installation:
  coefficient K2
```

Readings старого интервала интерпретируются с K1, нового — с K2.

K2 не применяется ретроактивно к old Installation.

Если поставщик использует собственный settlement coefficient, его supplier-side financial/resource settlement semantics не подменяет installation coefficient Community OS автоматически.

## 50. Pilot ST — meter removed and replaced next day

```text
old Meter removed 10 Sep 18:00
new Meter installed 11 Sep 09:00
```

Accounting Point сохраняется.

Интервал между 18:00 и 09:00:

- не получает fictitious Meter Installation;
- не получает fictitious Reading;
- может потребовать substitute/estimated Consumption according later resource process.

## 51. Pilot ST — Meter moved to another plot

Meter M снят с AP-Plot-10 и позднее установлен на AP-Plot-25.

```text
M identity preserved
Installation at AP-Plot-10 ends
Installation at AP-Plot-25 starts
```

История показаний AP-Plot-10 не переносится на AP-Plot-25.

Если AP-Plot-10 получает M2, это отдельная replacement для AP-Plot-10.

## 52. Pilot ST — Accounting Point boundary really changed

Если вместе с новым Meter электрический ввод перенесён так, что изменена сама измерительная граница и scope:

```text
old AP boundary
≠ new AP boundary
```

нельзя автоматически объявить это «тем же AP после замены счётчика».

Сначала требуется определить изменение инженерной/topology semantics.

BP-METER-001 не владеет универсальным topology-change process.

## 53. Scenarios

### 53.1. Normal replacement, readings available
Old Installation ends, final Reading recognized, new Installation starts, initial Reading recognized, Accounting Point unchanged.

### 53.2. New Meter starts at zero
Old final = 18452 kWh, new initial = 0 kWh. No contradiction; values belong to different Meter Installations.

### 53.3. New Meter starts non-zero
New initial = 17 kWh. Do not force zero.

### 53.4. Missing old final Reading
Old Meter physically failed. End old Installation, start new one, preserve missing boundary value.

### 53.5. Missing new initial Reading
New Meter installed but initial value not reliably captured. Installation still valid; do not invent zero.

### 53.6. Replacement recorded a week later
Actual effective times stay historical; record time is later.

### 53.7. Duplicate technical submission
Retry does not create second replacement/installations/readings.

### 53.8. Wrong Meter selected in UI/import
Correct Meter Installation link; preserve correction history.

### 53.9. Wrong replacement date
Correct effective interval traceably; derived Consumption revalidated separately.

### 53.10. Reading corrected after replacement
Correct Reading; installation identity remains unless installation fact was also wrong.

### 53.11. Old and new coefficients differ
Each interval uses its own historically applicable coefficient.

### 53.12. Period spans replacement
One monthly resource period may use old + new installation segments without merging Meter identities.

### 53.13. Meter removed, no replacement yet
Accounting Point remains; no current Meter Installation required.

### 53.14. First Meter installed into previously empty point
New Meter Installation, not replacement.

### 53.15. Same Meter removed for service and reinstalled
Potentially two installation intervals if actual relation was materially interrupted; not a Meter replacement.

### 53.16. Parallel control Meter during transition
Real overlap preserved with explicit semantics; do not collapse to ordinary replacement.

### 53.17. Meter relocated to another Accounting Point
Meter identity moves through installation history; Accounting Point histories remain separate.

### 53.18. Physical boundary changed with Meter
Requires topology/accounting-point decision; not simple replacement automatically.

### 53.19. Supplier-owned Meter
Ownership does not change AP/Meter/Installation boundaries.

### 53.20. Replacement document says value but evidence conflicts
Do not auto-recognize conflicting boundary Reading; installation fact and reading recognition can be resolved separately.

### 53.21. Multi-channel Meter
All materially relevant boundary values handled; no universal register entity introduced.

### 53.22. Register rollover near replacement
Do not infer replacement or negative Consumption from lower numeric reading without resource-specific interpretation.

### 53.23. New Meter later found defective
Installation remains historical; subsequent replacement/correction handled separately.

### 53.24. Meter mounted today, effective tomorrow
Meter physically mounted on 10 Sep, but according to applicable basis begins measurement use on 11 Sep. New Meter Installation starts on the effective use boundary, not automatically at physical mounting time.

### 53.25. Planned replacement cancelled
Replacement was scheduled and documented as a plan, but no physical/effective installation change occurred. No old/new Meter Installation facts are created.

### 53.26. Serial number collision or ambiguous serial
Two source records contain the same serial-like value but identity is not sufficiently established. Do not merge Meter identities solely by serial equality.

### 53.27. External device ID changed
Telemetry/provider device ID changes after replacement or remapping. External device ID change does not create or replace Meter identity automatically; mapping follows ADR-011.

### 53.28. Seal replaced without Meter replacement
Seal number changes while the same Meter Installation remains effective. Do not create fictitious replacement solely because seal metadata changed.

### 53.29. De-energized gap
Old Meter removed, supply independently confirmed disconnected, new Meter installed later. Gap is still represented as no Meter Installation; zero/substitute Consumption is decided by owning resource process from the de-energization evidence, not inferred only from missing Meter.

## 54. Инварианты

1. Accounting Point ≠ Meter.
2. Meter ≠ Meter Installation.
3. Meter Installation ≠ Reading.
4. Reading ≠ Consumption.
5. Meter replacement does not create a new Accounting Point automatically.
6. Accounting Point continuity does not require continuous Meter identity.
7. Accounting Point continuity does not require continuous numeric register values.
8. Old Meter history is not transferred to new Meter.
9. New Meter has its own identity even when installed at the same Accounting Point.
10. Old Meter Installation end time is a subject-matter time, not record time.
11. New Meter Installation start time is a subject-matter time, not record time.
12. A real gap between installations must remain representable.
13. Gap without Meter must not be filled by fictitious Meter Installation.
14. Overlap must be explicit where it is a real engineering fact.
15. Final Reading is not automatically required for existence of replacement.
16. Initial Reading is not automatically required for existence of new Installation.
17. Missing Reading must not be replaced by fictitious Reading.
18. Observed/document value ≠ recognized Reading automatically.
19. Old final Reading ≠ new initial Reading.
20. New initial Reading need not be zero.
21. Boundary Reading keeps its actual measurement/provenance semantics.
22. New installation coefficient does not rewrite old readings/results.
23. Coefficient change ≠ Meter replacement automatically.
24. Register reset/rollover ≠ Meter replacement automatically.
25. One resource period may span several Meter Installations.
26. Consumption calculation is not owned by BP-METER-001.
27. Meter replacement ≠ Accrual/Financial Obligation/Payment/Expense.
28. Resource correction does not rewrite financial consequences directly.
29. Replacement Document ≠ Meter/Meter Installation/Reading.
30. Meter ownership/custody ≠ Accounting Point identity.
31. One Meter may have sequential Installations in different Accounting Points where valid.
32. Meter relocation does not move Accounting Point history.
33. Removal without immediate replacement may leave Accounting Point without Meter.
34. First installation in empty Accounting Point ≠ replacement automatically.
35. Reinstallation of same Meter ≠ replacement in strict sense.
36. Late recording does not change actual installation times.
37. Technical retry does not create duplicate Meter/Installation/Reading.
38. Same serial/date/value is not universal duplicate proof.
39. Erroneous replacement history is corrected traceably, not silently deleted.
40. Reading correction ≠ installation correction automatically.
41. Installation correction ≠ automatic Consumption rewrite.
42. Consumption recalculation ≠ financial correction automatically.
43. Defective new Meter does not erase its real historical Installation.
44. Meter/Register/channel concepts are not expanded universally without need.
45. Meter replacement does not define topology change automatically.
46. Physical boundary change may require Accounting Point/topology decision instead of simple replacement.
47. Resource-specific differences do not create separate fundamental replacement models for electricity and water.
48. Supplier-side settlement coefficients do not redefine Community OS installation coefficients automatically.
49. Planned replacement ≠ actual Meter replacement.
50. Physical mounting time ≠ Meter Installation effective start automatically.
51. Serial number ≠ universal global Meter identity key.
52. External device ID ≠ Meter identity.
53. Seal identity/change ≠ Meter identity or replacement automatically.
54. Missing Meter during a gap does not prove zero Consumption automatically.

## 55. Проверка против OSBBX reference

OSBBX публично подтверждает practical replacement scenario и необходимость сохранять:

- старый прибор;
- конечное показание;
- дату снятия;
- новый прибор;
- начальное показание;
- дату установки;
- объект/точку подключения;
- ветвь учёта;
- непрерывность расчётного периода.

Community OS использует этот сценарий как проверку, но не копирует модель внешней системы.

В частности:

- «объект/точка подключения» нормализуется через Accounting Point и применимую topology semantics;
- история старого Meter не переносится в новый Meter;
- отсутствие boundary Reading не отменяет реальный installation fact;
- замена не создаёт универсальный Meter Workflow или Replacement entity.

## 56. Нормативная синхронизация

Новый ADR и новые fundamental entities не требуются.

В этой Draft-ветке выполнена точечная синхронизация:

- ADR-007 — explicit replacement boundary, сохранение Accounting Point, gap/overlap, optional boundary Reading, temporal precision и correction semantics;
- DOMAIN_MODEL → 0.19 — replacement continuity, boundary Reading semantics, Meter identity/serial/external-ID boundary и correction/recalculation separation;
- TERMINOLOGY → 0.17 — уточнены Meter, Reading, Accounting Point и Meter Installation;
- REFERENCE_CANDIDATE_MATRIX — REF-METER-001 закрыт решением; Stage 6 отмечен завершённым, Stage 7 — следующим.

Новые fundamental entities `Meter Replacement`, `Meter Register`, `Measurement Event`, `Resource Correction` не введены.

VISION.md не требует изменения: уже принятый принцип непрерывности Accounting Point при замене Meter полностью согласуется с BP-METER-001.

## 57. Решения internal review

1. **Отдельная identity Meter Replacement не требуется.** Достаточно traceable relation/provenance между ended old Meter Installation и started new Meter Installation на сохраняющейся Accounting Point.
2. **Final/initial boundary Reading не обязательны для существования реальной замены.** Они обязательны только там, где конкретный downstream process требует их как достаточный input; fictitious Reading не создаётся.
3. **Completed replacement допускает реальный gap между installations.** Accounting Point сохраняется; gap остаётся без Meter Installation.
4. **Universal ban на overlap не вводится.** Реальный overlap допустим для parallel/control/compound semantics, но должен быть явно объясним.
5. **Replacement отделяется от Accounting Point/topology change по сохранению предметной измерительной границы.** Материальное изменение scope/boundary требует отдельного topology/accounting-point решения.
6. **Универсальная Meter Register entity сейчас не нужна.** Multi-register/channel values обрабатываются в достаточном resource-specific context.
7. **Reinstallation того же Meter не является Meter replacement.** При реальном существенном interruption могут существовать несколько Meter Installation intervals одного Meter.
8. **Изменение installation-specific coefficient может потребовать новый Meter Installation interval даже для того же Meter**, если изменилось исторически значимое отношение/интерпретация установки. Это не Meter replacement автоматически.
9. **Replacement не запускает Consumption recalculation автоматически как скрытый cascade.** Downstream Consumption process revalidates/recalculates результаты, если replacement/correction materially affects them.
10. **Resource correction не запускает финансовую correction автоматически.** Financial recalculation/correction выполняется отдельным owning financial process.
11. **Ownership/custody Meter не входит в replacement identity.** Это отдельный context/basis where relevant.
12. **Отдельная Correction entity не требуется.** Ошибочная installation/replacement history исправляется traceably по ADR-004/007.
13. **Replacement может существовать без old final Reading.** Missing value остаётся явным.
14. **New Meter Installation может существовать без initial Reading.** Missing value остаётся явным.
15. **Акт замены не является replacement identity.** Если документ предметно значим, он имеет обычную Document identity по документному контексту и служит evidence/basis.
16. **При неизвестном exact time сохраняется фактически доступная temporal precision.** Не создаётся ложное HH:MM.
17. **Meter serial number не является universal identity key.** Это идентификационный атрибут/evidence; external identifiers подчиняются ADR-011.
18. **Один Meter может последовательно использоваться в разных Accounting Points.** Его identity сохраняется, а Meter Installations различаются.
19. **Planned replacement и actual replacement различаются.** План/заявка/назначенная дата не создают installation facts.
20. **Pilot-ST scenario set достаточен для стабилизации базовой модели:** individual/group electricity, two-zone meter, water meter, coefficient change, gap, relocation, changed boundary, missing readings, same-Meter reinstallation, overlap, supplier-owned Meter, defective new Meter, external device ID, seal-only change и ambiguous serial.

Новых фундаментальных сущностей или блокирующих предметных вопросов по итогам internal review не выявлено.

## 58. Текущее состояние и следующий шаг

Draft прошёл:

- internal review against ADR-004/005/007/010/011;
- проверку against current DOMAIN_MODEL / TERMINOLOGY;
- practical scenario check по индивидуальным, общим/промежуточным, двухзонным электрическим и водяным Meter пилотного СТ;
- проверку gap/overlap, missing boundary Reading, coefficient change, same-Meter reinstallation, relocation, changed Accounting Point boundary, late recording, duplicate и correction;
- нормативную синхронизацию ADR-007 / DOMAIN_MODEL / TERMINOLOGY / REFERENCE_CANDIDATE_MATRIX.

Блокирующих предметных вопросов после internal review не осталось.

Следующий предметный этап после принятия/merge BP-METER-001 — Stage 7 resource operational processes:

1. приём и признание Reading;
2. автоматический импорт/получение показаний;
3. контрольное снятие;
4. Control Reconciliation;
5. Calculated Imbalance и отдельное признание Operational Loss.

Дополнительный review BP-METER-001 сейчас не инициируется. Возвращаться к фундаментальной модели replacement следует только при новом практическом сценарии или обнаруженном противоречии.
