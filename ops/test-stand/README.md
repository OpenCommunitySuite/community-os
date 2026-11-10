# Первый тестовый стенд Community OS

Стенд рассчитан на синтетические данные и Linux Docker на тестовой ВМ. Использует три контейнера `communityos-test-stand-{postgres,web,worker}`, отдельную внутреннюю Docker-сеть и два именованных тома для PostgreSQL и ключей ASP.NET Data Protection. Порты ВМ не публикуются. Web слушает HTTPS только на loopback контейнера. Worker запускается отдельным процессом, отправка кодов по умолчанию выключена.

## Подготовка

Нужны открытый SSH-туннель к Docker на `127.0.0.1:23750`, Python 3.11 или новее и PowerShell 7. Для сборки образа Docker на ВМ получает закреплённые базовые образы и зависимости из реестров. Образ содержит Web, Worker и собранный Platform Application. Базовые образы и PostgreSQL закреплены по digest, зависимости .NET и pnpm берутся из lock-файлов.

Создайте пустой каталог вне репозитория, доступный только доверенным пользователям. Пример для Windows:

```powershell
$cfg = Join-Path $env:LOCALAPPDATA 'CommunityOS-TestStand'
New-Item -ItemType Directory $cfg
$tag = 'communityos-test-stand:' + (git rev-parse --short HEAD)
./ops/test-stand/init.ps1 -Directory $cfg -Image $tag
python ops/test-stand/stand.py build $tag
```

Сценарий создаёт `stand.json` с тестовыми секретами, `https.pfx` с закрытым ключом и публичный `https.pem` для проверки сертификата. Сертификат действует 30 дней. Секреты не передавайте в чат и не добавляйте в репозиторий. Доступ к Docker даёт доступ к конфигурации контейнеров, поэтому туннель и учётная запись Docker предназначены только для доверенного оператора.

## Запуск и миграции

```powershell
python ops/test-stand/stand.py database (Join-Path $cfg 'stand.json')
python ops/test-stand/stand.py migrate
python ops/test-stand/stand.py up (Join-Path $cfg 'stand.json')
python ops/test-stand/stand.py status
```

Миграции выполняет отдельная учётная запись PostgreSQL в базах `communityos_platform` и `communityos_register`. Команда записывает версию и контрольную сумму каждой миграции вместе с её результатом. Повтор пропускает уже применённые версии. Изменение применённого файла приводит к отказу. Web получает ограниченную роль `stand_web`. Команда запуска печатает только UUID синтетических учётных записей, пароли остаются в локальном `stand.json`.

## HTTPS и проверка

Оставьте локальный канал открытым в отдельном окне:

```powershell
python ops/test-stand/stand.py relay
```

Откройте `https://127.0.0.1:5443/platform/`. Канал принимает соединения только на loopback Windows и передаёт TLS через уже открытый SSH-туннель к Docker. Сверьте SHA-256 сертификата с выводом `init.ps1`. Для проверки состояния можно указать доверенный сертификат явно:

```powershell
curl.exe --cacert (Join-Path $cfg 'https.pem') https://127.0.0.1:5443/health/ready
```

Войдите как `stand-creator`. Создайте синтетическое сообщество и укажите UUID `stand-administrator`. Войдите под администратором, проверьте назначение в созданном сообществе и отказ для другого UUID. Под `stand-creator` отзовите назначение и проверьте журнал. Повтор с тем же идентификатором запроса не восстанавливает отозванное назначение.

## Остановка и повторный запуск

```powershell
python ops/test-stand/stand.py stop
python ops/test-stand/stand.py database (Join-Path $cfg 'stand.json')
python ops/test-stand/stand.py migrate
python ops/test-stand/stand.py up (Join-Path $cfg 'stand.json')
```

Остановка сохраняет контейнеры, базы и тома. Сценарий отказывается использовать контейнеры, сети или тома без метки этого стенда. Смена образа или конфигурации требует отдельно пересоздать только контейнеры стенда с сохранением именованных томов.

## Проверка живой доставки

SMTP и Telegram включаются отдельным изменением конфигурации стенда после согласования тестовых получателей. Для него нужны тестовый SMTP-сервер с STARTTLS, данные отправителя и тестовая почта, а также токен тестового бота и заранее подтверждённый личный чат. Секреты передаются через защищённое хранилище или вводятся владельцем непосредственно в закрытую конфигурацию. Worker понадобится управляемый исходящий доступ к SMTP и Telegram Bot API. Входящие порты ВМ для этого не нужны. [Роли и параметры доставки](../../docs/implementation/PLATFORM_RECOVERY_DELIVERY.md)
