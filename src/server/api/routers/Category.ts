import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * Router for managing categories.
 */
export const categoryRouter = createTRPCRouter({
  /**
   * Add a new category for a specific user.
   */
  add: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Category name is required"),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if the category already exists for the user
        const existingCategory = await ctx.db.category.findFirst({
          where: {
            name: input.name,
            userId: input.userId,
          },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this name already exists for the user.",
          });
        }

        // Create the category
        const newCategory = await ctx.db.category.create({
          data: {
            name: input.name,
            userId: input.userId,
          },
        });

        return {
          message: "Category created successfully.",
          category: newCategory,
        };
      } catch (error) {
        console.error("Error in add category procedure:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating the category.",
        });
      }
    }),

  /**
   * Remove a category by ID.
   */
  remove: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Category ID is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Find the category
        const category = await ctx.db.category.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "The category does not exist.",
          });
        }

        // Delete the category
        await ctx.db.category.delete({
          where: {
            id: input.id,
          },
        });

        return {
          message: "Category removed successfully.",
        };
      } catch (error) {
        console.error("Error in remove category procedure:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while removing the category.",
        });
      }
    }),
});
