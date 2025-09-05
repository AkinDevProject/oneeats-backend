import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  VirtualizedList,
  Dimensions,
  ListRenderItem,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

// Types génériques pour les listes optimisées
interface BaseItem {
  id: string;
  [key: string]: any;
}

interface OptimizedFlatListProps<T extends BaseItem> {
  data: T[];
  renderItem: ListRenderItem<T>;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ItemSeparatorComponent?: React.ComponentType<any>;
  ListEmptyComponent?: React.ComponentType<any>;
  ListHeaderComponent?: React.ComponentType<any>;
  ListFooterComponent?: React.ComponentType<any>;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  // Options d'optimisation
  estimatedItemSize?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
}

// FlatList optimisée générique
function OptimizedFlatList<T extends BaseItem>({
  data,
  renderItem,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  ItemSeparatorComponent,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  estimatedItemSize = 100,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 50,
  initialNumToRender = 10,
  windowSize = 5,
  removeClippedSubviews = true,
}: OptimizedFlatListProps<T>) {
  const { currentTheme } = useAppTheme();

  // Fonction de clé optimisée
  const keyExtractor = useCallback((item: T) => item.id, []);

  // Fonction getItemLayout pour de meilleures performances (si taille fixe)
  const getItemLayout = useMemo(() => {
    if (estimatedItemSize > 0) {
      return (_: any, index: number) => ({
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      });
    }
    return undefined;
  }, [estimatedItemSize]);

  // Contrôle de refresh optimisé
  const refreshControl = useMemo(() => {
    return onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[currentTheme.colors.primary]}
        tintColor={currentTheme.colors.primary}
      />
    ) : undefined;
  }, [onRefresh, refreshing, currentTheme.colors.primary]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      // Optimisations de performance
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      initialNumToRender={initialNumToRender}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      // Optimisations mémoire
      disableVirtualization={false}
      legacyImplementation={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
}

// VirtualizedList pour de très grandes listes
interface OptimizedVirtualizedListProps<T extends BaseItem> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  itemHeight: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  style?: ViewStyle;
}

function OptimizedVirtualizedList<T extends BaseItem>({
  data,
  renderItem,
  itemHeight,
  onRefresh,
  refreshing = false,
  onEndReached,
  style,
}: OptimizedVirtualizedListProps<T>) {
  const { currentTheme } = useAppTheme();

  const getItem = useCallback((data: T[], index: number) => data[index], []);
  const getItemCount = useCallback((data: T[]) => data.length, []);
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  const refreshControl = useMemo(() => {
    return onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[currentTheme.colors.primary]}
        tintColor={currentTheme.colors.primary}
      />
    ) : undefined;
  }, [onRefresh, refreshing, currentTheme.colors.primary]);

  return (
    <VirtualizedList
      data={data}
      renderItem={renderItem}
      getItem={getItem}
      getItemCount={getItemCount}
      getItemLayout={getItemLayout}
      keyExtractor={(item: T) => item.id}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      style={style}
      // Optimisations
      removeClippedSubviews={true}
      maxToRenderPerBatch={15}
      updateCellsBatchingPeriod={100}
      initialNumToRender={Math.ceil(screenHeight / itemHeight)}
      windowSize={5}
    />
  );
}

// Composant mémoïsé pour les items de liste
export const MemoizedListItem = memo<{
  item: any;
  onPress?: (item: any) => void;
  renderContent: (item: any) => React.ReactNode;
}>(({ item, onPress, renderContent }) => {
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  return (
    <React.Fragment>
      {renderContent(item)}
    </React.Fragment>
  );
});

MemoizedListItem.displayName = 'MemoizedListItem';

// Hook pour optimiser les listes basé sur la taille des données
export const useOptimizedListStrategy = (itemCount: number, itemHeight?: number) => {
  return useMemo(() => {
    // Stratégies basées sur le nombre d'items
    if (itemCount <= 50) {
      return {
        strategy: 'simple' as const,
        component: 'ScrollView' as const,
        removeClippedSubviews: false,
        windowSize: 21,
      };
    } else if (itemCount <= 500) {
      return {
        strategy: 'flatlist' as const,
        component: 'FlatList' as const,
        removeClippedSubviews: true,
        windowSize: 10,
        maxToRenderPerBatch: 10,
        initialNumToRender: 10,
      };
    } else {
      return {
        strategy: 'virtualized' as const,
        component: 'VirtualizedList' as const,
        removeClippedSubviews: true,
        windowSize: 5,
        maxToRenderPerBatch: 5,
        initialNumToRender: itemHeight ? Math.ceil(screenHeight / itemHeight) : 5,
      };
    }
  }, [itemCount, itemHeight]);
};

// Hook pour la pagination infinie optimisée
export const useInfiniteScroll = <T extends BaseItem>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean,
  threshold = 0.1
) => {
  const [loading, setLoading] = React.useState(false);

  const handleEndReached = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      await fetchMore();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, fetchMore]);

  return {
    onEndReached: handleEndReached,
    onEndReachedThreshold: threshold,
    loading,
  };
};

// Hook pour optimiser les rendus de listes avec recherche
export const useFilteredList = <T extends BaseItem>(
  data: T[],
  searchTerm: string,
  filterFunction: (item: T, term: string) => boolean
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    return data.filter(item => filterFunction(item, searchTerm.toLowerCase()));
  }, [data, searchTerm, filterFunction]);
};

// Composants exportés
export const OptimizedFlatListMemo = memo(OptimizedFlatList) as typeof OptimizedFlatList;
export const OptimizedVirtualizedListMemo = memo(OptimizedVirtualizedList) as typeof OptimizedVirtualizedList;

export default OptimizedFlatListMemo;