'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, FileText, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface MedicalFileCardProps {
    record: {
        id: string;
        doctor_name?: string;
        doctor_specialization?: string;
        symptoms?: string;
        diagnosis?: string;
        doctor_notes?: string;
        visit_summary?: string;
        follow_up_advice?: string;
        created_at: string;
        report_file?: string;
    };
}

function parsePages(reportFile?: string): string[] {
    if (!reportFile) return [];
    try {
        const parsed = JSON.parse(reportFile);
        if (Array.isArray(parsed)) return parsed;
    } catch {
        if (reportFile.startsWith('data:') || reportFile.startsWith('http')) {
            return [reportFile];
        }
    }
    return [];
}

function downloadImagesAsPdf(images: string[], title: string = 'Medical Record') {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;
    
    // For PDFs, just open it in a new window to let the browser handle saving/printing
    if (images.length === 1 && (images[0].startsWith('data:application/pdf') || images[0].endsWith('.pdf'))) {
        printWindow.location.href = images[0];
        return;
    }

    const html = `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { margin: 0; padding: 20px; background: #fff; text-align: center; }
                    img { max-width: 100%; height: auto; display: block; margin: 0 auto 20px auto; page-break-inside: avoid; break-inside: avoid; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${images.map(img => `<img src="${img}" />`).join('')}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
}

export default function MedicalFileCard({ record }: MedicalFileCardProps) {
    const pages = parsePages(record.report_file);
    const [currentPage, setCurrentPage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoom, setZoom] = useState(1);

    const dateStr = new Date(record.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const prevPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const nextPage = () => setCurrentPage(p => Math.min(pages.length - 1, p + 1));

    const currentSrc = pages[currentPage];
    const isPdf = currentSrc?.startsWith('data:application/pdf') || currentSrc?.endsWith('.pdf');

    const openLightbox = () => {
        setZoom(1);
        setLightboxOpen(true);
    };

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (!printWindow) return;
        
        const html = `
            <html>
                <head>
                    <title>Medical Record - ${dateStr}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
                        h1 { font-size: 24px; margin: 0; color: #1e293b; }
                        .meta { color: #64748b; font-size: 14px; margin-top: 5px; }
                        .section { margin-bottom: 24px; }
                        .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px; font-weight: bold; }
                        .content { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; }
                        @media print {
                            body { padding: 0; }
                            .content { border: 1px solid #ccc; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Medical Record</h1>
                        <div class="meta">Date: ${dateStr} ${record.doctor_name ? '| Doctor: Dr. ' + record.doctor_name : ''}</div>
                    </div>
                    
                    ${record.diagnosis ? `
                    <div class="section">
                        <div class="section-title">Diagnosis</div>
                        <div class="content">${record.diagnosis}</div>
                    </div>` : ''}

                    ${record.symptoms ? `
                    <div class="section">
                        <div class="section-title">Symptoms</div>
                        <div class="content">${record.symptoms}</div>
                    </div>` : ''}

                    ${record.doctor_notes ? `
                    <div class="section">
                        <div class="section-title">Doctor's Notes</div>
                        <div class="content">${record.doctor_notes}</div>
                    </div>` : ''}

                    ${record.follow_up_advice ? `
                    <div class="section">
                        <div class="section-title">Follow-up Advice</div>
                        <div class="content">${record.follow_up_advice}</div>
                    </div>` : ''}

                    ${record.visit_summary ? `
                    <div class="section">
                        <div class="section-title">Visit Summary</div>
                        <div class="content">${record.visit_summary}</div>
                    </div>` : ''}
                    
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    };

    // If no pages: show a minimal text record card
    if (pages.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                            <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {record.visit_summary || record.diagnosis || 'Medical Record'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                        </div>
                        <button 
                            onClick={handleDownloadPDF}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="Download PDF"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {(record.diagnosis || record.symptoms || record.follow_up_advice) && (
                    <div className="px-4 py-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {record.diagnosis && <p><span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Diagnosis:</span> {record.diagnosis}</p>}
                        {record.follow_up_advice && <p><span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Follow-up:</span> {record.follow_up_advice}</p>}
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-100 leading-tight">
                                {record.visit_summary || 'Scanned Document'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {record.doctor_name ? `Dr. ${record.doctor_name}` : 'Hospital Staff'} &middot; {pages.length} page{pages.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                        </span>
                    </div>
                </div>

                {/* Image Viewer */}
                <div className="relative bg-slate-900 aspect-[4/3] overflow-hidden cursor-pointer" onClick={openLightbox}>
                    {isPdf ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                            <FileText className="h-16 w-16" />
                            <span className="text-sm font-semibold">PDF Document</span>
                            <span className="text-xs opacity-70">Click to view / download</span>
                        </div>
                    ) : (
                        <img
                            src={currentSrc}
                            alt={`Record page ${currentPage + 1}`}
                            className="w-full h-full object-contain transition-transform duration-300"
                        />
                    )}

                    {/* Expand hint */}
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="h-4 w-4 text-white" />
                    </div>

                    {/* Page counter */}
                    {pages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full">
                            {currentPage + 1} / {pages.length}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    {/* Slider navigation */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 0}
                            className="h-7 w-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
                        >
                            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </button>

                        {/* Dot indicators */}
                        {pages.length > 1 && (
                            <div className="flex gap-1">
                                {pages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`rounded-full transition-all ${i === currentPage ? 'w-4 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            onClick={nextPage}
                            disabled={currentPage === pages.length - 1}
                            className="h-7 w-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
                        >
                            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>

                    {/* Download buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => downloadImagesAsPdf([currentSrc], `Medical Record - Page ${currentPage + 1}`)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                        >
                            <Download className="h-3 w-3" />
                            Save as PDF
                        </button>
                        {pages.length > 1 && (
                            <button
                                onClick={() => downloadImagesAsPdf(pages, 'Medical Record - All Pages')}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Download className="h-3 w-3" />
                                Save All as PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox / Full-screen viewer */}
            {lightboxOpen && !isPdf && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10">
                        <div className="text-white text-sm font-semibold">
                            {record.visit_summary || 'Scanned Document'} &mdash; Page {currentPage + 1}/{pages.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.25)); }}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.25)); }}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); downloadImagesAsPdf([currentSrc]); }}
                                className="p-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setLightboxOpen(false)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Image */}
                    <div
                        className="max-h-[80vh] max-w-[90vw] overflow-auto flex items-center justify-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={currentSrc}
                            alt={`Page ${currentPage + 1}`}
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }}
                            className="rounded-lg shadow-2xl max-w-full max-h-full"
                        />
                    </div>

                    {/* Bottom navigation */}
                    {pages.length > 1 && (
                        <div
                            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent z-10"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 0}
                                className="p-3 rounded-full bg-white/15 hover:bg-white/25 text-white disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex gap-2">
                                {pages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`rounded-full transition-all ${i === currentPage ? 'w-5 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === pages.length - 1}
                                className="p-3 rounded-full bg-white/15 hover:bg-white/25 text-white disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* PDF lightbox: open in new tab */}
            {lightboxOpen && isPdf && (() => {
                window.open(currentSrc, '_blank');
                setLightboxOpen(false);
                return null;
            })()}
        </>
    );
}
