document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById('loginButton');
  const passwordInput = document.getElementById('passwordInput');
  const loginContainer = document.getElementById('loginContainer');
  const mainContainer = document.getElementById('mainContainer');
  const navContainer = document.getElementById('navContainer');
  const feature1Container = document.getElementById('feature1Container');
  const feature2Container = document.getElementById('feature2Container');
  const navLinks = document.querySelectorAll('.nav-link');

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
    if (getCookie('loggedIn') === 'true') {
      loginContainer.style.display = 'none';
      mainContainer.style.display = 'block';
      navContainer.style.display = 'block';
    } else {
      loginContainer.style.display = 'block';
      navContainer.style.display = 'none';
      mainContainer.style.display = 'none';
    }
  }

  //   if (loginButton) {
  //     loginButton.addEventListener('click', function () {
  //       const password = passwordInput.value;
  //       if (password === 'Ranheim') {
  //         setCookie('loggedIn', 'true', 1); // Expires in 1 day
  //         loginContainer.style.display = 'none';
  //         mainContainer.style.display = 'block';
  //         navContainer.style.display = 'block';
  //       } else {
  //         alert('Incorrect password');
  //       }
  //     });
  //   }

  function handleLogin() {
    const password = passwordInput.value;
    if (password === 'Ranheim') {
      setCookie('loggedIn', 'true', 1); // Expires in 1 day
      loginContainer.style.display = 'none';
      mainContainer.style.display = 'block';
      navContainer.style.display = 'block';
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

  navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const target = link.getAttribute('data-target');
      document.querySelectorAll('.container').forEach(container => {
        if (container.id === target) {
          container.style.display = 'block';
        } else {
          container.style.display = 'none';
        }
      });
    });
  });

  const codeInput = document.getElementById('codeInput');
  if (codeInput) {
    codeInput.addEventListener('input', function () {
      const code = codeInput.value;
      console.log('Code input: ', code);
      if (code.length === 5) {
        console.log('Fetching data for code: ', code);
        fetch('data.json')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log('Data fetched: ', data);
            if (Array.isArray(data)) {
              const record = data.find(item => item.Values === code);
              if (record) {
                console.log('Record found: ', record);
                document.getElementById('description').textContent = record['Description (30tegn)'];
                document.getElementById('kolonne').textContent = record['Kolonne2'];
                document.getElementById('innerHeads').textContent = record['Inner heads'];
                document.getElementById('outerHeads').textContent = record['Outer heads'];
                document.getElementById('centerBands').textContent = record['Center Bands'];
                document.getElementById('endBands').textContent = record['End Bands'];
                document.getElementById('wraps').textContent = record['of Wraps'];
                document.getElementById('straps').textContent = record['Straps'];
                document.getElementById('wrapBW').textContent = record['Wrap BW'];
                document.getElementById('headsBW').textContent = record['Heads BW'];
                document.getElementById('innerHeadsBW').textContent = record['Inner heads BW'];
                document.getElementById('outerHeadsBW').textContent = record['Outer Heads BW'];
                document.getElementById('rollsPerPack').textContent = record['Rolls/Pack'];
                document.getElementById('labels').textContent = record['Of labels'];
              } else {
                console.log('No matching record found');
                document.getElementById('description').textContent = '';
                document.getElementById('innerHeads').textContent = '';
                document.getElementById('outerHeads').textContent = '';
                document.getElementById('centerBands').textContent = '';
                document.getElementById('endBands').textContent = '';
                document.getElementById('wraps').textContent = '';
                document.getElementById('straps').textContent = '';
                document.getElementById('wrapBW').textContent = '';
                document.getElementById('headsBW').textContent = '';
                document.getElementById('innerHeadsBW').textContent = '';
                document.getElementById('outerHeadsBW').textContent = '';
                document.getElementById('rollsPerPack').textContent = '';
                document.getElementById('labels').textContent = '';
              }
            } else {
              console.error('Data is not an array', data);
            }
          })
          .catch(error => {
            console.error('Fetch error: ', error);
          });
      }
    });
  }
});
