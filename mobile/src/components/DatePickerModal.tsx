import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { Button } from './Button';
import { formatDate } from '../lib/formatters';
import { useTheme } from '../context/ThemeContext';

interface DatePickerModalProps {
  visible: boolean;
  value: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
  onClose: () => void;
}

export function DatePickerModal({
  visible,
  value,
  onChange,
  onClose,
}: DatePickerModalProps) {
  const { colors, isDark } = useTheme();
  // Parse current value or fallback to today
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth()); // 0-11

  const formatToISO = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSelectPreset = (daysFromNow: number) => {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() + daysFromNow);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  const handleConfirm = () => {
    onChange(formatToISO(selectedDate));
    onClose();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isCurrentSelection = (day: number) => {
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isPastDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
                },
              ]}
            >
              <View style={styles.header}>
                <View
                  style={[
                    styles.headerIcon,
                    {
                      backgroundColor: isDark ? 'rgba(52, 224, 161, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                    },
                  ]}
                >
                  <Calendar size={18} color={colors.primary} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Select Due Date</Text>
              </View>

              {/* Quick Presets */}
              <Text style={[styles.presetLabel, { color: colors.textMuted }]}>QUICK SHORTCUTS</Text>
              <View style={styles.presetRow}>
                {[
                  { days: 7, label: '+7 Days' },
                  { days: 15, label: '+15 Days' },
                  { days: 30, label: '+1 Month' },
                  { days: 60, label: '+2 Months' },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.days}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isDark ? '#111A26' : colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleSelectPreset(preset.days)}
                  >
                    <Text style={[styles.presetText, { color: colors.textSecondary }]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Month Navigator */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                  <ChevronLeft size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.monthYearText, { color: colors.textPrimary }]}>
                  {monthNames[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                  <ChevronRight size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Weekday headers */}
              <View style={styles.weekdayRow}>
                {daysOfWeek.map((day, idx) => (
                  <Text key={idx} style={[styles.weekdayText, { color: colors.textMuted }]}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = isCurrentSelection(day);
                  const isPast = isPastDay(day);

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      onPress={() => {
                        const newD = new Date(viewYear, viewMonth, day);
                        setSelectedDate(newD);
                      }}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: colors.textPrimary },
                          isSelected && { color: colors.textInverse, fontWeight: '700' },
                          isPast && !isSelected && { color: colors.textMuted, opacity: 0.5 },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Preview & Confirm */}
              <View
                style={[
                  styles.footer,
                  { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border },
                ]}
              >
                <View style={styles.selectedPreview}>
                  <Text style={[styles.selectedLabel, { color: colors.textMuted }]}>Target Date:</Text>
                  <Text style={[styles.selectedValue, { color: colors.primary }]}>
                    {formatDate(formatToISO(selectedDate))}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    title="Cancel"
                    onPress={onClose}
                    variant="ghost"
                    size="sm"
                    style={{ marginRight: Spacing.sm }}
                  />
                  <Button
                    title="Confirm Date"
                    onPress={handleConfirm}
                    variant="primary"
                    size="sm"
                    icon={<Check size={14} color={Colors.textInverse} />}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  presetChip: {
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  navButton: {
    padding: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceElevated,
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xs,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.full,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  dayTextPast: {
    color: Colors.textMuted,
    opacity: 0.5,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  selectedLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
