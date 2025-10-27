import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import { Colors, DesignSystem } from '@/constants/theme';
import { StorageService, Transaction } from '@/services/storage';

interface UtilityCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const utilityCategories: UtilityCategory[] = [
  { id: 'electricity', name: 'İşıq', icon: 'flash', color: '#FFD700' },
  { id: 'water', name: 'Su', icon: 'water', color: '#00BFFF' },
  { id: 'gas', name: 'Qaz', icon: 'flame', color: '#FF4500' },
  { id: 'internet', name: 'İnternet', icon: 'wifi', color: '#32CD32' },
  { id: 'phone', name: 'Telefon', icon: 'call', color: '#9370DB' },
  { id: 'building', name: 'Bina Aidatı', icon: 'business', color: '#FF6347' },
];

export default function UtilitiesScreen() {
  const [utilities, setUtilities] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthlyUtilities, setMonthlyUtilities] = useState<{[key: string]: Transaction[]}>({});

  useEffect(() => {
    loadUtilities();
  }, []);

  useEffect(() => {
    if (utilities.length > 0) {
      groupUtilitiesByMonth();
    }
  }, [utilities]);

  const loadUtilities = async () => {
    try {
      const allTransactions = await StorageService.getTransactions();
      // Yalnız komunal kateqoriyasındakı xərcləri göstər
      const utilityTransactions = allTransactions.filter(t => 
        t.type === 'expense' && t.category === 'utilities'
      );
      setUtilities(utilityTransactions);
    } catch (error) {
      console.error('Error loading utilities:', error);
    }
  };

  const groupUtilitiesByMonth = () => {
    const grouped: {[key: string]: Transaction[]} = {};
    
    utilities.forEach(utility => {
      const date = new Date(utility.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(utility);
    });

    setMonthlyUtilities(grouped);
    
    // Set default selected month to current month
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonth(currentMonthKey);
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('az-AZ', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getUtilityCategory = (description: string) => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('işıq') || lowerDesc.includes('elektrik') || lowerDesc.includes('electricity')) {
      return utilityCategories[0];
    } else if (lowerDesc.includes('su') || lowerDesc.includes('water')) {
      return utilityCategories[1];
    } else if (lowerDesc.includes('qaz') || lowerDesc.includes('gas')) {
      return utilityCategories[2];
    } else if (lowerDesc.includes('internet') || lowerDesc.includes('wifi')) {
      return utilityCategories[3];
    } else if (lowerDesc.includes('telefon') || lowerDesc.includes('phone')) {
      return utilityCategories[4];
    } else if (lowerDesc.includes('bina') || lowerDesc.includes('aidat') || lowerDesc.includes('building')) {
      return utilityCategories[5];
    }
    
    return utilityCategories[0]; // Default to electricity
  };

  const getTotalForMonth = (monthKey: string) => {
    const monthUtilities = monthlyUtilities[monthKey] || [];
    return monthUtilities.reduce((sum, utility) => sum + utility.amount, 0);
  };

  const getTotalForCategory = (monthKey: string, categoryId: string) => {
    const monthUtilities = monthlyUtilities[monthKey] || [];
    return monthUtilities
      .filter(utility => getUtilityCategory(utility.description).id === categoryId)
      .reduce((sum, utility) => sum + utility.amount, 0);
  };

  const renderUtilityItem = (utility: Transaction) => {
    const category = getUtilityCategory(utility.description);
    const date = new Date(utility.date);
    
    return (
      <Card key={utility.id} style={styles.utilityItem}>
        <View style={styles.utilityLeft}>
          <View style={[styles.utilityIcon, { backgroundColor: category.color + '20' }]}>
            <Ionicons name={category.icon} size={20} color={category.color} />
          </View>
          <View style={styles.utilityInfo}>
            <Text style={styles.utilityDescription}>{utility.description}</Text>
            <Text style={styles.utilityCategory}>{category.name}</Text>
            <Text style={styles.utilityDate}>
              {date.toLocaleDateString('az-AZ', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>
        <Text style={styles.utilityAmount}>{utility.amount.toFixed(2)} ₼</Text>
      </Card>
    );
  };

  const renderMonthSummary = () => {
    if (!selectedMonth || !monthlyUtilities[selectedMonth]) {
      return null;
    }

    const monthUtilities = monthlyUtilities[selectedMonth];
    const totalAmount = getTotalForMonth(selectedMonth);

    return (
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {getMonthName(selectedMonth)} - Ümumi: {totalAmount.toFixed(2)} ₼
        </Text>
        
        <View style={styles.categorySummary}>
          {utilityCategories.map(category => {
            const categoryTotal = getTotalForCategory(selectedMonth, category.id);
            if (categoryTotal === 0) return null;
            
            return (
              <View key={category.id} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Ionicons name={category.icon} size={16} color={category.color} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <Text style={styles.categoryAmount}>{categoryTotal.toFixed(2)} ₼</Text>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="flash-outline" size={64} color={Colors.light.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Hələ komunal xərc yoxdur</Text>
      <Text style={styles.emptySubtitle}>
        Komunal xərclərinizi əlavə etmək üçün ana səhifədəki "Xərc Əlavə" düyməsinə basın və kateqoriya olaraq "Komunal" seçin
      </Text>
    </View>
  );

  const sortedMonths = Object.keys(monthlyUtilities).sort().reverse();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Komunal Xərclər" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {utilities.length > 0 ? (
          <>
            {/* Month Selector */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.monthSelector}
            >
              {sortedMonths.map(monthKey => (
                <TouchableOpacity
                  key={monthKey}
                  style={[
                    styles.monthButton,
                    selectedMonth === monthKey && styles.selectedMonthButton
                  ]}
                  onPress={() => setSelectedMonth(monthKey)}
                >
                  <Text style={[
                    styles.monthButtonText,
                    selectedMonth === monthKey && styles.selectedMonthButtonText
                  ]}>
                    {getMonthName(monthKey)}
                  </Text>
                  <Text style={[
                    styles.monthAmount,
                    selectedMonth === monthKey && styles.selectedMonthAmount
                  ]}>
                    {getTotalForMonth(monthKey).toFixed(0)} ₼
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Month Summary */}
            {renderMonthSummary()}

            {/* Utilities List */}
            {selectedMonth && monthlyUtilities[selectedMonth] && (
              <View style={styles.utilitiesList}>
                <Text style={styles.sectionTitle}>Xərclər</Text>
                {monthlyUtilities[selectedMonth].map(renderUtilityItem)}
              </View>
            )}
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
  monthSelector: {
    marginBottom: DesignSystem.spacing.md,
  },
  monthButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    marginRight: DesignSystem.spacing.sm,
    alignItems: 'center',
    minWidth: 100,
  },
  selectedMonthButton: {
    backgroundColor: Colors.light.primary,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  selectedMonthButtonText: {
    color: Colors.light.background,
  },
  monthAmount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  selectedMonthAmount: {
    color: Colors.light.background,
  },
  summaryCard: {
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  categorySummary: {
    gap: DesignSystem.spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  utilitiesList: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
  },
  utilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  utilityInfo: {
    flex: 1,
  },
  utilityDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  utilityCategory: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  utilityDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  utilityAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.error,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.xl * 2,
  },
  emptyIcon: {
    marginBottom: DesignSystem.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    textAlign: 'center',
    lineHeight: 24,
  },
});
