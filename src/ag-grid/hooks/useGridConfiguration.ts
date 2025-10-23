import { useMemo } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import { ColDef } from 'ag-grid-community';

export interface GridConfiguration {
  enableRowSelection: boolean;
  multiRowSelection: boolean;
  enablePagination: boolean;
  pageSize: number;
  enableEditing: boolean;
  columnDefs: ColDef[];
  defaultColDef: ColDef;
}

export const useGridConfiguration = (rowData: any[], hasValidData: boolean) => {
  // Retool State: Column definitions (optional - will auto-generate if empty)
  const [columnDefsInput] = Retool.useStateArray({
    name: 'columnDefs',
    label: 'Column Definitions',
    description: 'Optional: Array of column definition objects. Leave empty for auto-generation from data.',
    initialValue: [],
  });

  // Retool State: Configuration options
  const [enableRowSelection] = Retool.useStateBoolean({
    name: 'enableRowSelection',
    label: 'Enable Row Selection',
    description: 'Allow users to select rows',
    initialValue: true,
  });

  const [multiRowSelection] = Retool.useStateBoolean({
    name: 'multiRowSelection',
    label: 'Multi-Row Selection',
    description: 'Enable selection of multiple rows',
    initialValue: true,
  });

  const [enablePagination] = Retool.useStateBoolean({
    name: 'enablePagination',
    label: 'Enable Pagination',
    description: 'Enable pagination for large datasets',
    initialValue: true,
  });

  const [pageSize] = Retool.useStateNumber({
    name: 'pageSize',
    label: 'Page Size',
    description: 'Number of rows per page',
    initialValue: 50,
  });

  const [enableEditing] = Retool.useStateBoolean({
    name: 'enableEditing',
    label: 'Enable Cell Editing',
    description: 'Allow users to edit cell values',
    initialValue: true,
  });

  // Auto-generate column definitions if not provided
  const columnDefs: ColDef[] = useMemo(() => {
    try {
      // If custom column definitions provided, use them
      if (columnDefsInput && Array.isArray(columnDefsInput) && columnDefsInput.length > 0) {
        return columnDefsInput as ColDef[];
      }

      // Auto-generate from data
      if (rowData && Array.isArray(rowData) && rowData.length > 0) {
        const firstRow = rowData[0];
        
        if (!firstRow || typeof firstRow !== 'object') {
          console.error(`First row is not a valid object: ${JSON.stringify(firstRow)}`);
          return [];
        }
        
        // Helper function to check if a column contains date values
        const isDateColumn = (key: string) => {
          // Check first few rows to determine if this is a date column
          const sampleSize = Math.min(3, rowData.length);
          let dateCount = 0;
          
          for (let i = 0; i < sampleSize; i++) {
            const value = rowData[i][key];
            if (value == null) continue;
            
            if (value instanceof Date) {
              dateCount++;
            } else if (typeof value === 'string') {
              // Check various date patterns
              const datePatterns = [
                /^\d{4}-\d{2}-\d{2}/, // ISO date
                /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
                /^\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY
                /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
              ];
              
              const isDateString = datePatterns.some(pattern => pattern.test(value)) ||
                                 (!isNaN(Date.parse(value)) && value.length > 5);
              
              if (isDateString) {
                dateCount++;
              }
            }
          }
          
          // If more than half of the sample values look like dates, treat as date column
          return dateCount > sampleSize / 2;
        };
        
        const columns = Object.keys(firstRow).map((key) => {
          try {
            const value = firstRow[key];
            const isNumber = typeof value === 'number';
            const isBoolean = typeof value === 'boolean';
            const isDate = isDateColumn(key);

            const columnDef: ColDef = {
              field: key,
              headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replace(/_/g, ' '),
              sortable: true,
              filter: isNumber ? 'agNumberColumnFilter' : isDate ? 'agDateColumnFilter' : 'agTextColumnFilter',
              floatingFilter: true,
              floatingFilterComponent: undefined, // Use default floating filter
              floatingFilterComponentParams: {
                suppressFilterButton: false,
              },
              editable: enableEditing,
              resizable: true,
              cellDataType: isNumber ? 'number' : isBoolean ? 'boolean' : isDate ? 'date' : 'text',
            };

            // Add value formatting for numeric columns
            if (isNumber) {
              columnDef.valueFormatter = (params: any) => {
                if (params.value == null) return '';
                return params.value.toLocaleString();
              };
            }

            // Add date formatting for date columns
            if (isDate) {
              columnDef.valueFormatter = (params: any) => {
                if (params.value == null) return '';
                try {
                  const date = new Date(params.value);
                  if (isNaN(date.getTime())) return params.value; // Return original if invalid
                  return date.toLocaleDateString();
                } catch (e) {
                  return params.value;
                }
              };
              columnDef.valueParser = (params: any) => {
                if (params.newValue == null) return null;
                try {
                  const date = new Date(params.newValue);
                  return isNaN(date.getTime()) ? params.newValue : date;
                } catch (e) {
                  return params.newValue;
                }
              };
            }

            // Custom cell renderer for boolean values
            if (isBoolean) {
              columnDef.cellRenderer = (params: any) => {
                return params.value ? '✓' : '✗';
              };
            }

            return columnDef;
          } catch (err) {
            console.error(`Error creating column for ${key}:`, err);
            return {
              field: key,
              headerName: key,
              sortable: true,
              filter: 'agTextColumnFilter',
              floatingFilter: true,
              floatingFilterComponent: undefined,
              floatingFilterComponentParams: {
                suppressFilterButton: false,
              },
              editable: enableEditing,
              resizable: true,
              cellDataType: 'text',
            } as ColDef;
          }
        });
        
        return columns;
      }

      return [];
    } catch (err) {
      console.error('Error generating columns:', err);
      return [];
    }
  }, [rowData, columnDefsInput, enableEditing]);

  // Default column definition
  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true,
    editable: enableEditing,
    floatingFilter: true,
  }), [enableEditing]);

  return {
    enableRowSelection,
    multiRowSelection,
    enablePagination,
    pageSize,
    enableEditing,
    columnDefs,
    defaultColDef,
  };
};
