document.addEventListener('DOMContentLoaded', function () {
  emailjs.init('service_nwk3zar');

  const accessories = [
    'Accessory 1',
    'Accessory 2',
    'Accessory 3',
    'Accessory 4',
    'Accessory 5',
    'Accessory 6',
    'Accessory 7',
    'Accessory 8',
    'Accessory 9',
    'Accessory 10',
  ];

  const orderList = document.getElementById('orderList');
  const confirmButton = document.getElementById('confirmButton');
  const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
  const orderSummary = document.getElementById('orderSummary');
  const sendOrderButton = document.getElementById('sendOrderButton');

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
      to_name: 'Prop Storage',
      message: Array.from(selectedItems).join(', '),
    };

    emailjs.send('service_nwk3zar', 'service_nwk3zar', emailParams).then(
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
