// Home Screen — Dashboard, Map, SOS, Quick Actions, Mechanics
const HomeScreen = {
  map: null,
  mechanics: [],

  // Mock mechanics data for frontend-only demo
  mockMechanics: [
    {
      id: 1,
      name: 'Budi Santoso',
      specialty: 'Spesialis Ban & Rantai',
      rating: 4.8,
      distance: 1.2,
      lat: -6.2020,
      lng: 106.8510,
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      plate: 'B 1234 XYZ',
      totalJobs: 124,
      reviews: [
        { user: 'Andi M.', rating: 5, date: '2 Hari lalu', comment: 'Kerjanya cepat dan rapi. Ban bocor langsung beres dalam 15 menit.' },
        { user: 'Siska', rating: 4, date: '1 Minggu lalu', comment: 'Mekanik ramah, harganya juga transparan.' }
      ],
      jobHistory: [
        { service: 'Tambal Ban Tubeless', bike: 'Honda Vario 150', date: 'Kemarin' },
        { service: 'Ganti Rantai', bike: 'Yamaha Vixion', date: '3 Hari lalu' }
      ]
    },
    {
      id: 2,
      name: 'Agus Prasetyo',
      specialty: 'Mesin & Kelistrikan',
      rating: 4.9,
      distance: 1.8,
      lat: -6.2150,
      lng: 106.8400,
      photo: 'https://randomuser.me/api/portraits/men/45.jpg',
      plate: 'B 5678 ABC',
      totalJobs: 310,
      reviews: [
        { user: 'Dimas', rating: 5, date: 'Kemarin', comment: 'Ngga nyangka selarut ini masih ada mekanik yang mau datang. Top!' },
        { user: 'Rina', rating: 5, date: 'Bulan lalu', comment: 'Mas Agus sangat paham soal kelistrikan NMAX saya yang mati total.' }
      ],
      jobHistory: [
        { service: 'Jumper Aki', bike: 'Yamaha NMAX', date: 'Hari ini' },
        { service: 'Ganti Busi & Cek Mesin', bike: 'Honda Beat', date: 'Kemarin' }
      ]
    },
    {
      id: 3,
      name: 'Dedi Kurniawan',
      specialty: 'Derek & Darurat',
      rating: 4.7,
      distance: 2.3,
      lat: -6.2050,
      lng: 106.8350,
      photo: 'https://randomuser.me/api/portraits/men/67.jpg',
      plate: 'B 9012 DEF',
      totalJobs: 89,
      reviews: [
        { user: 'Fajar', rating: 5, date: '2 Minggu lalu', comment: 'Truk dereknya bersih, motor saya diikat dengan sangat aman.' }
      ],
      jobHistory: [
        { service: 'Towing ke Bengkel', bike: 'Kawasaki Ninja 250', date: 'Kemarin' }
      ]
    },
    {
      id: 4,
      name: 'Rudi Hartono',
      specialty: 'Servis Umum',
      rating: 4.6,
      distance: 2.8,
      lat: -6.1980,
      lng: 106.8520,
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      plate: 'B 3456 GHI',
      totalJobs: 215,
      reviews: [],
      jobHistory: []
    }
  ],

  async init() {
    this.initMap();
    await this.loadMechanics();
    this.bindEvents();
  },

  initMap() {
    if (this.map) return;
    this.map = MapComponent.createMap('map-home', MapComponent.USER_LOCATION, 14);
    MapComponent.addUserMarker(this.map);
  },

  async loadMechanics() {
    try {
      const res = await fetch('/api/mechanics');
      const data = await res.json();
      
      // Inject mock data for reviews & history since backend doesn't have it yet
      this.mechanics = data.map(m => {
        m.totalJobs = m.totalJobs || Math.floor(Math.random() * 200) + 10;
        m.reviews = m.reviews || [
          { user: 'Budi (Mock)', rating: 5, date: '1 Hari lalu', comment: 'Sangat responsif dan cepat.' },
          { user: 'Siska (Mock)', rating: 4, date: '2 Hari lalu', comment: 'Harga transparan, mekanik ramah.' }
        ];
        m.jobHistory = m.jobHistory || [
          { service: 'Tambal Ban Tubeless', bike: 'Honda Vario', date: 'Kemarin' },
          { service: 'Ganti Oli & Busi', bike: 'Yamaha NMAX', date: '3 Hari lalu' }
        ];
        return m;
      });
      
    } catch (err) {
      console.warn('API not available, using mock data:', err.message);
      this.mechanics = this.mockMechanics;
    }

    MechanicCard.renderList(this.mechanics, 'mechanics-list');

    // Add mechanic markers to map
    this.mechanics.forEach(m => {
      MapComponent.addMechanicMarker(this.map, [m.lat, m.lng], m.name);
    });
  },

  bindEvents() {
    // SOS Button
    document.getElementById('btn-sos')?.addEventListener('click', () => {
      AppState.serviceType = 'general';
      AppState.navigateTo('triage');
    });

    // Quick Action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AppState.serviceType = btn.dataset.service;
        AppState.navigateTo('triage');
      });
    });

    // Mechanic call buttons & Profile (delegated)
    document.getElementById('mechanics-list')?.addEventListener('click', (e) => {
      const callBtn = e.target.closest('.btn-call-mechanic');
      const mechanicCard = e.target.closest('.mechanic-card');
      
      if (callBtn) {
        // Direct call
        const mechanicId = parseInt(callBtn.dataset.mechanicId);
        AppState.selectedMechanic = this.mechanics.find(m => m.id === mechanicId);
        AppState.serviceType = 'general';
        AppState.navigateTo('triage');
      } else if (mechanicCard) {
        // Open Profile Modal
        const mechanicId = parseInt(mechanicCard.dataset.mechanicId);
        const mechanic = this.mechanics.find(m => m.id === mechanicId);
        if (mechanic && window.MechanicProfile) {
          window.MechanicProfile.open(mechanic);
        }
      }
    });
  },

  onShow() {
    if (this.map) MapComponent.invalidateSize(this.map);
  }
};
