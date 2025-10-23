import { useCallback, useRef, useMemo } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import { 
  GridApi, 
  GridReadyEvent,
  CellValueChangedEvent,
  SelectionChangedEvent,
  FilterChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { errorHandler } from '../utils/errorHandler';
import { debugLogger } from '../utils/debugLogger';
import { loopDetector } from '../utils/loopDetector';

export interface GridStats {
  totalRows: number;
  filteredRows: number;
  selectedRows: number;
}

export const useGridEvents = () => {
  // INFINITE LOOP TESTING: Track hook calls
  const hookCallCount = useRef(0);
  hookCallCount.current += 1;
  console.log(`🔄 useGridEvents CALL #${hookCallCount.current}`);
  
  // Store selected rows in a ref to avoid re-render issues
  const selectedRowsRef = useRef<any[]>([]);
  
  // Retool State: Output data
  const [selectedRows, setSelectedRows] = Retool.useStateArray({
    name: 'selectedRows',
    label: 'Selected Rows',
    description: 'Array of currently selected row data',
    initialValue: [],
    inspector: 'hidden',
  });

  const [editedData, setEditedData] = Retool.useStateArray({
    name: 'editedData',
    label: 'Edited Data',
    description: 'Array of all current grid data including edits',
    initialValue: [],
    inspector: 'hidden',
  });

  console.log('🔍 useGridEvents: Retool state values:', {
    selectedRowsLength: selectedRows?.length,
    editedDataLength: editedData?.length,
    selectedRowsType: typeof selectedRows,
    editedDataType: typeof editedData,
    setSelectedRowsType: typeof setSelectedRows,
    setEditedDataType: typeof setEditedData
  });

  // Simple state setters without complex throttling
  const stableSetSelectedRows = useCallback((data: any[]) => {
    setSelectedRows(data);
  }, [setSelectedRows]);

  const stableSetEditedData = useCallback((data: any[]) => {
    setEditedData(data);
  }, [setEditedData]);

  // Update grid statistics
  const updateGridStats = useCallback((api: GridApi, setGridStats: (stats: GridStats) => void) => {
    try {
      const stats = {
        totalRows: api.getDisplayedRowCount(),
        filteredRows: api.getDisplayedRowCount(),
        selectedRows: api.getSelectedRows().length,
      };
      
      setGridStats(stats);
      debugLogger.log('GridEvents', 'Grid stats updated', stats);
    } catch (error) {
      errorHandler.logError('Error updating grid stats', 'grid', { error, api });
    }
  }, []);

  // Event handlers
  const onGridReady = useCallback((event: GridReadyEvent, enableRowSelection: boolean, multiRowSelection: boolean, setGridStats: (stats: GridStats) => void) => {
    debugLogger.log('GridEvents', 'Grid ready', {
      rowCount: event.api.getDisplayedRowCount(),
      enableRowSelection,
      multiRowSelection,
    });
    
    try {
      // Check if row selection is properly configured
      const gridApi = event.api;
      const selectionMethods = Object.getOwnPropertyNames(gridApi).filter(name => name.includes('selection'));
      debugLogger.log('GridEvents', 'Grid API selection methods', { selectionMethods });
      
      updateGridStats(event.api, setGridStats);
      
      // Test selection programmatically
      setTimeout(() => {
        const selectedRows = event.api.getSelectedRows();
        debugLogger.log('GridEvents', 'Initial selection test', {
          selectedRows: selectedRows.length,
          selectedData: selectedRows,
        });
      }, 1000);
    } catch (error) {
      errorHandler.logError('Error in grid ready event', 'grid', { error, event });
    }
  }, [updateGridStats]);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent, rowData: any[]) => {
    debugLogger.log('GridEvents', 'Cell value changed', {
      field: event.colDef.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
    });
    
    try {
      // Get all current data from the grid
      const allData: any[] = [];
      if (event.api && typeof event.api.forEachNode === 'function') {
        event.api.forEachNode((node) => {
          if (node && node.data) {
            allData.push(node.data);
          }
        });
      }
      
      stableSetEditedData(allData);
      debugLogger.log('GridEvents', 'Edited data updated', { rowCount: allData.length });
    } catch (error) {
      errorHandler.logError('Error in cell value changed event', 'grid', { error, event });
      // Fallback: just update with the current row data
      if (Array.isArray(rowData)) {
        stableSetEditedData([...rowData]);
      }
    }
  }, [stableSetEditedData]);

  // Handle selection changes - modern AG-Grid v34 API
  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    
    debugLogger.log('GridEvents', 'Selection changed', {
      source: event.source,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const selected = event.api.getSelectedRows();
      debugLogger.log('GridEvents', 'Selected rows', {
        count: selected.length,
        selectedData: selected,
      });
      
      // Debug: Check if this is a rowDataChanged event that's clearing selection
      if (event.source === 'rowDataChanged') {
        debugLogger.log('GridEvents', 'Row data changed event detected', { selectedCount: selected.length }, 'warn');
        
        // Don't update state if this is a rowDataChanged event with empty selection
        if (selected.length === 0) {
          debugLogger.log('GridEvents', 'Skipping state update for rowDataChanged with empty selection');
          return;
        }
      }
      
      // Update selected rows state
      stableSetSelectedRows(selected);
      selectedRowsRef.current = selected;
      
      debugLogger.log('GridEvents', 'Selection state updated', { selectedCount: selected.length });
    } catch (error) {
      errorHandler.logError('Error in selection changed event', 'selection', { error, event });
    }
  }, [stableSetSelectedRows]);

  // Handle filter changes
  const onFilterChanged = useCallback((event: FilterChangedEvent, setGridStats: (stats: GridStats) => void) => {
    try {
      debugLogger.log('GridEvents', 'Filter changed');
      updateGridStats(event.api, setGridStats);
    } catch (error) {
      errorHandler.logError('Error in filter changed event', 'grid', { error, event });
    }
  }, [updateGridStats]);

  // Handle sort changes
  const onSortChanged = useCallback((event: SortChangedEvent) => {
    try {
      const sortModel = event.api.getColumnState()
        .filter(col => col.sort != null)
        .map(col => ({
          colId: col.colId,
          sort: col.sort,
          sortIndex: col.sortIndex,
        }));
      
      debugLogger.log('GridEvents', 'Sort changed', { sortModel });
    } catch (error) {
      errorHandler.logError('Error in sort changed event', 'grid', { error, event });
    }
  }, []);

  // Handle row clicks for debugging
  const onRowClicked = useCallback((event: any) => {
    debugLogger.log('GridEvents', 'Row clicked', {
      data: event.data,
      rowIndex: event.rowIndex,
    });
  }, []);

  return {
    selectedRowsRef,
    selectedRows,
    setSelectedRows,
    editedData,
    setEditedData,
    updateGridStats,
    onGridReady,
    onCellValueChanged,
    onSelectionChanged,
    onFilterChanged,
    onSortChanged,
    onRowClicked,
  };
};
