import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  View,
} from 'react-native';

import { AddTransactionModal } from '@/components/ui/add-transaction-modal';
import { Button } from '@/components/ui/button';
import { BalanceCard, Card } from '@/components/ui/card';
import { AppHeader } from '@/components/ui/header';
import { DesignSystem, WalletColors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemedColors } from '@/hooks/useThemedStyles';
import { StorageService, Transaction } from '@/services/storage';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}




export default function HomeScreen() {
  const { t, currencySymbol } = useLanguage();
  const colors = useThemedColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
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
      title: t.home.addExpense,
      icon: 'remove-circle',
      color: colors.error,
      onPress: () => {
        console.log('Xərc əlavə düyməsinə tıklandı');
        setShowAddExpenseModal(true);
      },
    },
    {
      id: 'add-income',
      title: t.home.addIncome,
      icon: 'add-circle',
      color: colors.success,
      onPress: () => {
        console.log('Gəlir əlavə düyməsinə tıklandı');
        setShowAddIncomeModal(true);
      },
    },
    {
      id: 'pay-utility',
      title: t.home.utilities,
      icon: 'flash',
      color: colors.accent,
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
          { backgroundColor: transaction.type === 'income' ? colors.success + '20' : colors.error + '20' }
        ]}>
          <Ionicons
            name={transaction.type === 'income' ? 'add-circle' : 'remove-circle'}
            size={16}
            color={transaction.type === 'income' ? colors.success : colors.error}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionTime}>{transaction.category}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.type === 'income' ? colors.success : colors.error }
      ]}>
        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} {currencySymbol}
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
              <Text style={styles.sectionTitle}>{t.home.quickActions}</Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map(renderQuickAction)}
              </View>
            </View>

            {/* Financial Summary */}
            <View style={styles.balanceCardsContainer}>
              <Text style={styles.sectionTitle}>{t.home.financialSummary}</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.balanceCardsScroll}
                data={[
                  { id: 'total', balance: balanceVisible ? totalBalance.toFixed(2) : "••••••", name: t.home.totalBalance },
                  { id: 'income', balance: balanceVisible ? monthlyIncome.toFixed(2) : "••••••", name: t.home.monthlyIncome },
                  { id: 'expense', balance: balanceVisible ? monthlyExpenses.toFixed(2) : "••••••", name: t.home.monthlyExpenses }
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BalanceCard
                    balance={item.balance}
                    currency={currencySymbol}
                    accountName={item.name}
                  />
                )}
              />
            </View>

            {/* Recent Transactions */}
            <View style={styles.recentTransactionsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t.home.recentTransactions}</Text>
                <TouchableOpacity onPress={() => router.push('/transactions')}>
                  <Text style={styles.seeAllText}>{t.home.seeAll}</Text>
                </TouchableOpacity>
              </View>
              <Card style={styles.transactionsCard}>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map(renderRecentTransaction)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={colors.iconSecondary} />
                    <Text style={styles.emptyStateText}>{t.home.noTransactions}</Text>
                    <Text style={styles.emptyStateSubtext}>{t.home.addFirstTransaction}</Text>
                  </View>
                )}
              </Card>
            </View>

            {/* Statistics */}
            <View style={styles.statisticsContainer}>
              <Text style={styles.sectionTitle}>{t.home.thisMonth}</Text>
              <View style={styles.statisticsGrid}>
                <Card style={styles.statisticCard}>
                  <View style={styles.statisticContent}>
                    <Ionicons name="trending-up" size={24} color={colors.success} />
                    <Text style={styles.statisticValue}>+{monthlyIncome.toFixed(2)} {currencySymbol}</Text>
                    <Text style={styles.statisticLabel}>{t.home.income}</Text>
                  </View>
                </Card>
                <Card style={styles.statisticCard}>
                  <View style={styles.statisticContent}>
                    <Ionicons name="trending-down" size={24} color={colors.error} />
                    <Text style={styles.statisticValue}>-{monthlyExpenses.toFixed(2)} {currencySymbol}</Text>
                    <Text style={styles.statisticLabel}>{t.home.expense}</Text>
                  </View>
                </Card>
              </View>
            </View>

            {/* Financial Tips */}
            <View style={styles.promotionsContainer}>
              <Text style={styles.sectionTitle}>{t.home.financialTips}</Text>
              <Card variant="gradient" style={styles.promotionCard}>
                <LinearGradient
                  colors={WalletColors.skyTrustGradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promotionGradient}
                >
                  <View style={styles.promotionContent}>
                    <Text style={styles.promotionTitle}>Rəmzi Müəllimə yaz</Text>
                    <Text style={styles.promotionSubtitle}>Sualınız və ya ehtiyacınız var? WhatsApp-la yazın.</Text>
                    <Button
                      title="Indi yaz"
                      variant="accent"
                      size="small"
                      onPress={() => {
                        const phone = '+994558780701';
                        const url = `whatsapp://send?phone=${phone}`;
                        Linking.openURL(url).catch(() => {
                          Linking.openURL(`https://wa.me/${phone.replace('+', '')}`);
                        });
                      }}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.text,
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
    color: colors.primary,
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
    borderBottomColor: colors.border,
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
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  transactionTime: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.text,
    marginTop: DesignSystem.spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  statisticLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
    borderRadius:10,
  },
  promotionContent: {
    alignItems: 'center',
    borderRadius:10,
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
    color: colors.text,
    marginTop: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});
