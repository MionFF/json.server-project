"use strict";

const postsList = document.getElementById("postsList");
const addPostBtn = document.getElementById("addPost");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const API_URL = "http://localhost:3000/posts";
let editPostId = null;
let allPosts = [];

// Функция для показа сообщений
function showMessage(text, type = "success", duration = 2500, id = null) {
        const container = document.getElementById("messageContainer");

        // Ограничение количества сообщений (макс 5)
        if (container.children.length >= 5) {
            container.firstChild.remove();
        }

        const msg = document.createElement("div");
        msg.className = `message ${type}`;
        if (id) msg.id = id;

        // Кнопка закрытия
        const closeBtn = document.createElement("span");
        closeBtn.textContent = "x";
        closeBtn.className = "close-btn";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.marginLeft = "10px";
        closeBtn.style.fontSize = "16px";
        closeBtn.addEventListener("click", () => {
            msg.classList.remove("show");
            msg.classList.add("hide");
            msg.addEventListener("transitionend", () => msg.remove(), { once: true });
        });

        // Контейнер для текста и кнопки восстановления
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content";
        contentWrapper.innerHTML = text; // сюда входит текст с кнопкой восстановления

        msg.appendChild(contentWrapper);
        msg.appendChild(closeBtn);
        container.appendChild(msg);

        setTimeout(() => msg.classList.add('show'), 10);

        if (duration > 0) {
            setTimeout(() => {
                msg.classList.remove('show');
                msg.classList.add('hide');
                msg.addEventListener("transitionend", () => msg.remove(), { once: true });
            }, duration);
        }

        return msg;
    }

// Загрузка постов из API
function loadPosts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(posts => {
            allPosts = posts;
            applyFiltersAndSort();
        })
        .catch(err => {
            console.error("Ошибка при загрузке постов:", err);
            showMessage("Произошла ошибка при загрузке постов.", "error");
        });
}

