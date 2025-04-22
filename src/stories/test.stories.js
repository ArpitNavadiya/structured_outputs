import React from 'react';
import Test from './test';

export default {
  title: 'Components/TestTextarea', // Changed to match the error message
  component: Test,
  parameters: {
    componentSubtitle: 'A structured generation field component',
  },
  argTypes: {
    initialValue: {
      control: 'text',
      description: 'Initial text value',
    },
    onChange: {
      action: 'changed',
      description: 'Called when the text content changes',
    },
  },
};

// Basic usage example
export const Default = (args) => <Test {...args} />;
Default.args = {
  initialValue: '',
};

// Example with initial text
export const WithInitialText = (args) => <Test {...args} />;
WithInitialText.args = {
  initialValue: 'Initial text content',
};

// Example with callback function
export const WithCallback = (args) => <Test {...args} />;
WithCallback.args = {
  onChange: (values) => console.log('Values changed:', values),
};

// Example matching WordWare structured generation
export const StructuredGeneration = () => {
  return (
    <div style={{ width: '600px' }}>
      <h3>new_structured_generation</h3>
      <Test />
    </div>
  );
};
StructuredGeneration.parameters = {
  docs: {
    description: {
      story: 'A reproduction of the Wordware AI structured generation component',
    },
  },
};