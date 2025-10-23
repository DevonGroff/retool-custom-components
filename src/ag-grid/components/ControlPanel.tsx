import React from 'react';
import { GridActions } from '../utils/gridActions';
import { GridStats } from '../hooks/useGridEvents';

interface ControlPanelProps {
  hasValidData: boolean;
  gridStats: GridStats;
  actions: GridActions;
  rowData: any[];
  rowDataRaw: any[];
  alternativeData: any[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  hasValidData,
  gridStats,
  actions,
  rowData,
  rowDataRaw,
  alternativeData,
}) => {
  const buttonStyle = (isEnabled: boolean, backgroundColor: string) => ({
    padding: '8px 16px',
    backgroundColor: isEnabled ? backgroundColor : '#ccc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isEnabled ? 'pointer' : 'not-allowed',
    fontWeight: '500',
  });

  return (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      flexWrap: 'wrap',
      padding: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
    }}>
      <button
        onClick={actions.exportToCSV}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#1976d2')}
      >
        📥 Export All to CSV
      </button>
      <button
        onClick={actions.exportSelectedToCSV}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#388e3c')}
      >
        📥 Export Selected to CSV
      </button>
      <button
        onClick={actions.clearFilters}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#f57c00')}
      >
        🔄 Clear Filters
      </button>
      <button
        onClick={actions.resetColumns}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#7b1fa2')}
      >
        ↩️ Reset Columns
      </button>
      <button
        onClick={actions.autoSizeColumns}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#0097a7')}
      >
        📏 Auto-size Columns
      </button>
      <button
        onClick={actions.testSelection}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#ff9800')}
      >
        🧪 Test Selection
      </button>
      <button
        onClick={actions.testClearSelection}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#f44336')}
      >
        🧹 Clear Selection
      </button>
      <button
        onClick={() => actions.testRowDataStability(rowData, rowDataRaw, alternativeData)}
        disabled={!hasValidData}
        style={buttonStyle(hasValidData, '#9c27b0')}
      >
        🔍 Test RowData
      </button>
      <div style={{
        marginLeft: 'auto',
        padding: '8px 16px',
        backgroundColor: 'white',
        borderRadius: '4px',
        fontSize: '14px',
        display: 'flex',
        gap: '16px',
      }}>
        <span><strong>Total:</strong> {gridStats.totalRows}</span>
        <span><strong>Selected:</strong> {gridStats.selectedRows}</span>
      </div>
    </div>
  );
};
