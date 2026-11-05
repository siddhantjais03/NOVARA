import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  DEMO_DISPATCH_ORIGIN,
  getApproximateCityCoordinates,
  generateRouteWaypoints
} from '../../utils/geoUtils';
import { MapPin, Navigation, Info, AlertTriangle } from 'lucide-react';
import './OrderTrackingMap.css';

export const OrderTrackingMap = ({ shippingAddress, orderId, orderStatus }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const destination = getApproximateCityCoordinates(shippingAddress);
  const waypoints = generateRouteWaypoints(DEMO_DISPATCH_ORIGIN, destination);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container re-mounts
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    });

    mapInstanceRef.current = map;

    // Free OpenStreetMap Raster Tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Luxury SVG Pin for Origin (BKC Mumbai Atelier)
    const originIcon = L.divIcon({
      className: 'novara-map-marker-wrap',
      html: `
        <div class="map-pin-pulse origin-pin">
          <div class="pin-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span class="pin-label">Atelier Dispatch</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 36],
      popupAnchor: [0, -36]
    });

    // Custom Luxury SVG Pin for Destination (Approximate City Hub)
    const destIcon = L.divIcon({
      className: 'novara-map-marker-wrap',
      html: `
        <div class="map-pin-pulse dest-pin">
          <div class="pin-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span class="pin-label">Patron Destination</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 36],
      popupAnchor: [0, -36]
    });

    // Add Origin Marker with Popup
    const originMarker = L.marker([DEMO_DISPATCH_ORIGIN.lat, DEMO_DISPATCH_ORIGIN.lng], {
      icon: originIcon
    }).addTo(map);

    originMarker.bindPopup(`
      <div class="map-popup-card">
        <strong class="popup-title">NOVARA Flagship Atelier</strong>
        <span class="popup-sub">${DEMO_DISPATCH_ORIGIN.note}</span>
        <p class="popup-address">${DEMO_DISPATCH_ORIGIN.address}</p>
        <div class="popup-status-tag">Dispatch Center</div>
      </div>
    `);

    // Add Destination Marker with Popup
    const destMarker = L.marker([destination.lat, destination.lng], {
      icon: destIcon
    }).addTo(map);

    destMarker.bindPopup(`
      <div class="map-popup-card">
        <strong class="popup-title">Delivery Destination</strong>
        <span class="popup-sub">${destination.label}</span>
        <p class="popup-address">${shippingAddress?.street || ''}, ${shippingAddress?.city || ''}</p>
        <div class="popup-status-tag destination">Approximate City Centroid</div>
      </div>
    `);

    // Draw Geodesic Dispatch Route Polyline
    const polyline = L.polyline(waypoints, {
      color: '#7c3aed',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    // Fit map bounds to frame both points with padding
    const bounds = L.latLngBounds([
      [DEMO_DISPATCH_ORIGIN.lat, DEMO_DISPATCH_ORIGIN.lng],
      [destination.lat, destination.lng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });

    // Invalidate size after layout settles to guarantee complete raster tile render
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shippingAddress]);

  return (
    <div className="order-tracking-map-root">
      {/* Map Control Bar */}
      <div className="map-meta-header">
        <div className="map-meta-left">
          <Navigation size={18} className="map-meta-icon" />
          <div>
            <h5 className="map-meta-title">Atelier Dispatch Trajectory</h5>
            <span className="map-meta-sub">
              Estimated Transit Simulation • Order #{orderId ? orderId.slice(-8).toUpperCase() : 'N/A'}
            </span>
          </div>
        </div>
        <span className="map-static-route-badge">
          Estimated Static Route
        </span>
      </div>

      {/* Interactive Leaflet Container */}
      <div className="map-view-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-canvas" />
      </div>

      {/* Origin & Destination Information Legend */}
      <div className="map-locations-legend">
        <div className="location-legend-col">
          <div className="loc-badge origin">
            <MapPin size={14} />
            <span>Demonstration Dispatch Origin</span>
          </div>
          <strong className="loc-name">{DEMO_DISPATCH_ORIGIN.name}</strong>
          <span className="loc-detail">{DEMO_DISPATCH_ORIGIN.address}</span>
          <span className="loc-disclaimer">
            *Configured demonstration dispatch hub; not a verified physical warehouse.
          </span>
        </div>

        <div className="location-legend-col">
          <div className="loc-badge destination">
            <MapPin size={14} />
            <span>Delivery Destination</span>
          </div>
          <strong className="loc-name">
            {shippingAddress?.city || 'Customer City'}, {shippingAddress?.state || 'India'}
          </strong>
          <span className="loc-detail">
            {shippingAddress?.street ? `${shippingAddress.street}, ` : ''}{shippingAddress?.postalCode ? `PIN: ${shippingAddress.postalCode}` : ''}
          </span>
          <span className="loc-disclaimer">
            *Mapped to approximate city-level coordinates ({destination.resolvedName}); street-level GPS tracking is not simulated without courier telematics.
          </span>
        </div>
      </div>

      {/* Legal & Telematics Transparency Notice */}
      <div className="map-transparency-banner">
        <Info size={15} className="transparency-icon" />
        <span>
          <strong>Telematics Notice:</strong> This map plots an estimated transit trajectory between our demonstration Mumbai atelier and your destination city using OpenStreetMap cartography. Live courier location is not simulated without verified telemetry hardware.
        </span>
      </div>
    </div>
  );
};

