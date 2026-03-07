import { DataSource } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

const tasks = [
  // Milestone 1 — Foundations (Weeks 1-4)
  { taskId: 'm1-w1-t1', milestone: 1, week: 1, title: 'Set up development environment', description: 'Install all required tools and set up your local development environment for your track.' },
  { taskId: 'm1-w1-t2', milestone: 1, week: 1, title: 'Complete introductory module', description: 'Go through the introductory course material provided for your track.' },
  { taskId: 'm1-w1-t3', milestone: 1, week: 1, title: 'Join your track community', description: 'Join the WhatsApp group and introduce yourself to your cohort.' },
  { taskId: 'm1-w2-t1', milestone: 1, week: 2, title: 'Complete fundamental concepts module', description: 'Study and complete the fundamental concepts module for week 2.' },
  { taskId: 'm1-w2-t2', milestone: 1, week: 2, title: 'Build your first mini-project', description: 'Apply what you learned by building a small project. Share it with your mentor.' },
  { taskId: 'm1-w2-t3', milestone: 1, week: 2, title: 'Share progress in group', description: 'Post your week 2 progress update in the cohort group.' },
  { taskId: 'm1-w3-t1', milestone: 1, week: 3, title: 'Deep dive into core concepts', description: 'Study the week 3 core concepts in depth.' },
  { taskId: 'm1-w3-t2', milestone: 1, week: 3, title: 'Practice exercises set 1', description: 'Complete the practice exercises for week 3.' },
  { taskId: 'm1-w3-t3', milestone: 1, week: 3, title: "Review a peer's work", description: "Review and give constructive feedback on a cohort member's project." },
  { taskId: 'm1-w4-t1', milestone: 1, week: 4, title: 'Milestone 1 project', description: 'Build a basic portfolio piece demonstrating your milestone 1 skills.' },
  { taskId: 'm1-w4-t2', milestone: 1, week: 4, title: 'Submit for mentor review', description: 'Submit your milestone 1 project to your mentor for review.' },
  { taskId: 'm1-w4-t3', milestone: 1, week: 4, title: 'Milestone 1 reflection', description: 'Write a short reflection on what you learned in Milestone 1.' },
  // Milestone 2 — Intermediate (Weeks 5-8)
  { taskId: 'm2-w5-t1', milestone: 2, week: 5, title: 'Advanced concepts introduction', description: 'Begin studying intermediate-level concepts for your track.' },
  { taskId: 'm2-w5-t2', milestone: 2, week: 5, title: 'Build an intermediate project', description: 'Start building a more complex project incorporating week 5 learnings.' },
  { taskId: 'm2-w5-t3', milestone: 2, week: 5, title: 'Mentor check-in session', description: 'Schedule and complete your week 5 check-in session with your mentor.' },
  { taskId: 'm2-w6-t1', milestone: 2, week: 6, title: 'Deep dive: Advanced module', description: 'Complete the advanced module for week 6 of your track.' },
  { taskId: 'm2-w6-t2', milestone: 2, week: 6, title: 'Practice project iteration', description: 'Iterate on your project based on mentor feedback.' },
  { taskId: 'm2-w6-t3', milestone: 2, week: 6, title: 'Peer collaboration task', description: 'Collaborate with a cohort peer on a shared challenge.' },
  { taskId: 'm2-w7-t1', milestone: 2, week: 7, title: 'Real-world application study', description: 'Study and analyze a real-world application in your track.' },
  { taskId: 'm2-w7-t2', milestone: 2, week: 7, title: 'Build feature X', description: 'Add a significant new feature to your ongoing project.' },
  { taskId: 'm2-w7-t3', milestone: 2, week: 7, title: 'Code review', description: 'Conduct a code review session with your mentor.' },
  { taskId: 'm2-w8-t1', milestone: 2, week: 8, title: 'Milestone 2 project', description: 'Complete your milestone 2 capstone project.' },
  { taskId: 'm2-w8-t2', milestone: 2, week: 8, title: 'Project documentation', description: 'Write clear documentation for your milestone 2 project.' },
  { taskId: 'm2-w8-t3', milestone: 2, week: 8, title: 'Milestone 2 presentation', description: 'Present your milestone 2 project to your mentor.' },
  // Milestone 3 — Advanced (Weeks 9-12)
  { taskId: 'm3-w9-t1', milestone: 3, week: 9, title: 'Portfolio-level project kickoff', description: 'Begin your final portfolio project. Define scope and requirements.' },
  { taskId: 'm3-w9-t2', milestone: 3, week: 9, title: 'Advanced concepts mastery', description: 'Complete the advanced concepts module for week 9.' },
  { taskId: 'm3-w9-t3', milestone: 3, week: 9, title: 'Industry standards study', description: 'Research and document industry standards relevant to your track.' },
  { taskId: 'm3-w10-t1', milestone: 3, week: 10, title: 'Final project development', description: 'Develop your final project — complete core features.' },
  { taskId: 'm3-w10-t2', milestone: 3, week: 10, title: 'Testing & debugging', description: 'Write tests and debug your final project.' },
  { taskId: 'm3-w10-t3', milestone: 3, week: 10, title: 'Mid-milestone mentor review', description: 'Get mentor review on your final project progress.' },
  { taskId: 'm3-w11-t1', milestone: 3, week: 11, title: 'Career prep: Resume update', description: 'Update your resume with your TektonX projects and skills.' },
  { taskId: 'm3-w11-t2', milestone: 3, week: 11, title: 'LinkedIn profile optimization', description: 'Optimize your LinkedIn profile with your new skills and projects.' },
  { taskId: 'm3-w11-t3', milestone: 3, week: 11, title: 'Final project polish', description: 'Polish your final project — fix bugs, improve UI, write docs.' },
  { taskId: 'm3-w12-t1', milestone: 3, week: 12, title: 'Final project submission', description: 'Submit your final portfolio project.' },
  { taskId: 'm3-w12-t2', milestone: 3, week: 12, title: 'Program reflection', description: 'Write a comprehensive reflection on your 12-week TektonX journey.' },
  { taskId: 'm3-w12-t3', milestone: 3, week: 12, title: 'Graduation ceremony prep', description: 'Prepare your showcase presentation for the graduation ceremony.' },
];

export async function seedTasks(dataSource: DataSource) {
  const taskRepo = dataSource.getRepository(Task);
  let created = 0;
  for (const taskData of tasks) {
    const existing = await taskRepo.findOne({
      where: { taskId: taskData.taskId, userId: null as any },
    });
    if (!existing) {
      await taskRepo.save(taskRepo.create({ ...taskData, userId: null }));
      created++;
    }
  }
  console.log(`Tasks: ${created} template tasks created`);
}
