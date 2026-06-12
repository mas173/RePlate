import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../services/api';
import { Colors } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DonateScreen() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Cooked' | 'Raw' | 'Packaged'>('Cooked');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'meals' | 'kg'>('meals');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [storageCondition, setStorageCondition] = useState<'room_temp' | 'refrigerated' | 'frozen'>('room_temp');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !quantity || !expiryDate) {
      Alert.alert('Missing Fields', 'Please fill in the Food Item Title, Quantity, and Expiry Date.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        expiryDate,
        expiryTime: expiryTime || '23:59',
        storageCondition,
        address,
        city,
        state,
        pincode,
        notes,
      };

      await apiClient.post('/donations', payload);
      Alert.alert('Success 🎉', 'Your food donation has been posted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setName('');
            setQuantity('');
            setExpiryDate('');
            setExpiryTime('');
            setAddress('');
            setCity('');
            setState('');
            setPincode('');
            setNotes('');
            // Navigate to My Donations
            router.push('/my-donations');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating donation:', error);
      Alert.alert('Error', error.message || 'Failed to post donation. Please try again.');
    } finally {
      setLoading(false);
    }
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
        {/* Food Item Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Food Item Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fresh Roti & Mix Veg Curry"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.selectorRow}>
            {(['Cooked', 'Raw', 'Packaged'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.selectorBtn, category === cat && styles.selectorBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.selectorText, category === cat && styles.selectorTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity and Unit */}
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1.5 }]}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.selectorRow}>
              {(['meals', 'kg'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.selectorBtn, unit === u && styles.selectorBtnActive, { flex: 1 }]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.selectorText, unit === u && styles.selectorTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Expiry Date and Time */}
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Expiry Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Expiry Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (24h)"
              value={expiryTime}
              onChangeText={setExpiryTime}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Storage Condition */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Storage Condition</Text>
          <View style={styles.selectorRow}>
            {(['room_temp', 'refrigerated', 'frozen'] as const).map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[styles.selectorBtn, storageCondition === cond && styles.selectorBtnActive, { paddingHorizontal: 8 }]}
                onPress={() => setStorageCondition(cond)}
              >
                <Text style={[styles.selectorText, storageCondition === cond && styles.selectorTextActive, { fontSize: 11 }]}>
                  {cond === 'room_temp' ? 'Room Temp' : cond === 'refrigerated' ? 'Refrigerated' : 'Frozen'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street Address, Building, Area"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* City and State */}
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Pincode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            keyboardType="numeric"
            value={pincode}
            onChangeText={setPincode}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Notes / Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Please bring carry bags. Best consumed within 2 hours."
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FAFBF7" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Post Donation</Text>
              <MaterialCommunityIcons name="food-fork-drink" size={18} color="#FAFBF7" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4329',
  },
  headerLeaf: {
    marginLeft: 6,
    transform: [{ rotate: '45deg' }],
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1B4329',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  selectorBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
  },
  selectorBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectorTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#1B4329',
    borderRadius: 30,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#1B4329',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FAFBF7',
    fontSize: 16,
    fontWeight: '700',
  },
});
