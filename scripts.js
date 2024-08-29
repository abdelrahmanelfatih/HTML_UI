let items = [];
let total = 0.00;

function addTitle() {
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

    const invoiceData = {
        title,
        description,
        currency,
        items,
        total,
        settings,
        image,
    };
    console.log("Invoice Data:", invoiceData);
    alert('Invoice Created! Check the console for details.');
};
