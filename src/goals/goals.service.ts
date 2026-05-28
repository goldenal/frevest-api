import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

@Injectable()
export class GoalsService {
  constructor(private store: InMemoryStore) {}

  findAll(userId: string) {
    const goals = this.store.getGoalsByUser(userId);
    return goals.map(g => ({
      ...g,
      pct: g.target > 0 ? +((g.current / g.target) * 100).toFixed(1) : 0,
    }));
  }

  findOne(userId: string, id: string) {
    const goal = this.store.getGoalById(id, userId);
    if (!goal) throw new NotFoundException('Goal not found');
    return { ...goal, pct: goal.target > 0 ? +((goal.current / goal.target) * 100).toFixed(1) : 0 };
  }

  create(userId: string, dto: CreateGoalDto) {
    return this.store.createGoal({ userId, ...dto });
  }

  update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = this.store.updateGoal(id, userId, { current: dto.current });
    if (!goal) throw new NotFoundException('Goal not found');
    return { ...goal, pct: goal.target > 0 ? +((goal.current / goal.target) * 100).toFixed(1) : 0 };
  }

  remove(userId: string, id: string) {
    const removed = this.store.deleteGoal(id, userId);
    if (!removed) throw new NotFoundException('Goal not found');
    return { message: 'Goal deleted' };
  }
}
