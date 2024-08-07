import React, { useEffect } from 'react';
import { startFirebaseUI, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

const SignIn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to the notes page
        navigate('/notes');
      }
    });

    // Start the FirebaseUI Auth
    startFirebaseUI('#firebaseui-auth-container');

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="container mx-auto mt-10 p-4">
      <h2 className="text-center text-2xl font-bold mb-6">Sign In</h2>
      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default SignIn;