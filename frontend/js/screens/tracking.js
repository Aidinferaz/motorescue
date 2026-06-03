// Tracking Screen — Real-time mechanic tracking simulation
const TrackingScreen = {
  map: null,
  mechanicMarker: null,
  workshopMarker: null,
  routeLine: null,
  trackingInterval: null,
  etaInterval: null,
  currentStep: 0,
  totalSteps: 20,
  waypointsPhase1: [],
  waypointsPhase2: [],
  isTowing: false,
  towingPhase: 1, // 1 = To User, 2 = To Workshop
  workshopLocation: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('btn-call-mechanic-track')?.addEventListener('click', () => {
      alert('📞 Menghubungi...');
    });
    document.getElementById('btn-back-home')?.addEventListener('click', () => {
      this.stopTracking();
      AppState.navigateTo('home');
    });
  },

  onShow() {
    const mechanic = AppState.selectedMechanic;
    if (!mechanic) return;

    this.isTowing = (AppState.serviceType === 'towing');
    this.towingPhase = 1;

    // Update mechanic info
    const photoEl = document.getElementById('mechanic-photo');
    if (photoEl) photoEl.src = mechanic.photo;

    const nameEl = document.getElementById('mechanic-name');
    if (nameEl) nameEl.textContent = mechanic.name;

    const plateEl = document.getElementById('mechanic-plate');
    if (plateEl) plateEl.textContent = mechanic.plate || 'B XXXX XXX';

    document.getElementById('arrival-message')?.classList.add('hidden');
    document.getElementById('arrival-message')?.classList.remove('celebrate');
    document.getElementById('tracking-info-panel')?.classList.remove('hidden');

    this.initMap(mechanic);
    this.startTracking(mechanic);
  },

  initMap(mechanic) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.workshopMarker = null;

    this.map = MapComponent.createMap('map-tracking', MapComponent.USER_LOCATION, 14);
    MapComponent.addUserMarker(this.map);

    // Phase 1 Waypoints (Mechanic -> User)
    this.waypointsPhase1 = this.generateWaypoints(
      [mechanic.lat, mechanic.lng],
      MapComponent.USER_LOCATION,
      this.totalSteps
    );

    const bounds = [[mechanic.lat, mechanic.lng], MapComponent.USER_LOCATION];

    // If Towing, setup Phase 2
    if (this.isTowing) {
      // Fake workshop location ~2-4km away
      this.workshopLocation = [
        MapComponent.USER_LOCATION[0] + 0.015,
        MapComponent.USER_LOCATION[1] + 0.020
      ];
      bounds.push(this.workshopLocation);

      this.waypointsPhase2 = this.generateWaypoints(
        MapComponent.USER_LOCATION,
        this.workshopLocation,
        this.totalSteps
      );

      // Add Workshop Marker
      const shopIcon = L.divIcon({
        className: 'tracking-shop',
        html: '<div style="width:40px;height:40px;background:#3B82F6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🏪</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      this.workshopMarker = L.marker(this.workshopLocation, { icon: shopIcon }).addTo(this.map);
    }

    // Add mechanic marker at starting position
    const mechIcon = L.divIcon({
      className: 'tracking-mechanic',
      html: '<div style="width:44px;height:44px;background:#E11D48;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 0 4px rgba(225,29,72,0.3),0 4px 12px rgba(0,0,0,0.4);border:3px solid white;">' + (this.isTowing ? '🚛' : '🏍️') + '</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
    this.mechanicMarker = L.marker(this.waypointsPhase1[0], { icon: mechIcon }).addTo(this.map);

    // Draw route line for phase 1
    this.routeLine = L.polyline(this.waypointsPhase1, {
      color: '#E11D48',
      weight: 4,
      opacity: 0.7,
      dashArray: '8 8'
    }).addTo(this.map);

    // Fit bounds
    this.map.fitBounds(bounds, { padding: [50, 50] });
  },

  generateWaypoints(start, end, steps) {
    const waypoints = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const jitter = i > 0 && i < steps ? (Math.random() - 0.5) * 0.002 : 0;
      waypoints.push([
        start[0] + (end[0] - start[0]) * t + jitter,
        start[1] + (end[1] - start[1]) * t + jitter
      ]);
    }
    return waypoints;
  },

  startTracking(mechanic) {
    this.currentStep = 0;
    this.stopTracking();

    this.updateStatusUI(1);

    const etaMinutes = AppState.currentOrder?.estimated_arrival || 8;
    this.startPhaseInterval(this.waypointsPhase1, etaMinutes, () => {
      if (!this.isTowing) {
        this.onArrival();
      } else {
        // Transition to Phase 2
        this.towingPhase = 2;
        this.currentStep = 0;
        this.updateStatusUI(2);
        
        // Update route line to point to workshop
        this.routeLine.setLatLngs(this.waypointsPhase2);
        this.routeLine.setStyle({ color: '#3B82F6' });
        
        const phase2Eta = 15; // fake ETA for towing to workshop
        this.startPhaseInterval(this.waypointsPhase2, phase2Eta, () => {
          this.onArrival();
        });
      }
    });
  },

  startPhaseInterval(waypoints, etaMinutes, onComplete) {
    if (this.trackingInterval) clearInterval(this.trackingInterval);
    if (this.etaInterval) clearInterval(this.etaInterval);

    let remainingSeconds = etaMinutes * 60;
    const intervalSpeed = 500; // 500ms * 20 steps = 10 seconds total
    const etaDropRate = remainingSeconds / this.totalSteps;

    const etaEl = document.getElementById('eta-minutes');
    if (etaEl) etaEl.textContent = etaMinutes;

    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = '0%';

    this.trackingInterval = setInterval(() => {
      this.currentStep++;
      if (this.currentStep >= this.totalSteps) {
        clearInterval(this.trackingInterval);
        clearInterval(this.etaInterval);
        if (onComplete) onComplete();
        return;
      }
      this.mechanicMarker.setLatLng(waypoints[this.currentStep]);
      this.map.panTo(waypoints[this.currentStep], { animate: true, duration: 0.5 });

      const progress = (this.currentStep / this.totalSteps) * 100;
      if (progressFill) progressFill.style.width = `${progress}%`;
      
      // Fast drop ETA to sync with the 10-second animation
      remainingSeconds -= etaDropRate;
      if (remainingSeconds < 0) remainingSeconds = 0;
      const mins = Math.max(1, Math.ceil(remainingSeconds / 60));
      if (etaEl) etaEl.textContent = mins;
      
    }, intervalSpeed);

    // We don't need a separate 1000ms interval for ETA anymore since it drops per step
    this.etaInterval = setInterval(() => {}, 100000); 
  },

  updateStatusUI(phase) {
    const step2Text = document.getElementById('step-2-text');
    const step3Text = document.getElementById('step-3-text');
    const step2Icon = document.getElementById('step-2-icon');
    const step3Icon = document.getElementById('step-3-icon');

    if (phase === 1) {
      if (step2Text) step2Text.textContent = this.isTowing ? 'Truk Derek Menuju Anda' : 'Mekanik dalam perjalanan';
      if (step3Text) step3Text.textContent = this.isTowing ? 'Menuju Bengkel Mitra' : 'Perbaikan dimulai';
      
      // Highlight step 2
      step2Icon?.classList.add('bg-primary/10', 'dark:bg-primary/20', 'text-primary', 'border-primary/20', 'eta-pulse');
      step2Icon?.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-400');
      step2Text?.classList.add('text-slate-900', 'dark:text-white', 'font-bold');
      step2Text?.classList.remove('text-slate-500', 'font-medium');
      
      // Reset step 3
      step3Icon?.classList.remove('bg-blue-100', 'dark:bg-blue-900/20', 'text-blue-500', 'border-blue-500/20', 'eta-pulse');
      step3Icon?.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-400', 'dark:text-slate-500');
      step3Text?.classList.remove('text-blue-600', 'dark:text-blue-400', 'font-bold');
      step3Text?.classList.add('text-slate-500', 'dark:text-slate-500', 'font-medium');

    } else if (phase === 2) {
      if (step2Text) step2Text.textContent = 'Kendaraan diangkut';
      if (step3Text) step3Text.textContent = 'Menderek ke Bengkel Mitra...';
      
      // Stop pulse on step 2, highlight step 3
      step2Icon?.classList.remove('eta-pulse', 'text-primary');
      step2Icon?.classList.add('text-emerald-500', 'bg-emerald-100', 'dark:bg-emerald-500/20');
      step3Icon?.classList.add('bg-blue-100', 'dark:bg-blue-900/20', 'text-blue-500', 'border-blue-500/20', 'eta-pulse');
      step3Icon?.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-400', 'dark:text-slate-500');
      
      step3Text?.classList.add('text-blue-600', 'dark:text-blue-400', 'font-bold');
      step3Text?.classList.remove('text-slate-500', 'dark:text-slate-500', 'font-medium');
    }
  },

  stopTracking() {
    if (this.trackingInterval) clearInterval(this.trackingInterval);
    if (this.etaInterval) clearInterval(this.etaInterval);
    this.trackingInterval = null;
    this.etaInterval = null;
  },

  onArrival() {
    this.stopTracking();
    if (this.isTowing) {
      this.mechanicMarker.setLatLng(this.workshopLocation);
    } else {
      this.mechanicMarker.setLatLng(MapComponent.USER_LOCATION);
    }

    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = '100%';

    const etaEl = document.getElementById('eta-minutes');
    if (etaEl) etaEl.textContent = '0';

    // Update messages
    const titleEl = document.getElementById('arrival-title');
    const descEl = document.getElementById('arrival-desc');
    if (titleEl && descEl) {
      if (this.isTowing) {
        titleEl.textContent = 'Tiba di Bengkel Mitra!';
        descEl.textContent = 'Kendaraan Anda telah sampai di bengkel mitra dan siap ditangani.';
      } else {
        titleEl.textContent = 'Mekanik Telah Tiba!';
        descEl.textContent = 'Mekanik sudah di lokasi Anda dan siap membantu masalah kendaraan Anda.';
      }
    }

    const arrivalEl = document.getElementById('arrival-message');
    if (arrivalEl) {
      arrivalEl.classList.remove('hidden');
      arrivalEl.classList.add('celebrate');
    }

    const infoPanel = document.getElementById('tracking-info-panel');
    if (infoPanel) infoPanel.classList.add('hidden');
  }
};
