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
    { id: 'text', label: 'Text', color: '#ebf9f0' },
    { id: 'number', label: 'Number', color: '#fde7e7' },
    { id: 'boolean', label: 'True/False', color: '#e8f0fe' }
  ];

  return (
    <div className="value-type-popover" ref={popoverRef} style={{ top: position.y, left: position.x }}>
      {types.map((type, idx) => (
        <React.Fragment key={type.id}>
          <div
            className="type-option"
            onClick={() => {
              onSelect(type.id, 'value');
              onClose();
            }}
          >
            <span className="type-icon">{type.icon}</span>
            <span className="type-label">{type.label}</span>
          </div>
          {idx < types.length - 1 && <div className="value-type-divider" />}
        </React.Fragment>
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
            onSelect(type.id, 'logic'); // Pass 'logic' to indicate this is from logic popover
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

const FieldInput = ({ field, onChange, onDuplicate, onDelete, onToggleList, onTypeArrowClick }) => {
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

  const handleKeyDown = (e, fieldId, fieldName) => {
    if (e.key === 'Enter' && field.type === 'object' && fieldName.trim() !== '') {
      e.preventDefault();
      
      // Store just the hierarchyPath without duplicating names
      let hierarchyPath = '';
      
      // If parent field has a hierarchyPath, use it, otherwise use the parent name
      if (field.hierarchyPath) {
        hierarchyPath = field.hierarchyPath;
      } else if (field.name) {
        hierarchyPath = field.name;
      }
      
      const newNestedObject = { 
        id: Date.now(),
        type: 'object',
        name: fieldName,
        instruction: '',
        fields: [],
        parentId: null,
        source: 'value',
        showSingleField: true,
        isDetached: true,  // Add this flag to identify detached objects
        // Add parent name information with full hierarchy
        hierarchyPath: hierarchyPath
      };
      
      // If the toggle is on (isList is true), add a single field to the detached object
      if (field.isList) {
        newNestedObject.fields = [{
          id: Date.now() + 1,
          type: 'object',  // Changed from 'text' to 'object'
          name: 'item',
          instruction: '',
          fields: [],
          parentId: newNestedObject.id,
          source: 'value',
          showSingleField: true
        }];
      }
      
      // Signal to parent component to add this as a new top-level field
      if (typeof onChange === 'function') {
        onChange('newObject', newNestedObject);
      }
    }
  };

  // Updated field type indicators with different formats based on source and list
  const getFieldTypeIndicator = (type, source, isList) => {
    if (isList) {
      // List mode: show with brackets
      switch(type) {
        case 'text': return '[AB]';
        case 'number': return '[123]';
        case 'boolean': return '[0/1]';
        case 'object': return '[ { } ]';
        default: return '[ { } ]';
      }
    } else if (source === 'logic') {
      // For logic popover selections, use brackets
      switch(type) {
        case 'text': return '[AB]';
        case 'number': return '[123]';
        case 'boolean': return '[0/1]';
        case 'object': return '[ { } ]';
        default: return '[ { } ]';
      }
    } else {
      // For value popover selections, don't use brackets
      switch(type) {
        case 'text': return 'AB';
        case 'number': return '123';
        case 'boolean': return '0/1';
        case 'object': return '{ }';
        default: return '{ }';
      }
    }
  };

  // If this is a detached object, render a simplified version without controls
  if (field.isDetached) {
    // For detached objects, display the hierarchyPath + current name without duplication
    const displayName = field.hierarchyPath ? `${field.hierarchyPath} → ${field.name}` : field.name;
    
    return (
      <div className="field-input-container detached-object">
        <div className="object-field-header">
          {displayName}
        </div>
        {/* No additional UI elements */}
      </div>
    );
  }
  
  

  return (
    <div className="field-input-container">
      <div className="field-input-header">
        <div className="field-type-label-group">
          <button 
            className="field-type-arrow-btn" 
            title="Change field type"
            onClick={(e) => typeof onTypeArrowClick === 'function' ? onTypeArrowClick(e, field.id) : null}
          >
            <span className="arrow-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" aria-hidden="true" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75L12 19.5l3.75-3.75" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25L12 4.5 8.25 8.25" />
              </svg>
            </span>
          </button>
          <span className="field-type-label">
            {field.type === 'text' ? 'Text' : field.type === 'number' ? 'Numbers' : field.type === 'boolean' ? 'Boolean' : field.type === 'object' ? 'Object' : ''}
          </span>
          <span className="field-type-indicator">{getFieldTypeIndicator(field.type, field.source, field.isList)}</span>
        </div>
        <div className="field-header-actions">
          <span className="toggle-list-label">List</span>
          <button
            className={`toggle-list-button${field.isList ? ' toggled' : ''}`}
            title={field.isList ? "Convert to single value" : "Convert to list"}
            onClick={() => onToggleList(field.id)}
          >
            <span className="toggle-slider" />
          </button>
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
                  <span className="dropdown-action-label">Duplicate</span>
                </button>
                <div className="field-type-divider" />
                <button 
                  className="action-button delete-button"
                  onClick={() => {
                    onDelete(field.id);
                    setShowDropdown(false);
                  }}
                  title="Delete"
                >
                  <span>✕</span>
                  <span className="dropdown-action-label">Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="field-input-fields">
        <input
          type="text"
          className="field-name-input"
          placeholder="Key"
          value={field.name || ''}
          onChange={(e) => onChange(field.id, { ...field, name: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, field.id, e.target.value)}
        />
        {!field.showSingleField && (
          <input
            type="text"
            className="field-instruction-input"
            placeholder="Value"
            value={field.instruction || ''}
            onChange={(e) => onChange(field.id, { ...field, instruction: e.target.value })}
          />
        )}
      </div>
    </div>
  );
};

const Test = ({ initialValue = '', onChange }) => {
  const [fields, setFields] = useState([]);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showTypePopover, setShowTypePopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [currentFieldId, setCurrentFieldId] = useState(null);
  
  const [showLogicPopover, setShowLogicPopover] = useState(false);
  const [typePopoverFieldId, setTypePopoverFieldId] = useState(null);
  const [activeParentId, setActiveParentId] = useState(null);

  // Add this function to handle toggling the isList property
  const handleToggleList = (fieldId) => {
    setFields(prevFields => {
      const toggleListRecursively = (fields) => {
        return fields.map(field => {
          if (field.id === fieldId) {
            return { ...field, isList: !field.isList };
          } else if (field.fields && field.fields.length > 0) {
            return { ...field, fields: toggleListRecursively(field.fields) };
          }
          return field;
        });
      };
      return toggleListRecursively(prevFields);
    });
  };



  const handleAddClick = (event, parentId = null) => {
    const button = event.currentTarget;
    const parent = button.offsetParent;
    const buttonRect = button.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    setPopoverPosition({
      x: buttonRect.left - parentRect.left,
      y: buttonRect.bottom - parentRect.top
    });
    setActiveParentId(parentId);
    setShowTypePopover(true);
  };

  const handleLogicClick = (event, parentId = null) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: buttonRect.left,
      y: buttonRect.bottom
    });
    setActiveParentId(parentId);
    setShowLogicPopover(true);
  };

  const handleLogicTypeSelect = (type, source) => {
    const newField = { 
      id: Date.now(), 
      type: type,
      name: '',
      instruction: '',
      value: '',
      source: source,
      fields: []
    };

    if (activeParentId) {
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
      setFields([...fields, newField]);
    }
    setShowEmptyState(false);
    setShowLogicPopover(false);
    setActiveParentId(null);
  };

  const handleTypeSelect = (type, source) => {
    const newField = { 
        id: Date.now(), 
        type: type,
        name: '',
        instruction: '',
        value: '',
        source: source,
        fields: []
    };

    if (currentFieldId) {
        setFields(prevFields => {
            const updateFieldsRecursively = (fields) => {
                return fields.map(field => {
                    if (field.id === currentFieldId) {
                        return { ...field, type, source, value: '', fields: [] };
                    } else if (field.fields && field.fields.length > 0) {
                        return { ...field, fields: updateFieldsRecursively(field.fields) };
                    }
                    return field;
                });
            };
            return updateFieldsRecursively(prevFields);
        });
        setShowTypePopover(false);
        setCurrentFieldId(null);
    } else {
        setFields([...fields, newField]);
        setShowEmptyState(false);
        setShowTypePopover(false);
        setActiveParentId(null);
    }
};

const duplicateField = (id) => {
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
    const duplicatedField = {
      ...JSON.parse(JSON.stringify(fieldToDuplicate)),
      id: Date.now()
    };
    
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

// Modified function to handle object field enter press
  const handleFieldChange = (id, updatedField) => {
    // Special case for handling 'newObject'
    if (id === 'newObject') {
      // Create a new top-level field with the given object properties
      setFields(prevFields => [...prevFields, updatedField]);
      return;
    }

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

  const handleSimpleFieldChange = (id, updatedField) => {
    const updatedFields = fields.map(field => 
      field.id === id ? { ...field, ...updatedField } : field
    );
    setFields(updatedFields);
    
    if (onChange) {
      onChange(updatedFields);
    }
  };

  const getNestingLevel = (field) => {
    if (!field.fields || field.fields.length === 0) {
      return 1;
    }
    return 1 + Math.max(...field.fields.map(getNestingLevel));
  };

  const handleAddNestedObject = (parentId = null) => {
    let hierarchyPath = "";
    
    // Find parent with hierarchy path if parentId exists
    if (parentId) {
      const findParentRecursively = (fields, id, currentPath = "") => {
        for (const field of fields) {
          if (field.id === id) {
            // Return the full path including this field's name
            return currentPath ? (currentPath + " → " + field.name) : field.name;
          }
          if (field.fields && field.fields.length > 0) {
            // Build the path as we go deeper
            const newPath = currentPath ? (currentPath + " → " + field.name) : field.name;
            const found = findParentRecursively(field.fields, id, newPath);
            if (found) return found;
          }
        }
        return "";
      };
      
      hierarchyPath = findParentRecursively(fields, parentId, "");
    }
  
    const newField = { 
      id: Date.now(),
      type: 'object',
      name: '',
      instruction: '',
      fields: [],
      parentId: parentId,
      hierarchyPath: hierarchyPath, // Store full hierarchy path
      source: 'value',
      showSingleField: true
    };
  
    // Rest of the function remains the same...
  
    if (parentId) {
      const parentField = fields.find(field => field.id === parentId);
      if (parentField) {
        const currentNestingLevel = getNestingLevel(parentField);
  
        if (currentNestingLevel >= 5) {
          alert("Maximum nesting level of 5 reached.");
          return;
        }
      }
  
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
      setFields([...fields, newField]);
    }
    setShowEmptyState(false);
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

  const handleTypeArrowClick = (e, fieldId) => {
    // Get position for the type popover
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left,
      y: rect.bottom + 5
    });
    
    // Store the current field ID for later use when a type is selected
    setCurrentFieldId(fieldId);
    
    // Show the type popover
    setShowTypePopover(true);
  };

  const renderField = (field) => (
    <div key={field.id} className={`field-container${field.type === 'object' ? ' object-field-container' : ''}`}>
      {field.type === 'object' && field.name && (
  <div className="object-field-header">
    {field.name}
  </div>
)}
      <FieldInput 
        field={field}
        onChange={handleFieldChange}
        onDuplicate={duplicateField}
        onDelete={deleteField}
        onToggleList={handleToggleList}
        onTypeArrowClick={handleTypeArrowClick}
      />
      {field.type === 'object' && (
        <div className="nested-fields">
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
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="structured-generation">
      <div className="fields-container">
        {fields.length === 0 && (
          <div className="empty-state">No fields</div>
        )}
        {fields.map(field => renderField(field))}
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
          {/* Removed the third button */}
        </div>
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
