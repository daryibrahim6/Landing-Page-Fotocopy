"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group } from "react-konva";
import type Konva from "konva";
import {
  BISA_PRINT_A3,
  GAP_KISS_CUT_MM,
  MM_TO_PX,
  PRINT_AREA_MM,
  calculateImposition,
  type ImpositionResult,
} from "@/lib/paper-sizes";

interface DesignCanvasProps {
  imageDataUrl: string;
  onImpositionChange: (result: ImpositionResult) => void;
}

const GAP_MM = GAP_KISS_CUT_MM;
const PADDING_MM = 10;

export function DesignCanvas({
  imageDataUrl,
  onImpositionChange,
}: DesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [designMm, setDesignMm] = useState({ width: 100, height: 100 });

  const paperSize = BISA_PRINT_A3;

  // Scale driven oleh LEBAR container saja, lalu stage height diturunkan dari
  // paper — versi lama mengunci stage 700px fixed sehingga di mobile kertas
  // mengambang di tengah void panjang (layout "berantakan"). Cap MAX_PAPER_SCALE
  // menjaga tinggi ≤ ~700px di desktop.
  const padding = PADDING_MM * MM_TO_PX;
  const availableWidth = containerWidth - padding * 2;
  const MAX_PAPER_SCALE = (700 - padding * 2) / (paperSize.heightMm * MM_TO_PX);
  const paperScale = Math.min(
    availableWidth / (paperSize.widthMm * MM_TO_PX),
    MAX_PAPER_SCALE,
    1,
  );

  const paperWidthPx = paperSize.widthMm * MM_TO_PX * paperScale;
  const paperHeightPx = paperSize.heightMm * MM_TO_PX * paperScale;
  const mmScale = paperScale * MM_TO_PX;
  const stageHeight = Math.round(paperHeightPx + padding * 2);

  // Resize observer — width saja; height diturunkan dari paperScale (menghindari
  // feedback loop: container height = stage height).
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Clamp ke area cetak — design lebih besar dari printable area bikin
  // imposition total=0 → semua cell ghost hilang (gambar "hilang satu").
  const clampDesignMm = useCallback((w: number, h: number) => ({
    width: Math.min(PRINT_AREA_MM.width, Math.max(10, Math.round(w))),
    height: Math.min(PRINT_AREA_MM.height, Math.max(10, Math.round(h))),
  }), []);

  const imageAspect = imageDimensions.width > 0
    ? imageDimensions.width / imageDimensions.height
    : 1;

  // Resize keep-ratio: lebar → tinggi mengikuti aspect gambar asli.
  const setDesignWidthKeepRatio = useCallback((w: number) => {
    let height = w / imageAspect;
    let width = w;
    if (height > PRINT_AREA_MM.height) {
      height = PRINT_AREA_MM.height;
      width = height * imageAspect;
    }
    setDesignMm(clampDesignMm(width, height));
  }, [imageAspect, clampDesignMm]);

  const fitToSheet = useCallback(() => {
    setDesignWidthKeepRatio(PRINT_AREA_MM.width);
  }, [setDesignWidthKeepRatio]);

  // Load image
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (!imageDataUrl) return;

    let cancelled = false;
    const img = new window.Image();
    img.src = imageDataUrl;

    const onLoad = () => {
      if (cancelled) return;
      setImageDimensions({ width: img.width, height: img.height });
      setLoadedImage(img);
      // Initial fit ke AREA CETAK (bukan kertas) — gambar portrait ekstrem
      // dulu ke-set 465mm > printable 460mm → total=0 → semua cell hilang.
      const maxDesignW = PRINT_AREA_MM.width;
      const maxDesignH = PRINT_AREA_MM.height;
      const aspect = img.width / img.height;
      let designW = maxDesignW;
      let designH = designW / aspect;
      if (designH > maxDesignH) {
        designH = maxDesignH;
        designW = designH * aspect;
      }
      setDesignMm({ width: Math.round(designW), height: Math.round(designH) });
    };

    if (img.complete) {
      onLoad();
    } else {
      img.onload = onLoad;
    }

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [imageDataUrl, paperSize]);

  // Update imposition
  useEffect(() => {
    if (designMm.width > 0 && designMm.height > 0) {
      const result = calculateImposition(
        designMm.width,
        designMm.height,
        "kiss",
        "square",
      );
      onImpositionChange(result);
    }
  }, [designMm, onImpositionChange]);

  // Re-attach transformer SETIAP render — ghost cells di-remap saat designMm
  // berubah sehingga imageRef menunjuk node Konva baru; deps lama
  // [imageDimensions] meninggalkan transformer menempel di node stale dan
  // gambar tampak "menghilang"/loncat saat di-drag setelah resize.
  useEffect(() => {
    if (transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  });

  const handleTransformEnd = useCallback(() => {
    const node = imageRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidthMm = (node.width() * scaleX) / mmScale;
    const newHeightMm = (node.height() * scaleY) / mmScale;
    // Konva pattern: bake the transform into width/height and reset scale —
    // otherwise the stale scale compounds with the new width prop and the
    // image renders double-scaled vs the tracked mm size.
    node.scaleX(1);
    node.scaleY(1);
    setDesignMm(clampDesignMm(newWidthMm, newHeightMm));
  }, [mmScale, clampDesignMm]);

  const designPxW = designMm.width * mmScale;
  const designPxH = designMm.height * mmScale;

  // Ghost copies positions
  const { ghostResult, ghosts } = useMemo(() => {
    const result = calculateImposition(
      designMm.width,
      designMm.height,
      "kiss",
      "square",
    );

    const g: { x: number; y: number; w: number; h: number; rotated: boolean }[] = [];
    const dw = result.rotated ? result.designHeightMm : result.designWidthMm;
    const dh = result.rotated ? result.designWidthMm : result.designHeightMm;
    const cw = (dw + GAP_MM) * mmScale;
    const ch = (dh + GAP_MM) * mmScale;
    const tcw = result.cols * cw - GAP_MM * mmScale;
    const tch = result.rows * ch - GAP_MM * mmScale;
    const ox = (paperWidthPx - tcw) / 2;
    const oy = (paperHeightPx - tch) / 2;

    for (let row = 0; row < result.rows; row++) {
      for (let col = 0; col < result.cols; col++) {
        g.push({
          x: ox + col * cw,
          y: oy + row * ch,
          w: dw * mmScale,
          h: dh * mmScale,
          rotated: result.rotated,
        });
      }
    }
    return { ghostResult: result, ghosts: g };
  }, [designMm.width, designMm.height, mmScale, paperWidthPx, paperHeightPx]);

  const designW = ghostResult.rotated ? ghostResult.designHeightMm : ghostResult.designWidthMm;
  const designH = ghostResult.rotated ? ghostResult.designWidthMm : ghostResult.designHeightMm;
  const cellW = (designW + GAP_MM) * mmScale;
  const cellH = (designH + GAP_MM) * mmScale;
  const totalContentW = ghostResult.cols * cellW - GAP_MM * mmScale;
  const totalContentH = ghostResult.rows * cellH - GAP_MM * mmScale;
  const offsetX = (paperWidthPx - totalContentW) / 2;
  const offsetY = (paperHeightPx - totalContentH) / 2;

  return (
    <div ref={containerRef} className="relative w-full min-w-0 overflow-hidden rounded-2xl border-2 border-[var(--color-border)] bg-[#f8f8f8]">
      <Stage
        width={containerWidth}
        height={stageHeight}
        style={{ background: "#f8f8f8" }}
      >
        <Layer>
          {/* Paper sheet */}
          <Rect
            x={(containerWidth - paperWidthPx) / 2}
            y={(stageHeight - paperHeightPx) / 2}
            width={paperWidthPx}
            height={paperHeightPx}
            fill="white"
            stroke="#ccc"
            strokeWidth={1}
            shadowColor="rgba(0,0,0,0.1)"
            shadowBlur={10}
            shadowOffsetY={2}
          />

          {/* Grid lines */}
          {ghostResult.cols > 1 &&
            Array.from({ length: ghostResult.cols - 1 }, (_, i) => {
              const x =
                (containerWidth - paperWidthPx) / 2 +
                offsetX +
                (i + 1) * cellW -
                (GAP_MM * mmScale) / 2;
              return (
                <Rect
                  key={`vline-${i}`}
                  x={x}
                  y={(stageHeight - paperHeightPx) / 2 + offsetY}
                  width={1}
                  height={totalContentH}
                  fill="#e0e0e0"
                />
              );
            })}
          {ghostResult.rows > 1 &&
            Array.from({ length: ghostResult.rows - 1 }, (_, i) => {
              const y =
                (stageHeight - paperHeightPx) / 2 +
                offsetY +
                (i + 1) * cellH -
                (GAP_MM * mmScale) / 2;
              return (
                <Rect
                  key={`hline-${i}`}
                  x={(containerWidth - paperWidthPx) / 2 + offsetX}
                  y={y}
                  width={totalContentW}
                  height={1}
                  fill="#e0e0e0"
                />
              );
            })}

          {/* Design tiled into every imposition cell — preview shows the
              real uploaded design repeated across the sheet, not ghost
              placeholders. Cell 0 stays transformable; the rest are static
              copies following the same size. */}
          {loadedImage &&
            (ghosts.length > 0
              ? ghosts.map((ghost, i) => (
                  <Group
                    key={`cell-${i}`}
                    x={(containerWidth - paperWidthPx) / 2 + ghost.x + ghost.w / 2}
                    y={(stageHeight - paperHeightPx) / 2 + ghost.y + ghost.h / 2}
                    rotation={ghost.rotated ? 90 : 0}
                    listening={i === 0}
                  >
                    <KonvaImage
                      ref={i === 0 ? imageRef : undefined}
                      image={loadedImage}
                      width={designPxW}
                      height={designPxH}
                      offsetX={designPxW / 2}
                      offsetY={designPxH / 2}
                      onTransformEnd={i === 0 ? handleTransformEnd : undefined}
                    />
                  </Group>
                ))
              : (
                  <Group
                    x={containerWidth / 2}
                    y={stageHeight / 2}
                  >
                    <KonvaImage
                      ref={imageRef}
                      image={loadedImage}
                      width={designPxW}
                      height={designPxH}
                      offsetX={designPxW / 2}
                      offsetY={designPxH / 2}
                      onTransformEnd={handleTransformEnd}
                    />
                  </Group>
                ))}

          {/* Main design transformer (attached to cell 0) */}
          {imageDimensions.width > 0 && loadedImage && (
            <Group>
              <Transformer
                ref={transformerRef}
                rotateEnabled={false}
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                borderStroke="#DE127A"
                anchorFill="#DE127A"
                anchorSize={14}
                anchorCornerRadius={2}
                boundBoxFunc={(_oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) return _oldBox;
                  // Batasi di area cetak — resize melewati kertas membuat
                  // imposition total=0 dan semua cell ghost hilang.
                  if (
                    newBox.width > PRINT_AREA_MM.width * mmScale ||
                    newBox.height > PRINT_AREA_MM.height * mmScale
                  ) {
                    return _oldBox;
                  }
                  return newBox;
                }}
              />
            </Group>
          )}
        </Layer>
      </Stage>

      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)] shadow-sm backdrop-blur-sm">
        {paperSize.name}
      </div>

      {/* Toolbar resize cepat — user tidak perlu paham mm/drag: chips ukuran
          populer + Fit + slider keep-ratio. Input L×T tetap ada sebagai
          jalur presisi (dan keyboard-accessible). */}
      {loadedImage && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
          <div className="flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={fitToSheet}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              Fit
            </button>
            {[50, 80, 100].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setDesignWidthKeepRatio(w)}
                className="rounded-full px-2 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-soft)] hover:text-primary"
              >
                {w}
              </button>
            ))}
            <input
              type="range"
              min={10}
              max={PRINT_AREA_MM.width}
              step={1}
              value={designMm.width}
              onChange={(e) => setDesignWidthKeepRatio(Number(e.target.value))}
              className="mx-1 w-16 accent-primary sm:w-24"
              aria-label="Slider ukuran design (keep ratio)"
            />
          </div>
        </div>
      )}

      {/* Keyboard-accessible size controls — canvas drag/resize is not operable
          by keyboard, so provide numeric inputs as the alternative path. */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] shadow-sm backdrop-blur-sm">
        <label htmlFor="dc-width">L</label>
        <input
          id="dc-width"
          type="number"
          min={10}
          max={PRINT_AREA_MM.width}
          value={designMm.width}
          onChange={(e) =>
            setDesignMm((d) => clampDesignMm(Number(e.target.value) || 10, d.height))
          }
          className="w-14 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 text-center outline-none focus-visible:border-primary"
          aria-label="Lebar design (mm)"
        />
        <span aria-hidden="true">×</span>
        <label htmlFor="dc-height">T</label>
        <input
          id="dc-height"
          type="number"
          min={10}
          max={PRINT_AREA_MM.height}
          value={designMm.height}
          onChange={(e) =>
            setDesignMm((d) => clampDesignMm(d.width, Number(e.target.value) || 10))
          }
          className="w-14 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 text-center outline-none focus-visible:border-primary"
          aria-label="Tinggi design (mm)"
        />
        <span className="text-[var(--color-text-muted)]">mm</span>
      </div>
    </div>
  );
}
