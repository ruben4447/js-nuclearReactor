const socket = io();

const token = Array.from(new URLSearchParams(location.search.substring(1)))?.[0]?.[0];
socket.emit('auth', { token, loc: 1 }); // Tell server who and where we are

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
socket.on("alert", txt => alert(txt));

let init = true;
function main() {
  console.log(data);
  data.constants.name_regex = new RegExp(data.constants.name_regex, "g");

  document.querySelectorAll(".username").forEach(el => el.innerText = data.username);
  document.getElementById("total-money").innerText = data.user.money.toLocaleString("en-GB");
  document.getElementById("reactor-count").innerText = Object.keys(data.user.reactors).length.toLocaleString("en-GB");
  document.getElementById("link-user-homepage").setAttribute("href", "/user.html?" + data.token);
  if (init) {
    document.getElementById("link-new-reactor").addEventListener('click', () => {
      if (confirm(`Comission a new reactor for £${data.user.reactor_commission_price.toLocaleString("en-GB")}?`)) {
        if (data.user.money >= data.user.reactor_commission_price) {
          const name = prompt(`Enter reactor name`);
          if (name === null) return;
          socket.emit(`comission`, { name });
        } else {
          alert(`Insufficient funds!\nIt costs £${data.user.reactor_commission_price.toLocaleString("en-GB")} to comission a new reactor.`);
        }
      }
    });
  }

  // Populate reactor table
  const tbody = document.getElementById("reactor-tbody");
  tbody.innerHTML = "";
  for (let name in data.user.reactors) {
    const tr = document.createElement("tr");
    tbody.appendChild(tr);
    tr.insertAdjacentHTML("beforeend", `<td>${name}</td>`);
    tr.insertAdjacentHTML("beforeend", `<td><a href='/view.html?${data.token}&reactor=${name}'>Controls</a></td>`);

    let td = document.createElement("td");
    let link = document.createElement("a");
    td.appendChild(link);
    link.href = "javascript:void(0);";
    link.innerText = "Decomission";
    link.addEventListener("click", () => {
      if (confirm(`Decomission reactor ${name} for £${data.user.reactor_decommission_price.toLocaleString("en-GB")}? This action cannot be undone!`)) {
        if (data.user.money >= data.user.reactor_decommission_price) {
          socket.emit("decomission", { name });
        } else {
          alert(`Insufficient funds!\nIt costs £${data.user.reactor_decommission_price.toLocaleString("en-GB")} to decomission a reactor.`);
        }
      }
    });
    tr.appendChild(td);
  }

  init = false;
}