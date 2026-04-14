import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./SpriteEditor.module.css";

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnimationDef {
  name: string;
  frames: Frame[];
}

interface SpriteDefinition {
  sheet: string;
  animations: AnimationDef[];
}

const SPRITE_SHEETS = [
  { label: "Medieval Knight", file: "medieval-knight-sprite-sheet.png" },
  { label: "Glowing Orbs", file: "glowing-orbs-in-vibran-colors.png" },
  { label: "Fantasy Creatures", file: "fantasy-creatures-sprite-sheet.png" },
];

const DEFAULT_FPS = 8;

export default function SpriteEditor() {
  const [sheetIndex, setSheetIndex] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Definitions per sheet (indexed by sheetIndex)
  const [allDefs, setAllDefs] = useState<SpriteDefinition[]>(
    SPRITE_SHEETS.map((s) => ({ sheet: s.file, animations: [{ name: "idle", frames: [] }] })),
  );

  // Current animation index within the selected sheet
  const [animIndex, setAnimIndex] = useState(0);
  // Current frame index within the selected animation
  const [frameIndex, setFrameIndex] = useState(0);

  // Frame input fields
  const [fx, setFx] = useState("0");
  const [fy, setFy] = useState("0");
  const [fw, setFw] = useState("64");
  const [fh, setFh] = useState("64");

  // New animation name input
  const [newAnimName, setNewAnimName] = useState("");

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const playRef = useRef<number | null>(null);

  // Canvas refs
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const currentDef = allDefs[sheetIndex];
  const currentAnim = currentDef.animations[animIndex] ?? currentDef.animations[0];
  const frames = currentAnim?.frames ?? [];
  const totalFrames = frames.length;

  const safeFrameIndex = totalFrames > 0 ? Math.min(frameIndex, totalFrames - 1) : 0;

  // Parse frame inputs to numbers (clamped to valid range)
  const parsedFrame = useCallback((): Frame => {
    return {
      x: Math.max(0, parseInt(fx, 10) || 0),
      y: Math.max(0, parseInt(fy, 10) || 0),
      width: Math.max(1, parseInt(fw, 10) || 64),
      height: Math.max(1, parseInt(fh, 10) || 64),
    };
  }, [fx, fy, fw, fh]);

  // Load sprite sheet image
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    const img = new Image();
    img.src = `/${SPRITE_SHEETS[sheetIndex].file}`;
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
    };
    img.onerror = () => {
      imageRef.current = null;
      setImageError(true);
    };
  }, [sheetIndex]);

  // Draw full sprite sheet onto sheet canvas
  const drawSheet = useCallback(() => {
    const canvas = sheetCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw frame highlight
    const frame = totalFrames > 0 ? frames[safeFrameIndex] : parsedFrame();
    ctx.strokeStyle = "rgba(255, 200, 0, 0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
    ctx.setLineDash([]);

    // Semi-transparent fill
    ctx.fillStyle = "rgba(255, 200, 0, 0.15)";
    ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
  }, [imageLoaded, frames, safeFrameIndex, totalFrames, parsedFrame]);

  // Draw frame preview onto preview canvas
  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = totalFrames > 0 ? frames[safeFrameIndex] : parsedFrame();
    const scale = Math.min(192 / frame.width, 192 / frame.height, 4);
    const dw = Math.round(frame.width * scale);
    const dh = Math.round(frame.height * scale);

    canvas.width = dw;
    canvas.height = dh;
    ctx.clearRect(0, 0, dw, dh);

    // Checkerboard background to show transparency
    const tileSize = 8;
    for (let row = 0; row < Math.ceil(dh / tileSize); row++) {
      for (let col = 0; col < Math.ceil(dw / tileSize); col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? "#555" : "#333";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, dw, dh);
  }, [imageLoaded, frames, safeFrameIndex, totalFrames, parsedFrame]);

  useEffect(() => {
    drawSheet();
    drawPreview();
  }, [drawSheet, drawPreview]);

  // Populate inputs when navigating to a defined frame
  useEffect(() => {
    if (totalFrames > 0) {
      const f = frames[safeFrameIndex];
      setFx(String(f.x));
      setFy(String(f.y));
      setFw(String(f.width));
      setFh(String(f.height));
    }
  }, [safeFrameIndex, totalFrames, frames]);

  // Auto-advance frame index when playing
  useEffect(() => {
    if (isPlaying && totalFrames > 1) {
      playRef.current = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % totalFrames);
      }, 1000 / fps);
    } else {
      if (playRef.current) clearInterval(playRef.current);
      playRef.current = null;
    }
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying, totalFrames, fps]);

  // Reset state when switching sheet
  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(false);
    setAnimIndex(0);
  }, [sheetIndex]);

  // Reset state when switching animation
  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(false);
  }, [animIndex]);

  // Helpers to mutate allDefs immutably
  const updateCurrentAnim = useCallback(
    (updater: (anim: AnimationDef) => AnimationDef) => {
      setAllDefs((prev) =>
        prev.map((def, di) => {
          if (di !== sheetIndex) return def;
          return {
            ...def,
            animations: def.animations.map((anim, ai) =>
              ai === animIndex ? updater(anim) : anim,
            ),
          };
        }),
      );
    },
    [sheetIndex, animIndex],
  );

  const handleAddFrame = () => {
    const frame = parsedFrame();
    updateCurrentAnim((anim) => ({ ...anim, frames: [...anim.frames, frame] }));
    setFrameIndex(frames.length);
  };

  const handleUpdateFrame = () => {
    if (totalFrames === 0) return;
    const frame = parsedFrame();
    updateCurrentAnim((anim) => ({
      ...anim,
      frames: anim.frames.map((f, i) => (i === safeFrameIndex ? frame : f)),
    }));
  };

  const handleRemoveFrame = () => {
    if (totalFrames === 0) return;
    updateCurrentAnim((anim) => ({
      ...anim,
      frames: anim.frames.filter((_, i) => i !== safeFrameIndex),
    }));
    setFrameIndex((prev) => Math.max(0, prev - 1));
  };

  const handleAddAnimation = () => {
    const name = newAnimName.trim() || `anim_${currentDef.animations.length}`;
    setAllDefs((prev) =>
      prev.map((def, di) =>
        di !== sheetIndex
          ? def
          : { ...def, animations: [...def.animations, { name, frames: [] }] },
      ),
    );
    setAnimIndex(currentDef.animations.length);
    setNewAnimName("");
  };

  const handleRenameAnim = (name: string) => {
    updateCurrentAnim((anim) => ({ ...anim, name }));
  };

  const handleExport = () => {
    const output = allDefs.map((def) => ({
      sheet: def.sheet,
      animations: def.animations.map((anim) => ({
        name: anim.name,
        frames: anim.frames,
      })),
    }));
    const json = JSON.stringify(output, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sprite-definitions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrev = () => {
    if (totalFrames === 0) return;
    setFrameIndex((prev) => (prev - 1 + totalFrames) % totalFrames);
  };

  const handleNext = () => {
    if (totalFrames === 0) return;
    setFrameIndex((prev) => (prev + 1) % totalFrames);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <i className="fa-solid fa-film" /> Sprite Definition Creator
        </h1>
        <div className={styles.sheetTabs}>
          {SPRITE_SHEETS.map((s, i) => (
            <button
              key={s.file}
              className={`${styles.tab} ${i === sheetIndex ? styles.tabActive : ""}`}
              onClick={() => setSheetIndex(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={handleExport}>
          <i className="fa-solid fa-download" /> Export JSON
        </button>
      </header>

      <div className={styles.body}>
        {/* Left: full sheet viewer */}
        <section className={styles.sheetPanel}>
          <h2 className={styles.panelTitle}>
            Sprite Sheet
            {imageLoaded && (
              <span className={styles.sheetMeta}>
                {imageSize.width}×{imageSize.height}px
              </span>
            )}
          </h2>
          <div className={styles.sheetScroll}>
            {imageError && (
              <div className={styles.placeholder}>
                <i className="fa-solid fa-image" />
                <p>
                  Place <code>{SPRITE_SHEETS[sheetIndex].file}</code> in the{" "}
                  <code>public/</code> directory
                </p>
              </div>
            )}
            {!imageError && (
              <canvas
                ref={sheetCanvasRef}
                className={styles.sheetCanvas}
                title="Highlighted region = current frame"
              />
            )}
          </div>
        </section>

        {/* Center: preview + playback + coordinates */}
        <section className={styles.previewPanel}>
          <h2 className={styles.panelTitle}>Frame Preview</h2>

          <div className={styles.previewBox}>
            {imageError ? (
              <div className={styles.previewEmpty}>No image loaded</div>
            ) : (
              <canvas ref={previewCanvasRef} className={styles.previewCanvas} />
            )}
          </div>

          <div className={styles.frameCounter}>
            {totalFrames > 0
              ? `Frame ${safeFrameIndex + 1} of ${totalFrames}`
              : "No frames defined — add frames below"}
          </div>

          <div className={styles.playbackRow}>
            <button
              className={styles.iconBtn}
              onClick={handlePrev}
              disabled={totalFrames < 2}
              title="Previous frame"
            >
              <i className="fa-solid fa-backward-step" />
            </button>
            <button
              className={`${styles.iconBtn} ${styles.playBtn}`}
              onClick={() => setIsPlaying((v) => !v)}
              disabled={totalFrames < 2}
              title={isPlaying ? "Pause" : "Play"}
            >
              <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`} />
            </button>
            <button
              className={styles.iconBtn}
              onClick={handleNext}
              disabled={totalFrames < 2}
              title="Next frame"
            >
              <i className="fa-solid fa-forward-step" />
            </button>
            <label className={styles.fpsLabel}>
              FPS
              <input
                type="number"
                className={styles.fpsInput}
                value={fps}
                min={1}
                max={60}
                onChange={(e) =>
                  setFps(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
              />
            </label>
          </div>

          {/* Frame coordinate inputs */}
          <div className={styles.coordSection}>
            <h3 className={styles.sectionTitle}>Frame Coordinates (px)</h3>
            <div className={styles.coordGrid}>
              <label className={styles.coordLabel}>
                X
                <input
                  type="number"
                  className={styles.coordInput}
                  value={fx}
                  min={0}
                  onChange={(e) => setFx(e.target.value)}
                />
              </label>
              <label className={styles.coordLabel}>
                Y
                <input
                  type="number"
                  className={styles.coordInput}
                  value={fy}
                  min={0}
                  onChange={(e) => setFy(e.target.value)}
                />
              </label>
              <label className={styles.coordLabel}>
                W
                <input
                  type="number"
                  className={styles.coordInput}
                  value={fw}
                  min={1}
                  onChange={(e) => setFw(e.target.value)}
                />
              </label>
              <label className={styles.coordLabel}>
                H
                <input
                  type="number"
                  className={styles.coordInput}
                  value={fh}
                  min={1}
                  onChange={(e) => setFh(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.frameActions}>
              <button className={styles.actionBtn} onClick={handleAddFrame}>
                <i className="fa-solid fa-plus" /> Add Frame
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleUpdateFrame}
                disabled={totalFrames === 0}
              >
                <i className="fa-solid fa-pen" /> Update Frame
              </button>
              <button
                className={`${styles.actionBtn} ${styles.dangerBtn}`}
                onClick={handleRemoveFrame}
                disabled={totalFrames === 0}
              >
                <i className="fa-solid fa-trash" /> Remove Frame
              </button>
            </div>
          </div>
        </section>

        {/* Right: animations manager */}
        <section className={styles.animPanel}>
          <h2 className={styles.panelTitle}>Animations</h2>

          <div className={styles.animList}>
            {currentDef.animations.map((anim, ai) => (
              <button
                key={ai}
                className={`${styles.animItem} ${ai === animIndex ? styles.animItemActive : ""}`}
                onClick={() => setAnimIndex(ai)}
              >
                <span className={styles.animName}>{anim.name}</span>
                <span className={styles.animFrameCount}>{anim.frames.length}f</span>
              </button>
            ))}
          </div>

          <div className={styles.addAnimRow}>
            <input
              type="text"
              className={styles.animNameInput}
              placeholder="New animation name…"
              value={newAnimName}
              onChange={(e) => setNewAnimName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddAnimation();
              }}
            />
            <button className={styles.actionBtn} onClick={handleAddAnimation} title="Add animation">
              <i className="fa-solid fa-plus" />
            </button>
          </div>

          <label className={styles.renameLabel}>
            Rename current animation
            <input
              type="text"
              className={styles.animNameInput}
              value={currentAnim?.name ?? ""}
              onChange={(e) => handleRenameAnim(e.target.value)}
            />
          </label>

          <h3 className={styles.sectionTitle}>Frames in "{currentAnim?.name}"</h3>
          <div className={styles.frameList}>
            {frames.length === 0 && (
              <p className={styles.emptyNote}>No frames yet — add one using the form.</p>
            )}
            {frames.map((f, fi) => (
              <button
                key={fi}
                className={`${styles.frameItem} ${fi === safeFrameIndex ? styles.frameItemActive : ""}`}
                onClick={() => setFrameIndex(fi)}
              >
                <span className={styles.frameNum}>#{fi + 1}</span>
                <span className={styles.frameCoords}>
                  ({f.x},{f.y}) {f.width}×{f.height}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
