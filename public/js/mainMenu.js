const socket = io();

const token = Array.from(new URLSearchParams(location.search.substring(1)))?.[0]?.[0];
socket.emit('auth', { token, loc: 1 }); // Tell server who and where we are

socket.on('auth', data => {
  if (data === false) {
    location.href = '/logout/' + token;
  } else {
    main(data);
  }
});

function main(data) {

}