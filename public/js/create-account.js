const socket = io();

socket.on("alert", ({ title, txt }) => displayMessage(title, txt));

initSound();

function main() {
  const input_username = document.getElementById("username");
  const input_password = document.getElementById("input");

  const btn = document.getElementById("create-account");
  btn.addEventListener("click", () => {
    const username = input_username.value.trim();
    const password = input_password.value.trim();
    console.log({ username, password })
    socket.emit("create-account", { username, password });
  });
  document.body.addEventListener("keydown", e => {
    if (e.key === "Enter") btn.click();
  });

  socket.on("creation-failed", () => {
    displayMessage("Account Creation Failed", `Username ${input_username.value.trim()} already exists`);
    input_username.value = "";
    input_password.value = "";
  });

  socket.on("account-created", username => {
    location.href = "/login.html?username=" + username;
  });
}

window.addEventListener("load", main);