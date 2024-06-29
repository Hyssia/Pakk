document.addEventListener('DOMContentLoaded', function () {
  emailjs.init('kTxbCZwkJn02xTAyI');

  const accessories = [
    'Dobbeltsidig teip gul',
    'Brunteip',
    'Glassfiberteip',
    'Rød Trialteip',
    'Blank teip til rondeller',
    'Teipdispenser til glassfiberteip',
    'Teip til IBS',
    'Små etiketter',
    'Karbonbånd',
    'Knivblad; Små',
    'Knivblad; Store',
    'Stifter til stiftepistol',
    'Ploger',
    'Kiler; Små',
    'Kiler; Store',
    'Rød spraymaling',
    'Arbeidshansker; Str. 8',
    'Arbeidshansker; Str. 10',
    'Arbeidshansker; Str. 11',
    'Tykkhansker',
    'Fargestifter',
    'Plastsekker',
    'Papirsekker',
    'IBS-bånd',
    'Målbånd; 5m',
    'Kritt(hvitt)',
    'Overkniver til RM',
    'Støvmasker',
    'Snortau',
    'Filterkaffe',
    'Pulverkaffe',
    'Kakao',
    'Kaffefilter',
    'Rens til kaffetrakter',
    'Kniver',
    'Gafler',
    'Skjeer',
    'Kopper',
    'Papptallerkener',
    'Såpe; Blå',
    'Såpe; Grov',
    'Zalo',
    'Tørkepapir (rull)',
  ];

  const orderList = document.getElementById('orderList');
  const confirmButton = document.getElementById('confirmButton');
  const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
  const orderSummary = document.getElementById('orderSummary');
  const sendOrderButton = document.getElementById('sendOrderButton');

  const addCustomOrderButton = document.getElementById('addCustomOrderButton');
  const customOrderInput = document.getElementById('customOrderInput');
  const annetButton = document.getElementById('annetButton');
  const customOrderModal = new bootstrap.Modal(document.getElementById('customOrderModal'));

  let selectedItems = new Set();

  accessories.forEach(accessory => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'col-6 order-item';
    itemDiv.textContent = accessory;
    itemDiv.addEventListener('click', function () {
      if (selectedItems.has(accessory)) {
        selectedItems.delete(accessory);
        itemDiv.classList.remove('selected');
      } else {
        selectedItems.add(accessory);
        itemDiv.classList.add('selected');
      }
    });
    orderList.appendChild(itemDiv);
  });

  annetButton.addEventListener('click', function () {
    customOrderModal.show();
  });

  addCustomOrderButton.addEventListener('click', function () {
    const customOrder = customOrderInput.value.trim();
    if (customOrder) {
      selectedItems.add(customOrder);
      customOrderInput.value = '';
      customOrderModal.hide();
    }
  });

  confirmButton.addEventListener('click', function () {
    orderSummary.innerHTML = '';
    selectedItems.forEach(item => {
      const listItem = document.createElement('p');
      listItem.textContent = item;
      orderSummary.appendChild(listItem);
    });
    orderModal.show();
  });

  sendOrderButton.addEventListener('click', function () {
    const emailParams = {
      to_name: 'Rekvisitt',
      message: Array.from(selectedItems).join(', '),
    };

    emailjs.send('service_nwk3zar', 'template_ufu8u4p', emailParams).then(
      function (response) {
        console.log('SUCCESS!', response.status, response.text);
        alert('Order sent successfully!');
        selectedItems.clear();
        document.querySelectorAll('.order-item.selected').forEach(item => item.classList.remove('selected'));
        orderModal.hide();
      },
      function (error) {
        console.error('FAILED...', error);
        alert('Failed to send order. Please try again.');
      }
    );
  });
});
