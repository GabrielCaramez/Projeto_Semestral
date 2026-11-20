const seedProducts = [
  {id: 1, name: "Jaqueta jeans vintage", category: "Roupas", size: "M", price: 89.9, icon: "🧥", active: true},
  {id: 2, name: "Tênis casual branco", category: "Calçados", size: "40", price: 129.9, icon: "👟", active: true},
  {id: 3, name: "Vestido floral leve", category: "Roupas", size: "P", price: 74.9, icon: "👗", active: true},
  {id: 4, name: "Bolsa de couro", category: "Acessórios", size: "M", price: 159.9, icon: "👜", active: true},
  {id: 5, name: "Moletom confortável", category: "Roupas", size: "G", price: 99.9, icon: "🧶", active: true},
  {id: 6, name: "Bota urbana", category: "Calçados", size: "38", price: 189.9, icon: "🥾", active: true}
];
const state = {
  products: JSON.parse(localStorage.getItem("revest-products") || "null") || seedProducts,
  cart: JSON.parse(localStorage.getItem("revest-cart") || "[]"),
  orders: JSON.parse(localStorage.getItem("revest-orders") || "[]"),
  tickets: JSON.parse(localStorage.getItem("revest-tickets") || "[]")
};
const money = value => value.toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
const save = () => {
  localStorage.setItem("revest-products", JSON.stringify(state.products));
  localStorage.setItem("revest-cart", JSON.stringify(state.cart));
  localStorage.setItem("revest-orders", JSON.stringify(state.orders));
  localStorage.setItem("revest-tickets", JSON.stringify(state.tickets));
};
const toast = message => {
  const element = document.querySelector("#toast");
  element.textContent = message; element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 2600);
};
function renderProducts() {
  const query = document.querySelector("#search").value.toLowerCase();
  const category = document.querySelector("#category").value;
  const size = document.querySelector("#size").value;
  const price = Number(document.querySelector("#price").value || Infinity);
  const products = state.products.filter(product => product.active && product.price <= price &&
    (!category || product.category === category) && (!size || product.size === size) &&
    (!query || `${product.name} ${product.category}`.toLowerCase().includes(query)));
  document.querySelector("#result-count").textContent = `${products.length} produto(s)`;
  document.querySelector("#products").innerHTML = products.length ? products.map(product => `
    <article class="product"><div class="product-image">${product.icon || "♻️"}</div><div class="product-info">
      <span class="tag">${product.category} · tamanho ${product.size}</span><h3>${product.name}</h3>
      <p>Peça selecionada em ótimo estado.</p><span class="price">${money(product.price)}</span>
      <button class="button primary add" data-id="${product.id}">Adicionar</button>
    </div></article>`).join("") : "<p>Nenhuma peça encontrada com esses filtros.</p>";
  document.querySelectorAll(".add").forEach(button => button.onclick = () => addToCart(Number(button.dataset.id)));
}
function addToCart(id) {
  if (!state.cart.includes(id)) { state.cart.push(id); save(); renderCart(); toast("Peça adicionada ao carrinho."); }
  else toast("Esta peça já está no carrinho.");
}
function renderCart() {
  const products = state.cart.map(id => state.products.find(product => product.id === id)).filter(Boolean);
  document.querySelector("#cart-count").textContent = products.length;
  document.querySelector("#cart-items").innerHTML = products.length ? products.map(product => `
    <div class="cart-line"><span>${product.icon} ${product.name}</span><b>${money(product.price)}</b>
    <button class="icon-button remove" data-id="${product.id}">×</button></div>`).join("") : "<p>Seu carrinho está vazio.</p>";
  document.querySelector("#cart-total").textContent = money(products.reduce((total, product) => total + product.price, 0));
  document.querySelectorAll(".remove").forEach(button => button.onclick = () => {
    state.cart = state.cart.filter(id => id !== Number(button.dataset.id)); save(); renderCart();
  });
}
function renderOrders() {
  const orders = document.querySelector("#orders");
  orders.innerHTML = state.orders.length ? state.orders.map(order => `
    <article class="order"><header><b>Pedido #${order.id}</b><span class="status">${order.status}</span></header>
    <p>${order.items.join(", ")}</p><strong>${money(order.total)}</strong><small> · pagamento Pix</small></article>`).join("") :
    "<p>Você ainda não possui pedidos. Faça uma compra para acompanhá-la aqui.</p>";
}
function renderInventory() {
  document.querySelector("#inventory").innerHTML = state.products.map(product => `
    <div class="inventory-item"><span>${product.name}<small> · ${product.category} · ${money(product.price)}</small></span>
    <button class="button ${product.active ? "primary" : ""} toggle" data-id="${product.id}">${product.active ? "Desativar" : "Ativar"}</button></div>`).join("");
  document.querySelectorAll(".toggle").forEach(button => button.onclick = () => {
    const product = state.products.find(item => item.id === Number(button.dataset.id));
    product.active = !product.active; save(); renderProducts(); renderInventory();
  });
}
function renderTickets() {
  document.querySelector("#tickets").innerHTML = state.tickets.map(ticket =>
    `<div class="ticket"><b>#${ticket.id} · ${ticket.subject}</b><p>${ticket.message}</p><span class="status">${ticket.status}</span></div>`).join("");
}
document.querySelectorAll(".filters input,.filters select").forEach(input => input.oninput = renderProducts);
document.querySelector("#open-cart").onclick = () => document.querySelector("#cart").classList.add("open");
document.querySelector("#close-cart").onclick = () => document.querySelector("#cart").classList.remove("open");
document.querySelector("#checkout").onclick = () => {
  const products = state.cart.map(id => state.products.find(product => product.id === id)).filter(Boolean);
  if (!products.length) return toast("Adicione uma peça antes de finalizar.");
  const order = {id: Date.now().toString().slice(-6), items: products.map(product => product.name),
    total: products.reduce((sum, product) => sum + product.price, 0), status: "Aguardando pagamento"};
  state.orders.unshift(order); state.cart = []; save(); renderCart(); renderOrders();
  document.querySelector("#cart").classList.remove("open"); location.hash = "pedidos";
  toast(`Pedido #${order.id} criado. Pix pronto para pagamento.`);
};
document.querySelector("#product-form").onsubmit = event => {
  event.preventDefault(); const data = new FormData(event.target);
  state.products.push({id: Date.now(), name: data.get("name"), category: data.get("category"), size: data.get("size"),
    price: Number(data.get("price")), icon: "♻️", active: true});
  save(); event.target.reset(); renderProducts(); renderInventory(); toast("Produto cadastrado.");
};
document.querySelector("#support-form").onsubmit = event => {
  event.preventDefault(); const data = new FormData(event.target);
  state.tickets.unshift({id: Date.now().toString().slice(-5), subject: data.get("subject"), message: data.get("message"), status: "Aberto"});
  save(); event.target.reset(); renderTickets(); toast("Chamado aberto com sucesso.");
};
document.querySelector("#impact-count").textContent = `${state.orders.length} peças reutilizadas`;
renderProducts(); renderCart(); renderOrders(); renderInventory(); renderTickets();
