import { createContext, useContext, useState } from "react";

type SignInContextType = {
  isSignInVisible: boolean;
  showSignIn: () => void;
  hideSignIn: () => void;
};

const SignInContext = createContext<SignInContextType>({
  isSignInVisible: false,
  showSignIn: () => {},
  hideSignIn: () => {},
});

export function SignInProvider({ children }: { children: React.ReactNode }) {
  const [isSignInVisible, setIsSignInVisible] = useState(false);
  const showSignIn = () => {
    setIsSignInVisible(true);
  };

  const hideSignIn = () => {
    setIsSignInVisible(false);
  };

  return (
    <SignInContext.Provider value={{ isSignInVisible, showSignIn, hideSignIn }}>
      {children}
    </SignInContext.Provider>
  );
}

export function useSignIn() {
  return useContext(SignInContext);
}
