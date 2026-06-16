import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../services/api';
import LocationPickerMap from '../../components/LocationPickerMap';

const { width } = Dimensions.get('window');

// Category & Storage constants matching the web app
const FOOD_CATEGORIES = [
  { value: 'cooked_meals', label: 'Cooked Meals', icon: '🍽️' },
  { value: 'raw_produce', label: 'Raw Produce', icon: '🥬' },
  { value: 'bakery', label: 'Bakery', icon: '🍞' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'beverages', label: 'Beverages', icon: '🥤' },
  { value: 'packaged', label: 'Packaged', icon: '📦' },
  { value: 'fruits', label: 'Fruits', icon: '🍎' },
  { value: 'grains', label: 'Grains', icon: '🌾' },
  { value: 'meat', label: 'Meat & Protein', icon: '🥩' },
  { value: 'other', label: 'Other', icon: '🍴' },
];

const STORAGE_CONDITIONS = [
  { value: 'room_temp', label: 'Room Temp', icon: '🌡️' },
  { value: 'refrigerated', label: 'Refrigerated', icon: '❄️' },
  { value: 'frozen', label: 'Frozen', icon: '🧊' },
  { value: 'heated', label: 'Heated / Hot', icon: '🔥' },
];

export default function DonateScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Food Details
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cooked_meals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('meals');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [storageCondition, setStorageCondition] = useState('room_temp');
  const [isCategorizing, setIsCategorizing] = useState(false);

  // STEP 2: Images & AI Analysis
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiFreshnessScore, setAiFreshnessScore] = useState<number | null>(null);

  // STEP 3: Pickup Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [pickupFrom, setPickupFrom] = useState('');
  const [pickupTo, setPickupTo] = useState('');
  const [instructions, setInstructions] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [tempMapLocation, setTempMapLocation] = useState<any>(null);

  // Fetch user's default address (with saved addresses first, fallback to profile address)
  const fetchDefaultAddress = async () => {
    try {
      const response = await apiClient.get('/users/addresses');
      let addressSet = false;
      if (response.data && response.data.addresses) {
        setSavedAddresses(response.data.addresses);
        // Find default address
        let targetAddr = response.data.addresses.find((a: any) => a.is_default);
        // Fallback to first saved address if no default is marked
        if (!targetAddr && response.data.addresses.length > 0) {
          targetAddr = response.data.addresses[0];
        }
        if (targetAddr) {
          setAddress(targetAddr.address_line || '');
          setCity(targetAddr.city || '');
          setState(targetAddr.state || '');
          setPincode(targetAddr.pincode || '');
          if (targetAddr.latitude && targetAddr.longitude) {
            setLatitude(parseFloat(targetAddr.latitude));
            setLongitude(parseFloat(targetAddr.longitude));
          }
          addressSet = true;
        }
      }
      
      // Fallback to profile organization address if no saved address was set
      if (!addressSet) {
        const profileRes = await apiClient.get('/users/profile');
        if (profileRes.data && profileRes.data.profile) {
          const prof = profileRes.data.profile;
          setAddress(prof.organization_address || '');
          setCity(prof.city || '');
          setState(prof.state || '');
          setPincode(prof.pincode || '');
          if (prof.latitude && prof.longitude) {
            setLatitude(parseFloat(prof.latitude));
            setLongitude(parseFloat(prof.longitude));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load default address', err);
    }
  };

  // Auto-set default dates and location
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setExpiryDate(`${yyyy}-${mm}-${dd}`);
    setExpiryTime('20:00');

    fetchDefaultAddress();
  }, []);

  // AI Categorize Food Name
  const handleAiCategorize = async () => {
    if (!name || name.trim().length <= 3) {
      Alert.alert('Details Needed', 'Please enter a valid food name first (minimum 4 characters).');
      return;
    }
    setIsCategorizing(true);
    try {
      const response = await apiClient.post('/ai/categorize', { description: name });
      if (response.data && response.data.category) {
        const matched = FOOD_CATEGORIES.find((c) => c.value === response.data.category);
        if (matched) {
          setCategory(matched.value);
        }
        if (response.data.estimatedServings && !quantity) {
          setQuantity(String(response.data.estimatedServings));
          setUnit('servings');
        }
        Alert.alert('AI Categorize Success ✨', `Suggested Category: ${matched ? matched.label : response.data.category}`);
      }
    } catch (err: any) {
      console.warn('AI categorization failed:', err);
      Alert.alert('AI Suggestion', 'Could not categorize automatically. Please select manually.');
    } finally {
      setIsCategorizing(false);
    }
  };

  // Run AI Freshness Analysis
  const runFreshnessAnalysis = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'freshness.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('name', name || 'Food Item');
      formData.append('category', category);
      formData.append('quantity', quantity ? `${quantity} ${unit}` : '1');
      formData.append('storageCondition', storageCondition);

      const response = await apiClient.post('/ai/analyze-freshness', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data) {
        setAiAnalysis(response.data);
        setAiFreshnessScore(response.data.freshnessScore);
        Alert.alert('AI Freshness Score ✨', `Freshness score: ${response.data.freshnessScore}/100. Category verified!`);
      }
    } catch (err: any) {
      console.warn('AI freshness analysis error:', err);
      Alert.alert('Analysis Failed', 'Could not process freshness analysis on this image. You can still submit the donation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select photo from gallery
  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 images.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Gallery access permission is required to choose photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      setImages((prev) => [...prev, newUri]);
      if (images.length === 0) {
        await runFreshnessAnalysis(newUri);
      }
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 images.');
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Camera access permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      setImages((prev) => [...prev, newUri]);
      if (images.length === 0) {
        await runFreshnessAnalysis(newUri);
      }
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setAiAnalysis(null);
      setAiFreshnessScore(null);
    }
  };



  // Step validator
  const validateStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        Alert.alert('Required', 'Please enter a food name.');
        return false;
      }
      if (!quantity.trim() || isNaN(parseFloat(quantity))) {
        Alert.alert('Required', 'Please enter a valid numeric quantity.');
        return false;
      }
      if (!expiryDate.trim()) {
        Alert.alert('Required', 'Please select an expiry date.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!address.trim()) {
        Alert.alert('Required', 'Please enter a street address.');
        return false;
      }
      if (!city.trim()) {
        Alert.alert('Required', 'Please enter the city.');
        return false;
      }
      if (!state.trim()) {
        Alert.alert('Required', 'Please enter the state.');
        return false;
      }
      if (!pincode.trim()) {
        Alert.alert('Required', 'Please enter the pincode.');
        return false;
      }
    }
    return true;
  };

  // Next / Previous step
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit complete donation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      formData.append('expiryDate', expiryDate);
      formData.append('expiryTime', expiryTime || '20:00');
      formData.append('storageCondition', storageCondition);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('pickupFrom', pickupFrom || '09:00');
      formData.append('pickupTo', pickupTo || '18:00');
      formData.append('instructions', instructions);
      formData.append('notes', notes);

      if (latitude !== null) formData.append('latitude', String(latitude));
      if (longitude !== null) formData.append('longitude', String(longitude));

      // Append AI properties
      if (aiFreshnessScore !== null) {
        formData.append('aiFreshnessScore', String(aiFreshnessScore));
        formData.append('ai_freshness_score', String(aiFreshnessScore));
      }
      if (aiAnalysis) {
        formData.append('aiAnalysis', JSON.stringify(aiAnalysis));
        formData.append('ai_analysis', JSON.stringify(aiAnalysis));
      }

      // Add files
      images.forEach((uri, idx) => {
        formData.append('images', {
          uri: uri,
          name: `donation_${idx}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      await apiClient.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Clear states & show success
      setCurrentStep(5);
    } catch (err: any) {
      console.error('Submit donation error:', err);
      Alert.alert('Submission Failed', err.message || 'Could not post food donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setName('');
    setCategory('cooked_meals');
    setQuantity('');
    setUnit('meals');
    setStorageCondition('room_temp');
    setImages([]);
    setNotes('');
    setAiAnalysis(null);
    setAiFreshnessScore(null);
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setLatitude(null);
    setLongitude(null);
    setPickupFrom('');
    setPickupTo('');
    setInstructions('');
    setCurrentStep(1);
    fetchDefaultAddress();
  };

  // Step 1 Renderer
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Food Details</Text>
      <Text style={styles.sectionSubtitle}>Describe the surplus food you want to list.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Food Item Title *</Text>
        <View style={styles.aiInputWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="e.g. Fresh Roti & Mix Veg Curry"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />
          {name.trim().length > 3 && (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleAiCategorize}
              disabled={isCategorizing}
            >
              {isCategorizing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  <Text style={styles.aiButtonText}>AI Categorize</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {FOOD_CATEGORIES.map((item) => {
            const isSelected = category === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
                onPress={() => setCategory(item.value)}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={{ flex: 1.5, marginRight: 12 }}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitSelector}>
            <TextInput
              style={styles.input}
              placeholder="meals / kg"
              value={unit}
              onChangeText={setUnit}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={{ flex: 1.2, marginRight: 12 }}>
          <Text style={styles.label}>Expiry Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Expiry Time</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            value={expiryTime}
            onChangeText={setExpiryTime}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Storage Condition</Text>
        <View style={styles.storageRow}>
          {STORAGE_CONDITIONS.map((cond) => {
            const isSelected = storageCondition === cond.value;
            return (
              <TouchableOpacity
                key={cond.value}
                style={[styles.storageBtn, isSelected && styles.storageBtnActive]}
                onPress={() => setStorageCondition(cond.value)}
              >
                <Text style={styles.storageBtnIcon}>{cond.icon}</Text>
                <Text style={[styles.storageBtnText, isSelected && styles.storageBtnTextActive]}>
                  {cond.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  // Step 2 Renderer
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Upload Images & AI Analysis</Text>
      <Text style={styles.sectionSubtitle}>Add food photos. Our AI will analyze freshness instantly.</Text>

      <View style={styles.uploadRow}>
        <TouchableOpacity style={styles.uploadActionCard} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={28} color="#2E7D32" />
          <Text style={styles.uploadActionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadActionCard} onPress={pickImage}>
          <Ionicons name="images-outline" size={28} color="#2E7D32" />
          <Text style={styles.uploadActionText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsScroll}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.thumbnailWrapper}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeThumbnailBtn} onPress={() => removeImage(idx)}>
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {isAnalyzing && (
        <View style={styles.aiLoadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.aiLoadingText}>AI freshness analysis in progress...</Text>
          <Text style={styles.aiLoadingSub}>Evaluating shelf life and safety recommendations...</Text>
        </View>
      )}

      {!isAnalyzing && aiAnalysis && (
        <View style={styles.aiReportCard}>
          <View style={styles.aiReportHeader}>
            <Ionicons name="sparkles" size={18} color="#10B981" />
            <Text style={styles.aiReportTitle}>Gemini AI Freshness Report</Text>
            <View style={styles.aiScoreBadge}>
              <Text style={styles.aiScoreText}>{aiFreshnessScore}/100</Text>
            </View>
          </View>

          <View style={styles.aiReportBody}>
            <View style={styles.aiReportRow}>
              <Text style={styles.aiReportLabel}>Urgency:</Text>
              <Text style={[styles.aiReportValue, { color: '#D97706', fontWeight: 'bold' }]}>
                {aiAnalysis.urgencyLevel?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.aiReportRow}>
              <Text style={styles.aiReportLabel}>Est. Shelf Life:</Text>
              <Text style={styles.aiReportValue}>{aiAnalysis.estimatedShelfLife || '2-4 hours'}</Text>
            </View>
            <View style={styles.aiReportRow}>
              <Text style={styles.aiReportLabel}>Dist. Suggestion:</Text>
              <Text style={styles.aiReportValue}>{aiAnalysis.distributionMethod || 'Immediate consumption'}</Text>
            </View>

            {aiAnalysis.safetyRecommendations && aiAnalysis.safetyRecommendations.length > 0 && (
              <View style={styles.aiRecsContainer}>
                <Text style={styles.aiRecsTitle}>Safety Protocols:</Text>
                {aiAnalysis.safetyRecommendations.map((rec: string, i: number) => (
                  <Text key={i} style={styles.aiRecText}>• {rec}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Allergens, dietary info, or instructions..."
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );

  // Step 3 Renderer
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Pickup Location</Text>
      <Text style={styles.sectionSubtitle}>Specify where and when the NGO should collect the donation.</Text>

      <TouchableOpacity 
        style={styles.selectAddressBtn} 
        onPress={() => setIsAddressModalVisible(true)}
      >
        <Ionicons name="map-outline" size={18} color="#2E7D32" />
        <Text style={styles.selectAddressBtnText}>Select Saved Address / Map</Text>
      </TouchableOpacity>

      {latitude && longitude && (
        <View style={styles.coordinatesCard}>
          <Ionicons name="pin" size={16} color="#2E7D32" />
          <Text style={styles.coordinatesText}>
            Map Location Selected: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 123 MG Road, Suite 400"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Mumbai"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="MH"
            value={state}
            onChangeText={setState}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode *</Text>
        <TextInput
          style={styles.input}
          placeholder="400001"
          keyboardType="numeric"
          value={pincode}
          onChangeText={setPincode}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.label}>Available From</Text>
          <TextInput
            style={styles.input}
            placeholder="09:00"
            value={pickupFrom}
            onChangeText={setPickupFrom}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Available To</Text>
          <TextInput
            style={styles.input}
            placeholder="18:00"
            value={pickupTo}
            onChangeText={setPickupTo}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Special Instructions (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. Call before arrival, gate code is 4920..."
          multiline
          numberOfLines={2}
          value={instructions}
          onChangeText={setInstructions}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );

  // Step 4 Renderer: Review
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Review & Submit</Text>
      <Text style={styles.sectionSubtitle}>Please confirm the details below before posting.</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardHeader}>Food Details</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Title:</Text>
          <Text style={styles.reviewValue}>{name}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Category:</Text>
          <Text style={styles.reviewValue}>
            {FOOD_CATEGORIES.find((c) => c.value === category)?.label || category}
          </Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Quantity:</Text>
          <Text style={styles.reviewValue}>{quantity} {unit}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Expiry:</Text>
          <Text style={styles.reviewValue}>{expiryDate} at {expiryTime}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Storage:</Text>
          <Text style={styles.reviewValue}>{storageCondition}</Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardHeader}>Images & Notes</Text>
        <Text style={styles.reviewValue}>
          {images.length} Image(s) Uploaded
        </Text>
        {aiFreshnessScore !== null && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>AI freshness score:</Text>
            <Text style={[styles.reviewValue, { color: '#10B981', fontWeight: 'bold' }]}>
              {aiFreshnessScore}/100
            </Text>
          </View>
        )}
        {notes ? (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Notes:</Text>
            <Text style={styles.reviewValue}>{notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardHeader}>Pickup & Location</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Address:</Text>
          <Text style={styles.reviewValue}>{address}, {city}, {state} - {pincode}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Timeframe:</Text>
          <Text style={styles.reviewValue}>{pickupFrom || '09:00'} - {pickupTo || '18:00'}</Text>
        </View>
        {instructions ? (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Instructions:</Text>
            <Text style={styles.reviewValue}>{instructions}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  // Success Step Renderer
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconCircle}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>
      <Text style={styles.successTitle}>Donation Posted! 🎉</Text>
      <Text style={styles.successSubtitle}>
        Your food donation was submitted successfully. Local NGOs will be notified immediately.
      </Text>
      <TouchableOpacity
        style={styles.successButton}
        onPress={() => {
          handleReset();
          router.push('/my-donations');
        }}
      >
        <Text style={styles.successButtonText}>View My Donations</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.successSecondaryButton} onPress={handleReset}>
        <Text style={styles.successSecondaryButtonText}>Donate More Food</Text>
      </TouchableOpacity>
    </View>
  );

  // Stepper Header
  const renderStepperHeader = () => {
    if (currentStep > 4) return null;
    const steps = ['Details', 'Photos', 'Location', 'Review'];
    return (
      <View style={styles.stepperHeader}>
        {steps.map((stepName, i) => {
          const stepNum = i + 1;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;
          return (
            <React.Fragment key={stepNum}>
              <View style={styles.stepIndicatorWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isDone && styles.stepCircleDone,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.stepCircleText, isActive && styles.stepCircleTextActive]}>
                      {stepNum}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {stepName}
                </Text>
              </View>
              {stepNum < 4 && (
                <View style={[styles.stepLine, currentStep > stepNum && styles.stepLineActive]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Donate Food</Text>
          <Ionicons name="leaf" size={16} color="#2E7D32" style={styles.headerLeaf} />
        </View>
        <Text style={styles.headerSubtitle}>
          Share your surplus food with local NGOs and communities in need
        </Text>
      </View>

      {renderStepperHeader()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderSuccess()}
      </ScrollView>

      {currentStep <= 4 && (
        <View style={styles.navigationBar}>
          {currentStep > 1 ? (
            <TouchableOpacity style={styles.navBtnBack} onPress={handleBack}>
              <Ionicons name="chevron-back" size={16} color="#2E7D32" />
              <Text style={styles.navBtnBackText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}

          <Text style={styles.stepProgressText}>Step {currentStep} of 4</Text>

          {currentStep < 4 ? (
            <TouchableOpacity style={styles.navBtnNext} onPress={handleNext}>
              <Text style={styles.navBtnNextText}>Continue</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtnSubmit, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.navBtnNextText}>Post Donation</Text>
                  <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* --- Change Address Modal --- */}
      <Modal visible={isAddressModalVisible} animationType="slide" onRequestClose={() => setIsAddressModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Pickup Location</Text>
            <TouchableOpacity onPress={() => setIsAddressModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {savedAddresses.length > 0 && (
              <>
                <Text style={styles.savedAddressListTitle}>Saved Addresses</Text>
                {savedAddresses.map((addr, index) => {
                  // If we don't have a reliable ID, just use index, but prefer address_line to identify
                  const isSelected = address === addr.address_line;
                  return (
                    <TouchableOpacity
                      key={addr.id || index}
                      style={[styles.savedAddressItem, isSelected && styles.savedAddressItemSelected]}
                      onPress={() => {
                        setAddress(addr.address_line || '');
                        setCity(addr.city || '');
                        setState(addr.state || '');
                        setPincode(addr.pincode || '');
                        if (addr.latitude && addr.longitude) {
                          setLatitude(parseFloat(addr.latitude));
                          setLongitude(parseFloat(addr.longitude));
                        }
                        setIsAddressModalVisible(false);
                      }}
                    >
                      <View style={styles.savedAddressIconWrapper}>
                        <Ionicons name={addr.is_default ? "star" : "business"} size={18} color="#2E7D32" />
                      </View>
                      <View style={styles.savedAddressInfo}>
                        <Text style={styles.savedAddressName}>
                          {addr.name || 'Address'} {addr.is_default && <Text style={{color: '#EAB308', fontSize: 12}}> (Default)</Text>}
                        </Text>
                        <Text style={styles.savedAddressDetail}>{addr.address_line}</Text>
                        <Text style={styles.savedAddressDetail}>{addr.city}, {addr.state} - {addr.pincode}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            <View style={styles.mapPickerContainer}>
              <Text style={styles.mapPickerTitle}>Or Pick a Location on Map</Text>
              <LocationPickerMap
                initialLatitude={latitude || undefined}
                initialLongitude={longitude || undefined}
                onLocationSelect={(data) => {
                  setTempMapLocation(data);
                }}
              />
              <TouchableOpacity
                style={styles.confirmLocationBtn}
                onPress={() => {
                  if (tempMapLocation) {
                    setLatitude(tempMapLocation.latitude);
                    setLongitude(tempMapLocation.longitude);
                    setAddress(tempMapLocation.address_line);
                    setCity(tempMapLocation.city);
                    setState(tempMapLocation.state);
                    setPincode(tempMapLocation.pincode);
                  }
                  setIsAddressModalVisible(false);
                }}
              >
                <Text style={styles.confirmLocationBtnText}>Confirm Map Location</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4329',
  },
  headerLeaf: {
    marginLeft: 6,
    transform: [{ rotate: '45deg' }],
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#2E7D32',
  },
  stepCircleDone: {
    backgroundColor: '#10B981',
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4329',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B4329',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 13.5,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  aiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryCard: {
    width: (width - 64) / 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#F7FAF6',
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  unitSelector: {
    flex: 1,
  },
  storageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  storageBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageBtnActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#F7FAF6',
  },
  storageBtnIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  storageBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  storageBtnTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  thumbnailsScroll: {
    marginBottom: 16,
  },
  thumbnailWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  removeThumbnailBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLoadingContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  aiLoadingText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  aiLoadingSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  aiReportCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  aiReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiReportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 6,
    flex: 1,
  },
  aiScoreBadge: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiScoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  aiReportBody: {
    gap: 6,
  },
  aiReportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiReportLabel: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  aiReportValue: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
  },
  aiRecsContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#A7F3D0',
  },
  aiRecsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  aiRecText: {
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 15,
  },
  gpsButton: {
    backgroundColor: '#2E7D32',
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  coordinatesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3E9',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 16,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#1B4329',
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  reviewCardHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B4329',
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
    paddingBottom: 6,
    marginBottom: 8,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  reviewLabel: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  reviewValue: {
    fontSize: 12.5,
    color: '#111827',
    fontWeight: '700',
    textAlign: 'right',
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAF3E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBtnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  navBtnBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  stepProgressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  navBtnNext: {
    backgroundColor: '#2E7D32',
    height: 42,
    borderRadius: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navBtnNextText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  navBtnSubmit: {
    backgroundColor: '#10B981',
    height: 42,
    borderRadius: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successIconCircle: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4329',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  successButton: {
    backgroundColor: '#2E7D32',
    height: 48,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successSecondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    height: 48,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successSecondaryButtonText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '700',
  },
  // Address UX Styles
  selectedAddressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedAddressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectedAddressTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  selectedAddressLine: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4329',
    marginBottom: 2,
  },
  selectedAddressSubline: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  noAddressText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  changeAddressBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeAddressBtnText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  savedAddressListTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  savedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    marginBottom: 10,
  },
  savedAddressItemSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#F2FCEE',
  },
  savedAddressIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedAddressInfo: {
    flex: 1,
  },
  savedAddressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  savedAddressDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mapPickerContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  mapPickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  confirmLocationBtn: {
    backgroundColor: '#2E7D32',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmLocationBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  selectAddressBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectAddressBtnText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
});
