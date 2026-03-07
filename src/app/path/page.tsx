"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, Clock, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LEVELS = [
    { id: 1, name: "Beginner", description: "Learn the home row and basic finger placement.", color: "text-blue-400" },
    { id: 2, name: "Intermediate", description: "Master capitalization, numbers, and common words.", color: "text-green-400" },
    { id: 3, name: "Advanced", description: "Build speed with complex sentences and symbols.", color: "text-secondary" },
    { id: 4, name: "Expert", description: "Professional documents and competitive speed tests.", color: "text-primary" },
];

interface LessonNode {
    _id: string;
    level: number;
    order: number;
    title: string;
    targetWPM: number;
    estimatedMinutes: number;
    type: string;
}

export default function LearningPathPage() {
    const { data: session } = useSession();
    const [lessons, setLessons] = useState<LessonNode[]>([]);
    const [unlockedLessons, setUnlockedLessons] = useState<string[]>([]);
    const [currentLevel, setCurrentLevel] = useState(1);

    // For prototyping, we'll generate static lessons if API is empty
    useEffect(() => {
        const fetchPathData = async () => {
            // In a real app we fetch this
            try {
                const res = await fetch("/api/lessons");
                const data = await res.json();

                if (data.lessons && data.lessons.length > 0) {
                    setLessons(data.lessons);
                } else {
                    // Generate mock lessons
                    const mockLessons: LessonNode[] = [];
                    for (let lvl = 1; lvl <= 4; lvl++) {
                        for (let order = 1; order <= 10; order++) {
                            mockLessons.push({
                                _id: `mock-${lvl}-${order}`,
                                level: lvl,
                                order: order,
                                title: `Level ${lvl} - Lesson ${order}`,
                                targetWPM: 15 + (lvl * 15) + (order * 2),
                                estimatedMinutes: 2 + Math.floor(order / 3),
                                type: "practice"
                            });
                        }
                    }
                    setLessons(mockLessons);

                    // Fetch user profile to get unlocked lessons
                    if (session) {
                        const userRes = await fetch("/api/user/profile");
                        if (userRes.ok) {
                            const userData = await userRes.json();
                            if (userData.user?.unlockedLessons?.length > 0) {
                                setUnlockedLessons(userData.user.unlockedLessons);
                            } else {
                                setUnlockedLessons(["mock-1-1"]); // Default unlock first
                            }
                            setCurrentLevel(userData.user?.currentLevel || 1);
                        }
                    }
                }
            } catch {
                console.error("Failed to load learning path");
            }
        };

        fetchPathData();
    }, [session]);

    const getFilteredLessons = (levelId: number) => {
        return lessons.filter(l => l.level === levelId).sort((a, b) => a.order - b.order);
    };

    const isUnlocked = (lessonId: string, index: number) => {
        if (unlockedLessons.includes(lessonId)) return true;
        // For prototyping without real DB: if previous is unlocked, we might show it
        if (index === 0) return true; // First lesson of a level is unlocked if they reached the level
        return false;
    };

    const isCompleted = (lessonId: string) => {
        // In a real app, check actual completion from sessions. 
        // Here we consider it completed if the NEXT lesson is unlocked.
        const currentIndex = unlockedLessons.indexOf(lessonId);
        return currentIndex >= 0 && currentIndex < unlockedLessons.length - 1;
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
                    Your <span className="text-primary neon-text-primary">Learning Path</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Progress through 4 difficulty tiers. Master each lesson to unlock the next challenge and earn your typing certificate.
                </p>
            </div>

            <div className="space-y-24">
                {LEVELS.map((level) => {
                    const levelLessons = getFilteredLessons(level.id);
                    const isLevelUnlocked = currentLevel >= level.id;

                    return (
                        <div key={level.id} className={`relative ${!isLevelUnlocked ? 'opacity-50 grayscale' : ''}`}>
                            {/* Level Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/10 pb-4">
                                <div>
                                    <h2 className={`text-3xl font-bold font-heading mb-2 ${level.color}`}>
                                        Stage {level.id}: {level.name}
                                    </h2>
                                    <p className="text-gray-400">{level.description}</p>
                                </div>
                                {!isLevelUnlocked && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-navy-light rounded-lg border border-white/10 mt-4 md:mt-0">
                                        <Lock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-400">Reach Level {level.id} to unlock</span>
                                    </div>
                                )}
                            </div>

                            {/* Path Visualization */}
                            <div className="relative pt-8 pb-12">
                                {/* Connecting Line */}
                                <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 md:-translate-x-1/2 w-1 bg-white/5 rounded-full z-0 overflow-hidden">
                                    {isLevelUnlocked && (
                                        <motion.div
                                            className="w-full bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                                            initial={{ height: "0%" }}
                                            whileInView={{ height: "60%" }} // Mock progress
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.2 }}
                                        />
                                    )}
                                </div>

                                {/* Nodes */}
                                <div className="space-y-8 relative z-10">
                                    {levelLessons.map((lesson, idx) => {
                                        const unlocked = isLevelUnlocked && isUnlocked(lesson._id, idx);
                                        const completed = isCompleted(lesson._id);
                                        const isRight = idx % 2 !== 0;

                                        return (
                                            <div key={lesson._id} className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 ${isRight ? 'md:flex-row-reverse' : ''}`}>

                                                {/* Empty Space for zigzag on desktop */}
                                                <div className="hidden md:block md:w-1/2" />

                                                {/* Node Icon */}
                                                <div className="absolute left-0 md:relative md:left-auto flex-shrink-0 z-10">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-navy ${completed ? 'bg-primary shadow-[0_0_15px_rgba(0,229,255,0.5)]' :
                                                        unlocked ? 'bg-navy-light border-primary text-primary shadow-[0_0_10px_rgba(0,229,255,0.3)]' :
                                                            'bg-navy-dark border-white/10 text-gray-600'
                                                        }`}>
                                                        {completed ? <CheckCircle2 className="w-6 h-6 text-navy" /> :
                                                            unlocked ? <span className="font-bold">{lesson.order}</span> :
                                                                <Lock className="w-5 h-5" />}
                                                    </div>
                                                </div>

                                                {/* Node Content Card */}
                                                <div className={`w-full pl-20 md:pl-0 md:w-1/2 flex ${isRight ? 'md:justify-end' : 'md:justify-start'}`}>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                                                        className={`w-full max-w-md p-5 rounded-2xl glass-panel relative ${unlocked ? 'border-primary/30 hover:border-primary/60 transition-colors' : 'border-white/5 opacity-80'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className={`font-bold text-lg ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                                                                {lesson.title}
                                                            </h3>
                                                            {unlocked && !completed && (
                                                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary rounded-md">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-blue-400" />
                                                                <span>{lesson.estimatedMinutes}m</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Target className="w-4 h-4 text-secondary" />
                                                                <span>{lesson.targetWPM} WPM</span>
                                                            </div>
                                                        </div>

                                                        {unlocked ? (
                                                            <Button
                                                                className={`w-full ${completed ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-primary hover:bg-primary-hover text-navy font-bold'}`}
                                                                asChild
                                                            >
                                                                <Link href={`/lesson/${lesson._id}`}>
                                                                    <Play className="w-4 h-4 mr-2" />
                                                                    {completed ? 'Practice Again' : 'Start Lesson'}
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <Button disabled variant="outline" className="w-full bg-transparent border-white/5 text-gray-600">
                                                                Locked
                                                            </Button>
                                                        )}
                                                    </motion.div>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
