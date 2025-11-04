const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-counter")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById ("address-warn")
const extrasModal = document.getElementById("extras-modal");
const extrasProductName = document.getElementById("extras-product-name");
const extrasOptions = document.querySelectorAll("#extras-options input");

let cart = [];
let selectedProduct = {}; // Guardar item clicado

// 1️⃣ Quando clicar no botão de adicionar produto → abre modal de extras
document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        selectedProduct = {
            name: btn.getAttribute("data-name"),
            price: parseFloat(btn.getAttribute("data-price"))
        };

        extrasProductName.textContent = `Adicionar extras para: ${selectedProduct.name}`;
        extrasModal.classList.remove("hidden");
        extrasModal.classList.add("flex");
    });
});

// 2️⃣ Fechar modal de extras
document.getElementById("close-extras-modal").addEventListener("click", () => {
    extrasModal.classList.add("hidden");
    extrasModal.classList.remove("flex");
});

// 3️⃣ Adicionar ao carrinho com extras e abrir o carrinho principal
document.getElementById("add-with-extras-btn").addEventListener("click", () => {
    let extrasTotal = 0;
    let extrasNames = [];

    extrasOptions.forEach(option => {
        if (option.checked) {
            extrasTotal += parseFloat(option.value);
            extrasNames.push(option.getAttribute("data-name"));
        }
    });

    const finalPrice = selectedProduct.price + extrasTotal;

    cart.push({
        name: extrasNames.length > 0
            ? `${selectedProduct.name} (+ ${extrasNames.join(", ")})`
            : selectedProduct.name,
        price: finalPrice,
        quantity: 1
    });

    updateCartModal(); // Atualiza modal principal

    // Fecha modal de extras
    extrasModal.classList.add("hidden");
    extrasModal.classList.remove("flex");

    // Abre modal principal do carrinho automaticamente
    cartModal.classList.remove("hidden");
    cartModal.classList.add("flex");
});

//Atualiza o carrinho
function updateCartModal() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total"); // precisa existir no HTML
    const cartCounter = document.getElementById("cart-count"); // precisa existir no HTML

    if (!cartItemsContainer) {
        console.error("Elemento #cart-items não encontrado no HTML!");
        return;
    }

    cartItemsContainer.innerHTML = "";

    let total = 0; // ✅ declara a variável total

    cart.forEach(item => {
        total += item.price * item.quantity; // ✅ soma o valor total

        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p class="text-sm">Qtd: ${item.quantity}</p>
                </div>
                <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `;

        cartItemsContainer.appendChild(cartItemElement);
    });

    // ✅ Atualiza o valor total no HTML, se o elemento existir
    if (cartTotal) {
        cartTotal.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // ✅ Atualiza contador de itens no carrinho
    if (cartCounter) {
        cartCounter.textContent = cart.length;
    }
}


// Funçaõ para remover o item do carrinho
cartItemsContainer.addEventListener("click", function (event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")
    }
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);

    if(index !== -1){
        const item = cart[index];

        if(item.quantity > 1){
            item.quantity -= 1;
            updateCartModal();
            return;
        }

        cart.splice(index, 1);
        updateCartModal();
    }
}

addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;

    if(inputValue !==""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

// Finalizar pedido
checkoutBtn.addEventListener("click", function(){

    const isOpen = checkRestauranteOpen();
    if(!isOpen){
        Toastify ({
            text: "Ops o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if(cart.length === 0) return;
    if(addressInput.value ===""){
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return;
    }

    //Enviar o pedido para api whats
    const cartItems = cart.map((item) => {
    return (
        ` ${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price} |` );

        }).join("");

        // Calcula o total do pedido
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Monta a mensagem
        const message = encodeURIComponent(`${cartItems} Total: R$${total.toFixed(2)} |`);
        const phone = "17997219867";

        window.open(`http://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank");

        // Limpa o carrinho e atualiza a interface
        cart = [];
        updateCartModal();


})

// Verificar a hora e manipular o card horario
function checkRestauranteOpen() {
    const data = new Date();
    const hora = data.getHours(); // ✅ corrigido
    return hora >= 1 && hora < 24 ; // true = aberto entre 18h e 22h
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestauranteOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
    spanItem.textContent = "Aberto agora 🍔";
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
    spanItem.textContent = "Fechado ❌";
}
