let cursor = null;

const API = window.location.origin;

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

    const grid = document.getElementById("grid");

    data.items.forEach(p => {

        grid.innerHTML += `

        <div class="card"
             onclick="showProduct(${p.id})">

            <h3>${p.name}</h3>

            <p>${p.category}</p>

            <p class="price">
                $${p.price}
            </p>

        </div>

        `;
    });

    cursor = data.next_cursor;

    document.getElementById("loader").style.display =
        "none";
}

async function showProduct(id) {

    const res =
        await fetch(`${API}/products/${id}`);

    const p =
        await res.json();

    document.getElementById("productDetails").innerHTML = `

        <p><b>ID:</b> ${p.id}</p>

        <p><b>Name:</b> ${p.name}</p>

        <p><b>Category:</b> ${p.category}</p>

        <p><b>Price:</b> $${p.price}</p>

        <p><b>Created:</b> ${p.created_at}</p>

        <p><b>Updated:</b> ${p.updated_at}</p>

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

loadStats();

loadProducts(true);