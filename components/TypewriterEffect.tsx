"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    memo,
} from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

type SpeedPreset = "slow" | "normal" | "fast";
type CursorStyle = "line" | "block" | "underscore";

interface TypewriterEffectProps {
    /** Array of text lines to type sequentially */
    lines: string[];
    /** Typing speed - preset ('slow'|'normal'|'fast') or milliseconds per character */
    speed?: SpeedPreset | number;
    /** Pause duration between lines in milliseconds */
    pauseTime?: number;
    /** Style of the blinking cursor */
    cursorStyle?: CursorStyle;
    /** Callback fired when all lines have been typed */
    onComplete?: () => void;
    /** Callback fired when each line completes, receives line index */
    onLineComplete?: (lineIndex: number) => void;
    /** Whether to loop the animation infinitely */
    loop?: boolean;
    /** Whether to start typing automatically */
    autoStart?: boolean;
    /** Delay before starting in milliseconds */
    startDelay?: number;
    /** Whether to show a prompt character before each line */
    showPrompt?: boolean;
    /** Character(s) to use as prompt */
    promptChar?: string;
    /** Whether to wrap in a terminal-style window */
    terminalStyle?: boolean;
    /** Primary accent color for text and cursor */
    accentColor?: string;
    /** Background color of the terminal */
    backgroundColor?: string;
    /** Whether to show line numbers */
    showLineNumbers?: boolean;
    /** Additional CSS class for the container */
    className?: string;
}

// ============================================================================
// Speed Configuration
// ============================================================================

const SPEED_PRESETS: Record<SpeedPreset, number> = {
    slow: 100,
    normal: 50,
    fast: 25,
};

const getSpeedMs = (speed: SpeedPreset | number): number => {
    if (typeof speed === "number") return speed;
    return SPEED_PRESETS[speed] || SPEED_PRESETS.normal;
};

// ============================================================================
// Cursor Component
// ============================================================================

interface CursorProps {
    style: CursorStyle;
    accentColor: string;
    isTyping: boolean;
    prefersReducedMotion: boolean;
}

const Cursor = memo(function Cursor({
    style,
    accentColor,
    isTyping,
    prefersReducedMotion,
}: CursorProps) {
    const cursorStyles = useMemo(() => {
        const base: React.CSSProperties = {
            display: "inline-block",
            backgroundColor: style === "block" ? accentColor : "transparent",
            borderColor: accentColor,
            animation: prefersReducedMotion
                ? "none"
                : isTyping
                    ? "none"
                    : "cursor-blink 1s step-end infinite",
        };

        switch (style) {
            case "line":
                return {
                    ...base,
                    width: "2px",
                    height: "1.2em",
                    backgroundColor: accentColor,
                    verticalAlign: "text-bottom",
                    marginLeft: "1px",
                };
            case "block":
                return {
                    ...base,
                    width: "0.6em",
                    height: "1.2em",
                    opacity: 0.7,
                    verticalAlign: "text-bottom",
                    marginLeft: "1px",
                };
            case "underscore":
                return {
                    ...base,
                    width: "0.6em",
                    height: "2px",
                    backgroundColor: accentColor,
                    verticalAlign: "baseline",
                    marginLeft: "1px",
                    marginBottom: "-2px",
                };
            default:
                return base;
        }
    }, [style, accentColor, isTyping, prefersReducedMotion]);

    return <span style={cursorStyles} aria-hidden="true" />;
});

// ============================================================================
// Terminal Window Component
// ============================================================================

interface TerminalWindowProps {
    children: React.ReactNode;
    backgroundColor: string;
    accentColor: string;
}

const TerminalWindow = memo(function TerminalWindow({
    children,
    backgroundColor,
    accentColor,
}: TerminalWindowProps) {
    return (
        <div
            className="rounded-lg overflow-hidden shadow-2xl border border-white/10"
            style={{ backgroundColor }}
        >
            {/* macOS Traffic Lights */}
            <div
                className="flex items-center gap-2 px-4 py-3 border-b border-white/10"
                style={{ backgroundColor: `color-mix(in srgb, ${backgroundColor} 80%, white 5%)` }}
            >
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-inner" />
                <span
                    className="ml-4 text-xs opacity-50 font-mono"
                    style={{ color: accentColor }}
                >
                    terminal
                </span>
            </div>
            {/* Terminal Content */}
            <div className="p-4 md:p-6">{children}</div>
        </div>
    );
});

