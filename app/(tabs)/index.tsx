import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AddTransactionModal } from '@/components/ui/add-transaction-modal';
import { Button } from '@/components/ui/button';
import { BalanceCard, Card } from '@/components/ui/card';
import { AppHeader } from '@/components/ui/header';
import { Colors, DesignSystem, WalletColors } from '@/constants/theme';
import { StorageService, Transaction } from '@/services/storage';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}




export default function HomeScreen() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const transactions = await StorageService.getTransactions();
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const monthlyStats = await StorageService.getMonthlyStats(currentYear, currentMonth);
      const totalBalance = await StorageService.getTotalBalance();
      
      setMonthlyIncome(monthlyStats.income);
      setMonthlyExpenses(monthlyStats.expenses);
      setTotalBalance(totalBalance);
      setRecentTransactions(transactions.slice(0, 5)); // Show last 5 transactions
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddTransaction = async (transactionData: any) => {
    try {
      await StorageService.saveTransaction({
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description,
        category: transactionData.category,
        date: transactionData.date,
      });
      
      // Reload data to update UI
      await loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-expense',
      title: 'Xərc Əlavə',
      icon: 'remove-circle',
      color: Colors.light.error,
      onPress: () => {
        console.log('Xərc əlavə düyməsinə tıklandı');
        setShowAddExpenseModal(true);
      },
    },
    {
      id: 'add-income',
      title: 'Gəlir Əlavə',
      icon: 'add-circle',
      color: Colors.light.success,
      onPress: () => {
        console.log('Gəlir əlavə düyməsinə tıklandı');
        setShowAddIncomeModal(true);
      },
    },
    {
      id: 'pay-utility',
      title: 'Komunal',
      icon: 'flash',
      color: Colors.light.accent,
      onPress: () => router.push('/utilities'),
    },
  ];

  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionButton}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={styles.quickActionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderRecentTransaction = (transaction: Transaction) => (
    <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: transaction.type === 'income' ? Colors.light.success + '20' : Colors.light.error + '20' }
        ]}>
          <Ionicons
            name={transaction.type === 'income' ? 'add-circle' : 'remove-circle'}
            size={16}
            color={transaction.type === 'income' ? Colors.light.success : Colors.light.error}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionTime}>{transaction.category}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.type === 'income' ? Colors.light.success : Colors.light.error }
      ]}>
        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} ₼
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        onNotificationPress={() => console.log('Notifications pressed')}
        onProfilePress={() => router.push('/profile')}
        onSearchPress={() => console.log('Search pressed')}
        notificationCount={3}
      />
      <FlatList
        style={styles.content}
        data={[1]} // Dummy data for FlatList
        renderItem={() => (
          <View>
            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Sürətli Əməliyyatlar</Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map(renderQuickAction)}
              </View>
            </View>

            {/* Financial Summary */}
            <View style={styles.balanceCardsContainer}>
              <Text style={styles.sectionTitle}>Maliyyə Xülasəsi</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.balanceCardsScroll}
                data={[
                  { id: 'total', balance: balanceVisible ? totalBalance.toFixed(2) : "••••••", name: "Ümumi Balans" },
                  { id: 'income', balance: balanceVisible ? monthlyIncome.toFixed(2) : "••••••", name: "Bu Ay Gəlir" },
                  { id: 'expense', balance: balanceVisible ? monthlyExpenses.toFixed(2) : "••••••", name: "Bu Ay Xərc" }
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BalanceCard
                    balance={item.balance}
                    currency="₼"
                    accountName={item.name}
                  />
                )}
              />
            </View>

            {/* Recent Transactions */}
            <View style={styles.recentTransactionsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Son Əməliyyatlar</Text>
                <TouchableOpacity onPress={() => router.push('/transactions')}>
                  <Text style={styles.seeAllText}>Hamısını Gör</Text>
                </TouchableOpacity>
              </View>
              <Card style={styles.transactionsCard}>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map(renderRecentTransaction)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={Colors.light.iconSecondary} />
                    <Text style={styles.emptyStateText}>Hələ əməliyyat yoxdur</Text>
                    <Text style={styles.emptyStateSubtext}>İlk əməliyyatınızı əlavə edin</Text>
                  </View>
                )}
              </Card>
            </View>

            {/* Statistics */}
            <View style={styles.statisticsContainer}>
              <Text style={styles.sectionTitle}>Bu Ay</Text>
              <View style={styles.statisticsGrid}>
                <Card style={styles.statisticCard}>
                  <View style={styles.statisticContent}>
                    <Ionicons name="trending-up" size={24} color={Colors.light.success} />
                    <Text style={styles.statisticValue}>+{monthlyIncome.toFixed(2)} ₼</Text>
                    <Text style={styles.statisticLabel}>Gəlir</Text>
                  </View>
                </Card>
                <Card style={styles.statisticCard}>
                  <View style={styles.statisticContent}>
                    <Ionicons name="trending-down" size={24} color={Colors.light.error} />
                    <Text style={styles.statisticValue}>-{monthlyExpenses.toFixed(2)} ₼</Text>
                    <Text style={styles.statisticLabel}>Xərc</Text>
                  </View>
                </Card>
              </View>
            </View>

            {/* Financial Tips */}
            <View style={styles.promotionsContainer}>
              <Text style={styles.sectionTitle}>Maliyyə Məsləhətləri</Text>
              <Card variant="gradient" style={styles.promotionCard}>
                <LinearGradient
                  colors={WalletColors.skyTrustGradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promotionGradient}
                >
                  <View style={styles.promotionContent}>
                    <Text style={styles.promotionTitle}>Aylıq Büdcə Planlaşdırın</Text>
                    <Text style={styles.promotionSubtitle}>Gəlir və xərclərinizi balanslaşdırın</Text>
                    <Button
                      title="Planlaşdır"
                      variant="accent"
                      size="small"
                      onPress={() => {}}
                      style={styles.promotionButton}
                    />
                  </View>
                </LinearGradient>
              </Card>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Modals */}
      <AddTransactionModal
        visible={showAddIncomeModal}
        onClose={() => setShowAddIncomeModal(false)}
        onSave={(data) => handleAddTransaction({ ...data, type: 'income' })}
        type="income"
      />
      
      <AddTransactionModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSave={(data) => handleAddTransaction({ ...data, type: 'expense' })}
        type="expense"
      />
    </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  quickActionsContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.sm,
    ...DesignSystem.shadows.small,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  balanceCardsContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  balanceCardsScroll: {
    marginHorizontal: -DesignSystem.spacing.md,
  },
  recentTransactionsContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  transactionsCard: {
    padding: 0,
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
    width: 32,
    height: 32,
    borderRadius: DesignSystem.borderRadius.medium,
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
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  statisticsContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  statisticsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  statisticCard: {
    flex: 1,
    alignItems: 'center',
  },
  statisticContent: {
    alignItems: 'center',
  },
  statisticValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: DesignSystem.spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  statisticLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  promotionsContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  promotionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  promotionGradient: {
    padding: DesignSystem.spacing.lg,
  },
  promotionContent: {
    alignItems: 'center',
  },
  promotionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: DesignSystem.spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  promotionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  promotionButton: {
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});
