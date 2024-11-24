import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  register: publicProcedure.input(z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })).mutation(async ({ input, ctx }) => {
    try {
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email is already registered.',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const newUser = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });

      const tokenPayload = { id: newUser.id, email: newUser.email };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

      await ctx.db.authtoken.create({
        data: {
          token,
          userId: newUser.id,
          identifier: newUser.email,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        },
      });

      return {
        user: newUser,
        token,
        message: 'Registration successful.',
      };
    } catch (error) {
      console.error("Error in register:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to register user.',
      });
    }
  }),

  login: publicProcedure.input(z.object({
    email: z.string().email(),
    password: z.string(),
  })).mutation(async ({ input, ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !await bcrypt.compare(input.password, user.password)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      const tokenPayload = { id: user.id, email: user.email };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

      await ctx.db.authtoken.create({
        data: {
          token,
          userId: user.id,
          identifier: user.email,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        },
      });

      return {
        user,
        token,
        message: 'Login successful.',
      };
    } catch (error) {
      console.error("Error in login:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to log in.',
      });
    }
  }),

  profile: publicProcedure.input(z.object({
    email: z.string().email(),
  })).query(async ({ input, ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      return {
        user,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch profile in.',
      });
    }
  }),

  updateProfile: publicProcedure.input(z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
  })).mutation(async ({ input, ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name ?? user.name,
          email: input.email ?? user.email,
        },
      });

      return {
        user: updatedUser,
        message: 'Profile updated successfully.',
      };
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile.',
      });
    }
  }),

  logout: publicProcedure.input(z.object({
    token: z.string(),
  })).mutation(async ({ input, ctx }) => {
    try {
      await ctx.db.authtoken.deleteMany({
        where: { token: input.token },
      });

      return {
        message: 'Logged out successfully.',
      };
    } catch (error) {
      console.error("Error in logout:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to log out.',
      });
    }
  }),

  signout: publicProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ input, ctx }) => {
    try {
      await ctx.db.$transaction([
        ctx.db.authtoken.deleteMany({ where: { userId: input.id } }),
        ctx.db.session.deleteMany({ where: { userId: input.id } }),
        ctx.db.user.delete({ where: { id: input.id } }),
      ]);

      return {
        message: 'Account deleted successfully.',
      };
    } catch (error) {
      console.error("Error in signout:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete account.',
      });
    }
  }),

  resetPassword: publicProcedure.input(z.object({
    email: z.string().email(),
    newPassword: z.string().min(6),
  })).mutation(async ({ input, ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      await ctx.db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return {
        message: 'Password reset successful.',
      };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset password.',
      });
    }
  }),
});
