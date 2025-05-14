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

      // Construct the full hierarchy path without duplications
      let hierarchyPath = '';

      // Check if parent name is already in the path
      if (field.hierarchyPath) {
        const pathParts = field.hierarchyPath.split(' → ');
        if (pathParts[pathParts.length - 1] !== field.name) {
          hierarchyPath = `${field.hierarchyPath} → ${field.name}`;
        } else {
          hierarchyPath = field.hierarchyPath;
        }
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
        isDetached: true,
        hierarchyPath: hierarchyPath,
        isList: field.isList // Pass the list state to the new object
      };

      // Only add an item field if it's a list but DON'T make it an object type 
      // to prevent double nesting
      if (field.isList) {
        newNestedObject.fields = [{
          id: Date.now() + 1,
          type: 'text', // Changed from 'object' to 'text' to avoid double nesting
          name: 'item',
          instruction: '',

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
    // For detached objects, display without duplicating the name
    // Create a clean path and don't duplicate the current field name
    let displayName = field.name;
    
    if (field.hierarchyPath) {
      // Clean up the hierarchy path to remove duplicates
      const cleanPath = field.hierarchyPath.split(' → ')
        .filter((name, index, array) => array.indexOf(name) === index)
        .join(' → ');
      
      // Check if the field name is already the last part of the path
      const parts = cleanPath.split(' → ');
      if (parts[parts.length - 1] !== field.name) {
        displayName = `${cleanPath} → ${field.name}`;
      } else {
        displayName = cleanPath;
      }
    }

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
        <div className="field-type-label-group" style={{ display: 'flex', flexDirection: 'row' }}>
          <span className="field-type-label" style={{ order: 1, marginRight: '8px' }}>
            {field.type === 'text' ? 'Text' : field.type === 'number' ? 'Numbers' : field.type === 'boolean' ? 'Boolean' : field.type === 'object' ? 'Object' : ''}
          </span>
          <span className="field-type-indicator" style={{ 
            order: 2, 
            marginRight: '4px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {getFieldTypeIndicator(field.type, field.source, field.isList)}
          </span>
          <button 
            className="field-type-arrow-btn" 
            title="Change field type"
            onClick={(e) => typeof onTypeArrowClick === 'function' ? onTypeArrowClick(e, field.id) : null}
            style={{ order: 3 }}
          >
            <span className="arrow-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" aria-hidden="true" width="32" height="32">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75L12 19.5l3.75-3.75" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25L12 4.5 8.25 8.25" />
              </svg>
            </span>
          </button>




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
      
      // Check if this is a nested object from a list parent
      if (updatedField.hierarchyPath && updatedField.hierarchyPath.includes('→')) {
        // It's a nested object, so we should add it as a top-level field
        setFields(prevFields => [...prevFields, updatedField]);
      } else {
        // Regular case - add as a top-level field
        setFields(prevFields => [...prevFields, updatedField]);
      }
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
      const findParentRecursively = (fields, id) => {
        for (const field of fields) {
          if (field.id === id) {
            // Return this field with its own hierarchy path
            return {
              name: field.name,
              hierarchyPath: field.hierarchyPath || ""
            };
          }
          if (field.fields && field.fields.length > 0) {
            const found = findParentRecursively(field.fields, id);


            if (found) return found;
          }
        }
        return null;
      };

      const parent = findParentRecursively(fields, parentId);
      if (parent) {
        // Check to prevent duplicate names in the path
        if (parent.hierarchyPath) {
          const pathParts = parent.hierarchyPath.split(' → ');
          // If the last part of the path is not already the parent's name, add it
          if (pathParts[pathParts.length - 1] !== parent.name) {
            hierarchyPath = `${parent.hierarchyPath} → ${parent.name}`;
          } else {
            hierarchyPath = parent.hierarchyPath;
          }
        } else {
          hierarchyPath = parent.name;
        }
      }
    }

    const newField = { 
      id: Date.now(),
      type: 'object',
      name: '',
      instruction: '',
      fields: [],
      parentId: parentId,
      hierarchyPath: hierarchyPath,
      source: 'value',
      showSingleField: true
    };



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
      x: rect.left - 430, // Center the popover horizontally over the button
      y: rect.top + 10, // Position at the top of the button
    });

    // Store the current field ID for later use when a type is selected
    setCurrentFieldId(fieldId);

    // Show the type popover
    setShowTypePopover(true);
  };

  const renderField = (field) => {
    // Helper to create a clean display name with hierarchy
    const getCleanDisplayName = (field) => {
      if (!field.type === 'object' || !field.name) return field.name || '';
      
      // If no hierarchy path, just return the name
      if (!field.hierarchyPath) return field.name;
      
      // Clean the path and check if field name is already at the end
      const cleanPath = field.hierarchyPath.split(' → ')
        .filter((name, index, array) => array.indexOf(name) === index)
        .join(' → ');
      
      const parts = cleanPath.split(' → ');
      if (parts[parts.length - 1] !== field.name) {
        return `${cleanPath} → ${field.name}`;
      } else {
        return cleanPath;
      }
    };
    
    return (
      <div key={field.id} className={`field-container${field.type === 'object' ? ' object-field-container' : ''}`}>
        {/* Only show the simple object name in the header for normal objects */}
        {field.type === 'object' && field.name && !field.isDetached && (
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
  };

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