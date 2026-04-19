"use client";

import { useMemo, useState } from "react";
import { cn } from "@/app/_components/ui-kit/shared";
import type { KnowledgeGraphDataResponse } from "@/lib/api/frontend";

type PositionedNode = {
  id: string;
  label: string;
  properties: Record<string, unknown>;
  x: number;
  y: number;
};

type KnowledgeGraphVisualizerProps = {
  dark: boolean;
  graph: KnowledgeGraphDataResponse | null | undefined;
};

const WIDTH = 920;
const HEIGHT = 520;

function positionNodes(graph: KnowledgeGraphDataResponse): PositionedNode[] {
  const nodes = graph.nodes ?? [];
  const total = Math.max(nodes.length, 1);
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const radius = Math.min(WIDTH, HEIGHT) * 0.34;

  return nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    return {
      id: node.id,
      label: node.label,
      properties: node.properties ?? {},
      x,
      y,
    };
  });
}

export function KnowledgeGraphVisualizer({
  dark,
  graph,
}: KnowledgeGraphVisualizerProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const positionedNodes = useMemo(
    () => (graph ? positionNodes(graph) : []),
    [graph],
  );
  const nodeMap = useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes],
  );
  const activeNode =
    (activeNodeId ? nodeMap.get(activeNodeId) : null) ?? positionedNodes[0] ?? null;

  if (!graph) {
    return (
      <div
        className={cn(
          "flex min-h-[320px] items-center justify-center border text-sm",
          dark
            ? "border-[#262626] bg-[#101010] text-[#767575]"
            : "border-[#b5c0ca] bg-white text-[#64748b]",
        )}
      >
        No graph data yet.
      </div>
    );
  }

  if (positionedNodes.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[320px] items-center justify-center border text-sm",
          dark
            ? "border-[#262626] bg-[#101010] text-[#767575]"
            : "border-[#b5c0ca] bg-white text-[#64748b]",
        )}
      >
        Graph is empty. Ingest a note to generate knowledge nodes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "overflow-hidden border",
          dark ? "border-[#262626] bg-[#101010]" : "border-[#9aa7b3] bg-white",
        )}
      >
        <svg
          aria-label="Knowledge graph"
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <defs>
            <linearGradient id="kg-edge" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={dark ? "rgba(105,218,255,0.55)" : "rgba(0,103,125,0.55)"}
              />
              <stop
                offset="100%"
                stopColor={dark ? "rgba(156,255,147,0.48)" : "rgba(0,110,23,0.48)"}
              />
            </linearGradient>
          </defs>

          {graph.edges.map((edge, index) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);

            if (!source || !target) {
              return null;
            }

            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2;

            return (
              <g key={`${edge.source}-${edge.target}-${index}`}>
                <line
                  stroke="url(#kg-edge)"
                  strokeWidth={1.5}
                  x1={source.x}
                  x2={target.x}
                  y1={source.y}
                  y2={target.y}
                />
                <text
                  fill={dark ? "#69daff" : "#00677d"}
                  fontSize={9}
                  textAnchor="middle"
                  x={mx}
                  y={my - 4}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {positionedNodes.map((node) => {
            const active = node.id === (activeNodeId ?? activeNode?.id);

            return (
              <g
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  fill={active ? (dark ? "#9cff93" : "#22c55e") : dark ? "#69daff" : "#0ea5b7"}
                  r={active ? 22 : 18}
                  stroke={dark ? "#0e0e0e" : "#e2e8f0"}
                  strokeWidth={2}
                />
                <text
                  fill={dark ? "#e5ffe3" : "#032f10"}
                  fontSize={10}
                  fontWeight={700}
                  textAnchor="middle"
                  x={node.x}
                  y={node.y + 4}
                >
                  {node.label.slice(0, 10)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {activeNode ? (
        <div
          className={cn(
            "border p-3 text-xs",
            dark ? "border-[#262626] bg-[#101010] text-[#d4d4d4]" : "border-[#9aa7b3] bg-white text-[#334155]",
          )}
        >
          <div
            className={cn(
              "mb-2 font-pixel text-[10px] uppercase",
              dark ? "text-[#9cff93]" : "text-[#006e17]",
            )}
          >
            Active Node: {activeNode.label}
          </div>
          <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-words">
            {JSON.stringify(activeNode.properties, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

