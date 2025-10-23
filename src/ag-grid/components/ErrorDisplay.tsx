import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  rowDataRaw: any[];
  alternativeData: any[];
  rowData: any[];
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  rowDataRaw,
  alternativeData,
  rowData,
}) => {
  if (!error) return null;

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      color: '#721c24',
      marginBottom: '12px',
    }}>
      <strong>❌ Error:</strong> {error}
      <br />
      <small>
        <strong>Debug Info:</strong>
        <br />
        • Raw data type: {typeof rowDataRaw}
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
            <br />
          </>
        )}
        • Raw data sample: {rowDataRaw ? JSON.stringify(rowDataRaw, null, 2).substring(0, 200) : 'undefined'}...
        <br />
        • Alternative data: {alternativeData ? JSON.stringify(alternativeData, null, 2).substring(0, 200) : 'undefined'}...
      </small>
    </div>
  );
};
