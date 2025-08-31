"use client"
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { mockInstitutions } from "@/lib/mock-data"

interface GoogleMapProps {
  apiKey: string
  className?: string
}

export interface GoogleMapRef {
  addPinAndZoom: (institution: any) => void
  centerOnUserLocation: (lat: number, lng: number) => void
}

export const GoogleMap = forwardRef<GoogleMapRef, GoogleMapProps>(({ apiKey, className = "" }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const searchMarkersRef = useRef<any[]>([])

  useImperativeHandle(ref, () => ({
    addPinAndZoom: (institution: any) => {
      if (map && institution) {
        console.log("[v0] Adding pin for institution:", institution.name)

        searchMarkersRef.current.forEach((marker) => marker.setMap(null))
        searchMarkersRef.current = []

        const getCrowdColor = (level: string) => {
          switch (level) {
            case "Low":
              return "#22c55e"
            case "Medium":
              return "#eab308"
            case "High":
              return "#ef4444"
            default:
              return "#6b7280"
          }
        }

        const searchMarker = new window.google.maps.Marker({
          position: { lat: institution.latitude, lng: institution.longitude },
          map: map,
          title: institution.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: getCrowdColor(institution.currentCrowdLevel),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          animation: window.google.maps.Animation.BOUNCE,
        })

        setTimeout(() => {
          searchMarker.setAnimation(null)
        }, 2000)

        searchMarkersRef.current.push(searchMarker)

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${institution.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${institution.address}</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${institution.type}</p>
              <div style="display: flex; align-items: center; margin: 8px 0;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${getCrowdColor(institution.currentCrowdLevel)}; margin-right: 6px;"></div>
                <span style="font-size: 13px; font-weight: 500;">${institution.currentCrowdLevel} Crowd - ${institution.currentCrowdCount} people</span>
              </div>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">Average wait time: ${institution.averageWaitTime} minutes</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">Hours: ${institution.serviceHours}</p>
            </div>
          `,
        })

        searchMarker.addListener("click", () => {
          infoWindow.open(map, searchMarker)
        })

        map.setCenter({ lat: institution.latitude, lng: institution.longitude })
        map.setZoom(16)

        infoWindow.open(map, searchMarker)
      }
    },
    centerOnUserLocation: (lat: number, lng: number) => {
      if (map) {
        console.log("[v0] Centering map on user location:", lat, lng)
        map.setCenter({ lat, lng })
        map.setZoom(14)
      }
    },
  }))

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [apiKey])

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      // Initialize map centered on a default location (you can adjust this)
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 }, // New York City
        zoom: 12,
        styles: [
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ color: "#1a1a1a" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#2c2c2c" }],
          },
        ],
      })

      setMap(mapInstance)

      // Add markers for institutions
      mockInstitutions.forEach((institution, index) => {
        const lat = institution.latitude
        const lng = institution.longitude

        const getCrowdColor = (level: string) => {
          switch (level) {
            case "Low":
              return "#22c55e"
            case "Medium":
              return "#eab308"
            case "High":
              return "#ef4444"
            default:
              return "#6b7280"
          }
        }

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          title: institution.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getCrowdColor(institution.currentCrowdLevel),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${institution.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${institution.type}</p>
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${getCrowdColor(institution.currentCrowdLevel)}; margin-right: 4px;"></div>
                <span style="font-size: 12px;">${institution.currentCrowdLevel} - ${institution.currentCrowdCount} people</span>
              </div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">Wait time: ${institution.averageWaitTime}m</p>
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker)
        })
      })
    }
  }, [isLoaded, map])

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={className} />
})

GoogleMap.displayName = "GoogleMap"
