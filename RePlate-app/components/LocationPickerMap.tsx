import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
}

interface LocationPickerMapProps {
  onLocationSelect: (data: LocationData) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function LocationPickerMap({ onLocationSelect, initialLatitude, initialLongitude }: LocationPickerMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const centerLat = initialLatitude || 28.6139;
  const centerLng = initialLongitude || 77.2090;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
        #map { height: 100%; width: 100%; }
        .center-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -100%);
          z-index: 1000;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <svg class="center-marker" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        function notifyCenter() {
          var center = map.getCenter();
          var message = JSON.stringify({ type: 'location_selected', lat: center.lat, lng: center.lng });
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
          }
        }

        map.on('moveend', function() {
          notifyCenter();
        });

        setTimeout(notifyCenter, 500);
      </script>
    </body>
    </html>
  `;

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng + "&zoom=18&addressdetails=1", {
        headers: {
          'User-Agent': 'RePlateApp/1.0',
          'Accept-Language': 'en-US'
        }
      });
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        let addressLine = '';
        if (addr.road) addressLine += addr.road;
        if (addr.suburb) addressLine += (addressLine ? ', ' : '') + addr.suburb;
        if (addr.neighbourhood) addressLine += (addressLine ? ', ' : '') + addr.neighbourhood;
        if (!addressLine && data.display_name) {
          addressLine = data.display_name.split(',').slice(0, 2).join(',');
        }

        const city = addr.city || addr.town || addr.county || addr.state_district || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address_line: addressLine || 'Selected Location',
          city,
          state,
          pincode
        });
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_selected') {
        setLoading(true);
        await reverseGeocode(data.lat, data.lng);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript("map.zoomIn(); true;");
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript("map.zoomOut(); true;");
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      
      webViewRef.current?.injectJavaScript("map.setView([" + latitude + ", " + longitude + "], 16); true;");
      
      await reverseGeocode(latitude, longitude);
    } catch (err) {
      console.warn('Error getting current location', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        scrollEnabled={false}
        onLoadEnd={() => setMapLoaded(true)}
      />

      <View style={styles.controlsOverlay}>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleZoomIn}>
            <Ionicons name="add" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.controlBtn} onPress={handleZoomOut}>
            <Ionicons name="remove" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locationBtn} onPress={handleCurrentLocation}>
          <Ionicons name="locate" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {(loading || !mapLoaded) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color="#2E7D32" />
            <Text style={styles.loadingText}>
              {!mapLoaded ? 'Loading map...' : 'Detecting address...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    position: 'relative',
    marginBottom: 16,
  },
  webview: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    bottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoomControls: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  locationBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
