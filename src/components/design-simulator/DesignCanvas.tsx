"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group } from "react-konva";
import type Konva from "konva";
import {
  type PaperSize,
  MM_TO_PX,
  calculateImposition,
  type ImpositionResult,
} from "@/lib/paper-sizes";

interface DesignCanvasProps {
  imageDataUrl: string;
  paperSize: PaperSize;
  onImpositionChange: (result: ImpositionResult) => void;
}

const PADDING_MM = 10;
const GAP_MM = 2;

export function DesignCanvas({
  imageDataUrl,
  paperSize,
  onImpositionChange,
}: DesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [containerSize, setContainerSize] = useState({ width: 500, height: 700 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [designMm, setDesignMm] = useState({ width: 100, height: 100 });

  // Calculate scale to fit paper in container
  const padding = PADDING_MM * MM_TO_PX;
  const availableWidth = containerSize.width - padding * 2;
  const availableHeight = containerSize.height - padding * 2;
  const paperScale = Math.min(
    availableWidth / (paperSize.widthMm * MM_TO_PX),
    availableHeight / (paperSize.heightMm * MM_TO_PX),
    1,
  );

  const paperWidthPx = paperSize.widthMm * MM_TO_PX * paperScale;
  const paperHeightPx = paperSize.heightMm * MM_TO_PX * paperScale;
  const mmScale = paperScale * MM_TO_PX;

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load image — use useMemo to avoid re-creating Image() on every render
  const loadedImage = useMemo<HTMLImageElement | undefined>(() => {
    if (!imageDataUrl) return undefined;
    const img = new window.Image();
    img.src = imageDataUrl;
    return img;
  }, [imageDataUrl]);

  useEffect(() => {
    const img = loadedImage;
    if (!img) return;
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      setImageDimensions({ width: img.width, height: img.height });
      const maxDesignW = paperSize.widthMm - PADDING_MM * 2;
      const maxDesignH = paperSize.heightMm - PADDING_MM * 2;
      const aspect = img.width / img.height;
      let designW = maxDesignW;
      let designH = designW / aspect;
      if (designH > maxDesignH) {
        designH = maxDesignH;
        designW = designH * aspect;
      }
      setDesignMm({ width: Math.round(designW), height: Math.round(designH) });
    };
    return () => { cancelled = true; };
  }, [loadedImage, paperSize]);

  // Update imposition
  useEffect(() => {
    if (designMm.width > 0 && designMm.height > 0) {
      const result = calculateImposition(
        paperSize.widthMm,
        paperSize.heightMm,
        designMm.width,
        designMm.height,
        GAP_MM,
      );
      onImpositionChange(result);
    }
  }, [designMm, paperSize, onImpositionChange]);

  // Handle transformer
  useEffect(() => {
    if (transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [imageDimensions]);

  const handleTransformEnd = useCallback(() => {
    const node = imageRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidthMm = (node.width() * scaleX) / mmScale;
    const newHeightMm = (node.height() * scaleY) / mmScale;
    setDesignMm({
      width: Math.max(10, Math.round(newWidthMm)),
      height: Math.max(10, Math.round(newHeightMm)),
    });
  }, [mmScale]);

  const designPxW = designMm.width * mmScale;
  const designPxH = designMm.height * mmScale;

  // Ghost copies positions — memoized to avoid recalc on every render
  const { ghostResult, ghosts } = useMemo(() => {
    const result = calculateImposition(
      paperSize.widthMm,
      paperSize.heightMm,
      designMm.width,
      designMm.height,
      GAP_MM,
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
  }, [paperSize.widthMm, paperSize.heightMm, designMm.width, designMm.height, mmScale, paperWidthPx]);

  const designW = ghostResult.rotated ? ghostResult.designHeightMm : ghostResult.designWidthMm;
  const designH = ghostResult.rotated ? ghostResult.designWidthMm : ghostResult.designHeightMm;
  const cellW = (designW + GAP_MM) * mmScale;
  const cellH = (designH + GAP_MM) * mmScale;
  const totalContentW = ghostResult.cols * cellW - GAP_MM * mmScale;
  const totalContentH = ghostResult.rows * cellH - GAP_MM * mmScale;
  const offsetX = (paperWidthPx - totalContentW) / 2;
  const offsetY = (paperHeightPx - totalContentH) / 2;

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl border-2 border-[var(--color-border)] bg-[#f8f8f8]">
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        style={{ background: "#f8f8f8" }}
      >
        <Layer>
          {/* Paper sheet */}
          <Rect
            x={(containerSize.width - paperWidthPx) / 2}
            y={(containerSize.height - paperHeightPx) / 2}
            width={paperWidthPx}
            height={paperHeightPx}
            fill="white"
            stroke="#ccc"
            strokeWidth={1}
            shadowColor="rgba(0,0,0,0.1)"
            shadowBlur={10}
            shadowOffsetY={2}
          />

          {/* Grid lines (subtle) */}
          {ghostResult.cols > 1 &&
            Array.from({ length: ghostResult.cols - 1 }, (_, i) => {
              const x =
                (containerSize.width - paperWidthPx) / 2 +
                offsetX +
                (i + 1) * cellW -
                (GAP_MM * mmScale) / 2;
              return (
                <Rect
                  key={`vline-${i}`}
                  x={x}
                  y={(containerSize.height - paperHeightPx) / 2 + offsetY}
                  width={1}
                  height={totalContentH}
                  fill="#e0e0e0"
                />
              );
            })}
          {ghostResult.rows > 1 &&
            Array.from({ length: ghostResult.rows - 1 }, (_, i) => {
              const y =
                (containerSize.height - paperHeightPx) / 2 +
                offsetY +
                (i + 1) * cellH -
                (GAP_MM * mmScale) / 2;
              return (
                <Rect
                  key={`hline-${i}`}
                  x={(containerSize.width - paperWidthPx) / 2 + offsetX}
                  y={y}
                  width={totalContentW}
                  height={1}
                  fill="#e0e0e0"
                />
              );
            })}

          {/* Ghost copies (semi-transparent) */}
          {ghosts.map((ghost, i) => (
            <Rect
              key={`ghost-${i}`}
              x={(containerSize.width - paperWidthPx) / 2 + ghost.x}
              y={(containerSize.height - paperHeightPx) / 2 + ghost.y}
              width={ghost.w}
              height={ghost.h}
              fill="#DE127A"
              opacity={i === 0 ? 0 : 0.08}
              cornerRadius={2}
            />
          ))}

          {/* Main design (draggable + resizable) */}
          {imageDimensions.width > 0 && (
            <Group>
              <KonvaImage
                ref={imageRef}
                x={(containerSize.width - paperWidthPx) / 2 + (paperWidthPx - designPxW) / 2}
                y={(containerSize.height - paperHeightPx) / 2 + (paperHeightPx - designPxH) / 2}
                image={loadedImage}
                width={designPxW}
                height={designPxH}
                draggable
                dragBoundFunc={(pos) => ({
                  x: Math.max(
                    (containerSize.width - paperWidthPx) / 2,
                    Math.min(pos.x, (containerSize.width + paperWidthPx) / 2 - designPxW),
                  ),
                  y: Math.max(
                    (containerSize.height - paperHeightPx) / 2,
                    Math.min(pos.y, (containerSize.height + paperHeightPx) / 2 - designPxH),
                  ),
                })}
                onTransformEnd={handleTransformEnd}
                onDragEnd={handleTransformEnd}
              />
              <Transformer
                ref={transformerRef}
                rotateEnabled={false}
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                borderStroke="#DE127A"
                anchorFill="#DE127A"
                anchorSize={8}
                anchorCornerRadius={2}
                boundBoxFunc={(_oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) return _oldBox;
                  return newBox;
                }}
              />
            </Group>
          )}
        </Layer>
      </Stage>

      {/* Paper size label */}
      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)] shadow-sm backdrop-blur-sm">
        {paperSize.name}
      </div>
    </div>
  );
}
