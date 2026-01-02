import { prisma } from '@/lib/prisma';

/**
 * Service layer for User business logic
 * Separates business logic from API route handlers
 */

export interface UpdateUserProfileData {
  name?: string;
  surname?: string;
  cellphone?: string;
}

/**
 * Get user profile by email
 */
export async function getUserProfile(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(email: string, data: UpdateUserProfileData) {
  return await prisma.user.update({
    where: { email },
    data: {
      name: data.name,
      surname: data.surname,
      cellphone: data.cellphone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

/**
 * Delete user account
 */
export async function deleteUserAccount(email: string) {
  await prisma.user.delete({
    where: { email },
  });
}
