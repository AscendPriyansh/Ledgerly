import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, ArrowUpDown, X, ScrollText, Download } from 'lucide-react-native';
import { Screen } from '../../../src/components/Screen';
import { LoanCard } from '../../../src/components/LoanCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { LoanCardSkeleton } from '../../../src/components/LoadingSkeleton';
import { Colors, Radii, Spacing, Typography } from '../../../src/constants/theme';
import { useLoansQuery } from '../../../src/hooks/useQueries';
import { Loan } from '../../../src/types/api';
import { getDueStatus } from '../../../src/lib/formatters';
import { useTheme } from '../../../src/context/ThemeContext';

type FilterType = 'ALL' | 'OUTSTANDING' | 'OVERDUE' | 'REPAID';
type SortType = 'NEWEST' | 'DUE_DATE' | 'AMOUNT_DESC' | 'OUTSTANDING_DESC';

export default function LoansListScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [activeSort, setActiveSort] = useState<SortType>('NEWEST');

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useLoansQuery();

  const loans = data?.loans || [];

  const loansWithStatus = useMemo(() => {
    return loans.map((loan) => {
      const isRepaid = loan.status === 'REPAID';
      const dueInfo = getDueStatus(loan.dueDate, isRepaid);
      const isOverdue = loan.isOverdue || (!isRepaid && dueInfo.isOverdue);
      return {
        ...loan,
        computedIsOverdue: isOverdue,
      };
    });
  }, [loans]);

  const filteredLoans = useMemo(() => {
    let result = loansWithStatus.filter((loan) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = loan.friendName.toLowerCase().includes(query);
        const matchesAmount = loan.amount.includes(query);
        if (!matchesName && !matchesAmount) return false;
      }

      if (activeFilter === 'OUTSTANDING') {
        return loan.status === 'OUTSTANDING' && !loan.computedIsOverdue;
      }
      if (activeFilter === 'OVERDUE') {
        return loan.computedIsOverdue && loan.status !== 'REPAID';
      }
      if (activeFilter === 'REPAID') {
        return loan.status === 'REPAID';
      }

      return true;
    });

    result.sort((a, b) => {
      if (activeSort === 'DUE_DATE') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (activeSort === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (activeSort === 'AMOUNT_DESC') {
        return parseFloat(b.amount) - parseFloat(a.amount);
      }
      if (activeSort === 'OUTSTANDING_DESC') {
        const outA = parseFloat(a.outstandingAmount || a.amount);
        const outB = parseFloat(b.outstandingAmount || b.amount);
        return outB - outA;
      }
      return 0;
    });

    return result;
  }, [loansWithStatus, searchQuery, activeFilter, activeSort]);

  const toggleSort = () => {
    if (activeSort === 'NEWEST') setActiveSort('DUE_DATE');
    else if (activeSort === 'DUE_DATE') setActiveSort('AMOUNT_DESC');
    else if (activeSort === 'AMOUNT_DESC') setActiveSort('OUTSTANDING_DESC');
    else setActiveSort('NEWEST');
  };

  const sortLabel =
    activeSort === 'NEWEST'
      ? 'Newest'
      : activeSort === 'DUE_DATE'
      ? 'Due Date'
      : activeSort === 'AMOUNT_DESC'
      ? 'Total Amount'
      : 'Largest Outstanding';

  const handleExportCsv = async () => {
    if (loans.length === 0) return;
    const headers = [
      'Friend Name',
      'Principal Amount (INR)',
      'Repaid Amount (INR)',
      'Outstanding Balance (INR)',
      'Due Date',
      'Status',
      'Created Date',
      'Note',
    ];
    const rows = loans.map((l) => [
      `"${l.friendName.replace(/"/g, '""')}"`,
      l.amount,
      l.repaidAmount || '0.00',
      l.outstandingAmount || l.amount,
      l.dueDate,
      l.status,
      l.createdAt,
      `"${(l.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    try {
      await Share.share({
        message: csvContent,
        title: 'MiniLedger_Ledger_Export.csv',
      });
    } catch {}
  };

  return (
    <Screen
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      {/* Header matching reference Panel 5 */}
      <View style={styles.topHeader}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Loans</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={handleExportCsv}
            disabled={loans.length === 0}
          >
            <Download size={17} color={loans.length === 0 ? colors.textMuted : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={toggleSort}
          >
            <SlidersHorizontal size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search friends..."
          placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#111A26' : colors.surfaceElevated,
              borderColor: colors.border,
            },
            activeFilter === 'ALL' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              activeFilter === 'ALL' && { color: colors.textInverse, fontWeight: '700' },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#111A26' : colors.surfaceElevated,
              borderColor: colors.border,
            },
            activeFilter === 'OUTSTANDING' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setActiveFilter('OUTSTANDING')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              activeFilter === 'OUTSTANDING' && { color: colors.textInverse, fontWeight: '700' },
            ]}
          >
            Outstanding
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#111A26' : colors.surfaceElevated,
              borderColor: colors.border,
            },
            activeFilter === 'OVERDUE' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setActiveFilter('OVERDUE')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              activeFilter === 'OVERDUE' && { color: colors.textInverse, fontWeight: '700' },
            ]}
          >
            Overdue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#111A26' : colors.surfaceElevated,
              borderColor: colors.border,
            },
            activeFilter === 'REPAID' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setActiveFilter('REPAID')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              activeFilter === 'REPAID' && { color: colors.textInverse, fontWeight: '700' },
            ]}
          >
            Repaid
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort indicator row */}
      <View style={styles.sortIndicatorRow}>
        <TouchableOpacity style={styles.sortTrigger} onPress={toggleSort}>
          <Text style={[styles.sortText, { color: colors.textSecondary }]}>
            (Sort by: <Text style={[styles.sortTextBold, { color: colors.textPrimary }]}>{sortLabel}</Text> ▾)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleSort}>
          <ArrowUpDown size={15} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* List Content */}
      {error ? (
        <ErrorState
          message="Failed to load loan records. Please check the backend connection."
          onRetry={refetch}
        />
      ) : isLoading ? (
        <View>
          <LoanCardSkeleton />
          <LoanCardSkeleton />
          <LoanCardSkeleton />
        </View>
      ) : filteredLoans.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={30} color={Colors.primary} />}
          title={searchQuery || activeFilter !== 'ALL' ? 'No matching loans' : 'No loans yet'}
          description={
            searchQuery || activeFilter !== 'ALL'
              ? 'Try adjusting your search query or clear filters to see more loans.'
              : 'Start by adding your first loan to keep track of your friends.'
          }
          actionTitle={searchQuery || activeFilter !== 'ALL' ? 'Clear Filters' : 'Add Your First Loan'}
          onAction={() => {
            if (searchQuery || activeFilter !== 'ALL') {
              setSearchQuery('');
              setActiveFilter('ALL');
            } else {
              router.push('/(app)/loans/new');
            }
          }}
        />
      ) : (
        <View style={styles.listContainer}>
          {filteredLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => router.push(`/(app)/loans/${loan.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  title: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1722',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#182738',
    paddingHorizontal: 12,
    minHeight: 44,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    backgroundColor: '#111A26',
    borderWidth: 1,
    borderColor: '#19283B',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  sortIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sortTrigger: {
    paddingVertical: 2,
  },
  sortText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sortTextBold: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  listContainer: {
    marginBottom: 24,
  },
});
