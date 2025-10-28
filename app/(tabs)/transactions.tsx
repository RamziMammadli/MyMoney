import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { Colors, DesignSystem } from '@/constants/theme';
import { StorageService, Transaction } from '@/services/storage';

export default function TransactionsScreen() {
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
      return Colors.light.success;
    }
    
    const categoryColors: { [key: string]: string } = {
      'yemək': Colors.light.error,
      'nəqliyyat': Colors.light.warning,
      'alış-veriş': Colors.light.accent,
      'əyləncə': Colors.light.info,
      'komunal': Colors.light.primary,
      'sağlamlıq': Colors.light.error,
      'təhsil': Colors.light.success,
      'geyim': Colors.light.accent,
      'digər': Colors.light.textSecondary,
      'maaş': Colors.light.success,
      'freelance': Colors.light.success,
      'investisiya': Colors.light.success,
      'hədiyyə': Colors.light.success,
      'satış': Colors.light.success,
    };
    
    return categoryColors[transaction.category] || Colors.light.error;
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
              {transactionDate.toLocaleDateString('az-AZ')} • {transactionDate.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: transaction.type === 'income' ? Colors.light.success : Colors.light.error }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} ₼
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
          Hamısı
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedType === 'income' && styles.activeFilterTab]}
        onPress={() => setSelectedType('income')}
      >
        <Text style={[styles.filterTabText, selectedType === 'income' && styles.activeFilterTabText]}>
          Gəlir
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedType === 'expense' && styles.activeFilterTab]}
        onPress={() => setSelectedType('expense')}
      >
        <Text style={[styles.filterTabText, selectedType === 'expense' && styles.activeFilterTabText]}>
          Xərc
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
      <Ionicons name="receipt-outline" size={64} color={Colors.light.iconSecondary} />
      <Text style={styles.emptyStateTitle}>Əməliyyat tapılmadı</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? 'Axtarış sorğunuza uyğun əməliyyat yoxdur' : 'Hələ əməliyyat əlavə edilməyib'}
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
        title="Əməliyyatlar"
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
                placeholder="Əməliyyat axtar..."
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
                  <Text style={styles.summaryTitle}>Ümumi Balans</Text>
                  <Text style={[
                    styles.summaryAmount,
                    { color: getTotalAmount() >= 0 ? Colors.light.success : Colors.light.error }
                  ]}>
                    {getTotalAmount() >= 0 ? '+' : ''}{getTotalAmount().toFixed(2)} ₼
                  </Text>
                  <Text style={styles.summarySubtitle}>
                    {filteredTransactions.length} əməliyyat
                  </Text>
                </View>
              </Card>
            </View>

            {/* Section Title */}
            <View style={styles.transactionsContainer}>
              <Text style={styles.sectionTitle}>
                Əməliyyatlar ({filteredTransactions.length})
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
      />
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
  searchContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
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
    backgroundColor: Colors.light.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  activeFilterTabText: {
    color: Colors.light.background,
  },
  categoryFilter: {
    marginBottom: DesignSystem.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignSystem.borderRadius.round,
    marginRight: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeCategoryChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  activeCategoryChipText: {
    color: Colors.light.background,
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
    color: Colors.light.text,
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
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  transactionsContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
    marginTop: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.sm,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});
