import { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";
import { Loader2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const KnowledgeGraph = () => {
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef();
    const fgRef = useRef();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Track hover states for highlighting
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener("resize", updateDimensions);
        updateDimensions();

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await axios.get("http://localhost:8000/graph-data");
                const { nodes, edges } = response.data;

                const formattedNodes = nodes.map(node => {
                    const outcome = node.outcome ? node.outcome.toLowerCase() : "";
                    let color = isDark ? "#475569" : "#94a3b8"; // Slate
                    let stroke = isDark ? "#334155" : "#cbd5e1";

                    if (outcome.includes("completed") && !outcome.includes("partially")) {
                        color = "#10b981"; // Emerald
                        stroke = "#047857";
                    } else if (outcome.includes("partially")) {
                        color = "#f59e0b"; // Amber
                        stroke = "#b45309";
                    } else if (outcome.includes("abandoned") || outcome.includes("failed")) {
                        color = "#f43f5e"; // Rose
                        stroke = "#be123c";
                    } else if (outcome.includes("proof")) {
                        color = "#8b5cf6"; // Violet
                        stroke = "#6d28d9";
                    }

                    return {
                        id: node.id,
                        name: node.label,
                        val: node.size * 2,
                        color,
                        stroke,
                        department: node.department,
                        outcome: node.outcome
                    };
                });

                const formattedLinks = edges.map(edge => ({
                    source: edge.source,
                    target: edge.target,
                    name: edge.label,
                }));

                setGraphData({ nodes: formattedNodes, links: formattedLinks });
            } catch (error) {
                console.error("Failed to load graph data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGraphData();
    }, [isDark]);

    // Handle hovering logic to highlight connected nodes/edges
    const handleNodeHover = useCallback((node) => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (node) {
            highlightNodes.add(node);
            graphData.links.forEach(link => {
                if (link.source.id === node.id || link.target.id === node.id) {
                    highlightLinks.add(link);
                    highlightNodes.add(link.source.id === node.id ? link.target : link.source);
                }
            });
        }

        setHoverNode(node || null);
        setHighlightNodes(new Set(highlightNodes));
        setHighlightLinks(new Set(highlightLinks));
    }, [graphData]);

    const handleLinkHover = useCallback(link => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }

        setHighlightNodes(new Set(highlightNodes));
        setHighlightLinks(new Set(highlightLinks));
    }, []);

    // Custom Canvas Rendering for gorgeous nodes
    const paintNode = useCallback((node, ctx, globalScale) => {
        const isHovered = node === hoverNode;
        const isHighlighted = highlightNodes.has(node);
        // Dim nodes if something is hovered but this node isn't related
        const isMuted = hoverNode && !isHighlighted;

        const label = node.name;
        const fontSize = 12 / globalScale;
        const R = Math.sqrt(Math.max(0, node.val)) * (isHovered ? 4.5 : 4);

        // Draw outer glow if highlighted
        if (isHighlighted) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, R + 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();
        }

        // Draw Node Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, R, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = isMuted ? 0.2 : 1;
        ctx.fill();

        // Draw Node Stroke
        ctx.lineWidth = isHovered ? 2 / globalScale : 1 / globalScale;
        ctx.strokeStyle = node.stroke;
        ctx.stroke();

        // Draw Label
        if (globalScale > 1.5 || isHighlighted) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isMuted ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : (isDark ? '#e2e8f0' : '#334155');
            ctx.font = `${isHovered ? 'bold ' : ''}${fontSize}px Inter, sans-serif`;

            // Background box for label readability
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)';
            const padding = 2 / globalScale;
            ctx.fillRect(node.x - textWidth / 2 - padding, node.y + R + 1 - padding, textWidth + padding * 2, fontSize + padding * 2);

            ctx.fillStyle = isMuted ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : (isDark ? '#f8fafc' : '#0f172a');
            ctx.fillText(label, node.x, node.y + R + fontSize / 2 + 2 / globalScale);
        }
    }, [hoverNode, highlightNodes, isDark]);

    const paintLink = useCallback((link, ctx) => {
        const isHighlighted = highlightLinks.has(link);
        const isMuted = hoverNode && !isHighlighted;

        ctx.globalAlpha = isMuted ? 0.1 : (isHighlighted ? 0.8 : 0.4);
        ctx.strokeStyle = isHighlighted ? (isDark ? '#e2e8f0' : '#475569') : (isDark ? '#334155' : '#cbd5e1');
        ctx.lineWidth = isHighlighted ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
    }, [highlightLinks, hoverNode, isDark]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            <div className="p-6 border-b flex justify-between items-center bg-white dark:bg-slate-950 z-20 shadow-sm relative">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Project Knowledge Graph
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Hover to highlight connections. Click to view detailed project architecture.
                    </p>
                </div>
                <div className="flex gap-4 text-sm font-medium bg-slate-50 dark:bg-slate-900 border px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> Completed</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> Partial</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-500 shadow-sm" /> PoC/Research</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" /> Abandoned</div>
                </div>
            </div>

            <div ref={containerRef} className="flex-1 relative bg-[url(/grid.svg)] dark:bg-slate-950 overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="font-medium animate-pulse">Computing physics forces...</p>
                        </div>
                    </div>
                )}

                {!loading && graphData && dimensions.width > 0 && (
                    <ForceGraph2D
                        ref={fgRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}

                        nodeLabel={() => ''} // Disabled default tooltip to use custom canvas label
                        nodeColor={node => node.color}
                        nodeRelSize={6}

                        // Interaction
                        onNodeClick={node => navigate(`/project/${node.id}`)}
                        onNodeHover={handleNodeHover}
                        onLinkHover={handleLinkHover}

                        // Custom Canvas Painting
                        nodeCanvasObject={paintNode}
                        linkCanvasObject={paintLink}

                        // Physics forces mapping
                        d3Force={(forceType, force) => {
                            if (forceType === 'charge') force.strength(-400); // Push nodes further apart
                            if (forceType === 'link') force.distance(150); // Set edge length
                        }}
                        cooldownTicks={100} // Stop moving quickly
                        onEngineStop={() => fgRef.current?.zoomToFit(400, 50)} // Fit to screen once settled
                    />
                )}
            </div>
        </div>
    );
};

export default KnowledgeGraph;
