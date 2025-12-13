"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, LucideIcon } from "lucide-react";

interface CategorySearchAutocompleteProps {
    /** Lista de categorias disponíveis */
    categories: Record<string, readonly string[]> | Record<string, string[]>;
    /** Categoria selecionada atualmente */
    selectedCategory: string;
    /** Função chamada quando uma categoria é selecionada */
    onCategoryChange: (category: string) => void;
    /** Função chamada quando um item da categoria é selecionado */
    onItemSelect: (item: string) => void;
    /** Lista de itens já selecionados (para desabilitar) */
    selectedItems: string[];
    /** Placeholder para o campo de busca */
    searchPlaceholder?: string;
    /** Label para o campo de categoria */
    categoryLabel?: string;
    /** Ícone para exibir no header da categoria */
    categoryIcon?: LucideIcon;
    /** Máximo de resultados a exibir */
    maxResults?: number;
}

export default function CategorySearchAutocomplete({
    categories,
    selectedCategory,
    onCategoryChange,
    onItemSelect,
    selectedItems,
    searchPlaceholder = "Buscar...",
    categoryLabel = "Escolha de categorias:",
    categoryIcon: CategoryIcon,
    maxResults = 50,
}: CategorySearchAutocompleteProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Obtém os itens da categoria selecionada ou de todas as categorias
    const getCategoryItems = () => {
        if (selectedCategory) {
            return Array.isArray(categories[selectedCategory])
                ? [...(categories[selectedCategory] as readonly string[] | string[])]
                : [];
        }
        // Se não há categoria selecionada, retorna todos os itens de todas as categorias
        const allItems: Array<{ item: string; category: string }> = [];
        Object.entries(categories).forEach(([category, items]) => {
            const itemsArray = Array.isArray(items) ? [...(items as readonly string[] | string[])] : [];
            itemsArray.forEach((item) => {
                allItems.push({ item, category });
            });
        });
        return allItems;
    };

    const categoryItems = getCategoryItems();
    const isSearchingAllCategories = !selectedCategory;

    // Filtra os itens com base no termo de busca
    const filteredItems = (() => {
        const search = searchTerm.toLowerCase().trim();

        if (isSearchingAllCategories) {
            // Quando busca em todas as categorias, retorna array de objetos com item e categoria
            return (categoryItems as Array<{ item: string; category: string }>)
                .filter(({ item }) => {
                    if (!search) return false; // Sem busca, não mostra nada
                    return item.toLowerCase().includes(search);
                })
                .slice(0, maxResults);
        } else {
            // Quando busca em uma categoria específica, retorna array de strings
            return (categoryItems as string[])
                .filter((item) => {
                    if (!search) return true;
                    return item.toLowerCase().includes(search);
                })
                .slice(0, maxResults);
        }
    })();

    // Fecha o dropdown quando clica fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Foca no input quando uma categoria é selecionada ou quando busca está vazia
    useEffect(() => {
        if (searchInputRef.current && (selectedCategory || searchTerm)) {
            // Não força foco automaticamente para não atrapalhar o usuário
        }
    }, [selectedCategory, searchTerm]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setIsDropdownOpen(true);
        setHighlightedIndex(-1);
    };

    const handleItemClick = (item: string | { item: string; category: string }) => {
        const itemString = typeof item === 'string' ? item : item.item;
        if (!selectedItems.includes(itemString)) {
            onItemSelect(itemString);
            setSearchTerm("");
            setHighlightedIndex(-1);
            // Se estava buscando em todas as categorias, limpa a busca mas mantém aberto
            if (isSearchingAllCategories) {
                setIsDropdownOpen(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isDropdownOpen && filteredItems.length > 0 && e.key === "ArrowDown") {
            setIsDropdownOpen(true);
            return;
        }

        if (!isDropdownOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredItems.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    handleItemClick(filteredItems[highlightedIndex] as string | { item: string; category: string });
                } else if (filteredItems.length === 1) {
                    handleItemClick(filteredItems[0] as string | { item: string; category: string });
                }
                break;
            case "Escape":
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                searchInputRef.current?.blur();
                break;
        }
    };

    const clearCategory = () => {
        onCategoryChange("");
        setSearchTerm("");
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setHighlightedIndex(-1);
        searchInputRef.current?.focus();
    };

    return (
        <div className="space-y-2" ref={containerRef}>
            {/* Select de Categoria */}
            <div>
                <label className="text-xs sm:text-sm text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide block">
                    {categoryLabel}
                </label>
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            onCategoryChange(e.target.value);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
                        }}
                        className="text-[#111] flex h-11 w-full rounded-md border border-[#5f9ea0]/30 bg-white px-3 py-2 pr-10 text-sm sm:text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5f9ea0] focus:ring-offset-1"
                    >
                        <option value="">Selecione uma categoria</option>
                        {Object.keys(categories).map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f9ea0]/60 pointer-events-none" />
                </div>
            </div>

            {/* Campo de Busca - Sempre Visível */}
            <div className="mt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f9ea0]/60" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => {
                            if (searchTerm || selectedCategory) {
                                setIsDropdownOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedCategory ? searchPlaceholder : "Buscar em todas as categorias..."}
                        className="w-full h-10 pl-10 pr-9 rounded-md border border-[#5f9ea0]/30 bg-white text-sm text-[#111] placeholder:text-[#5f9ea0]/40 focus:outline-none focus:ring-2 focus:ring-[#5f9ea0] focus:ring-offset-1"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#5f9ea0]/10 transition-colors"
                            aria-label="Limpar busca"
                        >
                            <X className="w-3 h-3 text-[#5f9ea0]/60" />
                        </button>
                    )}
                </div>

                {/* Contador de resultados */}
                {searchTerm && filteredItems.length > 0 && (
                    <p className="mt-2 text-xs text-[#5f9ea0]/70">
                        {filteredItems.length} {filteredItems.length === 1 ? "resultado" : "resultados"}
                        {isSearchingAllCategories && " em todas as categorias"}
                    </p>
                )}
            </div>

            {/* Container de Resultados com Header Condicional */}
            {isDropdownOpen && (searchTerm || selectedCategory) && (
                <div className="mt-2 border border-[#5f9ea0]/20 rounded-lg bg-white shadow-sm overflow-hidden">
                    {/* Header da Categoria - Apenas quando categoria está selecionada */}
                    {selectedCategory && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-[#5f9ea0] to-[#5f9ea0]/80 px-3 sm:px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                {CategoryIcon && (
                                    <CategoryIcon className="w-4 h-4 text-white" />
                                )}
                                <span className="text-xs sm:text-sm font-semibold text-white">
                                    {selectedCategory}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={clearCategory}
                                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
                                aria-label="Fechar categoria"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    )}

                    {/* Lista de Resultados */}
                    <div
                        ref={dropdownRef}
                        className={`max-h-60 overflow-y-auto ${selectedCategory ? '' : 'p-3'}`}
                    >
                        {filteredItems.length === 0 ? (
                            <div className="p-4 text-center text-sm text-[#111]/60">
                                {searchTerm
                                    ? `Nenhum resultado encontrado para "${searchTerm}"`
                                    : selectedCategory
                                        ? "Digite para buscar nesta categoria"
                                        : "Digite para buscar em todas as categorias"}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 p-3">
                                {filteredItems.map((item, index) => {
                                    const itemString = isSearchingAllCategories
                                        ? (item as { item: string; category: string }).item
                                        : item as string;
                                    const itemCategory = isSearchingAllCategories
                                        ? (item as { item: string; category: string }).category
                                        : null;
                                    const isSelected = selectedItems.includes(itemString);
                                    const isHighlighted = index === highlightedIndex;

                                    return (
                                        <button
                                            key={isSearchingAllCategories ? `${itemCategory}-${itemString}` : itemString}
                                            type="button"
                                            onClick={() => handleItemClick(item)}
                                            disabled={isSelected}
                                            className={`text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-all ${isSelected
                                                ? "bg-[#5f9ea0]/20 text-[#111]/40 cursor-not-allowed line-through"
                                                : isHighlighted
                                                    ? "bg-[#5f9ea0] text-white shadow-sm"
                                                    : "bg-[#5f9ea0]/5 hover:bg-[#5f9ea0] hover:text-white text-[#111] border border-[#5f9ea0]/20 hover:border-[#5f9ea0]"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span>{itemString}</span>
                                                {itemCategory && (
                                                    <span className="text-[10px] opacity-70 mt-0.5">
                                                        {itemCategory}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

