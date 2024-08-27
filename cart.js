//console.log('script2 connected')


// Fetch products and handle cart
fetch("api/products.json")
    .then(response => response.json())
    .then(data => {
        let products = data;
        let cartPageContainer = getProductFromLocalStorage();

        // Filter products based on added cart items
        let cartPageProducts = products.filter(product =>
            cartPageContainer.some(cartProduct => cartProduct.id === product.id)
        );

        if (!Array.isArray(cartPageProducts)) {
            console.error("cartPageProducts is not an array", cartPageProducts);
            return [];
        }

        showingCartPageProducts(cartPageProducts);
    })
    .catch(error => console.error("An error occurred:", error));

// Function to get products from local storage
function getProductFromLocalStorage() {
    const cartProducts = localStorage.getItem('productDataFromLS');
    return cartProducts ? JSON.parse(cartProducts) : [];
}

// Function to fetch quantity from cart
function fetchQuantityFromCart(id, productPrice) {
    let cartProducts = getProductFromLocalStorage();

    let existingProduct = cartProducts.find((currentProduct) => {
        return currentProduct.id === id;
    });

    let product_default_count = 1;
    if (existingProduct) {
        product_default_count = existingProduct.productCount;
        productPrice = existingProduct.productPrice;
    }
    return { product_default_count, productPrice };
}

// Function for showing products in cart page
function showingCartPageProducts(cartPageProducts) {
    let cartContainer = document.querySelector('.cartProductContainer');
    let cartTemplate = document.querySelector('.cartTemplate');

    if (!cartContainer) {
        console.error("cartContainer not found");
        return;
    }

    if (!cartTemplate) {
        console.error("cartTemplate not found");
        return;
    }

    cartPageProducts.forEach(currentProduct => {
        const { id, productImg, productName } = currentProduct;

        // Cloning Product Template
        const productCloning = document.importNode(cartTemplate.content, true);

        const LSActualData = fetchQuantityFromCart(id);

        // Setting product values
        productCloning.querySelector('#cartCardValue').setAttribute('id', `productCardValue${id}`);
        productCloning.querySelector('.cartProductImg img').src = productImg;
        productCloning.querySelector('.cartProductName').alt = productName;
        productCloning.querySelector('.cartProductName').textContent = productName;

        productCloning.querySelector('#cartProductPrice').textContent =LSActualData.productPrice;
        productCloning.querySelector('.cartQuantityCount').textContent = LSActualData.product_default_count;

        // Add event listeners
        productCloning.querySelector('.countButton').addEventListener('click', (event) => {
            adjustProductQuantity(event, id, currentProduct.productPrice);
        });

        productCloning.querySelector('.remove').addEventListener('click', () => {
            removeProductFromCart(id);
        });

        cartContainer.appendChild(productCloning);
    });

    cartTotal();
    updateCartValue();
}

// Function to adjust product quantity in the cart
function adjustProductQuantity(event, id, productPrice) {
    let cardClick = document.querySelector(`#productCardValue${id}`);
    let productQuantityElement = cardClick.querySelector('.cartQuantityCount');
    let cartProductPriceElement = cardClick.querySelector('#cartProductPrice');

    let localCartProduct = getProductFromLocalStorage();
    let existingProduct = localCartProduct.find((currentProduct =>
        currentProduct.id === id
    ));

    let productCount = existingProduct ? existingProduct.productCount : 1;
    let price = existingProduct ? existingProduct.productPrice / existingProduct.productCount : productPrice;

    if (event.target.classList.contains('add')) {
        productCount++;
    }
    if (event.target.classList.contains('sub')) {
        if (productCount >= 1) {
            productCount--;
        } else {
            removeProductFromCart(id);
            return;
        }
    }

    let updatedProductPrice = productCount * price;

    productQuantityElement.textContent = productCount;
    cartProductPriceElement.textContent = `${updatedProductPrice.toFixed(2)}`;

    if (existingProduct) {
        existingProduct.productCount = productCount;
        existingProduct.productPrice = updatedProductPrice;
    } else {
        let updatedCart = { id, productCount, productPrice: updatedProductPrice };
        localCartProduct.push(updatedCart);
    }

    localStorage.setItem('productDataFromLS', JSON.stringify(localCartProduct));
    updateCartValue(localCartProduct);
    cartTotal();
}

// Function to remove a product from the cart
function removeProductFromCart(id) {
    let cartProducts = getProductFromLocalStorage();

    cartProducts = cartProducts.filter(product =>
        product.id !== id);

    localStorage.setItem('productDataFromLS', JSON.stringify(cartProducts));

    // Remove product when cross icon is clicked
    let removeItem = document.getElementById(`productCardValue${id}`);
    if (removeItem) {
        removeItem.remove();
    }

    updateCartValue();
    cartTotal();
}

// Function to update cart value in the navbar
function updateCartValue(cartProducts = getProductFromLocalStorage()) {
    let totalCount = cartProducts.reduce((total, product) => total + product.productCount, 0);
    let realTimeCartValue = document.querySelector('#userCartValue');
    if (realTimeCartValue) {
        realTimeCartValue.innerText = `(${totalCount})`;
    }
}

// Function to calculate cart total
function cartTotal() {
    let subTotal = document.querySelector('.subTotal');
    let totalAmount = document.querySelector('.totalAmount');

    let localCartProduct = getProductFromLocalStorage();
    let initialCount = 0;

    let finalCost = localCartProduct.reduce((accum, currentProduct) => {
        let productPrice = currentProduct.productPrice || 0;
        return accum + productPrice;
    }, initialCount);

    subTotal.textContent = `$${finalCost.toFixed(2)}`;
    totalAmount.textContent = `$${(finalCost + 3.50).toFixed(2)}`;
}

// Retain cart data on page refresh
document.addEventListener('DOMContentLoaded', () => {
    updateCartValue();
    cartTotal();
});
