const API = window.location.origin;

// ===========================
// AUTH GUARD
// ===========================
// NOTE: This is a client-side session gate only (no backend auth
// endpoint exists in this project). It stops casual access to the
// dashboard but is not real security.

if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {

    window.location.href = "/login";

}

function logout() {

    sessionStorage.removeItem("isAdminLoggedIn");

    window.location.href = "/login";

}

// ===========================
// LOAD DASHBOARD STATS
// ===========================

async function loadStats() {

    const res = await fetch(`${API}/stats`);

    const data = await res.json();

    document.getElementById("totalProducts").innerText =
        data.total_products;

    document.getElementById("electronicsCount").innerText =
        data.electronics;

    document.getElementById("booksCount").innerText =
        data.books;

    document.getElementById("fashionCount").innerText =
        data.fashion;

    document.getElementById("sportsCount").innerText =
        data.sports;

    document.getElementById("homeCount").innerText =
        data.home;

    renderCategoryChart(data);
}

// ===========================
// CATEGORY DISTRIBUTION CHART
// ===========================

function renderCategoryChart(data) {

    const categories = [
        { label: "Electronics", value: data.electronics, color: "#2563eb" },
        { label: "Books", value: data.books, color: "#7c3aed" },
        { label: "Fashion", value: data.fashion, color: "#ec4899" },
        { label: "Sports", value: data.sports, color: "#f59e0b" },
        { label: "Home", value: data.home, color: "#16a34a" }
    ];

    const max = Math.max(...categories.map(c => c.value), 1);

    const container = document.getElementById("categoryChart");

    container.innerHTML = categories.map(c => `

        <div class="chart-row">

            <span class="chart-label">${c.label}</span>

            <div class="chart-bar-track">
                <div
                    class="chart-bar-fill"
                    style="width:${(c.value / max) * 100}%; background:${c.color};"
                ></div>
            </div>

            <span class="chart-value">${Number(c.value).toLocaleString()}</span>

        </div>

    `).join("");

}

// ===========================
// LOAD PRODUCTS
// ===========================

async function loadProducts() {

    const res =
        await fetch(`${API}/products?limit=50`);

    const data =
        await res.json();

    document.getElementById("productCount").innerText =
        `${data.count} Products`;

    const container =
        document.getElementById("products");

    container.innerHTML = "";

    data.items.forEach(product => {

        container.innerHTML += `

        <div class="product-card" data-id="${product.id}">

            <input
                type="checkbox"
                class="product-checkbox"
                value="${product.id}"
                onchange="updateSelectAllState()"
            >

            <div class="product-info">

                <div class="product-id">
                    ID #${product.id}
                </div>

                <h3>${product.name}</h3>

                <div class="badge">
                    ${product.category}
                </div>

                <div class="price">
                    ₹${Number(product.price).toLocaleString()}
                </div>

            </div>

            <div class="actions">

                <button
                    class="edit-btn"
                    onclick="openEditModal(${product.id})"
                >
                    ✏ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})"
                >
                    🗑 Delete
                </button>

            </div>

        </div>

        `;

    });

    const selectAllCheckbox =
        document.getElementById("selectAllCheckbox");

    if (selectAllCheckbox)
        selectAllCheckbox.checked = false;

}

// ===========================
// BULK SELECTION
// ===========================

function getSelectedIds() {

    return Array.from(
        document.querySelectorAll(".product-checkbox:checked")
    ).map(cb => cb.value);

}

function toggleSelectAll() {

    const checked =
        document.getElementById("selectAllCheckbox").checked;

    document.querySelectorAll(".product-checkbox").forEach(cb => {
        cb.checked = checked;
    });

}

function updateSelectAllState() {

    const all =
        document.querySelectorAll(".product-checkbox");

    const checked =
        document.querySelectorAll(".product-checkbox:checked");

    document.getElementById("selectAllCheckbox").checked =
        all.length > 0 && all.length === checked.length;

}

// ===========================
// DELETE SELECTED PRODUCTS
// ===========================

async function deleteSelected() {

    const ids = getSelectedIds();

    if (ids.length === 0) {

        alert("No products selected.");

        return;
    }

    const confirmDelete = confirm(
        `Delete ${ids.length} selected product(s) permanently?`
    );

    if (!confirmDelete)
        return;

    for (const id of ids) {

        await fetch(`${API}/products/${id}`, {
            method: "DELETE"
        });

    }

    loadProducts();

    loadStats();

}

// ===========================
// DELETE ALL PRODUCTS
// ===========================

async function confirmDeleteAll() {

    const confirmDelete = confirm(
        "This will permanently delete ALL products. This cannot be undone. Continue?"
    );

    if (!confirmDelete)
        return;

    let cursor = null;
    let allIds = [];

    do {

        let url = `${API}/products?limit=100`;

        if (cursor)
            url += `&cursor=${cursor}`;

        const res = await fetch(url);
        const data = await res.json();

        allIds = allIds.concat(data.items.map(p => p.id));

        cursor = data.next_cursor;

    } while (cursor);

    for (const id of allIds) {

        await fetch(`${API}/products/${id}`, {
            method: "DELETE"
        });

    }

    loadProducts();

    loadStats();

}

// ===========================
// ADD PRODUCT
// ===========================

async function addProduct() {

    const name =
        document.getElementById("name").value.trim();

    const category =
        document.getElementById("category").value;

    const price =
        parseFloat(
            document.getElementById("price").value
        );

    if (!name || isNaN(price)) {

        alert("Please fill all fields.");

        return;
    }

    await fetch(`${API}/products`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            category,
            price
        })

    });

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";

    loadProducts();
    loadStats();

}

// ===========================
// OPEN EDIT MODAL
// ===========================

