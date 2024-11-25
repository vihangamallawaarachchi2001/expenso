import { useState } from "react";
import Button from "../common/button";
import { api } from "~/utils/api";
import Cookies from "js-cookie";
import { toast } from "react-toast";

type ProfileProp = {
  user: {
    name: string;
    email: string;
    createdAt: string;
    id: string;
  };
};

export default function ProfileCard({ user }: ProfileProp) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.split("T")[0], // Format for date input
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = api.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      // Update cookies with the new user data
      Cookies.remove("user");
      Cookies.set("user", JSON.stringify(data.user), {
        secure: true,
        httpOnly: false,
        sameSite: "strict",
        expires: 7,
      });
      toast.success(data.message); // Notify the user of success
      setIsEditing(false); // Exit editing mode
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile.");
    },
  });

  const handleProfileUpdate = async () => {
    // Call the mutation function with appropriate data
    mutation.mutate({
      id: user.id,
      name: formData.name,
      email: formData.email,
    });
  };

  return (
    <section className="flex flex-col items-center justify-center p-6 bg-white rounded-lg space-y-6 md:flex-row md:space-x-8">
      {/* Profile Picture */}
      <div className="relative w-96 h-auto rounded-lg overflow-hidden">
        <img
          src="/dog.png"
          alt="User profile picture"
          className="h-full  w-auto object-cover"
        />
      </div>

      {/* Profile Information */}
      <div className="flex flex-col w-full max-w-lg space-y-4">
        <form className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-4 py-2 border rounded-md ${
                isEditing
                  ? "border-blue-500 focus:ring-2 focus:ring-blue-400"
                  : "border-gray-300 bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-4 py-2 border rounded-md ${
                isEditing
                  ? "border-blue-500 focus:ring-2 focus:ring-blue-400"
                  : "border-gray-300 bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Member Since Field */}
          <div>
            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
              Member Since
            </label>
            <input
              type="date"
              name="createdAt"
              id="createdAt"
              value={formData.createdAt}
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            {!isEditing ? (
              <Button
                title="Edit Profile"
                onclick={() => setIsEditing(true)}
                classNameBtn=" w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              />
            ) : (
              <>
                <Button
                  title="Cancel"
                  onclick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      createdAt: user.createdAt.split("T")[0],
                    });
                  }}
                  classNameBtn="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all"
                />
                <Button
                  title="Save Changes"
                  onclick={handleProfileUpdate}
                  classNameBtn="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                />
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
