let products = [];
let invoiceNo = 1;

// ADD PRODUCT (NOW WITH RATE INPUT)
function addProduct() {

  const name = document.getElementById("productName").value.trim();
  const qty = Number(document.getElementById("productQty").value);
  const rate = Number(document.getElementById("productRate").value);

  if (!name || qty <= 0 || rate <= 0) {
    alert("Enter valid product, qty and rate");
    return;
  }

  const total = qty * rate;

  products.push({
    name,
    qty,
    rate,
    total
  });

  clearInputs();
  render();
  calculate();
}

// CLEAR INPUTS
function clearInputs() {
  document.getElementById("productName").value = "";
  document.getElementById("productQty").value = "";
  document.getElementById("productRate").value = "";
}

// RENDER TABLE
function render() {

  const table = document.getElementById("productList");
  table.innerHTML = "";

  products.forEach((p, i) => {

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.qty}</td>
        <td>${p.rate}</td>
        <td>${p.total}</td>
        <td><button onclick="deleteItem(${i})">❌</button></td>
      </tr>
    `;
  });
}

// DELETE ITEM
function deleteItem(i) {
  products.splice(i, 1);
  render();
  calculate();
}

// CALCULATE BILL
function calculate() {

  let subtotal = products.reduce((a, b) => a + b.total, 0);
  let gst = subtotal * 0.18;
  let total = subtotal + gst;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("gst").innerText = gst.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);

  return { subtotal, gst, total };
}

// GENERATE INVOICE
function generateInvoice() {

  if (products.length === 0) {
    alert("Add products first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const name = document.getElementById("customerName").value || "N/A";
  const phone = document.getElementById("customerPhone").value || "N/A";
  const address = document.getElementById("customerAddress").value || "N/A";

  let subtotal = 0;

  const rows = products.map(p => {
    subtotal += p.total;
    return [p.name, p.qty, p.rate, p.total];
  });

  let gst = subtotal * 0.18;
  let total = subtotal + gst;

  // HEADER
  doc.setFontSize(16);
  doc.text("JMD CEMENT MATERIAL PRODUCT COMPANY", 20, 10);

  doc.setFontSize(10);
  doc.text("GSTIN: 10BNAPK5138H1ZH", 20, 18);
  doc.text("Invoice No: INV-" + invoiceNo, 150, 18);

  // CUSTOMER
  doc.setFontSize(11);
  doc.text(`Customer: ${name}`, 20, 30);
  doc.text(`Phone: ${phone}`, 20, 38);
  doc.text(`Address: ${address}`, 20, 46);

  // TABLE
  doc.autoTable({
    startY: 55,
    head: [["Product", "Qty", "Rate", "Total"]],
    body: rows
  });

  let y = doc.lastAutoTable.finalY + 10;

  doc.text(`Subtotal: Rs ${subtotal.toFixed(2)}`, 20, y);
  doc.text(`GST (18%): Rs ${gst.toFixed(2)}`, 20, y + 10);
  doc.text(`Total: Rs ${total.toFixed(2)}`, 20, y + 20);

  doc.save(`invoice-${invoiceNo}.pdf`);

  saveHistory(name, total);

  invoiceNo++;
}

// SAVE HISTORY
function saveHistory(name, total) {

  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.push({
    name,
    total,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("history", JSON.stringify(history));

  loadHistory();
}

// LOAD HISTORY
function loadHistory() {

  let history = JSON.parse(localStorage.getItem("history")) || [];
  let list = document.getElementById("history");

  list.innerHTML = "";

  history.forEach(h => {
    list.innerHTML += `<li>${h.name} - Rs ${h.total} (${h.date})</li>`;
  });
}

loadHistory();

