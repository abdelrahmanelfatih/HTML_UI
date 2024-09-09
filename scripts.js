let attachedFile = null;
let tg;

window.addEventListener('load', function() {
    tg = window.Telegram.WebApp;
    tg.ready();
});

function handleCancel() {
    if (tg && tg.close) {
        tg.close();
    } else {
        console.log('Telegram WebApp is not available. Closing action simulated.');
        // You could redirect to another page or show a message here
    }
}

function handleFileAttachment() {
    document.getElementById('fileAttachment').click();
}

function handleFilePreview(event) {
    const file = event.target.files[0];
    if (file) {
        attachedFile = file;
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('filePreview');
            preview.innerHTML = '<img src="' + e.target.result + '" alt="File Preview">';
        }
        reader.readAsDataURL(file);
    }
}

function addItem() {
    const box = document.querySelector('.box');
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
        <span class="quantity">
            <span class="quantity-number" contenteditable="true" data-placeholder="Qty" oninput="updateTotal()"></span>x
        </span>
        <span class="title" contenteditable="true" data-placeholder="Item name"></span>
        <span class="price" contenteditable="true" data-placeholder="Price" oninput="validatePrice(this); updateTotal()"></span>
        <button class="delete-button" onclick="removeItem(event)">x</button>
    `;
    box.appendChild(item);
    updateTotal();
}

function removeItem(event) {
    const item = event.target.closest('.item');
    if (document.querySelectorAll('.item').length > 1) {
        item.remove();
        updateTotal();
    } else {
        document.getElementById('item-errors').textContent = "At least one item must be present.";
    }
}

function validatePrice(element) {
    element.textContent = element.textContent.replace(/[^0-9.]/g, '');
    if (element.textContent.split('.').length > 2) {
        element.textContent = element.textContent.replace(/\.+$/, '');
    }
}

function updateTotal() {
    const items = document.querySelectorAll('.item');
    let total = 0;
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.quantity-number').textContent) || 0;
        const price = parseFloat(item.querySelector('.price').textContent) || 0;
        total += quantity * price;
    });
    document.getElementById('total-amount').textContent = total.toFixed(2);

    let isValid = true;

    if (!title) {
        document.getElementById('title-error').textContent = "Title cannot be empty";
        isValid = false;
    } else {
        document.getElementById('title-error').textContent = "";
    }

    items.forEach(item => {
        const quantity = item.querySelector('.quantity-number').textContent.trim();
        const title = item.querySelector('.title').textContent.trim();
        const price = item.querySelector('.price').textContent.trim();

        if (!title || !quantity || !price || isNaN(price)) {
            document.getElementById('item-errors').textContent = "Item fields cannot be empty and price must be valid.";
            isValid = false;
        }
    });

    if (isValid) {
        // Handle the data submission
        console.log("Form Submitted");
    }
}

function handleFormSubmit() {
    let chatId;
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        chatId = tg.initDataUnsafe.user.id;
    } else {
        console.warn('Telegram WebApp data is not available. Using a placeholder chat ID for testing.');
        chatId = 'TEST_USER_' + Date.now(); // Generate a unique test user ID
    }

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const currency = document.getElementById('currency').value;
    const items = Array.from(document.querySelectorAll('.item')).map(item => ({
        quantity: parseFloat(item.querySelector('.quantity-number').textContent) || 0,
        title: item.querySelector('.title').textContent.trim(),
        price: parseFloat(item.querySelector('.price').textContent) || 0
    }));
    const total = parseFloat(document.getElementById('total-amount').textContent);
    const requireName = document.getElementById('require-name').checked;
    const requireEmail = document.getElementById('require-email').checked;
    const requirePhone = document.getElementById('require-phone').checked;
    const protectContent = document.getElementById('protect-content').checked;

    // Validate required fields
    let errors = [];
    if (!title) errors.push("Title is required");
    if (items.length === 0) errors.push("At least one item is required");
    if (items.some(item => !item.title || item.quantity <= 0 || item.price <= 0)) {
        errors.push("All items must have a title, quantity, and price");
    }

    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        const errorDiv = document.getElementById('error-messages');
        errorDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
        errorDiv.style.display = 'block';
        return;
    }

    // Clear any previous error messages
    document.getElementById('error-messages').style.display = 'none';

    // Create a JSON object
    const jsonData = {
        chatId: chatId, // Changed from chat_id to chatId
        title: title,
        description: description,
        currency: currency,
        items: items,
        total: total,
        require_name: requireName,
        require_email: requireEmail,
        require_phone: requirePhone,
        protect_content: protectContent
    };

    // Log the data being sent
    console.log('Sending data:', jsonData);

    // Show loading indicator
    const createBtn = document.querySelector('.create-btn');
    createBtn.textContent = 'Creating...';
    createBtn.disabled = true;

    fetch('https://df04-2001-16a2-7180-7900-d116-aed0-2578-a2f9.ngrok-free.app/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Invoice created successfully!');
        if (tg && tg.close) {
            tg.close();
        } else {
            console.log('Telegram WebApp close function not available. Action simulated.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to create invoice. Please try again.\nError: ' + (error.detail || error.message));
    })
    .finally(() => {
        createBtn.textContent = 'Create Invoice';
        createBtn.disabled = false;
    });
}
