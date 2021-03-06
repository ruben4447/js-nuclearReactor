window.addEventListener('load', () => {
  const params = new URLSearchParams(location.search.substring(1));
  params.forEach((value, key) => {
    if (key === 'incorrect') {
      alert('Invalid Username or Passcode');
    } else if (key === 'username') {
      document.getElementById("username").value = decodeURIComponent(value);
    } else if (key === 'unauth') {
      alert('Unauthorised Access.');
    } else if (key === 'logout') {
      alert('Logged out successfully.');
    }
  });
});