document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded');

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

                document.getElementById('importantEndBands').textContent = record['End Bands'];
                document.getElementById('importantStropper').textContent = record['Straps'];
                document.getElementById('importantPall').textContent = record['Rolls/Pack'];
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

  document.getElementById('homeIcon').addEventListener('click', function () {
    const sideNav = document.getElementById('sideNav');
    sideNav.style.width = '250px';
    sideNav.classList.add('open');
  });

  document.addEventListener('click', function (event) {
    const sideNav = document.getElementById('sideNav');
    if (
      sideNav.style.width === '250px' &&
      !sideNav.contains(event.target) &&
      !document.getElementById('homeIcon').contains(event.target)
    ) {
      sideNav.style.width = '0';
      sideNav.classList.remove('open');
    }
  });
});
