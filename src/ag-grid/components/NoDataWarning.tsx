import React from 'react';

interface NoDataWarningProps {
  rowDataRaw: any[];
  alternativeData: any[];
  rowData: any[];
}

export const NoDataWarning: React.FC<NoDataWarningProps> = ({
  rowDataRaw,
  alternativeData,
  rowData,
}) => {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '4px',
      color: '#856404',
    }}>
      <strong>⚠️ No Data:</strong> Connect your query data to the "Row Data" property.
      <br />
      <small>
        Expected format: Array of objects
        <br />
        Example: Set <strong>Row Data</strong> property to <code>{'{{ query1.data }}'}</code>
        <br />
        <br />
        <strong>If Row Data is empty, try:</strong>
        <br />
        • Set <strong>Alternative Data</strong> property to <code>{'{{ query1 }}'}</code>
        <br />
        • Check if query1 is running and has results
        <br />
        <br />
        <strong>Debug Info:</strong>
        <br />
        • Raw data type: {typeof rowDataRaw}
        <br />
        • Alternative data type: {typeof alternativeData}
        <br />
        • Processed data type: {typeof rowData}
        <br />
        • Is array: {Array.isArray(rowData) ? 'Yes' : 'No'}
        <br />
        • Length: {Array.isArray(rowData) ? rowData.length : 'N/A'}
        <br />
        {Array.isArray(rowData) && rowData.length > 0 && (
          <>
            • First row keys: {Object.keys(rowData[0]).join(', ')}
          </>
        )}
      </small>
    </div>
  );
};
