// app.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('injectionForm');
  const historyList = document.getElementById('historyList');
  const nextInjection = document.getElementById('nextInjection');

  let injections = JSON.parse(localStorage.getItem('injections')) || [];

  // Request notification permission
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('injectionDate').value;
    const location = document.getElementById('bodyLocation').value;
    const sideEffects = document.getElementById('sideEffects').value;
    const serial = document.getElementById('serialNumber').value;

    const injection = { date, location, sideEffects, serial };
    injections.push(injection);
    localStorage.setItem('injections', JSON.stringify(injections));

    form.reset();
    displayHistory();
    displayNextInjection();
    scheduleNotifications();
  });

  // Display all logged injections
  function displayHistory() {
    historyList.innerHTML = '';
    injections.forEach((inj) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Date:</strong> ${inj.date} <br> 
                      <strong>Location:</strong> ${inj.location} <br>
                      <strong>Side Effects:</strong> ${inj.sideEffects || 'None'} <br>
                      <strong>Serial Number:</strong> ${inj.serial}`;
      historyList.appendChild(li);
    });
  }

  // Display next scheduled injection date
  function displayNextInjection() {
    if (injections.length === 0) {
      nextInjection.innerText = 'No injections logged yet.';
      return;
    }

    const lastInjection = new Date(injections[injections.length - 1].date);
    const nextDate = new Date(lastInjection);
    nextDate.setDate(lastInjection.getDate() + 14);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    nextInjection.innerText = `Next injection due: ${nextDate.toLocaleDateString(undefined, options)}`;

    localStorage.setItem('nextInjectionDate', nextDate);
  }

  // Schedule browser notifications
  function scheduleNotifications() {
    if (Notification.permission !== 'granted') return;

    const nextDateStored = localStorage.getItem('nextInjectionDate');
    if (!nextDateStored) return;

    const nextDate = new Date(nextDateStored);
    const now = new Date();

    const diffMs = nextDate - now;
    const hours48 = 48 * 60 * 60 * 1000;
    const hours24 = 24 * 60 * 60 * 1000;

    if (diffMs > 0) {
      // Schedule 48h notification
      setTimeout(() => {
        new Notification('Reminder: Infliximab injection due in 48 hours.');
      }, diffMs - hours48);

      // Schedule 24h notification
      setTimeout(() => {
        new Notification('Reminder: Infliximab injection due in 24 hours.');
      }, diffMs - hours24);
    }
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  }

  // Load everything immediately
  displayHistory();
  displayNextInjection();
  scheduleNotifications();
});
