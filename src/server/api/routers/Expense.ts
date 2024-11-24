import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

/**
 * Router for managing expenses.
 */
export const expenseRouter = createTRPCRouter({
  /**
   * Get all expenses.
   */
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      const expenses = await ctx.db.expense.findMany({
        include: {
          category: true, // Include related category details
        },
      });
      return {
        message: "Expenses fetched successfully.",
        expenses,
      };
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch expenses.",
      });
    }
  }),

  /**
   * Get a single expense by ID.
   */
  one: publicProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid expense ID format."),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const expense = await ctx.db.expense.findUnique({
          where: { id: input.id },
          include: { category: true },
        });

        if (!expense) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Expense not found.",
          });
        }

        return {
          message: "Expense fetched successfully.",
          expense,
        };
      } catch (error) {
        console.error("Error fetching expense:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expense.",
        });
      }
    }),

  /**
   * Add a new expense.
   */
  add: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required."),
        description: z.string().optional(),
        amount: z.number().positive("Amount must be a positive number."),
        userId: z.string().uuid("Invalid user ID format."),
        categoryId: z.string().uuid("Invalid category ID format."),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if the user exists
        const userExists = await ctx.db.user.findUnique({
          where: { id: input.userId },
        });
        if (!userExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        // Check if the category exists
        const categoryExists = await ctx.db.category.findUnique({
          where: { id: input.categoryId },
        });
        if (!categoryExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found.",
          });
        }

        // Create the expense
        const expense = await ctx.db.expense.create({
          data: {
            title: input.title,
            description: input.description,
            amount: input.amount,
            userId: input.userId,
            categoryId: input.categoryId,
          },
          include: { category: true },
        });

        return {
          message: "Expense added successfully.",
          expense,
        };
      } catch (error) {
        console.error("Error adding expense:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add expense.",
        });
      }
    }),

  /**
   * Edit an existing expense.
   */
  edit: publicProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid expense ID format."),
        title: z.string().min(1, "Title is required."),
        description: z.string().optional(),
        amount: z.number().positive("Amount must be a positive number."),
        categoryId: z.string().uuid("Invalid category ID format."),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if the expense exists
        const expenseExists = await ctx.db.expense.findUnique({
          where: { id: input.id },
        });
        if (!expenseExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Expense not found.",
          });
        }

        // Check if the category exists
        const categoryExists = await ctx.db.category.findUnique({
          where: { id: input.categoryId },
        });
        if (!categoryExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found.",
          });
        }

        // Update the expense
        const updatedExpense = await ctx.db.expense.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            amount: input.amount,
            categoryId: input.categoryId,
          },
          include: { category: true },
        });

        return {
          message: "Expense updated successfully.",
          expense: updatedExpense,
        };
      } catch (error) {
        console.error("Error editing expense:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit expense.",
        });
      }
    }),

  /**
   * Remove an expense by ID.
   */
  remove: publicProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid expense ID format."),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if the expense exists
        const expenseExists = await ctx.db.expense.findUnique({
          where: { id: input.id },
        });
        if (!expenseExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Expense not found.",
          });
        }

        // Delete the expense
        await ctx.db.expense.delete({
          where: { id: input.id },
        });

        return {
          message: "Expense removed successfully.",
        };
      } catch (error) {
        console.error("Error removing expense:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove expense.",
        });
      }
    }),
});
