let cursor = null;

const API = window.location.origin;

async function loadStats() {

    const res = await fetch(`${API}/stats`);
    const data = await res.json();

    document.getElementById("totalProducts").innerText =
        data.total_products.toLocaleString();

    document.getElementById("electronicsCount").innerText =
        data.electronics.toLocaleString();

    document.getElementById("booksCount").innerText =
        data.books.toLocaleString();

    document.getElementById("fashionCount").innerText =
        data.fashion.toLocaleString();

    document.getElementById("sportsCount").innerText =
        data.sports.toLocaleString();

    document.getElementById("homeCount").innerText =
        data.home.toLocaleString();
}

async function loadProducts(reset = false) {

    if (reset) {
        cursor = null;
        document.getElementById("grid").innerHTML = "";
    }

    document.getElementById("loader").style.display = "block";

    const category =
        document.getElementById("category").value;

    const search =
        document.getElementById("search").value;

    const sort =
        document.getElementById("sort").value;

    let url = `${API}/products?limit=20`;

    if (cursor)
        url += `&cursor=${cursor}`;

    if (category)
        url += `&category=${category}`;

    if (search)
        url += `&search=${search}`;

    if (sort)
        url += `&sort=${sort}`;

    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("loader").style.display = "none";

    if (reset && data.items.length === 0) {

        document.getElementById("emptyState").style.display = "block";
        return;
    }

    document.getElementById("emptyState").style.display = "none";

    const grid =
        document.getElementById("grid");

    data.items.forEach(p => {

        grid.innerHTML += `

        <div class="card"
             onclick="showProduct(${p.id})">

            <div class="product-id">
                #${p.id}
            </div>

            <h3>${p.name}</h3>

            <span class="badge">
                ${p.category}
            </span>

            <p class="price">
                ₹${Number(p.price).toLocaleString()}
            </p>

        </div>

        `;
    });

    cursor = data.next_cursor;
}

async function showProduct(id) {

    const res =
        await fetch(`${API}/products/${id}`);

    const p =
        await res.json();

    document.getElementById("productDetails").innerHTML = `

        <p><strong>ID:</strong> ${p.id}</p>

        <p><strong>Name:</strong> ${p.name}</p>

        <p><strong>Category:</strong> ${p.category}</p>

        <p><strong>Price:</strong> ₹${Number(p.price).toLocaleString()}</p>

        <p><strong>Created:</strong> ${p.created_at}</p>

        <p><strong>Updated:</strong> ${p.updated_at}</p>

    `;

    document.getElementById("productModal")
        .style.display = "block";
}

function closeModal() {

    document.getElementById("productModal")
        .style.display = "none";
}

function nextPage() {

    loadProducts(false);
}

window.onload = () => {

    loadStats();
    loadProducts(true);

};