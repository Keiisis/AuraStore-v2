"use client";

import { motion } from "framer-motion";
import { formatPrice, CurrencyCode } from "@/lib/currency-engine";
import { TrendingUp, MousePointer2 } from "lucide-react";

interface SalesChartProps {
    data: { date: string; total: number }[];
    predictions?: { date: string; total: number }[];
    currency: CurrencyCode;
}

export function SalesChart({ data, predictions = [], currency }: SalesChartProps) {
    const combinedData = [...data, ...predictions];
    const maxVal = Math.max(...combinedData.map((d) => d.total), 1);
    const height = 200;
    const width = 1000;

    const dataPoints = data.map((d, i) => ({
        x: (i / (combinedData.length - 1)) * width,
        y: height - (d.total / (maxVal * 1.2)) * height,
        val: d.total,
        date: d.date,
        isPrediction: false
    }));

    const predictionPoints = predictions.map((d, i) => ({
        x: ((data.length + i) / (combinedData.length - 1)) * width,
        y: height - (d.total / (maxVal * 1.2)) * height,
        val: d.total,
        date: d.date,
        isPrediction: true
    }));

    const allPoints = [...dataPoints, ...predictionPoints];

    const pathData = `M ${dataPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;

    // Prediction path starts from last data point
    const lastDataPoint = dataPoints[dataPoints.length - 1];
    const predictionPathData = lastDataPoint
        ? `M ${lastDataPoint.x},${lastDataPoint.y} L ${predictionPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`
        : "";

    const areaData = `${pathData} L ${dataPoints[dataPoints.length - 1]?.x},${height} L 0,${height} Z`;

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-display font-black text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Flux Aura en expansion
                    </h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest px-1 border-l border-primary/30 ml-1">Performances + Projections IA</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#fe7501]" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Actuel ({currency})</span>
                    </div>
                    {predictions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full border border-primary/50 border-dashed" />
                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Prédit par Aura IA</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] border border-white/[0.03] p-8 min-h-[350px] relative overflow-hidden group/chart">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

                <div className="absolute inset-x-8 top-8 bottom-16 flex flex-col justify-between pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full h-px bg-white/[0.02]" />
                    ))}
                </div>

                <div className="relative h-[250px] w-full mt-4">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fe7501" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#fe7501" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area Fill */}
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            d={areaData}
                            fill="url(#chartGradient)"
                        />

                        {/* Real Data Line */}
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            d={pathData}
                            fill="none"
                            stroke="#fe7501"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Prediction Line */}
                        {predictionPathData && (
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.5 }}
                                transition={{ delay: 2, duration: 1.5 }}
                                d={predictionPathData}
                                fill="none"
                                stroke="#fe7501"
                                strokeWidth="2"
                                strokeDasharray="6,4"
                                strokeLinecap="round"
                            />
                        )}

                        {/* Points */}
                        {allPoints.map((p, i) => (
                            (p.val > 0 || p.isPrediction) && (
                                <g key={i} className="group/point cursor-pointer">
                                    <motion.circle
                                        initial={{ r: 0 }}
                                        animate={{ r: p.isPrediction ? 3 : 4 }}
                                        transition={{ delay: (p.isPrediction ? 3 : 2) + i * 0.01 }}
                                        cx={p.x}
                                        cy={p.y}
                                        fill={p.isPrediction ? "transparent" : "#fe7501"}
                                        stroke={p.isPrediction ? "#fe7501" : "none"}
                                        strokeWidth={p.isPrediction ? 1 : 0}
                                        className={p.isPrediction ? "opacity-50" : "shadow-[0_0_15px_#fe7501]"}
                                    />
                                    <foreignObject x={p.x - 50} y={p.y - 70} width="100" height="60" className="opacity-0 group-hover/point:opacity-100 transition-opacity z-50">
                                        <div className={`backdrop-blur-md border p-2 rounded-xl text-center pointer-events-none ${p.isPrediction ? 'bg-primary/20 border-primary/30' : 'bg-black/80 border-white/10'}`}>
                                            <p className="text-[8px] text-white/40 uppercase font-black tracking-widest">
                                                {p.isPrediction ? "Projection IA" : new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-[10px] text-white font-black">{formatPrice(p.val, currency)}</p>
                                        </div>
                                    </foreignObject>
                                </g>
                            )
                        ))}
                    </svg>
                </div>

                <div className="absolute inset-x-8 bottom-8 flex justify-between">
                    {allPoints.filter((_, i) => i % 9 === 0).map((p, i) => (
                        <span key={i} className={`text-[9px] font-black uppercase tracking-widest ${p.isPrediction ? 'text-primary/40' : 'text-white/20'}`}>
                            {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                    ))}
                </div>

                <div className="absolute top-4 right-8 flex items-center gap-2 opacity-20">
                    <MousePointer2 className="w-3 h-3 text-white" />
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter italic">Période d'Expansion Détectée</span>
                </div>
            </div>
        </div>
    );
}
