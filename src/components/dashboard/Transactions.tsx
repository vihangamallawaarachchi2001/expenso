import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import Button from "../common/button";
import { toast, ToastContainer } from "react-toast";
import { FaPen, FaTrash } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";

type Transaction = {
  category: string;
  description: string | null;
  userId: string;
  id: string;
  title: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

type TransactionProps = {
  userId: string;
  searchQuery: string | null | Date;
};

export default function Transactions({
  userId,
  searchQuery,
}: TransactionProps) {
  const queryClient = useQueryClient();
  const { data } = api.expense.all.useQuery({ userId });

  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formValues, setFormValues] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    amount: "",
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    category: false,
    amount: false,
  });

  const addMutation = api.expense.add.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      setIsModalOpen(false);
      await queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add transaction.");
    },
  });

  const editMutation = api.expense.edit.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      setIsModalOpen(false);
      await queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction.");
    },
  });

  const removeMutation = api.expense.remove.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      await queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction.");
    },
  });

  useEffect(() => {
    if (data?.expenses) {
      const filtered = data.expenses.filter((transaction: Transaction) => {
        if (typeof searchQuery === "string") {
          return (
            transaction.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (transaction.description?.toLowerCase() ?? "").includes(
              searchQuery.toLowerCase(),
            ) ||
            transaction.category
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        } else if (searchQuery instanceof Date) {
          const queryDate = searchQuery.toISOString().split("T")[0];
          const transactionDate = transaction.createdAt
            .toISOString()
            .split("T")[0];
          return queryDate === transactionDate;
        }
        return true;
      });

      setFilteredTransactions(filtered);
    }
  }, [data, searchQuery]);

  const handleSubmit = () => {
    const { id, title, description, category, amount } = formValues;

    if (formMode === "add") {
      addMutation.mutate({
        userId,
        title,
        description,
        category,
        amount: parseFloat(amount),
      });
    } else if (formMode === "edit") {
      editMutation.mutate({
        id,
        title,
        description,
        category,
        amount: parseFloat(amount),
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormMode("edit");
    setFormValues({
      id: transaction.id,
      title: transaction.title,
      description: transaction.description ?? "",
      category: transaction.category,
      amount: transaction.amount.toString(),
    });
    setIsModalOpen(true);
  };

  const handleRemove = (id: string) => {
    removeMutation.mutate({ id });
  };

  return (
    <section className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Transactions</h2>

      {filteredTransactions && filteredTransactions.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id} className="flex justify-between py-4">
              <div>
                <p className="font-medium text-gray-800">{transaction.title}</p>
                <p className="text-sm text-gray-500">
                  {transaction.description ?? "No description"}
                </p>
                <p className="text-sm text-gray-400">
                  Category: {transaction.category}
                </p>
              </div>
              <div className="text-right">
                {transaction.category == "income" ? (
                  <p
                    className={`font-semibold ${transaction.amount < 0 ? "text-red-600" : "text-purple-600 font-bold"}`}
                  >
                    {transaction.amount < 0 ? "-" : "+"}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                ) : (
                  <p
                    className={`font-semibold ${transaction.amount < 0 ? "text-red-600" : "text-red-600"}`}
                  >
                    {transaction.amount < 0 ? "-" : "-"}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center justify-end space-x-2 py-3">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-xl text-blue-500 hover:text-blue-700"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => handleRemove(transaction.id)}
                    className="text-xl text-orange-600 hover:text-orange-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No transactions found.</p>
      )}

      <Button
        title="Add Transaction"
        onclick={() => {
          setFormMode("add");
          setFormValues({
            id: "",
            title: "",
            description: "",
            category: "",
            amount: "",
          });
          setIsModalOpen(true);
        }}
        classNameBtn="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form className="w-1/3 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {formMode === "add" ? "Add Transaction" : "Edit Transaction"}
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className={`w-full rounded border p-2 ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
                value={formValues.title}
                onChange={(e) =>
                  setFormValues({ ...formValues, title: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                className="w-full rounded border border-gray-300 p-2"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
              />
              <select
                className={`w-full rounded border p-2 ${formErrors.category ? "border-red-500" : "border-gray-300"}`}
                value={formValues.category}
                onChange={(e) =>
                  setFormValues({ ...formValues, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                className={`w-full rounded border p-2 ${formErrors.amount ? "border-red-500" : "border-gray-300"}`}
                value={formValues.amount}
                onChange={(e) =>
                  setFormValues({ ...formValues, amount: e.target.value })
                }
              />
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <Button
                title="Cancel"
                onclick={() => setIsModalOpen(false)}
                classNameBtn="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
              />
              <Button
                title="Save"
                onclick={handleSubmit}
                classNameBtn="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              />
            </div>
          </form>
        </div>
      )}
      <ToastContainer />
    </section>
  );
}