// Отображение постов
function renderPosts(posts) {
    postsList.innerHTML = "";

    const query = searchInput.value.trim().toLowerCase();

    posts.forEach(post => {
        // Создаём регулярку по словам (например: /atomi|its/gi)
        const regex = new RegExp(
            `(${query.split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
            'gi'
        );

        // Пропускаем пост, если нет совпадения
        if (!regex.test(post.title.toLowerCase()) && !regex.test(post.body.toLowerCase())) {
            return;
        }

        // Создаём элемент поста
        const postElement = document.createElement("li");
        postElement.classList.add("post-item");

        // Заголовок поста
        const titleEl = document.createElement("div");
        titleEl.className = "post-title";
        const originalTitle = post.title;

        // Текст поста
        const bodyEl = document.createElement("div");
        bodyEl.className = "post-body";
        const originalBody = post.body;

        // Подсветка найденных слов
        if (query) {
            titleEl.innerHTML = highlightKeyword(originalTitle, query);
            bodyEl.innerHTML = highlightKeyword(originalBody, query);
        } else {
            titleEl.textContent = originalTitle;
            bodyEl.textContent = originalBody;
        }

        postElement.appendChild(titleEl);
        postElement.appendChild(bodyEl);

        // Контейнер для кнопок
        const postButtons = document.createElement("div");
        postButtons.className = "post-buttons";

        // Кнопка "Редактировать"
        const editBtn = document.createElement("button");
        editBtn.textContent = "Редактировать";
        editBtn.classList.add("edit-btn");
        editBtn.addEventListener("click", () => {
            // 1. Удаляем предыдущую кнопку "Отменить", если она была
            removeCancelButton();

            // 2. Снимаем режим редактирования со всех постов
            document.querySelectorAll("li.editing").forEach(li => li.classList.remove("editing"));

            // 3. Заполняем форму данными выбранного поста
            titleInput.value = post.title;
            bodyInput.value = post.body;
            editPostId = post.id;
            addPostBtn.textContent = "Обновить";

            // 4. Назначаем посту режим редактирования
            postElement.classList.add("editing");

            const newCancelBtn = document.createElement("button");
            newCancelBtn.textContent = "Отменить";
            newCancelBtn.classList.add("cancel-btn");
            newCancelBtn.addEventListener("click", () => {
                titleInput.value = "";
                bodyInput.value = "";
                editPostId = null;
                addPostBtn.textContent = "Сохранить";

                document.querySelectorAll("li.editing").forEach(li => li.classList.remove("editing"));
                removeCancelButton();
            });

            // Показываем кнопку отмены с анимацией
            newCancelBtn.classList.remove("appear");
            postButtons.appendChild(newCancelBtn);
            setTimeout(() => {
                newCancelBtn.classList.add("appear");
            }, 0);
        });

        // Кнопка "Удалить"
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Удалить";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
            deletePost(post.id);
        });

        // Подсветка слов при поиске
        function highlightKeyword(text, keyword) {
            const words = keyword.trim().split(/\s+/).filter(Boolean);
            if (!words.length) return text;

            const escapedWords = words.map(word =>
                word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            );

            const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        // Анимация пружинки при клике
        function addBounceEffect(button) {
            button.addEventListener("click", () => {
                button.classList.add("bouncing");
                button.addEventListener("animationend", () => button.classList.remove("bouncing"), { once: true });
            });
        }

        addBounceEffect(editBtn);

        // Удаление кнопки "Отменить"
        function removeCancelButton() {
            document.querySelectorAll(".cancel-btn").forEach(btn => {
                btn.classList.remove("appear");
                btn.classList.add("disappear");
                setTimeout(() => {
                    if (btn.parentElement) {
                        btn.remove();
                    }
                }, 300);
            });
        }

        // Добавляем кнопки
        postButtons.appendChild(editBtn);
        postButtons.appendChild(deleteBtn);

        // Добавляем контейнер кнопок в пост
        postElement.appendChild(postButtons);

        // Добавляем пост в список
        postsList.appendChild(postElement);
    });
}


// Добавление/Редактирование поста
addPostBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
        showMessage("Пожалуйста, заполните все поля.", "warning");
        return;
    }

    const method = editPostId ? "PUT" : "POST";
    const url = editPostId ? `${API_URL}/${editPostId}` : API_URL;

    fetch(url, {
        method: method,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ title, body })
    })
        .then(res => res.json())
        .then(posts => {
            showMessage(editPostId ? "Пост обновлён!" : "Пост сохранён!");
            titleInput.value = "";
            bodyInput.value = "";
            editPostId = null;
            addPostBtn.textContent = "Сохранить";
            document.querySelectorAll("li").forEach(li => li.classList.remove("editing"));
            loadPosts();
        })
        .catch(err => {
            console.error("Ошибка при сохранении поста:", err);
            showMessage("Произошла ошибка при сохранении поста.", "error");
        });
});

// Функция для удаления поста по его id
function deletePost(id) {
        // 1. Создаём полную копию удаляемого поста (для Undo)
        const deletedPost = structuredClone(
            allPosts.find(p => p.id === id) // Находим пост по id
        );

        // 2. Отправляем запрос на сервер для удаления поста
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(() => {
                // 3. После успешного удаления на сервере:
                // Ищем соответствующий <li> элемент на странице
                const li = [...postsList.children].find(el => {
                    // Ищем <li>, у которого заголовок поста совпадает с удаляемым
                    return el.querySelector(".post-title")?.textContent === deletedPost.title;
                });

                if (li) {
                    // 4. Если нашли элемент на странице:

                    // Добавляем ему класс "fade-out" для запуска CSS-анимации исчезновения
                    li.classList.add("fade-out");

                    li.addEventListener("animationend", () => {
                        li.remove();
                    }, { once: true });
                }

                // 5. Показываем сообщение "Пост удалён" с кнопкой Undo
                showUndoDeleteMessage(deletedPost);

                // ⚡ ВАЖНО:
                // Мы НЕ обновляем весь список постов через loadPosts(),
                // иначе исчезновение будет мгновенным и анимация не будет работать!
            })
            .catch((err) => {
                console.log("Ошибка при удалении поста:", err);
                showMessage("Ошибка при удалении поста.", "error");
            });
    }


// Функция отображения сообщения с кнопкой "Отменить" для восстановления удалённого поста
function showUndoDeleteMessage(post) {
    // Уникальный ID для сообщения, чтобы можно было потом его убрать
    const messageId = 'msg-' + Date.now();

    // Показываем сообщение с кнопкой "Отменить"
    const message = showMessage(
        `Пост "${post.title}" удалён. <button class="undo-btn">Отменить</button>`,
        "info",       // Тип сообщения: информационное
        5000,         // Время показа сообщения: 5 секунд
        messageId     // Уникальный ID для сообщения
    );

    // Ищем кнопку "Отменить" внутри этого сообщения
    const undoBtn = message.querySelector(".undo-btn");

    // Если кнопка найдена — вешаем обработчик на клик
    undoBtn?.addEventListener("click", () => {
        // При клике восстанавливаем пост
        restoreDeletedPost(post, messageId);
    });
    }


// Функция для восстановления удалённого поста
function restoreDeletedPost(post, messageId) {
    // Отправляем POST-запрос на сервер для добавления поста заново
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(post) // Преобразуем пост в JSON
    })
        .then(() => {
            // Удаляем сообщение с кнопкой "Отменить"
            document.getElementById(messageId)?.remove();
            // Показываем сообщение об успешном восстановлении
            showMessage("Удаление отменено. Пост восстановлен.");
            loadPosts();
        })
        .catch(() => {
            showMessage("Ошибка при восстановлении поста.", "error");
        });
    }

// Универсальная функция для сортировки и фильтрации
function applyFiltersAndSort() {
    const query = searchInput.value.toLowerCase().split(/\s+/);
    let filtered = allPosts.filter(post => 
        query.every(word => 
            post.title.toLowerCase().includes(word) ||
            post.body.toLowerCase().includes(word)
        )
    );

    const sortType = sortSelect.value;

    switch(sortType) {
        case "az":
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "za":
            filtered.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "titleLength":
            filtered.sort((a, b) => a.title.length - b.title.length);
            break;
    }

    renderPosts(filtered);
}

// Сохранение данных по сортировке (при загрузке страницы)
document.addEventListener("DOMContentLoaded", () => {
    const savedSortOrder = localStorage.getItem("sortOrder");
    if (savedSortOrder) {
        sortSelect.value = savedSortOrder;
    }
    applyFiltersAndSort(); // всегда вызываем чтобы отрисовывать посты
});

// При изменении сортировки
sortSelect.addEventListener("change", (e) => {
    const selectedOrder = e.target.value;
    localStorage.setItem("sortOrder", selectedOrder);
    applyFiltersAndSort(); // перерисовываем 
});

// Очистка поля поиска по клику на крестик
document.getElementById('clearSearch').addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    input.value = '';
    input.dispatchEvent(new Event('input')); // чтобы сработал фильтр
});

searchInput.addEventListener("input", () => {
    localStorage.setItem("searchQuery", searchInput.value);
    applyFiltersAndSort();
});

document.addEventListener("DOMContentLoaded", () => {
    const savedQuery = localStorage.getItem("searchQuery");
    if (savedQuery !== null) {
        searchInput.value = savedQuery;
    }
});

// Загрузка постов при инициализации
searchInput.addEventListener("input", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);

// Слушатели событий для поиска и сортировки
loadPosts();