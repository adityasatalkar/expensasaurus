import { create } from 'zustand'
import { authFormStateType } from '../types/auth'
import { Models } from 'appwrite'
import { account } from '../services/appwrite'

type useAuthStoreType = {
    authFormState: authFormStateType,
    setAuthFormState: (state: authFormStateType) => void,
    user: Models.Session | null,
    setUser: (user: Models.Session | null) => void,
    getUser: () => Promise<Models.Session | undefined>
}

const useAuthStore = create<useAuthStoreType>((set, get) => ({
    authFormState: 'SIGN_IN',
    setAuthFormState: (state) => set({ authFormState: state }),
    user: null,
    setUser: (user) => set({ user }),
    getUser: async () => {
        const { user } = get();
        if (user) {
            return user;
        } else {
            const sessionId = localStorage.getItem("sessionId");
            if (sessionId) {
                const currentUser = await account.getSession(sessionId);
                if (!currentUser) {
                    localStorage.removeItem("sessionId");
                    const currentUser = await account.getSession("current");
                    set({ user: currentUser });
                    return currentUser;
                }
                set({ user: currentUser });
                return currentUser;
            }

        }
    }
}))

export { useAuthStore }