'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import MapComponent from '@/components/MapComponent';
import ObserverProvider from '@/components/ObserverProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRecycle, 
  faMapMarkedAlt, 
  faLeaf, 
  faTrash,
  faLightbulb,
  faMobileAlt,
  faUsers,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const HomePage = () => {

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scrollTo = params.get("scrollTo");
      if (scrollTo) {
        const targetElement = document.getElementById(scrollTo);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    }
  }, []);

  return (
    <ObserverProvider>
      <div id='home' className="overflow-y-auto">
        {/* Landing Page */}
        <section className="h-screen w-full relative z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-700"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="absolute flex flex-col gap-5 text-stone-100
                          justify-center items-center text-center inset-5 sm:inset-10 md:inset-15 lg:inset-20">
            <FontAwesomeIcon icon={faRecycle} className="text-8xl md:text-9xl mb-5 animate-pulse" />
            <h1 className='font-bold text-balance text-4xl md:text-7xl lg:text-8xl'>
              Differenzia con <span className="text-yellow-300">Smart</span>
            </h1>
            <p className='text-balance text-lg sm:text-xl md:text-2xl lg:text-3xl w-full md:w-3/4 lg:w-2/3
                        md:motion-preset-slide-up md:motion-duration-300 md:motion-delay-300'>
              Trova i punti di raccolta più vicini, impara a smaltire correttamente i rifiuti e contribuisci a un futuro più sostenibile.
            </p>
            <div className="flex gap-5 mt-5">
              <Link 
                href="/collection-points"
                className="px-8 py-4 bg-stone-100 text-emerald-600 font-bold rounded-2xl text-lg
                         hover:bg-yellow-300 hover:text-stone-900 transition-all duration-300
                         hover:scale-110 active:scale-95 shadow-lg">
                Trova Punti Raccolta
              </Link>
              <Link 
                href="/waste-guide"
                className="px-8 py-4 bg-transparent border-2 border-stone-100 text-stone-100 font-bold rounded-2xl text-lg
                         hover:bg-stone-100 hover:text-emerald-600 transition-all duration-300
                         hover:scale-110 active:scale-95">
                Guida Rifiuti
              </Link>
            </div>
          </div>
        </section>

        {/* Funzionalità principali */}
        <section className="w-full flex flex-col mt-5 p-5 sm:p-10 md:p-15 lg:p-20 gap-5 sm:gap-10 md:gap-15 lg:gap-20">
          <div className='flex flex-col gap-5 md:gap-10 overflow-clip'>
            <h2 className='text-center text-3xl sm:text-5xl md:text-7xl font-bold
                          intersect-once intersect:motion-preset-slide-up motion-duration-300'>
              Come <span className='text-emerald-500'>Funziona</span>
            </h2>
            <p className='text-balance text-center text-base sm:text-xl md:text-2xl font-medium
                          intersect-once intersect:motion-preset-slide-up motion-duration-300 pb-1'>
              SmartWaste rende la raccolta differenziata semplice e accessibile a tutti
            </p>
          </div>

          {/* Griglia Features */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center'>
            {/* Feature 1 */}
            <div className='bg-stone-100 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300
                          hover:-translate-y-2 intersect:motion-preset-slide-up intersect-once'>
              <FontAwesomeIcon icon={faMapMarkedAlt} className="text-6xl text-emerald-500 mb-5" />
              <h3 className='font-bold text-2xl mb-3'>Mappa Interattiva</h3>
              <p className='text-stone-600'>Trova i punti di raccolta più vicini con la nostra mappa in tempo reale</p>
            </div>

            {/* Feature 2 */}
            <div className='bg-stone-100 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300
                          hover:-translate-y-2 intersect:motion-preset-slide-up intersect-once motion-delay-100'>
              <FontAwesomeIcon icon={faLightbulb} className="text-6xl text-yellow-500 mb-5" />
              <h3 className='font-bold text-2xl mb-3'>Guida Rifiuti</h3>
              <p className='text-stone-600'>Scopri come smaltire correttamente ogni tipo di rifiuto</p>
            </div>

            {/* Feature 3 */}
            <div className='bg-stone-100 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300
                          hover:-translate-y-2 intersect:motion-preset-slide-up intersect-once motion-delay-200'>
              <FontAwesomeIcon icon={faBell} className="text-6xl text-red-500 mb-5" />
              <h3 className='font-bold text-2xl mb-3'>Segnalazioni</h3>
              <p className='text-stone-600'>Segnala problemi sui punti di raccolta e aiuta la comunità</p>
            </div>

            {/* Feature 4 */}
            <div className='bg-stone-100 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300
                          hover:-translate-y-2 intersect:motion-preset-slide-up intersect-once motion-delay-300'>
              <FontAwesomeIcon icon={faUsers} className="text-6xl text-blue-500 mb-5" />
              <h3 className='font-bold text-2xl mb-3'>Comunità</h3>
              <p className='text-stone-600'>Unisciti a una comunità impegnata per l&apos;ambiente</p>
            </div>
          </div>
        </section>

        {/* Tipologie di rifiuti */}
        <section className="w-full flex flex-col mt-5 p-5 sm:p-10 md:p-15 lg:p-20 gap-5 sm:gap-10 md:gap-15 lg:gap-20 bg-stone-100">
          <div className='flex flex-col gap-5 md:gap-10 overflow-clip'>
            <h2 className='text-center text-3xl sm:text-5xl md:text-7xl font-bold
                           intersect-once intersect:motion-preset-slide-up motion-duration-300'>
              Tipologie di <span className='text-emerald-500'>Rifiuti</span>
            </h2>
          </div>

          {/* Griglia Rifiuti */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5'>
            {/* Plastica */}
            <div className='bg-yellow-400 p-6 rounded-3xl text-center hover:scale-110 transition-all cursor-pointer
                          intersect:motion-preset-bounce intersect-once'>
              <div className='text-5xl mb-3'>🟨</div>
              <h3 className='font-bold text-xl text-stone-900'>Plastica</h3>
            </div>

            {/* Carta */}
            <div className='bg-blue-400 p-6 rounded-3xl text-center hover:scale-110 transition-all cursor-pointer
                          intersect:motion-preset-bounce intersect-once motion-delay-100'>
              <div className='text-5xl mb-3'>🟦</div>
              <h3 className='font-bold text-xl text-stone-100'>Carta</h3>
            </div>

            {/* Vetro */}
            <div className='bg-green-500 p-6 rounded-3xl text-center hover:scale-110 transition-all cursor-pointer
                          intersect:motion-preset-bounce intersect-once motion-delay-200'>
              <div className='text-5xl mb-3'>🟩</div>
              <h3 className='font-bold text-xl text-stone-100'>Vetro</h3>
            </div>

            {/* Organico */}
            <div className='bg-amber-600 p-6 rounded-3xl text-center hover:scale-110 transition-all cursor-pointer
                          intersect:motion-preset-bounce intersect-once motion-delay-300'>
              <div className='text-5xl mb-3'>🟫</div>
              <h3 className='font-bold text-xl text-stone-100'>Organico</h3>
            </div>

            {/* Indifferenziato */}
            <div className='bg-gray-500 p-6 rounded-3xl text-center hover:scale-110 transition-all cursor-pointer
                          intersect:motion-preset-bounce intersect-once motion-delay-[400ms]'>
              <div className='text-5xl mb-3'>⬛</div>
              <h3 className='font-bold text-xl text-stone-100'>Indifferenziato</h3>
            </div>

            {/* RAEE */}
            <div className='bg-red-500 p-6 rounded-3xl text-center hover:scale-110 transition-all cursor-pointer
                          intersect:motion-preset-bounce intersect-once motion-delay-500'>
              <div className='text-5xl mb-3'>🔴</div>
              <h3 className='font-bold text-xl text-stone-100'>RAEE</h3>
            </div>
          </div>
        </section>

        {/* Statistiche */}
        <section className="w-full p-5 sm:p-10 md:p-15 lg:p-20 bg-emerald-600 text-stone-100">
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-center'>
            <div className='intersect:motion-preset-slide-up intersect-once'>
              <div className='text-6xl font-bold mb-3'>98%</div>
              <p className='text-xl'>Tasso di riciclo</p>
            </div>
            <div className='intersect:motion-preset-slide-up intersect-once motion-delay-100'>
              <div className='text-6xl font-bold mb-3'>500+</div>
              <p className='text-xl'>Punti di raccolta</p>
            </div>
            <div className='intersect:motion-preset-slide-up intersect-once motion-delay-200'>
              <div className='text-6xl font-bold mb-3'>10k+</div>
              <p className='text-xl'>Utenti attivi</p>
            </div>
          </div>
        </section>

        {/* Map */}
        <section id='map-section' className="w-full flex flex-col
                     h-[45rem] lg:h-[65rem]
                     mt-5 p-5 sm:p-10 md:p-15 lg:p-20 pb-5 gap-5 sm:gap-10 md:gap-15 lg:gap-20">
          <div className='flex flex-col gap-5 md:gap-10 overflow-clip'>
            <h3 className='text-center sm:text-start text-3xl sm:text-5xl md:text-7xl font-bold
                           intersect-once md:intersect:motion-preset-slide-right-lg md:motion-duration-300'>
              <span className='text-emerald-500'>Trova</span> il Punto di Raccolta
            </h3>
            <p className='text-balance text-center sm:text-start text-base sm:text-xl md:text-2xl font-medium w-full lg:w-2/3
                          intersect-once md:intersect:motion-preset-slide-right-lg md:motion-duration-300 pb-1'>
              Localizza facilmente i punti di raccolta differenziata più vicini a te con la nostra mappa interattiva.
            </p>
          </div>

          <div className='w-full h-full intersect:motion-preset-focus-lg motion-duration-300 intersect-once'>
            <MapComponent />
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full p-10 sm:p-20 bg-gradient-to-r from-emerald-500 to-green-600 text-stone-100 text-center">
          <h2 className='text-4xl md:text-6xl font-bold mb-5'>Inizia Oggi!</h2>
          <p className='text-xl md:text-2xl mb-10'>Unisciti a migliaia di persone che fanno la differenza</p>
          <Link 
            href="/register"
            className="inline-block px-10 py-5 bg-stone-100 text-emerald-600 font-bold rounded-2xl text-xl
                     hover:bg-yellow-300 hover:text-stone-900 transition-all duration-300
                     hover:scale-110 active:scale-95 shadow-lg">
            Registrati Gratis
          </Link>
        </section>
      </div>
    </ObserverProvider >
  );
};

export default HomePage;