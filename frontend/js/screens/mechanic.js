const MechanicApp = {
  isOnline: false,
  map: null,
  mechanicMarker: null,
  customerMarker: null,

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
      this.updateServiceUI(1, 'completed');
      this.updateServiceUI(2, 'active');
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
  }
};
