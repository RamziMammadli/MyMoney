import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, DesignSystem } from '@/constants/theme';
import { StorageService } from '@/services/storage';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: TransactionData) => void;
  type: 'income' | 'expense';
}

interface TransactionData {
  amount: number;
  description: string;
  category: string;
  date: string;
}

const expenseCategories = StorageService.getExpenseCategories();
const incomeCategories = StorageService.getIncomeCategories();

export function AddTransactionModal({ visible, onClose, onSave, type }: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSave = () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert('Xəta', 'Bütün sahələri doldurun');
      return;
    }

    const transactionData: TransactionData = {
      amount: parseFloat(amount),
      description,
      category: selectedCategory,
      date,
    };

    onSave(transactionData);
    
    // Reset form
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    
    onClose();
  };

  const renderCategoryItem = (category: typeof categories[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        selectedCategory === category.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <View style={[
        styles.categoryIcon,
        { backgroundColor: selectedCategory === category.id ? Colors.light.primary + '20' : Colors.light.surface }
      ]}>
        <Ionicons 
          name={category.icon} 
          size={20} 
          color={selectedCategory === category.id ? Colors.light.primary : Colors.light.icon} 
        />
      </View>
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.categoryTextSelected
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {type === 'expense' ? 'Xərc Əlavə Et' : 'Gəlir Əlavə Et'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Məbləğ</Text>
            <Input
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              leftIcon="cash"
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Təsvir</Text>
            <Input
              placeholder="Əməliyyatın təsviri"
              value={description}
              onChangeText={setDescription}
              leftIcon="document-text"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kateqoriya</Text>
            <View style={styles.categoriesGrid}>
              {categories.map(renderCategoryItem)}
            </View>
          </View>

          {/* Date Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarix</Text>
            <Input
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              leftIcon="calendar"
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title={type === 'expense' ? 'Xərc Əlavə Et' : 'Gəlir Əlavə Et'}
            variant="primary"
            size="large"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  section: {
    marginTop: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  categoryItem: {
    width: '48%',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignSystem.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryItemSelected: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  categoryTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  saveButton: {
    marginTop: DesignSystem.spacing.sm,
  },
});
