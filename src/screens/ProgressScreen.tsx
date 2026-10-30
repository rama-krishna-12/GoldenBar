import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Plus,
  Scale,
  Ruler,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { BodyMeasurement } from '../types';
import { HeaderBar } from '../components/HeaderBar';

interface ProgressScreenProps {
  measurements: BodyMeasurement[];
  onAddMeasurement: (entry: BodyMeasurement) => void;
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  measurements,
  onAddMeasurement,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const latest = measurements[measurements.length - 1];
  const previous = measurements[measurements.length - 2] || latest;

  // New entry form state
  const [newWeight, setNewWeight] = useState(latest.weightKg.toString());
  const [newChest, setNewChest] = useState(latest.chest.toString());
  const [newWaist, setNewWaist] = useState(latest.waist.toString());
  const [newHips, setNewHips] = useState(latest.hips.toString());
  const [newArm, setNewArm] = useState(latest.arm.toString());
  const [newThigh, setNewThigh] = useState(latest.thigh.toString());

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: BodyMeasurement = {
      id: `bm_${Date.now()}`,
      date: 'Just now',
      weightKg: parseFloat(newWeight) || latest.weightKg,
      chest: parseFloat(newChest) || latest.chest,
      waist: parseFloat(newWaist) || latest.waist,
      hips: parseFloat(newHips) || latest.hips,
      arm: parseFloat(newArm) || latest.arm,
      thigh: parseFloat(newThigh) || latest.thigh,
    };
    onAddMeasurement(entry);
    setShowAddModal(false);
  };

  // SVG Chart calculation for weight
  const weights = measurements.map((m) => m.weightKg);
  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const weightDelta = (latest.weightKg - measurements[0].weightKg).toFixed(1);

  // SVG path coordinates
  const svgWidth = 320;
  const svgHeight = 110;
  const paddingX = 20;
  const paddingY = 15;

  const points = measurements.map((m, index) => {
    const x = paddingX + (index / (measurements.length - 1)) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      ((m.weightKg - minWeight) / (maxWeight - minWeight)) * (svgHeight - paddingY * 2);
    return { x, y, weight: m.weightKg, date: m.date };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  // Body parts diff list
  const metricsList = [
    { label: 'Chest', current: latest.chest, prev: previous.chest, unit: 'cm' },
    { label: 'Waist', current: latest.waist, prev: previous.waist, unit: 'cm' },
    { label: 'Hips', current: latest.hips, prev: previous.hips, unit: 'cm' },
    { label: 'Arm Biceps', current: latest.arm, prev: previous.arm, unit: 'cm' },
    { label: 'Thighs', current: latest.thigh, prev: previous.thigh, unit: 'cm' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar
        title="Body Progress"
        subtitle="Weight trends & circumference tracking"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        }
      />

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
            <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
              Add Body Measurement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your current weight and circumference metrics.
            </p>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Hips (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newHips}
                    onChange={(e) => setNewHips(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Arm (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newArm}
                    onChange={(e) => setNewArm(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Thigh (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newThigh}
                  onChange={(e) => setNewThigh(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 sm:p-5 space-y-4 pb-20">
        {/* Weight Trend Chart Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block">
                Weight Trend (8 Weeks)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="font-heading font-bold text-3xl text-slate-900 tabular-nums">
                  {latest.weightKg}
                </h2>
                <span className="text-sm font-semibold text-slate-500">kg</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                    parseFloat(weightDelta) <= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {parseFloat(weightDelta) <= 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5" />
                  )}
                  <span>{weightDelta} kg overall</span>
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full overflow-hidden pt-2 pb-1">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-32 overflow-visible"
            >
              <defs>
                <linearGradient id="skyArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <path d={areaD} fill="url(#skyArea)" />

              {/* Trend Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#0284C7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={i === points.length - 1 ? 5 : 3.5}
                    className={
                      i === points.length - 1
                        ? 'fill-sky-500 stroke-white stroke-2'
                        : 'fill-white stroke-sky-500 stroke-2'
                    }
                  />
                  <text
                    x={pt.x}
                    y={svgHeight}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-medium"
                  >
                    {pt.date.replace(' weeks ago', 'w')}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Body Circumferences List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Body Measurements
                </h3>
                <span className="text-xs text-slate-500">Key muscle & waist metrics</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {metricsList.map((metric) => {
              const diff = (metric.current - metric.prev).toFixed(1);
              const numDiff = parseFloat(diff);

              return (
                <div
                  key={metric.label}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-700">
                    {metric.label}
                  </span>

                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-bold text-sm text-slate-900 tabular-nums">
                      {metric.current} <span className="text-[11px] font-normal text-slate-500">{metric.unit}</span>
                    </span>

                    {numDiff !== 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center ${
                          numDiff > 0
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {numDiff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
