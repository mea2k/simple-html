# Тестовое приложение для дипломной работы по курсу DEVOPS

## Описание проекта

Контейнер построен на основе nginx-сервера и представляет собой статический web-сайт.

Параметры контейнера:

- порт `80`
- подключаемая папка с данными `/usr/share/nginx/data`

Сайт на вход принимает json-файл, из которого извлекается информация и отображается на странице. По умолчанию, файл должен называться `data.json` и находиться в папке `/usr/share/nginx/data`.

__Структура json-файла:__

```text
[
  {
    "id": number,
    "title": string,
    "label": {
      "type": {"important" | "urgent" | "personal" | "work"},
     "text": string
   },
  "requiredCompleted": number,
    "subtasks": [
      {
        "title": string,
        "completed": boolean
      },
   ...      
    ]
  },
 ...
]
```

Описание полей json-файла

| Поле     | Тип      | Описание |
|----------|----------|----------|
| id       | number   | Идентификатор работы (порядковый номер)   |
| title    | string   | Наименование работы   |
| label.type    | выбор   | Тип метки `{"important" \| "urgent" \| "personal" \| "work"}` - от этого зависит цвет метки работы   |
| requiredCompleted    | number _(optional)_   | Количество подзадач, которое необходимо выполнить для выполнения работы. Если поле отсутствует, то значение берется из общего числа подзадач работы |
| subtasks    | []   | Массив подзадач  |
| subtask.title    | string   | Наименование подзадачи |
| subtask.completed    | boolean   | Выполнена ли задача? |

__Пример json-файла__

```json
[
  {
    "id": 1,
    "title": "Изучить JavaScript",
  "requiredCompleted": 2,
    "subtasks": [
      {
        "title": "Освоить основы синтаксиса",
        "completed": true
      },
      {
        "title": "Изучить работу с DOM",
        "completed": true
      },
      {
        "title": "Разобраться с асинхронностью",
        "completed": false
      }
    ]
  },
  {
    "id": 2,
    "title": "Создать портфолио",
    "subtasks": [
      {
        "title": "Собрать лучшие работы",
        "completed": true
      },
      {
        "title": "Создать персональный сайт",
        "completed": true
      }
    ]
  },
  {
    "id": 3,
    "title": "Подготовиться к собеседованию",
    "requiredCompleted": 2,
    "subtasks": [
      {
        "title": "Повторить алгоритмы",
        "completed": true
      },
      {
        "title": "Подготовить вопросы работодателю",
        "completed": false
      },
      {
        "title": "Отправить резюме работодателю",
        "completed": false
      }
    ]
  }
]
```

В данном примере работы с `id: 1` и `id: 2` выполнены, а работа с `id: 3` - не выполнена.

## Docker-контейнеры

Docker-контейнеры загружены в репозитории:

- dockerhub: [https://hub.docker.com/r/makevg/devops-html](https://hub.docker.com/r/makevg/devops-html)
- Yandex.Registry: `cr.yandex/crpg9ie34hq65l49usj2/devops-html:latest`

## Сборка docker-образа

Для сборки docker-образа локально необходимо скопировать папки [`conf`](conf/), [`src`](src/), файл [`Dockerfile`](Dockerfile). Затем выполнить команду

```bash
docker build -t devops-html:tag .
```

Поверка собранного образа:

```bash
docker images
```

## Запуск контейнера

Для запуска необходимо выполнить команды:

```bash
docker run --rm -it --name devops-html -p 3000:80 -v ./data:/usr/share/nginx/data makevg/devops-html:2
```

ИЛИ

```bash
docker run --rm -it --name devops-html -p 3000:80 -v ./data:/usr/share/nginx/data cr.yandex/crpg9ie34hq65l49usj2/devops-html:latest
```

ИЛИ

```bash
docker compose up
```

Пример compose-файла: [docker-compose.yml](docker-compose.yml).

Данные примеры запускают контейнер на порту `3000` и считывают данные из текущей папки `./data`.

## Запуск в кластере kubernetes

Для запуска в кластере kubernetes необходимо выполнить следующие действия:

1. Скачать папку [`kubernetes`](kubernetes/).

2. Получить oauth-метку от Yandex.Cloud. Сделать это можно по ссылке [https://oauth.yandex.ru/verification_code](https://oauth.yandex.ru/verification_code)

3. Создать секрет в кластере для доступа к репозиторию `cr.yandex`:

	```bash
	kubectl create secret docker-registry cr.yandex --docker-server=https://cr.yandex/ --docker-username=oauth --docker-password=<your-oauth-code> --docker-email=<your-email@yandex.ru>
	```

4. Создать configMap с данными для приложения. В файле [configmap.yaml](kubernetes/configmap.yaml#L6) необходимо указать требуемые данные для файла `data.json`

	```bash
	kubectl apply -f kubernetes/configmap.yaml
	```

5. Создать deployment с указанием требуемого количества реплик приложения. 

	Так же в файле [deployment.yaml](kubernetes/deployment.yaml#L22) вместо `__IMAGE__` указать одно из значений:
		
	- `makevg/devops-html`
	- `cr.yandex/crpg9ie34hq65l49usj2/devops-html`

	После этого выполнить команду:

	```bash
	kubectl apply -f kubernetes/deployment.yaml
	```

6. Создать сервис с указанием внешнего порта, по которому будет доступно приложение. Также в файле [service.yaml](kubernetes/service.yaml#L6) можно поменять тип сервиса с `NodePort` на `LoadBalancer`, если не используется внешний балансировщик:

	```bash
	kubectl apply -f kubernetes/service.yaml
	```

7. Проверить корректность запуска всех сущностей кластера:

	```bash
	kubectl get all
	```

В приведённых файлах приложение запускается в пространстве имен `default` на порту `3000` и доступно с внешнего IP-адреса кластера (используется внешний балансировщик).



# Где используется

Сама работа [https://github.com/mea2k/devops-diplom](https://github.com/mea2k/devops-diplom)
