import { useNavigate } from "react-router-dom";

type AccountRoleProps = {
    isOpen: boolean
}


const AccountRole = ({isOpen} : AccountRoleProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="absolute right-5 top-16 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
                <button onClick={() => navigate("/admin/accounts/create/teacher")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Teacher
                </button>
                <button onClick={() => navigate("/admin/accounts/create/student")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Student
                </button>
                <hr className="my-1 border-gray-100" />
                <button onClick={() => navigate("/admin/accounts/create/admin")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Admin
                </button>
            </div>
        </div>
)
}

export default AccountRole