# Getting Started

This guide will help you set up and use the Retool Custom Components Library.

## Quick Start

### 1. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd retool-custom-components

# Install dependencies
npm install
```

### 2. Development
```bash
# Start the development server
npm run dev
```

### 3. Building
```bash
# Build the components
npm run build
```

### 4. Deployment
```bash
# Deploy to Retool
npm run deploy
```

## Using Components in Retool

Once deployed, you can use the components in your Retool applications:

1. **Add Component**: Drag the component from the component library
2. **Configure Properties**: Set up the component properties in the inspector
3. **Connect Data**: Link your queries to the component's data properties
4. **Handle Events**: Use component events to trigger actions

## AG Grid Component Usage

### Basic Setup
1. Add the AG Grid component to your app
2. Connect your data: `{{ query1.data }}`
3. Configure columns and features as needed

### Key Properties
- **Row Data**: Connect your query data
- **Enable Row Selection**: Allow users to select rows
- **Enable Editing**: Allow inline cell editing
- **Enable Pagination**: Add pagination for large datasets

### Output Properties
- **Selected Rows**: Currently selected rows
- **Edited Data**: All data with edits applied
- **Changed Rows**: Only the rows that were edited

## Next Steps

- Read the [Development Guide](development-guide.md) to learn how to add new components
- Check the [API Reference](api-reference.md) for detailed component documentation
- Explore the example components in the `src/` directory
