const TelegramBot = require('node-telegram-bot-api');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildAdded, onValue, update } = require('firebase/database');

const token = '8638802638:AAEO1sTX73rFi_y8mQLA5BY2ygDoBuS8D3Y';
const bot = new TelegramBot(token, {polling: true});

const firebaseConfig = {apiKey:"AIzaSyAeL4HVPaea7ZCfI3jg1HFcJlv1nxnOm8g",databaseURL:"https://aura-premium-shop-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"aura-premium-shop"};
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

let adminList = [];
onValue(ref(db, 'admins'), (snap) => {adminList = []; snap.forEach(c=>{ let a=c.val(); a.id=c.key; adminList.push(a); });});

bot.on('message', (msg) => {if(msg.text == '/start'){bot.sendMessage(msg.chat.id, `✅ আপনি Order Admin হিসাবে যুক্ত হলেন\nআপনার Chat ID: ${msg.chat.id}`);}});

const ordersRef = ref(db, 'orders');
onChildAdded(ordersRef, (snapshot) => {
  const order = snapshot.val(); 
  if(order.assignedTo) return; 
  if(adminList.length == 0) return; 
  let selectedAdmin = adminList.reduce((prev, curr) => (prev.orderCount || 0) < (curr.orderCount || 0) ? prev : curr); 
  update(ref(db, 'orders/' + snapshot.key), {assignedTo: selectedAdmin.name}); 
  update(ref(db, 'admins/' + selectedAdmin.id), {orderCount: (selectedAdmin.orderCount || 0) + 1}); 
  let message = `🔥 আপনার জন্য নতুন Order!\n\n📦 Product: ${order.order}\n🆔 Order ID: ${order.orderId}\n\nCustomer কে এই Payment Info দিন:\nBkash: ${selectedAdmin.bkash}\nNagad: ${selectedAdmin.nagad}`; 
  bot.sendMessage(selectedAdmin.telegram, message); 
  bot.sendMessage(7803284941, `Order ${order.orderId} Assigned to: ${selectedAdmin.name}`);
});
console.log('Bot Running with Auto Assign...');
