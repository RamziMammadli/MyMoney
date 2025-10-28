import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Colors, DesignSystem } from '@/constants/theme';
import { StorageService } from '@/services/storage';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  currency: string;
  language: string;
  notifications: boolean;
  darkMode: boolean;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'İstifadəçi',
    email: 'user@example.com',
    phone: '+994 50 123 45 67',
    currency: '₼',
    language: 'az',
    notifications: true,
    darkMode: false,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<keyof UserProfile | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditProfile = (field: keyof UserProfile, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    if (!editField) return;

    const updatedProfile = {
      ...profile,
      [editField]: editValue,
    };
    
    setProfile(updatedProfile);
    setShowEditModal(false);
    setEditField(null);
    setEditValue('');
  };

  const handleClearData = () => {
    Alert.alert(
      'Məlumatları Təmizlə',
      'Bütün əməliyyatlar, hədəflər və borclar silinəcək. Bu əməliyyat geri alına bilməz.',
      [
        { text: 'Ləğv Et', style: 'cancel' },
        {
          text: 'Təmizlə',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Uğurlu', 'Bütün məlumatlar təmizləndi');
            } catch (error) {
              Alert.alert('Xəta', 'Məlumatlar təmizlənərkən xəta baş verdi');
            }
          },
        },
      ]
    );
  };

  const getFieldLabel = (field: keyof UserProfile): string => {
    const labels = {
      name: 'Ad Soyad',
      email: 'E-mail',
      phone: 'Telefon',
      currency: 'Valyuta',
      language: 'Dil',
      notifications: 'Bildirişlər',
      darkMode: 'Qaranlıq rejim',
    };
    return labels[field];
  };

  const getFieldValue = (field: keyof UserProfile): string => {
    const value = profile[field];
    if (typeof value === 'boolean') {
      return value ? 'Aktiv' : 'Deaktiv';
    }
    return value.toString();
  };

  const renderProfileItem = (field: keyof UserProfile, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      key={field}
      style={styles.profileItem}
      onPress={() => {
        if (typeof profile[field] === 'boolean') {
          setProfile(prev => ({ ...prev, [field]: !prev[field] }));
        } else {
          handleEditProfile(field, profile[field].toString());
        }
      }}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileIcon}>
          <Ionicons name={icon} size={20} color={Colors.light.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileLabel}>{getFieldLabel(field)}</Text>
          <Text style={styles.profileValue}>{getFieldValue(field)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.light.textSecondary} />
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editField ? getFieldLabel(editField) : 'Redaktə Et'}
          </Text>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Ionicons name="close" size={24} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <Input
            placeholder={editField ? getFieldLabel(editField) : 'Dəyər'}
            value={editValue}
            onChangeText={setEditValue}
            style={styles.modalInput}
          />
        </View>

        <View style={styles.modalFooter}>
          <Button
            title="Saxla"
            onPress={handleSaveProfile}
            style={styles.saveButton}
          />
        </View>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Text style={styles.statsTitle}>App Statistikaları</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Ümumi Əməliyyat</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Aktiv Hədəf</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Tamamlanmış Hədəf</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Ümumi Borç</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title="Profil"
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />
      
      <FlatList
        style={styles.content}
        data={[1]} // Dummy data for FlatList
        renderItem={() => (
          <View>
            {/* User Info */}
            <Card style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color={Colors.light.primary} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{profile.name}</Text>
                  <Text style={styles.userEmail}>{profile.email}</Text>
                </View>
              </View>
            </Card>

            {/* Stats */}
            {renderStatsCard()}

            {/* Profile Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profil Məlumatları</Text>
              <Card style={styles.settingsCard}>
                {renderProfileItem('name', 'person-outline')}
                {renderProfileItem('email', 'mail-outline')}
                {renderProfileItem('phone', 'call-outline')}
              </Card>
            </View>

            {/* App Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Ayarları</Text>
              <Card style={styles.settingsCard}>
                {renderProfileItem('currency', 'cash-outline')}
                {renderProfileItem('language', 'language-outline')}
                {renderProfileItem('notifications', 'notifications-outline')}
                {renderProfileItem('darkMode', 'moon-outline')}
              </Card>
            </View>

            {/* Data Management */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Məlumat İdarəetməsi</Text>
              <Card style={styles.settingsCard}>
                <TouchableOpacity style={styles.profileItem} onPress={handleClearData}>
                  <View style={styles.profileItemLeft}>
                    <View style={styles.profileIcon}>
                      <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileLabel}>Bütün Məlumatları Təmizlə</Text>
                      <Text style={styles.profileValue}>Geri alına bilməz</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </Card>
            </View>

            {/* App Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Haqqında</Text>
              <Card style={styles.settingsCard}>
                <View style={styles.profileItem}>
                  <View style={styles.profileItemLeft}>
                    <View style={styles.profileIcon}>
                      <Ionicons name="information-circle-outline" size={20} color={Colors.light.info} />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileLabel}>Versiya</Text>
                      <Text style={styles.profileValue}>1.0.0</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.profileItem}>
                  <View style={styles.profileItemLeft}>
                    <View style={styles.profileIcon}>
                      <Ionicons name="code-outline" size={20} color={Colors.light.info} />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileLabel}>Developer</Text>
                      <Text style={styles.profileValue}>MyMoney Team</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {showEditModal && renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.xl,
  },
  userCard: {
    padding: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  statsCard: {
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    textAlign: 'center',
  },
  section: {
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.sm,
  },
  settingsCard: {
    padding: 0,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.borderRadius.small,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: DesignSystem.borderRadius.large,
    width: '90%',
    ...DesignSystem.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  modalBody: {
    padding: DesignSystem.spacing.md,
  },
  modalInput: {
    marginBottom: 0,
  },
  modalFooter: {
    padding: DesignSystem.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  saveButton: {
    width: '100%',
  },
});