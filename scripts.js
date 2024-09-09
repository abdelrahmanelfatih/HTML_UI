let attachedFile = null;
let tg;

window.addEventListener('load', function() {
    tg = window.Telegram.WebApp;
    tg.ready();

    // Set up the main button
    tg.MainButton.setText('Create Invoice');
    tg.MainButton.onClick(handleFormSubmit);
    tg.MainButton.show();
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
        <span class="price" contenteditable="true" data-placeholder="Price" oninput="updateTotal()"></span>
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
}

function handleFormSubmit() {
    // Clear previous error messages
    document.getElementById('error-messages').innerHTML = '';
    document.getElementById('error-messages').style.display = 'none';

    let chatId;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        chatId = tg.initDataUnsafe.user.id;
    } else {
        console.warn('Telegram WebApp data is not available. Using a placeholder chat ID for testing.');
        chatId = 'TEST_USER_' + Date.now();
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
        const errorDiv = document.getElementById('error-messages');
        errorDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
        errorDiv.style.display = 'block';
        return;
    }

    const jsonData = {
        chatId: chatId,
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

    console.log('Sending data:', jsonData);

    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '4px';
    progressBar.style.backgroundColor = '#3390ec';
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.transition = 'width 0.3s ease-out';
    document.body.appendChild(progressBar);

    tg.MainButton.setParams({
        text: 'Creating Invoice...',
        is_active: false,
        color: '#65c36d'
    });

    fetch('https://e59c-2001-16a2-7180-7900-d116-aed0-2578-a2f9.ngrok-free.app/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        progressBar.style.width = '50%';
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        progressBar.style.width = '100%';
        console.log('Success:', data);
        tg.close();
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('error-messages').innerHTML = '<p>Error in creating invoice. Please try again later.</p>';
        document.getElementById('error-messages').style.display = 'block';
    })
    .finally(() => {
        setTimeout(() => {
            document.body.removeChild(progressBar);
        }, 300);

        tg.MainButton.setParams({
            text: 'Create Invoice',
            is_active: true,
            color: '#2cab37'
        });
    });
}

// Remove the existing button from HTML and its event listener
document.querySelector('.create-btn').remove();
