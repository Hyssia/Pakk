document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById('loginButton');
  const passwordInput = document.getElementById('passwordInput');
  const loginContainer = document.getElementById('loginContainer');

  function handleLogin() {
    const password = passwordInput.value;
    if (password === 'Ranheim') {
      window.location.href = 'launchpad.html';
    } else {
      alert('Incorrect password');
    }
  }

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
