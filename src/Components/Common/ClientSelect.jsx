import { useState, useRef, useEffect } from "react";
import { useAuth } from '../../Context/AuthContext'

export default function ClientSelect({ ref, defaultVal, value, onChange, onAddNewClient }) {
    const [query, setQuery] = useState(defaultVal || "");
    const [filteredClients, setFilteredClients] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedId, setSelectedId] = useState(null);
    const containerRef = useRef(null);
    
    const { apiFetch } = useAuth();
    
    useEffect(() => {
        if (!value) return;
        
        const fetchClient = async () => {
            try {
                const res = await apiFetch(`/api/clients/${encodeURIComponent(value)}`);
                const data = await res.data;
                
                handleSelect(data);
            } catch (err) {
                console.error("Failed to fetch client by ID:", err);
            }
        };
        
        fetchClient();
    }, [value]);
    
    const handleInputChange = async (e) => {
        const val = e.target.value;
        setQuery(val);
        setHighlightedIndex(-1);
        setSelectedId(null);
        
        if (!val) {
            setFilteredClients([]);
            return;
        }
        
        try {
            const res = await apiFetch(`/api/clients/search?q=${encodeURIComponent(val)}`);
            const data = await res.data;
            
            setFilteredClients(data);
        } catch (err) {
            console.error("Client search failed:", err);
        }
    };
    
    const handleSelect = (client) => {
        console.log("Selected;", client);
        
        onChange(client.client_id);
        
        setQuery(client.name);
        setFilteredClients([]);
        setSelectedId(client.client_id);
    };
    
    const handleKeyDown = (e) => {
        if (!filteredClients.length) return;
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            
            setHighlightedIndex((prev) => (prev + 1) % filteredClients.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            
            setHighlightedIndex((prev) =>
                prev <= 0 ? filteredClients.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            
            if (highlightedIndex >= 0) {
                handleSelect(filteredClients[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setFilteredClients([]);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setFilteredClients([]);
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
                placeholder="ابحث عن عميل..."
                className="w-full p-2 border rounded-lg"
                ref={ref}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onInvalid={(e) => e.target.setCustomValidity("الرجاء اختيار عميل")}
                onInput={(e) => e.target.setCustomValidity("")}
            />
            
            {filteredClients.length > 0 && (
                <div className="absolute z-50 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                    {filteredClients.map((c, index) => (
                        <div
                            key={c.client_id}
                            
                            className={`cursor-pointer px-3 py-3 text-gray-800 ${
                                index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                            }`}
                            
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onClick={() => handleSelect(c)}
                        >
                            {c.name}
                        </div>
                    ))}
                </div>
            )}
            
            {filteredClients.length === 0 && query.trim() && !selectedId && (
                <div className="absolute z-50 w-full bg-white border rounded-lg mt-1 shadow-lg">
                    <button
                        type="button"
                        className="w-full text-left px-3 py-3 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                            onAddNewClient(query);
                            setQuery("");
                            setSelectedId(null);
                        }}
                    >
                        إضافة عميل جديد: "{query}"
                    </button>
                </div>
            )}
        </div>
    );
}
