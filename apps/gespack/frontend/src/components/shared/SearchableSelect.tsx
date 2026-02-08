import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./SearchableSelect.css";

type Option = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  label?: string;
  value: string | null;
  onChange: (value: string | null, label: string | null) => void;
  placeholder?: string;
  options: Option[];
  onSearch?: (inputValue: string) => Promise<Option[]>;
  isDisabled?: boolean;
  noOptionsMessage?: string;
  minChars?: number;
  debounceMs?: number;
  className?: string;
  ariaInvalid?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  shouldCloseDropdown?: boolean;
};
export function SearchableSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  onSearch,
  isDisabled = false,
  noOptionsMessage,
  minChars = 1,
  debounceMs = 100,
  className,
  ariaInvalid,
  inputRef,
  shouldCloseDropdown = false,
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("order:orderForm.orderLines.selectProductLine");
  const resolvedNoOptionsMessage = noOptionsMessage ?? t("order:orderForm.orderLines.noProductLines");
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRefLocal = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? inputRefLocal;
  const timerRef = useRef<number | null>(null);

  // Encontrar la opción seleccionada
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = (isOpen || isTyping) ? inputValue : (selectedOption?.label || "");

  // Cerrar dropdown cuando se abre un modal
  useEffect(() => {
    if (shouldCloseDropdown && isOpen) {
      setIsOpen(false);
      setInputValue("");
      setIsTyping(false);
      setSelectedIndex(-1);
    }
  }, [shouldCloseDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Verificar si el click está fuera del input y del dropdown
      if (ref.current && !ref.current.contains(target) &&
          !target.closest('.searchable-select-dropdown')) {
        setIsOpen(false);
        setInputValue("");
        setIsTyping(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 4px de margen
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Auto-scroll to highlighted option
  useEffect(() => {
    if (selectedIndex >= 0 && isOpen) {
      const dropdown = document.querySelector('.searchable-select-dropdown');
      const option = dropdown?.children[selectedIndex + 1] as HTMLElement; // +1 because loading div might be first
      
      if (option && dropdown) {
        const dropdownRect = dropdown.getBoundingClientRect();
        const optionRect = option.getBoundingClientRect();
        
        if (optionRect.bottom > dropdownRect.bottom) {
          option.scrollIntoView({ block: 'end', behavior: 'auto' });
        } else if (optionRect.top < dropdownRect.top) {
          option.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
      }
    }
  }, [selectedIndex, isOpen]);

  const performSearch = async (searchTerm: string) => {
    setSelectedIndex(-1); // Reset selection index

    if (searchTerm.length < minChars) {
      setFilteredOptions(options);
      return;
    }

    if (onSearch) {
      setIsLoading(true);
      try {
        const results = await onSearch(searchTerm);
        setFilteredOptions(results);
        
        // Autocompletado con la primera opción que coincida exactamente al inicio
        if (results.length > 0 && searchTerm.length > 0) {
          const firstMatchIndex = results.findIndex(option => 
            option.label.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().startsWith(searchTerm.toLowerCase())
          );
          
          if (firstMatchIndex !== -1) {
            setSelectedIndex(firstMatchIndex);
          } else {
            setSelectedIndex(0);
          }
        } else {
          setSelectedIndex(-1);
        }
        
      } catch (error) {
        devLog.error("Error searching:", error);
        setFilteredOptions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Filtrado local
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      
      // Autocompletado con la primera opción que coincida exactamente al inicio
      if (filtered.length > 0 && searchTerm.length > 0) {
        const firstMatchIndex = filtered.findIndex(option => 
          option.label.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
        
        if (firstMatchIndex !== -1) {
          setSelectedIndex(firstMatchIndex);
        } else {
          setSelectedIndex(0);
        }
      } else {
        setSelectedIndex(-1);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsTyping(true);
    
    // Abrir dropdown automáticamente si no está abierto
    if (!isOpen) {
      setIsOpen(true);
    }
    
    if (newValue.length >= minChars) {
      const quickFiltered = options.filter(option =>
        option.label.toLowerCase().includes(newValue.toLowerCase()) ||
        option.value.toLowerCase().includes(newValue.toLowerCase())
      );
      if (quickFiltered.length > 0) {
        setFilteredOptions(quickFiltered);
        setSelectedIndex(0); // Select first option IMMEDIATELY
      }
    } else {
      // Reset to all options if below minimum characters
      setFilteredOptions(options);
      setSelectedIndex(-1);
    }
    
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    
    timerRef.current = window.setTimeout(() => {
      performSearch(newValue);
    }, debounceMs) as unknown as number;
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se dispare el handleContainerClick
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!inputValue && !isOpen) {
        setFilteredOptions(options);
      }
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Si se hace clic en el contenedor (incluyendo la flecha), alternar el dropdown
    if (!isDisabled) {
      e.preventDefault();
      setIsOpen(!isOpen);
      if (!inputValue && !isOpen) {
        setFilteredOptions(options);
      }
      // Enfocar el input después de hacer clic
      setTimeout(() => {
  ref.current?.focus();
      }, 0);
    }
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.value, option.label);
    setInputValue("");
    setIsOpen(false);
    setIsTyping(false);
    setSelectedIndex(-1);
    
    // Pasar al siguiente campo después del clic
    setTimeout(() => {
      if (ref.current) {
        ref.current.blur();
        const focusableElements = document.querySelectorAll(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const currentIndex = Array.from(focusableElements).indexOf(ref.current);
        const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
        if (nextElement) {
          nextElement.focus();
        }
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si es una tecla alfanumérica y el dropdown está cerrado, abrirlo
    if (!isOpen && /^[a-zA-Z0-9\s]$/.test(e.key)) {
      setIsOpen(true);
      setIsTyping(true);
      if (!inputValue) {
        setFilteredOptions(options);
      }
      return; // Permitir que la tecla se procese normalmente
    }

    if (!isOpen && e.key !== 'ArrowDown' && e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Tab') return;

    switch (e.key) {
      case 'Tab':
        // Prevenir Tab inmediatamente si el dropdown está abierto
        if (isOpen) {
          e.preventDefault();
          
          // Si hay una opción seleccionada (autocompletado), seleccionarla y continuar con Tab
          if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
            const selectedOption = filteredOptions[selectedIndex];
            onChange(selectedOption.value, selectedOption.label);
            setInputValue("");
            setIsOpen(false);
            setIsTyping(false);
            setSelectedIndex(-1);
            
            // Permitir que el Tab natural continúe al siguiente campo
            setTimeout(() => {
              if (ref.current) {
                ref.current.blur();
                // Buscar el siguiente elemento focusable
                const focusableElements = document.querySelectorAll(
                  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                const currentIndex = Array.from(focusableElements).indexOf(ref.current);
                const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
                if (nextElement) {
                  nextElement.focus();
                }
              }
            }, 10);
            return;
          } else {
            // Si el dropdown está abierto pero no hay selección, cerrarlo y continuar
            setIsOpen(false);
            setIsTyping(false);
            setSelectedIndex(-1);
            
            // Continuar al siguiente campo
            setTimeout(() => {
              if (ref.current) {
                ref.current.blur();
                const focusableElements = document.querySelectorAll(
                  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                const currentIndex = Array.from(focusableElements).indexOf(ref.current);
                const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
                if (nextElement) {
                  nextElement.focus();
                }
              }
            }, 10);
          }
        }
        // Si dropdown está cerrado, permitir Tab normal
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          if (!inputValue) {
            setFilteredOptions(options);
          }
        } else {
          setSelectedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      
      case 'Enter':
        e.preventDefault();
        if (isOpen && selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          const selectedOption = filteredOptions[selectedIndex];
          onChange(selectedOption.value, selectedOption.label);
          setInputValue("");
          setIsOpen(false);
          setIsTyping(false);
          setSelectedIndex(-1);
          
          // Pasar al siguiente campo después de Enter
          setTimeout(() => {
            if (ref.current) {
              ref.current.blur();
              const focusableElements = document.querySelectorAll(
                'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
              );
              const currentIndex = Array.from(focusableElements).indexOf(ref.current);
              const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
              if (nextElement) {
                nextElement.focus();
              }
            }
          }, 10);
        } else if (isOpen && filteredOptions.length > 0) {
          // Si Enter y está abierto pero no hay índice seleccionado, seleccionar el primero
          const firstOption = filteredOptions[0];
          onChange(firstOption.value, firstOption.label);
          setInputValue("");
          setIsOpen(false);
          setIsTyping(false);
          setSelectedIndex(-1);
          
          // Pasar al siguiente campo
          setTimeout(() => {
            if (ref.current) {
              ref.current.blur();
              const focusableElements = document.querySelectorAll(
                'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
              );
              const currentIndex = Array.from(focusableElements).indexOf(ref.current);
              const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
              if (nextElement) {
                nextElement.focus();
              }
            }
          }, 10);
        } else if (!isOpen) {
          // Si Enter y no está abierto, abrir dropdown
          setIsOpen(true);
          if (!inputValue) {
            setFilteredOptions(options);
          }
        }
        break;
      
      case ' ': // Espacio
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
          if (!inputValue) {
            setFilteredOptions(options);
          }
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setInputValue("");
        setIsTyping(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (!isDisabled && !isOpen) {
      // Al recibir foco, preparar para escritura pero no abrir aún
      // Se abrirá cuando empiece a escribir
    }
  };

  const handleInputBlur = () => {
    // No hacer nada aquí para evitar conflictos con Tab
  };

  return (
    <div className={`searchable-select-container ${className ?? ""}`}>
      {label && <label className="searchable-select-label">{label}</label>}
      
      <div 
        className={`searchable-select ${isDisabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={handleContainerClick}
      >
      <input
        ref={inputRef ?? inputRefLocal}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          disabled={isDisabled}
          className="searchable-select-input"
          aria-invalid={ariaInvalid ? true : undefined}
        />
        
        <div className="searchable-select-indicators">

          <div className={`searchable-select-arrow ${isOpen ? 'open' : ''}`}>
            <FaChevronDown fontSize={8} />
          </div>
        </div>
      </div>
      
      {/* Renderizar el dropdown en un portal para que salga de cualquier contenedor */}
      {isOpen && createPortal(
        <div 
          className="searchable-select-dropdown"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {isLoading ? (
            <div className="searchable-select-loading">Cargando...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`searchable-select-option ${
                  option.value === value ? 'selected' : ''
                } ${
                  index === selectedIndex ? 'highlighted' : ''
                }`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="searchable-select-no-options">{resolvedNoOptionsMessage}</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
