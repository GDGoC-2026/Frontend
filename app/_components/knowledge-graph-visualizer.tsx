"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { cn } from "@/app/_components/ui-kit/shared";
import type { KnowledgeGraphDataResponse } from "@/lib/api/frontend";

type PositionedNode = {
  degree: number;
  id: string;
  label: string;
  properties: Record<string, unknown>;
  tier: "hub" | "core" | "leaf";
  x: number;
  y: number;
};

type KnowledgeGraphVisualizerProps = {
  dark: boolean;
  graph: KnowledgeGraphDataResponse | null | undefined;
};

type ViewportState = {
  scale: number;
  tx: number;
  ty: number;
};

const WIDTH = 920;
const HEIGHT = 520;
const MIN_SCALE = 0.55;
const MAX_SCALE = 2.6;

function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, Math.max(1, length - 3))}...`;
}

function safeLabel(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isPrimitive(value: unknown): value is string | number | boolean | null {
  return value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function formatPrimitive(value: string | number | boolean | null) {
  if (value == null) {
    return "N/A";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function buildNodes(graph: KnowledgeGraphDataResponse) {
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];
  const degreeMap = new Map<string, number>();

  for (const edge of edges) {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + 1);
  }

  const built = nodes.map((node, index) => {
    const id = safeLabel(node.id, `node-${index}`);
    const degree = degreeMap.get(id) ?? 0;
    const tier: PositionedNode["tier"] = degree >= 4 ? "hub" : degree >= 2 ? "core" : "leaf";

    return {
      degree,
      id,
      label: safeLabel(node.label, id),
      properties: node.properties ?? {},
      tier,
      x: WIDTH / 2,
      y: HEIGHT / 2,
    } satisfies PositionedNode;
  });

  return built;
}

function buildDistanceMap(edges: KnowledgeGraphDataResponse["edges"], focusNodeId: string) {
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, new Set());
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, new Set());
    }
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const distances = new Map<string, number>();
  distances.set(focusNodeId, 0);
  const queue = [focusNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const currentDistance = distances.get(current) ?? 0;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDistance + 1);
        queue.push(neighbor);
      }
    }
  }

  return { adjacency, distances };
}

function positionNodes(
  graph: KnowledgeGraphDataResponse,
  focusNodeId: string | null,
): PositionedNode[] {
  const edges = graph.edges ?? [];
  const builtNodes = buildNodes(graph);
  const total = builtNodes.length;

  if (total === 0) {
    return [];
  }

  const focusCandidate =
    (focusNodeId && builtNodes.find((node) => node.id === focusNodeId)?.id) ??
    builtNodes.reduce((best, current) => (current.degree > best.degree ? current : best), builtNodes[0]).id;

  const { adjacency, distances } = buildDistanceMap(edges, focusCandidate);
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const ringStep = 92;
  const ringBase = 80;

  const rings = new Map<number, PositionedNode[]>();
  for (const node of builtNodes) {
    const distance = distances.get(node.id);
    const ring = distance == null ? 4 : Math.min(distance, 4);
    if (!rings.has(ring)) {
      rings.set(ring, []);
    }
    rings.get(ring)?.push(node);
  }

  for (const [ring, ringNodes] of rings.entries()) {
    if (ring === 0) {
      ringNodes[0].x = centerX;
      ringNodes[0].y = centerY;
      continue;
    }

    ringNodes.sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label));
    const radius = ringBase + ring * ringStep;
    const step = (Math.PI * 2) / Math.max(ringNodes.length, 1);
    const offset = ring % 2 === 0 ? step / 2 : 0;

    ringNodes.forEach((node, index) => {
      const angle = offset + index * step;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });
  }

  const anchors = new Map(builtNodes.map((node) => [node.id, { x: node.x, y: node.y }]));
  const edgeStrength = 0.012;
  const anchorStrength = 0.06;
  const repulsionStrength = 6400;

  for (let iteration = 0; iteration < 70; iteration += 1) {
    for (let i = 0; i < builtNodes.length; i += 1) {
      for (let j = i + 1; j < builtNodes.length; j += 1) {
        const a = builtNodes[i];
        const b = builtNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 0.1;
        const minDistance = 40 + Math.min((a.degree + b.degree) * 1.4, 24);

        if (distance < minDistance) {
          const force = (repulsionStrength / (distance * distance)) * 0.01;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          a.x -= fx;
          a.y -= fy;
          b.x += fx;
          b.y += fy;
        }
      }
    }

    for (const edge of edges) {
      const source = builtNodes.find((node) => node.id === edge.source);
      const target = builtNodes.find((node) => node.id === edge.target);
      if (!source || !target) {
        continue;
      }

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      source.x += dx * edgeStrength;
      source.y += dy * edgeStrength;
      target.x -= dx * edgeStrength;
      target.y -= dy * edgeStrength;
    }

    for (const node of builtNodes) {
      const anchor = anchors.get(node.id);
      if (!anchor) {
        continue;
      }
      node.x += (anchor.x - node.x) * anchorStrength;
      node.y += (anchor.y - node.y) * anchorStrength;
      node.x = clamp(node.x, 28, WIDTH - 28);
      node.y = clamp(node.y, 28, HEIGHT - 28);
    }
  }

  builtNodes.sort((a, b) => a.degree - b.degree);
  if (focusCandidate) {
    const focusIndex = builtNodes.findIndex((node) => node.id === focusCandidate);
    if (focusIndex >= 0) {
      const [focusNode] = builtNodes.splice(focusIndex, 1);
      builtNodes.push(focusNode);
    }
  }

  return builtNodes;
}

export function KnowledgeGraphVisualizer({
  dark,
  graph,
}: KnowledgeGraphVisualizerProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, tx: 0, ty: 0 });
  const [dragState, setDragState] = useState<{ x: number; y: number } | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeOverrides, setNodeOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement | null>(null);

  const edges = graph?.edges ?? [];
  const baseNodes = useMemo(
    () => (graph ? positionNodes(graph, null) : []),
    [graph],
  );
  const positionedNodes = useMemo(
    () =>
      baseNodes.map((node) => {
        const override = nodeOverrides[node.id];
        if (!override) {
          return node;
        }
        return {
          ...node,
          x: override.x,
          y: override.y,
        };
      }),
    [baseNodes, nodeOverrides],
  );
  const nodeMap = useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes],
  );
  const activeNode =
    (activeNodeId ? nodeMap.get(activeNodeId) : null) ?? positionedNodes[positionedNodes.length - 1] ?? null;
  const hubCount = positionedNodes.filter((node) => node.tier === "hub").length;

  const connectedEdges = useMemo(() => {
    if (!activeNode) {
      return [];
    }
    return edges.filter((edge) => edge.source === activeNode.id || edge.target === activeNode.id);
  }, [activeNode, edges]);

  const connectedNodeLabels = useMemo(() => {
    if (!activeNode) {
      return [];
    }
    const labels = new Set<string>();
    for (const edge of connectedEdges) {
      const neighborId = edge.source === activeNode.id ? edge.target : edge.source;
      const neighbor = nodeMap.get(neighborId);
      if (neighbor) {
        labels.add(neighbor.label);
      }
    }
    return Array.from(labels).slice(0, 10);
  }, [activeNode, connectedEdges, nodeMap]);

  const relationshipLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const edge of connectedEdges) {
      labels.add(safeLabel(edge.label, "related"));
    }
    return Array.from(labels).slice(0, 8);
  }, [connectedEdges]);

  const activeInsight = useMemo(() => {
    if (!activeNode) {
      return null;
    }

    const properties = activeNode.properties ?? {};
    const summaryKeys = ["description", "summary", "entity_type", "source_id", "file_path", "doc_id", "created_at"];
    const summaryItems: Array<{ key: string; value: string }> = [];
    const extraItems: Array<{ key: string; value: string }> = [];

    for (const key of summaryKeys) {
      const value = properties[key];
      if (isPrimitive(value)) {
        const text = formatPrimitive(value).trim();
        if (text && text !== "N/A") {
          summaryItems.push({ key, value: text });
        }
      }
    }

    for (const [key, value] of Object.entries(properties)) {
      if (summaryKeys.includes(key)) {
        continue;
      }
      if (isPrimitive(value)) {
        const text = formatPrimitive(value).trim();
        if (text && text !== "N/A") {
          extraItems.push({ key, value: text });
        }
      }
    }

    return {
      extraItems: extraItems.slice(0, 8),
      summaryItems: summaryItems.slice(0, 8),
    };
  }, [activeNode]);

  useEffect(() => {
    const validIds = new Set(baseNodes.map((node) => node.id));
    setNodeOverrides((current) => {
      const next: Record<string, { x: number; y: number }> = {};
      let changed = false;
      for (const [id, value] of Object.entries(current)) {
        if (validIds.has(id)) {
          next[id] = value;
        } else {
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [baseNodes]);

  const toWorldPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) {
      return null;
    }
    const rect = svg.getBoundingClientRect();
    const pointX = ((clientX - rect.left) / rect.width) * WIDTH;
    const pointY = ((clientY - rect.top) / rect.height) * HEIGHT;
    return {
      x: (pointX - viewport.tx) / viewport.scale,
      y: (pointY - viewport.ty) / viewport.scale,
    };
  };

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const pointX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const pointY = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    const direction = event.deltaY > 0 ? -1 : 1;
    const factor = direction > 0 ? 1.12 : 0.89;
    const nextScale = clamp(viewport.scale * factor, MIN_SCALE, MAX_SCALE);

    const worldX = (pointX - viewport.tx) / viewport.scale;
    const worldY = (pointY - viewport.ty) / viewport.scale;
    const nextTx = pointX - worldX * nextScale;
    const nextTy = pointY - worldY * nextScale;

    setViewport({
      scale: nextScale,
      tx: nextTx,
      ty: nextTy,
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    setDragState({ x: event.clientX, y: event.clientY });
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (draggedNodeId) {
      const worldPoint = toWorldPoint(event.clientX, event.clientY);
      if (!worldPoint) {
        return;
      }

      setNodeOverrides((current) => ({
        ...current,
        [draggedNodeId]: {
          x: clamp(worldPoint.x, 24, WIDTH - 24),
          y: clamp(worldPoint.y, 24, HEIGHT - 24),
        },
      }));
      return;
    }

    if (!dragState) {
      return;
    }

    const dx = event.clientX - dragState.x;
    const dy = event.clientY - dragState.y;

    setViewport((current) => ({
      scale: current.scale,
      tx: current.tx + dx,
      ty: current.ty + dy,
    }));
    setDragState({ x: event.clientX, y: event.clientY });
  };

  const handlePointerUp = () => {
    setDragState(null);
    setDraggedNodeId(null);
  };

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
          "grid grid-cols-2 gap-2 border p-2 text-[10px] uppercase tracking-[0.16em] lg:grid-cols-5",
          dark ? "border-[#262626] bg-[#0c0e11] text-[#9aa0a6]" : "border-[#9aa7b3] bg-[#f8fafc] text-[#475569]",
        )}
      >
        <div className="border border-current/20 px-2 py-1">Nodes: {positionedNodes.length}</div>
        <div className="border border-current/20 px-2 py-1">Edges: {edges.length}</div>
        <div className="border border-current/20 px-2 py-1">Hubs: {hubCount}</div>
        <div className="border border-current/20 px-2 py-1">Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
        <button
          className={cn(
            "border px-2 py-1 text-left font-pixel text-[10px] uppercase",
            dark
              ? "border-[#2e3845] bg-[#10161d] text-[#69daff] hover:bg-[#1a2330]"
              : "border-[#9aa7b3] bg-white text-[#00677d] hover:bg-[#e2ecf3]",
          )}
          onClick={() => setViewport({ scale: 1, tx: 0, ty: 0 })}
          type="button"
        >
          Reset View
        </button>
      </div>
      <div
        className={cn(
          "relative overflow-hidden border",
          dark ? "border-[#262626] bg-[#101010]" : "border-[#9aa7b3] bg-white",
        )}
        onWheel={handleWheel}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            dark
              ? "bg-[radial-gradient(circle_at_20%_20%,rgba(105,218,255,0.15),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(156,255,147,0.14),transparent_46%)]"
              : "bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,183,0.1),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.1),transparent_46%)]",
          )}
        />
        <svg
          aria-label="Knowledge graph"
          className={cn("relative z-[1] h-auto w-full", dragState || draggedNodeId ? "cursor-grabbing" : "cursor-grab")}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <defs>
            <pattern height="26" id="kg-grid" patternUnits="userSpaceOnUse" width="26">
              <path
                d="M 26 0 L 0 0 0 26"
                fill="none"
                stroke={dark ? "rgba(76,87,102,0.24)" : "rgba(148,163,184,0.35)"}
                strokeWidth="1"
              />
            </pattern>
            <filter height="200%" id="kg-glow" width="200%" x="-50%" y="-50%">
              <feGaussianBlur result="blur" stdDeviation="3" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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
            <linearGradient id="kg-edge-active" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor={dark ? "#69daff" : "#0e7490"} />
              <stop offset="100%" stopColor={dark ? "#9cff93" : "#16a34a"} />
            </linearGradient>
            <marker
              id="kg-arrow"
              markerHeight="6"
              markerUnits="strokeWidth"
              markerWidth="6"
              orient="auto"
              refX="6"
              refY="3"
            >
              <path d="M0,0 L0,6 L6,3 z" fill={dark ? "#69daff" : "#0e7490"} />
            </marker>
          </defs>

          <rect fill="url(#kg-grid)" height={HEIGHT} width={WIDTH} x={0} y={0} />

          <g transform={`translate(${viewport.tx} ${viewport.ty}) scale(${viewport.scale})`}>
            {edges.map((edge, index) => {
              const source = nodeMap.get(edge.source);
              const target = nodeMap.get(edge.target);

              if (!source || !target) {
                return null;
              }

              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const distance = Math.hypot(dx, dy) || 1;
              const normalX = -dy / distance;
              const normalY = dx / distance;
              const bend = 14 + (index % 3) * 5;
              const cx = (source.x + target.x) / 2 + normalX * bend;
              const cy = (source.y + target.y) / 2 + normalY * bend;
              const labelX = (source.x + 2 * cx + target.x) / 4;
              const labelY = (source.y + 2 * cy + target.y) / 4;
              const relatedToActive =
                activeNode != null && (edge.source === activeNode.id || edge.target === activeNode.id);

              return (
                <g key={`${edge.source}-${edge.target}-${index}`}>
                  <path
                    d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                    fill="none"
                    filter={relatedToActive ? "url(#kg-glow)" : undefined}
                    markerEnd="url(#kg-arrow)"
                    stroke={relatedToActive ? "url(#kg-edge-active)" : "url(#kg-edge)"}
                    strokeOpacity={relatedToActive ? 1 : 0.7}
                    strokeWidth={relatedToActive ? 2.2 : 1.2}
                  />
                  {relatedToActive ? (
                    <text
                      fill={dark ? "#69daff" : "#00677d"}
                      fontFamily="var(--font-pixel)"
                      fontSize={8}
                      textAnchor="middle"
                      x={labelX}
                      y={labelY - 4}
                    >
                      {truncate(safeLabel(edge.label, "related"), 18)}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {positionedNodes.map((node) => {
              const active = node.id === activeNode?.id;
              const tierStyle =
                node.tier === "hub"
                  ? {
                      fill: dark ? "#9cff93" : "#22c55e",
                      stroke: dark ? "#e5ffe3" : "#14532d",
                    }
                  : node.tier === "core"
                    ? {
                        fill: dark ? "#69daff" : "#0ea5b7",
                        stroke: dark ? "#d9f8ff" : "#164e63",
                      }
                    : {
                        fill: dark ? "#a78bfa" : "#6366f1",
                        stroke: dark ? "#ede9fe" : "#312e81",
                      };
              const radius = active ? 24 : node.tier === "hub" ? 18 : 14;
              const label = truncate(node.label, active ? 18 : 12);

              return (
                <g
                  key={node.id}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setDraggedNodeId(node.id);
                    setActiveNodeId(node.id);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveNodeId(node.id);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    fill={active ? "rgba(156,255,147,0.24)" : "rgba(105,218,255,0.12)"}
                    r={radius + 6}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    fill={tierStyle.fill}
                    filter={active ? "url(#kg-glow)" : undefined}
                    r={radius}
                    stroke={tierStyle.stroke}
                    strokeWidth={active ? 2.6 : 1.5}
                  />
                  <text
                    fill={dark ? "#e5ffe3" : "#032f10"}
                    fontSize={active ? 9 : 8}
                    fontWeight={700}
                    textAnchor="middle"
                    x={node.x}
                    y={node.y + radius + 11}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {activeNode ? (
        <div
          className={cn(
            "border p-3 text-xs",
            dark ? "border-[#262626] bg-[#0f1216] text-[#d4d4d4]" : "border-[#9aa7b3] bg-white text-[#334155]",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div
              className={cn(
                "font-pixel text-[10px] uppercase",
                dark ? "text-[#9cff93]" : "text-[#006e17]",
              )}
            >
              Focus Node
            </div>
            <div
              className={cn(
                "font-pixel text-[10px] uppercase",
                dark ? "text-[#69daff]" : "text-[#00677d]",
              )}
            >
              degree: {activeNode.degree}
            </div>
          </div>
          <div className="mb-3 text-sm font-semibold">{activeNode.label}</div>

          {activeInsight?.summaryItems.length ? (
            <div className="mb-3 grid gap-2 md:grid-cols-2">
              {activeInsight.summaryItems.map((item) => (
                <div
                  className={cn(
                    "border px-2 py-1.5",
                    dark ? "border-[#2a2f36] bg-[#0c0f13]" : "border-[#cbd5e1] bg-[#f8fafc]",
                  )}
                  key={item.key}
                >
                  <div className="font-pixel text-[9px] uppercase tracking-[0.14em] text-white/55">{item.key}</div>
                  <div className="mt-1 text-[11px]">{truncate(item.value, 140)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {connectedNodeLabels.length ? (
            <div className="mb-3">
              <div className="mb-1 font-pixel text-[10px] uppercase tracking-[0.14em] text-white/60">Connected Concepts</div>
              <div className="flex flex-wrap gap-1.5">
                {connectedNodeLabels.map((label) => (
                  <span
                    className={cn(
                      "border px-2 py-1 font-pixel text-[9px] uppercase",
                      dark ? "border-[#314156] bg-[#0d1521] text-[#9dd8ff]" : "border-[#94a3b8] bg-[#e2e8f0] text-[#0f172a]",
                    )}
                    key={label}
                  >
                    {truncate(label, 24)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {relationshipLabels.length ? (
            <div className="mb-3">
              <div className="mb-1 font-pixel text-[10px] uppercase tracking-[0.14em] text-white/60">Relationships</div>
              <div className="flex flex-wrap gap-1.5">
                {relationshipLabels.map((label) => (
                  <span
                    className={cn(
                      "border px-2 py-1 font-pixel text-[9px] uppercase",
                      dark ? "border-[#2f3d2f] bg-[#10180f] text-[#b6ffc3]" : "border-[#86efac] bg-[#dcfce7] text-[#14532d]",
                    )}
                    key={label}
                  >
                    {truncate(label, 24)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {activeInsight?.extraItems.length ? (
            <div>
              <div className="mb-1 font-pixel text-[10px] uppercase tracking-[0.14em] text-white/60">Metadata</div>
              <div className="grid gap-1.5 md:grid-cols-2">
                {activeInsight.extraItems.map((item) => (
                  <div
                    className={cn(
                      "border px-2 py-1",
                      dark ? "border-[#262b32] bg-[#0b0f13]" : "border-[#cbd5e1] bg-[#f8fafc]",
                    )}
                    key={item.key}
                  >
                    <span className="font-pixel text-[9px] uppercase text-white/55">{item.key}</span>: {truncate(item.value, 70)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
