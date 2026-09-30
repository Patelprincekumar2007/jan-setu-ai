import React, { useState } from 'react';
import { NavigationTab } from '../../types';
import { MAP_MARKERS, ASSETS } from '../../data/mockData';
import { LocalizedTree } from '../../i18n';

interface ExploreIssuesViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ExploreIssuesView: React.FC<ExploreIssuesViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('marker-phc');
  const [searchQuery, setSearchQuery] = useState<string>('Ward 4, Dharashiv Town');
  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({
    reports: true,
    jjm: true,
    pmgsy: true,
    health: true,
  });
  const [corroborateCount, setCorroborateCount] = useState<number>(4);
  const [hasCorroborated, setHasCorroborated] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedMarker = MAP_MARKERS.find((m) => m.id === selectedMarkerId) || MAP_MARKERS[0];

  const handleExportGeoJson = () => {
    const geoJsonData = {
      type: 'FeatureCollection',
      name: 'Dharashiv_Ward_Spatial_Registry',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: MAP_MARKERS.map((marker) => ({
        type: 'Feature',
        properties: {
          id: marker.id,
          title: marker.title,
          category: marker.category,
          priority: marker.priority,
          geoId: marker.geoId,
          severity: marker.severity,
        },
        geometry: {
          type: 'Point',
          coordinates: [marker.lon, marker.lat],
        },
      })),
    };

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJsonData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', 'Dharashiv-Ward-Telemetry.geojson');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('GeoJSON Exported', 'Ward Spatial Registry exported with 312 telemetry nodes.', 'success');
  };

  const handleCorroborate = () => {
    if (!hasCorroborated) {
      setCorroborateCount((prev) => prev + 1);
      setHasCorroborated(true);
      onShowToast(
        'Observation Corroborated (+1)',
        'Your cryptographic signature added to Ward 4 proximity cluster (Radius: 400m).',
        'success'
      );
    } else {
      onShowToast('Already Signed', 'You have already corroborated this incident.', 'info');
    }
  };

  return (
    <LocalizedTree>
      <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-[#f0f4f9] text-slate-900">
        {/* Sub-header ribbon */}
        <div className="w-full bg-white py-3.5 px-4 lg:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 shadow-2xs">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal-700 uppercase font-semibold">
              <span>Ward Spatial Registry</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-900 font-bold">Dharashiv District</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                LIVE TELEMETRY
              </span>
            </div>
            <h1 className="text-[22px] lg:text-[24px] font-bold text-slate-900 tracking-tight mt-0.5">
              Explore Community Issues
            </h1>
            <p className="text-[12px] text-slate-500">
              Geographic and thematic visualization of citizen-reported infrastructure issues correlated with public datasets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-800 font-mono text-[12px] border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
              <span className="font-bold">312</span>
              <span className="text-slate-500">Telemetry Nodes Synced</span>
            </div>

            <button
              type="button"
              onClick={() => onShowToast('Density Re-calculated', 'Hex-bin density kernel updated across 12 wards.')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition-colors text-[12px] font-semibold border border-slate-300 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-600">tune</span>
              <span>Data Density</span>
            </button>

            <button
              type="button"
              onClick={handleExportGeoJson}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white transition-all text-[12px] font-bold shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Ward GeoJSON</span>
            </button>
          </div>
        </div>

        {/* Main Grid: 60% Map / 40% Inspector */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-12 flex-1">
          {/* LEFT 60%: Interactive Map */}
          <div className="xl:col-span-7 flex flex-col relative bg-slate-900 overflow-hidden border-r border-slate-200">
            {/* Search & Map Layer Filters Bar (Absolute Top) */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                  <input
                    className="bg-transparent w-full outline-none text-[13px] text-slate-800 placeholder:text-slate-400"
                    placeholder="Search village, ward, pin code or facility..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-teal-700 border border-slate-200 font-bold">
                    GEO: 413501
                  </span>
                </div>

                <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onShowToast('Recentered', 'Viewport centered to Ward 4 Primary Health Centre')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Locate Center"
                  >
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Basemap Switched', 'Switched between Satellite & Cadastral basemap')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Toggle Basemap"
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Fullscreen Active', 'GIS canvas maximized')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Full View"
                  >
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() =>
                    setActiveLayers((p) => ({ ...p, reports: !p.reports }))
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                    activeLayers.reports
                      ? 'bg-teal-700 text-white border border-teal-800'
                      : 'bg-white/95 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeLayers.reports ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>Citizen Reports (28)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayers((p) => ({ ...p, jjm: !p.jjm }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                    activeLayers.jjm
                      ? 'bg-cyan-700 text-white border border-cyan-800'
                      : 'bg-white/95 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeLayers.jjm ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>Jal Jeevan Mission Layer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayers((p) => ({ ...p, pmgsy: !p.pmgsy }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                    activeLayers.pmgsy
                      ? 'bg-rose-700 text-white border border-rose-800'
                      : 'bg-white/95 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeLayers.pmgsy ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>PMGSY Road Quality</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayers((p) => ({ ...p, health: !p.health }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                    activeLayers.health
                      ? 'bg-emerald-700 text-white border border-emerald-800'
                      : 'bg-white/95 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeLayers.health ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>Public Health Facilities</span>
                </button>
              </div>
            </div>

            {/* Main Map Viewport */}
            <div className="relative w-full h-[520px] xl:h-full min-h-[580px] bg-[#071322] overflow-hidden select-none">
              {/* Background Satellite/Road Layer */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 opacity-60 mix-blend-luminosity"
                style={{
                  backgroundImage: `url('${ASSETS.mapBackground}')`,
                  transform: `scale(${zoomLevel})`,
                }}
              />

              {/* SVG Vector Boundaries & Pipeline Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Ward Polygons */}
                <polygon
                  className="text-[#00c49f]/15"
                  fill="currentColor"
                  points="120,80 340,60 410,190 280,260 140,220"
                  stroke="#00c49f"
                  strokeDasharray="4 3"
                  strokeWidth="1.5"
                />
                <text className="fill-[#2dd4bf] font-mono text-[11px] font-bold tracking-wider" x="210" y="150">
                  WARD 04 (CIVIC SECTOR C)
                </text>

                <polygon
                  className="text-[#38bdf8]/15"
                  fill="currentColor"
                  points="340,60 590,90 640,240 410,190"
                  stroke="#38bdf8"
                  strokeDasharray="2 2"
                  strokeWidth="1.2"
                />
                <text className="fill-[#94a3b8] font-mono text-[10px]" x="440" y="130">
                  WARD 05 (ANAND NAGAR)
                </text>

                <polygon
                  className="text-[#a855f7]/15"
                  fill="currentColor"
                  points="140,220 280,260 360,420 180,480 90,360"
                  stroke="#a855f7"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text className="fill-[#94a3b8] font-mono text-[10px]" x="180" y="340">
                  WARD 03 (RAILWAY EXT)
                </text>

                {/* Water pipeline flow line */}
                <path
                  d="M 160 110 L 260 160 L 320 220 L 410 240 L 490 320"
                  fill="none"
                  opacity="0.8"
                  stroke="#06b6d4"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Interactive Markers on Map */}
              {MAP_MARKERS.map((marker) => {
                const isSelected = selectedMarkerId === marker.id;
                const [left, top] = marker.coordinates;

                const colorMap: Record<string, string> = {
                  Water: '#06b6d4',
                  Roads: '#ef4444',
                  Healthcare: '#10b981',
                  Electricity: '#f59e0b',
                  Sanitation: '#10b981',
                };
                const color = colorMap[marker.category] || '#2dd4bf';

                return (
                  <div
                    key={marker.id}
                    onClick={() => setSelectedMarkerId(marker.id)}
                    style={{ left: `${left}px`, top: `${top}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer group"
                  >
                    {isSelected && (
                      <>
                        <span className="absolute w-12 h-12 rounded-full animate-ping opacity-50" style={{ backgroundColor: color }} />
                        <span className="absolute w-8 h-8 rounded-full animate-pulse opacity-75" style={{ backgroundColor: color }} />
                      </>
                    )}

                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-120 ${
                        isSelected
                          ? 'bg-[#08101d] text-white ring-2 ring-[#00c49f]'
                          : 'bg-[#0e1c30] text-white border border-[#1b3152]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]" style={{ color }}>
                        {marker.category === 'Water'
                          ? 'water_drop'
                          : marker.category === 'Roads'
                          ? 'add_road'
                          : marker.category === 'Healthcare'
                          ? 'local_hospital'
                          : 'bolt'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-2 w-72 bg-white text-slate-900 p-3.5 rounded-xl shadow-2xl text-left border border-slate-200 pointer-events-auto transform transition duration-150 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            Priority {marker.priority}/100
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-teal-700 font-semibold">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Verified Match
                          </span>
                        </div>
                        <div className="font-bold text-[13px] text-slate-900 leading-tight mt-1.5">
                          {marker.title}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {marker.summary}
                        </p>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between font-mono text-[10px] text-slate-400">
                          <span>GeoID: {marker.geoId}</span>
                          <span className="text-teal-700 font-semibold hover:underline cursor-pointer">
                            Inspecting →
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Map Controls */}
              <div className="absolute bottom-5 right-5 z-20 flex flex-col items-center bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                  className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
                <div className="w-6 h-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
                  className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <div className="w-6 h-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Reset Orientation"
                >
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                </button>
              </div>

              {/* Map Legend Floating Card (Bottom Left) */}
              <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 flex flex-col gap-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Category Taxonomy
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                    <span className="text-slate-800 font-medium">Water &amp; Drainage</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span className="text-slate-800 font-medium">Roads &amp; Bridges</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                    <span className="text-slate-800 font-medium">Health Facilities</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-slate-800 font-medium">Grid &amp; Power</span>
                  </div>
                </div>
                <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>EPSG:3857</span>
                  <span>Cadastre 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 40%: Filter & Issue Detail Inspector */}
          <div className="xl:col-span-5 bg-[#f8fafc] p-4 lg:p-6 flex flex-col gap-4 overflow-y-auto">
            {/* Active Filter Strip */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Active Filter Constraints
                </span>
                <button
                  type="button"
                  onClick={() => onShowToast('Filters Reset', 'Default Ward 4 filters restored.')}
                  className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Reset All (3)
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-[11px] border border-slate-200">
                  <span>Category: <strong className="text-slate-900">Water</strong></span>
                  <span className="material-symbols-outlined text-[13px] text-slate-400 cursor-pointer hover:text-rose-600">
                    close
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-[11px] border border-slate-200">
                  <span>District: <strong className="text-slate-900">Dharashiv</strong></span>
                  <span className="material-symbols-outlined text-[13px] text-slate-400 cursor-pointer hover:text-rose-600">
                    close
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Evidence Verified</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Active Issues</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[24px] text-slate-900 font-black font-mono">28</span>
                  <span className="text-[10px] text-teal-700 font-semibold">Ward 04</span>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Linked Records</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[24px] text-teal-700 font-black font-mono">19</span>
                  <span className="text-[10px] text-teal-700 font-semibold">67.8%</span>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Awaiting OGD</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[24px] text-rose-600 font-black font-mono">09</span>
                  <span className="text-[10px] text-slate-400">Unlinked</span>
                </div>
              </div>
            </div>

            {/* Selected Active Issue Dossier */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4 text-slate-900">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                    {selectedMarker.severity}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>Verified Source Match</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 font-bold">ID: CIV-2024-8842</span>
              </div>

              <div>
                <h2 className="font-bold text-[18px] text-slate-900 tracking-tight">
                  {selectedMarker.title}
                </h2>
                <div className="flex items-center gap-1.5 text-slate-600 text-[12px] mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-teal-600">
                    location_on
                  </span>
                  <span>Dharashiv Urban Sector 4, Near Taluka Krishi Market</span>
                </div>
                <p className="text-[13px] text-slate-700 mt-2.5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  "No drinking water supply for 12 continuous days at the Primary Health Centre compound.
                  Deep borewell has dried out completely. Expectant mothers and 85 surrounding
                  residential quarters currently reliant on unverified private tanker dispatches."
                </p>
              </div>

              {/* Photo Attachment Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 relative h-36">
                <img
                  src={ASSETS.phcClinicFacade}
                  alt="Primary Health Centre Facade"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="font-semibold">Ward 4 PHC Maternal Ward Entrance</span>
                  <span className="font-mono text-[10px] text-teal-300">EXIF: 18.1856°N, 76.0416°E</span>
                </div>
              </div>

              {/* Tripartite Priority Signal Composite Score */}
              <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col gap-1.5 border border-slate-200">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-800 font-bold">
                    Priority Signal Composite Score
                  </span>
                  <span className="font-mono text-[14px] font-black text-rose-600">
                    {selectedMarker.priority} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div className="h-full bg-rose-500" style={{ width: '45%' }} />
                  <div className="h-full bg-teal-500" style={{ width: '32%' }} />
                  <div className="h-full bg-sky-500" style={{ width: '23%' }} />
                </div>
                <div className="grid grid-cols-3 text-[10px] font-mono text-slate-500 pt-0.5">
                  <span>Safety Hazard: 84</span>
                  <span className="text-center">Vulnerability: 68</span>
                  <span className="text-right">Deterioration: 64</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCorroborate}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-bold border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-teal-600">thumb_up</span>
                  <span>Corroborate (+{corroborateCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('priority-insights')}
                  className="flex-1 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">speed</span>
                  <span>Dispatch Action</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizedTree>
  );
};
