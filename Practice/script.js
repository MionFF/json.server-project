"use strict";

const inputField = document.getElementById("inputField");
const greetBtn = document.getElementById("greetBtn");
const clearBtn = document.getElementById("clearBtn");
const dateBtn = document.getElementById("dateBtn");

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

dateBtn.addEventListener("click", () => {
    const now = new Date().toLocaleDateString();
    console.log(`Today's date: ${now}`);
    alert(`Today's date: ${now}`);
});


function multiply(a, b) {
    return a * b;
}

console.log(multiply(6, 10));