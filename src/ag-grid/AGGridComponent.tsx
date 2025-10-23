import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import type { ColDef, GridReadyEvent, SelectionChangedEvent, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { Retool } from '@tryretool/custom-component-support';

ModuleRegistry.registerModules([AllCommunityModule]);

// ============================================================================
// CONSTANTS
// ============================================================================
const BUTTON_STYLES = {
  base: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500' as const,
  },
};

const COLORS = {
  primary: '#1976d2',
  success: '#388e3c',
  warning: '#f57c00',
  info: '#0097a7',
  purple: '#9c27b0',
  linkBlue: '#1976d2',
};

// URL validation regex - more robust than just checking startsWith('http')
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates if a string is a valid URL
 */
const isValidUrl = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  return URL_REGEX.test(value);
};

/**
 * Deep clones data safely, handling circular references
 */
const safeDeepClone = <T,>(data: T): T => {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error('Error cloning data:', error);
    return data;
  }
};

/**
 * Extracts a stable row ID from row data
 */
const extractRowId = (data: any, node?: any): string => {
  // Try common ID fields
  if (data?.id !== undefined && data.id !== null) {
    return String(data.id);
  }
  if (data?._id !== undefined && data._id !== null) {
    return String(data._id);
  }
  
  // Use node index as fallback
  if (node?.rowIndex !== undefined && node.rowIndex !== null) {
    return `row-${node.rowIndex}`;
  }
  
  // Last resort: create hash from data
  try {
    const dataStr = JSON.stringify(data);
    return `row-hash-${dataStr.length}-${dataStr.substring(0, 20)}`;
  } catch {
    return `row-${Date.now()}-${Math.random()}`;
  }
};

// ============================================================================
// LINK CELL RENDERER COMPONENT
// ============================================================================

/**
 * Reusable link cell renderer with error handling
 */
