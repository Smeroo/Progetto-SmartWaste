"use client";

import React, { useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare';

// MapComponent displays a Leaflet map with markers for collection points fetched from the API
const MapComponent: React.FC = () => {
    useEffect(() => {
        let map: any = null; // Reference to the Leaflet map instance

        const initializeMap = async () => {
            if (typeof window !== 'undefined') {
                const L = (await import('leaflet')).default;

                // Custom icon for map markers (green for eco-friendly theme)
                // Custom green icon for eco-friendly theme
		const customIcon = new L.Icon({
    		iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    		iconSize: [25, 41],
    		iconAnchor: [12, 41],
    		popupAnchor: [1, -34],
    		shadowSize: [41, 41]
		});

                // Prevent re-initialization if map already exists
                const mapContainer = document.getElementById('map');
                if (mapContainer && (mapContainer as any)._leaflet_id) {
                    return;
                }

                // Initialize the map centered on Italy
                map = L.map('map', {
                    zoomControl: true,
                    dragging: false,
                    scrollWheelZoom: false,
                }).setView([43.1381, 13.0684], 6);

                // Add dark tile layer
                L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                    minZoom: 3,
                    maxZoom: 17,
                    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(map);

                // Fetch collection points and add markers to the map
                const fetchCollectionPoints = async () => {
                    try {
                        const response = await fetch('/api/collection-points');
                        const data = await response.json();
                        
                        // Ensure data is an array
                        const collectionPoints = Array.isArray(data) ? data : (data.collectionPoints || []);

                        collectionPoints.forEach((point: any) => {
                            const { latitude, longitude } = point.address || {};
                            if (latitude && longitude) {
                                // Popup content for each marker
                                const popupContent = `
                                    <div class="flex gap-3">
                                        <a id="point-link" href="/collection-points/${point.id}" target="_blank" class="flex justify-center items-center aspect-square size-12 bg-stone-100 hover:bg-emerald-500 shadow-sm border-1 border-stone-900/10 rounded-md transition">
                                            ${ReactDOMServer.renderToString(<FontAwesomeIcon icon={faArrowUpRightFromSquare} />)}
                                        </a>
                                        <div class="flex flex-col">
                                            <h2 class="font-bold text-lg m-0">${point.name}</h2>
                                            <p style="margin: 0" class="text-stone-600">
                                                ${point.address?.number != null ? `${point.address?.street} ${point.address.number}` : `${point.address?.street}`}, ${point.address?.city}
                                            </p>
                                        </div>
                                    </div>
                                `;
                                L.marker([latitude, longitude], { icon: customIcon })
                                    .addTo(map)
                                    .bindPopup(popupContent);
                            }
                        });
                    } catch (error) {
                        console.error('Failed to fetch collection points:', error);
                    }
                };

                fetchCollectionPoints();

                // Enable map controls (drag/zoom) on map click
                const enableControls = () => {
                    map?.scrollWheelZoom.enable();
                    map?.dragging.enable();
                };

                // Disable map controls when clicking outside
                const resetControls = () => {
                    map?.scrollWheelZoom.disable();
                    map?.dragging.disable();
                };

                // Listen for clicks outside the map to reset controls
                const handleClickOutside = (event: MouseEvent) => {
                    if (!(event.target as HTMLElement).closest('#map')) {
                        resetControls();
                        document.removeEventListener('click', handleClickOutside);
                    }
                };

                map.on('click', () => {
                    enableControls();
                    document.addEventListener('click', handleClickOutside);
                });
            }
        };

        initializeMap();

        // Clean up the map when the component is unmounted
        return () => {
            if (map) {
                map.remove();
                map = null;
            }
        };
    }, []);

    return (
        <div className="flex w-full h-full">
            {/* Map container for Leaflet */}
            <div id="map" className="w-full h-full rounded-2xl shadow-sm"></div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });