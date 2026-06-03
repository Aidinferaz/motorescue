const ServiceScreen = {
  diagnosisTimeout: null,
  repairTimeout: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Payment method selection
    document.querySelectorAll('.payment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Reset all buttons
        document.querySelectorAll('.payment-btn').forEach(b => {
          b.classList.remove('ring-2', 'ring-primary', 'border-primary');
        });
        
        // Highlight selected
        const currentBtn = e.currentTarget;
        currentBtn.classList.add('ring-2', 'ring-primary', 'border-primary');
        
        const method = currentBtn.dataset.method;
        this.showPaymentMockup(method);
      });
    });

    // Simulate Pay button
    document.getElementById('btn-simulate-pay')?.addEventListener('click', () => {
      this.showReviewModal();
    });
    
    // Review Modal Logic
    const stars = document.querySelectorAll('.review-star');
    let selectedRating = 5;
    
    stars.forEach(star => {
      star.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        selectedRating = parseInt(btn.dataset.value);
        
        // Update star colors
        stars.forEach(s => {
          if (parseInt(s.dataset.value) <= selectedRating) {
            s.classList.replace('text-slate-300', 'text-yellow-400');
            s.classList.replace('dark:text-slate-700', 'text-yellow-400');
          } else {
            s.classList.replace('text-yellow-400', 'text-slate-300');
            // Hacky fallback for dark mode class
            if (document.documentElement.classList.contains('dark')) {
               s.classList.replace('text-slate-300', 'dark:text-slate-700');
            }
          }
        });
      });
    });
    
    document.getElementById('btn-submit-review')?.addEventListener('click', () => {
      this.hideReviewModal();
      alert(`✅ Ulasan berhasil dikirim (${selectedRating} Bintang)! Terima kasih telah menggunakan MotoRescue.ID.`);
      AppState.navigateTo('home');
    });

    document.getElementById('btn-skip-review')?.addEventListener('click', () => {
      this.hideReviewModal();
      alert('✅ Pembayaran Berhasil! Terima kasih telah menggunakan MotoRescue.ID.');
      AppState.navigateTo('home');
    });
  },
  
  showReviewModal() {
    const modal = document.getElementById('modal-review');
    const backdrop = document.getElementById('review-backdrop');
    const content = document.getElementById('review-content');
    
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Trigger animation
    setTimeout(() => {
      backdrop?.classList.remove('opacity-0');
      content?.classList.remove('opacity-0', 'scale-95');
      content?.classList.add('opacity-100', 'scale-100');
    }, 50);
  },
  
  hideReviewModal() {
    const modal = document.getElementById('modal-review');
    const backdrop = document.getElementById('review-backdrop');
    const content = document.getElementById('review-content');
    
    backdrop?.classList.add('opacity-0');
    content?.classList.remove('opacity-100', 'scale-100');
    content?.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
      modal?.classList.add('hidden');
    }, 300);
  },

  onShow() {
    this.resetUI();
    this.startServiceSimulation();
    
    // Load pricing from AppState
    const repairFee = AppState.currentOrder?.total_min || 125000;
    const totalFee = repairFee + 25000; // callout fee
    
    const formatCurrency = (num) => 'Rp ' + num.toLocaleString('id-ID');
    
    const elRepair = document.getElementById('service-repair-fee');
    const elTotal = document.getElementById('service-total-fee');
    
    if (elRepair) elRepair.textContent = formatCurrency(repairFee);
    if (elTotal) elTotal.textContent = formatCurrency(totalFee);
  },

  resetUI() {
    // Reset styling for steps
    this.setStepStatus('diagnosa', 'active');
    this.setStepStatus('perbaikan', 'pending');
    this.setStepStatus('pembayaran', 'pending');
    
    // Hide payment section
    document.getElementById('payment-section')?.classList.add('hidden');
    document.getElementById('payment-mockup')?.classList.add('hidden');
    
    // Clear any existing timeouts
    if (this.diagnosisTimeout) clearTimeout(this.diagnosisTimeout);
    if (this.repairTimeout) clearTimeout(this.repairTimeout);
  },

  startServiceSimulation() {
    // Step 1: Diagnosa (Wait 4 seconds)
    this.diagnosisTimeout = setTimeout(() => {
      this.setStepStatus('diagnosa', 'completed');
      this.setStepStatus('perbaikan', 'active');
      
      // Step 2: Perbaikan (Wait 4 seconds)
      this.repairTimeout = setTimeout(() => {
        this.setStepStatus('perbaikan', 'completed');
        this.setStepStatus('pembayaran', 'active');
        
        // Show payment section
        document.getElementById('payment-section')?.classList.remove('hidden');
        
        // Scroll to bottom
        const container = document.getElementById('app-container');
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
      }, 4000);
      
    }, 4000);
  },

  setStepStatus(step, status) {
    const iconEl = document.getElementById(`icon-${step}`);
    const textEl = document.getElementById(`text-${step}`);
    const lineEl = document.getElementById(`line-${step}`); // line below the step

    if (!iconEl || !textEl) return;

    // Reset classes
    iconEl.className = 'w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 transition-all duration-300 ';
    
    if (status === 'pending') {
      iconEl.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-400');
      textEl.classList.add('text-slate-500', 'dark:text-slate-400');
      textEl.classList.remove('text-slate-900', 'dark:text-white', 'text-primary');
      if (lineEl) lineEl.className = 'absolute left-[15px] top-8 bottom-[-24px] w-[2px] transition-colors duration-300 bg-slate-200 dark:bg-slate-700';
    } 
    else if (status === 'active') {
      iconEl.classList.add('bg-primary/10', 'dark:bg-primary/20', 'text-primary', 'border', 'border-primary/20', 'eta-pulse');
      textEl.classList.add('text-slate-900', 'dark:text-white');
      textEl.classList.remove('text-slate-500', 'dark:text-slate-400', 'text-primary');
      if (lineEl) lineEl.className = 'absolute left-[15px] top-8 bottom-[-24px] w-[2px] transition-colors duration-300 bg-slate-200 dark:bg-slate-700';
    } 
    else if (status === 'completed') {
      iconEl.classList.add('bg-emerald-100', 'dark:bg-emerald-500/20', 'text-emerald-500');
      iconEl.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
      
      textEl.classList.add('text-slate-900', 'dark:text-white');
      textEl.classList.remove('text-slate-500', 'dark:text-slate-400', 'text-primary');
      
      // Color the line green
      if (lineEl) lineEl.className = 'absolute left-[15px] top-8 bottom-[-24px] w-[2px] transition-colors duration-300 bg-emerald-500/50';
    }
  },
  
  showPaymentMockup(method) {
    const mockupEl = document.getElementById('payment-mockup');
    const nameEl = document.getElementById('payment-method-name');
    const qrEl = document.getElementById('payment-qr');
    const btnSimulate = document.getElementById('btn-simulate-pay');
    
    mockupEl.classList.remove('hidden');
    
    if (method === 'Tunai') {
      qrEl.classList.add('hidden');
      nameEl.textContent = 'Bayar Tunai ke Mekanik';
      btnSimulate.textContent = 'Simulasi: Uang Diterima';
    } else {
      qrEl.classList.remove('hidden');
      nameEl.textContent = `Bayar dengan ${method}`;
      btnSimulate.textContent = 'Konfirmasi Pembayaran';
      
      // Change QR color based on method
      let colorClass = 'text-slate-300 dark:text-slate-600'; // default
      if (method === 'QRIS') colorClass = 'text-blue-500';
      else if (method === 'GoPay') colorClass = 'text-green-500';
      else if (method === 'OVO') colorClass = 'text-purple-500';
      
      qrEl.innerHTML = `<svg class="w-20 h-20 ${colorClass}" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"></path></svg>`;
    }
    
    // Scroll to bottom so mockup is visible
    const container = document.getElementById('app-container');
    if (container) {
      setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }
};
