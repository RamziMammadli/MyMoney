import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { AppHeader } from '@/components/ui/header';
import { DesignSystem } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemedColors } from '@/hooks/useThemedStyles';
import { StorageService, Transaction } from '@/services/storage';

interface UtilityCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const utilityCategories: UtilityCategory[] = [
  { id: 'işıq', name: 'İşıq', icon: 'flash', color: '#FFD700' },
  { id: 'su', name: 'Su', icon: 'water', color: '#00BFFF' },
  { id: 'qaz', name: 'Qaz', icon: 'flame', color: '#FF4500' },
  { id: 'internet', name: 'İnternet', icon: 'wifi', color: '#32CD32' },
  { id: 'telefon', name: 'Telefon', icon: 'call', color: '#9370DB' },
  { id: 'bina', name: 'Bina Aidatı', icon: 'business', color: '#FF6347' },
];

export default function UtilitiesScreen() {
  const { t, language, currencySymbol } = useLanguage();
  const colors = useThemedColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
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
      
      // Komunal kateqoriyasındakı və komunal ilə bağlı xərcləri göstər
      const utilityTransactions = allTransactions.filter(t => 
        t.type === 'expense' && (
          t.category === 'komunal' ||
          t.description.toLowerCase().includes('komunal') ||
          t.description.toLowerCase().includes('işıq') ||
          t.description.toLowerCase().includes('su') ||
          t.description.toLowerCase().includes('qaz') ||
          t.description.toLowerCase().includes('internet') ||
          t.description.toLowerCase().includes('telefon') ||
          t.description.toLowerCase().includes('bina')
        )
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
    const monthNum = parseInt(month);
    const monthNames: { [key: number]: string } = {
      1: t.utilities.january,
      2: t.utilities.february,
      3: t.utilities.march,
      4: t.utilities.april,
      5: t.utilities.may,
      6: t.utilities.june,
      7: t.utilities.july,
      8: t.utilities.august,
      9: t.utilities.september,
      10: t.utilities.october,
      11: t.utilities.november,
      12: t.utilities.december,
    };
    return `${monthNames[monthNum]} ${year}`;
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
        <View style={styles.utilityContent}>
          {/* Left Side - Icon and Info */}
          <View style={styles.utilityLeft}>
            <View style={[styles.utilityIcon, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <View style={styles.utilityInfo}>
              <Text style={styles.utilityDescription} numberOfLines={1}>
                {utility.description}
              </Text>
              <Text style={styles.utilityCategory}>
                {category.id === 'işıq' ? t.utilities.electricity :
                 category.id === 'su' ? t.utilities.water :
                 category.id === 'qaz' ? t.utilities.gas :
                 category.id === 'internet' ? t.utilities.internet :
                 category.id === 'telefon' ? t.utilities.phone :
                 category.id === 'bina' ? t.utilities.building : category.name}
              </Text>
              <Text style={styles.utilityDate}>
                {date.toLocaleDateString(language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
          
          {/* Right Side - Amount */}
          <View style={styles.utilityRight}>
            <Text style={styles.utilityAmount}>-{utility.amount.toFixed(2)} {currencySymbol}</Text>
          </View>
        </View>
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
          {getMonthName(selectedMonth)} - {t.utilities.monthTotal} {totalAmount.toFixed(2)} {currencySymbol}
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
                  <Text style={styles.categoryName}>
                    {category.id === 'işıq' ? t.utilities.electricity :
                     category.id === 'su' ? t.utilities.water :
                     category.id === 'qaz' ? t.utilities.gas :
                     category.id === 'internet' ? t.utilities.internet :
                     category.id === 'telefon' ? t.utilities.phone :
                     category.id === 'bina' ? t.utilities.building : category.name}
                  </Text>
                </View>
                <Text style={styles.categoryAmount}>{categoryTotal.toFixed(2)} {currencySymbol}</Text>
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
        <Ionicons name="flash-outline" size={64} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{t.utilities.noUtilities}</Text>
      <Text style={styles.emptySubtitle}>
        {t.home.addExpense}
      </Text>
    </View>
  );

  const sortedMonths = Object.keys(monthlyUtilities).sort().reverse();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title={t.utilities.title}
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />
      
      <FlatList
        style={styles.content}
        data={utilities.length > 0 ? [1] : []} // Dummy data for FlatList
        renderItem={() => (
          <View style={styles.scrollContent}>
            {utilities.length > 0 ? (
              <>
                {/* Month Selector */}
                <FlatList 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.monthSelector}
                  data={sortedMonths}
                  keyExtractor={(item) => item}
                  renderItem={({ item: monthKey }) => (
                    <TouchableOpacity
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
                        {getTotalForMonth(monthKey).toFixed(0)} {currencySymbol}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                {/* Month Summary */}
                {renderMonthSummary()}

                {/* Utilities List */}
                {selectedMonth && monthlyUtilities[selectedMonth] && (
                  <View style={styles.utilitiesList}>
                    <Text style={styles.sectionTitle}>{t.transactions.expenses}</Text>
                    <FlatList
                      data={monthlyUtilities[selectedMonth]}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => renderUtilityItem(item)}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
              </>
            ) : (
              renderEmptyState()
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemedColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.xl,
  },
  scrollContent: {
    flex: 1,
  },
  monthSelector: {
    marginBottom: DesignSystem.spacing.md,
  },
  monthButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.medium,
    marginRight: DesignSystem.spacing.sm,
    alignItems: 'center',
    minWidth: 100,
  },
  selectedMonthButton: {
    backgroundColor: colors.primary,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  selectedMonthButtonText: {
    color: '#FFFFFF',
  },
  monthAmount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  selectedMonthAmount: {
    color: '#FFFFFF',
  },
  summaryCard: {
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
    borderRadius: DesignSystem.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  utilitiesList: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
  },
  utilityItem: {
    marginBottom: DesignSystem.spacing.sm,
  },
  utilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
  },
  utilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  utilityIcon: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  utilityInfo: {
    flex: 1,
  },
  utilityRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  utilityDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 4,
    lineHeight: 20,
  },
  utilityCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 4,
    lineHeight: 18,
  },
  utilityDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    lineHeight: 16,
  },
  utilityAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    textAlign: 'right',
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
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    textAlign: 'center',
    lineHeight: 24,
  },
});
