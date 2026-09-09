const favoritesKey = "catalogFavorites";

let allItems = [];
let filteredItems = [];
let visibleCount = 6;

document.addEventListener("DOMContentLoaded", initCatalogPage);

async function initCatalogPage() {
    const catalog = document.querySelector("[data-catalog]");

    if (!catalog) return;

    initCatalogControls();

    try {
        showLoadingState();

        allItems = await loadItems();

        hideLoadingState();
        applyFilters();
    } catch (error) {
        hideLoadingState();
        showErrorState();
        console.error(error);
    }
}

async function loadItems() {
    const response = await fetch("../data/items.json");

    if (!response.ok) {
        throw new Error("Не вдалося завантажити дані");
    }

    return await response.json();
}

function initCatalogControls() {
    const searchInput = document.querySelector("#catalog-search");
    const categoryFilter = document.querySelector("#category-filter");
    const sortSelect = document.querySelector("#catalog-sort");
    const loadMoreButton = document.querySelector("#load-more");
    const catalog = document.querySelector("[data-catalog]");
    const modal = document.querySelector("#details-modal");
    const closeButton = document.querySelector("#details-close");

    searchInput.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);

    loadMoreButton.addEventListener("click", () => {
        visibleCount += 4;
        renderCards(filteredItems);
    });

    catalog.addEventListener("click", (event) => {
        const favoriteButton = event.target.closest("[data-favorite-id]");
        const detailsButton = event.target.closest("[data-details-id]");

        if (favoriteButton) {
            toggleFavorite(Number(favoriteButton.dataset.favoriteId));
        }

        if (detailsButton) {
            showDetails(Number(detailsButton.dataset.detailsId));
        }
    });

    closeButton.addEventListener("click", closeDetails);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeDetails();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDetails();
        }
    });
}

function applyFilters() {
    const query = document
        .querySelector("#catalog-search")
        .value
        .trim()
        .toLowerCase();

    const category = document.querySelector("#category-filter").value;
    const sortBy = document.querySelector("#catalog-sort").value;

    filteredItems = allItems.filter((item) => {
        const matchesQuery =
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query);

        const matchesCategory =
            category === "all" || item.category === category;

        return matchesQuery && matchesCategory;
    });

    filteredItems = sortItems(filteredItems, sortBy);
    visibleCount = 6;

    renderCards(filteredItems);
}

function sortItems(items, sortBy) {
    const sortedItems = [...items];

    if (sortBy === "title-asc") {
        sortedItems.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "rating-desc") {
        sortedItems.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "duration-asc") {
        sortedItems.sort((a, b) => a.duration - b.duration);
    }

    return sortedItems;
}

function renderCards(items) {
    const catalog = document.querySelector("[data-catalog]");
    const emptyState = document.querySelector("#empty-state");
    const loadMoreButton = document.querySelector("#load-more");
    const favorites = readFavorites();

    catalog.innerHTML = "";

    if (items.length === 0) {
        emptyState.hidden = false;
        loadMoreButton.hidden = true;
        return;
    }

    emptyState.hidden = true;

    const visibleItems = items.slice(0, visibleCount);

    catalog.innerHTML = visibleItems
        .map((item) => {
            const isFavorite = favorites.includes(item.id);

            return `
                <article class="catalog-card">
                    <div class="catalog-card-icon">${item.icon}</div>

                    <p class="catalog-category">
                        ${getCategoryName(item.category)}
                    </p>

                    <h2>${item.title}</h2>
                    <p>${item.description}</p>

                    <ul class="catalog-meta">
                        <li>Рівень: ${item.level}</li>
                        <li>Тривалість: ${item.duration} год.</li>
                        <li>Рейтинг: ${item.rating}</li>
                    </ul>

                    <div class="catalog-actions">
                        <button
                            type="button"
                            data-details-id="${item.id}"
                        >
                            Детальніше
                        </button>

                        <button
                            type="button"
                            class="favorite-button ${isFavorite ? "is-favorite" : ""}"
                            data-favorite-id="${item.id}"
                            aria-label="Додати в обране"
                        >
                            ${isFavorite ? "★ В обраному" : "☆ В обране"}
                        </button>
                    </div>
                </article>
            `;
        })
        .join("");

    loadMoreButton.hidden = visibleCount >= items.length;
}

function toggleFavorite(id) {
    const favorites = readFavorites();
    const updatedFavorites = favorites.includes(id)
        ? favorites.filter((favoriteId) => favoriteId !== id)
        : [...favorites, id];

    localStorage.setItem(
        favoritesKey,
        JSON.stringify(updatedFavorites)
    );

    renderCards(filteredItems);
}

function readFavorites() {
    try {
        const favorites = JSON.parse(
            localStorage.getItem(favoritesKey) || "[]"
        );

        return Array.isArray(favorites) ? favorites : [];
    } catch {
        return [];
    }
}

function showDetails(id) {
    const item = allItems.find((course) => course.id === id);
    const modal = document.querySelector("#details-modal");
    const content = document.querySelector("#details-content");

    if (!item) return;

    content.innerHTML = `
        <div class="details-icon">${item.icon}</div>
        <p class="catalog-category">
            ${getCategoryName(item.category)}
        </p>
        <h2>${item.title}</h2>
        <p>${item.description}</p>
        <p><strong>Рівень:</strong> ${item.level}</p>
        <p><strong>Тривалість:</strong> ${item.duration} год.</p>
        <p><strong>Рейтинг:</strong> ${item.rating}</p>
    `;

    modal.hidden = false;
}

function closeDetails() {
    const modal = document.querySelector("#details-modal");

    if (modal) {
        modal.hidden = true;
    }
}

function showLoadingState() {
    document.querySelector("#loading-state").hidden = false;
    document.querySelector("#error-state").hidden = true;
}

function hideLoadingState() {
    document.querySelector("#loading-state").hidden = true;
}

function showErrorState() {
    document.querySelector("#error-state").hidden = false;
}

function getCategoryName(category) {
    const categoryNames = {
        frontend: "Frontend",
        javascript: "JavaScript",
        tools: "Інструменти"
    };

    return categoryNames[category] || category;
}