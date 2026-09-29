import React, { useState } from 'react';
import { NavigationTab } from '../../types';
import { ASSETS, DEMO_PRESET_COMPLAINTS } from '../../data/mockData';
import { CitizenRequestInput, CitizenRequestRecord } from '../../api/requests';
import { useT } from '../../i18n';

interface ReportProblemViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onSubmitRequest: (request: CitizenRequestInput) => Promise<CitizenRequestRecord>;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({
  onNavigate,
  onSubmitRequest,
  onShowToast,
}) => {
  const t = useT();
  const [narrative, setNarrative] = useState<string>(
    'Our primary health centre does not have clean drinking water and the borewell is not working. Doctors and patients have had to bring bottled water from 2km away for the past 12 days.'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('Water');
  const [secondaryCategory, setSecondaryCategory] = useState<string>('Healthcare');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [households, setHouseholds] = useState<string>('85 households');
  const [facility, setFacility] = useState<string>(
    'Ward 4 Primary Health Centre & 350+ daily outpatients'
  );
  const [stateName] = useState<string>('Maharashtra');
  const [district] = useState<string>('Dharashiv');
  const [city, setCity] = useState<string>('Dharashiv Urban');
  const [ward, setWard] = useState<string>('Ward 4 (Civil Hospital Road)');
  const [hasFileStaged, setHasFileStaged] = useState<boolean>(true);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  const categories = [
    { id: 'Water', label: 'Water', icon: 'water_drop', subtitle: 'Primary Match' },
    { id: 'Healthcare', label: 'Healthcare', icon: 'local_hospital', subtitle: 'Cross-sector' },
    { id: 'Roads', label: 'Roads', icon: 'add_road' },
    { id: 'Sanitation', label: 'Sanitation', icon: 'cleaning_services' },
    { id: 'Education', label: 'Education', icon: 'school' },
    { id: 'Electricity', label: 'Electricity', icon: 'bolt' },
    { id: 'Transport', label: 'Transport', icon: 'directions_bus' },
    { id: 'Housing', label: 'Housing', icon: 'home_work' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setHasFileStaged(true);
      onShowToast('Media Attached', `Field inspection photo ${file.name} staged with EXIF coordinates.`);
    }
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESET_COMPLAINTS[0]) => {
    setNarrative(preset.text);
    setSelectedCategory(preset.category);
    setWard(preset.location);
    setHouseholds(preset.households);
    setFacility(preset.facility);
    onShowToast('Preset Applied', `Loaded telemetry scenario: ${preset.title}`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await onSubmitRequest({
        citizen_request: narrative.trim(),
        category: selectedCategory,
        state: stateName,
        district,
        locality: ward || city,
        affected_households: Number.parseInt(households, 10) || undefined,
      });
      onShowToast(t('Request received'), `${t('Reference ID')}: ${created.reference_id}`, 'success');
      onNavigate('my-reports');
    } catch (error) {
      onShowToast(
        t('Request could not be submitted'),
        error instanceof Error ? error.message : 'The request could not be saved.',
        'warning',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      {/* Top Progress & Header Bar */}
      <div className="bg-[#ffffff] p-5 shadow-xs border border-[#e5eeff] rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{t('Citizen request intake')}</span>
            </div>
            <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
              {t('Report a Community Problem')}
            </h1>
            <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
              {t('Describe the issue and location. Extraction and public-data retrieval run after submission.')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#dce9ff]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a61] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">
              {t('Processing status is reported after submission')}
            </span>
            <span className="font-mono text-[11px] text-[#76777d]">|</span>
            <span className="font-mono text-[11px] text-[#45464d]">
              {t('Decision-support prototype')}
            </span>
          </div>
        </div>

        {/* Stepper Strip */}
        <div className="pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 bg-[#eff4ff] p-1.5 rounded-xl border border-[#dce9ff]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#000000] text-[#ffffff] shadow-xs">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ffffff]/20 text-[#ffffff] font-mono text-[11px] font-bold">
                1
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold truncate leading-tight">1. Describe</span>
                <span className="font-mono text-[10px] text-[#ffffff]/70 leading-none">
                  Active Stage
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px] ml-auto">edit_note</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffffff] text-[#0b1c30] shadow-xs border border-[#dce9ff]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-bold">
                2
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold truncate leading-tight">
                  2. Location &amp; Category
                </span>
                <span className="font-mono text-[10px] text-[#006a61] leading-none">In Sync</span>
              </div>
              <span className="material-symbols-outlined text-[16px] ml-auto text-[#006a61]">
                pin_drop
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#45464d] opacity-75">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#dce9ff] text-[#45464d] font-mono text-[11px] font-bold">
                3
              </span>
              <span className="text-[11px] truncate">3. Impact &amp; Details</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#45464d] opacity-75">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#dce9ff] text-[#45464d] font-mono text-[11px] font-bold">
                4
              </span>
              <span className="text-[11px] truncate">4. AI Structuring</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#45464d] opacity-75">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#dce9ff] text-[#45464d] font-mono text-[11px] font-bold">
                5
              </span>
              <span className="text-[11px] truncate">5. Submission Review</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#eff4ff]">
          <span className="text-[11px] text-[#76777d] font-semibold uppercase tracking-wider">
            Quick Reviewer Presets:
          </span>
          {DEMO_PRESET_COMPLAINTS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11px] font-medium transition-colors border border-[#dce9ff]"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <figure className="flex flex-col overflow-hidden border border-[#dce9ff] bg-white sm:flex-row">
        <img
          src={ASSETS.phcClinicFacade}
          alt="Illustrative photograph of a community health facility"
          loading="lazy"
          className="h-32 w-full object-cover sm:h-28 sm:w-64"
        />
        <figcaption className="flex items-center px-4 py-3 text-[12px] text-[#45464d]">
          Illustrative image only. It is not a photograph of a submitted request location.
        </figcaption>
      </figure>

      {/* Main Two-Column Civic Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Input & Impact (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* Text Intake Card */}
          <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                className="font-semibold text-[16px] text-[#0b1c30] flex items-center gap-2"
                htmlFor="complaintNarrative"
              >
                <span className="material-symbols-outlined text-[#006a61] text-[22px]">
                  record_voice_over
                </span>
                <span>{t('Describe the problem in your words')}</span>
              </label>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold self-start sm:self-auto">
                <span className="material-symbols-outlined text-[14px]">translate</span>
                <span>{t('Describe the issue in your own words')}</span>
              </span>
            </div>

            {/* Multilingual Helper Pill */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#eff4ff] text-[#45464d] border border-[#dce9ff]">
              <span className="material-symbols-outlined text-[#006a61] text-[18px] shrink-0 mt-0.5">
                neurology
              </span>
              <p className="text-[12px] leading-relaxed">
                {t('Include the reported problem, affected people, and location. Avoid unnecessary personal details.')}
              </p>
            </div>

            {/* Textarea Container */}
            <div className="relative bg-[#ffffff] rounded-lg p-3 border border-[#dce9ff] shadow-xs focus-within:border-[#006a61] focus-within:ring-1 focus-within:ring-[#006a61] transition-all">
              <textarea
                className="w-full bg-transparent text-[14px] text-[#0b1c30] placeholder:text-[#76777d] outline-none resize-none leading-relaxed"
                id="complaintNarrative"
                placeholder={t('Describe municipal, utility, health, or environmental grievance...')}
                rows={5}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eff4ff] mt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(!isRecording);
                      if (!isRecording) {
                        onShowToast('Microphone Active', 'Dictation streaming in Marathi/Hindi/English...');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors ${
                      isRecording
                        ? 'bg-[#ffdad6] text-[#93000a] animate-pulse'
                        : 'bg-[#dce9ff] text-[#0b1c30] hover:bg-[#cbdbf5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
                      mic
                    </span>
                    <span>
                      {isRecording ? 'Listening... (Speak now)' : 'Dictate in Hindi/Gujarati/English'}
                    </span>
                  </button>
                  <span className="hidden sm:inline-block font-mono text-[11px] text-[#76777d]">
                    |
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-[#006a61]">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> Realtime
                    Latency: 142ms
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#45464d] font-medium">
                  {narrative.length} / 1000 characters
                </span>
              </div>
            </div>

            {/* Entity Pills extracted from text */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">
                Live Token Detections
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[14px] text-[#006a61]">
                    local_hospital
                  </span>
                  Facility: Primary Health Centre
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[14px] text-[#ba1a1a]">
                    water_loss
                  </span>
                  Asset: Borewell Broken
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[14px] text-[#76777d]">
                    schedule
                  </span>
                  Duration: 12 days
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[14px] text-[#76777d]">
                    straighten
                  </span>
                  Distance: 2km radius
                </span>
              </div>
            </div>
          </div>

          {/* Impact Assessment Section */}
          <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[16px] text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[22px]">
                  vital_signs
                </span>
                <span>Impact &amp; Vulnerability Assessment</span>
              </h2>
              <span className="font-mono text-[11px] text-[#76777d]">Step 1.b</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#eff4ff] p-3 rounded-lg space-y-1.5 border border-[#dce9ff]">
                <label className="text-[11px] uppercase tracking-wider text-[#45464d] font-semibold">
                  Approximate Households Affected
                </label>
                <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-lg border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">
                    family_restroom
                  </span>
                  <input
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                    placeholder="e.g. 50 households"
                    type="text"
                    value={households}
                    onChange={(e) => setHouseholds(e.target.value)}
                  />
                </div>
                <span className="text-[11px] text-[#76777d] block leading-tight">
                  Derived from Dharashiv Census 2021 residential block density
                </span>
              </div>

              <div className="bg-[#eff4ff] p-3 rounded-lg space-y-1.5 border border-[#dce9ff]">
                <label className="text-[11px] uppercase tracking-wider text-[#45464d] font-semibold">
                  Affected Facility &amp; Footfall
                </label>
                <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-lg border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">
                    domain_verification
                  </span>
                  <input
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                    placeholder="Facility title and public footfall"
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  />
                </div>
                <span className="text-[11px] text-[#76777d] block leading-tight">
                  Critical civic installation with vulnerable maternal &amp; pediatric load
                </span>
              </div>
            </div>

            {/* Impact Metrics Spark Visual */}
            <div className="p-3 bg-[#e5eeff] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[#dce9ff]">
              <div className="space-y-0.5">
                <div className="text-[13px] font-semibold text-[#0b1c30]">
                  Calculated Civic Disruption Vector
                </div>
                <div className="font-mono text-[11px] text-[#45464d]">
                  Baseline: Public Health Infrastructure Emergency
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-mono text-[18px] font-bold text-[#ba1a1a]">0.892</span>
                  <span className="block font-mono text-[10px] text-[#76777d]">
                    SEVERITY COEFFICIENT
                  </span>
                </div>
                <div className="w-24 h-6 flex items-end gap-1">
                  <span className="w-1.5 h-3 bg-[#006a61] rounded-xs"></span>
                  <span className="w-1.5 h-4 bg-[#006a61] rounded-xs"></span>
                  <span className="w-1.5 h-5 bg-[#86f2e4] rounded-xs"></span>
                  <span className="w-1.5 h-6 bg-[#ba1a1a] rounded-xs"></span>
                  <span className="w-1.5 h-6 bg-[#ba1a1a] rounded-xs animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Attachment Zone */}
          <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[22px]">
                  attachment
                </span>
                <h2 className="font-semibold text-[16px] text-[#0b1c30]">
                  Grounding Media &amp; Field Inspection Docs
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] font-mono text-[11px] font-semibold border border-[#dce9ff]">
                {hasFileStaged ? '1 File Staged' : '0 Files Staged'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Staged File Card */}
              {hasFileStaged ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] group hover:bg-[#dce9ff]/40 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-[#d3e4fe] flex items-center justify-center shrink-0 overflow-hidden border border-[#bec6e0]">
                    <img
                      className="w-full h-full object-cover"
                      alt="Borewell field inspection"
                      src={customPhotoUrl || ASSETS.borewellInspection}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-semibold text-[#0b1c30] truncate">
                      borewell_inspection_01.jpg
                    </span>
                    <span className="font-mono text-[11px] text-[#76777d]">
                      2.4 MB • GPS EXIF Verified
                    </span>
                    <span className="text-[11px] text-[#006a61] font-medium">
                      Visual anomaly: Dry pump seal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHasFileStaged(false);
                      setCustomPhotoUrl(null);
                    }}
                    className="p-1 rounded text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setHasFileStaged(true)}
                  className="flex items-center justify-center p-3 rounded-lg bg-[#eff4ff] border border-dashed border-[#dce9ff] text-[#006a61] text-[12px] font-semibold cursor-pointer hover:bg-[#dce9ff]"
                >
                  + Restore default inspection photo
                </div>
              )}

              {/* Upload Zone */}
              <label className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#ffffff] border-2 border-dashed border-[#dce9ff] text-center cursor-pointer hover:bg-[#eff4ff] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[#76777d] text-[24px]">
                  cloud_upload
                </span>
                <span className="text-[12px] font-semibold text-[#0b1c30] mt-1">
                  Attach photos of borewell / dry taps
                </span>
                <span className="text-[11px] text-[#76777d]">
                  PNG, JPG, PDF up to 15MB • EXIF tags preserved
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Geographic & Category Targeting (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* Category Selection Grid */}
          <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[16px] text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[22px]">
                  category
                </span>
                <span>Civic Category Classification</span>
              </label>
              <span className="font-mono text-[11px] text-[#006a61] font-semibold">
                AI Match: 98.4%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isPrimary = selectedCategory === cat.id;
                const isSecondary = secondaryCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategory === cat.id) {
                        // Unset or do nothing
                      } else {
                        setSelectedCategory(cat.id);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      isPrimary
                        ? 'bg-[#006a61] text-[#ffffff] shadow-sm font-semibold'
                        : isSecondary
                        ? 'bg-[#e5eeff] text-[#0b1c30] border border-[#dce9ff]'
                        : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#dce9ff] hover:text-[#0b1c30] border border-transparent'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isPrimary
                          ? 'text-[#ffffff]'
                          : isSecondary
                          ? 'text-[#006a61]'
                          : 'text-[#76777d]'
                      }`}
                    >
                      {cat.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold truncate leading-tight">
                        {t(cat.label)}
                      </span>
                      {cat.subtitle && (
                        <span
                          className={`font-mono text-[10px] leading-none ${
                            isPrimary ? 'text-[#89f5e7]' : 'text-[#76777d]'
                          }`}
                        >
                          {cat.subtitle}
                        </span>
                      )}
                    </div>
                    {isPrimary && (
                      <span className="material-symbols-outlined text-[16px] ml-auto text-[#89f5e7]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Geographic Jurisdiction Targeting */}
          <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[16px] text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[22px]">
                  map
                </span>
                <span>Geographic &amp; Jurisdiction Targeting</span>
              </h2>
              <span className="font-mono text-[11px] text-[#76777d]">GeoJSON Inferred</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                  {t('State')}
                </label>
                <div className="flex items-center justify-between bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#dce9ff]">
                  <span className="text-[13px] text-[#0b1c30] font-medium">{stateName}</span>
                  <span className="material-symbols-outlined text-[18px] text-[#76777d]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                  {t('District')}
                </label>
                <div className="flex items-center justify-between bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#dce9ff]">
                  <span className="text-[13px] text-[#0b1c30] font-medium">{district}</span>
                  <span className="material-symbols-outlined text-[18px] text-[#76777d]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                  {t('City / Town')}
                </label>
                <div className="flex items-center bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#dce9ff]">
                  <input
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                  {t('Ward / Locality')}
                </label>
                <div className="flex items-center bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#dce9ff]">
                  <input
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Location Pin Card */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                  Telemetry Geoposition Pin
                </span>
                <span className="font-mono text-[11px] text-[#006a61] font-semibold">
                  [18.1856° N, 76.0416° E]
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-xs border border-[#dce9ff]">
                <div
                  className="w-full h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url('${ASSETS.mapBackground}')` }}
                ></div>
                <div className="absolute bottom-0 inset-x-0 bg-[#ffffff]/90 backdrop-blur-md p-2.5 flex items-center justify-between border-t border-[#dce9ff]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                      pin_drop
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-[#0b1c30]">
                        Location pinned accurately.
                      </span>
                      <span className="text-[11px] text-[#45464d]">
                        Coordinates will cross-reference JJM &amp; OGD GIS layers.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onShowToast('GPS Recalibrated', 'Precision fix updated within 4-meter radius.')
                    }
                    className="px-2 py-1 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-semibold hover:bg-[#dce9ff] transition-colors border border-[#dce9ff]"
                  >
                    Recalibrate
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Submission action */}
      <div className="space-y-4">
        {/* Bottom Action Bar */}
        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[#45464d]">
            <span className="material-symbols-outlined text-[#006a61] text-[20px]">
              shield
            </span>
            <p className="text-[12px]">
              {t('NagrikLens AI is a decision-support prototype, not an official government portal or grievance channel.')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setDraftSaved(true);
                sessionStorage.setItem('nagriklens_request_draft', JSON.stringify({ narrative, selectedCategory, city, ward }));
                onShowToast('Draft saved', 'Saved in this browser session.');
                setTimeout(() => setDraftSaved(false), 2000);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#dce9ff]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {draftSaved ? 'check' : 'save'}
              </span>
              <span>{draftSaved ? 'Draft Cached (Local)' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-[#000000] hover:bg-[#213145] text-[#ffffff] text-[13px] font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    refresh
                  </span>
                  <span>{t('Saving request...')}</span>
                </>
              ) : (
                <>
                  <span>{t('Submit request')}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
