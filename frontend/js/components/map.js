// Map component - Leaflet helpers
const MapComponent = {
  USER_LOCATION: [-6.2088, 106.8456],
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '&copy; OpenStreetMap contributors',

  createMap(containerId, center, zoom = 15) {
    const map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView(center || this.USER_LOCATION, zoom);

    L.tileLayer(this.TILE_URL, {
      attribution: this.TILE_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    return map;
  },

  addUserMarker(map, latlng) {
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="width:18px;height:18px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    return L.marker(latlng || this.USER_LOCATION, { icon: userIcon }).addTo(map);
  },

  addMechanicMarker(map, latlng, name) {
    const mechIcon = L.divIcon({
      className: 'mechanic-marker',
      html: `<div style="width:36px;height:36px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🔧</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const marker = L.marker(latlng, { icon: mechIcon }).addTo(map);
    if (name) marker.bindPopup(`<b>${name}</b>`);
    return marker;
  },

  invalidateSize(map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
};
