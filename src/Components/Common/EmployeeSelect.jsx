import { useState, useRef, useEffect } from "react";

import { useAuth } from "../../Context/AuthContext";

export default function EmployeeSelect({ ref, defaultVal, value, onChange }) {
    const [query, setQuery] = useState(defaultVal || "");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    
    const { apiFetch } = useAuth();
    
    useEffect(() => {
        if (!defaultVal) return;
        
        const fetchEmployee = async () => {
            try {
                const res = await apiFetch(`/api/employees/${encodeURIComponent(defaultVal)}`);
                const data = await res.data;
                
                handleSelect(data);
            } catch (err) {
                console.error("Failed to fetch employee by ID:", err);
            }
        };
        
        fetchEmployee();
    }, [defaultVal]);
    
    const handleInputChange = async (e) => {
        const val = e.target.value;
        setQuery(val);
        setHighlightedIndex(-1); // reset highlight
        
        if (!val) {
            setFilteredEmployees([]);
            return;
        }
        
        try {
            const res = await apiFetch(`/api/employees/search?q=${encodeURIComponent(val)}`);
            const data = await res.data;
            
            setFilteredEmployees(data);
        } catch (err) {
            console.error("Employee search failed:", err);
        }
    };
    
    const handleSelect = (employee) => {
        onChange(employee.employee_id);
        setQuery(employee.name);
        setFilteredEmployees([]);
    };

    const handleKeyDown = (e) => {
        if (!filteredEmployees.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % filteredEmployees.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev <= 0 ? filteredEmployees.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                handleSelect(filteredEmployees[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setFilteredEmployees([]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setFilteredEmployees([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                type="text"
                required
                placeholder="ابحث عن موظف..."
                className="w-full p-2 border rounded-lg"
                ref={ref}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onInvalid={(e) => e.target.setCustomValidity("الرجاء اختيار موظف")}
                onInput={(e) => e.target.setCustomValidity("")}
            />

            {filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                    {filteredEmployees.map((e, index) => (
                        <div
                            key={e.employee_id}
                            className={`cursor-pointer px-3 py-3 text-gray-800 ${
                                index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                            }`}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onClick={() => handleSelect(e)}
                        >
                            {e.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