// ============================================================================
// Line Component
// ============================================================================

interface TypewriterLineProps {
    text: string;
    displayedText: string;
    lineIndex: number;
    isCurrentLine: boolean;
    isComplete: boolean;
    showPrompt: boolean;
    promptChar: string;
    showLineNumbers: boolean;
    showCursor: boolean;
    cursorStyle: CursorStyle;
    accentColor: string;
    isTyping: boolean;
    prefersReducedMotion: boolean;
    totalLines: number;
}

const TypewriterLine = memo(function TypewriterLine({
    displayedText,
    lineIndex,
    isCurrentLine,
    showPrompt,
    promptChar,
    showLineNumbers,
    showCursor,
    cursorStyle,
    accentColor,
    isTyping,
    prefersReducedMotion,
    totalLines,
}: TypewriterLineProps) {
    const lineNumberWidth = useMemo(
        () => String(totalLines).length,
        [totalLines]
    );

    return (
        <div className="flex items-start font-mono leading-relaxed">
            {/* Line Number */}
            {showLineNumbers && (
                <span
                    className="select-none opacity-40 mr-4 text-right"
                    style={{
                        minWidth: `${lineNumberWidth}ch`,
                        color: accentColor,
                    }}
                >
                    {lineIndex + 1}
                </span>
            )}

            {/* Prompt */}
            {showPrompt && (
                <span
                    className="select-none mr-2 font-bold"
                    style={{ color: accentColor }}
                >
                    {promptChar}
                </span>
            )}

            {/* Text Content */}
            <span className="text-white/90 whitespace-pre-wrap break-words">
                {displayedText}
                {isCurrentLine && showCursor && (
                    <Cursor
                        style={cursorStyle}
                        accentColor={accentColor}
                        isTyping={isTyping}
                        prefersReducedMotion={prefersReducedMotion}
                    />
                )}
            </span>
        </div>
    );
});

// ============================================================================
// Main TypewriterEffect Component
// ============================================================================

