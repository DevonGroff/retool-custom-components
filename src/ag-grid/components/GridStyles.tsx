import React from 'react';

export const GridStyles: React.FC = () => (
  <style>{`
    /* Fix floating filter input interaction */
    .ag-floating-filter-input input {
      pointer-events: auto !important;
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      cursor: text !important;
      background: white !important;
      border: 1px solid #ccc !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    .ag-floating-filter-input input:focus {
      outline: 2px solid #1976d2 !important;
      outline-offset: -2px !important;
      border-color: #1976d2 !important;
    }
    
    .ag-floating-filter-input {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    .ag-floating-filter-body {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    .ag-floating-filter {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    /* Row selection styling - Fixed to prevent layout issues */
    .ag-row {
      pointer-events: auto !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      cursor: pointer !important;
      min-height: 25px !important;
    }
    
    .ag-row:hover {
      background-color: #f5f5f5 !important;
    }
    
    .ag-row.ag-row-selected {
      background-color: #e3f2fd !important;
    }
    
    .ag-row.ag-row-selected:hover {
      background-color: #bbdefb !important;
    }
    
    .ag-cell {
      pointer-events: auto !important;
      min-height: 25px !important;
    }
    
    .ag-cell-focus {
      border: 2px solid #1976d2 !important;
    }
    
    /* Theme-specific fixes */
    .ag-theme-quartz .ag-floating-filter-body {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    .ag-theme-quartz .ag-floating-filter-input {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    .ag-theme-quartz .ag-floating-filter {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    .ag-theme-quartz .ag-floating-filter-input input {
      pointer-events: auto !important;
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      cursor: text !important;
      background: white !important;
      border: 1px solid #ccc !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Ensure floating filters are visible and interactive */
    .ag-floating-filter-wrapper {
      pointer-events: auto !important;
      width: 100% !important;
    }
    
    .ag-floating-filter-wrapper input {
      pointer-events: auto !important;
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      cursor: text !important;
    }
    
    /* Fix for table crunching to the left */
    .ag-theme-quartz {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    .ag-theme-quartz .ag-root-wrapper {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    .ag-theme-quartz .ag-root {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Ensure proper grid sizing */
    .ag-grid-container {
      width: 100% !important;
      height: 100% !important;
      min-height: 400px !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Fix for selection checkbox issues */
    .ag-theme-quartz .ag-selection-checkbox {
      pointer-events: auto !important;
      display: inline-block !important;
      width: 16px !important;
      height: 16px !important;
    }
    
    /* Ensure proper column sizing and prevent crunching */
    .ag-theme-quartz .ag-header-cell {
      min-width: 100px !important;
      flex: 1 1 auto !important;
    }
    
    .ag-theme-quartz .ag-cell {
      min-width: 100px !important;
      flex: 1 1 auto !important;
    }
    
    /* Fix for row selection column */
    .ag-theme-quartz .ag-selection-column {
      width: 50px !important;
      min-width: 50px !important;
      max-width: 50px !important;
      flex: 0 0 50px !important;
    }
    
    /* Ensure proper header layout */
    .ag-theme-quartz .ag-header {
      display: flex !important;
      width: 100% !important;
    }
    
    .ag-theme-quartz .ag-header-row {
      display: flex !important;
      width: 100% !important;
    }
    
    /* Ensure proper body layout */
    .ag-theme-quartz .ag-body {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
    }
    
    .ag-theme-quartz .ag-body-viewport {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
    }
    
    /* Fix for row layout */
    .ag-theme-quartz .ag-row {
      display: flex !important;
      width: 100% !important;
    }
    
    /* Ensure proper cell layout within rows */
    .ag-theme-quartz .ag-cell-wrapper {
      display: flex !important;
      align-items: center !important;
      width: 100% !important;
    }
    
    /* Fix for theme persistence */
    .ag-theme-quartz {
      --ag-background-color: #ffffff !important;
      --ag-foreground-color: #181d1f !important;
      --ag-border-color: #babfc7 !important;
      --ag-header-background-color: #f8f9fa !important;
      --ag-header-foreground-color: #181d1f !important;
      --ag-odd-row-background-color: #f8f9fa !important;
      --ag-row-hover-color: #f5f5f5 !important;
      --ag-selected-row-background-color: #e3f2fd !important;
    }
    
    /* Ensure theme variables are applied */
    .ag-theme-quartz * {
      box-sizing: border-box !important;
    }
    
    /* Fix for grid container sizing */
    .ag-grid-container .ag-theme-quartz {
      width: 100% !important;
      height: 100% !important;
      min-height: 400px !important;
    }
    
    /* Prevent layout shifts */
    .ag-theme-quartz .ag-body-horizontal-scroll {
      overflow-x: auto !important;
    }
    
    .ag-theme-quartz .ag-body-vertical-scroll {
      overflow-y: auto !important;
    }
    
    /* Fix for floating filters positioning */
    .ag-theme-quartz .ag-floating-filter-body {
      position: relative !important;
      z-index: 1 !important;
    }
    
    /* Ensure proper spacing */
    .ag-theme-quartz .ag-header-cell {
      padding: 8px 12px !important;
    }
    
    .ag-theme-quartz .ag-cell {
      padding: 8px 12px !important;
    }
    
    /* Fix for selection column width */
    .ag-theme-quartz .ag-selection-column {
      width: 50px !important;
      min-width: 50px !important;
      max-width: 50px !important;
      flex: 0 0 50px !important;
    }
    
    /* Ensure proper row height */
    .ag-theme-quartz .ag-row {
      min-height: 35px !important;
    }
    
    /* Fix for cell content alignment */
    .ag-theme-quartz .ag-cell {
      display: flex !important;
      align-items: center !important;
      line-height: 1.4 !important;
    }
  `}</style>
);
