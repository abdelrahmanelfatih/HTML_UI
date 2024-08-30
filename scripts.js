let items = [];
let total = 0.00;

async function addTitle() {
    const titleInput = document.getElementById('title');
    const title = titleInput.value.trim();

    if (title && !items.some(item => item.name === title)) {
        items.push({ name: title, quantity: 1, price: 0 });
        titleInput.value = '';
        renderItems();
    }
}

function handleItemDetailChange(index, field, value) {
    items[index][field] = field === 'price' ? parseFloat(value) : parseInt(value);
    calculateTotal();
    renderItems();
}

function calculateTotal() {
    total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    document.getElementById('total').textContent = `Total: ${total.toFixed(2)}`;
}

function renderItems() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';

    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name}</span>
            <input type="number" min="0" value="${item.quantity}" oninput="handleItemDetailChange(${index}, 'quantity', this.value)">
            <input type="number" step="0.01" min="0" value="${item.price}" oninput="handleItemDetailChange(${index}, 'price', this.value)">
            <span>${(item.quantity * item.price).toFixed(2)}</span>
        `;
        itemList.appendChild(li);
    });
}

// Function to send invoice data to the backend
async function sendInvoiceData(invoiceData) {
    try {
        const response = await fetch('https://66c9-2001-16a2-6f02-ed00-79a0-bbc6-4627-306e.ngrok-free.app', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Server response:', result);
        alert('Invoice successfully sent to Telegram!');
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert('Failed to send invoice. Please check the console for details.');
    }
}

document.getElementById('invoice-form').onsubmit = function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const currency = document.getElementById('currency').value;
    const settings = {
        requireName: document.getElementById('require-name').checked,
        requireEmail: document.getElementById('require-email').checked,
        requirePhone: document.getElementById('require-phone').checked,
        protectContent: document.getElementById('protect-content').checked,
    };
    const image = document.getElementById('file-upload').files[0];
    
    // Convert image to base64 if needed
    const imagePromise = new Promise((resolve, reject) => {
        if (image) {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(image);
        } else {
            resolve(null);
        }
    });

    imagePromise.then(imageData => {
        const invoiceData = {
            title,
            description,
            currency,
            items,
            total,
            settings,
            image: imageData,
        };
        sendInvoiceData(invoiceData);
    });
};
