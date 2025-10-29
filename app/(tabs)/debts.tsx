import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
import { DesignSystem } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemedColors } from '@/hooks/useThemedStyles';
import { Debt, StorageService } from '@/services/storage';


export default function DebtsScreen() {
  const { t, currencySymbol } = useLanguage();
  const colors = useThemedColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [filteredDebts, setFilteredDebts] = useState<Debt[]>([]);
  const [newDebt, setNewDebt] = useState({
    title: '',
    description: '',
    amount: '',
    creditor: '',
    dueDate: '',
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const savedDebts = await StorageService.getDebts();
      setDebts(savedDebts);
      // Always show all debts initially, then filter if needed
      setFilteredDebts(savedDebts);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const filterDebtsByDate = (debtsList: Debt[], year: number, month: number) => {
    const filtered = debtsList.filter(debt => {
      const dueDate = new Date(debt.dueDate);
      const debtYear = dueDate.getFullYear();
      const debtMonth = dueDate.getMonth() + 1;
      
      // Show debts that are due in the selected month/year or before
      return debtYear < year || (debtYear === year && debtMonth <= month);
    });
    
    // If no debts match the filter, show all debts
    if (filtered.length === 0 && debtsList.length > 0) {
      setFilteredDebts(debtsList);
    } else {
      setFilteredDebts(filtered);
    }
  };

  const handleFilterDebts = () => {
    filterDebtsByDate(debts, selectedYear, selectedMonth);
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const getMonthOptions = () => {
    return [
      { value: 1, label: t.debts.january },
      { value: 2, label: t.debts.february },
      { value: 3, label: t.debts.march },
      { value: 4, label: t.debts.april },
      { value: 5, label: t.debts.may },
      { value: 6, label: t.debts.june },
      { value: 7, label: t.debts.july },
      { value: 8, label: t.debts.august },
      { value: 9, label: t.debts.september },
      { value: 10, label: t.debts.october },
      { value: 11, label: t.debts.november },
      { value: 12, label: t.debts.december },
    ];
  };

  const handleAddDebt = async () => {
    if (!newDebt.title || !newDebt.amount || !newDebt.creditor) {
      Alert.alert(t.common.error || t.debts.fillAllFields, t.debts.fillAllFields);
      return;
    }

    try {
      await StorageService.saveDebt({
        title: newDebt.title,
        description: newDebt.description,
        amount: parseFloat(newDebt.amount),
        paidAmount: 0,
        creditor: newDebt.creditor,
        dueDate: newDebt.dueDate,
        isPaid: false,
      });

      setNewDebt({
        title: '',
        description: '',
        amount: '',
        creditor: '',
        dueDate: '',
      });
      setShowAddDebtModal(false);
      await loadDebts(); // Reload debts from storage
    } catch (error) {
      console.error('Error saving debt:', error);
      Alert.alert(t.common.error || t.debts.addError, t.debts.addError);
    }
  };

  const handlePayDebt = async (debtId: string, amount: number) => {
    try {
      const debt = debts.find(d => d.id === debtId);
      if (!debt) return;

      const newPaidAmount = Math.min(debt.paidAmount + amount, debt.amount);
      const isPaid = newPaidAmount >= debt.amount;

      await StorageService.updateDebt(debtId, {
        paidAmount: newPaidAmount,
        isPaid,
      });

      await loadDebts(); // Reload debts from storage
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    Alert.alert(
      t.debts.delete,
      t.debts.deleteConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteDebt(debtId);
              await loadDebts(); // Reload debts from storage
            } catch (error) {
              console.error('Error deleting debt:', error);
              Alert.alert(t.common.error || t.debts.deleteError, t.debts.deleteError);
            }
          },
        },
      ]
    );
  };

  const getRemainingAmount = (debt: Debt) => {
    return debt.amount - debt.paidAmount;
  };

  const getProgressPercentage = (debt: Debt) => {
    return (debt.paidAmount / debt.amount) * 100;
  };

  const renderDebtItem = (debt: Debt) => {
    const remainingAmount = getRemainingAmount(debt);
    const progress = getProgressPercentage(debt);
    const dueDate = new Date(debt.dueDate);
    const isOverdue = dueDate < new Date() && !debt.isPaid;
    
    return (
      <Card key={debt.id} style={styles.debtItem}>
        <View style={debt.isPaid ? styles.paidDebt : undefined}>
          <View style={styles.debtHeader}>
          <View style={styles.debtTitleContainer}>
            <Text style={[styles.debtTitle, debt.isPaid && styles.paidText]}>
              {debt.title}
            </Text>
            {debt.isPaid && (
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.paidBadgeText}>{t.debts.paid}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDeleteDebt(debt.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.debtCreditor, debt.isPaid && styles.paidText]}>
          <Ionicons name="person" size={14} color={colors.textSecondary} />
          {' '}{debt.creditor}
        </Text>

        {debt.description && (
          <Text style={[styles.debtDescription, debt.isPaid && styles.paidText]}>
            {debt.description}
          </Text>
        )}

        <View style={styles.debtAmounts}>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, debt.isPaid && styles.paidText]}>Ümumi məbləğ:</Text>
            <Text style={[styles.amountValue, debt.isPaid && styles.paidText]}>
              {debt.amount.toFixed(2)} {currencySymbol}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, debt.isPaid && styles.paidText]}>{t.debts.paid}:</Text>
            <Text style={[styles.amountValue, debt.isPaid && styles.paidText]}>
              {debt.paidAmount.toFixed(2)} {currencySymbol}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, debt.isPaid && styles.paidText]}>{t.debts.remaining}:</Text>
            <Text style={[styles.amountValue, debt.isPaid && styles.paidText]}>
              {remainingAmount.toFixed(2)} {currencySymbol}
            </Text>
          </View>
        </View>

        <View style={styles.debtProgress}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, debt.isPaid && styles.paidText]}>
              Tərəqqi: {progress.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` },
                debt.isPaid && styles.paidProgress
              ]} 
            />
          </View>
        </View>

        <View style={styles.debtFooter}>
          <Text style={[styles.debtDueDate, isOverdue && styles.overdueText]}>
            <Ionicons name="calendar" size={14} color={isOverdue ? colors.error : colors.textSecondary} />
            {' '}Son tarix: {dueDate.toLocaleDateString('az-AZ')}
          </Text>
          
          {!debt.isPaid && (
            <View style={styles.debtActions}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayDebt(debt.id, 50)}
              >
                <Text style={styles.payButtonText}>+50 {currencySymbol}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayDebt(debt.id, 100)}
              >
                <Text style={styles.payButtonText}>+100 {currencySymbol}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payButton, styles.payAllButton]}
                onPress={() => handlePayDebt(debt.id, remainingAmount)}
              >
                <Text style={styles.payAllButtonText}>{t.debts.pay}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </View>
      </Card>
    );
  };

  const renderAddDebtModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Yeni Borç</Text>
          <TouchableOpacity onPress={() => setShowAddDebtModal(false)}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.modalBody}
          data={[1]} // Dummy data for FlatList
          renderItem={() => (
            <View>
              <Input
                placeholder={t.debts.titleLabel}
                value={newDebt.title}
                onChangeText={(text) => setNewDebt(prev => ({ ...prev, title: text }))}
                style={styles.modalInput}
              />
              
              <Input
                placeholder={t.debts.description}
                value={newDebt.description}
                onChangeText={(text) => setNewDebt(prev => ({ ...prev, description: text }))}
                style={styles.modalInput}
                multiline
              />
              
              <Input
                placeholder={t.debts.amount}
                value={newDebt.amount}
                onChangeText={(text) => setNewDebt(prev => ({ ...prev, amount: text }))}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <Input
                placeholder={t.debts.creditor}
                value={newDebt.creditor}
                onChangeText={(text) => setNewDebt(prev => ({ ...prev, creditor: text }))}
                style={styles.modalInput}
              />
              
              <Input
                placeholder={t.debts.dueDate}
                value={newDebt.dueDate}
                onChangeText={(text) => setNewDebt(prev => ({ ...prev, dueDate: text }))}
                style={styles.modalInput}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.modalFooter}>
          <Button
            title={t.debts.addDebt}
            onPress={handleAddDebt}
            style={styles.addButton}
          />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{t.debts.noDebts}</Text>
      <Text style={styles.emptySubtitle}>
        {t.goals.addFirstGoal || t.debts.addDebt}
      </Text>
      <Button
        title={t.debts.addDebt}
        onPress={() => setShowAddDebtModal(true)}
        style={styles.emptyButton}
      />
    </View>
  );

  const totalDebt = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = filteredDebts.reduce((sum, debt) => sum + debt.paidAmount, 0);
  const totalRemaining = totalDebt - totalPaid;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title={t.debts.title}
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />
      
      <FlatList
        style={styles.content}
        data={filteredDebts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderDebtItem(item)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={() => (
          <View>
            {/* Filter Controls */}
            <View style={styles.filterContainer}>
              <Card style={styles.filterCard}>
                <View style={styles.filterRow}>
                  {/* Year Selector */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>{t.debts.year}:</Text>
                    <TouchableOpacity
                      style={styles.filterButton}
                      onPress={() => {
                        Alert.alert(
                          t.debts.year,
                          '',
                          getYearOptions().map(year => ({
                            text: year.toString(),
                            onPress: () => setSelectedYear(year),
                          }))
                        );
                      }}
                    >
                      <Text style={styles.filterButtonText}>{selectedYear}</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Month Selector */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>{t.debts.month}:</Text>
                    <TouchableOpacity
                      style={styles.filterButton}
                      onPress={() => {
                        Alert.alert(
                          t.debts.month,
                          '',
                          getMonthOptions().map(month => ({
                            text: month.label,
                            onPress: () => setSelectedMonth(month.value),
                          }))
                        );
                      }}
                    >
                      <Text style={styles.filterButtonText}>
                        {getMonthOptions().find(m => m.value === selectedMonth)?.label}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Filter Button */}
                  <TouchableOpacity
                    style={styles.applyFilterButton}
                    onPress={handleFilterDebts}
                  >
                    <Ionicons name="filter" size={16} color="#FFFFFF" />
                    <Text style={styles.applyFilterButtonText}>{t.debts.filter}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>

            {/* Summary */}
            {filteredDebts.length > 0 && (
              <View style={styles.summaryContainer}>
                <Card style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t.debts.totalDebts}:</Text>
                    <Text style={styles.summaryValue}>{totalDebt.toFixed(2)} {currencySymbol}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t.debts.paid}:</Text>
                    <Text style={styles.summaryValue}>{totalPaid.toFixed(2)} {currencySymbol}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t.debts.remaining}:</Text>
                    <Text style={[styles.summaryValue, styles.remainingAmount]}>
                      {totalRemaining.toFixed(2)} {currencySymbol}
                    </Text>
                  </View>
                </Card>
              </View>
            )}

            {/* Section Title */}
            <View style={styles.debtsContainer}>
              <Text style={styles.sectionTitle}>
                {t.debts.title} ({filteredDebts.length})
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            {filteredDebts.length > 0 && (
              <View style={styles.fabContainer}>
                <TouchableOpacity
                  style={styles.fab}
                  onPress={() => setShowAddDebtModal(true)}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {showAddDebtModal && renderAddDebtModal()}
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemedColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryContainer: {
    paddingBottom: DesignSystem.spacing.md,
  },
  summaryCard: {
    padding: DesignSystem.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  remainingAmount: {
    color: colors.error,
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  footerContainer: {
    paddingBottom: DesignSystem.spacing.xl,
  },
  debtsContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  filterContainer: {
    marginBottom: DesignSystem.spacing.md,
    justifyContent: 'center',
  },
  filterCard: {
    padding: DesignSystem.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterItem: {
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  applyFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.medium,
    marginLeft: DesignSystem.spacing.sm,
  },
  applyFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  debtItem: {
    padding: DesignSystem.spacing.md,
  },
  paidDebt: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.sm,
  },
  debtTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  debtTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    flex: 1,
  },
  paidText: {
    color: colors.textSecondary,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.small,
    gap: 4,
  },
  paidBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  debtCreditor: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: DesignSystem.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
    lineHeight: 20,
  },
  debtAmounts: {
    marginBottom: DesignSystem.spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  debtProgress: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressHeader: {
    marginBottom: DesignSystem.spacing.sm,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: DesignSystem.borderRadius.small,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.error,
    borderRadius: DesignSystem.borderRadius.small,
  },
  paidProgress: {
    backgroundColor: colors.success,
  },
  debtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtDueDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueText: {
    color: colors.error,
  },
  debtActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  payButton: {
    backgroundColor: colors.error,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.small,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  payAllButton: {
    backgroundColor: colors.primary,
  },
  payAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  fabContainer: {
    position: 'absolute',
    bottom: DesignSystem.spacing.xl,
    right: DesignSystem.spacing.md,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.medium,
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
    marginBottom: DesignSystem.spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: DesignSystem.spacing.xl,
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
    backgroundColor: colors.background,
    borderRadius: DesignSystem.borderRadius.large,
    width: '90%',
    maxHeight: '80%',
    ...DesignSystem.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  modalBody: {
    padding: DesignSystem.spacing.md,
  },
  modalInput: {
    marginBottom: DesignSystem.spacing.md,
  },
  modalFooter: {
    padding: DesignSystem.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    width: '100%',
  },
});