const TypewriterEffect = memo(function TypewriterEffect({
    lines,
    speed = "normal",
    pauseTime = 1000,
    cursorStyle = "line",
    onComplete,
    onLineComplete,
    loop = false,
    autoStart = true,
    startDelay = 0,
    showPrompt = true,
    promptChar = "❯",
    terminalStyle = true,
    accentColor = "#CCFF00",
    backgroundColor = "#0a0a0a",
    showLineNumbers = false,
    className = "",
}: TypewriterEffectProps) {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [displayedChars, setDisplayedChars] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(autoStart);

    // -------------------------------------------------------------------------
    // Refs for cleanup
    // -------------------------------------------------------------------------
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isUnmountedRef = useRef(false);

    // -------------------------------------------------------------------------
    // Memoized values
    // -------------------------------------------------------------------------
    const speedMs = useMemo(() => getSpeedMs(speed), [speed]);

    const prefersReducedMotion = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    const currentLine = useMemo(
        () => lines[currentLineIndex] || "",
        [lines, currentLineIndex]
    );

    const displayedLines = useMemo(() => {
        return lines.map((line, index) => {
            if (index < currentLineIndex) {
                return line; // Fully typed
            } else if (index === currentLineIndex) {
                return line.slice(0, displayedChars);
            }
            return ""; // Not yet started
        });
    }, [lines, currentLineIndex, displayedChars]);

    // -------------------------------------------------------------------------
    // Cleanup utility
    // -------------------------------------------------------------------------
    const clearCurrentTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // -------------------------------------------------------------------------
    // Reset function for looping
    // -------------------------------------------------------------------------
    const reset = useCallback(() => {
        clearCurrentTimeout();
        setCurrentLineIndex(0);
        setDisplayedChars(0);
        setIsTyping(false);
        setIsComplete(false);
    }, [clearCurrentTimeout]);

    // -------------------------------------------------------------------------
    // Start function
    // -------------------------------------------------------------------------
    const start = useCallback(() => {
        if (!hasStarted) {
            setHasStarted(true);
        }
    }, [hasStarted]);

    // -------------------------------------------------------------------------
    // Typing effect
    // -------------------------------------------------------------------------
    useEffect(() => {
        isUnmountedRef.current = false;

        // If reduced motion is preferred, show all text immediately
        if (prefersReducedMotion) {
            setCurrentLineIndex(lines.length - 1);
            setDisplayedChars(lines[lines.length - 1]?.length || 0);
            setIsComplete(true);
            onComplete?.();
            return;
        }

        if (!hasStarted) return;

        // Start delay
        if (startDelay > 0 && currentLineIndex === 0 && displayedChars === 0 && !isTyping) {
            timeoutRef.current = setTimeout(() => {
                if (!isUnmountedRef.current) {
                    setIsTyping(true);
                }
            }, startDelay);
            return () => clearCurrentTimeout();
        }

        // Begin typing if not already
        if (!isTyping && !isComplete) {
            setIsTyping(true);
        }

        // If done with all lines
        if (currentLineIndex >= lines.length) {
            setIsComplete(true);
            setIsTyping(false);
            onComplete?.();

            if (loop) {
                timeoutRef.current = setTimeout(() => {
                    if (!isUnmountedRef.current) {
                        reset();
                        setHasStarted(true);
                    }
                }, pauseTime);
            }
            return () => clearCurrentTimeout();
        }

        // If current line is fully typed
        if (displayedChars >= currentLine.length) {
            setIsTyping(false);
            onLineComplete?.(currentLineIndex);

            // Move to next line after pause
            timeoutRef.current = setTimeout(() => {
                if (!isUnmountedRef.current) {
                    setCurrentLineIndex((prev) => prev + 1);
                    setDisplayedChars(0);
                }
            }, pauseTime);

            return () => clearCurrentTimeout();
        }

        // Type next character
        timeoutRef.current = setTimeout(() => {
            if (!isUnmountedRef.current) {
                setDisplayedChars((prev) => prev + 1);
            }
        }, speedMs);

        return () => clearCurrentTimeout();
    }, [
        hasStarted,
        currentLineIndex,
        displayedChars,
        currentLine,
        lines.length,
        speedMs,
        pauseTime,
        startDelay,
        isTyping,
        isComplete,
        loop,
        prefersReducedMotion,
        onComplete,
        onLineComplete,
        reset,
        clearCurrentTimeout,
        lines,
    ]);

    // -------------------------------------------------------------------------
    // Cleanup on unmount
    // -------------------------------------------------------------------------
    useEffect(() => {
        return () => {
            isUnmountedRef.current = true;
            clearCurrentTimeout();
        };
    }, [clearCurrentTimeout]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    const content = (
        <div
            className={`font-mono text-sm md:text-base ${className}`}
            style={{ fontFamily: "ui-monospace, Menlo, Monaco, 'Cascadia Code', 'Source Code Pro', Consolas, monospace" }}
            role="log"
            aria-live="polite"
            aria-label="Typewriter text animation"
        >
            {/* Global cursor blink animation */}
            <style jsx global>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

            {/* Render lines */}
            <div className="space-y-2">
                {lines.map((line, index) => {
                    // Only render lines that have been started
                    if (index > currentLineIndex) return null;

                    return (
                        <TypewriterLine
                            key={index}
                            text={line}
                            displayedText={displayedLines[index]}
                            lineIndex={index}
                            isCurrentLine={index === currentLineIndex}
                            isComplete={index < currentLineIndex}
                            showPrompt={showPrompt}
                            promptChar={promptChar}
                            showLineNumbers={showLineNumbers}
                            showCursor={index === currentLineIndex && !isComplete}
                            cursorStyle={cursorStyle}
                            accentColor={accentColor}
                            isTyping={isTyping && index === currentLineIndex}
                            prefersReducedMotion={prefersReducedMotion}
                            totalLines={lines.length}
                        />
                    );
                })}
            </div>

            {/* Manual start button if autoStart is false */}
            {!autoStart && !hasStarted && (
                <button
                    onClick={start}
                    className="mt-4 px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
                    style={{
                        backgroundColor: accentColor,
                        color: backgroundColor,
                    }}
                >
                    Start
                </button>
            )}
        </div>
    );

    // Wrap in terminal if requested
    if (terminalStyle) {
        return (
            <TerminalWindow
                backgroundColor={backgroundColor}
                accentColor={accentColor}
            >
                {content}
            </TerminalWindow>
        );
    }

    return content;
});

export default TypewriterEffect;
