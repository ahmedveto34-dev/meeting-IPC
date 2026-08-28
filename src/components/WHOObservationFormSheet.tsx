import React from "react";
import { WHOObservationSession } from "../types";

interface WHOObservationFormSheetProps {
  session: WHOObservationSession;
  pageNumber?: string | number;
  totalPages?: string | number;
  hideHeaderBanner?: boolean;
}

export const WHOObservationFormSheet: React.FC<WHOObservationFormSheetProps> = ({
  session,
  pageNumber = "1",
  totalPages = "1",
  hideHeaderBanner = false,
}) => {
  // Ensure we have 4 columns
  const columns = Array.from({ length: 4 }).map((_, colIdx) => {
    const existingCol = session?.columns?.[colIdx];
    if (existingCol) return existingCol;
    return {
      id: `fallback-col-${colIdx + 1}`,
      columnNumber: colIdx + 1,
      profCatCode: colIdx === 0 ? "1.1" : colIdx === 1 ? "2.0" : colIdx === 2 ? "3.1" : "4.1",
      profCatName: colIdx === 0 ? "Nurse" : colIdx === 1 ? "Auxiliary" : colIdx === 2 ? "Medical Doctor" : "Other HCW",
      profMainCategory: (colIdx === 0 ? "1" : colIdx === 1 ? "2" : colIdx === 2 ? "3" : "4") as any,
      workersCount: 1,
      opportunities: Array.from({ length: 8 }).map((__, oppIdx) => ({
        id: `fallback-opp-${colIdx + 1}-${oppIdx + 1}`,
        oppNumber: oppIdx + 1,
        indications: [],
        action: "" as any,
        gloves: false,
      })),
    };
  });

  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "  /  /  ";
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      // If YYYY-MM-DD
      if (parts[0].length === 4) {
        return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
      }
      return `${parts[0]} / ${parts[1]} / ${parts[2]}`;
    }
    return dateStr;
  };

  return (
    <div className="who-observation-sheet w-full bg-white text-black font-sans text-left direction-ltr p-1 select-text">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. OFFICIAL WHO TOP ORANGE BANNER                             */}
      {/* ------------------------------------------------------------- */}
      {!hideHeaderBanner && (
        <div className="bg-[#E65100] text-white px-4 py-2.5 rounded-t-sm flex items-center justify-between border-b-2 border-[#BF360C]">
          
          {/* Left: WHO Logo + World Health Organization */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-[11px] leading-tight text-center shrink-0 bg-transparent">
              <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current text-white" aria-label="WHO Emblem">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" fill="none" />
                <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="50" cy="50" rx="30" ry="45" stroke="currentColor" strokeWidth="2" fill="none" />
                <ellipse cx="50" cy="50" rx="45" ry="30" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight leading-tight">
                World Health
              </div>
              <div className="text-base font-bold tracking-tight leading-none">
                Organization
              </div>
            </div>
          </div>

          {/* Middle Vertical Divider */}
          <div className="h-10 w-[1.5px] bg-white/60 mx-2" />

          {/* Center: Patient Safety */}
          <div className="text-left flex-1 px-1">
            <div className="text-base font-black tracking-tight leading-tight">
              Patient Safety
            </div>
            <div className="text-[10px] font-normal tracking-tight opacity-95">
              A World Alliance for Safer Health Care
            </div>
          </div>

          {/* Right Vertical Divider */}
          <div className="h-10 w-[1.5px] bg-white/60 mx-2" />

          {/* Right: SAVE LIVES Clean Your Hands */}
          <div className="text-left shrink-0">
            <div className="text-base font-black tracking-wider uppercase leading-tight">
              SAVE LIVES
            </div>
            <div className="text-[11px] font-bold text-white leading-none">
              Clean <span className="text-[#FFE082] font-black">Your</span> Hands
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FORM TITLE                                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 pb-1 text-left">
        <h1 className="text-2xl font-black text-[#5A626A] tracking-tight font-sans">
          Observation Form
        </h1>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. METADATA HEADER TABLE (FACILITY, PERIOD, SESSION, ETC.)     */}
      {/* ------------------------------------------------------------- */}
      <div className="border border-black text-[11px] mb-2 font-sans">
        
        {/* Row 1 */}
        <div className="grid grid-cols-12 border-b border-black">
          <div className="col-span-2 p-1 font-bold flex items-center">
            Facility:
          </div>
          <div className="col-span-3 p-1 bg-[#FCE7D6] border-r border-black font-semibold truncate">
            {session.facility || "Waheed IPC"}
          </div>

          <div className="col-span-2 p-1 font-bold border-r border-black flex items-center pl-2">
            Period Number*:
          </div>
          <div className="col-span-2 p-1 bg-[#FCE7D6] border-r border-black font-bold text-center">
            {session.periodNumber || "1"}
          </div>

          <div className="col-span-1.5 col-span-2 p-1 font-bold flex items-center pl-2">
            Session Number*:
          </div>
          <div className="col-span-1 p-1 bg-[#FCE7D6] font-bold text-center">
            {session.sessionNumber || "1"}
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12 border-b border-black">
          <div className="col-span-2 p-1 font-bold flex items-center">
            Service:
          </div>
          <div className="col-span-3 p-1 bg-[#FCE7D6] border-r border-black font-semibold truncate">
            {session.service || "Inpatient Care"}
          </div>

          <div className="col-span-2 p-1 font-bold border-r border-black flex items-center pl-2">
            <div>
              Date: <span className="text-[9.5px] font-normal block text-slate-700">(dd/mm/yy)</span>
            </div>
          </div>
          <div className="col-span-2 p-1 bg-[#FCE7D6] border-r border-black font-mono font-bold text-center flex items-center justify-center">
            {formatDateDisplay(session.date)}
          </div>

          <div className="col-span-2 p-1 font-bold flex items-center pl-2">
            <div>
              Observer: <span className="text-[9.5px] font-normal block text-slate-700">(initials)</span>
            </div>
          </div>
          <div className="col-span-1 p-1 bg-[#FCE7D6] font-bold text-center truncate">
            {session.observer || "IPC"}
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-12 border-b border-black">
          <div className="col-span-2 p-1 font-bold flex items-center">
            Ward:
          </div>
          <div className="col-span-3 p-1 bg-[#FCE7D6] border-r border-black font-semibold truncate">
            {session.ward || "General Ward"}
          </div>

          <div className="col-span-2 p-1 font-bold border-r border-black flex items-center pl-2">
            <div>
              Start/End time: <span className="text-[9.5px] font-normal block text-slate-700">(hh:mm)</span>
            </div>
          </div>
          <div className="col-span-2 p-1 bg-[#FCE7D6] border-r border-black font-mono font-bold text-center flex items-center justify-center text-[10px]">
            {session.startTime || "09:00"} &nbsp;/&nbsp; {session.endTime || "09:20"}
          </div>

          <div className="col-span-2 p-1 font-bold flex items-center pl-2">
            Page N°:
          </div>
          <div className="col-span-1 p-1 bg-[#FCE7D6] font-bold text-center">
            {session.pageNumber || pageNumber || "1"}
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-12 border-b border-black">
          <div className="col-span-2 p-1 font-bold flex items-center">
            Department:
          </div>
          <div className="col-span-3 p-1 bg-[#FCE7D6] border-r border-black font-semibold truncate">
            {session.department || "surgery"}
          </div>

          <div className="col-span-2 p-1 font-bold border-r border-black flex items-center pl-2">
            <div>
              Session duration: <span className="text-[9.5px] font-normal block text-slate-700">(mm)</span>
            </div>
          </div>
          <div className="col-span-2 p-1 bg-[#FCE7D6] border-r border-black font-bold text-center">
            {session.sessionDuration || "20"} min
          </div>

          <div className="col-span-2 p-1 font-bold flex items-center pl-2">
            City**:
          </div>
          <div className="col-span-1 p-1 bg-[#FCE7D6] font-semibold text-center truncate">
            {session.city || "Cairo"}
          </div>
        </div>

        {/* Row 5 */}
        <div className="grid grid-cols-12">
          <div className="col-span-2 p-1 font-bold flex items-center">
            Country**:
          </div>
          <div className="col-span-3 p-1 bg-[#FCE7D6] border-r border-black font-semibold truncate">
            {session.country || "Egypt"}
          </div>
          <div className="col-span-7 p-1 bg-white">
            {/* Blank filler */}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN 4-COLUMN OBSERVATION MATRIX                           */}
      {/* ------------------------------------------------------------- */}
      <div className="border border-black text-[9.5px] font-sans">
        <div className="grid grid-cols-4 divide-x divide-black">
          {columns.map((col, colIdx) => (
            <div key={col.id || colIdx} className="flex flex-col">
              
              {/* Header Box: Prof.cat */}
              <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-5 p-1 font-bold border-r border-black bg-white flex items-center">
                  Prof.cat
                </div>
                <div className="col-span-7 p-1 bg-[#FCE7D6] font-black truncate flex items-center">
                  {col.profCatName || "Nurse"}
                </div>
              </div>

              {/* Header Box: Code */}
              <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-5 p-1 font-bold border-r border-black bg-white flex items-center">
                  Code
                </div>
                <div className="col-span-7 p-1 bg-[#FCE7D6] font-mono font-black flex items-center">
                  {col.profCatCode || "1.1"}
                </div>
              </div>

              {/* Header Box: N° */}
              <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-5 p-1 font-bold border-r border-black bg-white flex items-center">
                  N°
                </div>
                <div className="col-span-7 p-1 bg-[#FCE7D6] font-mono font-black flex items-center">
                  {col.workersCount || 1}
                </div>
              </div>

              {/* Sub-header: Opp. | Indication | HH Action */}
              <div className="grid grid-cols-12 border-b border-black bg-[#FDE8D7]/60 font-bold text-center text-[8.5px]">
                <div className="col-span-2 p-0.5 border-r border-black flex items-center justify-center">
                  Opp.
                </div>
                <div className="col-span-6 p-0.5 border-r border-black flex items-center justify-center">
                  Indication
                </div>
                <div className="col-span-4 p-0.5 flex items-center justify-center">
                  HH Action
                </div>
              </div>

              {/* 8 Opportunity Rows */}
              <div className="divide-y divide-black">
                {Array.from({ length: 8 }).map((_, oppIdx) => {
                  const opp = col.opportunities?.[oppIdx];
                  const indications = opp?.indications || [];
                  const action = opp?.action;
                  const hasGloves = opp?.gloves;
                  
                  // Row background matching the authentic WHO form (Peach on row 1, 3, etc.)
                  const isPeachRow = oppIdx % 2 === 0;

                  return (
                    <div
                      key={oppIdx}
                      className={`grid grid-cols-12 ${isPeachRow ? "bg-[#FCE7D6]" : "bg-white"}`}
                    >
                      {/* Opp Number Cell */}
                      <div className="col-span-2 p-1 border-r border-black font-bold text-center flex items-center justify-center font-mono text-[10.5px]">
                        {oppIdx + 1}
                      </div>

                      {/* Indications Cell (5 items) */}
                      <div className="col-span-6 p-1 border-r border-black space-y-0.5 text-[8.5px] leading-tight">
                        
                        {/* 1. bef-pat. */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            indications.includes("bef_pat") ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={indications.includes("bef_pat") ? "font-bold text-black" : "text-black"}>
                            bef-pat.
                          </span>
                        </div>

                        {/* 2. bef-asept. */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            indications.includes("bef_asept") ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={indications.includes("bef_asept") ? "font-bold text-black" : "text-black"}>
                            bef-asept.
                          </span>
                        </div>

                        {/* 3. aft-b.f. */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            indications.includes("aft_bf") ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={indications.includes("aft_bf") ? "font-bold text-black" : "text-black"}>
                            aft-b.f.
                          </span>
                        </div>

                        {/* 4. aft-pat. */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            indications.includes("aft_pat") ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={indications.includes("aft_pat") ? "font-bold text-black" : "text-black"}>
                            aft-pat.
                          </span>
                        </div>

                        {/* 5. aft.p.surr. */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            indications.includes("aft_surr") ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={indications.includes("aft_surr") ? "font-bold text-black" : "text-black"}>
                            aft.p.surr.
                          </span>
                        </div>
                      </div>

                      {/* HH Action Cell (HR, HW, missed, gloves) */}
                      <div className="col-span-4 p-1 space-y-0.5 text-[8.5px] leading-tight">
                        
                        {/* HR (Alcohol Handrub) */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            action === "HR" ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={action === "HR" ? "font-bold text-black" : "text-black"}>
                            HR
                          </span>
                        </div>

                        {/* HW (Handwash) */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            action === "HW" ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span className={action === "HW" ? "font-bold text-black" : "text-black"}>
                            HW
                          </span>
                        </div>

                        {/* missed */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-full border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            action === "missed" ? "bg-black text-white" : "bg-white text-transparent"
                          }`}>
                            •
                          </span>
                          <span className={action === "missed" ? "font-bold text-black" : "text-black"}>
                            missed
                          </span>
                        </div>

                        {/* gloves */}
                        <div className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-full border border-black inline-flex items-center justify-center text-[7.5px] font-black shrink-0 ${
                            hasGloves ? "bg-purple-900 text-white" : "bg-white text-transparent"
                          }`}>
                            •
                          </span>
                          <span className={hasGloves ? "font-bold text-purple-900" : "text-slate-600"}>
                            gloves
                          </span>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. OFFICIAL FOOTNOTES                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 text-[8px] text-slate-700 space-y-0.5 leading-tight font-sans">
        <p>
          * To be completed by the data manager. &nbsp;&nbsp; ** Optional, to be used if appropriate, according to the local needs and regulations.
        </p>
        <p className="text-slate-600">
          All reasonable precautions have been taken by the World Health Organization to verify the information contained in this document. Revised August 2009.
        </p>
      </div>

      {/* Bottom Page Tag */}
      <div className="text-[8.5px] text-slate-500 text-center pt-2 font-mono flex items-center justify-between border-t border-slate-200 mt-2">
        <span>جلسة رصد #{session.sessionNumber} ({session.department} - {session.ward})</span>
        <span>WHO Observation Form (Form 1) • Page {pageNumber} of {totalPages}</span>
        <span>SAVE LIVES: Clean Your Hands</span>
      </div>

    </div>
  );
};
