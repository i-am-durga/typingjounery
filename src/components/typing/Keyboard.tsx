"use client";

import { useEffect, useState } from "react";

const KEYBOARD_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

// Finger mapping
const FINGER_COLORS: Record<string, string> = {
    // Left Pinky
    q: "bg-red-400/20 border-red-500/50 text-red-200", a: "bg-red-400/20 border-red-500/50 text-red-200", z: "bg-red-400/20 border-red-500/50 text-red-200",
    // Left Ring
    w: "bg-yellow-400/20 border-yellow-500/50 text-yellow-200", s: "bg-yellow-400/20 border-yellow-500/50 text-yellow-200", x: "bg-yellow-400/20 border-yellow-500/50 text-yellow-200",
    // Left Middle
    e: "bg-green-400/20 border-green-500/50 text-green-200", d: "bg-green-400/20 border-green-500/50 text-green-200", c: "bg-green-400/20 border-green-500/50 text-green-200",
    // Left Index
    r: "bg-blue-400/20 border-blue-500/50 text-blue-200", t: "bg-blue-400/20 border-blue-500/50 text-blue-200", f: "bg-blue-400/20 border-blue-500/50 text-blue-200", g: "bg-blue-400/20 border-blue-500/50 text-blue-200", v: "bg-blue-400/20 border-blue-500/50 text-blue-200", b: "bg-blue-400/20 border-blue-500/50 text-blue-200",
    // Right Index
    y: "bg-blue-400/20 border-blue-500/50 text-blue-200", u: "bg-blue-400/20 border-blue-500/50 text-blue-200", h: "bg-blue-400/20 border-blue-500/50 text-blue-200", j: "bg-blue-400/20 border-blue-500/50 text-blue-200", n: "bg-blue-400/20 border-blue-500/50 text-blue-200", m: "bg-blue-400/20 border-blue-500/50 text-blue-200",
    // Right Middle
    i: "bg-green-400/20 border-green-500/50 text-green-200", k: "bg-green-400/20 border-green-500/50 text-green-200", ",": "bg-green-400/20 border-green-500/50 text-green-200",
    // Right Ring
    o: "bg-yellow-400/20 border-yellow-500/50 text-yellow-200", l: "bg-yellow-400/20 border-yellow-500/50 text-yellow-200", ".": "bg-yellow-400/20 border-yellow-500/50 text-yellow-200",
    // Right Pinky
    p: "bg-red-400/20 border-red-500/50 text-red-200", "[": "bg-red-400/20 border-red-500/50 text-red-200", "]": "bg-red-400/20 border-red-500/50 text-red-200", ";": "bg-red-400/20 border-red-500/50 text-red-200", "'": "bg-red-400/20 border-red-500/50 text-red-200", "/": "bg-red-400/20 border-red-500/50 text-red-200",
};

export function VirtualKeyboard({
    currentExpectedKey,
    lastPressedKey,
    isError
}: {
    currentExpectedKey: string,
    lastPressedKey: string,
    isError: boolean
}) {
    const [activeKey, setActiveKey] = useState<string>("");

    useEffect(() => {
        setActiveKey(lastPressedKey.toLowerCase());
        const t = setTimeout(() => setActiveKey(""), 150);
        return () => clearTimeout(t);
    }, [lastPressedKey]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-navy-light/50 p-6 md:p-10 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col gap-2 md:gap-4 items-center">
                {KEYBOARD_ROWS.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-1 md:gap-3 justify-center w-full" style={{ paddingLeft: rowIdx === 1 ? '5%' : rowIdx === 2 ? '10%' : '0' }}>
                        {row.map((key) => {
                            const isExpected = currentExpectedKey.toLowerCase() === key;
                            const isPressed = activeKey === key;
                            const baseColor = FINGER_COLORS[key] || "bg-navy-dark border-white/10 text-gray-400";

                            let currentStyle = baseColor;

                            if (isPressed) {
                                if (isError) {
                                    currentStyle = "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-400 text-white scale-95 transition-all duration-75";
                                } else if (!isExpected && !isError) { // Assuming correct press triggers different state, but here we just show press
                                    currentStyle = "bg-primary shadow-[0_0_15px_rgba(0,229,255,0.8)] border-primary text-navy scale-95 transition-all duration-75 font-bold";
                                }
                            } else if (isExpected && !isError) {
                                currentStyle = `${baseColor} border-primary shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse`;
                            }

                            return (
                                <div
                                    key={key}
                                    className={`flex items-center justify-center w-8 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl border-b-4 font-mono font-bold text-sm md:text-xl uppercase select-none transition-all duration-200 ${currentStyle}`}
                                >
                                    {key}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Spacebar */}
                <div className="flex gap-3 justify-center w-full mt-2">
                    <div className={`flex items-center justify-center w-48 md:w-96 h-10 md:h-16 rounded-xl border-b-4 font-mono font-bold text-sm uppercase select-none transition-all duration-200 ${currentExpectedKey === " " ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse text-purple-200" :
                        activeKey === " " ? (isError ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-400 text-white scale-95" : "bg-primary shadow-[0_0_15px_rgba(0,229,255,0.8)] border-primary text-navy scale-95") :
                            "bg-navy-dark border-white/10 text-gray-500"
                        }`}>
                        SPACE
                    </div>
                </div>
            </div>

            {/* Hand Indicator Simulation */}
            <div className="mt-8 flex justify-center items-center gap-12 opacity-60">
                <div className="flex gap-2">
                    <div className={`w-3 h-8 rounded-full ${["q", "a", "z"].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-3 h-10 rounded-full ${["w", "s", "x"].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-3 h-12 rounded-full ${["e", "d", "c"].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-3 h-10 rounded-full ${["r", "t", "f", "g", "v", "b"].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-4 h-6 mt-6 rounded-full ${currentExpectedKey === " " ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                </div>

                <div className="flex gap-2 flex-row-reverse">
                    <div className={`w-3 h-8 rounded-full ${["p", "[", "]", ";", "'", "/"].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-3 h-10 rounded-full ${["o", "l", "."].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-3 h-12 rounded-full ${["i", "k", ","].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-3 h-10 rounded-full ${["y", "u", "h", "j", "n", "m"].includes(currentExpectedKey.toLowerCase()) ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                    <div className={`w-4 h-6 mt-6 rounded-full ${currentExpectedKey === " " ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-gray-600"}`}></div>
                </div>
            </div>
        </div>
    );
}
