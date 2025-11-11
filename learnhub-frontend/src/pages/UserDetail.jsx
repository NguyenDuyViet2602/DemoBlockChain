import React, { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";

const UserDetail = () => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("Thông tin cá nhân");
    const [userData, setUserData] = useState({
        userId: null,
        fullName: "",
        email: "",
        role: "",
        dateofbirth: "",
        address: "",
        phone: "",
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }
                const response = await fetch("http://localhost:8080/api/v1/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch user details");
                }
                const user = await response.json();
                console.log("API Response:", user);
                setUserData({
                    userid: user.userid,
                    fullName: user.fullname || "",
                    email: user.email || "",
                    role: user.role || "",
                    dateofbirth: user.userdetails?.dateofbirth || "",
                    address: user.userdetails?.address || "",
                    phone: user.userdetails?.phone || "",
                });
                // Set avatar từ profilepicture nếu có
                if (user.profilepicture) {
                    setAvatar(user.profilepicture);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to fetch user details";
                console.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetail();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatar(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token available. User data:", userData);
                toast.warning("Vui lòng đăng nhập để lưu thay đổi.");
                return;
            }

            // Upload avatar nếu có
            if (avatarFile) {
                const formData = new FormData();
                formData.append('image', avatarFile);
                
                const avatarResponse = await fetch(`http://localhost:8080/api/v1/user/${userData.userid}/upload-avatar`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
                
                if (!avatarResponse.ok) {
                    throw new Error("Failed to upload avatar");
                }
            }

            // Cập nhật thông tin user
            const payload = {
                email: userData.email,
                fullname: userData.fullName,
                role: userData.role,
                userdetails: {
                    dateofbirth: userData.dateofbirth,
                    address: userData.address,
                    phone: userData.phone,
                },
            };
            const response = await fetch(`http://localhost:8080/api/v1/user/${userData.userid}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error("Failed to save user details");
            }
            
            // Reload user data để lấy avatar mới
            const userResponse = await fetch("http://localhost:8080/api/v1/user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (userResponse.ok) {
                const user = await userResponse.json();
                if (user.profilepicture) {
                    setAvatar(user.profilepicture);
                }
                
                // Cập nhật localStorage với user data mới
                const updatedUserData = {
                    id: user.userid,
                    email: user.email,
                    full_name: user.fullname,
                    role: user.role,
                    profilepicture: user.profilepicture,
                };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                
                // Dispatch event để Header cập nhật
                window.dispatchEvent(new Event('userUpdate'));
            }
            
            toast.success("Cập nhật thông tin thành công!");
            setAvatarFile(null); // Reset avatar file sau khi upload
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to save user details";
            toast.error("Lỗi: " + errorMessage);
            console.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );

    const tabs = [
        "Thông tin cá nhân",
        "Cá nhân hóa",
        "Tài khoản",
        "Phương thức thanh toán",
        "Thông báo",
        "Quyền riêng tư",
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-8">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Tài khoản của tôi</h1>
                <div className="flex flex-wrap gap-6 mb-12 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-base font-medium transition-colors ${
                                activeTab === tab
                                    ? "text-emerald-600 border-b-2 border-emerald-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex justify-center">
                        <div className="relative w-32 h-32">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="User avatar"
                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg">
                                    {userData.fullName
                                        ? userData.fullName.charAt(0).toUpperCase()
                                        : "U"}
                                </div>
                            )}
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-white transition-colors hover:bg-emerald-700 shadow-lg">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </div>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {activeTab === "Thông tin cá nhân" && (
                        <form
                            className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-sm"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={userData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={userData.role}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                                    <input
                                        type="date"
                                        name="dateofbirth"
                                        value={userData.dateofbirth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={userData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`px-16 py-3 bg-emerald-600 text-white font-semibold rounded-lg transition-colors ${
                                        isSaving
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-emerald-700"
                                    }`}
                                >
                                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab !== "Thông tin cá nhân" && (
                        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                            <p className="text-gray-400">Nội dung cho tab {activeTab} sẽ sớm có mặt</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetail;

