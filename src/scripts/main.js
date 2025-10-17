'use strict';

const table = document.querySelector('table');
const thead = table.querySelector('thead');
const tbody = table.querySelector('tbody');

// ===== СОРТУВАННЯ =====
let sortColumn = null;
let sortDirection = 'asc';

thead.addEventListener('click', (ev) => {
  const th = ev.target.closest('th');

  if (!th) {
    return;
  }

  const index = Array.from(thead.querySelectorAll('th')).indexOf(th);

  if (sortColumn === index) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = index;
    sortDirection = 'asc';
  }

  const rows = Array.from(tbody.querySelectorAll('tr'));

  rows.sort((a, b) => {
    const aText = a.children[index].textContent.trim();
    const bText = b.children[index].textContent.trim();

    if (index === 3 || index === 4) {
      const aNum = parseFloat(aText.replace(/[^\d.]/g, ''));
      const bNum = parseFloat(bText.replace(/[^\d.]/g, ''));

      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    } else {
      return sortDirection === 'asc'
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    }
  });

  tbody.innerHTML = '';
  rows.forEach((r) => tbody.append(r));
});

// ===== ВИДІЛЕННЯ РЯДКА =====
tbody.addEventListener('click', (ev) => {
  const row = ev.target.closest('tr');

  if (!row) {
    return;
  }

  tbody.querySelectorAll('tr').forEach((r) => r.classList.remove('active'));
  row.classList.add('active');
});

// ===== ФОРМА =====
const form = document.createElement('form');

form.className = 'new-employee-form';

form.innerHTML = `
  <label>Name: <input name="name" type="text" data-qa="name" required></label>
  <label>Position: <input name="position" type="text" data-qa="position" required></label>
  <label>Office:
    <select name="office" data-qa="office" required>
      <option>Tokyo</option>
      <option>Singapore</option>
      <option>London</option>
      <option>New York</option>
      <option>Edinburgh</option>
      <option>San Francisco</option>
    </select>
  </label>
  <label>Age: <input name="age" type="number" min="18" max="90" step="1" data-qa="age" required></label>
  <label>Salary: <input name="salary" type="number" min="1" step="1" data-qa="salary" required></label>
  <button type="submit">Save to table</button>
`;
document.body.append(form);

// ===== НОТИФІКАЦІЯ =====
function showNotification(title, message, type = 'success') {
  // прибираємо стару, якщо є
  document.querySelector('[data-qa="notification"]')?.remove();

  const notification = document.createElement('div');

  notification.className = `notification ${type}`;
  notification.dataset.qa = 'notification';

  notification.innerHTML = `
    <span class="title">${title}</span>
    <p>${message}</p>
  `;
  document.body.append(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ===== ФОРМАТ ЗАРПЛАТИ =====
function formatSalary(value) {
  return `$${Number(value).toLocaleString('en-US')}`;
}

// ===== ОБРОБКА ФОРМИ =====
form.addEventListener('submit', (ev) => {
  ev.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const nameEmpl = data.name.trim();
  const position = data.position.trim();
  const office = data.office;
  const age = Number(data.age);
  const salary = Number(data.salary);

  if (nameEmpl.length < 4) {
    showNotification(
      'Error',
      'The name must contain at least 4 letters',
      'error',
    );

    return;
  }

  if (position.trim().length < 2) {
    showNotification(
      'Error',
      'The position must contain at least 2 letters',
      'error',
    );

    return;
  }

  if (!age || isNaN(age) || age < 18 || age > 90) {
    showNotification('Error', 'Age must be between 18 and 90 years', 'error');

    return;
  }

  if (!salary || isNaN(salary) || salary <= 0) {
    showNotification('Error', 'Salary must be greater than 0', 'error');

    return;
  }

  const newRow = document.createElement('tr');

  newRow.innerHTML = `
    <td>${nameEmpl}</td>
    <td>${position}</td>
    <td>${office}</td>
    <td>${age}</td>
    <td>${formatSalary(salary)}</td>
  `;

  tbody.append(newRow);
  form.reset();
  showNotification('Success', 'Employee added successfully', 'success');

  // якщо зараз є активне сортування — пересортуй
  if (sortColumn !== null) {
    const e = new Event('click');

    thead.querySelectorAll('th')[sortColumn].dispatchEvent(e);
  }
});

// ===== РЕДАГУВАННЯ КЛІТИНКИ =====
let activeInput = null;

tbody.addEventListener('dblclick', (ev) => {
  const cell = ev.target.closest('td');

  if (!cell || cell.querySelector('input')) {
    return;
  }

  if (activeInput) {
    activeInput.blur();
  }

  const oldValue = cell.textContent.trim();
  const input = document.createElement('input');

  input.className = 'cell-input';
  input.value = oldValue.replace(/\$/g, '').replace(/,/g, '');
  cell.textContent = '';
  cell.append(input);
  input.focus();
  activeInput = input;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveCell();
    }
  });

  input.addEventListener('blur', saveCell);

  function saveCell() {
    let newValue = input.value.trim();

    if (!newValue) {
      newValue = oldValue;
    }

    const index = cell.cellIndex;

    if (index === 4) {
      newValue = formatSalary(Number(newValue));
    }

    cell.textContent = newValue;
    activeInput = null;
  }
});
