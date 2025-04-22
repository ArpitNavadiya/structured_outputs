import React, { useState, useRef, useEffect } from 'react';
import './test.css';

const ValueTypePopover = ({ onSelect, onClose, position }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const types = [
    { id: 'text', label: 'Text', icon: '📝', color: '#ebf9f0' },
    { id: 'number', label: 'Number', icon: '🔢', color: '#fde7e7' },
    { id: 'boolean', label: 'True/False', icon: '🔘', color: '#e8f0fe' }
  ];

  return (
    <div className="value-type-popover" ref={popoverRef} style={{ top: position.y, left: position.x }}>
      <div className="popover-title">What type of value?</div>
      {types.map(type => (
        <div
          key={type.id}
          className="type-option"
          style={{ backgroundColor: type.color }}
          onClick={() => {
            onSelect(type.id);
            onClose();
          }}
        >
          <span className="type-icon">{type.icon}</span>
          <span className="type-label">{type.label}</span>
        </div>
      ))}
    </div>
  );
};

// New component for Logic Popover
const LogicTypePopover = ({ onSelect, onClose, position }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const logicTypes = [
    { id: 'text', label: 'Text', icon: '[AB]', color: '#ebf9f0' },
    { id: 'number', label: 'Number', icon: '[123]', color: '#fde7e7' },
    { id: 'boolean', label: 'True/False', icon: '[0/1]', color: '#e8f0fe' },
    { id: 'object', label: 'Object', icon: '[{}]', color: '#fff8e1' }
  ];

  return (
    <div className="value-type-popover" ref={popoverRef} style={{ top: position.y, left: position.x }}>
      <div className="popover-title">What should be in this list?</div>
      {logicTypes.map(type => (
        <div
          key={type.id}
          className="type-option"
          style={{ backgroundColor: type.color }}
          onClick={() => {
            onSelect(type.id);
            onClose();
          }}
        >
          <span className="type-icon">{type.icon}</span>
          <span className="type-label">{type.label}</span>
        </div>
      ))}
    </div>
  );
};

