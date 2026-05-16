"use client"

import React from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Leaflet
const icon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function MapView({ lat, lng }) {
  if (!lat || !lng) return (
    <div className="h-[200px] w-full rounded-xl border border-pace-border bg-pace-bg-subtle flex items-center justify-center text-admin-dim text-[10px] uppercase font-bold tracking-widest">
      No location data available
    </div>
  )

  const position = [parseFloat(lat), parseFloat(lng)]

  return (
    <div className="h-[200px] w-full rounded-xl border border-pace-border overflow-hidden z-0">
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} />
      </MapContainer>
    </div>
  )
}
