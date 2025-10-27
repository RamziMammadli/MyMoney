import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Colors, DesignSystem } from '@/constants/theme';

interface Debt {
  id: string;
  title: string;
  description: string;
  amount: number;
  paidAmount: number;
  creditor: string;
  dueDate: string;
  isPaid: boolean;
  createdAt: string;
}

export default function DebtsScreen() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
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
      // For now, we'll use a simple array since we don't have debt storage yet
      // In a real app, you'd use AsyncStorage or a database
      const savedDebts = await getDebtsFromStorage();
      setDebts(savedDebts);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const getDebtsFromStorage = async (): Promise<Debt[]> => {
    // This would be implemented with AsyncStorage in a real app
    return [];
  };

  const saveDebtsToStorage = async (debtsList: Debt[]) => {
    // This would be implemented with AsyncStorage in a real app
    console.log('Saving debts:', debtsList);
  };

  const handleAddDebt = async () => {
    if (!newDebt.title || !newDebt.amount || !newDebt.creditor) {
      Alert.alert('Xəta', 'Zəhmət olmasa bütün məlumatları doldurun');
      return;
    }

    try {
      const debt: Debt = {
        id: Date.now().toString(),
        title: newDebt.title,
        description: newDebt.description,
        amount: parseFloat(newDebt.amount),
        paidAmount: 0,
        creditor: newDebt.creditor,
        dueDate: newDebt.dueDate,
        isPaid: false,
        createdAt: new Date().toISOString(),
      };

      const updatedDebts = [...debts, debt];
      setDebts(updatedDebts);
      await saveDebtsToStorage(updatedDebts);

      setNewDebt({
        title: '',
        description: '',
        amount: '',
        creditor: '',
        dueDate: '',
      });
      setShowAddDebtModal(false);
    } catch (error) {
      console.error('Error saving debt:', error);
      Alert.alert('Xəta', 'Borç əlavə edilərkən xəta baş verdi');
    }
  };

  const handlePayDebt = async (debtId: string, amount: number) => {
    try {
      const updatedDebts = debts.map(debt => {
        if (debt.id === debtId) {
          const newPaidAmount = Math.min(debt.paidAmount + amount, debt.amount);
          return {
            ...debt,
            paidAmount: newPaidAmount,
            isPaid: newPaidAmount >= debt.amount,
          };
        }
        return debt;
      });

      setDebts(updatedDebts);
      await saveDebtsToStorage(updatedDebts);
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    Alert.alert(
      'Borcu Sil',
      'Bu borcu silmək istədiyinizə əminsiniz?',
      [
        { text: 'Ləğv Et', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updatedDebts = debts.filter(debt => debt.id !== debtId);
            setDebts(updatedDebts);
            await saveDebtsToStorage(updatedDebts);
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
      <Card key={debt.id} style={[styles.debtItem, debt.isPaid && styles.paidDebt]}>
        <View style={styles.debtHeader}>
          <View style={styles.debtTitleContainer}>
            <Text style={[styles.debtTitle, debt.isPaid && styles.paidText]}>
              {debt.title}
            </Text>
            {debt.isPaid && (
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
                <Text style={styles.paidBadgeText}>Ödənildi</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDeleteDebt(debt.id)}>
            <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.debtCreditor, debt.isPaid && styles.paidText]}>
          <Ionicons name="person" size={14} color={Colors.light.textSecondary} />
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
              {debt.amount.toFixed(2)} ₼
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, debt.isPaid && styles.paidText]}>Ödənilən:</Text>
            <Text style={[styles.amountValue, debt.isPaid && styles.paidText]}>
              {debt.paidAmount.toFixed(2)} ₼
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, debt.isPaid && styles.paidText]}>Qalan:</Text>
            <Text style={[styles.amountValue, debt.isPaid && styles.paidText]}>
              {remainingAmount.toFixed(2)} ₼
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
            <Ionicons name="calendar" size={14} color={isOverdue ? Colors.light.error : Colors.light.textSecondary} />
            {' '}Son tarix: {dueDate.toLocaleDateString('az-AZ')}
          </Text>
          
          {!debt.isPaid && (
            <View style={styles.debtActions}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayDebt(debt.id, 50)}
              >
                <Text style={styles.payButtonText}>+50 ₼</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayDebt(debt.id, 100)}
              >
                <Text style={styles.payButtonText}>+100 ₼</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payButton, styles.payAllButton]}
                onPress={() => handlePayDebt(debt.id, remainingAmount)}
              >
                <Text style={styles.payAllButtonText}>Hamısını ödə</Text>
              </TouchableOpacity>
            </View>
          )}
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
            <Ionicons name="close" size={24} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <Input
            placeholder="Borç adı"
            value={newDebt.title}
            onChangeText={(text) => setNewDebt(prev => ({ ...prev, title: text }))}
            style={styles.modalInput}
          />
          
          <Input
            placeholder="Təsvir (istəyə bağlı)"
            value={newDebt.description}
            onChangeText={(text) => setNewDebt(prev => ({ ...prev, description: text }))}
            style={styles.modalInput}
            multiline
          />
          
          <Input
            placeholder="Məbləğ (₼)"
            value={newDebt.amount}
            onChangeText={(text) => setNewDebt(prev => ({ ...prev, amount: text }))}
            keyboardType="numeric"
            style={styles.modalInput}
          />
          
          <Input
            placeholder="Borç verən"
            value={newDebt.creditor}
            onChangeText={(text) => setNewDebt(prev => ({ ...prev, creditor: text }))}
            style={styles.modalInput}
          />
          
          <Input
            placeholder="Son tarix (YYYY-MM-DD)"
            value={newDebt.dueDate}
            onChangeText={(text) => setNewDebt(prev => ({ ...prev, dueDate: text }))}
            style={styles.modalInput}
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="Borç Əlavə Et"
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
        <Ionicons name="document-text-outline" size={64} color={Colors.light.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Hələ borç yoxdur</Text>
      <Text style={styles.emptySubtitle}>
        İlk borcunuzu əlavə etmək üçün aşağıdakı düyməyə basın
      </Text>
      <Button
        title="Borç Əlavə Et"
        onPress={() => setShowAddDebtModal(true)}
        style={styles.emptyButton}
      />
    </View>
  );

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + debt.paidAmount, 0);
  const totalRemaining = totalDebt - totalPaid;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Borclar" />
      
      {debts.length > 0 && (
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ümumi Borç:</Text>
              <Text style={styles.summaryValue}>{totalDebt.toFixed(2)} ₼</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ödənilən:</Text>
              <Text style={styles.summaryValue}>{totalPaid.toFixed(2)} ₼</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Qalan:</Text>
              <Text style={[styles.summaryValue, styles.remainingAmount]}>
                {totalRemaining.toFixed(2)} ₼
              </Text>
            </View>
          </Card>
        </View>
      )}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {debts.length > 0 ? (
          <View style={styles.debtsList}>
            {debts.map(renderDebtItem)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {debts.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddDebtModal(true)}
          >
            <Ionicons name="add" size={24} color={Colors.light.background} />
          </TouchableOpacity>
        </View>
      )}

      {showAddDebtModal && renderAddDebtModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  summaryContainer: {
    paddingHorizontal: DesignSystem.spacing.md,
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
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  remainingAmount: {
    color: Colors.light.error,
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.xl,
  },
  debtsList: {
    gap: DesignSystem.spacing.md,
  },
  debtItem: {
    padding: DesignSystem.spacing.md,
  },
  paidDebt: {
    backgroundColor: Colors.light.success + '10',
    borderColor: Colors.light.success + '30',
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
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    flex: 1,
  },
  paidText: {
    color: Colors.light.textSecondary,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
    gap: 4,
  },
  paidBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.success,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  debtCreditor: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: DesignSystem.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
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
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.error,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  paidProgress: {
    backgroundColor: Colors.light.success,
  },
  debtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtDueDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueText: {
    color: Colors.light.error,
  },
  debtActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  payButton: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.background,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  payAllButton: {
    backgroundColor: Colors.light.primary,
  },
  payAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.background,
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
    backgroundColor: Colors.light.primary,
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
    backgroundColor: Colors.light.background,
    borderRadius: DesignSystem.borderRadius.lg,
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
    marginBottom: DesignSystem.spacing.md,
  },
  modalFooter: {
    padding: DesignSystem.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  addButton: {
    width: '100%',
  },
});