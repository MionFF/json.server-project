"use strict";

const inputField = document.getElementById("inputField");
const greetBtn = document.getElementById("greetBtn");
const clearBtn = document.getElementById("clearBtn");

function clearInput() {
    inputField.value = "";
}

greetBtn.addEventListener("click", () => {
    let name = inputField.value.trim();
    if (!name.length) {
        alert(`Имя не может быть пустым!`);
        return;
    } else {
        console.log(`Hello, ${name}!`);
        alert(`Hello, ${name}!`);
        clearInput();
    }
});

clearBtn.addEventListener("click", clearInput);