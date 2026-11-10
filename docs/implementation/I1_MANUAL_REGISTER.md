# Ручной реестр I‑1

Команды предназначены для локальной проверки на синтетических данных в отдельной PostgreSQL. Перед запуском примените `src/CommunityOS.Modules.Community/Infrastructure/Migrations/001_manual_register.sql` и `src/CommunityOS.Modules.Community/Infrastructure/Migrations/002_ownership_correction.sql` по порядку к этой базе отдельной учётной записью с правом создавать схему. Учётной записи команд реестра нужны `USAGE` на схему и `SELECT` и `INSERT` на её таблицы, а также `UPDATE (subject_id, revision)` на `community_register.ownership`.

Задайте `COMMUNITYOS_REGISTER_DATABASE` со строкой подключения и `COMMUNITYOS_REGISTER_COMMUNITY` с UUID тестового сообщества в текущем сеансе. Используйте отдельные учётные данные для тестовой базы.

```powershell
$owner = dotnet run --project src/CommunityOS.Web -- register add-new "Тестовый собственник" "1" "A-1"
dotnet run --project src/CommunityOS.Web -- register add-existing $owner "2" "A-2"
dotnet run --project src/CommunityOS.Web -- register list
```

В списке ожидаются два участка с одним идентификатором собственника и разными номерами счетов. Операция добавления записывает участок, связь собственности и счёт в одной транзакции. Для второго участка собственника выбирают по идентификатору. Совпадение имён само по себе ничего не связывает.

Это первый сценарий ручного ввода. Для работы с данными пилота нужны отдельные сценарии доступа и интерфейс администратора. CSV/XLSX относится к следующей части I‑1.

Если при первоначальном вводе привязали не того собственника, возьмите `PlotId` и `OwnershipRevision` из результата `register list` и укажите UUID правильного собственника того же сообщества.

```powershell
dotnet run --project src/CommunityOS.Web -- register correct-owner $plotId $revision $correctOwner "Ошибка первоначального ввода"
```

Исправление сохраняет прежнюю связь и причину в `community_register.ownership_correction`, а счёт остаётся привязан к участку. Повтор команды с устаревшей ревизией отклоняется. Команда предназначена для исправления ввода. Фактическая смена собственника требует отдельного процесса.
