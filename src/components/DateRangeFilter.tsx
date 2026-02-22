import React, { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useSpotifyStore } from "../store/useSpotifyStore";
import { useTranslation } from "react-i18next";

export const DateRangeFilter: React.FC = () => {
  const { rawData, setDateRange } = useSpotifyStore();
  const { t, i18n } = useTranslation();

  const [minMonthIndex, setMinMonthIndex] = useState<number>(0);
  const [maxMonthIndex, setMaxMonthIndex] = useState<number>(0);
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(0);
  const [months, setMonths] = useState<Date[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isStuck, setStuck] = useState<boolean>(false);

  // Calculate months from raw data
  useEffect(() => {
    if (rawData.length > 0) {
      const dates = rawData.map((item) => new Date(item.ts));
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      // Create array of first day of each month
      const monthsArray: Date[] = [];
      const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      while (current <= end) {
        monthsArray.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }

      const counts = monthsArray.map(
        (m) =>
          rawData.filter((item) => {
            const d = new Date(item.ts);
            return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
          }).length,
      );

      setMonths(monthsArray);
      setMonthlyCounts(counts);
      setMinMonthIndex(0);
      setMaxMonthIndex(monthsArray.length - 1);
      setRangeStart(0);
      setRangeEnd(monthsArray.length - 1);
    }
  }, [rawData]);

  // Apply filter when range changes
  useEffect(() => {
    if (months.length > 0) {
      const timer = setTimeout(() => {
        const startDate = months[rangeStart];
        const endMonth = months[rangeEnd];
        // End date is last day of the selected month
        const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0, 23, 59, 59);

        setDateRange(startDate.toISOString(), endDate.toISOString());
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [rangeStart, rangeEnd, months, setDateRange]);

  useEffect(() => {
    const onScroll = () => {
      const el = filterRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      const stuck = rect.top <= 1;
      setStuck(stuck);
      el.classList.toggle("is-stuck", stuck);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
    });
  };

  const handleReset = () => {
    setRangeStart(minMonthIndex);
    setRangeEnd(maxMonthIndex);
  };

  const handleYears = (years: number) => {
    const monthsToSubtract = years * 12 - 1;
    const startIdx = Math.max(minMonthIndex, maxMonthIndex - monthsToSubtract);
    setRangeStart(startIdx);
    setRangeEnd(maxMonthIndex);
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current || months.length === 0) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.round(percentage * (maxMonthIndex - minMonthIndex) + minMonthIndex);
    const clampedIndex = Math.max(minMonthIndex, Math.min(maxMonthIndex, newIndex));

    // Determine which handle to move based on proximity
    const distToStart = Math.abs(clampedIndex - rangeStart);
    const distToEnd = Math.abs(clampedIndex - rangeEnd);

    if (distToStart < distToEnd) {
      setRangeStart(Math.min(clampedIndex, rangeEnd));
    } else {
      setRangeEnd(Math.max(clampedIndex, rangeStart));
    }
  };

  const handleMouseDown = (handle: "start" | "end") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(handle);
  };

  const handleTouchDown = (handle: "start" | "end") => (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
    e.stopPropagation();
    setIsDragging(handle);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current || months.length === 0) return;

      // Prevent scrolling on touch devices while dragging
      if ("touches" in e) {
        e.preventDefault();
      }

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newIndex = Math.round(percentage * (maxMonthIndex - minMonthIndex) + minMonthIndex);

      if (isDragging === "start") {
        setRangeStart(Math.min(newIndex, rangeEnd));
      } else {
        setRangeEnd(Math.max(newIndex, rangeStart));
      }
    };

    const handleEnd = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, rangeEnd, rangeStart, maxMonthIndex, minMonthIndex, months.length]);

  if (months.length === 0) return null;

  const startPercentage = ((rangeStart - minMonthIndex) / (maxMonthIndex - minMonthIndex)) * 100;
  const endPercentage = ((rangeEnd - minMonthIndex) / (maxMonthIndex - minMonthIndex)) * 100;

  return (
    <div className="date-range-filter table-container" ref={filterRef}>
      {!isStuck && (
        <div className="date-range-filter-top-bar">
          <div className="title">
            <h3>{t("dateRangeFilter.subtitle")}</h3>
          </div>
          <div className="filter-buttons">
            <button onClick={() => handleYears(3)} className="filter-btn">
              {t("dateRangeFilter.last3Years")}
            </button>
            <button onClick={() => handleYears(1)} className="filter-btn">
              {t("dateRangeFilter.lastYear")}
            </button>
            <button onClick={handleReset} className="reset-btn">
              {t("dateRangeFilter.reset")}
            </button>
          </div>
        </div>
      )}
      <div className="plays-sparkline">
        <ResponsiveContainer width="100%" height={isStuck ? 32 : 96}>
          <AreaChart data={months.map((_, i) => ({ value: monthlyCounts[i] }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary-color)"
              fill="var(--primary-color)"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              fillOpacity={0.2}
              strokeOpacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="range-slider-container">
        <div className="range-slider" ref={sliderRef} onClick={handleSliderClick}>
          <div className="range-track"></div>
          <div
            className="range-track-active"
            style={{
              left: `${startPercentage}%`,
              width: `${endPercentage - startPercentage}%`,
            }}
          ></div>
          <div
            className="range-handle range-handle-start"
            style={{ left: `${startPercentage}%` }}
            onMouseDown={handleMouseDown("start")}
            onTouchStart={handleTouchDown("start")}
          >
            <div className="range-label">{formatMonthYear(months[rangeStart])}</div>
          </div>
          <div
            className="range-handle range-handle-end"
            style={{ left: `${endPercentage}%` }}
            onMouseDown={handleMouseDown("end")}
            onTouchStart={handleTouchDown("end")}
          >
            <div className="range-label">{formatMonthYear(months[rangeEnd])}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
