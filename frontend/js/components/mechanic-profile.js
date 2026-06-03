const MechanicProfile = {
  containerId: 'modal-mechanic-profile',

  open(mechanic) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Generate Reviews HTML
    const reviewsHtml = (mechanic.reviews || []).map(r => {
      const stars = Array.from({length: 5}, (_, i) => {
        const isFilled = i < Math.round(r.rating);
        return `<svg class="w-3 h-3 ${isFilled ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
      }).join('');
      return `
        <div class="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
          <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-slate-900 dark:text-white text-sm">${r.user}</span>
            <span class="text-[10px] text-slate-400">${r.date}</span>
          </div>
          <div class="flex mb-2">${stars}</div>
          <p class="text-xs text-slate-600 dark:text-slate-300 italic">"${r.comment}"</p>
        </div>
      `;
    }).join('');

    // Generate History HTML
    const historyHtml = (mechanic.jobHistory || []).map(h => `
      <div class="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
        <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <div class="flex-1">
          <h4 class="font-bold text-slate-900 dark:text-white text-xs">${h.service}</h4>
          <p class="text-[10px] text-slate-500">${h.bike}</p>
        </div>
        <span class="text-[10px] text-slate-400 font-medium">${h.date}</span>
      </div>
    `).join('');

    // Set inner HTML
    container.innerHTML = `
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity opacity-0" id="mech-profile-backdrop"></div>
      
      <!-- Bottom Sheet -->
      <div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2rem] z-50 transform translate-y-full transition-transform duration-300 flex flex-col max-h-[85%]" id="mech-profile-sheet">
        
        <!-- Header Image & Info -->
        <div class="relative shrink-0">
          <button onclick="MechanicProfile.close()" class="absolute top-4 right-4 w-8 h-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full flex items-center justify-center text-slate-800 dark:text-white z-10 active:scale-95 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div class="h-32 bg-slate-200 dark:bg-slate-800 rounded-t-[2rem] overflow-hidden">
             <!-- Cover bg can go here -->
          </div>
          
          <div class="px-6 flex items-end gap-4 -mt-12 relative mb-4">
             <img src="${mechanic.photo}" alt="${mechanic.name}" class="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 bg-white shadow-md">
             <div class="pb-2">
               <h2 class="text-xl font-display font-black text-slate-900 dark:text-white">${mechanic.name}</h2>
               <div class="flex items-center gap-2 mt-1">
                 <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider">${mechanic.plate}</span>
                 <span class="text-xs font-medium text-slate-500">${mechanic.specialty}</span>
               </div>
             </div>
          </div>
          
          <div class="px-6 flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
             <div class="text-center">
               <div class="text-lg font-black text-slate-900 dark:text-white">${mechanic.rating} <span class="text-yellow-400 text-sm">★</span></div>
               <div class="text-[10px] text-slate-500 uppercase font-medium">Rating</div>
             </div>
             <div class="text-center">
               <div class="text-lg font-black text-slate-900 dark:text-white">${mechanic.totalJobs || 0}</div>
               <div class="text-[10px] text-slate-500 uppercase font-medium">Tugas Selesai</div>
             </div>
             <div class="text-center">
               <div class="text-lg font-black text-slate-900 dark:text-white">${mechanic.distance}</div>
               <div class="text-[10px] text-slate-500 uppercase font-medium">KM Jarak</div>
             </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
           <h3 class="font-bold text-slate-900 dark:text-white mb-4">Riwayat Pekerjaan Terbaru</h3>
           <div class="mb-8">
             ${historyHtml || '<p class="text-xs text-slate-400 italic">Belum ada data riwayat.</p>'}
           </div>
           
           <h3 class="font-bold text-slate-900 dark:text-white mb-4">Ulasan Pelanggan</h3>
           <div>
             ${reviewsHtml || '<p class="text-xs text-slate-400 italic">Belum ada ulasan.</p>'}
           </div>
           
           <div class="h-10"></div>
        </div>

        <!-- Fixed Bottom Button -->
        <div class="shrink-0 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button onclick="MechanicProfile.callMechanic(${mechanic.id})" class="w-full py-4 rounded-2xl bg-primary hover:bg-rose-700 text-white font-display font-bold text-sm active:scale-95 transition-transform shadow-md">
            Panggil Mekanik Ini
          </button>
        </div>
      </div>
    `;

    container.classList.remove('hidden');
    
    // Trigger animation
    setTimeout(() => {
      document.getElementById('mech-profile-backdrop').classList.replace('opacity-0', 'opacity-100');
      document.getElementById('mech-profile-sheet').classList.replace('translate-y-full', 'translate-y-0');
    }, 10);
  },

  close() {
    const backdrop = document.getElementById('mech-profile-backdrop');
    const sheet = document.getElementById('mech-profile-sheet');
    const container = document.getElementById(this.containerId);
    
    if (backdrop && sheet) {
      backdrop.classList.replace('opacity-100', 'opacity-0');
      sheet.classList.replace('translate-y-0', 'translate-y-full');
      
      setTimeout(() => {
        container.classList.add('hidden');
      }, 300); // match transition duration
    }
  },

  callMechanic(id) {
    this.close();
    // Simulate slight delay before navigating
    setTimeout(() => {
      const mechanic = HomeScreen.mechanics.find(m => m.id === id);
      if (mechanic) {
        AppState.selectedMechanic = mechanic;
        AppState.serviceType = 'general';
        AppState.navigateTo('triage');
      }
    }, 300);
  }
};

window.MechanicProfile = MechanicProfile;
