let cursor = null;

// 🔴 CHANGE THIS AFTER DEPLOYMENT
const API = "http://127.0.0.1:8000";

async function loadProducts(reset = false) {
    if (reset) {
        cursor = null;
        document.getElementById("grid").innerHTML = "";
    }

    document.getElementById("loader").style.display = "block";

    const category = document.getElementById("category").value;

    let url = `${API}/products?limit=20`;

    if (cursor) url += `&cursor=${cursor}`;
    if (category) url += `&category=${category}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const grid = document.getElementById("grid");

        data.items.forEach(p => {
            grid.innerHTML += `
                <div class="card">
                    <h3>${p.name}</h3>
                    <p>${p.category}</p>
                    <p class="price">$${p.price}</p>
                </div>
            `;
        });

        cursor = data.next_cursor;

    } catch (err) {
        console.log(err);
        alert("API not working. Check backend URL.");
    }

    document.getElementById("loader").style.display = "none";
}

function nextPage() {
    loadProducts(false);
}

loadProducts(true);