import { useState, useRef, useEffect } from "react";

import { useAuth } from '../../Context/AuthContext';

export default function ProjectSelect({ projectRef, value, onChange }) {
    const { apiFetch } = useAuth();
    
    const [projectNumber, setProjectNumber] = useState(value || "");
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    
    const handleInputChange = async (e) => {
        const val = e.target.value;
        
        setProjectNumber(val);
        setHighlightedIndex(-1);
        
        if (!val) {
            setFilteredProjects([]);
            return;
        }
        
        const q = val.toLowerCase();
        
        try {
            const res = await apiFetch(`/api/projects/search?q=${encodeURIComponent(q)}`);
            const data = await res.data;
            
            setFilteredProjects(data);
        } catch (err) {
            console.error("Project search failed:", err);
        }
    };
    
    const handleSelect = (project) => {
        setProjectNumber(project.number);
        onChange(project.project_id);
        setFilteredProjects([]);
    };
    
    const handleKeyDown = (e) => {
        if (!filteredProjects.length) return;
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % filteredProjects.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev <= 0 ? filteredProjects.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                handleSelect(filteredProjects[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setFilteredProjects([]);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setFilteredProjects([]);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    return (
        <div>
            <label className="block text-sm">رقم المشروع</label>
            <div className="relative w-full" ref={containerRef}>
                <input
                    /*required*/
                    type="text"
                    name="projectNumber"
                    className="w-full p-2 border rounded-lg"
                    autoComplete="off"
                    placeholder="ابحث عن مشروع..."
                    value={projectNumber}
                    ref={projectRef}
                    inputMode="numeric"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    pattern="^[0-9]{7}$"
                    /*onInvalid={(e) => e.target.setCustomValidity("الرجاء اختيار مشروع")}
                    onInput={(e) => e.target.setCustomValidity("")}*/
                />
                
                {filteredProjects.length > 0 && (
                    <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-md z-50 max-h-60 overflow-y-auto">
                        {filteredProjects.map((p, index) => (
                            <div
                                key={p.project_id}
                                className={`cursor-pointer px-3 py-3 text-gray-800 ${
                                    index === highlightedIndex
                                        ? "bg-gray-200"
                                        : "hover:bg-gray-100"
                                }`}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                onClick={() => handleSelect(p)}
                            >
                                {p.number}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
