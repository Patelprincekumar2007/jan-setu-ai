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
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)]">
      {/* Sub-header ribbon */}
      <div className="w-full bg-[#eff4ff] py-3 px-4 lg:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeff]">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#006a61] uppercase font-semibold">
            <span>Ward Spatial Registry</span>
            <span>/</span>
            <span className="text-[#0b1c30]">Dharashiv District</span>
            <span className="px-1.5 py-0.2 rounded bg-[#86f2e4] text-[#005049] text-[10px] font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Explore Community Issues
          </h1>
          <p className="text-[12px] text-[#45464d]">
            Geographic and thematic visualization of citizen-reported infrastructure issues correlated with public datasets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffffff] text-[#0b1c30] font-mono text-[12px] border border-[#dce9ff] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
            <span className="font-bold">312</span>
            <span className="text-[#76777d]">Telemetry Nodes Synced</span>
          </div>

          <button
            type="button"
            onClick={() => onShowToast('Density Re-calculated', 'Hex-bin density kernel updated across 12 wards.')}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#ffffff] text-[#0b1c30] hover:bg-[#eff4ff] transition-colors text-[12px] font-semibold border border-[#dce9ff] shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Data Density</span>
          </button>

          <button
            type="button"
            onClick={handleExportGeoJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#000000] text-[#ffffff] hover:bg-[#213145] transition-colors text-[12px] font-semibold shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Ward GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 60% Map / 40% Inspector */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 flex-1">
        {/* LEFT 60%: Interactive Map */}
        <div className="xl:col-span-7 flex flex-col relative bg-[#ffffff] overflow-hidden border-r border-[#e5eeff]">
          {/* Search & Map Layer Filters Bar (Absolute Top) */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex-1 flex items-center gap-2 bg-[#ffffff]/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[#76777d] text-[18px]">search</span>
                <input
                  className="bg-transparent w-full outline-none text-[13px] text-[#0b1c30] placeholder:text-[#76777d]"
                  placeholder="Search village, ward, pin code or facility..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] font-mono text-[10px] text-[#45464d] border border-[#dce9ff]">
                  GEO: 413501
                </span>
              </div>

              <div className="flex items-center bg-[#ffffff]/95 backdrop-blur-md rounded-lg shadow-md p-1 border border-[#dce9ff]">
                <button
                  type="button"
                  onClick={() => onShowToast('Recentered', 'Viewport centered to Ward 4 Primary Health Centre')}
                  className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] transition-colors"
                  title="Locate Center"
                >
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Basemap Switched', 'Switched between Satellite & Cadastral basemap')}
                  className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] transition-colors"
                  title="Toggle Basemap"
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Fullscreen Active', 'GIS canvas maximized')}
                  className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] transition-colors"
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
                className={`px-2.5 py-1 rounded text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all ${
                  activeLayers.reports
                    ? 'bg-[#131b2e] text-[#ffffff]'
                    : 'bg-[#ffffff]/90 text-[#45464d] border border-[#dce9ff]'
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
                className={`px-2.5 py-1 rounded text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all ${
                  activeLayers.jjm
                    ? 'bg-[#ffffff]/95 text-[#006a61] border border-[#006a61]'
                    : 'bg-[#ffffff]/90 text-[#45464d] border border-[#dce9ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] text-[#006a61]">
                  {activeLayers.jjm ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span>Jal Jeevan Mission Layer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayers((p) => ({ ...p, pmgsy: !p.pmgsy }))}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all ${
                  activeLayers.pmgsy
                    ? 'bg-[#ffffff]/95 text-[#ba1a1a] border border-[#ba1a1a]'
                    : 'bg-[#ffffff]/90 text-[#45464d] border border-[#dce9ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] text-[#ba1a1a]">
                  {activeLayers.pmgsy ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span>PMGSY Road Quality</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayers((p) => ({ ...p, health: !p.health }))}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all ${
                  activeLayers.health
                    ? 'bg-[#ffffff]/95 text-[#006a61] border border-[#006a61]'
                    : 'bg-[#ffffff]/90 text-[#45464d] border border-[#dce9ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] text-[#006a61]">
                  {activeLayers.health ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span>Public Health Facilities</span>
              </button>
            </div>
          </div>

          {/* Main Map Viewport */}
          <div className="relative w-full h-[520px] xl:h-full min-h-[580px] bg-[#dce9ff] overflow-hidden select-none">
            {/* Background Satellite/Road Layer */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300"
              style={{
                backgroundImage: `url('${ASSETS.mapBackground}')`,
                opacity: 0.88,
                transform: `scale(${zoomLevel})`,
              }}
            ></div>

            {/* SVG Vector Boundaries & Pipeline Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Ward Polygons */}
              <polygon
                className="text-[#006a61]/10"
                fill="currentColor"
                points="120,80 340,60 410,190 280,260 140,220"
                stroke="#006a61"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              ></polygon>
              <text className="fill-[#006a61] font-mono text-[11px] font-bold tracking-wider" x="210" y="150">
                WARD 04 (CIVIC SECTOR C)
              </text>

              <polygon
                className="text-[#131b2e]/5"
                fill="currentColor"
                points="340,60 590,90 640,240 410,190"
                stroke="#131b2e"
                strokeDasharray="2 2"
                strokeWidth="1.2"
              ></polygon>
              <text className="fill-[#45464d] font-mono text-[10px]" x="440" y="130">
                WARD 05 (ANAND NAGAR)
              </text>

              <polygon
                className="text-[#86f2e4]/15"
                fill="currentColor"
                points="140,220 280,260 360,420 180,480 90,360"
                stroke="#006a61"
                strokeDasharray="3 3"
                strokeWidth="1"
              ></polygon>
              <text className="fill-[#45464d] font-mono text-[10px]" x="180" y="340">
                WARD 03 (RAILWAY EXT)
              </text>

              <polygon
                className="text-[#565e74]/5"
                fill="currentColor"
                points="280,260 410,190 560,330 460,460 360,420"
                stroke="#76777d"
                strokeDasharray="2 4"
                strokeWidth="1"
              ></polygon>
              <text className="fill-[#76777d] font-mono text-[10px]" x="390" y="310">
                SH-14 BYPASS CORRIDOR
              </text>

              {/* Water pipeline flow line */}
              <path
                d="M 160 110 L 260 160 L 320 220 L 410 240 L 490 320"
                fill="none"
                opacity="0.65"
                stroke="#264191"
                strokeDasharray="6 3"
                strokeLinecap="round"
                strokeWidth="2.5"
              ></path>
            </svg>

            {/* Interactive Markers on Map */}
            {MAP_MARKERS.map((marker) => {
              const isSelected = selectedMarkerId === marker.id;
              const [left, top] = marker.coordinates;

              return (
                <div
                  key={marker.id}
                  onClick={() => setSelectedMarkerId(marker.id)}
                  style={{ left: `${left}px`, top: `${top}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer group"
                >
                  {/* Selected Marker Pulse Rings */}
                  {isSelected && (
                    <>
                      <span className="absolute w-12 h-12 rounded-full bg-[#006a61]/20 animate-ping"></span>
                      <span className="absolute w-8 h-8 rounded-full bg-[#006a61]/40 animate-pulse"></span>
                    </>
                  )}

                  {/* Marker Circle */}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                      isSelected
                        ? 'bg-[#131b2e] text-[#86f2e4] ring-2 ring-[#006a61]'
                        : marker.category === 'Water'
                        ? 'bg-[#ffffff] text-[#006a61] border border-[#006a61]'
                        : marker.category === 'Roads'
                        ? 'bg-[#ffffff] text-[#ba1a1a] border border-[#ba1a1a]'
                        : marker.category === 'Healthcare'
                        ? 'bg-[#ffffff] text-[#006a61] border border-[#86f2e4]'
                        : 'bg-[#ffffff] text-[#0b1c30] border border-[#76777d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {marker.category === 'Water'
                        ? 'water_drop'
                        : marker.category === 'Roads'
                        ? 'add_road'
                        : marker.category === 'Healthcare'
                        ? 'local_hospital'
                        : 'bolt'}
                    </span>
                  </div>

                  {/* Popup card on selected or hover */}
                  {isSelected && (
                    <div className="mt-2 w-72 bg-[#ffffff] p-3 rounded-lg shadow-xl text-left border border-[#dce9ff] pointer-events-auto transform transition duration-150 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-1 border-b border-[#eff4ff]">
                        <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold">
                          Priority {marker.priority}/100
                        </span>
                        <span className="flex items-center gap-0.5 font-mono text-[11px] text-[#006a61] font-semibold">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Verified Match
                        </span>
                      </div>
                      <div className="font-semibold text-[13px] text-[#0b1c30] leading-tight mt-1.5">
                        {marker.title}
                      </div>
                      <p className="text-[11px] text-[#45464d] mt-1 line-clamp-2 leading-relaxed">
                        {marker.summary}
                      </p>
                      <div className="mt-2 pt-1 border-t border-[#eff4ff] flex items-center justify-between font-mono text-[11px] text-[#76777d]">
                        <span>GeoID: {marker.geoId}</span>
                        <span className="text-[#006a61] font-semibold hover:underline">
                          Inspecting →
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Controls */}
            <div className="absolute bottom-5 right-5 z-20 flex flex-col items-center bg-[#ffffff]/95 backdrop-blur rounded-lg shadow-lg border border-[#dce9ff] overflow-hidden">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                className="w-9 h-9 flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <div className="w-6 h-px bg-[#dce9ff]"></div>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
                className="w-9 h-9 flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <div className="w-6 h-px bg-[#dce9ff]"></div>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="w-9 h-9 flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
                title="Reset Orientation"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
              </button>
            </div>

            {/* Map Legend Floating Card (Bottom Left) */}
            <div className="absolute bottom-5 left-5 z-20 bg-[#ffffff]/95 backdrop-blur-md p-3 rounded-lg shadow-lg border border-[#dce9ff] flex flex-col gap-1.5">
              <div className="text-[11px] uppercase font-semibold text-[#76777d]">
                Category Taxonomy
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                  <span className="text-[#0b1c30]">Water &amp; Drainage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                  <span className="text-[#0b1c30]">Roads &amp; Bridges</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#86f2e4] border border-[#006a61]"></span>
                  <span className="text-[#0b1c30]">Health Facilities</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0b1c30]"></span>
                  <span className="text-[#0b1c30]">Grid &amp; Power</span>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-[#eff4ff] flex items-center justify-between text-[10px] font-mono text-[#45464d]">
                <span>Projection: EPSG:3857</span>
                <span>Overlay: Ward Cadastre 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 40%: Filter & Issue Detail Inspector */}
        <div className="xl:col-span-5 bg-[#f8f9ff] p-4 lg:p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Active Filter Strip */}
          <div className="flex flex-col gap-2 bg-[#ffffff] p-3.5 rounded-xl shadow-xs border border-[#e5eeff]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                Active Filter Constraint
              </span>
              <button
                type="button"
                onClick={() => onShowToast('Filters Reset', 'Default Ward 4 filters restored.')}
                className="text-[11px] font-semibold text-[#006a61] hover:underline"
              >
                Reset All (3)
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#0b1c30] text-[12px] border border-[#dce9ff]">
                <span>Category: <strong>Water</strong></span>
                <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-[#ba1a1a]">
                  close
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#0b1c30] text-[12px] border border-[#dce9ff]">
                <span>District: <strong>Dharashiv</strong></span>
                <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-[#ba1a1a]">
                  close
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#86f2e4] text-[#005049] text-[12px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Evidence: Verified Only</span>
                <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-[#ba1a1a]">
                  close
                </span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#ffffff] p-3 rounded-lg shadow-xs border border-[#e5eeff] flex flex-col">
              <span className="text-[11px] text-[#45464d] font-semibold">Active Issues</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] text-[#0b1c30] font-bold font-mono">28</span>
                <span className="text-[11px] text-[#006a61]">in Ward 04</span>
              </div>
            </div>
            <div className="bg-[#ffffff] p-3 rounded-lg shadow-xs border border-[#e5eeff] flex flex-col">
              <span className="text-[11px] text-[#45464d] font-semibold">Linked to Datasets</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] text-[#006a61] font-bold font-mono">19</span>
                <span className="text-[11px] text-[#006a61]">67.8%</span>
              </div>
            </div>
            <div className="bg-[#ffffff] p-3 rounded-lg shadow-xs border border-[#e5eeff] flex flex-col">
              <span className="text-[11px] text-[#45464d] font-semibold">Awaiting Records</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] text-[#ba1a1a] font-bold font-mono">09</span>
                <span className="text-[11px] text-[#76777d]">Uncorroborated</span>
              </div>
            </div>
          </div>

          {/* Selected Active Issue Dossier */}
          <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-3 relative">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-[#eff4ff]">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold">
                  {selectedMarker.severity}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] text-[11px] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Verified Source Match</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#76777d]">ID: CIV-2024-8842</span>
            </div>

            <div>
              <h2 className="font-bold text-[18px] text-[#0b1c30] tracking-tight">
                {selectedMarker.title}
              </h2>
              <div className="flex items-center gap-1.5 text-[#76777d] text-[12px] mt-0.5">
                <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                  location_on
                </span>
                <span>Dharashiv Urban Sector 4, Near Taluka Krishi Market</span>
              </div>
              <p className="text-[13px] text-[#45464d] mt-2 leading-relaxed bg-[#eff4ff] p-3 rounded-lg border border-[#dce9ff]">
                "No drinking water supply for 12 continuous days at the Primary Health Centre compound.
                Deep borewell has dried out completely. Expectant mothers and 85 surrounding
                residential quarters currently reliant on unverified private tanker dispatches."
              </p>
            </div>

            {/* Tripartite Priority Signal Composite Score */}
            <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1.5 border border-[#dce9ff]">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#0b1c30] font-semibold">
                  Priority Signal Composite Score
                </span>
                <span className="font-mono text-[14px] font-bold text-[#ba1a1a]">
                  {selectedMarker.priority} / 100
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#dce9ff] overflow-hidden flex">
                <div className="h-full bg-[#ba1a1a]" style={{ width: '45%' }}></div>
                <div className="h-full bg-[#006a61]" style={{ width: '32%' }}></div>
                <div className="h-full bg-[#131b2e]" style={{ width: '23%' }}></div>
              </div>
              <div className="grid grid-cols-3 text-[10px] font-mono text-[#45464d] pt-0.5">
                <span>Safety Hazard: 84</span>
                <span className="text-center">Vulnerability: 68</span>
                <span className="text-right">Deterioration: 64</span>
              </div>
            </div>

            {/* Grounding Datasets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                Grounding Datasets (RAG Verified)
              </span>

              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-[#006a61] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">dataset</span>
                    OGD-JJM-2024-MH-01
                  </span>
                  <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">
                    sim: 0.941
                  </span>
                </div>
                <p className="text-[12px] text-[#0b1c30] leading-snug">
                  Jal Jeevan Mission Dharashiv Portal reports <strong>50.76% tap water coverage</strong>{' '}
                  in Ward 4. Piped line connection sanctioned under Phase II remains marked 'In Progress'
                  since Aug 2023.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#76777d] mt-0.5">
                  <span>Agency: Dept of Drinking Water &amp; Sanitation</span>
                  <span>•</span>
                  <span
                    onClick={() => onNavigate('evidence-explorer')}
                    className="text-[#006a61] underline cursor-pointer font-semibold"
                  >
                    Inspect Schema
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-[#0b1c30] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                    NHM-INFRA-MH-2023
                  </span>
                  <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">
                    sim: 0.887
                  </span>
                </div>
                <p className="text-[12px] text-[#0b1c30] leading-snug">
                  National Health Mission facility audit registers PHC-DHA-04 as a Level-2 24x7 Delivery
                  Point with mandatory continuous potable water requirement.
                </p>
              </div>
            </div>

            {/* Corroboration & Verification Status */}
            <div className="flex items-center justify-between p-2.5 rounded bg-[#86f2e4]/30 border border-[#86f2e4]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {ASSETS.citizens.map((src, i) => (
                    <img
                      key={i}
                      alt="Citizen validator"
                      src={src}
                      className="inline-block h-6 w-6 rounded-full object-cover ring-1 ring-[#ffffff]"
                    />
                  ))}
                  <div className="h-6 w-6 rounded-full bg-[#d3e4fe] text-[#0b1c30] flex items-center justify-center font-mono text-[10px] font-bold ring-1 ring-[#ffffff]">
                    +{corroborateCount - 3}
                  </div>
                </div>
                <span className="text-[11px] text-[#0b1c30] font-semibold">
                  {corroborateCount} neighborhood confirmations within 400m
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#ffffff] font-mono text-[11px] text-[#006a61] font-semibold border border-[#dce9ff]">
                Radius Confirmed
              </span>
            </div>

            {/* Processing Cadence */}
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                Processing Cadence
              </span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                <div className="p-1 rounded bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff]">
                  <div className="font-semibold">3d ago</div>
                  <div className="text-[9px] text-[#76777d]">Reported</div>
                </div>
                <div className="p-1 rounded bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff]">
                  <div className="font-semibold">48h ago</div>
                  <div className="text-[9px] text-[#76777d]">AI Structured</div>
                </div>
                <div className="p-1 rounded bg-[#86f2e4] text-[#005049] font-semibold">
                  <div className="font-semibold">18h ago</div>
                  <div className="text-[9px]">JJM Linked</div>
                </div>
                <div className="p-1 rounded bg-[#131b2e] text-[#dae2fd] font-semibold">
                  <div className="font-semibold">Now</div>
                  <div className="text-[9px]">Reviewed</div>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('evidence-explorer')}
                className="flex-1 py-2 px-3 rounded bg-[#000000] text-[#ffffff] hover:bg-[#213145] transition-colors text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>View Full Evidence Dossier</span>
              </button>
              <button
                type="button"
                onClick={handleCorroborate}
                className="py-2 px-3 rounded bg-[#86f2e4] text-[#005049] hover:bg-[#89f5e7] transition-colors text-[12px] font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                <span>Corroborate (+1)</span>
              </button>
            </div>
          </div>

          {/* Spatial Cluster (Within 3km) */}
          <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#76777d] text-[18px]">hub</span>
                <span className="font-semibold text-[14px] text-[#0b1c30]">
                  Spatial Cluster (Within 3km)
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#45464d] font-medium">
                3 Linked Signals
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Cluster 1 */}
              <div
                onClick={() => setSelectedMarkerId('marker-anand-water')}
                className="p-2.5 rounded bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors cursor-pointer flex items-center justify-between border border-[#e5eeff]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#0b1c30] font-semibold">
                      Anand Nagar Sub-Sump Outflow Valve
                    </span>
                    <span className="text-[11px] text-[#76777d]">
                      1.2 km away • Reported 5 days ago
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] font-mono text-[11px] text-[#45464d] border border-[#dce9ff]">
                    Score: 58
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                    chevron_right
                  </span>
                </div>
              </div>

              {/* Cluster 2 */}
              <div
                onClick={() => setSelectedMarkerId('marker-sh14-road')}
                className="p-2.5 rounded bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors cursor-pointer flex items-center justify-between border border-[#e5eeff]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#0b1c30] font-semibold">
                      SH-14 Culvert Pipeline Rupture
                    </span>
                    <span className="text-[11px] text-[#76777d]">
                      2.1 km away • Reported 1 day ago
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] font-mono text-[11px] text-[#45464d] border border-[#dce9ff]">
                    Score: 81
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                    chevron_right
                  </span>
                </div>
              </div>

              {/* Cluster 3 */}
              <div
                onClick={() => setSelectedMarkerId('marker-railway-water')}
                className="p-2.5 rounded bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors cursor-pointer flex items-center justify-between border border-[#e5eeff]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#0b1c30] font-semibold">
                      Railway Colony Pump Electrical Trip
                    </span>
                    <span className="text-[11px] text-[#76777d]">
                      2.8 km away • Corroborated by 2
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] font-mono text-[11px] text-[#45464d] border border-[#dce9ff]">
                    Score: 64
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onShowToast(
                  'Kriging Spatial Model Executed',
                  'Fitted semivariogram: nugget 0.04, sill 0.88, range 3.4km. Hotspot clustered at Ward 4 PHC.'
                )
              }
              className="w-full py-2 rounded bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors text-[12px] font-semibold flex items-center justify-center gap-1.5 border border-[#dce9ff] cursor-pointer"
            >
              <span>Run Geostatistical Kriging Analysis</span>
              <span className="material-symbols-outlined text-[16px]">insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </LocalizedTree>
  );
};
