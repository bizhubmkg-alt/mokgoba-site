// app.js - loads services & contact, handles orders and bot
document.addEventListener('DOMContentLoaded', async () => {
  const servicesGrid = document.getElementById('servicesGrid');
  const orderSelect = document.getElementById('orderServiceSelect');
  const phoneLink = document.getElementById('phoneLink');
  const whatsLinkFull = document.getElementById('whatsLinkFull');
  const navWhats = document.getElementById('nav-whatsapp');

  const botPanel = document.getElementById('botPanel');
  const botToggle = document.getElementById('botToggle');
  const botForm = document.getElementById('botForm');
  const botInput = document.getElementById('botInput');
  const botMessages = document.getElementById('botMessages');
  const orderForm = document.getElementById('orderForm');
  const orderResult = document.getElementById('orderResult');

  const [cRes, sRes] = await Promise.all([fetch('/api/contact'), fetch('/api/services')]);
  const contactJson = await cRes.json();
  const servicesJson = await sRes.json();
  const contact = (contactJson.success && contactJson.contact) ? contactJson.contact : null;
  const services = (servicesJson.success && servicesJson.services) ? servicesJson.services : [];

  if (contact) {
    phoneLink.href = `tel:${contact.phoneLocal}`;
    whatsLinkFull.href = `https://wa.me/${contact.whatsappInternational}`;
    navWhats.href = `https://wa.me/${contact.whatsappInternational}`;
  }

  function buildCard(s){
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="/images/${s.image}" alt="${s.title}" />
      <h3>${s.title} <span style="float:right;color:var(--accent);font-weight:700">R${s.price}</span></h3>
      <p>${s.description}</p>
      <div class="card-actions">
        <a class="btn" href="https://wa.me/${contact ? contact.whatsappInternational : ''}?text=${encodeURIComponent('Hi, I want: '+s.title)}" target="_blank">WhatsApp</a>
        <button class="btn btn-primary btn-order" data-id="${s.id}">Order</button>
      </div>
    `;
    return el;
  }

  services.forEach(s => {
    servicesGrid.appendChild(buildCard(s));
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.innerText = `${s.title} — R${s.price}`;
    orderSelect.appendChild(opt);
  });

  document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = +btn.dataset.id;
      const svc = services.find(x => x.id === id);
      orderSelect.value = id;
      orderForm.customerName.value = '';
      orderForm.customerPhone.value = '';
      orderForm.notes.value = `Ordering: ${svc.title}`;
      orderForm.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });

  orderForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = new FormData(orderForm);
    const payload = {
      customerName: form.get('customerName'),
      customerPhone: form.get('customerPhone'),
      serviceId: +form.get('serviceId'),
      serviceTitle: services.find(s => s.id === +form.get('serviceId')).title,
      notes: form.get('notes')
    };
    const res = await fetch('/api/order', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (j && j.success) {
      orderResult.innerText = 'Order placed — we will contact you on WhatsApp shortly.';
      orderForm.reset();
      setTimeout(()=>orderResult.innerText = '', 6000);
    } else {
      orderResult.innerText = 'There was an error placing the order. Please contact us on WhatsApp.';
    }
  });

  function botSay(html) {
    const d = document.createElement('div');
    d.className = 'bot-message';
    d.innerHTML = html;
    botMessages.appendChild(d);
    botMessages.scrollTop = botMessages.scrollHeight;
  }

  botForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = botInput.value.trim();
    if (!q) return;
    const userDiv = document.createElement('div');
    userDiv.className = 'bot-message';
    userDiv.style.background = 'linear-gradient(90deg, rgba(255,0,51,0.15), rgba(255,255,255,0.02))';
    userDiv.innerText = q;
    botMessages.appendChild(userDiv);
    botInput.value = '';
    botMessages.scrollTop = botMessages.scrollHeight;

    const ql = q.toLowerCase();
    if (ql.includes('menu') || ql.includes('services')) {
      botSay('Here are the main services:');
      botSay(services.map(s => `${s.title} — R${s.price}`).join('<br>'));
    } else if (ql.includes('price') || ql.includes('cost') || ql.match(/\br[0-9]+\b/)) {
      const found = services.filter(s => ql.includes(s.title.toLowerCase()) || ql.includes(s.category?.toLowerCase()));
      if (found.length) {
        botSay(found.map(f => `${f.title}: R${f.price}`).join('<br>'));
      } else {
        botSay('Tell me the service name (e.g., "printing") or type "menu".');
      }
    } else if (ql.includes('contact') || ql.includes('whatsapp') || ql.includes('phone')) {
      botSay(`You can WhatsApp us here: <a href="https://wa.me/${contact.whatsappInternational}" target="_blank">Open WhatsApp</a>`);
    } else if (ql.includes('order')) {
      botSay('To place an order please fill the form in the Contact section, or click WhatsApp on a service card.');
    } else {
      botSay('I can show services, prices, or help you place an order. Try: "menu", "price printing", or "contact".');
    }
  });

  botToggle.addEventListener('click', () => {
    botPanel.classList.toggle('closed');
    if (botPanel.classList.contains('closed')) {
      botPanel.style.transform = 'translateY(12px)';
      botPanel.style.opacity = '0.96';
    } else {
      botPanel.style.transform = 'translateY(0)';
      botPanel.style.opacity = '1';
    }
  });

  if (window.gsap) {
    gsap.from('.hero-title', {y: 20, opacity: 0, duration: 0.8});
    gsap.from('.hero-sub', {y: 8, opacity: 0, duration: 0.9, delay: 0.12});
    gsap.from('.hero-media img', {scale:0.98, opacity:0, duration:0.9, delay:0.18});
    gsap.from('.card', {opacity:0, y:18, stagger:0.06, duration:0.8, delay:0.2});
  }
});
