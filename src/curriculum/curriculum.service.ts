import { Injectable } from '@nestjs/common';
import {
  TRACK_CURRICULUM,
  PROGRAM_EVENTS,
  CURRICULUM_COHORT_START,
  CURRICULUM_COHORT_END,
  WeekContent,
  ProgramEvent,
  getMilestoneForWeek,
} from './data/curriculum.data';

export interface WeeklyContentBundle {
  week: number;
  totalWeeks: number;
  milestone: 1 | 2 | 3 | null;
  weeksRemaining: number;
  weekContent: WeekContent | null;
  programEvent: ProgramEvent | null;
}

@Injectable()
export class CurriculumService {
  private readonly TOTAL_WEEKS = 12;

  getCurrentWeekForCohort(
    cohortStartDate: Date | string,
    now: Date = new Date(),
  ): number | null {
    const start =
      typeof cohortStartDate === 'string'
        ? new Date(cohortStartDate)
        : cohortStartDate;
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((now.getTime() - start.getTime()) / msPerDay);
    if (days < 0) return null;
    const week = Math.floor(days / 7) + 1;
    if (week > this.TOTAL_WEEKS) return null;
    return week;
  }

  getProgramEventForWeek(week: number): ProgramEvent | null {
    return PROGRAM_EVENTS.find((e) => e.week === week) ?? null;
  }

  getWeekContent(track: string, week: number): WeekContent | null {
    const weeks = TRACK_CURRICULUM[track];
    if (!weeks) return null;
    return weeks.find((w) => w.week === week) ?? null;
  }

  getAvailableTracks(): string[] {
    return Object.keys(TRACK_CURRICULUM);
  }

  getCohortStart(): string {
    return CURRICULUM_COHORT_START;
  }

  getCohortEnd(): string {
    return CURRICULUM_COHORT_END;
  }

  buildBundle(track: string, week: number): WeeklyContentBundle {
    return {
      week,
      totalWeeks: this.TOTAL_WEEKS,
      milestone: getMilestoneForWeek(week),
      weeksRemaining: Math.max(0, this.TOTAL_WEEKS - week),
      weekContent: this.getWeekContent(track, week),
      programEvent: this.getProgramEventForWeek(week),
    };
  }
}
