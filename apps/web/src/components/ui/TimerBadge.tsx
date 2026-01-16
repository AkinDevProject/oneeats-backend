import React, { useEffect, useState } from 'react';
import { cn, formatElapsedTime, getElapsedMinutes, getTimerStatus } from '../../lib/utils';
import { Clock } from 'lucide-react';

type TimerState = 'ok' | 'warning' | 'danger';

interface TimerBadgeProps {
  /** The start time of the order */
  startTime: Date | string;
  /** Warning threshold in minutes (default: 10) */
  warningThreshold?: number;
  /** Danger threshold in minutes (default: 20) */
  dangerThreshold?: number;
  /** Show icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Update interval in milliseconds (default: 30000 = 30s) */
  updateInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

const stateConfig: Record<TimerState, { className: string; pulseClass?: string }> = {
  ok: {
    className: 'bg-success-100 text-success-700 border-success-300',
  },
  warning: {
    className: 'bg-warning-100 text-warning-700 border-warning-300',
  },
  danger: {
    className: 'bg-danger-100 text-danger-700 border-danger-300',
    pulseClass: 'animate-pulse-subtle',
  },
};

/**
 * TimerBadge - Displays elapsed time with automatic color coding
 *
 * - Green (ok): < warningThreshold minutes
 * - Orange (warning): >= warningThreshold and < dangerThreshold minutes
 * - Red (danger): >= dangerThreshold minutes (with pulse animation)
 *
 * @example
 * <TimerBadge startTime={order.createdAt} />
 * <TimerBadge startTime={order.createdAt} warningThreshold={15} dangerThreshold={25} />
 */
export function TimerBadge({
  startTime,
  warningThreshold = 10,
  dangerThreshold = 20,
  showIcon = true,
  size = 'md',
  updateInterval = 30000,
  className,
}: TimerBadgeProps) {
  const [displayTime, setDisplayTime] = useState(() => formatElapsedTime(startTime));
  const [timerState, setTimerState] = useState<TimerState>(() =>
    getTimerStatus(startTime, warningThreshold, dangerThreshold)
  );

  // Update timer every updateInterval
  useEffect(() => {
    const updateTimer = () => {
      setDisplayTime(formatElapsedTime(startTime));
      setTimerState(getTimerStatus(startTime, warningThreshold, dangerThreshold));
    };

    // Initial update
    updateTimer();

    // Set up interval
    const intervalId = setInterval(updateTimer, updateInterval);

    return () => clearInterval(intervalId);
  }, [startTime, warningThreshold, dangerThreshold, updateInterval]);

  const config = stateConfig[timerState];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-0.5 text-xs gap-1',
    lg: 'px-2.5 py-1 text-sm gap-1.5',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium border',
        'transition-colors duration-200',
        sizeClasses[size],
        config.className,
        config.pulseClass,
        className
      )}
      title={`Commande passée il y a ${displayTime}`}
    >
      {showIcon && <Clock size={iconSizes[size]} />}
      <span>{displayTime}</span>
    </span>
  );
}

/**
 * Hook to get timer state for custom implementations
 */
export function useTimerState(
  startTime: Date | string,
  warningThreshold: number = 10,
  dangerThreshold: number = 20,
  updateInterval: number = 30000
): { displayTime: string; state: TimerState; minutes: number } {
  const [state, setState] = useState({
    displayTime: formatElapsedTime(startTime),
    state: getTimerStatus(startTime, warningThreshold, dangerThreshold) as TimerState,
    minutes: getElapsedMinutes(startTime),
  });

  useEffect(() => {
    const updateTimer = () => {
      setState({
        displayTime: formatElapsedTime(startTime),
        state: getTimerStatus(startTime, warningThreshold, dangerThreshold),
        minutes: getElapsedMinutes(startTime),
      });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, updateInterval);

    return () => clearInterval(intervalId);
  }, [startTime, warningThreshold, dangerThreshold, updateInterval]);

  return state;
}

export default TimerBadge;
