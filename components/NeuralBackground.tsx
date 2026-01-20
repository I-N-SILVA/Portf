"use client";

import React, { useEffect, useRef, memo } from "react";

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

const NeuralBackground = memo(function NeuralBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let nodes: Node[] = [];
        const nodeCount = 40; // Fewer nodes for better focus
        const connectionDistance = 200; // Larger connection distance
        const mouseConnectionDistance = 350; // Larger mouse influence

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initNodes();
        };

        const initNodes = () => {
            nodes = [];
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 1.8, // Faster movement
                    vy: (Math.random() - 0.5) * 1.8, // Faster movement
                    radius: Math.random() * 2 + 1,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mouse influence
            const targetMouseX = mouseRef.current.x;
            const targetMouseY = mouseRef.current.y;

            // Draw connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < nodes.length; i++) {
                const nodeA = nodes[i];

                // Connect to mouse
                const dxMouse = nodeA.x - targetMouseX;
                const dyMouse = nodeA.y - targetMouseY;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < mouseConnectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(204, 255, 0, ${(1 - distMouse / mouseConnectionDistance) * 0.4})`;
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(targetMouseX, targetMouseY);
                    ctx.stroke();

                    // Gentle attraction to mouse
                    nodeA.vx -= dxMouse * 0.0001;
                    nodeA.vy -= dyMouse * 0.0001;
                }

                // Connect to other nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / connectionDistance) * 0.15})`;
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            for (const node of nodes) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

                // Nodes near mouse glow
                const dx = node.x - targetMouseX;
                const dy = node.y - targetMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.fillStyle = `rgba(204, 255, 0, ${0.4 + (1 - dist / 150) * 0.6})`;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "#CCFF00";
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.shadowBlur = 0;
                }

                ctx.fill();

                // Update position
                node.x += node.vx;
                node.y += node.vy;

                // Friction to prevent over-acceleration
                node.vx *= 0.995;
                node.vy *= 0.995;

                // Bounce off walls with wrap-around for a smoother feel
                const margin = 20;
                if (node.x < -margin) node.x = canvas.width + margin;
                else if (node.x > canvas.width + margin) node.x = -margin;

                if (node.y < -margin) node.y = canvas.height + margin;
                else if (node.y > canvas.height + margin) node.y = -margin;
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);

        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.1 }}
        />
    );
});

export default NeuralBackground;
