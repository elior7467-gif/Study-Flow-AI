import React, { useState } from 'react';
import { CohortMetric } from '../types';
import { Globe, ShieldCheck, TrendingUp, ChevronUp } from 'lucide-react';

interface AnalyticsViewProps {
  cohorts: CohortMetric[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ cohorts }) => {
  const [sortField, setSortField] = useState<'meanScore' | 'participation'>('meanScore');

  const sortedCohorts = [...cohorts].sort((a, b) => b[sortField] - a[sortField]);

  return (
    <div className="h-full overflow-y-auto scrollbar-none pb-28 pt-4 px-4 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Performance Analytics
        </h2>
        <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
          Institutional-grade metrics and longitudinal proficiency tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Global Ranking Card */}
      <div className="bg-white dark:bg-[#020617] border border-[#E2E8F0] dark:border-[#1E293B] rounded-[24px] p-6 shadow-xs space-y-3 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
          <span>Global Ranking</span>
          <Globe className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            98.4
          </span>
          <span className="text-xl font-bold text-[#2563EB] dark:text-[#60A5FA]">%</span>
        </div>

        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Top percentile across 14,200 active cohorts.
        </p>

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold">STATUS</span>
          <span className="bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F172A] text-[11px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider">
            ELITE TIER
          </span>
        </div>
      </div>

      {/* Verification Audit Card */}
      <div className="bg-white dark:bg-[#020617] border border-[#E2E8F0] dark:border-[#1E293B] rounded-[24px] p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3 transition-colors duration-300">
        <div className="w-full text-left text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
          Verification Audit
        </div>

        <div className="w-36 h-36 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl flex flex-col items-center justify-center relative p-4">
          <div className="w-12 h-10 border-t-4 border-l-4 border-r-4 border-[#2563EB] dark:border-[#60A5FA] rounded-t-lg mb-2 flex items-center justify-center">
            <ChevronUp className="w-6 h-6 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">142</span>
          <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            TOTAL
          </span>
        </div>
      </div>

      {/* Proficiency Delta Card */}
      <div className="bg-white dark:bg-[#020617] border border-[#E2E8F0] dark:border-[#1E293B] rounded-[24px] p-6 shadow-xs space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
          <span>Proficiency Delta</span>
          <TrendingUp className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
        </div>

        <div className="space-y-3 text-xs">
          {/* Item 1 */}
          <div>
            <div className="flex items-center justify-between font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
              <span>Applied Mathematics</span>
              <span className="text-[#2563EB] dark:text-[#60A5FA]">+4.2%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#2563EB] dark:bg-[#60A5FA] h-full rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>

          {/* Item 2 */}
          <div>
            <div className="flex items-center justify-between font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
              <span>Data Structures</span>
              <span className="text-[#2563EB] dark:text-[#60A5FA]">+1.8%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#2563EB] dark:bg-[#60A5FA] h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          {/* Item 3 */}
          <div>
            <div className="flex items-center justify-between font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
              <span>Systems Architecture</span>
              <span className="text-[#F43F5E]">-0.5%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#F43F5E] h-full rounded-full" style={{ width: '61%' }}></div>
            </div>
          </div>
        </div>
      </div>

      </div>
      {/* Cohort Analysis Table */}
      <div className="bg-white dark:bg-[#020617] border border-[#E2E8F0] dark:border-[#1E293B] rounded-[24px] p-6 shadow-xs space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">Cohort Analysis</h3>
          <div className="flex gap-1 text-[11px]">
            <button
              onClick={() => setSortField('meanScore')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                sortField === 'meanScore'
                  ? 'bg-[#0F172A] dark:bg-[#2563EB] text-white'
                  : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E293B]'
              }`}
            >
              Mean Score
            </button>
            <button
              onClick={() => setSortField('participation')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                sortField === 'participation'
                  ? 'bg-[#0F172A] dark:bg-[#2563EB] text-white'
                  : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E293B]'
              }`}
            >
              Participation
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-1">Cohort ID</th>
                <th className="py-2.5 px-1 text-right">Mean Score</th>
                <th className="py-2.5 px-1 text-right">Variance (Σ²)</th>
                <th className="py-2.5 px-1 text-right">Participation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
              {sortedCohorts.map((c) => (
                <tr key={c.cohortId} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors">
                  <td className="py-3 px-1 font-bold">{c.cohortId}</td>
                  <td className="py-3 px-1 text-right">{c.meanScore.toFixed(1)}</td>
                  <td className="py-3 px-1 text-right text-[#64748B] dark:text-[#94A3B8]">
                    {c.variance.toFixed(1)}
                  </td>
                  <td className="py-3 px-1 text-right font-bold">{c.participation}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
