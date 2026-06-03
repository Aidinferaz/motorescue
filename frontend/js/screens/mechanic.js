const MechanicApp = {
  isOnline: false,
  map: null,
  mechanicMarker: null,
  customerMarker: null,
  estimateItems: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('btn-toggle-online')?.addEventListener('click', () => {
      this.toggleOnline();
    });
  },

  toggleOnline() {
    this.isOnline = !this.isOnline;
    const btn = document.getElementById('btn-toggle-online');
    const knob = document.getElementById('toggle-knob');
    const indicator = document.getElementById('toggle-indicator');
    const statusText = document.getElementById('mechanic-status-text');
    const emptyState = document.getElementById('mechanic-empty-state');
    const mockOrder = document.getElementById('mechanic-mock-order');

    if (this.isOnline) {
      // Set to Online
      btn.classList.replace('bg-slate-300', 'bg-emerald-500');
      btn.classList.replace('dark:bg-slate-700', 'bg-emerald-500');
      knob.style.transform = 'translateX(32px)';
      indicator.classList.replace('bg-slate-400', 'bg-emerald-500');
      statusText.textContent = 'ONLINE (MENUNGGU PESANAN)';
      statusText.classList.replace('text-primary', 'text-emerald-500');
      
      // Simulate incoming order after 3 seconds
      setTimeout(() => {
        if (this.isOnline) {
          statusText.textContent = 'PESANAN BARU MASUK!';
          statusText.classList.replace('text-emerald-500', 'text-primary');
          
          // Hide empty state
          emptyState.classList.add('opacity-0');
          setTimeout(() => emptyState.classList.add('hidden'), 300);
          
          // Show mock order with slide up animation
          mockOrder.classList.remove('hidden');
          setTimeout(() => {
             mockOrder.classList.remove('translate-y-10', 'opacity-0');
             mockOrder.classList.add('translate-y-0', 'opacity-100');
          }, 50);
        }
      }, 3000);
    } else {
      // Set to Offline
      btn.classList.replace('bg-emerald-500', 'bg-slate-300');
      btn.classList.replace('bg-emerald-500', 'dark:bg-slate-700'); // if it was dark mode, toggle back to neutral
      btn.className = 'w-16 h-8 rounded-full relative transition-all shadow-inner bg-slate-300 dark:bg-slate-700';
      knob.style.transform = 'translateX(0)';
      indicator.className = 'w-2 h-2 rounded-full bg-slate-400 transition-colors';
      
      statusText.textContent = 'OFFLINE';
      statusText.classList.remove('text-emerald-500');
      statusText.classList.add('text-primary');
      
      emptyState.classList.remove('hidden');
      setTimeout(() => emptyState.classList.remove('opacity-0'), 50);
      
      mockOrder.classList.add('translate-y-10', 'opacity-0');
      mockOrder.classList.remove('translate-y-0', 'opacity-100');
      setTimeout(() => mockOrder.classList.add('hidden'), 500);
    }
  },

  onShowHome() {
    // Reset things if needed
  },

  onShowTracking() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    // Simulate mechanic location slightly offset from customer
    const customerLoc = [-6.200000, 106.816666]; // Jakarta mock
    const mechanicLoc = [customerLoc[0] + 0.015, customerLoc[1] + 0.015];

    this.map = L.map('map-mechanic-tracking', { zoomControl: false }).setView(mechanicLoc, 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Customer Marker
    const custIcon = L.divIcon({
      className: 'tracking-cust',
      html: '<div style="width:30px;height:30px;background:#3B82F6;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;font-size:14px">👤</div>',
      iconSize: [30, 30]
    });
    this.customerMarker = L.marker(customerLoc, { icon: custIcon }).addTo(this.map);

    // Mechanic Marker
    const mechIcon = L.divIcon({
      className: 'tracking-mech',
      html: '<div style="width:36px;height:36px;background:#E11D48;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;font-size:18px;box-shadow:0 4px 10px rgba(0,0,0,0.3)">🏍️</div>',
      iconSize: [36, 36]
    });
    this.mechanicMarker = L.marker(mechanicLoc, { icon: mechIcon }).addTo(this.map);
    
    // Draw route line
    L.polyline([mechanicLoc, customerLoc], { color: '#E11D48', weight: 4, dashArray: '5 5' }).addTo(this.map);
    
    this.map.fitBounds([mechanicLoc, customerLoc], { padding: [40, 40] });
  },

  arriveAtCustomer() {
    AppState.navigateTo('mechanic-service');
  },

  onShowService() {
    // Initialize/Reset all steps
    this.updateServiceUI(1, 'active'); // Step 1 starts active
    this.updateServiceUI(2, 'pending');
    this.updateServiceUI(3, 'pending');
    
    // Reset inner HTML for icons
    document.getElementById('mech-icon-1').innerHTML = '<span class="font-bold">1</span>';
    document.getElementById('mech-icon-2').innerHTML = '<span class="font-bold">2</span>';
    document.getElementById('mech-icon-3').innerHTML = '<span class="font-bold">3</span>';
  },

  setServiceStep(step) {
    if (step === 1) {
      this.showDiagnosaModal();
    } else if (step === 2) {
      this.updateServiceUI(2, 'completed');
      this.updateServiceUI(3, 'active');
    } else if (step === 3) {
      alert('Tugas Selesai! Tagihan telah dikirim ke Customer.');
      AppState.navigateTo('mechanic-home');
      // Reset state for next order
      document.getElementById('mechanic-empty-state').classList.remove('hidden');
      document.getElementById('mechanic-mock-order').classList.add('hidden');
      document.getElementById('mechanic-status-text').textContent = 'Mencari pesanan di sekitar...';
    }
  },

  updateServiceUI(step, state) {
    const card = document.getElementById(`mech-card-${step}`);
    const icon = document.getElementById(`mech-icon-${step}`);
    const btn = document.getElementById(`mech-btn-${step}`);
    
    if (!card || !icon || !btn) return;
    
    if (state === 'pending') {
      card.classList.add('opacity-50');
      icon.className = 'w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 font-black shrink-0 transition-all duration-300';
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      if (step === 1) btn.textContent = 'MULAI DIAGNOSA';
      if (step === 2) btn.textContent = 'MULAI PERBAIKAN';
      if (step === 3) btn.textContent = 'KIRIM TAGIHAN (Rp150.000)';
    } else if (state === 'active') {
      card.classList.remove('opacity-50');
      icon.className = 'w-12 h-12 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-black shrink-0 transition-all duration-300 shadow-md transform scale-110';
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else if (state === 'completed') {
      card.classList.remove('opacity-50');
      icon.className = 'w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black shrink-0 transition-all duration-300 shadow-md';
      icon.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
      btn.disabled = true;
      btn.classList.add('opacity-50');
      btn.textContent = 'SELESAI';
    }
  },

  showEstimateModal() {
    this.estimateItems = []; // reset items
    this.addEstimateItem(); // add one empty item initially
    
    const modal = document.getElementById('modal-mechanic-estimate');
    const backdrop = document.getElementById('estimate-backdrop');
    const content = document.getElementById('estimate-content');
    
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Trigger animation
    setTimeout(() => {
      backdrop?.classList.remove('opacity-0');
      content?.classList.remove('translate-y-full');
    }, 50);
  },

  hideEstimateModal() {
    const modal = document.getElementById('modal-mechanic-estimate');
    const backdrop = document.getElementById('estimate-backdrop');
    const content = document.getElementById('estimate-content');
    
    backdrop?.classList.add('opacity-0');
    content?.classList.add('translate-y-full');
    
    setTimeout(() => {
      modal?.classList.add('hidden');
    }, 300);
  },

  addEstimateItem() {
    this.estimateItems.push({ name: '', price: '' });
    this.renderEstimateItems();
  },

  removeEstimateItem(index) {
    this.estimateItems.splice(index, 1);
    this.renderEstimateItems();
  },

  updateEstimateItem(index, field, value) {
    this.estimateItems[index][field] = value;
    this.calculateEstimateTotal();
  },

  calculateEstimateTotal() {
    let total = 0;
    this.estimateItems.forEach(item => {
      if (item.price) total += parseInt(item.price) || 0;
    });
    const el = document.getElementById('estimate-total');
    if (el) el.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(total)}`;
    return total;
  },

  renderEstimateItems() {
    const container = document.getElementById('estimate-items-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.estimateItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'flex gap-2 items-start bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 relative shadow-sm';
      div.innerHTML = `
        <div class="flex-1 space-y-2">
          <input type="text" placeholder="Nama item/jasa (contoh: Tambal Ban)" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white" value="${item.name}" oninput="MechanicApp.updateEstimateItem(${index}, 'name', this.value)">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-bold bg-slate-200 dark:bg-slate-700 px-2 py-2 rounded-lg">Rp</span>
            <input type="number" placeholder="Harga" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white" value="${item.price}" oninput="MechanicApp.updateEstimateItem(${index}, 'price', this.value)">
          </div>
        </div>
        <button onclick="MechanicApp.removeEstimateItem(${index})" class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 hover:bg-red-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      `;
      container.appendChild(div);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    this.calculateEstimateTotal();
  },

  submitEstimate() {
    const total = this.calculateEstimateTotal();
    if (total <= 0) {
      alert('Tolong masukkan setidaknya satu item perbaikan dengan harga!');
      return;
    }
    
    this.hideEstimateModal();
    
    // Save this cost to be used in step 3
    const btn3 = document.getElementById('mech-btn-3');
    const finalBill = total + 25000; // adding 25k default callout fee
    if (btn3) btn3.textContent = `KIRIM TAGIHAN (Rp${new Intl.NumberFormat('id-ID').format(finalBill)})`;
    
    // Proceed to tracking map
    AppState.navigateTo('mechanic-tracking');
  },

  showDiagnosaModal() {
    const modal = document.getElementById('modal-mechanic-diagnosa');
    const backdrop = document.getElementById('diagnosa-backdrop');
    const content = document.getElementById('diagnosa-content');
    
    // Check if empty, at least one item
    if (this.estimateItems.length === 0) {
      this.estimateItems.push({ name: '', price: '' });
    }
    this.renderDiagnosaItems();
    
    if (!modal) return;
    modal.classList.remove('hidden');
    
    setTimeout(() => {
      backdrop?.classList.remove('opacity-0');
      content?.classList.remove('translate-y-full');
    }, 50);
  },

  hideDiagnosaModal() {
    const modal = document.getElementById('modal-mechanic-diagnosa');
    const backdrop = document.getElementById('diagnosa-backdrop');
    const content = document.getElementById('diagnosa-content');
    
    backdrop?.classList.add('opacity-0');
    content?.classList.add('translate-y-full');
    
    setTimeout(() => {
      modal?.classList.add('hidden');
    }, 300);
  },

  addDiagnosaItem() {
    this.estimateItems.push({ name: '', price: '' });
    this.renderDiagnosaItems();
  },

  removeDiagnosaItem(index) {
    this.estimateItems.splice(index, 1);
    this.renderDiagnosaItems();
    this.checkTowingStatus();
  },

  updateDiagnosaItem(index, field, value) {
    this.estimateItems[index][field] = value;
    this.calculateDiagnosaTotal();
  },

  toggleTowing() {
    const hasTowing = this.estimateItems.some(item => item.name === 'Jasa Derek Darurat');
    
    if (hasTowing) {
      this.estimateItems = this.estimateItems.filter(item => item.name !== 'Jasa Derek Darurat');
    } else {
      // Find index of towing or just push
      this.estimateItems.unshift({ name: 'Jasa Derek Darurat', price: '250000', isReadonly: true });
    }
    
    this.renderDiagnosaItems();
    this.checkTowingStatus();
  },
  
  checkTowingStatus() {
    const btn = document.getElementById('btn-toggle-towing');
    if (!btn) return;
    const hasTowing = this.estimateItems.some(item => item.name === 'Jasa Derek Darurat');
    if (hasTowing) {
      btn.textContent = 'Hapus';
      btn.classList.add('bg-rose-100', 'dark:bg-rose-500/20', 'text-rose-600', 'border-rose-200');
      btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-200', 'dark:border-slate-700');
    } else {
      btn.textContent = 'Tambah';
      btn.classList.remove('bg-rose-100', 'dark:bg-rose-500/20', 'text-rose-600', 'border-rose-200');
      btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-200', 'dark:border-slate-700');
    }
  },

  calculateDiagnosaTotal() {
    let total = 0;
    this.estimateItems.forEach(item => {
      if (item.price) total += parseInt(item.price) || 0;
    });
    const el = document.getElementById('diagnosa-total');
    if (el) el.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(total)}`;
    return total;
  },

  renderDiagnosaItems() {
    const container = document.getElementById('diagnosa-items-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.estimateItems.forEach((item, index) => {
      const isReadonly = item.isReadonly ? 'readonly disabled' : '';
      const bgClass = item.isReadonly ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-slate-50 dark:bg-slate-800';
      
      const div = document.createElement('div');
      div.className = `flex gap-2 items-start ${bgClass} p-3 rounded-xl border border-slate-200 dark:border-slate-700 relative shadow-sm`;
      div.innerHTML = `
        <div class="flex-1 space-y-2">
          <input type="text" ${isReadonly} placeholder="Nama item/jasa" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800" value="${item.name}" oninput="MechanicApp.updateDiagnosaItem(${index}, 'name', this.value)">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-bold bg-slate-200 dark:bg-slate-700 px-2 py-2 rounded-lg">Rp</span>
            <input type="number" ${isReadonly} placeholder="Harga" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800" value="${item.price}" oninput="MechanicApp.updateDiagnosaItem(${index}, 'price', this.value)">
          </div>
        </div>
        <button onclick="MechanicApp.removeDiagnosaItem(${index})" class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 hover:bg-red-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      `;
      container.appendChild(div);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    this.calculateDiagnosaTotal();
    this.checkTowingStatus();
  },

  submitDiagnosa() {
    const total = this.calculateDiagnosaTotal();
    if (total <= 0) {
      alert('Tolong masukkan setidaknya satu item perbaikan dengan harga!');
      return;
    }
    
    this.hideDiagnosaModal();
    
    this.updateServiceUI(1, 'completed');
    this.updateServiceUI(2, 'active');
    
    // Save this cost to be used in step 3
    const btn3 = document.getElementById('mech-btn-3');
    const finalBill = total + 25000; // adding 25k default callout fee
    if (btn3) btn3.textContent = `KIRIM TAGIHAN (Rp${new Intl.NumberFormat('id-ID').format(finalBill)})`;
    
    alert('Diagnosa berhasil diupdate! Lanjut ke tahap perbaikan.');
  }
};
