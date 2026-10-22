import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  User,
  Calendar,
  Camera,
  Plus,
  FileText,
} from 'lucide-react-native';
import { Screen } from '../../../src/components/Screen';
import { Button } from '../../../src/components/Button';
import { DatePickerModal } from '../../../src/components/DatePickerModal';
import { Colors, Radii, Spacing, Typography } from '../../../src/constants/theme';
import { createLoanSchema, CreateLoanFormData } from '../../../src/schemas';
import { useCreateLoanMutation } from '../../../src/hooks/useQueries';
import { formatDate } from '../../../src/lib/formatters';
import { ApiError } from '../../../src/api/client';
import { useTheme } from '../../../src/context/ThemeContext';

export default function NewLoanScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [receiptAdded, setReceiptAdded] = useState(false);

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLoanFormData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      friendName: '',
      amount: '',
      dueDate: defaultDueDate(),
      note: '',
    },
  });

  const selectedDueDate = watch('dueDate');
  const createLoanMutation = useCreateLoanMutation();

  const onSubmit = async (data: CreateLoanFormData) => {
    Keyboard.dismiss();
    setApiError(null);

    try {
      const response = await createLoanMutation.mutateAsync({
        friendName: data.friendName.trim(),
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
        note: data.note?.trim() || undefined,
      });

      router.replace(`/(app)/loans/${response.loan.id}`);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(err?.message || 'Failed to create loan. Please check your network.');
      }
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      {/* Top Bar matching reference Panel 6 */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Add Loan</Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>Record a new loan to a friend</Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Friend's Name <Text style={styles.asterisk}>*</Text></Text>
        <Controller
          control={control}
          name="friendName"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }, !!errors.friendName && styles.inputBoxError]}>
              <User size={16} color={colors.textMuted} style={styles.fieldIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />
        {errors.friendName && (
          <Text style={styles.errorText}>{errors.friendName.message}</Text>
        )}
      </View>

      {/* Amount Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Amount (INR) <Text style={styles.asterisk}>*</Text></Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }, !!errors.amount && styles.inputBoxError]}>
              <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>₹</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="0.00"
                placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />
        {errors.amount && (
          <Text style={styles.errorText}>{errors.amount.message}</Text>
        )}
      </View>

      {/* Due Date Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Due Date <Text style={styles.asterisk}>*</Text></Text>
        <TouchableOpacity
          style={[styles.dateSelector, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          onPress={() => setDatePickerVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.dateSelectorLeft}>
            <Calendar size={16} color={colors.textMuted} style={styles.fieldIcon} />
            <Text style={[styles.dateSelectorText, { color: colors.textPrimary }]}>
              {selectedDueDate ? formatDate(selectedDueDate) : 'Select date'}
            </Text>
          </View>
          <Calendar size={15} color={colors.primary} />
        </TouchableOpacity>
        {errors.dueDate && (
          <Text style={styles.errorText}>{errors.dueDate.message}</Text>
        )}
      </View>

      {/* Note / Memo Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          Note / Purpose <Text style={[styles.optionalText, { color: colors.textMuted }]}>(optional)</Text>
        </Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputBox, styles.inputBoxMultiline, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <FileText size={16} color={colors.textMuted} style={styles.fieldIconMultiline} />
              <TextInput
                style={[styles.textInput, styles.textInputMultiline, { color: colors.textPrimary }]}
                placeholder="e.g. Dinner, rent share, movie tickets"
                placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={2}
                maxLength={200}
              />
            </View>
          )}
        />
        {errors.note && (
          <Text style={styles.errorText}>{errors.note.message}</Text>
        )}
      </View>

      {/* Optional Receipt Attachment Box matching reference Panel 6 */}
      <View style={styles.receiptSection}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Optional: Receipt (image)</Text>
        <TouchableOpacity
          style={[
            styles.receiptDottedBox,
            {
              backgroundColor: isDark ? '#0D1620' : colors.surfaceElevated,
              borderColor: colors.border,
            },
            receiptAdded && {
              borderColor: colors.primary,
              backgroundColor: isDark ? 'rgba(52, 224, 161, 0.05)' : 'rgba(5, 150, 105, 0.08)',
            },
          ]}
          onPress={() => setReceiptAdded(!receiptAdded)}
          activeOpacity={0.75}
        >
          <Plus size={16} color={receiptAdded ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.receiptAddText,
              { color: colors.textSecondary },
              receiptAdded && { color: colors.primary },
            ]}
          >
            {receiptAdded ? 'Receipt Attached (tap to remove)' : 'Add photo'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.receiptDisclaimer, { color: colors.textMuted }]}>
          (Not stored on server - for your records)
        </Text>
      </View>

      {apiError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{apiError}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonCol}>
        <Button
          title="Create Loan"
          onPress={handleSubmit(onSubmit)}
          loading={createLoanMutation.isPending}
          variant="primary"
          size="lg"
          style={styles.createButton}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        value={selectedDueDate}
        onChange={(newDate) => {
          setValue('dueDate', newDate, { shouldValidate: true });
        }}
        onClose={() => setDatePickerVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
    paddingBottom: 32,
  },
  topBar: {
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  titleSection: {
    marginBottom: 24,
  },
  screenTitle: {
    ...Typography.h2,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  asterisk: {
    color: Colors.danger,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1822',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#19283B',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  inputBoxError: {
    borderColor: Colors.danger,
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldIconMultiline: {
    marginRight: 8,
    marginTop: 12,
  },
  inputBoxMultiline: {
    alignItems: 'flex-start',
    minHeight: 68,
    paddingTop: 4,
  },
  textInputMultiline: {
    textAlignVertical: 'top',
    paddingVertical: 10,
    minHeight: 56,
  },
  optionalText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1822',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#19283B',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 2,
  },
  receiptSection: {
    marginBottom: 24,
  },
  receiptDottedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1620',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#1E2F42',
    borderStyle: 'dashed',
    paddingVertical: 14,
    marginBottom: 6,
  },
  receiptDottedBoxActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(52, 224, 161, 0.05)',
  },
  receiptAddText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  receiptAddTextActive: {
    color: Colors.primary,
  },
  receiptDisclaimer: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 99, 112, 0.12)',
    padding: 10,
    borderRadius: Radii.sm,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
  },
  buttonCol: {
    marginTop: 8,
  },
  createButton: {
    marginBottom: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
