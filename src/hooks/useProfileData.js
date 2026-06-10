import { useState, useEffect } from "react";
import { accountService } from "@/api/services/accountService";
import { useAuth } from "@/context/AuthContext";

// Helper function to get initials from name
const getInitials = (name) => {
	if (!name) return "U";
	const words = name.trim().split(" ");
	if (words.length >= 2) {
		return (words[0][0] + words[1][0]).toUpperCase();
	}
	return words[0][0].toUpperCase();
};

export const useProfileData = () => {
	const [userData, setUserData] = useState({
		name: "",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
		initials: "",
	});
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await accountService.getProfile();

				if (response.success && response.code === 200) {
					// Some APIs return { data: { user } }, others may return user directly in data
					const user = response?.data?.user || response?.data || {};
					// Prefer first_name + last_name when available, fallback to name, then to "User"
					const firstName = user.first_name || "";
					const lastName = user.last_name || "";
					const combinedName = [firstName, lastName]
						.filter(Boolean)
						.join(" ");
					const userName = combinedName || user.name || "User";
					setUserData({
						name: userName,
						avatar: "https://randomuser.me/api/portraits/men/32.jpg", // You can update this with actual avatar URL if available
						initials: getInitials(userName),
					});
				} else {
					console.error("Failed to load profile data");
				}
			} catch (error) {
				console.error("Profile fetch error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [user]);

	return { userData, loading };
};
