import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const allGoals = await StorageService.getGoals();
      setGoals(allGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      Alert.alert('Xəta', 'Zəhmət olmasa bütün məlumatları doldurun');
      return;
    }

    try {
      await StorageService.saveGoal({
        title: newGoal.title,
        description: newGoal.description,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline,
        category: newGoal.category || 'Digər',
        isCompleted: false,
      });

      setNewGoal({
        title: '',
        description: '',
        targetAmount: '',
        deadline: '',
        category: '',
      });
      setShowAddGoalModal(false);
      await loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Xəta', 'Hədəf əlavə edilərkən xəta baş verdi');
    }
  };

  const handleUpdateGoal = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      const isCompleted = newCurrentAmount >= goal.targetAmount;

      await StorageService.updateGoal(goalId, {
        currentAmount: newCurrentAmount,
        isCompleted,
      });

      await loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const renderGoalItem = (goal: Goal) => {
    const progress = getProgressPercentage(goal);
    const deadline = new Date(goal.deadline);
    const isOverdue = deadline < new Date() && !goal.isCompleted;
    
    return (
      <Card key={goal.id} style={styles.goalItem}>
        <View style={goal.isCompleted ? styles.completedGoal : undefined}>
          <View style={styles.goalTitleContainer}>
            <Text style={[styles.goalTitle, goal.isCompleted && styles.completedText]}>
              {goal.title}
            </Text>
            {goal.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
                <Text style={styles.completedBadgeText}>Tamamlandı</Text>
              </View>
            )}
          </View>
          <Text style={[styles.goalCategory, goal.isCompleted && styles.completedText]}>
            {goal.category}
          </Text>
        </View>

        {goal.description && (
          <Text style={[styles.goalDescription, goal.isCompleted && styles.completedText]}>
            {goal.description}
          </Text>
        )}

        <View style={styles.goalProgress}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, goal.isCompleted && styles.completedText]}>
              {goal.currentAmount.toFixed(2)} ₼ / {goal.targetAmount.toFixed(2)} ₼
            </Text>
            <Text style={[styles.progressPercentage, goal.isCompleted && styles.completedText]}>
              {progress.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` },
                goal.isCompleted && styles.completedProgress
              ]} 
            />
          </View>
        </View>
        <View style={styles.goalFooter}>
          <Text style={[styles.goalDeadline, isOverdue && styles.overdueText]}>
            <Ionicons name="calendar" size={14} color={isOverdue ? Colors.light.error : Colors.light.textSecondary} />
            {' '}Son tarix: {deadline.toLocaleDateString('az-AZ')}
          </Text>
          
          {!goal.isCompleted && (
            <View style={styles.goalActions}>
              <TouchableOpacity
                style={styles.addAmountButton}
                onPress={() => handleUpdateGoal(goal.id, 50)}
              >
                <Text style={styles.addAmountText}>+50 ₼</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addAmountButton}
                onPress={() => handleUpdateGoal(goal.id, 100)}
              >
                <Text style={styles.addAmountText}>+100 ₼</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderAddGoalModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Yeni Hədəf</Text>
          <TouchableOpacity onPress={() => setShowAddGoalModal(false)}>
            <Ionicons name="close" size={24} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.modalBody}
          data={[1]} // Dummy data for FlatList
          renderItem={() => (
            <View>
              <Input
                placeholder="Hədəf adı"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, title: text }))}
                style={styles.modalInput}
              />
              
              <Input
                placeholder="Təsvir (istəyə bağlı)"
                value={newGoal.description}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, description: text }))}
                style={styles.modalInput}
                multiline
              />
              
              <Input
                placeholder="Hədəf məbləği (₼)"
                value={newGoal.targetAmount}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetAmount: text }))}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <Input
                placeholder="Son tarix (YYYY-MM-DD)"
                value={newGoal.deadline}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, deadline: text }))}
                style={styles.modalInput}
              />
              
              <Input
                placeholder="Kateqoriya"
                value={newGoal.category}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, category: text }))}
                style={styles.modalInput}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.modalFooter}>
          <Button
            title="Hədəf Əlavə Et"
            onPress={handleAddGoal}
            style={styles.addButton}
          />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="flag" size={64} color={Colors.light.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Hələ hədəf yoxdur</Text>
      <Text style={styles.emptySubtitle}>
        İlk hədəfinizi əlavə etmək üçün aşağıdakı düyməyə basın
      </Text>
      <Button
        title="Hədəf Əlavə Et"
        onPress={() => setShowAddGoalModal(true)}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title="Hədəflər"
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />
      
      <FlatList
        style={styles.content}
        data={goals.length > 0 ? goals : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderGoalItem(item)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {goals.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddGoalModal(true)}
          >
            <Ionicons name="add" size={24} color={Colors.light.background} />
          </TouchableOpacity>
        </View>
      )}

      {showAddGoalModal && renderAddGoalModal()}
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
  goalItem: {
    padding: DesignSystem.spacing.md,
  },
  completedGoal: {
    backgroundColor: Colors.light.success + '10',
    borderColor: Colors.light.success + '30',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.sm,
  },
  goalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    flex: 1,
  },
  completedText: {
    color: Colors.light.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.small,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.success,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  goalCategory: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: DesignSystem.spacing.md,
    lineHeight: 20,
  },
  goalProgress: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignSystem.borderRadius.small,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: DesignSystem.borderRadius.small,
  },
  completedProgress: {
    backgroundColor: Colors.light.success,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueText: {
    color: Colors.light.error,
  },
  goalActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  addAmountButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.small,
  },
  addAmountText: {
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