document.addEventListener("DOMContentLoaded", function () {
    if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('Telegram WebApp SDK is not loaded.');
        return;
    }

    window.Telegram.WebApp.ready(); // Ensure SDK is ready

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

    // Get the Telegram chat ID from the WebApp environment
    const chatId = window.Telegram.WebApp.initDataUnsafe?.user?.id || null;

    // Add title functionality
    addTitleButton.addEventListener("click", function () {
        const title = titleInput.value.trim();
        if (!title) {
            titleError.style.display = "block";
            return;
        }
        titleError.style.display = "none";
        items.push({ title: title, quantity: 1, price: 0 }); // Use 'title' instead of 'name'
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
                <span>${item.title}</span> <!-- Use 'title' instead of 'name' -->
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
        if (!chatId) {
            alert('Chat ID is missing. Please make sure the Telegram WebApp environment is correctly initialized.');
            return;
        }

        const invoiceData = {
            items: items.map(item => ({
                title: item.title, // Ensure 'title' is included in the payload
                quantity: item.quantity,
                price: item.price
            })),
            total: total.toFixed(2),
            currency: currencySelect.value,
            settings: {
                requireName: document.getElementById("requireName").checked,
                requireEmail: document.getElementById("requireEmail").checked,
                requirePhone: document.getElementById("requirePhoneNumber").checked,
                protectContent: document.getElementById("protectContent").checked
            },
            chatId: chatId // Include chat ID in the payload
        };

        fetch('https://3fb0-2001-16a2-71a5-8900-153c-dad7-eae8-b0ec.ngrok-free.app/send', {
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