async function openEditModal(id) {

    const res =
        await fetch(`${API}/products/${id}`);

    const product =
        await res.json();

    document.getElementById("editId").value =
        product.id;

    document.getElementById("editName").value =
        product.name;

    document.getElementById("editCategory").value =
        product.category;

    document.getElementById("editPrice").value =
        product.price;

    document.getElementById("editModal").style.display =
        "block";

}

// ===========================
// CLOSE MODAL
// ===========================

function closeEditModal() {

    document.getElementById("editModal").style.display =
        "none";

}

// ===========================
// SAVE PRODUCT
// ===========================

async function saveProduct() {

    const id =
        document.getElementById("editId").value;

    const name =
        document.getElementById("editName").value;

    const category =
        document.getElementById("editCategory").value;

    const price =
        parseFloat(
            document.getElementById("editPrice").value
        );

    await fetch(`${API}/products/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            name,
            category,
            price

        })

    });

    closeEditModal();

    loadProducts();

    loadStats();

}

// ===========================
// DELETE PRODUCT
// ===========================

async function deleteProduct(id) {

    const confirmDelete =
        confirm(
            "Delete this product permanently?"
        );

    if (!confirmDelete)
        return;

    await fetch(

        `${API}/products/${id}`,

        {
            method: "DELETE"
        }

    );

    loadProducts();

    loadStats();

}

// ===========================
// BULK UPLOAD (CSV)
// ===========================

let parsedCSVProducts = [];

const VALID_CATEGORIES =
    ["electronics", "books", "fashion", "sports", "home"];

function openUploadModal() {

    document.getElementById("uploadModal").style.display = "block";
    document.getElementById("csvFile").value = "";
    document.getElementById("csvPreview").innerHTML = "";
    document.getElementById("csvMessage").innerHTML = "";

    parsedCSVProducts = [];

}

function closeUploadModal() {

    document.getElementById("uploadModal").style.display = "none";

}

function previewCSV() {

    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    const messageEl = document.getElementById("csvMessage");
    const previewEl = document.getElementById("csvPreview");

    messageEl.innerHTML = "";
    previewEl.innerHTML = "";
    parsedCSVProducts = [];

    if (!file) {

        messageEl.innerHTML =
            "<p style='color:#ef4444;'>Please select a CSV file.</p>";

        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        const text = e.target.result;

        const rows = text
            .split(/\r?\n/)
            .filter(r => r.trim() !== "");

        if (rows.length < 2) {

            messageEl.innerHTML =
                "<p style='color:#ef4444;'>CSV file has no data rows.</p>";

            return;
        }

        const header = rows[0]
            .split(",")
            .map(h => h.trim().toLowerCase());

        const nameIdx = header.indexOf("name");
        const categoryIdx = header.indexOf("category");
        const priceIdx = header.indexOf("price");

        if (nameIdx === -1 || categoryIdx === -1 || priceIdx === -1) {

            messageEl.innerHTML =
                "<p style='color:#ef4444;'>CSV must have columns: name, category, price</p>";

            return;
        }

        let validCount = 0;
        let invalidCount = 0;

        let tableHTML = `

            <table class="csv-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>

        `;

        for (let i = 1; i < rows.length; i++) {

            const cols = rows[i].split(",");

            const name = (cols[nameIdx] || "").trim();
            const category = (cols[categoryIdx] || "").trim().toLowerCase();
            const price = parseFloat((cols[priceIdx] || "").trim());

            const isValid =
                name !== "" &&
                VALID_CATEGORIES.includes(category) &&
                !isNaN(price) &&
                price >= 0;

            if (isValid) {

                validCount++;

                parsedCSVProducts.push({ name, category, price });

            } else {

                invalidCount++;

            }

            tableHTML += `

                <tr>
                    <td>${name || "-"}</td>
                    <td>${category || "-"}</td>
                    <td>${isNaN(price) ? "-" : price}</td>
                    <td>${isValid ? "✅ Valid" : "❌ Invalid"}</td>
                </tr>

            `;

        }

        tableHTML += "</tbody></table>";

        previewEl.innerHTML = tableHTML;

        messageEl.innerHTML = `
            <p style="color:#16a34a;">${validCount} valid product(s) ready to import.</p>
            ${invalidCount > 0
                ? `<p style="color:#ef4444;">${invalidCount} invalid row(s) will be skipped.</p>`
                : ""}
        `;

    };

    reader.readAsText(file);

}

async function importProducts() {

    const messageEl = document.getElementById("csvMessage");

    if (parsedCSVProducts.length === 0) {

        messageEl.innerHTML +=
            "<p style='color:#ef4444;'>No valid products to import. Please preview a valid CSV first.</p>";

        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const product of parsedCSVProducts) {

        try {

            const res = await fetch(`${API}/products`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)

            });

            if (res.ok) {
                successCount++;
            } else {
                failCount++;
            }

        } catch (err) {

            failCount++;

        }

    }

    messageEl.innerHTML += `
        <p style="color:#16a34a;">Successfully imported ${successCount} product(s).</p>
        ${failCount > 0
            ? `<p style="color:#ef4444;">${failCount} product(s) failed to import.</p>`
            : ""}
    `;

    loadProducts();

    loadStats();

    parsedCSVProducts = [];

}

// ===========================
// CLOSE MODAL IF CLICK OUTSIDE
// ===========================

window.onclick = function(event){

    const editModal =
        document.getElementById("editModal");

    const uploadModal =
        document.getElementById("uploadModal");

    if(event.target == editModal){

        closeEditModal();

    }

    if(event.target == uploadModal){

        closeUploadModal();

    }

}

// ===========================
// INITIAL LOAD
// ===========================

loadStats();

loadProducts();