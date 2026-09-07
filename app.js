const button = document.querySelector("#demo-button");

if (button) {
  button.addEventListener("click", () => {
    const oldText = button.textContent;

    button.textContent = "ТИ НАТИСНУЛА МЕНЕ! ❤";

    setTimeout(() => {
      button.textContent = oldText;
    }, 1000);
  });
}