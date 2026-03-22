import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const AFFORDABLE_ICON = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const OVER_BUDGET_ICON = L.divIcon({
  className: 'over-budget-icon',
  html: '<div class="marker-grey"></div>',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Fixed coordinates for the five Fairfax County ZIP codes
const NEIGHBORHOOD_COORDS = {
  '22101': [38.9339, -77.1773], // McLean
  '20190': [38.9587, -77.3570], // Reston
  '22003': [38.8304, -77.1974], // Annandale
  '22015': [38.7868, -77.2711], // Burke
  '22030': [38.8462, -77.3064], // Fairfax City
}

const FAIRFAX_CENTER = [38.85, -77.30]

export default function NeighborhoodMap({ scores, onSelect, selectedZip }) {
  return (
    <div className="map-container">
      <MapContainer
        center={FAIRFAX_CENTER}
        zoom={11}
        style={{ height: '420px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {scores.map(score => {
          const coords = NEIGHBORHOOD_COORDS[score.zip]
          if (!coords) return null

          const isAffordable = score.affordable
          const isSelected = score.zip === selectedZip

          return (
            <Marker
              key={score.zip}
              position={coords}
              icon={isAffordable ? AFFORDABLE_ICON : OVER_BUDGET_ICON}
            >
              <Popup>
                <div className={`popup-content ${isSelected ? 'popup-selected' : ''}`}>
                  <strong>{score.label}</strong>
                  <span className="popup-archetype">{score.archetype}</span>
                  <span className="popup-score">
                    Score: <strong>{score.final_score}</strong>/100
                  </span>
                  {isAffordable ? (
                    <button
                      className="popup-btn"
                      onClick={() => onSelect(score.zip)}
                    >
                      View Details
                    </button>
                  ) : (
                    <p className="popup-warning">
                      Average home prices in this area exceed your budget.
                      Results are shown for reference only.
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
