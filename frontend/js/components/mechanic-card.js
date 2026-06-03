// Mechanic Card component
const MechanicCard = {
  render(mechanic) {
    const stars = Array.from({length: 5}, (_, i) => {
      const isFilled = i < Math.round(mechanic.rating);
      return `<svg class="w-3 h-3 ${isFilled ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
    }).join('');
    
    return `
      <div class="mechanic-card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 mb-3 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors shadow-sm" data-mechanic-id="${mechanic.id}">
        <img src="${mechanic.photo}" alt="${mechanic.name}" class="w-14 h-14 rounded-full object-cover border-2 border-primary/50" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231F2937%22 width=%22100%22 height=%22100%22/><path fill=%22%239CA3AF%22 d=%22M50 55c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm0-35c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zM26 85c0-13.3 10.7-24 24-24s24 10.7 24 24v5H26v-5z%22/></svg>'" />
        <div class="flex-1 min-w-0">
          <h4 class="text-slate-900 dark:text-white font-semibold text-sm truncate">${mechanic.name}</h4>
          <p class="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">${mechanic.specialty}</p>
          <div class="flex items-center gap-1 mt-1">
            <div class="flex">${stars}</div>
            <span class="text-xs text-slate-600 dark:text-slate-400 ml-1 font-medium">${mechanic.rating}</span>
          </div>
        </div>
        <div class="text-right flex-shrink-0 flex flex-col items-end">
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2">${mechanic.distance} km</span>
          <button class="btn-call-mechanic bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 text-xs font-bold w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95" data-mechanic-id="${mechanic.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </button>
        </div>
      </div>
    `;
  },

  renderList(mechanics, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = mechanics.map(m => this.render(m)).join('');
  }
};
