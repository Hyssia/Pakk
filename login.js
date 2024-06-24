document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById('loginButton');
  const passwordInput = document.getElementById('passwordInput');
  const loginContainer = document.getElementById('loginContainer');

  // Function to set a cookie
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
  }

  // Function to get a cookie
  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Function to check if the user is already logged in
  function checkLogin() {
    if (getCookie('loggedIn') === 'true' && window.location.pathname.endsWith('index.html')) {
      window.location.href = 'launchpad.html';
    } else {
      loginContainer.style.display = 'block';
    }
  }

  function handleLogin() {
    const password = passwordInput.value;
    if (password === 'Ranheim') {
      setCookie('loggedIn', 'true', 1); // Expires in 1 day
      window.location.href = 'launchpad.html';
    } else {
      alert('Incorrect password');
    }
  }

  checkLogin();

  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }

  if (passwordInput) {
    passwordInput.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        handleLogin();
      }
    });
  }
});
