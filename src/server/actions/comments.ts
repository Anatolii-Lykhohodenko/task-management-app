'use server';

import prisma from '@/lib/db/client';
import { findCommentInTasks, findTaskInProject } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import { commentSchema } from '@/schemas/comment.schema';
import { ActionState } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createComment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = commentSchema.safeParse({
    text: formData.get('text'),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid form data' };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const { text } = result.data;

  const taskId = Number(formData.get('taskId'));
  const rawParentId = formData.get('parentId');
  const parentId = rawParentId ? Number(rawParentId) : null;
  const projectId = Number(formData.get('projectId'));

  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId: userId,
    select: { id: true },
  });

  if (!task) {
    return { error: 'Task not found' };
  }

  try {
    await prisma.comment.create({
      data: {
        text,
        taskId: task.id,
        parentId,
        userId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  redirect(`/projects/${projectId}/tasks/${taskId}`);
}

export async function updateComment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const result = commentSchema.safeParse({
    text: formData.get('text'),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid form data' };
  }

  const { text } = result.data;

  const taskId = Number(formData.get('taskId'));
  const projectId = Number(formData.get('projectId'));
  const commentId = Number(formData.get('commentId'));

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return { error: 'TaskId is invalid' };
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return { error: 'ProjectId is invalid' };
  }

  if (!Number.isInteger(commentId) || commentId <= 0) {
    return { error: 'CommentId is invalid' };
  }

  const comment = await findCommentInTasks({
    taskId,
    projectId,
    ownerId: userId,
    commentId,
    select: {
      id: true,
    },
  });

  if (!comment) {
    return { error: 'Comment not found' };
  }

  try {
    await prisma.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        text,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  redirect(`/projects/${projectId}/tasks/${taskId}`);
}

export async function deleteComment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const taskId = Number(formData.get('taskId'));
  const projectId = Number(formData.get('projectId'));
  const commentId = Number(formData.get('commentId'));

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return { error: 'TaskId is invalid' };
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return { error: 'ProjectId is invalid' };
  }

  if (!Number.isInteger(commentId) || commentId <= 0) {
    return { error: 'CommentId is invalid' };
  }

  const comment = await findCommentInTasks({
    projectId,
    taskId,
    ownerId: userId,
    commentId,
    select: {
      id: true,
    },
  });

  if (!comment) {
    return { error: 'Comment not found' };
  }

  try {
    await prisma.comment.delete({
      where: {
        id: comment.id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  redirect(`/projects/${projectId}/tasks/${taskId}`, 'replace');
}
