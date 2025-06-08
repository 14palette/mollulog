import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useLocation } from "react-router";

type StudentCardPopupContextType = {
  activePopupId: string | null;
  setActivePopupId: (id: string | null) => void;
};

const StudentCardPopupContext = createContext<StudentCardPopupContextType>({
  activePopupId: null,
  setActivePopupId: () => {},
});

export function useStudentCardPopup() {
  return useContext(StudentCardPopupContext);
}

export function StudentCardPopupProvider({ children }: { children: ReactNode }) {
  const [activePopupId, setActivePopupId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setActivePopupId(null);
  }, [location]);

  return (
    <StudentCardPopupContext.Provider value={{ activePopupId, setActivePopupId }}>
      {children}
    </StudentCardPopupContext.Provider>
  );
} 
