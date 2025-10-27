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
import { SearchInput } from '@/components/ui/input';
import { Colors, DesignSystem } from '@/constants/theme';
import { StorageService, Transaction } from '@/services/storage';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'categories'>('expenses');

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchQuery, selectedCategory]);

  const loadExpenses = async () => {
    try {
      const allTransactions = await StorageService.getTransactions();
      const expenseTransactions = allTransactions.filter(t => t.type === 'expense');
      setExpenses(expenseTransactions);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    setFilteredExpenses(filtered);
  };

  const categories = StorageService.getExpenseCategories();

  const getCategoryStats = () => {
    const stats: { [key: string]: { total: number; count: number } } = {};
    
    expenses.forEach(expense => {
      if (!stats[expense.category]) {
        stats[expense.category] = { total: 0, count: 0 };
      }
      stats[expense.category].total += expense.amount;
      stats[expense.category].count += 1;
    });

    return stats;
  };

  const categoryStats = getCategoryStats();

  const renderExpenseItem = (expense: Transaction) => {
    const category = categories.find(c => c.id === expense.category);
    const date = new Date(expense.date);
    
    return (
      <Card key={expense.id} style={styles.expenseItem}>
        <View style={styles.expenseLeft}>
          <View style={[styles.expenseIcon, { backgroundColor: Colors.light.error + '20' }]}>
            <Ionicons 
              name={category?.icon || 'remove-circle'} 
              size={20} 
              color={Colors.light.error} 
            />
          </View>
          <View style={styles.expenseInfo}>
            <Text 
              style={styles.expenseDescription}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {expense.description}
            </Text>
            <Text style={styles.expenseCategory}>{category?.name || expense.category}</Text>
            <Text style={styles.expenseDate}>
              {date.toLocaleDateString('az-AZ', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>-{expense.amount.toFixed(2)} ₼</Text>
      </Card>
    );
  };

  const renderCategoryItem = (category: any) => {
    const stats = categoryStats[category.id] || { total: 0, count: 0 };
    
    return (
      <Card key={category.id} style={styles.categoryItem}>
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: Colors.light.error + '20' }]}>
            <Ionicons name={category.icon} size={24} color={Colors.light.error} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{stats.count} əməliyyat</Text>
          </View>
        </View>
        <View style={styles.categoryRight}>
          <Text style={styles.categoryAmount}>{stats.total.toFixed(2)} ₼</Text>
          <Text style={styles.categoryPercentage}>
            {expenses.length > 0 ? ((stats.total / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1) : 0}%
          </Text>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="receipt-outline" size={64} color={Colors.light.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Hələ xərc yoxdur</Text>
      <Text style={styles.emptySubtitle}>
        İlk xərcinizi əlavə etmək üçün ana səhifədəki "Xərc Əlavə" düyməsinə basın
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Xərclər" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Xərcləri axtar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
              Xərclər ({expenses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
            onPress={() => setActiveTab('categories')}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
              Kateqoriyalar ({categories.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {activeTab === 'expenses' && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            <TouchableOpacity
              style={[styles.filterChip, !selectedCategory && styles.activeFilterChip]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.filterChipText, !selectedCategory && styles.activeFilterChipText]}>
                Hamısı
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.filterChip, selectedCategory === category.id && styles.activeFilterChip]}
                onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <Text style={[styles.filterChipText, selectedCategory === category.id && styles.activeFilterChipText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Content */}
        {activeTab === 'expenses' ? (
          filteredExpenses.length > 0 ? (
            <View style={styles.expensesList}>
              <Text style={styles.sectionTitle}>Xərclər ({filteredExpenses.length})</Text>
              {filteredExpenses.map(renderExpenseItem)}
            </View>
          ) : (
            renderEmptyState()
          )
        ) : (
          <View style={styles.categoriesList}>
            <Text style={styles.sectionTitle}>Kateqoriyalar ({categories.length})</Text>
            {categories.map(renderCategoryItem)}
          </View>
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
  searchContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: DesignSystem.borderRadius.medium,
    padding: DesignSystem.spacing.xs,
    marginBottom: DesignSystem.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.small,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  activeTabText: {
    color: Colors.light.background,
  },
  categoryFilter: {
    marginBottom: DesignSystem.spacing.md,
  },
  filterChip: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignSystem.borderRadius.round,
    marginRight: DesignSystem.spacing.sm,
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    width: '100%',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  activeFilterChipText: {
    color: Colors.light.background,
  },
  expensesList: {
    marginBottom: DesignSystem.spacing.xl,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,

  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md
  },
  expenseInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',

  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
    width: 300,
  },
  expenseCategory: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
    width: 200,
  },
  expenseDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    width: 200,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.error,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginTop: 10,
  },
  categoriesList: {
    marginBottom: DesignSystem.spacing.xl,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
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