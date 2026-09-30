const sys = {
    db: {
        p: JSON.parse(localStorage.getItem('np_p')) || [
            { name: "NEURAL LINK V1", brand: "CYBERDYNE", price: 4500, stock: 12 },
            { name: "QUANTUM CHIP", brand: "INTEL_CORE", price: 8900, stock: 5 }
        ],
        s: JSON.parse(localStorage.getItem('np_s')) || [],
        c: JSON.parse(localStorage.getItem('np_c')) || []
    },
    cart: [],
    selectedIcon: 'fa-bolt',

    initCanvas: () => {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        }));

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#00f2ff';
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }
        draw();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    },

    toast: (msg) => {
        const container = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${msg}`;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },

    boot: () => {
        document.getElementById('boot-sequence').style.transform = 'translateY(-100%)';
        setTimeout(() => { 
            document.getElementById('boot-sequence').classList.add('hidden'); 
            document.getElementById('scr-auth').classList.remove('hidden'); 
        }, 500);
    },

    selIcon: (el, icon) => {
        document.querySelectorAll('.icon-opt').forEach(opt => opt.classList.remove('selected'));
        el.classList.add('selected'); 
        sys.selectedIcon = icon;
    },

    launch: () => {
        const shop = document.getElementById('f-shop').value || "AURA_NODE_01";
        const mail = document.getElementById('f-mail').value || "OPERATOR@AURA";
        document.getElementById('disp-shop').innerText = shop;
        document.getElementById('disp-mail').innerText = mail;
        document.getElementById('active-icon').className = 'fa-solid ' + sys.selectedIcon;
        document.getElementById('scr-auth').classList.add('hidden');
        document.getElementById('app-wrap').style.display = 'flex';
        
        sys.to('home');
        sys.startTelemetry();
        sys.toast("NEURAL LINK ESTABLISHED");
    },

    startTelemetry: () => {
        setInterval(() => {
            document.getElementById('cpu-val').innerText = Math.floor(Math.random() * 20 + 10) + '%';
            document.getElementById('ram-val').innerText = (Math.random() * 0.5 + 3.2).toFixed(1) + 'GB';
            document.getElementById('live-clock').innerText = new Date().toLocaleTimeString();
        }, 1000);
    },

    to: (id, el) => {
        document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
        document.querySelectorAll('.nav-node').forEach(n => n.classList.remove('active'));
        document.getElementById('pg-' + id).classList.remove('hidden');
        
        if (el) el.classList.add('active');
        if (id === 'home') sys.updateStats();
        if (id === 'inv') sys.renderP();
        if (id === 'bill') sys.renderPOS();
        if (id === 'cust') sys.renderC();
        if (id === 'debt') sys.renderD();
    },

    saveP: () => {
        const name = document.getElementById('f-pname').value;
        const brand = document.getElementById('f-pbrand').value;
        const price = Number(document.getElementById('f-pprice').value);
        const stock = Number(document.getElementById('f-pstock').value);

        if (!name || isNaN(price)) return sys.toast("INVALID NODE PARAMETERS");

        const p = { name, brand, price, stock };
        const id = document.getElementById('f-pid').value;

        if (id !== "") sys.db.p[id] = p; else sys.db.p.push(p);
        localStorage.setItem('np_p', JSON.stringify(sys.db.p));
        
        sys.closeM(); 
        sys.renderP();
        sys.toast("RESOURCE NODE SAVED");
    },

    renderP: () => {
        document.getElementById('list-p').innerHTML = sys.db.p.map((p, i) => `
            <tr>
                <td><b>${p.name}</b></td>
                <td>${p.brand}</td>
                <td>₹${p.price}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="sys.editP(${i})" style="color:var(--cyan); background:none; border:none; cursor:pointer"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="sys.delP(${i})" style="color:var(--danger); background:none; border:none; cursor:pointer; margin-left:12px"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>`).join('');
    },

    editP: (i) => {
        const p = sys.db.p[i];
        document.getElementById('f-pname').value = p.name; 
        document.getElementById('f-pbrand').value = p.brand; 
        document.getElementById('f-pprice').value = p.price; 
        document.getElementById('f-pstock').value = p.stock; 
        document.getElementById('f-pid').value = i;
        sys.openM();
    },

    delP: (i) => { 
        sys.db.p.splice(i, 1); 
        localStorage.setItem('np_p', JSON.stringify(sys.db.p)); 
        sys.renderP();
        sys.toast("NODE PURGED");
    },

    renderPOS: () => {
        const q = (document.getElementById('p-search').value || '').toLowerCase();
        const filter = sys.db.p.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
        document.getElementById('pos-grid').innerHTML = filter.map(p => `
            <div class="p-node" onclick="sys.addCart('${p.name}')">
                <small style="color:var(--cyan); font-family:'Share Tech Mono'">${p.brand}</small>
                <div style="font-weight:700; font-size:15px; margin:6px 0;">${p.name}</div>
                <b style="color:var(--text-main)">₹${p.price}</b>
                <div style="font-size:11px; color:var(--text-muted); margin-top:4px">AVAIL: ${p.stock}</div>
            </div>`).join('');
    },

    addCart: (name) => {
        const p = sys.db.p.find(x => x.name === name);
        if (!p || p.stock <= 0) return sys.toast("RESOURCE DEPLETED");
        
        const existing = sys.cart.find(item => item.name === name);
        if (existing) {
            if (existing.qty < p.stock) existing.qty++;
            else return sys.toast("MAX AVAILABLE STOCK REACHED");
        } else {
            sys.cart.push({ ...p, qty: 1 });
        }
        sys.renderCart();
    },

    renderCart: () => {
        let t = 0;
        document.getElementById('cart-list').innerHTML = sys.cart.map((item, idx) => { 
            const subtotal = item.price * item.qty;
            t += subtotal; 
            return `
                <div class="cart-item">
                    <div>
                        <div>${item.name}</div>
                        <small style="color:var(--text-muted)">₹${item.price} x ${item.qty}</small>
                    </div>
                    <div class="cart-controls">
                        <button class="cart-btn" onclick="sys.updateQty(${idx}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="cart-btn" onclick="sys.updateQty(${idx}, 1)">+</button>
                    </div>
                </div>`; 
        }).join('');
        document.getElementById('cart-total').innerText = '₹' + t;
    },

    updateQty: (idx, delta) => {
        const item = sys.cart[idx];
        const original = sys.db.p.find(p => p.name === item.name);
        
        item.qty += delta;
        if (item.qty > original.stock) item.qty = original.stock;
        if (item.qty <= 0) sys.cart.splice(idx, 1);
        
        sys.renderCart();
    },

    checkout: (status) => {
        if (!sys.cart.length) return sys.toast("CART MATRIX EMPTY");
        const name = document.getElementById('b-name').value || 'CITIZEN_ANONYMOUS';
        const phone = document.getElementById('b-phone').value || 'UNLINKED';
        const addr = document.getElementById('b-addr').value || 'UNKNOWN_SECTOR';
        const total = sys.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        const sale = { name, phone, addr, total, status, time: new Date().toLocaleString(), items: [...sys.cart] };
        
        sys.db.s.push(sale);
        sys.cart.forEach(c => { 
            const original = sys.db.p.find(p => p.name === c.name);
            if (original) original.stock -= c.qty; 
        });
        
        if (!sys.db.c.find(x => x.phone === phone)) sys.db.c.push({ name, phone, addr });
        
        localStorage.setItem('np_p', JSON.stringify(sys.db.p));
        localStorage.setItem('np_s', JSON.stringify(sys.db.s));
        localStorage.setItem('np_c', JSON.stringify(sys.db.c));

        if (status === 'Paid') sys.printBill(sale);
        sys.cart = []; 
        sys.to('home');
        
        document.getElementById('b-name').value = ''; 
        document.getElementById('b-phone').value = ''; 
        document.getElementById('b-addr').value = '';
        sys.toast(`TRANSACTION EXECUTED [${status.toUpperCase()}]`);
    },

    printBill: (s) => {
        const zone = document.getElementById('receipt-render');
        const shop = document.getElementById('disp-shop').innerText;
        zone.innerHTML = `
            <center>
                <h2 style="margin:0">${shop}</h2>
                <p style="margin:5px 0">TX_ID: ${Date.now()}</p>
            </center>
            <hr>
            <p>DATE: ${s.time}<br>CITIZEN: ${s.name}<br>PHONE: ${s.phone}</p>
            <hr>
            <table style="width:100%; border:none; color:black">
                ${s.items.map(i => `<tr><td>${i.name} (x${i.qty})</td><td align="right">₹${i.price * i.qty}</td></tr>`).join('')}
            </table>
            <hr>
            <h3 style="display:flex; justify-content:space-between"><span>TOTAL</span><span>₹${s.total}</span></h3>
            <center style="margin-top:20px">
                <div style="font-family: monospace; letter-spacing: 4px;">|||||||||||||||||||||||</div>
                <p style="font-size:10px; margin-top:5px">AURA OS QUANTUM PRINT ENGINE</p>
            </center>
        `;
        window.print();
    },

    updateStats: () => {
        const r = sys.db.s.filter(s => s.status === 'Paid').reduce((a, b) => a + b.total, 0);
        const d = sys.db.s.filter(s => s.status === 'Unpaid').reduce((a, b) => a + b.total, 0);
        document.getElementById('st-rev').innerText = r;
        document.getElementById('st-debt').innerText = d;
        document.getElementById('st-cust').innerText = sys.db.c.length;
    },

    renderC: () => {
        document.getElementById('list-c').innerHTML = sys.db.c.map(c => `
            <tr>
                <td><b>${c.name}</b></td>
                <td>${c.phone}</td>
                <td>${c.addr}</td>
                <td style="color:var(--success)">VERIFIED</td>
            </tr>`).join('');
    },

    renderD: () => {
        const unpaid = sys.db.s.filter(s => s.status === 'Unpaid');
        document.getElementById('list-d').innerHTML = unpaid.map((s) => `
            <tr>
                <td>${s.name}</td>
                <td>${s.phone}</td>
                <td style="color:var(--danger)">₹${s.total}</td>
                <td>${s.time}</td>
                <td><button class="btn-cyber" style="padding:6px 12px; font-size:10px; width:auto" onclick="sys.clearD(${sys.db.s.indexOf(s)})">RESOLVE DEBT</button></td>
            </tr>`).join('');
    },

    clearD: (idx) => { 
        sys.db.s[idx].status = 'Paid'; 
        localStorage.setItem('np_s', JSON.stringify(sys.db.s)); 
        sys.renderD(); 
        sys.toast("DEBT RESOLVED");
    },

    openM: () => document.getElementById('modal-p').classList.remove('hidden'),
    closeM: () => { 
        document.getElementById('modal-p').classList.add('hidden'); 
        document.getElementById('f-pid').value = ""; 
        document.querySelectorAll('#modal-p input').forEach(i => i.value = ""); 
    }
};

window.onload = () => sys.initCanvas();