const FieldInput = ({ field, onChange, onDuplicate, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Updated field type indicators with the specified format
  const getFieldTypeIndicator = (type) => {
    switch(type) {
      case 'text': return '[AB]';
      case 'number': return '[123]';
      case 'boolean': return '[0/1]';
      case 'object': return '[{}]';
      default: return '[{}]';
    }
  };

  return (
    <div className="field-input-container">
      <div className="field-input-row">
        <div className="field-type-indicator">
          {getFieldTypeIndicator(field.type)}
        </div>
        <input
          type="text"
          className="field-name-input"
          placeholder="Field name"
          value={field.name || ''}
          onChange={(e) => onChange(field.id, { ...field, name: e.target.value })}
        />
        <input
          type="text"
          className="field-instruction-input"
          placeholder="Field Instruction (optional)"
          value={field.instruction || ''}
          onChange={(e) => onChange(field.id, { ...field, instruction: e.target.value })}
        />
        <div className="field-actions">
          <div className="more-options-container" ref={dropdownRef}>
            <button 
              className="action-button more-button"
              onClick={() => setShowDropdown(!showDropdown)}
              title="More options"
            >
              <span>⋯</span>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button 
                  className="action-button duplicate-button"
                  onClick={() => {
                    onDuplicate(field.id);
                    setShowDropdown(false);
                  }}
                  title="Duplicate"
                >
                  <span>⧉</span>
                </button>
                <button 
                  className="action-button delete-button"
                  onClick={() => {
                    onDelete(field.id);
                    setShowDropdown(false);
                  }}
                  title="Delete"
                >
                  <span>✕</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Test = ({ initialValue = '', onChange }) => {
  const [fields, setFields] = useState([]);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showTypePopover, setShowTypePopover] = useState(false);
  const [showLogicPopover, setShowLogicPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  const [activeParentId, setActiveParentId] = useState(null);

  const handleAddClick = (event, parentId = null) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: buttonRect.left,
      y: buttonRect.bottom + 10
    });
    setActiveParentId(parentId);
    setShowTypePopover(true);
  };

  const handleLogicClick = (event, parentId = null) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: buttonRect.left,
      y: buttonRect.bottom + 10
    });
    setActiveParentId(parentId);
    setShowLogicPopover(true);
  };

  const handleLogicTypeSelect = (type) => {
    // Create the new field based on the selected type
    // For 'object' type, always include an empty fields array
    const newField = { 
      id: Date.now(), 
      type: type,
      name: '',
      instruction: '',
      value: '',
      // Always include an empty fields array regardless of type
      // This will prevent the "length of undefined" error
      fields: []
    };

    if (activeParentId) {
      // Add to nested fields - recursively update the fields structure
      setFields(prevFields => {
        const updateFieldsRecursively = (fields) => {
          return fields.map(field => {
            if (field.id === activeParentId) {
              return {
                ...field,
                fields: [...(field.fields || []), newField]
              };
            } else if (field.fields && field.fields.length > 0) {
              return {
                ...field,
                fields: updateFieldsRecursively(field.fields)
              };
            }
            return field;
          });
        };
        return updateFieldsRecursively(prevFields);
      });
    } else {
      // Add to root level
      setFields([...fields, newField]);
    }
    setShowEmptyState(false);
    setShowLogicPopover(false);
    setActiveParentId(null); // Reset the active parent ID
  };

  const handleTypeSelect = (type) => {
    // Create the new field with fields array for all types for consistency
    const newField = { 
      id: Date.now(), 
      type: type,
      name: '',
      instruction: '',
      value: '',
      // Include empty fields array for all types
      fields: []
    };

    if (activeParentId) {
      // Add to nested fields - recursively update the fields structure
      setFields(prevFields => {
        const updateFieldsRecursively = (fields) => {
          return fields.map(field => {
            if (field.id === activeParentId) {
              return {
                ...field,
                fields: [...(field.fields || []), newField]
              };
            } else if (field.fields && field.fields.length > 0) {
              return {
                ...field,
                fields: updateFieldsRecursively(field.fields)
              };
            }
            return field;
          });
        };
        return updateFieldsRecursively(prevFields);
      });
    } else {
      // Add to root level
      setFields([...fields, newField]);
    }
    setShowEmptyState(false);
    setShowTypePopover(false);
    setActiveParentId(null); // Reset the active parent ID
  };

  const duplicateField = (id) => {
    // Find the field in the flat or nested structure
    const findFieldRecursively = (fields, id) => {
      for (const field of fields) {
        if (field.id === id) {
          return field;
        }
        if (field.fields && field.fields.length > 0) {
          const found = findFieldRecursively(field.fields, id);
          if (found) return found;
        }
      }
      return null;
    };

    const fieldToDuplicate = findFieldRecursively(fields, id);
    
    if (fieldToDuplicate) {
      // Create a deep copy with a new ID
      const duplicatedField = {
        ...JSON.parse(JSON.stringify(fieldToDuplicate)),
        id: Date.now()
      };
      
      // Find the parent field to add the duplicate
      if (fieldToDuplicate.parentId) {
        setFields(prevFields => {
          const updateFieldsRecursively = (fields) => {
            return fields.map(field => {
              if (field.id === fieldToDuplicate.parentId) {
                const index = field.fields.findIndex(f => f.id === id);
                const newFields = [...field.fields];
                newFields.splice(index + 1, 0, duplicatedField);
                return {
                  ...field,
                  fields: newFields
                };
              } else if (field.fields && field.fields.length > 0) {
                return {
                  ...field,
                  fields: updateFieldsRecursively(field.fields)
                };
              }
              return field;
            });
          };
          return updateFieldsRecursively(prevFields);
        });
      } else {
        // For top-level fields
        const index = fields.findIndex(field => field.id === id);
        const updatedFields = [...fields];
        updatedFields.splice(index + 1, 0, duplicatedField);
        setFields(updatedFields);
      }
    }
  };

  const handleDeleteField = (id) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
    if (updatedFields.length === 0) {
      setShowEmptyState(true);
    }
  };

  const showHelp = () => {
    // Implement help functionality
    alert("This is a structured generation component. Add fields using the '+' button.");
  };

  const handleSimpleFieldChange = (id, updatedField) => {
    const updatedFields = fields.map(field => 
      field.id === id ? { ...field, ...updatedField } : field
    );
    setFields(updatedFields);
    
    if (onChange) {
      onChange(updatedFields);
    }
  };

  const handleAddNestedObject = (parentId = null) => {
    const newField = { 
      id: Date.now(),
      type: 'object',
      name: '',
      instruction: '',
      fields: [],
      parentId: parentId
    };
    
    if (parentId) {
      // Add to nested fields - recursively update the fields structure
      setFields(prevFields => {
        const updateFieldsRecursively = (fields) => {
          return fields.map(field => {
            if (field.id === parentId) {
              return {
                ...field,
                fields: [...(field.fields || []), newField]
              };
            } else if (field.fields && field.fields.length > 0) {
              return {
                ...field,
                fields: updateFieldsRecursively(field.fields)
              };
            }
            return field;
          });
        };
        return updateFieldsRecursively(prevFields);
      });
    } else {
      // Add to root level
      setFields([...fields, newField]);
    }
    setShowEmptyState(false);
  };

  const handleFieldChange = (id, updatedField) => {
    // Update fields recursively
    const updateFieldsRecursively = (fields) => {
      return fields.map(field => {
        if (field.id === id) {
          return { ...field, ...updatedField };
        } else if (field.fields && field.fields.length > 0) {
          return {
            ...field,
            fields: updateFieldsRecursively(field.fields)
          };
        }
        return field;
      });
    };
    
    const updatedFields = updateFieldsRecursively(fields);
    setFields(updatedFields);
    
    if (onChange) {
      onChange(updatedFields);
    }
  };

  const deleteField = (id) => {
    // Delete fields recursively
    const deleteFieldRecursively = (fields) => {
      return fields.filter(field => {
        if (field.id === id) {
          return false;
        }
        if (field.fields && field.fields.length > 0) {
          field.fields = deleteFieldRecursively(field.fields);
        }
        return true;
      });
    };

    const updatedFields = deleteFieldRecursively(fields);
    setFields(updatedFields);
    if (updatedFields.length === 0) {
      setShowEmptyState(true);
    }
  };

  const renderField = (field) => (
    <div key={field.id} className="field-container">
      <FieldInput 
        field={field}
        onChange={handleFieldChange}
        onDuplicate={duplicateField}
        onDelete={deleteField}
      />
      {field.type === 'object' && (
        <div className="nested-fields">
          {/* Make sure we're checking that field.fields exists and has entries */}
          {!field.fields || field.fields.length === 0 ? (
            <div className="empty-nested-state">No fields in object</div>
          ) : (
            field.fields.map(nestedField => renderField(nestedField))
          )}
          <div className="nested-actions">
            <button 
              className="action-button add-button"
              onClick={(e) => handleAddClick(e, field.id)}
              title="Add field"
              data-parent-id={field.id}
            >
              <span>+</span>
            </button>
            <button 
              className="action-button add-object-button"
              onClick={() => handleAddNestedObject(field.id)}
              title="Add nested object"
            >
              <span>{'{+}'}</span>
            </button>
            <button 
              className="action-button remove-button"
              onClick={(e) => handleLogicClick(e, field.id)}
              title="Logic"
            >
              <span>[+]</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="structured-generation">
      {showEmptyState ? (
        <div className="empty-state">
          <p>No fields</p>
        </div>
      ) : (
        <div className="fields-container">
          {fields.map(field => renderField(field))}
        </div>
      )}
      
      <div className="bottom-actions">
        <button 
          className="action-button add-button"
          onClick={handleAddClick}
          title="Add field"
        >
          <span>+</span>
        </button>
        <button 
          className="action-button add-object-button"
          onClick={() => handleAddNestedObject()}
          title="Add nested object"
        >
          <span>{'{+}'}</span>
        </button>
        <button 
          className="action-button help-button"
          onClick={(e) => handleLogicClick(e)}
          title="Logic"
        >
          <span>[+]</span>
        </button>
      </div>

      {/* Value Type Popover */}
      {showTypePopover && (
        <ValueTypePopover
          position={popoverPosition}
          onSelect={handleTypeSelect}
          onClose={() => setShowTypePopover(false)}
        />
      )}

      {/* Logic Type Popover */}
      {showLogicPopover && (
        <LogicTypePopover
          position={popoverPosition}
          onSelect={handleLogicTypeSelect}
          onClose={() => setShowLogicPopover(false)}
        />
      )}
    </div>
  );
};

export default Test;