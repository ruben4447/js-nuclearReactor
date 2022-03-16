const socket = io();

const token = Array.from(new URLSearchParams(location.search.substring(1)))?.[0]?.[0];
socket.emit('auth', { token, loc: 1 }); // Tell server who and where we are

initSound();

var data;

socket.on('auth', data_ => {
  if (data_ === false) {
    location.href = '/logout/' + token;
  }
});
socket.on('data', data_ => {
  data = data_;
  if (data.update) main();
});
socket.on("alert", ({ title, txt }) => displayMessage(title, txt));

let init = true;
function main() {
  console.log(data);
  data.constants.name_regex = new RegExp(data.constants.name_regex, "g");

  document.querySelectorAll(".username").forEach(el => el.innerText = data.username);
  document.getElementById("total-money").innerText = data.user.money.toLocaleString("en-GB");
  document.getElementById("reactor-count").innerText = Object.keys(data.user.reactors).length.toLocaleString("en-GB");
  document.getElementById("link-user-homepage").setAttribute("href", "/user.html?" + data.token);
  document.getElementById("logout").setAttribute("href", "/logout/" + data.token);
  if (init) {
    document.getElementById("link-new-reactor").addEventListener('click', () => {
      if (confirm(`Comission a new reactor for £${data.user.reactor_commission_price.toLocaleString("en-GB")}?`)) {
        if (data.user.money >= data.user.reactor_commission_price) {
          const name = prompt(`Enter reactor name`);
          if (name === null) return;
          socket.emit(`comission`, { name });
        } else {
          displayMessage("Insufficient funds!", `It costs £${data.user.reactor_commission_price.toLocaleString("en-GB")} to comission a new reactor.`);
        }
      }
    });
    document.getElementById("link-delete-account").addEventListener('click', () => {
      if (confirm(`Delete account?`)) {
        location.href = '/delete/' + data.token;
      }
    });
    document.getElementById("link-reset-account").addEventListener('click', () => {
      if (confirm(`Reset account progress?`)) {
        location.href = '/reset/' + data.token;
      }
    });
  }

  // Populate reactor table
  const tbody = document.getElementById("reactor-tbody");
  tbody.innerHTML = "";
  for (let name in data.user.reactors) {
    let tr = document.createElement("tr"), td, meltedDown = data.user.reactors[name].meltedDown;
    tbody.appendChild(tr);
    tr.insertAdjacentHTML("beforeend", `<td>${name}</td>`);

    td = document.createElement("td");
    link = document.createElement(meltedDown ? "em" : "a");
    td.appendChild(link);
    tr.appendChild(td);
    if (meltedDown) {
      link.href = "javascript:void(0)";
      link.innerText = "Melted Down";
    } else {
      link.innerText = "Controls";
      link.href = `/view.html?${data.token}&reactor=${name}`;
    }

    td = document.createElement("td");
    link = document.createElement("a");
    td.appendChild(link);
    link.href = "javascript:void(0);";
    link.innerText = "Decomission";
    link.addEventListener("click", () => {
      if (confirm(`Decomission reactor ${name} for £${data.user.reactor_decommission_price.toLocaleString("en-GB")}? This action cannot be undone!`)) {
        if (data.user.money >= data.user.reactor_decommission_price) {
          socket.emit("decomission", { name });
        } else {
          display(`Insufficient funds!`, `It costs £${data.user.reactor_decommission_price.toLocaleString("en-GB")} to decomission a reactor.`);
        }
      }
    });
    tr.appendChild(td);
  }

  init = false;
}