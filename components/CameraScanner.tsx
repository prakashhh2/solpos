"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface ScanResult {
  name: string;
  brand: string;
  category: string;
  estimatedRetailPrice: number;
  currency: string;
  confidence: string;
  description: string;
}

interface CameraScannerProps {
  onResult: (result: ScanResult) => void;
  onClose: () => void;
}

export function CameraScanner({ onResult, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [camReady, setCamReady] = useState(false);

  // Start camera
  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: 640, height: 480 } })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => setCamReady(true));
        }
      })
      .catch(() => {
        if (active) setError("Camera access denied. Please allow camera and try again.");
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setScanning(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get base64 (strip the data:image/jpeg;base64, prefix)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];

    try {
      const res = await fetch("/api/gemini-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });
      const json = await res.json();
      if (json.ok && json.product) {
        onResult(json.product as ScanResult);
      } else {
        setError(json.error ?? "Could not identify product. Try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setScanning(false);
    }
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden bg-[rgb(17,24,39)] border border-[rgb(31,41,55)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(31,41,55)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Camera Scanner</span>
            {camReady && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                Live
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close scanner"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black aspect-[4/3] overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          {/* Scan overlay frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 relative">
              {/* Corner brackets */}
              {["top-0 left-0 border-t-2 border-l-2",
                "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((cls, i) => (
                <span key={i} className={`absolute w-8 h-8 ${cls} border-blue-400`} />
              ))}
              {/* Scan line */}
              {!scanning && camReady && (
                <div className="absolute left-0 right-0 h-0.5 bg-blue-400/70 scanner-line" />
              )}
            </div>
          </div>

          {!camReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Starting camera…</span>
              </div>
            </div>
          )}

          {scanning && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-white">
                <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Analyzing with Gemini AI…</span>
              </div>
            </div>
          )}
        </div>

        {/* Canvas (hidden, used for capture) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-4 pt-3 flex gap-3">
          <button
            onClick={captureAndScan}
            disabled={!camReady || scanning}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Identifying…
              </>
            ) : (
              <>Capture & Identify</>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-[rgb(55,65,81)] text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
