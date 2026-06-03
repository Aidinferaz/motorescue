// Theme Manager
const ThemeManager = {
  init() {
    const btnToggle = document.getElementById('btn-theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    const htmlEl = document.documentElement;

    // Check saved preference or system preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      htmlEl.classList.add('dark');
      if (iconSun) iconSun.classList.remove('hidden');
      if (iconMoon) iconMoon.classList.add('hidden');
    } else {
      htmlEl.classList.remove('dark');
      if (iconSun) iconSun.classList.add('hidden');
      if (iconMoon) iconMoon.classList.remove('hidden');
    }

    // Toggle button click listener
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        htmlEl.classList.toggle('dark');
        const isDark = htmlEl.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (isDark) {
          iconSun.classList.remove('hidden');
          iconMoon.classList.add('hidden');
        } else {
          iconSun.classList.add('hidden');
          iconMoon.classList.remove('hidden');
        }
      });
    }
  }
};

// App State & Router
const AppState = {
  currentScreen: 'login',
  role: 'customer', // 'customer' or 'mechanic'
  serviceType: 'general',
  selectedMechanic: null,
  currentOrder: null,

  setRole(r) {
    this.role = r;
  },

  navigateTo(screen) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.add('hidden');
      s.classList.remove('slide-in');
    });

    // Show target screen
    const target = document.getElementById(`screen-${screen}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('slide-in');
    }

    // Update bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.screen === screen) {
        btn.classList.add('active', 'text-primary');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('active', 'text-primary');
        btn.classList.add('text-slate-400');
      }
    });

    // Call screen-specific onShow
    this.currentScreen = screen;
    switch (screen) {
      case 'home': HomeScreen.onShow(); break;
      case 'triage': TriageScreen.onShow(); break;
      case 'tracking': TrackingScreen.onShow(); break;
      case 'service': ServiceScreen.onShow(); break;
      case 'mechanic-home': MechanicApp.onShowHome(); break;
      case 'mechanic-tracking': MechanicApp.onShowTracking(); break;
      case 'mechanic-service': MechanicApp.onShowService(); break;
    }

    // Toggle bottom nav visibility
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      if (screen === 'login' || this.role === 'mechanic') {
        bottomNav.classList.add('hidden');
      } else {
        bottomNav.classList.remove('hidden');
      }
    }

    // Scroll to top of the screen container
    const container = document.getElementById('app-container');
    if (container) container.scrollTop = 0;
  }
};

// Update status bar time
function updateStatusBarTime() {
  const timeEl = document.getElementById('status-time');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Theme
  ThemeManager.init();

  // Update time
  updateStatusBarTime();
  setInterval(updateStatusBarTime, 60000);

  // Init all screens
  await HomeScreen.init();
  TriageScreen.init();
  TrackingScreen.init();
  ServiceScreen.init();
  MechanicApp.init();

  // Bottom nav click handlers
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.navigateTo(btn.dataset.screen);
    });
  });

  // Show login screen initially
  AppState.navigateTo('login');
});
