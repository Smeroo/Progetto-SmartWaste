"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HorizontalOptions from '@/components/HorizontalOptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faSpinner, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';

// This component renders the main page for listing available collectionPoints.
// It includes search, filter by price, and filter by typology functionalities.
const CollectionPoints = () => {
  // State variables for search, price filter, loading, selected typology, and UI toggles.
  const [searchState, setSearchState] = useState({ searchText: '', });
  const [priceFilterState, setPriceFilterState] = useState({ maxPrice: 300, });
  const [collectionPoints, setSpaces] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const [selectedTypology, setSelectedTypology] = useState<string>('All CollectionPoints');
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Stato per apertura/chiusura barra di ricerca
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false); // Stato per apertura/chiusura filtro prezzo

  // Timeout variables for debouncing search and filter toggles.
  let searchTimeout: NodeJS.Timeout;
  let filterTimeout: NodeJS.Timeout;

  // Handles toggling the search bar open/close with a slight delay to avoid UI conflicts.
  const handleSearchToggle = (isOpen: boolean) => {
    console.log(`%chandleSearchToggle called with isOpen: ${isOpen}`, 'color: green;');
    clearTimeout(searchTimeout); // Cancella eventuali timeout precedenti
    console.log('Previous searchTimeout cleared');
    searchTimeout = setTimeout(() => {
      console.log(`Search toggle executed: ${isOpen ? 'opened' : 'closed'}`);
      setIsSearchOpen(isOpen);

      if (isOpen) {
        const searchInput = document.getElementById('search-bar') as HTMLInputElement;
        searchInput?.focus(); // Imposta il focus sull'input
      }
    }, 100); // Ritardo di 100ms per evitare conflitti
  };

  // Handles toggling the price filter open/close with a slight delay to avoid UI conflicts.
  const handlePriceFilterToggle = (isOpen: boolean) => {
    clearTimeout(filterTimeout); // Cancella eventuali timeout precedenti
    filterTimeout = setTimeout(() => {
      console.log(
        `%cPrice filter ${isOpen ? 'opened' : 'closed'}`,
        `color: ${isOpen ? 'darkblue' : 'lightblue'};`
      );
      setIsPriceFilterOpen(isOpen);
    }, 100); // Ritardo di 100ms per evitare conflitti
  };

  // CollectionPoint interface defines the structure of a collectionPoint object.
  interface CollectionPoint {
    id: string;
    name: string;
    images: string[];
    address: {
      city: string;
      country: string;
    };
    avgRating: number;
    price: number;
  }

  // Mapping between UI typology names and backend values.
  const typologyMapping: Record<string, string> = {
    'All CollectionPoints': '',
    'Meeting Rooms': 'MEETING_ROOMS',
    'Private Offices': 'PRIVATE_OFFICES',
    'Common Areas': 'COMMON_AREAS',
    'Outdoor CollectionPoints': 'OUTDOOR_SPACES',
  };

  // Fetches collectionPoints from the backend API whenever filters or search change.
  useEffect(() => {
    async function fetchSpaces() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        const backendTypology = typologyMapping[selectedTypology];
        if (backendTypology) {
          queryParams.append('typology', backendTypology);
        }
        if (searchState.searchText) {
          queryParams.append('q', searchState.searchText);
        }
        queryParams.append('maxPrice', priceFilterState.maxPrice.toString());
        const res = await fetch(`/api/collectionPoints?${queryParams.toString()}`);
        const data = await res.json();
        setSpaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Errore nella fetch GET:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSpaces();
  }, [selectedTypology, searchState.searchText, priceFilterState.maxPrice]);

  return (
    <div id='home' className="overflow-y-auto">
      <section className="flex flex-col items-center pt-28 pb-5 px-5 sm:px-10 md:px-15 lg:px-20">

        {/* Mobile CollectionPoint Type Filter */}
        <div className="bg-stone-300 w-fit p-2 rounded-3xl sm:hidden">
          <HorizontalOptions
            options={['All CollectionPoints', 'Meeting Rooms', 'Private Offices', 'Common Areas', 'Outdoor CollectionPoints']}
            initialSelected={0}
            layout='grid'
            backgroundColor="bg-stone-100"
            optionClassName="px-5 h-full flex justify-center items-center text-xs"
            containerClassName="bg-stone-300 rounded-2xl w-full h-20 overflow-hidden grid"
            onOptionSelect={(option) => setSelectedTypology(option)} />
        </div>

        {/* All filters */}
        <div className='sm:static sm:bottom-0 sm:px-0 sm:justify-center sm:gap-5 z-20
                        fixed bottom-2 px-2 flex items-center w-full gap-0 mt-5 justify-between'>
          {/* Filter by type + Searchbar */}
          <div className="bg-stone-300 w-fit p-2 rounded-3xl flex gap-3 order-last sm:order-first"
            onBlur={() => handleSearchToggle(false)}
            tabIndex={0} // Makes the div focusable to detect blur
          >
            <HorizontalOptions
              options={['All CollectionPoints', 'Meeting Rooms', 'Private Offices', 'Common Areas', 'Outdoor CollectionPoints']}
              initialSelected={0}
              backgroundColor="bg-stone-100"
              optionClassName="px-5 h-full flex justify-center items-center text-xs md:text-sm lg:text-base"
              containerClassName="bg-stone-300 rounded-2xl w-full overflow-hidden hidden sm:grid
                                  "
              onOptionSelect={(option) => setSelectedTypology(option)} />

            <div className={`bg-stone-100 rounded-2xl flex transition-all duration-250
                             ${searchState.searchText ? 'w-42 sm:w-60 lg:w-80 pl-3' : 'w-10 sm:w-12'}
                             ${isSearchOpen ? 'w-42 sm:w-60 lg:w-80 pl-3' : ''}`}
              onMouseEnter={() => handleSearchToggle(true)}
              onMouseLeave={() => handleSearchToggle(false)}>
              <input
                type="text"
                placeholder="Cerca..."
                id="search-bar"
                className="w-full outline-0"
                onFocus={() => handleSearchToggle(true)} // Apre la barra di ricerca quando l'input riceve il focus
                onBlur={() => handleSearchToggle(false)} // Chiude la barra di ricerca quando l'input perde il focus
                onChange={(e) => setSearchState({ ...searchState, searchText: e.target.value })}
              />
              <button
                className="aspect-square size-10 sm:size-12 text-lg sm:text-2xl rounded-2xl"
                onClick={() => handleSearchToggle(!isSearchOpen)}
                aria-label="Toggle search bar"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {/* Filter by price range (expandable) */}
          <div
            className={`bg-stone-300 p-2 w-fit rounded-3xl items-center transition-all duration-250 text-sm sm:text-base flex group
               ${isPriceFilterOpen ? "gap-2" : ""}`}
            onBlur={() => handlePriceFilterToggle(false)}
            tabIndex={0} // Makes the div focusable to detect blur
            onMouseEnter={() => handlePriceFilterToggle(true)}
            onMouseLeave={() => handlePriceFilterToggle(false)}>
            <label
              className="w-18 flex justify-center items-center bg-stone-100 text-stone-900 font-medium whitespace-nowrap rounded-2xl h-10 sm:h-12 cursor-pointer"
              onClick={() => handlePriceFilterToggle(!isPriceFilterOpen)}>
              &#8804; {priceFilterState.maxPrice}€
            </label>
            <div
              className={`flex items-center h-full duration-150
              ${isPriceFilterOpen ? "delay-100" : " opacity-0 pointer-events-none"}`}>
              <label htmlFor="price-range" className="sr-only">
                Filter by maximum price
              </label>
              <input
                type="range"
                id="price-range"
                min={collectionPoints.length > 0 ? Math.min(...collectionPoints.map((collectionPoint) => collectionPoint.price)) : 0}
                max="300"
                step="20"
                value={priceFilterState.maxPrice}
                onChange={(e) =>
                  setPriceFilterState({ ...priceFilterState, maxPrice: Number(e.target.value) })
                }
                className={`transition-all duration-250
              ${isPriceFilterOpen ? "w-30 sm:w-28 lg:w-30" : "w-0"}`}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="h-[60vh] text-6xl flex justify-center items-center text-stone-600">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          </div>
        )}

        {/* Griglia Spazi */}
        <div className={`w-full pt-5 sm:pt-10
               grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5
               ${collectionPoints.length === 0 ? 'h-[65vh]' : ''}`}>

          {!loading && collectionPoints.length === 0 && (
            <p className="text-center text-balance text-stone-600 col-span-4">
              No collectionPoints available. Please try adjusting your search or typology filter.
            </p>)}

          {!loading && collectionPoints.map((collectionPoint) => (
            <Link href={`/collectionPoints/${collectionPoint.id}`} key={collectionPoint.id}
              className='w-full h-80 sm:h-100 bg-stone-100 col-span-1 md: overflow-hidden flex flex-col
                          rounded-4xl cursor-pointer shadow-sm hover:shadow-md 
                          hover:scale-105 active:scale-95 transition-all duration-150 ease-out'>
              <div className='w-full h-1/2 relative'>
                <Image
                  src={collectionPoint.images?.[0] || '/placeholder-image.jpg'}
                  alt={collectionPoint.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover rounded-t-4xl"
                />
              </div>

              <div className='w-full h-1/2 flex flex-col justify-between p-5'>
                {/* Informazioni come titolo e location */}
                <div>
                  <h3 className='font-bold text-base sm:text-xl'>{collectionPoint.name}</h3>
                  <p className='text-sm text-stone-600'>{collectionPoint.address.city}, {collectionPoint.address.country}</p>
                </div>

                {/* Stelle e prezzo in fondo */}
                <div className='flex flex-col sm:flex-row sm:justify-between items-end sm:items-center'>
                  <div className='flex items-center text-sm sm:text-lg text-yellow-400'>
                    {[...Array(Math.floor(collectionPoint.avgRating))].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                    {collectionPoint.avgRating % 1 !== 0 && <FontAwesomeIcon icon={faStarHalf} />}
                  </div>
                  <p className='flex font-bold text-lg sm:text-2xl'>{collectionPoint.price}€<span className='text-base align-super'>/day</span></p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section >
    </div >
  );
};

export default CollectionPoints;