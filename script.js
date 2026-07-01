let products = [];
let invoiceNo = 1;

function addProduct() {
  const name = document.getElementById("productName").value;
  const qty = Number(document.getElementById("productQty").value);
  const price = Number(document.getElementById("productPrice").value);

  if (!name || qty <= 0 || price <= 0) {
    alert("Invalid input");
    return;
  }

  products.push({
    name,
    qty,
    price,
    total: qty * price
  });

  render();
  calculate();
}

function render() {
  const table = document.getElementById("productList");
  table.innerHTML = "";

  products.forEach((p, i) => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.qty}</td>
        <td>${p.price}</td>
        <td>${p.total}</td>
        <td><button onclick="deleteItem(${i})">X</button></td>
      </tr>
    `;
  });
}

function deleteItem(i){
  products.splice(i,1);
  render();
  calculate();
}

function calculate(){
  let subtotal = products.reduce((a,b)=>a+b.total,0);
  let gst = subtotal * 0.18;
  let total = subtotal + gst;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("gst").innerText = gst.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);

  return {subtotal,gst,total};
}

function generateInvoice(){

  if(products.length === 0){
    alert("Add products first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const name = document.getElementById("customerName").value || "N/A";
  const phone = document.getElementById("customerPhone").value || "N/A";
  const address = document.getElementById("customerAddress").value || "N/A";

  let subtotal = 0;

  const rows = products.map(p=>{
    subtotal += p.total;
    return [p.name, p.qty, p.price, p.total];
  });

  let gst = subtotal * 0.18;
  let total = subtotal + gst;

  // HEADER
  doc.setFontSize(16);
  doc.text("INVOICE", 90, 10);

  doc.setFontSize(10);
  doc.text("GSTIN: 10BNAPK5138H1ZH", 10, 18);
  doc.text("Invoice No: INV-" + invoiceNo, 150, 18);

  // CUSTOMER
  doc.setFontSize(11);
  doc.text(`Customer: ${name}`, 10, 30);
  doc.text(`Phone: ${phone}`, 10, 38);
  doc.text(`Address: ${address}`, 10, 46);

  // TABLE
  doc.autoTable({
    startY: 55,
    head:[["Product","Qty","Price","Total"]],
    body: rows
  });

  let y = doc.lastAutoTable.finalY + 10;

  // TOTALS
  doc.text(`Subtotal: Rs ${subtotal.toFixed(2)}`, 10, y);
  doc.text(`GST (18%): Rs ${gst.toFixed(2)}`, 10, y+10);
  doc.text(`Total: Rs ${total.toFixed(2)}`, 10, y+20);

  doc.save(`invoice-${invoiceNo}.pdf`);

  saveHistory(name,total);
  invoiceNo++;
}

function saveHistory(name,total){
  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.push({
    name,
    total,
    date:new Date().toLocaleString()
  });

  localStorage.setItem("history",JSON.stringify(history));
  loadHistory();
}

function loadHistory(){
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let list = document.getElementById("history");

  list.innerHTML = "";

  history.forEach(h=>{
    list.innerHTML += `<li>${h.name} - ₹${h.total} (${h.date})</li>`;
  });
}

loadHistory();