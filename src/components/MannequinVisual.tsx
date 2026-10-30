import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Info,
  Maximize2,
  Compass,
} from 'lucide-react';
import { MuscleGroup } from '../types';
import { CHARACTER_IMAGE, CHARACTER_BACK_IMAGE } from '../data/exercises';

interface MannequinVisualProps {
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: string[];
  exerciseId?: string;
  isAnimatedDefault?: boolean;
  customFrontImage?: string;
  customBackImage?: string;
  className?: string;
  compact?: boolean;
}

export const MannequinVisual: React.FC<MannequinVisualProps> = ({
  primaryMuscle,
  secondaryMuscles = [],
  exerciseId = '',
  isAnimatedDefault = true,
  customFrontImage,
  customBackImage,
  className = '',
  compact = false,
}) => {
  // Movement animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(isAnimatedDefault);

  // 360-degree rotation angle state (0 to 360 degrees)
  // Default to 180 (Back) if training back muscles, else 0 (Front)
  const isBackDefault = primaryMuscle === 'BACK';
  const [rotationDegrees, setRotationDegrees] = useState<number>(isBackDefault ? 180 : 0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [showCalloutLabels, setShowCalloutLabels] = useState<boolean>(true);

  // Auto 360 rotation loop
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotationDegrees((prev) => (prev + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Determine whether Front or Back view is facing the camera
  // 0° - 90° & 270° - 360° -> FRONT
  // 90° - 270° -> BACK
  const normalizedAngle = ((rotationDegrees % 360) + 360) % 360;
  const isBackView = normalizedAngle > 90 && normalizedAngle < 270;

  // Calculate 3D card tilt for smooth 360 visual feel
  const currentViewAngle = isBackView ? normalizedAngle - 180 : normalizedAngle;
  const perspectiveY = Math.sin((currentViewAngle * Math.PI) / 180) * 18;

  // Movement animation class based on exercise
  const getMovementClass = () => {
    if (!isPlaying) return '';

    if (exerciseId.includes('bench_press') || exerciseId.includes('pushup')) {
      return 'animate-bench-press';
    }
    if (exerciseId.includes('squat') || exerciseId.includes('lunge') || exerciseId.includes('leg_press')) {
      return 'animate-squat';
    }
    if (exerciseId.includes('curl')) {
      return 'animate-curl';
    }
    if (exerciseId.includes('overhead') || exerciseId.includes('lateral_raise') || exerciseId.includes('press')) {
      return 'animate-press';
    }
    if (exerciseId.includes('row') || exerciseId.includes('pulldown') || exerciseId.includes('face_pull')) {
      return 'animate-row';
    }
    if (exerciseId.includes('jump') || primaryMuscle === 'CARDIO') {
      return 'animate-cardio';
    }
    if (primaryMuscle === 'LEGS') return 'animate-squat';
    if (primaryMuscle === 'CHEST') return 'animate-bench-press';
    if (primaryMuscle === 'BICEPS' || primaryMuscle === 'TRICEPS') return 'animate-curl';
    if (primaryMuscle === 'SHOULDERS') return 'animate-press';
    if (primaryMuscle === 'BACK') return 'animate-row';
    return 'animate-bench-press';
  };

  const isMusclePrimary = (muscle: MuscleGroup) => primaryMuscle === muscle;

  const isMuscleSecondary = (muscleName: string) => {
    return secondaryMuscles.some((sec) =>
      sec.toLowerCase().includes(muscleName.toLowerCase())
    );
  };

  const getMuscleRole = (muscleKey: MuscleGroup, altName: string): 'primary' | 'secondary' | null => {
    if (isMusclePrimary(muscleKey)) return 'primary';
    if (isMuscleSecondary(altName)) return 'secondary';
    return null;
  };

  // Roles
  const chestRole = getMuscleRole('CHEST', 'chest');
  const shouldersRole = getMuscleRole('SHOULDERS', 'deltoids');
  const bicepsRole = getMuscleRole('BICEPS', 'biceps');
  const tricepsRole = getMuscleRole('TRICEPS', 'triceps');
  const coreRole = getMuscleRole('CORE', 'core');
  const legsRole = getMuscleRole('LEGS', 'quadriceps');
  const backRole = getMuscleRole('BACK', 'latissimus');

  // Muscle rendering helper: paints the muscle in Light Blue (primary) or Light Red (secondary)
  const renderColoredMuscle = (
    role: 'primary' | 'secondary' | null,
    paths: string[],
    labelCoords?: { x: number; y: number }
  ) => {
    if (!role) return null;

    const isPrimary = role === 'primary';
    // User Requirement: Light Blue for Primary, Light Red for Secondary
    const colorHex = isPrimary ? '#38BDF8' : '#F87171';
    const darkAccent = isPrimary ? '#0284C7' : '#EF4444';
    const filterId = isPrimary ? 'url(#blueMuscleGlow360)' : 'url(#redMuscleGlow360)';

    return (
      <g className={isPlaying ? (isPrimary ? 'animate-muscle-blue' : 'animate-muscle-red') : ''}>
        {/* Layer 1: Recolor base using blend-mode: color */}
        {paths.map((d, i) => (
          <path
            key={`color-blend-${i}`}
            d={d}
            fill={colorHex}
            style={{ mixBlendMode: 'color' }}
            opacity="0.95"
          />
        ))}

        {/* Layer 2: Multiply for rich muscle shading & contour retention */}
        {paths.map((d, i) => (
          <path
            key={`multiply-${i}`}
            d={d}
            fill={colorHex}
            style={{ mixBlendMode: 'multiply' }}
            opacity="0.8"
          />
        ))}

        {/* Layer 3: Vibrant specular sheen */}
        {paths.map((d, i) => (
          <path
            key={`overlay-${i}`}
            d={d}
            fill={colorHex}
            style={{ mixBlendMode: 'screen' }}
            opacity="0.5"
            stroke={colorHex}
            strokeWidth="4"
            strokeLinejoin="round"
            filter={filterId}
          />
        ))}

        {/* Contour outline */}
        {paths.map((d, i) => (
          <path
            key={`contour-${i}`}
            d={d}
            fill="none"
            stroke={darkAccent}
            strokeWidth="3.5"
            strokeOpacity="0.9"
            strokeLinejoin="round"
          />
        ))}

        {/* Callout pin */}
        {showCalloutLabels && labelCoords && !compact && (
          <g>
            <circle
              cx={labelCoords.x}
              cy={labelCoords.y}
              r="7"
              fill={colorHex}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </g>
        )}
      </g>
    );
  };

  // ================= FRONT MUSCLE PATHS =================
  const frontChestPaths = [
    'M 390 380 C 425 365, 480 385, 495 435 C 495 480, 440 500, 395 480 C 365 455, 370 405, 390 380 Z',
    'M 610 380 C 575 365, 520 385, 505 435 C 505 480, 560 500, 605 480 C 635 455, 630 405, 610 380 Z',
  ];

  const frontShoulderPaths = [
    'M 330 345 C 365 335, 395 370, 385 435 C 355 450, 310 430, 295 385 C 290 365, 310 350, 330 345 Z',
    'M 670 345 C 635 335, 605 370, 615 435 C 645 450, 690 430, 705 385 C 710 365, 690 350, 670 345 Z',
  ];

  const frontBicepPaths = [
    'M 275 440 C 315 440, 335 485, 315 545 C 285 550, 255 520, 260 470 C 265 450, 270 440, 275 440 Z',
    'M 725 440 C 685 440, 665 485, 685 545 C 715 550, 745 520, 740 470 C 735 450, 730 440, 725 440 Z',
  ];

  const frontCorePaths = [
    'M 440 495 C 470 490, 530 490, 560 495 C 565 540, 555 570, 545 580 C 510 585, 490 585, 455 580 C 445 570, 435 540, 440 495 Z',
    'M 450 585 C 485 590, 515 590, 550 585 C 555 635, 540 665, 500 675 C 460 665, 445 635, 450 585 Z',
    'M 390 515 C 435 525, 435 630, 395 625 C 375 585, 375 545, 390 515 Z',
    'M 610 515 C 565 525, 565 630, 605 625 C 625 585, 625 545, 610 515 Z',
  ];

  const frontLegPaths = [
    'M 385 840 C 435 830, 470 860, 465 1010 C 445 1055, 395 1055, 370 1000 C 345 930, 355 870, 385 840 Z',
    'M 615 840 C 565 830, 530 860, 535 1010 C 555 1055, 605 1055, 630 1000 C 655 930, 645 870, 615 840 Z',
  ];

  // ================= BACK / POSTERIOR MUSCLE PATHS =================
  // 1. Latissimus Dorsi & Rhomboids (Back Wings)
  const backLatPaths = [
    // Left Lat Wing
    'M 350 410 C 410 425, 460 490, 435 635 C 390 620, 340 535, 330 460 C 330 435, 340 415, 350 410 Z',
    // Right Lat Wing
    'M 650 410 C 590 425, 540 490, 565 635 C 610 620, 660 535, 670 460 C 670 435, 660 415, 650 410 Z',
    // Mid Back Spine & Erector
    'M 465 460 C 500 455, 535 455, 535 660 C 500 665, 465 665, 465 460 Z',
  ];

  // 2. Trapezius (Diamond Back of Neck to Mid Spine)
  const backTrapPaths = [
    'M 500 240 C 555 270, 590 330, 575 420 C 500 455, 425 420, 410 330 C 445 270, 500 240, 500 240 Z',
  ];

  // 3. Rear Deltoids (Posterior Shoulders)
  const backRearDeltPaths = [
    // Left Rear Delt
    'M 315 360 C 355 350, 375 390, 360 445 C 330 450, 290 420, 295 380 Z',
    // Right Rear Delt
    'M 685 360 C 645 350, 625 390, 640 445 C 670 450, 710 420, 705 380 Z',
  ];

  // 4. Triceps (Long and Lateral Head from Behind)
  const backTricepPaths = [
    // Left Tricep
    'M 265 440 C 300 445, 310 520, 285 580 C 255 570, 245 490, 265 440 Z',
    // Right Tricep
    'M 735 440 C 700 445, 690 520, 715 580 C 745 570, 755 490, 735 440 Z',
  ];

  // 5. Hamstrings & Glutes (Rear Thighs & Calves)
  const backLegPaths = [
    // Left Hamstring
    'M 380 840 C 440 835, 475 870, 465 1030 C 440 1060, 390 1060, 365 1010 C 350 940, 355 870, 380 840 Z',
    // Right Hamstring
    'M 620 840 C 560 835, 525 870, 535 1030 C 560 1060, 610 1060, 635 1010 C 650 940, 645 870, 620 840 Z',
    // Left Calf (Gastrocnemius diamond)
    'M 380 1090 C 445 1100, 440 1260, 395 1300 C 365 1250, 355 1150, 380 1090 Z',
    // Right Calf (Gastrocnemius diamond)
    'M 620 1090 C 555 1100, 560 1260, 605 1300 C 635 1250, 645 1150, 620 1090 Z',
  ];

  return (
    <div
      className={`relative w-full rounded-3xl bg-slate-950 overflow-hidden border border-slate-200/80 shadow-md flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-sky-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Floating Controls */}
      {!compact && (
        <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between text-xs pointer-events-auto">
          {/* Angle Indicator Tag */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-slate-200 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-semibold">
              {isBackView ? 'Back View (180°)' : 'Front View (0°)'}
            </span>
          </div>

          {/* Controls: Flip, 360 Turn, Animate */}
          <div className="flex items-center gap-1.5">
            {/* Quick 180° Flip */}
            <button
              onClick={() => {
                setIsAutoRotating(false);
                setRotationDegrees((d) => (isBackView ? 0 : 180));
              }}
              className="px-2.5 py-1 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-xl text-white text-[11px] font-medium flex items-center gap-1 border border-white/10 transition-colors shadow-xs"
              title="Rotate 180 degrees"
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span>{isBackView ? 'Show Front' : 'Show Back'}</span>
            </button>

            {/* 360° Auto Turntable */}
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`px-2.5 py-1 backdrop-blur-md rounded-xl text-[11px] font-medium flex items-center gap-1 border transition-colors shadow-xs ${
                isAutoRotating
                  ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                  : 'bg-slate-900/85 hover:bg-slate-800 border-white/10 text-white'
              }`}
              title="Continuous 360 rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
              <span>360°</span>
            </button>

            {/* Play/Pause Movement */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-xl text-white text-[11px] font-medium flex items-center gap-1 border border-white/10 transition-colors shadow-xs"
              title={isPlaying ? 'Pause movement' : 'Animate movement'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Character Display with 3D Rotation Transform & Movement */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${getMovementClass()}`}
        style={{
          minHeight: compact ? '160px' : '260px',
          transform: `perspective(800px) rotateY(${perspectiveY}deg)`,
        }}
      >
        {/* CHARACTER IMAGE: FRONT OR BACK VIEW */}
        <img
          src={isBackView ? (customBackImage || CHARACTER_BACK_IMAGE) : (customFrontImage || CHARACTER_IMAGE)}
          alt={isBackView ? 'Mannequin Posterior Back View' : 'Mannequin Anterior Front View'}
          className="w-full h-full object-contain pointer-events-none max-h-[340px] transition-opacity duration-300"
        />

        {/* ANATOMICAL MUSCLE SVG MESH - Colors the muscle tissue directly */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 1500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="blueMuscleGlow360" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="redMuscleGlow360" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* CONDITIONAL RENDERING BASED ON VIEW ANGLE */}
          {!isBackView ? (
            /* ================= FRONT VIEW MUSCLES ================= */
            <>
              {/* Chest */}
              {renderColoredMuscle(chestRole, frontChestPaths, { x: 500, y: 440 })}

              {/* Shoulders */}
              {renderColoredMuscle(shouldersRole, frontShoulderPaths, { x: 340, y: 390 })}

              {/* Biceps */}
              {renderColoredMuscle(bicepsRole, frontBicepPaths, { x: 295, y: 495 })}

              {/* Abs & Core */}
              {renderColoredMuscle(coreRole, frontCorePaths, { x: 500, y: 570 })}

              {/* Front Quads */}
              {renderColoredMuscle(legsRole, frontLegPaths, { x: 420, y: 940 })}
            </>
          ) : (
            /* ================= BACK VIEW MUSCLES ================= */
            <>
              {/* Back / Latissimus Dorsi & Rhomboids */}
              {renderColoredMuscle(backRole, backLatPaths, { x: 500, y: 520 })}

              {/* Trapezius (Diamond Upper Back) */}
              {renderColoredMuscle(backRole || shouldersRole, backTrapPaths, { x: 500, y: 330 })}

              {/* Rear Deltoids */}
              {renderColoredMuscle(shouldersRole, backRearDeltPaths, { x: 340, y: 400 })}

              {/* Triceps (Posterior Upper Arm) */}
              {renderColoredMuscle(tricepsRole, backTricepPaths, { x: 285, y: 510 })}

              {/* Hamstrings & Calves */}
              {renderColoredMuscle(legsRole, backLegPaths, { x: 420, y: 950 })}
            </>
          )}
        </svg>
      </div>

      {/* 360-Degree Interactive Drag Slider */}
      {!compact && (
        <div className="w-full px-4 pt-1 pb-2 bg-slate-900/95 border-t border-white/5 flex items-center gap-3 z-30">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Angle ({Math.round(normalizedAngle)}°)</span>
          </span>

          <input
            type="range"
            min="0"
            max="360"
            value={normalizedAngle}
            onChange={(e) => {
              setIsAutoRotating(false);
              setRotationDegrees(parseInt(e.target.value, 10));
            }}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setIsAutoRotating(false);
                setRotationDegrees(0);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                !isBackView ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => {
                setIsAutoRotating(false);
                setRotationDegrees(180);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                isBackView ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Bottom Muscle Target Legend Bar */}
      <div className="w-full bg-slate-900/98 backdrop-blur-md px-3.5 py-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-3">
          {/* Primary Muscle Colored in Light Blue */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-sky-400 border border-white shadow-[0_0_10px_#38BDF8]" />
            <span className="text-xs font-bold text-sky-300">
              Primary (Light Blue):{' '}
              <span className="text-white font-medium">{primaryMuscle}</span>
            </span>
          </div>

          {/* Secondary Muscle Colored in Light Red */}
          {secondaryMuscles.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400 border border-white shadow-[0_0_10px_#F87171]" />
              <span className="text-xs font-bold text-red-300">
                Secondary (Light Red):{' '}
                <span className="text-white font-medium">
                  {secondaryMuscles.slice(0, 2).join(', ')}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-300 font-mono tracking-tight bg-slate-800 px-2 py-0.5 rounded-md border border-white/10">
          {isBackView ? 'Viewing Posterior (Back)' : 'Viewing Anterior (Front)'}
        </div>
      </div>
    </div>
  );
};
