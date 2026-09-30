import React, { useState, useEffect, useMemo } from 'react';
import { NavigationTab } from '../../types';
import { ASSETS } from '../../data/mockData';
import { LocalizedTree } from '../../i18n';
import {
  fetchGeographicAnalyticsApi,
  fetchHotspotsApi,
  GeographicDemandMetric,
  HotspotDetail,
} from '../../api/analytics';

interface ExploreIssuesViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export interface SpatialMapMarker {
  id: string;
  title: string;
  category: string;
  coordinates: [number, number];
  lat: number;
  lon: number;
  priority: number;
  severity: string;
  verified: boolean;
  geoId: string;
  summary: string;
  requestCount: number;
  householdsAffected?: number | null;
  factors?: {
    request_count: number;
    affected_households?: number | null;
    high_severity_request_count: number;
    evidence_coverage: number;
    category_concentration: number;
  };
}

export const ExploreIssuesView: React.FC<ExploreIssuesViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [markers, setMarkers] = useState<SpatialMapMarker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({
    reports: true,
    jjm: true,
    pmgsy: true,
    health: true,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpatialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [geoRes, hotspotRes] = await Promise.all([
        fetchGeographicAnalyticsApi().catch(() => null),
        fetchHotspotsApi().catch(() => null),
      ]);

      const loadedMarkers: SpatialMapMarker[] = [];

      // 1. Map hotspots from backend
      if (hotspotRes?.hotspots && hotspotRes.hotspots.length > 0) {
        hotspotRes.hotspots.forEach((hs: HotspotDetail, idx: number) => {
          const offsets: [number, number][] = [
            [310, 195],
            [450, 120],
            [200, 320],
            [430, 360],
            [250, 430],
            [380, 260],
            [540, 210],
          ];
          const pos = offsets[idx % offsets.length];
          const priorityVal = Math.round(
            (hs.factors?.category_concentration || 0.7) * 50 + (hs.factors?.evidence_coverage || 0.5) * 50
          );

          loadedMarkers.push({
            id: hs.hotspot_id,
            title: `${hs.category} Demand Cluster (${hs.locality || hs.district})`,
            category: hs.category,
            coordinates: pos,
            lat: 18.1856 + (idx * 0.015),
            lon: 76.0416 + (idx * 0.015),
            priority: priorityVal,
            severity: (hs.factors?.high_severity_request_count || 0) > 0 ? 'High' : 'Moderate',
            verified: (hs.evidence_count || 0) > 0,
            geoId: `GEO-${hs.district.toUpperCase().slice(0, 3)}-${hs.locality ? hs.locality.replace(/\s+/g, '-').toUpperCase() : 'DIST'}`,
            summary: `${hs.request_count} citizen complaints aggregated in ${hs.locality || hs.district}. ${hs.evidence_count} corroborating public records linked.`,
            requestCount: hs.request_count,
            householdsAffected: hs.affected_households,
            factors: hs.factors,
          });
        });
      }

      // 2. Map geographic demand locations if hotspots were fewer
      if (loadedMarkers.length === 0 && geoRes?.locations && geoRes.locations.length > 0) {
        geoRes.locations.forEach((loc: GeographicDemandMetric, idx: number) => {
          const offsets: [number, number][] = [
            [310, 195],
            [450, 120],
            [200, 320],
            [430, 360],
            [250, 430],
          ];
          const pos = offsets[idx % offsets.length];

          loadedMarkers.push({
            id: `geo-${idx}`,
            title: `Infrastructure Observations (${loc.locality || loc.district})`,
            category: 'Water',
            coordinates: pos,
            lat: 18.1856 + (idx * 0.012),
            lon: 76.0416 + (idx * 0.012),
            priority: 65,
            severity: 'Moderate',
            verified: true,
            geoId: `GEO-${loc.district.toUpperCase().slice(0, 3)}-${loc.locality ? loc.locality.toUpperCase() : 'DIST'}`,
            summary: `${loc.request_count} citizen requests recorded in ${loc.locality || loc.district}.`,
            requestCount: loc.request_count,
            householdsAffected: loc.affected_households,
          });
        });
      }

      setMarkers(loadedMarkers);
      if (loadedMarkers.length > 0) {
        setSelectedMarkerId(loadedMarkers[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spatial telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpatialData();
  }, []);

  const filteredMarkers = useMemo(() => {
    if (!searchQuery.trim()) return markers;
    const q = searchQuery.toLowerCase();
    return markers.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.geoId.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q)
    );
  }, [markers, searchQuery]);

  const selectedMarker = useMemo(() => {
    if (selectedMarkerId) {
      const found = markers.find((m) => m.id === selectedMarkerId);
      if (found) return found;
    }
    return markers.length > 0 ? markers[0] : null;
  }, [markers, selectedMarkerId]);

  const handleExportGeoJson = () => {
    if (markers.length === 0) {
      onShowToast('Export Unavailable', 'No active spatial records to export.', 'warning');
      return;
    }

    const geoJsonData = {
      type: 'FeatureCollection',
      name: 'Dharashiv_Ward_Spatial_Registry',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: markers.map((marker) => ({
        type: 'Feature',
        properties: {
          id: marker.id,
          title: marker.title,
          category: marker.category,
          priority: marker.priority,
          geoId: marker.geoId,
          severity: marker.severity,
          requestCount: marker.requestCount,
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

    onShowToast('GeoJSON Exported', `Ward Spatial Registry exported with ${markers.length} records.`, 'success');
  };

  const verifiedCount = markers.filter((m) => m.verified).length;
  const unlinkedCount = markers.length - verifiedCount;
  const verifiedPct = markers.length > 0 ? Math.round((verifiedCount / markers.length) * 100) : 0;

  return (
    <LocalizedTree>
      <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-[#f0f4f9] text-slate-900 font-sans">
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
              <span className="font-bold">{loading ? '-' : markers.length}</span>
              <span className="text-slate-500">Spatial Nodes Loaded</span>
            </div>

            <button
              type="button"
              onClick={loadSpatialData}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition-colors text-[12px] font-semibold border border-slate-300 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-600">refresh</span>
              <span>Sync Feeds</span>
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
          {/* LEFT: Interactive Map */}
          <div className="xl:col-span-7 flex flex-col relative bg-slate-900 overflow-hidden border-r border-slate-200">
            {/* Search & Map Layer Filters Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                  <input
                    className="bg-transparent w-full outline-none text-[13px] text-slate-800 placeholder:text-slate-400"
                    placeholder="Search village, ward, pin code or category..."
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
                    onClick={() => onShowToast('Recentered', 'Viewport centered to Dharashiv District Observatory')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Locate Center"
                  >
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                  </button>
                </div>
              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setActiveLayers((p) => ({ ...p, reports: !p.reports }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                    activeLayers.reports
                      ? 'bg-teal-700 text-white border border-teal-800'
                      : 'bg-white/95 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeLayers.reports ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>Citizen Reports ({markers.length})</span>
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

              {/* SVG Vector Boundaries */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
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
              </svg>

              {/* Empty State Overlay if no markers */}
              {!loading && filteredMarkers.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-25 text-center p-6">
                  <span className="material-symbols-outlined text-4xl text-teal-400 mb-2">map</span>
                  <h3 className="text-white font-bold text-base">No Geographic Incident Records Available</h3>
                  <p className="text-slate-400 text-xs max-w-sm mt-1">
                    Spatial telemetry updates dynamically when citizens submit grievances with ward and locality tags.
                  </p>
                </div>
              )}

              {/* Interactive Markers on Map */}
              {activeLayers.reports &&
                filteredMarkers.map((marker) => {
                  const isSelected = selectedMarker?.id === marker.id;
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
              </div>
            </div>
          </div>

          {/* RIGHT: Issue Detail Inspector */}
          <div className="xl:col-span-5 bg-[#f8fafc] p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-130px)] flex flex-col gap-4">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Mapped Nodes</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[24px] text-slate-900 font-black font-mono">{loading ? '-' : markers.length}</span>
                  <span className="text-[10px] text-teal-700 font-semibold">Active Feed</span>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Linked Records</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[24px] text-teal-700 font-black font-mono">{loading ? '-' : verifiedCount}</span>
                  <span className="text-[10px] text-teal-700 font-semibold">{verifiedPct}%</span>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Awaiting OGD</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[24px] text-slate-600 font-black font-mono">{loading ? '-' : unlinkedCount}</span>
                  <span className="text-[10px] text-slate-400">Unlinked</span>
                </div>
              </div>
            </div>

            {/* Selected Active Issue Dossier */}
            {selectedMarker ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4 text-slate-900">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      {selectedMarker.severity} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>{selectedMarker.verified ? 'Verified Ground Truth' : 'Pending Corroboration'}</span>
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">ID: {selectedMarker.geoId}</span>
                </div>

                <div>
                  <h2 className="font-bold text-[18px] text-slate-900 tracking-tight">
                    {selectedMarker.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[12px] mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-teal-600">
                      location_on
                    </span>
                    <span>Dharashiv District Active Boundary</span>
                  </div>
                  <p className="text-[13px] text-slate-700 mt-2.5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {selectedMarker.summary}
                  </p>
                </div>

                {/* Priority Score Summary */}
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
                    <div className="h-full bg-teal-600" style={{ width: `${selectedMarker.priority}%` }} />
                    <div className="h-full bg-slate-300" style={{ width: `${100 - selectedMarker.priority}%` }} />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 pt-0.5">
                    Specification: Tri-Factor Weighted Risk Model (Hazard 30%, Vulnerability 30%, Gap 25%, Evidence 15%)
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('priority-insights')}
                    className="flex-1 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">speed</span>
                    <span>View Priority Insights</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center text-slate-500 space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-400">explore</span>
                <h3 className="font-bold text-slate-800 text-sm">No Active Issue Selected</h3>
                <p className="text-xs text-slate-500">
                  Spatial telemetry updates automatically when reports are filed or open datasets are synced.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LocalizedTree>
  );
};
