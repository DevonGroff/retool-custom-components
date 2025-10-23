import { useMemo, useRef } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import { errorHandler } from '../utils/errorHandler';
import { debugLogger } from '../utils/debugLogger';
import { loopDetector } from '../utils/loopDetector';

export interface DataProcessingResult {
  rowData: any[];
  hasValidData: boolean;
  error: string | null;
}

export const useDataProcessing = (): DataProcessingResult => {
  // INFINITE LOOP TESTING: Track hook calls
  const hookCallCount = useRef(0);
  hookCallCount.current += 1;
  console.log(`🔄 useDataProcessing CALL #${hookCallCount.current}`);
  
  // Retool State: Input data from Retool query
  const [rowDataRaw] = Retool.useStateArray({
    name: 'rowData',
    label: 'Row Data',
    description: 'Data to display. Connect query data here. Example: {{ query1.data }}',
    initialValue: [],
  });

  // Alternative data access - sometimes Retool passes data differently
  const [alternativeData] = Retool.useStateArray({
    name: 'alternativeData',
    label: 'Alternative Data (if Row Data is empty)',
    description: 'Try connecting {{ query1 }} here if Row Data is empty',
    initialValue: [],
    inspector: 'hidden',
  });

  console.log('🔍 useDataProcessing: About to call useMemo with dependencies:', { 
    rowDataRawLength: rowDataRaw?.length, 
    alternativeDataLength: alternativeData?.length,
    rowDataRawType: typeof rowDataRaw,
    alternativeDataType: typeof alternativeData
  });

  return useMemo(() => {
    loopDetector.trackCall('useDataProcessing', 'useMemo', [rowDataRaw, alternativeData]);
    console.log('🔄 useDataProcessing useMemo EXECUTING');
    debugLogger.log('DataProcessing', 'Starting data processing', { rowDataRaw, alternativeData });
    
    try {
      // Try primary data source first
      let dataSource = rowDataRaw;
      
      // If primary data is empty, try alternative data source
      if ((!rowDataRaw || (Array.isArray(rowDataRaw) && rowDataRaw.length === 0)) && 
          alternativeData && Array.isArray(alternativeData) && alternativeData.length > 0) {
        dataSource = alternativeData;
        debugLogger.log('DataProcessing', 'Using alternative data source', { alternativeData });
      }
      
      debugLogger.log('DataProcessing', 'Selected data source', { 
        dataSource, 
        type: typeof dataSource, 
        isArray: Array.isArray(dataSource) 
      });
      
      // Handle different data formats that Retool might pass
      if (!dataSource) {
        const error = 'No data received from Retool query';
        errorHandler.logError(error, 'data', { rowDataRaw, alternativeData });
        return { rowData: [], hasValidData: false, error };
      }

      let processedData: any[] = [];

      // If it's already an array, use it directly
      if (Array.isArray(dataSource)) {
        debugLogger.log('DataProcessing', 'Data source is array', { length: dataSource.length, firstItem: dataSource[0] });
        processedData = dataSource;
      }
      // If it's an object with a data property (common Retool pattern)
      else if (typeof dataSource === 'object' && dataSource !== null && 'data' in dataSource && Array.isArray((dataSource as any).data)) {
        debugLogger.log('DataProcessing', 'Data source has data property', { data: (dataSource as any).data });
        processedData = (dataSource as any).data;
      }
      // If it's an object with a results property (another common pattern)
      else if (typeof dataSource === 'object' && dataSource !== null && 'results' in dataSource && Array.isArray((dataSource as any).results)) {
        debugLogger.log('DataProcessing', 'Data source has results property', { results: (dataSource as any).results });
        processedData = (dataSource as any).results;
      }
      // If it's a single object, wrap it in an array
      else if (typeof dataSource === 'object' && !Array.isArray(dataSource)) {
        debugLogger.log('DataProcessing', 'Data source is single object, wrapping in array', { dataSource });
        processedData = [dataSource];
      }
      else {
        const error = 'Invalid data format received';
        errorHandler.logError(error, 'data', { dataSource, type: typeof dataSource });
        return { rowData: [], hasValidData: false, error };
      }

      // Validate the processed data
      if (!Array.isArray(processedData)) {
        const error = 'Expected array but got ' + typeof processedData;
        errorHandler.logError(error, 'data', { processedData, type: typeof processedData });
        return { rowData: [], hasValidData: false, error };
      }
      
      if (processedData.length === 0) {
        const error = 'No data available';
        errorHandler.logError(error, 'data', { processedData });
        return { rowData: [], hasValidData: false, error };
      }
      
      // Check if all rows are objects
      const invalidRows = processedData.filter(row => !row || typeof row !== 'object');
      if (invalidRows.length > 0) {
        const error = `Found ${invalidRows.length} invalid rows that are not objects`;
        errorHandler.logError(error, 'data', { invalidRows, totalRows: processedData.length });
        return { rowData: processedData, hasValidData: false, error };
      }

      debugLogger.log('DataProcessing', 'Data processing successful', { 
        rowCount: processedData.length, 
        firstRowKeys: Object.keys(processedData[0] || {}) 
      });
      return { rowData: processedData, hasValidData: true, error: null };
    } catch (error) {
      const errorMessage = `Data processing error: ${error}`;
      errorHandler.logError(errorMessage, 'data', { error, rowDataRaw, alternativeData });
      return { rowData: [], hasValidData: false, error: errorMessage };
    }
  }, [rowDataRaw, alternativeData]);
};
