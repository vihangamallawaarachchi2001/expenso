import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const accountRouter = createTRPCRouter({
  createOne: publicProcedure
    .input(
      z.object({
        userId: z.string(), // Fix: Correct zod usage
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if account already exists
        const existingAccount = await ctx.db.account.findFirst({
          where: {
            userId: input.userId,
            name: input.name,
          },
        });

        if (existingAccount) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Account already exists",
          });
        }

        // Create new account
        const newAccount = await ctx.db.account.create({
          data: {
            userId: input.userId,
            name: input.name,
          },
        });

        return newAccount;
      } catch (error) {
        console.error("Error in createOne procedure:", error);
        if (error instanceof TRPCError) {
          throw error; 
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    }),
    
});
