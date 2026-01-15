"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { skills } from "@/lib/placeholder-content";
import {
  convertToRPGSkills,
  calculateRPGStats,
  getCategoryColor,
  getXPPercentage,
  levelBarVariants,
  statCardVariants,
  type RPGSkill,
  type SkillCategory,
} from "@/lib/rpg-skills";

export default function RPGCharacterSheet() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'All'>('All');
  const [rpgSkills] = useState(() => convertToRPGSkills(skills));
  const [stats] = useState(() => calculateRPGStats(rpgSkills));

  const categories: (SkillCategory | 'All')[] = ['All', 'Frontend', 'Backend', 'AI & Automation', 'Tools & Platforms', 'Web3 & Blockchain', 'Economics & Strategy', 'Additional Tools'];

  const filteredSkills = selectedCategory === 'All'
    ? rpgSkills
    : rpgSkills.filter(skill => skill.category === selectedCategory);

  return (
    <div className="glass-dark rounded-3xl p-8 max-w-6xl mx-auto">
      {/* Header - Character Info */}
      <div className="mb-8">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2 className="text-5xl font-black text-white mb-2 font-[family-name:var(--font-outfit)]">
              Character Stats
            </h2>
            <p className="text-gray-400">Your developer skill tree</p>
          </div>

          {/* Level Badge */}
          <motion.div
            className="bg-gradient-to-br from-neonPink via-electricPurple to-skyBlue rounded-2xl p-6 text-center min-w-[140px]"
            variants={statCardVariants}
            initial="initial"
            animate="animate"
          >
            <div className="text-6xl font-black text-white">{stats.totalLevel}</div>
            <div className="text-sm text-white/90 font-semibold uppercase tracking-wide">Total Level</div>
          </motion.div>
        </motion.div>

        {/* Character Title & Class */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Title */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Title</div>
            <div className="text-xl font-bold text-neonPink">{stats.title}</div>
          </div>

          {/* Class */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Class</div>
            <div className="text-xl font-bold text-electricPurple">{stats.class}</div>
          </div>

          {/* Skills Unlocked */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Skills Unlocked</div>
            <div className="text-xl font-bold text-skyBlue">{stats.skillPoints} / 100</div>
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const colors = category !== 'All' ? getCategoryColor(category as SkillCategory) : null;

            return (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  isSelected
                    ? colors
                      ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg`
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
                {category !== 'All' && (
                  <span className="ml-2 opacity-75">
                    ({rpgSkills.filter(s => s.category === category).length})
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {filteredSkills.map((skill, index) => {
          const colors = getCategoryColor(skill.category);
          const xpPercentage = getXPPercentage(skill.xp);

          return (
            <motion.div
              key={skill.name}
              className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center justify-between mb-3">
                {/* Skill Name & Proficiency */}
                <div className="flex items-center gap-4">
                  {/* Level Badge */}
                  <motion.div
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0`}
                    whileHover={{ rotate: 5 }}
                  >
                    <div className="text-2xl font-black text-white">{skill.level}</div>
                  </motion.div>

                  {/* Name & Proficiency */}
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                      {skill.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-sm font-semibold ${colors.text}`}>
                        {skill.proficiency}
                      </span>
                      <span className="text-xs text-gray-500">
                        •
                      </span>
                      <span className="text-xs text-gray-500">
                        {skill.yearsExperience} {skill.yearsExperience === 1 ? 'year' : 'years'} exp
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP Display */}
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{skill.xp} XP</div>
                  <div className="text-xs text-gray-500">to next level</div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="relative">
                {/* Background bar */}
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  {/* Progress fill */}
                  <motion.div
                    className={`h-full bg-gradient-to-r ${colors.bg} rounded-full relative`}
                    custom={xpPercentage}
                    variants={levelBarVariants}
                    initial="initial"
                    animate="animate"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>

                {/* Percentage text */}
                <div className="absolute -top-1 right-0 text-[10px] font-bold text-gray-400">
                  {xpPercentage}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <motion.div
        className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div>
          <div className="text-3xl font-black text-neonPink mb-1">{rpgSkills.filter(s => s.level >= 9).length}</div>
          <div className="text-xs text-gray-500 uppercase">Master Skills</div>
        </div>
        <div>
          <div className="text-3xl font-black text-electricPurple mb-1">{rpgSkills.filter(s => s.level >= 7).length}</div>
          <div className="text-xs text-gray-500 uppercase">Expert Skills</div>
        </div>
        <div>
          <div className="text-3xl font-black text-skyBlue mb-1">{stats.totalXP}</div>
          <div className="text-xs text-gray-500 uppercase">Total XP</div>
        </div>
        <div>
          <div className="text-3xl font-black text-limeGreen mb-1">{Math.round(rpgSkills.reduce((sum, s) => sum + s.yearsExperience, 0))}</div>
          <div className="text-xs text-gray-500 uppercase">Years Coded</div>
        </div>
      </motion.div>

      {/* Achievement Badge */}
      <motion.div
        className="mt-6 text-center p-4 bg-gradient-to-r from-neonPink/10 via-electricPurple/10 to-skyBlue/10 rounded-xl border border-white/10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-sm text-gray-400 mb-1">🏆 Achievement Unlocked</div>
        <div className="text-lg font-bold text-white">Full Stack Warrior</div>
        <div className="text-xs text-gray-500 mt-1">Mastered frontend, backend, and everything in between</div>
      </motion.div>
    </div>
  );
}