const LinkCellRenderer: React.FC<ICellRendererParams> = ({ value }) => {
  // Validate the URL before rendering
  if (!isValidUrl(value)) {
    return <span style={{ color: '#999' }}>—</span>;
  }

  return (
    <a 
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      style={{ 
        color: COLORS.linkBlue, 
        textDecoration: 'underline', 
        cursor: 'pointer' 
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      View
    </a>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AGGridComponent: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const isInitialized = useRef(false);
  const changedRowIds = useRef<Set<string>>(new Set());

  // ============================================================================
  // RETOOL STATE - INPUT DATA
  // ============================================================================
  const [rowDataRaw] = Retool.useStateArray({
    name: 'rowData',
    label: 'Row Data',
    description: 'Connect your query data here (e.g., {{ query1.data }})',
    initialValue: [],
  });

  // ============================================================================
  // RETOOL STATE - CONFIGURATION OPTIONS
  // ============================================================================
  const [enableRowSelection] = Retool.useStateBoolean({
    name: 'enableRowSelection',
    label: 'Enable Row Selection',
    initialValue: true,
  });

  const [multiRowSelection] = Retool.useStateBoolean({
    name: 'multiRowSelection',
    label: 'Multi-Row Selection',
    initialValue: true,
  });

  const [enablePagination] = Retool.useStateBoolean({
    name: 'enablePagination',
    label: 'Enable Pagination',
    initialValue: false,
  });

  const [pageSize] = Retool.useStateNumber({
    name: 'pageSize',
    label: 'Page Size',
    initialValue: 50,
  });

  const [enableEditing] = Retool.useStateBoolean({
    name: 'enableEditing',
    label: 'Enable Cell Editing',
    initialValue: false,
  });

  const [defaultSortColumn] = Retool.useStateString({
    name: 'defaultSortColumn',
    label: 'Default Sort Column',
    description: 'Column to sort by on load (e.g., "id"). Leave empty for no default sort.',
    initialValue: '',
  });

  const [defaultSortDirection] = Retool.useStateString({
    name: 'defaultSortDirection',
    label: 'Default Sort Direction',
    description: 'Sort direction: "asc" (ascending) or "desc" (descending)',
    initialValue: 'asc',
  });

  // ============================================================================
  // RETOOL STATE - OUTPUT DATA
  // ============================================================================
  const [selectedRows, setSelectedRows] = Retool.useStateArray({
    name: 'selectedRows',
    label: 'Selected Rows',
    description: 'Currently selected rows (use as {{ customComponent1.selectedRows }})',
    initialValue: [],
    inspector: 'hidden',
  });

  const [editedData, setEditedData] = Retool.useStateArray({
    name: 'editedData',
    label: 'Edited Data (All Rows)',
    description: 'All grid data with any edits applied',
    initialValue: [],
    inspector: 'hidden',
  });

  const [changedRows, setChangedRows] = Retool.useStateArray({
    name: 'changedRows',
    label: 'Changed Rows (Only Edited)',
    description: 'Only the rows that have been edited - use this for write-back queries',
    initialValue: [],
    inspector: 'hidden',
  });

  // ============================================================================
  // LOCAL COMPONENT STATE
  // ============================================================================
  const [stats, setStats] = useState({
    totalRows: 0,
    selectedCount: 0,
    editedCount: 0,
  });

  const [localRowData, setLocalRowData] = useState<any[]>([]);

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================
  
  /**
   * Validates and processes incoming row data
   */
  const processedData = useMemo(() => {
    // Validate input
    if (!Array.isArray(rowDataRaw) || rowDataRaw.length === 0) {
      return [];
    }
    
    // Ensure first row is a valid object
    const firstRow = rowDataRaw[0];
    if (!firstRow || typeof firstRow !== 'object' || Array.isArray(firstRow)) {
      console.warn('Invalid row data format: first row must be an object');
      return [];
    }
    
    return rowDataRaw;
  }, [rowDataRaw]);

  /**
   * Initialize local data copy once when data first loads
   */
  useEffect(() => {
    if (processedData.length > 0 && !isInitialized.current) {
      const newData = safeDeepClone(processedData);
      setLocalRowData(newData);
      setStats(prev => ({ ...prev, totalRows: newData.length }));
      isInitialized.current = true;
      
      // Reset edit tracking
      changedRowIds.current.clear();
      setChangedRows([]);
    }
  }, [processedData, setChangedRows]);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================
  
  /**
   * Dynamically generates column definitions based on data structure
   */
  const columnDefs = useMemo<ColDef[]>(() => {
    if (!localRowData?.length) return [];
    
    const firstRow = localRowData[0];
    if (!firstRow || typeof firstRow !== 'object') return [];
    
    return Object.keys(firstRow).map((key): ColDef => {
      const value = firstRow[key];
      const isNumber = typeof value === 'number';
      const isUrl = isValidUrl(value);
      
      return {
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        sortable: true,
        filter: isNumber ? 'agNumberColumnFilter' : 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        editable: enableEditing && !isUrl,
        
        // Format numbers with thousands separators
        valueFormatter: isNumber ? (params) => {
          return params.value != null ? params.value.toLocaleString() : '';
        } : undefined,
        
        // Render URLs as clickable links
        cellRenderer: isUrl ? LinkCellRenderer : undefined,
      };
    });
  }, [localRowData, enableEditing]);

  /**
   * Default column configuration
   */
  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  /**
   * Row selection configuration
   */
  const rowSelection = useMemo(() => {
    if (!enableRowSelection) return undefined;
    
    return {
      mode: multiRowSelection ? ('multiRow' as const) : ('singleRow' as const),
      checkboxes: true,
      headerCheckbox: multiRowSelection,
      enableClickSelection: true,
    };
  }, [enableRowSelection, multiRowSelection]);

  // ============================================================================
  // STABLE ROW ID GETTER
  // ============================================================================
  
  /**
   * Provides stable row IDs for AG-Grid - critical for selection/editing
   */
  const getRowId = useCallback((params: any) => {
    return extractRowId(params.data, params.node);
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles grid initialization
   */
  /**
   * Handles grid initialization
   */
  const onGridReady = useCallback((event: GridReadyEvent) => {
    // Update total row count
    const totalRows = event.api.getDisplayedRowCount();
    setStats(prev => ({ ...prev, totalRows }));
    
    // Apply default sort if configured
    if (defaultSortColumn?.trim()) {
      const sortDirection = defaultSortDirection === 'desc' ? 'desc' : 'asc';
      
      // Apply sort after a short delay to ensure grid is ready
      setTimeout(() => {
        try {
          event.api.applyColumnState({
            state: [{ colId: defaultSortColumn.trim(), sort: sortDirection }],
            defaultState: { sort: null },
          });
        } catch (error) {
          console.warn('Could not apply default sort. Column may not exist:', defaultSortColumn);
        }
      }, 200);
    }
  }, [defaultSortColumn, defaultSortDirection]);

  /**
   * Handles row selection changes
   */
  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
    setStats(prev => ({ ...prev, selectedCount: selected.length }));
  }, [setSelectedRows]);

  /**
   * Handles cell value changes during editing
   */
  const onCellValueChanged = useCallback((event: any) => {
    try {
      const rowId = extractRowId(event.data, event.node);
      changedRowIds.current.add(rowId);
      
      // Collect all data and changed data
      const allData: any[] = [];
      const changedData: any[] = [];
      
      event.api.forEachNode((node: any) => {
        if (node.data) {
          allData.push(node.data);
          
          const nodeRowId = extractRowId(node.data, node);
          if (changedRowIds.current.has(nodeRowId)) {
            changedData.push(node.data);
          }
        }
      });
      
      // Update output states
      setEditedData(allData);
      setChangedRows(changedData);
      setStats(prev => ({ ...prev, editedCount: changedData.length }));
    } catch (error) {
      console.error('Error handling cell value change:', error);
    }
  }, [setEditedData, setChangedRows]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================
  
  /**
   * Exports all grid data to CSV
   */
  const exportToCSV = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    try {
      gridRef.current.api.exportDataAsCsv({
        fileName: `export_${new Date().toISOString().split('T')[0]}.csv`,
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export data. Please try again.');
    }
  }, []);

  /**
   * Exports selected rows to CSV
   */
  const exportSelectedToCSV = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    try {
      const selectedCount = gridRef.current.api.getSelectedRows().length;
      if (selectedCount === 0) {
        alert('No rows selected. Please select rows to export.');
        return;
      }
      
      gridRef.current.api.exportDataAsCsv({
        fileName: `export_selected_${new Date().toISOString().split('T')[0]}.csv`,
        onlySelected: true,
      });
    } catch (error) {
      console.error('Error exporting selected rows:', error);
      alert('Failed to export selected rows. Please try again.');
    }
  }, []);

  /**
   * Clears all active filters
   */
  const clearFilters = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    try {
      gridRef.current.api.setFilterModel(null);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }, []);

  /**
   * Auto-sizes all columns to fit content
   */
  const autoSizeColumns = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    try {
      gridRef.current.api.autoSizeAllColumns();
    } catch (error) {
      console.error('Error auto-sizing columns:', error);
    }
  }, []);

  /**
   * Reloads data from source and resets all edits
   */
  const reloadData = useCallback(() => {
    if (processedData.length === 0) return;
    
    try {
      const newData = safeDeepClone(processedData);
      setLocalRowData(newData);
      setEditedData(newData);
      setStats(prev => ({ ...prev, editedCount: 0 }));
      
      // Reset edit tracking
      changedRowIds.current.clear();
      setChangedRows([]);
      
      // Reapply default sort after grid updates
      if (defaultSortColumn?.trim() && gridRef.current?.api) {
        const sortDirection = defaultSortDirection === 'desc' ? 'desc' : 'asc';
        
        setTimeout(() => {
          if (!gridRef.current?.api) return;
          
          try {
            gridRef.current.api.applyColumnState({
              state: [{ colId: defaultSortColumn.trim(), sort: sortDirection }],
              defaultState: { sort: null },
            });
          } catch (error) {
            console.warn('Could not apply default sort:', error);
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error reloading data:', error);
      alert('Failed to reload data. Please try again.');
    }
  }, [processedData, setEditedData, setChangedRows, defaultSortColumn, defaultSortDirection]);

  // ============================================================================
  // COMPONENT SETTINGS
  // ============================================================================
  Retool.useComponentSettings({
    defaultHeight: 40,
    defaultWidth: 12,
  });

  // ============================================================================
  // RENDER
  // ============================================================================
  const hasData = localRowData?.length > 0;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      boxSizing: 'border-box',
    }}>
      {/* Control Panel */}
      {hasData && (
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          alignItems: 'center',
        }}>
          <button
            onClick={exportToCSV}
            style={{ ...BUTTON_STYLES.base, backgroundColor: COLORS.primary }}
            title="Export all data to CSV"
          >
            📥 Export All
          </button>
          <button
            onClick={exportSelectedToCSV}
            style={{ ...BUTTON_STYLES.base, backgroundColor: COLORS.success }}
            title="Export selected rows to CSV"
          >
            📥 Export Selected
          </button>
          <button
            onClick={clearFilters}
            style={{ ...BUTTON_STYLES.base, backgroundColor: COLORS.warning }}
            title="Clear all active filters"
          >
            🔄 Clear Filters
          </button>
          <button
            onClick={autoSizeColumns}
            style={{ ...BUTTON_STYLES.base, backgroundColor: COLORS.info }}
            title="Auto-size columns to fit content"
          >
            📏 Auto-size
          </button>
          <button
            onClick={reloadData}
            style={{ ...BUTTON_STYLES.base, backgroundColor: COLORS.purple }}
            title="Reload data from source and discard edits"
          >
            🔄 Reload Data
          </button>
          <div style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            borderRadius: '4px',
            fontSize: '13px',
            display: 'flex',
            gap: '16px',
            color: '#424242',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
          }}>
            <span style={{ fontWeight: 400 }}>
              <strong style={{ fontWeight: 600 }}>Total:</strong> {stats.totalRows}
            </span>
            <span style={{ fontWeight: 400 }}>
              <strong style={{ fontWeight: 600 }}>Selected:</strong> {stats.selectedCount}
            </span>
            {enableEditing && (
              <span style={{ fontWeight: 400 }}>
                <strong style={{ fontWeight: 600 }}>Edited:</strong> {stats.editedCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* No Data Warning */}
      {!hasData && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
        }}>
          <strong>⚠️ No Data:</strong> Connect your query to the "Row Data" property
          <br />
          <small>Example: Set <code>rowData</code> to <code>{'{{ query1.data }}'}</code></small>
        </div>
      )}

      {/* AG Grid */}
      {hasData && (
        <div className="ag-theme-quartz" style={{ flex: 1, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            theme="legacy"
            rowData={localRowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={enablePagination}
            paginationPageSize={pageSize}
            animateRows={false}
            enableCellTextSelection={true}
            rowSelection={rowSelection}
            getRowId={getRowId}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            onCellValueChanged={onCellValueChanged}
            suppressRowClickSelection={false}
          />
        </div>
      )}
    </div>
  );
};