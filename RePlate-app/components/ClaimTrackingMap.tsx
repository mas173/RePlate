import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { apiClient } from '../services/api';

interface ClaimTrackingMapProps {
  donationLat: number;
  donationLng: number;
  foodName?: string;
  pickupAddress?: string;
  userRole?: 'ngo' | 'donor';
  ngoLat?: number | null;
  ngoLng?: number | null;
  onRefresh?: () => void | Promise<void>;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ClaimTrackingMap({
  donationLat,
  donationLng,
  foodName = 'Food Pickup',
  pickupAddress = '',
  userRole = 'ngo',
  ngoLat = null,
  ngoLng = null,
  onRefresh,
}: ClaimTrackingMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingGps, setLoadingGps] = useState(userRole === 'ngo');
  const [gpsError, setGpsError] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to send location to WebView Leaflet map
  const sendLocationToMap = (lat: number, lng: number) => {
    if (webViewRef.current && isWebViewReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'UPDATE_LOCATION',
          latitude: lat,
          longitude: lng,
        })
      );
    }
  };

  const syncGpsLocation = async () => {
    try {
      setRefreshing(true);
      if (userRole === 'ngo') {
        setLoadingGps(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setGpsError(true);
          setLoadingGps(false);
          setRefreshing(false);
          return;
        }

        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
        setGpsLocation(coords);
        setLoadingGps(false);
        setGpsError(false);

        // Sync to backend profile
        try {
          await apiClient.put('/users/profile', coords);
        } catch (syncErr) {
          console.warn('Coordinates sync failed:', syncErr);
        }

        // Post to webview if ready
        if (isWebViewReady) {
          sendLocationToMap(coords.latitude, coords.longitude);
        }
      } else {
        // Donor mode: trigger callback to reload latest claim/donation coordinates
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (err) {
      console.warn('Manual refresh failed:', err);
      setGpsError(true);
      setLoadingGps(false);
    } finally {
      setRefreshing(false);
    }
  };

  // Mode 1: NGO - Track live device GPS location and sync to backend
  useEffect(() => {
    if (userRole !== 'ngo') {
      setLoadingGps(false);
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let lastSyncTime = 0;

    const startTracking = async () => {
      try {
        setLoadingGps(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setGpsError(true);
          setLoadingGps(false);
          return;
        }

        // Get initial location
        const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = {
          latitude: initial.coords.latitude,
          longitude: initial.coords.longitude,
        };
        setGpsLocation(coords);
        setLoadingGps(false);
        setGpsError(false);

        // Sync initial position to backend
        try {
          await apiClient.put('/users/profile', coords);
        } catch (syncErr) {
          console.warn('Initial coordinates sync failed:', syncErr);
        }

        if (isWebViewReady) {
          sendLocationToMap(coords.latitude, coords.longitude);
        }

        // Watch location live
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 8000,
            distanceInterval: 15,
          },
          async (pos) => {
            const currentCoords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            setGpsLocation(currentCoords);
            
            // Send update to webview leaflet map
            if (isWebViewReady) {
              sendLocationToMap(currentCoords.latitude, currentCoords.longitude);
            }

            // Sync coordinates to profile database in background
            const now = Date.now();
            if (now - lastSyncTime >= 8000) {
              lastSyncTime = now;
              try {
                await apiClient.put('/users/profile', currentCoords);
              } catch (syncErr) {
                console.warn('Coordinates sync failed:', syncErr);
              }
            }
          }
        );
      } catch (err) {
        console.warn('Geolocation tracking failed:', err);
        setGpsError(true);
        setLoadingGps(false);
      }
    };

    startTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [userRole, isWebViewReady]);

  // Mode 2: Donor - Send prop-driven NGO coordinates updates to webview
  useEffect(() => {
    if (userRole === 'donor' && ngoLat && ngoLng && isWebViewReady) {
      sendLocationToMap(ngoLat, ngoLng);
    }
  }, [userRole, ngoLat, ngoLng, isWebViewReady]);

  const activeTrackingCoords = useMemo(() => {
    if (userRole === 'ngo') {
      return gpsLocation;
    } else {
      return ngoLat && ngoLng ? { latitude: ngoLat, longitude: ngoLng } : null;
    }
  }, [userRole, gpsLocation, ngoLat, ngoLng]);

  const distance = useMemo(() => {
    if (activeTrackingCoords) {
      return haversineDistance(
        activeTrackingCoords.latitude,
        activeTrackingCoords.longitude,
        donationLat,
        donationLng
      );
    }
    return null;
  }, [activeTrackingCoords, donationLat, donationLng]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${donationLat},${donationLng}`;

  const isArrived = distance !== null && distance <= 0.05; // 50 meters

  // Generate Leaflet HTML
  const mapHtml = useMemo(() => {
    const initNgoLat = ngoLat || (gpsLocation ? gpsLocation.latitude : null);
    const initNgoLng = ngoLng || (gpsLocation ? gpsLocation.longitude : null);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha255-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha255-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <style>
          body, html, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #f3f4f6;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${donationLat}, ${donationLng}], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          // Donation point icon (Green)
          var donationIcon = L.divIcon({
            html: '<div style="position:relative;width:34px;height:44px;"><div style="position:absolute;bottom:0;left:50%;width:34px;height:34px;background:linear-gradient(135deg,#10b981 0%,#047857 100%);border-radius:50% 50% 50% 0;transform:translateX(-50%) rotate(-45deg);box-shadow:0 3px 8px rgba(16,185,129,0.4),0 0 0 2px white;"></div><div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:12px;height:12px;background:white;border-radius:50%;"></div></div>',
            iconSize: [34, 44],
            iconAnchor: [17, 44]
          });

          var donorMarker = L.marker([${donationLat}, ${donationLng}], { icon: donationIcon }).addTo(map);
          donorMarker.bindPopup("<b>${foodName}</b><br/>${pickupAddress}").openPopup();

          var userMarker = null;
          var routeLine = null;

          // User/NGO truck marker (Indigo)
          var truckIcon = L.divIcon({
            html: '<div style="position:relative;width:38px;height:38px;background:linear-gradient(135deg,#4f46e5 0%,#3730a3 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(79,70,229,0.55),0 0 0 3px white;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>',
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          });

          // Draw initial location if provided
          var initLat = ${initNgoLat !== null ? initNgoLat : 'null'};
          var initLng = ${initNgoLng !== null ? initNgoLng : 'null'};
          if (initLat && initLng) {
            updateMarkerAndRoute(initLat, initLng);
          }

          function updateMarkerAndRoute(uLat, uLng) {
            if (!userMarker) {
              userMarker = L.marker([uLat, uLng], { icon: truckIcon }).addTo(map);
              userMarker.bindPopup("<b>NGO Pickup Agent</b>").openPopup();
            } else {
              userMarker.setLatLng([uLat, uLng]);
            }

            var points = [[uLat, uLng], [${donationLat}, ${donationLng}]];
            if (!routeLine) {
              routeLine = L.polyline(points, {
                color: '#6366f1',
                weight: 3.5,
                opacity: 0.8,
                dashArray: '8, 8'
              }).addTo(map);
            } else {
              routeLine.setLatLngs(points);
            }

            map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
          }

          // Receive real-time coords from React Native
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'UPDATE_LOCATION') {
                updateMarkerAndRoute(data.latitude, data.longitude);
              }
            } catch (e) {
              // ignore
            }
          });

          // Handshake on load completed
          window.onload = function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
            }
          };
        </script>
      </body>
      </html>
    `;
  }, [donationLat, donationLng, foodName, pickupAddress, ngoLat, gpsLocation]);

  const handleExternalNav = () => {
    Linking.openURL(googleMapsUrl).catch((err) => {
      console.error('Failed to open navigation url:', err);
    });
  };

  return (
    <View style={styles.container}>
      {/* Live tracking header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Transit Status</Text>
          {loadingGps ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#6366f1" style={{ marginRight: 6 }} />
              <Text style={styles.statusText}>Obtaining GPS signal...</Text>
            </View>
          ) : gpsError ? (
            <View style={styles.statusRow}>
              <Ionicons name="warning-sharp" size={16} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: '#D97706' }]}>GPS disabled. Showing destination.</Text>
            </View>
          ) : isArrived ? (
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.feedback.success} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: Colors.feedback.success, fontWeight: '700' }]}>
                NGO Arrived! Ready for pickup.
              </Text>
            </View>
          ) : activeTrackingCoords ? (
            <View style={styles.statusRow}>
              <Ionicons name="navigate" size={16} color="#6366f1" style={{ marginRight: 6, transform: [{ rotate: '45deg' }] }} />
              <Text style={[styles.statusText, { color: '#374151', fontWeight: '700' }]}>
                NGO In Transit to Donor
              </Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={styles.statusText}>Waiting for NGO to start transit...</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {distance !== null && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceLabel}>Distance</Text>
              <Text style={styles.distanceValue}>
                {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(2)} km`}
              </Text>
            </View>
          )}

          {/* Map Refresh Button */}
          <TouchableOpacity 
            style={[styles.refreshBtn, refreshing && styles.refreshBtnDisabled]} 
            onPress={syncGpsLocation} 
            disabled={refreshing}
            activeOpacity={0.7}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#2E7D32" />
            ) : (
              <Ionicons name="refresh" size={16} color="#2E7D32" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Map WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'MAP_READY') {
                setIsWebViewReady(true);
                // Immediately push current coords if ready
                const activeCoords = userRole === 'ngo' ? gpsLocation : (ngoLat && ngoLng ? { latitude: ngoLat, longitude: ngoLng } : null);
                if (activeCoords && webViewRef.current) {
                  webViewRef.current.postMessage(
                    JSON.stringify({
                      type: 'UPDATE_LOCATION',
                      ...activeCoords,
                    })
                  );
                }
              }
            } catch (e) {
              // ignore
            }
          }}
        />
      </View>

      {/* External GPS launcher for NGO */}
      {userRole === 'ngo' && (
        <TouchableOpacity style={styles.navBtn} onPress={handleExternalNav} activeOpacity={0.8}>
          <Ionicons name="navigate-outline" size={18} color="#2E7D32" />
          <Text style={styles.navBtnText}>Navigate in Google Maps</Text>
          <Ionicons name="open-outline" size={14} color="#2E7D32" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  distanceBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  distanceLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  distanceValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6366f1',
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F7F1',
    borderWidth: 1,
    borderColor: '#E6EFE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtnDisabled: {
    opacity: 0.6,
  },
  mapContainer: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  webview: {
    flex: 1,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBF7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 6,
  },
});
