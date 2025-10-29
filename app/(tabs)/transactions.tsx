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
import { SearchInput } from '@/components/ui/input';
import { DesignSystem } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemedColors } from '@/hooks/useThemedStyles';
import { StorageService, Transaction } from '@/services/storage';

export default function TransactionsScreen() {
  const { t, language, currencySymbol } = useLanguage();
  const colors = useThemedColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedType, selectedCategory]);

  const loadTransactions = async () => {
    try {
      const allTransactions = await StorageService.getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return 'add-circle';
    }
    
    const categoryIcons: { [key: string]: string } = {
      'yemək': 'restaurant',
      'nəqliyyat': 'car',
      'alış-veriş': 'bag',
      'əyləncə': 'game-controller',
      'komunal': 'flash',
      'sağlamlıq': 'medical',
      'təhsil': 'school',
      'geyim': 'shirt',
      'digər': 'ellipsis-horizontal',
      'maaş': 'briefcase',
      'freelance': 'laptop',
      'investisiya': 'trending-up',
      'hədiyyə': 'gift',
      'satış': 'cash',
    };
    
    return categoryIcons[transaction.category] || 'remove-circle';
  };

  const getTransactionIconColor = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return colors.success;
    }
    
    const categoryColors: { [key: string]: string } = {
      'yemək': colors.error,
      'nəqliyyat': colors.warning,
      'alış-veriş': colors.accent,
      'əyləncə': colors.info,
      'komunal': colors.primary,
      'sağlamlıq': colors.error,
      'təhsil': colors.success,
      'geyim': colors.accent,
      'digər': colors.textSecondary,
      'maaş': colors.success,
      'freelance': colors.success,
      'investisiya': colors.success,
      'hədiyyə': colors.success,
      'satış': colors.success,
    };
    
    return categoryColors[transaction.category] || colors.error;
  };

  const renderTransaction = (transaction: Transaction) => {
    const transactionDate = new Date(transaction.date);
    const iconName = getTransactionIcon(transaction);
    const iconColor = getTransactionIconColor(transaction);
    
    return (
      <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[
            styles.transactionIcon,
            { backgroundColor: iconColor + '20' }
          ]}>
            <Ionicons name={iconName as any} size={20} color={iconColor} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{transaction.description}</Text>
            <Text style={styles.transactionCategory}>{transaction.category}</Text>
            <Text style={styles.transactionDate}>
              {transactionDate.toLocaleDateString(language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US')} • {transactionDate.toLocaleTimeString(language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: transaction.type === 'income' ? colors.success : colors.error }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} {currencySymbol}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      <TouchableOpacity
        style={[styles.filterTab, selectedType === 'all' && styles.activeFilterTab]}
        onPress={() => setSelectedType('all')}
      >
        <Text style={[styles.filterTabText, selectedType === 'all' && styles.activeFilterTabText]}>
{t.transactions.all}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedType === 'income' && styles.activeFilterTab]}
        onPress={() => setSelectedType('income')}
      >
        <Text style={[styles.filterTabText, selectedType === 'income' && styles.activeFilterTabText]}>
{t.transactions.income}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedType === 'expense' && styles.activeFilterTab]}
        onPress={() => setSelectedType('expense')}
      >
        <Text style={[styles.filterTabText, selectedType === 'expense' && styles.activeFilterTabText]}>
{t.transactions.expenses}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryFilter = () => {
    const categories = Array.from(new Set(transactions.map(t => t.category)));
    
    return (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        data={[{ id: 'all', name: 'Hamısı' }, ...categories.map(cat => ({ id: cat, name: cat }))]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              (item.id === 'all' ? !selectedCategory : selectedCategory === item.id) && styles.activeCategoryChip
            ]}
            onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
          >
            <Text style={[
              styles.categoryChipText,
              (item.id === 'all' ? !selectedCategory : selectedCategory === item.id) && styles.activeCategoryChipText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={colors.iconSecondary} />
      <Text style={styles.emptyStateTitle}>{t.transactions.noTransactions}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? t.transactions.noTransactions : t.home.noTransactions}
      </Text>
    </View>
  );

  const getTotalAmount = () => {
    const total = filteredTransactions.reduce((sum, transaction) => {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);
    return total;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title={t.transactions.title}
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />
      
      <FlatList
        style={styles.content}
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderTransaction(item)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* Search */}
            <View style={styles.searchContainer}>
              <SearchInput
                placeholder={t.transactions.title + '...'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filter Tabs */}
            {renderFilterTabs()}

            {/* Category Filter */}
            {renderCategoryFilter()}

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>{t.home.totalBalance}</Text>
                  <Text style={[
                    styles.summaryAmount,
                    { color: getTotalAmount() >= 0 ? colors.success : colors.error }
                  ]}>
                    {getTotalAmount() >= 0 ? '+' : ''}{getTotalAmount().toFixed(2)} {currencySymbol}
                  </Text>
                  <Text style={styles.summarySubtitle}>
                    {filteredTransactions.length} {t.transactions.title.toLowerCase()}
                  </Text>
                </View>
              </Card>
            </View>

            {/* Section Title */}
            <View style={styles.transactionsContainer}>
              <Text style={styles.sectionTitle}>
                {t.transactions.title} ({filteredTransactions.length})
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
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
  searchContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: DesignSystem.borderRadius.medium,
    padding: 4,
    marginBottom: DesignSystem.spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.small,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  activeFilterTabText: {
    color: colors.text,
  },
  categoryFilter: {
    marginBottom: DesignSystem.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: DesignSystem.borderRadius.round,
    marginRight: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  activeCategoryChipText: {
    color: colors.text,
  },
  summaryContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  summaryCard: {
    padding: DesignSystem.spacing.lg,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: DesignSystem.spacing.sm,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.xs,
  },
  summarySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  transactionsContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: DesignSystem.spacing.sm,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});
