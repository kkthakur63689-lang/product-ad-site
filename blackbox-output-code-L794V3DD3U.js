const PRODUCTS_FILE = 'data.json';

// Load products from localStorage/JSON file
async function loadProducts() {
    try {
        const response = await fetch(PRODUCTS_FILE);
        let products = [];
        
        if (response.ok) {
            products = await response.json();
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('products');
            products = saved ? JSON.parse(saved) : [];
        }
        
        displayProducts(products);
        updateCategoryFilter(products);
    } catch (error) {
        console.error('Error loading products:', error);
        const saved = localStorage.getItem('products');
        const products = saved ? JSON.parse(saved) : [];
        displayProducts(products);
        updateCategoryFilter(products);
    }
}

// Display products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No products available</h3>
                <p>Be the first to add a product!</p>
                <a href="admin.html" class="btn btn-primary">Add Product</a>
            </div>
        `;
        return;
    }
    
    const filteredProducts = applyFilters(products);
    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    const mainImage = product.photos && product.photos.length > 0 ? product.photos[0] : '';
    const categoryBadge = product.category ? `<span class="product-badge">${product.category}</span>` : '';
    
    return `
        <div class="product-card">
            <div class="product-image">
                ${categoryBadge}
                <img src="${mainImage}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/400x250/667eea/ffffff?text=No+Image'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-links">
                    ${product.buyerLink ? `<a href="${product.buyerLink}" target="_blank" class="btn btn-primary"><i class="fas fa-shopping-cart"></i> Buy Now</a>` : ''}
                    <a href="#" class="btn btn-secondary" onclick="viewPhotos('${product.id}')"><i class="fas fa-images"></i> Photos</a>
                </div>
            </div>
        </div>
    `;
}

// Apply search and filter
function applyFilters(products) {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    
    return products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });
}

// Update category filter dropdown
function updateCategoryFilter(products) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Event listeners for filters
function initFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            loadProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadProducts();
        });
    }
}

// View all photos modal (simple alert for demo)
function viewPhotos(productId) {
    // In a real app, this would open a modal with all photos
    alert('Photo gallery feature - In a full app, this would show all product photos!');
}

// Admin form handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const product = {
                id: Date.now().toString(),
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                buyerLink: document.getElementById('buyerLink').value,
                category: document.getElementById('category').value,
                photos: [],
                dateAdded: new Date().toISOString()
            };
            
            // Handle photo upload (base64 for demo)
            const photoFiles = document.getElementById('photos').files;
            for (let file of photoFiles) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        product.photos.push(e.target.result);
                        if (product.photos.length === photoFiles.length) {
                            saveProduct(product);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
            
            if (photoFiles.length === 0) {
                saveProduct(product);
            }
        });
    }
    
    initFilters();
});

// Save product
async function saveProduct(product) {
    try {
        // Load existing products
        const response = await fetch(PRODUCTS_FILE);
        let products = [];
        
        if (response.ok) {
            products = await response.json();
        } else {
            const saved = localStorage.getItem('products');
            products = saved ? JSON.parse(saved) : [];
        }
        
        // Add new product
        products.unshift(product);
        
        // Save to localStorage as fallback
        localStorage.setItem('products', JSON.stringify(products));
        
        // Try to save to JSON file
        await fetch(PRODUCTS_FILE, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products)
        });
        
        alert('Product added successfully!');
        document.getElementById('productForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Product saved locally