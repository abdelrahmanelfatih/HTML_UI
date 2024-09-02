let items = [];

function addItem() {
    const itemIndex = items.length;

    const itemHTML = `
        <div class="item">
            <div class="form-group">
                <label for="title-${itemIndex}">Title</label>
                <input type="text" id="title-${itemIndex}" placeholder="Item title">
            </div>
            <div class="form-group">
                <label for="quantity-${itemIndex}">Quantity</label>
                <input type="number" id="quantity-${itemIndex}" placeholder="Quantity" value="1" min="1" onchange="calculateTotal()">
            </div>
            <div class="form-group">
                <label for="price-${itemIndex}">Price</label>
                <input type="number" id="price-${itemIndex}" placeholder="Price" value="0" min="0" step="0.01" onchange="calculateTotal()">
            </div>
        </div>
    `;

    document.getElementById('items-container').insertAdjacentHTML('beforeend', itemHTML);

    items.push({ title: '', quantity: 1, price: 0 });
    calculateTotal();
}

function calculateTotal() {
    let total = 0;

    items.forEach((item, index) => {
        const quantity = parseFloat(document.getElementById(`quantity-${index}`).value) || 0;
        const price = parseFloat(document.getElementById(`price-${index}`).value) || 0;

        item.quantity = quantity;
        item.price = price;

        total += quantity * price;
    });

    document.getElementById('total').textContent = total.toFixed(2);
}

function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}

function createInvoice() {
    // Clear previous error messages
    displayError('');

    items = items.map((item, index) => ({
        title: document.getElementById(`title-${index}`).value,
        quantity: parseFloat(document.getElementById(`quantity-${index}`).value) || 0,
        price: parseFloat(document.getElementById(`price-${index}`).value) || 0
    }));

    const data = {
        items: items,
        total: items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2),
        currency: document.getElementById('currency').value,
        requireName: document.getElementById('requireName').checked,
        requireEmail: document.getElementById('requireEmail').checked,
        requirePhone: document.getElementById('requirePhone').checked,
        protectContent: document.getElementById('protectContent').checked,
        chatId: Telegram.WebApp.initDataUnsafe.user.id  // Adding chat ID to the data
    };

    fetch('https://c98e-2001-16a2-71a5-8900-81cb-9237-4471-6dcf.ngrok-free.app/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || 'Unknown error occurred');
            });
        }
        return response.json();
    })
    .then(data => {
        alert(`Invoice created successfully. Total: $${data.total}`);
    })
    .catch((error) => {
        // Check error message for specific known issues and display appropriate messages
        if (error.message.includes("non-empty title")) {
            displayError("Error: Item titles cannot be empty. Please provide a title for each item.");
        } else if (error.message.includes("total amount does not match")) {
            displayError("Error: The total amount does not match the sum of item prices. Please check the prices and quantities.");
        } else {
            displayError(`Error: ${error.message}`);
        }
    });
}
