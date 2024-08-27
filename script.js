//console.log('script connected')


// // GSAP ANIMATION - 
let tl = gsap.timeline();


// locomotive for smooth scrolling
const scroll = new LocomotiveScroll({
    el: document.querySelector('main'),
    smooth: true
});


// Animation on loader
tl.from('.loader', {
    opacity:0,
    duration:2,
    delay:0.2,
    ease: "ease-in",
    scale:2
})

tl.to('.loader', {
    opacity:0
})

// Animation on nav
tl.from('nav', {
    y:-100,
    opacity:0,
    duration: 1.2,

})


// // Animation on page1
tl.from('.page1 .heroImg1 img', {
    opacity:0,
    duration:1,
    ease: "ease-in",

})


tl.from('.page1 .heroImg2 img', {
    opacity:0,
    duration:1,
    ease: "ease-in"


})


// // Let's begin with JS Functionality :
// // Step 1 -
// // For showing our products via dom, we need to first access the container in which these products should be displayed.
// // and, the templates of products.
let productContainer = document.querySelector('.mmContainer');
let productTemplate = document.querySelector('.productTemplate');
let productCloning;
let productCount;
let productPrice;

// // Step 2 -
// // Let's fetch data from our API = products.json
fetch("api/products.json")
.then(raw => raw.json())
.then(data => {
        // console.log(data);  = shows us array of 8 products from products.json
    
    miraContainer(data);  // the data is shown in this product container
    // Update the cart value on nav after loading products
    let storedProducts = getProductFromLocalStorage();
    updatedCartValue(storedProducts);
})
.catch(error => console.log("an error occurred"));


// // Step 3 - 
// // Function to display products on the webpage.
let miraContainer = (productArray) => {

    // if products not available
       if(!productArray){
        return false;
    }


    let storedProducts = getProductFromLocalStorage();
    // diplaying all the data or accessing value of each array from products.json
    productArray.forEach((currentProduct) => {

    // destructuring the variables
    let { id, productImg, productName, productPrice} = currentProduct;
        
    // let's clone the data, we'll use importNode
    // method of document object, used to import node from template or another docs
    productCloning = document.importNode(productTemplate.content, true);
      
    // setting product values through products.json
    productCloning.querySelector('#productImg').src = productImg;
    productCloning.querySelector('#productImg').alt = productName;
    productCloning.querySelector('#productName').textContent = productName;
    productCloning.querySelector('#productPrice').textContent = `$${productPrice}`;
    

    // now to see the result, append productCloning in productContainer.


    // Check if the product exists in the local storage and update the quantity
     let storedProduct = storedProducts.find(product => product.id === id);
     if (storedProduct) {
         productCloning.querySelector('.numOfProducts').textContent = storedProduct.productCount;
         productCloning.querySelector('.numOfProducts').setAttribute('countData', storedProduct.productCount.toString());
     } else {
         productCloning.querySelector('.numOfProducts').setAttribute('countData', '0');
    }



    // Part of Step 4 :
    productCloning.querySelector('#productCardValue').setAttribute('id', `productCard${id}`);
    // this will give every product an individual id, so that we can differentiate which card was clicked by user
    // when adding products via countButton event listener.

    // when the parent of button is clicked, it tells which card was clicked.
    // also, this is helpful for add and sub.
    productCloning.querySelector('.countButton').addEventListener('click', (event) => {
    homeCountToggle(event, id);
    });


 
    // Part of Step 5 :
    // same as step 4, just this time it is add to cart button
    productCloning.querySelector('.cart').addEventListener('click', (event) => {
    addToCartButton(id);

   

    });

    // to display all products, let's append them
    productContainer.append(productCloning);
})


}


// Step 4 -
// For adding functionality in buttons
let homeCountToggle = (event, id) => {


    // now, let's find out which card was clicked by the user, and let's print it's id on console.
    let productCardClick = document.querySelector(`#productCard${id}`);
    // console.log(productCardClick);  // tells which product card was clicked.


    // now, let's find out the quantity of the product.
    let productQuantity = productCardClick.querySelector('.numOfProducts');
    // console.log(productQuantity);   // tells us the quantity of the product, here rn it is 0


   // let's get the quantity of the product.
   // to make sure it is number, add parseInt or number
   let quantity = parseInt(productQuantity.getAttribute('countData')) || 0;

   // find out add or sub button is clicked, perform calc accordingly
   if(event.target.className === ('add')){
    quantity++;

   }

   if(event.target.className === ('sub')){
    if(quantity > 0){
    quantity--;
    }
   }

   productQuantity.textContent = quantity;
   // console.log(quantity)
   // using countData because the value when will change
   productQuantity.setAttribute('countData', quantity.toString());
   return quantity;


}

// Step 5 -
// Let's create add to cart functionality


let getProductFromLocalStorage = () => {

    // getting existing data from local storage
    let cartProducts = localStorage.getItem('productDataFromLS');

    // if empty, return empty array
    if(!cartProducts){
        return [];  
    }

    // if not,
    return JSON.parse(cartProducts);
}




// for realtime cart value on nav
let updatedCartValue = (cartProducts) => {
    let totalCount = cartProducts.reduce((total, product) => total + product.productCount, 0);
    let realTimeCartValue = document.querySelector('#userCartValue');
    if(realTimeCartValue){
        realTimeCartValue.innerText = `(${totalCount})`;
    }

}



let addToCartButton = (id) => {

    // this is for local storage
    let productArray = getProductFromLocalStorage();



    // checking if product id already exits in local stoarge
    let productExist = productArray.find((currentProduct) =>
        currentProduct.id === id
    )

    // first, let's check which product card's add to cart button is clicked by the user.
    let currentCardClick = document.querySelector(`#productCard${id}`);
   // console.log(currentCardClick);


    // next, let's find out the quantity of the product.
    productCount = parseInt(currentCardClick.querySelector('.numOfProducts').getAttribute('countData')) || 0;
    // console.log(productCount);   // tells us the quantity of the product, here it changes because of the function declared above

   
    // now, let's find the price of the product
    productPrice = currentCardClick.querySelector('#productPrice').innerText;
    //console.log(productPrice); // tells us the price of the product, here the price is not changing rn
    // for calc the $ sign will create some issues, let's remove that 
    productPrice = productPrice.replace('$', "");
    // console.log(productPrice);    // now, the price is not changing according to quantity let's handle that & it is a string
    
    productPrice = productCount * parseFloat(productPrice);
    console.log(productCount, productPrice);   // here, the price is changing according to quantity & price is in number form


    
    // now, let's store data in local storage
    // we'll have to create a function for that = getProductFromLocalStorage();



    if(productExist){
        // if product already exists, update just count & price
        productExist.productCount = productCount;
        productExist.productPrice = productExist.productCount * parseFloat(productPrice);
    }
    
    else{
       // if product doesn't exist, add new product to array
       let updatedCartValue = {id, productCount, productPrice};
       productArray.push(updatedCartValue);

    }

    localStorage.setItem('productDataFromLS', JSON.stringify(productArray));

    

    // for showing updated cart value on nav
    updatedCartValue(productArray);

    if(productCount !== 0){
        let button_text = currentCardClick.querySelector('.cart');
        button_text.textContent = "Item added to cart"
    
        //  reset the button text after a few seconds
        setTimeout(() => {
            button_text.textContent = "Add";
        }, 2000);  // Change text back after 2 seconds
    
        return;
    
        }

    
}



