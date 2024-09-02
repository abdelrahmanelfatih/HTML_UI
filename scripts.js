document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("title");
    const addTitleButton = document.getElementById("addTitleButton");
    const itemList = document.getElementById("itemList");
    const totalAmount = document.getElementById("totalAmount");
    const currencySelect = document.getElementById("currency");
    const createInvoiceButton = document.getElementById("createInvoiceButton");
    const successMessage = document.getElementById("successMessage");
    const titleError = document.getElementById("titleError");
    const descriptionError = document.getElementById("descriptionError");
    const cancelButton = document.getElementById("cancelButton");

    let items = [];
    let total = 0.00;

    // Add title functionality
    addTitleButton.addEventListener("click", function () {
        const title = titleInput.value.trim();
        if (!title) {
            titleError.style.display = "block";
            return;
        }
        titleError.style.display = "none";
        items.push({ name: title, quantity: 1, price: 0 });
        renderItems();
        titleInput.value = "";
    });

    // Render items and calculate total
    function renderItems() {
        itemList.innerHTML = "";
        total = 0;

        items.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span>${item.name}</span>
                <input type="number" min="0" value="${item.quantity}" data-index="${index}" class="item-quantity">
                <input type="number" min="0" step="0.01" value="${item.price}" data-index="${index}" class="item-price">
                <span>${(item.quantity * item.price).toFixed(2)}</span>
            `;
            itemList.appendChild(listItem);

            total += item.quantity * item.price;
        });

        totalAmount.textContent = total.toFixed(2);
    }

    // Handle input changes for quantity and price
    itemList.addEventListener("input", function (event) {
        const index = event.target.getAttribute("data-index");
        const field = event.target.classList.contains("item-quantity") ? "quantity" : "price";
        const value = field === "quantity" ? parseInt(event.target.value) : parseFloat(event.target.value);
        items[index][field] = value || 0;
        renderItems();
    });

    // Handle create invoice button
    createInvoiceButton.addEventListener("click", function () {
        const invoiceData = {
            items: items,
            total: total.toFixed(2),
            currency: currencySelect.value,
            settings: {
                requireName: document.getElementById("requireName").checked,
                requireEmail: document.getElementById("requireEmail").checked,
                requirePhone: document.getElementById("requirePhoneNumber").checked,
                protectContent: document.getElementById("protectContent").checked
            }
        };

        fetch('https://your-backend-api-url.com/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            successMessage.classList.remove("hidden");
            setTimeout(() => {
                successMessage.classList.add("hidden");
            }, 3000);
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to create invoice. Please try again.');
        });
    });

    // Handle cancel button
    cancelButton.addEventListener("click", function () {
        if (confirm("Are you sure you want to cancel?")) {
            titleInput.value = "";
            items = [];
            renderItems();
        }
    });
});
