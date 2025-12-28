"use client"

import { useState } from "react"

interface DataPoint {
  date: string
  elo: number
  gameNumber: number
  hasElo: boolean
}

interface SimpleLineChartProps {
  data: DataPoint[]
}

export function SimpleLineChart({ data }: SimpleLineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  if (data.length === 0) return null

  // Chart dimensions
  const width = 800
  const height = 250
  const padding = { top: 20, right: 40, bottom: 40, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate min and max ELO for scaling
  const eloValues = data.map((d) => d.elo)
  const minElo = Math.floor(Math.min(...eloValues) - 50)
  const maxElo = Math.ceil(Math.max(...eloValues) + 50)
  const eloRange = maxElo - minElo

  // Scale functions
  const scaleX = (gameNumber: number) => {
    return padding.left + ((gameNumber - 1) / (data.length - 1)) * chartWidth
  }

  const scaleY = (elo: number) => {
    return padding.top + chartHeight - ((elo - minElo) / eloRange) * chartHeight
  }

  // Generate path for line
  const linePath = data
    .map((point, i) => {
      const x = scaleX(point.gameNumber)
      const y = scaleY(point.elo)
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = minElo + (eloRange / 4) * i
    return Math.round(value)
  })

  // X-axis ticks (show every nth game)
  const xTickInterval = Math.max(1, Math.floor(data.length / 8))
  const xTicks = data.filter((_, i) => i % xTickInterval === 0 || i === data.length - 1)

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick}
            x1={padding.left}
            y1={scaleY(tick)}
            x2={width - padding.right}
            y2={scaleY(tick)}
            stroke="#374151"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={tick}
            x={padding.left - 10}
            y={scaleY(tick)}
            textAnchor="end"
            alignmentBaseline="middle"
            fill="#9ca3af"
            fontSize="11"
          >
            {tick}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((point) => (
          <text
            key={point.gameNumber}
            x={scaleX(point.gameNumber)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="11"
          >
            {point.gameNumber}
          </text>
        ))}

        {/* X-axis label */}
        <text x={padding.left + chartWidth / 2} y={height - 5} textAnchor="middle" fill="#9ca3af" fontSize="12">
          Game #
        </text>

        {/* Line path */}
        <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth="2" />

        {/* Data points */}
        {data.map((point, i) => {
          const x = scaleX(point.gameNumber)
          const y = scaleY(point.elo)
          const isHovered = hoveredPoint === i

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3}
                fill={point.hasElo ? "#60a5fa" : "#6b7280"}
                stroke="none"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 60}
                    y={y - 50}
                    width="120"
                    height="40"
                    fill="#1f2937"
                    stroke="#374151"
                    strokeWidth="1"
                    rx="6"
                  />
                  <text x={x} y={y - 32} textAnchor="middle" fill="#e5e7eb" fontSize="11">
                    Game #{point.gameNumber}
                  </text>
                  <text x={x} y={y - 18} textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="bold">
                    ELO: {point.elo}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
