import useLogout from "@/features/auth/hooks/useLogout"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { LogOut } from "lucide-react-native"
import { Alert, TouchableOpacity } from "react-native"
import LoadingCircle from "../ui/loading/LoadingCircle"

export default function LogoutButton() {
  const { handleLogout, loading } = useLogout()

  return (
    <TouchableOpacity onPress={handleLogout}>
      { loading ?
          <LoadingCircle size={20}/>
            :
            <LogOut size={22} color="#1a2332" strokeWidth={2.5} />
      }
    </TouchableOpacity>
  )
}