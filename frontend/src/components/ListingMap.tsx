import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, FeatureGroup } from "react-leaflet";
import L from "leaflet";

// Fix for leaflet-draw
if (typeof window !== "undefined") {
  (window as any).L = L;
}

import { Link } from "react-router-dom";
import { MapPin, ShieldCheck } from "lucide-react";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

interface ListingMapProps {
  listings: any[];
  center?: [number, number];
  onSearchArea?: (polygon: [number, number][] | null) => void;
}

const createPriceMarker = (price: number, isOccupied: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="flex items-center justify-center px-2 py-1 rounded-full shadow-lg border-2 ${isOccupied ? 'bg-stone-200 border-stone-400 text-stone-500' : 'bg-emerald-600 border-white text-white'} font-bold text-[10px] whitespace-nowrap transition-transform hover:scale-110">
      Rs. ${(price / 1000).toFixed(1)}k
    </div>`,
    iconSize: [40, 20],
    iconAnchor: [20, 10]
  });
};

const DrawControl = ({ onCreated, onDeleted, onEdited, featureGroupRef }: any) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // Ensure L is on window for leaflet-draw
    if (typeof window !== "undefined") {
      (window as any).L = L;
    }

    let drawControl: any;
    let featureGroup: L.FeatureGroup;

    import("leaflet-draw").then(() => {
      featureGroup = new L.FeatureGroup();
      map.addLayer(featureGroup);
      if (featureGroupRef) {
        featureGroupRef.current = featureGroup;
      }

      drawControl = new (L.Control as any).Draw({
        position: 'topright',
        edit: {
          featureGroup: featureGroup,
          remove: true
        },
        draw: {
          polygon: true,
          rectangle: true,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
        }
      });

      map.addControl(drawControl);

      const handleCreated = (e: any) => {
        featureGroup.addLayer(e.layer);
        if (onCreated) onCreated(e);
      };

      const handleDeleted = (e: any) => {
        if (onDeleted) onDeleted(e);
      };

      const handleEdited = (e: any) => {
        if (onEdited) onEdited(e);
      };

      map.on((L as any).Draw.Event.CREATED, handleCreated);
      map.on((L as any).Draw.Event.DELETED, handleDeleted);
      map.on((L as any).Draw.Event.EDITED, handleEdited);
    });

    return () => {
      if (drawControl) {
        map.removeControl(drawControl);
      }
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      // We can't easily remove listeners if they were added asynchronously and we don't have references here,
      // but since map is unmounting it's usually fine.
    };
  }, [map, onCreated, onDeleted, onEdited, featureGroupRef]);

  return null;
};

export default function ListingMap({ listings, center = [27.7172, 85.324], onSearchArea }: ListingMapProps) {
  const featureGroupRef = useRef<any>(null);

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon' || layerType === 'rectangle') {
      const latlngs = layer.getLatLngs()[0];
      const polygon = latlngs.map((latlng: any) => [latlng.lat, latlng.lng]);
      if (onSearchArea) {
        onSearchArea(polygon);
      }
      
      // Clear previous layers to only keep one search area
      if (featureGroupRef.current) {
        const layers = featureGroupRef.current.getLayers();
        layers.forEach((l: any) => {
          if (l !== layer) {
            featureGroupRef.current.removeLayer(l);
          }
        });
      }
    }
  };

  const _onDeleted = () => {
    if (onSearchArea) {
      onSearchArea(null);
    }
  };

  const _onEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs: any = layer.getLatLngs()[0];
        const polygon = latlngs.map((latlng: any) => [latlng.lat, latlng.lng]);
        if (onSearchArea) {
          onSearchArea(polygon);
        }
      }
    });
  };

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-2xl z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <RecenterMap center={center} />
        
        {onSearchArea && (
          <DrawControl
            onCreated={_onCreated}
            onDeleted={_onDeleted}
            onEdited={_onEdited}
            featureGroupRef={featureGroupRef}
          />
        )}

        {listings.map((listing) => {
          const lat = listing.location?.coordinates?.lat || 27.7172 + (Math.random() - 0.5) * 0.05;
          const lng = listing.location?.coordinates?.lng || 85.324 + (Math.random() - 0.5) * 0.05;

          return (
            <Marker 
              key={listing._id || listing.id} 
              position={[lat, lng]}
              icon={createPriceMarker(listing.price, listing.status === "occupied")}
            >
              <Popup className="custom-popup">
                <div className="w-56 p-0 overflow-hidden rounded-2xl bg-white">
                  <div className="relative h-32">
                    <img
                      src={listing.images?.[0]?.url || listing.images?.[0] || "https://picsum.photos/seed/room/200/150"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {listing.roomType || "Room"}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-stone-900 text-sm line-clamp-1 flex items-center gap-1 mb-1">
                      {listing.title}
                      {listing.landlordVerificationLevel === "verified" && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-stone-400 text-[10px] font-medium mb-3">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <span>{listing.area}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-emerald-600 text-sm">
                        Rs. {listing.price.toLocaleString()}
                      </span>
                      {listing.status === "occupied" ? (
                        <span className="text-[9px] bg-red-50 text-red-600 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
                          Occupied
                        </span>
                      ) : (
                        <Link
                          to={`/listing/${listing._id || listing.id}`}
                          className="text-[10px] bg-stone-900 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
