'use client';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faClock, 
  faRecycle,
  faSearch,
  faFilter,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface Address {
  street: string;
  number?: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
}

interface WasteType {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface Schedule {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  openingTime?: string;
  closingTime?: string;
  isAlwaysOpen: boolean;
}

interface CollectionPoint {
  id: number;
  name: string;
  description?: string;
  address: Address;
  wasteTypes: WasteType[];
  schedule?: Schedule;
  accessibility: string;
  isActive: boolean;
}

const CollectionPointsPage = () => {
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all');

  // Fetch collection points
  useEffect(() => {
    const fetchCollectionPoints = async () => {
      try {
        const response = await fetch('/api/collection-points');
        const data = await response.json();
        setCollectionPoints(data);
        setFilteredPoints(data);
      } catch (error) {
        console.error('Error fetching collection points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionPoints();
  }, []);

  // Filter collection points
  useEffect(() => {
    let filtered = collectionPoints;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(point =>
        point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.address.street.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by waste type
    if (selectedWasteType !== 'all') {
      filtered = filtered.filter(point =>
        point.wasteTypes.some(type => type.name.toLowerCase() === selectedWasteType.toLowerCase())
      );
    }

    setFilteredPoints(filtered);
  }, [searchQuery, selectedWasteType, collectionPoints]);

  // Get waste type color
  const getWasteTypeColor = (name: string) => {
    const colors: { [key: string]: string } = {
      'Plastica': 'bg-yellow-400',
      'Carta': 'bg-blue-400',
      'Vetro': 'bg-green-500',
      'Organico': 'bg-amber-600',
      'Indifferenziato': 'bg-gray-500',
      'RAEE': 'bg-red-500',
    };
    return colors[name] || 'bg-stone-400';
  };

  // Format schedule
  const formatSchedule = (schedule?: Schedule) => {
    if (!schedule) return 'Orari non disponibili';
    if (schedule.isAlwaysOpen) return 'Sempre aperto';
    
    const days = [];
    if (schedule.monday) days.push('Lun');
    if (schedule.tuesday) days.push('Mar');
    if (schedule.wednesday) days.push('Mer');
    if (schedule.thursday) days.push('Gio');
    if (schedule.friday) days.push('Ven');
    if (schedule.saturday) days.push('Sab');
    if (schedule.sunday) days.push('Dom');

    const timeRange = schedule.openingTime && schedule.closingTime
      ? ` ${schedule.openingTime} - ${schedule.closingTime}`
      : '';

    return days.length > 0 ? `${days.join(', ')}${timeRange}` : 'Chiuso';
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-5 sm:px-10 md:px-15 lg:px-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-5">
          Punti di <span className="text-emerald-500">Raccolta</span>
        </h1>
        <p className="text-xl text-stone-600">
          Trova il punto di raccolta differenziata più vicino a te
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-stone-100 p-5 rounded-3xl mb-10 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Search Bar */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Cerca per città, via o nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-stone-300 
                       focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Waste Type Filter */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faFilter} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400"
            />
            <select
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-stone-300 
                       focus:border-emerald-500 focus:outline-none transition appearance-none cursor-pointer"
            >
              <option value="all">Tutti i tipi di rifiuto</option>
              <option value="plastica">Plastica</option>
              <option value="carta">Carta</option>
              <option value="vetro">Vetro</option>
              <option value="organico">Organico</option>
              <option value="indifferenziato">Indifferenziato</option>
              <option value="raee">RAEE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-5 text-stone-600">
        {loading ? (
          <p>Caricamento...</p>
        ) : (
          <p>
            <span className="font-bold text-emerald-600">{filteredPoints.length}</span> {filteredPoints.length === 1 ? 'punto trovato' : 'punti trovati'}
          </p>
        )}
      </div>

      {/* Collection Points Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
          <p className="mt-5 text-xl text-stone-600">Caricamento punti di raccolta...</p>
        </div>
      ) : filteredPoints.length === 0 ? (
        <div className="text-center py-20">
          <FontAwesomeIcon icon={faRecycle} className="text-8xl text-stone-300 mb-5" />
          <p className="text-2xl text-stone-600">Nessun punto di raccolta trovato</p>
          <p className="text-stone-500 mt-2">Prova a modificare i filtri di ricerca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoints.map((point) => (
            <div
              key={point.id}
              className="bg-stone-100 rounded-3xl p-6 shadow-md hover:shadow-xl 
                       transition-all duration-300 hover:-translate-y-2 group"
            >
              {/* Point Name */}
              <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-500 transition">
                {point.name}
              </h3>

              {/* Address */}
              <div className="flex items-start gap-3 mb-3 text-stone-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-emerald-500" />
                <div>
                  <p>{point.address.street} {point.address.number}</p>
                  <p>{point.address.zip} {point.address.city}</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-3 mb-4 text-stone-600">
                <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                <p className="text-sm">{formatSchedule(point.schedule)}</p>
              </div>

              {/* Waste Types */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-stone-700 mb-2">Rifiuti accettati:</p>
                <div className="flex flex-wrap gap-2">
                  {point.wasteTypes.map((type) => (
                    <span
                      key={type.id}
                      className={`${getWasteTypeColor(type.name)} px-3 py-1 rounded-full 
                               text-xs font-semibold text-stone-900 shadow-sm`}
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              {point.accessibility && (
                <p className="text-sm text-stone-600 mb-4">
                  ♿ {point.accessibility}
                </p>
              )}

              {/* View Details Button */}
              <Link
                href={`/collection-points/${point.id}`}
                className="flex items-center justify-between w-full px-4 py-3 
                         bg-emerald-500 text-stone-100 rounded-2xl font-semibold
                         hover:bg-emerald-600 transition-all duration-300
                         group-hover:scale-105"
              >
                <span>Dettagli</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPointsPage;