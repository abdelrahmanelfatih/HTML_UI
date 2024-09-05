document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.querySelector('.add-button');
  const box = document.querySelector('.box');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const currencySelect = document.getElementById('currency');
  const totalSpan = document.getElementById('total');
  const fileInput = document.getElementById('fileAttachment');
  const filePreview = document.getElementById('filePreview');

  const handleFormSubmit = async () => {
      let isValid = true;

      // Clear previous error messages
      document.querySelectorAll('.error-message').forEach(e => e.textContent = '');

      // Validate title
      if (titleInput.value.trim() === '') {
          document.getElementById('title-error').textContent = 'Title cannot be empty';
          isValid = false;
      }

      // Validate items
      const items = Array.from(box.querySelectorAll('.item')).map(item => {
          const quantityElem = item.querySelector('.quantity-number');
          const quantity = quantityElem.textContent.trim();
          const title = item.querySelector('.title').textContent.trim();
          const price = item.querySelector('.price').textContent.trim();

          let itemValid = true;

          if (quantity === '' || isNaN(quantity) || Number(quantity) <= 0) {
              item.querySelector('.quantity-error').textContent = 'Quantity must be a positive number';
              itemValid = false;
              isValid = false;
          }

          if (title === '') {
              item.querySelector('.title-error').textContent = 'Item title cannot be empty';
              itemValid = false;
              isValid = false;
          }

          if (price === '' || isNaN(price)) {
              item.querySelector('.price-error').textContent = 'Price must be a valid number';
              itemValid = false;
              isValid = false;
          }

          if (itemValid) {
              return { quantity, title, price };
          }

          return null;
      }).filter(item => item !== null);

      if (items.length === 0) {
          document.querySelectorAll('.item').forEach(item => {
              if (!item.querySelector('.quantity-error').textContent &&
                  !item.querySelector('.title-error').textContent &&
                  !item.querySelector('.price-error').textContent) {
                  item.querySelector('.quantity-error').textContent = 'At least one valid item is required';
              }
          });
          isValid = false;
      }

      if (!isValid) return;

      // Collect data
      const invoiceData = {
          title: titleInput.value,
          description: descriptionInput.value,
          currency: currencySelect.value,
          items: items,
          total: totalSpan.textContent,
          userId: 'yourUserId' // Replace 'yourUserId' with actual user ID
      };

      // Send data with fetch
      try {
          const response = await fetch('https://your-backend-endpoint.com/api/invoices', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(invoiceData),
          });

          if (response.ok) {
              console.log('Invoice successfully created');
              // Handle successful response here
          } else {
              console.error('Failed to create invoice');
              // Handle error response here
          }
      } catch (error) {
          console.error('Error:', error);
      }
  };

  document.querySelector('.create-btn').addEventListener('click', handleFormSubmit);

  addButton.addEventListener('click', function() {
      const itemBox = document.createElement('div');
      itemBox.className = 'item';

      itemBox.innerHTML = `
          <span class="quantity">
              <span class="quantity-number" contenteditable="true">1</span>x
          </span>
          <span class="title" contenteditable="true" data-placeholder="Title"></span>
          <span class="price" contenteditable="true" data-placeholder="1.00"></span>
          <button class="delete-button">x</button>
          <div class="error-message quantity-error"></div>
          <div class="error-message title-error"></div>
          <div class="error-message price-error"></div>
      `;

      // Insert the new item above the add button
      box.insertBefore(itemBox, addButton);
  });

  box.addEventListener('click', function(event) {
      if (event.target.classList.contains('delete-button') && box.querySelectorAll('.item').length > 1) {
          event.target.parentElement.remove();
      }
  });
});

function handleFileAttachment() {
  document.getElementById('fileAttachment').click();
}

function handleFilePreview(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          const preview = document.getElementById('filePreview');
          preview.innerHTML = ''; // Clear previous preview
          preview.appendChild(img);
      };
      reader.readAsDataURL(file);
  }
}

function handleCancel() {
  console.log('Cancel button clicked. Closing the tab.');
  window.close();
}
