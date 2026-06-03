// Triage Screen — Issue Form, AI Estimation, Two-Step Approval
const TriageScreen = {
  estimationData: null,

  // Mock estimation data for frontend-only demo
  mockEstimations: {
    flat_tire: {
      parts: [
        { name: 'Ban Dalam (IRC/Swallow)', price_min: 25000, price_max: 45000 },
        { name: 'Ban Luar (jika perlu)', price_min: 80000, price_max: 150000 },
        { name: 'Pentil Ban', price_min: 5000, price_max: 10000 }
      ],
      callout_fee: 25000,
      repair_fee_min: 30000,
      repair_fee_max: 50000,
      total_min: 85000,
      total_max: 255000,
      ai_summary: 'Berdasarkan deskripsi, kemungkinan besar ban dalam perlu diganti. Estimasi waktu perbaikan 15-25 menit.'
    },
    engine: {
      parts: [
        { name: 'Busi (NGK/Denso)', price_min: 15000, price_max: 35000 },
        { name: 'CDI (jika perlu)', price_min: 75000, price_max: 200000 },
        { name: 'Koil Pengapian', price_min: 40000, price_max: 100000 }
      ],
      callout_fee: 25000,
      repair_fee_min: 50000,
      repair_fee_max: 100000,
      total_min: 130000,
      total_max: 435000,
      ai_summary: 'Mogok mesin bisa disebabkan beberapa faktor. Mekanik akan melakukan diagnosa langsung di lokasi. Estimasi waktu 20-40 menit.'
    },
    towing: {
      parts: [],
      callout_fee: 50000,
      repair_fee_min: 100000,
      repair_fee_max: 250000,
      total_min: 150000,
      total_max: 300000,
      ai_summary: 'Layanan derek darurat. Jarak ke Bengkel Mitra terdekat: 4.2 KM. Truk derek akan menjemput Anda dan membawa kendaraan ke bengkel mitra kami.'
    },
    general: {
      parts: [
        { name: 'Komponen umum', price_min: 20000, price_max: 100000 }
      ],
      callout_fee: 25000,
      repair_fee_min: 40000,
      repair_fee_max: 80000,
      total_min: 85000,
      total_max: 205000,
      ai_summary: 'Mekanik akan melakukan diagnosa di lokasi dan memberikan estimasi biaya yang lebih akurat setelah pemeriksaan.'
    }
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Back button
    document.getElementById('btn-triage-back')?.addEventListener('click', () => {
      AppState.navigateTo('home');
    });

    // Quick fill buttons
    document.querySelectorAll('.quick-fill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('issue-description').value = btn.dataset.text;
        // Highlight active quick fill
        document.querySelectorAll('.quick-fill-btn').forEach(b => b.classList.remove('ring-2', 'ring-primary', 'border-primary', 'text-primary'));
        btn.classList.add('ring-2', 'ring-primary', 'border-primary', 'text-primary');
      });
    });

    // Vehicle selection 'other' logic
    ['brand', 'type'].forEach(field => {
      const select = document.getElementById(`vehicle-${field}`);
      const otherInput = document.getElementById(`vehicle-${field}-other`);
      if (select && otherInput) {
        select.addEventListener('change', (e) => {
          if (e.target.value === 'other') {
            otherInput.classList.remove('hidden');
            otherInput.focus();
          } else {
            otherInput.classList.add('hidden');
            otherInput.value = '';
          }
        });
      }
    });

    // Estimate button
    document.getElementById('btn-estimate')?.addEventListener('click', () => {
      this.requestEstimation();
    });

    // Approve button
    document.getElementById('btn-approve')?.addEventListener('click', () => {
      this.approveOrder();
    });
  },

  onShow() {
    // Update service badge
    const badge = document.getElementById('selected-service-badge');
    const labels = {
      flat_tire: '🔧 Ban Bocor',
      engine: '⚙️ Mogok Mesin',
      towing: '🚛 Derek Darurat',
      general: '🔧 Layanan Umum'
    };
    if (badge) {
      badge.textContent = labels[AppState.serviceType] || labels.general;
    }
    // Reset form
    document.getElementById('estimation-result')?.classList.add('hidden');
    document.getElementById('estimation-loading')?.classList.add('hidden');
  },

  async requestEstimation() {
    const rawDescription = document.getElementById('issue-description').value.trim();
    if (!rawDescription) {
      alert('Mohon jelaskan masalah kendaraan Anda');
      return;
    }

    // Compile vehicle string
    const brandSelect = document.getElementById('vehicle-brand');
    const typeSelect = document.getElementById('vehicle-type');
    const yearInput = document.getElementById('vehicle-year');
    
    let brand = brandSelect && brandSelect.value ? brandSelect.value : '';
    if (brand === 'other') brand = document.getElementById('vehicle-brand-other').value.trim();
    
    let type = typeSelect && typeSelect.value ? typeSelect.value : '';
    if (type === 'other') type = document.getElementById('vehicle-type-other').value.trim();
    
    const year = yearInput && yearInput.value ? yearInput.value.trim() : '';

    let vehicleContext = '';
    if (brand || type || year) {
      // Filter out empty strings and join with space
      const vehicleName = [brand, type, year].filter(Boolean).join(' ');
      if (vehicleName) {
        vehicleContext = `Kendaraan: ${vehicleName}\n`;
      }
    }

    const fullDescription = `${vehicleContext}Keluhan: ${rawDescription}`;

    // Show loading
    document.getElementById('estimation-loading')?.classList.remove('hidden');
    document.getElementById('estimation-result')?.classList.add('hidden');
    const btnEstimate = document.getElementById('btn-estimate');
    if (btnEstimate) btnEstimate.disabled = true;

    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: fullDescription,
          service_type: AppState.serviceType || 'general'
        })
      });
      this.estimationData = await res.json();
    } catch (err) {
      console.warn('API not available, using mock estimation:', err.message);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.estimationData = this.mockEstimations[AppState.serviceType] || this.mockEstimations.general;
    }

    this.renderEstimation();
    document.getElementById('estimation-loading')?.classList.add('hidden');
    if (btnEstimate) btnEstimate.disabled = false;
  },

  renderEstimation() {
    const data = this.estimationData;
    if (!data) return;

    // Parts list
    const partsList = document.getElementById('parts-list');
    if (partsList) {
      partsList.innerHTML = data.parts.map(p => `
        <div class="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span class="text-gray-300 text-sm">${p.name}</span>
          <span class="text-white text-sm font-medium">Rp ${p.price_min.toLocaleString('id-ID')} - ${p.price_max.toLocaleString('id-ID')}</span>
        </div>
      `).join('');
    }

    // Fees
    const calloutEl = document.getElementById('callout-fee');
    if (calloutEl) calloutEl.textContent = `Rp ${data.callout_fee.toLocaleString('id-ID')}`;

    const repairEl = document.getElementById('repair-fee');
    if (repairEl) repairEl.textContent = `Rp ${data.repair_fee_min.toLocaleString('id-ID')} - ${data.repair_fee_max.toLocaleString('id-ID')}`;

    const totalEl = document.getElementById('total-fee');
    if (totalEl) totalEl.textContent = `Rp ${data.total_min.toLocaleString('id-ID')} - ${data.total_max.toLocaleString('id-ID')}`;

    // AI Summary
    const summaryEl = document.getElementById('ai-summary');
    if (summaryEl && data.ai_summary) {
      summaryEl.textContent = data.ai_summary;
      summaryEl.classList.remove('hidden');
    }

    // Show result with animation
    const resultEl = document.getElementById('estimation-result');
    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.classList.add('slide-up');
    }
  },

  async approveOrder() {
    if (!this.estimationData) return;

    // Pick a mechanic (selected or first available)
    const mechanic = AppState.selectedMechanic || (HomeScreen.mechanics.length > 0 ? HomeScreen.mechanics[0] : null);
    if (!mechanic) {
      alert('Tidak ada mekanik tersedia');
      return;
    }

    const btnApprove = document.getElementById('btn-approve');
    if (btnApprove) {
      btnApprove.disabled = true;
      btnApprove.innerHTML = '<span class="loading-dot inline-block w-2 h-2 bg-white rounded-full mx-0.5"></span><span class="loading-dot inline-block w-2 h-2 bg-white rounded-full mx-0.5"></span><span class="loading-dot inline-block w-2 h-2 bg-white rounded-full mx-0.5"></span>';
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanic_id: mechanic.id,
          service_type: AppState.serviceType,
          description: document.getElementById('issue-description').value,
          estimated_cost_min: this.estimationData.total_min,
          estimated_cost_max: this.estimationData.total_max
        })
      });
      const order = await res.json();
      AppState.currentOrder = order;
      AppState.selectedMechanic = order.mechanic || mechanic;
      AppState.navigateTo('tracking');
    } catch (err) {
      console.warn('API not available, simulating order:', err.message);
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 800));
      AppState.currentOrder = {
        id: Date.now(),
        mechanic: mechanic,
        estimated_arrival: 8,
        status: 'accepted'
      };
      AppState.selectedMechanic = mechanic;
      AppState.navigateTo('tracking');
    } finally {
      if (btnApprove) {
        btnApprove.disabled = false;
        btnApprove.innerHTML = '✅ Setuju & Lanjutkan';
      }
    }
  }
};
