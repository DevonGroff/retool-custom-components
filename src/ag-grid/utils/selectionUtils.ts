import { GridApi } from 'ag-grid-community';
import { debugLogger } from './debugLogger';
import { errorHandler } from './errorHandler';

export interface SelectionConfig {
  mode: 'singleRow' | 'multiRow';
  enableClickSelection: boolean;
  enableSelectionWithoutKeys: boolean;
}

export const createSelectionConfig = (
  enableRowSelection: boolean,
  multiRowSelection: boolean
): SelectionConfig | undefined => {
  if (!enableRowSelection) {
    return undefined;
  }

  return {
    mode: multiRowSelection ? 'multiRow' : 'singleRow',
    enableClickSelection: true,
    enableSelectionWithoutKeys: multiRowSelection,
  };
};

export const testSelection = (api: GridApi): void => {
  try {
    debugLogger.log('SelectionUtils', 'Testing selection', {
      currentSelected: api.getSelectedRows().length,
      gridOption: api.getGridOption('rowSelection'),
    });
    
    // Select the first row
    const firstRow = api.getDisplayedRowAtIndex(0);
    if (firstRow) {
      debugLogger.log('SelectionUtils', 'Selecting first row', { firstRowData: firstRow.data });
      firstRow.setSelected(true);
      
      // Wait a bit and check again
      setTimeout(() => {
        const selectedRows = api.getSelectedRows();
        debugLogger.log('SelectionUtils', 'Selection test result', {
          selectedCount: selectedRows.length,
          selectedData: selectedRows,
        });
      }, 100);
    } else {
      debugLogger.log('SelectionUtils', 'No first row found for selection test', {}, 'warn');
    }
  } catch (error) {
    errorHandler.logError('Error testing selection', 'selection', { error, api });
  }
};

export const clearSelection = (api: GridApi): void => {
  try {
    debugLogger.log('SelectionUtils', 'Clearing selection', {
      beforeClear: api.getSelectedRows().length,
    });
    
    api.deselectAll();
    
    debugLogger.log('SelectionUtils', 'Selection cleared', {
      afterClear: api.getSelectedRows().length,
    });
  } catch (error) {
    errorHandler.logError('Error clearing selection', 'selection', { error, api });
  }
};

export const getSelectionInfo = (api: GridApi) => {
  try {
    const selectedRows = api.getSelectedRows();
    const totalRows = api.getDisplayedRowCount();
    
    return {
      selectedCount: selectedRows.length,
      totalRows,
      selectedRows,
      selectionConfig: api.getGridOption('rowSelection'),
    };
  } catch (error) {
    errorHandler.logError('Error getting selection info', 'selection', { error, api });
    return {
      selectedCount: 0,
      totalRows: 0,
      selectedRows: [],
      selectionConfig: null,
    };
  }
};
