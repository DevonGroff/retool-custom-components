import { AgGridReact } from 'ag-grid-react';
import { debugLogger } from './debugLogger';
import { errorHandler } from './errorHandler';
import { testSelection, clearSelection, getSelectionInfo } from './selectionUtils';

export interface GridActions {
  exportToCSV: () => void;
  exportSelectedToCSV: () => void;
  clearFilters: () => void;
  resetColumns: () => void;
  autoSizeColumns: () => void;
  testSelection: () => void;
  testClearSelection: () => void;
  testRowDataStability: (rowData: any[], rowDataRaw: any[], alternativeData: any[]) => void;
}

export const createGridActions = (gridRef: React.RefObject<AgGridReact>): GridActions => {
  const exportToCSV = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `export_${new Date().toISOString().split('T')[0]}.csv`,
        skipPinnedTop: false,
        skipPinnedBottom: false,
        allColumns: false,
        onlySelected: false,
      });
      
      console.log('CSV exported:', {
        timestamp: new Date().toISOString(),
        rowCount: gridRef.current.api.getDisplayedRowCount(),
      });
    }
  };

  const exportSelectedToCSV = () => {
    if (gridRef.current?.api) {
      const selectedCount = gridRef.current.api.getSelectedRows().length;
      if (selectedCount === 0) {
        alert('No rows selected. Please select rows to export.');
        return;
      }
      
      gridRef.current.api.exportDataAsCsv({
        fileName: `export_selected_${new Date().toISOString().split('T')[0]}.csv`,
        onlySelected: true,
      });
      
      console.log('CSV exported (selected only):', {
        timestamp: new Date().toISOString(),
        rowCount: selectedCount,
        selectedOnly: true,
      });
    }
  };

  const clearFilters = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.setFilterModel(null);
    }
  };

  const resetColumns = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.resetColumnState();
    }
  };

  const autoSizeColumns = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.autoSizeAllColumns();
    }
  };

  const testSelectionAction = () => {
    if (gridRef.current?.api) {
      debugLogger.log('GridActions', 'Testing selection');
      testSelection(gridRef.current.api);
    } else {
      errorHandler.logError('Grid API not available for selection test', 'selection', { gridRef });
    }
  };

  const testClearSelectionAction = () => {
    if (gridRef.current?.api) {
      debugLogger.log('GridActions', 'Testing clear selection');
      clearSelection(gridRef.current.api);
    } else {
      errorHandler.logError('Grid API not available for clear selection', 'selection', { gridRef });
    }
  };

  const testRowDataStability = (rowData: any[], rowDataRaw: any[], alternativeData: any[]) => {
    debugLogger.log('GridActions', 'Testing row data stability', {
      rowData: {
        length: rowData?.length,
        type: typeof rowData,
        isArray: Array.isArray(rowData),
        firstItem: rowData?.[0],
        firstItemKeys: rowData?.[0] ? Object.keys(rowData[0]) : [],
      },
      rowDataRaw: {
        length: rowDataRaw?.length,
        type: typeof rowDataRaw,
        isArray: Array.isArray(rowDataRaw),
      },
      alternativeData: {
        length: alternativeData?.length,
        type: typeof alternativeData,
        isArray: Array.isArray(alternativeData),
      },
    });
    
    // Check if rowData has actual data or empty objects
    if (rowData && rowData.length > 0) {
      const hasValidData = rowData.every((item: any) => item && Object.keys(item).length > 0);
      debugLogger.log('GridActions', 'Row data validation', {
        hasValidData,
        totalRows: rowData.length,
        validRows: rowData.filter((item: any) => item && Object.keys(item).length > 0).length,
      });
    }
  };

  return {
    exportToCSV,
    exportSelectedToCSV,
    clearFilters,
    resetColumns,
    autoSizeColumns,
    testSelection: testSelectionAction,
    testClearSelection: testClearSelectionAction,
    testRowDataStability,
  };
};
