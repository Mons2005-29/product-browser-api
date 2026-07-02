const API = window.location.origin;

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

        <div class="product-card">

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
// CLOSE MODAL IF CLICK OUTSIDE
// ===========================

window.onclick = function(event){

    const modal =
        document.getElementById("editModal");

    if(event.target == modal){

        closeEditModal();

    }

}

// ===========================
// INITIAL LOAD
// ===========================

loadStats();

loadProducts();